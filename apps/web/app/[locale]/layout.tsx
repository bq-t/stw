import type { Metadata } from 'next';
import { Onest, Unbounded } from 'next/font/google';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { DiscordBadge } from '@/components/layout/DiscordBadge';
import { QueryProvider } from '@/components/QueryProvider';
import { SITE_URL } from '@/lib/site';
import { TooltipProvider } from '@/components/ui/tooltip';
import '../globals.css';

const unbounded = Unbounded({
  variable: '--font-unbounded',
  subsets: ['latin', 'cyrillic'],
  weight: ['600', '800'],
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
    <html lang={locale} className={`${unbounded.variable} ${onest.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <NextIntlClientProvider>
          <QueryProvider>
            <TooltipProvider delayDuration={150} skipDelayDuration={400} disableHoverableContent>
              <Header />
              <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">{children}</main>
              <Footer />
              <DiscordBadge />
            </TooltipProvider>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
