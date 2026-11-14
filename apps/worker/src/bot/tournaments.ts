// Tournaments and events in Discord: boards, /tournaments, the reminder picker and the DMs.
// The picker is stateless: everything it needs (region, session, offset, "all sessions")
// travels in the component custom_id.

import {
  upcomingSessions,
  type GameEvent,
  type Tournament,
  type TournamentName,
  type TournamentNames,
  type TournamentRegion,
  type UpcomingSession,
} from '@stw/shared';
import type { ReminderRow } from '../db';
import { fmt, messages, sitePath, type Locale } from '../i18n';
import type { BoardPage } from './boards';
import { FLAG_COMPONENTS_V2 } from './status';

const TEXT = 10;
const SECTION = 9;
const THUMBNAIL = 11;
const CONTAINER = 17;
const ACTION_ROW = 1;
const BUTTON = 2;
const STRING_SELECT = 3;
const PRIMARY = 1;
const SECONDARY = 2;
const SUCCESS = 3;
const DANGER = 4;
const LINK = 5;
const ORANGE = 0xf06c1e;

/** Board and /tournaments: sessions starting within this window. */
const BOARD_DAYS = 7;
const BOARD_MAX = 15;
const PICK_MAX = 25;

export const REMIND_OFFSETS = [5, 15, 30, 60, 1440] as const;
export const MAX_REMINDERS = 30;

export const TR_PICK = 'tr:pick:';
export const TR_SELECT = 'tr:sel:';
export const TR_ADD = 'tr:add:';
export const TR_ALL = 'tr:all:';
export const REM_DELETE = 'rem:del:';

const unix = (iso: string | number) =>
  Math.floor((typeof iso === 'number' ? iso : Date.parse(iso)) / 1000);

export function tournamentName(
  names: TournamentNames | undefined,
  displayId: string,
  locale: Locale,
): TournamentName {
  return names?.[locale][displayId] ?? names?.en[displayId] ?? { title: displayId };
}

const fullName = (n: TournamentName) => (n.subtitle ? `${n.title} · ${n.subtitle}` : n.title);

export function boardSessions(tournaments: Tournament[], now: number): UpcomingSession[] {
  const until = now + BOARD_DAYS * 24 * 3600_000;
  return upcomingSessions(tournaments, now)
    .filter((s) => Date.parse(s.window.begin) < until)
    .slice(0, BOARD_MAX);
}

/** Discord counts every component of a message, nested ones too, up to 40. */
const MAX_COMPONENTS = 40;
/** Tournaments (cups) in /tournaments and its board: 4 components each with a poster. */
const MAX_CUPS = 8;
/** Session lines per cup. */
const MAX_CUP_SESSIONS = 3;

/** "6 Nov" / "6 нояб." in UTC: event dates are whole days. */
const shortDate = (at: number, locale: Locale) =>
  new Date(at).toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });

/** Absolute URL of a picture: site paths ("/images/events/…") get the site origin. */
const absolute = (url: string, siteUrl: string) =>
  url.startsWith('/') ? `${siteUrl.replace(/\/$/, '')}${url}` : url;

/** A block as on the site's cards: title and lines on the left, the picture on the right. */
function pictureBlock(lines: string[], image: string | undefined, alt: string) {
  if (!image) return [{ type: TEXT, content: lines.join('\n') }];
  return [
    {
      type: SECTION,
      components: lines.map((content) => ({ type: TEXT, content })),
      accessory: { type: THUMBNAIL, media: { url: image }, description: alt.slice(0, 1024) },
    },
  ];
}

const linkRow = (label: string, url: string) => ({
  type: ACTION_ROW,
  components: [{ type: BUTTON, style: LINK, label, url }],
});

const countComponents = (list: unknown[]): number =>
  list.reduce<number>((n, c) => {
    const o = c as { components?: unknown[]; accessory?: unknown };
    return n + 1 + (o.components ? countComponents(o.components) : 0) + (o.accessory ? 1 : 0);
  }, 0);

/**
 * /tournaments and its board: one block per cup (poster on the right, name, subtitle, the
 * next sessions in local time), soonest first, then the region and the buttons.
 */
export function tournamentsPage(
  region: TournamentRegion,
  tournaments: Tournament[],
  names: TournamentNames | undefined,
  locale: Locale,
  siteUrl: string,
  now: number,
): BoardPage {
  const t = messages(locale).Bot.tournaments;
  const sessions = boardSessions(tournaments, now);
  // Sessions of one cup together, cups in the order of their first session.
  const cups = new Map<string, UpcomingSession[]>();
  for (const s of sessions) {
    const list = cups.get(s.tournament.eventId) ?? [];
    list.push(s);
    cups.set(s.tournament.eventId, list);
  }
  const blocks = [...cups.values()].slice(0, MAX_CUPS).map((list) => {
    const tr = list[0]!.tournament;
    const n = tournamentName(names, tr.displayId, locale);
    const about = [n.subtitle, tr.mobile ? t.mobile : ''].filter(Boolean).join(' · ');
    const when = list.slice(0, MAX_CUP_SESSIONS).map(({ window: w }) => {
      const live = Date.parse(w.begin) <= now;
      return `-# <t:${unix(w.begin)}:F> · ${live ? `<t:${unix(w.end)}:R>` : `<t:${unix(w.begin)}:R>`}`;
    });
    if (list.length > MAX_CUP_SESSIONS) when.push(`-# + ${list.length - MAX_CUP_SESSIONS}`);
    return pictureBlock(
      [`### ${n.title}`, [about, ...when].filter(Boolean).join('\n')],
      n.poster,
      n.title,
    );
  });
  const buttons = {
    type: ACTION_ROW,
    components: [
      ...(sessions.length
        ? [{ type: BUTTON, style: PRIMARY, label: t.remind, custom_id: `${TR_PICK}${region}` }]
        : []),
      {
        type: BUTTON,
        style: LINK,
        label: t.site,
        url: sitePath(siteUrl, locale, `/battle-royale/tournaments?region=${region}`),
      },
    ],
  };
  const body: unknown[] = blocks.length ? blocks.flat() : [{ type: TEXT, content: t.none }];
  body.push({ type: TEXT, content: `-# ${region} · ${t.source}` }, buttons);
  return {
    flags: FLAG_COMPONENTS_V2,
    components: [{ type: CONTAINER, accent_color: ORANGE, components: body }],
    allowed_mentions: { parse: [] },
  };
}

/** What the board shows (sessions and their names), for the board fingerprint. */
export function tournamentsShown(
  tournaments: Tournament[],
  names: TournamentNames | undefined,
  now: number,
) {
  return boardSessions(tournaments, now).map((s) => [
    s.window.id,
    s.window.begin,
    Date.parse(s.window.begin) <= now,
    names?.en[s.tournament.displayId]?.title ?? '',
    names?.ru[s.tournament.displayId]?.title ?? '',
    names?.en[s.tournament.displayId]?.poster ?? '',
  ]);
}

// ---------- events ----------

/**
 * /events and its board: one block per event as on the site's cards (name, dates, the
 * event art on the right), Battle Royale first, then Save the World.
 */
export function eventsPage(events: GameEvent[], locale: Locale, siteUrl: string): BoardPage {
  const t = messages(locale).Bot.events;
  const block = (e: GameEvent) => {
    const end = Date.parse(e.end);
    const relative =
      e.kind === 'season'
        ? fmt(t.season, { end: unix(end) })
        : e.kind === 'stw-weekly'
          ? fmt(t.weekly, { end: unix(end) })
          : fmt(t.ends, { end: unix(end) });
    const dates = e.start
      ? `${shortDate(Date.parse(e.start), locale)} – ${shortDate(end, locale)}`
      : '';
    return pictureBlock(
      [`### ${e.name[locale]}`, [dates, relative].filter(Boolean).join(' · ')],
      e.image ? absolute(e.image, siteUrl) : undefined,
      e.name[locale],
    );
  };
  const sorted = [
    ...events.filter((e) => e.mode === 'br'),
    ...events.filter((e) => e.mode === 'stw'),
  ];
  const footer = linkRow(t.site, sitePath(siteUrl, locale, '/pve/events'));
  const body: unknown[] = [];
  for (const e of sorted) {
    const b = block(e);
    if (countComponents([...body, ...b, footer]) + 1 > MAX_COMPONENTS) break;
    body.push(...b);
  }
  if (!body.length) body.push({ type: TEXT, content: t.none });
  body.push(footer);
  return {
    flags: FLAG_COMPONENTS_V2,
    components: [{ type: CONTAINER, accent_color: ORANGE, components: body }],
    allowed_mentions: { parse: [] },
  };
}

// ---------- reminder picker ----------

/** Step 1: a select of upcoming sessions (UTC in the labels: selects cannot show local time). */
export function pickerMessage(
  region: TournamentRegion,
  tournaments: Tournament[],
  names: TournamentNames | undefined,
  locale: Locale,
  now: number,
) {
  const t = messages(locale).Bot.tournaments;
  const sessions = upcomingSessions(tournaments, now)
    .filter((s) => Date.parse(s.window.begin) > now)
    .slice(0, PICK_MAX);
  if (!sessions.length) return { content: t.none, components: [] };
  const fmtDate = new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : 'en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  });
  return {
    content: t.pick,
    components: [
      {
        type: ACTION_ROW,
        components: [
          {
            type: STRING_SELECT,
            custom_id: `${TR_SELECT}${region}`,
            placeholder: t.pickPlaceholder,
            options: sessions.map(({ tournament: tr, window: w }) => ({
              label: fullName(tournamentName(names, tr.displayId, locale)).slice(0, 100),
              description: `${fmtDate.format(new Date(w.begin))} UTC`,
              value: w.id,
            })),
          },
        ],
      },
    ],
  };
}

/** Step 2: when to remind (offset buttons) and whether every session of the cup counts. */
export function offsetsMessage(
  region: TournamentRegion,
  session: UpcomingSession,
  names: TournamentNames | undefined,
  locale: Locale,
  all: boolean,
) {
  const m = messages(locale).Bot;
  const t = m.tournaments;
  const w = session.window;
  const flag = all ? 1 : 0;
  const ids = REMIND_OFFSETS.map((min) => `${TR_ADD}${region}:${flag}:${min}:${w.id}`);
  // A custom_id holds 100 characters at most: very long session ids get no picker.
  if (ids.some((id) => id.length > 100)) return { content: t.gone, components: [] };
  return {
    content: fmt(t.when, {
      name: fullName(tournamentName(names, session.tournament.displayId, locale)),
      begin: unix(w.begin),
    }),
    components: [
      {
        type: ACTION_ROW,
        components: REMIND_OFFSETS.map((min, n) => ({
          type: BUTTON,
          style: PRIMARY,
          label: m.before[String(min) as keyof typeof m.before],
          custom_id: ids[n],
        })),
      },
      ...(session.tournament.windows.length > 1
        ? [
            {
              type: ACTION_ROW,
              components: [
                {
                  type: BUTTON,
                  style: all ? SUCCESS : SECONDARY,
                  label: all ? t.allOn : t.allOff,
                  custom_id: `${TR_ALL}${region}:${all ? 0 : 1}:${w.id}`,
                },
              ],
            },
          ]
        : []),
    ],
  };
}

/** The session with this window id, if it is still listed. */
export function findSession(
  tournaments: Tournament[],
  windowId: string,
): UpcomingSession | undefined {
  for (const tournament of tournaments) {
    const window = tournament.windows.find((w) => w.id === windowId);
    if (window) return { tournament, window };
  }
  return undefined;
}

/** Reminder rows for a session (or every later session of the cup), not yet started. */
export function reminderRows(
  userId: string,
  region: TournamentRegion,
  session: UpcomingSession,
  offsetMin: number,
  all: boolean,
  locale: Locale,
  now: number,
): Omit<ReminderRow, 'id'>[] {
  const windows = all
    ? session.tournament.windows.filter(
        (w) => Date.parse(w.begin) >= Date.parse(session.window.begin),
      )
    : [session.window];
  return windows
    .filter((w) => Date.parse(w.begin) > now)
    .map((w) => {
      const begin = Date.parse(w.begin);
      return {
        user_id: userId,
        region,
        event_id: session.tournament.eventId,
        window_id: w.id,
        display_id: session.tournament.displayId,
        begin_at: begin,
        offset_min: offsetMin,
        remind_at: begin - offsetMin * 60_000,
        locale,
        created_at: now,
      };
    });
}

export function reminderDm(row: ReminderRow, names: TournamentNames | undefined) {
  const locale: Locale = row.locale === 'ru' ? 'ru' : 'en';
  const t = messages(locale).Bot.tournaments;
  return {
    content: fmt(t.dm, {
      name: fullName(tournamentName(names, row.display_id, locale)),
      region: row.region,
      begin: unix(row.begin_at),
    }),
    allowed_mentions: { parse: [] },
  };
}

/** /reminders: ephemeral list with a delete button per reminder. */
export function remindersList(
  rows: ReminderRow[],
  names: TournamentNames | undefined,
  locale: Locale,
) {
  const m = messages(locale).Bot;
  const t = m.reminders;
  if (!rows.length) return { content: t.empty, components: [] };
  const shown = rows.slice(0, 25);
  const lines = shown.map(
    (r, n) =>
      `**${n + 1}.** ${fmt(t.line, {
        name: fullName(tournamentName(names, r.display_id, locale)),
        region: r.region,
        begin: unix(r.begin_at),
        before: m.before[String(r.offset_min) as keyof typeof m.before] ?? `${r.offset_min} min`,
      })}`,
  );
  const buttons = shown.map((r, n) => ({
    type: BUTTON,
    style: DANGER,
    label: fmt(t.delete, { n: n + 1 }),
    custom_id: `${REM_DELETE}${r.id}`,
  }));
  const components = [];
  for (let k = 0; k < buttons.length; k += 5)
    components.push({ type: ACTION_ROW, components: buttons.slice(k, k + 5) });
  return { content: `### ${t.title}\n${lines.join('\n')}`.slice(0, 2000), components };
}
