// POST /__dev/bot: local dev only. Runs a bot command (or builds a notification) with the
// local KV/D1 data and posts the result to DEV_PREVIEW_TARGET, so the look of bot
// messages can be checked without a deploy. Driven by `pnpm bot:preview` (scripts/).
//
// Off unless DEV_PREVIEW_TARGET is set (.dev.vars only, never a production secret).

import {
  isTournamentRegion,
  vbucksOf,
  type DaySnapshot,
  type SubscriptionFilter,
  type TournamentRegion,
} from '@stw/shared';
import { discordApi } from '../bot/api';
import { command, subscriptionFilter, type Interaction } from '../bot/interactions';
import { notificationMessage } from '../bot/subscriptions';
import { boardSessions, reminderDm, reminderRows } from '../bot/tournaments';
import { Db } from '../db';
import type { Env } from '../env';
import {
  readTournamentNames,
  readTournaments,
  refreshSchedule,
  refreshShops,
  refreshStatus,
} from '../feeds';
import { localeOf, type Locale } from '../i18n';
import { postDiscord, type DiscordMessage } from '../notify/discord';
import { Store } from '../store';

const EPHEMERAL = 1 << 6;
const APPLICATION_COMMAND = 2;
const DEFERRED = 5;

interface PreviewRequest {
  /** Slash command, e.g. "shop" or "setup" (with `sub`). */
  command?: string;
  sub?: string;
  /** Flat options: {"kind": "stw", "zone": "twine-peaks"}. */
  options?: Record<string, string | number>;
  /** Notifications the cron sends: daily webhook card, subscription DM, tournament reminder. */
  /**
   * Notifications the cron sends: subscription (filter in `options`), the /setup vbucks
   * card, tournament reminder.
   */
  notify?: 'subscription' | 'vbucks' | 'reminder';
  locale?: string;
  /** Load the feeds into the local D1 first (status, shops, every tournament region). */
  refresh?: boolean;
  /** Return the messages instead of posting them. */
  dry?: boolean;
}

type Data = Record<string, unknown>;

// No host check: wrangler dev rewrites the request URL to the production route. The
// variable itself is the switch: it lives in .dev.vars and is never a production secret.
export const isPreviewEnabled = (env: Env) => !!env.DEV_PREVIEW_TARGET;

type Post = (data: Data) => Promise<void>;

/** The day with every V-Bucks reward removed. */
function withoutVbucks(snapshot: DaySnapshot): DaySnapshot {
  return {
    ...snapshot,
    vbucksTotal: 0,
    missions: snapshot.missions.map((m) => ({
      ...m,
      alertRewards: m.alertRewards.filter((r) => !r.isVbucks),
    })),
  };
}

/** Adds 50–200 V-Bucks to the first `count` alert missions (a quiet day made busy). */
function withFakeVbucks(snapshot: DaySnapshot, count: number): DaySnapshot {
  let left = count;
  let total = snapshot.vbucksTotal;
  const missions = snapshot.missions.map((m) => {
    if (left <= 0 || !m.alertRewards.length || vbucksOf(m) > 0) return m;
    left--;
    const quantity = 50 * (1 + (m.tileIndex % 4));
    total += quantity;
    return {
      ...m,
      alertRewards: [
        { itemId: 'AccountResource:currency_mtxswap', quantity, isVbucks: true },
        ...m.alertRewards,
      ],
    };
  });
  return { ...snapshot, missions, vbucksTotal: total };
}

/** Posts one message to the preview channel or webhook. Ephemeral messages become normal. */
async function postTo(env: Env, data: Data): Promise<void> {
  const target = env.DEV_PREVIEW_TARGET!;
  const flags = typeof data.flags === 'number' ? data.flags & ~EPHEMERAL : undefined;
  const body = { allowed_mentions: { parse: [] }, ...data, flags };
  if (target.startsWith('https://')) {
    await postDiscord(target, body as DiscordMessage);
    return;
  }
  if (!env.DISCORD_BOT_TOKEN) throw new Error('DISCORD_BOT_TOKEN is missing in .dev.vars');
  await discordApi(env.DISCORD_BOT_TOKEN, 'POST', `/channels/${target}/messages`, body);
}

function commandOptions(req: PreviewRequest) {
  const flat = Object.entries(req.options ?? {}).map(([name, value]) => ({
    name,
    type: typeof value === 'number' ? 4 : 3,
    value,
  }));
  return req.sub ? [{ name: req.sub, type: 1, options: flat }] : flat;
}

async function refreshFeeds(env: Env, db: Db, now: number): Promise<string[]> {
  const done: string[] = [];
  await refreshStatus(db, now);
  done.push('status');
  for (let i = 0; i < 3; i++) {
    const shop = await refreshShops(env, db, now);
    if (!shop) break;
    done.push(shop);
  }
  // Every region and the calendar: refreshSchedule takes a missing one first, then in turn.
  for (let i = 0; i < 6; i++) done.push(await refreshSchedule(env, db, now + i * 5 * 60_000));
  return done;
}

async function runCommand(req: PreviewRequest, env: Env, post: Post, locale: Locale, now: number) {
  const pending: Promise<unknown>[] = [];
  // Follow-ups (extra /shop pages, deferred replies) start inside command(): hold them
  // until the reply is posted, as Discord shows the reply first.
  let open = () => {};
  const gate = new Promise<void>((r) => (open = r));
  const uid = env.DEV_PREVIEW_USER ?? '0';
  const i: Interaction = {
    type: APPLICATION_COMMAND,
    application_id: env.DISCORD_CLIENT_ID,
    locale,
    user: { id: uid },
    data: { name: req.command, options: commandOptions(req) },
    deliver: async (data) => {
      await gate;
      await post(data);
    },
  };
  const ctx = {
    waitUntil: (p: Promise<unknown>) => void pending.push(p),
    passThroughOnException: () => {},
  } as unknown as ExecutionContext;
  const res = (await command(i, env, now, ctx)) as { type: number; data?: Data };
  if (res.type !== DEFERRED && res.data) await post(res.data);
  open();
  await Promise.all(pending);
}

async function notify(
  req: PreviewRequest,
  env: Env,
  post: Post,
  locale: Locale,
  now: number,
): Promise<string | undefined> {
  const store = new Store(env.MISSIONS);
  if (req.notify !== 'reminder') {
    let snapshot = await store.getCurrent();
    if (!snapshot) throw new Error('no snapshot in the local KV: run with --refresh or seed:local');
    const history = await store.getHistory();
    const { fake_vbucks: fake, no_vbucks: none, ...opts } = req.options ?? {};
    // fake_vbucks=N: put 50–200 V-Bucks on N alert missions, to see a split card on a quiet day.
    if (typeof fake === 'number') snapshot = withFakeVbucks(snapshot, fake);
    // no_vbucks=1: the same day without V-Bucks (the "No V-Bucks today" card).
    if (none) snapshot = withoutVbucks(snapshot);
    const f: SubscriptionFilter =
      req.notify === 'vbucks'
        ? { ...subscriptionFilter(undefined), card: 'vbucks' }
        : subscriptionFilter(commandOptions({ ...req, options: opts }));
    const note = notificationMessage(f, snapshot, locale, env.SITE_URL, history);
    for (const message of note.messages) await post(message as unknown as Data);
    // Nothing matches: the cron sends nothing, but the site's test DM sends this card.
    return !note.found
      ? 'no matches: the cron sends nothing, only the site test DM looks like this'
      : undefined;
  }
  // Reminder: the next session of the region, as if the user had a reminder for it.
  if (!env.DB) throw new Error('no D1');
  const db = new Db(env.DB);
  const r = req.options?.region;
  const region: TournamentRegion = isTournamentRegion(r) ? r : 'EU';
  const [feed, names] = await Promise.all([readTournaments(db, region), readTournamentNames(db)]);
  const session = feed && boardSessions(feed.data.tournaments, now)[0];
  if (!session) throw new Error(`no upcoming ${region} sessions in the local D1 (--refresh)`);
  const [row] = reminderRows('0', region, session, 15, false, locale, now);
  await post(reminderDm({ ...row!, id: 0 }, names?.data));
}

export async function handlePreview(
  request: Request,
  env: Env,
  refreshDaily: () => Promise<string>,
): Promise<Response> {
  const req = (await request.json().catch(() => ({}))) as PreviewRequest;
  const locale = localeOf(req.locale);
  const now = Date.now();
  try {
    const log: Record<string, unknown> = {};
    if (req.refresh) {
      log.daily = await refreshDaily();
      if (env.DB) log.feeds = await refreshFeeds(env, new Db(env.DB), now);
    }
    const messages: Data[] = [];
    const post: Post = async (data) => {
      messages.push(data);
      if (!req.dry) await postTo(env, data);
    };
    if (req.notify) {
      const note = await notify(req, env, post, locale, now);
      if (note) log.note = note;
    } else if (req.command) await runCommand(req, env, post, locale, now);
    return Response.json({
      ok: true,
      ...log,
      posted: messages.length,
      ...(req.dry ? { messages } : {}),
    });
  } catch (err) {
    console.error('preview', err);
    return Response.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
