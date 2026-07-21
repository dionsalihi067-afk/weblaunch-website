import type { Locale } from '@/i18n';
import type { LegalDocument } from './types';
import { privacy as privacyEn } from './en/privacy';
import { terms as termsEn } from './en/terms';
import { privacy as privacyAl } from './al/privacy';
import { terms as termsAl } from './al/terms';
import { privacy as privacyDe } from './de/privacy';
import { terms as termsDe } from './de/terms';
import { privacy as privacyFr } from './fr/privacy';
import { terms as termsFr } from './fr/terms';
import { privacy as privacyIt } from './it/privacy';
import { terms as termsIt } from './it/terms';
import { privacy as privacyTr } from './tr/privacy';
import { terms as termsTr } from './tr/terms';
import { privacy as privacyEs } from './es/privacy';
import { terms as termsEs } from './es/terms';

const privacyByLocale: Record<Locale, LegalDocument> = {
  en: privacyEn,
  al: privacyAl,
  de: privacyDe,
  fr: privacyFr,
  it: privacyIt,
  tr: privacyTr,
  es: privacyEs,
};

const termsByLocale: Record<Locale, LegalDocument> = {
  en: termsEn,
  al: termsAl,
  de: termsDe,
  fr: termsFr,
  it: termsIt,
  tr: termsTr,
  es: termsEs,
};

export function getPrivacyDocument(locale: string): LegalDocument {
  return privacyByLocale[(locale as Locale)] ?? privacyEn;
}

export function getTermsDocument(locale: string): LegalDocument {
  return termsByLocale[(locale as Locale)] ?? termsEn;
}
