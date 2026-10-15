import type { MetadataRoute } from 'next';

import { locales } from '@/i18n';
import { buildHreflangMap, localizedUrl } from '@/lib/seo/alternates';
import { STATIC_PUBLIC_PATHS } from '@/lib/seo/site';
import { allServiceIds } from '@/lib/services/serviceData';

export default function sitemap(): MetadataRoute.Sitemap {
  const paths: string[] = [
    ...STATIC_PUBLIC_PATHS,
    ...allServiceIds.map((id) => `/services/${id}`),
  ];

  return paths.flatMap((path) => {
    const languages = buildHreflangMap(path);

    return locales.map((locale) => ({
      url: localizedUrl(locale, path),
      changeFrequency: 'monthly' as const,
      priority: path === '' ? 1 : path.startsWith('/services') ? 0.8 : 0.6,
      alternates: { languages },
    }));
  });
}
