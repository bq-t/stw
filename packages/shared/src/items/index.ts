import type { Rarity } from '../types';

// Item catalog: Epic item ID → names and icon. Filled from a FModel export (stage 4).
// Items missing from the catalog are shown with a readable form of their ID.

export interface ItemInfo {
  name: { en: string; ru: string };
  rarity?: Rarity;
  /** Path under apps/web/public/icons, e.g. "rewards/vbucks.png". */
  icon?: string;
  category?: string;
}

export const ITEMS: Record<string, ItemInfo> = {
  'AccountResource:currency_mtxswap': {
    name: { en: 'V-Bucks', ru: 'В-баксы' },
    category: 'currency',
  },
  'AccountResource:currency_xrayllama': {
    name: { en: 'X-Ray Tickets', ru: 'Рентгеновские билеты' },
    category: 'currency',
  },
  'AccountResource:heroxp': {
    name: { en: 'Hero XP', ru: 'Опыт героев' },
    category: 'xp',
  },
  'AccountResource:schematicxp': {
    name: { en: 'Schematic XP', ru: 'Опыт чертежей' },
    category: 'xp',
  },
  'AccountResource:personnelxp': {
    name: { en: 'Survivor XP', ru: 'Опыт выживших' },
    category: 'xp',
  },
  // TODO(stage 4): the rest comes from the FModel export.
};

export function itemInfo(itemId: string): ItemInfo | undefined {
  return ITEMS[itemId];
}

/** "Schematic:sid_assault_auto_vr_ore_t01" → "Assault Auto Vr Ore T01". */
export function readableItemId(itemId: string): string {
  const name = itemId.split(':').pop() ?? itemId;
  return name
    .replace(/^(sid|cid|wid|tid)_/i, '')
    .split('_')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
