import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  randomUUID,
} from 'crypto';
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

const SENSITIVE_FIELD_PATTERN =
  /(password|passwd|secret|credential|bmPassword|loginPassword|facebookPassword|instagramPassword|tiktokPassword|linkedinPassword)/i;

/** In-memory upload buffers — never written to disk (Vercel-safe). */
const uploadBuffers = new Map<string, Map<string, Buffer>>();

/** Process-local fallback when Redis/KV is not configured. */
const consumedTokenHashes = new Set<string>();
const memorySubmissions = new Map<string, SubmissionRecord>();

type TokenPayloadV1 = {
  v: 1;
  id: string;
  locale: SubmissionLocale;
  exp: number;
  iat: number;
};

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
  const raw =
    process.env.SUBMISSION_SECRET?.trim() ||
    process.env.SMTP_PASS?.trim() ||
    process.env.NEXTAUTH_SECRET?.trim() ||
    'weblaunch-dev-submission-secret';
  return createHash('sha256').update(raw).digest();
}

function getRedisConfig(): { url: string; token: string } | null {
  const url = (
    process.env.KV_REST_API_URL ||
    process.env.UPSTASH_REDIS_REST_URL ||
    ''
  ).trim();
  const token = (
    process.env.KV_REST_API_TOKEN ||
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    ''
  ).trim();
  if (!url || !token) return null;
  return { url: url.replace(/\/$/, ''), token };
}

async function redisCommand(command: (string | number)[]): Promise<unknown> {
  const cfg = getRedisConfig();
  if (!cfg) return null;

  try {
    const res = await fetch(cfg.url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cfg.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(command),
      cache: 'no-store',
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error('[submissions] Redis command failed', res.status, text);
      return null;
    }

    const data = (await res.json()) as { result?: unknown };
    return data.result ?? null;
  } catch (err) {
    console.error('[submissions] Redis request error', err);
    return null;
  }
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
    const decipher = createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    const plaintext = Buffer.concat([decipher.update(data), decipher.final()]);
    const parsed = JSON.parse(plaintext.toString('utf8')) as TokenPayloadV1;
    if (parsed.v !== 1 || !parsed.id || !parsed.locale || !parsed.exp || !parsed.iat) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function stubSubmissionFromPayload(
  payload: TokenPayloadV1,
  overrides: Partial<SubmissionRecord> = {}
): SubmissionRecord {
  return {
    id: payload.id,
    tokenHash: hashToken(''),
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

async function persistSubmissionRecord(submission: SubmissionRecord): Promise<void> {
  memorySubmissions.set(submission.id, submission);

  const ttlMs = Math.max(60_000, new Date(submission.expiresAt).getTime() - Date.now());
  await redisCommand([
    'SET',
    `wl:sub:${submission.id}`,
    JSON.stringify(submission),
    'PX',
    ttlMs,
  ]);
  await redisCommand([
    'SET',
    `wl:tok:${submission.tokenHash}`,
    submission.id,
    'PX',
    ttlMs,
  ]);
}

async function markTokenConsumed(
  tokenHash: string,
  expiresAtMs: number
): Promise<'ok' | 'already'> {
  const ttlMs = Math.max(60_000, expiresAtMs - Date.now());

  if (getRedisConfig()) {
    const redisResult = await redisCommand([
      'SET',
      `wl:consumed:${tokenHash}`,
      '1',
      'NX',
      'PX',
      ttlMs,
    ]);

    if (redisResult === 'OK') {
      consumedTokenHashes.add(tokenHash);
      return 'ok';
    }

    const existing = await redisCommand(['GET', `wl:consumed:${tokenHash}`]);
    if (existing === '1' || existing === 1) {
      consumedTokenHashes.add(tokenHash);
      return 'already';
    }

    // Redis unreachable — fall through to process-local tracking
  }

  if (consumedTokenHashes.has(tokenHash)) return 'already';
  consumedTokenHashes.add(tokenHash);
  return 'ok';
}

async function isTokenConsumed(tokenHash: string): Promise<boolean> {
  if (consumedTokenHashes.has(tokenHash)) return true;
  const redisResult = await redisCommand(['GET', `wl:consumed:${tokenHash}`]);
  return redisResult === '1' || redisResult === 1;
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
  };

  const rawToken = sealTokenPayload(payload);
  const tokenHash = hashToken(rawToken);

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

  await persistSubmissionRecord(submission);

  return { submission, rawToken };
}

export function createSubmissionId(): string {
  return randomUUID();
}

export async function getSubmissionById(id: string): Promise<SubmissionRecord | null> {
  const local = memorySubmissions.get(id);
  if (local) return local;

  const raw = await redisCommand(['GET', `wl:sub:${id}`]);
  if (typeof raw === 'string' && raw) {
    try {
      const parsed = JSON.parse(raw) as SubmissionRecord;
      memorySubmissions.set(id, parsed);
      return parsed;
    } catch {
      return null;
    }
  }

  return null;
}

export type ConfirmResult =
  | { status: 'success'; submission: SubmissionRecord }
  | { status: 'invalid' }
  | { status: 'expired'; submission?: SubmissionRecord }
  | { status: 'already_confirmed'; submission: SubmissionRecord };

export async function confirmSubmissionByToken(rawToken: string): Promise<ConfirmResult> {
  if (!rawToken || typeof rawToken !== 'string') {
    return { status: 'invalid' };
  }

  const trimmed = rawToken.trim();
  const payload = unsealTokenPayload(trimmed);
  if (!payload) {
    return { status: 'invalid' };
  }

  const tokenHash = hashToken(trimmed);
  const now = Date.now();

  if (now > payload.exp) {
    return {
      status: 'expired',
      submission: stubSubmissionFromPayload(payload, {
        tokenHash,
        expiresAt: new Date(payload.exp).toISOString(),
      }),
    };
  }

  const existing = await getSubmissionById(payload.id);
  const base =
    existing ||
    stubSubmissionFromPayload(payload, {
      tokenHash,
      expiresAt: new Date(payload.exp).toISOString(),
    });

  if (
    base.confirmed ||
    base.tokenConsumed ||
    (await isTokenConsumed(tokenHash))
  ) {
    return {
      status: 'already_confirmed',
      submission: {
        ...base,
        tokenHash,
        confirmed: true,
        tokenConsumed: true,
        confirmedAt: base.confirmedAt || new Date(now).toISOString(),
        locale: payload.locale,
      },
    };
  }

  const consume = await markTokenConsumed(tokenHash, payload.exp);
  if (consume === 'already') {
    return {
      status: 'already_confirmed',
      submission: {
        ...base,
        tokenHash,
        confirmed: true,
        tokenConsumed: true,
        confirmedAt: base.confirmedAt || new Date(now).toISOString(),
        locale: payload.locale,
      },
    };
  }

  const updated: SubmissionRecord = {
    ...base,
    tokenHash,
    confirmed: true,
    confirmedAt: new Date(now).toISOString(),
    tokenConsumed: true,
    locale: payload.locale,
    expiresAt: new Date(payload.exp).toISOString(),
  };

  await persistSubmissionRecord(updated);

  return { status: 'success', submission: updated };
}

export async function readSubmissionFileBuffers(
  submission: SubmissionRecord
): Promise<Array<{ filename: string; content: Buffer; contentType?: string }>> {
  const attachments: Array<{ filename: string; content: Buffer; contentType?: string }> = [];
  const bucket = uploadBuffers.get(submission.id);

  for (const file of submission.files) {
    const content = bucket?.get(file.storedName);
    if (!content) {
      console.error('[submissions] Upload buffer missing for:', file.storedName);
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
