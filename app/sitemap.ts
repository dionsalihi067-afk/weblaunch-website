import type { MetadataRoute } from 'next';

import { locales } from '@/i18n';
import { allServiceIds } from '@/lib/services/serviceData';

const SITE_URL = (
process.env.NEXT_PUBLIC_SITE_URL ||
process.env.APP_URL ||
'https://www.weblaunchworks.com'
).replace(//+$/, '');

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

const lastModified = new Date();

const staticPages = locales.flatMap((locale) =>
routes.map((route) => ({
url: `${SITE_URL}/${locale}${route}`,
lastModified,
changeFrequency: route === '' ? 'weekly' : 'monthly' as const,
priority: route === '' ? 1.0 : 0.8,
}))
);

const servicePages = locales.flatMap((locale) =>
allServiceIds.map((serviceId) => ({
url: `${SITE_URL}/${locale}/services/${serviceId}`,
lastModified,
changeFrequency: 'monthly' as const,
priority: 0.7,
}))
);

return [...staticPages, ...servicePages];
}
