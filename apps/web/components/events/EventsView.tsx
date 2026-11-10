'use client';

import { isTournamentRegion, type TournamentRegion } from '@stw/shared';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Suspense } from 'react';
import { IS_DEMO } from '@/lib/api';
import { EventsList } from './EventsList';
import { TournamentsView } from './TournamentsView';

type Tab = 'tournaments' | 'events';

function Tabs() {
  const t = useTranslations('Events');
  const search = useSearchParams();
  const tab: Tab = search.get('tab') === 'events' ? 'events' : 'tournaments';
  const r = search.get('region');
  const region: TournamentRegion = isTournamentRegion(r) ? r : 'EU';
  // Query-string state through native replaceState (see TrackerView).
  const go = (params: Record<string, string>) => {
    const q = new URLSearchParams(search);
    for (const [k, v] of Object.entries(params)) q.set(k, v);
    window.history.replaceState(null, '', `${window.location.pathname}?${q}`);
  };

  return (
    <div className="flex flex-col gap-6">
      <div role="tablist" className="flex flex-wrap gap-2">
        {(['tournaments', 'events'] as const).map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => go({ tab: key })}
            className={`fn-tab px-4 py-1.5 ${tab === key ? 'fn-tab-active' : 'fn-tab-dim'}`}
          >
            <span>{t(key === 'tournaments' ? 'tabTournaments' : 'tabEvents')}</span>
          </button>
        ))}
      </div>
      {tab === 'tournaments' ? (
        <TournamentsView region={region} onRegion={(next) => go({ region: next })} />
      ) : (
        <EventsList />
      )}
    </div>
  );
}

export function EventsView() {
  const t = useTranslations('Events');
  if (IS_DEMO) return <p className="text-muted-foreground">{t('demo')}</p>;
  // useSearchParams needs a Suspense boundary in a static export.
  return (
    <Suspense>
      <Tabs />
    </Suspense>
  );
}
