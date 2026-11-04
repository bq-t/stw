// Our own data model. The raw Epic response never leaves parse.ts;
// the site, the Worker and the notifier only see these types.

export type Zone = 'stonewood' | 'plankerton' | 'canny-valley' | 'twine-peaks';

export const ZONES: readonly Zone[] = ['stonewood', 'plankerton', 'canny-valley', 'twine-peaks'];

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';

export type AlertKind =
  | 'mini-boss'
  | 'mega-alert'
  | 'storm-king'
  | 'storm'
  | 'elemental-fire'
  | 'elemental-nature'
  | 'elemental-water'
  | 'other'
  | 'none';

export interface Reward {
  /** Epic internal ID, e.g. "AccountResource:currency_mtxswap". Key in the items catalog. */
  itemId: string;
  quantity: number;
  rarity?: Rarity;
  /** V-Bucks: highlighted on the site and shown with the founders-only tooltip. */
  isVbucks: boolean;
}

export interface Mission {
  /** Stable within a day: zone + tile index + date. */
  id: string;
  zone: Zone;
  /** Mission type key, e.g. "ride-the-lightning". Derived from the mission generator. */
  missionType: string;
  /** Raw generator path, kept until the mission-type mapping is verified. */
  missionGenerator: string;
  /** Biome key, e.g. "forest". Empty until tile → biome mapping is known. */
  biome: string;
  /** 1…160. 0 when the difficulty row is not in the mapping yet. */
  powerLevel: number;
  /** Raw difficulty row name, kept until the power-level mapping is verified. */
  difficultyRow: string;
  tileIndex: number;
  alertKind: AlertKind;
  /** One-time bonus for completing the alert. */
  alertRewards: Reward[];
  /** Regular mission rewards. */
  baseRewards: Reward[];
  isGroup: boolean;
}

export interface DaySnapshot {
  /** Rotation day in UTC, "YYYY-MM-DD". */
  date: string;
  /** ISO timestamp of the fetch. */
  fetchedAt: string;
  /** Next rotation, 00:00 UTC, ISO. */
  expiresAt: string;
  missions: Mission[];
  /** Sum of V-Bucks across all alerts of the day. */
  vbucksTotal: number;
}

export interface VbucksHistoryDay {
  date: string;
  total: number;
  missions: number;
}

export interface VbucksHistory {
  /** Last 30 days, newest first. */
  days: VbucksHistoryDay[];
}
