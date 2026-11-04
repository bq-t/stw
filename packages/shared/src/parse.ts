import {
  worldInfoSchema,
  type RawMission,
  type RawMissionAlert,
  type RawRewardItem,
  type RawWorldInfo,
} from './schema';
import { nextRotation, rotationDay } from './time';
import type { AlertKind, DaySnapshot, Mission, Reward, Zone } from './types';

// The only place that knows the shape of Epic's world/info.
// Mappings marked TODO(stage 2) are best guesses until checked against a real response.

export const VBUCKS_ITEM_ID = 'AccountResource:currency_mtxswap';

/** Known theater IDs of the four campaign zones. TODO(stage 2): verify. */
const ZONE_BY_THEATER_ID: Record<string, Zone> = {
  '33A2311D4AE64B361CCE27BC9F313C8B': 'stonewood',
  D477605B4FA48648107B649CE97FCF2D: 'plankerton',
  E6ECBD064B153234656CB4BDE6743870: 'canny-valley',
  D9A801C5444D1C74D1B7DAB5C7C12C5B: 'twine-peaks',
};

const ZONE_BY_NAME: Record<string, Zone> = {
  stonewood: 'stonewood',
  plankerton: 'plankerton',
  'canny valley': 'canny-valley',
  'twine peaks': 'twine-peaks',
};

/** Zone of a theater, or null for Ventures, tutorial and other non-campaign theaters. */
function zoneOf(theaterId: string, world: RawWorldInfo): Zone | null {
  const byId = ZONE_BY_THEATER_ID[theaterId.toUpperCase()];
  if (byId) return byId;
  const theater = world.theaters.find((t) => t.uniqueId === theaterId);
  const name = theater?.displayName?.en?.trim().toLowerCase();
  return (name && ZONE_BY_NAME[name]) || null;
}

/** "/Game/.../MissionGen_RideTheLightning.MissionGen_RideTheLightning_C" → "ride-the-lightning". */
export function missionTypeOf(generator: string): string {
  const cls = generator.split('.').pop() ?? generator;
  const name = cls
    .replace(/^MissionGen_/, '')
    .replace(/_C$/, '')
    .replace(/^(\d+)Gate_/, '')
    .replace(/_/g, '');
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

/** TODO(stage 2): build from real difficulty rows. Unknown rows give 0, the UI shows "?". */
const POWER_LEVEL_BY_ROW: Record<string, number> = {};

export function powerLevelOf(row: string | undefined): number {
  if (!row) return 0;
  return POWER_LEVEL_BY_ROW[row] ?? 0;
}

/** TODO(stage 2): check real categoryName / modifier values. */
export function alertKindOf(alert: RawMissionAlert | undefined): AlertKind {
  if (!alert) return 'none';
  const hay = `${alert.categoryName ?? ''} ${alert.name ?? ''}`.toLowerCase();
  if (hay.includes('miniboss')) return 'mini-boss';
  if (hay.includes('mega')) return 'mega-alert';
  if (hay.includes('stormking')) return 'storm-king';
  if (hay.includes('fire')) return 'elemental-fire';
  if (hay.includes('nature')) return 'elemental-nature';
  if (hay.includes('water')) return 'elemental-water';
  if (hay.includes('storm')) return 'storm';
  return 'other';
}

function toReward(item: RawRewardItem): Reward {
  return {
    itemId: item.itemType,
    quantity: item.quantity,
    isVbucks: item.itemType === VBUCKS_ITEM_ID,
  };
}

function toMission(
  zone: Zone,
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
    biome: '', // TODO(stage 2): tile → biome from theaters[].tiles
    powerLevel: powerLevelOf(row),
    difficultyRow: row,
    tileIndex: raw.tileIndex,
    alertKind: alertKindOf(alert),
    alertRewards: (alert?.missionAlertRewards?.items ?? []).map(toReward),
    baseRewards: (raw.missionRewards?.items ?? []).map(toReward),
    isGroup: /group/i.test(raw.missionGenerator) || /group/i.test(row),
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
    const zone = zoneOf(group.theaterId, world);
    if (!zone) continue;

    const alerts = world.missionAlerts.find((a) => a.theaterId === group.theaterId);
    const alertByTile = new Map<number, RawMissionAlert>();
    for (const alert of alerts?.availableMissionAlerts ?? []) {
      alertByTile.set(alert.tileIndex, alert);
    }

    for (const mission of group.availableMissions) {
      missions.push(toMission(zone, mission, alertByTile.get(mission.tileIndex), date));
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
