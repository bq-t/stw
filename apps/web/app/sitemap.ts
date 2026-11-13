import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { PAGES, pageUrl } from '@/lib/site';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: pageUrl(path, locale),
      changeFrequency: path === '/pve' ? ('daily' as const) : ('weekly' as const),
      priority: path === '/pve' ? 1 : 0.7,
      alternates: {
        languages: Object.fromEntries(routing.locales.map((l) => [l, pageUrl(path, l)])),
      },
    })),
  );
}
