// Discord mission cards of the bot: the day's V-Bucks card (/vbucks, /setup vbucks) and
// subscription notifications. Components V2: one container with the site's colors, zone
// banner, one block per mission (mission icon on the right) and link buttons. Pure builders.

import {
  nextRotation,
  stwItemName,
  vbucksOf,
  ZONES,
  type DaySnapshot,
  type Mission,
  type VbucksHistory,
} from '@stw/shared';
import { GAME_NAMES } from '@stw/shared/game-names';
import { rarityOf } from '@stw/shared/items';
import APP_EMOJIS from '../bot/app-emojis.json';
import { fmt, label, messages, plural, sitePath, type Locale, type Messages } from '../i18n';
import iconsManifest from '../../../web/lib/icons-manifest.json';

/** --vbucks-shine and --accent-ui from apps/web/app/globals.css. */
const COLOR_VBUCKS = 0xee8a2c;
const COLOR_NONE = 0x3fa9ff;
/** Brand orange: notifications without V-Bucks. */
const COLOR_BRAND = 0xf06c1e;

// Discord component types (Components V2).
const ACTION_ROW = 1;
const BUTTON = 2;
const SECTION = 9;
const TEXT = 10;
const THUMBNAIL = 11;
const MEDIA_GALLERY = 12;
const SEPARATOR = 14;
const CONTAINER = 17;
const BUTTON_LINK = 5;
const FLAG_COMPONENTS_V2 = 1 << 15;

/** Rewards the site does not show either (event currency comes with almost every alert). */
const HIDDEN_REWARDS = new Set(['AccountResource:campaign_event_currency']);
const VBUCKS_ID = 'AccountResource:currency_mtxswap';

const ICONS = iconsManifest as Record<string, Record<string, string>>;

/** Custom emoji in the card. `vbucks` is optional (amounts get no icon without it). */
export interface EmojiSet {
  vbucks?: string;
  /** V-Bucks totals ("650 V-Bucks today", "last V-Bucks alerts"). */
  vbucksStack: string;
  /** Mission details line. */
  power: string;
  zone: string;
  miniBoss: string;
  megaAlert: string;
}

/** Server emoji drawn as the thumbnail of the "No V-Bucks today" block (Discord CDN URL). */
const NO_VBUCKS_IMAGE = 'https://cdn.discordapp.com/emojis/1569256643819077642.webp?size=160';

export interface DiscordOptions {
  /** Site origin for links, e.g. "https://stw.bq-t.pro". */
  siteUrl: string;
  /** Default: the application emoji (bot/app-emojis.json, `pnpm bot:emojis`), shown anywhere. */
  emojis?: EmojiSet;
  /** Language of the texts and site links. Default "en". */
  locale?: Locale;
}

/** Options with the defaults filled in and the locale's messages at hand. */
interface Ctx {
  siteUrl: string;
  vbucksEmoji?: string;
  emojis: EmojiSet;
  locale: Locale;
  t: Messages;
}

function alertEmoji(kind: Mission['alertKind'], e: EmojiSet): string | undefined {
  return kind === 'mini-boss' ? e.miniBoss : kind === 'mega-alert' ? e.megaAlert : undefined;
}

export interface DiscordMessage {
  flags: number;
  components: unknown[];
  /** Mentions are never wanted: the text has no pings, but be explicit. */
  allowed_mentions: { parse: [] };
}

const text = (content: string) => ({ type: TEXT, content });
/** Zero-width space: makes an "empty" line, since Discord rejects blank text. */
const ZWSP = '​';
const separator = (divider = true, spacing: 1 | 2 = 1) => ({ type: SEPARATOR, divider, spacing });

function missionName(type: string, t: Messages): string {
  return label(t.MissionType, type);
}

function zoneName(zone: Mission['zone'], t: Messages): string {
  return label(t.Zone, zone);
}

/**
 * Absolute URL of the mission's game icon, same lookup order as MissionRow on the site.
 * Points to the padded copy in /images/discord/missions (apps/web/scripts/discord-assets.mjs):
 * Discord draws thumbnails at a fixed size, the padding makes the icon itself smaller.
 */
function missionIconUrl(m: Mission, siteUrl: string): string | null {
  const type = m.missionType;
  const storm = /^fight-the-category-\d-storm$/.test(type);
  const names = [
    ...(m.isGroup ? [`${type}-group`, type] : [type]),
    ...(storm
      ? m.isGroup
        ? ['fight-the-storm-group', 'fight-the-storm']
        : ['fight-the-storm']
      : []),
  ];
  const name = names.find((n) => ICONS.missions?.[n]);
  return name ? `${siteUrl}/images/discord/missions/${name}.webp` : null;
}

/**
 * Reward name as the site shows it (stwItemName: "Survivor", "Assault Rifle Defender"…),
 * with the rarity for survivors, defenders, heroes and schematics, whose name alone says
 * little: "Survivor (Epic)".
 */
export function rewardName(itemId: string, locale: Locale): string {
  const name = stwItemName(itemId, GAME_NAMES)[locale];
  const type = itemId.split(':')[0]?.toLowerCase();
  const rarity =
    type === 'worker' || type === 'defender' || type === 'hero' || type === 'schematic'
      ? rarityOf(itemId)
      : undefined;
  return rarity ? `${name} (${messages(locale).Rarity[rarity]})` : name;
}

function rewardLabel(itemId: string, quantity: number, locale: Locale): string {
  const name = rewardName(itemId, locale);
  return quantity > 1 ? `${name} ×${quantity}` : name;
}

/** V-Bucks in history days `from`…`to` days before `today` (0 = today). */
function sumDays(history: VbucksHistory | null, today: string, from: number, to: number): number {
  const todayMs = Date.parse(`${today}T00:00:00Z`);
  let total = 0;
  for (const d of history?.days ?? []) {
    const offset = Math.round((todayMs - Date.parse(`${d.date}T00:00:00Z`)) / 86_400_000);
    if (offset >= from && offset <= to) total += d.total;
  }
  return total;
}

/** "Thu, 6 Nov" in UTC (the rotation day). */
function dayLabel(date: string, locale: Locale): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });
}

/** Reward the block is titled with: V-Bucks by default, or what a subscription asked for. */
export interface LeadReward {
  itemId: string;
  quantity: number;
  isVbucks: boolean;
}

function leadLabel(r: LeadReward, opts: Ctx): string {
  if (r.isVbucks) return `${opts.vbucksEmoji ? `${opts.vbucksEmoji} ` : ''}${r.quantity} V-Bucks`;
  return rewardLabel(r.itemId, r.quantity, opts.locale);
}

/**
 * One mission as a block: "### <lead reward> · <mission>", power/zone/alert details, the
 * other alert rewards in subtext, the mission icon on the right. 4 components with the
 * icon (section, 2 texts, thumbnail), 1 without.
 */
function missionBlock(m: Mission, opts: Ctx, lead?: LeadReward | null) {
  const { t } = opts;
  const vb = vbucksOf(m);
  const head: LeadReward | null =
    lead === undefined ? { itemId: VBUCKS_ID, quantity: vb, isVbucks: true } : lead;
  const alertLabel =
    m.alertKind !== 'none' && m.alertKind !== 'other' ? label(t.AlertKind, m.alertKind) : '';
  const alertIcon = alertEmoji(m.alertKind, opts.emojis);
  const details = [
    `${opts.emojis.power} ${m.powerLevel > 0 ? m.powerLevel : '?'}`,
    `${opts.emojis.zone} ${zoneName(m.zone, t)}`,
    alertLabel ? (alertIcon ? `${alertIcon} ${alertLabel}` : alertLabel) : '',
    // A mega alert is always a group mission: the icon says enough.
    m.isGroup && m.alertKind !== 'mega-alert' ? t.Bot.card.group : '',
  ].filter(Boolean);
  // Every alert reward except the headline one (V-Bucks are all in the headline).
  const extras = m.alertRewards
    .filter((r) => !HIDDEN_REWARDS.has(r.itemId))
    .filter((r) =>
      head?.isVbucks
        ? !r.isVbucks
        : !(head && r.itemId === head.itemId && r.quantity === head.quantity),
    )
    .map((r) => (r.isVbucks ? leadLabel(r, opts) : rewardLabel(r.itemId, r.quantity, opts.locale)));

  // Title as the smallest heading, details in normal text, rewards in subtext.
  const title = head
    ? `${leadLabel(head, opts)}  ·  ${missionName(m.missionType, t)}`
    : missionName(m.missionType, t);
  const lines = [
    `### ${title}`,
    `${details.join('  ·  ')}${extras.length ? `\n-# + ${extras.join(', ')}` : ''}`,
  ];
  const icon = missionIconUrl(m, opts.siteUrl);
  if (!icon) return [text(lines.join('\n'))];
  return [
    {
      type: SECTION,
      components: [text(lines[0]!), text(lines[1]!)],
      accessory: {
        type: THUMBNAIL,
        media: { url: icon },
        description: missionName(m.missionType, t),
      },
    },
  ];
}

function context(opts: DiscordOptions): Ctx {
  const locale = opts.locale ?? 'en';
  const emojis = opts.emojis ?? APP_EMOJIS;
  return {
    siteUrl: opts.siteUrl.replace(/\/$/, ''),
    vbucksEmoji: emojis.vbucks,
    emojis,
    locale,
    t: messages(locale),
  };
}

/** Zone banner (900×200) of the easiest mission (lowest power level). */
function zoneBanner(missions: Mission[], o: Ctx) {
  const easiest = missions.reduce((a, b) =>
    (b.powerLevel || Infinity) < (a.powerLevel || Infinity) ? b : a,
  );
  return {
    type: MEDIA_GALLERY,
    items: [
      {
        media: { url: `${o.siteUrl}/images/discord/zones/${easiest.zone}.webp` },
        description: zoneName(easiest.zone, o.t),
      },
    ],
  };
}

const rotationLine = (snapshot: DaySnapshot, o: Ctx) =>
  `-# ${dayLabel(snapshot.date, o.locale).toUpperCase()}  ·  ${o.t.Bot.card.nextRotation} <t:${Math.floor(
    nextRotation(new Date(snapshot.fetchedAt)).getTime() / 1000,
  )}:R>`;

/** By zone in unlock order (Stonewood → Twine Peaks), lowest power first inside a zone. */
const byZone = (a: Mission, b: Mission) =>
  ZONES.indexOf(a.zone) - ZONES.indexOf(b.zone) ||
  a.powerLevel - b.powerLevel ||
  vbucksOf(b) - vbucksOf(a);

/** Discord counts every component of a message, nested ones too, up to 40. */
const MAX_COMPONENTS = 40;
/** Messages with mission blocks at most; the rest is one closing card with a site link. */
const MAX_BLOCK_MESSAGES = 1;

const countComponents = (list: unknown[]): number =>
  list.reduce<number>((n, c) => {
    const o = c as { components?: unknown[]; accessory?: unknown };
    return n + 1 + (o.components ? countComponents(o.components) : 0) + (o.accessory ? 1 : 0);
  }, 0);

const message = (accent: number, components: unknown[]): DiscordMessage => ({
  flags: FLAG_COMPONENTS_V2,
  components: [{ type: CONTAINER, accent_color: accent, components }],
  allowed_mentions: { parse: [] },
});

const linkButton = (label: string, url: string) => ({
  type: BUTTON,
  style: BUTTON_LINK,
  label,
  url,
});

/**
 * Head + mission blocks + buttons in one message, up to the 40-component limit. Missions
 * that do not fit go to a closing card ("+ N missions" and a link to the tracker).
 */
function paginate(
  o: Ctx,
  accent: number,
  head: unknown[],
  blocks: unknown[][],
  buttons: unknown,
  trackerUrl: string,
): DiscordMessage[] {
  const pages: unknown[][] = [[...head]];
  // The container, plus the buttons in the first message.
  const reserved = (page: number) => 1 + (page === 0 ? countComponents([buttons]) : 0);
  let shown = 0;
  for (const block of blocks) {
    const page = pages.length - 1;
    const used = countComponents(pages[page]!) + reserved(page);
    if (used + countComponents(block) <= MAX_COMPONENTS) pages[page]!.push(...block);
    else if (pages.length < MAX_BLOCK_MESSAGES) pages.push([...block]);
    else break;
    shown++;
  }
  pages[0]!.push(buttons);
  const out = pages.map((p) => message(accent, p));
  const rest = blocks.length - shown;
  if (rest > 0) {
    const c = o.t.Bot.card;
    out.push(
      message(accent, [
        text(`## + ${plural(c.missions, rest, o.locale)}\n${c.moreOnSite}`),
        { type: ACTION_ROW, components: [linkButton(c.openTracker, trackerUrl)] },
      ]),
    );
  }
  return out;
}

/**
 * The day's V-Bucks card (/vbucks, /setup vbucks). Works for days with and
 * without V-Bucks; a day with many V-Bucks missions takes a second message with a site link.
 */
export function buildDiscordMessages(
  snapshot: DaySnapshot,
  history: VbucksHistory | null,
  opts: DiscordOptions,
): DiscordMessage[] {
  const o = context(opts);
  const { siteUrl: site, vbucksEmoji, emojis, locale, t } = o;
  const c = t.Bot.card;
  const missions = snapshot.missions.filter((m) => vbucksOf(m) > 0).sort(byZone);
  const total = snapshot.vbucksTotal;
  const has = missions.length > 0;
  const today = snapshot.date;
  const emoji = vbucksEmoji ? `${vbucksEmoji} ` : '';

  const yesterday = sumDays(history, today, 1, 1);
  const week = total + sumDays(history, today, 1, 6);
  const month = total + sumDays(history, today, 1, 29);
  const stats = `-# ${c.yesterday} ${emoji}**${yesterday}**  ·  ${c.days7} ${emoji}**${week}**  ·  ${c.days30} ${emoji}**${month}**`;
  const trackerUrl = sitePath(site, locale, has ? '/pve?alert=vbucks' : '/pve');
  const buttons = {
    type: ACTION_ROW,
    components: [
      linkButton(c.openTracker, trackerUrl),
      linkButton(c.howToFarm, sitePath(site, locale, '/faq')),
    ],
  };

  if (has) {
    const zones = ZONES.filter((z) => missions.some((m) => m.zone === z)).map((z) =>
      zoneName(z, t),
    );
    const head = [
      zoneBanner(missions, o),
      text(
        [
          rotationLine(snapshot, o),
          `## ${emojis.vbucksStack} ${fmt(c.vbucksToday, { total })}`,
          [plural(c.missions, missions.length, locale), ...zones].join('  ·  '),
          stats,
        ].join('\n'),
      ),
      separator(false, 2),
    ];
    const blocks = missions.map((m) => missionBlock(m, o));
    return paginate(o, COLOR_VBUCKS, head, blocks, buttons, trackerUrl);
  }

  const lastDay = history?.days.find((d) => d.date !== today && d.total > 0);
  const lastTs = lastDay ? Math.floor(Date.parse(`${lastDay.date}T00:00:00Z`) / 1000) : 0;
  return [
    message(COLOR_NONE, [
      // Trailing zero-width space line: a little extra room above the main block.
      text(`${rotationLine(snapshot, o)}\n${ZWSP}`),
      // Same shape as a mission block: two lines with the picture on the right.
      {
        type: SECTION,
        components: [
          text(`## ${c.noVbucks}`),
          text(
            lastDay
              ? `${c.lastAlerts} ${emojis.vbucksStack} **${lastDay.total}** <t:${lastTs}:R>`
              : c.noHistory,
          ),
          text(stats),
        ],
        accessory: {
          type: THUMBNAIL,
          media: { url: NO_VBUCKS_IMAGE },
          description: 'No V-Bucks',
        },
      },
      // Stats sit in the main block above; an empty gap (no line) before the buttons.
      separator(false, 2),
      buttons,
    ]),
  ];
}

export interface MissionCardsOptions extends DiscordOptions {
  /** "## …" heading of the first message. */
  title: string;
  /** Line under the heading, e.g. the subscription filter. */
  subtitle: string;
  /**
   * Heading instead of `title` when nothing matches (the site's test DM): the card then
   * looks like "No V-Bucks today" (blue, the fish on the right).
   */
  emptyTitle: string;
  /** Site path of the tracker button, e.g. "/pve?reward=evo". */
  trackerPath: string;
  /** Headline reward of a block; V-Bucks when omitted, mission name only for null. */
  lead?: (m: Mission) => LeadReward | null;
}

/**
 * Missions in the look of the daily card (zone banner, rotation line, heading, one block
 * per mission, tracker button), split like it: one message of blocks and, if they do not
 * all fit, a closing card with a link to the site.
 */
export function buildMissionCards(
  snapshot: DaySnapshot,
  list: Mission[],
  opts: MissionCardsOptions,
): DiscordMessage[] {
  const o = context(opts);
  const { t } = o;
  const missions = [...list].sort(byZone);
  const trackerUrl = sitePath(o.siteUrl, o.locale, opts.trackerPath);
  const buttons = {
    type: ACTION_ROW,
    components: [linkButton(t.Bot.card.openTracker, trackerUrl)],
  };
  if (!missions.length)
    return [
      message(COLOR_NONE, [
        text(`${rotationLine(snapshot, o)}
${ZWSP}`),
        {
          type: SECTION,
          components: [text(`## ${opts.emptyTitle}`), text(opts.subtitle)],
          accessory: { type: THUMBNAIL, media: { url: NO_VBUCKS_IMAGE }, description: 'Fishstick' },
        },
        separator(false, 2),
        buttons,
      ]),
    ];
  const zones = ZONES.filter((z) => missions.some((m) => m.zone === z)).map((z) => zoneName(z, t));
  const head: unknown[] = [zoneBanner(missions, o)];
  head.push(
    text(
      [
        rotationLine(snapshot, o),
        `## ${opts.title}`,
        opts.subtitle,
        missions.length
          ? `-# ${[plural(t.Bot.card.missions, missions.length, o.locale), ...zones].join('  ·  ')}`
          : '',
      ]
        .filter(Boolean)
        .join('\n'),
    ),
  );
  head.push(separator(false, 2));
  // The colour of /events and the other bot cards; only the V-Bucks card is gold.
  const accent = COLOR_BRAND;
  const blocks = missions.map((m) => missionBlock(m, o, opts.lead ? opts.lead(m) : undefined));
  return paginate(o, accent, head, blocks, buttons, trackerUrl);
}

/**
 * Posts a message to a webhook (only the local preview, DEV_PREVIEW_TARGET). `with_components`
 * lets a plain webhook send link buttons.
 */
export async function postDiscord(webhookUrl: string, message: DiscordMessage): Promise<void> {
  const url = new URL(webhookUrl);
  url.searchParams.set('with_components', 'true');
  url.searchParams.set('wait', 'true');
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message),
  });
  if (!res.ok) {
    const detail = (await res.text()).slice(0, 500);
    throw new Error(`Discord webhook failed: HTTP ${res.status} ${detail}`);
  }
}
