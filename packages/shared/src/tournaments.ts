// BR tournaments (Fishstick stage 4c). Two sources, checked 2026-11-10 (fixtures/events-*.json,
// tournamentinformation.json):
//   events-public-service-live …/events/Fortnite/download/{accountId}?region=EU&platform=Windows
//     → events with their sessions (eventWindows), any account's token;
//   content pages fortnite-game/tournamentinformation?lang=en|ru
//     → titles and posters by displayDataId (1+ MB: only the needed ids are cut out).

/** Competitive regions as the events service names them. */
export const TOURNAMENT_REGIONS = ['EU', 'NAC', 'NAW', 'BR', 'ASIA', 'ME', 'OCE'] as const;
export type TournamentRegion = (typeof TOURNAMENT_REGIONS)[number];

export const isTournamentRegion = (v: unknown): v is TournamentRegion =>
  TOURNAMENT_REGIONS.includes(v as TournamentRegion);

export interface TournamentWindow {
  /** eventWindowId: the key reminders are stored by. */
  id: string;
  begin: string;
  end: string;
}

export interface Tournament {
  eventId: string;
  /** Key in the tournament names (tournamentinformation). */
  displayId: string;
  region: TournamentRegion;
  /** RankedCup, CashCup, FNCS, VictoryCup, ShopCup… */
  type?: string;
  /** Touch input only (mobile cups). */
  mobile?: boolean;
  minLevel?: number;
  windows: TournamentWindow[];
}

export interface TournamentName {
  title: string;
  /** "Battle Royale" / "Zero Build" and the like. */
  subtitle?: string;
  poster?: string;
}

/** Display names per language: { en: { displayId: name }, ru: … }. */
export type TournamentNames = Record<'en' | 'ru', Record<string, TournamentName>>;

/* eslint-disable @typescript-eslint/no-explicit-any -- raw Epic JSON, read defensively */

/**
 * Events of one region → tournaments with sessions that have not ended. Hidden and
 * "to be decided" sessions are left out.
 */
export function parseTournaments(
  raw: unknown,
  region: TournamentRegion,
  now: number,
): Tournament[] {
  const events = (raw as any)?.events;
  if (!Array.isArray(events)) throw new Error('events: no events');
  const out: Tournament[] = [];
  for (const e of events) {
    if (!Array.isArray(e?.regions) || !e.regions.includes(region)) continue;
    const windows: TournamentWindow[] = [];
    let mobile = false;
    for (const w of e.eventWindows ?? []) {
      if (w?.visibility !== 'public' || w.isTBD) continue;
      if (!(Date.parse(w.endTime) > now)) continue;
      if (
        Array.isArray(w.additionalRequirements) &&
        w.additionalRequirements.includes('input-touch')
      )
        mobile = true;
      windows.push({
        id: String(w.eventWindowId),
        begin: String(w.beginTime),
        end: String(w.endTime),
      });
    }
    if (!windows.length) continue;
    windows.sort((a, b) => Date.parse(a.begin) - Date.parse(b.begin));
    const level = Number(e.metadata?.minimumAccountLevel);
    out.push({
      eventId: String(e.eventId),
      displayId: String(e.displayDataId ?? ''),
      region,
      type: typeof e.metadata?.tournamentType === 'string' ? e.metadata.tournamentType : undefined,
      ...(mobile ? { mobile } : {}),
      ...(Number.isFinite(level) && level > 0 ? { minLevel: level } : {}),
      windows,
    });
  }
  return out.sort((a, b) => Date.parse(a.windows[0]!.begin) - Date.parse(b.windows[0]!.begin));
}

/** Quote at `i` is a real one, not escaped (an even number of backslashes before it). */
function isQuote(text: string, i: number): boolean {
  if (text.charCodeAt(i) !== 34) return false;
  let n = 0;
  while (i - 1 - n >= 0 && text.charCodeAt(i - 1 - n) === 92) n++;
  return n % 2 === 0;
}

/**
 * The JSON object that contains position `index` (which must be outside a string, e.g. at
 * a key): walks back to its "{" and forward to its "}", skipping braces inside strings.
 */
function objectAround(text: string, index: number): string | null {
  let depth = 0;
  let inString = false;
  let start = -1;
  for (let i = index - 1; i >= 0; i--) {
    if (isQuote(text, i)) inString = !inString;
    else if (inString) continue;
    else if (text.charCodeAt(i) === 125) depth++;
    else if (text.charCodeAt(i) === 123 && depth-- === 0) {
      start = i;
      break;
    }
  }
  if (start < 0) return null;
  depth = 0;
  inString = false;
  for (let i = start; i < text.length; i++) {
    const ch = text.charCodeAt(i);
    if (inString) {
      if (ch === 92) i++;
      else if (ch === 34) inString = false;
    } else if (ch === 34) inString = true;
    else if (ch === 123) depth++;
    else if (ch === 125 && --depth === 0) return text.slice(start, i + 1);
  }
  return null;
}

/**
 * Names of the given display ids from the tournamentinformation page text. The page is
 * over a megabyte; only the objects of the ids asked for are parsed. Keys in the page come
 * before or after tournament_display_id, so the enclosing object is found by brace matching
 * in both directions.
 */
export function extractTournamentNames(
  text: string,
  ids: Iterable<string>,
): Record<string, TournamentName> {
  const out: Record<string, TournamentName> = {};
  const wanted = new Set(ids);
  // One pass over the text; whitespace tolerated (a saved copy may be pretty-printed).
  const key = /"tournament_display_id"\s*:\s*"([^"\\]+)"/g;
  for (let m = key.exec(text); m && wanted.size; m = key.exec(text)) {
    const id = m[1]!;
    if (!wanted.has(id)) continue;
    const json = objectAround(text, m.index);
    if (!json) continue;
    let info: any;
    try {
      info = JSON.parse(json);
    } catch {
      continue;
    }
    const title = String(info.long_format_title || info.title_line_1 || '').trim();
    if (!title) continue;
    wanted.delete(id);
    const subtitle = String(info.title_line_2 || '').trim();
    out[id] = {
      title,
      ...(subtitle ? { subtitle } : {}),
      ...(info.square_poster_image ? { poster: String(info.square_poster_image) } : {}),
    };
  }
  return out;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export interface UpcomingSession {
  tournament: Tournament;
  window: TournamentWindow;
}

/** Sessions that have not ended, earliest first. */
export function upcomingSessions(tournaments: Tournament[], now: number): UpcomingSession[] {
  return tournaments
    .flatMap((t) => t.windows.map((w) => ({ tournament: t, window: w })))
    .filter((s) => Date.parse(s.window.end) > now)
    .sort((a, b) => Date.parse(a.window.begin) - Date.parse(b.window.begin));
}
