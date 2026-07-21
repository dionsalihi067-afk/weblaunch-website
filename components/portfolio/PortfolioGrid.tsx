'use client';

import { FolderOpen } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Reveal from '@/components/motion/Reveal';

export default function PortfolioGrid() {
  const t = useTranslations('portfolio');

  return (
    <section className="section-pad bg-gradient-to-b from-white to-slate-50/80">
      <div className="container-custom">
        <Reveal className="surface-card mx-auto max-w-2xl p-6 text-center sm:p-10 md:p-12">
          <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-primary-100 bg-primary-50 text-primary-600 sm:mb-6 sm:h-16 sm:w-16">
            <FolderOpen className="h-7 w-7 sm:h-8 sm:w-8" aria-hidden />
          </div>
          <h2 className="heading-section mb-3 text-slate-900 sm:mb-4">
            {t('comingSoon.title')}
          </h2>
          <p className="text-lead text-slate-600">{t('comingSoon.description')}</p>
        </Reveal>
      </div>
    </section>
  );
}
