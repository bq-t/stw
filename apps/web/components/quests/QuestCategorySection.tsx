import { useLocale, useTranslations } from 'next-intl';
import { questsOf, type QuestCategory } from '@/data/daily-quests';
import { GameIcon } from '@/components/missions/GameIcon';
import { QUEST_ICONS } from './icons';
import { QuestCard } from './QuestCard';
import { QuestTips } from './QuestTips';

/** Category card: header · rules for every quest of the category · quest cards. */
export function QuestCategorySection({ category }: { category: QuestCategory }) {
  const locale = useLocale() as 'en' | 'ru';
  const t = useTranslations('DailyQuests');
  const quests = questsOf(category.id);
  if (quests.length === 0) return null;

  return (
    <section
      id={category.id}
      aria-labelledby={`cat-${category.id}`}
      className="fn-block flex flex-col overflow-hidden"
    >
      <header className="flex items-center gap-2.5 bg-surface-2 px-3 py-2.5">
        <GameIcon
          group="quests"
          names={[category.icon]}
          fallback={QUEST_ICONS[category.icon]!}
          className="size-4 text-foreground"
        />
        <h2 id={`cat-${category.id}`} className="font-display text-sm font-extrabold uppercase">
          {category.name[locale]}
        </h2>
        <span className="ml-auto text-xs text-muted-foreground">
          {t('questsCount', { count: quests.length })}
        </span>
      </header>

      {category.notes.length > 0 && (
        <div className="px-3 pt-3 pb-1">
          <p className="mb-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {t('categoryNotes')}
          </p>
          <QuestTips tips={category.notes} />
        </div>
      )}

      <ul className="grid grid-cols-1 items-start gap-1.5 px-3 py-2 pb-3 lg:grid-cols-2">
        {quests.map((q) => (
          <QuestCard key={q.id} quest={q} categoryIcon={category.icon} />
        ))}
      </ul>
    </section>
  );
}
