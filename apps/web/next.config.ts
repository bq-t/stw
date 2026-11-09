import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const isDev = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  // Static HTML on Cloudflare Pages. Mission data comes from the Worker at runtime.
  // In production, EN without a prefix is served by public/_redirects; `next dev`
  // does not read that file, so it gets the same rewrites here (dev only:
  // rewrites are not allowed together with a static export).
  ...(isDev
    ? {
        async rewrites() {
          return [
            { source: '/', destination: '/en' },
            { source: '/:path((?!en|ru|_next|api|favicon.ico).*)', destination: '/en/:path' },
          ];
        },
      }
    : { output: 'export' as const }),
  images: { unoptimized: true },
  // The root layout is app/[locale]/layout.tsx, so the 404 page is app/global-not-found.tsx.
  experimental: { globalNotFound: true },
  transpilePackages: ['@stw/shared'],
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
};

export default withNextIntl(nextConfig);
