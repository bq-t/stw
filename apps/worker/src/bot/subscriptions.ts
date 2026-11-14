// Subscriptions: /subscribe, /setup alerts and their delivery after the rotation.

import {
  allRewards,
  DEFAULT_FILTERS,
  filtersToParams,
  matchesSubscription,
  parseSubscriptionFilter,
  rewardCategory,
  vbucksOf,
  type DaySnapshot,
  type Mission,
  type VbucksHistory,
  type SubscriptionFilter,
} from '@stw/shared';
import type { Db, SubscriptionRow } from '../db';
import { fmt, label, localeOf, messages, type Locale } from '../i18n';
import { discordApi, isCannotDm } from './api';
import {
  buildDiscordMessages,
  buildMissionCards,
  rewardName,
  type LeadReward,
} from '../notify/discord';
import APP_EMOJIS from './app-emojis.json';

export const MAX_SUBSCRIPTIONS = 10;
const VBUCKS_ID = 'AccountResource:currency_mtxswap';
/** Event currency and Gold come with almost every alert: never the headline. */
const IGNORED = new Set([
  'AccountResource:campaign_event_currency',
  'AccountResource:eventcurrency_scaling',
]);
/** Rows checked per cron run: matching is cheap, only sends cost requests. */
const CHECK_BATCH = 200;

/** "Pure Drop of Rain ≥ 30 · Twine Peaks · PL 100–140" in the given language. */
export function describeFilter(f: SubscriptionFilter, locale: Locale): string {
  const m = messages(locale);
  if (f.card === 'vbucks') return m.Bot.subs.vbucksCard;
  const min = f.minQty && f.minQty > 1 ? ` ≥ ${f.minQty}` : '';
  const parts: string[] = [];
  if (f.item) parts.push(rewardName(f.item, locale) + min);
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

/**
 * Headline reward of a mission in a notification: V-Bucks if it has any, else the reward
 * the subscription asked for (item, or the largest one of the chosen categories), else the
 * first alert reward.
 */
export function leadReward(m: Mission, f: SubscriptionFilter): LeadReward | null {
  const vb = vbucksOf(m);
  if (vb > 0) return { itemId: VBUCKS_ID, quantity: vb, isVbucks: true };
  const rewards = allRewards(m).filter((r) => !IGNORED.has(r.itemId));
  const largest = (list: typeof rewards) =>
    list.reduce<(typeof rewards)[number] | null>(
      (a, b) => (!a || b.quantity > a.quantity ? b : a),
      null,
    );
  if (f.item) return largest(rewards.filter((r) => r.itemId === f.item));
  if (f.rewards.length) {
    const hit = largest(rewards.filter((r) => f.rewards.includes(rewardCategory(r.itemId))));
    if (hit) return hit;
  }
  return m.alertRewards.find((r) => !IGNORED.has(r.itemId)) ?? null;
}

/**
 * The notification: one message, plus a card with a link to the site when not every
 * mission fits. `found` 0 = nothing to send today.
 */
export function notificationMessage(
  f: SubscriptionFilter,
  snapshot: DaySnapshot,
  locale: Locale,
  siteUrl: string,
  history: VbucksHistory | null = null,
) {
  const t = messages(locale).Bot;
  // The V-Bucks card goes out every rotation, with or without V-Bucks (as the webhook).
  if (f.card === 'vbucks')
    return {
      found: 1,
      messages: buildDiscordMessages(snapshot, history, { siteUrl, emojis: APP_EMOJIS, locale }),
    };
  const found = snapshot.missions.filter((m) => matchesSubscription(m, f));
  const query = filtersToParams(f).toString();
  return {
    found: found.length,
    messages: buildMissionCards(snapshot, found, {
      siteUrl,
      emojis: APP_EMOJIS,
      locale,
      title: t.subs.notifTitle,
      subtitle: describeFilter(f, locale),
      emptyTitle: t.subs.notifEmptyTitle,
      trackerPath: query ? `/pve?${query}` : '/pve',
      lead: (m) => leadReward(m, f),
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
  history: VbucksHistory | null,
  siteUrl: string,
  now: number,
  budget: number,
): Promise<number> {
  let used = 0;
  const due = await db.dueSubscriptions(snapshot.date, CHECK_BATCH);
  for (const row of due) {
    const f = parseRowFilter(row);
    const locale = localeOf(row.locale);
    const note = f ? notificationMessage(f, snapshot, locale, siteUrl, history) : null;
    if (!note || note.found === 0) {
      await db.markChecked(row.id, snapshot.date, {});
      continue;
    }
    // One request per message; a DM without a cached channel needs one more to open it.
    const cost = note.messages.length + (row.target === 'dm' && !row.dm_channel_id ? 1 : 0);
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
      for (const message of note.messages)
        await discordApi(token, 'POST', `/channels/${channelId}/messages`, message);
      await db.markChecked(row.id, snapshot.date, { sentAt: now, error: null, dmChannelId });
    } catch (err) {
      const msg = isCannotDm(err)
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
