'use client';

import { useLocale, useTranslations } from 'next-intl';
import type { Objective } from '@/data/questline';
import { GameIcon, gameIconSrc } from '@/components/missions/GameIcon';
import { FallbackMissionIcon, MISSION_ICONS } from '@/components/missions/icons';
import { useMissionTypeLabel } from '@/components/missions/labels';
import { cn } from '@/lib/utils';
import { NODE_ICONS } from './icons';

/** Node icons that have a game picture under another name in public/icons/missions/. */
const GAME_ICON_ALIASES: Record<string, string> = { ssd: 'storm-shield-defense' };

/** Timeline node icon: game picture if there is one, else own icon (ssd, story...) or a mission type icon. */
export function NodeIcon({ icon, className }: { icon: string; className?: string }) {
  const Own = NODE_ICONS[icon];
  const alias = GAME_ICON_ALIASES[icon];
  if (Own && alias && gameIconSrc('missions', alias)) {
    return <GameIcon group="missions" names={[alias]} fallback={Own} className={className} />;
  }
  if (Own) return <Own aria-hidden className={className} />;
  return (
    <GameIcon
      group="missions"
      names={[icon]}
      fallback={MISSION_ICONS[icon] ?? FallbackMissionIcon}
      className={cn('fill-current', className)}
    />
  );
}

/** One objective line; mission objectives list their mission types as icon chips. */
export function ObjectiveLine({ o, ssd }: { o: Objective; ssd?: number }) {
  const locale = useLocale() as 'en' | 'ru';
  const t = useTranslations('Questline');
  const missionType = useMissionTypeLabel();
  if (o.t === 'text') return <>{o[locale]}</>;
  if (o.t === 'ssd') return <>{t('ssdObjective', { n: ssd ?? '' })}</>;
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      <span>
        {t('missionsObjective', {
          count: o.n,
          pl: o.pl ?? 'none',
          many: o.types.length > 1 ? 'yes' : 'no',
        })}
      </span>
      {o.types.map((m) => (
        <span
          key={m}
          className="skew-tab inline-flex items-center gap-1 bg-surface-2 px-2 py-0.5 text-xs text-foreground"
        >
          <NodeIcon icon={m} className="size-3.5" />
          <span>{missionType(m)}</span>
        </span>
      ))}
    </span>
  );
}
