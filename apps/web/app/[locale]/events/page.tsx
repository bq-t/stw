import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { alternatesFor } from '@/lib/site';
import { EventsView } from '@/components/events/EventsView';

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/events'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Events' });
  return {
    title: t('title'),
    description: t('metaDescription'),
    alternates: alternatesFor('/events', locale as Locale),
  };
}

export default async function EventsPage({ params }: PageProps<'/[locale]/events'>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Events');
  return (
    <article className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-2xl font-extrabold uppercase">{t('title')}</h1>
        <p className="text-muted-foreground">{t('intro')}</p>
      </header>
      <EventsView />
    </article>
  );
}
