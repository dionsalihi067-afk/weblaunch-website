/**
 * Adds confirm.* translations to all locale files.
 * Run: node scripts/patch-confirm-i18n.js
 */
const fs = require('fs');
const path = require('path');

const confirm = {
  en: {
    success: {
      title: 'Request confirmed',
      message:
        'Thank you for confirming your request. Your project request has now been officially received by WEB LAUNCH. Our team will review all submitted information. Within the next 24 hours one of our specialists will contact you regarding the next steps.',
      cta: 'Back to Home',
    },
    expired: {
      title: 'Confirmation link expired',
      message:
        'This confirmation link has expired (valid for 48 hours). Please submit the contact form again to receive a new confirmation email.',
      cta: 'Go to Contact',
    },
    invalid: {
      title: 'Invalid confirmation link',
      message:
        'This confirmation link is invalid or incomplete. Please use the button from your confirmation email, or submit the form again.',
      cta: 'Go to Contact',
    },
    already: {
      title: 'Already confirmed',
      message:
        'This request was already confirmed. WEB LAUNCH has received your project details and will contact you soon.',
      cta: 'Back to Home',
    },
  },
  al: {
    success: {
      title: 'Kërkesa u konfirmua',
      message:
        'Faleminderit që konfirmuat kërkesën. Kërkesa juaj për projekt tani është pranuar zyrtarisht nga WEB LAUNCH. Ekipi ynë do të shqyrtojë informacionet. Brenda 24 orëve një specialist do t’ju kontaktojë për hapat e radhës.',
      cta: 'Kthehu në Ballina',
    },
    expired: {
      title: 'Linku i konfirmimit ka skaduar',
      message:
        'Ky link konfirmimi ka skaduar (i vlefshëm 48 orë). Ju lutemi dërgoni përsëri formularin e kontaktit për të marrë një email të ri konfirmimi.',
      cta: 'Shko te Kontakti',
    },
    invalid: {
      title: 'Link konfirmimi i pavlefshëm',
      message:
        'Ky link konfirmimi është i pavlefshëm ose i paplotë. Përdorni butonin nga emaili juaj, ose dërgoni formularin përsëri.',
      cta: 'Shko te Kontakti',
    },
    already: {
      title: 'Tashmë e konfirmuar',
      message:
        'Kjo kërkesë është konfirmuar tashmë. WEB LAUNCH i ka marrë detajet e projektit dhe do t’ju kontaktojë së shpejti.',
      cta: 'Kthehu në Ballina',
    },
  },
  de: {
    success: {
      title: 'Anfrage bestätigt',
      message:
        'Vielen Dank für die Bestätigung. Ihre Projektanfrage wurde offiziell von WEB LAUNCH empfangen. Unser Team prüft alle Angaben. Innerhalb von 24 Stunden meldet sich ein Spezialist bei Ihnen.',
      cta: 'Zur Startseite',
    },
    expired: {
      title: 'Bestätigungslink abgelaufen',
      message:
        'Dieser Bestätigungslink ist abgelaufen (48 Stunden gültig). Bitte senden Sie das Kontaktformular erneut.',
      cta: 'Zum Kontakt',
    },
    invalid: {
      title: 'Ungültiger Bestätigungslink',
      message:
        'Dieser Bestätigungslink ist ungültig oder unvollständig. Nutzen Sie den Button in Ihrer E-Mail oder senden Sie das Formular erneut.',
      cta: 'Zum Kontakt',
    },
    already: {
      title: 'Bereits bestätigt',
      message:
        'Diese Anfrage wurde bereits bestätigt. WEB LAUNCH hat Ihre Projektdaten erhalten und wird sich bald melden.',
      cta: 'Zur Startseite',
    },
  },
  fr: {
    success: {
      title: 'Demande confirmée',
      message:
        'Merci d’avoir confirmé votre demande. Votre demande de projet a été officiellement reçue par WEB LAUNCH. Notre équipe examinera les informations. Un spécialiste vous contactera sous 24 heures.',
      cta: 'Retour à l’accueil',
    },
    expired: {
      title: 'Lien de confirmation expiré',
      message:
        'Ce lien de confirmation a expiré (valable 48 heures). Veuillez renvoyer le formulaire de contact.',
      cta: 'Aller au contact',
    },
    invalid: {
      title: 'Lien de confirmation invalide',
      message:
        'Ce lien de confirmation est invalide ou incomplet. Utilisez le bouton de votre e-mail ou renvoyez le formulaire.',
      cta: 'Aller au contact',
    },
    already: {
      title: 'Déjà confirmée',
      message:
        'Cette demande a déjà été confirmée. WEB LAUNCH a reçu vos informations et vous contactera bientôt.',
      cta: 'Retour à l’accueil',
    },
  },
  it: {
    success: {
      title: 'Richiesta confermata',
      message:
        'Grazie per aver confermato. La tua richiesta di progetto è ufficialmente ricevuta da WEB LAUNCH. Il team esaminerà le informazioni. Entro 24 ore uno specialista ti contatterà.',
      cta: 'Torna alla Home',
    },
    expired: {
      title: 'Link di conferma scaduto',
      message:
        'Questo link di conferma è scaduto (valido 48 ore). Invia di nuovo il modulo di contatto.',
      cta: 'Vai a Contatti',
    },
    invalid: {
      title: 'Link di conferma non valido',
      message:
        'Questo link di conferma non è valido o è incompleto. Usa il pulsante dell’email oppure invia di nuovo il modulo.',
      cta: 'Vai a Contatti',
    },
    already: {
      title: 'Già confermata',
      message:
        'Questa richiesta è già stata confermata. WEB LAUNCH ha ricevuto i dettagli e ti contatterà presto.',
      cta: 'Torna alla Home',
    },
  },
  tr: {
    success: {
      title: 'Talep onaylandı',
      message:
        'Onayladığınız için teşekkürler. Proje talebiniz WEB LAUNCH tarafından resmen alındı. Ekibimiz bilgileri inceleyecek. 24 saat içinde bir uzman sizinle iletişime geçecektir.',
      cta: 'Ana Sayfaya Dön',
    },
    expired: {
      title: 'Onay bağlantısının süresi doldu',
      message:
        'Bu onay bağlantısının süresi doldu (48 saat geçerlidir). Yeni bir onay e-postası için formu tekrar gönderin.',
      cta: 'İletişime Git',
    },
    invalid: {
      title: 'Geçersiz onay bağlantısı',
      message:
        'Bu onay bağlantısı geçersiz veya eksik. E-postadaki düğmeyi kullanın veya formu yeniden gönderin.',
      cta: 'İletişime Git',
    },
    already: {
      title: 'Zaten onaylandı',
      message:
        'Bu talep zaten onaylandı. WEB LAUNCH proje bilgilerinizi aldı ve yakında sizinle iletişime geçecek.',
      cta: 'Ana Sayfaya Dön',
    },
  },
  es: {
    success: {
      title: 'Solicitud confirmada',
      message:
        'Gracias por confirmar. Tu solicitud de proyecto ha sido recibida oficialmente por WEB LAUNCH. Nuestro equipo revisará la información. En 24 horas un especialista te contactará.',
      cta: 'Volver al inicio',
    },
    expired: {
      title: 'Enlace de confirmación caducado',
      message:
        'Este enlace de confirmación ha caducado (válido 48 horas). Envía de nuevo el formulario de contacto.',
      cta: 'Ir a Contacto',
    },
    invalid: {
      title: 'Enlace de confirmación no válido',
      message:
        'Este enlace de confirmación no es válido o está incompleto. Usa el botón del correo o envía el formulario otra vez.',
      cta: 'Ir a Contacto',
    },
    already: {
      title: 'Ya confirmada',
      message:
        'Esta solicitud ya fue confirmada. WEB LAUNCH recibió tus datos y te contactará pronto.',
      cta: 'Volver al inicio',
    },
  },
};

const successForm = {
  en: {
    title: 'Check your email',
    message:
      'We sent a confirmation email to your inbox. Please click “Confirm Request” to officially submit your project to WEB LAUNCH. The link expires in 48 hours.',
  },
  al: {
    title: 'Kontrolloni emailin tuaj',
    message:
      'Ju dërguam një email konfirmimi. Klikoni “Konfirmo Kërkesën” për ta dërguar zyrtarisht projektin te WEB LAUNCH. Linku skadon brenda 48 orëve.',
  },
  de: {
    title: 'Prüfen Sie Ihre E-Mail',
    message:
      'Wir haben eine Bestätigungs-E-Mail gesendet. Klicken Sie auf „Anfrage bestätigen“, um Ihr Projekt offiziell an WEB LAUNCH zu übermitteln. Der Link ist 48 Stunden gültig.',
  },
  fr: {
    title: 'Vérifiez votre e-mail',
    message:
      'Nous avons envoyé un e-mail de confirmation. Cliquez sur « Confirmer la demande » pour transmettre officiellement votre projet à WEB LAUNCH. Le lien expire sous 48 heures.',
  },
  it: {
    title: 'Controlla la tua email',
    message:
      'Ti abbiamo inviato un’email di conferma. Clicca su “Conferma richiesta” per inviare ufficialmente il progetto a WEB LAUNCH. Il link scade tra 48 ore.',
  },
  tr: {
    title: 'E-postanızı kontrol edin',
    message:
      'Size bir onay e-postası gönderdik. Projenizi WEB LAUNCH’a resmen iletmek için “Talebi Onayla”ya tıklayın. Bağlantı 48 saat içinde sona erer.',
  },
  es: {
    title: 'Revisa tu correo',
    message:
      'Te enviamos un correo de confirmación. Haz clic en “Confirmar solicitud” para enviar oficialmente tu proyecto a WEB LAUNCH. El enlace caduca en 48 horas.',
  },
};

for (const locale of Object.keys(confirm)) {
  const filePath = path.join(__dirname, '..', 'messages', `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  data.confirm = confirm[locale];
  if (data.contact?.form?.success) {
    data.contact.form.success = successForm[locale];
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log('Patched', locale);
}
console.log('Done');
