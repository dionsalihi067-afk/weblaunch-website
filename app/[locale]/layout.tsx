import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { Plus_Jakarta_Sans, Space_Grotesk } from 'next/font/google';
import '../globals.css';

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
  return [
    { locale: 'al' },
    { locale: 'en' },
    { locale: 'de' },
    { locale: 'fr' },
    { locale: 'it' },
    { locale: 'tr' },
    { locale: 'es' },
  ];
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
    <html lang={locale} className={`${plusJakarta.variable} ${spaceGrotesk.variable}`}>
      <body className={`${plusJakarta.className} antialiased`}>
        <NextIntlClientProvider locale={locale} messages={messages} timeZone="Europe/Belgrade">
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
