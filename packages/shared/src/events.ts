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
}

/** Calendar flags we show, with our names. Add new ones here when Epic starts an event. */
export const KNOWN_EVENTS: KnownEvent[] = [
  {
    flag: /^EventFlag\.Event_S\d+_TreasureHuntQuests$/,
    mode: 'br',
    name: { en: 'Treasure Hunt', ru: 'Охота за сокровищами' },
  },
];

export interface CalendarFlag {
  flag: string;
  start: string;
  end: string;
}

export interface Calendar {
  seasonNumber?: number;
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
    });
  }
  if (cal.seasonEnd && Date.parse(cal.seasonEnd) > now)
    out.push({
      id: 'season',
      mode: 'br',
      kind: 'season',
      name: cal.seasonNumber
        ? { en: `Season ${cal.seasonNumber}`, ru: `Сезон ${cal.seasonNumber}` }
        : { en: 'Season', ru: 'Сезон' },
      end: cal.seasonEnd,
    });
  if (cal.stwEventStoreEnd && Date.parse(cal.stwEventStoreEnd) > now)
    out.push({
      id: 'stw-event',
      mode: 'stw',
      kind: 'stw-event',
      name: stwEventName ?? { en: 'Event store', ru: 'Ивентовый магазин' },
      end: cal.stwEventStoreEnd,
    });
  if (cal.stwWeeklyStoreEnd && Date.parse(cal.stwWeeklyStoreEnd) > now)
    out.push({
      id: 'stw-weekly',
      mode: 'stw',
      kind: 'stw-weekly',
      name: { en: 'Weekly store', ru: 'Недельный магазин' },
      end: cal.stwWeeklyStoreEnd,
    });
  return out.sort((a, b) => Date.parse(a.end) - Date.parse(b.end));
}
