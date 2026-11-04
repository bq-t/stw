'use client';

import { rewardCategory, type RewardCategory, type Reward } from '@stw/shared';
import { iconNames, rarityOf } from '@stw/shared/items';
import {
  CircleArrowUp,
  Coins,
  FlaskConical,
  Package,
  ShieldHalf,
  Sparkles,
  Star,
  Swords,
  Ticket,
  Users,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { GameIcon } from './GameIcon';
import { useItemName } from './labels';

const ICONS: Record<RewardCategory, LucideIcon> = {
  vbucks: Coins,
  xray: Ticket,
  event: Star,
  xp: Sparkles,
  evo: FlaskConical,
  perk: CircleArrowUp,
  schematic: Wrench,
  hero: Swords,
  survivor: Users,
  defender: ShieldHalf,
  other: Package,
};

function formatQty(n: number): string {
  return n >= 1000 ? `${Math.round(n / 100) / 10}k` : String(n);
}

/** Reward as a Fortnite-style tile: rarity gradient, icon, amount in the corner. */
export function RewardChip({ reward }: { reward: Reward }) {
  const t = useTranslations();
  const itemName = useItemName();
  const category = rewardCategory(reward.itemId);
  const rarity = reward.rarity ?? rarityOf(reward.itemId);
  const name = itemName(reward.itemId);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          tabIndex={0}
          data-rarity={rarity}
          className="reward-tile relative inline-flex size-9 items-center justify-center overflow-hidden rounded-[3px] ring-1 ring-black/50"
        >
          <GameIcon
            group="rewards"
            names={iconNames(reward.itemId, category)}
            fallback={ICONS[category]}
            className="size-8 drop-shadow-[0_1px_1px_rgb(0_0_0/0.6)]"
          />
          <span className="sr-only">{name}</span>
          {reward.quantity > 1 && (
            <span className="absolute right-0 bottom-0 rounded-tl-sm bg-black/70 px-0.5 text-[10px] leading-tight font-bold text-white tabular-nums">
              {formatQty(reward.quantity)}
            </span>
          )}
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-64">
        <p className="font-semibold">
          {name}
          {reward.quantity > 0 && ` × ${reward.quantity}`}
        </p>
        <p className="text-xs opacity-80">
          {t(`RewardCategory.${category}`)}
          {rarity && ` · ${t(`Rarity.${rarity}`)}`}
        </p>
        {reward.isVbucks && <p className="mt-1 text-xs">{t('Reward.foundersOnly')}</p>}
      </TooltipContent>
    </Tooltip>
  );
}
