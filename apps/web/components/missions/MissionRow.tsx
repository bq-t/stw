'use client';

import { vbucksOf, type Mission, type Rarity } from '@stw/shared';
import { maxRarity } from '@stw/shared/items';
import { useTranslations } from 'next-intl';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { GameIcon, gameIconSrc } from './GameIcon';
import { ALERT_ICONS, FallbackMissionIcon, MISSION_ICONS, PowerIcon, stormCategory } from './icons';
import { useBiomeLabel, useMissionTypeLabel } from './labels';
import { RewardChip } from './RewardChip';
import { VbucksIcon } from './VbucksIcon';

/** Shown on every alert and not useful for choosing a mission (freethevbucks hides it too). */
const HIDDEN_REWARDS = new Set(['AccountResource:campaign_event_currency']);

/** Row tint by the best alert reward rarity, as in the game. */
const RARITY_ROW: Record<Rarity, string> = {
  common: 'border-common bg-common/8',
  uncommon: 'border-uncommon bg-uncommon/8',
  rare: 'border-rare bg-rare/8',
  epic: 'border-epic bg-epic/10',
  legendary: 'border-legendary bg-legendary/10',
  mythic: 'border-mythic bg-mythic/12',
};

/**
 * Compact row: mission icon with power level underneath · name and location ·
 * alert rewards. Fits a 4-column layout.
 */
export function MissionRow({ mission }: { mission: Mission }) {
  const t = useTranslations();
  const missionType = useMissionTypeLabel();
  const biome = useBiomeLabel();
  const vbucks = vbucksOf(mission);
  const type = mission.missionType;
  const name = missionType(type);
  const category = stormCategory(type);
  const alertFallback = ALERT_ICONS[mission.alertKind];
  const rewards = mission.alertRewards.filter((r) => !r.isVbucks && !HIDDEN_REWARDS.has(r.itemId));

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
      : rarity
        ? RARITY_ROW[rarity]
        : 'border-transparent';
  const pl = mission.powerLevel > 0 ? mission.powerLevel : '?';
  const place = mission.biome ? biome(mission.biome) : null;
  const alert = mission.alertKind !== 'none' ? t(`AlertKind.${mission.alertKind}`) : null;

  return (
    <li
      className={cn(
        'grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-2 border-l-2 px-2 py-1.5',
        rowTone,
      )}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            tabIndex={0}
            aria-label={name}
            className="row-span-2 flex flex-col items-center gap-0.5"
          >
            <span className="relative flex size-8 items-center justify-center rounded-sm bg-surface-2">
              <GameIcon
                group="missions"
                names={iconNamesList}
                fallback={MISSION_ICONS[type] ?? FallbackMissionIcon}
                className="size-6"
              />
              {showCategory && (
                <span className="absolute -right-1 -bottom-1 rounded-sm bg-background px-0.5 text-[10px] leading-none font-bold">
                  {category}
                </span>
              )}
            </span>
            <span className="flex items-center font-display text-xs font-extrabold tabular-nums">
              <GameIcon
                group="ui"
                names={['power']}
                fallback={PowerIcon}
                className="size-3 text-legendary"
              />
              {pl}
            </span>
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-64">
          <p className="font-semibold">{name}</p>
          <ul className="mt-0.5 text-xs leading-snug">
            <li>
              {t('Mission.powerLevel')}: {pl}
            </li>
            <li>{mission.isGroup ? t('Mission.group') : t('Mission.solo')}</li>
            {alert && (
              <li>
                {t('Mission.alert')}: {alert}
              </li>
            )}
            {place && (
              <li>
                {t('Mission.location')}: {place}
              </li>
            )}
            <li>{t(`Zone.${mission.zone}`)}</li>
          </ul>
        </TooltipContent>
      </Tooltip>

      <div className="min-w-0 self-end leading-tight">
        <p className="truncate text-sm font-semibold">{name}</p>
        <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
          {alertFallback && (
            <GameIcon
              group="alerts"
              names={[mission.alertKind]}
              fallback={alertFallback}
              label={alert ?? undefined}
              className="size-3.5 shrink-0"
            />
          )}
          <span className="truncate">{place ?? alert}</span>
        </p>
      </div>

      <ul className="flex flex-wrap items-center gap-x-2 gap-y-1 self-start pt-1">
        {vbucks > 0 && (
          <li>
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  tabIndex={0}
                  className="inline-flex items-center gap-1 rounded-sm bg-vbucks px-1.5 py-0.5 text-xs font-extrabold text-black"
                >
                  <VbucksIcon className="text-black" />
                  {vbucks}
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-64">
                <p className="font-semibold">{t('Mission.vbucksAmount', { count: vbucks })}</p>
                <p className="text-xs">{t('Reward.foundersOnly')}</p>
              </TooltipContent>
            </Tooltip>
          </li>
        )}
        {rewards.map((r) => (
          <li key={r.itemId}>
            <RewardChip reward={r} />
          </li>
        ))}
      </ul>
    </li>
  );
}
