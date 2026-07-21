'use client';

import { Shield, Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function PrivacyNotice() {
  const t = useTranslations('contact.form.privacy');

  return (
    <div className="mt-8 mb-2 rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-slate-50 p-5">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-11 h-11 rounded-full bg-emerald-100 flex items-center justify-center">
          <Shield className="w-5 h-5 text-emerald-700" aria-hidden />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-4 h-4 text-emerald-700" aria-hidden />
            <h3 className="text-sm font-semibold text-emerald-900 tracking-wide uppercase">
              {t('title')}
            </h3>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">{t('message')}</p>
        </div>
      </div>
    </div>
  );
}
