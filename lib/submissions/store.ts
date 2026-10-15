import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  randomUUID,
} from 'crypto';
import { getDeploymentEnvironment, type DeploymentEnvironment } from '@/lib/deployment/environment';
import type { LegalConsentRecord } from '@/lib/legal/versions';
import { kv, stateKey, StateStoreError } from '@/lib/submissions/kv';

export type SubmissionLocale = 'al' | 'en' | 'de' | 'fr' | 'it' | 'tr' | 'es';
export type { LegalConsentRecord };

export interface StoredFileMeta {
  /** Original filename only — never expose absolute paths publicly */
  originalName: string;
  storedName: string;
  size: number;
  mimeType: string;
  /** Internal form field key, e.g. website-development_logo_0 or shared_logo_0 */
  fieldKey: string;
}

export interface ClientInfoSnapshot {
  fullName: string;
  businessName: string;
  email: string;
  phone: string;
  country: string;
  preferredLanguage: string;
}

export interface SubmissionRecord {
  id: string;
  tokenHash: string;
  createdAt: string;
  expiresAt: string;
  confirmed: boolean;
  confirmedAt: string | null;
  tokenConsumed: boolean;
  locale: SubmissionLocale;
  clientEmail: string;
  clientInfo: ClientInfoSnapshot;
  selectedServices: string[];
  serviceAnswers: Record<string, Record<string, string>>;
  sharedAnswers: Record<string, string>;
  additionalNotes: string;
  files: StoredFileMeta[];
  /** Sensitive credential answers stored privately — never returned to browser */
  sensitiveAnswers: Record<string, Record<string, string>>;
  /** GDPR-style acceptance of Privacy Policy + Terms at submission time */
  legalConsent: LegalConsentRecord;
}

const TOKEN_TTL_MS = 48 * 60 * 60 * 1000;
const SUBMISSION_LOCALES: readonly SubmissionLocale[] = ['al', 'en', 'de', 'fr', 'it', 'tr', 'es'];

const SENSITIVE_FIELD_PATTERN =
  /(password|passwd|secret|credential|bmPassword|loginPassword|facebookPassword|instagramPassword|tiktokPassword|linkedinPassword)/i;

/**
 * Upload buffers live only for the duration of one request (attached to the
 * team email, then discarded) — never written to disk or shared state.
 */
const uploadBuffers = new Map<string, Map<string, Buffer>>();

/**
 * Confirmation tokens are self-contained (AES-256-GCM sealed id/locale/expiry),
 * so any instance can validate them. Single-use state lives in the shared store.
 * Submission content is delivered by email and is not persisted server-side.
 */
type TokenPayloadV1 = {
  v: 1;
  id: string;
  locale: SubmissionLocale;
  exp: number;
  iat: number;
  /** Issuing environment; tokens are only accepted there. Absent means production. */
  env?: DeploymentEnvironment;
};

const DEPLOYMENT_ENVIRONMENTS: readonly DeploymentEnvironment[] = ['production', 'preview', 'development'];

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function generateSecureToken(): string {
  return randomBytes(32).toString('hex');
}

export function mapPreferredLanguageToLocale(preferred: string): SubmissionLocale {
  const normalized = preferred.trim().toLowerCase();
  const map: Record<string, SubmissionLocale> = {
    albanian: 'al',
    shqip: 'al',
    al: 'al',
    english: 'en',
    en: 'en',
    german: 'de',
    deutsch: 'de',
    de: 'de',
    french: 'fr',
    français: 'fr',
    francais: 'fr',
    fr: 'fr',
    italian: 'it',
    italiano: 'it',
    it: 'it',
    turkish: 'tr',
    türkçe: 'tr',
    turkce: 'tr',
    tr: 'tr',
    spanish: 'es',
    español: 'es',
    espanol: 'es',
    es: 'es',
  };
  return map[normalized] || 'en';
}

export function isSensitiveField(fieldKey: string): boolean {
  return SENSITIVE_FIELD_PATTERN.test(fieldKey);
}

export function splitSensitiveAnswers(
  serviceAnswers: Record<string, Record<string, string>>
): {
  publicAnswers: Record<string, Record<string, string>>;
  sensitiveAnswers: Record<string, Record<string, string>>;
} {
  const publicAnswers: Record<string, Record<string, string>> = {};
  const sensitiveAnswers: Record<string, Record<string, string>> = {};

  for (const [service, answers] of Object.entries(serviceAnswers)) {
    for (const [key, value] of Object.entries(answers)) {
      if (isSensitiveField(key)) {
        if (!sensitiveAnswers[service]) sensitiveAnswers[service] = {};
        sensitiveAnswers[service][key] = value;
      } else {
        if (!publicAnswers[service]) publicAnswers[service] = {};
        publicAnswers[service][key] = value;
      }
    }
  }

  return { publicAnswers, sensitiveAnswers };
}

function getSealSecret(): Buffer {
  const configured =
    process.env.SUBMISSION_SECRET?.trim() ||
    process.env.SMTP_PASS?.trim() ||
    process.env.NEXTAUTH_SECRET?.trim();
  if (!configured && process.env.NODE_ENV === 'production') {
    throw new Error('SUBMISSION_SECRET (or SMTP_PASS) must be set in production');
  }
  const raw = configured || 'weblaunch-dev-submission-secret';
  return createHash('sha256').update(raw).digest();
}

function sealTokenPayload(payload: TokenPayloadV1): string {
  const key = getSealSecret();
  const iv = randomBytes(12);
  const plaintext = Buffer.from(JSON.stringify(payload), 'utf8');
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [
    'v1',
    iv.toString('base64url'),
    encrypted.toString('base64url'),
    tag.toString('base64url'),
  ].join('.');
}

function unsealTokenPayload(rawToken: string): TokenPayloadV1 | null {
  try {
    const parts = rawToken.split('.');
    if (parts.length !== 4 || parts[0] !== 'v1') return null;
    const [, ivB64, dataB64, tagB64] = parts;
    const key = getSealSecret();
    const iv = Buffer.from(ivB64, 'base64url');
    const data = Buffer.from(dataB64, 'base64url');
    const tag = Buffer.from(tagB64, 'base64url');
    if (iv.length !== 12 || tag.length !== 16) return null;
    const decipher = createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    const plaintext = Buffer.concat([decipher.update(data), decipher.final()]);
    const parsed = JSON.parse(plaintext.toString('utf8')) as TokenPayloadV1;
    if (
      parsed.v !== 1 ||
      !parsed.id ||
      !SUBMISSION_LOCALES.includes(parsed.locale) ||
      typeof parsed.exp !== 'number' ||
      typeof parsed.iat !== 'number' ||
      (parsed.env !== undefined && !DEPLOYMENT_ENVIRONMENTS.includes(parsed.env))
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function submissionFromPayload(
  payload: TokenPayloadV1,
  overrides: Partial<SubmissionRecord> = {}
): SubmissionRecord {
  return {
    id: payload.id,
    tokenHash: '',
    createdAt: new Date(payload.iat).toISOString(),
    expiresAt: new Date(payload.exp).toISOString(),
    confirmed: false,
    confirmedAt: null,
    tokenConsumed: false,
    locale: payload.locale,
    clientEmail: '',
    clientInfo: {
      fullName: '',
      businessName: '',
      email: '',
      phone: '',
      country: '',
      preferredLanguage: '',
    },
    selectedServices: [],
    serviceAnswers: {},
    sharedAnswers: {},
    additionalNotes: '',
    files: [],
    sensitiveAnswers: {},
    legalConsent: {
      accepted: true,
      acceptedAt: new Date(payload.iat).toISOString(),
      policyVersion: '',
      termsVersion: '',
    },
    ...overrides,
  };
}

export async function saveUploadedFile(
  submissionId: string,
  file: File,
  fieldKey: string
): Promise<StoredFileMeta> {
  const safeBase = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120) || 'file';
  const storedName = `${randomBytes(8).toString('hex')}_${safeBase}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  let bucket = uploadBuffers.get(submissionId);
  if (!bucket) {
    bucket = new Map();
    uploadBuffers.set(submissionId, bucket);
  }
  bucket.set(storedName, buffer);

  return {
    originalName: file.name,
    storedName,
    size: file.size,
    mimeType: file.type || 'application/octet-stream',
    fieldKey,
  };
}

/** Builds the submission and its sealed confirmation token. Nothing is persisted. */
export async function createSubmission(input: {
  id?: string;
  clientInfo: ClientInfoSnapshot;
  locale: SubmissionLocale;
  selectedServices: string[];
  serviceAnswers: Record<string, Record<string, string>>;
  sharedAnswers: Record<string, string>;
  additionalNotes: string;
  files: StoredFileMeta[];
  legalConsent: LegalConsentRecord;
}): Promise<{ submission: SubmissionRecord; rawToken: string }> {
  const id = input.id || randomUUID();
  const now = Date.now();
  const { publicAnswers, sensitiveAnswers } = splitSensitiveAnswers(input.serviceAnswers);

  const payload: TokenPayloadV1 = {
    v: 1,
    id,
    locale: input.locale,
    exp: now + TOKEN_TTL_MS,
    iat: now,
    env: getDeploymentEnvironment(),
  };

  const rawToken = sealTokenPayload(payload);

  const submission: SubmissionRecord = {
    id,
    tokenHash: hashToken(rawToken),
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + TOKEN_TTL_MS).toISOString(),
    confirmed: false,
    confirmedAt: null,
    tokenConsumed: false,
    locale: input.locale,
    clientEmail: input.clientInfo.email,
    clientInfo: input.clientInfo,
    selectedServices: input.selectedServices,
    serviceAnswers: publicAnswers,
    sharedAnswers: input.sharedAnswers,
    additionalNotes: input.additionalNotes,
    files: input.files,
    sensitiveAnswers,
    legalConsent: input.legalConsent,
  };

  return { submission, rawToken };
}

export function createSubmissionId(): string {
  return randomUUID();
}

export type ConfirmResult =
  | { status: 'success'; submission: SubmissionRecord }
  | { status: 'invalid' }
  | { status: 'expired'; submission?: SubmissionRecord }
  | { status: 'already_confirmed'; submission: SubmissionRecord }
  | { status: 'unavailable'; locale: SubmissionLocale };

/**
 * Validates a confirmation token and atomically marks it consumed in the shared
 * store. If the store is unavailable the token is left unconsumed so the link
 * can be retried, and `unavailable` is returned instead of a false result.
 */
export async function confirmSubmissionByToken(rawToken: string): Promise<ConfirmResult> {
  if (!rawToken || typeof rawToken !== 'string') {
    return { status: 'invalid' };
  }

  const trimmed = rawToken.trim();
  const payload = unsealTokenPayload(trimmed);
  if (!payload) {
    return { status: 'invalid' };
  }

  let currentEnvironment: DeploymentEnvironment;
  try {
    currentEnvironment = getDeploymentEnvironment();
  } catch {
    console.error('[confirm] deployment environment misconfigured');
    return { status: 'unavailable', locale: payload.locale };
  }
  if ((payload.env ?? 'production') !== currentEnvironment) {
    return { status: 'invalid' };
  }

  const tokenHash = hashToken(trimmed);
  const now = Date.now();

  if (now > payload.exp) {
    return { status: 'expired', submission: submissionFromPayload(payload, { tokenHash }) };
  }

  let claimed: unknown;
  try {
    claimed = await kv([
      'SET',
      stateKey('consumed', tokenHash),
      new Date(now).toISOString(),
      'NX',
      'PX',
      Math.max(60_000, payload.exp - now),
    ]);
  } catch (error) {
    if (error instanceof StateStoreError) {
      console.error('[confirm] state store unavailable', { reason: error.reason });
      return { status: 'unavailable', locale: payload.locale };
    }
    throw error;
  }

  const confirmed = submissionFromPayload(payload, {
    tokenHash,
    confirmed: true,
    tokenConsumed: true,
    confirmedAt: new Date(now).toISOString(),
  });

  return claimed === 'OK'
    ? { status: 'success', submission: confirmed }
    : { status: 'already_confirmed', submission: confirmed };
}

export async function readSubmissionFileBuffers(
  submission: SubmissionRecord
): Promise<Array<{ filename: string; content: Buffer; contentType?: string }>> {
  const attachments: Array<{ filename: string; content: Buffer; contentType?: string }> = [];
  const bucket = uploadBuffers.get(submission.id);

  for (const file of submission.files) {
    const content = bucket?.get(file.storedName);
    if (!content) {
      console.error('[submissions] Upload buffer missing for attachment');
      continue;
    }
    attachments.push({
      filename: file.originalName,
      content,
      contentType: file.mimeType,
    });
  }

  // Free memory after attachments are prepared for the outbound email
  uploadBuffers.delete(submission.id);

  return attachments;
}

export function discardUploads(submissionId: string): void {
  uploadBuffers.delete(submissionId);
}

/** Merge public + sensitive answers for internal team email only. */
export function getFullAnswersForTeam(
  submission: SubmissionRecord
): Record<string, Record<string, string>> {
  const merged: Record<string, Record<string, string>> = {};
  const services = new Set([
    ...Object.keys(submission.serviceAnswers),
    ...Object.keys(submission.sensitiveAnswers || {}),
  ]);

  for (const service of services) {
    merged[service] = {
      ...(submission.serviceAnswers[service] || {}),
      ...(submission.sensitiveAnswers?.[service] || {}),
    };
  }

  return merged;
}
