import { ChevronDown, Camera, Link2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import type { DailyQuest } from '@/data/daily-quests';
import shotsManifest from '@/lib/quest-shots.json';
import { GameIcon } from '@/components/missions/GameIcon';
import { VbucksIcon } from '@/components/missions/VbucksIcon';
import { QUEST_ICONS } from './icons';
import { QuestTips } from './QuestTips';

const SHOTS = shotsManifest as Record<string, string[]>;

/** File name without extension: "/images/quests/x/2.webp" → "2". */
const baseName = (src: string) => src.slice(src.lastIndexOf('/') + 1).replace(/\.[^.]+$/, '');

/**
 * Quest card. Collapsed: icon · in-game name and objective · V-Bucks.
 * Expanded (native <details>, works without JS): screenshots of what to look for, tips.
 */
export function QuestCard({ quest, categoryIcon }: { quest: DailyQuest; categoryIcon: string }) {
  const locale = useLocale() as 'en' | 'ru';
  const t = useTranslations();
  const shots = SHOTS[quest.id] ?? [];
  const tips = quest.tips ?? [];
  const hasDetails = shots.length > 0 || tips.length > 0;
  const icon = quest.icon ?? categoryIcon;
  const name = quest.name[locale];

  const head = (
    <>
      <span className="flex size-9 items-center justify-center rounded-sm bg-surface-2">
        <GameIcon
          group="quests"
          names={[icon, categoryIcon]}
          fallback={QUEST_ICONS[icon] ?? QUEST_ICONS[categoryIcon]!}
          className="size-5 text-foreground"
        />
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="text-sm leading-tight font-semibold">{name}</span>
        <span className="text-xs leading-snug text-muted-foreground">
          {quest.objective[locale]}
        </span>
      </span>
      <span className="flex items-center gap-2">
        {shots.length > 0 && (
          <Camera
            aria-label={t('DailyQuests.hasScreenshots', { count: shots.length })}
            className="size-3.5 text-muted-foreground"
          />
        )}
        <span
          data-rarity="legendary"
          aria-label={t('Mission.vbucksAmount', { count: quest.vbucks })}
          className="reward-tile inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-xs font-extrabold text-white ring-1 ring-[var(--rarity-legendary-hi)] [text-shadow:0_1px_1px_rgb(0_0_0/0.6)]"
        >
          <VbucksIcon className="text-white" />
          {quest.vbucks}
        </span>
        {hasDetails ? (
          <ChevronDown
            aria-hidden
            className="size-4 text-muted-foreground transition-transform group-open:rotate-180"
          />
        ) : (
          <span aria-hidden className="size-4" />
        )}
      </span>
    </>
  );

  const headClass = 'grid grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-x-2.5 px-2 py-2';

  if (!hasDetails) {
    return (
      <li
        id={quest.id}
        className="scroll-mt-4 rounded-sm border-l-[3px] border-border bg-surface/40"
      >
        <div className={headClass}>{head}</div>
      </li>
    );
  }

  return (
    <li id={quest.id} className="scroll-mt-4">
      <details
        data-quest={quest.id}
        className="group rounded-sm border-l-[3px] border-border bg-surface/40 open:border-accent-ui open:bg-surface"
      >
        <summary
          className={`${headClass} cursor-pointer list-none rounded-sm hover:bg-surface-2/50 [&::-webkit-details-marker]:hidden`}
        >
          {head}
        </summary>

        <div className="flex flex-col gap-3 px-2 pt-1 pb-3 sm:pl-[3.375rem]">
          {shots.length > 0 && (
            <section aria-label={t('DailyQuests.screenshots')}>
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {shots.map((src, i) => {
                  const caption = quest.captions?.[baseName(src)]?.[locale];
                  const alt = caption ?? t('DailyQuests.screenshotAlt', { name, n: i + 1 });
                  return (
                    <li key={src}>
                      <figure className="flex flex-col gap-1">
                        <a
                          href={src}
                          target="_blank"
                          rel="noopener"
                          title={t('DailyQuests.openFull')}
                          className="block overflow-hidden rounded-sm border border-border bg-surface-2"
                        >
                          {/* Plain <img>: static export, local files. */}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={src}
                            alt={alt}
                            loading="lazy"
                            decoding="async"
                            className="aspect-video w-full object-cover transition-transform hover:scale-[1.02]"
                          />
                        </a>
                        {caption && (
                          <figcaption className="text-xs text-muted-foreground">
                            {caption}
                          </figcaption>
                        )}
                      </figure>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {tips.length > 0 && <QuestTips tips={tips} />}

          <a
            href={`#${quest.id}`}
            className="inline-flex items-center gap-1 self-start text-xs text-muted-foreground hover:text-foreground"
          >
            <Link2 aria-hidden className="size-3.5" />
            {t('DailyQuests.permalink')}
          </a>
        </div>
      </details>
    </li>
  );
}
