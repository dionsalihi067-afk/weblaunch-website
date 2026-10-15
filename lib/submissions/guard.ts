import { createHash } from 'crypto';

import { kv, stateKey } from '@/lib/submissions/kv';

/**
 * Abuse and duplicate protection for the contact endpoint, backed by the shared
 * state store (see kv.ts). All functions throw StateStoreError when the store
 * is unavailable; callers decide whether that blocks the request.
 */

const RATE_WINDOW_MS = 10 * 60 * 1000;
const DUPLICATE_WINDOW_MS = 10 * 60 * 1000;
const PENDING_TTL_MS = 2 * 60 * 1000;

function rateLimitMax(): number {
  const parsed = parseInt(process.env.CONTACT_RATE_LIMIT_MAX || '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 5;
}

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

/** Returns true when the client is within the allowed submission rate. */
export async function checkRateLimit(clientIp: string): Promise<boolean> {
  const key = stateKey('rl', sha256(clientIp));
  // Create the window with its TTL first so INCR never leaves a counter without expiry.
  await kv(['SET', key, '0', 'NX', 'PX', RATE_WINDOW_MS]);
  const count = Number(await kv(['INCR', key]));
  return count <= rateLimitMax();
}

export function buildSubmissionFingerprint(parts: {
  email: string;
  fullName: string;
  businessName: string;
  selectedServices: string[];
  additionalNotes: string;
}): string {
  return sha256(
    JSON.stringify([
      parts.email.trim().toLowerCase(),
      parts.fullName.trim().toLowerCase(),
      parts.businessName.trim().toLowerCase(),
      [...parts.selectedServices].sort(),
      parts.additionalNotes.trim(),
    ])
  );
}

export type DuplicateLock = 'acquired' | 'pending' | 'done';

/**
 * Atomically claims a fingerprint before processing. `pending` means an
 * identical request is in flight; `done` means one was already accepted.
 */
export async function acquireSubmissionLock(fingerprint: string): Promise<DuplicateLock> {
  const key = stateKey('dup', fingerprint);

  for (let attempt = 0; attempt < 2; attempt++) {
    if ((await kv(['SET', key, 'pending', 'NX', 'PX', PENDING_TTL_MS])) === 'OK') {
      return 'acquired';
    }
    const existing = await kv(['GET', key]);
    if (existing === 'done') return 'done';
    if (existing === 'pending') return 'pending';
    // Key expired between SET and GET — try to claim it once more.
  }
  return 'pending';
}

export async function completeSubmissionLock(fingerprint: string): Promise<void> {
  await kv(['SET', stateKey('dup', fingerprint), 'done', 'PX', DUPLICATE_WINDOW_MS]);
}

export async function releaseSubmissionLock(fingerprint: string): Promise<void> {
  await kv(['DEL', stateKey('dup', fingerprint)]);
}
