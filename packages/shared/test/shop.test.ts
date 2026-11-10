import { describe, expect, it } from 'vitest';
import {
  fingerprintOf,
  parseBrShop,
  parsePrerolls,
  parseStwCatalog,
  stwItemName,
  uniqueLlamas,
} from '../src/shop';

// Shapes copied from the real 2026-11-10 responses (fixtures/, not committed), trimmed.

const brRaw = {
  status: 200,
  data: {
    hash: 'abc',
    date: '2026-11-10T00:00:00Z',
    entries: [
      {
        regularPrice: 500,
        finalPrice: 500,
        offerId: 'v2:/track',
        inDate: '2026-11-01T00:00:00Z',
        outDate: '2026-11-30T23:59:59.999Z',
        sortPriority: -27,
        layout: { name: 'Jam Tracks', index: 26 },
        colors: { color1: '3a306cff' },
        tracks: [{ title: 'Therefore I Am', albumArt: 'https://cdn/track.jpg' }],
      },
      {
        regularPrice: 1000,
        finalPrice: 800,
        offerId: 'v2:/katana',
        inDate: '2026-11-09T00:00:00Z',
        outDate: '2026-11-12T23:59:59.999Z',
        sortPriority: -1,
        colors: { color1: 'c01b1cff', color2: 'ff4c56ff' },
        newDisplayAsset: { renderImages: [{ image: 'https://cdn/katana-render.png' }] },
        brItems: [
          {
            name: "Vader's Katana",
            type: { displayValue: 'Pickaxe' },
            rarity: { value: 'starwars' },
            images: { featured: 'https://cdn/katana.png' },
          },
          { name: "Vader's Katana", type: { displayValue: 'Back Bling' } },
        ],
      },
      {
        regularPrice: 2000,
        finalPrice: 1800,
        offerId: 'v2:/ben',
        layout: { name: 'Ben 10 ', index: 3 },
        sortPriority: 5,
        bundle: { name: 'Ben Tennyson', info: 'Bundle', image: 'https://cdn/ben.png' },
        brItems: [{ name: 'Ben', type: { displayValue: 'Outfit' }, rarity: { value: 'epic' } }],
      },
      { offerId: 'v2:/broken', layout: { name: 'Ben 10' } },
    ],
  },
};

describe('parseBrShop', () => {
  const shop = parseBrShop(brRaw);

  it('keeps the shop day and orders sections by layout index', () => {
    expect(shop.date).toBe('2026-11-10');
    expect(shop.sections.map((s) => s.name)).toEqual(['Ben 10', 'Jam Tracks', 'Other']);
  });

  it('reduces entries to name, type, image and price', () => {
    const [ben] = shop.sections[0]!.items;
    expect(ben).toMatchObject({
      name: 'Ben Tennyson',
      kind: 'bundle',
      type: 'Bundle',
      price: 1800,
      image: 'https://cdn/ben.png',
    });
    const [track] = shop.sections[1]!.items;
    expect(track).toMatchObject({ kind: 'track', image: 'https://cdn/track.jpg', count: 1 });
    const [katana] = shop.sections[2]!.items;
    expect(katana).toMatchObject({
      type: 'Pickaxe',
      rarity: 'starwars',
      image: 'https://cdn/katana-render.png',
      regularPrice: 1000,
      count: 2,
      colors: ['c01b1cff', 'ff4c56ff'],
    });
  });

  it('skips entries without a name or price and fails without entries', () => {
    expect(shop.sections[0]!.items).toHaveLength(1);
    expect(() => parseBrShop({ data: {} })).toThrow();
  });
});

const catalogRaw = {
  storefronts: [
    { name: 'BRWeeklyStorefront', catalogEntries: [{ offerId: 'br' }] },
    {
      name: 'CardPackStorePreroll',
      catalogEntries: [
        {
          offerId: 'UPG50',
          devName: 'Always.UpgradePack.01',
          title: 'Upgrade Llama',
          prices: [{ currencySubType: 'AccountResource:currency_xrayllama', finalPrice: 50 }],
          itemGrants: [{ templateId: 'CardPack:cardpack_bronze', quantity: 1 }],
          dailyLimit: 50,
          weeklyLimit: -1,
        },
        {
          offerId: 'UPGFREE',
          devName: 'Always.UpgradePack.03',
          title: 'Upgrade Llama',
          prices: [{ currencySubType: 'AccountResource:currency_xrayllama', finalPrice: 0 }],
          itemGrants: [{ templateId: 'CardPack:cardpack_bronze', quantity: 1 }],
        },
        {
          offerId: 'MELEE',
          devName:
            '[VIRTUAL]1 x Super Melee Llama for 1000 GameItem : AccountResource:currency_xrayllama',
          prices: [{ currencySubType: 'AccountResource:currency_xrayllama', finalPrice: 1000 }],
          itemGrants: [{ templateId: 'CardPack:cardpack_rare_melee', quantity: 1 }],
          meta: { EventLimit: '3' },
        },
      ],
    },
    {
      name: 'STWRotationalEventStorefront',
      catalogEntries: [
        {
          offerId: 'RAIN',
          devName:
            '[VIRTUAL]10 x Pure Drop of Rain for 50 GameItem : AccountResource:eventcurrency_scaling',
          prices: [{ currencySubType: 'AccountResource:eventcurrency_scaling', finalPrice: 50 }],
          itemGrants: [{ templateId: 'AccountResource:reagent_c_t01', quantity: 10 }],
          weeklyLimit: 10,
          dailyLimit: -1,
        },
        {
          offerId: 'WORKER',
          devName:
            '[VIRTUAL]1 x workerbasic_vr_t01 for 250 GameItem : AccountResource:eventcurrency_scaling',
          prices: [{ currencySubType: 'AccountResource:eventcurrency_scaling', finalPrice: 250 }],
          itemGrants: [{ templateId: 'Worker:workerbasic_vr_t01', quantity: 1 }],
        },
      ],
    },
    {
      name: 'STWSpecialEventStorefront',
      catalogEntries: [
        {
          offerId: 'RANGER',
          devName:
            '[VIRTUAL]1 x Copper Ranger    for 1680 GameItem : AccountResource:eventcurrency_scaling',
          prices: [{ currencySubType: 'AccountResource:eventcurrency_scaling', finalPrice: 1680 }],
          itemGrants: [{ templateId: 'Schematic:sid_assault_doubleshot_sr_ore_t01', quantity: 1 }],
          meta: { EventLimit: '1' },
        },
      ],
    },
  ],
};

describe('parseStwCatalog', () => {
  const shop = parseStwCatalog(catalogRaw, '2026-11-10');

  it('reads the weekly and event gold shops', () => {
    expect(shop.weekly[0]).toMatchObject({
      name: 'Pure Drop of Rain',
      quantity: 10,
      price: 50,
      currency: 'gold',
      weeklyLimit: 10,
    });
    expect(shop.weekly[0]!.dailyLimit).toBeUndefined();
    expect(shop.event[0]).toMatchObject({
      name: 'Copper Ranger',
      rarity: 'legendary',
      eventLimit: 1,
    });
  });

  it('turns an item ID used as a name into a readable one', () => {
    expect(shop.weekly[1]!.name).toBe('Survivor');
    expect(shop.weekly[1]!.rarity).toBe('epic');
  });

  it('keeps one Upgrade Llama for display, priced in X-ray tickets', () => {
    expect(shop.llamas).toHaveLength(3);
    expect(uniqueLlamas(shop.llamas).map((l) => l.offerId)).toEqual(['UPG50', 'MELEE']);
  });
});

describe('parsePrerolls', () => {
  const shop = parseStwCatalog(catalogRaw, '2026-11-10');
  const preroll = (offerId: string, items: unknown[], expiration = '2026-11-11T00:00:00.000Z') => ({
    templateId: 'PrerollData:preroll_basic',
    attributes: { offerId, expiration, items, note: 'a } brace in a "string"' },
    quantity: 1,
  });
  const profile = JSON.stringify({
    profileChanges: [
      {
        profile: {
          items: {
            a: { templateId: 'Hero:hid_x_sr_t01', attributes: {}, quantity: 1 },
            b: preroll('UPG50', [{ itemType: 'Worker:workerbasic_uc_t01', quantity: 1 }]),
            c: preroll('UPGFREE', [{ itemType: 'Worker:workerbasic_r_t01', quantity: 1 }]),
            d: preroll('MELEE', [
              {
                itemType: 'CardPack:cardpack_choice_melee_sr',
                attributes: {
                  options: [
                    { itemType: 'Schematic:sid_edged_sword_medium_vt_sr_ore_t01', quantity: 1 },
                  ],
                },
                quantity: 1,
              },
              { itemType: 'AccountResource:eventcurrency_candy', quantity: 50 },
            ]),
            e: preroll('HIDDEN', [{ itemType: 'Worker:workerbasic_c_t01', quantity: 1 }]),
            f: preroll('MELEE', [], '2026-11-09T00:00:00.000Z'),
          },
        },
      },
    ],
  });
  const now = Date.parse('2026-11-10T12:00:00Z');

  it('cuts the PrerollData items out of the profile text and names them from the catalog', () => {
    const llamas = parsePrerolls(profile, shop, now);
    expect(llamas.map((l) => [l.offerId, l.name, l.price])).toEqual([
      ['UPG50', 'Upgrade Llama', 50],
      ['MELEE', 'Super Melee Llama', 1000],
    ]);
    const melee = llamas[1]!;
    expect(melee.items[0]!.options?.[0]).toMatchObject({ rarity: 'legendary' });
    expect(melee.items[1]).toMatchObject({
      templateId: 'AccountResource:eventcurrency_candy',
      quantity: 50,
    });
  });

  it('without a catalog keeps every live roll', () => {
    expect(parsePrerolls(profile, undefined, now)).toHaveLength(4);
  });
});

describe('stwItemName', () => {
  it('names survivors, defenders and choice packs', () => {
    expect(stwItemName('Worker:workerbasic_vr_t01').ru).toBe('Выживший');
    expect(stwItemName('Worker:managerdoctor_sr_t01').en).toBe('Lead Survivor');
    expect(stwItemName('Defender:did_defenderpistol_basic_f_sr_t01').en).toBe('Pistol Defender');
    expect(stwItemName('CardPack:cardpack_choice_melee_sr').en).toBe('Choice of one');
    expect(stwItemName('Schematic:sid_edged_sword_light_r_ore_t01').en).toBe('Edged Sword Light');
  });
});

describe('fingerprintOf', () => {
  it('is stable and changes with the data', () => {
    expect(fingerprintOf({ a: 1 })).toBe(fingerprintOf({ a: 1 }));
    expect(fingerprintOf({ a: 1 })).not.toBe(fingerprintOf({ a: 2 }));
  });
});
