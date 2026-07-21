import { ServiceIdealClient } from '@/lib/services/types';
import { Building2, TrendingUp, Briefcase } from 'lucide-react';

interface IdealClientsProps {
  clients: ServiceIdealClient[];
  heading?: string;
}

export default function IdealClients({ clients, heading }: IdealClientsProps) {
  const icons = [Building2, TrendingUp, Briefcase];

  return (
    <section className="section-pad bg-slate-50/80">
      <div className="container-custom">
        <div className="mb-10 text-center md:mb-14">
          <h2 className="heading-section mb-3 text-slate-900 sm:mb-4">{heading}</h2>
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3 md:gap-8">
          {clients.map((client, index) => {
            const Icon = icons[index] || Building2;

            return (
              <div key={index} className="surface-card surface-card-hover p-5 text-center sm:p-8">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary-100 bg-primary-50 sm:h-16 sm:w-16">
                  <Icon className="h-7 w-7 text-primary-600 sm:h-8 sm:w-8" />
                </div>
                <h3 className="heading-card mb-2 text-slate-900 sm:mb-3">{client.type}</h3>
                <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
                  {client.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
