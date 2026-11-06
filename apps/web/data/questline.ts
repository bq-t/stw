/**
 * Main questline (project plan: "4 зоны, каждый квест с наградами; отметка SSD с V-Bucks;
 * счётчик «квестов до следующих V-Bucks»"). Quests are in questline-quests.ts.
 *
 * Source: Fortnite wiki "Main Quests" and each quest's page, checked 2026-11-04.
 * Quest names stay in English in both languages until we have the game's Russian names;
 * objectives and rewards are translated.
 */
import type { Rarity, Zone } from '@stw/shared';
import type { L } from './daily-quests';

export type { L };
export type ZoneId = Zone;

export const QUESTLINE_CHECKED = '2026-11-04';

// Objectives ----------------------------------------------------------------------------------

export type Objective =
  /** "Complete 3 Fight the Storm, Ride the Lightning or Retrieve the Data missions in a 76+ zone". */
  | { t: 'missions'; n: number; types: string[]; pl?: number }
  /** Complete this Storm Shield Defense. */
  | { t: 'ssd' }
  | { t: 'text'; en: string; ru: string };

export const missions = (n: number, types: string[], pl?: number): Objective => ({
  t: 'missions',
  n,
  types,
  pl,
});
export const ssd = (): Objective => ({ t: 'ssd' });
export const text = (en: string, ru: string): Objective => ({ t: 'text', en, ru });

// Rewards -------------------------------------------------------------------------------------

export type ResourceId =
  | 'hero-xp'
  | 'schematic-xp'
  | 'survivor-xp'
  | 'gold'
  | 're-perk'
  | 'perk-up'
  | 'flux'
  | 'pure-drop-of-rain'
  | 'lightning-in-a-bottle'
  | 'eye-of-the-storm'
  | 'storm-shard'
  | 'active-powercell'
  | 'obsidian-ore'
  | 'shadowshard-crystal'
  | 'rotating-gizmo'
  | 'copper-ore'
  | 'training-manual'
  | 'trap-designs'
  | 'weapon-designs'
  | 'mini-llama'
  | 'research-points'
  | 'upgrade-point'
  | 'medium-bullets'
  | 'malachite-ore'
  | 'silver-ore'
  | 'rusty-parts'
  | 'upgrade-llama'
  | 'bacon';

export type ItemKind =
  | 'hero'
  | 'survivor'
  | 'lead-survivor'
  | 'defender'
  | 'ranged'
  | 'melee'
  | 'trap'
  | 'schematic'
  | 'pickaxe'
  | 'transform'
  | 'cosmetic'
  | 'banner';

export type HeroClass = 'constructor' | 'ninja' | 'outlander' | 'soldier';

export type QReward =
  | { t: 'vbucks'; n: number }
  | { t: 'res'; id: ResourceId; n: number; rarity?: Rarity }
  | {
      t: 'item';
      kind: ItemKind;
      /** Proper name (hero, schematic, lead survivor), shown as is in both languages. */
      name?: string;
      heroClass?: HeroClass;
      /** Weapon type of a generic ranged schematic. */
      weapon?: 'assault' | 'sniper' | 'pistol';
      rarity?: Rarity;
      n?: number;
    }
  /** Feature or slot the quest unlocks (squad slot, expedition, defender...). */
  | { t: 'unlock'; text: L }
  /** Pick one option; an option can hold several rewards. */
  | { t: 'choice'; of: QReward[][] };

export const vb = (n: number): QReward => ({ t: 'vbucks', n });
export const res = (id: ResourceId, n: number, rarity?: Rarity): QReward => ({
  t: 'res',
  id,
  n,
  rarity,
});
export const item = (
  kind: ItemKind,
  o: Omit<Extract<QReward, { t: 'item' }>, 't' | 'kind'> = {},
): QReward => ({ t: 'item', kind, ...o });
export const unlock = (en: string, ru: string): QReward => ({ t: 'unlock', text: { en, ru } });
export const choice = (...of: (QReward | QReward[])[]): QReward => ({
  t: 'choice',
  of: of.map((o) => (Array.isArray(o) ? o : [o])),
});

export interface ResourceInfo {
  name: L;
  /** Item ID in @stw/shared/items: its name and game icon are used when present. */
  catalog?: string;
  /** Icon name in public/icons/rewards/ when there is no catalog entry. */
  icon?: string;
  rarity?: Rarity;
}

/** PERK-UP! has a catalog item per rarity. */
export const PERK_UP_BY_RARITY: Partial<Record<Rarity, string>> = {
  uncommon: 'AccountResource:reagent_alteration_upgrade_uc',
  rare: 'AccountResource:reagent_alteration_upgrade_r',
  epic: 'AccountResource:reagent_alteration_upgrade_vr',
  legendary: 'AccountResource:reagent_alteration_upgrade_sr',
};

export const RESOURCES: Record<ResourceId, ResourceInfo> = {
  'hero-xp': { name: { en: 'Hero XP', ru: 'Опыт героев' }, catalog: 'AccountResource:heroxp' },
  'schematic-xp': {
    name: { en: 'Schematic XP', ru: 'Опыт чертежей' },
    catalog: 'AccountResource:schematicxp',
  },
  'survivor-xp': {
    name: { en: 'Survivor XP', ru: 'Опыт выживших' },
    catalog: 'AccountResource:personnelxp',
  },
  gold: { name: { en: 'Gold', ru: 'Золото' }, icon: 'gold', rarity: 'rare' },
  're-perk': {
    name: { en: 'RE-PERK!', ru: 'Смена перка' },
    catalog: 'AccountResource:reagent_alteration_generic',
  },
  'perk-up': {
    name: { en: 'PERK-UP!', ru: 'Улучшение перка' },
    catalog: 'AccountResource:reagent_alteration_upgrade_uc',
  },
  flux: { name: { en: 'Flux', ru: 'Флюс' }, icon: 'flux', rarity: 'rare' },
  'pure-drop-of-rain': {
    name: { en: 'Pure Drop of Rain', ru: 'Чистая капля дождя' },
    catalog: 'AccountResource:reagent_c_t01',
  },
  'lightning-in-a-bottle': {
    name: { en: 'Lightning in a Bottle', ru: 'Молния в бутылке' },
    catalog: 'AccountResource:reagent_c_t02',
  },
  'eye-of-the-storm': {
    name: { en: 'Eye of the Storm', ru: 'Глаз бури' },
    catalog: 'AccountResource:reagent_c_t03',
  },
  'storm-shard': {
    name: { en: 'Storm Shard', ru: 'Осколок бури' },
    catalog: 'AccountResource:reagent_c_t04',
  },
  'active-powercell': {
    name: { en: 'Active Powercell', ru: 'Активная энергоячейка' },
    icon: 'active-powercell',
    rarity: 'epic',
  },
  'obsidian-ore': {
    name: { en: 'Obsidian Ore', ru: 'Обсидиановая руда' },
    icon: 'obsidian-ore',
    rarity: 'epic',
  },
  'shadowshard-crystal': {
    name: { en: 'Shadowshard Crystal', ru: 'Кристалл теневого осколка' },
    icon: 'shadowshard-crystal',
    rarity: 'epic',
  },
  'rotating-gizmo': {
    name: { en: 'Rotating Gizmo', ru: 'Вращающийся механизм' },
    icon: 'rotating-gizmo',
    rarity: 'rare',
  },
  'copper-ore': { name: { en: 'Copper Ore', ru: 'Медная руда' }, icon: 'copper-ore' },
  'training-manual': {
    name: { en: 'Training Manual', ru: 'Учебник' },
    icon: 'training-manual',
  },
  'trap-designs': { name: { en: 'Trap Designs', ru: 'Схемы ловушек' }, icon: 'trap-designs' },
  'weapon-designs': {
    name: { en: 'Weapon Designs', ru: 'Схемы оружия' },
    icon: 'weapon-designs',
  },
  'mini-llama': {
    name: { en: 'Mini Reward Llama', ru: 'Мини-лама с наградами' },
    icon: 'mini-llama',
  },
  'research-points': {
    name: { en: 'Research Points', ru: 'Очки исследований' },
    icon: 'research-points',
  },
  'upgrade-point': {
    name: { en: 'Upgrade Point', ru: 'Очко улучшения' },
    icon: 'upgrade-point',
    rarity: 'epic',
  },
  'medium-bullets': {
    name: { en: 'Medium Bullets', ru: 'Средние патроны' },
    icon: 'medium-bullets',
  },
  'malachite-ore': {
    name: { en: 'Malachite Ore', ru: 'Малахитовая руда' },
    icon: 'malachite-ore',
    rarity: 'rare',
  },
  'silver-ore': { name: { en: 'Silver Ore', ru: 'Серебряная руда' }, icon: 'silver-ore' },
  'rusty-parts': {
    name: { en: 'Rusty Mechanical Parts', ru: 'Ржавые механические детали' },
    icon: 'rusty-parts',
  },
  'upgrade-llama': {
    name: { en: 'Upgrade Llama', ru: 'Лама улучшений' },
    icon: 'upgrade-llama',
    rarity: 'epic',
  },
  bacon: { name: { en: 'Bacon', ru: 'Бекон' }, icon: 'bacon', rarity: 'uncommon' },
};

/** Label of an item reward without its own name: "Epic ranged weapon schematic". */
export const ITEM_KINDS: Record<ItemKind, L> = {
  hero: { en: 'Hero', ru: 'Герой' },
  survivor: { en: 'Survivor', ru: 'Выживший' },
  'lead-survivor': { en: 'Lead Survivor', ru: 'Лидер выживших' },
  defender: { en: 'Defender', ru: 'Защитник' },
  ranged: { en: 'Ranged weapon schematic', ru: 'Чертёж огнестрельного оружия' },
  melee: { en: 'Melee weapon schematic', ru: 'Чертёж оружия ближнего боя' },
  trap: { en: 'Trap schematic', ru: 'Чертёж ловушки' },
  schematic: { en: 'Schematic', ru: 'Чертёж' },
  pickaxe: { en: 'Pickaxe', ru: 'Кирка' },
  transform: { en: 'Hero transform schematic', ru: 'Чертёж трансформации героя' },
  cosmetic: { en: 'Cosmetic', ru: 'Косметика' },
  banner: { en: 'Banner', ru: 'Баннер' },
};

export const HERO_CLASSES: Record<HeroClass, L> = {
  constructor: { en: 'Constructor', ru: 'Конструктор' },
  ninja: { en: 'Ninja', ru: 'Ниндзя' },
  outlander: { en: 'Outlander', ru: 'Исследователь' },
  soldier: { en: 'Soldier', ru: 'Солдат' },
};

export const WEAPONS: Record<'assault' | 'sniper' | 'pistol', L> = {
  assault: { en: 'Assault rifle schematic', ru: 'Чертёж штурмовой винтовки' },
  sniper: { en: 'Sniper rifle schematic', ru: 'Чертёж снайперской винтовки' },
  pistol: { en: 'Pistol schematic', ru: 'Чертёж пистолета' },
};

// Quests --------------------------------------------------------------------------------------

/** Timeline node icon: a mission type key (MissionType.*) or one of these. */
export type QuestIcon =
  | 'ssd'
  | 'story'
  | 'quest'
  | 'build'
  | 'exterminate'
  | 'locate'
  | 'explore'
  | 'medic'
  | (string & {});

export interface QuestlineQuest {
  /** URL anchor and progress marker key; unique within the zone. */
  id: string;
  /** English quest name (also used on /ru until we have the game's Russian names). */
  name: string;
  icon: QuestIcon;
  /** Recommended power level of the zone the quest asks for. */
  pl?: number;
  /** Storm Shield Defense number when the quest is one. */
  ssd?: number;
  objectives: Objective[];
  rewards: QReward[];
}

/** V-Bucks a quest pays (choices do not hold V-Bucks in the main questline). */
export function questVbucks(q: QuestlineQuest): number {
  return q.rewards.reduce((s, r) => s + (r.t === 'vbucks' ? r.n : 0), 0);
}
