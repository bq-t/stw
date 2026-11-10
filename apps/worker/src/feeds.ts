// Data behind the boards and the site's shop page, kept in D1 (service_status table, one
// row per feed): Epic status, BR shop (EN and RU names), STW shop. The cron refreshes
// them; commands and the API read the stored copy.

import {
  fingerprintOf,
  parseBrShop,
  parseStwCatalog,
  rotationDay,
  type BrShop,
  type StwShop,
  currentEvents,
  extractTournamentNames,
  parseCalendar,
  parseTournaments,
  TOURNAMENT_REGIONS,
  type Calendar,
  type GameEvent,
  type Tournament,
  type TournamentNames,
  type TournamentRegion,
} from '@stw/shared';
import { epicClient, fetchCatalog, loginWithDeviceAuth } from '@stw/shared/epic';
import { fetchEpicStatus, statusFingerprint, type EpicStatus } from './bot/status';
import type { Db } from './db';
import type { Env } from './env';
import type { Locale } from './i18n';

export interface Feed<T> {
  data: T;
  fingerprint: string;
  checkedAt: number;
  changedAt: number;
}

export type FeedId =
  | 'epic'
  | 'shop_br_en'
  | 'shop_br_ru'
  | 'shop_stw'
  | 'calendar'
  | 'tournament_names'
  | `tournaments_${TournamentRegion}`;

export async function readFeed<T>(db: Db, id: FeedId): Promise<Feed<T> | null> {
  const row = await db.getServiceStatus(id);
  if (!row) return null;
  return {
    data: JSON.parse(row.json) as T,
    fingerprint: row.fingerprint,
    checkedAt: row.checked_at,
    changedAt: row.changed_at,
  };
}

async function saveFeed<T>(db: Db, id: FeedId, data: T, fingerprint: string, now: number) {
  const prev = await db.getServiceStatus(id);
  const changedAt = !prev || prev.fingerprint !== fingerprint ? now : prev.changed_at;
  await db.saveServiceStatus({
    id,
    fingerprint,
    json: JSON.stringify(data),
    checked_at: now,
    changed_at: changedAt,
  });
  return { data, fingerprint, checkedAt: now, changedAt };
}

// ---------- Epic status ----------

export type KnownStatus = Feed<EpicStatus>;

/** Fetches Epic's status and stores it. */
export async function refreshStatus(db: Db, now: number): Promise<KnownStatus> {
  const status = await fetchEpicStatus();
  return saveFeed(db, 'epic', status, statusFingerprint(status), now);
}

/** The stored status if it is fresh enough, otherwise a new check. */
export async function currentStatus(db: Db, now: number, maxAgeMs: number): Promise<KnownStatus> {
  const feed = await readFeed<EpicStatus>(db, 'epic');
  if (feed && now - feed.checkedAt < maxAgeMs) return feed;
  return refreshStatus(db, now);
}

// ---------- shops ----------

const BR_SHOP_URL = 'https://fortnite-api.com/v2/shop';

export const brFeedId = (locale: Locale): FeedId => (locale === 'ru' ? 'shop_br_ru' : 'shop_br_en');

/** BR shop in the given language; RU falls back to EN until it is fetched. */
export async function readBrShop(db: Db, locale: Locale): Promise<Feed<BrShop> | null> {
  return (
    (await readFeed<BrShop>(db, brFeedId(locale))) ??
    (locale === 'ru' ? readFeed<BrShop>(db, 'shop_br_en') : null)
  );
}

export const readStwShop = (db: Db) => readFeed<StwShop>(db, 'shop_stw');

async function refreshBr(db: Db, locale: Locale, today: string, now: number) {
  const res = await fetch(`${BR_SHOP_URL}?language=${locale}`, {
    headers: { 'User-Agent': 'stw-vbucks-worker' },
  });
  if (!res.ok) throw new Error(`fortnite-api shop: HTTP ${res.status}`);
  const shop = parseBrShop(await res.json());
  // fortnite-api picks up the new shop a few minutes after 00:00 UTC: try again later.
  if (shop.date !== today) return false;
  await saveFeed(db, brFeedId(locale), shop, fingerprintOf(shop.sections), now);
  return true;
}

async function refreshStw(env: Env, db: Db, today: string, now: number) {
  const token = await serviceToken(env);
  const shop = parseStwCatalog(await fetchCatalog(token), today);
  const { date: _date, ...offers } = shop;
  await saveFeed(db, 'shop_stw', shop, fingerprintOf(offers), now);
  return true;
}

/**
 * Refreshes at most one shop per cron run: each is a big JSON (up to 1.4 MB) and the free
 * plan gives 10 ms of CPU per run. Shops reset at 00:00 UTC; until then this is three
 * D1 reads. Returns the feed refreshed, or null.
 * Shop shapes keep `date` as their first field (see `stale`).
 */
export async function refreshShops(env: Env, db: Db, now: number): Promise<FeedId | null> {
  const today = rotationDay(new Date(now));
  const stale = async (id: FeedId) => {
    const row = await db.getServiceStatus(id);
    if (!row) return true;
    // Shops are stored with `date` first: no need to parse 100+ KB to read it.
    return !row.json.startsWith(`{"date":"${today}"`);
  };
  if (await stale('shop_br_en'))
    return (await refreshBr(db, 'en', today, now)) ? 'shop_br_en' : null;
  if (await stale('shop_br_ru'))
    return (await refreshBr(db, 'ru', today, now)) ? 'shop_br_ru' : null;
  if (await stale('shop_stw')) return (await refreshStw(env, db, today, now)) ? 'shop_stw' : null;
  return null;
}

// ---------- tournaments, names, calendar ----------

/** The dedicated Epic account (never a player's). */
function serviceToken(env: Env) {
  return loginWithDeviceAuth(epicClient(env.EPIC_CLIENT), {
    accountId: env.EPIC_ACCOUNT_ID,
    deviceId: env.EPIC_DEVICE_ID,
    secret: env.EPIC_DEVICE_SECRET,
  });
}

const EVENTS_URL =
  'https://events-public-service-live.ol.epicgames.com/api/v1/events/Fortnite/download';
const FN_API = 'https://fngw-mcp-gc-livefn.ol.epicgames.com/fortnite/api';
const NAMES_URL =
  'https://fortnitecontent-website-prod07.ol.epicgames.com/content/api/pages/fortnite-game/tournamentinformation';

export interface RegionTournaments {
  region: TournamentRegion;
  tournaments: Tournament[];
}

export const tournamentsFeedId = (r: TournamentRegion): FeedId => `tournaments_${r}`;

export const readTournaments = (db: Db, r: TournamentRegion) =>
  readFeed<RegionTournaments>(db, tournamentsFeedId(r));
export const readTournamentNames = (db: Db) => readFeed<TournamentNames>(db, 'tournament_names');
export const readCalendar = (db: Db) => readFeed<Calendar>(db, 'calendar');

async function getJson(url: string, token?: string): Promise<unknown> {
  const res = await fetch(url, {
    headers: token ? { Authorization: `bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`${new URL(url).pathname}: HTTP ${res.status}`);
  return res.json();
}

async function refreshRegion(env: Env, db: Db, region: TournamentRegion, now: number) {
  const token = await serviceToken(env);
  const raw = await getJson(
    `${EVENTS_URL}/${token.accountId}?region=${region}&platform=Windows&teamAccountIds=${token.accountId}`,
    token.accessToken,
  );
  const tournaments = parseTournaments(raw, region, now);
  await saveFeed(
    db,
    tournamentsFeedId(region),
    { region, tournaments },
    fingerprintOf(tournaments),
    now,
  );
  // Names of tournaments we have not seen yet (EN and RU pages, no login needed).
  const names = (await readTournamentNames(db))?.data ?? { en: {}, ru: {} };
  const missing = [...new Set(tournaments.map((t) => t.displayId))].filter((id) => !names.en[id]);
  if (missing.length) {
    for (const lang of ['en', 'ru'] as const) {
      const res = await fetch(`${NAMES_URL}?lang=${lang}`);
      if (!res.ok) throw new Error(`tournamentinformation: HTTP ${res.status}`);
      Object.assign(names[lang], extractTournamentNames(await res.text(), missing));
    }
    await saveFeed(db, 'tournament_names', names, fingerprintOf(names), now);
  }
}

async function refreshCalendar(env: Env, db: Db, now: number) {
  const token = await serviceToken(env);
  const cal = parseCalendar(
    await getJson(`${FN_API}/calendar/v1/timeline`, token.accessToken),
    now,
  );
  await saveFeed(db, 'calendar', cal, fingerprintOf(cal), now);
}

const STEPS = [...TOURNAMENT_REGIONS, 'calendar'] as const;
const STEP_MS = 5 * 60 * 1000;

/**
 * Tournaments and the calendar, one item per cron run in turn (each region and the
 * calendar every 40 minutes), a missing one first. Returns what was refreshed.
 */
export async function refreshSchedule(env: Env, db: Db, now: number): Promise<string> {
  let step: (typeof STEPS)[number] | undefined;
  for (const s of STEPS) {
    const id: FeedId = s === 'calendar' ? 'calendar' : tournamentsFeedId(s);
    if (!(await db.getServiceStatus(id))) {
      step = s;
      break;
    }
  }
  step ??= STEPS[Math.floor(now / STEP_MS) % STEPS.length]!;
  if (step === 'calendar') await refreshCalendar(env, db, now);
  else await refreshRegion(env, db, step, now);
  return step;
}

/** Events running now (calendar + the STW event named after its llama). */
export async function readEvents(db: Db, now: number): Promise<GameEvent[] | null> {
  const [cal, stw] = await Promise.all([readCalendar(db), readStwShop(db)]);
  if (!cal) return null;
  const name = stw?.data.eventName;
  return currentEvents(cal.data, now, name ? { en: name, ru: name } : undefined);
}
