import type { Rarity } from '../types';

// Item catalog: Epic item ID → names and icon. Resources seen in the 2026-11-04 response
// are listed here; the rest (heroes, survivors, schematics) comes from the FModel export.
// Items missing from the catalog are shown with a readable form of their ID.
// RU names checked against the game's Russian localization (43.10, tools/game-export).

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
    'Премиум-валюта Fortnite. За алерты В-баксы получают только фаундеры, остальные — рентген-билеты.',
  ),
  'AccountResource:currency_xrayllama': res(
    'X-Ray Tickets',
    'Рентген-билеты',
    undefined,
    'Buys X-Ray Llamas in the Loot tab. Non-Founders get them instead of V-Bucks.',
    'Покупка рентгеновских лам во вкладке «Добыча». Не-фаундеры получают их вместо В-баксов.',
  ),
  'AccountResource:campaign_event_currency': res(
    'Event Tickets',
    'Билеты события',
    'common',
    'Currency of the current event; spent in the Event Store.',
    'Валюта текущего события, тратится в магазине события.',
  ),
  'AccountResource:eventcurrency_scaling': res(
    'Gold',
    'Золото',
    'common',
    'Buys items in the weekly and event stores.',
    'Покупки в недельном и ивентовом магазинах.',
  ),
  'AccountResource:heroxp': res(
    'Hero XP',
    'Опыт для героев',
    undefined,
    `${XP} for leveling up heroes and defenders.`,
    'Опыт для прокачки героев и защитников.',
  ),
  'AccountResource:schematicxp': res(
    'Schematic XP',
    'Опыт для чертежей',
    undefined,
    `${XP} for leveling up weapon and trap schematics.`,
    'Опыт для прокачки чертежей оружия и ловушек.',
  ),
  'AccountResource:personnelxp': res(
    'Survivor XP',
    'Опыт для выживших',
    undefined,
    `${XP} for leveling up survivors.`,
    'Опыт для прокачки выживших.',
  ),
  'AccountResource:peoplexp': res(
    'Survivor XP',
    'Опыт для выживших',
    undefined,
    `${XP} for leveling up survivors.`,
    'Опыт для прокачки выживших.',
  ),
  // Epic in game (owner checked 2026-11-11), not the uncommon the material ladder suggests.
  'AccountResource:reagent_c_t01': evo('Pure Drop of Rain', 'Чистая дождевая капля', 'epic', 2),
  'AccountResource:reagent_c_t02': evo('Lightning in a Bottle', 'Молния в бутылке', 'rare', 3),
  'AccountResource:reagent_c_t03': evo('Eye of the Storm', 'Око Бури', 'epic', 4),
  'AccountResource:reagent_c_t04': evo('Storm Shard', 'Осколок Бури', 'legendary', 5),
  'AccountResource:reagent_alteration_upgrade_uc': perkUp(
    'Uncommon PERK-UP!',
    'Необычный улучшарий',
    'uncommon',
    'uncommon',
    'необычной',
  ),
  'AccountResource:reagent_alteration_upgrade_r': perkUp(
    'Rare PERK-UP!',
    'Редкий улучшарий',
    'rare',
    'rare',
    'редкой',
  ),
  'AccountResource:reagent_alteration_upgrade_vr': perkUp(
    'Epic PERK-UP!',
    'Эпический улучшарий',
    'epic',
    'epic',
    'эпической',
  ),
  'AccountResource:reagent_alteration_upgrade_sr': perkUp(
    'Legendary PERK-UP!',
    'Легендарный улучшарий',
    'legendary',
    'legendary',
    'легендарной',
  ),
  'AccountResource:reagent_alteration_generic': res(
    'RE-PERK!',
    'Заменярий',
    'rare',
    'Rerolls a perk on a schematic.',
    'Меняет перк чертежа на случайный.',
  ),
  'AccountResource:reagent_alteration_ele_fire': element('FIRE-UP!', 'Огневик', 'fire', 'огнём'),
  'AccountResource:reagent_alteration_ele_water': element('FROST-UP!', 'Ледовик', 'water', 'водой'),
  'AccountResource:reagent_alteration_ele_nature': element(
    'AMP-UP!',
    'Молневик',
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

/**
 * Mythic items carry the legendary code "sr" too. Heroes say "myth" in the ID
 * ("Hero:hid_outlander_myth02_sr_t01" is Ragnarok); mythic lead survivors have a name after the
 * code ("Worker:managerdoctor_sr_kingsly_t01"), plain legendary leads do not
 * ("Worker:managerdoctor_sr_t01").
 */
const MYTHIC = [/^hero:hid_[a-z]+_myth/, /^worker:manager[a-z]+_sr_[a-z]+_t\d\d$/];

/** Rarity from the ID's rarity code: "Hero:hid_commando_011_sr_t01" → legendary. */
export function rarityOf(itemId: string): Rarity | undefined {
  const known = ITEMS[itemId]?.rarity;
  if (known) return known;
  const id = itemId.toLowerCase();
  if (MYTHIC.some((re) => re.test(id))) return 'mythic';
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

/** "sid_assault_auto_halloween_sr_ore_t01" → "sid_assault_auto_halloween_sr" (tools/game-export/item-icons.mts). */
export const midBase = (name: string) =>
  name
    .toLowerCase()
    .replace(/_t\d\d$/, '')
    .replace(/_(ore|crystal)$/, '');
/** "sid_assault_auto_halloween_sr_ore_t01" → "sid_assault_auto_halloween". */
export const deepBase = (name: string) => midBase(name).replace(/_(c|uc|r|vr|sr|ur|er)$/, '');

/**
 * Icon lookup names for an item: exact name, name without rarity/tier, then a shared icon for
 * its kind (a hero's class "hero-ninja", a schematic's weapon "schematic-axe"), then category,
 * then "misc": the "?" for anything that has no icon (yet).
 */
export function iconNames(itemId: string, category: string): string[] {
  const name = (itemId.split(':').pop() ?? itemId).toLowerCase();
  const base = name.replace(/_(c|uc|r|vr|sr|ur)(_t\d\d)?$/, '').replace(/_t\d\d$/, '');
  // Game item icons (public/icons/items/index.json) are keyed without tier and material,
  // with rarity (hero portraits differ by rarity) and without it.
  const mid = midBase(name);
  const deep = deepBase(name);
  const info = stwItemInfo(itemId);
  const shared = [
    ...(info.heroClass ? [`hero-${info.heroClass}`] : []),
    ...(info.kind === 'schematic' && info.weapon ? [`schematic-${info.weapon}`] : []),
  ];
  return [...new Set([name, mid, base, deep]), ...shared, `category-${category}`, 'misc'];
}

export type StwItemKind =
  | 'hero'
  | 'schematic'
  | 'survivor'
  | 'lead'
  | 'defender'
  | 'schematicPack'
  | 'cardPack'
  | 'loadout'
  | 'armorySlot'
  | 'resource'
  | 'other';
export type StwHeroClass = 'soldier' | 'constructor' | 'ninja' | 'outlander';
export type StwWeapon =
  | 'assault'
  | 'pistol'
  | 'shotgun'
  | 'sniper'
  | 'explosive'
  | 'sword'
  | 'axe'
  | 'scythe'
  | 'hammer'
  | 'club'
  | 'spear'
  | 'melee'
  | 'trap';

/** What an STW item is, read from its ID: kind, hero class, weapon, schematic material. */
export interface StwItemInfo {
  kind: StwItemKind;
  heroClass?: StwHeroClass;
  /** Schematic category or the defender's weapon. */
  weapon?: StwWeapon;
  material?: 'ore' | 'crystal';
}

// A Map: "constructor" as a plain object key would clash with Object.prototype.
const HERO_CLASS = new Map<string, StwHeroClass>([
  ['commando', 'soldier'],
  ['constructor', 'constructor'],
  ['ninja', 'ninja'],
  ['outlander', 'outlander'],
]);
const SCHEMATIC_WEAPON: [RegExp, StwWeapon][] = [
  [/^sid_(ceiling|floor|wall)_/, 'trap'],
  [/^sid_assault_/, 'assault'],
  [/^sid_pistol_/, 'pistol'],
  [/^sid_shotgun_/, 'shotgun'],
  [/^sid_sniper_/, 'sniper'],
  [/^sid_(explosive|launcher)_/, 'explosive'],
  [/^sid_edged_axe/, 'axe'],
  [/^sid_edged_scythe/, 'scythe'],
  [/^sid_edged_/, 'sword'],
  [/^sid_blunt_hammer/, 'hammer'],
  [/^sid_blunt_/, 'club'],
  [/^sid_piercing_/, 'spear'],
];
const DEFENDER_WEAPONS = new Set<StwWeapon>(['pistol', 'assault', 'shotgun', 'sniper', 'melee']);

/**
 * "Hero:hid_ninja_018_sr_t01" → hero, ninja; "Schematic:sid_edged_axe_..._sr_ore_t01" →
 * schematic, axe, ore; "Defender:did_defenderpistol_..." → defender, pistol. The catalog has
 * no item types of its own, so this is all there is to say what an offer is.
 */
export function stwItemInfo(templateId: string): StwItemInfo {
  const [type = '', id = ''] = templateId.toLowerCase().split(':');
  switch (type) {
    case 'hero': {
      const c = HERO_CLASS.get(/^hid_([a-z]+)/.exec(id)?.[1] ?? '');
      return c ? { kind: 'hero', heroClass: c } : { kind: 'hero' };
    }
    case 'schematic': {
      const weapon = SCHEMATIC_WEAPON.find(([re]) => re.test(id))?.[1];
      const material = /_(ore|crystal)(_t\d\d)?$/.exec(id)?.[1] as 'ore' | 'crystal' | undefined;
      return {
        kind: 'schematic',
        ...(weapon ? { weapon } : {}),
        ...(material ? { material } : {}),
      };
    }
    case 'worker':
      return { kind: id.startsWith('manager') ? 'lead' : 'survivor' };
    case 'defender': {
      const w = /^did_defender([a-z]+)/.exec(id)?.[1] as StwWeapon | undefined;
      return w && DEFENDER_WEAPONS.has(w) ? { kind: 'defender', weapon: w } : { kind: 'defender' };
    }
    case 'cardpack':
      return { kind: id.startsWith('cardpack_schematic') ? 'schematicPack' : 'cardPack' };
    case 'campaignheroloadout':
      return { kind: 'loadout' };
    case 'token':
      return { kind: id === 'accountinventorybonus' ? 'armorySlot' : 'other' };
    case 'accountresource':
      return { kind: 'resource' };
    default:
      return { kind: 'other' };
  }
}

/** "Hero:hid_commando_011_sr_t01" → "Commando 011". */
/** EN/RU names from the game (GAME_NAMES in ./game-names, or its JSON copy on the site). */
export type GameNames = Record<string, readonly [en: string, ru: string]>;

/** Game name of an item: key without tier and material, then without rarity (item-names.mts). */
export function gameItemName(
  itemId: string,
  names: GameNames | null | undefined,
): { en: string; ru: string } | undefined {
  if (!names) return undefined;
  const n = (itemId.split(':').pop() ?? itemId).toLowerCase().replace(/^(wid|tid)_/, 'sid_');
  const hit = names[midBase(n)] ?? names[deepBase(n)];
  return hit ? { en: hit[0], ru: hit[1] } : undefined;
}

/** Item name in a language: our catalog, then the game's name, then a readable form of the ID. */
export function itemName(itemId: string, locale: 'en' | 'ru', names?: GameNames | null): string {
  return (
    itemInfo(itemId)?.name[locale] ??
    gameItemName(itemId, names)?.[locale] ??
    readableItemId(itemId)
  );
}

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
