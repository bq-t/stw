// POST /api/discord/interactions: slash commands and buttons of the Fishstick bot.
// Everything answers within Discord's 3 seconds from KV/D1; only /status may call
// Statuspage, and only when the stored status is older than 2 minutes.

import {
  compareMissions,
  DEFAULT_FILTERS,
  filtersToParams,
  matchesFilters,
  REWARD_CATEGORIES,
  ZONES,
  type AlertFilter,
  type Mission,
  type MissionFilters,
  type RewardCategory,
  type Zone,
} from '@stw/shared';
import { itemInfo, readableItemId } from '@stw/shared/items';
import { Db } from '../db';
import type { Env } from '../env';
import { fmt, label, localeOf, messages, plural, sitePath, type Locale } from '../i18n';
import { buildDiscordMessage } from '../notify/discord';
import { Store } from '../store';
import {
  DiscordApiError,
  DISCORD_MISSING_ACCESS,
  DISCORD_MISSING_PERMISSIONS,
  DISCORD_UNKNOWN_CHANNEL,
  discordApi,
} from './api';
import { boardLocale, currentStatus } from './board';
import { inviteUrl } from './commands';
import { buildStatusMessage, FLAG_COMPONENTS_V2, STATUS_REFRESH_ID } from './status';
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

const MAX_LISTED = 12;
const HIDDEN_REWARDS = new Set(['AccountResource:campaign_event_currency']);

interface CommandOption {
  name: string;
  type: number;
  value?: string | number;
  options?: CommandOption[];
}

export interface Interaction {
  type: number;
  guild_id?: string;
  locale?: string;
  guild_locale?: string;
  authorizing_integration_owners?: Record<string, string>;
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

// ---------- /missions ----------

/** Command options → tracker filters (pure, tested). Default: every alert, not only mini-bosses. */
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

function rewardText(m: Mission, locale: Locale): string {
  return m.alertRewards
    .filter((r) => !HIDDEN_REWARDS.has(r.itemId))
    .map((r) => {
      const name = r.isVbucks
        ? 'V-Bucks'
        : (itemInfo(r.itemId)?.name[locale] ?? readableItemId(r.itemId));
      return r.quantity > 1 ? `${name} ×${r.quantity}` : name;
    })
    .join(', ');
}

export function missionsMessage(
  missions: Mission[],
  filters: MissionFilters,
  locale: Locale,
  siteUrl: string,
) {
  const m = messages(locale);
  const t = m.Bot.missions;
  const found = missions.filter((x) => matchesFilters(x, filters)).sort(compareMissions);
  const lines = found.slice(0, MAX_LISTED).map((x) => {
    const alert =
      x.alertKind !== 'none' && x.alertKind !== 'other'
        ? ` · ${label(m.AlertKind, x.alertKind)}`
        : '';
    const rewards = rewardText(x, locale);
    return `**${x.powerLevel || '?'}** · ${label(m.Zone, x.zone)} · ${label(m.MissionType, x.missionType)}${alert}${
      rewards ? `\n-# ${rewards}` : ''
    }`;
  });
  if (found.length > MAX_LISTED)
    lines.push(`-# ${fmt(t.more, { count: found.length - MAX_LISTED })}`);
  const query = filtersToParams(filters).toString();
  return {
    flags: FLAG_COMPONENTS_V2,
    allowed_mentions: { parse: [] },
    components: [
      {
        type: 17,
        accent_color: 0xf06c1e,
        components: [
          { type: 10, content: `## ${t.title}\n${plural(t.found, found.length, locale)}` },
          { type: 14, divider: true, spacing: 1 },
          { type: 10, content: found.length ? lines.join('\n') : t.none },
          {
            type: 1,
            components: [
              {
                type: 2,
                style: 5,
                label: m.Bot.card.openTracker,
                url: sitePath(siteUrl, locale, query ? `/?${query}` : '/'),
              },
            ],
          },
        ],
      },
    ],
  };
}

// ---------- dispatch ----------

async function command(i: Interaction, env: Env, now: number) {
  const locale = localeOf(i.locale);
  const t = messages(locale).Bot;
  const store = new Store(env.MISSIONS);

  switch (i.data?.name) {
    case 'vbucks': {
      const snapshot = await store.getCurrent();
      if (!snapshot) return ephemeral(t.error.noData);
      const message = buildDiscordMessage(snapshot, await store.getHistory(), {
        siteUrl: env.SITE_URL,
        vbucksEmoji: env.DISCORD_VBUCKS_EMOJI,
        locale,
      });
      return reply({ ...message });
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
      const known = await currentStatus(env, new Db(env.DB), now, 2 * 60 * 1000);
      return reply(buildStatusMessage(known.status, known.changedAt, locale));
    }
    case 'setup':
      return setupStatus(i, env, now);
    default:
      return ephemeral(t.error.unknown);
  }
}

async function setupStatus(i: Interaction, env: Env, now: number) {
  const userLocale = localeOf(i.locale);
  const t = messages(userLocale).Bot;
  const sub = i.data?.options?.find((o) => o.name === 'status');
  const channelId = String(option(sub?.options, 'channel') ?? '');
  if (!env.DB || !env.DISCORD_BOT_TOKEN || !i.guild_id || !channelId)
    return ephemeral(t.error.generic);
  // Installed only as a user app: the bot user is not on the server and cannot post.
  if (!i.authorizing_integration_owners?.[GUILD_INSTALL])
    return ephemeral(fmt(t.setup.notInServer, { url: inviteUrl(env.DISCORD_CLIENT_ID ?? '') }));

  const db = new Db(env.DB);
  const boardLang =
    (option(sub?.options, 'language') as Locale | undefined) ?? localeOf(i.guild_locale);
  const known = await currentStatus(env, db, now, 2 * 60 * 1000);
  const channel = `<#${channelId}>`;
  let messageId: string;
  try {
    const posted = await discordApi<{ id: string }>(
      env.DISCORD_BOT_TOKEN,
      'POST',
      `/channels/${channelId}/messages`,
      buildStatusMessage(known.status, known.changedAt, boardLang),
    );
    messageId = posted.id;
  } catch (err) {
    if (
      err instanceof DiscordApiError &&
      [DISCORD_MISSING_ACCESS, DISCORD_MISSING_PERMISSIONS, DISCORD_UNKNOWN_CHANNEL].includes(
        err.code ?? 0,
      )
    )
      return ephemeral(fmt(t.setup.noAccess, { channel }));
    throw err;
  }

  // One board per server: remove the previous one.
  const prev = await db.getGuild(i.guild_id);
  if (prev?.status_message_id && prev.status_channel_id) {
    await discordApi(
      env.DISCORD_BOT_TOKEN,
      'DELETE',
      `/channels/${prev.status_channel_id}/messages/${prev.status_message_id}`,
    ).catch(() => undefined);
  }
  await db.setStatusBoard(i.guild_id, boardLang, channelId, messageId, now);
  return ephemeral(fmt(t.setup.statusDone, { channel }));
}

async function component(i: Interaction, env: Env, now: number) {
  if (i.data?.custom_id !== STATUS_REFRESH_ID || !env.DB)
    return ephemeral(messages(localeOf(i.locale)).Bot.error.unknown);
  const db = new Db(env.DB);
  // A server board keeps its own language; a /status reply follows the user.
  const guild = i.guild_id ? await db.getGuild(i.guild_id) : null;
  const locale =
    guild && guild.status_message_id === i.message?.id ? boardLocale(guild) : localeOf(i.locale);
  const known = await currentStatus(env, db, now, 60 * 1000);
  return { type: UPDATE_MESSAGE, data: buildStatusMessage(known.status, known.changedAt, locale) };
}

export async function handleInteraction(request: Request, env: Env): Promise<Response> {
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
    else if (i.type === APPLICATION_COMMAND) response = await command(i, env, now);
    else if (i.type === MESSAGE_COMPONENT) response = await component(i, env, now);
    else response = ephemeral(messages(localeOf(i.locale)).Bot.error.unknown);
  } catch (err) {
    console.error('interaction', i.data?.name ?? i.data?.custom_id, err);
    response = ephemeral(messages(localeOf(i.locale)).Bot.error.generic);
  }
  return Response.json(response);
}
