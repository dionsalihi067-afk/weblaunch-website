'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import Reveal from '@/components/motion/Reveal';
import AmbientBackground from '@/components/ui/AmbientBackground';

export default function CallToAction() {
  const t = useTranslations('home.cta');
  const locale = useLocale();

  return (
    <section className="relative section-pad overflow-hidden">
      <AmbientBackground variant="dark" />
      <div className="container-custom relative z-10">
        <Reveal className="mx-auto max-w-4xl text-center">
          <div className="mb-5 inline-flex max-w-full items-center space-x-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md sm:mb-6 sm:px-4 sm:py-2 sm:text-sm">
            <Sparkles className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
            <span className="truncate">{t('badge')}</span>
          </div>

          <h2 className="heading-section mb-4 text-white sm:mb-6">
            {t('title')}
          </h2>

          <p className="text-lead mx-auto mb-8 max-w-2xl text-slate-200/90 sm:mb-10 md:mb-12">
            {t('subtitle')}
          </p>

          <div className="mx-auto flex w-full max-w-md flex-col items-stretch justify-center gap-3 sm:max-w-none sm:flex-row sm:items-center sm:gap-5">
            <Link
              href={`/${locale}/contact`}
              className="group inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-primary-600 shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-50 sm:w-auto sm:px-8 sm:py-4 sm:text-base"
            >
              <span>{t('primary')}</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="tel:+38345949507"
              className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-white/30 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10 sm:w-auto sm:px-8 sm:py-4 sm:text-base"
            >
              {t('secondary')}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
