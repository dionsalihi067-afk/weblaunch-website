import { ServiceCTAData } from '@/lib/services/types';
import Link from 'next/link';

interface ServiceCTAProps {
  translations: ServiceCTAData;
  locale: string;
}

export default function ServiceCTA({ translations, locale }: ServiceCTAProps) {
  return (
    <section className="section-pad bg-white">
      <div className="container-custom">
        <div className="relative overflow-hidden rounded-2xl bg-mesh-dark p-6 text-center text-white shadow-premium sm:rounded-3xl sm:p-10 md:p-14">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:40px_40px]"
          />
          <div className="relative z-10">
            <h2 className="heading-section mb-3 sm:mb-4">{translations.title}</h2>
            <p className="text-lead mx-auto mb-6 max-w-2xl text-slate-200/90 sm:mb-8">
              {translations.subtitle}
            </p>
            <div className="mx-auto flex w-full max-w-md flex-col justify-center gap-3 sm:max-w-none sm:flex-row sm:gap-4">
              <Link
                href={`/${locale}/contact`}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-primary-600 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-50 sm:w-auto sm:px-8 sm:py-4 sm:text-base"
              >
                {translations.primary}
              </Link>
              <Link
                href={`/${locale}/portfolio`}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-white/25 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/15 sm:w-auto sm:px-8 sm:py-4 sm:text-base"
              >
                {translations.secondary}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
