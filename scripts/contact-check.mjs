#!/usr/bin/env node
/**
 * End-to-end contact form checks against the current production build.
 *
 * Starts several `next start` processes for the same build:
 *   A, B   — VERCEL_ENV=production, share the "production" mock KV
 *   C      — production without KV → must fail closed
 *   P1, P2 — VERCEL_ENV=preview, share a separate "preview" mock KV
 *   P3     — preview misconfigured to share the production KV (namespace isolation)
 *   X      — preview with an invalid VERCEL_URL → must fail closed
 * plus a local mock SMTP server. Everything external is MOCKED: no real email
 * is sent and no real KV/Upstash instance is contacted.
 *
 * Usage: npm run build && npm run test:contact
 */
import { createCipheriv, createHash, randomBytes, randomUUID } from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';

import { interpretSubmitResponse } from '../lib/contact/submitResult.ts';
import {
  DeploymentConfigError,
  getConfirmationOrigin,
  getDeploymentEnvironment,
  getPublicWebsiteOrigin,
} from '../lib/deployment/environment.ts';
import { startMockKv } from './lib/mock-kv.mjs';
import { decodeQuotedPrintable, startMockSmtp } from './lib/mock-smtp.mjs';
import { assertFreshBuild, startNextServer } from './lib/next-server.mjs';

const OWNER = 'owner@mock.test';
const SMTP_PASS = 'mock-smtp-pass-never-logged';
const SECRET = 'contact-check-secret-0123456789abcdef';
const RATE_LIMIT = 4;
const TRUSTED_ORIGIN = 'https://www.weblaunchworks.com';
const PREVIEW_HOST = 'weblaunch-abc123xyz-weblaunch-team.vercel.app';
const PREVIEW_ORIGIN = `https://${PREVIEW_HOST}`;
const HOSTILE_ORIGIN = 'https://attacker.example';

const messages = Object.fromEntries(
  ['en', 'al'].map((l) => [l, JSON.parse(fs.readFileSync(`messages/${l}.json`, 'utf8'))])
);

const results = [];
const observedResponses = [];
let ipCounter = 0;
const freshIp = () => `203.0.${Math.floor(ipCounter / 250)}.${(ipCounter++ % 250) + 1}`;

function check(name, condition, detail = '') {
  results.push({ name, ok: Boolean(condition), detail });
}

function section(title) {
  results.push({ section: title });
}

function basePayload(overrides = {}) {
  const fields = {
    fullName: 'Test Client',
    businessName: 'Test Business',
    email: `client-${Math.random().toString(36).slice(2, 8)}@mock.test`,
    phone: '+383 45 000 000',
    country: 'Kosovo',
    preferredLanguage: 'English',
    selectedServices: JSON.stringify(['website-development']),
    additionalNotes: 'Automated test submission',
    legalConsentAccepted: 'true',
    'website-development_businessDescription': 'We sell coffee.',
    hp_website: '',
    ...overrides,
  };
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined) continue;
    if (value instanceof Blob) form.append(key, value, 'upload.bin');
    else form.append(key, value);
  }
  return { form, email: fields.email };
}

async function post(server, form, ip = freshIp()) {
  const res = await fetch(`${server.baseUrl}/api/contact`, {
    method: 'POST',
    body: form,
    headers: { 'x-forwarded-for': ip },
    signal: AbortSignal.timeout(60_000),
  });
  let json = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }
  observedResponses.push({ status: res.status, json });
  return { status: res.status, json: json ?? {} };
}

/** Like post(), but over raw HTTP so Host / X-Forwarded-Host can be forged. */
async function postWithHeaders(server, form, headers) {
  const encoded = new Request('http://encoder.invalid/', { method: 'POST', body: form });
  const body = Buffer.from(await encoded.arrayBuffer());
  const { port } = new URL(server.baseUrl);
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        host: '127.0.0.1',
        port,
        path: '/api/contact',
        method: 'POST',
        headers: {
          'content-type': encoded.headers.get('content-type'),
          'content-length': body.length,
          'x-forwarded-for': freshIp(),
          ...headers,
        },
      },
      (res) => {
        let text = '';
        res.on('data', (c) => (text += c));
        res.on('end', () => {
          let json = {};
          try {
            json = JSON.parse(text);
          } catch {
            // non-JSON response
          }
          observedResponses.push({ status: res.statusCode, json });
          resolve({ status: res.statusCode, json });
        });
      }
    );
    req.on('error', reject);
    req.end(body);
  });
}

function extractConfirmUrl(raw) {
  const pattern = /https?:\/\/[^\s"'<>]+\/confirm\?token=[A-Za-z0-9._~%-]+/;
  const qp = decodeQuotedPrintable(raw).match(pattern);
  if (qp) return qp[0];
  for (const part of raw.split(/\r\n--/)) {
    if (!/Content-Transfer-Encoding:\s*base64/i.test(part)) continue;
    const body = part.split(/\r\n\r\n/).slice(1).join('').replace(/\s+/g, '');
    const match = Buffer.from(body, 'base64').toString('utf8').match(pattern);
    if (match) return match[0];
  }
  return null;
}

/** Decodes every quoted-printable / base64 MIME part to UTF-8 text. */
function decodeMimeText(raw) {
  return raw
    .split(/\r\n--/)
    .map((part) => {
      const [headers, ...rest] = part.split(/\r\n\r\n/);
      const body = rest.join('\r\n\r\n');
      if (/Content-Transfer-Encoding:\s*base64/i.test(headers)) {
        return Buffer.from(body.replace(/\s+/g, ''), 'base64').toString('utf8');
      }
      if (/Content-Transfer-Encoding:\s*quoted-printable/i.test(headers)) {
        const s = body.replace(/=\r?\n/g, '');
        const bytes = [];
        for (let i = 0; i < s.length; i++) {
          const hex = s.slice(i + 1, i + 3);
          if (s[i] === '=' && /^[0-9A-F]{2}$/i.test(hex)) {
            bytes.push(parseInt(hex, 16));
            i += 2;
          } else {
            bytes.push(s.charCodeAt(i));
          }
        }
        return Buffer.from(bytes).toString('utf8');
      }
      return body;
    })
    .join('\n');
}

function tokenFromUrl(confirmUrl) {
  return new URL(confirmUrl).searchParams.get('token');
}

/** Seals a token exactly like lib/submissions/store.ts (used for expiry/forgery cases). */
function sealToken(payload, secret = SECRET) {
  const key = createHash('sha256').update(secret).digest();
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const data = Buffer.concat([cipher.update(JSON.stringify(payload), 'utf8'), cipher.final()]);
  return ['v1', iv.toString('base64url'), data.toString('base64url'), cipher.getAuthTag().toString('base64url')].join('.');
}

function freshToken(locale = 'en', expOffsetMs = 60 * 60 * 1000, env = 'production') {
  const now = Date.now();
  const payload = { v: 1, id: randomUUID(), locale, exp: now + expOffsetMs, iat: now - 1000 };
  if (env) payload.env = env;
  return sealToken(payload);
}

function throwsConfigError(fn) {
  try {
    fn();
    return false;
  } catch (err) {
    return err instanceof DeploymentConfigError;
  }
}

/** Receipt (client) email sent after `before`, and the confirm link inside it. */
function receiptLink(smtp, email, before) {
  const mail = smtp.state.messages.slice(before).find((m) => m.to.includes(email));
  return mail ? extractConfirmUrl(mail.raw) : null;
}

async function confirm(server, token) {
  const res = await fetch(`${server.baseUrl}/confirm?token=${encodeURIComponent(token)}`, {
    signal: AbortSignal.timeout(60_000),
  });
  return { status: res.status, html: await res.text() };
}

const shows = (page, locale, key) => page.html.includes(messages[locale].confirm[key].title);
const ownerMailsFor = (smtp, email, from = 0) =>
  smtp.state.messages.slice(from).filter((m) => m.to.includes(OWNER) && new RegExp(`Reply-To:\\s*${email}`, 'i').test(m.raw));

async function main() {
  assertFreshBuild();
  const smtp = await startMockSmtp();
  const kvStore = await startMockKv('mock-kv-token-production');
  const previewKv = await startMockKv('mock-kv-token-preview');

  const baseEnv = {
    SMTP_HOST: '127.0.0.1',
    SMTP_PORT: String(smtp.port),
    SMTP_USER: 'sender@mock.test',
    SMTP_PASS,
    EMAIL_TO: OWNER,
    SUBMISSION_SECRET: SECRET,
    CONTACT_RATE_LIMIT_MAX: String(RATE_LIMIT),
    // Hostile / preview values that Production must ignore.
    APP_URL: HOSTILE_ORIGIN,
    NEXT_PUBLIC_APP_URL: HOSTILE_ORIGIN,
    VERCEL_URL: PREVIEW_HOST,
    UPSTASH_REDIS_REST_URL: '',
    UPSTASH_REDIS_REST_TOKEN: '',
  };
  const prodKv = { KV_REST_API_URL: kvStore.url, KV_REST_API_TOKEN: kvStore.token };
  const prevKv = { KV_REST_API_URL: previewKv.url, KV_REST_API_TOKEN: previewKv.token };
  const production = { ...baseEnv, VERCEL_ENV: 'production', ...prodKv };
  const preview = { ...baseEnv, VERCEL_ENV: 'preview', ...prevKv };

  const servers = await Promise.all([
    startNextServer(production),
    startNextServer(production),
    startNextServer({ ...baseEnv, VERCEL_ENV: '', KV_REST_API_URL: '', KV_REST_API_TOKEN: '' }),
    startNextServer(preview),
    startNextServer(preview),
    startNextServer({ ...preview, ...prodKv }),
    startNextServer({ ...preview, VERCEL_URL: 'weblaunch.attacker.example' }),
  ]);
  const [A, B, C, P1, P2, P3, X] = servers;
  const sentClientEmails = [];

  try {
    section('Confirmation origin rules (lib/deployment/environment.ts — pure function, no mocks)');
    {
      const hostile = { APP_URL: HOSTILE_ORIGIN, NEXT_PUBLIC_APP_URL: HOSTILE_ORIGIN, VERCEL_URL: PREVIEW_HOST };
      check('production (VERCEL_ENV=production) → official origin', getConfirmationOrigin({ VERCEL_ENV: 'production', NODE_ENV: 'production' }) === TRUSTED_ORIGIN);
      check('production ignores APP_URL / NEXT_PUBLIC_APP_URL / VERCEL_URL', getConfirmationOrigin({ ...hostile, VERCEL_ENV: 'production', NODE_ENV: 'production' }) === TRUSTED_ORIGIN);
      check('production build without VERCEL_ENV → official origin', getConfirmationOrigin({ ...hostile, NODE_ENV: 'production' }) === TRUSTED_ORIGIN);
      check('preview → https://<current VERCEL_URL>', getConfirmationOrigin({ ...hostile, VERCEL_ENV: 'preview', NODE_ENV: 'production' }) === PREVIEW_ORIGIN);
      check('preview hostname is normalised to lower case', getConfirmationOrigin({ VERCEL_ENV: 'preview', VERCEL_URL: PREVIEW_HOST.toUpperCase() }) === PREVIEW_ORIGIN);
      const badPreviewHosts = [
        undefined,
        '',
        'attacker.example',
        'weblaunchworks.com',
        'vercel.app',
        'evil.vercel.app.attacker.example',
        'a.b.vercel.app',
        `${PREVIEW_HOST}:8080`,
        `${PREVIEW_HOST}/path`,
        PREVIEW_ORIGIN,
        `-bad-.vercel.app`,
        `user@${PREVIEW_HOST}`,
        'x'.repeat(64) + '.vercel.app',
      ];
      check(
        `invalid preview VERCEL_URL rejected (${badPreviewHosts.length} cases)`,
        badPreviewHosts.every((h) => throwsConfigError(() => getConfirmationOrigin({ VERCEL_ENV: 'preview', VERCEL_URL: h, APP_URL: PREVIEW_ORIGIN })))
      );
      check('unexpected VERCEL_ENV rejected', throwsConfigError(() => getDeploymentEnvironment({ VERCEL_ENV: 'staging', NODE_ENV: 'production' })) && throwsConfigError(() => getConfirmationOrigin({ VERCEL_ENV: 'staging' })));
      check('development defaults to http://localhost:3000', getConfirmationOrigin({ NODE_ENV: 'development' }) === 'http://localhost:3000');
      check('development uses APP_URL', getConfirmationOrigin({ NODE_ENV: 'development', APP_URL: 'http://localhost:4000/' }) === 'http://localhost:4000');
      check('development rejects non-http APP_URL', throwsConfigError(() => getConfirmationOrigin({ NODE_ENV: 'development', APP_URL: 'javascript://alert(1)' })) && throwsConfigError(() => getConfirmationOrigin({ NODE_ENV: 'development', APP_URL: 'http://' })));
      check('email website links: public site outside development', getPublicWebsiteOrigin({ ...hostile, VERCEL_ENV: 'preview' }) === TRUSTED_ORIGIN && getPublicWebsiteOrigin({ VERCEL_ENV: 'staging' }) === TRUSTED_ORIGIN);
    }

    section('Submission, email delivery and cross-instance confirmation (A issues, B confirms)');
    let firstEmail;
    {
      const before = smtp.state.messages.length;
      const { form, email } = basePayload();
      firstEmail = email;
      sentClientEmails.push(email);
      const res = await post(A, form);
      const mails = smtp.state.messages.slice(before);
      check('valid submission returns 200 accepted', res.status === 200 && res.json.success === true && res.json.code === 'accepted', JSON.stringify(res));
      check('valid submission reports confirmation email sent', res.json.confirmationEmailSent === true);
      check('admin notification delivered to EMAIL_TO', mails[0]?.to.includes(OWNER));
      check('admin notification has client Reply-To', mails[0] && new RegExp(`Reply-To:\\s*${email}`, 'i').test(mails[0].raw));
      check('admin notification contains submission details', mails[0] && decodeQuotedPrintable(mails[0].raw).includes('Test Business'));
      check('client receipt delivered to client', mails[1]?.to.includes(email));
      const confirmUrl = mails[1] ? extractConfirmUrl(mails[1].raw) : null;
      check('confirm link uses https://www.weblaunchworks.com despite hostile APP_URL and preview VERCEL_URL', confirmUrl?.startsWith(`${TRUSTED_ORIGIN}/confirm?token=`), confirmUrl ?? 'missing');

      if (confirmUrl) {
        const token = tokenFromUrl(confirmUrl);
        const onB = await confirm(B, token);
        check('token issued by A confirms on B (separate process)', onB.status === 200 && shows(onB, 'en', 'success'));
        check('confirm page is noindex', /<meta name="robots" content="noindex, nofollow"/.test(onB.html));
        const againA = await confirm(A, token);
        const againB = await confirm(B, token);
        check('confirmed token is single-use on A (other process)', shows(againA, 'en', 'already'));
        check('confirmed token is single-use on B (same process)', shows(againB, 'en', 'already'));
        check('single-use marker stored in shared KV (production namespace)', kvStore.keys().some((k) => k.startsWith('wl:production:consumed:')));
      }
    }

    section('Production origin cannot be overridden by request headers');
    {
      const before = smtp.state.messages.length;
      const { form, email } = basePayload();
      sentClientEmails.push(email);
      const res = await postWithHeaders(A, form, {
        host: 'attacker.example',
        'x-forwarded-host': 'attacker.example',
        'x-forwarded-proto': 'http',
        forwarded: 'host=attacker.example;proto=http',
      });
      const link = receiptLink(smtp, email, before);
      check('forged Host / X-Forwarded-Host submission accepted', res.status === 200 && res.json.code === 'accepted', JSON.stringify(res));
      check('confirm link still uses the official origin', link?.startsWith(`${TRUSTED_ORIGIN}/confirm?token=`), link ?? 'missing');
      check('no email contains the forged host', !smtp.state.messages.slice(before).some((m) => decodeMimeText(m.raw).includes('attacker.example')));
    }

    section('Token integrity and expiry');
    {
      const tampered = freshToken().split('.');
      tampered[2] = (tampered[2][0] === 'A' ? 'B' : 'A') + tampered[2].slice(1);
      check('tampered token rejected', shows(await confirm(A, tampered.join('.')), 'en', 'invalid'));
      check('token sealed with another secret rejected', shows(await confirm(B, sealToken({ v: 1, id: randomUUID(), locale: 'en', exp: Date.now() + 60_000, iat: Date.now() }, 'wrong-secret')), 'en', 'invalid'));
      check('expired token rejected', shows(await confirm(A, freshToken('en', -60_000)), 'en', 'expired'));
      check('garbage token rejected', shows(await confirm(B, 'not-a-token'), 'en', 'invalid'));
      check('token without environment field accepted as production', shows(await confirm(A, freshToken('en', 60_000, null)), 'en', 'success'));
      check('token with unknown environment rejected', shows(await confirm(A, freshToken('en', 60_000, 'staging')), 'en', 'invalid'));
    }

    section('Shared duplicate detection');
    {
      const before = smtp.state.messages.length;
      const dup = await post(B, basePayload({ email: firstEmail }).form);
      check('resubmission on B of inquiry accepted on A → duplicate', dup.status === 200 && dup.json.code === 'duplicate', JSON.stringify(dup));
      check('duplicate sends no additional email', smtp.state.messages.length === before);
    }

    section('Localized confirmation');
    {
      const before = smtp.state.messages.length;
      const res = await post(A, basePayload({ preferredLanguage: 'Shqip' }).form);
      const mail = smtp.state.messages.slice(before)[1];
      const confirmUrl = mail ? extractConfirmUrl(mail.raw) : null;
      check('Albanian submission accepted', res.status === 200 && res.json.success === true);
      check('Albanian receipt written in Albanian', mail && decodeMimeText(mail.raw).includes('Konfirmo Kërkesën'));
      check('Albanian confirm page localized (confirmed on B)', confirmUrl && shows(await confirm(B, tokenFromUrl(confirmUrl)), 'al', 'success'));
    }

    section('Validation and rejection (no email sent)');
    const rejections = [
      ['missing name', { fullName: '' }, 400, 'validation_failed'],
      ['invalid email', { email: 'not-an-email' }, 400, 'validation_failed'],
      ['header injection in name', { fullName: 'A\r\nBcc: x@y.z' }, 400, 'validation_failed'],
      ['invalid phone', { phone: 'abc' }, 400, 'validation_failed'],
      ['no services', { selectedServices: '[]' }, 400, 'validation_failed'],
      ['unknown service', { selectedServices: JSON.stringify(['hacking']) }, 400, 'validation_failed'],
      ['oversized notes', { additionalNotes: 'x'.repeat(5001) }, 400, 'validation_failed'],
      ['missing consent', { legalConsentAccepted: 'false' }, 400, 'consent_required'],
      ['honeypot filled', { hp_website: 'http://spam.example' }, 400, 'rejected'],
      ['files over 4 MB', { shared_logo_0: new Blob([new Uint8Array(4.2 * 1024 * 1024)]) }, 413, 'payload_too_large'],
    ];
    for (const [name, overrides, status, code] of rejections) {
      const before = smtp.state.messages.length;
      const res = await post(A, basePayload(overrides).form);
      check(`${name} → ${status} ${code}`, res.status === status && res.json.success === false && res.json.code === code, JSON.stringify(res));
      check(`${name} sends no email`, smtp.state.messages.length === before);
    }

    section('Attachments');
    {
      const before = smtp.state.messages.length;
      const res = await post(A, basePayload({ shared_logo_0: new Blob(['logo-bytes']) }).form);
      const owner = smtp.state.messages.slice(before)[0];
      check('small upload accepted', res.status === 200 && res.json.success === true);
      check('upload attached to admin notification', owner && /filename="?upload\.bin"?/.test(owner.raw));
    }

    section('Email failures');
    {
      const { form, email } = basePayload();
      smtp.state.failRecipient = (addr) => addr === OWNER;
      const res = await post(A, form);
      smtp.state.failRecipient = () => false;
      check('admin notification failure → 503 email_unavailable (no success)', res.status === 503 && res.json.success === false && res.json.code === 'email_unavailable', JSON.stringify(res));
      const retry = await post(B, basePayload({ email }).form);
      check('retry after failure accepted on other instance (lock released)', retry.status === 200 && retry.json.code === 'accepted', JSON.stringify(retry));
    }
    {
      const before = smtp.state.messages.length;
      const { form, email } = basePayload();
      smtp.state.failRecipient = (addr) => addr === email;
      const res = await post(A, form);
      smtp.state.failRecipient = () => false;
      check('client receipt failure: inquiry still accepted', res.status === 200 && res.json.success === true && res.json.code === 'accepted');
      check('client receipt failure reported (confirmationEmailSent=false)', res.json.confirmationEmailSent === false);
      check('client receipt failure: admin still notified', ownerMailsFor(smtp, email, before).length === 1);
      check('client receipt failure: UI shows "received" variant, not "check your email"', interpretSubmitResponse(res.status, res.json).kind === 'success' && interpretSubmitResponse(res.status, res.json).confirmationEmailSent === false);
    }
    {
      smtp.state.failAuth = true;
      const res = await post(A, basePayload().form);
      smtp.state.failAuth = false;
      check('SMTP auth failure → 503 email_unavailable', res.status === 503 && res.json.code === 'email_unavailable', JSON.stringify(res));
    }

    section('Shared rate limiting (alternating A/B, same client IP)');
    {
      const ip = '198.51.100.77';
      const statuses = [];
      for (let i = 0; i < RATE_LIMIT + 2; i++) {
        statuses.push((await post(i % 2 ? B : A, basePayload({ fullName: '' }).form, ip)).status);
      }
      check(`limit of ${RATE_LIMIT} shared across processes, then 429`, statuses.slice(0, RATE_LIMIT).every((s) => s === 400) && statuses.slice(RATE_LIMIT).every((s) => s === 429), statuses.join(','));
    }

    section('Concurrent duplicate submissions (6 parallel requests across A and B)');
    {
      smtp.state.delayMs = 1500;
      const { email } = basePayload();
      const before = smtp.state.messages.length;
      const responses = await Promise.all(
        Array.from({ length: 6 }, (_, i) => post(i % 2 ? B : A, basePayload({ email }).form))
      );
      smtp.state.delayMs = 0;
      const accepted = responses.filter((r) => r.json.code === 'accepted').length;
      const inProgress = responses.filter((r) => r.status === 409 && r.json.code === 'in_progress').length;
      check('exactly one parallel request accepted', accepted === 1, responses.map((r) => `${r.status}:${r.json.code}`).join(','));
      check('other parallel requests rejected as in_progress (409, no success)', inProgress === 5);
      check('exactly one admin notification for parallel duplicates', ownerMailsFor(smtp, email, before).length === 1);
      const later = await post(B, basePayload({ email }).form);
      check('later resubmission recognised as duplicate', later.json.code === 'duplicate');
    }

    section('KV not configured in production (instance C)');
    {
      const before = smtp.state.messages.length;
      const res = await post(C, basePayload().form);
      check('submission without KV → 503 config_error', res.status === 503 && res.json.success === false && res.json.code === 'config_error', JSON.stringify(res));
      check('no email sent without KV', smtp.state.messages.length === before);
      check('error response does not leak configuration details', !JSON.stringify(res.json).includes('KV_REST'));
      check('confirmation without KV → "temporarily unavailable" (not success)', shows(await confirm(C, freshToken()), 'en', 'unavailable'));
    }

    section('KV temporarily unavailable');
    {
      const token = freshToken();
      const before = smtp.state.messages.length;
      kvStore.state.down = true;
      const res = await post(A, basePayload().form);
      const page = await confirm(B, token);
      kvStore.state.down = false;
      check('submission during KV outage → 503 state_unavailable', res.status === 503 && res.json.code === 'state_unavailable', JSON.stringify(res));
      check('no email sent during KV outage', smtp.state.messages.length === before);
      check('confirmation during KV outage → unavailable', shows(page, 'en', 'unavailable'));
      check('token not consumed by outage; confirms after recovery', shows(await confirm(A, token), 'en', 'success'));
    }
    {
      const { form, email } = basePayload();
      const before = smtp.state.messages.length;
      smtp.state.onMessage = (m) => {
        if (m.to.includes(OWNER)) kvStore.state.down = true;
      };
      const res = await post(A, form);
      smtp.state.onMessage = null;
      kvStore.state.down = false;
      check('KV failure after admin notified → still 200 accepted (no misleading error)', res.status === 200 && res.json.code === 'accepted', JSON.stringify(res));
      check('KV failure after admin notified: exactly one admin email', ownerMailsFor(smtp, email, before).length === 1);
    }

    section('Preview deployment (P1 issues, P2 confirms; separate preview KV)');
    {
      const before = smtp.state.messages.length;
      const prodKeysBefore = kvStore.keys().length;
      const { form, email } = basePayload();
      sentClientEmails.push(email);
      const res = await postWithHeaders(P1, form, { host: 'attacker.example', 'x-forwarded-host': 'attacker.example' });
      const link = receiptLink(smtp, email, before);
      check('preview submission accepted', res.status === 200 && res.json.code === 'accepted', JSON.stringify(res));
      check('preview confirm link uses the current deployment host, not APP_URL or Host header', link?.startsWith(`${PREVIEW_ORIGIN}/confirm?token=`), link ?? 'missing');

      if (link) {
        const token = tokenFromUrl(link);
        check('production rejects a preview-issued token', shows(await confirm(A, token), 'en', 'invalid'));
        check('preview token confirms on another preview instance', shows(await confirm(P2, token), 'en', 'success'));
        check('preview token is single-use on the issuing instance', shows(await confirm(P1, token), 'en', 'already'));
        check('preview token is single-use on the confirming instance', shows(await confirm(P2, token), 'en', 'already'));
      }
      check('preview consumed marker stored in the preview KV namespace', previewKv.keys().some((k) => k.startsWith('wl:preview:consumed:')));
      check('preview submission wrote nothing to the production KV', kvStore.keys().length === prodKeysBefore);
      check('preview rejects a production-issued token', shows(await confirm(P1, freshToken('en', 60_000, 'production')), 'en', 'invalid'));
      check('preview rejects a legacy token without environment', shows(await confirm(P1, freshToken('en', 60_000, null)), 'en', 'invalid'));
      check('expired preview token rejected', shows(await confirm(P2, freshToken('en', -60_000, 'preview')), 'en', 'expired'));
      const tampered = freshToken('en', 60_000, 'preview').split('.');
      tampered[2] = (tampered[2][0] === 'A' ? 'B' : 'A') + tampered[2].slice(1);
      check('tampered preview token rejected', shows(await confirm(P1, tampered.join('.')), 'en', 'invalid'));
    }

    section('Preview / Production isolation with separate stores');
    {
      const ip = '198.51.100.91';
      const previewStatuses = [];
      for (let i = 0; i < RATE_LIMIT + 1; i++) {
        previewStatuses.push((await post(i % 2 ? P2 : P1, basePayload({ fullName: '' }).form, ip)).status);
      }
      const prodStatus = (await post(A, basePayload({ fullName: '' }).form, ip)).status;
      check('preview rate limit reached (429)', previewStatuses.at(-1) === 429, previewStatuses.join(','));
      check('same IP still allowed in production', prodStatus === 400, String(prodStatus));

      const { email } = basePayload();
      const onPreview = await post(P1, basePayload({ email }).form);
      const onProduction = await post(A, basePayload({ email }).form);
      check('inquiry accepted in preview', onPreview.json.code === 'accepted', JSON.stringify(onPreview));
      check('identical inquiry in production is not treated as duplicate', onProduction.json.code === 'accepted', JSON.stringify(onProduction));
    }

    section('Preview / Production isolation when misconfigured to share one store (P3 uses production KV)');
    {
      const ip = '198.51.100.92';
      const previewStatuses = [];
      for (let i = 0; i < RATE_LIMIT + 1; i++) {
        previewStatuses.push((await post(P3, basePayload({ fullName: '' }).form, ip)).status);
      }
      const prodStatus = (await post(B, basePayload({ fullName: '' }).form, ip)).status;
      check('shared store: preview rate limit does not affect production', previewStatuses.at(-1) === 429 && prodStatus === 400, `${previewStatuses.join(',')} / ${prodStatus}`);

      const { email } = basePayload();
      const onProduction = await post(A, basePayload({ email }).form);
      const onPreview = await post(P3, basePayload({ email }).form);
      check('shared store: production inquiry does not block preview', onProduction.json.code === 'accepted' && onPreview.json.code === 'accepted', `${onProduction.json.code} / ${onPreview.json.code}`);

      const keys = kvStore.keys();
      check('shared store: every key is environment-namespaced', keys.length > 0 && keys.every((k) => /^wl:(production|preview):/.test(k)), keys.filter((k) => !/^wl:(production|preview):/.test(k)).join(','));
      check('shared store: preview keys present only under wl:preview:', keys.some((k) => k.startsWith('wl:preview:')));
    }

    section('Invalid preview hostname (instance X, VERCEL_URL not a Vercel deployment host)');
    {
      const before = smtp.state.messages.length;
      const res = await post(X, basePayload().form);
      check('submission → 503 config_error', res.status === 503 && res.json.success === false && res.json.code === 'config_error', JSON.stringify(res));
      check('no email sent with invalid preview host', smtp.state.messages.length === before);
      check('error response does not reveal the configured host', !JSON.stringify(res.json).includes('attacker.example') && !JSON.stringify(res.json).includes('VERCEL_URL'));
      check('logs do not reveal the configured host', !X.getOutput().includes('attacker.example'));
    }

    section('Frontend outcome mapping (lib/contact/submitResult.ts)');
    {
      const nonSuccess = [
        [400, { success: false, code: 'validation_failed' }],
        [400, { success: false, code: 'rejected' }],
        [409, { success: false, code: 'in_progress' }],
        [429, { success: false, code: 'rate_limited' }],
        [503, { success: false, code: 'config_error' }],
        [503, { success: false, code: 'state_unavailable' }],
        [503, { success: false, code: 'email_unavailable' }],
        [500, { success: false, code: 'internal_error' }],
        [500, null],
        [413, null],
        [200, null],
        [200, { success: false }],
        [200, { success: true }],
        [200, { success: 'true', code: 'accepted' }],
        [200, { success: true, code: 'something_else' }],
        [302, { success: true, code: 'accepted' }],
        [503, { success: true, code: 'accepted' }],
      ];
      check('no rejected/unaccepted response maps to success', nonSuccess.every(([s, b]) => interpretSubmitResponse(s, b).kind !== 'success'));
      check('413 maps to files-too-large message', interpretSubmitResponse(413, null).kind === 'files_too_large');
      check('accepted maps to success', interpretSubmitResponse(200, { success: true, code: 'accepted', confirmationEmailSent: true }).kind === 'success');
      check('duplicate of accepted inquiry maps to success', interpretSubmitResponse(200, { success: true, code: 'duplicate' }).kind === 'success');
      const wronglySuccessful = observedResponses.filter(
        (r) => interpretSubmitResponse(r.status, r.json).kind === 'success' && !(r.status === 200 && r.json?.success === true)
      );
      check(`all ${observedResponses.length} real API responses in this run map correctly`, wronglySuccessful.length === 0);
      const form = fs.readFileSync('components/contact/ContactForm.tsx', 'utf8');
      check('ContactForm sets success only via interpretSubmitResponse', form.includes('interpretSubmitResponse(') && (form.match(/setIsSuccess\(true\)/g) || []).length === 1 && /outcome\.kind === 'success'\)\s*\{\s*setConfirmationEmailSent[^}]*setIsSuccess\(true\)/.test(form));
    }

    section('Privacy of logs and shared state');
    {
      const logs = servers.map((s) => s.getOutput()).join('\n');
      const dump = kvStore.dump() + previewKv.dump();
      check('logs contain no SMTP password', !logs.includes(SMTP_PASS));
      check('logs contain no KV tokens', !logs.includes(kvStore.token) && !logs.includes(previewKv.token));
      check('logs contain no client email addresses', !/client-[a-z0-9]+@mock\.test/.test(logs) && !sentClientEmails.some((e) => logs.includes(e)));
      check('logs contain no recipient address', !logs.includes(OWNER));
      check('logs contain no confirmation tokens', !/v1\.[A-Za-z0-9_-]{10,}\./.test(logs));
      check('shared KV holds no personal data (emails, names, answers)', !/@mock\.test|Test Client|Test Business|coffee/i.test(dump));
    }
  } finally {
    await Promise.all(servers.map((s) => s.stop()));
    await Promise.all([smtp.close(), kvStore.close(), previewKv.close()]);
  }

  let failed = 0;
  let total = 0;
  for (const r of results) {
    if (r.section) {
      console.log(`\n## ${r.section}`);
      continue;
    }
    total++;
    if (!r.ok) failed++;
    console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${!r.ok && r.detail ? `\n      ${r.detail.slice(0, 400)}` : ''}`);
  }
  console.log(`\n${total - failed}/${total} contact checks passed.`);
  console.log('Note: SMTP and KV are local mocks — this proves application behaviour, not production connectivity.');
  if (failed) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
