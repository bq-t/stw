import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { alternatesFor } from '@/lib/site';
import { ModeEvents } from '@/components/events/EventsView';

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/battle-royale/events'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Events' });
  return {
    title: t('brTitle'),
    description: t('brMetaDescription'),
    alternates: alternatesFor('/battle-royale/events', locale as Locale),
  };
}

export default async function BrEventsPage({
  params,
}: PageProps<'/[locale]/battle-royale/events'>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Events');
  return (
    <article className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-2xl font-extrabold text-white uppercase">
          {t('brTitle')}
        </h1>
        <p className="text-white/80">{t('brIntro')}</p>
      </header>
      <ModeEvents mode="br" />
    </article>
  );
}
