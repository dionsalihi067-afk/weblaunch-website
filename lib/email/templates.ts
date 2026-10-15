import type { SubmissionLocale } from '@/lib/submissions/store';
import { EMAIL_BRAND, escapeHtml } from '@/lib/email/branding';
import {
  renderEmailShell,
  renderPrimaryButton,
} from '@/lib/email/layout';

export interface ConfirmEmailCopy {
  subject: string;
  headline: string;
  greeting: (name: string) => string;
  received: string;
  consentNote: string;
  instruction: string;
  button: string;
  expiryNote: string;
  ignoreNote: string;
  regards: string;
}

const confirmCopy: Record<SubmissionLocale, ConfirmEmailCopy> = {
  en: {
    subject: 'WEB LAUNCH — Please Confirm Your Request',
    headline: 'Please confirm your request',
    greeting: (n) => `Hello ${n},`,
    received:
      'Thank you for contacting WEB LAUNCH. We have successfully received your request.',
    consentNote:
      'By submitting this request, you confirmed that you agree to the Privacy Policy and Terms & Conditions of WEB LAUNCH.',
    instruction: 'Please confirm your request using the button below.',
    button: 'Confirm Request',
    expiryNote:
      'This confirmation link expires in 48 hours and can only be used once.',
    ignoreNote:
      'If you did not submit this request, you can safely ignore this email.',
    regards: 'Best regards,',
  },
  al: {
    subject: 'WEB LAUNCH — Ju lutemi konfirmoni kërkesën tuaj',
    headline: 'Ju lutemi konfirmoni kërkesën tuaj',
    greeting: (n) => `Përshëndetje ${n},`,
    received:
      'Faleminderit që kontaktuat WEB LAUNCH. Ne e kemi marrë me sukses kërkesën tuaj.',
    consentNote:
      'Duke dërguar këtë kërkesë, ju konfirmuat se pranoni Politikën e Privatësisë dhe Kushtet dhe Termat e WEB LAUNCH.',
    instruction: 'Ju lutemi konfirmoni kërkesën tuaj duke përdorur butonin më poshtë.',
    button: 'Konfirmo Kërkesën',
    expiryNote:
      'Ky link skadon brenda 48 orëve dhe mund të përdoret vetëm një herë.',
    ignoreNote:
      'Nëse nuk e keni dërguar këtë kërkesë, mund ta injoroni këtë email.',
    regards: 'Me respekt,',
  },
  de: {
    subject: 'WEB LAUNCH — Bitte bestätigen Sie Ihre Anfrage',
    headline: 'Bitte bestätigen Sie Ihre Anfrage',
    greeting: (n) => `Hallo ${n},`,
    received:
      'Vielen Dank, dass Sie WEB LAUNCH kontaktiert haben. Wir haben Ihre Anfrage erfolgreich erhalten.',
    consentNote:
      'Mit dem Absenden dieser Anfrage haben Sie bestätigt, dass Sie der Datenschutzrichtlinie und den Allgemeinen Geschäftsbedingungen von WEB LAUNCH zustimmen.',
    instruction:
      'Bitte bestätigen Sie Ihre Anfrage mit der Schaltfläche unten.',
    button: 'Anfrage bestätigen',
    expiryNote:
      'Dieser Bestätigungslink läuft in 48 Stunden ab und kann nur einmal verwendet werden.',
    ignoreNote:
      'Wenn Sie diese Anfrage nicht gestellt haben, können Sie diese E-Mail ignorieren.',
    regards: 'Mit freundlichen Grüßen,',
  },
  fr: {
    subject: 'WEB LAUNCH — Veuillez confirmer votre demande',
    headline: 'Veuillez confirmer votre demande',
    greeting: (n) => `Bonjour ${n},`,
    received:
      'Merci d’avoir contacté WEB LAUNCH. Nous avons bien reçu votre demande.',
    consentNote:
      'En soumettant cette demande, vous avez confirmé accepter la Politique de confidentialité et les Conditions générales de WEB LAUNCH.',
    instruction:
      'Veuillez confirmer votre demande en utilisant le bouton ci-dessous.',
    button: 'Confirmer la demande',
    expiryNote:
      'Ce lien de confirmation expire dans 48 heures et ne peut être utilisé qu’une seule fois.',
    ignoreNote:
      'Si vous n’êtes pas à l’origine de cette demande, ignorez cet e-mail.',
    regards: 'Cordialement,',
  },
  it: {
    subject: 'WEB LAUNCH — Conferma la tua richiesta',
    headline: 'Conferma la tua richiesta',
    greeting: (n) => `Ciao ${n},`,
    received:
      'Grazie per aver contattato WEB LAUNCH. Abbiamo ricevuto con successo la tua richiesta.',
    consentNote:
      'Inviando questa richiesta, hai confermato di accettare l’Informativa sulla privacy e i Termini e Condizioni di WEB LAUNCH.',
    instruction:
      'Conferma la tua richiesta utilizzando il pulsante qui sotto.',
    button: 'Conferma richiesta',
    expiryNote:
      'Questo link scade tra 48 ore e può essere usato una sola volta.',
    ignoreNote:
      'Se non hai inviato questa richiesta, puoi ignorare questa email.',
    regards: 'Cordiali saluti,',
  },
  tr: {
    subject: 'WEB LAUNCH — Lütfen talebinizi onaylayın',
    headline: 'Lütfen talebinizi onaylayın',
    greeting: (n) => `Merhaba ${n},`,
    received:
      'WEB LAUNCH ile iletişime geçtiğiniz için teşekkürler. Talebinizi başarıyla aldık.',
    consentNote:
      'Bu talebi göndererek, WEB LAUNCH Gizlilik Politikası ile Şartlar ve Koşullarını kabul ettiğinizi onayladınız.',
    instruction: 'Lütfen aşağıdaki düğmeyi kullanarak talebinizi onaylayın.',
    button: 'Talebi Onayla',
    expiryNote:
      'Bu onay bağlantısı 48 saat içinde sona erer ve yalnızca bir kez kullanılabilir.',
    ignoreNote:
      'Bu talebi siz göndermediyseniz, bu e-postayı görmezden gelebilirsiniz.',
    regards: 'Saygılarımızla,',
  },
  es: {
    subject: 'WEB LAUNCH — Por favor confirma tu solicitud',
    headline: 'Por favor confirma tu solicitud',
    greeting: (n) => `Hola ${n},`,
    received:
      'Gracias por contactar a WEB LAUNCH. Hemos recibido tu solicitud correctamente.',
    consentNote:
      'Al enviar esta solicitud, confirmaste que aceptas la Política de privacidad y los Términos y condiciones de WEB LAUNCH.',
    instruction:
      'Por favor confirma tu solicitud usando el botón de abajo.',
    button: 'Confirmar solicitud',
    expiryNote:
      'Este enlace caduca en 48 horas y solo puede usarse una vez.',
    ignoreNote:
      'Si no enviaste esta solicitud, puedes ignorar este correo.',
    regards: 'Atentamente,',
  },
};

/**
 * Client confirmation email — exactly one CTA button.
 * Language matches the contact form preferred language / submission locale.
 */
export function buildClientReceiptEmail(opts: {
  locale: SubmissionLocale;
  clientName: string;
  confirmUrl: string;
}): { subject: string; html: string; text: string } {
  const c = confirmCopy[opts.locale] || confirmCopy.en;
  const name = opts.clientName.trim() || 'there';
  const confirmUrl = opts.confirmUrl.trim();

  if (
    !confirmUrl ||
    !/^https?:\/\//i.test(confirmUrl) ||
    !confirmUrl.includes('/confirm?token=')
  ) {
    throw new Error(
      'buildClientReceiptEmail requires a valid confirmUrl with /confirm?token='
    );
  }

  const bodyHtml = `
    <p style="margin:0 0 14px;font-size:15px;line-height:1.7;">${escapeHtml(c.greeting(name))}</p>
    <p style="margin:0 0 12px;font-size:15px;line-height:1.7;">${escapeHtml(c.received)}</p>
    <p style="margin:0 0 12px;font-size:14px;line-height:1.7;color:${EMAIL_BRAND.muted};">${escapeHtml(c.consentNote)}</p>
    <p style="margin:0 0 8px;font-size:15px;line-height:1.7;">${escapeHtml(c.instruction)}</p>
    ${renderPrimaryButton({
      href: confirmUrl,
      label: c.button,
    })}
    <p style="margin:8px 0 0;font-size:12px;line-height:1.6;color:${EMAIL_BRAND.muted};text-align:center;">
      ${escapeHtml(c.expiryNote)}
    </p>
    <p style="margin:16px 0 0;font-size:13px;line-height:1.6;color:${EMAIL_BRAND.muted};">
      ${escapeHtml(c.ignoreNote)}
    </p>
    <p style="margin:22px 0 0;font-size:15px;line-height:1.7;">
      ${escapeHtml(c.regards)}<br/><strong>${EMAIL_BRAND.name}</strong>
    </p>
  `;

  const html = renderEmailShell({
    headline: c.headline,
    previewText: c.instruction,
    bodyHtml,
  });

  const text = [
    c.greeting(name),
    '',
    c.received,
    c.consentNote,
    c.instruction,
    '',
    `${c.button}: ${confirmUrl}`,
    '',
    c.expiryNote,
    c.ignoreNote,
    '',
    c.regards,
    EMAIL_BRAND.name,
  ].join('\n');

  return { subject: c.subject, html, text };
}

/** @deprecated Use buildClientReceiptEmail — kept for compatibility */
export function buildConfirmRequestEmail(opts: {
  locale: SubmissionLocale;
  clientName: string;
  businessName: string;
  services: string[];
  confirmUrl: string;
}): { subject: string; html: string; text: string } {
  return buildClientReceiptEmail({
    locale: opts.locale,
    clientName: opts.clientName,
    confirmUrl: opts.confirmUrl,
  });
}

export { confirmCopy };
