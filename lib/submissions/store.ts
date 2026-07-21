import { createHash, randomBytes, randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import type { LegalConsentRecord } from '@/lib/legal/versions';

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

const DATA_ROOT = path.join(process.cwd(), 'data');
const SUBMISSIONS_DIR = path.join(DATA_ROOT, 'submissions');
const UPLOADS_DIR = path.join(DATA_ROOT, 'uploads');
const TOKEN_INDEX_DIR = path.join(DATA_ROOT, 'tokens');

const SENSITIVE_FIELD_PATTERN =
  /(password|passwd|secret|credential|bmPassword|loginPassword|facebookPassword|instagramPassword|tiktokPassword|linkedinPassword)/i;

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

async function ensureDirs(): Promise<void> {
  await fs.mkdir(SUBMISSIONS_DIR, { recursive: true });
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  await fs.mkdir(TOKEN_INDEX_DIR, { recursive: true });
}

function submissionPath(id: string): string {
  return path.join(SUBMISSIONS_DIR, `${id}.json`);
}

function tokenIndexPath(tokenHash: string): string {
  return path.join(TOKEN_INDEX_DIR, `${tokenHash}.json`);
}

function uploadsDirFor(id: string): string {
  return path.join(UPLOADS_DIR, id);
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

export async function saveUploadedFile(
  submissionId: string,
  file: File,
  fieldKey: string
): Promise<StoredFileMeta> {
  await ensureDirs();
  const dir = uploadsDirFor(submissionId);
  await fs.mkdir(dir, { recursive: true });

  const safeBase = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120) || 'file';
  const storedName = `${randomBytes(8).toString('hex')}_${safeBase}`;
  const fullPath = path.join(dir, storedName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(fullPath, buffer);

  return {
    originalName: file.name,
    storedName,
    size: file.size,
    mimeType: file.type || 'application/octet-stream',
    fieldKey,
  };
}

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
  await ensureDirs();

  const id = input.id || randomUUID();
  const rawToken = generateSecureToken();
  const tokenHash = hashToken(rawToken);
  const now = Date.now();
  const { publicAnswers, sensitiveAnswers } = splitSensitiveAnswers(input.serviceAnswers);

  const submission: SubmissionRecord = {
    id,
    tokenHash,
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

  await fs.writeFile(submissionPath(id), JSON.stringify(submission, null, 2), 'utf8');
  await fs.writeFile(
    tokenIndexPath(tokenHash),
    JSON.stringify({ submissionId: id, expiresAt: submission.expiresAt }),
    'utf8'
  );

  return { submission, rawToken };
}

export function createSubmissionId(): string {
  return randomUUID();
}

export async function getSubmissionById(id: string): Promise<SubmissionRecord | null> {
  try {
    const raw = await fs.readFile(submissionPath(id), 'utf8');
    return JSON.parse(raw) as SubmissionRecord;
  } catch {
    return null;
  }
}

export type ConfirmResult =
  | { status: 'success'; submission: SubmissionRecord }
  | { status: 'invalid' }
  | { status: 'expired'; submission?: SubmissionRecord }
  | { status: 'already_confirmed'; submission: SubmissionRecord };

export async function confirmSubmissionByToken(rawToken: string): Promise<ConfirmResult> {
  if (!rawToken || !/^[a-f0-9]{64}$/i.test(rawToken)) {
    return { status: 'invalid' };
  }

  const tokenHash = hashToken(rawToken);
  let index: { submissionId: string; expiresAt: string } | null = null;

  try {
    const raw = await fs.readFile(tokenIndexPath(tokenHash), 'utf8');
    index = JSON.parse(raw) as { submissionId: string; expiresAt: string };
  } catch {
    return { status: 'invalid' };
  }

  const submission = await getSubmissionById(index.submissionId);
  if (!submission || submission.tokenHash !== tokenHash) {
    return { status: 'invalid' };
  }

  if (submission.confirmed || submission.tokenConsumed) {
    return { status: 'already_confirmed', submission };
  }

  const now = Date.now();
  if (now > new Date(submission.expiresAt).getTime()) {
    return { status: 'expired', submission };
  }

  const updated: SubmissionRecord = {
    ...submission,
    confirmed: true,
    confirmedAt: new Date(now).toISOString(),
    tokenConsumed: true,
  };

  await fs.writeFile(submissionPath(updated.id), JSON.stringify(updated, null, 2), 'utf8');

  // Keep token index for "already confirmed" lookups, but mark single-use consumed
  await fs.writeFile(
    tokenIndexPath(tokenHash),
    JSON.stringify({
      submissionId: updated.id,
      expiresAt: updated.expiresAt,
      consumed: true,
    }),
    'utf8'
  );

  return { status: 'success', submission: updated };
}

export async function readSubmissionFileBuffers(
  submission: SubmissionRecord
): Promise<Array<{ filename: string; content: Buffer; contentType?: string }>> {
  const attachments: Array<{ filename: string; content: Buffer; contentType?: string }> = [];
  const dir = uploadsDirFor(submission.id);

  for (const file of submission.files) {
    try {
      const content = await fs.readFile(path.join(dir, file.storedName));
      attachments.push({
        filename: file.originalName,
        content,
        contentType: file.mimeType,
      });
    } catch (err) {
      console.error('[submissions] Failed to read upload:', file.storedName, err);
    }
  }

  return attachments;
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
