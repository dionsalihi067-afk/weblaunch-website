'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import type { CSSProperties } from 'react';
import AmbientBackground from '@/components/ui/AmbientBackground';

const PointerLight = dynamic(() => import('@/components/ui/PointerLight'), {
  ssr: false,
});

export default function Hero() {
  const t = useTranslations('home.hero');
  const locale = useLocale();
  const reduceMotion = useReducedMotion();

  const fade = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 22 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <section
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden pt-16 sm:pt-20 perspective-scene"
      style={
        {
          ['--pointer-x' as string]: '55%',
          ['--pointer-y' as string]: '30%',
        } as CSSProperties
      }
    >
      <AmbientBackground variant="hero" />
      <PointerLight />

      <div className="container-custom relative z-10 py-10 sm:py-14 md:py-20">
        <div className="mx-auto max-w-5xl text-center">
          <motion.div {...fade(0)} className="mb-4 sm:mb-6">
            <div className="mb-5 inline-flex max-w-full items-center space-x-2 rounded-full border border-primary-200/70 bg-white/60 px-3 py-1.5 text-xs font-medium text-primary-600 shadow-soft backdrop-blur-md sm:mb-8 sm:px-4 sm:py-2 sm:text-sm">
              <Sparkles className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
              <span className="truncate">{t('badge')}</span>
            </div>
          </motion.div>

          <motion.h1 {...fade(0.08)} className="heading-hero mb-4 text-slate-900 sm:mb-6">
            <span className="gradient-text">{t('title')}</span>
          </motion.h1>

          <motion.p
            {...fade(0.16)}
            className="text-lead mx-auto mb-8 max-w-3xl text-slate-600 sm:mb-10 md:mb-12"
          >
            {t('subtitle')}
          </motion.p>

          <motion.div
            {...fade(0.24)}
            className="mx-auto flex w-full max-w-md flex-col items-stretch justify-center gap-3 sm:max-w-none sm:flex-row sm:items-center sm:gap-5"
          >
            <Link href={`/${locale}/contact`} className="btn-premium-primary group">
              <span>{t('cta.primary')}</span>
              <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link href={`/${locale}/services`} className="btn-premium-secondary">
              {t('cta.secondary')}
            </Link>
          </motion.div>

          <motion.div
            {...fade(0.34)}
            className="mt-10 grid grid-cols-2 gap-3 sm:mt-14 sm:gap-4 md:mt-20 md:grid-cols-4 md:gap-6"
          >
            {[
              { number: t('stats.projectsValue'), label: t('stats.projects') },
              { number: t('stats.languagesValue'), label: t('stats.languages') },
              { number: t('stats.satisfactionValue'), label: t('stats.satisfaction') },
              { number: t('stats.supportValue'), label: t('stats.support') },
            ].map((stat, index) => (
              <div
                key={index}
                className="rounded-2xl border border-white/70 bg-white/55 px-2.5 py-4 shadow-soft backdrop-blur-md transition-transform duration-300 hover:-translate-y-1 sm:px-3 sm:py-5"
              >
                <div
                  className={`mb-1 font-display font-bold text-primary-500 ${
                    stat.number.length > 6
                      ? 'text-lg leading-tight sm:text-xl md:text-2xl'
                      : 'text-[1.65rem] leading-none sm:text-3xl md:text-4xl lg:text-5xl'
                  }`}
                >
                  {stat.number}
                </div>
                {stat.label ? (
                  <div className="text-[0.7rem] leading-snug text-slate-500 sm:text-xs md:text-sm">
                    {stat.label}
                  </div>
                ) : null}
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0" aria-hidden>
        <svg
          viewBox="0 0 1440 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-auto w-full"
        >
          <path
            d="M0 100L60 92C120 84 240 68 360 60C480 52 600 52 720 56C840 60 960 68 1080 72C1200 76 1320 76 1380 76L1440 76V100H0Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
}
