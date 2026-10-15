import { NextRequest, NextResponse } from 'next/server';
import {
  createSubmission,
  createSubmissionId,
  discardUploads,
  mapPreferredLanguageToLocale,
  readSubmissionFileBuffers,
  saveUploadedFile,
  type StoredFileMeta,
  type SubmissionRecord,
} from '@/lib/submissions/store';
import {
  acquireSubmissionLock,
  buildSubmissionFingerprint,
  checkRateLimit,
  completeSubmissionLock,
  releaseSubmissionLock,
} from '@/lib/submissions/guard';
import { StateStoreError } from '@/lib/submissions/kv';
import { createLegalConsentRecord } from '@/lib/legal/versions';
import { isEmailValid, isPhoneValid } from '@/lib/contact/validation';
import { allServiceIds, isValidServiceId } from '@/lib/services/serviceData';
import { getConfirmationOrigin } from '@/lib/deployment/environment';
import { buildConfirmUrl, createMailTransporter, getSmtpConfig } from '@/lib/email/smtp';
import { buildClientReceiptEmail } from '@/lib/email/templates';
import { buildTeamProjectEmail } from '@/lib/email/teamEmail';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Stays under the ~4.5 MB Vercel request body limit. */
const MAX_REQUEST_BYTES = 4_500_000;
const MAX_TOTAL_UPLOAD_BYTES = 4 * 1024 * 1024;
const MAX_FILES = 10;
const MAX_FORM_ENTRIES = 500;
const MAX_SHORT_TEXT = 200;
const MAX_LONG_TEXT = 5000;
const HONEYPOT_FIELD = 'hp_website';

const isDev = process.env.NODE_ENV === 'development';

type ErrorCode =
  | 'config_error'
  | 'invalid_request'
  | 'validation_failed'
  | 'consent_required'
  | 'rejected'
  | 'payload_too_large'
  | 'rate_limited'
  | 'in_progress'
  | 'state_unavailable'
  | 'email_unavailable'
  | 'internal_error';

function errorResponse(
  code: ErrorCode,
  message: string,
  status: number,
  extras: { fields?: string[]; cause?: unknown } = {}
) {
  const cause = extras.cause;
  console.error('[contact API]', code, {
    status,
    ...(extras.fields ? { fields: extras.fields } : {}),
    ...(cause ? { cause: describeError(cause) } : {}),
  });

  return NextResponse.json(
    {
      success: false,
      code,
      error: message,
      ...(extras.fields ? { fields: extras.fields } : {}),
      ...(isDev && cause ? { details: describeError(cause) } : {}),
    },
    { status }
  );
}

/** Error summary safe for logs: no credentials, recipients or submission content. */
function describeError(error: unknown): Record<string, unknown> {
  if (!(error instanceof Error)) return { message: String(error).slice(0, 200) };
  const smtpError = error as Error & { code?: string; responseCode?: number; command?: string };
  return {
    name: error.name,
    message: error.message.slice(0, 300),
    ...(smtpError.code ? { code: smtpError.code } : {}),
    ...(smtpError.responseCode ? { responseCode: smtpError.responseCode } : {}),
    ...(smtpError.command ? { command: smtpError.command } : {}),
  };
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip')?.trim() ||
    'unknown'
  );
}

type ClientInfo = {
  fullName: string;
  businessName: string;
  email: string;
  phone: string;
  country: string;
  preferredLanguage: string;
};

function validateClientInfo(clientInfo: ClientInfo): string[] {
  const invalid: string[] = [];
  const required: Array<keyof ClientInfo> = [
    'fullName',
    'businessName',
    'email',
    'phone',
    'country',
    'preferredLanguage',
  ];

  for (const field of required) {
    const value = clientInfo[field];
    if (!value || value.length > MAX_SHORT_TEXT || /[\r\n]/.test(value)) {
      invalid.push(field);
    }
  }

  if (!invalid.includes('email') && (!isEmailValid(clientInfo.email) || clientInfo.email.length > 254)) {
    invalid.push('email');
  }
  if (!invalid.includes('phone') && !isPhoneValid(clientInfo.phone)) {
    invalid.push('phone');
  }

  return invalid;
}

function parseServiceKey(key: string): { serviceId: string; rest: string } | null {
  for (const serviceId of allServiceIds) {
    const prefix = `${serviceId}_`;
    if (key.startsWith(prefix)) {
      return { serviceId, rest: key.slice(prefix.length) };
    }
  }
  return null;
}

function normalizeAnswer(raw: string): string {
  try {
    const json = JSON.parse(raw);
    return Array.isArray(json) ? json.join(', ') : raw;
  } catch {
    return raw;
  }
}

function stateErrorResponse(error: unknown) {
  if (error instanceof StateStoreError) {
    return errorResponse(
      error.reason === 'not_configured' ? 'config_error' : 'state_unavailable',
      'The contact service is temporarily unavailable. Please try again later or contact us directly.',
      503,
      { cause: error }
    );
  }
  return errorResponse('internal_error', 'Something went wrong. Please try again.', 500, {
    cause: error,
  });
}

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);

  let smtp;
  try {
    smtp = getSmtpConfig();
  } catch (envError) {
    return errorResponse('config_error', 'The contact service is temporarily unavailable.', 503, {
      cause: envError,
    });
  }

  let confirmOrigin: string;
  try {
    confirmOrigin = getConfirmationOrigin();
  } catch (originError) {
    return errorResponse('config_error', 'The contact service is temporarily unavailable.', 503, {
      cause: originError,
    });
  }

  try {
    if (!(await checkRateLimit(clientIp))) {
      return errorResponse('rate_limited', 'Too many submissions. Please try again later.', 429);
    }
  } catch (stateError) {
    return stateErrorResponse(stateError);
  }

  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > MAX_REQUEST_BYTES) {
    return errorResponse('payload_too_large', 'Uploaded files are too large.', 413);
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch (parseError) {
    return errorResponse('invalid_request', 'Invalid form submission.', 400, { cause: parseError });
  }

  const field = (name: string) => String(formData.get(name) ?? '').trim();

  if (field(HONEYPOT_FIELD)) {
    return errorResponse('rejected', 'Submission rejected.', 400);
  }

  const clientInfo: ClientInfo = {
    fullName: field('fullName'),
    businessName: field('businessName'),
    email: field('email'),
    phone: field('phone'),
    country: field('country'),
    preferredLanguage: field('preferredLanguage'),
  };

  const invalidFields = validateClientInfo(clientInfo);

  let selectedServices: string[] = [];
  try {
    const parsed = JSON.parse(field('selectedServices') || '[]');
    if (Array.isArray(parsed)) selectedServices = [...new Set(parsed.map(String))];
  } catch {
    selectedServices = [];
  }
  if (selectedServices.length === 0 || !selectedServices.every(isValidServiceId)) {
    invalidFields.push('selectedServices');
  }

  const additionalNotes = field('additionalNotes');
  if (additionalNotes.length > MAX_LONG_TEXT) invalidFields.push('additionalNotes');

  if (invalidFields.length > 0) {
    return errorResponse('validation_failed', 'Please check the highlighted fields.', 400, {
      fields: invalidFields,
    });
  }

  if (field('legalConsentAccepted').toLowerCase() !== 'true') {
    return errorResponse(
      'consent_required',
      'You must accept the Privacy Policy and Terms & Conditions to submit.',
      400
    );
  }

  const serviceAnswers: Record<string, Record<string, string>> = {};
  const sharedAnswers: Record<string, string> = {};
  const pendingFiles: Array<{ file: File; fieldKey: string }> = [];
  let entryCount = 0;
  let totalUploadBytes = 0;
  const tooLongAnswers: string[] = [];

  for (const [key, value] of formData.entries()) {
    entryCount += 1;
    if (entryCount > MAX_FORM_ENTRIES) {
      return errorResponse('invalid_request', 'Invalid form submission.', 400);
    }

    const isShared = key.startsWith('shared_');
    const parsedKey = isShared ? null : parseServiceKey(key);
    if (!isShared && !parsedKey) continue;
    if (parsedKey && !selectedServices.includes(parsedKey.serviceId)) continue;

    if (value instanceof File) {
      if (!value.name || value.size === 0) continue;
      totalUploadBytes += value.size;
      pendingFiles.push({ file: value, fieldKey: key });
      continue;
    }

    const raw = String(value);
    if (raw.length > MAX_LONG_TEXT) {
      tooLongAnswers.push(key);
      continue;
    }

    if (isShared) {
      const questionId = key.replace(/^shared_/, '').replace(/_\d+$/, '');
      sharedAnswers[questionId] = normalizeAnswer(raw);
    } else if (parsedKey) {
      if (!serviceAnswers[parsedKey.serviceId]) serviceAnswers[parsedKey.serviceId] = {};
      serviceAnswers[parsedKey.serviceId][parsedKey.rest] = normalizeAnswer(raw);
    }
  }

  if (tooLongAnswers.length > 0) {
    return errorResponse('validation_failed', 'Please check the highlighted fields.', 400, {
      fields: tooLongAnswers,
    });
  }

  if (pendingFiles.length > MAX_FILES || totalUploadBytes > MAX_TOTAL_UPLOAD_BYTES) {
    return errorResponse('payload_too_large', 'Uploaded files are too large.', 413);
  }

  const fingerprint = buildSubmissionFingerprint({
    email: clientInfo.email,
    fullName: clientInfo.fullName,
    businessName: clientInfo.businessName,
    selectedServices,
    additionalNotes,
  });

  let lock;
  try {
    lock = await acquireSubmissionLock(fingerprint);
  } catch (stateError) {
    return stateErrorResponse(stateError);
  }
  if (lock === 'done') {
    console.info('[contact API] duplicate of an accepted submission');
    return NextResponse.json({ success: true, code: 'duplicate' }, { status: 200 });
  }
  if (lock === 'pending') {
    return errorResponse(
      'in_progress',
      'This request is already being processed. Please wait a moment.',
      409
    );
  }

  const submissionId = createSubmissionId();
  let delivered: {
    submission: SubmissionRecord;
    rawToken: string;
    transporter: Awaited<ReturnType<typeof createMailTransporter>>;
  };

  try {
    const transporter = await createMailTransporter(smtp);

    const storedFiles: StoredFileMeta[] = [];
    for (const item of pendingFiles) {
      storedFiles.push(await saveUploadedFile(submissionId, item.file, item.fieldKey));
    }

    const { submission, rawToken } = await createSubmission({
      id: submissionId,
      clientInfo,
      locale: mapPreferredLanguageToLocale(clientInfo.preferredLanguage),
      selectedServices,
      serviceAnswers,
      sharedAnswers,
      additionalNotes,
      files: storedFiles,
      legalConsent: createLegalConsentRecord(),
    });

    const team = buildTeamProjectEmail(submission, { clientIp });
    const attachments = await readSubmissionFileBuffers(submission);

    await transporter.sendMail({
      from: `"WEB LAUNCH" <${smtp.user}>`,
      to: smtp.emailTo,
      subject: team.subject,
      text: team.text,
      html: team.html,
      replyTo: clientInfo.email,
      attachments: attachments.length > 0 ? attachments : undefined,
    });

    delivered = { submission, rawToken, transporter };
  } catch (deliveryError) {
    discardUploads(submissionId);
    try {
      await releaseSubmissionLock(fingerprint);
    } catch {
      // The pending lock expires on its own within minutes.
    }
    return errorResponse(
      'email_unavailable',
      'We could not deliver your request right now. Please try again or contact us directly.',
      503,
      { cause: deliveryError }
    );
  }

  // The team already has the inquiry: a state failure here must not turn it into an error.
  try {
    await completeSubmissionLock(fingerprint);
  } catch (stateError) {
    console.error('[contact API] could not record completed submission', {
      submissionId,
      cause: describeError(stateError),
    });
  }
  console.info('[contact API] inquiry delivered', {
    submissionId,
    services: selectedServices.length,
    files: pendingFiles.length,
  });

  // The inquiry is accepted once the team has it; the client receipt is best-effort.
  const { submission, rawToken, transporter } = delivered;
  let confirmationEmailSent = false;
  try {
    const receipt = buildClientReceiptEmail({
      locale: submission.locale,
      clientName: clientInfo.fullName,
      confirmUrl: buildConfirmUrl(rawToken, confirmOrigin),
    });
    await transporter.sendMail({
      from: `"WEB LAUNCH" <${smtp.user}>`,
      to: clientInfo.email,
      subject: receipt.subject,
      text: receipt.text,
      html: receipt.html,
    });
    confirmationEmailSent = true;
  } catch (receiptError) {
    console.error('[contact API] confirmation email failed', {
      submissionId,
      cause: describeError(receiptError),
    });
  } finally {
    transporter.close();
  }

  return NextResponse.json(
    { success: true, code: 'accepted', confirmationEmailSent },
    { status: 200 }
  );
}
