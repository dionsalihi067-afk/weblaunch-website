import { ServiceFeatures } from '@/lib/services/types';
import { Check } from 'lucide-react';

interface FeaturesSectionProps {
  features: ServiceFeatures;
  heading?: string;
}

export default function FeaturesSection({ features, heading }: FeaturesSectionProps) {
  const categories = Object.entries(features || {});

  if (categories.length === 0) return null;

  return (
    <section className="section-pad bg-white">
      <div className="container-custom">
        <div className="mb-10 text-center md:mb-14">
          <h2 className="heading-section mb-3 text-slate-900 sm:mb-4">{heading}</h2>
        </div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 md:gap-8">
          {categories.map(([categoryName, items], catIndex) => (
            <div
              key={catIndex}
              className="surface-card border-slate-200/70 bg-slate-50/90 p-5 sm:p-8"
            >
              <h3 className="heading-card mb-4 text-slate-900 sm:mb-6">{categoryName}</h3>
              <ul className="space-y-3">
                {items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start space-x-3">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary-500" />
                    <span className="text-sm text-slate-700 sm:text-base">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
