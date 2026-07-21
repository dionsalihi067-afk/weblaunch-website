import type { Metadata } from 'next';
import { ConfirmResultView } from '@/components/confirm/ConfirmResultView';
import {
  confirmSubmissionByToken,
  type ConfirmResult,
  type SubmissionLocale,
} from '@/lib/submissions/store';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const metadata: Metadata = {
  title: 'Confirm Request | WEB LAUNCH',
  robots: { index: false, follow: false },
};

async function loadConfirmMessages(locale: SubmissionLocale) {
  try {
    const messages = (await import(`../../messages/${locale}.json`)).default as {
      confirm?: {
        success: { title: string; message: string; cta: string };
        expired: { title: string; message: string; cta: string };
        invalid: { title: string; message: string; cta: string };
        already: { title: string; message: string; cta: string };
      };
    };
    return messages.confirm;
  } catch {
    return undefined;
  }
}

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  let tokenParam: string | undefined;
  try {
    const params = await searchParams;
    tokenParam = params.token;
  } catch {
    tokenParam = undefined;
  }

  const rawToken = (tokenParam || '').trim();

  if (!rawToken) {
    const copy = await loadConfirmMessages('en');
    return (
      <ConfirmResultView
        status="invalid"
        locale="en"
        title={copy?.invalid.title || 'Invalid Confirmation Link'}
        message={
          copy?.invalid.message ||
          'This confirmation link is invalid or has expired.\n\nPlease contact WEB LAUNCH if you believe this is an error.'
        }
        cta={copy?.invalid.cta || 'Back to Contact'}
      />
    );
  }

  let result: ConfirmResult;
  try {
    result = await confirmSubmissionByToken(rawToken);
  } catch (error) {
    console.error('[confirm] token validation failed:', error);
    const copy = await loadConfirmMessages('en');
    return (
      <ConfirmResultView
        status="invalid"
        locale="en"
        title={copy?.invalid.title || 'Invalid Confirmation Link'}
        message={
          copy?.invalid.message ||
          'This confirmation link is invalid or has expired.\n\nPlease contact WEB LAUNCH if you believe this is an error.'
        }
        cta={copy?.invalid.cta || 'Back to Contact'}
      />
    );
  }

  const locale: SubmissionLocale =
    result.status === 'invalid' ? 'en' : result.submission?.locale || 'en';
  const copy = await loadConfirmMessages(locale);

  if (result.status === 'invalid') {
    return (
      <ConfirmResultView
        status="invalid"
        locale={locale}
        title={copy?.invalid.title || 'Invalid Confirmation Link'}
        message={
          copy?.invalid.message ||
          'This confirmation link is invalid or has expired.\n\nPlease contact WEB LAUNCH if you believe this is an error.'
        }
        cta={copy?.invalid.cta || 'Back to Contact'}
      />
    );
  }

  if (result.status === 'expired') {
    return (
      <ConfirmResultView
        status="expired"
        locale={locale}
        title={copy?.expired.title || 'Confirmation Link Expired'}
        message={
          copy?.expired.message ||
          'Please submit a new request or contact WEB LAUNCH.'
        }
        cta={copy?.expired.cta || 'Submit again'}
      />
    );
  }

  if (result.status === 'already_confirmed') {
    return (
      <ConfirmResultView
        status="already"
        locale={locale}
        title={copy?.already.title || 'Already confirmed'}
        message={
          copy?.already.message ||
          'This request was already confirmed. Our team will contact you soon.'
        }
        cta={copy?.already.cta || 'Back to Home'}
      />
    );
  }

  return (
    <ConfirmResultView
      status="success"
      locale={locale}
      title={copy?.success.title || 'Request Confirmed'}
      message={
        copy?.success.message ||
        'Thank you.\n\nYour request has been confirmed successfully.\n\nOur WEB LAUNCH team will contact you within 24 hours.\n\nNo further action is required.'
      }
      cta={copy?.success.cta || 'Back to Home'}
    />
  );
}
