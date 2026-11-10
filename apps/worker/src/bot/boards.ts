// Boards: one or more bot messages in a server channel, posted once with /setup and then
// edited in place by the cron whenever the data behind them changes (no new messages, no
// spam). Status, BR shop and STW shop are boards; each source says what its data is
// (fingerprint) and how it looks (pages, one message body per page).

import type { BoardKind, BoardRow, Db } from '../db';
import { localeOf, type Locale } from '../i18n';
import {
  DiscordApiError,
  DISCORD_UNKNOWN_CHANNEL,
  DISCORD_UNKNOWN_MESSAGE,
  discordApi,
} from './api';

export type BoardPage = Record<string, unknown>;

export interface BoardSource {
  kind: BoardKind;
  /** Changes whenever the pages would change (language aside). */
  fingerprint: string;
  pages(locale: Locale): BoardPage[];
}

export const boardMessageIds = (row: BoardRow): string[] => {
  try {
    const ids = JSON.parse(row.message_ids) as unknown;
    return Array.isArray(ids) ? ids.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
};

export const boardLocale = (row: BoardRow): Locale => localeOf(row.locale);

const isGone = (err: unknown) =>
  err instanceof DiscordApiError &&
  (err.code === DISCORD_UNKNOWN_MESSAGE || err.code === DISCORD_UNKNOWN_CHANNEL);

async function deleteMessages(token: string, channelId: string, ids: string[]) {
  for (const id of ids)
    await discordApi(token, 'DELETE', `/channels/${channelId}/messages/${id}`).catch(
      () => undefined,
    );
}

/**
 * Posts a board (/setup). One board of a kind per server: the previous one is removed.
 * Throws the Discord error of the first page (missing permissions and the like), after
 * cleaning up what was already posted.
 */
export async function postBoard(
  token: string,
  db: Db,
  guildId: string,
  channelId: string,
  locale: Locale,
  source: BoardSource,
  now: number,
): Promise<void> {
  const ids: string[] = [];
  try {
    for (const page of source.pages(locale)) {
      const posted = await discordApi<{ id: string }>(
        token,
        'POST',
        `/channels/${channelId}/messages`,
        page,
      );
      ids.push(posted.id);
    }
  } catch (err) {
    await deleteMessages(token, channelId, ids);
    throw err;
  }
  const prev = await db.getBoard(guildId, source.kind);
  if (prev) await deleteMessages(token, prev.channel_id, boardMessageIds(prev));
  await db.saveBoard({
    guild_id: guildId,
    kind: source.kind,
    channel_id: channelId,
    message_ids: JSON.stringify(ids),
    locale,
    fingerprint: source.fingerprint,
    updated_at: now,
  });
}

/**
 * Brings one board up to date: pages are edited in place, missing ones are posted at the
 * end, extra ones deleted. Returns the Discord requests made.
 */
async function syncBoard(
  token: string,
  db: Db,
  row: BoardRow,
  source: BoardSource,
  pages: BoardPage[],
  now: number,
): Promise<number> {
  const old = boardMessageIds(row);
  const ids: string[] = [];
  let requests = 0;
  try {
    for (let n = 0; n < pages.length; n++) {
      requests++;
      if (n < old.length) {
        await discordApi(
          token,
          'PATCH',
          `/channels/${row.channel_id}/messages/${old[n]}`,
          pages[n],
        );
        ids.push(old[n]!);
      } else {
        const posted = await discordApi<{ id: string }>(
          token,
          'POST',
          `/channels/${row.channel_id}/messages`,
          pages[n],
        );
        ids.push(posted.id);
      }
    }
    const extra = old.slice(pages.length);
    requests += extra.length;
    await deleteMessages(token, row.channel_id, extra);
  } catch (err) {
    if (isGone(err)) {
      // The channel or a board message was deleted: the board is gone.
      await deleteMessages(
        token,
        row.channel_id,
        ids.filter((id) => !old.includes(id)),
      );
      await db.deleteBoard(row.guild_id, row.kind);
      return requests;
    }
    // Lost permissions, Discord hiccup: skip until the next change, so one broken board
    // cannot hold the queue. Keep the messages posted so far.
    console.error('board', row.kind, row.guild_id, err);
    ids.push(...old.slice(ids.length));
  }
  await db.saveBoard({
    ...row,
    message_ids: JSON.stringify(ids),
    fingerprint: source.fingerprint,
    updated_at: now,
  });
  return requests;
}

/**
 * Edits stale boards of the given sources (in order) while the request budget lasts.
 * Boards left over are picked up by the next cron run. Returns the requests made.
 */
export async function updateBoards(
  token: string,
  db: Db,
  sources: BoardSource[],
  now: number,
  budget: number,
): Promise<number> {
  let used = 0;
  for (const source of sources) {
    const rendered = new Map<Locale, BoardPage[]>();
    for (;;) {
      const rows = await db.staleBoards(source.kind, source.fingerprint, 10);
      if (!rows.length) break;
      for (const row of rows) {
        const locale = boardLocale(row);
        let pages = rendered.get(locale);
        if (!pages) rendered.set(locale, (pages = source.pages(locale)));
        const cost = Math.max(pages.length, boardMessageIds(row).length);
        if (used + cost > budget) return used;
        used += await syncBoard(token, db, row, source, pages, now);
      }
    }
  }
  return used;
}
