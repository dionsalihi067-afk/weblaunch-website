'use client';

import { MessageCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function WhatsAppButton() {
  const t = useTranslations('whatsapp');
  const phoneNumber = '+38345949507';
  const message = t('prefill');
  const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-50 sm:bottom-6 sm:right-6"
      aria-label={t('ariaLabel')}
    >
      <div className="relative">
        <div
          className="absolute inset-0 animate-pulse-soft rounded-full bg-emerald-400/40 motion-reduce:animate-none"
          aria-hidden
        />
        <div className="relative rounded-full bg-emerald-500 p-3.5 text-white shadow-premium transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-glow hover:bg-emerald-600 sm:p-4">
          <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
      </div>
    </a>
  );
}
