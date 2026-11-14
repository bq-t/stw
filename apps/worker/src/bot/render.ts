// Mission list card shared by /missions and subscription notifications.

import { compareMissions, type Mission } from '@stw/shared';
import { fmt, label, messages, sitePath, type Locale } from '../i18n';
import { rewardName } from '../notify/discord';
import { FLAG_COMPONENTS_V2 } from './status';

const MAX_LISTED = 12;
const HIDDEN_REWARDS = new Set(['AccountResource:campaign_event_currency']);
const BRAND = 0xf06c1e;

export function rewardText(m: Mission, locale: Locale): string {
  return m.alertRewards
    .filter((r) => !HIDDEN_REWARDS.has(r.itemId))
    .map((r) => {
      const name = r.isVbucks ? 'V-Bucks' : rewardName(r.itemId, locale);
      return r.quantity > 1 ? `${name} ×${r.quantity}` : name;
    })
    .join(', ');
}

export interface MissionListOptions {
  /** Markdown above the divider, e.g. "## Missions\n3 missions". */
  heading: string;
  /** Missions to list (sorted here). */
  missions: Mission[];
  /** Shown when `missions` is empty. */
  emptyText: string;
  /** Tracker query string without "?" (filters), "" for none. */
  trackerQuery: string;
  locale: Locale;
  siteUrl: string;
}

export function missionListMessage(o: MissionListOptions) {
  const m = messages(o.locale);
  const sorted = [...o.missions].sort(compareMissions);
  const lines = sorted.slice(0, MAX_LISTED).map((x) => {
    const alert =
      x.alertKind !== 'none' && x.alertKind !== 'other'
        ? ` · ${label(m.AlertKind, x.alertKind)}`
        : '';
    const rewards = rewardText(x, o.locale);
    return `**${x.powerLevel || '?'}** · ${label(m.Zone, x.zone)} · ${label(m.MissionType, x.missionType)}${alert}${
      rewards ? `\n-# ${rewards}` : ''
    }`;
  });
  if (sorted.length > MAX_LISTED)
    lines.push(`-# ${fmt(m.Bot.missions.more, { count: sorted.length - MAX_LISTED })}`);
  return {
    flags: FLAG_COMPONENTS_V2,
    allowed_mentions: { parse: [] as never[] },
    components: [
      {
        type: 17,
        accent_color: BRAND,
        components: [
          { type: 10, content: o.heading },
          { type: 14, divider: true, spacing: 1 },
          { type: 10, content: sorted.length ? lines.join('\n') : o.emptyText },
          {
            type: 1,
            components: [
              {
                type: 2,
                style: 5,
                label: m.Bot.card.openTracker,
                url: sitePath(
                  o.siteUrl,
                  o.locale,
                  o.trackerQuery ? `/pve?${o.trackerQuery}` : '/pve',
                ),
              },
            ],
          },
        ],
      },
    ],
  };
}
