import { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import LazyWhatsApp from '@/components/LazyWhatsApp';
import { Target, Users, Zap, Award, TrendingUp, Heart } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.about' });
  
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function AboutPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('about');

  return (
    <>
      <Navigation />
      <main className="pt-16 sm:pt-20">
        <section className="page-hero relative overflow-hidden text-white">
          <div className="absolute inset-0 bg-mesh-dark" aria-hidden />
          <div className="container-custom relative z-10">
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="heading-page mb-4 sm:mb-6">{t('hero.title')}</h1>
              <p className="text-lead text-slate-200/90">{t('hero.subtitle')}</p>
            </div>
          </div>
        </section>

        <section className="section-pad bg-white">
          <div className="container-custom">
            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
              <div>
                <h2 className="heading-section mb-4 text-slate-900 sm:mb-6">
                  {t('mission.title')}
                </h2>
                <p className="mb-5 text-base leading-relaxed text-slate-600 sm:mb-6 sm:text-lg">
                  {t('mission.description1')}
                </p>
                <p className="text-base leading-relaxed text-slate-600 sm:text-lg">
                  {t('mission.description2')}
                </p>
              </div>
              <div className="surface-card border-primary-100/60 bg-gradient-to-br from-primary-50/90 to-sky-50/50 p-6 sm:p-10">
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <Target className="w-8 h-8 text-primary-500 flex-shrink-0" />
                    <div>
                      <h3 className="font-display font-semibold text-slate-900 mb-2">
                        {t('mission.values.resultsFocused.title')}
                      </h3>
                      <p className="text-slate-600">
                        {t('mission.values.resultsFocused.description')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <Users className="w-8 h-8 text-primary-500 flex-shrink-0" />
                    <div>
                      <h3 className="font-display font-semibold text-slate-900 mb-2">
                        {t('mission.values.clientCentric.title')}
                      </h3>
                      <p className="text-slate-600">
                        {t('mission.values.clientCentric.description')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <Zap className="w-8 h-8 text-primary-500 flex-shrink-0" />
                    <div>
                      <h3 className="font-display font-semibold text-slate-900 mb-2">
                        {t('mission.values.innovationDriven.title')}
                      </h3>
                      <p className="text-slate-600">
                        {t('mission.values.innovationDriven.description')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-pad bg-slate-50/80">
          <div className="container-custom">
            <div className="mb-10 text-center md:mb-14">
              <h2 className="heading-section mb-3 text-slate-900 sm:mb-4">
                {t('values.title')}
              </h2>
              <p className="text-lead text-slate-600">{t('values.subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3 md:gap-8">
              <div className="surface-card surface-card-hover p-6 text-center sm:p-8">
                <Award className="mx-auto mb-4 h-10 w-10 text-primary-500 sm:h-12 sm:w-12" />
                <h3 className="heading-card mb-2 text-slate-900 sm:mb-3">
                  {t('values.excellence.title')}
                </h3>
                <p className="text-sm text-slate-600 sm:text-base">{t('values.excellence.description')}</p>
              </div>

              <div className="surface-card surface-card-hover p-6 text-center sm:p-8">
                <TrendingUp className="mx-auto mb-4 h-10 w-10 text-primary-500 sm:h-12 sm:w-12" />
                <h3 className="heading-card mb-2 text-slate-900 sm:mb-3">
                  {t('values.growth.title')}
                </h3>
                <p className="text-sm text-slate-600 sm:text-base">{t('values.growth.description')}</p>
              </div>

              <div className="surface-card surface-card-hover p-6 text-center sm:p-8">
                <Heart className="mx-auto mb-4 h-10 w-10 text-primary-500 sm:h-12 sm:w-12" />
                <h3 className="heading-card mb-2 text-slate-900 sm:mb-3">
                  {t('values.integrity.title')}
                </h3>
                <p className="text-sm text-slate-600 sm:text-base">{t('values.integrity.description')}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section-pad bg-white">
          <div className="container-custom">
            <div className="mx-auto max-w-4xl text-center">
              <h2 className="heading-section mb-6 text-slate-900 sm:mb-8">
                {t('whyChoose.title')}
              </h2>
              <div className="space-y-3 text-base text-slate-600 sm:space-y-4 sm:text-lg">
                <p>✓ <strong className="text-slate-900">{t('whyChoose.international')}</strong></p>
                <p>✓ <strong className="text-slate-900">{t('whyChoose.fullService')}</strong></p>
                <p>✓ <strong className="text-slate-900">{t('whyChoose.provenTrack')}</strong></p>
                <p>✓ <strong className="text-slate-900">{t('whyChoose.modernTech')}</strong></p>
                <p>✓ <strong className="text-slate-900">{t('whyChoose.ongoingSupport')}</strong></p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <LazyWhatsApp />
    </>
  );
}
