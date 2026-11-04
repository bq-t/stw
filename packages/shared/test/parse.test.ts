import { describe, expect, it } from 'vitest';
import { ZodError } from 'zod';
import { alertKindOf, alertsFingerprint, missionTypeOf, parseWorldInfo } from '../src/parse';
import raw from './world-info.synthetic.json';

const NOW = new Date('2026-11-04T00:10:00Z');

describe('parseWorldInfo', () => {
  const snapshot = parseWorldInfo(raw, NOW);

  it('keeps the four campaign zones and drops Ventures', () => {
    expect(snapshot.missions.map((m) => m.zone).sort()).toEqual([
      'canny-valley',
      'plankerton',
      'stonewood',
      'stonewood',
    ]);
  });

  it('falls back to the theater display name when the ID is unknown', () => {
    expect(snapshot.missions.find((m) => m.tileIndex === 3)?.zone).toBe('canny-valley');
  });

  it('attaches alerts to missions by tile and sums V-Bucks', () => {
    const rtl = snapshot.missions.find((m) => m.tileIndex === 5);
    expect(rtl?.alertRewards).toEqual([
      { itemId: 'AccountResource:currency_mtxswap', quantity: 50, isVbucks: true },
    ]);
    expect(rtl?.alertKind).toBe('mini-boss');
    expect(snapshot.missions.find((m) => m.tileIndex === 7)?.alertKind).toBe('none');
    expect(snapshot.vbucksTotal).toBe(125);
  });

  it('sets the rotation day and expiry', () => {
    expect(snapshot.date).toBe('2026-11-04');
    expect(snapshot.expiresAt).toBe('2026-11-05T00:00:00.000Z');
    expect(snapshot.missions[0]?.id).toMatch(/-2026-11-04$/);
  });

  it('detects group missions', () => {
    expect(snapshot.missions.find((m) => m.tileIndex === 12)?.isGroup).toBe(true);
    expect(snapshot.missions.find((m) => m.tileIndex === 5)?.isGroup).toBe(false);
  });

  it('fails loudly when the shape changes', () => {
    expect(() => parseWorldInfo({ theaters: [], missions: 'nope', missionAlerts: [] })).toThrow(
      ZodError,
    );
  });
});

describe('missionTypeOf', () => {
  it.each([
    ['/A/MissionGen_RideTheLightning.MissionGen_RideTheLightning_C', 'ride-the-lightning'],
    ['/A/MissionGen_1Gate_FightTheStorm.MissionGen_1Gate_FightTheStorm_C', 'fight-the-storm'],
    [
      '/A/MissionGen_Group_EvacuateTheShelter.MissionGen_Group_EvacuateTheShelter_C',
      'evacuate-the-shelter',
    ],
  ])('%s → %s', (generator, expected) => {
    expect(missionTypeOf(generator)).toBe(expected);
  });
});

describe('alertKindOf', () => {
  const alert = (categoryName: string) => ({
    missionAlertGuid: 'x',
    tileIndex: 1,
    availableUntil: '',
    categoryName,
  });

  it.each([
    ['MiniBossCategory', 'mini-boss'],
    ['MegaAlertCategory', 'mega-alert'],
    ['StormKingCategory', 'storm-king'],
    ['ElementalFireCategory', 'elemental-fire'],
    ['StormCategory', 'storm'],
    ['Whatever', 'other'],
  ] as const)('%s → %s', (category, expected) => {
    expect(alertKindOf(alert(category))).toBe(expected);
  });
});

describe('alertsFingerprint', () => {
  it('is stable for the same alerts and changes when they change', () => {
    const a = parseWorldInfo(raw, NOW);
    const b = parseWorldInfo(raw, new Date('2026-11-05T00:10:00Z'));
    expect(alertsFingerprint(a)).toBe(alertsFingerprint(b));
    const changed = { ...b, missions: b.missions.filter((m) => m.tileIndex !== 5) };
    expect(alertsFingerprint(changed)).not.toBe(alertsFingerprint(a));
  });
});
