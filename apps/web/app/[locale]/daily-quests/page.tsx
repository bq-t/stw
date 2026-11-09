import type { Metadata } from 'next';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { alternatesFor } from '@/lib/site';
import { QUEST_CATEGORIES, QUESTS_CHECKED } from '@/data/daily-quests';
import { QuestCategorySection } from '@/components/quests/QuestCategorySection';
import { OpenQuestFromHash } from '@/components/quests/OpenQuestFromHash';

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/daily-quests'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'DailyQuests' });
  return {
    title: t('title'),
    description: t('metaDescription'),
    alternates: alternatesFor('/daily-quests', locale as Locale),
  };
}

export default async function DailyQuestsPage({ params }: PageProps<'/[locale]/daily-quests'>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('DailyQuests');
  const format = await getFormatter();
  const checked = format.dateTime(new Date(`${QUESTS_CHECKED}T00:00:00Z`), {
    dateStyle: 'long',
    timeZone: 'UTC',
  });

  return (
    <section className="flex flex-col gap-4">
      <OpenQuestFromHash />
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
          <h1 className="font-display text-2xl font-extrabold uppercase">{t('title')}</h1>
          <p className="text-xs text-muted-foreground">{t('checked', { date: checked })}</p>
        </div>
        {/* One sentence per line: the message has \n between them. */}
        <p className="max-w-3xl text-sm whitespace-pre-line text-muted-foreground">{t('intro')}</p>
      </div>

      <nav aria-label={t('categories')} className="flex flex-wrap gap-x-3 gap-y-2.5">
        {QUEST_CATEGORIES.map((c) => (
          <a key={c.id} href={`#${c.id}`} className="fn-chip fn-chip-nav">
            <span>{c.name[locale as Locale]}</span>
          </a>
        ))}
      </nav>

      <div className="flex flex-col gap-4">
        {QUEST_CATEGORIES.map((c) => (
          <QuestCategorySection key={c.id} category={c} />
        ))}
      </div>
    </section>
  );
}
