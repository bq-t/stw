// Tournament reminders for the site (logged-in users). Same rows as the bot's picker.
//
//   GET    /api/reminders          → { reminders, max, installUrl }
//   POST   /api/reminders          { region, windowId, offset, all, locale } → same list
//   DELETE /api/reminders/:id      → same list

import { isTournamentRegion } from '@stw/shared';
import { currentUser } from '../auth';
import { userInstallUrl } from '../bot/commands';
import { findSession, MAX_REMINDERS, REMIND_OFFSETS, reminderRows } from '../bot/tournaments';
import { Db } from '../db';
import type { Env } from '../env';
import { readTournaments } from '../feeds';
import type { ApiResult } from './subscriptions';

async function list(db: Db, userId: string, env: Env): Promise<ApiResult> {
  const rows = await db.listReminders(userId);
  return {
    status: 200,
    body: {
      reminders: rows.map((r) => ({
        id: r.id,
        region: r.region,
        windowId: r.window_id,
        displayId: r.display_id,
        beginAt: r.begin_at,
        offset: r.offset_min,
      })),
      max: MAX_REMINDERS,
      installUrl: userInstallUrl(env.DISCORD_CLIENT_ID ?? ''),
    },
  };
}

export async function handleRemindersApi(
  request: Request,
  env: Env,
  url: URL,
  now: number,
): Promise<ApiResult> {
  if (!env.DB) return { status: 503, body: { error: 'not configured' } };
  const user = await currentUser(request, env, now);
  if (!user) return { status: 401, body: { error: 'login required' } };
  const db = new Db(env.DB);
  const path = url.pathname.replace(/\/$/, '');

  if (request.method === 'GET' && path === '/api/reminders') return list(db, user.id, env);

  if (request.method === 'POST' && path === '/api/reminders') {
    const b = (await request.json().catch(() => null)) as {
      region?: unknown;
      windowId?: unknown;
      offset?: unknown;
      all?: unknown;
      locale?: unknown;
    } | null;
    const offset = Number(b?.offset);
    if (
      !b ||
      !isTournamentRegion(b.region) ||
      typeof b.windowId !== 'string' ||
      !REMIND_OFFSETS.includes(offset as (typeof REMIND_OFFSETS)[number])
    )
      return { status: 400, body: { error: 'bad request' } };
    const tournaments = (await readTournaments(db, b.region))?.data.tournaments ?? [];
    const session = findSession(tournaments, b.windowId);
    if (!session || Date.parse(session.window.begin) <= now)
      return { status: 404, body: { error: 'gone' } };
    const locale = b.locale === 'ru' ? 'ru' : 'en';
    const rows = reminderRows(user.id, b.region, session, offset, b.all === true, locale, now);
    if ((await db.countReminders(user.id, now)) + rows.length > MAX_REMINDERS)
      return { status: 409, body: { error: 'limit', max: MAX_REMINDERS } };
    await db.addReminders(rows);
    return list(db, user.id, env);
  }

  const del = /^\/api\/reminders\/(\d+)$/.exec(path);
  if (request.method === 'DELETE' && del) {
    await db.deleteReminder(Number(del[1]), user.id);
    return list(db, user.id, env);
  }
  return { status: 405, body: { error: 'method not allowed' } };
}
