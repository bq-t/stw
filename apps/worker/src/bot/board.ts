// Epic status kept in D1 + the status boards posted with /setup status.

import type { Db, GuildRow } from '../db';
import { localeOf } from '../i18n';
import {
  DiscordApiError,
  DISCORD_UNKNOWN_CHANNEL,
  DISCORD_UNKNOWN_MESSAGE,
  discordApi,
} from './api';
import { buildStatusMessage, fetchEpicStatus, statusFingerprint, type EpicStatus } from './status';

const STATUS_ID = 'epic';

export interface KnownStatus {
  status: EpicStatus;
  fingerprint: string;
  changedAt: number;
}

/**
 * Fetches Epic's status and stores it. Boards are not touched here: the cron calls
 * updateBoards() with its own request budget.
 */
export async function refreshStatus(db: Db, now: number): Promise<KnownStatus> {
  const status = await fetchEpicStatus();
  const fingerprint = statusFingerprint(status);
  const prev = await db.getServiceStatus(STATUS_ID);
  const changedAt = !prev || prev.fingerprint !== fingerprint ? now : prev.changed_at;
  await db.saveServiceStatus({
    id: STATUS_ID,
    fingerprint,
    json: JSON.stringify(status),
    checked_at: now,
    changed_at: changedAt,
  });
  return { status, fingerprint, changedAt };
}

/** The stored status if it is fresh enough, otherwise a new check. */
export async function currentStatus(db: Db, now: number, maxAgeMs: number): Promise<KnownStatus> {
  const row = await db.getServiceStatus(STATUS_ID);
  if (row && now - row.checked_at < maxAgeMs) {
    return {
      status: JSON.parse(row.json) as EpicStatus,
      fingerprint: row.fingerprint,
      changedAt: row.changed_at,
    };
  }
  return refreshStatus(db, now);
}

export function boardLocale(guild: GuildRow) {
  return localeOf(guild.locale);
}

/**
 * Edits up to `limit` boards that do not show the current status yet. Boards left over
 * (many servers) are picked up by the next cron run. Returns the number of requests made.
 */
export async function updateBoards(
  token: string,
  db: Db,
  known: KnownStatus,
  now: number,
  limit: number,
): Promise<number> {
  const boards = await db.staleBoards(known.fingerprint, limit);
  for (const g of boards) {
    try {
      await discordApi(
        token,
        'PATCH',
        `/channels/${g.status_channel_id}/messages/${g.status_message_id}`,
        buildStatusMessage(known.status, known.changedAt, boardLocale(g)),
      );
      await db.setBoardFingerprint(g.id, known.fingerprint, now);
    } catch (err) {
      // Message or channel deleted: forget the board. Anything else (lost permissions,
      // Discord hiccup): skip until the next status change, so one broken board cannot
      // hold the queue.
      if (
        err instanceof DiscordApiError &&
        (err.code === DISCORD_UNKNOWN_MESSAGE || err.code === DISCORD_UNKNOWN_CHANNEL)
      ) {
        await db.setStatusBoard(g.id, g.locale, null, null, now);
      } else {
        console.error('status board', g.id, err);
        await db.setBoardFingerprint(g.id, known.fingerprint, now);
      }
    }
  }
  return boards.length;
}
