import { redirect } from 'next/navigation';

export default async function TermsRedirect({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/terms-and-conditions`);
}
