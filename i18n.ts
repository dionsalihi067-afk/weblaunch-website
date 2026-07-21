import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const locales = ['al', 'en', 'de', 'fr', 'it', 'tr', 'es'] as const;
export type Locale = (typeof locales)[number];

function getByPath(messages: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object' && part in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, messages);
}

function humanizeKey(key: string): string {
  const last = key.split('.').pop() || key;
  return last
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;

  if (!locale || !locales.includes(locale as Locale)) notFound();

  const messages = (await import(`./messages/${locale}.json`)).default;
  const enMessages = (
    locale === 'en'
      ? messages
      : (await import('./messages/en.json')).default
  ) as Record<string, unknown>;

  return {
    locale,
    messages,
    timeZone: 'Europe/Belgrade',
    onError(error) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[i18n]', error.message);
      }
    },
    getMessageFallback({ namespace, key }) {
      const fullKey = [namespace, key].filter(Boolean).join('.');
      const fromEn = getByPath(enMessages, fullKey);
      if (typeof fromEn === 'string') return fromEn;
      return humanizeKey(fullKey);
    },
  };
});
