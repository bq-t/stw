'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import type { L } from '@/data/questline';
import {
  CHALLENGE_TIPS,
  CHALLENGES,
  SIDE_GROUPS,
  SIDE_QUESTS,
  questVbucks,
  seriesVbucks,
  stageVbucks,
  vbucksSources,
  type ChallengeSeries,
  type SideGroupId,
  type SideQuest,
} from '@/data/side-quests';
import { VbucksIcon } from '@/components/missions/VbucksIcon';
import { ObjectiveLine } from '@/components/questline/Objective';
import { QuestRewards } from '@/components/questline/QuestRewards';
import { Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

type Locale = 'en' | 'ru';

function VbucksBadge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      data-rarity="legendary"
      className={cn(
        'reward-tile inline-flex shrink-0 items-center gap-1 rounded-sm px-1.5 py-0.5 text-xs font-extrabold text-white ring-1 ring-[var(--rarity-legendary-hi)] [text-shadow:0_1px_1px_rgb(0_0_0/0.6)]',
        className,
      )}
    >
      <VbucksIcon className="text-white" />
      {children}
    </span>
  );
}

function SideQuestCard({ quest }: { quest: SideQuest }) {
  const vbucks = questVbucks(quest);
  return (
    <li
      id={quest.id}
      className={cn(
        'flex scroll-mt-20 flex-col gap-2 rounded-md border bg-card px-3 py-2.5',
        vbucks > 0 ? 'border-vbucks/60 bg-[var(--vbucks-glow)]' : 'border-border',
      )}
    >
      <h3 className="text-sm leading-tight font-semibold">{quest.name}</h3>
      <ul className="flex flex-col gap-1 text-sm leading-snug text-muted-foreground">
        {quest.objectives.map((o, i) => (
          <li key={i}>
            <ObjectiveLine o={o} />
          </li>
        ))}
      </ul>
      <QuestRewards rewards={quest.rewards} />
    </li>
  );
}

function ChallengeCard({ series }: { series: ChallengeSeries }) {
  const locale = useLocale() as Locale;
  const t = useTranslations('SideQuests');
  const total = seriesVbucks(series);
  const per = stageVbucks(series.stages[0]!);
  const templated = t.has(`series.${series.id}`);
  const tip = CHALLENGE_TIPS[series.id];
  const first = series.stages[0]!;
  const last = series.stages.at(-1)!;

  const stageText = (i: number) => {
    const s = series.stages[i]!;
    if (s.objective) return <ObjectiveLine o={s.objective} />;
    return templated ? t(`series.${series.id}`, { count: s.goal }) : null;
  };

  return (
    <li
      id={series.id}
      className={cn(
        'flex scroll-mt-20 flex-col gap-2 rounded-md border bg-card px-3 py-2.5',
        total > 0 ? 'border-vbucks/60 bg-[var(--vbucks-glow)]' : 'border-border',
      )}
    >
      <header className="flex flex-wrap items-start gap-x-2 gap-y-1">
        <h3 className="min-w-0 flex-1 text-sm leading-tight font-semibold">{series.name}</h3>
        {total > 0 && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <VbucksBadge>{per}</VbucksBadge>
            {t('stagesTotal', { amount: total, count: series.stages.length })}
          </span>
        )}
      </header>
      {templated && series.stages.length > 1 && (
        <p className="text-sm leading-snug text-muted-foreground">
          {t('stage', { n: 1 })}: {t(`series.${series.id}`, { count: first.goal })} →{' '}
          {t('stage', { n: series.stages.length })}:{' '}
          {t(`series.${series.id}`, { count: last.goal })}
        </p>
      )}
      {total === 0 && <QuestRewards rewards={first.rewards} />}
      {tip && (
        <p className="flex gap-1.5 text-xs text-muted-foreground">
          <Lightbulb aria-hidden className="mt-px size-3.5 shrink-0" />
          {tip[locale]}
        </p>
      )}
      <details className="group">
        <summary className="cursor-pointer text-xs text-accent-ui select-none hover:underline">
          {t('allStages', { count: series.stages.length })}
        </summary>
        <ol className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2">
          {series.stages.map((s, i) => (
            <li
              key={i}
              className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-sm bg-surface-2/60 px-2 py-1 text-xs"
            >
              <span className="w-5 shrink-0 text-muted-foreground tabular-nums">{i + 1}.</span>
              <span className="min-w-0 flex-1">{stageText(i)}</span>
              <QuestRewards rewards={s.rewards} />
            </li>
          ))}
        </ol>
      </details>
    </li>
  );
}

/** Side quests and challenges, V-Bucks first: summary, "only V-Bucks" switch, groups. */
export function SideQuestsView() {
  const locale = useLocale() as Locale;
  const t = useTranslations();
  const [onlyVbucks, setOnlyVbucks] = useState(false);

  const zoneName = (id: SideGroupId): L => ({ en: t(`Zone.${id}`), ru: t(`Zone.${id}`) });
  const sources = vbucksSources(zoneName);
  const total = sources.reduce((s, x) => s + x.vbucks, 0);
  const groupTitle = (g: (typeof SIDE_GROUPS)[number]) =>
    g.title ? g.title[locale] : t(`Zone.${g.id}`);

  const challenges = onlyVbucks ? CHALLENGES.filter((c) => seriesVbucks(c) > 0) : CHALLENGES;

  return (
    <div className="flex flex-col gap-5">
      <section
        aria-labelledby="where-vbucks"
        className="rounded-md border border-vbucks/50 bg-card px-3 py-3"
      >
        <h2 id="where-vbucks" className="mb-2 font-display text-sm font-extrabold uppercase">
          {t('SideQuests.whereVbucks')}
        </h2>
        <ul className="flex flex-col divide-y divide-border">
          {sources.map((s) => (
            <li key={s.href} className="flex items-center gap-3 py-1.5 text-sm">
              <a href={s.href} className="min-w-0 flex-1 hover:underline">
                {s.label[locale]}
              </a>
              <span className="hidden text-xs text-muted-foreground sm:inline">
                {s.detail[locale]}
              </span>
              <VbucksBadge className="min-w-16 justify-end">{s.vbucks}</VbucksBadge>
            </li>
          ))}
          <li className="flex items-center gap-3 pt-2 text-sm font-semibold">
            <span className="flex-1">{t('SideQuests.total')}</span>
            <span className="vbucks-glow inline-flex items-center gap-1 font-display font-extrabold">
              <VbucksIcon />
              {total}
            </span>
          </li>
        </ul>
        <p className="mt-2 text-xs text-muted-foreground">{t('Questline.founders')}</p>
      </section>

      <nav
        aria-label={t('SideQuests.sections')}
        className="sticky top-0 z-20 -mx-4 flex flex-wrap items-center gap-1.5 border-b border-border bg-background/95 px-4 py-2 backdrop-blur-sm"
      >
        {[
          { id: 'challenges', label: t('SideQuests.challenges') },
          ...SIDE_GROUPS.map((g) => ({ id: `group-${g.id}`, label: groupTitle(g) })),
        ].map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="skew-tab bg-surface-2 px-3 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <span>{s.label}</span>
          </a>
        ))}
        <button
          type="button"
          aria-pressed={onlyVbucks}
          onClick={() => setOnlyVbucks((v) => !v)}
          className={cn(
            'ml-auto inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-xs font-semibold ring-1 transition-colors',
            onlyVbucks
              ? 'bg-[var(--vbucks-glow)] text-foreground ring-vbucks'
              : 'text-muted-foreground ring-border hover:text-foreground',
          )}
        >
          <VbucksIcon className="size-3.5" />
          {t('SideQuests.onlyVbucks')}
        </button>
      </nav>

      <section
        id="challenges"
        aria-labelledby="h-challenges"
        className="flex scroll-mt-16 flex-col gap-2"
      >
        <h2 id="h-challenges" className="font-display text-base font-extrabold uppercase">
          {t('SideQuests.challenges')}
        </h2>
        <p className="text-sm text-muted-foreground">{t('SideQuests.challengesNote')}</p>
        <ul className="grid grid-cols-1 items-start gap-2 lg:grid-cols-2">
          {challenges.map((c) => (
            <ChallengeCard key={c.id} series={c} />
          ))}
        </ul>
      </section>

      {SIDE_GROUPS.map((g) => {
        const all = SIDE_QUESTS[g.id];
        const quests = onlyVbucks ? all.filter((q) => questVbucks(q) > 0) : all;
        const vbucks = all.reduce((s, q) => s + questVbucks(q), 0);
        if (onlyVbucks && quests.length === 0) return null;
        return (
          <section
            key={g.id}
            id={`group-${g.id}`}
            aria-labelledby={`h-${g.id}`}
            className="flex scroll-mt-16 flex-col gap-2"
          >
            <header
              className={cn(
                'flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-border px-3 py-3',
                g.title ? 'bg-surface-2' : 'zone-header',
              )}
              style={
                g.title
                  ? undefined
                  : ({ '--zone-bg': `url(/images/zones/${g.id}.webp)` } as React.CSSProperties)
              }
            >
              <h2
                id={`h-${g.id}`}
                className="font-display text-base font-extrabold uppercase [text-shadow:0_1px_2px_rgb(0_0_0/0.8)]"
              >
                {groupTitle(g)}
              </h2>
              <span className="ml-auto flex items-center gap-3 text-xs text-foreground/80 [text-shadow:0_1px_2px_rgb(0_0_0/0.8)]">
                {vbucks > 0 && (
                  <span className="vbucks-glow inline-flex items-center gap-1 font-display text-sm font-extrabold">
                    <VbucksIcon />
                    {vbucks}
                  </span>
                )}
                {t('Questline.questsCount', { count: all.length })}
              </span>
            </header>
            {g.note && <p className="text-sm text-muted-foreground">{g.note[locale]}</p>}
            <ul className="grid grid-cols-1 items-start gap-2 md:grid-cols-2 xl:grid-cols-3">
              {quests.map((q) => (
                <SideQuestCard key={q.id} quest={q} />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
