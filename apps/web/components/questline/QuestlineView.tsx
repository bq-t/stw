'use client';

import { ZONES, type Zone } from '@stw/shared';
import { Check, LocateFixed, RotateCcw } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Fragment, useSyncExternalStore } from 'react';
import { questName, questVbucks, type QuestlineQuest } from '@/data/questline';
import { QUESTS } from '@/data/questline-quests';
import { VbucksIcon } from '@/components/missions/VbucksIcon';
import { cn } from '@/lib/utils';
import { NodeIcon, ObjectiveLine } from './Objective';
import { QuestRewards } from './QuestRewards';

// Progress marker ----------------------------------------------------------------------------

const KEY = 'stw.questline.current';
const EVENT = 'stw-questline-current';

function readMarker(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}
function writeMarker(value: string | null) {
  try {
    if (value) localStorage.setItem(KEY, value);
    else localStorage.removeItem(KEY);
  } catch {
    // Private mode or blocked storage: the marker just does not survive a reload.
  }
  window.dispatchEvent(new Event(EVENT));
}
function subscribe(cb: () => void) {
  window.addEventListener('storage', cb);
  window.addEventListener(EVENT, cb);
  return () => {
    window.removeEventListener('storage', cb);
    window.removeEventListener(EVENT, cb);
  };
}
/** "zone/quest-id" of the quest the player is on, or null. Null during static render. */
function useMarker() {
  return useSyncExternalStore(subscribe, readMarker, () => null);
}

// Flat order of the whole questline ------------------------------------------------------------

interface Entry {
  zone: Zone;
  quest: QuestlineQuest;
  /** Position in the whole questline. */
  index: number;
  key: string;
}

const FLAT: Entry[] = ZONES.flatMap((zone) =>
  QUESTS[zone].map((quest) => ({ zone, quest, key: `${zone}/${quest.id}` })),
).map((e, index) => ({ ...e, index }));
const BY_KEY = new Map(FLAT.map((e) => [e.key, e]));

/** Per zone: its entries and the quests that open a new power level ("Power level 15+" line). */
const ZONE_ROWS = Object.fromEntries(
  ZONES.map((zone) => {
    const entries = FLAT.filter((e) => e.zone === zone);
    const dividers = new Set<string>();
    let lastPl: number | undefined = entries[0]?.quest.pl;
    entries.forEach((e, i) => {
      const pl = e.quest.pl;
      if (pl == null || e.quest.ssd != null) return;
      if (i > 0 && pl !== lastPl) dividers.add(e.key);
      lastPl = pl;
    });
    return [zone, { entries, dividers }];
  }),
) as Record<Zone, { entries: Entry[]; dividers: Set<string> }>;

function progressOf(marker: string | null) {
  const current = marker ? BY_KEY.get(marker) : undefined;
  if (!current) return null;
  const rest = FLAT.slice(current.index);
  const next = rest.find((e) => questVbucks(e.quest) > 0);
  return {
    current,
    next,
    questsToNext: next ? next.index - current.index + 1 : 0,
    vbucksLeft: rest.reduce((s, e) => s + questVbucks(e.quest), 0),
  };
}

// Pieces ---------------------------------------------------------------------------------------

type State = 'done' | 'current' | 'todo';

function QuestNode({
  entry,
  n,
  state,
  isNextVbucks,
  onMark,
}: {
  entry: Entry;
  n: number;
  state: State;
  isNextVbucks: boolean;
  onMark: () => void;
}) {
  const t = useTranslations('Questline');
  const locale = useLocale();
  const { quest } = entry;
  const vbucks = questVbucks(quest);

  return (
    <li
      id={entry.key.replace('/', '-')}
      className="relative grid grid-cols-[2.75rem_minmax(0,1fr)] gap-x-3"
    >
      <div className="ql-track flex justify-center pt-2">
        <span
          className={cn(
            'relative z-1 flex items-center justify-center rounded-full bg-surface-2 ring-2',
            vbucks > 0 ? 'size-11 ring-vbucks' : 'size-9 ring-border',
            state === 'current' && 'ring-accent-ui',
            state === 'done' && 'opacity-50',
          )}
        >
          <NodeIcon
            icon={quest.icon}
            className={cn(vbucks > 0 ? 'size-5 text-vbucks' : 'size-4.5 text-foreground')}
          />
          {state === 'done' && (
            <span className="absolute -right-1 -bottom-1 flex size-4 items-center justify-center rounded-full bg-background ring-1 ring-border">
              <Check aria-label={t('done')} className="size-3 text-muted-foreground" />
            </span>
          )}
        </span>
      </div>

      <article
        className={cn(
          'fn-card mb-2 flex flex-col gap-2 border-l-[3px] bg-surface px-3.5 py-2.5',
          vbucks > 0 ? 'border-vbucks' : 'border-border',
          // Every V-Bucks stage glows; the next one on the player's way also pulses.
          vbucks > 0 && 'vbucks-shape-glow',
          isNextVbucks && 'vbucks-shape-glow-pulse',
          state === 'current' && 'border-accent-ui ring-1 ring-accent-ui',
          state === 'done' && 'opacity-60',
        )}
      >
        <header className="flex flex-wrap items-start gap-x-2 gap-y-1">
          <span className="pt-px text-xs text-muted-foreground tabular-nums">{n}.</span>
          <h3 className="min-w-0 flex-1 text-sm leading-tight font-semibold">
            {questName(quest, locale)}
          </h3>
          {state === 'current' ? (
            <span className="skew-tab bg-accent-ui/15 px-2 py-0.5 text-xs font-semibold text-accent-ui">
              <span>{t('youAreHere')}</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={onMark}
              title={t('iAmHereHint')}
              className="skew-tab bg-surface-2 px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-[#3c3c41] hover:text-foreground"
            >
              <span>{t('iAmHere')}</span>
            </button>
          )}
        </header>
        <ul className="flex flex-col gap-1 text-sm leading-snug text-muted-foreground">
          {quest.objectives.map((o, i) => (
            <li key={i} className="flex gap-2">
              <span
                aria-hidden
                className="mt-[0.45rem] size-1 shrink-0 rounded-full bg-muted-foreground"
              />
              <ObjectiveLine o={o} ssd={quest.ssd} />
            </li>
          ))}
        </ul>
        <QuestRewards rewards={quest.rewards} />
      </article>
    </li>
  );
}

function ZoneTimeline({
  zone,
  stateOf,
  nextKey,
  onMark,
}: {
  zone: Zone;
  stateOf: (e: Entry) => State;
  nextKey: string | undefined;
  onMark: (key: string) => void;
}) {
  const t = useTranslations();
  const { entries, dividers } = ZONE_ROWS[zone];
  const vbucks = entries.reduce((s, e) => s + questVbucks(e.quest), 0);
  const pls = entries.map((e) => e.quest.pl).filter((p): p is number => p != null);

  return (
    <section id={zone} aria-labelledby={`zone-${zone}`} className="flex flex-col gap-3">
      <header
        className="zone-header flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-3"
        style={{ '--zone-bg': `url(/images/zones/${zone}.webp)` } as React.CSSProperties}
      >
        <h2
          id={`zone-${zone}`}
          className="font-display text-base font-extrabold uppercase [text-shadow:0_1px_2px_rgb(0_0_0/0.8)]"
        >
          {t(`Zone.${zone}`)}
        </h2>
        {pls.length > 0 && (
          <span className="text-xs text-foreground/80 [text-shadow:0_1px_2px_rgb(0_0_0/0.8)]">
            {t('Mission.powerLevel')} {Math.min(...pls)}–{Math.max(...pls)}
          </span>
        )}
        <span className="ml-auto flex items-center gap-3 text-xs text-foreground/80 [text-shadow:0_1px_2px_rgb(0_0_0/0.8)]">
          <span className="vbucks-glow inline-flex items-center gap-1 font-display text-sm font-extrabold">
            <VbucksIcon />
            {vbucks}
          </span>
          {t('Questline.questsCount', { count: entries.length })}
        </span>
      </header>

      <ol className="ql-timeline">
        {entries.map((e, i) => {
          const pl = e.quest.pl;
          const divider = dividers.has(e.key);
          return (
            <Fragment key={e.key}>
              {divider && (
                <li
                  aria-hidden
                  className="relative grid grid-cols-[2.75rem_minmax(0,1fr)] gap-x-3 py-1"
                >
                  <span className="ql-track flex justify-center">
                    <span className="relative z-1 rounded-sm bg-surface px-1 font-display text-[10px] font-extrabold text-white">
                      {pl}+
                    </span>
                  </span>
                  <span className="self-center text-xs text-white/80">
                    {t('Questline.plDivider', { pl: pl ?? '' })}
                  </span>
                </li>
              )}
              <QuestNode
                entry={e}
                n={i + 1}
                state={stateOf(e)}
                isNextVbucks={e.key === nextKey}
                onMark={() => onMark(e.key)}
              />
            </Fragment>
          );
        })}
      </ol>
    </section>
  );
}

function ProgressPanel({ progress }: { progress: ReturnType<typeof progressOf> }) {
  const t = useTranslations();
  const locale = useLocale();
  if (!progress) {
    return (
      <p className="fn-panel py-2.5 text-sm text-muted-foreground">{t('Questline.progressHint')}</p>
    );
  }
  const { current, next, questsToNext, vbucksLeft } = progress;
  const anchor = (e: Entry) => `#${e.key.replace('/', '-')}`;
  return (
    <div className="fn-panel flex flex-wrap items-center gap-x-6 gap-y-2 py-2.5">
      <div className="flex min-w-0 flex-col gap-0.5">
        <p className="text-xs text-muted-foreground">
          {t(`Zone.${current.zone}`)} ·{' '}
          <a href={anchor(current)} className="text-accent-ui underline-offset-2 hover:underline">
            {t('Questline.progressAt', { quest: questName(current.quest, locale) })}
          </a>
        </p>
        {next ? (
          <p className="text-sm font-semibold">
            <a href={anchor(next)} className="hover:underline">
              {t('Questline.nextVbucks', {
                amount: questVbucks(next.quest),
                quest: questName(next.quest, locale),
              })}
            </a>{' '}
            <span className="font-normal text-muted-foreground">
              · {t('Questline.questsLeft', { count: questsToNext })}
            </span>
          </p>
        ) : (
          <p className="text-sm font-semibold">{t('Questline.complete')}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="vbucks-glow inline-flex items-center gap-1 font-display text-lg font-extrabold">
          <VbucksIcon className="size-5" />
          {vbucksLeft}
        </span>
        <span className="text-xs text-muted-foreground">{t('Questline.vbucksLeft')}</span>
      </div>
      <div className="ml-auto flex gap-1.5">
        <a
          href={anchor(current)}
          className="skew-tab inline-flex items-center gap-1 bg-surface-2 px-2.5 py-1 text-xs transition-colors hover:bg-[#3c3c41]"
        >
          <LocateFixed aria-hidden className="size-3.5" />
          <span>{t('Questline.goTo')}</span>
        </a>
        <button
          type="button"
          onClick={() => writeMarker(null)}
          className="skew-tab inline-flex items-center gap-1 bg-surface-2 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-[#3c3c41] hover:text-foreground"
        >
          <RotateCcw aria-hidden className="size-3.5" />
          <span>{t('Questline.reset')}</span>
        </button>
      </div>
    </div>
  );
}

// View -----------------------------------------------------------------------------------------

/** Timeline of all four zones with a "you are here" marker kept in the browser. */
export function QuestlineView() {
  const t = useTranslations();
  const marker = useMarker();
  const progress = progressOf(marker);
  const currentIndex = progress?.current.index ?? -1;
  const stateOf = (e: Entry): State =>
    currentIndex < 0
      ? 'todo'
      : e.index < currentIndex
        ? 'done'
        : e.index === currentIndex
          ? 'current'
          : 'todo';

  return (
    <div className="flex flex-col gap-4">
      <nav
        aria-label={t('Questline.zones')}
        className="flex flex-wrap items-center gap-x-3 gap-y-2.5"
      >
        {ZONES.map((z) => (
          <a key={z} href={`#${z}`} className="fn-chip fn-chip-nav">
            <span>{t(`Zone.${z}`)}</span>
          </a>
        ))}
        {progress?.next && (
          <a
            href={`#${progress.next.key.replace('/', '-')}`}
            className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <VbucksIcon className="size-3.5" />
            {t('Questline.questsLeft', { count: progress.questsToNext })}
          </a>
        )}
      </nav>

      <ProgressPanel progress={progress} />

      <div className="flex flex-col gap-6">
        {ZONES.map((z) => (
          <ZoneTimeline
            key={z}
            zone={z}
            stateOf={stateOf}
            nextKey={progress?.next?.key}
            onMark={(key) => writeMarker(key)}
          />
        ))}
      </div>
    </div>
  );
}
