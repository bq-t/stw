import {
  addToHistory,
  alertsFingerprint,
  parseWorldInfo,
  rotationDay,
  type DaySnapshot,
} from '@stw/shared';
import { epicClient, fetchWorldInfo, loginWithDeviceAuth } from '@stw/shared/epic';
import {
  currentUser,
  handleCallback,
  handleLogin,
  isAuthConfigured,
  logout,
  publicUser,
} from './auth';
import { handleEpicApi } from './api/epic';
import { handleSubscriptionsApi } from './api/subscriptions';
import { refreshStatus, updateBoards } from './bot/board';
import { deliverSubscriptions } from './bot/subscriptions';
import { handleInteraction } from './bot/interactions';
import { Db } from './db';
import type { Env } from './env';
import { buildDiscordMessage, postDiscord } from './notify/discord';
import { Store } from './store';

// ---------- scheduled: daily mission snapshot ----------

type RunResult = 'already-saved' | 'stale' | 'saved';

async function runDaily(env: Env, now: Date = new Date()): Promise<RunResult> {
  const store = new Store(env.MISSIONS);
  const today = rotationDay(now);
  if (await store.hasDay(today)) return 'already-saved';

  const token = await loginWithDeviceAuth(epicClient(env.EPIC_CLIENT), {
    accountId: env.EPIC_ACCOUNT_ID,
    deviceId: env.EPIC_DEVICE_ID,
    secret: env.EPIC_DEVICE_SECRET,
  });
  const snapshot = parseWorldInfo(await fetchWorldInfo(token), now);

  // Epic sometimes rotates late: if the alerts are still yesterday's, wait for the next run.
  const previous = await store.getCurrent();
  if (previous && previous.date !== today) {
    const fp = alertsFingerprint(snapshot);
    if (fp !== '' && fp === alertsFingerprint(previous)) {
      await store.updateHealth({ lastStaleAt: now.toISOString() });
      return 'stale';
    }
  }

  const history = addToHistory(await store.getHistory(), snapshot);
  await store.saveDay(snapshot, history);
  if (env.DB) {
    // D1 copy of the day (stage 1: KV is still what the API reads).
    try {
      const db = new Db(env.DB);
      await db.saveSnapshot(snapshot);
      await db.deleteExpiredSessions(now.getTime());
    } catch (err) {
      console.error('d1', err);
    }
  }
  await store.updateHealth({
    lastSuccessAt: now.toISOString(),
    lastSnapshotDate: snapshot.date,
  });

  // Every day, with or without V-Bucks: the channel gets one message per rotation.
  if (env.DISCORD_WEBHOOK_URL) {
    try {
      const message = buildDiscordMessage(snapshot, history, {
        siteUrl: env.SITE_URL,
        vbucksEmoji: env.DISCORD_VBUCKS_EMOJI,
      });
      await postDiscord(env.DISCORD_WEBHOOK_URL, message);
    } catch (err) {
      // A failed notification must not fail the day: the snapshot is already saved.
      console.error('discord', err);
    }
  }
  return 'saved';
}

// ---------- fetch: JSON API for the site ----------

function isAllowedOrigin(origin: string, env: Env): boolean {
  if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;
  return env.ALLOWED_ORIGINS.split(',')
    .map((o) => o.trim())
    .includes(origin);
}

function corsOrigin(request: Request, env: Env): string | null {
  const origin = request.headers.get('Origin');
  return origin && isAllowedOrigin(origin, env) ? origin : null;
}

function json(
  body: unknown,
  init: { status?: number; maxAge?: number; origin: string | null; setCookie?: string },
): Response {
  const headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8' });
  headers.set('Cache-Control', init.maxAge ? `public, max-age=${init.maxAge}` : 'no-store');
  if (init.origin) {
    headers.set('Access-Control-Allow-Origin', init.origin);
    // The site sends the session cookie (localhost:3000 → :8787 in dev).
    headers.set('Access-Control-Allow-Credentials', 'true');
    headers.set('Vary', 'Origin');
  }
  if (init.setCookie) headers.append('Set-Cookie', init.setCookie);
  return new Response(JSON.stringify(body), { status: init.status ?? 200, headers });
}

/** Cache until the snapshot expires; a stale (yesterday's) snapshot only for 5 minutes. */
function snapshotMaxAge(snapshot: DaySnapshot, now: Date): number {
  if (snapshot.date !== rotationDay(now)) return 300;
  const seconds = Math.floor((Date.parse(snapshot.expiresAt) - now.getTime()) / 1000);
  return Math.max(60, Math.min(seconds, 24 * 60 * 60));
}

async function handleFetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const origin = corsOrigin(request, env);
  const url = new URL(request.url);
  const store = new Store(env.MISSIONS);
  const now = new Date();

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        ...(origin
          ? {
              'Access-Control-Allow-Origin': origin,
              'Access-Control-Allow-Credentials': 'true',
              Vary: 'Origin',
            }
          : {}),
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  const accountApi = [
    ['/api/subscriptions', handleSubscriptionsApi],
    ['/api/epic', handleEpicApi],
  ] as const;
  const api = accountApi.find(
    ([base]) => url.pathname === base || url.pathname.startsWith(`${base}/`),
  )?.[1];
  if (api) {
    // CSRF: changes only from the site (the session cookie is SameSite=Lax as well).
    if (request.method !== 'GET' && !origin)
      return json({ error: 'forbidden' }, { status: 403, origin });
    try {
      const r = await api(request, env, url, now.getTime());
      return json(r.body, { status: r.status, origin });
    } catch (err) {
      console.error('account api', url.pathname, err);
      return json({ error: 'error' }, { status: 500, origin });
    }
  }

  if (request.method === 'POST') {
    if (url.pathname === '/api/discord/interactions') return handleInteraction(request, env, ctx);
    if (url.pathname === '/api/auth/logout') {
      // CSRF: only from the site (SameSite=Lax already keeps the cookie off cross-site POSTs).
      if (!origin && request.headers.get('Origin') !== url.origin)
        return json({ error: 'forbidden' }, { status: 403, origin });
      return json({ ok: true }, { origin, setCookie: await logout(request, env) });
    }
    return json({ error: 'method not allowed' }, { status: 405, origin });
  }
  if (request.method !== 'GET')
    return json({ error: 'method not allowed' }, { status: 405, origin });

  const authCtx = {
    env,
    isAllowedOrigin: (o: string) => isAllowedOrigin(o, env),
    now: now.getTime(),
  };

  switch (url.pathname) {
    case '/api/auth/discord/login':
      if (!isAuthConfigured(env))
        return json({ error: 'auth not configured' }, { status: 503, origin });
      return handleLogin(request, authCtx);
    case '/api/auth/discord/callback':
      return handleCallback(request, authCtx);
    case '/api/me': {
      const user = await currentUser(request, env, now.getTime());
      return json(
        { user: user ? publicUser(user) : null, loginEnabled: isAuthConfigured(env) },
        { origin },
      );
    }
    case '/api/missions': {
      const snapshot = await store.getCurrent();
      if (!snapshot) return json({ error: 'no data yet' }, { status: 503, origin });
      return json(snapshot, { maxAge: snapshotMaxAge(snapshot, now), origin });
    }
    case '/api/history': {
      const history = (await store.getHistory()) ?? { days: [] };
      const current = await store.getCurrent();
      return json(history, { maxAge: current ? snapshotMaxAge(current, now) : 300, origin });
    }
    case '/api/health': {
      const health = await store.getHealth();
      const ok = health.lastSnapshotDate === rotationDay(now);
      return json({ ok, today: rotationDay(now), ...health }, { origin });
    }
    default:
      return json({ error: 'not found' }, { status: 404, origin });
  }
}

// ---------- scheduled: every 5 minutes ----------

/**
 * Discord requests one cron run may make. The free plan allows 50 outgoing requests per
 * invocation; Epic login + world/info + the channel webhook + Statuspage take up to 4.
 */
const DISCORD_BUDGET = 40;
/** Board edits per run when the status changed (the rest go out on the next runs). */
const MAX_BOARD_EDITS = 15;

async function runCron(env: Env): Promise<void> {
  // 1. The day's snapshot: exits after one KV read once it is saved.
  try {
    console.log('daily', await runDaily(env));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('daily failed', message);
    await new Store(env.MISSIONS).updateHealth({
      lastErrorAt: new Date().toISOString(),
      lastError: message.slice(0, 1000),
    });
  }
  if (!env.DB) return;
  const db = new Db(env.DB);
  const token = env.DISCORD_BOT_TOKEN;
  const now = Date.now();
  let budget = DISCORD_BUDGET;

  // 2. Epic status, and the boards that do not show it yet.
  try {
    const known = await refreshStatus(db, now);
    if (token) budget -= await updateBoards(token, db, known, now, MAX_BOARD_EDITS);
  } catch (err) {
    console.error('status failed', err);
  }

  // 3. Subscriptions for today's rotation, in batches.
  try {
    const snapshot = await new Store(env.MISSIONS).getCurrent();
    if (token && snapshot && snapshot.date === rotationDay(new Date(now))) {
      const sent = await deliverSubscriptions(token, db, snapshot, env.SITE_URL, now, budget);
      if (sent) console.log('subscriptions: requests', sent);
    }
  } catch (err) {
    console.error('subscriptions failed', err);
  }
}

export default {
  fetch: handleFetch,

  async scheduled(_controller, env, ctx) {
    ctx.waitUntil(runCron(env));
  },
} satisfies ExportedHandler<Env>;
