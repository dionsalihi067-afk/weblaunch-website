import { getAppUrl } from '@/lib/email/smtp';

export const EMAIL_BRAND = {
  name: 'WEB LAUNCH',
  phone: '+383 45 949 507',
  phoneHref: 'tel:+38345949507',
  email: 'weblaunchdigital@gmail.com',
  instagram: '@getweblaunch',
  instagramHref: 'https://instagram.com/getweblaunch',
  whatsappHref: 'https://wa.me/38345949507',
  primary: '#0070f3',
  primaryDark: '#0051a8',
  ink: '#0f172a',
  muted: '#64748b',
  border: '#e2e8f0',
  cardBg: '#ffffff',
  pageBg: '#eef2f7',
  headerBg: '#0b1220',
} as const;

export function getWebsiteUrl(): string {
  return getAppUrl();
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function formatEmailDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    });
  } catch {
    return iso;
  }
}
