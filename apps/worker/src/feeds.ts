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

export type FeedId = 'epic' | 'shop_br_en' | 'shop_br_ru' | 'shop_stw';

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
  const token = await loginWithDeviceAuth(epicClient(env.EPIC_CLIENT), {
    accountId: env.EPIC_ACCOUNT_ID,
    deviceId: env.EPIC_DEVICE_ID,
    secret: env.EPIC_DEVICE_SECRET,
  });
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
