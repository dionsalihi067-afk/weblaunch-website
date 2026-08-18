import { MetadataRoute } from 'next';

const locales = ['al', 'en', 'de', 'fr', 'it', 'tr', 'es'];
const baseUrl = 'https://weblaunchworks.com';

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
  
  const sitemapEntries: MetadataRoute.Sitemap = [];

  locales.forEach((locale) => {
    routes.forEach((route) => {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: route === '' ? 1.0 : 0.8,
      });
    });
  });

  return sitemapEntries;
}