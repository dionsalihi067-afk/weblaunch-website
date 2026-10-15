/**
 * Maps the /api/contact response to what the form may show.
 * Success is shown only for an explicit 2xx `success: true` with an accepted code.
 * Kept free of imports so it can be unit-tested directly with Node.
 */
export type SubmitOutcome =
  | { kind: 'success'; confirmationEmailSent: boolean }
  | { kind: 'files_too_large' }
  | { kind: 'error'; message?: string };

const ACCEPTED_CODES = ['accepted', 'duplicate'];

export function interpretSubmitResponse(status: number, body: unknown): SubmitOutcome {
  const data = (body && typeof body === 'object' ? body : {}) as {
    success?: unknown;
    code?: unknown;
    error?: unknown;
    confirmationEmailSent?: unknown;
  };

  if (
    status >= 200 &&
    status < 300 &&
    data.success === true &&
    typeof data.code === 'string' &&
    ACCEPTED_CODES.includes(data.code)
  ) {
    return { kind: 'success', confirmationEmailSent: data.confirmationEmailSent !== false };
  }

  if (status === 413 || data.code === 'payload_too_large') {
    return { kind: 'files_too_large' };
  }

  return {
    kind: 'error',
    message: typeof data.error === 'string' ? data.error : undefined,
  };
}
