import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import LazyWhatsApp from '@/components/LazyWhatsApp';
import { Phone, Mail, Instagram, MapPin } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { buildPageMetadata } from '@/lib/seo/alternates';

const ContactForm = dynamic(() => import('@/components/contact/ContactForm'));

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const t = await getTranslations({
    locale,
    namespace: 'metadata',
  });

  return buildPageMetadata({
    locale,
    pathname: '/contact',
    title: t('contact.title'),
    description: t('contact.description'),
  });
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  setRequestLocale(locale);

  const t = await getTranslations({
    locale,
    namespace: 'contact',
  });

  return (
    <>
      <Navigation />

      <main className="pt-16 sm:pt-20">
        <section className="page-hero relative overflow-hidden text-white">
          <div className="absolute inset-0 bg-mesh-dark" aria-hidden="true" />

          <div className="container-custom relative z-10">
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="heading-page mb-4 sm:mb-6">
                {t('title')}
              </h1>

              <p className="text-lead text-slate-200/90">
                {t('subtitle')}
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white py-10 sm:py-16">
          <div className="container-custom">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:gap-6 lg:grid-cols-4">
              <a
                href="tel:+38345949507"
                className="group surface-card surface-card-hover p-5 text-center sm:p-6"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary-100 bg-primary-50 transition-colors group-hover:border-primary-500 group-hover:bg-primary-500">
                  <Phone className="h-6 w-6 text-primary-500 transition-colors group-hover:text-white" />
                </div>

                <h3 className="mb-2 font-display font-semibold text-slate-900">
                  {t('phone.label')}
                </h3>

                <p className="text-slate-600">
                  +383 45 949 507
                </p>
              </a>

              <a
                href="mailto:weblaunchdigital@gmail.com"
                className="group surface-card surface-card-hover p-5 text-center sm:p-6"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary-100 bg-primary-50 transition-colors group-hover:border-primary-500 group-hover:bg-primary-500">
                  <Mail className="h-6 w-6 text-primary-500 transition-colors group-hover:text-white" />
                </div>

                <h3 className="mb-2 font-display font-semibold text-slate-900">
                  {t('email.label')}
                </h3>

                <p className="break-all text-sm text-slate-600">
                  weblaunchdigital@gmail.com
                </p>
              </a>

              <a
                href="https://instagram.com/getweblaunch"
                target="_blank"
                rel="noopener noreferrer"
                className="group surface-card surface-card-hover p-5 text-center sm:p-6"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary-100 bg-primary-50 transition-colors group-hover:border-primary-500 group-hover:bg-primary-500">
                  <Instagram className="h-6 w-6 text-primary-500 transition-colors group-hover:text-white" />
                </div>

                <h3 className="mb-2 font-display font-semibold text-slate-900">
                  {t('instagram.label')}
                </h3>

                <p className="text-slate-600">
                  @getweblaunch
                </p>
              </a>

              <a
                href="https://wa.me/38345949507"
                target="_blank"
                rel="noopener noreferrer"
                className="group surface-card surface-card-hover p-5 text-center sm:p-6"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary-100 bg-primary-50 transition-colors group-hover:border-primary-500 group-hover:bg-primary-500">
                  <MapPin className="h-6 w-6 text-primary-500 transition-colors group-hover:text-white" />
                </div>

                <h3 className="mb-2 font-display font-semibold text-slate-900">
                  {t('whatsapp.label')}
                </h3>

                <p className="text-slate-600">
                  +383 45 949 507
                </p>
              </a>
            </div>
          </div>
        </section>

        <section className="section-pad bg-gradient-to-b from-slate-50 to-white">
          <div className="container-custom">
            <div className="mx-auto max-w-4xl">
              <div className="mb-8 text-center sm:mb-12">
                <h2 className="heading-section mb-3 text-slate-900 sm:mb-4">
                  {t('form.title')}
                </h2>

                <p className="text-lead text-slate-600">
                  {t('form.subtitle')}
                </p>
              </div>

              <ContactForm />
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <LazyWhatsApp />
    </>
  );
}