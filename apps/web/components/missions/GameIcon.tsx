import type { LucideIcon } from 'lucide-react';
import manifest from '@/lib/icons-manifest.json';
import { cn } from '@/lib/utils';

export type IconGroup = 'missions' | 'alerts' | 'rewards' | 'ui' | 'quests';

const ICONS = manifest as Record<IconGroup, Record<string, string>>;

/** Path of the first game icon found among `names` in `group`, or null. */
export function gameIconSrc(group: IconGroup, ...names: string[]): string | null {
  for (const name of names) {
    const key = name.toLowerCase();
    // Own keys only: names like "constructor" would otherwise hit Object.prototype.
    if (Object.hasOwn(ICONS[group], key)) return ICONS[group][key]!;
  }
  return null;
}

/**
 * Game icon from public/icons/<group>/<name>.(png|webp|svg) when present,
 * otherwise the lucide fallback. Sized by `className` (e.g. "size-4").
 */
export function GameIcon({
  group,
  names,
  fallback: Fallback,
  className,
  label,
}: {
  group: IconGroup;
  names: string[];
  fallback: LucideIcon;
  className?: string;
  label?: string;
}) {
  const src = gameIconSrc(group, ...names);
  if (!src) {
    return label ? (
      <Fallback aria-label={label} className={className} />
    ) : (
      <Fallback aria-hidden className={className} />
    );
  }
  return (
    // Plain <img>: static export, icons are small local files; next/image adds nothing here.
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
