'use client';

import {
  TOURNAMENT_REGIONS,
  upcomingSessions,
  type TournamentName,
  type TournamentRegion,
  type UpcomingSession,
} from '@stw/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ApiError,
  addReminder,
  deleteReminder,
  fetchMe,
  fetchReminders,
  fetchTournaments,
  loginUrl,
  type RemindersResponse,
} from '@/lib/api';
import { useNow, useRelativeTime, useSessionTime } from './time';

const OFFSETS = [5, 15, 30, 60, 1440] as const;
type Offset = (typeof OFFSETS)[number];

/** Region names for the chips: the bot's list (Bot.regions) is shared with the site. */
function RegionChips({
  region,
  onRegion,
}: {
  region: TournamentRegion;
  onRegion: (r: TournamentRegion) => void;
}) {
  const t = useTranslations();
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t('Events.region')}>
      {TOURNAMENT_REGIONS.map((r) => (
        <button
          key={r}
          type="button"
          aria-pressed={r === region}
          onClick={() => onRegion(r)}
          data-state={r === region ? 'on' : 'off'}
          className="fn-chip h-7 px-3 text-sm"
        >
          <span>{t(`Bot.regions.${r}`)}</span>
        </button>
      ))}
    </div>
  );
}

function RemindControl({
  session,
  region,
  reminders,
}: {
  session: UpcomingSession;
  region: TournamentRegion;
  reminders: RemindersResponse;
}) {
  const t = useTranslations('Events');
  const locale = useLocale();
  const client = useQueryClient();
  const [offset, setOffset] = useState<Offset>(30);
  const [all, setAll] = useState(false);
  const add = useMutation({
    mutationFn: () => addReminder({ region, windowId: session.window.id, offset, all, locale }),
    onSuccess: (r) => client.setQueryData(['reminders'], r),
  });
  const set = reminders.reminders.some((r) => r.windowId === session.window.id);
  const many = session.tournament.windows.length > 1;
  const error = add.error instanceof ApiError ? add.error.code : add.isError ? 'error' : null;

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      {set && (
        <span className="font-semibold text-[var(--rarity-uncommon)]">{t('reminderSet')}</span>
      )}
      <label className="flex items-center gap-1.5">
        <span className="text-muted-foreground">{t('remindBefore')}</span>
        <select
          value={offset}
          onChange={(e) => setOffset(Number(e.target.value) as Offset)}
          className="bg-muted px-2 py-1"
        >
          {OFFSETS.map((o) => (
            <option key={o} value={o}>
              {t(`before.${o}`)}
            </option>
          ))}
        </select>
      </label>
      {many && (
        <label className="flex items-center gap-1.5">
          <input type="checkbox" checked={all} onChange={(e) => setAll(e.target.checked)} />
          <span>{t('allSessions')}</span>
        </label>
      )}
      <button
        type="button"
        onClick={() => add.mutate()}
        disabled={add.isPending}
        className="fn-tab fn-tab-active px-3 py-1"
      >
        <span>{t('remind')}</span>
      </button>
      {error && (
        <span className="text-destructive">
          {error === 'limit'
            ? t('limit', { max: reminders.max })
            : error === 'gone'
              ? t('gone')
              : t('error')}
        </span>
      )}
    </div>
  );
}

function SessionRow({
  session,
  name,
  region,
  reminders,
}: {
  session: UpcomingSession;
  name: TournamentName | undefined;
  region: TournamentRegion;
  reminders: RemindersResponse | null;
}) {
  const t = useTranslations('Events');
  const rel = useRelativeTime();
  const when = useSessionTime();
  const now = useNow();
  const begin = Date.parse(session.window.begin);
  const live = begin <= now;
  const tr = session.tournament;
  return (
    <li className="fn-block flex gap-3 p-3">
      {name?.poster && (
        // Epic CDN, static export: plain <img>.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={name.poster} alt="" loading="lazy" className="size-16 shrink-0 object-cover" />
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4">
          <h3 className="font-semibold">
            {name?.title ?? tr.displayId}
            {name?.subtitle && (
              <span className="font-normal text-muted-foreground"> · {name.subtitle}</span>
            )}
          </h3>
          <span className="text-sm">
            {live ? (
              <span className="font-semibold text-[var(--brand)]">{t('live')}</span>
            ) : (
              <time dateTime={session.window.begin}>
                {when(begin)} · {rel(begin, now)}
              </time>
            )}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {[tr.mobile && t('mobile'), tr.minLevel && t('minLevel', { level: tr.minLevel })]
            .filter(Boolean)
            .join(' · ')}
        </p>
        {!live && reminders && (
          <RemindControl session={session} region={region} reminders={reminders} />
        )}
      </div>
    </li>
  );
}

function MyReminders({
  data,
  names,
}: {
  data: RemindersResponse;
  names: Record<string, TournamentName>;
}) {
  const t = useTranslations('Events');
  const client = useQueryClient();
  const when = useSessionTime();
  const del = useMutation({
    mutationFn: deleteReminder,
    onSuccess: (r) => client.setQueryData(['reminders'], r),
  });
  return (
    <section className="fn-block flex flex-col gap-3 p-4">
      <h2 className="font-display text-lg font-extrabold uppercase">{t('myReminders')}</h2>
      {data.reminders.length ? (
        <ul className="flex flex-col gap-1.5 text-sm">
          {data.reminders.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-2">
              <span>
                <span className="font-semibold">{names[r.displayId]?.title ?? r.displayId}</span> (
                {r.region}) · {when(r.beginAt)} · {t(`before.${r.offset}`)}
              </span>
              <button
                type="button"
                onClick={() => del.mutate(r.id)}
                disabled={del.isPending}
                className="fn-tab px-2.5 py-0.5"
              >
                <span>{t('deleteReminder')}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground">{t('noReminders')}</p>
      )}
      <p className="text-xs text-muted-foreground">
        {t('dmNote')}{' '}
        <a href={data.installUrl} target="_blank" rel="noopener noreferrer" className="underline">
          {t('addApp')}
        </a>
      </p>
    </section>
  );
}

export function TournamentsView({
  region,
  onRegion,
}: {
  region: TournamentRegion;
  onRegion: (r: TournamentRegion) => void;
}) {
  const t = useTranslations('Events');
  const locale = useLocale();
  const list = useQuery({
    queryKey: ['tournaments', region, locale],
    queryFn: () => fetchTournaments(region, locale),
    staleTime: 5 * 60 * 1000,
  });
  const me = useQuery({ queryKey: ['me'], queryFn: fetchMe, staleTime: 10 * 60 * 1000 });
  const user = me.data?.user;
  const reminders = useQuery({
    queryKey: ['reminders'],
    queryFn: fetchReminders,
    enabled: Boolean(user),
  });

  const now = useNow();
  const sessions = list.data ? upcomingSessions(list.data.tournaments, now) : [];

  return (
    <div className="flex flex-col gap-5">
      <RegionChips region={region} onRegion={onRegion} />
      {me.data && !user && me.data.loginEnabled && (
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="text-muted-foreground">{t('loginToRemind')}</span>
          <button
            type="button"
            onClick={() => window.location.assign(loginUrl(window.location.href))}
            className="fn-tab fn-tab-active px-3 py-1"
          >
            <span>{t('loginButton')}</span>
          </button>
        </div>
      )}
      {reminders.data && <MyReminders data={reminders.data} names={list.data?.names ?? {}} />}
      {list.isError ? (
        <p className="text-destructive">{t('error')}</p>
      ) : !list.data ? (
        <Skeleton className="h-96 w-full" />
      ) : sessions.length ? (
        <>
          <p className="text-sm text-muted-foreground">{t('localTime')}</p>
          <ul className="flex flex-col gap-2">
            {sessions.map((s) => (
              <SessionRow
                key={s.window.id}
                session={s}
                name={list.data.names[s.tournament.displayId]}
                region={region}
                reminders={reminders.data ?? null}
              />
            ))}
          </ul>
        </>
      ) : (
        <p className="text-muted-foreground">{t('none')}</p>
      )}
    </div>
  );
}
