// Subscriptions: /subscribe, /setup alerts and their delivery after the rotation.

import {
  DEFAULT_FILTERS,
  filtersToParams,
  matchesSubscription,
  parseSubscriptionFilter,
  type DaySnapshot,
  type SubscriptionFilter,
} from '@stw/shared';
import { itemInfo, readableItemId } from '@stw/shared/items';
import type { Db, SubscriptionRow } from '../db';
import { fmt, label, localeOf, messages, type Locale } from '../i18n';
import { DiscordApiError, discordApi } from './api';
import { missionListMessage } from './render';

export const MAX_SUBSCRIPTIONS = 10;
/** Rows checked per cron run: matching is cheap, only sends cost requests. */
const CHECK_BATCH = 200;

// Discord: "Cannot send messages to this user" (DMs closed / no shared server).
const DISCORD_CANNOT_DM = 50007;

/** "Pure Drop of Rain ≥ 30 · Twine Peaks · PL 100–140" in the given language. */
export function describeFilter(f: SubscriptionFilter, locale: Locale): string {
  const m = messages(locale);
  const min = f.minQty && f.minQty > 1 ? ` ≥ ${f.minQty}` : '';
  const parts: string[] = [];
  if (f.item) parts.push((itemInfo(f.item)?.name[locale] ?? readableItemId(f.item)) + min);
  else if (f.rewards.length)
    parts.push(f.rewards.map((r) => label(m.RewardCategory, r)).join(', ') + min);
  if (f.alert === 'vbucks') parts.push(m.Filters.alertVbucks);
  else if (f.alert === 'miniboss') parts.push(m.Filters.alertMiniboss);
  else if (f.alert === 'all') parts.push(m.Filters.alertAll);
  if (f.zones.length) parts.push(f.zones.map((z) => label(m.Zone, z)).join(', '));
  if (f.plMin !== DEFAULT_FILTERS.plMin || f.plMax !== DEFAULT_FILTERS.plMax)
    parts.push(fmt(m.Bot.subs.pl, { min: f.plMin, max: f.plMax }));
  if (!parts.length || (!f.item && !f.rewards.length && min))
    parts.unshift(m.Bot.subs.anyMission + min);
  return parts.join(' · ');
}

export function notificationMessage(
  f: SubscriptionFilter,
  snapshot: DaySnapshot,
  locale: Locale,
  siteUrl: string,
) {
  const t = messages(locale).Bot;
  const found = snapshot.missions.filter((m) => matchesSubscription(m, f));
  return {
    found: found.length,
    message: missionListMessage({
      heading: `## ${t.subs.notifTitle}\n${describeFilter(f, locale)}`,
      missions: found,
      emptyText: t.missions.none,
      trackerQuery: filtersToParams(f).toString(),
      locale,
      siteUrl,
    }),
  };
}

export function parseRowFilter(row: SubscriptionRow): SubscriptionFilter | null {
  try {
    return parseSubscriptionFilter(JSON.parse(row.filter));
  } catch {
    return null;
  }
}

/**
 * Sends today's notifications for due subscriptions within `budget` Discord requests.
 * Rows without matches are only marked as checked. Returns the requests used.
 */
export async function deliverSubscriptions(
  token: string,
  db: Db,
  snapshot: DaySnapshot,
  siteUrl: string,
  now: number,
  budget: number,
): Promise<number> {
  let used = 0;
  const due = await db.dueSubscriptions(snapshot.date, CHECK_BATCH);
  for (const row of due) {
    const f = parseRowFilter(row);
    const locale = localeOf(row.locale);
    const note = f ? notificationMessage(f, snapshot, locale, siteUrl) : null;
    if (!note || note.found === 0) {
      await db.markChecked(row.id, snapshot.date, {});
      continue;
    }
    // A DM without a cached channel needs one more request to open it.
    const cost = row.target === 'dm' && !row.dm_channel_id ? 2 : 1;
    if (used + cost > budget) break; // the rest goes out on the next run
    used += cost;
    try {
      let channelId = row.target === 'dm' ? row.dm_channel_id : row.target_id;
      let dmChannelId: string | undefined;
      if (row.target === 'dm' && !channelId) {
        const dm = await discordApi<{ id: string }>(token, 'POST', '/users/@me/channels', {
          recipient_id: row.target_id,
        });
        channelId = dmChannelId = dm.id;
      }
      if (row.target === 'webhook') throw new Error('webhook delivery is not implemented yet');
      await discordApi(token, 'POST', `/channels/${channelId}/messages`, note.message);
      await db.markChecked(row.id, snapshot.date, { sentAt: now, error: null, dmChannelId });
    } catch (err) {
      const msg =
        err instanceof DiscordApiError && err.code === DISCORD_CANNOT_DM
          ? 'cannot DM this user'
          : err instanceof Error
            ? err.message.slice(0, 300)
            : String(err);
      console.error('subscription', row.id, msg);
      await db.markChecked(row.id, snapshot.date, { error: msg });
    }
  }
  return used;
}
