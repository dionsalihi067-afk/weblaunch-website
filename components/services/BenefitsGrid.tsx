'use client';

import { ServiceBenefit } from '@/lib/services/types';
import { getBenefitIcon } from '@/lib/services/helpers';
import { Stagger, StaggerItem } from '@/components/motion/Stagger';
import PremiumCard from '@/components/ui/PremiumCard';

interface BenefitsGridProps {
  benefits: ServiceBenefit[];
  heading?: string;
}

export default function BenefitsGrid({ benefits, heading }: BenefitsGridProps) {
  return (
    <section className="section-pad bg-slate-50/80">
      <div className="container-custom">
        <div className="mb-10 text-center md:mb-14">
          <h2 className="heading-section mb-3 text-slate-900 sm:mb-4">{heading}</h2>
        </div>

        <Stagger className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
          {benefits.map((benefit, index) => {
            const Icon = getBenefitIcon(benefit.icon);

            return (
              <StaggerItem key={index}>
                <PremiumCard className="p-5 sm:p-8">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-primary-100 bg-primary-50 transition-colors group-hover:border-primary-500 group-hover:bg-primary-500">
                    <Icon className="h-6 w-6 text-primary-600 transition-colors group-hover:text-white" />
                  </div>
                  <h3 className="heading-card mb-2 text-slate-900 sm:mb-3">{benefit.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
                    {benefit.description}
                  </p>
                </PremiumCard>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
