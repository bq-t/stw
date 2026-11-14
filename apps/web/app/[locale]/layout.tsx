import type { Metadata, Viewport } from 'next';
import { Fira_Sans_Extra_Condensed, Onest, Unbounded } from 'next/font/google';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { DiscordButton } from '@/components/layout/DiscordButton';
import { ScrollTopButton } from '@/components/layout/ScrollTopButton';
import { INTRO_SCRIPT, IntroGate } from '@/components/layout/IntroGate';
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

/**
 * iOS Safari: the page runs under the status bar and the toolbars (viewport-fit=cover; the
 * header, footer and floating buttons keep clear of them by env(safe-area-inset-*)), and the
 * browser chrome takes the header's orange.
 */
export const viewport: Viewport = {
  themeColor: '#db5814',
  viewportFit: 'cover',
};

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
      data-scroll-behavior="smooth"
      lang={locale}
      className={`${unbounded.variable} ${onest.variable} ${fnFont.variable} h-full antialiased`}
      // INTRO_SCRIPT sets data-intro before hydration.
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <script dangerouslySetInnerHTML={{ __html: INTRO_SCRIPT }} />
        <PlexusShine />
        <RouteProgress />
        <NextIntlClientProvider>
          <QueryProvider>
            <TooltipProvider delayDuration={150} skipDelayDuration={400} disableHoverableContent>
              <Header />
              {/*
                Full-width wrapper that clips sideways: tile badges stick out past the tiles on
                purpose, and at the screen's edge they widened the page (phones zoomed out).
                `clip`, not `hidden`: the sticky section nav keeps working.
              */}
              <div className="flex w-full flex-1 flex-col overflow-x-clip">
                <main className="mx-auto w-full max-w-7xl flex-1 px-4 pt-9 pb-12">{children}</main>
              </div>
              <Footer />
              <DiscordButton />
              <ScrollTopButton />
              <IntroGate />
            </TooltipProvider>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
