import type { Metadata } from 'next';

import { locales, type Locale } from '@/i18n';
import {
  DEFAULT_LOCALE,
  SITE_NAME,
  SITE_URL,
  localeLanguageTag,
  localeOg,
} from '@/lib/seo/site';

function normalizePathname(pathname: string = ''): string {
  if (!pathname || pathname === '/') {
    return '';
  }

  const path = pathname.startsWith('/')
    ? pathname
    : `/${pathname}`;

  return path.replace(/\/+$/, '');
}

export function localizedUrl(locale: string, pathname: string = ''): string {
  return `${SITE_URL}/${locale}${normalizePathname(pathname)}`;
}

/** hreflang map keyed by BCP 47 tag (e.g. `sq` for the `/al` slug) plus x-default. */
export function buildHreflangMap(pathname: string = ''): Record<string, string> {
  const languages: Record<string, string> = {};

  for (const supportedLocale of locales) {
    languages[localeLanguageTag(supportedLocale)] =
      localizedUrl(supportedLocale, pathname);
  }

  languages['x-default'] = localizedUrl(DEFAULT_LOCALE, pathname);

  return languages;
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
    : DEFAULT_LOCALE;

  return {
    canonical: localizedUrl(normalizedLocale, pathname),
    languages: buildHreflangMap(pathname),
  };
}

/** Canonical, hreflang, Open Graph and Twitter metadata for a localized page. */
export function buildPageMetadata({
  locale,
  pathname = '',
  title,
  description,
}: {
  locale: string;
  pathname?: string;
  title: string;
  description: string;
}): Metadata {
  const alternates = buildLanguageAlternates(locale, pathname);

  return {
    title,
    description,
    alternates,
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: SITE_NAME,
      url: alternates.canonical as string,
      locale: localeOg(locale),
      alternateLocale: locales
        .filter((l) => l !== locale)
        .map((l) => localeOg(l)),
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

export function isSupportedLocale(
  value: string
): value is Locale {
  return (locales as readonly string[]).includes(value);
}
