'use client';

import { stwItemName } from '@stw/shared';
import type { GameNames } from '@stw/shared/items';
import { useLocale, useTranslations } from 'next-intl';
import { useLazyJson } from './lazyJson';

function titleCase(key: string): string {
  return key
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/** Mission type name: translation if we have one, otherwise the key in Title Case. */
export function useMissionTypeLabel() {
  const t = useTranslations('MissionType');
  return (key: string) => (t.has(key) ? t(key) : titleCase(key));
}

/** Biome name: translation if we have one, otherwise the key in Title Case. */
export function useBiomeLabel() {
  const t = useTranslations('Biome');
  return (key: string) => (t.has(key) ? t(key) : titleCase(key));
}

/**
 * Item name from the catalog in the current language; survivors, defenders and choice packs
 * get a generic name, the rest a readable form of the ID.
 */
export function useItemName() {
  const locale = useLocale();
  const names = useGameNames();
  return (itemId: string) => stwItemName(itemId, names)[locale === 'ru' ? 'ru' : 'en'];
}

/** EN/RU item names from the game (tools/game-export/item-names.mts), loaded on first use. */
export function useGameNames() {
  return useLazyJson<GameNames>('/icons/items/names.json');
}
