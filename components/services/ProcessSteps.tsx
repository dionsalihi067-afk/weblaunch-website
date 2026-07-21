'use client';

import { ServiceProcessStep } from '@/lib/services/types';
import { ArrowRight } from 'lucide-react';
import Reveal from '@/components/motion/Reveal';

interface ProcessStepsProps {
  steps: ServiceProcessStep[];
  heading?: string;
}

export default function ProcessSteps({ steps, heading }: ProcessStepsProps) {
  return (
    <section className="section-pad bg-white">
      <div className="container-custom">
        <div className="mb-10 text-center md:mb-14">
          <h2 className="heading-section mb-3 text-slate-900 sm:mb-4">{heading}</h2>
        </div>

        <div className="mx-auto max-w-4xl space-y-3 sm:space-y-4">
          {steps.map((step, index) => (
            <Reveal key={index} delay={index * 0.05}>
              <div className="surface-card flex items-start space-x-3 p-4 sm:space-x-4 sm:p-6 md:p-7">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-primary-500 font-display text-base font-bold text-white shadow-soft sm:h-12 sm:w-12 sm:text-lg">
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="heading-card mb-1.5 text-slate-900 sm:mb-2">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
                    {step.description}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className="mt-3 hidden h-6 w-6 flex-shrink-0 text-slate-300 sm:block" />
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
