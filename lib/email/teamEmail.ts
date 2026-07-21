import type { SubmissionRecord } from '@/lib/submissions/store';
import { getFullAnswersForTeam } from '@/lib/submissions/store';
import {
  EMAIL_BRAND,
  escapeHtml,
  formatEmailDate,
} from '@/lib/email/branding';
import {
  renderEmailShell,
  renderSection,
} from '@/lib/email/layout';

const SERVICE_NAMES: Record<string, string> = {
  'website-development': 'Website Development',
  branding: 'Logo Design & Branding',
  seo: 'SEO Services',
  'google-business': 'Google Business Optimization',
  'social-setup': 'Social Media Setup',
  'social-management': 'Social Media Management',
  ads: 'Facebook & Instagram Ads Management',
  email: 'Business Email Setup',
  'lead-forms': 'Lead Generation Forms',
  maintenance: 'Website Maintenance',
  'landing-pages': 'Landing Pages',
};

function formatQuestionLabel(questionId: string): string {
  return questionId
    .replace(/_\d+$/, '')
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

export function getServiceDisplayName(id: string): string {
  return SERVICE_NAMES[id] || id;
}

function kvRow(label: string, value: string): string {
  return `<p style="margin:0 0 10px;font-size:14px;line-height:1.55;color:${EMAIL_BRAND.ink};">
    <strong style="color:${EMAIL_BRAND.muted};">${escapeHtml(label)}:</strong>
    <span style="white-space:pre-wrap;"> ${escapeHtml(value || 'N/A')}</span>
  </p>`;
}

export function buildTeamProjectEmail(
  submission: SubmissionRecord,
  extras?: { clientIp?: string }
): { subject: string; html: string; text: string } {
  const { clientInfo, selectedServices, sharedAnswers, additionalNotes, files } =
    submission;
  const serviceAnswers = getFullAnswersForTeam(submission);
  const serviceNames = selectedServices.map(getServiceDisplayName);
  const submittedAt = formatEmailDate(submission.createdAt);
  const clientIp = extras?.clientIp?.trim() || 'Not available';

  const clientInfoHtml = [
    kvRow('Full Name', clientInfo.fullName),
    kvRow('Business Name', clientInfo.businessName),
    kvRow('Email', clientInfo.email),
    kvRow('Phone', clientInfo.phone),
    kvRow('Country', clientInfo.country),
    kvRow('Preferred Language', clientInfo.preferredLanguage),
    kvRow('Language (locale)', submission.locale),
    kvRow('Submission Date', submittedAt),
    kvRow('Client IP', clientIp),
  ].join('');

  const servicesHtml = `<p style="margin:0;font-size:14px;line-height:1.7;color:${EMAIL_BRAND.ink};">${serviceNames
    .map((n) => `• ${escapeHtml(n)}`)
    .join('<br/>')}</p>`;

  const sharedHtml =
    Object.keys(sharedAnswers).length > 0
      ? Object.entries(sharedAnswers)
          .map(([q, a]) => kvRow(formatQuestionLabel(q), a))
          .join('')
      : `<p style="margin:0;color:${EMAIL_BRAND.muted};font-size:14px;">No shared answers.</p>`;

  const answersHtml = selectedServices
    .map((serviceId) => {
      const serviceName = SERVICE_NAMES[serviceId] || serviceId;
      const answers = serviceAnswers[serviceId] || {};
      const blocks =
        Object.keys(answers).length > 0
          ? Object.entries(answers)
              .map(([questionId, answer]) =>
                kvRow(formatQuestionLabel(questionId), answer)
              )
              .join('')
          : `<p style="margin:0;color:${EMAIL_BRAND.muted};font-size:14px;">No answers for this service.</p>`;

      return `
        <div style="background:#f8fafc;border:1px solid ${EMAIL_BRAND.border};border-radius:12px;padding:16px;margin:0 0 14px;">
          <p style="margin:0 0 10px;font-size:15px;font-weight:800;color:${EMAIL_BRAND.primary};">${escapeHtml(serviceName)}</p>
          ${blocks}
        </div>`;
    })
    .join('');

  const filesHtml =
    files.length > 0
      ? `<ul style="margin:0;padding-left:18px;color:${EMAIL_BRAND.ink};font-size:14px;line-height:1.7;">
          ${files
            .map(
              (f) =>
                `<li>${escapeHtml(f.originalName)} (${(f.size / 1024).toFixed(2)} KB) — field: ${escapeHtml(f.fieldKey)}</li>`
            )
            .join('')}
        </ul>
        <p style="margin:10px 0 0;font-size:13px;color:${EMAIL_BRAND.muted};">Uploaded files are attached to this email.</p>`
      : `<p style="margin:0;color:${EMAIL_BRAND.muted};font-size:14px;">No files uploaded.</p>`;

  const notesHtml = additionalNotes.trim()
    ? `<p style="margin:0;white-space:pre-wrap;font-size:14px;line-height:1.7;color:${EMAIL_BRAND.ink};">${escapeHtml(additionalNotes)}</p>`
    : `<p style="margin:0;color:${EMAIL_BRAND.muted};font-size:14px;">No additional notes.</p>`;

  const consent = submission.legalConsent;
  const consentHtml = consent
    ? [
        kvRow('Accepted', consent.accepted ? 'Yes' : 'No'),
        kvRow('Accepted At', formatEmailDate(consent.acceptedAt)),
        kvRow('Privacy Policy Version', consent.policyVersion),
        kvRow('Terms & Conditions Version', consent.termsVersion),
      ].join('')
    : `<p style="margin:0;color:${EMAIL_BRAND.muted};font-size:14px;">No consent record.</p>`;

  const bodyHtml = `
    <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:${EMAIL_BRAND.ink};">
      A new client inquiry was submitted through the WEB LAUNCH contact form.
    </p>
    ${renderSection('Client Information', clientInfoHtml)}
    ${renderSection('Legal Consent', consentHtml)}
    ${renderSection('Selected Services', servicesHtml)}
    ${renderSection('Shared Answers', sharedHtml)}
    ${renderSection('All Answers', answersHtml)}
    ${renderSection('Uploaded Files', filesHtml)}
    ${renderSection('Additional Notes', notesHtml)}
    ${renderSection('Submission Date', `<p style="margin:0;font-size:14px;color:${EMAIL_BRAND.ink};">${escapeHtml(submittedAt)}</p>`)}
  `;

  const html = renderEmailShell({
    headline: 'New Client Inquiry',
    previewText: `New inquiry from ${clientInfo.fullName} — ${clientInfo.businessName}`,
    bodyHtml,
  });

  const text = [
    'NEW CLIENT INQUIRY • WEB LAUNCH',
    `Submission Date: ${submittedAt}`,
    `Client IP: ${clientIp}`,
    '',
    'CLIENT INFORMATION',
    `Full Name: ${clientInfo.fullName}`,
    `Business Name: ${clientInfo.businessName}`,
    `Email: ${clientInfo.email}`,
    `Phone: ${clientInfo.phone}`,
    `Country: ${clientInfo.country}`,
    `Preferred Language: ${clientInfo.preferredLanguage}`,
    `Locale: ${submission.locale}`,
    '',
    'LEGAL CONSENT',
    submission.legalConsent
      ? [
          `Accepted: ${submission.legalConsent.accepted ? 'Yes' : 'No'}`,
          `Accepted At: ${formatEmailDate(submission.legalConsent.acceptedAt)}`,
          `Privacy Policy Version: ${submission.legalConsent.policyVersion}`,
          `Terms & Conditions Version: ${submission.legalConsent.termsVersion}`,
        ].join('\n')
      : 'No consent record',
    '',
    'SELECTED SERVICES',
    ...serviceNames.map((n) => `• ${n}`),
    '',
    'SHARED ANSWERS',
    ...Object.entries(sharedAnswers).map(
      ([q, a]) => `${formatQuestionLabel(q)}: ${a}`
    ),
    '',
    'ALL ANSWERS',
    ...selectedServices.flatMap((serviceId) => {
      const answers = serviceAnswers[serviceId] || {};
      return [
        (SERVICE_NAMES[serviceId] || serviceId).toUpperCase(),
        ...Object.entries(answers).map(
          ([q, a]) => `${formatQuestionLabel(q)}: ${a}`
        ),
        '',
      ];
    }),
    'UPLOADED FILES',
    files.length
      ? files.map((f) => `• ${f.originalName}`).join('\n')
      : 'None',
    '',
    'ADDITIONAL NOTES',
    additionalNotes || 'None',
  ].join('\n');

  return {
    subject: 'New Client Inquiry • WEB LAUNCH',
    html,
    text,
  };
}
