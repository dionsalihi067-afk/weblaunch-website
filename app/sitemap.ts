import { MetadataRoute } from 'next';

const locales = ['al', 'en', 'de', 'fr', 'it', 'tr', 'es'];

const baseUrl = 'https://www.weblaunchworks.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    '/services',
    '/portfolio',
    '/about',
    '/process',
    '/contact',
    '/privacy-policy',
    '/terms-and-conditions',
  ];

  return locales.flatMap((locale) =>
    routes.map((route) => ({
      url: `${baseUrl}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: route === '' ? 1 : 0.8,
    }))
  );
}