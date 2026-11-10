// What each board kind shows: built from the stored feeds (feeds.ts).

import { fingerprintOf, TOURNAMENT_REGIONS, type TournamentRegion } from '@stw/shared';
import type { BoardKind, Db } from '../db';
import {
  readBrShop,
  readEvents,
  readStwShop,
  readTournamentNames,
  readTournaments,
  type KnownStatus,
} from '../feeds';
import type { Locale } from '../i18n';
import APP_EMOJIS from './app-emojis.json';
import type { BoardSource } from './boards';
import { brShopPages, stwShopPages } from './shop';
import { buildStatusMessage } from './status';
import { eventsPage, tournamentsPage, tournamentsShown } from './tournaments';

export const statusSource = (known: KnownStatus): BoardSource => ({
  kind: 'status',
  fingerprint: known.fingerprint,
  pages: (locale) => [buildStatusMessage(known.data, known.changedAt, locale)],
});

/** BR shop in both languages (RU names come from a separate fetch). Null until loaded. */
export async function brShopSource(db: Db, siteUrl: string, now: number) {
  const [en, ru] = await Promise.all([readBrShop(db, 'en'), readBrShop(db, 'ru')]);
  if (!en) return null;
  const byLocale = { en, ru: ru ?? en };
  return {
    kind: 'shop_br',
    fingerprint: fingerprintOf(`${en.fingerprint}|${byLocale.ru.fingerprint}`),
    pages: (locale: Locale) =>
      brShopPages(byLocale[locale].data, locale, siteUrl, now, APP_EMOJIS.vbucks),
  } satisfies BoardSource;
}

export async function stwShopSource(db: Db, siteUrl: string) {
  const stw = await readStwShop(db);
  if (!stw) return null;
  return {
    kind: 'shop_stw',
    fingerprint: stw.fingerprint,
    pages: (locale: Locale) => stwShopPages(stw.data, locale, siteUrl),
  } satisfies BoardSource;
}

export function shopSource(
  db: Db,
  kind: Extract<BoardKind, 'shop_br' | 'shop_stw'>,
  siteUrl: string,
  now: number,
): Promise<BoardSource | null> {
  return kind === 'shop_br' ? brShopSource(db, siteUrl, now) : stwShopSource(db, siteUrl);
}

/** Upcoming tournaments of a region. Null until the region is loaded. */
export async function tournamentsSource(
  db: Db,
  region: TournamentRegion,
  siteUrl: string,
  now: number,
): Promise<BoardSource | null> {
  const [feed, names] = await Promise.all([readTournaments(db, region), readTournamentNames(db)]);
  if (!feed) return null;
  const list = feed.data.tournaments;
  return {
    kind: `tournaments:${region}`,
    // Sessions drop off as they end: the fingerprint follows what the board shows now.
    fingerprint: fingerprintOf(tournamentsShown(list, names?.data, now)),
    pages: (locale: Locale) => [tournamentsPage(region, list, names?.data, locale, siteUrl, now)],
  };
}

export async function eventsSource(
  db: Db,
  siteUrl: string,
  now: number,
): Promise<BoardSource | null> {
  const events = await readEvents(db, now);
  if (!events) return null;
  return {
    kind: 'events',
    fingerprint: fingerprintOf(events.map((e) => [e.id, e.end, e.name])),
    pages: (locale: Locale) => [eventsPage(events, locale, siteUrl)],
  };
}

/** Sources of every board kind the cron keeps up to date (status aside). */
export async function scheduledSources(db: Db, siteUrl: string, now: number) {
  const list = await Promise.all([
    brShopSource(db, siteUrl, now),
    stwShopSource(db, siteUrl),
    eventsSource(db, siteUrl, now),
    ...TOURNAMENT_REGIONS.map((r) => tournamentsSource(db, r, siteUrl, now)),
  ]);
  return list.filter((x): x is BoardSource => x !== null);
}
