import { describe, expect, it } from 'vitest';
import { ZodError } from 'zod';
import {
  alertKindOf,
  alertsFingerprint,
  biomeOf,
  missionTypeOf,
  parseWorldInfo,
  powerLevelOf,
  tierOf,
} from '../src/parse';
import raw from './world-info.2026-11-04.json';

// Trimmed excerpt of a real world/info response from 2026-11-04.
const NOW = new Date('2026-11-04T00:10:00Z');

describe('parseWorldInfo on a real response', () => {
  const snapshot = parseWorldInfo(raw, NOW);

  it('keeps only the four campaign zones (no tutorial Stonewood, no Ventures)', () => {
    expect(new Set(snapshot.missions.map((m) => m.zone))).toEqual(
      new Set(['stonewood', 'plankerton', 'canny-valley', 'twine-peaks']),
    );
    expect(snapshot.missions).toHaveLength(41); // 44 minus 3 storm shield defenses
  });

  it('parses the V-Bucks alert of the day', () => {
    const vb = snapshot.missions.find((m) => m.alertRewards.some((r) => r.isVbucks));
    expect(vb).toMatchObject({
      zone: 'canny-valley',
      tileIndex: 75,
      missionType: 'fight-the-storm',
      powerLevel: 58,
      biome: 'suburbs',
      alertKind: 'mini-boss',
      isGroup: false,
    });
    expect(vb?.alertRewards[0]).toEqual({
      itemId: 'AccountResource:currency_mtxswap',
      quantity: 50,
      isVbucks: true,
    });
    expect(snapshot.vbucksTotal).toBe(50);
  });

  it('maps card-pack base rewards to resources with an unknown amount', () => {
    const vb = snapshot.missions.find((m) => m.tileIndex === 75 && m.zone === 'canny-valley');
    expect(vb?.baseRewards.map((r) => [r.itemId, r.quantity])).toEqual([
      ['AccountResource:personnelxp', 0],
      ['AccountResource:eventcurrency_scaling', 0],
      ['AccountResource:schematicxp', 0],
    ]);
  });

  it('keeps power levels inside each zone range', () => {
    const range = {
      stonewood: [1, 19],
      plankerton: [19, 46],
      'canny-valley': [46, 70],
      'twine-peaks': [76, 160],
    } as const;
    for (const m of snapshot.missions) {
      const [lo, hi] = range[m.zone];
      expect(m.powerLevel, `${m.zone} ${m.difficultyRow}`).toBeGreaterThanOrEqual(lo);
      expect(m.powerLevel, `${m.zone} ${m.difficultyRow}`).toBeLessThanOrEqual(hi);
    }
  });

  it('drops storm shield defenses and marks group missions', () => {
    expect(snapshot.missions.some((m) => m.missionType === 'storm-shield-defense')).toBe(false);
    expect(snapshot.missions.filter((m) => m.isGroup).length).toBe(22);
  });

  it('fails loudly when the shape changes', () => {
    expect(() => parseWorldInfo({ theaters: [], missions: 'nope', missionAlerts: [] })).toThrow(
      ZodError,
    );
  });

  it('fingerprint is stable across days for the same alerts', () => {
    const next = parseWorldInfo(raw, new Date('2026-11-05T00:10:00Z'));
    expect(alertsFingerprint(next)).toBe(alertsFingerprint(snapshot));
  });
});

describe('power level', () => {
  it.each([
    ['Theater_Start_Zone1', 1, 1],
    ['Theater_Start_Group_Zone5', 5, 15],
    ['Theater_Normal_Zone1', 6, 19],
    ['Theater_Normal_Zone5', 10, 40],
    ['Theater_Hard_Zone1', 11, 46],
    ['Theater_Hard_Zone3', 13, 58],
    ['Theater_Hard_Zone5_Dudebro', 15, 70],
    ['Theater_Nightmare_Zone1', 16, 76],
    ['Theater_Nightmare_Zone10_Dudebro', 25, 140],
    ['Theater_Endgame_Group_Zone6', 26, 160],
    ['Theater_Hard_Outpost1', 0, 0],
  ])('%s → tier %i, PL %i', (row, tier, pl) => {
    expect(tierOf(row)).toBe(tier);
    expect(powerLevelOf(row)).toBe(pl);
  });
});

describe('missionTypeOf (real generator names)', () => {
  it.each([
    ['MissionGen_T3_R5_RtD', 'retrieve-the-data'],
    ['MissionGen_T2_R5_RtL', 'ride-the-lightning'],
    ['MissionGen_RideTheLightning_Group_PVE02on', 'ride-the-lightning'],
    ['MissionGen_T3_R5_EtShelter', 'evacuate-the-shelter'],
    ['MissionGen_EtShelter_Group', 'evacuate-the-shelter'],
    ['MissionGen_T2_EtSurvivors', 'evacuate-the-survivors'],
    ['MissionGen_T3_R5_DtB', 'deliver-the-bomb'],
    ['MissionGen_DtB_Group', 'deliver-the-bomb'],
    ['MissionGen_T3_R5_DtE', 'destroy-the-encampments'],
    ['MissionGen_RtS_Group', 'repair-the-shelter'],
    ['MissionGen_T1_VHT_Cat1FtS', 'fight-the-storm'],
    ['MissionGen_1Gate_Group', 'fight-the-storm'],
    ['MissionGen_T3_R5_3Gates', 'fight-the-category-3-storm'],
    ['MissionGen_4Gates_Group', 'fight-the-category-4-storm'],
    ['MissionGen_LtR_Twine', 'launch-the-rocket'],
    ['MissionGen_T1_HT_LtB', 'launch-the-balloon'],
    ['MissionGen_EliminateAndCollect_WR', 'eliminate-and-collect'],
    ['MissionGen_Resupply_WithRift', 'resupply'],
    ['MissionGen_RefuelTheBase', 'refuel-the-homebase'],
    ['MissionGen_T2_R1_BuildtheRadarGrid', 'build-the-radar-grid'],
    ['MissionGen_TheOutpost_PvE_03', 'storm-shield-defense'],
    ['MissionGen_HTM', 'hunt-the-titan'],
  ])('%s → %s', (cls, expected) => {
    expect(missionTypeOf(`/SaveTheWorld/World/MissionGens/${cls}.${cls}_C`)).toBe(expected);
  });
});

describe('alertKindOf (real categories)', () => {
  const alert = (categoryName: string) => ({
    missionAlertGuid: 'x',
    tileIndex: 1,
    availableUntil: '',
    categoryName,
  });

  it.each([
    ['Storm_CramSessionMiniBoss', 'mini-boss'],
    ['MegaAlertCategory', 'mega-alert'],
    ['MegaAlertCategory_MinibossF', 'mega-alert'],
    ['Storm_FirePassive', 'elemental-fire'],
    ['Storm_IcePassive', 'elemental-water'],
    ['Storm_LightningPassive', 'elemental-nature'],
    ['Storm_CramSessionPassiveStorm', 'storm'],
    ['DudebroCategory', 'other'],
  ] as const)('%s → %s', (category, expected) => {
    expect(alertKindOf(alert(category))).toBe(expected);
  });
});

describe('biomeOf', () => {
  it.each([
    ['/STW_Zones/World/ZoneThemes/ZT_TheSuburbs/BP_ZT_TheSuburbs.BP_ZT_TheSuburbs_C', 'suburbs'],
    ['/X/BP_ZT_AD2_TheGrasslands.BP_ZT_AD2_TheGrasslands_C', 'autumn-foothills'],
    ['/X/BP_ZT_AD_TheCity.BP_ZT_AD_TheCity_C', 'autumn-city'],
    ['/X/BP_ZT_AD_Lakeside.BP_ZT_AD_Lakeside_C', 'lakeside'],
    ['/X/BP_ZT_TP_Island01.BP_ZT_TP_Island01_C', 'tropical'],
    ['/X/BP_ZT_Desert_Bunker.BP_ZT_Desert_Bunker_C', 'desert'],
    ['/X/BP_ZT_TheIndustrialPark_Arid.BP_ZT_TheIndustrialPark_Arid_C', 'industrial-park'],
    ['/X/BP_ZT_Route99_Bunker_1.BP_ZT_Route99_Bunker_1_C', 'thunder-route-99'],
    ['/X/BP_ZT_VindermansLab.BP_ZT_VindermansLab_C', ''],
  ])('%s → %s', (theme, expected) => {
    expect(biomeOf(theme)).toBe(expected);
  });
});
