// Delivery of tournament reminders (cron): a DM to each user whose reminder time has come.

import type { Db, ReminderRow } from '../db';
import { readTournamentNames, readTournaments } from '../feeds';
import { discordApi, isCannotDm } from './api';
import { findSession, reminderDm } from './tournaments';

/** The user's DM channel with the bot (cached for site users). Returns [id, requests made]. */
async function dmChannel(token: string, db: Db, userId: string): Promise<[string, number]> {
  const cached = await db.getDmChannel(userId);
  if (cached) return [cached, 0];
  const ch = await discordApi<{ id: string }>(token, 'POST', '/users/@me/channels', {
    recipient_id: userId,
  });
  await db.setDmChannel(userId, ch.id);
  return [ch.id, 1];
}

/**
 * Sends due reminders within `budget` Discord requests. A session Epic moved is
 * rescheduled; a session that is gone or already started is dropped. Returns requests made.
 */
export async function deliverReminders(
  token: string,
  db: Db,
  now: number,
  budget: number,
): Promise<number> {
  if (budget < 2) return 0;
  const due = await db.dueReminders(now, Math.floor(budget / 2));
  if (!due.length) return 0;
  const names = (await readTournamentNames(db))?.data;
  const feeds = new Map<string, Awaited<ReturnType<typeof readTournaments>>>();
  let used = 0;
  for (const r of due) {
    if (used + 2 > budget) break;
    if (!feeds.has(r.region)) feeds.set(r.region, await readTournaments(db, r.region));
    const session = findSession(feeds.get(r.region)?.data.tournaments ?? [], r.window_id);
    const begin = session ? Date.parse(session.window.begin) : r.begin_at;
    if (session && begin !== r.begin_at) {
      await db.rescheduleReminder(r.id, begin, begin - r.offset_min * 60_000);
      if (begin - r.offset_min * 60_000 > now) continue;
    }
    if (begin <= now) {
      await db.removeReminder(r.id);
      continue;
    }
    used += await send(token, db, { ...r, begin_at: begin }, names);
  }
  return used;
}

async function send(
  token: string,
  db: Db,
  r: ReminderRow,
  names: Parameters<typeof reminderDm>[1],
): Promise<number> {
  let used = 0;
  try {
    const [channel, created] = await dmChannel(token, db, r.user_id);
    used += created;
    used++;
    await discordApi(token, 'POST', `/channels/${channel}/messages`, reminderDm(r, names));
  } catch (err) {
    // DMs closed or no mutual server: nothing to retry. Other errors: drop too, so one
    // broken reminder cannot block the queue (it is logged).
    if (!isCannotDm(err)) console.error('reminder', r.id, err);
  }
  await db.removeReminder(r.id);
  return used;
}
