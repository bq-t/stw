// Daily Discord notification, sent right after the day's snapshot is saved (00:00 UTC rotation).
// Components V2 card: one container with the site's colors, zone banner, one block per
// V-Bucks mission (mission icon on the right) and link buttons. Pure builder + one POST,
// so scripts/discord-preview.ts can render the same message without the Worker.

import {
  nextRotation,
  vbucksOf,
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
const separator = (divider = true) => ({ type: SEPARATOR, divider, spacing: 1 });

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
  const details = [
    m.powerLevel > 0 ? `PL ${m.powerLevel}` : 'PL ?',
    zoneName(m.zone),
    m.alertKind !== 'none' && m.alertKind !== 'other'
      ? (en.AlertKind as Record<string, string>)[m.alertKind]
      : '',
    m.isGroup ? 'Group' : '',
  ].filter(Boolean);
  const extras = m.alertRewards
    .filter((r) => !r.isVbucks && !HIDDEN_REWARDS.has(r.itemId))
    .map((r) => rewardLabel(r.itemId, r.quantity));

  const lines = [
    `${emoji}**${vb} V-Bucks**  ·  ${missionName(m.missionType)}`,
    `-# ${details.join('  ·  ')}${extras.length ? `\n-# + ${extras.join(', ')}` : ''}`,
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
  const missions = snapshot.missions
    .filter((m) => vbucksOf(m) > 0)
    .sort((a, b) => vbucksOf(b) - vbucksOf(a) || b.powerLevel - a.powerLevel);
  const total = snapshot.vbucksTotal;
  const has = missions.length > 0;
  const today = snapshot.date;
  const emoji = opts.vbucksEmoji ? `${opts.vbucksEmoji} ` : '';

  const yesterday = sumDays(history, today, 1, 1);
  const week = total + sumDays(history, today, 1, 6);
  const month = total + sumDays(history, today, 1, 29);
  const stats = `-# Yesterday **${yesterday}**  ·  7 days **${week}**  ·  30 days **${month}**`;

  const body: unknown[] = [];

  if (has) {
    // Banner of the zone with the most V-Bucks today: a low 900×200 strip cut for Discord.
    const byZone = new Map<string, number>();
    for (const m of missions) byZone.set(m.zone, (byZone.get(m.zone) ?? 0) + vbucksOf(m));
    const topZone = [...byZone.entries()].sort((a, b) => b[1] - a[1])[0]![0];
    body.push({
      type: MEDIA_GALLERY,
      items: [
        {
          media: { url: `${site}/images/discord/zones/${topZone}.webp` },
          description: zoneName(topZone as Mission['zone']),
        },
      ],
    });
    const zones = [...byZone.keys()].map((z) => zoneName(z as Mission['zone']));
    body.push(
      text(
        [
          `-# STW V-BUCKS  ·  ${dayLabel(today).toUpperCase()}`,
          `## ${emoji}${total} V-Bucks today`,
          `${missions.length} ${missions.length === 1 ? 'mission' : 'missions'} in ${zones.join(', ')}`,
        ].join('\n'),
      ),
    );
    body.push(separator());
    for (const m of missions.slice(0, MAX_MISSIONS)) body.push(...missionBlock(m, o));
    if (missions.length > MAX_MISSIONS) {
      body.push(text(`-# + ${missions.length - MAX_MISSIONS} more on the site`));
    }
  } else {
    const lastDay = history?.days.find((d) => d.date !== today && d.total > 0);
    const daysAgo = lastDay
      ? Math.round(
          (Date.parse(`${today}T00:00:00Z`) - Date.parse(`${lastDay.date}T00:00:00Z`)) / 86_400_000,
        )
      : 0;
    body.push(
      text(
        [
          `-# STW V-BUCKS  ·  ${dayLabel(today).toUpperCase()}`,
          '## No V-Bucks today',
          lastDay
            ? `Last V-Bucks alerts: ${emoji}**${lastDay.total}** ${daysAgo === 1 ? 'yesterday' : `${daysAgo} days ago`}.`
            : '',
        ]
          .filter(Boolean)
          .join('\n'),
      ),
    );
  }

  const alerts = snapshot.missions.filter((m) => m.alertRewards.length > 0).length;
  body.push(separator());
  body.push(
    text(
      [
        stats,
        `-# ${snapshot.missions.length} missions, ${alerts} alerts  ·  Next rotation <t:${Math.floor(nextRotation(new Date(snapshot.fetchedAt)).getTime() / 1000)}:R>`,
      ].join('\n'),
    ),
  );
  body.push({
    type: ACTION_ROW,
    components: [
      {
        type: BUTTON,
        style: BUTTON_LINK,
        label: has ? 'V-Bucks missions' : 'Open tracker',
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
