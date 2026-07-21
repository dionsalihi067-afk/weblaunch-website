const fs = require('fs');
const path = require('path');

const enQ = {
  subtitle: 'Please answer the following questions',
  common: { yes: 'Yes', no: 'No', uploadButton: 'Click to upload files', removeFile: 'Remove file' },
  'website-development': {
    sections: { businessInfo: 'Business Information', business: 'Business & Goals', design: 'Design', files: 'Files' },
    businessName: 'Business Name', contactPerson: 'Contact Person', email: 'Email', phone: 'Phone Number',
    describe: 'Describe your business', products: 'Services or products', goal: 'Main website goal',
    goalOther: 'Describe the additional goal', pages: 'Website pages', pagesOther: 'Describe the additional page(s)',
    style: 'Website style', reference: 'Reference website', referencePlaceholder: 'https://example.com',
    logo: 'Upload Logo', photos: 'Upload Photos',
    options: {
      goals: { 'lead-generation': 'Lead Generation', information: 'Information', bookings: 'Bookings', 'online-store': 'Online Store', portfolio: 'Portfolio', other: 'Other' },
      pages: { home: 'Home', about: 'About', services: 'Services', products: 'Products', gallery: 'Gallery', blog: 'Blog', faq: 'FAQ', contact: 'Contact', portfolio: 'Portfolio', other: 'Other' }
    }
  },
  branding: {
    businessName: 'Business Name', industry: 'Industry', describe: 'Business description',
    logoLook: 'Describe your ideal logo', colors: 'Preferred colors', references: 'Logo references',
    referencesPlaceholder: 'Paste URLs or describe logos you like...'
  },
  seo: {
    websiteUrl: 'Website URL', mainServices: 'Main services', cities: 'Target cities',
    keywords: 'Target keywords', keywordsPlaceholder: 'e.g. web design Kosovo, digital marketing Pristina', competitors: 'Competitors'
  },
  'google-business': {
    exists: 'Google Business Profile exists?', businessName: 'Business Name', address: 'Business Address',
    phone: 'Business Phone', hours: 'Business Hours', hoursPlaceholder: 'e.g. Mon–Fri 09:00–17:00',
    category: 'Business Category', categoryPlaceholder: 'e.g. Restaurant, Dentist, Hotel',
    loginEmail: 'Google Business Login Email', loginPassword: 'Google Business Password',
    credentialsNotice: 'Credentials are only used for configuration and are treated as strictly confidential.'
  },
  'social-setup': {
    platforms: 'Platforms', describe: 'Business Description',
    facebookLogin: 'Facebook Username or Email', facebookPassword: 'Facebook Password',
    instagramUsername: 'Instagram Username', instagramPassword: 'Instagram Password',
    tiktokUsername: 'TikTok Username', tiktokPassword: 'TikTok Password',
    linkedinUsername: 'LinkedIn Username', linkedinPassword: 'LinkedIn Password', logo: 'Upload Logo',
    credentialsNotice: 'Credentials are only used for configuration and are treated as strictly confidential.',
    options: { platforms: { facebook: 'Facebook', instagram: 'Instagram', tiktok: 'TikTok', linkedin: 'LinkedIn', youtube: 'YouTube' } }
  },
  'social-management': {
    objective: 'Objective', platforms: 'Platforms', postsPerMonth: 'Posts per month', postsPlaceholder: 'e.g. 20',
    logo: 'Upload Logo', photos: 'Upload Photos', videos: 'Upload Videos',
    facebookLogin: 'Facebook Login', instagramLogin: 'Instagram Login',
    options: {
      objectives: { 'brand-awareness': 'Brand Awareness', 'lead-generation': 'Lead Generation', sales: 'Sales', 'follower-growth': 'Followers Growth' },
      platforms: { facebook: 'Facebook', instagram: 'Instagram', tiktok: 'TikTok', linkedin: 'LinkedIn', youtube: 'YouTube' }
    }
  },
  ads: {
    objective: 'Campaign Objective', budget: 'Monthly Budget', targetArea: 'Target Cities', targetPlaceholder: 'e.g. Pristina, Kosovo',
    offer: 'Offer', bmEmail: 'Facebook Business Manager Email', bmPassword: 'Facebook Business Manager Password',
    adAccountId: 'Meta Ad Account ID', images: 'Upload Images', videos: 'Upload Videos',
    credentialsNotice: 'Credentials are only used for configuration and are treated as strictly confidential.',
    options: { objectives: { 'lead-generation': 'Lead Generation', traffic: 'Traffic', sales: 'Sales', messages: 'Messages' } }
  },
  email: { domain: 'Domain', howMany: 'Number of email accounts', names: 'Desired email names', namesPlaceholder: 'e.g. info, contact, support, john' },
  'lead-forms': {
    purpose: 'Purpose', fields: 'Required fields', fieldsOther: 'Describe the additional field(s)', emailDestination: 'Destination Email',
    options: { fields: { name: 'Name', surname: 'Surname', phone: 'Phone', email: 'Email', company: 'Company', message: 'Message', 'file-upload': 'File Upload', other: 'Other' } }
  },
  maintenance: {
    websiteUrl: 'Website URL', problem: 'Current problems', tasks: 'Requested work', tasksOther: 'Describe the additional work',
    options: { tasks: { updates: 'Updates', backups: 'Backups', content: 'Content Changes', security: 'Security', performance: 'Performance', other: 'Other' } }
  },
  'landing-pages': {
    product: 'Product or Service', goal: 'Goal', offer: 'Offer', action: 'Visitor action', actionOther: 'Describe the additional action',
    images: 'Upload Images', videos: 'Upload Videos',
    options: {
      goals: { 'lead-generation': 'Lead Generation', sales: 'Sales', bookings: 'Booking', event: 'Event' },
      actions: { 'submit-form': 'Submit Form', call: 'Call', whatsapp: 'WhatsApp', purchase: 'Purchase', other: 'Other' }
    }
  }
};

function deepTranslate(obj, map) {
  if (typeof obj === 'string') return map[obj] || obj;
  if (Array.isArray(obj)) return obj.map((v) => deepTranslate(v, map));
  if (obj && typeof obj === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(obj)) out[k] = deepTranslate(v, map);
    return out;
  }
  return obj;
}

// Phrase maps for each locale (English phrase → translation)
const maps = {
  al: {
    'Please answer the following questions': 'Ju lutemi përgjigjuni pyetjeve të mëposhtme',
    Yes: 'Po', No: 'Jo', 'Click to upload files': 'Klikoni për të ngarkuar skedarë', 'Remove file': 'Hiq skedarin',
    'Business Information': 'Informacione të Biznesit', 'Business & Goals': 'Biznesi & Qëllimet', Design: 'Dizajni', Files: 'Skedarët',
    'Business Name': 'Emri i Biznesit', 'Contact Person': 'Personi Kontaktues', Email: 'Email', 'Phone Number': 'Numri i Telefonit',
    'Describe your business': 'Përshkruani biznesin tuaj', 'Services or products': 'Shërbimet ose produktet',
    'Main website goal': 'Qëllimi kryesor i faqes', 'Describe the additional goal': 'Përshkruani qëllimin shtesë',
    'Website pages': 'Faqet e website-it', 'Describe the additional page(s)': 'Përshkruani faqet shtesë',
    'Website style': 'Stili i website-it', 'Reference website': 'Website referencë', 'Upload Logo': 'Ngarkoni Logon', 'Upload Photos': 'Ngarkoni Fotot',
    'Lead Generation': 'Gjenerimi i Klientëve', Information: 'Informacion', Bookings: 'Rezervime', 'Online Store': 'Dyqan Online', Portfolio: 'Portofol', Other: 'Tjetër',
    Home: 'Ballina', About: 'Rreth Nesh', Services: 'Shërbimet', Products: 'Produktet', Gallery: 'Galeria', Blog: 'Blogu', FAQ: 'FAQ', Contact: 'Kontakti',
    Industry: 'Industria', 'Business description': 'Përshkrimi i biznesit', 'Describe your ideal logo': 'Përshkruani logon ideale',
    'Preferred colors': 'Ngjyrat e preferuara', 'Logo references': 'Referenca të logos',
    'Paste URLs or describe logos you like...': 'Ngjitni URL ose përshkruani logo që ju pëlqejnë...',
    'Website URL': 'URL e Faqes', 'Main services': 'Shërbimet kryesore', 'Target cities': 'Qytetet e synuara',
    'Target keywords': 'Fjalët kyçe', 'e.g. web design Kosovo, digital marketing Pristina': 'p.sh. dizajn uebi Kosovë, marketing digjital Prishtinë', Competitors: 'Konkurrentët',
    'Google Business Profile exists?': 'A ekziston profili Google Business?', 'Business Address': 'Adresa e Biznesit', 'Business Phone': 'Telefoni i Biznesit',
    'Business Hours': 'Orari i Punës', 'e.g. Mon–Fri 09:00–17:00': 'p.sh. Hën–Pre 09:00–17:00', 'Business Category': 'Kategoria e Biznesit',
    'e.g. Restaurant, Dentist, Hotel': 'p.sh. Restorant, Dentist, Hotel',
    'Google Business Login Email': 'Emaili i hyrjes në Google Business', 'Google Business Password': 'Fjalëkalimi i Google Business',
    'Credentials are only used for configuration and are treated as strictly confidential.': 'Kredencialet përdoren vetëm për konfigurim dhe trajtohen si rreptësisht konfidenciale.',
    Platforms: 'Platformat', 'Business Description': 'Përshkrimi i Biznesit',
    'Facebook Username or Email': 'Përdoruesi ose Email i Facebook', 'Facebook Password': 'Fjalëkalimi i Facebook',
    'Instagram Username': 'Përdoruesi i Instagram', 'Instagram Password': 'Fjalëkalimi i Instagram',
    'TikTok Username': 'Përdoruesi i TikTok', 'TikTok Password': 'Fjalëkalimi i TikTok',
    'LinkedIn Username': 'Përdoruesi i LinkedIn', 'LinkedIn Password': 'Fjalëkalimi i LinkedIn',
    Objective: 'Objektivi', 'Posts per month': 'Postime në muaj', 'e.g. 20': 'p.sh. 20',
    'Upload Videos': 'Ngarkoni Video', 'Facebook Login': 'Hyrja në Facebook', 'Instagram Login': 'Hyrja në Instagram',
    'Brand Awareness': 'Njohja e Markës', Sales: 'Shitjet', 'Followers Growth': 'Rritja e Ndjekësve',
    'Campaign Objective': 'Objektivi i Fushatës', 'Monthly Budget': 'Buxheti Mujor', 'Target Cities': 'Qytetet e Synuara',
    'e.g. Pristina, Kosovo': 'p.sh. Prishtinë, Kosovë', Offer: 'Oferta',
    'Facebook Business Manager Email': 'Email i Facebook Business Manager', 'Facebook Business Manager Password': 'Fjalëkalimi i Facebook Business Manager',
    'Meta Ad Account ID': 'ID e Llogarisë Meta Ads', 'Upload Images': 'Ngarkoni Imazhe', Traffic: 'Trafik', Messages: 'Mesazhe',
    Domain: 'Domeni', 'Number of email accounts': 'Numri i llogarive email', 'Desired email names': 'Emrat e dëshiruar të emailit',
    'e.g. info, contact, support, john': 'p.sh. info, kontakt, support, agron',
    Purpose: 'Qëllimi', 'Required fields': 'Fushat e kërkuara', 'Describe the additional field(s)': 'Përshkruani fushat shtesë',
    'Destination Email': 'Emaili destinacion', Name: 'Emri', Surname: 'Mbiemri', Phone: 'Telefoni', Company: 'Kompania', Message: 'Mesazhi', 'File Upload': 'Ngarkimi i Skedarit',
    'Current problems': 'Problemet aktuale', 'Requested work': 'Puna e kërkuar', 'Describe the additional work': 'Përshkruani punën shtesë',
    Updates: 'Përditësime', Backups: 'Kopje rezervë', 'Content Changes': 'Ndryshime përmbajtjeje', Security: 'Siguria', Performance: 'Performanca',
    'Product or Service': 'Produkti ose Shërbimi', Goal: 'Qëllimi', 'Visitor action': 'Veprimi i vizitorit',
    'Describe the additional action': 'Përshkruani veprimin shtesë', Booking: 'Rezervim', Event: 'Ngjarje',
    'Submit Form': 'Dërgo Formularin', Call: 'Telefono', Purchase: 'Bli',
  },
};

// For de, fr, it, tr, es — substantial maps
maps.de = {
  'Please answer the following questions': 'Bitte beantworten Sie die folgenden Fragen',
  Yes: 'Ja', No: 'Nein', 'Click to upload files': 'Zum Hochladen klicken', 'Remove file': 'Datei entfernen',
  'Business Information': 'Geschäftsinformationen', 'Business & Goals': 'Geschäft & Ziele', Design: 'Design', Files: 'Dateien',
  'Business Name': 'Firmenname', 'Contact Person': 'Kontaktperson', Email: 'E-Mail', 'Phone Number': 'Telefonnummer',
  'Describe your business': 'Beschreiben Sie Ihr Unternehmen', 'Services or products': 'Dienstleistungen oder Produkte',
  'Main website goal': 'Hauptziel der Website', 'Describe the additional goal': 'Beschreiben Sie das zusätzliche Ziel',
  'Website pages': 'Website-Seiten', 'Describe the additional page(s)': 'Beschreiben Sie die zusätzlichen Seiten',
  'Website style': 'Website-Stil', 'Reference website': 'Referenz-Website', 'Upload Logo': 'Logo hochladen', 'Upload Photos': 'Fotos hochladen',
  'Lead Generation': 'Lead-Generierung', Information: 'Information', Bookings: 'Buchungen', 'Online Store': 'Online-Shop', Portfolio: 'Portfolio', Other: 'Andere',
  Home: 'Startseite', About: 'Über uns', Services: 'Dienstleistungen', Products: 'Produkte', Gallery: 'Galerie', Blog: 'Blog', FAQ: 'FAQ', Contact: 'Kontakt',
  Industry: 'Branche', 'Business description': 'Unternehmensbeschreibung', 'Describe your ideal logo': 'Beschreiben Sie Ihr ideales Logo',
  'Preferred colors': 'Bevorzugte Farben', 'Logo references': 'Logo-Referenzen',
  'Paste URLs or describe logos you like...': 'URLs einfügen oder Logos beschreiben...',
  'Website URL': 'Website-URL', 'Main services': 'Hauptdienstleistungen', 'Target cities': 'Zielstädte',
  'Target keywords': 'Ziel-Keywords', 'e.g. web design Kosovo, digital marketing Pristina': 'z. B. Webdesign Kosovo, Digital Marketing Pristina', Competitors: 'Wettbewerber',
  'Google Business Profile exists?': 'Existiert das Google Business-Profil bereits?', 'Business Address': 'Geschäftsadresse', 'Business Phone': 'Geschäftstelefon',
  'Business Hours': 'Öffnungszeiten', 'e.g. Mon–Fri 09:00–17:00': 'z. B. Mo–Fr 09:00–17:00', 'Business Category': 'Geschäftskategorie',
  'e.g. Restaurant, Dentist, Hotel': 'z. B. Restaurant, Zahnarzt, Hotel',
  'Google Business Login Email': 'Google Business Login-E-Mail', 'Google Business Password': 'Google Business Passwort',
  'Credentials are only used for configuration and are treated as strictly confidential.': 'Zugangsdaten werden ausschließlich zur Konfiguration verwendet und streng vertraulich behandelt.',
  Platforms: 'Plattformen', 'Business Description': 'Unternehmensbeschreibung',
  'Facebook Username or Email': 'Facebook-Benutzername oder E-Mail', 'Facebook Password': 'Facebook-Passwort',
  'Instagram Username': 'Instagram-Benutzername', 'Instagram Password': 'Instagram-Passwort',
  'TikTok Username': 'TikTok-Benutzername', 'TikTok Password': 'TikTok-Passwort',
  'LinkedIn Username': 'LinkedIn-Benutzername', 'LinkedIn Password': 'LinkedIn-Passwort',
  Objective: 'Ziel', 'Posts per month': 'Beiträge pro Monat', 'e.g. 20': 'z. B. 20',
  'Upload Videos': 'Videos hochladen', 'Facebook Login': 'Facebook-Login', 'Instagram Login': 'Instagram-Login',
  'Brand Awareness': 'Markenbekanntheit', Sales: 'Verkäufe', 'Followers Growth': 'Follower-Wachstum',
  'Campaign Objective': 'Kampagnenziel', 'Monthly Budget': 'Monatliches Budget', 'Target Cities': 'Zielstädte',
  'e.g. Pristina, Kosovo': 'z. B. Pristina, Kosovo', Offer: 'Angebot',
  'Facebook Business Manager Email': 'Facebook Business Manager E-Mail', 'Facebook Business Manager Password': 'Facebook Business Manager Passwort',
  'Meta Ad Account ID': 'Meta Werbekonto-ID', 'Upload Images': 'Bilder hochladen', Traffic: 'Traffic', Messages: 'Nachrichten',
  Domain: 'Domain', 'Number of email accounts': 'Anzahl der E-Mail-Konten', 'Desired email names': 'Gewünschte E-Mail-Namen',
  'e.g. info, contact, support, john': 'z. B. info, kontakt, support, max',
  Purpose: 'Zweck', 'Required fields': 'Erforderliche Felder', 'Describe the additional field(s)': 'Beschreiben Sie die zusätzlichen Felder',
  'Destination Email': 'Ziel-E-Mail', Name: 'Name', Surname: 'Nachname', Phone: 'Telefon', Company: 'Unternehmen', Message: 'Nachricht', 'File Upload': 'Datei-Upload',
  'Current problems': 'Aktuelle Probleme', 'Requested work': 'Gewünschte Arbeiten', 'Describe the additional work': 'Beschreiben Sie die zusätzliche Arbeit',
  Updates: 'Updates', Backups: 'Backups', 'Content Changes': 'Inhaltsänderungen', Security: 'Sicherheit', Performance: 'Leistung',
  'Product or Service': 'Produkt oder Dienstleistung', Goal: 'Ziel', 'Visitor action': 'Besucheraktion',
  'Describe the additional action': 'Beschreiben Sie die zusätzliche Aktion', Booking: 'Buchung', Event: 'Event',
  'Submit Form': 'Formular absenden', Call: 'Anrufen', Purchase: 'Kaufen',
};

maps.fr = {
  'Please answer the following questions': 'Veuillez répondre aux questions suivantes',
  Yes: 'Oui', No: 'Non', 'Click to upload files': 'Cliquez pour téléverser des fichiers', 'Remove file': 'Supprimer le fichier',
  'Business Information': 'Informations commerciales', 'Business & Goals': 'Entreprise & Objectifs', Design: 'Design', Files: 'Fichiers',
  'Business Name': "Nom de l'entreprise", 'Contact Person': 'Personne de contact', Email: 'E-mail', 'Phone Number': 'Numéro de téléphone',
  'Describe your business': 'Décrivez votre entreprise', 'Services or products': 'Services ou produits',
  'Main website goal': 'Objectif principal du site', 'Describe the additional goal': "Décrivez l'objectif supplémentaire",
  'Website pages': 'Pages du site', 'Describe the additional page(s)': 'Décrivez la/les page(s) supplémentaire(s)',
  'Website style': 'Style du site', 'Reference website': 'Site de référence', 'Upload Logo': 'Téléverser le logo', 'Upload Photos': 'Téléverser des photos',
  'Lead Generation': 'Génération de leads', Information: 'Information', Bookings: 'Réservations', 'Online Store': 'Boutique en ligne', Portfolio: 'Portfolio', Other: 'Autre',
  Home: 'Accueil', About: 'À propos', Services: 'Services', Products: 'Produits', Gallery: 'Galerie', Blog: 'Blog', FAQ: 'FAQ', Contact: 'Contact',
  Industry: "Secteur d'activité", 'Business description': "Description de l'entreprise", 'Describe your ideal logo': 'Décrivez votre logo idéal',
  'Preferred colors': 'Couleurs préférées', 'Logo references': 'Références de logo',
  'Paste URLs or describe logos you like...': 'Collez des URLs ou décrivez des logos que vous aimez...',
  'Website URL': 'URL du site', 'Main services': 'Services principaux', 'Target cities': 'Villes cibles',
  'Target keywords': 'Mots-clés cibles', 'e.g. web design Kosovo, digital marketing Pristina': 'ex. conception web Kosovo, marketing digital Pristina', Competitors: 'Concurrents',
  'Google Business Profile exists?': 'Le profil Google Business existe-t-il déjà ?', 'Business Address': "Adresse de l'entreprise", 'Business Phone': "Téléphone de l'entreprise",
  'Business Hours': "Horaires d'ouverture", 'e.g. Mon–Fri 09:00–17:00': 'ex. Lun–Ven 09:00–17:00', 'Business Category': "Catégorie d'entreprise",
  'e.g. Restaurant, Dentist, Hotel': 'ex. Restaurant, Dentiste, Hôtel',
  'Google Business Login Email': 'E-mail de connexion Google Business', 'Google Business Password': 'Mot de passe Google Business',
  'Credentials are only used for configuration and are treated as strictly confidential.': 'Les identifiants sont uniquement utilisés pour la configuration et sont traités de manière strictement confidentielle.',
  Platforms: 'Plateformes', 'Business Description': "Description de l'entreprise",
  'Facebook Username or Email': "Nom d'utilisateur ou e-mail Facebook", 'Facebook Password': 'Mot de passe Facebook',
  'Instagram Username': "Nom d'utilisateur Instagram", 'Instagram Password': 'Mot de passe Instagram',
  'TikTok Username': "Nom d'utilisateur TikTok", 'TikTok Password': 'Mot de passe TikTok',
  'LinkedIn Username': "Nom d'utilisateur LinkedIn", 'LinkedIn Password': 'Mot de passe LinkedIn',
  Objective: 'Objectif', 'Posts per month': 'Publications par mois', 'e.g. 20': 'ex. 20',
  'Upload Videos': 'Téléverser des vidéos', 'Facebook Login': 'Connexion Facebook', 'Instagram Login': 'Connexion Instagram',
  'Brand Awareness': 'Notoriété de la marque', Sales: 'Ventes', 'Followers Growth': 'Croissance des abonnés',
  'Campaign Objective': 'Objectif de campagne', 'Monthly Budget': 'Budget mensuel', 'Target Cities': 'Villes cibles',
  'e.g. Pristina, Kosovo': 'ex. Pristina, Kosovo', Offer: 'Offre',
  'Facebook Business Manager Email': 'E-mail Facebook Business Manager', 'Facebook Business Manager Password': 'Mot de passe Facebook Business Manager',
  'Meta Ad Account ID': 'ID du compte publicitaire Meta', 'Upload Images': 'Téléverser des images', Traffic: 'Trafic', Messages: 'Messages',
  Domain: 'Domaine', 'Number of email accounts': "Nombre de comptes e-mail", 'Desired email names': "Noms d'e-mail souhaités",
  'e.g. info, contact, support, john': 'ex. info, contact, support, jean',
  Purpose: 'Objectif', 'Required fields': 'Champs requis', 'Describe the additional field(s)': 'Décrivez le(s) champ(s) supplémentaire(s)',
  'Destination Email': 'E-mail de destination', Name: 'Prénom', Surname: 'Nom', Phone: 'Téléphone', Company: 'Entreprise', Message: 'Message', 'File Upload': 'Téléversement de fichier',
  'Current problems': 'Problèmes actuels', 'Requested work': 'Travaux demandés', 'Describe the additional work': 'Décrivez le travail supplémentaire',
  Updates: 'Mises à jour', Backups: 'Sauvegardes', 'Content Changes': 'Modifications de contenu', Security: 'Sécurité', Performance: 'Performance',
  'Product or Service': 'Produit ou service', Goal: 'Objectif', 'Visitor action': 'Action du visiteur',
  'Describe the additional action': "Décrivez l'action supplémentaire", Booking: 'Réservation', Event: 'Événement',
  'Submit Form': 'Soumettre le formulaire', Call: 'Appeler', Purchase: 'Acheter',
};

maps.it = {
  'Please answer the following questions': 'Rispondi alle seguenti domande',
  Yes: 'Sì', No: 'No', 'Click to upload files': 'Clicca per caricare i file', 'Remove file': 'Rimuovi file',
  'Business Information': 'Informazioni aziendali', 'Business & Goals': 'Business e obiettivi', Design: 'Design', Files: 'File',
  'Business Name': "Nome dell'azienda", 'Contact Person': 'Persona di contatto', Email: 'E-mail', 'Phone Number': 'Numero di telefono',
  'Describe your business': 'Descrivi la tua attività', 'Services or products': 'Servizi o prodotti',
  'Main website goal': "Obiettivo principale del sito", 'Describe the additional goal': "Descrivi l'obiettivo aggiuntivo",
  'Website pages': 'Pagine del sito', 'Describe the additional page(s)': 'Descrivi la/le pagina/e aggiuntiva/e',
  'Website style': 'Stile del sito', 'Reference website': 'Sito di riferimento', 'Upload Logo': 'Carica logo', 'Upload Photos': 'Carica foto',
  'Lead Generation': 'Generazione lead', Information: 'Informazione', Bookings: 'Prenotazioni', 'Online Store': 'Negozio online', Portfolio: 'Portfolio', Other: 'Altro',
  Home: 'Home', About: 'Chi siamo', Services: 'Servizi', Products: 'Prodotti', Gallery: 'Galleria', Blog: 'Blog', FAQ: 'FAQ', Contact: 'Contatti',
  Industry: 'Settore', 'Business description': "Descrizione dell'attività", 'Describe your ideal logo': 'Descrivi il logo ideale',
  'Preferred colors': 'Colori preferiti', 'Logo references': 'Riferimenti logo',
  'Paste URLs or describe logos you like...': 'Incolla URL o descrivi loghi che ti piacciono...',
  'Website URL': 'URL del sito', 'Main services': 'Servizi principali', 'Target cities': 'Città target',
  'Target keywords': 'Parole chiave target', 'e.g. web design Kosovo, digital marketing Pristina': 'es. web design Kosovo, digital marketing Pristina', Competitors: 'Competitor',
  'Google Business Profile exists?': 'Il profilo Google Business esiste già?', 'Business Address': 'Indirizzo aziendale', 'Business Phone': 'Telefono aziendale',
  'Business Hours': 'Orari di apertura', 'e.g. Mon–Fri 09:00–17:00': 'es. Lun–Ven 09:00–17:00', 'Business Category': 'Categoria aziendale',
  'e.g. Restaurant, Dentist, Hotel': 'es. Ristorante, Dentista, Hotel',
  'Google Business Login Email': 'Email di accesso Google Business', 'Google Business Password': 'Password Google Business',
  'Credentials are only used for configuration and are treated as strictly confidential.': 'Le credenziali sono utilizzate solo per la configurazione e trattate come strettamente riservate.',
  Platforms: 'Piattaforme', 'Business Description': "Descrizione dell'attività",
  'Facebook Username or Email': 'Username o email Facebook', 'Facebook Password': 'Password Facebook',
  'Instagram Username': 'Username Instagram', 'Instagram Password': 'Password Instagram',
  'TikTok Username': 'Username TikTok', 'TikTok Password': 'Password TikTok',
  'LinkedIn Username': 'Username LinkedIn', 'LinkedIn Password': 'Password LinkedIn',
  Objective: 'Obiettivo', 'Posts per month': 'Post al mese', 'e.g. 20': 'es. 20',
  'Upload Videos': 'Carica video', 'Facebook Login': 'Accesso Facebook', 'Instagram Login': 'Accesso Instagram',
  'Brand Awareness': 'Brand awareness', Sales: 'Vendite', 'Followers Growth': 'Crescita follower',
  'Campaign Objective': 'Obiettivo campagna', 'Monthly Budget': 'Budget mensile', 'Target Cities': 'Città target',
  'e.g. Pristina, Kosovo': 'es. Pristina, Kosovo', Offer: 'Offerta',
  'Facebook Business Manager Email': 'Email Facebook Business Manager', 'Facebook Business Manager Password': 'Password Facebook Business Manager',
  'Meta Ad Account ID': 'ID account pubblicitario Meta', 'Upload Images': 'Carica immagini', Traffic: 'Traffico', Messages: 'Messaggi',
  Domain: 'Dominio', 'Number of email accounts': 'Numero di account email', 'Desired email names': 'Nomi email desiderati',
  'e.g. info, contact, support, john': 'es. info, contatto, supporto, mario',
  Purpose: 'Scopo', 'Required fields': 'Campi richiesti', 'Describe the additional field(s)': 'Descrivi i campi aggiuntivi',
  'Destination Email': 'Email di destinazione', Name: 'Nome', Surname: 'Cognome', Phone: 'Telefono', Company: 'Azienda', Message: 'Messaggio', 'File Upload': 'Caricamento file',
  'Current problems': 'Problemi attuali', 'Requested work': 'Lavoro richiesto', 'Describe the additional work': 'Descrivi il lavoro aggiuntivo',
  Updates: 'Aggiornamenti', Backups: 'Backup', 'Content Changes': 'Modifiche contenuti', Security: 'Sicurezza', Performance: 'Performance',
  'Product or Service': 'Prodotto o servizio', Goal: 'Obiettivo', 'Visitor action': 'Azione del visitatore',
  'Describe the additional action': "Descrivi l'azione aggiuntiva", Booking: 'Prenotazione', Event: 'Evento',
  'Submit Form': 'Invia modulo', Call: 'Chiama', Purchase: 'Acquista',
};

maps.tr = {
  'Please answer the following questions': 'Lütfen aşağıdaki soruları yanıtlayın',
  Yes: 'Evet', No: 'Hayır', 'Click to upload files': 'Dosya yüklemek için tıklayın', 'Remove file': 'Dosyayı kaldır',
  'Business Information': 'İşletme Bilgileri', 'Business & Goals': 'İşletme ve Hedefler', Design: 'Tasarım', Files: 'Dosyalar',
  'Business Name': 'İşletme Adı', 'Contact Person': 'İletişim Kişisi', Email: 'E-posta', 'Phone Number': 'Telefon Numarası',
  'Describe your business': 'İşletmenizi tanımlayın', 'Services or products': 'Hizmetler veya ürünler',
  'Main website goal': 'Ana web sitesi hedefi', 'Describe the additional goal': 'Ek hedefi açıklayın',
  'Website pages': 'Web sitesi sayfaları', 'Describe the additional page(s)': 'Ek sayfaları açıklayın',
  'Website style': 'Web sitesi stili', 'Reference website': 'Referans web sitesi', 'Upload Logo': 'Logo Yükle', 'Upload Photos': 'Fotoğraf Yükle',
  'Lead Generation': 'Potansiyel Müşteri', Information: 'Bilgilendirme', Bookings: 'Rezervasyon', 'Online Store': 'Online Mağaza', Portfolio: 'Portföy', Other: 'Diğer',
  Home: 'Ana Sayfa', About: 'Hakkımızda', Services: 'Hizmetler', Products: 'Ürünler', Gallery: 'Galeri', Blog: 'Blog', FAQ: 'SSS', Contact: 'İletişim',
  Industry: 'Sektör', 'Business description': 'İşletme açıklaması', 'Describe your ideal logo': 'İdeal logonuzu tanımlayın',
  'Preferred colors': 'Tercih edilen renkler', 'Logo references': 'Logo referansları',
  'Paste URLs or describe logos you like...': 'URL yapıştırın veya beğendiğiniz logoları açıklayın...',
  'Website URL': 'Web sitesi URL', 'Main services': 'Ana hizmetler', 'Target cities': 'Hedef şehirler',
  'Target keywords': 'Hedef anahtar kelimeler', 'e.g. web design Kosovo, digital marketing Pristina': 'örn. web tasarım Kosova, dijital pazarlama Priştine', Competitors: 'Rakipler',
  'Google Business Profile exists?': 'Google Business profili mevcut mu?', 'Business Address': 'İşletme Adresi', 'Business Phone': 'İşletme Telefonu',
  'Business Hours': 'Çalışma Saatleri', 'e.g. Mon–Fri 09:00–17:00': 'örn. Pzt–Cum 09:00–17:00', 'Business Category': 'İşletme Kategorisi',
  'e.g. Restaurant, Dentist, Hotel': 'örn. Restoran, Diş Hekimi, Otel',
  'Google Business Login Email': 'Google Business Giriş E-postası', 'Google Business Password': 'Google Business Şifresi',
  'Credentials are only used for configuration and are treated as strictly confidential.': 'Kimlik bilgileri yalnızca yapılandırma için kullanılır ve kesinlikle gizli tutulur.',
  Platforms: 'Platformlar', 'Business Description': 'İşletme Açıklaması',
  'Facebook Username or Email': 'Facebook Kullanıcı Adı veya E-posta', 'Facebook Password': 'Facebook Şifresi',
  'Instagram Username': 'Instagram Kullanıcı Adı', 'Instagram Password': 'Instagram Şifresi',
  'TikTok Username': 'TikTok Kullanıcı Adı', 'TikTok Password': 'TikTok Şifresi',
  'LinkedIn Username': 'LinkedIn Kullanıcı Adı', 'LinkedIn Password': 'LinkedIn Şifresi',
  Objective: 'Hedef', 'Posts per month': 'Aylık gönderi sayısı', 'e.g. 20': 'örn. 20',
  'Upload Videos': 'Video Yükle', 'Facebook Login': 'Facebook Girişi', 'Instagram Login': 'Instagram Girişi',
  'Brand Awareness': 'Marka Bilinirliği', Sales: 'Satış', 'Followers Growth': 'Takipçi Büyümesi',
  'Campaign Objective': 'Kampanya Hedefi', 'Monthly Budget': 'Aylık Bütçe', 'Target Cities': 'Hedef Şehirler',
  'e.g. Pristina, Kosovo': 'örn. Priştine, Kosova', Offer: 'Teklif',
  'Facebook Business Manager Email': 'Facebook Business Manager E-postası', 'Facebook Business Manager Password': 'Facebook Business Manager Şifresi',
  'Meta Ad Account ID': 'Meta Reklam Hesabı ID', 'Upload Images': 'Görsel Yükle', Traffic: 'Trafik', Messages: 'Mesajlar',
  Domain: 'Domain', 'Number of email accounts': 'E-posta hesabı sayısı', 'Desired email names': 'İstenen e-posta adları',
  'e.g. info, contact, support, john': 'örn. info, iletisim, destek, ahmet',
  Purpose: 'Amaç', 'Required fields': 'Gerekli alanlar', 'Describe the additional field(s)': 'Ek alanları açıklayın',
  'Destination Email': 'Hedef E-posta', Name: 'Ad', Surname: 'Soyad', Phone: 'Telefon', Company: 'Şirket', Message: 'Mesaj', 'File Upload': 'Dosya Yükleme',
  'Current problems': 'Mevcut sorunlar', 'Requested work': 'Talep edilen işler', 'Describe the additional work': 'Ek işi açıklayın',
  Updates: 'Güncellemeler', Backups: 'Yedeklemeler', 'Content Changes': 'İçerik Değişiklikleri', Security: 'Güvenlik', Performance: 'Performans',
  'Product or Service': 'Ürün veya Hizmet', Goal: 'Hedef', 'Visitor action': 'Ziyaretçi aksiyonu',
  'Describe the additional action': 'Ek aksiyonu açıklayın', Booking: 'Rezervasyon', Event: 'Etkinlik',
  'Submit Form': 'Form Gönder', Call: 'Ara', Purchase: 'Satın Al',
};

maps.es = {
  'Please answer the following questions': 'Por favor responde las siguientes preguntas',
  Yes: 'Sí', No: 'No', 'Click to upload files': 'Haz clic para subir archivos', 'Remove file': 'Eliminar archivo',
  'Business Information': 'Información empresarial', 'Business & Goals': 'Negocio y objetivos', Design: 'Diseño', Files: 'Archivos',
  'Business Name': 'Nombre del negocio', 'Contact Person': 'Persona de contacto', Email: 'Correo electrónico', 'Phone Number': 'Número de teléfono',
  'Describe your business': 'Describe tu negocio', 'Services or products': 'Servicios o productos',
  'Main website goal': 'Objetivo principal del sitio', 'Describe the additional goal': 'Describe el objetivo adicional',
  'Website pages': 'Páginas del sitio', 'Describe the additional page(s)': 'Describe la(s) página(s) adicional(es)',
  'Website style': 'Estilo del sitio', 'Reference website': 'Sitio de referencia', 'Upload Logo': 'Subir logo', 'Upload Photos': 'Subir fotos',
  'Lead Generation': 'Generación de leads', Information: 'Información', Bookings: 'Reservas', 'Online Store': 'Tienda online', Portfolio: 'Portafolio', Other: 'Otro',
  Home: 'Inicio', About: 'Nosotros', Services: 'Servicios', Products: 'Productos', Gallery: 'Galería', Blog: 'Blog', FAQ: 'FAQ', Contact: 'Contacto',
  Industry: 'Sector', 'Business description': 'Descripción del negocio', 'Describe your ideal logo': 'Describe tu logo ideal',
  'Preferred colors': 'Colores preferidos', 'Logo references': 'Referencias de logo',
  'Paste URLs or describe logos you like...': 'Pega URLs o describe logos que te gusten...',
  'Website URL': 'URL del sitio', 'Main services': 'Servicios principales', 'Target cities': 'Ciudades objetivo',
  'Target keywords': 'Palabras clave objetivo', 'e.g. web design Kosovo, digital marketing Pristina': 'ej. diseño web Kosovo, marketing digital Pristina', Competitors: 'Competidores',
  'Google Business Profile exists?': '¿Existe ya el perfil de Google Business?', 'Business Address': 'Dirección del negocio', 'Business Phone': 'Teléfono del negocio',
  'Business Hours': 'Horario de atención', 'e.g. Mon–Fri 09:00–17:00': 'ej. Lun–Vie 09:00–17:00', 'Business Category': 'Categoría del negocio',
  'e.g. Restaurant, Dentist, Hotel': 'ej. Restaurante, Dentista, Hotel',
  'Google Business Login Email': 'Email de acceso a Google Business', 'Google Business Password': 'Contraseña de Google Business',
  'Credentials are only used for configuration and are treated as strictly confidential.': 'Las credenciales solo se usan para la configuración y se tratan de forma estrictamente confidencial.',
  Platforms: 'Plataformas', 'Business Description': 'Descripción del negocio',
  'Facebook Username or Email': 'Usuario o email de Facebook', 'Facebook Password': 'Contraseña de Facebook',
  'Instagram Username': 'Usuario de Instagram', 'Instagram Password': 'Contraseña de Instagram',
  'TikTok Username': 'Usuario de TikTok', 'TikTok Password': 'Contraseña de TikTok',
  'LinkedIn Username': 'Usuario de LinkedIn', 'LinkedIn Password': 'Contraseña de LinkedIn',
  Objective: 'Objetivo', 'Posts per month': 'Publicaciones por mes', 'e.g. 20': 'ej. 20',
  'Upload Videos': 'Subir videos', 'Facebook Login': 'Acceso a Facebook', 'Instagram Login': 'Acceso a Instagram',
  'Brand Awareness': 'Reconocimiento de marca', Sales: 'Ventas', 'Followers Growth': 'Crecimiento de seguidores',
  'Campaign Objective': 'Objetivo de campaña', 'Monthly Budget': 'Presupuesto mensual', 'Target Cities': 'Ciudades objetivo',
  'e.g. Pristina, Kosovo': 'ej. Pristina, Kosovo', Offer: 'Oferta',
  'Facebook Business Manager Email': 'Email de Facebook Business Manager', 'Facebook Business Manager Password': 'Contraseña de Facebook Business Manager',
  'Meta Ad Account ID': 'ID de cuenta publicitaria Meta', 'Upload Images': 'Subir imágenes', Traffic: 'Tráfico', Messages: 'Mensajes',
  Domain: 'Dominio', 'Number of email accounts': 'Número de cuentas de email', 'Desired email names': 'Nombres de email deseados',
  'e.g. info, contact, support, john': 'ej. info, contacto, soporte, juan',
  Purpose: 'Propósito', 'Required fields': 'Campos requeridos', 'Describe the additional field(s)': 'Describe el/los campo(s) adicional(es)',
  'Destination Email': 'Email de destino', Name: 'Nombre', Surname: 'Apellido', Phone: 'Teléfono', Company: 'Empresa', Message: 'Mensaje', 'File Upload': 'Subida de archivo',
  'Current problems': 'Problemas actuales', 'Requested work': 'Trabajo solicitado', 'Describe the additional work': 'Describe el trabajo adicional',
  Updates: 'Actualizaciones', Backups: 'Copias de seguridad', 'Content Changes': 'Cambios de contenido', Security: 'Seguridad', Performance: 'Rendimiento',
  'Product or Service': 'Producto o servicio', Goal: 'Objetivo', 'Visitor action': 'Acción del visitante',
  'Describe the additional action': 'Describe la acción adicional', Booking: 'Reserva', Event: 'Evento',
  'Submit Form': 'Enviar formulario', Call: 'Llamar', Purchase: 'Comprar',
};

const ui = {
  en: {
    steps: {
      1: {
        title: 'Personal Information',
        fullName: 'Contact Person',
        businessName: 'Business Name',
        email: 'Email',
        phone: 'Phone Number',
        country: 'Country',
        preferredLanguage: 'Preferred Language',
        selectLanguage: 'Select your preferred language',
      },
      2: {
        title: 'Select Services',
        subtitle: 'Choose one or multiple services',
      },
    },
    services: {
      'website-development': 'Website Development',
      branding: 'Logo Design & Branding',
      seo: 'SEO Services',
      'google-business': 'Google Business Optimization',
      'social-setup': 'Social Media Setup',
      'social-management': 'Social Media Management',
      ads: 'Facebook & Instagram Ads',
      email: 'Business Email Setup',
      'lead-forms': 'Lead Generation Forms',
      maintenance: 'Website Maintenance',
      'landing-pages': 'Landing Pages',
    },
    languages: {
      albanian: 'Albanian', english: 'English', german: 'German', french: 'French',
      italian: 'Italian', turkish: 'Turkish', spanish: 'Spanish',
    },
    privacy: {
      title: 'Confidentiality & Data Protection',
      message: 'All information you provide is treated as strictly confidential. Your data is securely stored and accessed only by the WEB LAUNCH team for the purpose of delivering the requested services. We never share your information with third parties without your permission.',
    },
    validation: {
      required: 'This field is required',
      emailInvalid: 'Please enter a valid email address',
      phoneInvalid: 'Please enter a valid phone number',
      selectService: 'Please select at least one service',
    },
    step: 'Step', of: 'of', back: 'Back', next: 'Next', submit: 'Submit Project', submitting: 'Submitting...',
    error: 'Something went wrong. Please try again.',
    additionalNotes: 'Additional Notes',
    additionalNotesPlaceholder: 'Anything else we should know?',
    success: {
      title: 'Thank You!',
      message: 'Your project inquiry has been submitted successfully. We will contact you within 24 hours.',
    },
    title: 'Project Discovery Questionnaire',
    subtitle: 'Help us understand your project requirements by answering a few questions. This ensures we can provide you with the best possible solution.',
  },
  al: {
    steps: {
      1: { title: 'Informacione Personale', fullName: 'Personi Kontaktues', businessName: 'Emri i Biznesit', email: 'Email', phone: 'Numri i Telefonit', country: 'Shteti', preferredLanguage: 'Gjuha e Preferuar', selectLanguage: 'Zgjidhni gjuhën tuaj të preferuar' },
      2: { title: 'Zgjidhni Shërbimet', subtitle: 'Zgjidhni një ose disa shërbime' },
    },
    services: { 'website-development': 'Zhvillimi i Faqes së Internetit', branding: 'Dizajni i Logos & Branding', seo: 'Shërbime SEO', 'google-business': 'Optimizimi i Google Business', 'social-setup': 'Konfigurimi i Mediave Sociale', 'social-management': 'Menaxhimi i Mediave Sociale', ads: 'Reklamat Facebook & Instagram', email: 'Konfigurimi i Email Biznesi', 'lead-forms': 'Formularët e Gjenerimit të Klientëve', maintenance: 'Mirëmbajtja e Faqes', 'landing-pages': 'Faqet e Zbritjes' },
    languages: { albanian: 'Shqip', english: 'Anglisht', german: 'Gjermanisht', french: 'Frëngjisht', italian: 'Italisht', turkish: 'Turqisht', spanish: 'Spanjisht' },
    privacy: { title: 'Konfidencialiteti & Mbrojtja e të Dhënave', message: 'Të gjitha informacionet që jepni trajtohen si rreptësisht konfidenciale. Të dhënat tuaja ruhen në mënyrë të sigurt dhe aksesohen vetëm nga ekipi i WEB LAUNCH për qëllimin e ofrimit të shërbimeve të kërkuara. Ne nuk i ndajmë kurrë informacionet tuaja me palë të treta pa lejen tuaj.' },
    validation: { required: 'Kjo fushë është e detyrueshme', emailInvalid: 'Ju lutemi vendosni një email të vlefshëm', phoneInvalid: 'Ju lutemi vendosni një numër telefoni të vlefshëm', selectService: 'Ju lutemi zgjidhni të paktën një shërbim' },
    step: 'Hapi', of: 'nga', back: 'Prapa', next: 'Vazhdo', submit: 'Dërgo Projektin', submitting: 'Duke dërguar...',
    error: 'Diçka shkoi keq. Ju lutemi provoni përsëri.',
    additionalNotes: 'Shënime Shtesë', additionalNotesPlaceholder: 'Ka diçka tjetër që duhet të dimë?',
    success: { title: 'Faleminderit!', message: 'Kërkesa juaj u dërgua me sukses. Do t’ju kontaktojmë brenda 24 orëve.' },
    title: 'Pyetësori i Zbulimit të Projektit',
    subtitle: 'Ndihmoni të kuptojmë kërkesat e projektit tuaj duke iu përgjigjur disa pyetjeve.',
  },
  de: {
    steps: {
      1: { title: 'Persönliche Informationen', fullName: 'Kontaktperson', businessName: 'Firmenname', email: 'E-Mail', phone: 'Telefonnummer', country: 'Land', preferredLanguage: 'Bevorzugte Sprache', selectLanguage: 'Wählen Sie Ihre bevorzugte Sprache' },
      2: { title: 'Services auswählen', subtitle: 'Wählen Sie einen oder mehrere Services' },
    },
    services: { 'website-development': 'Website-Entwicklung', branding: 'Logo-Design & Branding', seo: 'SEO-Services', 'google-business': 'Google Business Optimierung', 'social-setup': 'Social Media Setup', 'social-management': 'Social Media Management', ads: 'Facebook & Instagram Ads', email: 'Business E-Mail Setup', 'lead-forms': 'Lead-Generierungsformulare', maintenance: 'Website-Wartung', 'landing-pages': 'Landing Pages' },
    languages: { albanian: 'Albanisch', english: 'Englisch', german: 'Deutsch', french: 'Französisch', italian: 'Italienisch', turkish: 'Türkisch', spanish: 'Spanisch' },
    privacy: { title: 'Vertraulichkeit & Datenschutz', message: 'Alle von Ihnen angegebenen Informationen werden streng vertraulich behandelt. Ihre Daten werden sicher gespeichert und ausschließlich vom WEB LAUNCH-Team zur Erbringung der angefragten Leistungen verwendet. Wir geben Ihre Informationen niemals ohne Ihre Zustimmung an Dritte weiter.' },
    validation: { required: 'Dieses Feld ist erforderlich', emailInvalid: 'Bitte geben Sie eine gültige E-Mail-Adresse ein', phoneInvalid: 'Bitte geben Sie eine gültige Telefonnummer ein', selectService: 'Bitte wählen Sie mindestens einen Service aus' },
    step: 'Schritt', of: 'von', back: 'Zurück', next: 'Weiter', submit: 'Projekt einreichen', submitting: 'Wird gesendet...',
    error: 'Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.',
    additionalNotes: 'Zusätzliche Hinweise', additionalNotesPlaceholder: 'Gibt es noch etwas, das wir wissen sollten?',
    success: { title: 'Vielen Dank!', message: 'Ihre Projektanfrage wurde erfolgreich übermittelt. Wir melden uns innerhalb von 24 Stunden.' },
    title: 'Projekt-Entdeckungsfragebogen',
    subtitle: 'Helfen Sie uns, Ihre Projektanforderungen zu verstehen, indem Sie einige Fragen beantworten.',
  },
  fr: {
    steps: {
      1: { title: 'Informations personnelles', fullName: 'Personne de contact', businessName: "Nom de l'entreprise", email: 'E-mail', phone: 'Numéro de téléphone', country: 'Pays', preferredLanguage: 'Langue préférée', selectLanguage: 'Sélectionnez votre langue préférée' },
      2: { title: 'Sélectionner les services', subtitle: 'Choisissez un ou plusieurs services' },
    },
    services: { 'website-development': 'Développement de site web', branding: 'Design de logo & Branding', seo: 'Services SEO', 'google-business': 'Optimisation Google Business', 'social-setup': 'Configuration des réseaux sociaux', 'social-management': 'Gestion des réseaux sociaux', ads: 'Publicités Facebook & Instagram', email: "Configuration d'email professionnel", 'lead-forms': 'Formulaires de génération de leads', maintenance: 'Maintenance de site web', 'landing-pages': 'Pages de destination' },
    languages: { albanian: 'Albanais', english: 'Anglais', german: 'Allemand', french: 'Français', italian: 'Italien', turkish: 'Turc', spanish: 'Espagnol' },
    privacy: { title: 'Confidentialité & Protection des données', message: "Toutes les informations que vous fournissez sont traitées de manière strictement confidentielle. Vos données sont stockées de manière sécurisée et accessibles uniquement à l'équipe WEB LAUNCH dans le but de fournir les services demandés. Nous ne partageons jamais vos informations avec des tiers sans votre autorisation." },
    validation: { required: 'Ce champ est obligatoire', emailInvalid: 'Veuillez entrer une adresse e-mail valide', phoneInvalid: 'Veuillez entrer un numéro de téléphone valide', selectService: 'Veuillez sélectionner au moins un service' },
    step: 'Étape', of: 'sur', back: 'Retour', next: 'Suivant', submit: 'Soumettre le projet', submitting: 'Envoi en cours...',
    error: 'Une erreur est survenue. Veuillez réessayer.',
    additionalNotes: 'Notes supplémentaires', additionalNotesPlaceholder: 'Y a-t-il autre chose que nous devrions savoir ?',
    success: { title: 'Merci !', message: 'Votre demande a été envoyée avec succès. Nous vous contacterons sous 24 heures.' },
    title: 'Questionnaire de découverte du projet',
    subtitle: 'Aidez-nous à comprendre les besoins de votre projet en répondant à quelques questions.',
  },
  it: {
    steps: {
      1: { title: 'Informazioni personali', fullName: 'Persona di contatto', businessName: "Nome dell'azienda", email: 'E-mail', phone: 'Numero di telefono', country: 'Paese', preferredLanguage: 'Lingua preferita', selectLanguage: 'Seleziona la lingua preferita' },
      2: { title: 'Seleziona i servizi', subtitle: 'Scegli uno o più servizi' },
    },
    services: { 'website-development': 'Sviluppo siti web', branding: 'Design logo & Branding', seo: 'Servizi SEO', 'google-business': 'Ottimizzazione Google Business', 'social-setup': 'Configurazione social media', 'social-management': 'Gestione social media', ads: 'Pubblicità Facebook & Instagram', email: 'Configurazione email aziendale', 'lead-forms': 'Moduli di generazione lead', maintenance: 'Manutenzione siti web', 'landing-pages': 'Landing page' },
    languages: { albanian: 'Albanese', english: 'Inglese', german: 'Tedesco', french: 'Francese', italian: 'Italiano', turkish: 'Turco', spanish: 'Spagnolo' },
    privacy: { title: 'Riservatezza & Protezione dei dati', message: 'Tutte le informazioni che fornisci sono trattate come strettamente riservate. I tuoi dati sono archiviati in modo sicuro e accessibili solo dal team WEB LAUNCH allo scopo di erogare i servizi richiesti. Non condividiamo mai le tue informazioni con terze parti senza il tuo consenso.' },
    validation: { required: 'Questo campo è obbligatorio', emailInvalid: 'Inserisci un indirizzo email valido', phoneInvalid: 'Inserisci un numero di telefono valido', selectService: 'Seleziona almeno un servizio' },
    step: 'Passo', of: 'di', back: 'Indietro', next: 'Avanti', submit: 'Invia progetto', submitting: 'Invio in corso...',
    error: 'Qualcosa è andato storto. Riprova.',
    additionalNotes: 'Note aggiuntive', additionalNotesPlaceholder: "C'è altro che dovremmo sapere?",
    success: { title: 'Grazie!', message: 'La tua richiesta è stata inviata con successo. Ti contatteremo entro 24 ore.' },
    title: 'Questionario di scoperta del progetto',
    subtitle: 'Aiutaci a capire i requisiti del tuo progetto rispondendo ad alcune domande.',
  },
  tr: {
    steps: {
      1: { title: 'Kişisel Bilgiler', fullName: 'İletişim Kişisi', businessName: 'İşletme Adı', email: 'E-posta', phone: 'Telefon Numarası', country: 'Ülke', preferredLanguage: 'Tercih Edilen Dil', selectLanguage: 'Tercih ettiğiniz dili seçin' },
      2: { title: 'Hizmet Seçin', subtitle: 'Bir veya birden fazla hizmet seçin' },
    },
    services: { 'website-development': 'Web Sitesi Geliştirme', branding: 'Logo Tasarımı & Markalaşma', seo: 'SEO Hizmetleri', 'google-business': 'Google Business Optimizasyonu', 'social-setup': 'Sosyal Medya Kurulumu', 'social-management': 'Sosyal Medya Yönetimi', ads: 'Facebook & Instagram Reklamları', email: 'Kurumsal E-posta Kurulumu', 'lead-forms': 'Potansiyel Müşteri Formları', maintenance: 'Web Sitesi Bakımı', 'landing-pages': 'Açılış Sayfaları' },
    languages: { albanian: 'Arnavutça', english: 'İngilizce', german: 'Almanca', french: 'Fransızca', italian: 'İtalyanca', turkish: 'Türkçe', spanish: 'İspanyolca' },
    privacy: { title: 'Gizlilik & Veri Koruma', message: 'Sağladığınız tüm bilgiler kesinlikle gizli tutulur. Verileriniz güvenli şekilde saklanır ve yalnızca istenen hizmetleri sunmak amacıyla WEB LAUNCH ekibi tarafından erişilir. Bilgilerinizi izniniz olmadan üçüncü taraflarla asla paylaşmayız.' },
    validation: { required: 'Bu alan zorunludur', emailInvalid: 'Lütfen geçerli bir e-posta girin', phoneInvalid: 'Lütfen geçerli bir telefon numarası girin', selectService: 'Lütfen en az bir hizmet seçin' },
    step: 'Adım', of: '/', back: 'Geri', next: 'İleri', submit: 'Projeyi Gönder', submitting: 'Gönderiliyor...',
    error: 'Bir hata oluştu. Lütfen tekrar deneyin.',
    additionalNotes: 'Ek Notlar', additionalNotesPlaceholder: 'Bilmemiz gereken başka bir şey var mı?',
    success: { title: 'Teşekkürler!', message: 'Proje talebiniz başarıyla gönderildi. 24 saat içinde sizinle iletişime geçeceğiz.' },
    title: 'Proje Keşif Anketi',
    subtitle: 'Birkaç soruyu yanıtlayarak proje gereksinimlerinizi anlamamıza yardımcı olun.',
  },
  es: {
    steps: {
      1: { title: 'Información personal', fullName: 'Persona de contacto', businessName: 'Nombre del negocio', email: 'Correo electrónico', phone: 'Número de teléfono', country: 'País', preferredLanguage: 'Idioma preferido', selectLanguage: 'Selecciona tu idioma preferido' },
      2: { title: 'Seleccionar servicios', subtitle: 'Elige uno o varios servicios' },
    },
    services: { 'website-development': 'Desarrollo de sitios web', branding: 'Diseño de logo & Branding', seo: 'Servicios SEO', 'google-business': 'Optimización Google Business', 'social-setup': 'Configuración de redes sociales', 'social-management': 'Gestión de redes sociales', ads: 'Anuncios Facebook & Instagram', email: 'Configuración de correo empresarial', 'lead-forms': 'Formularios de generación de leads', maintenance: 'Mantenimiento de sitios web', 'landing-pages': 'Páginas de destino' },
    languages: { albanian: 'Albanés', english: 'Inglés', german: 'Alemán', french: 'Francés', italian: 'Italiano', turkish: 'Turco', spanish: 'Español' },
    privacy: { title: 'Confidencialidad y protección de datos', message: 'Toda la información que proporcionas se trata de forma estrictamente confidencial. Tus datos se almacenan de forma segura y solo los utiliza el equipo de WEB LAUNCH para prestar los servicios solicitados. Nunca compartimos tu información con terceros sin tu permiso.' },
    validation: { required: 'Este campo es obligatorio', emailInvalid: 'Introduce un correo electrónico válido', phoneInvalid: 'Introduce un número de teléfono válido', selectService: 'Selecciona al menos un servicio' },
    step: 'Paso', of: 'de', back: 'Atrás', next: 'Siguiente', submit: 'Enviar proyecto', submitting: 'Enviando...',
    error: 'Algo salió mal. Inténtalo de nuevo.',
    additionalNotes: 'Notas adicionales', additionalNotesPlaceholder: '¿Hay algo más que debamos saber?',
    success: { title: '¡Gracias!', message: 'Tu solicitud se envió correctamente. Te contactaremos en 24 horas.' },
    title: 'Cuestionario de descubrimiento del proyecto',
    subtitle: 'Ayúdanos a entender los requisitos de tu proyecto respondiendo algunas preguntas.',
  },
};

const locales = ['en', 'al', 'de', 'fr', 'it', 'tr', 'es'];

for (const locale of locales) {
  const filePath = path.join(__dirname, '..', 'messages', `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const questionnaire = locale === 'en' ? enQ : deepTranslate(enQ, maps[locale]);
  const formUi = ui[locale];

  data.contact = data.contact || {};
  data.contact.form = {
    ...formUi,
    questionnaire,
  };

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log('Updated', locale);
}

console.log('Done.');
