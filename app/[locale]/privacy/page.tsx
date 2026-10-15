import { permanentRedirect } from 'next/navigation';

export default async function PrivacyRedirect({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  permanentRedirect(`/${locale}/privacy-policy`);
}
