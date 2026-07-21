import { ServiceSolutionData } from '@/lib/services/types';
import { CheckCircle2 } from 'lucide-react';

interface SolutionSectionProps {
  translations: ServiceSolutionData;
}

export default function SolutionSection({ translations }: SolutionSectionProps) {
  return (
    <section className="section-pad bg-white">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center sm:mb-12">
            <h2 className="heading-section mb-3 text-slate-900 sm:mb-4">
              {translations.title}
            </h2>
            <p className="text-lead text-slate-600">{translations.description}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3 md:gap-6">
            {translations.differentiators.map((item, index) => (
              <div
                key={index}
                className="surface-card surface-card-hover border-primary-100/80 bg-gradient-to-br from-primary-50/80 to-white p-5 sm:p-6"
              >
                <CheckCircle2 className="mb-3 h-7 w-7 text-primary-500 sm:h-8 sm:w-8" />
                <p className="heading-card text-slate-900">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
