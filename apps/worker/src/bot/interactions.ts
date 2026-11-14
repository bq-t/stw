// POST /api/discord/interactions: slash commands and buttons of the Fishstick bot.
// Everything answers within Discord's 3 seconds from KV/D1; only /status may call
// Statuspage, and only when the stored status is older than 2 minutes.

import {
  DEFAULT_FILTERS,
  filtersToParams,
  matchesFilters,
  MIN_QTY_MAX,
  REWARD_CATEGORIES,
  rotationDay,
  ZONES,
  type AlertFilter,
  type Mission,
  type MissionFilters,
  type RewardCategory,
  type SubscriptionFilter,
  type Zone,
  isTournamentRegion,
  type TournamentRegion,
} from '@stw/shared';
import { ITEMS } from '@stw/shared/items';
import { Db, type OwnerType, type SubscriptionRow } from '../db';
import type { Env } from '../env';
import { fmt, localeOf, messages, plural, type Locale } from '../i18n';
import { buildDiscordMessages } from '../notify/discord';
import { Store } from '../store';
import {
  DiscordApiError,
  DISCORD_MISSING_ACCESS,
  DISCORD_MISSING_PERMISSIONS,
  DISCORD_UNKNOWN_CHANNEL,
  discordApi,
} from './api';
import APP_EMOJIS from './app-emojis.json';
import { boardLocale, boardMessageIds, postBoard, type BoardSource } from './boards';
import { currentStatus, readEvents, readTournamentNames, readTournaments } from '../feeds';
import { eventsSource, statusSource, tournamentsSource } from './sources';
import {
  eventsPage,
  findSession,
  MAX_REMINDERS,
  offsetsMessage,
  pickerMessage,
  REM_DELETE,
  reminderRows,
  remindersList,
  REMIND_OFFSETS,
  tournamentsPage,
} from './tournaments';
import { inviteUrl, userInstallUrl } from './commands';
import { missionListMessage } from './render';
import { buildStatusMessage, STATUS_REFRESH_ID } from './status';
import { describeFilter, MAX_SUBSCRIPTIONS, parseRowFilter } from './subscriptions';
import { verifyDiscordRequest } from './verify';

// Interaction and response types
const PING = 1;
const APPLICATION_COMMAND = 2;
const MESSAGE_COMPONENT = 3;
const PONG = 1;
const CHANNEL_MESSAGE = 4;
const UPDATE_MESSAGE = 7;
const EPHEMERAL = 1 << 6;
const GUILD_INSTALL = '0';
const STATUS_MAX_AGE = 2 * 60 * 1000;
// Permission bits
const ADMINISTRATOR = 1n << 3n;
const MANAGE_GUILD = 1n << 5n;
const DELETE_PREFIX = 'sub:del:';

interface CommandOption {
  name: string;
  type: number;
  value?: string | number;
  options?: CommandOption[];
}

export interface Interaction {
  type: number;
  /** For editing the deferred reply (valid 15 minutes). */
  token?: string;
  application_id?: string;
  guild_id?: string;
  locale?: string;
  guild_locale?: string;
  authorizing_integration_owners?: Record<string, string>;
  member?: { user: { id: string }; permissions?: string };
  user?: { id: string };
  data?: { name?: string; options?: CommandOption[]; custom_id?: string; values?: string[] };
  message?: { id: string; channel_id: string };
  /**
   * Dev preview only (src/dev/preview.ts): deferred replies and extra pages go here
   * instead of the interaction webhook. Never set for a real Discord request.
   */
  deliver?: (data: Record<string, unknown>) => Promise<void>;
}

type Data = Record<string, unknown>;

const reply = (data: Data) => ({ type: CHANNEL_MESSAGE, data });
const ephemeral = (content: string) =>
  reply({ content, flags: EPHEMERAL, allowed_mentions: { parse: [] } });

function option(opts: CommandOption[] | undefined, name: string) {
  return opts?.find((o) => o.name === name)?.value;
}

function userId(i: Interaction): string | undefined {
  return i.member?.user.id ?? i.user?.id;
}

function canManageGuild(i: Interaction): boolean {
  const p = BigInt(i.member?.permissions ?? '0');
  return (p & (ADMINISTRATOR | MANAGE_GUILD)) !== 0n;
}

// ---------- options → filters (pure, tested) ----------

/** /missions options → tracker filters. Default: every alert, not only mini-bosses. */
export function missionFilters(opts: CommandOption[] | undefined): MissionFilters {
  const zone = option(opts, 'zone');
  const alert = option(opts, 'alert');
  const reward = option(opts, 'reward');
  const a = Number(option(opts, 'pl_min') ?? DEFAULT_FILTERS.plMin);
  const b = Number(option(opts, 'pl_max') ?? DEFAULT_FILTERS.plMax);
  return {
    zones: ZONES.includes(zone as Zone) ? [zone as Zone] : [],
    alert: (['miniboss', 'alerts', 'all', 'vbucks'] as const).includes(alert as AlertFilter)
      ? (alert as AlertFilter)
      : 'alerts',
    rewards: REWARD_CATEGORIES.includes(reward as RewardCategory) ? [reward as RewardCategory] : [],
    plMin: Math.min(a, b),
    plMax: Math.max(a, b),
  };
}

/** /subscribe and /setup alerts options → subscription filter. */
export function subscriptionFilter(opts: CommandOption[] | undefined): SubscriptionFilter {
  const f: SubscriptionFilter = missionFilters(opts);
  const item = option(opts, 'item');
  if (typeof item === 'string' && item in ITEMS) f.item = item;
  const min = Number(option(opts, 'min') ?? 1);
  if (Number.isInteger(min) && min > 1) f.minQty = Math.min(min, MIN_QTY_MAX);
  return f;
}

export function missionsMessage(
  missions: Mission[],
  filters: MissionFilters,
  locale: Locale,
  siteUrl: string,
) {
  const t = messages(locale).Bot.missions;
  const found = missions.filter((x) => matchesFilters(x, filters));
  return missionListMessage({
    heading: `## ${t.title}\n${plural(t.found, found.length, locale)}`,
    missions: found,
    emptyText: t.none,
    trackerQuery: filtersToParams(filters).toString(),
    locale,
    siteUrl,
  });
}

// ---------- subscription lists ----------

/** Ephemeral list with a delete button per subscription (classic message: text + buttons). */
export function subscriptionList(rows: SubscriptionRow[], owner: OwnerType, locale: Locale) {
  const t = messages(locale).Bot.subs;
  const title = owner === 'user' ? t.title : t.guildTitle;
  if (!rows.length) {
    return { content: owner === 'user' ? t.empty : t.guildEmpty, components: [] };
  }
  const lines = rows.map((r, n) => {
    const f = parseRowFilter(r);
    const where = r.target === 'channel' ? ` → <#${r.target_id}>` : '';
    const err = r.last_error ? `\n-# ${r.last_error}` : '';
    return `**${n + 1}.** ${f ? describeFilter(f, locale) : '?'}${where}${err}`;
  });
  const buttons = rows.map((r, n) => ({
    type: 2,
    style: 4, // danger
    label: fmt(t.delete, { n: n + 1 }),
    custom_id: `${DELETE_PREFIX}${r.id}`,
  }));
  const components = [];
  for (let k = 0; k < buttons.length; k += 5)
    components.push({ type: 1, components: buttons.slice(k, k + 5) });
  return { content: `### ${title}\n${lines.join('\n')}`, components };
}

/** Extra messages after a reply (multi-page /shop). */
async function postFollowUps(i: Interaction, pages: Record<string, unknown>[]) {
  for (const page of pages) {
    if (i.deliver) {
      await i.deliver(page);
      continue;
    }
    const res = await fetch(`https://discord.com/api/v10/webhooks/${i.application_id}/${i.token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(page),
    });
    if (!res.ok) {
      console.error('follow-up page', res.status);
      return;
    }
  }
}

// ---------- commands ----------

export async function command(i: Interaction, env: Env, now: number, ctx: ExecutionContext) {
  const locale = localeOf(i.locale);
  const t = messages(locale).Bot;
  const store = new Store(env.MISSIONS);

  switch (i.data?.name) {
    case 'vbucks': {
      const snapshot = await store.getCurrent();
      if (!snapshot) return ephemeral(t.error.noData);
      const [first, ...rest] = buildDiscordMessages(snapshot, await store.getHistory(), {
        siteUrl: env.SITE_URL,
        emojis: APP_EMOJIS,
        locale,
      });
      // A busy day adds a second message (link to the rest on the site) as a follow-up.
      if (rest.length)
        ctx.waitUntil(postFollowUps(i, rest as unknown as Record<string, unknown>[]));
      return reply({ ...first! });
    }
    case 'missions': {
      const snapshot = await store.getCurrent();
      if (!snapshot) return ephemeral(t.error.noData);
      return reply(
        missionsMessage(snapshot.missions, missionFilters(i.data.options), locale, env.SITE_URL),
      );
    }
    case 'status': {
      if (!env.DB) return ephemeral(t.error.generic);
      const known = await currentStatus(new Db(env.DB), now, STATUS_MAX_AGE);
      return reply(buildStatusMessage(known.data, known.changedAt, locale));
    }
    case 'subscribe': {
      const uid = userId(i);
      if (!env.DB || !uid) return ephemeral(t.error.generic);
      const db = new Db(env.DB);
      if ((await db.countSubscriptions('user', uid)) >= MAX_SUBSCRIPTIONS)
        return ephemeral(fmt(t.subs.limit, { max: MAX_SUBSCRIPTIONS }));
      const f = subscriptionFilter(i.data.options);
      await db.addSubscription(
        {
          owner_type: 'user',
          owner_id: uid,
          target: 'dm',
          target_id: uid,
          filter: JSON.stringify(f),
          locale,
        },
        rotationDay(new Date(now)),
        now,
      );
      return ephemeral(
        `${fmt(t.subs.saved, { summary: `**${describeFilter(f, locale)}**` })}\n-# ${fmt(
          t.subs.dmNote,
          { url: `<${userInstallUrl(env.DISCORD_CLIENT_ID ?? '')}>` },
        )}`,
      );
    }
    case 'subscriptions': {
      const uid = userId(i);
      if (!env.DB || !uid) return ephemeral(t.error.generic);
      const rows = await new Db(env.DB).listSubscriptions('user', uid);
      return reply({ ...subscriptionList(rows, 'user', locale), flags: EPHEMERAL });
    }
    case 'tournaments': {
      if (!env.DB) return ephemeral(t.error.generic);
      const db = new Db(env.DB);
      const region = regionOption(i.data.options);
      const [feed, names] = await Promise.all([
        readTournaments(db, region),
        readTournamentNames(db),
      ]);
      if (!feed) return ephemeral(t.error.notLoaded);
      return reply(
        tournamentsPage(region, feed.data.tournaments, names?.data, locale, env.SITE_URL, now),
      );
    }
    case 'events': {
      if (!env.DB) return ephemeral(t.error.generic);
      const events = await readEvents(new Db(env.DB), now);
      if (!events) return ephemeral(t.error.notLoaded);
      return reply(eventsPage(events, locale, env.SITE_URL));
    }
    case 'reminders': {
      const uid = userId(i);
      if (!env.DB || !uid) return ephemeral(t.error.generic);
      const db = new Db(env.DB);
      const [rows, names] = await Promise.all([db.listReminders(uid), readTournamentNames(db)]);
      return reply({ ...remindersList(rows, names?.data, locale), flags: EPHEMERAL });
    }
    case 'setup': {
      const sub = i.data.options?.[0];
      if (sub?.name === 'status' || sub?.name === 'tournaments' || sub?.name === 'events')
        return setupBoard(i, sub.name, sub.options, env, now);
      if (sub?.name === 'alerts') return setupAlerts(i, sub.options, env, now);
      if (sub?.name === 'vbucks') return setupAlerts(i, sub.options, env, now, 'vbucks');
      if (sub?.name === 'list') {
        if (!env.DB || !i.guild_id) return ephemeral(t.error.generic);
        const rows = await new Db(env.DB).listSubscriptions('guild', i.guild_id);
        return reply({ ...subscriptionList(rows, 'guild', locale), flags: EPHEMERAL });
      }
      return ephemeral(t.error.unknown);
    }
    default:
      return ephemeral(t.error.unknown);
  }
}

/** Region option; EU by default (most of our players). */
function regionOption(opts: CommandOption[] | undefined): TournamentRegion {
  const r = option(opts, 'region');
  return isTournamentRegion(r) ? r : 'EU';
}

/** Common checks of /setup: server install, channel, config. Returns an error reply or null. */
function setupGuard(i: Interaction, env: Env, channelId: string) {
  const t = messages(localeOf(i.locale)).Bot;
  if (!env.DB || !env.DISCORD_BOT_TOKEN || !i.guild_id || !channelId)
    return ephemeral(t.error.generic);
  // Installed only as a user app: the bot user is not on the server and cannot post.
  if (!i.authorizing_integration_owners?.[GUILD_INSTALL])
    return ephemeral(fmt(t.setup.notInServer, { url: inviteUrl(env.DISCORD_CLIENT_ID ?? '') }));
  return null;
}

/** Posts to a channel; a missing permission becomes a friendly reply instead of an error. */
async function postToChannel(
  token: string,
  channelId: string,
  body: unknown,
  locale: Locale,
): Promise<{ id: string } | { error: ReturnType<typeof ephemeral> }> {
  try {
    return await discordApi<{ id: string }>(token, 'POST', `/channels/${channelId}/messages`, body);
  } catch (err) {
    const denied = noAccessReply(err, channelId, locale);
    if (denied) return { error: denied };
    throw err;
  }
}

/** A missing permission in the channel becomes a friendly reply; null for other errors. */
function noAccessReply(err: unknown, channelId: string, locale: Locale) {
  if (
    err instanceof DiscordApiError &&
    [DISCORD_MISSING_ACCESS, DISCORD_MISSING_PERMISSIONS, DISCORD_UNKNOWN_CHANNEL].includes(
      err.code ?? 0,
    )
  )
    return ephemeral(fmt(messages(locale).Bot.setup.noAccess, { channel: `<#${channelId}>` }));
  return null;
}

/** /setup status|tournaments|events: posts a board that the cron keeps up to date. */
async function setupBoard(
  i: Interaction,
  name: 'status' | 'tournaments' | 'events',
  opts: CommandOption[] | undefined,
  env: Env,
  now: number,
) {
  const locale = localeOf(i.locale);
  const t = messages(locale).Bot;
  const channelId = String(option(opts, 'channel') ?? '');
  const guard = setupGuard(i, env, channelId);
  if (guard) return guard;
  const db = new Db(env.DB!);
  const boardLang = (option(opts, 'language') as Locale | undefined) ?? localeOf(i.guild_locale);

  let source: BoardSource | null;
  if (name === 'status') source = statusSource(await currentStatus(db, now, STATUS_MAX_AGE));
  else if (name === 'tournaments')
    source = await tournamentsSource(db, regionOption(opts), env.SITE_URL, now);
  else source = await eventsSource(db, env.SITE_URL, now);
  if (!source) return ephemeral(t.error.notLoaded);
  try {
    await postBoard(env.DISCORD_BOT_TOKEN!, db, i.guild_id!, channelId, boardLang, source, now);
  } catch (err) {
    const denied = noAccessReply(err, channelId, locale);
    if (denied) return denied;
    throw err;
  }
  const done = {
    status: t.setup.statusDone,
    tournaments: t.setup.tournamentsDone,
    events: t.setup.eventsDone,
  }[name];
  return ephemeral(fmt(done, { channel: `<#${channelId}>` }));
}

/**
 * /setup alerts (missions matching the filter) and /setup vbucks (the day's V-Bucks card,
 * as the channel webhook): a channel subscription the cron serves after each rotation.
 */
async function setupAlerts(
  i: Interaction,
  opts: CommandOption[] | undefined,
  env: Env,
  now: number,
  card?: 'vbucks',
) {
  const locale = localeOf(i.locale);
  const t = messages(locale).Bot;
  const channelId = String(option(opts, 'channel') ?? '');
  const guard = setupGuard(i, env, channelId);
  if (guard) return guard;
  const db = new Db(env.DB!);
  const guildId = i.guild_id!;

  if ((await db.countSubscriptions('guild', guildId)) >= MAX_SUBSCRIPTIONS)
    return ephemeral(fmt(t.subs.guildLimit, { max: MAX_SUBSCRIPTIONS }));
  const lang = (option(opts, 'language') as Locale | undefined) ?? localeOf(i.guild_locale);
  const f: SubscriptionFilter = card
    ? { ...subscriptionFilter(undefined), card }
    : subscriptionFilter(opts);
  if (card) {
    // One V-Bucks card per channel: a second one would only post the same card twice.
    const same = (await db.listSubscriptions('guild', guildId)).some(
      (r) => r.target_id === channelId && parseRowFilter(r)?.card === card,
    );
    if (same)
      return ephemeral(
        fmt(t.subs.channelSaved, {
          summary: `**${describeFilter(f, locale)}**`,
          channel: `<#${channelId}>`,
        }),
      );
  }
  // The intro message also checks that the bot can post there.
  const posted = await postToChannel(
    env.DISCORD_BOT_TOKEN!,
    channelId,
    {
      content: fmt(messages(lang).Bot.subs.channelIntro, {
        summary: `**${describeFilter(f, lang)}**`,
      }),
      allowed_mentions: { parse: [] },
    },
    locale,
  );
  if ('error' in posted) return posted.error;
  await db.addSubscription(
    {
      owner_type: 'guild',
      owner_id: guildId,
      target: 'channel',
      target_id: channelId,
      filter: JSON.stringify(f),
      locale: lang,
    },
    rotationDay(new Date(now)),
    now,
  );
  return ephemeral(
    fmt(t.subs.channelSaved, {
      summary: `**${describeFilter(f, locale)}**`,
      channel: `<#${channelId}>`,
    }),
  );
}

// ---------- buttons ----------

async function component(i: Interaction, env: Env, now: number) {
  const locale = localeOf(i.locale);
  const t = messages(locale).Bot;
  const id = i.data?.custom_id ?? '';
  if (!env.DB) return ephemeral(t.error.generic);
  const db = new Db(env.DB);

  if (id === STATUS_REFRESH_ID) {
    // A server board keeps its own language; a /status reply follows the user.
    const board = i.guild_id ? await db.getBoard(i.guild_id, 'status') : null;
    const onBoard = board && i.message && boardMessageIds(board).includes(i.message.id);
    const lang = onBoard ? boardLocale(board) : locale;
    const known = await currentStatus(db, now, 60 * 1000);
    return { type: UPDATE_MESSAGE, data: buildStatusMessage(known.data, known.changedAt, lang) };
  }

  if (id.startsWith('tr:') || id.startsWith(REM_DELETE))
    return tournamentComponent(i, id, db, locale, now);

  if (id.startsWith(DELETE_PREFIX)) {
    const row = await db.getSubscription(Number(id.slice(DELETE_PREFIX.length)));
    const uid = userId(i);
    if (row) {
      const allowed =
        row.owner_type === 'user'
          ? row.owner_id === uid
          : row.owner_id === i.guild_id && canManageGuild(i);
      if (!allowed) return ephemeral(t.subs.notOwner);
      await db.deleteSubscription(row.id);
    }
    // Re-render the list the button belongs to (already gone rows are just skipped).
    const owner: OwnerType =
      row?.owner_type ?? (i.guild_id && canManageGuild(i) ? 'guild' : 'user');
    const ownerId = owner === 'guild' ? i.guild_id : uid;
    const rows = ownerId ? await db.listSubscriptions(owner, ownerId) : [];
    return { type: UPDATE_MESSAGE, data: subscriptionList(rows, owner, locale) };
  }

  return ephemeral(t.error.unknown);
}

/** Reminder picker (tr:*) and /reminders delete buttons (rem:del:*). */
async function tournamentComponent(
  i: Interaction,
  id: string,
  db: Db,
  locale: Locale,
  now: number,
) {
  const t = messages(locale).Bot;
  const uid = userId(i);
  if (!uid) return ephemeral(t.error.generic);
  const names = (await readTournamentNames(db))?.data;

  if (id.startsWith(REM_DELETE)) {
    await db.deleteReminder(Number(id.slice(REM_DELETE.length)), uid);
    return {
      type: UPDATE_MESSAGE,
      data: remindersList(await db.listReminders(uid), names, locale),
    };
  }

  // tr:<step>:<region>[:…]
  const [, step, region, ...rest] = id.split(':');
  if (!isTournamentRegion(region)) return ephemeral(t.error.unknown);
  const list = (await readTournaments(db, region))?.data.tournaments ?? [];

  // From a board or /tournaments: a new ephemeral picker for this user.
  if (step === 'pick')
    return reply({ ...pickerMessage(region, list, names, locale, now), flags: EPHEMERAL });

  // The rest edits the picker itself.
  const update = (data: Record<string, unknown>) => ({
    type: UPDATE_MESSAGE,
    data: { components: [], ...data },
  });
  const windowId =
    step === 'sel'
      ? String(i.data?.values?.[0] ?? '')
      : rest.slice(step === 'add' ? 2 : 1).join(':');
  const session = findSession(list, windowId);
  if (!session || Date.parse(session.window.begin) <= now)
    return update({ content: t.tournaments.gone });

  if (step === 'sel') return update(offsetsMessage(region, session, names, locale, false));
  if (step === 'all')
    return update(offsetsMessage(region, session, names, locale, rest[0] === '1'));
  if (step === 'add') {
    const all = rest[0] === '1';
    const offset = Number(rest[1]);
    if (!REMIND_OFFSETS.includes(offset as (typeof REMIND_OFFSETS)[number]))
      return ephemeral(t.error.unknown);
    const rows = reminderRows(uid, region, session, offset, all, locale, now);
    const have = await db.countReminders(uid, now);
    if (have + rows.length > MAX_REMINDERS)
      return update({ content: fmt(t.tournaments.limit, { max: MAX_REMINDERS }) });
    const added = await db.addReminders(rows);
    if (!added) return update({ content: t.tournaments.already });
    const name =
      names?.[locale][session.tournament.displayId]?.title ?? session.tournament.displayId;
    const before = t.before[String(offset) as keyof typeof t.before];
    const done =
      added > 1
        ? fmt(t.tournaments.saved, { before, name, count: added })
        : fmt(t.tournaments.savedOne, { before, name });
    return update({
      content: `${done}
-# ${fmt(t.subs.dmNote, { url: `<${userInstallUrl(i.application_id ?? '')}>` })}`,
    });
  }
  return ephemeral(t.error.unknown);
}

export async function handleInteraction(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
): Promise<Response> {
  if (!env.DISCORD_PUBLIC_KEY) return new Response('bot not configured', { status: 503 });
  const body = await request.text();
  const ok = await verifyDiscordRequest(
    env.DISCORD_PUBLIC_KEY,
    request.headers.get('X-Signature-Ed25519'),
    request.headers.get('X-Signature-Timestamp'),
    body,
  );
  if (!ok) return new Response('invalid request signature', { status: 401 });

  const i = JSON.parse(body) as Interaction;
  const now = Date.now();
  let response: unknown;
  try {
    if (i.type === PING) response = { type: PONG };
    else if (i.type === APPLICATION_COMMAND) response = await command(i, env, now, ctx);
    else if (i.type === MESSAGE_COMPONENT) response = await component(i, env, now);
    else response = ephemeral(messages(localeOf(i.locale)).Bot.error.unknown);
  } catch (err) {
    console.error('interaction', i.data?.name ?? i.data?.custom_id, err);
    response = ephemeral(messages(localeOf(i.locale)).Bot.error.generic);
  }
  return Response.json(response);
}
