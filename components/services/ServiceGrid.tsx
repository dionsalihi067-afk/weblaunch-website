'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import {
  Globe, Palette, Search, MapPin, Share2, MessageSquare,
  Target, Mail, FileText, Settings, Rocket, ArrowRight,
} from 'lucide-react';
import { Stagger, StaggerItem } from '@/components/motion/Stagger';
import PremiumCard from '@/components/ui/PremiumCard';

const iconMap = {
  globe: Globe,
  palette: Palette,
  search: Search,
  mapPin: MapPin,
  share2: Share2,
  messageSquare: MessageSquare,
  target: Target,
  mail: Mail,
  fileText: FileText,
  settings: Settings,
  rocket: Rocket,
};

export default function ServiceGrid() {
  const t = useTranslations('home.services');
  const locale = useLocale();

  const services = [
    { icon: 'globe', slug: 'website-development', color: 'from-primary-500 to-sky-500' },
    { icon: 'palette', slug: 'branding', color: 'from-slate-700 to-slate-500' },
    { icon: 'search', slug: 'seo', color: 'from-emerald-500 to-teal-500' },
    { icon: 'mapPin', slug: 'google-business', color: 'from-orange-500 to-amber-500' },
    { icon: 'share2', slug: 'social-setup', color: 'from-sky-500 to-primary-500' },
    { icon: 'messageSquare', slug: 'social-management', color: 'from-rose-500 to-orange-400' },
    { icon: 'target', slug: 'ads', color: 'from-amber-500 to-orange-500' },
    { icon: 'mail', slug: 'email', color: 'from-cyan-500 to-primary-500' },
    { icon: 'fileText', slug: 'lead-forms', color: 'from-teal-500 to-emerald-500' },
    { icon: 'settings', slug: 'maintenance', color: 'from-slate-500 to-slate-700' },
    { icon: 'rocket', slug: 'landing-pages', color: 'from-primary-600 to-sky-400' },
  ];

  return (
    <section className="section-pad bg-gradient-to-b from-white via-slate-50/60 to-white">
      <div className="container-custom">
        <Stagger className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
          {services.map((service) => {
            const Icon = iconMap[service.icon as keyof typeof iconMap];
            return (
              <StaggerItem key={service.slug}>
                <Link href={`/${locale}/services/${service.slug}`} className="block h-full">
                  <PremiumCard className="overflow-hidden p-5 sm:p-8">
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 transition-opacity duration-300 group-hover:opacity-[0.06]`}
                      aria-hidden
                    />
                    <div
                      className={`relative z-[1] mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br shadow-soft transition-transform duration-300 group-hover:scale-110 group-hover:shadow-glow sm:mb-6 sm:h-16 sm:w-16 ${service.color}`}
                    >
                      <Icon className="h-7 w-7 text-white sm:h-8 sm:w-8" />
                    </div>
                    <h3 className="heading-card relative mb-3 text-slate-900 transition-colors group-hover:text-primary-600 sm:mb-4 sm:text-2xl sm:font-bold">
                      {t(`items.${service.slug}.title`)}
                    </h3>
                    <p className="relative mb-5 text-sm leading-relaxed text-slate-600 sm:mb-6 sm:text-base">
                      {t(`items.${service.slug}.description`)}
                    </p>
                    <div className="relative flex items-center text-primary-500 font-semibold group-hover:text-primary-600">
                      <span>{t('learnMore')}</span>
                      <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                    </div>
                  </PremiumCard>
                </Link>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
