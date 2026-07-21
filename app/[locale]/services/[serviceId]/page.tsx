import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import LazyWhatsApp from '@/components/LazyWhatsApp';
import ServiceHero from '@/components/services/ServiceHero';
import ProblemSection from '@/components/services/ProblemSection';
import SolutionSection from '@/components/services/SolutionSection';
import FeaturesSection from '@/components/services/FeaturesSection';
import IdealClients from '@/components/services/IdealClients';
import ServiceCTA from '@/components/services/ServiceCTA';
import { allServiceIds, isValidServiceId, getServiceConfig } from '@/lib/services/serviceData';
import { locales } from '@/i18n';

/** Framer-backed sections — split from critical service hero path */
const BenefitsGrid = dynamic(() => import('@/components/services/BenefitsGrid'));
const ProcessSteps = dynamic(() => import('@/components/services/ProcessSteps'));

export async function generateStaticParams() {
  const params = [];

  for (const locale of locales) {
    for (const serviceId of allServiceIds) {
      params.push({ locale, serviceId });
    }
  }

  return params;
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string; serviceId: string }>;
}): Promise<Metadata> {
  const { locale, serviceId } = await params;

  if (!isValidServiceId(serviceId)) {
    return {};
  }

  const t = await getTranslations({
    locale,
    namespace: `services.meta.${serviceId}`
  });

  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      locale: locale,
    },
  };
}

export default async function ServiceDetailPage({
  params
}: {
  params: Promise<{ locale: string; serviceId: string }>;
}) {
  const { locale, serviceId } = await params;

  if (!isValidServiceId(serviceId)) {
    notFound();
  }

  setRequestLocale(locale);

  const serviceConfig = getServiceConfig(serviceId);

  if (!serviceConfig) {
    notFound();
  }

  const t = await getTranslations(`services.detail.${serviceId}`);
  const common = await getTranslations('services.common');

  return (
    <>
      <Navigation />
      <main className="pt-16 sm:pt-20">
        <ServiceHero
          config={serviceConfig}
          translations={t.raw('hero')}
          locale={locale}
        />
        <ProblemSection
          translations={t.raw('problem')}
        />
        <SolutionSection
          translations={t.raw('solution')}
        />
        <BenefitsGrid
          benefits={t.raw('benefits')}
          heading={common('keyBenefits')}
        />
        <FeaturesSection
          features={{
            [common('whatsIncluded')]: (t.raw('features') as { included: string[]; additional: string[] }).included,
            [common('additionalOptions')]: (t.raw('features') as { included: string[]; additional: string[] }).additional,
          }}
          heading={common('capabilitiesHeading')}
        />
        <IdealClients
          clients={t.raw('idealFor')}
          heading={common('idealFor')}
        />
        <ProcessSteps
          steps={t.raw('process.steps')}
          heading={common('ourProcess')}
        />
        <ServiceCTA
          translations={t.raw('cta')}
          locale={locale}
        />
      </main>
      <Footer />
      <LazyWhatsApp />
    </>
  );
}
