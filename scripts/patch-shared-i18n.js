/**
 * Patch contact.form translations for smart shared-fields UX.
 * Run: node scripts/patch-shared-i18n.js
 */
const fs = require('fs');
const path = require('path');

const sharedByLocale = {
  en: {
    title: 'Shared Project Information',
    subtitle:
      'These details apply to multiple selected services. You only need to provide them once.',
    businessDescription: 'Business description',
    websiteUrl: 'Website URL',
    websiteUrlPlaceholder: 'https://example.com',
    logo: 'Business logo',
    photos: 'Business photos',
    videos: 'Business videos',
    brandGuide: 'Brand guide',
  },
  al: {
    title: 'Informacione të Përbashkëta të Projektit',
    subtitle:
      'Këto detaje vlejnë për disa shërbime të zgjedhura. Mjafton t’i jepni një herë.',
    businessDescription: 'Përshkrimi i biznesit',
    websiteUrl: 'URL e faqes',
    websiteUrlPlaceholder: 'https://example.com',
    logo: 'Logoja e biznesit',
    photos: 'Foto të biznesit',
    videos: 'Video të biznesit',
    brandGuide: 'Udhëzuesi i markës',
  },
  de: {
    title: 'Gemeinsame Projektinformationen',
    subtitle:
      'Diese Angaben gelten für mehrere ausgewählte Services. Sie müssen sie nur einmal machen.',
    businessDescription: 'Unternehmensbeschreibung',
    websiteUrl: 'Website-URL',
    websiteUrlPlaceholder: 'https://example.com',
    logo: 'Firmenlogo',
    photos: 'Geschäftsfotos',
    videos: 'Geschäftsvideos',
    brandGuide: 'Brand Guide',
  },
  fr: {
    title: 'Informations partagées du projet',
    subtitle:
      'Ces informations s’appliquent à plusieurs services sélectionnés. Fournissez-les une seule fois.',
    businessDescription: 'Description de l’entreprise',
    websiteUrl: 'URL du site',
    websiteUrlPlaceholder: 'https://example.com',
    logo: 'Logo de l’entreprise',
    photos: 'Photos de l’entreprise',
    videos: 'Vidéos de l’entreprise',
    brandGuide: 'Guide de marque',
  },
  it: {
    title: 'Informazioni condivise del progetto',
    subtitle:
      'Questi dettagli valgono per più servizi selezionati. Forniscili una sola volta.',
    businessDescription: 'Descrizione dell’attività',
    websiteUrl: 'URL del sito',
    websiteUrlPlaceholder: 'https://example.com',
    logo: 'Logo aziendale',
    photos: 'Foto aziendali',
    videos: 'Video aziendali',
    brandGuide: 'Brand guide',
  },
  tr: {
    title: 'Paylaşılan Proje Bilgileri',
    subtitle:
      'Bu bilgiler seçilen birden fazla hizmet için geçerlidir. Yalnızca bir kez girmeniz yeterlidir.',
    businessDescription: 'İşletme açıklaması',
    websiteUrl: 'Web sitesi URL',
    websiteUrlPlaceholder: 'https://example.com',
    logo: 'İşletme logosu',
    photos: 'İşletme fotoğrafları',
    videos: 'İşletme videoları',
    brandGuide: 'Marka rehberi',
  },
  es: {
    title: 'Información compartida del proyecto',
    subtitle:
      'Estos datos aplican a varios servicios seleccionados. Solo necesitas proporcionarlos una vez.',
    businessDescription: 'Descripción del negocio',
    websiteUrl: 'URL del sitio',
    websiteUrlPlaceholder: 'https://example.com',
    logo: 'Logo del negocio',
    photos: 'Fotos del negocio',
    videos: 'Videos del negocio',
    brandGuide: 'Guía de marca',
  },
};

const step1 = {
  en: {
    title: 'Business & Contact Information',
    subtitle: 'Tell us about your business. These details are used across all selected services.',
    fullName: 'Contact Person',
  },
  al: {
    title: 'Informacione Biznesi & Kontakti',
    subtitle: 'Na tregoni për biznesin tuaj. Këto detaje përdoren për të gjitha shërbimet e zgjedhura.',
    fullName: 'Personi Kontaktues',
  },
  de: {
    title: 'Geschäfts- & Kontaktinformationen',
    subtitle: 'Erzählen Sie uns von Ihrem Unternehmen. Diese Angaben gelten für alle ausgewählten Services.',
    fullName: 'Kontaktperson',
  },
  fr: {
    title: 'Informations entreprise & contact',
    subtitle: 'Parlez-nous de votre entreprise. Ces informations sont utilisées pour tous les services sélectionnés.',
    fullName: 'Personne de contact',
  },
  it: {
    title: 'Informazioni business e contatto',
    subtitle: 'Raccontaci della tua attività. Questi dettagli valgono per tutti i servizi selezionati.',
    fullName: 'Persona di contatto',
  },
  tr: {
    title: 'İşletme ve İletişim Bilgileri',
    subtitle: 'İşletmenizi tanıtın. Bu bilgiler seçilen tüm hizmetlerde kullanılır.',
    fullName: 'İletişim Kişisi',
  },
  es: {
    title: 'Información del negocio y contacto',
    subtitle: 'Cuéntanos sobre tu negocio. Estos datos se usan en todos los servicios seleccionados.',
    fullName: 'Persona de contacto',
  },
};

const extraKeys = {
  en: {
    'website-development': {
      websiteUrl: 'Existing website URL (if any)',
      websiteUrlPlaceholder: 'https://example.com',
      brandGuide: 'Brand guide',
    },
    branding: { brandGuide: 'Brand guide', logo: 'Upload existing logo assets (optional)' },
    'google-business': {
      sections: { profile: 'Business Profile', credentials: 'Google Business Access' },
    },
    'social-setup': {
      sections: { setup: 'Setup Details', credentials: 'Account Access' },
      brandGuide: 'Brand guide',
    },
    'social-management': {
      sections: { plan: 'Content Plan', assets: 'Media Assets', credentials: 'Account Access' },
      brandGuide: 'Brand guide',
    },
    ads: {
      sections: { campaign: 'Campaign Details', credentials: 'Business Manager Access', creatives: 'Creative Assets' },
    },
  },
  al: {
    'website-development': {
      websiteUrl: 'URL e faqes ekzistuese (nëse ka)',
      websiteUrlPlaceholder: 'https://example.com',
      brandGuide: 'Udhëzuesi i markës',
    },
    branding: { brandGuide: 'Udhëzuesi i markës', logo: 'Ngarkoni asetet ekzistuese të logos (opsionale)' },
    'google-business': {
      sections: { profile: 'Profili i Biznesit', credentials: 'Aksesi në Google Business' },
    },
    'social-setup': {
      sections: { setup: 'Detajet e Konfigurimit', credentials: 'Aksesi i Llogarive' },
      brandGuide: 'Udhëzuesi i markës',
    },
    'social-management': {
      sections: { plan: 'Plani i Përmbajtjes', assets: 'Asetet Mediale', credentials: 'Aksesi i Llogarive' },
      brandGuide: 'Udhëzuesi i markës',
    },
    ads: {
      sections: { campaign: 'Detajet e Fushatës', credentials: 'Aksesi i Business Manager', creatives: 'Asetet Kreative' },
    },
  },
  de: {
    'website-development': {
      websiteUrl: 'Bestehende Website-URL (falls vorhanden)',
      websiteUrlPlaceholder: 'https://example.com',
      brandGuide: 'Brand Guide',
    },
    branding: { brandGuide: 'Brand Guide', logo: 'Vorhandene Logo-Dateien hochladen (optional)' },
    'google-business': {
      sections: { profile: 'Geschäftsprofil', credentials: 'Google Business Zugang' },
    },
    'social-setup': {
      sections: { setup: 'Setup-Details', credentials: 'Kontozugang' },
      brandGuide: 'Brand Guide',
    },
    'social-management': {
      sections: { plan: 'Content-Plan', assets: 'Medien-Assets', credentials: 'Kontozugang' },
      brandGuide: 'Brand Guide',
    },
    ads: {
      sections: { campaign: 'Kampagnendetails', credentials: 'Business Manager Zugang', creatives: 'Creative Assets' },
    },
  },
  fr: {
    'website-development': {
      websiteUrl: 'URL du site existant (si applicable)',
      websiteUrlPlaceholder: 'https://example.com',
      brandGuide: 'Guide de marque',
    },
    branding: { brandGuide: 'Guide de marque', logo: 'Téléverser des assets logo existants (optionnel)' },
    'google-business': {
      sections: { profile: 'Profil entreprise', credentials: 'Accès Google Business' },
    },
    'social-setup': {
      sections: { setup: 'Détails de configuration', credentials: 'Accès aux comptes' },
      brandGuide: 'Guide de marque',
    },
    'social-management': {
      sections: { plan: 'Plan de contenu', assets: 'Médias', credentials: 'Accès aux comptes' },
      brandGuide: 'Guide de marque',
    },
    ads: {
      sections: { campaign: 'Détails de campagne', credentials: 'Accès Business Manager', creatives: 'Assets créatifs' },
    },
  },
  it: {
    'website-development': {
      websiteUrl: 'URL del sito esistente (se presente)',
      websiteUrlPlaceholder: 'https://example.com',
      brandGuide: 'Brand guide',
    },
    branding: { brandGuide: 'Brand guide', logo: 'Carica asset logo esistenti (opzionale)' },
    'google-business': {
      sections: { profile: 'Profilo aziendale', credentials: 'Accesso Google Business' },
    },
    'social-setup': {
      sections: { setup: 'Dettagli setup', credentials: 'Accesso account' },
      brandGuide: 'Brand guide',
    },
    'social-management': {
      sections: { plan: 'Piano contenuti', assets: 'Asset media', credentials: 'Accesso account' },
      brandGuide: 'Brand guide',
    },
    ads: {
      sections: { campaign: 'Dettagli campagna', credentials: 'Accesso Business Manager', creatives: 'Asset creativi' },
    },
  },
  tr: {
    'website-development': {
      websiteUrl: 'Mevcut web sitesi URL (varsa)',
      websiteUrlPlaceholder: 'https://example.com',
      brandGuide: 'Marka rehberi',
    },
    branding: { brandGuide: 'Marka rehberi', logo: 'Mevcut logo varlıklarını yükleyin (isteğe bağlı)' },
    'google-business': {
      sections: { profile: 'İşletme Profili', credentials: 'Google Business Erişimi' },
    },
    'social-setup': {
      sections: { setup: 'Kurulum Detayları', credentials: 'Hesap Erişimi' },
      brandGuide: 'Marka rehberi',
    },
    'social-management': {
      sections: { plan: 'İçerik Planı', assets: 'Medya Varlıkları', credentials: 'Hesap Erişimi' },
      brandGuide: 'Marka rehberi',
    },
    ads: {
      sections: { campaign: 'Kampanya Detayları', credentials: 'Business Manager Erişimi', creatives: 'Kreatif Varlıklar' },
    },
  },
  es: {
    'website-development': {
      websiteUrl: 'URL del sitio existente (si aplica)',
      websiteUrlPlaceholder: 'https://example.com',
      brandGuide: 'Guía de marca',
    },
    branding: { brandGuide: 'Guía de marca', logo: 'Subir assets de logo existentes (opcional)' },
    'google-business': {
      sections: { profile: 'Perfil del negocio', credentials: 'Acceso a Google Business' },
    },
    'social-setup': {
      sections: { setup: 'Detalles de configuración', credentials: 'Acceso a cuentas' },
      brandGuide: 'Guía de marca',
    },
    'social-management': {
      sections: { plan: 'Plan de contenido', assets: 'Assets multimedia', credentials: 'Acceso a cuentas' },
      brandGuide: 'Guía de marca',
    },
    ads: {
      sections: { campaign: 'Detalles de campaña', credentials: 'Acceso a Business Manager', creatives: 'Assets creativos' },
    },
  },
};

function deepMerge(target, source) {
  for (const [k, v] of Object.entries(source)) {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      if (!target[k] || typeof target[k] !== 'object') target[k] = {};
      deepMerge(target[k], v);
    } else {
      target[k] = v;
    }
  }
  return target;
}

for (const locale of Object.keys(sharedByLocale)) {
  const filePath = path.join(__dirname, '..', 'messages', `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  data.contact.form.shared = sharedByLocale[locale];
  Object.assign(data.contact.form.steps['1'], step1[locale]);
  deepMerge(data.contact.form.questionnaire, extraKeys[locale]);
  // Remove obsolete personal fields from questionnaires if still present as only keys — leave unused keys harmless
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log('Patched', locale);
}
console.log('Done');
