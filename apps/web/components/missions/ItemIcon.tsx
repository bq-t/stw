'use client';

import type { LucideIcon } from 'lucide-react';
import manifest from '@/lib/icons-manifest.json';
import { cn } from '@/lib/utils';
import { useLazyJson } from './lazyJson';

/**
 * Reward and shop item icons: our own files in public/icons/rewards, then the game's item icons
 * in public/icons/items (tools/game-export/item-icons.mts). The game index (item key → texture
 * file, ~180 KB) is fetched once per tab on first use, so it stays out of the page bundle.
 */

type Index = Record<string, string>;
const REWARDS = (manifest as Record<string, Record<string, string>>).rewards!;

/** First of `names` with a picture: own reward icon or game item icon, checked name by name. */
export function itemIconSrc(names: string[], idx: Index | null): string | null {
  for (const name of names) {
    const key = name.toLowerCase();
    if (Object.hasOwn(REWARDS, key)) return REWARDS[key]!;
    if (idx && Object.hasOwn(idx, key)) return `/icons/items/${idx[key]}.webp`;
  }
  return null;
}

export function ItemIcon({
  names,
  fallback: Fallback,
  className,
  label,
}: {
  names: string[];
  fallback: LucideIcon;
  className?: string;
  label?: string;
}) {
  const idx = useLazyJson<Index>('/icons/items/index.json');
  const src = itemIconSrc(names, idx);
  if (!src) {
    return label ? (
      <Fallback aria-label={label} className={className} />
    ) : (
      <Fallback aria-hidden className={className} />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={label ?? ''}
      aria-hidden={label ? undefined : true}
      className={cn('object-contain', className)}
      loading="lazy"
      decoding="async"
    />
  );
}
