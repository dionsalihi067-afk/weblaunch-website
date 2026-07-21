import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import LazyWhatsApp from '@/components/LazyWhatsApp';
import { getTranslations, setRequestLocale } from 'next-intl/server';

const ServiceGrid = dynamic(() => import('@/components/services/ServiceGrid'));

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });
  
  return {
    title: t('services.title'),
    description: t('services.description'),
  };
}

export default async function ServicesPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('services');
  
  return (
    <>
      <Navigation />
      <main className="pt-16 sm:pt-20">
        {/* Hero Section */}
        <section className="page-hero relative overflow-hidden bg-mesh">
          <div className="container-custom relative z-10">
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="heading-page mb-4 text-slate-900 sm:mb-6">{t('title')}</h1>
              <p className="text-lead text-slate-600">{t('subtitle')}</p>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <ServiceGrid />
      </main>
      <Footer />
      <LazyWhatsApp />
    </>
  );
}
