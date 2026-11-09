// Epic status kept in D1 + the status boards posted with /setup status.

import type { Db, GuildRow } from '../db';
import type { Env } from '../env';
import { localeOf } from '../i18n';
import {
  DiscordApiError,
  DISCORD_UNKNOWN_CHANNEL,
  DISCORD_UNKNOWN_MESSAGE,
  discordApi,
} from './api';
import { buildStatusMessage, fetchEpicStatus, statusFingerprint, type EpicStatus } from './status';

const STATUS_ID = 'epic';
/** Edits per cron run: keeps us under the 50 subrequests of the free plan. */
const MAX_BOARD_EDITS = 40;

export interface KnownStatus {
  status: EpicStatus;
  changedAt: number;
}

/** Fetches Epic's status, stores it, and edits every board when it changed. */
export async function refreshStatus(env: Env, db: Db, now: number): Promise<KnownStatus> {
  const status = await fetchEpicStatus();
  const fingerprint = statusFingerprint(status);
  const prev = await db.getServiceStatus(STATUS_ID);
  const changed = !prev || prev.fingerprint !== fingerprint;
  const changedAt = changed ? now : prev.changed_at;
  await db.saveServiceStatus({
    id: STATUS_ID,
    fingerprint,
    json: JSON.stringify(status),
    checked_at: now,
    changed_at: changedAt,
  });
  // First check ever: nothing posted can be out of date yet.
  if (changed && prev && env.DISCORD_BOT_TOKEN) {
    await updateBoards(env.DISCORD_BOT_TOKEN, db, { status, changedAt }, now);
  }
  return { status, changedAt };
}

/** The stored status if it is fresh enough, otherwise a new check. */
export async function currentStatus(
  env: Env,
  db: Db,
  now: number,
  maxAgeMs: number,
): Promise<KnownStatus> {
  const row = await db.getServiceStatus(STATUS_ID);
  if (row && now - row.checked_at < maxAgeMs) {
    return { status: JSON.parse(row.json) as EpicStatus, changedAt: row.changed_at };
  }
  return refreshStatus(env, db, now);
}

export function boardLocale(guild: GuildRow) {
  return localeOf(guild.locale);
}

async function updateBoards(token: string, db: Db, known: KnownStatus, now: number) {
  const boards = (await db.statusBoards()).slice(0, MAX_BOARD_EDITS);
  for (const g of boards) {
    try {
      await discordApi(
        token,
        'PATCH',
        `/channels/${g.status_channel_id}/messages/${g.status_message_id}`,
        buildStatusMessage(known.status, known.changedAt, boardLocale(g)),
      );
    } catch (err) {
      // Message or channel deleted: forget the board. Anything else: try again next change.
      if (
        err instanceof DiscordApiError &&
        (err.code === DISCORD_UNKNOWN_MESSAGE || err.code === DISCORD_UNKNOWN_CHANNEL)
      ) {
        await db.setStatusBoard(g.id, g.locale, null, null, now);
      } else {
        console.error('status board', g.id, err);
      }
    }
  }
}
