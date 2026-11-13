'use client';

import {
  TOURNAMENT_REGIONS,
  upcomingSessions,
  type TournamentName,
  type TournamentRegion,
  type UpcomingSession,
} from '@stw/shared';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react';
import { CardOverlay } from '@/components/layout/CardOverlay';
import { CardSkeletons } from '@/components/ui/skeleton';
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
    <div
      className="fn-panel flex flex-wrap items-center gap-2 py-2"
      role="group"
      aria-label={t('Events.region')}
    >
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

type Card = { session: UpcomingSession; name: TournamentName | undefined; live: boolean };

const noSubscribe = () => () => {};

/** What a card shows (also the copy that flies into the detail view). */
function CardFace({ card }: { card: Card }) {
  const t = useTranslations('Events');
  const when = useSessionTime();
  const begin = Date.parse(card.session.window.begin);
  return (
    <>
      <span className="tour-card-art">
        {card.name?.poster && (
          // Epic CDN, static export: plain <img>.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={card.name.poster} alt="" loading="lazy" />
        )}
        <span className="tour-card-text">
          <span className="fn-title block text-lg leading-tight">
            {card.name?.title ?? card.session.tournament.displayId}
          </span>
          <span className="mt-0.5 block text-xs text-white/85">
            {card.live ? t('live') : when(begin)}
          </span>
        </span>
      </span>
      {card.live && (
        <span className="tour-card-badge">
          <span className="intro-card-badge">{t('liveBadge')}</span>
        </span>
      )}
    </>
  );
}

/** The open tournament: details on the left, the card on the right (CardOverlay). */
function TournamentDetail({
  card,
  from,
  region,
  reminders,
  onClosed,
}: {
  card: Card;
  /** Where the card sits in the row, to fly from and back to. */
  from: () => DOMRect | null;
  region: TournamentRegion;
  reminders: RemindersResponse | null;
  onClosed: () => void;
}) {
  const t = useTranslations('Events');
  const rel = useRelativeTime();
  const when = useSessionTime();
  const now = useNow();
  const tr = card.session.tournament;
  const begin = Date.parse(card.session.window.begin);
  const title = card.name?.title ?? tr.displayId;

  return (
    <CardOverlay
      label={title}
      from={from}
      slotClassName="tour-slot"
      flyerClassName="tour-card"
      flyer={<CardFace card={card} />}
      onClosed={onClosed}
      info={(close) => (
        <>
          <h2 className="font-display text-2xl font-extrabold text-white uppercase">{title}</h2>
          {card.name?.subtitle && <p className="text-white/80">{card.name.subtitle}</p>}
          <p className="text-sm">
            {card.live ? (
              <span className="font-semibold text-[var(--brand)]">{t('live')}</span>
            ) : (
              <time dateTime={card.session.window.begin}>
                {when(begin)} · {rel(begin, now)}
              </time>
            )}
          </p>
          {(tr.mobile || tr.minLevel) && (
            <p className="text-sm text-muted-foreground">
              {[tr.mobile && t('mobile'), tr.minLevel && t('minLevel', { level: tr.minLevel })]
                .filter(Boolean)
                .join(' · ')}
            </p>
          )}
          <p className="text-xs text-muted-foreground">{t('localTime')}</p>
          {!card.live && reminders && (
            <RemindControl session={card.session} region={region} reminders={reminders} />
          )}
          <button type="button" onClick={close} className="fn-tab mt-2 self-start px-4 py-1">
            <span>{t('close')}</span>
          </button>
        </>
      )}
    />
  );
}

/** Upcoming sessions as upright poster cards in one scrolling row; a card opens its details. */
function TournamentCards({
  cards,
  region,
  reminders,
  stale,
}: {
  cards: Card[];
  region: TournamentRegion;
  reminders: RemindersResponse | null;
  /** The previous region's cards, kept while the new region loads. */
  stale: boolean;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const row = useRef<HTMLUListElement | null>(null);
  // The new region's cards start from the first one, not where the old row was scrolled to.
  useEffect(() => {
    if (!stale) row.current?.scrollTo({ left: 0 });
  }, [region, stale]);
  // Flags for the edge fades: more cards hidden to the left / right of the scroll.
  const fades = (el: HTMLUListElement | null) => {
    row.current = el;
    if (!el) return;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      el.toggleAttribute('data-more-left', el.scrollLeft > 8);
      el.toggleAttribute('data-more-right', el.scrollLeft < max - 8);
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      ro.disconnect();
    };
  };
  const mounted = useSyncExternalStore(
    noSubscribe,
    () => true,
    () => false,
  );
  const card = cards.find((c) => c.session.window.id === open);
  // Looked up when the flight starts and ends, not during render.
  const rectOf = (id: string) => () =>
    document
      .querySelector(`.tour-row [data-window="${CSS.escape(id)}"]`)
      ?.getBoundingClientRect() ?? null;

  return (
    <>
      <ul className="tour-row" ref={fades} data-stale={stale || undefined}>
        {cards.map((c, i) => (
          // A new card (another region's) fades in, one after another.
          <li
            key={c.session.window.id}
            className="tour-card-in"
            style={{ '--i': Math.min(i, 8) } as CSSProperties}
          >
            <button
              type="button"
              data-window={c.session.window.id}
              className="tour-card"
              style={open === c.session.window.id ? { visibility: 'hidden' } : undefined}
              onClick={() => setOpen(c.session.window.id)}
            >
              <CardFace card={c} />
            </button>
          </li>
        ))}
      </ul>
      {mounted && card && (
        <TournamentDetail
          key={card.session.window.id}
          card={card}
          from={rectOf(card.session.window.id)}
          region={region}
          reminders={reminders}
          onClosed={() => setOpen(null)}
        />
      )}
    </>
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
    // Another region: the old cards stay (dimmed) until the new ones come, no skeleton jump.
    placeholderData: keepPreviousData,
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
          <span className="text-white/80">{t('loginToRemind')}</span>
          <button
            data-fish-smile
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
        <CardSkeletons count={6} listClassName="tour-row" cardClassName="tour-card" />
      ) : sessions.length ? (
        <>
          <p className="text-sm text-white/80">{t('localTime')}</p>
          <TournamentCards
            cards={sessions.map((s) => ({
              session: s,
              name: list.data.names[s.tournament.displayId],
              live: Date.parse(s.window.begin) <= now,
            }))}
            region={region}
            reminders={reminders.data ?? null}
            stale={list.isPlaceholderData}
          />
        </>
      ) : (
        <p key={region} className="results-in text-white/80">
          {t('none')}
        </p>
      )}
    </div>
  );
}
