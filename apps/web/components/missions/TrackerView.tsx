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
import { usePathname, useRouter } from '@/i18n/navigation';
import { IS_DEMO, fetchHistory, fetchMissions, isStale, refetchDelay } from '@/lib/api';
import { MissionFilters } from './MissionFilters';
import { VbucksStats } from './VbucksStats';
import { ZoneSection } from './ZoneSection';

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-muted-foreground">
      {children}
    </p>
  );
}

function Tracker() {
  const t = useTranslations('Tracker');
  const search = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters = useMemo(() => filtersFromParams(new URLSearchParams(search)), [search]);
  const setFilters = (next: Filters) => {
    const q = filtersToParams(next).toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
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
        <div className="flex flex-col items-start gap-2">
          <p className="text-muted-foreground">{t('empty')}</p>
          <button
            type="button"
            className="text-sm text-accent-ui underline-offset-4 hover:underline"
            onClick={() => setFilters(DEFAULT_FILTERS)}
          >
            {t('resetFilters')}
          </button>
        </div>
      ) : (
        <div className={`grid items-start gap-3 ${zoneCols}`}>
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
