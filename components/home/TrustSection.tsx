'use client';

import { useTranslations } from 'next-intl';
import { Shield, Zap, Users, TrendingUp, Award, Headphones } from 'lucide-react';
import Reveal from '@/components/motion/Reveal';
import { Stagger, StaggerItem } from '@/components/motion/Stagger';
import PremiumCard from '@/components/ui/PremiumCard';
import AmbientBackground from '@/components/ui/AmbientBackground';

const icons = {
  shield: Shield,
  zap: Zap,
  users: Users,
  trending: TrendingUp,
  award: Award,
  headphones: Headphones,
};

export default function TrustSection() {
  const t = useTranslations('home.trust');

  const features = [
    {
      icon: 'award',
      title: t('features.design.title'),
      description: t('features.design.description'),
    },
    {
      icon: 'zap',
      title: t('features.technology.title'),
      description: t('features.technology.description'),
    },
    {
      icon: 'trending',
      title: t('features.conversion.title'),
      description: t('features.conversion.description'),
    },
    {
      icon: 'shield',
      title: t('features.complete.title'),
      description: t('features.complete.description'),
    },
    {
      icon: 'headphones',
      title: t('features.support.title'),
      description: t('features.support.description'),
    },
    {
      icon: 'users',
      title: t('features.international.title'),
      description: t('features.international.description'),
    },
  ];

  return (
    <section className="relative section-pad overflow-hidden">
      <AmbientBackground variant="light" />
      <div className="container-custom relative z-10">
        <Reveal className="mb-10 text-center md:mb-16">
          <h2 className="heading-section mb-3 text-slate-900 sm:mb-4">
            {t('title')}
          </h2>
          <p className="text-lead mx-auto max-w-3xl text-slate-600">
            {t('subtitle')}
          </p>
        </Reveal>

        <Stagger className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = icons[feature.icon as keyof typeof icons];
            return (
              <StaggerItem key={index}>
                <PremiumCard className="p-5 sm:p-8">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-primary-100 bg-primary-50 transition-colors duration-300 group-hover:border-primary-500 group-hover:bg-primary-500 sm:mb-6 sm:h-14 sm:w-14">
                    <Icon className="h-6 w-6 text-primary-500 transition-colors duration-300 group-hover:text-white sm:h-7 sm:w-7" />
                  </div>
                  <h3 className="heading-card mb-2 text-slate-900 sm:mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-600 sm:text-base">{feature.description}</p>
                </PremiumCard>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
