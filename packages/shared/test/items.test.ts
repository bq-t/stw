import { describe, expect, it } from 'vitest';
import { iconNames, maxRarity, rarityOf, readableItemId } from '../src/items';

describe('rarityOf', () => {
  it.each([
    ['Hero:hid_commando_011_sr_t01', 'legendary'],
    ['Hero:hid_outlander_myth02_sr_t01', 'mythic'],
    ['Worker:managerdoctor_sr_kingsly_t01', 'mythic'],
    ['Worker:managerdoctor_sr_t01', 'legendary'],
    ['Worker:workerbasic_vr_t01', 'epic'],
    ['Defender:did_defenderpistol_basic_f_vr_t01', 'epic'],
    ['Worker:managerdoctor_c_t01', 'common'],
    ['AccountResource:reagent_alteration_upgrade_uc', 'uncommon'],
    ['AccountResource:reagent_c_t04', 'legendary'],
    ['AccountResource:heroxp', undefined],
  ])('%s → %s', (id, expected) => {
    expect(rarityOf(id)).toBe(expected);
  });
});

describe('maxRarity', () => {
  it('picks the highest rarity of the rewards', () => {
    expect(
      maxRarity([
        'Worker:workerbasic_uc_t01',
        'Hero:hid_commando_011_sr_t01',
        'AccountResource:heroxp',
      ]),
    ).toBe('legendary');
    expect(maxRarity(['AccountResource:heroxp'])).toBeUndefined();
  });
});

describe('iconNames', () => {
  it('tries exact name, without tier (game item icons), without rarity/tier, class or weapon, category, then misc', () => {
    expect(iconNames('Hero:hid_commando_011_sr_t01', 'hero')).toEqual([
      'hid_commando_011_sr_t01',
      'hid_commando_011_sr',
      'hid_commando_011',
      'hero-soldier',
      'category-hero',
      'misc',
    ]);
    expect(iconNames('Schematic:sid_edged_axe_blackmetal_sr_ore_t01', 'schematic')).toEqual([
      'sid_edged_axe_blackmetal_sr_ore_t01',
      'sid_edged_axe_blackmetal_sr',
      'sid_edged_axe_blackmetal_sr_ore',
      'sid_edged_axe_blackmetal',
      'schematic-axe',
      'category-schematic',
      'misc',
    ]);
    expect(iconNames('Defender:did_defenderpistol_basic_f_vr_t01', 'defender').slice(1, 3)).toEqual(
      ['did_defenderpistol_basic_f_vr', 'did_defenderpistol_basic_f'],
    );
    expect(iconNames('Worker:managerdoctor_c_t01', 'survivor').slice(1, 3)).toEqual([
      'managerdoctor_c',
      'managerdoctor',
    ]);
    expect(iconNames('AccountResource:reagent_c_t02', 'evo')[0]).toBe('reagent_c_t02');
  });
});

describe('readableItemId', () => {
  it('drops prefixes, rarity and tier', () => {
    expect(readableItemId('Hero:hid_commando_011_sr_t01')).toBe('Commando 011');
  });
});
