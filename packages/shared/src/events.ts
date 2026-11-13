// Game events for the events board and page (Fishstick stage 4c).
// Epic has no list of events with names: the calendar (fortnite/api/calendar/v1/timeline)
// gives internal flags with dates ("EventFlag.Event_S43_TreasureHuntQuests", 2026-11-01 →
// 2026-12-05). Names come from KNOWN_EVENTS below (edited by hand, flags matched by
// pattern so a new season's flag still matches); dates always come from the calendar.
// Unknown flags are not shown. Season end and the STW event store come from the calendar
// too, the STW event name from its llama in the STW catalog.

export type GameMode = 'br' | 'stw';

export interface KnownEvent {
  /** Matches the calendar flag (eventType). */
  flag: RegExp;
  mode: GameMode;
  name: { en: string; ru: string };
  /** Page on our site with a guide (path, both languages). */
  sitePath?: string;
  /** Card art on the site (path under apps/web/public, portrait 9:14). */
  image?: string;
}

/** Calendar flags we show, with our names. Add new ones here when Epic starts an event. */
export const KNOWN_EVENTS: KnownEvent[] = [
  {
    flag: /^EventFlag\.Event_S\d+_TreasureHuntQuests$/,
    mode: 'br',
    name: { en: 'Treasure Hunt', ru: 'Охота за сокровищами' },
    image: '/images/events/treasure-hunt.webp',
  },
];

/**
 * Where each chapter starts in Epic's running season count (calendar seasonNumber), newest
 * first. Checked against the season table on gadget-style.ru (2026-11-11): chapter 6 = 33..38
 * (the Galactic Battle mini season counts as 35, the Simpsons one as 38), chapter 7 = 39..43,
 * chapter 8 from 2026-12-05. Add a line when a new chapter starts.
 */
const CHAPTER_STARTS: { chapter: number; first: number }[] = [
  { chapter: 8, first: 44 },
  { chapter: 7, first: 39 },
];

/** Season card art by running season number (path under apps/web/public, portrait 9:14). */
const SEASON_IMAGES: Record<number, string> = {
  43: '/images/events/season-43.webp',
};

/**
 * STW card art (path under apps/web/public, portrait 9:14): the event by a word in its name
 * (the name comes from the event llama), the weekly store always the same picture.
 */
const STW_EVENT_IMAGES: [RegExp, string][] = [
  [/fortnitemares/i, '/images/events/fortnitemares.webp'],
];
const STW_WEEKLY_IMAGE = '/images/events/weekly-store.webp';

/** Running season number → "Chapter 7 Season 5"; older seasons keep the plain number. */
export function seasonName(n: number | undefined): { en: string; ru: string } {
  if (!n) return { en: 'Season', ru: 'Сезон' };
  const c = CHAPTER_STARTS.find((x) => n >= x.first);
  if (!c) return { en: `Season ${n}`, ru: `Сезон ${n}` };
  const season = n - c.first + 1;
  return {
    en: `Chapter ${c.chapter} Season ${season}`,
    ru: `Глава ${c.chapter}, сезон ${season}`,
  };
}

export interface CalendarFlag {
  flag: string;
  start: string;
  end: string;
}

export interface Calendar {
  seasonNumber?: number;
  seasonBegin?: string;
  seasonEnd?: string;
  stwEventStoreEnd?: string;
  stwWeeklyStoreEnd?: string;
  flags: CalendarFlag[];
}

/* eslint-disable @typescript-eslint/no-explicit-any -- raw Epic JSON, read defensively */
const iso = (v: unknown) =>
  typeof v === 'string' && Date.parse(v) > Date.parse('2001-01-01') ? v : undefined;

/** calendar/v1/timeline → the client-events state in force at `now`. */
export function parseCalendar(raw: unknown, now: number): Calendar {
  const states = (raw as any)?.channels?.['client-events']?.states;
  if (!Array.isArray(states) || !states.length) throw new Error('calendar: no client-events');
  const current =
    [...states]
      .filter((s) => Date.parse(s?.validFrom) <= now)
      .sort((a, b) => Date.parse(b.validFrom) - Date.parse(a.validFrom))[0] ?? states[0];
  const st = current?.state ?? {};
  const flags: CalendarFlag[] = [];
  for (const e of st.activeEvents ?? []) {
    const start = iso(e?.eventStart);
    const end = iso(e?.eventEnd);
    if (typeof e?.eventType === 'string' && start && end)
      flags.push({ flag: e.eventType.trim(), start, end });
  }
  return {
    seasonNumber: typeof st.seasonNumber === 'number' ? st.seasonNumber : undefined,
    seasonBegin: iso(st.seasonBegin),
    seasonEnd: iso(st.seasonEnd),
    stwEventStoreEnd: iso(st.stwEventStoreEnd),
    stwWeeklyStoreEnd: iso(st.stwWeeklyStoreEnd),
    flags,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export interface GameEvent {
  /** Stable key: the flag, or "season", "stw-event", "stw-weekly". */
  id: string;
  mode: GameMode;
  kind: 'event' | 'season' | 'stw-event' | 'stw-weekly';
  name: { en: string; ru: string };
  start?: string;
  end: string;
  sitePath?: string;
  image?: string;
}

/**
 * Events running at `now`, ending soonest first: known calendar flags, the BR season end,
 * the STW event (name from its llama, `stwEventName`) and the STW weekly store reset.
 */
export function currentEvents(
  cal: Calendar,
  now: number,
  stwEventName?: { en: string; ru: string },
): GameEvent[] {
  const out: GameEvent[] = [];
  const seen = new Set<string>();
  for (const f of cal.flags) {
    if (Date.parse(f.start) > now || Date.parse(f.end) <= now) continue;
    const known = KNOWN_EVENTS.find((k) => k.flag.test(f.flag));
    if (!known || seen.has(known.name.en)) continue;
    seen.add(known.name.en);
    out.push({
      id: f.flag,
      mode: known.mode,
      kind: 'event',
      name: known.name,
      start: f.start,
      end: f.end,
      ...(known.sitePath ? { sitePath: known.sitePath } : {}),
      ...(known.image ? { image: known.image } : {}),
    });
  }
  // The season as the game shows it: the backend's seasonBegin/seasonEnd are padded by a week
  // or so (S43: Oct 25 - Dec 12), while the season's weekly quests run Nov 1 - Dec 5, the
  // in-game dates. They are the fallback when the flag is missing.
  const weekly = cal.flags.find(
    (f) => f.flag === `EventFlag.Event_S${cal.seasonNumber}_WeeklyQuests`,
  );
  const seasonStart = weekly?.start ?? cal.seasonBegin;
  const seasonEnd = weekly?.end ?? cal.seasonEnd;
  if (seasonEnd && Date.parse(seasonEnd) > now)
    out.push({
      id: 'season',
      mode: 'br',
      kind: 'season',
      name: seasonName(cal.seasonNumber),
      ...(cal.seasonNumber && SEASON_IMAGES[cal.seasonNumber]
        ? { image: SEASON_IMAGES[cal.seasonNumber] }
        : {}),
      ...(seasonStart ? { start: seasonStart } : {}),
      end: seasonEnd,
    });
  const stwImage = STW_EVENT_IMAGES.find(([re]) => re.test(stwEventName?.en ?? ''))?.[1];
  if (cal.stwEventStoreEnd && Date.parse(cal.stwEventStoreEnd) > now)
    out.push({
      id: 'stw-event',
      mode: 'stw',
      kind: 'stw-event',
      name: stwEventName ?? { en: 'Event store', ru: 'Ивентовый магазин' },
      ...(stwImage ? { image: stwImage } : {}),
      end: cal.stwEventStoreEnd,
    });
  if (cal.stwWeeklyStoreEnd && Date.parse(cal.stwWeeklyStoreEnd) > now)
    out.push({
      id: 'stw-weekly',
      mode: 'stw',
      kind: 'stw-weekly',
      image: STW_WEEKLY_IMAGE,
      name: { en: 'Weekly store', ru: 'Недельный магазин' },
      end: cal.stwWeeklyStoreEnd,
    });
  return out.sort((a, b) => Date.parse(a.end) - Date.parse(b.end));
}
