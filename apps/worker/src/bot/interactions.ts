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
} from '@stw/shared';
import { ITEMS } from '@stw/shared/items';
import { Db, type OwnerType, type SubscriptionRow } from '../db';
import type { Env } from '../env';
import { fmt, localeOf, messages, plural, type Locale } from '../i18n';
import { buildDiscordMessage } from '../notify/discord';
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
import { currentStatus } from '../feeds';
import { fetchLlamas } from '../llamas';
import { llamasMessage } from './shop';
import { shopSource, statusSource } from './sources';
import { inviteUrl, userInstallUrl } from './commands';
import { missionListMessage } from './render';
import { buildStatusMessage, STATUS_REFRESH_ID } from './status';
import { describeFilter, MAX_SUBSCRIPTIONS, parseRowFilter } from './subscriptions';
import { verifyDiscordRequest } from './verify';
import { EpicLinks, isEpicLinkConfigured } from '../epic-link';

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
const EPIC_POLL_ID = 'epic:poll';
// Deferred responses: "thinking…" now, the message follows (Epic takes a few seconds).
const DEFERRED_CHANNEL_MESSAGE = 5;
const DEFERRED_UPDATE_MESSAGE = 6;

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
  data?: { name?: string; options?: CommandOption[]; custom_id?: string };
  message?: { id: string; channel_id: string };
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

// ---------- Epic link ----------

function epicPrompt(verificationUrl: string, locale: Locale) {
  const t = messages(locale).Bot.epic;
  return {
    content: `${t.warning}

${t.start}`,
    components: [
      {
        type: 1,
        components: [
          { type: 2, style: 5, label: t.open, url: verificationUrl },
          { type: 2, style: 1, label: t.done, custom_id: EPIC_POLL_ID },
        ],
      },
    ],
    allowed_mentions: { parse: [] },
  };
}

/** Text + buttons after a check of the link in progress. */
async function epicPoll(env: Env, userId: string, locale: Locale, now: number) {
  const t = messages(locale).Bot.epic;
  if (!isEpicLinkConfigured(env))
    return { content: messages(locale).Bot.error.generic, components: [] };
  const r = await new EpicLinks(env).poll(userId, now);
  if (r.status === 'linked')
    return { content: fmt(t.linked, { name: r.displayName }), components: [] };
  if (r.status === 'pending')
    return {
      ...epicPrompt(r.verificationUrl, locale),
      content: `${t.pending}

${t.start}`,
    };
  return { content: t.expired, components: [] };
}

/** Edits the deferred reply once the work is done (or shows the generic error). */
function followUp(
  i: Interaction,
  ctx: ExecutionContext,
  locale: Locale,
  work: () => Promise<Record<string, unknown>>,
) {
  ctx.waitUntil(
    work()
      .catch((err: unknown) => {
        console.error('deferred', i.data?.name ?? i.data?.custom_id, err);
        return { content: messages(locale).Bot.error.generic, components: [] };
      })
      .then((data) =>
        fetch(
          `https://discord.com/api/v10/webhooks/${i.application_id}/${i.token}/messages/@original`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ allowed_mentions: { parse: [] }, ...data }),
          },
        ),
      )
      .then((res) => {
        if (!res.ok) console.error('follow-up', res.status);
      }),
  );
}

/** Extra messages after a reply (multi-page /shop). */
async function postFollowUps(i: Interaction, pages: Record<string, unknown>[]) {
  for (const page of pages) {
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

async function command(i: Interaction, env: Env, now: number, ctx: ExecutionContext) {
  const locale = localeOf(i.locale);
  const t = messages(locale).Bot;
  const store = new Store(env.MISSIONS);

  switch (i.data?.name) {
    case 'vbucks': {
      const snapshot = await store.getCurrent();
      if (!snapshot) return ephemeral(t.error.noData);
      return reply({
        ...buildDiscordMessage(snapshot, await store.getHistory(), {
          siteUrl: env.SITE_URL,
          emojis: APP_EMOJIS,
          locale,
        }),
      });
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
    case 'shop': {
      if (!env.DB) return ephemeral(t.error.generic);
      const kind = option(i.data.options, 'kind') === 'stw' ? 'shop_stw' : 'shop_br';
      const source = await shopSource(new Db(env.DB), kind, env.SITE_URL, now);
      if (!source) return ephemeral(t.shop.noData);
      const [first, ...rest] = source.pages(locale);
      // A BR shop takes several messages: the first is the reply, the rest follow-ups.
      if (rest.length) ctx.waitUntil(postFollowUps(i, rest));
      return reply(first!);
    }
    case 'llamas': {
      const uid = userId(i);
      if (!uid) return ephemeral(t.error.generic);
      followUp(i, ctx, locale, async () => {
        const r = await fetchLlamas(env, uid, now);
        if (r.status === 'ok') return llamasMessage(r.llamas, locale, env.SITE_URL, now);
        return {
          content:
            r.status === 'not linked'
              ? t.shop.notLinked
              : r.status === 'gone'
                ? t.shop.gone
                : t.error.generic,
        };
      });
      return { type: DEFERRED_CHANNEL_MESSAGE, data: { flags: EPHEMERAL } };
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
    case 'link': {
      const uid = userId(i);
      if (!isEpicLinkConfigured(env) || !uid) return ephemeral(t.error.generic);
      const links = new EpicLinks(env);
      const current = await links.status(uid, now);
      if (current.status === 'linked')
        return ephemeral(fmt(t.epic.already, { name: current.displayName }));
      followUp(i, ctx, locale, async () => {
        const { verificationUrl } = await links.start(uid, now);
        return epicPrompt(verificationUrl, locale);
      });
      return { type: DEFERRED_CHANNEL_MESSAGE, data: { flags: EPHEMERAL } };
    }
    case 'unlink': {
      const uid = userId(i);
      if (!isEpicLinkConfigured(env) || !uid) return ephemeral(t.error.generic);
      followUp(i, ctx, locale, async () => ({
        content: (await new EpicLinks(env).unlink(uid)) ? t.epic.unlinked : t.epic.notLinked,
      }));
      return { type: DEFERRED_CHANNEL_MESSAGE, data: { flags: EPHEMERAL } };
    }
    case 'setup': {
      const sub = i.data.options?.[0];
      if (sub?.name === 'status' || sub?.name === 'shop')
        return setupBoard(i, sub.name, sub.options, env, now);
      if (sub?.name === 'alerts') return setupAlerts(i, sub.options, env, now);
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

/** /setup status and /setup shop: posts a board that the cron keeps up to date. */
async function setupBoard(
  i: Interaction,
  name: 'status' | 'shop',
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
  else {
    const kind = option(opts, 'kind') === 'stw' ? 'shop_stw' : 'shop_br';
    source = await shopSource(db, kind, env.SITE_URL, now);
    if (!source) return ephemeral(t.shop.noData);
  }
  try {
    await postBoard(env.DISCORD_BOT_TOKEN!, db, i.guild_id!, channelId, boardLang, source, now);
  } catch (err) {
    const denied = noAccessReply(err, channelId, locale);
    if (denied) return denied;
    throw err;
  }
  const done = name === 'status' ? t.setup.statusDone : t.setup.shopDone;
  return ephemeral(fmt(done, { channel: `<#${channelId}>` }));
}

async function setupAlerts(
  i: Interaction,
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
  const guildId = i.guild_id!;

  if ((await db.countSubscriptions('guild', guildId)) >= MAX_SUBSCRIPTIONS)
    return ephemeral(fmt(t.subs.guildLimit, { max: MAX_SUBSCRIPTIONS }));
  const lang = (option(opts, 'language') as Locale | undefined) ?? localeOf(i.guild_locale);
  const f = subscriptionFilter(opts);
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

async function component(i: Interaction, env: Env, now: number, ctx: ExecutionContext) {
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

  if (id === EPIC_POLL_ID) {
    const uid = userId(i);
    if (!uid) return ephemeral(t.error.generic);
    followUp(i, ctx, locale, () => epicPoll(env, uid, locale, now));
    return { type: DEFERRED_UPDATE_MESSAGE };
  }

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
    else if (i.type === MESSAGE_COMPONENT) response = await component(i, env, now, ctx);
    else response = ephemeral(messages(localeOf(i.locale)).Bot.error.unknown);
  } catch (err) {
    console.error('interaction', i.data?.name ?? i.data?.custom_id, err);
    response = ephemeral(messages(localeOf(i.locale)).Bot.error.generic);
  }
  return Response.json(response);
}
