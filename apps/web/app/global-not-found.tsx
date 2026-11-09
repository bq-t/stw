import type { Metadata } from 'next';
import { Fira_Sans_Extra_Condensed, Onest, Unbounded } from 'next/font/google';
import en from '@/messages/en.json';
import { NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { QueryProvider } from '@/components/QueryProvider';
import { DiscordButton } from '@/components/layout/DiscordButton';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { NotFoundView } from '@/components/layout/NotFoundView';
import { PlexusShine } from '@/components/layout/PlexusShine';
import { RouteProgress } from '@/components/layout/RouteProgress';
import './globals.css';

/*
 * One 404 for the whole static export (out/404.html). The root layout lives under [locale],
 * so this page renders its own document; NotFoundView picks EN or RU from the URL in the browser.
 */

const unbounded = Unbounded({
  variable: '--font-unbounded',
  subsets: ['latin', 'cyrillic'],
  weight: ['800'],
});

const fnFont = Fira_Sans_Extra_Condensed({
  variable: '--font-fn',
  subsets: ['latin', 'cyrillic'],
  weight: ['800'],
  style: ['italic'],
});

const onest = Onest({
  variable: '--font-onest',
  subsets: ['latin', 'cyrillic'],
});

export const metadata: Metadata = {
  title: `${en.NotFound.title} · ${en.Meta.siteName}`,
  robots: { index: false },
};

export default function GlobalNotFound() {
  // No [locale] segment here: render the site chrome (header, footer, Discord) in EN.
  setRequestLocale(routing.defaultLocale);
  return (
    <html
      lang="en"
      className={`${unbounded.variable} ${onest.variable} ${fnFont.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <PlexusShine />
        <RouteProgress />
        <NextIntlClientProvider locale={routing.defaultLocale} messages={en}>
          <QueryProvider>
            <Header />
            <NotFoundView />
            <Footer />
            <DiscordButton />
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
