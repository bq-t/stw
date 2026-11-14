// Subscription filters (Fishstick stage 3): the tracker filters plus "at least N of a reward",
// e.g. Pure Drop of Rain >= 30. Pure code, shared by the Worker (bot + delivery) and the site.

import {
  allRewards,
  DEFAULT_FILTERS,
  matchesFilters,
  PL_MAX,
  PL_MIN,
  REWARD_CATEGORIES,
  rewardCategory,
  type AlertFilter,
  type MissionFilters,
  type RewardCategory,
} from './missions';
import { ITEMS } from './items';
import { ZONES, type Mission, type Zone } from './types';

export interface SubscriptionFilter extends MissionFilters {
  /** Exact reward item id (e.g. "AccountResource:reagent_c_t01"). */
  item?: string;
  /** Minimum quantity of the item, or of a reward in `rewards` (any reward if none). */
  minQty?: number;
  /**
   * "vbucks": not a mission filter but the day's V-Bucks card (as the channel webhook),
   * posted after every rotation, with or without V-Bucks (/setup vbucks).
   */
  card?: 'vbucks';
}

/** Rewards that come with almost every alert: never a reason to notify. */
const IGNORED_REWARDS = new Set([
  'AccountResource:campaign_event_currency',
  'AccountResource:eventcurrency_scaling',
]);

export const MIN_QTY_MAX = 100_000;

export function matchesSubscription(m: Mission, f: SubscriptionFilter): boolean {
  if (!matchesFilters(m, f)) return false;
  const min = f.minQty ?? 1;
  if (f.item) return allRewards(m).some((r) => r.itemId === f.item && r.quantity >= min);
  if (f.minQty && f.minQty > 1) {
    return allRewards(m).some(
      (r) =>
        !IGNORED_REWARDS.has(r.itemId) &&
        r.quantity >= min &&
        (!f.rewards.length || f.rewards.includes(rewardCategory(r.itemId))),
    );
  }
  return true;
}

const ALERTS: readonly AlertFilter[] = ['miniboss', 'alerts', 'all', 'vbucks'];

function intIn(v: unknown, min: number, max: number): number | undefined {
  return typeof v === 'number' && Number.isInteger(v) && v >= min && v <= max ? v : undefined;
}

/**
 * Stored JSON (or user input) → filter. Unknown values fall back to defaults,
 * so an old row never breaks the delivery. Null for anything that is not an object.
 */
export function parseSubscriptionFilter(raw: unknown): SubscriptionFilter | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  const list = <T extends string>(v: unknown, allowed: readonly T[]): T[] =>
    Array.isArray(v) ? v.filter((x): x is T => (allowed as readonly unknown[]).includes(x)) : [];
  const a = intIn(o.plMin, PL_MIN, PL_MAX) ?? DEFAULT_FILTERS.plMin;
  const b = intIn(o.plMax, PL_MIN, PL_MAX) ?? DEFAULT_FILTERS.plMax;
  const f: SubscriptionFilter = {
    zones: list<Zone>(o.zones, ZONES),
    alert: ALERTS.includes(o.alert as AlertFilter) ? (o.alert as AlertFilter) : 'alerts',
    rewards: list<RewardCategory>(o.rewards, REWARD_CATEGORIES),
    plMin: Math.min(a, b),
    plMax: Math.max(a, b),
  };
  if (typeof o.item === 'string' && /^[A-Za-z]+:[\w.-]{1,120}$/.test(o.item)) f.item = o.item;
  const min = intIn(o.minQty, 1, MIN_QTY_MAX);
  if (min && min > 1) f.minQty = min;
  if (o.card === 'vbucks') f.card = 'vbucks';
  return f;
}

/** Reward items a subscription can name (bot choices and the site's list): resources without event currency. */
export const SUBSCRIBABLE_ITEMS: readonly string[] = Object.keys(ITEMS).filter(
  (id) => !IGNORED_REWARDS.has(id),
);
