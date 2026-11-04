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
      <header
        className="zone-header flex items-center gap-3 border-b border-border px-3 py-2.5"
        style={{ '--zone-bg': `url(/images/zones/${zone}.webp)` } as React.CSSProperties}
      >
        <h2
          id={`zone-${zone}`}
          className="font-display text-sm font-extrabold uppercase [text-shadow:0_1px_2px_rgb(0_0_0/0.8)]"
        >
          {t(`Zone.${zone}`)}
        </h2>
        <span className="ml-auto flex items-center gap-3">
          {vbucks > 0 && (
            <span className="vbucks-glow inline-flex items-center gap-1 font-display text-sm font-extrabold">
              <VbucksIcon />
              {vbucks}
            </span>
          )}
          <span className="text-xs text-foreground/80 [text-shadow:0_1px_2px_rgb(0_0_0/0.8)]">
            {t('Tracker.missionsCount', { count: missions.length })}
          </span>
        </span>
      </header>
      <ul
        className={cn(
          'gap-1.5 p-2',
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
