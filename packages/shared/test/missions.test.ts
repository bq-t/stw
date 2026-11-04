import { describe, expect, it } from 'vitest';
import {
  DEFAULT_FILTERS,
  compareMissions,
  filtersFromParams,
  filtersToParams,
  isDefaultFilters,
  matchesFilters,
  rewardCategory,
} from '../src/missions';
import type { Mission } from '../src/types';

function mission(overrides: Partial<Mission>): Mission {
  return {
    id: 'm',
    zone: 'stonewood',
    missionType: 'fight-the-storm',
    missionGenerator: '',
    biome: '',
    powerLevel: 10,
    difficultyRow: '',
    tileIndex: 1,
    alertKind: 'none',
    alertRewards: [],
    baseRewards: [],
    isGroup: false,
    ...overrides,
  };
}

const vbucks = (quantity: number) => ({
  itemId: 'AccountResource:currency_mtxswap',
  quantity,
  isVbucks: true,
});

describe('URL filters', () => {
  it('round-trips through URLSearchParams', () => {
    const f = {
      zones: ['plankerton', 'twine-peaks'] as const,
      alert: 'vbucks' as const,
      rewards: ['evo'] as const,
      plMin: 40,
      plMax: 80,
    };
    const params = filtersToParams({ ...f, zones: [...f.zones], rewards: [...f.rewards] });
    expect(params.toString()).toBe(
      'zone=plankerton%2Ctwine-peaks&alert=vbucks&reward=evo&pl=40-80',
    );
    expect(filtersFromParams(params)).toEqual({
      ...f,
      zones: [...f.zones],
      rewards: [...f.rewards],
    });
  });

  it('ignores junk and clamps power level', () => {
    const f = filtersFromParams(new URLSearchParams('zone=mars,stonewood&alert=lol&pl=200-0'));
    expect(f).toEqual({ ...DEFAULT_FILTERS, zones: ['stonewood'], plMin: 1, plMax: 160 });
  });

  it('defaults produce an empty query', () => {
    expect(filtersToParams(DEFAULT_FILTERS).toString()).toBe('');
    expect(isDefaultFilters(DEFAULT_FILTERS)).toBe(true);
  });
});

describe('matchesFilters', () => {
  const ALL = { ...DEFAULT_FILTERS, alert: 'all' as const };
  const plain = mission({ powerLevel: 30 });
  const vb = mission({ powerLevel: 60, zone: 'canny-valley', alertRewards: [vbucks(50)] });
  const unknownPl = mission({ powerLevel: 0 });

  it('shows only mini-boss alerts by default', () => {
    const boss = mission({ alertKind: 'mini-boss', alertRewards: [vbucks(50)] });
    const mega = mission({ alertKind: 'mega-alert', alertRewards: [vbucks(50)] });
    expect(matchesFilters(boss, DEFAULT_FILTERS)).toBe(true);
    expect(matchesFilters(mega, DEFAULT_FILTERS)).toBe(false);
    expect(matchesFilters(plain, DEFAULT_FILTERS)).toBe(false);
    expect(matchesFilters(mega, { ...DEFAULT_FILTERS, alert: 'alerts' })).toBe(true);
  });

  it('filters by alert type', () => {
    const f = { ...DEFAULT_FILTERS, alert: 'vbucks' as const };
    expect(matchesFilters(vb, f)).toBe(true);
    expect(matchesFilters(plain, f)).toBe(false);
  });

  it('filters by zone and power level but never hides unknown power level', () => {
    const f = { ...ALL, zones: ['canny-valley' as const], plMin: 50, plMax: 70 };
    expect(matchesFilters(vb, f)).toBe(true);
    expect(matchesFilters(plain, { ...ALL, plMin: 50 })).toBe(false);
    expect(matchesFilters(unknownPl, { ...ALL, plMin: 50 })).toBe(true);
  });

  it('filters by reward category', () => {
    const evo = mission({
      baseRewards: [{ itemId: 'AccountResource:reagent_c_t02', quantity: 5, isVbucks: false }],
    });
    expect(matchesFilters(evo, { ...ALL, rewards: ['evo'] })).toBe(true);
    expect(matchesFilters(evo, { ...ALL, rewards: ['hero'] })).toBe(false);
  });
});

describe('compareMissions', () => {
  it('puts V-Bucks first, then alerts, then power level ascending', () => {
    const list = [
      mission({ id: 'low', powerLevel: 5 }),
      mission({
        id: 'alert',
        alertRewards: [{ itemId: 'Hero:x', quantity: 1, isVbucks: false }],
      }),
      mission({ id: 'vb50', alertRewards: [vbucks(50)] }),
      mission({ id: 'high', powerLevel: 99 }),
      mission({ id: 'vb80', alertRewards: [vbucks(80)] }),
    ];
    expect(list.sort(compareMissions).map((m) => m.id)).toEqual([
      'vb80',
      'vb50',
      'alert',
      'low',
      'high',
    ]);
  });
});

describe('rewardCategory', () => {
  it.each([
    ['AccountResource:currency_mtxswap', 'vbucks'],
    ['AccountResource:currency_xrayllama', 'xray'],
    ['AccountResource:reagent_alteration_upgrade_sr', 'perk'],
    ['AccountResource:reagent_c_t01', 'evo'],
    ['Schematic:sid_assault_auto_sr_ore_t01', 'schematic'],
    ['Hero:hid_commando_sony_sr_t01', 'hero'],
    ['Worker:workerbasic_sr_t01', 'survivor'],
    ['Defender:did_defenderpistol_basic_vr_t01', 'defender'],
    ['AccountResource:heroxp', 'xp'],
    ['AccountResource:campaign_event_currency', 'event'],
    ['AccountResource:reagent_alteration_ele_fire', 'perk'],
    ['Hero:hid_starter_custom', 'hero'],
    ['CardPack:zcp_voucher_basicpack_outpost_theater1', 'other'],
  ] as const)('%s → %s', (id, expected) => {
    expect(rewardCategory(id)).toBe(expected);
  });
});
