'use client';

import { stwItemName } from '@stw/shared';
import { useLocale, useTranslations } from 'next-intl';

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
  return (itemId: string) => stwItemName(itemId)[locale === 'ru' ? 'ru' : 'en'];
}
