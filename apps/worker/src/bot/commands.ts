// Slash command definitions. Registered with `pnpm bot:register` (scripts/bot-register.ts);
// the Worker reads the same option names in interactions.ts.

import {
  MIN_QTY_MAX,
  REWARD_CATEGORIES,
  SUBSCRIBABLE_ITEMS,
  ZONES,
  type AlertFilter,
} from '@stw/shared';
import { ITEMS } from '@stw/shared/items';
import { messages } from '../i18n';

const en = messages('en');
const ru = messages('ru');

// Option types
const SUB_COMMAND = 1;
const STRING = 3;
const INTEGER = 4;
const CHANNEL = 7;
// Channel types: text, announcement
const GUILD_TEXT = 0;
const GUILD_ANNOUNCEMENT = 5;
// Integration types: guild install, user install. Contexts: guild, bot DM, private channels.
const GUILD_INSTALL = 0;
const USER_INSTALL = 1;
const CTX_GUILD = 0;
const CTX_BOT_DM = 1;
const CTX_PRIVATE = 2;
/** Manage Server: /setup is for server admins (they can widen it in Server Settings). */
const MANAGE_GUILD = String(1 << 5);

type CommandKey = keyof typeof en.Bot.commands;
const desc = (key: CommandKey) => ({
  description: en.Bot.commands[key],
  description_localizations: { ru: ru.Bot.commands[key] },
});

function choices<K extends string>(keys: readonly K[], name: (m: typeof en, k: K) => string) {
  return keys.map((k) => ({
    name: name(en, k),
    name_localizations: { ru: name(ru, k) },
    value: k,
  }));
}

const ALERTS: AlertFilter[] = ['miniboss', 'vbucks', 'alerts', 'all'];
const ALERT_LABEL = {
  miniboss: 'alertMiniboss',
  vbucks: 'alertVbucks',
  alerts: 'alertAlerts',
  all: 'alertAll',
} as const;

const everywhere = {
  integration_types: [GUILD_INSTALL, USER_INSTALL],
  contexts: [CTX_GUILD, CTX_BOT_DM, CTX_PRIVATE],
};

const missionOptions = [
  {
    type: STRING,
    name: 'zone',
    ...desc('zone'),
    choices: choices(ZONES, (m, k) => m.Zone[k]),
  },
  {
    type: STRING,
    name: 'alert',
    ...desc('alert'),
    choices: choices(ALERTS, (m, k) => m.Filters[ALERT_LABEL[k]]),
  },
  {
    type: STRING,
    name: 'reward',
    ...desc('reward'),
    choices: choices(REWARD_CATEGORIES, (m, k) => m.RewardCategory[k]),
  },
  { type: INTEGER, name: 'pl_min', ...desc('plMin'), min_value: 1, max_value: 160 },
  { type: INTEGER, name: 'pl_max', ...desc('plMax'), min_value: 1, max_value: 160 },
];

/** Reward items a subscription can name: the resource catalog without event currency. */
export const ITEM_CHOICES = SUBSCRIBABLE_ITEMS.map((id) => ({
  name: ITEMS[id]!.name.en,
  name_localizations: { ru: ITEMS[id]!.name.ru },
  value: id,
}));

/** Subscription filters: the item and the amount first (that is what people subscribe to). */
const subscriptionOptions = [
  { type: STRING, name: 'item', ...desc('item'), choices: ITEM_CHOICES },
  { type: INTEGER, name: 'min', ...desc('min'), min_value: 1, max_value: MIN_QTY_MAX },
  ...missionOptions,
];

const channelOption = {
  type: CHANNEL,
  name: 'channel',
  ...desc('channel'),
  required: true,
  channel_types: [GUILD_TEXT, GUILD_ANNOUNCEMENT],
};

const languageOption = {
  type: STRING,
  name: 'language',
  ...desc('language'),
  choices: [
    { name: 'English', value: 'en' },
    { name: 'Русский', value: 'ru' },
  ],
};

export const COMMANDS = [
  { name: 'vbucks', ...desc('vbucks'), ...everywhere },
  { name: 'missions', ...desc('missions'), ...everywhere, options: missionOptions },
  { name: 'status', ...desc('status'), ...everywhere },
  { name: 'subscribe', ...desc('subscribe'), ...everywhere, options: subscriptionOptions },
  { name: 'subscriptions', ...desc('subscriptions'), ...everywhere },
  {
    name: 'setup',
    ...desc('setup'),
    integration_types: [GUILD_INSTALL],
    contexts: [CTX_GUILD],
    default_member_permissions: MANAGE_GUILD,
    options: [
      {
        type: SUB_COMMAND,
        name: 'status',
        ...desc('setupStatus'),
        options: [channelOption, languageOption],
      },
      {
        type: SUB_COMMAND,
        name: 'alerts',
        ...desc('setupAlerts'),
        options: [channelOption, ...subscriptionOptions, languageOption],
      },
      { type: SUB_COMMAND, name: 'list', ...desc('setupList') },
    ],
  },
];

/** Permissions the bot asks for on a server install: View Channel, Send Messages, Embed Links. */
export const BOT_PERMISSIONS = String((1 << 10) | (1 << 11) | (1 << 14));

/** Install to the user's account (not a server): lets Fishstick DM them. */
export function userInstallUrl(appId: string): string {
  return `https://discord.com/oauth2/authorize?client_id=${appId}&integration_type=1&scope=applications.commands`;
}

export function inviteUrl(appId: string): string {
  return `https://discord.com/oauth2/authorize?client_id=${appId}`;
}
