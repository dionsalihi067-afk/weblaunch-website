'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import {
  Search,
  Lightbulb,
  Palette,
  Code,
  TestTube,
  Rocket,
  HeartHandshake,
} from 'lucide-react';
import Reveal from '@/components/motion/Reveal';

export default function ProcessTimeline() {
  const t = useTranslations('process');
  const locale = useLocale();

  const steps = [
    {
      number: t('steps.1.number'),
      title: t('steps.1.title'),
      description: t('steps.1.description'),
      icon: Search,
      color: 'from-primary-500 to-sky-500',
    },
    {
      number: t('steps.2.number'),
      title: t('steps.2.title'),
      description: t('steps.2.description'),
      icon: Lightbulb,
      color: 'from-slate-700 to-slate-500',
    },
    {
      number: t('steps.3.number'),
      title: t('steps.3.title'),
      description: t('steps.3.description'),
      icon: Palette,
      color: 'from-emerald-500 to-teal-500',
    },
    {
      number: t('steps.4.number'),
      title: t('steps.4.title'),
      description: t('steps.4.description'),
      icon: Code,
      color: 'from-orange-500 to-amber-500',
    },
    {
      number: t('steps.5.number'),
      title: t('steps.5.title'),
      description: t('steps.5.description'),
      icon: TestTube,
      color: 'from-rose-500 to-orange-400',
    },
    {
      number: t('steps.6.number'),
      title: t('steps.6.title'),
      description: t('steps.6.description'),
      icon: Rocket,
      color: 'from-primary-600 to-sky-400',
    },
    {
      number: t('steps.7.number'),
      title: t('steps.7.title'),
      description: t('steps.7.description'),
      icon: HeartHandshake,
      color: 'from-teal-500 to-emerald-500',
    },
  ];

  return (
    <section className="section-pad bg-white relative overflow-hidden">
      <div className="container-custom">
        <div className="relative">
          <div
            className="pointer-events-none absolute left-1/2 top-8 bottom-8 w-px -translate-x-1/2 bg-gradient-to-b from-primary-200 via-primary-400 to-primary-200 hidden lg:block"
            aria-hidden
          />

          <div className="space-y-12 md:space-y-20 lg:space-y-24">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isEven = index % 2 === 0;

              return (
                <Reveal key={index} delay={Math.min(index * 0.04, 0.2)}>
                  <div
                    className={`relative flex flex-col items-center lg:flex-row ${
                      isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'
                    }`}
                  >
                    <div className={`w-full lg:w-5/12 ${isEven ? 'lg:pr-12' : 'lg:pl-12'}`}>
                      <div className="surface-card surface-card-hover relative z-10 p-5 sm:p-8">
                        <div className="mb-3 flex items-center space-x-3 sm:mb-4 sm:space-x-4">
                          <span className="font-display text-3xl font-bold text-slate-200 sm:text-5xl">
                            {step.number}
                          </span>
                          <div
                            className={`rounded-2xl bg-gradient-to-br p-2.5 shadow-soft sm:p-3 ${step.color}`}
                          >
                            <Icon className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                          </div>
                        </div>
                        <h3 className="heading-card mb-2 text-slate-900 sm:mb-3 sm:text-2xl sm:font-bold">
                          {step.title}
                        </h3>
                        <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
                          {step.description}
                        </p>
                      </div>
                    </div>

                    <div className="hidden lg:flex lg:w-2/12 justify-center relative z-10 my-8 lg:my-0">
                      <div
                        className={`w-16 h-16 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center shadow-premium ring-8 ring-white`}
                      >
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                    </div>

                    <div className="hidden lg:block lg:w-5/12" />
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>

        <Reveal className="relative z-10 mt-14 text-center sm:mt-20 md:mt-24">
          <div className="relative overflow-hidden rounded-2xl bg-mesh-dark p-6 text-white shadow-premium sm:rounded-3xl sm:p-10 md:p-12">
            <h3 className="heading-section mb-3 sm:mb-4">{t('cta.title')}</h3>
            <p className="text-lead mb-6 text-slate-200/90 sm:mb-8">{t('cta.subtitle')}</p>
            <Link
              href={`/${locale}/contact`}
              className="inline-flex min-h-11 w-full max-w-xs items-center justify-center rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-primary-600 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-50 sm:w-auto sm:max-w-none sm:px-8 sm:py-4 sm:text-base"
            >
              {t('cta.button')}
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
