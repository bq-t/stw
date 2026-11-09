import type { Metadata } from 'next';
import { ZONES } from '@stw/shared';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { alternatesFor } from '@/lib/site';
import { QUESTLINE_CHECKED, questVbucks } from '@/data/questline';
import { QUESTS } from '@/data/questline-quests';
import { QuestlineView } from '@/components/questline/QuestlineView';

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/questline'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Questline' });
  return {
    title: t('title'),
    description: t('metaDescription'),
    alternates: alternatesFor('/questline', locale as Locale),
  };
}

const TOTAL_VBUCKS = ZONES.flatMap((z) => QUESTS[z]).reduce((s, q) => s + questVbucks(q), 0);

export default async function QuestlinePage({ params }: PageProps<'/[locale]/questline'>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Questline');
  const format = await getFormatter();
  const checked = format.dateTime(new Date(`${QUESTLINE_CHECKED}T00:00:00Z`), {
    dateStyle: 'long',
    timeZone: 'UTC',
  });

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
          <h1 className="font-display text-2xl font-extrabold uppercase">{t('title')}</h1>
          <p className="text-xs text-muted-foreground">{t('checked', { date: checked })}</p>
        </div>
        {/* One sentence per line: the intro has \n between sentences, the rest join with \n here. */}
        <p className="max-w-3xl text-sm whitespace-pre-line text-muted-foreground">
          {t('intro', { amount: 100, total: TOTAL_VBUCKS })}
          {`\n${t('founders')}`}
          {locale === 'ru' && `\n${t('namesNote')}`}
        </p>
      </div>
      <QuestlineView />
    </section>
  );
}
