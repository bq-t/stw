'use client';

import { vbucksOf, type Mission, type Zone } from '@stw/shared';
import { Coins } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { MissionCard } from './MissionCard';

/** Missions arrive already filtered and sorted (V-Bucks first). */
export function ZoneSection({ zone, missions }: { zone: Zone; missions: Mission[] }) {
  const t = useTranslations();
  if (missions.length === 0) return null;
  const vbucks = missions.reduce((s, m) => s + vbucksOf(m), 0);

  return (
    <section aria-labelledby={`zone-${zone}`} className="flex flex-col gap-3">
      <header className="flex items-baseline gap-3 border-b border-border pb-2">
        <h2 id={`zone-${zone}`} className="font-display text-lg font-extrabold uppercase">
          {t(`Zone.${zone}`)}
        </h2>
        <span className="text-sm text-muted-foreground">
          {t('Tracker.missionsCount', { count: missions.length })}
        </span>
        {vbucks > 0 && (
          <span className="ml-auto inline-flex items-center gap-1 text-sm font-semibold text-vbucks">
            <Coins aria-hidden className="size-4" />
            {vbucks}
          </span>
        )}
      </header>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {missions.map((m) => (
          <MissionCard key={m.id} mission={m} />
        ))}
      </div>
    </section>
  );
}
