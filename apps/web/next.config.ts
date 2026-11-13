import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const isDev = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  // Static HTML on Cloudflare Pages. Mission data comes from the Worker at runtime.
  // In production, EN without a prefix is served by public/_redirects; `next dev`
  // does not read that file, so it gets the same rewrites and redirects here (dev
  // only: they are not allowed together with a static export).
  ...(isDev
    ? {
        // A phone on the home Wi-Fi opening the dev server by the PC's address (192.168.x.x):
        // Next blocks its dev assets for any other host than localhost unless listed.
        allowedDevOrigins: ['192.168.*.*', '10.*.*.*'],
        async redirects() {
          const moved = ['daily-quests', 'questline', 'side-quests', 'faq', 'shop', 'events'];
          return [
            { source: '/', destination: '/pve', permanent: false },
            { source: '/ru', destination: '/ru/pve', permanent: false },
            ...moved.flatMap((p) => [
              { source: `/${p}`, destination: `/pve/${p}`, permanent: false },
              { source: `/ru/${p}`, destination: `/ru/pve/${p}`, permanent: false },
            ]),
            { source: '/br/:path*', destination: '/battle-royale/:path*', permanent: false },
            { source: '/ru/br/:path*', destination: '/ru/battle-royale/:path*', permanent: false },
          ];
        },
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
