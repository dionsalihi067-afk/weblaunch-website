import { permanentRedirect } from 'next/navigation';

export default async function TermsRedirect({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  permanentRedirect(`/${locale}/terms-and-conditions`);
}
