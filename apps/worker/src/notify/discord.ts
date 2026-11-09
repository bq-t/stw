// Daily Discord notification, sent right after the day's snapshot is saved (00:00 UTC rotation).
// Components V2 card: one container with the site's colors, zone banner, one block per
// V-Bucks mission (mission icon on the right) and link buttons. Pure builder + one POST,
// so scripts/discord-preview.ts can render the same message without the Worker.

import {
  nextRotation,
  vbucksOf,
  ZONES,
  type DaySnapshot,
  type Mission,
  type VbucksHistory,
} from '@stw/shared';
import { itemInfo, readableItemId } from '@stw/shared/items';
import en from '../../../web/messages/en.json';
import iconsManifest from '../../../web/lib/icons-manifest.json';

/** --vbucks-shine and --accent-ui from apps/web/app/globals.css. */
const COLOR_VBUCKS = 0xee8a2c;
const COLOR_NONE = 0x3fa9ff;

/** Discord limits: 40 components per message. Header + footer take ~10, a mission block 4. */
const MAX_MISSIONS = 7;

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

const ICONS = iconsManifest as Record<string, Record<string, string>>;

/** Server emoji: V-Bucks totals ("650 V-Bucks today", "last V-Bucks alerts"). */
const EMOJI_VBUCKS_STACK = '<:vbucksstack:1569255073886900224>';
/** Server emoji in the mission details line. */
const EMOJI_POWER = '<:powerlevel:1569264880299802724>';
const EMOJI_ZONE = '<:stormshield:1569271087978512494>';
const EMOJI_ALERT: Partial<Record<Mission['alertKind'], string>> = {
  'mini-boss': '<:miniboss:1569265406542348439>',
  'mega-alert': '<:megaalert:1569266298582597632>',
};
/** Server emoji drawn as the thumbnail of the "No V-Bucks today" block (Discord CDN URL). */
const NO_VBUCKS_IMAGE = 'https://cdn.discordapp.com/emojis/1569256643819077642.webp?size=160';

export interface DiscordOptions {
  /** Site origin for links, e.g. "https://stw.bq-t.pro". */
  siteUrl: string;
  /** Custom server emoji for V-Bucks, e.g. "<:vbucks:123456789>". Optional. */
  vbucksEmoji?: string;
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

function missionName(type: string): string {
  const names = en.MissionType as Record<string, string>;
  return (
    names[type] ??
    type
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
  );
}

function zoneName(zone: Mission['zone']): string {
  return (en.Zone as Record<string, string>)[zone] ?? zone;
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

function rewardLabel(itemId: string, quantity: number): string {
  const name = itemInfo(itemId)?.name.en ?? readableItemId(itemId);
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
function dayLabel(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });
}

function missionBlock(m: Mission, opts: DiscordOptions) {
  const vb = vbucksOf(m);
  const emoji = opts.vbucksEmoji ? `${opts.vbucksEmoji} ` : '';
  const alertLabel =
    m.alertKind !== 'none' && m.alertKind !== 'other'
      ? (en.AlertKind as Record<string, string>)[m.alertKind]
      : '';
  const alertEmoji = EMOJI_ALERT[m.alertKind];
  const details = [
    `${EMOJI_POWER} ${m.powerLevel > 0 ? m.powerLevel : '?'}`,
    `${EMOJI_ZONE} ${zoneName(m.zone)}`,
    alertLabel ? (alertEmoji ? `${alertEmoji} ${alertLabel}` : alertLabel) : '',
    // A mega alert is always a group mission: the icon says enough.
    m.isGroup && m.alertKind !== 'mega-alert' ? 'Group' : '',
  ].filter(Boolean);
  const extras = m.alertRewards
    .filter((r) => !r.isVbucks && !HIDDEN_REWARDS.has(r.itemId))
    .map((r) => rewardLabel(r.itemId, r.quantity));

  // Title as the smallest heading, details in normal text, rewards in subtext.
  const lines = [
    `### ${emoji}${vb} V-Bucks  ·  ${missionName(m.missionType)}`,
    `${details.join('  ·  ')}${extras.length ? `\n-# + ${extras.join(', ')}` : ''}`,
  ];
  const icon = missionIconUrl(m, opts.siteUrl);
  if (!icon) return [text(lines.join('\n'))];
  return [
    {
      type: SECTION,
      components: [text(lines[0]!), text(lines[1]!)],
      accessory: { type: THUMBNAIL, media: { url: icon }, description: missionName(m.missionType) },
    },
  ];
}

/** The whole message for a day. Works for days with and without V-Bucks. */
export function buildDiscordMessage(
  snapshot: DaySnapshot,
  history: VbucksHistory | null,
  opts: DiscordOptions,
): DiscordMessage {
  const site = opts.siteUrl.replace(/\/$/, '');
  const o = { ...opts, siteUrl: site };
  // Grouped by zone in unlock order (Stonewood → Twine Peaks), lowest power first inside a zone.
  const missions = snapshot.missions
    .filter((m) => vbucksOf(m) > 0)
    .sort(
      (a, b) =>
        ZONES.indexOf(a.zone) - ZONES.indexOf(b.zone) ||
        a.powerLevel - b.powerLevel ||
        vbucksOf(b) - vbucksOf(a),
    );
  const total = snapshot.vbucksTotal;
  const has = missions.length > 0;
  const today = snapshot.date;
  const emoji = opts.vbucksEmoji ? `${opts.vbucksEmoji} ` : '';

  const yesterday = sumDays(history, today, 1, 1);
  const week = total + sumDays(history, today, 1, 6);
  const month = total + sumDays(history, today, 1, 29);
  const stats = `-# Yesterday ${emoji}**${yesterday}**  ·  7 days ${emoji}**${week}**  ·  30 days ${emoji}**${month}**`;
  const nextRotationTag = `<t:${Math.floor(nextRotation(new Date(snapshot.fetchedAt)).getTime() / 1000)}:R>`;

  const body: unknown[] = [];

  if (has) {
    // Banner of the zone of the easiest V-Bucks alert (lowest power level): a 900×200 strip.
    const easiest = missions.reduce((a, b) =>
      (b.powerLevel || Infinity) < (a.powerLevel || Infinity) ? b : a,
    );
    body.push({
      type: MEDIA_GALLERY,
      items: [
        {
          media: { url: `${site}/images/discord/zones/${easiest.zone}.webp` },
          description: zoneName(easiest.zone),
        },
      ],
    });
    const zones = ZONES.filter((z) => missions.some((m) => m.zone === z)).map(zoneName);
    body.push(
      text(
        [
          `-# ${dayLabel(today).toUpperCase()}  ·  Next rotation ${nextRotationTag}`,
          `## ${EMOJI_VBUCKS_STACK} ${total} V-Bucks today`,
          [`${missions.length} ${missions.length === 1 ? 'mission' : 'missions'}`, ...zones].join(
            '  ·  ',
          ),
          stats,
        ].join('\n'),
      ),
    );
    body.push(separator(false, 2));
    for (const m of missions.slice(0, MAX_MISSIONS)) body.push(...missionBlock(m, o));
    if (missions.length > MAX_MISSIONS) {
      body.push(text(`-# + ${missions.length - MAX_MISSIONS} more on the site`));
    }
  } else {
    const lastDay = history?.days.find((d) => d.date !== today && d.total > 0);
    // Trailing zero-width space line: a little extra room above the main block.
    body.push(
      text(`-# ${dayLabel(today).toUpperCase()}  ·  Next rotation ${nextRotationTag}\n${ZWSP}`),
    );
    // Same shape as a mission block: two lines with the picture on the right.
    const lastTs = lastDay ? Math.floor(Date.parse(`${lastDay.date}T00:00:00Z`) / 1000) : 0;
    body.push({
      type: SECTION,
      components: [
        text('## No V-Bucks today'),
        text(
          lastDay
            ? `Last V-Bucks alerts: ${EMOJI_VBUCKS_STACK} **${lastDay.total}** <t:${lastTs}:R>`
            : 'No V-Bucks alerts in the history yet',
        ),
        text(stats),
      ],
      accessory: { type: THUMBNAIL, media: { url: NO_VBUCKS_IMAGE }, description: 'No V-Bucks' },
    });
  }

  if (!has) {
    // Stats sit in the main block above; an empty gap (no line) before the buttons.
    body.push(separator(false, 2));
  }
  body.push({
    type: ACTION_ROW,
    components: [
      {
        type: BUTTON,
        style: BUTTON_LINK,
        label: 'Open tracker',
        url: has ? `${site}/?alert=vbucks` : `${site}/`,
      },
      { type: BUTTON, style: BUTTON_LINK, label: 'How to farm V-Bucks', url: `${site}/faq` },
    ],
  });

  return {
    flags: FLAG_COMPONENTS_V2,
    components: [
      { type: CONTAINER, accent_color: has ? COLOR_VBUCKS : COLOR_NONE, components: body },
    ],
    allowed_mentions: { parse: [] },
  };
}

/** Posts a message to a channel webhook. `with_components` lets a plain webhook send link buttons. */
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
