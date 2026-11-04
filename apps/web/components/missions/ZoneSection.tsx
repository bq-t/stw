'use client';

import { vbucksOf, type Mission, type Zone } from '@stw/shared';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { MissionRow } from './MissionRow';
import { VbucksIcon } from './VbucksIcon';

/**
 * Zone card. Missions arrive filtered and sorted by power level.
 * `wide`: full-width card with missions in a 3-column grid, filled row by row (1 2 3 / 4 5 6).
 */
export function ZoneSection({
  zone,
  missions,
  wide = false,
}: {
  zone: Zone;
  missions: Mission[];
  wide?: boolean;
}) {
  const t = useTranslations();
  if (missions.length === 0) return null;
  const vbucks = missions.reduce((s, m) => s + vbucksOf(m), 0);

  return (
    <section
      aria-labelledby={`zone-${zone}`}
      className="flex flex-col overflow-hidden rounded-md border border-border bg-card"
    >
      <header className="flex items-baseline gap-2 border-b border-border px-3 py-2">
        <h2 id={`zone-${zone}`} className="font-display text-sm font-extrabold uppercase">
          {t(`Zone.${zone}`)}
        </h2>
        <span className="text-xs text-muted-foreground">
          {t('Tracker.missionsCount', { count: missions.length })}
        </span>
        {vbucks > 0 && (
          <span className="ml-auto inline-flex items-center gap-1 self-center font-display text-sm font-extrabold text-vbucks [text-shadow:0_0_8px_var(--rarity-legendary)]">
            <VbucksIcon className="drop-shadow-[0_0_6px_var(--rarity-legendary)]" />
            {vbucks}
          </span>
        )}
      </header>
      <ul
        className={cn(
          'gap-1 p-1',
          wide ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'flex flex-col',
        )}
      >
        {missions.map((m) => (
          <MissionRow key={m.id} mission={m} />
        ))}
      </ul>
    </section>
  );
}
