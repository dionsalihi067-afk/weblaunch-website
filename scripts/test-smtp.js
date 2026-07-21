/**
 * Quick SMTP smoke test — run: node scripts/test-smtp.js
 * Resolves smtp.gmail.com to IPv4 first to avoid Node DNS ETIMEOUT on Windows.
 */
const fs = require('fs');
const path = require('path');
const dns = require('dns').promises;
const nodemailer = require('nodemailer');

function loadEnvLocal() {
  const envPath = path.join(__dirname, '..', '.env.local');
  const raw = fs.readFileSync(envPath, 'utf8');
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return env;
}

async function resolveIpv4(hostname) {
  // Prefer dns.lookup (uses OS resolver) over dns.resolve4 (can ETIMEOUT on some Windows setups)
  try {
    const { address } = await dns.lookup(hostname, { family: 4 });
    return address;
  } catch (e1) {
    console.warn('dns.lookup failed, trying resolve4:', e1.message);
    const addrs = await dns.resolve4(hostname);
    return addrs[0];
  }
}

async function main() {
  const env = loadEnvLocal();
  const required = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'EMAIL_TO'];
  const missing = required.filter((k) => !env[k]);
  if (missing.length) {
    console.error('Missing vars in .env.local:', missing.join(', '));
    process.exit(1);
  }

  const host = env.SMTP_HOST;
  const port = parseInt(env.SMTP_PORT, 10);
  let hostIp;
  try {
    hostIp = await resolveIpv4(host);
    console.log(`Resolved ${host} → ${hostIp}`);
  } catch (err) {
    console.error('DNS resolve failed:', err.message);
    process.exit(1);
  }

  console.log('Config:', {
    host,
    hostIp,
    port,
    user: env.SMTP_USER,
    emailTo: env.EMAIL_TO,
    passLength: env.SMTP_PASS.length,
  });

  const transporter = nodemailer.createTransport({
    host: hostIp,
    port,
    secure: port === 465,
    requireTLS: port === 587,
    connectionTimeout: 20000,
    greetingTimeout: 20000,
    socketTimeout: 30000,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
    tls: {
      // Required when connecting by IP — certificate is for smtp.gmail.com
      servername: host,
      rejectUnauthorized: true,
      minVersion: 'TLSv1.2',
    },
  });

  try {
    await transporter.verify();
    console.log('✓ SMTP verify() succeeded');
  } catch (err) {
    console.error('✗ SMTP verify() failed:', err.message);
    console.error(err);
    process.exit(1);
  }

  try {
    const info = await transporter.sendMail({
      from: `"WEB LAUNCH Test" <${env.SMTP_USER}>`,
      to: env.EMAIL_TO,
      subject: 'WEB LAUNCH SMTP Test — Contact Form Debug',
      text: 'This is a test email from the WEB LAUNCH contact form SMTP debug script.',
      html: '<p>This is a <strong>test email</strong> from the WEB LAUNCH contact form SMTP debug script.</p>',
    });
    console.log('✓ Test email sent:', info.messageId);
    console.log('  To:', env.EMAIL_TO);
  } catch (err) {
    console.error('✗ sendMail() failed:', err.message);
    console.error(err);
    process.exit(1);
  }
}

main();
