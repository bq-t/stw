'use client';

import { vbucksOf, type Mission, type Rarity, type Reward } from '@stw/shared';
import { RARITY_ORDER, maxRarity, rarityOf } from '@stw/shared/items';
import { MapPin } from 'lucide-react';
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

/** Card tint by the best alert reward rarity, as in the game. */
const RARITY_ROW: Record<Rarity, string> = {
  common: 'border-common bg-common/14',
  uncommon: 'border-uncommon bg-uncommon/14',
  rare: 'border-rare bg-rare/14',
  epic: 'border-epic bg-epic/16',
  legendary: 'border-legendary bg-legendary/16',
  mythic: 'border-mythic bg-mythic/18',
};

/** Rewards left to right: mythic → common, items without rarity last (V-Bucks go first separately). */
function byRarity(a: Reward, b: Reward): number {
  const rank = (r: Reward) => {
    const rarity = r.rarity ?? rarityOf(r.itemId);
    return rarity ? RARITY_ORDER.indexOf(rarity) : -1;
  };
  return rank(b) - rank(a);
}

/** Small corner icon with its own tooltip. */
function CornerIcon({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span tabIndex={0} aria-label={label} className="flex size-4 items-center justify-center">
          {children}
        </span>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

/**
 * Mission card: icon with power level underneath · name with alert/location icons in the
 * corner · rewards (V-Bucks first, then by rarity).
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
  const rewards = mission.alertRewards
    .filter((r) => !r.isVbucks && !HIDDEN_REWARDS.has(r.itemId))
    .sort(byRarity);

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
  const tone =
    vbucks > 0
      ? 'vbucks-card border-vbucks bg-[var(--vbucks-glow)]'
      : rarity
        ? RARITY_ROW[rarity]
        : 'border-transparent bg-surface-2';
  const pl = mission.powerLevel > 0 ? mission.powerLevel : '?';
  const place = mission.biome ? biome(mission.biome) : null;
  const alert = mission.alertKind !== 'none' ? t(`AlertKind.${mission.alertKind}`) : null;

  return (
    <li
      className={cn(
        'fn-card grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-2 border-l-[3px] px-2.5 py-1.5',
        tone,
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
                className="size-6 fill-current"
              />
              {showCategory && (
                <span className="absolute -right-1 -bottom-1 rounded-sm bg-background px-0.5 text-[10px] leading-none font-bold">
                  {category}
                </span>
              )}
            </span>
            <span className="flex items-center gap-0.5 font-display text-xs font-extrabold tabular-nums">
              <GameIcon
                group="ui"
                names={['power']}
                fallback={PowerIcon}
                className="size-3 fill-current text-white"
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

      <div className="flex min-w-0 items-start gap-1">
        <p className="min-w-0 flex-1 truncate text-sm leading-tight font-semibold">{name}</p>
        <span className="flex shrink-0 items-center gap-0.5 text-muted-foreground">
          {alertFallback && alert && (
            <CornerIcon label={alert}>
              <GameIcon
                group="alerts"
                names={[mission.alertKind]}
                fallback={alertFallback}
                className="size-3.5 fill-current text-white"
              />
            </CornerIcon>
          )}
          {place && (
            <CornerIcon label={place}>
              <MapPin
                aria-hidden
                className="size-3.5 fill-white text-white [&>circle]:fill-surface-2 [&>circle]:text-surface-2"
              />
            </CornerIcon>
          )}
        </span>
      </div>

      <ul className="flex flex-wrap items-center gap-1.5 self-end">
        {vbucks > 0 && (
          <li>
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  tabIndex={0}
                  data-rarity="legendary"
                  className="reward-tile fn-badge inline-flex h-6 items-center gap-1 px-2 text-xs font-extrabold text-white [text-shadow:0_1px_1px_rgb(0_0_0/0.6)]"
                >
                  <VbucksIcon className="text-white" />
                  <span>{vbucks}</span>
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
