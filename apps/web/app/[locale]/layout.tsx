import type { Metadata } from 'next';
import { Fira_Sans_Extra_Condensed, Onest, Unbounded } from 'next/font/google';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { DiscordButton } from '@/components/layout/DiscordButton';
import { PlexusShine } from '@/components/layout/PlexusShine';
import { RouteProgress } from '@/components/layout/RouteProgress';
import { QueryProvider } from '@/components/QueryProvider';
import { SITE_URL } from '@/lib/site';
import { TooltipProvider } from '@/components/ui/tooltip';
import '../globals.css';

const unbounded = Unbounded({
  variable: '--font-unbounded',
  subsets: ['latin', 'cyrillic'],
  weight: ['600', '800'],
});

/** Heavy condensed italic for Fortnite-style buttons. */
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

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<'/[locale]'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Meta' });
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t('siteName'), template: `%s · ${t('siteName')}` },
    description: t('description'),
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      className={`${unbounded.variable} ${onest.variable} ${fnFont.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <PlexusShine />
        <RouteProgress />
        <NextIntlClientProvider>
          <QueryProvider>
            <TooltipProvider delayDuration={150} skipDelayDuration={400} disableHoverableContent>
              <Header />
              <main className="mx-auto w-full max-w-7xl flex-1 px-4 pt-9 pb-12">{children}</main>
              <Footer />
              <DiscordButton />
            </TooltipProvider>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
