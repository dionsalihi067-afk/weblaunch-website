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

import {
  allServiceIds,
  isValidServiceId,
  getServiceConfig,
} from '@/lib/services/serviceData';

import { buildPageMetadata } from '@/lib/seo/alternates';
import { buildServiceGraph } from '@/lib/seo/jsonLd';
import { SITE_NAME } from '@/lib/seo/site';
import JsonLd from '@/components/seo/JsonLd';
import { locales } from '@/i18n';

/** Framer-backed sections — split from the critical service hero path */
const BenefitsGrid = dynamic(
  () => import('@/components/services/BenefitsGrid')
);

const ProcessSteps = dynamic(
  () => import('@/components/services/ProcessSteps')
);

export async function generateStaticParams() {
  return locales.flatMap((locale) =>
    allServiceIds.map((serviceId) => ({
      locale,
      serviceId,
    }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; serviceId: string }>;
}): Promise<Metadata> {
  const { locale, serviceId } = await params;

  if (!isValidServiceId(serviceId)) {
    return {};
  }

  const t = await getTranslations({
    locale,
    namespace: `services.meta.${serviceId}`,
  });

  return buildPageMetadata({
    locale,
    pathname: `/services/${serviceId}`,
    title: t('title'),
    description: t('description'),
  });
}

export default async function ServiceDetailPage({
  params,
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

  const t = await getTranslations(
    `services.detail.${serviceId}`
  );

  const common = await getTranslations(
    'services.common'
  );

  const servicesT = await getTranslations('services');

  const features = t.raw('features') as {
    included: string[];
    additional: string[];
  };

  const serviceGraph = buildServiceGraph({
    locale,
    serviceId,
    name: t('hero.title'),
    description: t('hero.subtitle'),
    homeLabel: SITE_NAME,
    servicesLabel: servicesT('title'),
  });

  return (
    <>
      <JsonLd data={serviceGraph} />
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
            [common('whatsIncluded')]: features.included,
            [common('additionalOptions')]: features.additional,
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