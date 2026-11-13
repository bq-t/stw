'use client';

import { isTournamentRegion, type GameMode, type TournamentRegion } from '@stw/shared';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Suspense } from 'react';
import { LegacyRedirect } from '@/components/layout/LegacyRedirect';
import { IS_DEMO } from '@/lib/api';
import { EventsList } from './EventsList';
import { TournamentsView } from './TournamentsView';

function RegionTournaments() {
  const search = useSearchParams();
  const r = search.get('region');
  const region: TournamentRegion = isTournamentRegion(r) ? r : 'EU';
  // Query-string state through native replaceState (see TrackerView).
  const onRegion = (next: TournamentRegion) => {
    const q = new URLSearchParams(search);
    q.set('region', next);
    window.history.replaceState(null, '', `${window.location.pathname}?${q}`);
  };
  return <TournamentsView region={region} onRegion={onRegion} />;
}

/** Battle Royale tournaments by region (/battle-royale/tournaments?region=EU). */
export function Tournaments() {
  const t = useTranslations('Events');
  if (IS_DEMO) return <p className="text-white/80">{t('demo')}</p>;
  // useSearchParams needs a Suspense boundary in a static export.
  return (
    <Suspense>
      <RegionTournaments />
    </Suspense>
  );
}

/**
 * Events of one mode (/pve/events, /battle-royale/events). The old tournaments tab,
 * `/events?tab=tournaments&region=…`, goes to the BR tournaments.
 */
export function ModeEvents({ mode }: { mode: GameMode }) {
  const t = useTranslations('Events');
  return (
    <>
      {mode === 'stw' && (
        <LegacyRedirect
          to={(q) => {
            if (q.get('tab') !== 'tournaments') return null;
            const region = q.get('region');
            return isTournamentRegion(region)
              ? `/battle-royale/tournaments?region=${region}`
              : '/battle-royale/tournaments';
          }}
        />
      )}
      {IS_DEMO ? <p className="text-white/80">{t('demo')}</p> : <EventsList mode={mode} />}
    </>
  );
}
