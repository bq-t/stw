import { routing, type Locale } from '@/i18n/routing';

/** Public site URL without a trailing slash. Set NEXT_PUBLIC_SITE_URL once the domain is known. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://stw-vbucks.pages.dev'
).replace(/\/$/, '');

export const PAGES = [
  '/',
  '/daily-quests',
  '/questline',
  '/side-quests',
  '/guide',
  '/faq',
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
