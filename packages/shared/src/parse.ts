import {
  worldInfoSchema,
  type RawMission,
  type RawMissionAlert,
  type RawRewardItem,
  type RawTheater,
  type RawWorldInfo,
} from './schema';
import { nextRotation, rotationDay } from './time';
import type { AlertKind, DaySnapshot, Mission, Reward, Zone } from './types';

// The only place that knows the shape of Epic's world/info.
// Mappings below were built from a real response (2026-11-04).

export const VBUCKS_ITEM_ID = 'AccountResource:currency_mtxswap';

/**
 * Campaign theaters by ID. Matching by name is NOT safe: the response also has a
 * one-tile tutorial theater called "Stonewood", plus Ventures, Dungeons, Homebase, tests.
 */
const ZONE_BY_THEATER_ID: Record<string, Zone> = {
  '33A2311D4AE64B361CCE27BC9F313C8B': 'stonewood',
  D477605B4FA48648107B649CE97FCF27: 'plankerton',
  E6ECBD064B153234656CB4BDE6743870: 'canny-valley',
  D9A801C5444D1C74D1B7DAB5C7C12C5B: 'twine-peaks',
};

export function zoneOfTheater(theaterId: string): Zone | null {
  return ZONE_BY_THEATER_ID[theaterId.toUpperCase()] ?? null;
}

// ---------- power level ----------

/**
 * Difficulty rows map 1:1 to reward tiers T01…T26 (verified on the real response:
 * Start_Zone1..5 → T01..05, Normal → T06..10, Hard → T11..15, Nightmare → T16..20,
 * Endgame_Zone1..6 → T21..26). Power level per tier is the in-game ladder.
 * TODO: confirm a few values in game (one mission per zone).
 */
const POWER_LEVEL_BY_TIER = [
  1, 3, 5, 9, 15, 19, 23, 28, 34, 40, 46, 52, 58, 64, 70, 76, 82, 88, 94, 100, 108, 116, 124, 132,
  140, 160,
];

const ROW_BASE: Record<string, number> = {
  Start: 0,
  Normal: 5,
  Hard: 10,
  Nightmare: 15,
  Endgame: 20,
};

/** "Theater_Hard_Group_Zone3" → 13. Outposts and unknown rows → 0. */
export function tierOf(row: string | undefined): number {
  const m = row?.match(
    /^Theater_(Start|Normal|Hard|Nightmare|Endgame)(?:_Group)?_Zone(\d+)(?:_|$)/,
  );
  if (!m) return 0;
  const zone = Number(m[2]);
  // Dudebro rows: Nightmare_Zone10 → T25, matching their T25 rewards; clamp to the ladder.
  const tier = (ROW_BASE[m[1] as string] ?? 0) + zone;
  return Math.min(tier, POWER_LEVEL_BY_TIER.length);
}

export function powerLevelOf(row: string | undefined): number {
  const tier = tierOf(row);
  return tier > 0 ? (POWER_LEVEL_BY_TIER[tier - 1] ?? 0) : 0;
}

// ---------- mission type ----------

/** Short names used in generator classes → our mission type keys. */
const MISSION_ABBR: Record<string, string> = {
  '1gate': 'fight-the-storm',
  '1gateshort': 'fight-the-storm',
  '1gatenobonus': 'fight-the-storm',
  '1gatevlt': 'fight-the-storm',
  cat1fts: 'fight-the-storm',
  '2gates': 'fight-the-category-2-storm',
  '3gates': 'fight-the-category-3-storm',
  '4gates': 'fight-the-category-4-storm',
  plankharbor3gate: 'fight-the-category-3-storm',
  rtd: 'retrieve-the-data',
  retrievethedata: 'retrieve-the-data',
  rtl: 'ride-the-lightning',
  ridethelightning: 'ride-the-lightning',
  rtlstormquest2018landmark: 'ride-the-lightning',
  rts: 'repair-the-shelter',
  etshelter: 'evacuate-the-shelter',
  ets: 'evacuate-the-shelter',
  etsurvivors: 'evacuate-the-survivors',
  evacuatethesurvivors: 'evacuate-the-survivors',
  dtb: 'deliver-the-bomb',
  dte: 'destroy-the-encampments',
  destroytheencampments: 'destroy-the-encampments',
  ltr: 'launch-the-rocket',
  ltb: 'launch-the-balloon',
  launchtheballoon: 'launch-the-balloon',
  buildtheradargrid: 'build-the-radar-grid',
  eliminateandcollect: 'eliminate-and-collect',
  refuelthebase: 'refuel-the-homebase',
  resupply: 'resupply',
  deploytheprobe: 'deploy-the-probe',
  hittheroad: 'hit-the-road',
  buildoff: 'build-off',
  buildthememorial: 'build-the-memorial',
  stabilizetherift: 'stabilize-the-rift',
  fightthegunslinger: 'fight-the-gunslinger',
  vindermanmansion: 'vinderman-mansion',
  dudebro: 'dudebro',
  theoutpost: 'storm-shield-defense',
};

/** Prefixes and suffixes that do not change the mission type. */
const NOISE = [
  /^T\d_/, // tier family: T1_, T2_, T3_
  /^(V?HT|MT|LT)_/, // threat level: VHT_, HT_, MT_, LT_
  /^R\d_/, // region: R1_ … R5_
  /_Group$/,
  /_PVE\d+on$/,
  /_PvE_\d+$/,
  /_(NoSecondary|WithRift|Tutorial|WR|CannyValley|Twine)$/,
];

/** "/…/MissionGen_T2_R5_RtD_Group.MissionGen_T2_R5_RtD_Group_C" → "retrieve-the-data". */
export function missionTypeOf(generator: string): string {
  let name = (generator.split('.').pop() ?? generator)
    .replace(/^MissionGen_/, '')
    .replace(/_C$/, '');
  let changed = true;
  while (changed) {
    changed = false;
    for (const re of NOISE) {
      const next = name.replace(re, '');
      if (next !== name) {
        name = next;
        changed = true;
      }
    }
  }
  const key = name.replace(/_/g, '').toLowerCase();
  return (
    MISSION_ABBR[key] ??
    name
      .replace(/_/g, '')
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
      .toLowerCase()
  );
}

export function isGroupMission(raw: RawMission): boolean {
  return (
    /_Group/i.test(raw.missionGenerator) ||
    /_Group_/i.test(raw.missionDifficultyInfo?.rowName ?? '')
  );
}

// ---------- biome ----------

const BIOMES: [RegExp, string][] = [
  [/Suburb/i, 'suburbs'],
  [/Grassland/i, 'grasslands'],
  [/Lakeside/i, 'lakes'],
  [/Industrial/i, 'industrial'],
  [/GhostTown/i, 'ghost-town'],
  [/City/i, 'city'],
  [/Forest/i, 'forest'],
  [/Desert/i, 'desert'],
  [/Route99/i, 'route-99'],
  [/Island/i, 'island'],
  [/Outpost/i, 'outpost'],
];

/** "/…/BP_ZT_TheSuburbs.BP_ZT_TheSuburbs_C" → "suburbs"; special maps → "". */
export function biomeOf(zoneTheme: string | undefined): string {
  if (!zoneTheme) return '';
  const cls = zoneTheme.split('.').pop() ?? zoneTheme;
  return BIOMES.find(([re]) => re.test(cls))?.[1] ?? '';
}

// ---------- alerts ----------

/** categoryName values seen: Storm_CramSessionMiniBoss, MegaAlertCategory[_MinibossF|I|L],
 *  Storm_FirePassive, Storm_IcePassive, Storm_LightningPassive, Storm_CramSessionPassiveStorm, DudebroCategory. */
export function alertKindOf(alert: RawMissionAlert | undefined): AlertKind {
  if (!alert) return 'none';
  const c = (alert.categoryName ?? '').toLowerCase();
  if (c.startsWith('megaalert')) return 'mega-alert';
  if (c.includes('stormking')) return 'storm-king';
  if (c.includes('miniboss')) return 'mini-boss';
  if (c.includes('fire')) return 'elemental-fire';
  if (c.includes('ice') || c.includes('water')) return 'elemental-water';
  if (c.includes('lightning') || c.includes('nature')) return 'elemental-nature';
  if (c.includes('storm')) return 'storm';
  return 'other';
}

// ---------- rewards ----------

/**
 * Regular mission rewards come as card packs ("CardPack:zcp_personnelxp_t04") whose
 * amount is rolled at the end of the mission. Map them to the resource they give,
 * with quantity 0 = "amount varies".
 */
const CARD_PACKS: [RegExp, string][] = [
  [/^zcp_personnelxp/, 'AccountResource:personnelxp'],
  [/^zcp_schematicxp/, 'AccountResource:schematicxp'],
  [/^zcp_heroxp/, 'AccountResource:heroxp'],
  [/^zcp_eventscaling/, 'AccountResource:eventcurrency_scaling'],
  [/^zcp_reagent_alteration_generic/, 'AccountResource:reagent_alteration_generic'],
];

function normalizeCardPack(itemType: string): string {
  const name = itemType.slice('CardPack:'.length);
  for (const [re, id] of CARD_PACKS) if (re.test(name)) return id;
  // zcp_reagent_alteration_upgrade_sr_high → reagent_alteration_upgrade_sr
  const upgrade = name.match(/^zcp_(reagent_alteration_upgrade_(?:uc|r|vr|sr))/);
  if (upgrade) return `AccountResource:${upgrade[1]}`;
  // zcp_reagent_c_t03_low → reagent_c_t03
  const evo = name.match(/^zcp_(reagent_c_t\d\d)/);
  if (evo) return `AccountResource:${evo[1]}`;
  return itemType;
}

function toReward(item: RawRewardItem): Reward {
  const isPack = item.itemType.startsWith('CardPack:zcp_');
  const itemId = isPack ? normalizeCardPack(item.itemType) : item.itemType;
  return {
    itemId,
    quantity: isPack ? 0 : item.quantity,
    isVbucks: itemId === VBUCKS_ITEM_ID,
  };
}

// ---------- snapshot ----------

function toMission(
  zone: Zone,
  theater: RawTheater | undefined,
  raw: RawMission,
  alert: RawMissionAlert | undefined,
  date: string,
): Mission {
  const row = raw.missionDifficultyInfo?.rowName ?? '';
  return {
    id: `${zone}-${raw.tileIndex}-${date}`,
    zone,
    missionType: missionTypeOf(raw.missionGenerator),
    missionGenerator: raw.missionGenerator,
    biome: biomeOf(theater?.tiles[raw.tileIndex]?.zoneTheme),
    powerLevel: powerLevelOf(row),
    difficultyRow: row,
    tileIndex: raw.tileIndex,
    alertKind: alertKindOf(alert),
    alertRewards: (alert?.missionAlertRewards?.items ?? []).map(toReward),
    baseRewards: (raw.missionRewards?.items ?? []).map(toReward),
    isGroup: isGroupMission(raw),
  };
}

/** Validates a raw world/info response. Throws a ZodError if the shape changed. */
export function validateWorldInfo(raw: unknown): RawWorldInfo {
  return worldInfoSchema.parse(raw);
}

/** Raw world/info → today's snapshot of the four campaign zones. */
export function parseWorldInfo(raw: unknown, now: Date = new Date()): DaySnapshot {
  const world = validateWorldInfo(raw);
  const date = rotationDay(now);
  const missions: Mission[] = [];

  for (const group of world.missions) {
    const zone = zoneOfTheater(group.theaterId);
    if (!zone) continue;
    const theater = world.theaters.find((t) => t.uniqueId === group.theaterId);

    const alerts = world.missionAlerts.find((a) => a.theaterId === group.theaterId);
    const alertByTile = new Map<number, RawMissionAlert>();
    for (const alert of alerts?.availableMissionAlerts ?? []) {
      alertByTile.set(alert.tileIndex, alert);
    }

    for (const mission of group.availableMissions) {
      missions.push(toMission(zone, theater, mission, alertByTile.get(mission.tileIndex), date));
    }
  }

  return {
    date,
    fetchedAt: now.toISOString(),
    expiresAt: nextRotation(now).toISOString(),
    missions,
    vbucksTotal: sumVbucks(missions),
  };
}

function sumVbucks(missions: Mission[]): number {
  let total = 0;
  for (const m of missions) {
    for (const r of m.alertRewards) if (r.isVbucks) total += r.quantity;
  }
  return total;
}

/** Fingerprint of the day's alerts, to detect that Epic has not rotated yet. */
export function alertsFingerprint(snapshot: DaySnapshot): string {
  return snapshot.missions
    .filter((m) => m.alertRewards.length > 0)
    .map(
      (m) =>
        `${m.zone}:${m.tileIndex}:${m.alertRewards.map((r) => `${r.itemId}x${r.quantity}`).join(',')}`,
    )
    .sort()
    .join('|');
}
