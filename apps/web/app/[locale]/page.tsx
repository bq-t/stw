import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { alternatesFor } from '@/lib/site';
import { RotationTimer } from '@/components/missions/RotationTimer';
import { TrackerView } from '@/components/missions/TrackerView';

export async function generateMetadata({ params }: PageProps<'/[locale]'>): Promise<Metadata> {
  const { locale } = await params;
  return { alternates: alternatesFor('/', locale as Locale) };
}

export default async function TrackerPage({ params }: PageProps<'/[locale]'>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Tracker');

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-2xl font-extrabold uppercase">{t('title')}</h1>
        <RotationTimer />
      </div>
      <TrackerView />
    </section>
  );
}
