/**
 * Patch contact form optional URL labels + urlInvalid validation
 * across all locale message files.
 */
const fs = require('fs');
const path = require('path');

const locales = {
  en: {
    urlInvalid: 'Please enter a valid website URL',
    websiteDevUrl: 'Existing website URL (Optional)',
    reference: 'Reference website (Optional)',
    seoUrl: 'Website URL (Optional)',
    maintenanceUrl: 'Website URL (Optional)',
    sharedUrl: 'Website URL (Optional)',
  },
  al: {
    urlInvalid: 'Ju lutemi vendosni një URL të vlefshme të faqes',
    websiteDevUrl: 'URL e faqes ekzistuese (Opsionale)',
    reference: 'Faqe referuese (Opsionale)',
    seoUrl: 'URL e faqes (Opsionale)',
    maintenanceUrl: 'URL e faqes (Opsionale)',
    sharedUrl: 'URL e faqes (Opsionale)',
  },
  de: {
    urlInvalid: 'Bitte geben Sie eine gültige Website-URL ein',
    websiteDevUrl: 'Bestehende Website-URL (Optional)',
    reference: 'Referenz-Website (Optional)',
    seoUrl: 'Website-URL (Optional)',
    maintenanceUrl: 'Website-URL (Optional)',
    sharedUrl: 'Website-URL (Optional)',
  },
  fr: {
    urlInvalid: 'Veuillez entrer une URL de site web valide',
    websiteDevUrl: 'URL du site existant (Facultatif)',
    reference: 'Site web de référence (Facultatif)',
    seoUrl: 'URL du site (Facultatif)',
    maintenanceUrl: 'URL du site (Facultatif)',
    sharedUrl: 'URL du site (Facultatif)',
  },
  it: {
    urlInvalid: 'Inserisci un URL del sito web valido',
    websiteDevUrl: 'URL del sito esistente (Facoltativo)',
    reference: 'Sito web di riferimento (Facoltativo)',
    seoUrl: 'URL del sito (Facoltativo)',
    maintenanceUrl: 'URL del sito (Facoltativo)',
    sharedUrl: 'URL del sito (Facoltativo)',
  },
  tr: {
    urlInvalid: 'Lütfen geçerli bir web sitesi URL’si girin',
    websiteDevUrl: 'Mevcut web sitesi URL’si (İsteğe bağlı)',
    reference: 'Referans web sitesi (İsteğe bağlı)',
    seoUrl: 'Web sitesi URL’si (İsteğe bağlı)',
    maintenanceUrl: 'Web sitesi URL’si (İsteğe bağlı)',
    sharedUrl: 'Web sitesi URL’si (İsteğe bağlı)',
  },
  es: {
    urlInvalid: 'Introduce una URL de sitio web válida',
    websiteDevUrl: 'URL del sitio existente (Opcional)',
    reference: 'Sitio web de referencia (Opcional)',
    seoUrl: 'URL del sitio (Opcional)',
    maintenanceUrl: 'URL del sitio (Opcional)',
    sharedUrl: 'URL del sitio (Opcional)',
  },
};

const dir = path.join(__dirname, '..', 'messages');

for (const [locale, copy] of Object.entries(locales)) {
  const file = path.join(dir, `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const form = data.contact.form;

  form.validation.urlInvalid = copy.urlInvalid;

  const q = form.questionnaire;
  if (q['website-development']) {
    q['website-development'].websiteUrl = copy.websiteDevUrl;
    q['website-development'].reference = copy.reference;
  }
  if (q.seo) {
    q.seo.websiteUrl = copy.seoUrl;
  }
  if (q.maintenance) {
    q.maintenance.websiteUrl = copy.maintenanceUrl;
  }
  if (form.shared) {
    form.shared.websiteUrl = copy.sharedUrl;
  }

  // Ensure preferred language label for english stays "English" / localized equivalent without GB
  if (form.languages && locale === 'en') {
    form.languages.english = 'English';
  }

  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log('Patched', locale);
}

console.log('Done');
