import {
  addToHistory,
  alertsFingerprint,
  parseWorldInfo,
  rotationDay,
  type DaySnapshot,
} from '@stw/shared';
import { epicClient, fetchWorldInfo, loginWithDeviceAuth } from '@stw/shared/epic';
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

function corsOrigin(request: Request, env: Env): string | null {
  const origin = request.headers.get('Origin');
  if (!origin) return null;
  if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return origin;
  const allowed = env.ALLOWED_ORIGINS.split(',').map((o) => o.trim());
  return allowed.includes(origin) ? origin : null;
}

function json(
  body: unknown,
  init: { status?: number; maxAge?: number; origin: string | null },
): Response {
  const headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8' });
  headers.set('Cache-Control', init.maxAge ? `public, max-age=${init.maxAge}` : 'no-store');
  if (init.origin) {
    headers.set('Access-Control-Allow-Origin', init.origin);
    headers.set('Vary', 'Origin');
  }
  return new Response(JSON.stringify(body), { status: init.status ?? 200, headers });
}

/** Cache until the snapshot expires; a stale (yesterday's) snapshot only for 5 minutes. */
function snapshotMaxAge(snapshot: DaySnapshot, now: Date): number {
  if (snapshot.date !== rotationDay(now)) return 300;
  const seconds = Math.floor((Date.parse(snapshot.expiresAt) - now.getTime()) / 1000);
  return Math.max(60, Math.min(seconds, 24 * 60 * 60));
}

async function handleFetch(request: Request, env: Env): Promise<Response> {
  const origin = corsOrigin(request, env);
  const url = new URL(request.url);
  const store = new Store(env.MISSIONS);
  const now = new Date();

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        ...(origin ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' } : {}),
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Max-Age': '86400',
      },
    });
  }
  if (request.method !== 'GET')
    return json({ error: 'method not allowed' }, { status: 405, origin });

  switch (url.pathname) {
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

export default {
  fetch: handleFetch,

  async scheduled(_controller, env, ctx) {
    ctx.waitUntil(
      runDaily(env).then(
        (result) => console.log('daily', result),
        async (err: unknown) => {
          const message = err instanceof Error ? err.message : String(err);
          console.error('daily failed', message);
          await new Store(env.MISSIONS).updateHealth({
            lastErrorAt: new Date().toISOString(),
            lastError: message.slice(0, 1000),
          });
        },
      ),
    );
  },
} satisfies ExportedHandler<Env>;
