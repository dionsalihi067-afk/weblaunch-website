import { localizedUrl } from '@/lib/seo/alternates';
import {
  BUSINESS,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
  localeLanguageTag,
} from '@/lib/seo/site';

const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

type JsonLdNode = Record<string, unknown>;

/** Organization + WebSite graph, rendered once per page from the locale layout. */
export function buildSiteGraph(locale: string): JsonLdNode {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ProfessionalService',
        '@id': ORGANIZATION_ID,
        name: SITE_NAME,
        url: SITE_URL,
        logo: absoluteUrl(BUSINESS.logoPath),
        image: absoluteUrl(BUSINESS.logoPath),
        email: BUSINESS.email,
        telephone: BUSINESS.telephone,
        sameAs: [BUSINESS.instagramUrl],
        address: {
          '@type': 'PostalAddress',
          addressLocality: BUSINESS.locality,
          addressCountry: BUSINESS.countryCode,
        },
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer service',
          email: BUSINESS.email,
          telephone: BUSINESS.telephone,
          availableLanguage: ['sq', 'en', 'de', 'fr', 'it', 'tr', 'es'],
        },
      },
      {
        '@type': 'WebSite',
        '@id': WEBSITE_ID,
        name: SITE_NAME,
        url: SITE_URL,
        inLanguage: localeLanguageTag(locale),
        publisher: { '@id': ORGANIZATION_ID },
      },
    ],
  };
}

export function buildServiceGraph({
  locale,
  serviceId,
  name,
  description,
  homeLabel,
  servicesLabel,
}: {
  locale: string;
  serviceId: string;
  name: string;
  description: string;
  homeLabel: string;
  servicesLabel: string;
}): JsonLdNode {
  const url = localizedUrl(locale, `/services/${serviceId}`);

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        '@id': `${url}#service`,
        name,
        description,
        url,
        serviceType: name,
        inLanguage: localeLanguageTag(locale),
        provider: { '@id': ORGANIZATION_ID },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: homeLabel,
            item: localizedUrl(locale),
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: servicesLabel,
            item: localizedUrl(locale, '/services'),
          },
          {
            '@type': 'ListItem',
            position: 3,
            name,
            item: url,
          },
        ],
      },
    ],
  };
}

/** Serializes JSON-LD safely for inline <script> (prevents `</script>` breakout). */
export function serializeJsonLd(data: JsonLdNode): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
