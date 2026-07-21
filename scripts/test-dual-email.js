const fs = require('fs');
const path = require('path');
const dns = require('dns').promises;
const nodemailer = require('nodemailer');

// Load .env.local
const envPath = path.join(__dirname, '..', '.env.local');
for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
  const t = line.trim();
  if (!t || t.startsWith('#')) continue;
  const eq = t.indexOf('=');
  if (eq === -1) continue;
  process.env[t.slice(0, eq).trim()] = t.slice(eq + 1).trim();
}

async function main() {
  const base = process.env.TEST_API_URL || 'http://localhost:3010';
  const form = new FormData();
  form.append('fullName', 'Email Test Client');
  form.append('businessName', 'WEB LAUNCH Test Co');
  form.append('email', 'dionsalihi067@gmail.com');
  form.append('phone', '+38345949507');
  form.append('country', 'Kosovo');
  form.append('preferredLanguage', 'english');
  form.append('selectedServices', JSON.stringify(['website-development']));
  form.append('additionalNotes', 'Automated dual-email verification');
  form.append('website-development_describe', 'Test business description');
  form.append('website-development_products', 'Digital services');
  form.append('website-development_goal', 'lead-generation');
  form.append('website-development_pages', JSON.stringify(['home', 'contact']));
  form.append('website-development_style', 'Modern and clean');

  console.log('POST', `${base}/api/contact`);
  const res = await fetch(`${base}/api/contact`, { method: 'POST', body: form });
  const text = await res.text();
  console.log('STATUS', res.status);
  console.log(text);
  if (!res.ok) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
