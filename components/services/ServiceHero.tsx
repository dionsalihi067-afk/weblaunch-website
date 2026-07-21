import Link from 'next/link';
import {
  Code,
  Palette,
  TrendingUp,
  MapPin,
  Share2,
  Users,
  Megaphone,
  Mail,
  FileText,
  Settings,
  Layout,
  type LucideIcon,
} from 'lucide-react';
import { ServiceConfig, ServiceHeroData } from '@/lib/services/types';

/**
 * Service-id → Lucide icon. Lookups by config.id only (never by icon name strings).
 */
const serviceIcons = {
  'website-development': Code,
  branding: Palette,
  seo: TrendingUp,
  'google-business': MapPin,
  'social-setup': Share2,
  'social-management': Users,
  ads: Megaphone,
  email: Mail,
  'lead-forms': FileText,
  maintenance: Settings,
  'landing-pages': Layout,
} as const satisfies Record<string, LucideIcon>;

interface ServiceHeroProps {
  config: ServiceConfig;
  translations: ServiceHeroData;
  locale: string;
}

export default function ServiceHero({ config, translations, locale }: ServiceHeroProps) {
  const Icon = serviceIcons[config.id as keyof typeof serviceIcons];

  if (!Icon) {
    throw new Error(`Missing icon mapping for ${config.id}`);
  }

  return (
    <section
      className={`page-hero relative overflow-hidden bg-gradient-to-br text-white ${config.color}`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-30" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.25),transparent_55%)]" />
        <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      </div>

      <div className="container-custom relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          {/* Frosted glass without backdrop-blur — blur washed white strokes invisible */}
          <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-white/25 bg-white/15 shadow-glow sm:mb-7 sm:h-20 sm:w-20">
            <Icon
              size={40}
              color="#ffffff"
              strokeWidth={2}
              className="h-8 w-8 shrink-0 sm:h-10 sm:w-10"
              aria-hidden
            />
          </div>

          <h1 className="heading-page mb-4 sm:mb-6">{translations.title}</h1>

          <p className="text-lead mb-8 text-white/90 sm:mb-10">{translations.subtitle}</p>

          <Link
            href={`/${locale}/contact`}
            className="inline-flex min-h-11 w-full max-w-sm items-center justify-center rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-slate-900 shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-50 sm:w-auto sm:max-w-none sm:px-8 sm:py-4 sm:text-base"
          >
            {translations.cta}
          </Link>
        </div>
      </div>
    </section>
  );
}
