import type { Locale } from '@/i18n';
import { PRODUCTION_ORIGIN } from '@/lib/deployment/environment';

/**
 * Canonical production origin. Production serves www (the apex 308-redirects to it).
 * Override only with NEXT_PUBLIC_SITE_URL; APP_URL is intentionally not used because
 * it may point at preview deployments.
 */
export { PRODUCTION_ORIGIN };

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || PRODUCTION_ORIGIN
).replace(/\/+$/, '');

export const SITE_NAME = 'WEB LAUNCH';

export const DEFAULT_LOCALE: Locale = 'en';

/** URL slug → BCP 47 language tag. The `/al` slug is kept, but Albanian is `sq`. */
export const LOCALE_LANGUAGE_TAG: Record<Locale, string> = {
  al: 'sq',
  en: 'en',
  de: 'de',
  fr: 'fr',
  it: 'it',
  tr: 'tr',
  es: 'es',
};

/** Open Graph locales (language_TERRITORY). */
export const LOCALE_OG: Record<Locale, string> = {
  al: 'sq_AL',
  en: 'en_US',
  de: 'de_DE',
  fr: 'fr_FR',
  it: 'it_IT',
  tr: 'tr_TR',
  es: 'es_ES',
};

/** Publicly listed business facts only (see legal documents). No street address is published. */
export const BUSINESS = {
  email: 'weblaunchdigital@gmail.com',
  telephone: '+383 45 949 507',
  instagramUrl: 'https://instagram.com/getweblaunch',
  locality: 'Prishtinë',
  countryCode: 'XK',
  logoPath: '/assets/favicon-512.png',
} as const;

/** Indexable routes (without locale prefix). Redirect-only routes are excluded. */
export const STATIC_PUBLIC_PATHS = [
  '',
  '/services',
  '/portfolio',
  '/about',
  '/process',
  '/contact',
  '/privacy-policy',
  '/terms-and-conditions',
] as const;

export function absoluteUrl(path: string = ''): string {
  return `${SITE_URL}${path.startsWith('/') || path === '' ? path : `/${path}`}`;
}

export function localeLanguageTag(locale: string): string {
  return LOCALE_LANGUAGE_TAG[locale as Locale] ?? locale;
}

export function localeOg(locale: string): string {
  return LOCALE_OG[locale as Locale] ?? LOCALE_OG.en;
}
