'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Mail, Phone, Instagram } from 'lucide-react';
import { SITE_LANGUAGES, getLanguageLabel } from '@/lib/languages';
import BrandLogo from '@/components/ui/BrandLogo';

export default function Footer() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations('footer');

  const localizedPath = (newLocale: string) => {
    const segments = pathname.split('/');
    if (segments.length > 1 && segments[1]) {
      segments[1] = newLocale;
      return segments.join('/') || `/${newLocale}`;
    }
    return `/${newLocale}`;
  };

  const services = [
    { name: t('services.website'), href: `/${locale}/services/website-development` },
    { name: t('services.branding'), href: `/${locale}/services/branding` },
    { name: t('services.seo'), href: `/${locale}/services/seo` },
    { name: t('services.google'), href: `/${locale}/services/google-business` },
    { name: t('services.social'), href: `/${locale}/services/social-setup` },
    { name: t('services.ads'), href: `/${locale}/services/ads` },
  ];

  const company = [
    { name: t('company.home'), href: `/${locale}` },
    { name: t('company.services'), href: `/${locale}/services` },
    { name: t('company.portfolio'), href: `/${locale}/portfolio` },
    { name: t('company.about'), href: `/${locale}/about` },
    { name: t('company.process'), href: `/${locale}/process` },
    { name: t('company.contact'), href: `/${locale}/contact` },
  ];

  return (
    <footer className="relative overflow-hidden text-white bg-mesh-dark">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent)]"
      />
      <div className="container-custom relative z-10 py-12 sm:py-16">
        <div className="grid grid-cols-1 gap-10 sm:gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <BrandLogo variant="white" className="mb-5" />
            <p className="mb-6 text-sm leading-relaxed text-slate-300">
              {t('description')}
            </p>
            <div className="space-y-3">
              <a
                href="tel:+38345949507"
                className="flex min-h-11 items-center space-x-2 text-sm text-slate-300 transition-colors hover:text-white"
              >
                <Phone className="h-4 w-4 shrink-0" />
                <span>+383 45 949 507</span>
              </a>
              <a
                href="mailto:weblaunchdigital@gmail.com"
                className="flex min-h-11 items-center space-x-2 text-sm text-slate-300 transition-colors hover:text-white"
              >
                <Mail className="h-4 w-4 shrink-0" />
                <span className="break-all">weblaunchdigital@gmail.com</span>
              </a>
              <a
                href="https://instagram.com/getweblaunch"
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-11 items-center space-x-2 text-sm text-slate-300 transition-colors hover:text-white"
              >
                <Instagram className="h-4 w-4 shrink-0" />
                <span>@getweblaunch</span>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-display font-semibold mb-4 tracking-tight">
              {t('titles.company')}
            </h3>
            <ul className="space-y-2.5">
              {company.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-slate-300 hover:text-white transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-display font-semibold mb-4 tracking-tight">
              {t('titles.services')}
            </h3>
            <ul className="space-y-2.5">
              {services.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-slate-300 hover:text-white transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-display font-semibold mb-4 tracking-tight">
              {t('titles.languages')}
            </h3>
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
              {SITE_LANGUAGES.map((lang) => (
                <Link
                  key={lang.code}
                  href={localizedPath(lang.code)}
                  className={`flex min-h-10 items-center justify-center rounded-xl border px-2 py-2 text-center text-xs font-medium transition-colors lg:justify-start lg:px-3 ${
                    locale === lang.code
                      ? 'border-primary-400/60 bg-primary-500/20 text-white'
                      : 'border-white/10 text-slate-300 hover:border-primary-400/50 hover:text-white'
                  }`}
                >
                  {getLanguageLabel(lang)}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 sm:mt-12 sm:pt-8">
          <div className="flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
            <p className="text-sm text-slate-400">
              © {new Date().getFullYear()} WEB LAUNCH. {t('rights')}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              <Link
                href={`/${locale}/privacy-policy`}
                className="py-1 text-sm text-slate-400 transition-colors hover:text-white"
              >
                {t('privacy')}
              </Link>
              <Link
                href={`/${locale}/terms-and-conditions`}
                className="py-1 text-sm text-slate-400 transition-colors hover:text-white"
              >
                {t('terms')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
