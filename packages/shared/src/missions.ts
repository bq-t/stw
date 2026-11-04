import type { AlertKind, Mission, Reward, Zone } from './types';
import { ZONES } from './types';

// Pure helpers over our own types: used by the site (filters, sorting) and the Worker (Discord).

export type RewardCategory =
  | 'vbucks'
  | 'xray'
  | 'event'
  | 'xp'
  | 'evo'
  | 'perk'
  | 'schematic'
  | 'hero'
  | 'survivor'
  | 'defender'
  | 'other';

export const REWARD_CATEGORIES: readonly RewardCategory[] = [
  'vbucks',
  'xray',
  'event',
  'xp',
  'evo',
  'perk',
  'schematic',
  'hero',
  'survivor',
  'defender',
  'other',
];

/** Category of an Epic item ID (checked against the 2026-11-04 response). */
export function rewardCategory(itemId: string): RewardCategory {
  const [type = '', name = ''] = itemId.toLowerCase().split(':');
  if (itemId === 'AccountResource:currency_mtxswap') return 'vbucks';
  if (name.startsWith('currency_xrayllama')) return 'xray';
  if (name === 'campaign_event_currency' || name.startsWith('eventcurrency')) return 'event';
  if (name === 'personnelxp' || name === 'schematicxp' || name === 'heroxp' || name === 'peoplexp')
    return 'xp';
  if (name.startsWith('reagent_alteration')) return 'perk';
  if (name.startsWith('reagent_c_') || name.startsWith('reagent_evolve')) return 'evo';
  if (type === 'schematic') return 'schematic';
  if (type === 'hero') return 'hero';
  if (type === 'worker') return 'survivor';
  if (type === 'defender') return 'defender';
  return 'other';
}

export function vbucksOf(mission: Mission): number {
  let total = 0;
  for (const r of mission.alertRewards) if (r.isVbucks) total += r.quantity;
  return total;
}

export function hasAlert(mission: Mission): boolean {
  return mission.alertRewards.length > 0;
}

export function allRewards(mission: Mission): Reward[] {
  return [...mission.alertRewards, ...mission.baseRewards];
}

/** V-Bucks first (largest first), then other alerts, then by power level, highest first. */
export function compareMissions(a: Mission, b: Mission): number {
  return (
    vbucksOf(b) - vbucksOf(a) ||
    Number(hasAlert(b)) - Number(hasAlert(a)) ||
    b.powerLevel - a.powerLevel ||
    a.tileIndex - b.tileIndex
  );
}

// ---------- filters (state lives in the URL) ----------

export type AlertFilter = 'all' | 'alerts' | 'vbucks';

export interface MissionFilters {
  zones: Zone[];
  alert: AlertFilter;
  rewards: RewardCategory[];
  plMin: number;
  plMax: number;
}

export const PL_MIN = 1;
export const PL_MAX = 160;

export const DEFAULT_FILTERS: MissionFilters = {
  zones: [],
  alert: 'all',
  rewards: [],
  plMin: PL_MIN,
  plMax: PL_MAX,
};

function list<T extends string>(raw: string | null, allowed: readonly T[]): T[] {
  if (!raw) return [];
  return raw.split(',').filter((x): x is T => (allowed as readonly string[]).includes(x));
}

function int(raw: string | null, fallback: number): number {
  const n = Number.parseInt(raw ?? '', 10);
  return Number.isFinite(n) ? Math.min(PL_MAX, Math.max(PL_MIN, n)) : fallback;
}

/** ?zone=stonewood,plankerton&alert=vbucks&reward=evo&pl=40-80 */
export function filtersFromParams(params: URLSearchParams): MissionFilters {
  const alert = params.get('alert');
  const [min, max] = (params.get('pl') ?? '').split('-');
  const plMin = int(min ?? null, PL_MIN);
  const plMax = int(max ?? null, PL_MAX);
  return {
    zones: list(params.get('zone'), ZONES),
    alert: alert === 'alerts' || alert === 'vbucks' ? alert : 'all',
    rewards: list(params.get('reward'), REWARD_CATEGORIES),
    plMin: Math.min(plMin, plMax),
    plMax: Math.max(plMin, plMax),
  };
}

export function filtersToParams(f: MissionFilters): URLSearchParams {
  const p = new URLSearchParams();
  if (f.zones.length) p.set('zone', f.zones.join(','));
  if (f.alert !== 'all') p.set('alert', f.alert);
  if (f.rewards.length) p.set('reward', f.rewards.join(','));
  if (f.plMin !== PL_MIN || f.plMax !== PL_MAX) p.set('pl', `${f.plMin}-${f.plMax}`);
  return p;
}

export function isDefaultFilters(f: MissionFilters): boolean {
  return filtersToParams(f).toString() === '';
}

export function matchesFilters(m: Mission, f: MissionFilters): boolean {
  if (f.zones.length && !f.zones.includes(m.zone)) return false;
  if (f.alert === 'alerts' && !hasAlert(m)) return false;
  if (f.alert === 'vbucks' && vbucksOf(m) === 0) return false;
  // Unknown power level (0) is never hidden by the range filter.
  if (m.powerLevel > 0 && (m.powerLevel < f.plMin || m.powerLevel > f.plMax)) return false;
  if (f.rewards.length) {
    const cats = new Set(allRewards(m).map((r) => rewardCategory(r.itemId)));
    if (!f.rewards.some((c) => cats.has(c))) return false;
  }
  return true;
}

export const ALERT_KINDS_WITH_BADGE: readonly AlertKind[] = [
  'mini-boss',
  'mega-alert',
  'storm-king',
  'elemental-fire',
  'elemental-nature',
  'elemental-water',
];
