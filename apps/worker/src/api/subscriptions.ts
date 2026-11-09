// Personal subscriptions for the site's Notifications page (logged-in users, DMs only).
// Server subscriptions stay in the bot (/setup alerts): the site does not know the user's servers.
//
//   GET    /api/subscriptions?locale=ru   → { subscriptions, max, installUrl }
//   POST   /api/subscriptions             { filter, locale } → same as GET
//   DELETE /api/subscriptions/:id         → same as GET
//   POST   /api/subscriptions/test        { filter, locale } → { ok, found } | { error, installUrl? }

import { parseSubscriptionFilter, rotationDay } from '@stw/shared';
import { currentUser } from '../auth';
import { DiscordApiError, discordApi, isCannotDm } from '../bot/api';
import { userInstallUrl } from '../bot/commands';
import {
  describeFilter,
  MAX_SUBSCRIPTIONS,
  notificationMessage,
  parseRowFilter,
} from '../bot/subscriptions';
import { Db } from '../db';
import type { Env } from '../env';
import { localeOf, type Locale } from '../i18n';
import { Store } from '../store';

const TEST_INTERVAL_MS = 60 * 1000;

export interface ApiResult {
  status: number;
  body: unknown;
}

const err = (status: number, error: string): ApiResult => ({ status, body: { error } });

async function list(db: Db, env: Env, userId: string, locale: Locale): Promise<ApiResult> {
  const rows = await db.listSubscriptions('user', userId);
  return {
    status: 200,
    body: {
      subscriptions: rows.map((r) => {
        const f = parseRowFilter(r);
        return {
          id: r.id,
          filter: f,
          summary: f ? describeFilter(f, locale) : '?',
          lastSentAt: r.last_sent_at,
          lastError: r.last_error,
        };
      }),
      max: MAX_SUBSCRIPTIONS,
      installUrl: userInstallUrl(env.DISCORD_CLIENT_ID ?? ''),
    },
  };
}

async function readBody(request: Request): Promise<{ filter: unknown; locale: Locale } | null> {
  try {
    const body = (await request.json()) as { filter?: unknown; locale?: string };
    return { filter: body.filter, locale: localeOf(body.locale) };
  } catch {
    return null;
  }
}

export async function handleSubscriptionsApi(
  request: Request,
  env: Env,
  url: URL,
  now: number,
): Promise<ApiResult> {
  if (!env.DB) return err(503, 'not configured');
  const user = await currentUser(request, env, now);
  if (!user) return err(401, 'login required');
  const db = new Db(env.DB);
  const path = url.pathname.replace(/\/$/, '');

  if (request.method === 'GET' && path === '/api/subscriptions')
    return list(db, env, user.id, localeOf(url.searchParams.get('locale')));

  if (request.method === 'POST' && path === '/api/subscriptions') {
    const body = await readBody(request);
    const filter = body && parseSubscriptionFilter(body.filter);
    if (!body || !filter) return err(400, 'bad filter');
    if ((await db.countSubscriptions('user', user.id)) >= MAX_SUBSCRIPTIONS)
      return err(409, 'limit');
    await db.addSubscription(
      {
        owner_type: 'user',
        owner_id: user.id,
        target: 'dm',
        target_id: user.id,
        filter: JSON.stringify(filter),
        locale: body.locale,
      },
      rotationDay(new Date(now)),
      now,
    );
    return list(db, env, user.id, body.locale);
  }

  const del = path.match(/^\/api\/subscriptions\/(\d+)$/);
  if (request.method === 'DELETE' && del) {
    const row = await db.getSubscription(Number(del[1]));
    if (!row || row.owner_type !== 'user' || row.owner_id !== user.id) return err(404, 'not found');
    await db.deleteSubscription(row.id);
    return list(db, env, user.id, localeOf(url.searchParams.get('locale')));
  }

  if (request.method === 'POST' && path === '/api/subscriptions/test') {
    const body = await readBody(request);
    const filter = body && parseSubscriptionFilter(body.filter);
    if (!body || !filter) return err(400, 'bad filter');
    if (!env.DISCORD_BOT_TOKEN) return err(503, 'not configured');
    const snapshot = await new Store(env.MISSIONS).getCurrent();
    if (!snapshot) return err(503, 'no data');
    if (!(await db.claimTestDm(user.id, now, TEST_INTERVAL_MS))) return err(429, 'too soon');
    const note = notificationMessage(filter, snapshot, body.locale, env.SITE_URL);
    try {
      const dm = await discordApi<{ id: string }>(
        env.DISCORD_BOT_TOKEN,
        'POST',
        '/users/@me/channels',
        {
          recipient_id: user.id,
        },
      );
      await discordApi(env.DISCORD_BOT_TOKEN, 'POST', `/channels/${dm.id}/messages`, note.message);
    } catch (e) {
      if (isCannotDm(e)) {
        console.log('test dm refused', e instanceof DiscordApiError ? e.code : '');
        return {
          status: 422,
          body: { error: 'cannot dm', installUrl: userInstallUrl(env.DISCORD_CLIENT_ID ?? '') },
        };
      }
      throw e;
    }
    return { status: 200, body: { ok: true, found: note.found } };
  }

  return err(405, 'method not allowed');
}
