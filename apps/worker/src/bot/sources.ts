// What each board kind shows: built from the stored feeds (feeds.ts).

import { fingerprintOf } from '@stw/shared';
import type { BoardKind, Db } from '../db';
import { readBrShop, readStwShop, type KnownStatus } from '../feeds';
import type { Locale } from '../i18n';
import APP_EMOJIS from './app-emojis.json';
import type { BoardSource } from './boards';
import { brShopPages, stwShopPages } from './shop';
import { buildStatusMessage } from './status';

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
