import {
  nextRotation,
  rotationDay,
  VBUCKS_ITEM_ID,
  ZONES,
  addToHistory,
  type AlertKind,
  type DaySnapshot,
  type Mission,
  type Reward,
  type VbucksHistory,
  type Zone,
} from './index';

// DEMO DATA for UI work before the real world/info is available.
// Used only when NEXT_PUBLIC_API_URL is not set; the page shows a "demo data" banner.
// Numbers are plausible, not real.

const MISSION_TYPES = [
  'fight-the-storm',
  'ride-the-lightning',
  'retrieve-the-data',
  'evacuate-the-shelter',
  'deliver-the-bomb',
  'repair-the-shelter',
  'eliminate-and-collect',
  'build-the-radar-grid',
  'launch-the-rocket',
  'destroy-the-encampments',
];

const BIOMES = ['forest', 'grasslands', 'suburbs', 'city', 'industrial', 'desert', 'swamp'];

const PL_RANGE: Record<Zone, [number, number]> = {
  stonewood: [1, 19],
  plankerton: [19, 46],
  'canny-valley': [46, 76],
  'twine-peaks': [76, 160],
};

const BASE_ITEMS = [
  'AccountResource:heroxp',
  'AccountResource:schematicxp',
  'AccountResource:personnelxp',
  'AccountResource:reagent_c_t01',
  'AccountResource:reagent_c_t02',
  'AccountResource:reagent_c_t03',
  'AccountResource:reagent_c_t04',
];

const ALERT_ITEMS: { id: string; qty: [number, number]; rarity?: Reward['rarity'] }[] = [
  { id: 'AccountResource:reagent_alteration_upgrade_sr', qty: [1, 2], rarity: 'legendary' },
  { id: 'AccountResource:reagent_people', qty: [10, 30] },
  { id: 'AccountResource:reagent_evolverarity_sr', qty: [1, 1], rarity: 'legendary' },
  { id: 'AccountResource:currency_xrayllama', qty: [25, 75] },
  { id: 'Schematic:sid_assault_auto_sr_ore_t01', qty: [1, 1], rarity: 'legendary' },
  { id: 'Hero:hid_commando_sony_sr_t01', qty: [1, 1], rarity: 'legendary' },
  { id: 'Worker:workerbasic_sr_t01', qty: [1, 1], rarity: 'legendary' },
  { id: 'Defender:did_defenderpistol_basic_vr_t01', qty: [1, 1], rarity: 'epic' },
];

const ALERT_KINDS: AlertKind[] = ['mini-boss', 'mega-alert', 'elemental-fire', 'storm', 'other'];

/** Small deterministic PRNG so the demo day looks the same on every reload. */
function rng(seed: string) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

function snapshotFor(date: string): DaySnapshot {
  const r = rng(date);
  const int = (a: number, b: number) => a + Math.floor(r() * (b - a + 1));
  const pick = <T>(xs: readonly T[]) => xs[Math.floor(r() * xs.length)] as T;
  const missions: Mission[] = [];
  let vbucksMissions = int(3, 6);

  for (const zone of ZONES) {
    const [lo, hi] = PL_RANGE[zone];
    const count = int(12, 20);
    for (let i = 0; i < count; i++) {
      const tileIndex = int(1, 300);
      const alertRoll = r();
      const alertRewards: Reward[] = [];
      let alertKind: AlertKind = 'none';

      if (zone !== 'stonewood' && vbucksMissions > 0 && alertRoll < 0.12) {
        vbucksMissions--;
        alertKind = pick(ALERT_KINDS);
        alertRewards.push({
          itemId: VBUCKS_ITEM_ID,
          quantity: pick([40, 50, 60, 75, 80, 100]),
          isVbucks: true,
        });
      } else if (alertRoll < 0.35) {
        alertKind = pick(ALERT_KINDS);
        const item = pick(ALERT_ITEMS);
        alertRewards.push({
          itemId: item.id,
          quantity: int(item.qty[0], item.qty[1]),
          rarity: item.rarity,
          isVbucks: false,
        });
      }

      const baseRewards: Reward[] = [
        { itemId: pick(BASE_ITEMS), quantity: int(50, 900), isVbucks: false },
        { itemId: pick(BASE_ITEMS), quantity: int(5, 40), isVbucks: false },
      ];
      const missionType = pick(MISSION_TYPES);

      missions.push({
        id: `${zone}-${tileIndex}-${i}-${date}`,
        zone,
        missionType,
        missionGenerator: `demo/${missionType}`,
        biome: pick(BIOMES),
        powerLevel: int(lo, hi),
        difficultyRow: 'demo',
        tileIndex,
        alertKind,
        alertRewards,
        baseRewards,
        isGroup: r() < 0.15,
      });
    }
  }

  const fetched = new Date(`${date}T00:05:00Z`);
  return {
    date,
    fetchedAt: fetched.toISOString(),
    expiresAt: nextRotation(fetched).toISOString(),
    missions,
    vbucksTotal: missions.reduce(
      (s, m) => s + m.alertRewards.reduce((t, x) => t + (x.isVbucks ? x.quantity : 0), 0),
      0,
    ),
  };
}

export function demoSnapshot(now: Date = new Date()): DaySnapshot {
  return snapshotFor(rotationDay(now));
}

export function demoHistory(now: Date = new Date()): VbucksHistory {
  let history: VbucksHistory = { days: [] };
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    history = addToHistory(history, snapshotFor(rotationDay(d)));
  }
  return history;
}
