import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'ru'],
  defaultLocale: 'en',
  // EN without a prefix, RU under /ru. Served by public/_redirects (no middleware in static export).
  localePrefix: 'as-needed',
});

export type Locale = (typeof routing.locales)[number];
