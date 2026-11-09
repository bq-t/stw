'use client';

import {
  DEFAULT_FILTERS,
  ZONES,
  compareMissions,
  filtersFromParams,
  filtersToParams,
  matchesFilters,
  type MissionFilters as Filters,
} from '@stw/shared';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Suspense, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { IS_DEMO, fetchHistory, fetchMissions, isStale, refetchDelay } from '@/lib/api';
import { MissionFilters } from './MissionFilters';
import { VbucksStats } from './VbucksStats';
import { ZoneSection } from './ZoneSection';

function Notice({ children }: { children: React.ReactNode }) {
  return <p className="fn-panel py-2 text-sm text-muted-foreground">{children}</p>;
}

function Tracker() {
  const t = useTranslations('Tracker');
  const search = useSearchParams();

  const filters = useMemo(() => filtersFromParams(new URLSearchParams(search)), [search]);
  // Filters only change the query string: native replaceState updates useSearchParams without a
  // navigation. router.replace() would ask the server for "/" again, and since EN "/" is served
  // by a rewrite to /en, Next gets HTML instead of its page data and reloads the whole page.
  const setFilters = (next: Filters) => {
    const q = filtersToParams(next).toString();
    const path = window.location.pathname;
    window.history.replaceState(null, '', q ? `${path}?${q}` : path);
  };

  const missions = useQuery({
    queryKey: ['missions'],
    queryFn: fetchMissions,
    refetchInterval: (query) => refetchDelay(query.state.data),
  });
  const history = useQuery({
    queryKey: ['history'],
    queryFn: fetchHistory,
    refetchInterval: () => refetchDelay(missions.data),
  });

  const byZone = useMemo(() => {
    const list = (missions.data?.missions ?? [])
      .filter((m) => matchesFilters(m, filters))
      .sort(compareMissions);
    return ZONES.map((zone) => ({ zone, missions: list.filter((m) => m.zone === zone) }));
  }, [missions.data, filters]);

  const shown = byZone.reduce((s, z) => s + z.missions.length, 0);
  // Zone cards share the width: 1 zone = full width (missions in 3 columns), 2 = two columns, …
  const visible = byZone.filter((z) => z.missions.length > 0);
  const wide = visible.length === 1;
  const zoneCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4',
  }[visible.length];

  return (
    <div className="flex flex-col gap-3">
      {IS_DEMO && <Notice>{t('demo')}</Notice>}
      {missions.data && isStale(missions.data) && <Notice>{t('updating')}</Notice>}
      {missions.isError && !missions.data && <Notice>{t('error')}</Notice>}

      <VbucksStats
        history={history.data}
        today={missions.data?.date}
        todayTotal={missions.data?.vbucksTotal}
        onFarm={() => setFilters({ ...filters, alert: 'vbucks' })}
      />
      <MissionFilters value={filters} onChange={setFilters} />

      {!missions.data ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-72" />
          ))}
        </div>
      ) : shown === 0 ? (
        <div className="results-in flex flex-col items-center gap-5 py-10 text-center">
          {/* Plain <img>: static export, local files. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/fishstick-404.webp"
            alt=""
            width={200}
            height={200}
            className="size-48"
          />
          <p className="fn-title text-3xl">{t('empty')}</p>
          <button type="button" className="fn-button" onClick={() => setFilters(DEFAULT_FILTERS)}>
            <span>{t('resetFilters')}</span>
          </button>
        </div>
      ) : (
        // Keyed by the filters, so every filter change replays a short fade-in: filtering is
        // instant and local, this only shows that the list changed.
        <div key={search.toString()} className={`results-in grid items-start gap-3 ${zoneCols}`}>
          {visible.map(({ zone, missions: list }) => (
            <ZoneSection key={zone} zone={zone} missions={list} wide={wide} />
          ))}
        </div>
      )}
    </div>
  );
}

export function TrackerView() {
  // useSearchParams needs a Suspense boundary in a static export.
  return (
    <Suspense>
      <Tracker />
    </Suspense>
  );
}
