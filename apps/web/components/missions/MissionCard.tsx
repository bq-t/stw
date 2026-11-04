'use client';

import { ALERT_KINDS_WITH_BADGE, vbucksOf, type AlertKind, type Mission } from '@stw/shared';
import {
  CloudLightning,
  Coins,
  Crown,
  Droplets,
  Flame,
  Leaf,
  Skull,
  UsersRound,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useBiomeLabel, useMissionTypeLabel } from './labels';
import { RewardChip } from './RewardChip';

const ALERT_ICONS: Partial<Record<AlertKind, LucideIcon>> = {
  'mini-boss': Skull,
  'mega-alert': Zap,
  'storm-king': Crown,
  storm: CloudLightning,
  'elemental-fire': Flame,
  'elemental-nature': Leaf,
  'elemental-water': Droplets,
};

export function MissionCard({ mission }: { mission: Mission }) {
  const t = useTranslations();
  const missionType = useMissionTypeLabel();
  const biome = useBiomeLabel();
  const vbucks = vbucksOf(mission);
  const AlertIcon = ALERT_ICONS[mission.alertKind];
  // V-Bucks already have their own badge; the chip list shows the other alert rewards.
  const alertRewards = mission.alertRewards.filter((r) => !r.isVbucks);

  return (
    <article
      className={cn(
        'relative flex flex-col gap-3 rounded-md border bg-card p-3',
        vbucks > 0 ? 'border-vbucks shadow-[0_0_0_1px_var(--vbucks-glow)]' : 'border-border',
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold">{missionType(mission.missionType)}</h3>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {mission.biome && <span>{biome(mission.biome)}</span>}
            {mission.isGroup && <UsersRound aria-label={t('Mission.group')} className="size-3.5" />}
            {AlertIcon && ALERT_KINDS_WITH_BADGE.includes(mission.alertKind) && (
              <span className="inline-flex items-center gap-1">
                <AlertIcon aria-hidden className="size-3.5" />
                {t(`AlertKind.${mission.alertKind}`)}
              </span>
            )}
          </p>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              tabIndex={0}
              className="font-display text-2xl leading-none font-extrabold tabular-nums"
            >
              {mission.powerLevel > 0 ? mission.powerLevel : '?'}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            {mission.powerLevel > 0 ? t('Mission.powerLevel') : t('Mission.unknownPl')}
          </TooltipContent>
        </Tooltip>
      </header>

      {vbucks > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <p
              tabIndex={0}
              className="skew-tab inline-flex w-fit items-center gap-1.5 rounded-sm bg-vbucks px-2.5 py-1 text-sm font-bold text-primary-foreground"
            >
              <span className="inline-flex items-center gap-1.5">
                <Coins aria-hidden className="size-4" />
                {t('Mission.vbucksAmount', { count: vbucks })}
              </span>
            </p>
          </TooltipTrigger>
          <TooltipContent className="max-w-64">{t('Reward.foundersOnly')}</TooltipContent>
        </Tooltip>
      )}

      {alertRewards.length > 0 && (
        <ul aria-label={t('Mission.alertReward')} className="flex flex-wrap gap-1.5">
          {alertRewards.map((r, i) => (
            <li key={`a${i}`}>
              <RewardChip reward={r} />
            </li>
          ))}
        </ul>
      )}

      {mission.baseRewards.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {mission.baseRewards.map((r, i) => (
            <li key={`b${i}`}>
              <RewardChip reward={r} muted />
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
