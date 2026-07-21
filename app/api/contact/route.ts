import { NextRequest, NextResponse } from 'next/server';
import {
  createSubmission,
  createSubmissionId,
  mapPreferredLanguageToLocale,
  readSubmissionFileBuffers,
  saveUploadedFile,
  type StoredFileMeta,
} from '@/lib/submissions/store';
import { createLegalConsentRecord } from '@/lib/legal/versions';
import { createMailTransporter, getAppUrl, getSmtpConfig } from '@/lib/email/smtp';
import { buildClientReceiptEmail } from '@/lib/email/templates';
import { buildTeamProjectEmail } from '@/lib/email/teamEmail';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SERVICE_IDS = [
  'website-development',
  'branding',
  'seo',
  'google-business',
  'social-setup',
  'social-management',
  'ads',
  'email',
  'lead-forms',
  'maintenance',
  'landing-pages',
] as const;

const isDev = process.env.NODE_ENV === 'development';

function errorResponse(message: string, status: number, details?: unknown) {
  console.error(`[contact API] ${message}`, details ?? '');
  return NextResponse.json(
    {
      success: false,
      error: message,
      ...(isDev && details
        ? {
            details:
              details instanceof Error
                ? {
                    message: details.message,
                    name: details.name,
                    stack: details.stack,
                  }
                : details,
          }
        : {}),
    },
    { status }
  );
}

function validateClientInfo(clientInfo: Record<string, string>) {
  const errors: string[] = [];
  if (!clientInfo.fullName?.trim()) errors.push('Full name is required');
  if (!clientInfo.businessName?.trim()) errors.push('Business name is required');
  if (!clientInfo.email?.trim()) errors.push('Email is required');
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientInfo.email)) {
    errors.push('Invalid email format');
  }
  if (!clientInfo.phone?.trim()) errors.push('Phone number is required');
  if (!clientInfo.country?.trim()) errors.push('Country is required');
  if (!clientInfo.preferredLanguage?.trim()) errors.push('Preferred language is required');
  return errors;
}

function parseServiceKey(key: string): { serviceId: string; rest: string } | null {
  for (const serviceId of SERVICE_IDS) {
    const prefix = `${serviceId}_`;
    if (key.startsWith(prefix)) {
      return { serviceId, rest: key.slice(prefix.length) };
    }
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    let smtp;
    try {
      smtp = getSmtpConfig();
      console.log('[contact API] SMTP config loaded', {
        host: smtp.host,
        port: smtp.port,
        user: smtp.user,
        emailTo: smtp.emailTo,
        passLength: smtp.pass.length,
      });
    } catch (envError) {
      return errorResponse(
        envError instanceof Error ? envError.message : 'Server configuration error',
        500,
        envError
      );
    }

    const formData = await request.formData();

    const clientInfo = {
      fullName: String(formData.get('fullName') || ''),
      businessName: String(formData.get('businessName') || ''),
      email: String(formData.get('email') || ''),
      phone: String(formData.get('phone') || ''),
      country: String(formData.get('country') || ''),
      preferredLanguage: String(formData.get('preferredLanguage') || ''),
    };

    const validationErrors = validateClientInfo(clientInfo);
    if (validationErrors.length > 0) {
      return errorResponse('Validation failed', 400, validationErrors);
    }

    let selectedServices: string[] = [];
    try {
      selectedServices = JSON.parse(String(formData.get('selectedServices') || '[]'));
      if (!Array.isArray(selectedServices) || selectedServices.length === 0) {
        return errorResponse('At least one service must be selected', 400);
      }
    } catch (parseError) {
      return errorResponse('Invalid selectedServices payload', 400, parseError);
    }

    const serviceAnswers: Record<string, Record<string, string>> = {};
    const sharedAnswers: Record<string, string> = {};
    const pendingFiles: Array<{ file: File; fieldKey: string }> = [];

    for (const [key, value] of formData.entries()) {
      if (key.startsWith('shared_')) {
        const questionId = key.replace(/^shared_/, '').replace(/_\d+$/, '');
        if (value instanceof File) {
          if (!value.name || value.size === 0) continue;
          pendingFiles.push({ file: value, fieldKey: key });
          continue;
        }
        const raw = String(value);
        try {
          const json = JSON.parse(raw);
          sharedAnswers[questionId] = Array.isArray(json) ? json.join(', ') : raw;
        } catch {
          sharedAnswers[questionId] = raw;
        }
        continue;
      }

      const parsed = parseServiceKey(key);
      if (!parsed) continue;
      const { serviceId, rest } = parsed;

      if (value instanceof File) {
        if (!value.name || value.size === 0) continue;
        pendingFiles.push({ file: value, fieldKey: key });
        continue;
      }

      if (!serviceAnswers[serviceId]) serviceAnswers[serviceId] = {};
      const raw = String(value);
      try {
        const json = JSON.parse(raw);
        serviceAnswers[serviceId][rest] = Array.isArray(json) ? json.join(', ') : raw;
      } catch {
        serviceAnswers[serviceId][rest] = raw;
      }
    }

    const additionalNotes = String(formData.get('additionalNotes') || '');
    const legalAccepted =
      String(formData.get('legalConsentAccepted') || '').toLowerCase() === 'true';
    if (!legalAccepted) {
      return errorResponse(
        'You must accept the Privacy Policy and Terms & Conditions to submit',
        400
      );
    }

    const legalConsent = createLegalConsentRecord();

    const locale = mapPreferredLanguageToLocale(clientInfo.preferredLanguage);
    const submissionId = createSubmissionId();

    const storedFiles: StoredFileMeta[] = [];
    for (const item of pendingFiles) {
      const meta = await saveUploadedFile(submissionId, item.file, item.fieldKey);
      storedFiles.push(meta);
    }

    const { submission, rawToken } = await createSubmission({
      id: submissionId,
      clientInfo,
      locale,
      selectedServices,
      serviceAnswers,
      sharedAnswers,
      additionalNotes,
      files: storedFiles,
      legalConsent,
    });

    let transporter;
    try {
      transporter = await createMailTransporter(smtp);
      console.log('[contact API] Transport verified');
    } catch (verifyError) {
      console.error('[contact API] SMTP error (verify failed):', verifyError);
      return errorResponse(
        `SMTP verification failed: ${
          verifyError instanceof Error ? verifyError.message : String(verifyError)
        }`,
        500,
        verifyError
      );
    }

    const clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip')?.trim() ||
      'Not available';

    const team = buildTeamProjectEmail(submission, { clientIp });
    const uploadAttachments = await readSubmissionFileBuffers(submission);
    const confirmUrl = `${getAppUrl()}/confirm?token=${rawToken}`;
    const clientReceipt = buildClientReceiptEmail({
      locale: submission.locale,
      clientName: clientInfo.fullName,
      confirmUrl,
    });

    const senderFrom = `"WEB LAUNCH" <${smtp.user}>`;

    // 1) Owner inquiry email
    try {
      console.log('[contact API] Sending owner email to:', smtp.emailTo);
      const ownerResult = await transporter.sendMail({
        from: senderFrom,
        to: smtp.emailTo,
        subject: team.subject,
        text: team.text,
        html: team.html,
        replyTo: clientInfo.email,
        attachments: uploadAttachments.length > 0 ? uploadAttachments : undefined,
      });
      console.log('[contact API] Owner email sent', {
        messageId: ownerResult.messageId,
        response: ownerResult.response,
        accepted: ownerResult.accepted,
        rejected: ownerResult.rejected,
      });
    } catch (ownerError) {
      console.error('[contact API] SMTP error (owner email):', ownerError);
      return errorResponse(
        `Failed to send owner email: ${
          ownerError instanceof Error ? ownerError.message : String(ownerError)
        }`,
        500,
        ownerError
      );
    }

    // 2) Client confirmation / receipt email
    try {
      console.log('[contact API] Sending client email to:', clientInfo.email);
      const clientResult = await transporter.sendMail({
        from: senderFrom,
        to: clientInfo.email,
        subject: clientReceipt.subject,
        text: clientReceipt.text,
        html: clientReceipt.html,
      });
      console.log('[contact API] Client email sent', {
        recipient: clientInfo.email,
        messageId: clientResult.messageId,
        response: clientResult.response,
        accepted: clientResult.accepted,
        rejected: clientResult.rejected,
      });
    } catch (clientError) {
      console.error('[contact API] SMTP error (client email):', clientError);
      return errorResponse(
        `Owner email was sent, but client confirmation failed: ${
          clientError instanceof Error ? clientError.message : String(clientError)
        }`,
        500,
        clientError
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'emails_sent',
      },
      { status: 200 }
    );
  } catch (error) {
    return errorResponse(
      `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
      500,
      error
    );
  }
}
