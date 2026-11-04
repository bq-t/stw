'use client';

import { rewardCategory, type RewardCategory, type Reward } from '@stw/shared';
import { itemInfo } from '@stw/shared/items';
import {
  CircleArrowUp,
  Coins,
  FlaskConical,
  Package,
  ShieldHalf,
  Swords,
  Ticket,
  Users,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useItemName } from './labels';

const ICONS: Record<RewardCategory, LucideIcon> = {
  vbucks: Coins,
  xray: Ticket,
  evo: FlaskConical,
  perk: CircleArrowUp,
  schematic: Wrench,
  hero: Swords,
  survivor: Users,
  defender: ShieldHalf,
  other: Package,
};

const RARITY_BORDER: Record<string, string> = {
  common: 'border-common',
  uncommon: 'border-uncommon',
  rare: 'border-rare',
  epic: 'border-epic',
  legendary: 'border-legendary',
  mythic: 'border-mythic',
};

function formatQty(n: number): string {
  return n >= 1000 ? `${Math.round(n / 100) / 10}k` : String(n);
}

export function RewardChip({ reward, muted = false }: { reward: Reward; muted?: boolean }) {
  const t = useTranslations();
  const itemName = useItemName();
  const category = rewardCategory(reward.itemId);
  const Icon = ICONS[category];
  const rarity = reward.rarity ?? itemInfo(reward.itemId)?.rarity;
  const name = itemName(reward.itemId);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          tabIndex={0}
          className={cn(
            'inline-flex items-center gap-1 rounded-sm border-l-2 bg-surface-2 py-0.5 pr-2 pl-1.5 text-xs tabular-nums',
            reward.isVbucks
              ? 'border-vbucks font-semibold text-vbucks'
              : rarity
                ? RARITY_BORDER[rarity]
                : 'border-transparent',
            muted && 'text-muted-foreground',
          )}
        >
          <Icon aria-hidden className="size-3.5" />
          <span className="sr-only">{name}</span>
          {formatQty(reward.quantity)}
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-64">
        <p className="font-semibold">
          {name} × {reward.quantity}
        </p>
        <p className="text-xs opacity-80">{t(`RewardCategory.${category}`)}</p>
        {reward.isVbucks && <p className="mt-1 text-xs">{t('Reward.foundersOnly')}</p>}
      </TooltipContent>
    </Tooltip>
  );
}
