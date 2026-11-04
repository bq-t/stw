'use client';

import { itemInfo, readableItemId } from '@stw/shared/items';
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

/** Item name from the catalog in the current language, otherwise a readable form of the ID. */
export function useItemName() {
  const locale = useLocale();
  return (itemId: string) => {
    const info = itemInfo(itemId);
    if (!info) return readableItemId(itemId);
    return locale === 'ru' ? info.name.ru : info.name.en;
  };
}
