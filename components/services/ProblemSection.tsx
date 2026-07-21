import { ServiceProblemData } from '@/lib/services/types';
import { AlertCircle } from 'lucide-react';

interface ProblemSectionProps {
  translations: ServiceProblemData;
}

export default function ProblemSection({ translations }: ProblemSectionProps) {
  return (
    <section className="section-pad bg-slate-50/80">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center sm:mb-12">
            <h2 className="heading-section mb-3 text-slate-900 sm:mb-4">
              {translations.title}
            </h2>
            <p className="text-lead text-slate-600">{translations.description}</p>
          </div>

          <div className="surface-card p-5 sm:p-8 md:p-10">
            <div className="space-y-4 sm:space-y-5">
              {translations.painPoints.map((point, index) => (
                <div key={index} className="flex items-start space-x-3 sm:space-x-4">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-rose-100 bg-rose-50 sm:h-9 sm:w-9">
                    <AlertCircle className="h-4 w-4 text-rose-500 sm:h-5 sm:w-5" />
                  </div>
                  <p className="pt-0.5 text-sm leading-relaxed text-slate-700 sm:pt-1 sm:text-base md:text-lg">
                    {point}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
