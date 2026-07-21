import {
  EMAIL_BRAND,
  escapeHtml,
  getWebsiteUrl,
} from '@/lib/email/branding';

export interface EmailShellOptions {
  /** Main content HTML (already escaped where needed) */
  bodyHtml: string;
  /** Optional headline in dark header (text only — no logo) */
  headline?: string;
  previewText?: string;
}

/**
 * Outlook/Gmail/Apple Mail friendly table layout with inline CSS.
 * Soft card, dark premium header (text brand only), branded footer.
 * No logo images, no CID, no remote logo URLs.
 */
export function renderEmailShell(options: EmailShellOptions): string {
  const { bodyHtml, headline, previewText = '' } = options;
  const siteUrl = getWebsiteUrl();
  const year = new Date().getFullYear();

  const brandBlock = `<p style="margin:0 0 10px;font-size:22px;font-weight:800;letter-spacing:0.08em;color:#ffffff;">${EMAIL_BRAND.name}</p>`;

  const headlineBlock = headline
    ? `<p style="margin:0;font-size:18px;line-height:1.45;font-weight:600;color:#ffffff;">${escapeHtml(headline)}</p>`
    : '';

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <title>${EMAIL_BRAND.name}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    :root { color-scheme: light dark; }
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; }
    a { color: ${EMAIL_BRAND.primary}; }
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; }
      .email-pad { padding-left: 18px !important; padding-right: 18px !important; }
      .stack-btn { display: block !important; width: 100% !important; box-sizing: border-box !important; margin: 0 0 12px 0 !important; }
    }
    @media (prefers-color-scheme: dark) {
      .email-body-bg { background-color: #0b1220 !important; }
      .email-card { background-color: #111827 !important; }
      .email-text { color: #e5e7eb !important; }
      .email-muted { color: #9ca3af !important; }
      .email-card-inner { background-color: #1f2937 !important; border-color: #374151 !important; }
    }
  </style>
</head>
<body class="email-body-bg" style="margin:0;padding:0;background-color:${EMAIL_BRAND.pageBg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  ${
    previewText
      ? `<div style="display:none;font-size:1px;color:${EMAIL_BRAND.pageBg};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${escapeHtml(previewText)}</div>`
      : ''
  }
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${EMAIL_BRAND.pageBg};">
    <tr>
      <td align="center" style="padding:28px 12px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="email-container" style="width:600px;max-width:600px;background-color:${EMAIL_BRAND.cardBg};border-radius:16px;overflow:hidden;box-shadow:0 12px 40px rgba(15,23,42,0.12);" >
          <!-- Header -->
          <tr>
            <td align="center" style="background-color:${EMAIL_BRAND.headerBg};background:linear-gradient(145deg,#0b1220 0%,#111827 55%,#0f172a 100%);padding:36px 28px;text-align:center;">
              ${brandBlock}
              ${headlineBlock}
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td class="email-pad email-text" style="padding:32px 28px;color:${EMAIL_BRAND.ink};font-size:15px;line-height:1.7;">
              ${bodyHtml}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#0b1220;padding:28px 24px;text-align:center;">
              <p style="margin:0 0 8px;font-size:14px;font-weight:800;letter-spacing:0.08em;color:#ffffff;">${EMAIL_BRAND.name}</p>
              <p style="margin:0 0 16px;font-size:12px;line-height:1.6;color:#94a3b8;">
                Professional Websites &nbsp;•&nbsp; Branding &nbsp;•&nbsp; SEO &nbsp;•&nbsp; Digital Marketing
              </p>
              <p style="margin:0 0 10px;font-size:12px;line-height:1.7;color:#94a3b8;">
                <a href="${EMAIL_BRAND.phoneHref}" style="color:#93c5fd;text-decoration:none;">${EMAIL_BRAND.phone}</a>
                &nbsp;•&nbsp;
                <a href="mailto:${EMAIL_BRAND.email}" style="color:#93c5fd;text-decoration:none;">${EMAIL_BRAND.email}</a>
                &nbsp;•&nbsp;
                <a href="${EMAIL_BRAND.instagramHref}" style="color:#93c5fd;text-decoration:none;">${EMAIL_BRAND.instagram}</a>
              </p>
              <p style="margin:16px 0 0;font-size:11px;color:#64748b;">
                © ${year} ${EMAIL_BRAND.name}. All Rights Reserved.<br/>
                <a href="${siteUrl}" style="color:#64748b;text-decoration:underline;">${siteUrl.replace(/^https?:\/\//, '')}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function renderSummaryCard(rows: Array<{ label: string; value: string }>): string {
  const items = rows
    .filter((r) => r.value.trim())
    .map(
      (r) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid ${EMAIL_BRAND.border};vertical-align:top;width:38%;">
          <span style="font-size:12px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:${EMAIL_BRAND.muted};">${escapeHtml(r.label)}</span>
        </td>
        <td style="padding:10px 0;border-bottom:1px solid ${EMAIL_BRAND.border};vertical-align:top;">
          <span style="font-size:14px;font-weight:600;color:${EMAIL_BRAND.ink};">${escapeHtml(r.value)}</span>
        </td>
      </tr>`
    )
    .join('');

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="email-card-inner" style="background-color:#f8fafc;border:1px solid ${EMAIL_BRAND.border};border-radius:12px;margin:22px 0;">
      <tr>
        <td style="padding:18px 18px 8px;">
          <p style="margin:0 0 8px;font-size:13px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:${EMAIL_BRAND.primary};">Request summary</p>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            ${items}
          </table>
        </td>
      </tr>
    </table>`;
}

/** Exactly one primary CTA button (Outlook-safe). */
export function renderPrimaryButton(opts: {
  href: string;
  label: string;
}): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:28px 0 8px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="center" bgcolor="${EMAIL_BRAND.primary}" style="border-radius:10px;background-color:${EMAIL_BRAND.primary};">
                <!--[if mso]>
                <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${opts.href}" style="height:48px;v-text-anchor:middle;width:220px;" arcsize="12%" stroke="f" fillcolor="${EMAIL_BRAND.primary}">
                  <w:anchorlock/>
                  <center style="color:#ffffff;font-family:Segoe UI,sans-serif;font-size:14px;font-weight:700;">
                    ${escapeHtml(opts.label)}
                  </center>
                </v:roundrect>
                <![endif]-->
                <!--[if !mso]><!-- -->
                <a href="${opts.href}" target="_blank" style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:10px;background-color:${EMAIL_BRAND.primary};">
                  ${escapeHtml(opts.label)}
                </a>
                <!--<![endif]-->
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`;
}

export function renderSection(title: string, contentHtml: string): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 22px;">
      <tr>
        <td>
          <p style="margin:0 0 10px;font-size:13px;font-weight:800;letter-spacing:0.05em;text-transform:uppercase;color:${EMAIL_BRAND.primary};border-bottom:2px solid ${EMAIL_BRAND.primary};padding-bottom:8px;">
            ${escapeHtml(title)}
          </p>
          ${contentHtml}
        </td>
      </tr>
    </table>`;
}
