import dns from 'dns';
import { promisify } from 'util';
import nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

const dnsLookup = promisify(dns.lookup);

export interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  emailTo: string;
}

export function getSmtpConfig(): SmtpConfig {
  const host = (process.env.SMTP_HOST || '').trim();
  const portRaw = (process.env.SMTP_PORT || '').trim();
  const user = (process.env.SMTP_USER || '').trim();
  const pass = (process.env.SMTP_PASS || '').trim();
  const emailTo = (process.env.EMAIL_TO || '').trim();

  const missing: string[] = [];
  if (!host) missing.push('SMTP_HOST');
  if (!portRaw) missing.push('SMTP_PORT');
  if (!user) missing.push('SMTP_USER');
  if (!pass) missing.push('SMTP_PASS');
  if (!emailTo) missing.push('EMAIL_TO');

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  const port = parseInt(portRaw, 10);
  if (Number.isNaN(port)) {
    throw new Error(`Invalid SMTP_PORT: "${portRaw}"`);
  }

  return { host, port, user, pass, emailTo };
}

export function getAppUrl(): string {
  const url = (process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || '').trim();
  if (!url) {
    // Dev fallback
    return 'http://localhost:3000';
  }
  return url.replace(/\/$/, '');
}

async function resolveSmtpHost(hostname: string): Promise<{ host: string; servername: string }> {
  try {
    const result = await dnsLookup(hostname, { family: 4 });
    const address = typeof result === 'string' ? result : result.address;
    return { host: address, servername: hostname };
  } catch {
    return { host: hostname, servername: hostname };
  }
}

export async function createMailTransporter(smtp: SmtpConfig) {
  const resolved = await resolveSmtpHost(smtp.host);

  const transporter = nodemailer.createTransport({
    host: resolved.host,
    port: smtp.port,
    secure: smtp.port === 465,
    requireTLS: smtp.port === 587,
    connectionTimeout: 20000,
    greetingTimeout: 20000,
    socketTimeout: 30000,
    auth: {
      user: smtp.user,
      pass: smtp.pass,
    },
    tls: {
      servername: resolved.servername,
      rejectUnauthorized: true,
      minVersion: 'TLSv1.2',
    },
  } as SMTPTransport.Options);

  await transporter.verify();
  return transporter;
}
