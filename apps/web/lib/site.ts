import { routing, type Locale } from '@/i18n/routing';

/** Public site URL without a trailing slash. Override with NEXT_PUBLIC_SITE_URL (e.g. for a preview deploy). */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://stw.bq-t.pro').replace(
  /\/$/,
  '',
);

export const PAGES = [
  '/pve',
  '/pve/daily-quests',
  '/pve/questline',
  '/pve/side-quests',
  '/pve/shop',
  '/pve/events',
  '/pve/faq',
  '/battle-royale/shop',
  '/battle-royale/tournaments',
  '/battle-royale/events',
  '/privacy',
] as const;

/** Absolute URL of a page in a locale: EN without a prefix, RU under /ru. */
export function pageUrl(path: string, locale: Locale): string {
  const prefix = locale === routing.defaultLocale ? '' : `/${locale}`;
  const tail = path === '/' ? '' : path;
  return `${SITE_URL}${prefix}${tail}` || SITE_URL;
}

/** Metadata alternates (canonical + hreflang) for a page. */
export function alternatesFor(path: string, locale: Locale) {
  return {
    canonical: pageUrl(path, locale),
    languages: {
      ...Object.fromEntries(routing.locales.map((l) => [l, pageUrl(path, l)])),
      'x-default': pageUrl(path, routing.defaultLocale),
    },
  };
}
