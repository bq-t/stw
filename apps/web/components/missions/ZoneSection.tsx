'use client';

import { vbucksOf, type Mission, type Zone } from '@stw/shared';
import { useTranslations } from 'next-intl';
import { MissionRow } from './MissionRow';
import { VbucksIcon } from './VbucksIcon';

/** Missions arrive already filtered and sorted (V-Bucks first). */
export function ZoneSection({ zone, missions }: { zone: Zone; missions: Mission[] }) {
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
          <span className="ml-auto inline-flex items-center gap-1 text-sm font-semibold text-vbucks">
            <VbucksIcon />
            {vbucks}
          </span>
        )}
      </header>
      <ul className="divide-y divide-border/60">
        {missions.map((m) => (
          <MissionRow key={m.id} mission={m} />
        ))}
      </ul>
    </section>
  );
}
