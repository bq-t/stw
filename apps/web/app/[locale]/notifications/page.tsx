import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { alternatesFor } from '@/lib/site';
import { NotificationsView } from '@/components/notifications/NotificationsView';

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/notifications'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Notifications' });
  return {
    title: t('title'),
    description: t('metaDescription'),
    alternates: alternatesFor('/notifications', locale as Locale),
    // A personal page: nothing to index without a login.
    robots: { index: false },
  };
}

export default async function NotificationsPage({ params }: PageProps<'/[locale]/notifications'>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Notifications');
  return (
    <article className="flex max-w-3xl flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-2xl font-extrabold uppercase">{t('title')}</h1>
        <p className="text-muted-foreground">{t('intro')}</p>
      </header>
      <NotificationsView />
    </article>
  );
}
