import { createHash, randomBytes, randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_ROOT = path.join(process.cwd(), 'data');
const SUBMISSIONS_DIR = path.join(DATA_ROOT, 'submissions');
const TOKEN_INDEX_DIR = path.join(DATA_ROOT, 'tokens');
const TOKEN_TTL_MS = 48 * 60 * 60 * 1000;

function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

async function ensureDirs() {
  await fs.mkdir(SUBMISSIONS_DIR, { recursive: true });
  await fs.mkdir(TOKEN_INDEX_DIR, { recursive: true });
}

async function create() {
  await ensureDirs();
  const id = randomUUID();
  const rawToken = randomBytes(32).toString('hex');
  const tokenHash = hashToken(rawToken);
  const now = Date.now();
  const submission = {
    id,
    tokenHash,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + TOKEN_TTL_MS).toISOString(),
    confirmed: false,
    confirmedAt: null,
    tokenConsumed: false,
    locale: 'en',
    clientEmail: 'test@example.com',
  };
  await fs.writeFile(path.join(SUBMISSIONS_DIR, `${id}.json`), JSON.stringify(submission, null, 2));
  await fs.writeFile(
    path.join(TOKEN_INDEX_DIR, `${tokenHash}.json`),
    JSON.stringify({ submissionId: id, expiresAt: submission.expiresAt })
  );
  return { submission, rawToken };
}

async function confirm(rawToken) {
  if (!/^[a-f0-9]{64}$/i.test(rawToken)) return { status: 'invalid' };
  const tokenHash = hashToken(rawToken);
  let index;
  try {
    index = JSON.parse(await fs.readFile(path.join(TOKEN_INDEX_DIR, `${tokenHash}.json`), 'utf8'));
  } catch {
    return { status: 'invalid' };
  }
  const submission = JSON.parse(
    await fs.readFile(path.join(SUBMISSIONS_DIR, `${index.submissionId}.json`), 'utf8')
  );
  if (submission.confirmed || submission.tokenConsumed) return { status: 'already_confirmed' };
  if (Date.now() > new Date(submission.expiresAt).getTime()) return { status: 'expired' };
  submission.confirmed = true;
  submission.confirmedAt = new Date().toISOString();
  submission.tokenConsumed = true;
  await fs.writeFile(path.join(SUBMISSIONS_DIR, `${submission.id}.json`), JSON.stringify(submission, null, 2));
  await fs.writeFile(
    path.join(TOKEN_INDEX_DIR, `${tokenHash}.json`),
    JSON.stringify({ submissionId: submission.id, expiresAt: submission.expiresAt, consumed: true })
  );
  return { status: 'success' };
}

const a = await create();
console.log('tokenLen', a.rawToken.length);
console.log('confirmUrl', `http://localhost:3010/confirm?token=${a.rawToken}`);
console.log('confirm1', (await confirm(a.rawToken)).status);
console.log('confirm2', (await confirm(a.rawToken)).status);
console.log('invalid', (await confirm('aa'.repeat(32))).status);

const b = await create();
const p = path.join(SUBMISSIONS_DIR, `${b.submission.id}.json`);
const rec = JSON.parse(await fs.readFile(p, 'utf8'));
rec.expiresAt = new Date(Date.now() - 1000).toISOString();
await fs.writeFile(p, JSON.stringify(rec, null, 2));
console.log('expired', (await confirm(b.rawToken)).status);

const templateSrc = await fs.readFile(
  path.join(process.cwd(), 'lib', 'email', 'templates.ts'),
  'utf8'
);
const fnStart = templateSrc.indexOf('export function buildClientReceiptEmail');
const fnEnd = templateSrc.indexOf('export { confirmCopy', fnStart);
const receiptFn = templateSrc.slice(fnStart, fnEnd);
const hasConfirmBtn = receiptFn.includes("label: 'Confirm Request'");
const hasConfirmUrl = receiptFn.includes('confirmUrl');
const hasVisit = /Visit our Website/i.test(receiptFn);
const hasWhatsApp = /WhatsApp/i.test(receiptFn);
console.log('receiptHasConfirmButton', hasConfirmBtn);
console.log('receiptUsesConfirmUrl', hasConfirmUrl);
console.log('receiptHasVisitWebsite', hasVisit);
console.log('receiptHasWhatsApp', hasWhatsApp);

if (!hasConfirmBtn || !hasConfirmUrl || hasVisit || hasWhatsApp) {
  process.exit(1);
}

console.log('OK');
