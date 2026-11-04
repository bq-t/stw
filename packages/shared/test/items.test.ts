import { describe, expect, it } from 'vitest';
import { iconNames, maxRarity, rarityOf, readableItemId } from '../src/items';

describe('rarityOf', () => {
  it.each([
    ['Hero:hid_commando_011_sr_t01', 'legendary'],
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
  it('tries exact name, then without rarity/tier, then the category', () => {
    expect(iconNames('Hero:hid_commando_011_sr_t01', 'hero')).toEqual([
      'hid_commando_011_sr_t01',
      'hid_commando_011',
      'category-hero',
    ]);
    expect(iconNames('Defender:did_defenderpistol_basic_f_vr_t01', 'defender')[1]).toBe(
      'did_defenderpistol_basic_f',
    );
    expect(iconNames('Worker:managerdoctor_c_t01', 'survivor')[1]).toBe('managerdoctor');
    expect(iconNames('AccountResource:reagent_c_t02', 'evo')[0]).toBe('reagent_c_t02');
  });
});

describe('readableItemId', () => {
  it('drops prefixes, rarity and tier', () => {
    expect(readableItemId('Hero:hid_commando_011_sr_t01')).toBe('Commando 011');
  });
});
