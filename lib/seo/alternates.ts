import type { Metadata } from 'next';

import { locales, type Locale } from '@/i18n';

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.APP_URL ||
  'https://www.weblaunchworks.com'
).replace(/\/+$/, '');

function normalizePathname(pathname: string = ''): string {
  if (!pathname || pathname === '/') {
    return '';
  }

  const path = pathname.startsWith('/')
    ? pathname
    : `/${pathname}`;

  return path.replace(/\/+$/, '');
}

/**
 * Builds canonical and hreflang alternate URLs for multilingual pages.
 */
export function buildLanguageAlternates(
  locale: string,
  pathname: string = ''
): NonNullable<Metadata['alternates']> {
  const normalizedLocale = isSupportedLocale(locale)
    ? locale
    : 'en';

  const normalizedPath = normalizePathname(pathname);

  const languages: Record<string, string> = {
    'x-default': `${SITE_URL}/en${normalizedPath}`,
  };

  for (const supportedLocale of locales) {
    languages[supportedLocale] =
      `${SITE_URL}/${supportedLocale}${normalizedPath}`;
  }

  return {
    canonical: `${SITE_URL}/${normalizedLocale}${normalizedPath}`,
    languages,
  };
}

export function isSupportedLocale(
  value: string
): value is Locale {
  return (locales as readonly string[]).includes(value);
}