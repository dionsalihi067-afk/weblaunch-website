import type { Metadata } from 'next';
import { locales, type Locale } from '@/i18n';

const SITE_URL = (process.env.APP_URL || 'https://weblaunchworks.com').replace(/\/$/, '');

/**
 * Alternate language tags for SEO.
 * Uses locale code `en` (not en-GB) as the English locale.
 */
export function buildLanguageAlternates(
  locale: string,
  pathname: string = ''
): NonNullable<Metadata['alternates']> {
  const normalizedPath = pathname.startsWith('/') ? pathname : pathname ? `/${pathname}` : '';
  const languages: Record<string, string> = {
    'x-default': `${SITE_URL}/en${normalizedPath}`,
  };

  for (const l of locales) {
    languages[l] = `${SITE_URL}/${l}${normalizedPath}`;
  }

  return {
    canonical: `${SITE_URL}/${locale}${normalizedPath}`,
    languages,
  };
}

export function isSupportedLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
