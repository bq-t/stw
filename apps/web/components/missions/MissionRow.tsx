'use client';

import { vbucksOf, type Mission, type Rarity } from '@stw/shared';
import { maxRarity } from '@stw/shared/items';
import { Coins, UsersRound } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { ALERT_ICONS, FallbackMissionIcon, MISSION_ICONS, PowerIcon, stormCategory } from './icons';
import { useBiomeLabel, useMissionTypeLabel } from './labels';
import { GameIcon, gameIconSrc } from './GameIcon';
import { RewardChip } from './RewardChip';

/** Shown on every alert and not useful for choosing a mission (freethevbucks hides it too). */
const HIDDEN_REWARDS = new Set(['AccountResource:campaign_event_currency']);

/** Rows with an epic or better alert reward are tinted in that rarity's colour. */
const RARITY_ROW: Partial<Record<Rarity, string>> = {
  epic: 'border-epic bg-epic/10',
  legendary: 'border-legendary bg-legendary/10',
  mythic: 'border-mythic bg-mythic/10',
};

/** Compact row: type icon · power · name/location, alert rewards underneath. Fits a 4-column layout. */
export function MissionRow({ mission }: { mission: Mission }) {
  const t = useTranslations();
  const missionType = useMissionTypeLabel();
  const biome = useBiomeLabel();
  const vbucks = vbucksOf(mission);
  const typeFallback = MISSION_ICONS[mission.missionType] ?? FallbackMissionIcon;
  const category = stormCategory(mission.missionType);
  const alertFallback = ALERT_ICONS[mission.alertKind];
  const rewards = mission.alertRewards.filter((r) => !r.isVbucks && !HIDDEN_REWARDS.has(r.itemId));
  const name = missionType(mission.missionType);
  const type = mission.missionType;
  const own = mission.isGroup ? [`${type}-group`, type] : [type];
  const iconNamesList = [
    ...own,
    ...(category
      ? mission.isGroup
        ? ['fight-the-storm-group', 'fight-the-storm']
        : ['fight-the-storm']
      : []),
  ];
  // Storm category badge only when there is no icon drawn for that category.
  const showCategory = category !== null && !gameIconSrc('missions', ...own);
  const rarity = maxRarity(rewards.map((r) => r.itemId));
  const rowTone =
    vbucks > 0
      ? 'border-vbucks bg-[var(--vbucks-glow)]'
      : ((rarity && RARITY_ROW[rarity]) ?? 'border-transparent');

  return (
    <li
      className={cn(
        'grid grid-cols-[2rem_3rem_minmax(0,1fr)] items-center gap-x-2 gap-y-1 border-l-2 px-2 py-1.5',
        rowTone,
      )}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            tabIndex={0}
            aria-label={name}
            className="relative flex size-8 items-center justify-center rounded-sm bg-surface-2"
          >
            <GameIcon
              group="missions"
              names={iconNamesList}
              fallback={typeFallback}
              className="size-6"
            />
            {showCategory && (
              <span className="absolute -right-1 -bottom-1 rounded-sm bg-background px-0.5 text-[10px] leading-none font-bold">
                {category}
              </span>
            )}
          </span>
        </TooltipTrigger>
        <TooltipContent>{name}</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <span
            tabIndex={0}
            className="flex items-center gap-0.5 font-display font-extrabold tabular-nums"
          >
            <GameIcon
              group="ui"
              names={['power']}
              fallback={PowerIcon}
              className="size-3.5 text-legendary"
            />
            {mission.powerLevel > 0 ? mission.powerLevel : '?'}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          {mission.powerLevel > 0 ? t('Mission.powerLevel') : t('Mission.unknownPl')}
        </TooltipContent>
      </Tooltip>

      <div className="min-w-0 leading-tight">
        <p className="flex items-center gap-1 truncate text-sm font-semibold">
          <span className="truncate">{name}</span>
          {mission.isGroup && (
            <UsersRound
              aria-label={t('Mission.group')}
              className="size-3.5 shrink-0 text-muted-foreground"
            />
          )}
        </p>
        <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
          {alertFallback && (
            <GameIcon
              group="alerts"
              names={[mission.alertKind]}
              fallback={alertFallback}
              label={t(`AlertKind.${mission.alertKind}`)}
              className="size-3.5 shrink-0"
            />
          )}
          <span className="truncate">
            {mission.biome ? biome(mission.biome) : t(`AlertKind.${mission.alertKind}`)}
          </span>
        </p>
      </div>

      <ul className="col-span-2 col-start-2 flex flex-wrap items-center gap-1">
        {vbucks > 0 && (
          <li>
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  tabIndex={0}
                  className="inline-flex items-center gap-1 rounded-sm bg-vbucks px-2 py-0.5 text-xs font-bold text-primary-foreground"
                >
                  <GameIcon group="ui" names={['vbucks']} fallback={Coins} className="size-4" />
                  {t('Mission.vbucksAmount', { count: vbucks })}
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-64">{t('Reward.foundersOnly')}</TooltipContent>
            </Tooltip>
          </li>
        )}
        {rewards.map((r, i) => (
          <li key={i}>
            <RewardChip reward={r} />
          </li>
        ))}
      </ul>
    </li>
  );
}
