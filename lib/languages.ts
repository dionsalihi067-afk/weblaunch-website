export type SiteLanguage = {
  /** Internal locale used in routing (unchanged) */
  code: string;
  /** Display code shown in the selector */
  displayCode: string;
  /** Language name shown in the selector */
  name: string;
};

/** Uniform selector label: "EN — English" */
export function getLanguageLabel(lang: SiteLanguage): string {
  return `${lang.displayCode} — ${lang.name}`;
}

/**
 * Site language switcher options.
 * Display format is identical for every language: CODE — Name.
 * Routing still uses `code` (English = `en`).
 */
export const SITE_LANGUAGES: SiteLanguage[] = [
  { code: 'al', displayCode: 'AL', name: 'Shqip' },
  { code: 'en', displayCode: 'EN', name: 'English' },
  { code: 'de', displayCode: 'DE', name: 'Deutsch' },
  { code: 'fr', displayCode: 'FR', name: 'Français' },
  { code: 'it', displayCode: 'IT', name: 'Italiano' },
  { code: 'tr', displayCode: 'TR', name: 'Türkçe' },
  { code: 'es', displayCode: 'ES', name: 'Español' },
];
