import Link from 'next/link';
import type { SubmissionLocale } from '@/lib/submissions/store';

type Status = 'success' | 'invalid' | 'expired' | 'already';

interface ConfirmResultViewProps {
  status: Status;
  locale: SubmissionLocale;
  title: string;
  message: string;
  cta: string;
}

function Icon({ status }: { status: Status }) {
  if (status === 'success') {
    return (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M20 6L9 17l-5-5"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (status === 'already') {
    return (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        <path d="M12 8v4l2.5 2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 8v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="16.5" r="1" fill="currentColor" />
    </svg>
  );
}

export function ConfirmResultView({
  status,
  locale,
  title,
  message,
  cta,
}: ConfirmResultViewProps) {
  const href =
    status === 'expired' || status === 'invalid'
      ? `/${locale}/contact`
      : `/${locale}`;

  return (
    <div className="confirm-card">
      <div className={`confirm-badge ${status}`}>
        <Icon status={status} />
      </div>
      <p className="confirm-brand">WEB LAUNCH</p>
      <h1 className="confirm-title">{title}</h1>
      <p className="confirm-message" style={{ whiteSpace: 'pre-line' }}>
        {message}
      </p>
      <Link href={href} className="confirm-cta">
        {cta}
      </Link>
    </div>
  );
}
