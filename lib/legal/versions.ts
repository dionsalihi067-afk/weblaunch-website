/** Document versions for consent records — bump when legal text materially changes. */
export const LEGAL_POLICY_VERSION = '2026-07-21';
export const LEGAL_TERMS_VERSION = '2026-07-21';

export type LegalConsentRecord = {
  accepted: true;
  acceptedAt: string;
  policyVersion: string;
  termsVersion: string;
};

export function createLegalConsentRecord(
  acceptedAt: string = new Date().toISOString()
): LegalConsentRecord {
  return {
    accepted: true,
    acceptedAt,
    policyVersion: LEGAL_POLICY_VERSION,
    termsVersion: LEGAL_TERMS_VERSION,
  };
}
