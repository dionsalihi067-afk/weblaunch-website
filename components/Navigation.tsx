'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Menu, X, ChevronDown, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SITE_LANGUAGES, getLanguageLabel } from '@/lib/languages';
import BrandLogo from '@/components/ui/BrandLogo';

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('navigation');

  const currentLanguage =
    SITE_LANGUAGES.find((lang) => lang.code === locale) || SITE_LANGUAGES[1];

  const navigation = [
    { name: t('home'), href: `/${locale}` },
    { name: t('services'), href: `/${locale}/services` },
    { name: t('portfolio'), href: `/${locale}/portfolio` },
    { name: t('about'), href: `/${locale}/about` },
    { name: t('process'), href: `/${locale}/process` },
    { name: t('contact'), href: `/${locale}/contact` },
  ];

  const switchLanguage = (newLocale: string) => {
    const segments = pathname.split('/');
    // pathname is like /en/services/... — replace locale segment
    if (segments.length > 1 && segments[1]) {
      segments[1] = newLocale;
      window.location.href = segments.join('/') || `/${newLocale}`;
      return;
    }
    window.location.href = `/${newLocale}`;
  };

  const isActive = (href: string) => {
    if (href === `/${locale}`) {
      return pathname === href || pathname === `/${locale}/`;
    }
    return pathname.startsWith(href);
  };

  const languageOptionClass = (code: string) =>
    `w-full flex items-center px-4 py-2 text-left text-sm font-medium transition-colors hover:bg-slate-50 ${
      locale === code ? 'bg-primary-50 text-primary-600' : 'text-gray-700'
    }`;

  return (
    <nav className="fixed w-full top-0 z-50 border-b border-slate-200/60 bg-white/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
      <div className="container-custom">
        <div className="flex h-16 items-center justify-between sm:h-20">
          <Link
            href={`/${locale}`}
            className="flex shrink-0 items-center bg-transparent transition-opacity hover:opacity-90"
            aria-label="WEB LAUNCH"
          >
            <BrandLogo variant="color" priority />
          </Link>

          <div className="hidden lg:flex items-center space-x-1">
            {navigation.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? 'text-primary-600'
                      : 'text-slate-600 hover:text-primary-500'
                  }`}
                >
                  {item.name}
                  {active ? (
                    <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-primary-500" />
                  ) : null}
                </Link>
              );
            })}

            <div className="relative ml-2">
              <button
                onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
                className="flex items-center space-x-2 px-3 py-2 rounded-xl border border-slate-200/90 bg-white/60 hover:border-primary-300 transition-colors"
                aria-label={getLanguageLabel(currentLanguage)}
              >
                <Globe className="w-4 h-4 shrink-0 text-slate-500" />
                <span className="text-sm font-medium text-slate-700">
                  {getLanguageLabel(currentLanguage)}
                </span>
                <ChevronDown className="w-4 h-4 shrink-0 text-slate-400" />
              </button>

              <AnimatePresence>
                {languageMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-52 rounded-2xl border border-slate-200/80 bg-white/95 py-2 shadow-premium backdrop-blur-xl"
                  >
                    {SITE_LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          switchLanguage(lang.code);
                          setLanguageMenuOpen(false);
                        }}
                        className={languageOptionClass(lang.code)}
                      >
                        {getLanguageLabel(lang)}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              href={`/${locale}/contact`}
              className="ml-3 btn-premium-primary !px-5 !py-2.5 text-sm shadow-md"
            >
              {t('getStarted')}
            </Link>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="touch-target lg:hidden -mr-1 inline-flex items-center justify-center rounded-xl p-2.5 transition-colors hover:bg-slate-100"
            aria-label={mobileMenuOpen ? t('closeMenu') : t('openMenu')}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="max-h-[min(80vh,40rem)] space-y-1 overflow-y-auto overscroll-contain py-3 lg:hidden"
            >
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block rounded-xl px-4 py-3 text-[0.95rem] transition-colors ${
                    isActive(item.href)
                      ? 'bg-primary-50 font-medium text-primary-600'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              <div className="px-4 py-3">
                <div className="mb-2 text-sm font-medium text-slate-500">
                  {t('selectLanguage')}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {SITE_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        switchLanguage(lang.code);
                        setMobileMenuOpen(false);
                      }}
                      className={`flex min-h-11 items-center justify-center rounded-xl border px-2 py-2.5 text-center text-sm font-medium transition-colors ${
                        locale === lang.code
                          ? 'border-primary-500 bg-primary-50 text-primary-600'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {getLanguageLabel(lang)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="px-4 pb-2 pt-1">
                <Link
                  href={`/${locale}/contact`}
                  className="btn-premium-primary w-full text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('getStarted')}
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
