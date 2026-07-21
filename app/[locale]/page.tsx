import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Hero from '@/components/home/Hero';
import LazyWhatsApp from '@/components/LazyWhatsApp';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { buildLanguageAlternates } from '@/lib/seo/alternates';

/** Below-fold home sections — code-split to shrink initial JS */
const TrustSection = dynamic(() => import('@/components/home/TrustSection'));
const ServicesOverview = dynamic(() => import('@/components/home/ServicesOverview'));
const CallToAction = dynamic(() => import('@/components/home/CallToAction'));

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });
  
  return {
    title: t('home.title'),
    description: t('home.description'),
    alternates: buildLanguageAlternates(locale),
    openGraph: {
      title: t('home.title'),
      description: t('home.description'),
      type: 'website',
      locale: locale === 'en' ? 'en' : locale,
    },
  };
}

export default async function HomePage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  
  return (
    <>
      <Navigation />
      <main>
        <Hero />
        <TrustSection />
        <ServicesOverview />
        <CallToAction />
      </main>
      <Footer />
      <LazyWhatsApp />
    </>
  );
}
