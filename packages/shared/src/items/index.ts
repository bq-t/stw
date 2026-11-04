import type { Rarity } from '../types';

// Item catalog: Epic item ID → names and icon. Resources seen in the 2026-11-04 response
// are listed here; the rest (heroes, survivors, schematics) comes from the FModel export.
// Items missing from the catalog are shown with a readable form of their ID.
// TODO: check RU names against the game's Russian localization.

export interface ItemInfo {
  name: { en: string; ru: string };
  /** Short description for the reward tooltip (our own wording, not the game text). */
  description?: { en: string; ru: string };
  rarity?: Rarity;
  category?: string;
}

const res = (
  en: string,
  ru: string,
  rarity: Rarity | undefined,
  descEn: string,
  descRu: string,
): ItemInfo => ({
  name: { en, ru },
  description: { en: descEn, ru: descRu },
  rarity,
  category: 'resource',
});

const evo = (en: string, ru: string, rarity: Rarity, stars: number) =>
  res(
    en,
    ru,
    rarity,
    `Evolution material: raises heroes, survivors, defenders and schematics to ${stars} stars.`,
    `Материал эволюции: повышает героев, выживших, защитников и чертежи до ${stars} звёзд.`,
  );

const perkUp = (en: string, ru: string, rarity: Rarity, enR: string, ruR: string) =>
  res(
    en,
    ru,
    rarity,
    `Upgrades perks on schematics up to ${enR} rarity.`,
    `Повышает перки чертежей до ${ruR} редкости.`,
  );

const element = (en: string, ru: string, enE: string, ruE: string) =>
  res(
    en,
    ru,
    'rare',
    `Changes an elemental perk on a schematic to ${enE} damage.`,
    `Меняет стихийный перк чертежа на урон ${ruE}.`,
  );

const XP = 'Experience';

export const ITEMS: Record<string, ItemInfo> = {
  'AccountResource:currency_mtxswap': res(
    'V-Bucks',
    'В-баксы',
    undefined,
    'Fortnite premium currency. Mission alerts give V-Bucks only to Founders; other players get X-Ray Tickets.',
    'Премиум-валюта Fortnite. За алерты В-баксы получают только фаундеры, остальные — рентгеновские билеты.',
  ),
  'AccountResource:currency_xrayllama': res(
    'X-Ray Tickets',
    'Рентгеновские билеты',
    undefined,
    'Buys X-Ray Llamas in the Loot tab. Non-Founders get them instead of V-Bucks.',
    'Покупка рентгеновских лам во вкладке «Добыча». Не-фаундеры получают их вместо В-баксов.',
  ),
  'AccountResource:campaign_event_currency': res(
    'Event Tickets',
    'Билеты события',
    undefined,
    'Currency of the current event; spent in the Event Store.',
    'Валюта текущего события, тратится в магазине события.',
  ),
  'AccountResource:eventcurrency_scaling': res(
    'Event Tickets',
    'Билеты события',
    undefined,
    'Buys Event Llamas in the Event Store.',
    'Покупка лам события в магазине события.',
  ),
  'AccountResource:heroxp': res(
    'Hero XP',
    'Опыт героев',
    undefined,
    `${XP} for leveling up heroes and defenders.`,
    'Опыт для прокачки героев и защитников.',
  ),
  'AccountResource:schematicxp': res(
    'Schematic XP',
    'Опыт чертежей',
    undefined,
    `${XP} for leveling up weapon and trap schematics.`,
    'Опыт для прокачки чертежей оружия и ловушек.',
  ),
  'AccountResource:personnelxp': res(
    'Survivor XP',
    'Опыт выживших',
    undefined,
    `${XP} for leveling up survivors.`,
    'Опыт для прокачки выживших.',
  ),
  'AccountResource:peoplexp': res(
    'Survivor XP',
    'Опыт выживших',
    undefined,
    `${XP} for leveling up survivors.`,
    'Опыт для прокачки выживших.',
  ),
  'AccountResource:reagent_c_t01': evo('Pure Drop of Rain', 'Чистая капля дождя', 'uncommon', 2),
  'AccountResource:reagent_c_t02': evo('Lightning in a Bottle', 'Молния в бутылке', 'rare', 3),
  'AccountResource:reagent_c_t03': evo('Eye of the Storm', 'Глаз бури', 'epic', 4),
  'AccountResource:reagent_c_t04': evo('Storm Shard', 'Осколок бури', 'legendary', 5),
  'AccountResource:reagent_alteration_upgrade_uc': perkUp(
    'Uncommon PERK-UP!',
    'Необычное улучшение перка',
    'uncommon',
    'uncommon',
    'необычной',
  ),
  'AccountResource:reagent_alteration_upgrade_r': perkUp(
    'Rare PERK-UP!',
    'Редкое улучшение перка',
    'rare',
    'rare',
    'редкой',
  ),
  'AccountResource:reagent_alteration_upgrade_vr': perkUp(
    'Epic PERK-UP!',
    'Эпическое улучшение перка',
    'epic',
    'epic',
    'эпической',
  ),
  'AccountResource:reagent_alteration_upgrade_sr': perkUp(
    'Legendary PERK-UP!',
    'Легендарное улучшение перка',
    'legendary',
    'legendary',
    'легендарной',
  ),
  'AccountResource:reagent_alteration_generic': res(
    'RE-PERK!',
    'Смена перка',
    'rare',
    'Rerolls a perk on a schematic.',
    'Меняет перк чертежа на случайный.',
  ),
  'AccountResource:reagent_alteration_ele_fire': element(
    'Fire-UP!',
    'Огненное улучшение',
    'fire',
    'огнём',
  ),
  'AccountResource:reagent_alteration_ele_water': element(
    'Frost-UP!',
    'Ледяное улучшение',
    'water',
    'водой',
  ),
  'AccountResource:reagent_alteration_ele_nature': element(
    'Amp-UP!',
    'Электрическое улучшение',
    'nature',
    'природой',
  ),
};

export function itemInfo(itemId: string): ItemInfo | undefined {
  return ITEMS[itemId];
}

const RARITY_BY_CODE: Record<string, Rarity> = {
  c: 'common',
  uc: 'uncommon',
  r: 'rare',
  vr: 'epic',
  sr: 'legendary',
  ur: 'mythic',
};

/** Rarity from the ID's rarity code: "Hero:hid_commando_011_sr_t01" → legendary. */
export function rarityOf(itemId: string): Rarity | undefined {
  const known = ITEMS[itemId]?.rarity;
  if (known) return known;
  const code = itemId
    .toLowerCase()
    .split(/[_:]/)
    .reverse()
    .find((part) => part in RARITY_BY_CODE);
  return code ? RARITY_BY_CODE[code] : undefined;
}

export const RARITY_ORDER: readonly Rarity[] = [
  'common',
  'uncommon',
  'rare',
  'epic',
  'legendary',
  'mythic',
];

/** Highest rarity among the given item IDs, or undefined if none has one. */
export function maxRarity(itemIds: string[]): Rarity | undefined {
  let best = -1;
  for (const id of itemIds) {
    const r = rarityOf(id);
    if (r) best = Math.max(best, RARITY_ORDER.indexOf(r));
  }
  return best >= 0 ? RARITY_ORDER[best] : undefined;
}

/** Icon lookup names for an item: exact name, name without rarity/tier, then category. */
export function iconNames(itemId: string, category: string): string[] {
  const name = (itemId.split(':').pop() ?? itemId).toLowerCase();
  const base = name.replace(/_(c|uc|r|vr|sr|ur)(_t\d\d)?$/, '').replace(/_t\d\d$/, '');
  return [name, base, `category-${category}`];
}

/** "Hero:hid_commando_011_sr_t01" → "Commando 011". */
export function readableItemId(itemId: string): string {
  const name = itemId.split(':').pop() ?? itemId;
  return name
    .replace(/^(sid|cid|wid|tid|hid|did)_/i, '')
    .replace(/_(c|uc|r|vr|sr|ur)(_t\d\d)?$/i, '')
    .replace(/_t\d\d$/i, '')
    .split('_')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
