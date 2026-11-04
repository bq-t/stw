import type { Rarity } from '../types';

// Item catalog: Epic item ID → names and icon. Resources seen in the 2026-11-04 response
// are listed here; the rest (heroes, survivors, schematics) comes from the FModel export.
// Items missing from the catalog are shown with a readable form of their ID.
// TODO: check RU names against the game's Russian localization.

export interface ItemInfo {
  name: { en: string; ru: string };
  rarity?: Rarity;
  /** Path under apps/web/public/icons, e.g. "rewards/vbucks.png". */
  icon?: string;
  category?: string;
}

const res = (en: string, ru: string, rarity?: Rarity): ItemInfo => ({
  name: { en, ru },
  rarity,
  category: 'resource',
});

export const ITEMS: Record<string, ItemInfo> = {
  'AccountResource:currency_mtxswap': res('V-Bucks', 'В-баксы'),
  'AccountResource:currency_xrayllama': res('X-Ray Tickets', 'Рентгеновские билеты'),
  'AccountResource:campaign_event_currency': res('Event Tickets', 'Билеты события'),
  'AccountResource:eventcurrency_scaling': res('Event Tickets', 'Билеты события'),
  'AccountResource:heroxp': res('Hero XP', 'Опыт героев'),
  'AccountResource:schematicxp': res('Schematic XP', 'Опыт чертежей'),
  'AccountResource:personnelxp': res('Survivor XP', 'Опыт выживших'),
  'AccountResource:peoplexp': res('Survivor XP', 'Опыт выживших'),
  'AccountResource:reagent_c_t01': res('Pure Drop of Rain', 'Чистая капля дождя', 'uncommon'),
  'AccountResource:reagent_c_t02': res('Lightning in a Bottle', 'Молния в бутылке', 'rare'),
  'AccountResource:reagent_c_t03': res('Eye of the Storm', 'Глаз бури', 'epic'),
  'AccountResource:reagent_c_t04': res('Storm Shard', 'Осколок бури', 'legendary'),
  'AccountResource:reagent_alteration_upgrade_uc': res(
    'Uncommon PERK-UP!',
    'Необычное улучшение перка',
    'uncommon',
  ),
  'AccountResource:reagent_alteration_upgrade_r': res(
    'Rare PERK-UP!',
    'Редкое улучшение перка',
    'rare',
  ),
  'AccountResource:reagent_alteration_upgrade_vr': res(
    'Epic PERK-UP!',
    'Эпическое улучшение перка',
    'epic',
  ),
  'AccountResource:reagent_alteration_upgrade_sr': res(
    'Legendary PERK-UP!',
    'Легендарное улучшение перка',
    'legendary',
  ),
  'AccountResource:reagent_alteration_generic': res('RE-PERK!', 'Смена перка', 'rare'),
  'AccountResource:reagent_alteration_ele_fire': res('Fire-UP!', 'Огненное улучшение', 'rare'),
  'AccountResource:reagent_alteration_ele_water': res('Frost-UP!', 'Ледяное улучшение', 'rare'),
  'AccountResource:reagent_alteration_ele_nature': res(
    'Amp-UP!',
    'Электрическое улучшение',
    'rare',
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
