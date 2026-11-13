import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { alternatesFor } from '@/lib/site';
import { Tournaments } from '@/components/events/EventsView';

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/battle-royale/tournaments'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Events' });
  return {
    title: t('tournamentsTitle'),
    description: t('tournamentsMetaDescription'),
    alternates: alternatesFor('/battle-royale/tournaments', locale as Locale),
  };
}

export default async function TournamentsPage({
  params,
}: PageProps<'/[locale]/battle-royale/tournaments'>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Events');
  return (
    <article className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-2xl font-extrabold text-white uppercase">
          {t('tournamentsTitle')}
        </h1>
        <p className="text-white/80">{t('tournamentsIntro')}</p>
      </header>
      <Tournaments />
    </article>
  );
}
