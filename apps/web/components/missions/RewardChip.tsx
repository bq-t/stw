'use client';

import { rewardCategory, type RewardCategory, type Reward } from '@stw/shared';
import { iconNames, itemInfo, rarityOf } from '@stw/shared/items';
import { useLocale, useTranslations } from 'next-intl';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { GameIcon } from './GameIcon';
import { REWARD_ICONS } from './icons';
import { useItemName } from './labels';

function formatQty(n: number): string {
  return n >= 1000 ? `${Math.round(n / 100) / 10}k` : String(n);
}

/** Small rarity tile with the reward icon, used in rows (16px) and tooltips (64px). */
function RewardTile({
  reward,
  category,
  rarity,
  size,
}: {
  reward: Reward;
  category: RewardCategory;
  rarity: string | undefined;
  size: 'sm' | 'lg';
}) {
  return (
    <span
      data-rarity={rarity}
      className={cn(
        'reward-tile inline-flex shrink-0 items-center justify-center overflow-hidden',
        size === 'sm' ? 'size-4 rounded-[2px]' : 'size-16 rounded-[4px]',
      )}
    >
      <GameIcon
        group="rewards"
        names={iconNames(reward.itemId, category)}
        fallback={REWARD_ICONS[category]}
        className={cn(
          'fill-current',
          size === 'sm' ? 'size-3.5' : 'size-14 drop-shadow-[0_1px_2px_rgb(0_0_0/0.6)]',
        )}
      />
    </span>
  );
}

/** Reward in a row: 16px rarity tile + amount; tooltip with a big icon and a description. */
export function RewardChip({ reward }: { reward: Reward }) {
  const t = useTranslations();
  const locale = useLocale();
  const itemName = useItemName();
  const category = rewardCategory(reward.itemId);
  const rarity = reward.rarity ?? rarityOf(reward.itemId);
  const name = itemName(reward.itemId);
  const info = itemInfo(reward.itemId);
  const isLead = /^Worker:manager/i.test(reward.itemId);
  const description =
    (info?.description && (locale === 'ru' ? info.description.ru : info.description.en)) ??
    (t.has(`RewardDescription.${isLead ? 'lead' : category}`)
      ? t(`RewardDescription.${isLead ? 'lead' : category}`)
      : null);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          tabIndex={0}
          className="inline-flex items-center gap-1 rounded-sm text-xs font-semibold tabular-nums"
        >
          <RewardTile reward={reward} category={category} rarity={rarity} size="sm" />
          <span className="sr-only">{name}</span>
          {reward.quantity > 1 && <span>{formatQty(reward.quantity)}</span>}
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-72 p-2">
        <div className="flex gap-2.5">
          <RewardTile reward={reward} category={category} rarity={rarity} size="lg" />
          <div className="flex min-w-0 flex-col gap-0.5">
            <p className="text-sm leading-tight font-semibold">
              {name}
              {reward.quantity > 1 && ` × ${reward.quantity}`}
            </p>
            <p className="text-xs opacity-80">
              {rarity && `${t(`Rarity.${rarity}`)} · `}
              {t(`RewardCategory.${category}`)}
            </p>
            {description && <p className="mt-1 text-xs leading-snug">{description}</p>}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
