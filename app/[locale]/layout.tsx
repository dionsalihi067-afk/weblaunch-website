import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { Plus_Jakarta_Sans, Space_Grotesk } from 'next/font/google';

import JsonLd from '@/components/seo/JsonLd';
import { buildSiteGraph } from '@/lib/seo/jsonLd';
import { SITE_NAME, SITE_URL, localeLanguageTag } from '@/lib/seo/site';
import { locales } from '@/i18n';
import '../globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  icons: {
    icon: [
      { url: '/assets/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/assets/favicon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/assets/favicon-192.png', sizes: '192x192' }],
  },
};

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  preload: true,
  adjustFontFallback: true,
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['500', '600', '700'],
  preload: true,
  adjustFontFallback: true,
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={localeLanguageTag(locale)} className={`${plusJakarta.variable} ${spaceGrotesk.variable}`}>
      <body className={`${plusJakarta.className} antialiased`}>
        <JsonLd data={buildSiteGraph(locale)} />
        <NextIntlClientProvider locale={locale} messages={messages} timeZone="Europe/Belgrade">
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
