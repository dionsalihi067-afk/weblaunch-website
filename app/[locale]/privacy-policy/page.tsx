import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import LazyWhatsApp from '@/components/LazyWhatsApp';
import LegalDocumentView from '@/components/LegalDocumentView';
import { getPrivacyDocument } from '@/lib/legal';
import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { buildLanguageAlternates } from '@/lib/seo/alternates';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const document = getPrivacyDocument(locale);

  return {
    title: document.metaTitle,
    description: document.metaDescription,

    alternates: buildLanguageAlternates(locale, '/privacy-policy'),

    openGraph: {
      title: document.metaTitle,
      description: document.metaDescription,
      type: 'website',
      locale: locale === 'en' ? 'en' : locale,
    },
  };
}

export default async function PrivacyPolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  setRequestLocale(locale);

  const document = getPrivacyDocument(locale);

  return (
    <>
      <Navigation />

      <main className="pt-16 sm:pt-20">
        <section className="section-pad bg-gradient-to-b from-slate-50 to-white">
          <div className="container-custom max-w-4xl">
            <h1 className="heading-page mb-6 text-slate-900 sm:mb-8">
              {document.title}
            </h1>

            <LegalDocumentView document={document} />
          </div>
        </section>
      </main>

      <Footer />
      <LazyWhatsApp />
    </>
  );
}