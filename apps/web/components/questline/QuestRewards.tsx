'use client';

import { iconNames, itemInfo } from '@stw/shared/items';
import type { Rarity } from '@stw/shared';
import { LockOpen } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import {
  HERO_CLASSES,
  ITEM_KINDS,
  PERK_UP_BY_RARITY,
  RESOURCES,
  WEAPONS,
  type QReward,
} from '@/data/questline';
import { GameIcon } from '@/components/missions/GameIcon';
import { VbucksIcon } from '@/components/missions/VbucksIcon';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { ITEM_ICONS, ITEM_ICON_NAMES, RESOURCE_FALLBACK } from './icons';

type Locale = 'en' | 'ru';

/** 128000 → "128K", 7500 → "7,500" (EN) / "7 500" (RU). */
function formatAmount(n: number, locale: Locale): string {
  if (n >= 100_000) return `${Math.round(n / 1000)}K`;
  return n.toLocaleString(locale === 'ru' ? 'ru-RU' : 'en-US');
}

function Tile({ rarity, children }: { rarity?: Rarity; children: React.ReactNode }) {
  return (
    <span
      data-rarity={rarity}
      className="reward-tile fn-tile inline-flex size-5 shrink-0 items-center justify-center overflow-hidden"
    >
      {children}
    </span>
  );
}

/** One reward: rarity tile with an icon · amount and name. Tooltip with rarity and kind. */
function RewardChip({ reward }: { reward: Exclude<QReward, { t: 'choice' | 'unlock' }> }) {
  const locale = useLocale() as Locale;
  const t = useTranslations();

  if (reward.t === 'vbucks') {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            tabIndex={0}
            data-rarity="legendary"
            className="reward-tile fn-badge inline-flex h-6 items-center gap-1 px-2 text-xs font-extrabold text-white [text-shadow:0_1px_1px_rgb(0_0_0/0.6)]"
          >
            <VbucksIcon className="text-white" />
            <span>{reward.n}</span>
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-64">
          <p className="font-semibold">{t('Mission.vbucksAmount', { count: reward.n })}</p>
          <p className="text-xs">{t('Questline.founders')}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  let label: string;
  let detail: string | null = null;
  let rarity: Rarity | undefined;
  let icon: React.ReactNode;

  if (reward.t === 'res') {
    const info = RESOURCES[reward.id];
    const catalog =
      reward.id === 'perk-up' && reward.rarity
        ? (PERK_UP_BY_RARITY[reward.rarity] ?? info.catalog)
        : info.catalog;
    const cat = catalog ? itemInfo(catalog) : undefined;
    rarity = reward.rarity ?? cat?.rarity ?? info.rarity;
    const name = cat ? cat.name[locale] : info.name[locale];
    label = `${formatAmount(reward.n, locale)} ${name}`;
    detail = cat?.description?.[locale] ?? null;
    const Fallback = RESOURCE_FALLBACK[reward.id] ?? RESOURCE_FALLBACK.default!;
    icon = (
      <GameIcon
        group="rewards"
        names={catalog ? iconNames(catalog, 'resource') : [info.icon ?? reward.id]}
        fallback={Fallback}
        className="size-4 fill-current"
      />
    );
  } else {
    rarity = reward.rarity;
    const kind = ITEM_KINDS[reward.kind][locale];
    const what = reward.heroClass
      ? HERO_CLASSES[reward.heroClass][locale]
      : reward.weapon
        ? WEAPONS[reward.weapon][locale]
        : kind;
    label = reward.name ?? what;
    detail = [rarity && t(`Rarity.${rarity}`), reward.name ? what : null]
      .filter(Boolean)
      .join(' · ');
    if (reward.n && reward.n > 1) label += ` ${t('Questline.quantity', { n: reward.n })}`;
    icon = (
      <GameIcon
        group="rewards"
        names={ITEM_ICON_NAMES[reward.kind] ?? []}
        fallback={ITEM_ICONS[reward.kind]}
        className="size-4"
      />
    );
  }

  const chip = (
    <span
      tabIndex={detail ? 0 : undefined}
      className="skew-tab inline-flex h-6 items-center gap-1.5 bg-surface-2 pr-2.5 pl-2 text-xs"
    >
      <Tile rarity={rarity}>{icon}</Tile>
      <span className="font-medium">{label}</span>
    </span>
  );
  if (!detail) return chip;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{chip}</TooltipTrigger>
      <TooltipContent className="max-w-64">
        <p className="font-semibold">{label}</p>
        <p className="text-xs">{detail}</p>
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * Quest rewards, most important first: V-Bucks · items and resources · a pick-one group ·
 * a line with the features the quest unlocks.
 */
export function QuestRewards({ rewards, className }: { rewards: QReward[]; className?: string }) {
  const locale = useLocale() as Locale;
  const t = useTranslations('Questline');
  if (rewards.length === 0) {
    return <p className="text-xs text-muted-foreground italic">{t('noRewards')}</p>;
  }
  const order = (r: QReward) => (r.t === 'vbucks' ? 0 : r.t === 'item' ? 1 : 2);
  const chips = rewards
    .filter(
      (r): r is Exclude<QReward, { t: 'choice' | 'unlock' }> =>
        r.t !== 'choice' && r.t !== 'unlock',
    )
    .sort((a, b) => order(a) - order(b));
  const choices = rewards.filter((r) => r.t === 'choice');
  const unlocks = rewards.filter((r) => r.t === 'unlock');

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {chips.length > 0 && (
        <ul className="flex flex-wrap items-center gap-1.5">
          {chips.map((r, i) => (
            <li key={i} className="flex">
              <RewardChip reward={r} />
            </li>
          ))}
        </ul>
      )}
      {choices.map((c, i) => (
        <div
          key={i}
          className="flex flex-wrap items-center gap-1.5 border border-dashed border-border px-2 py-1"
        >
          <span className="text-xs text-muted-foreground">{t('oneOf')}:</span>
          {c.of.map((opt, j) => (
            <span key={j} className="inline-flex flex-wrap items-center gap-1.5">
              {j > 0 && <span className="text-xs text-muted-foreground">{t('or')}</span>}
              {opt.map((r, k) =>
                r.t === 'choice' || r.t === 'unlock' ? null : <RewardChip key={k} reward={r} />,
              )}
            </span>
          ))}
        </div>
      ))}
      {unlocks.length > 0 && (
        <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
          <LockOpen aria-hidden className="mt-px size-3.5 shrink-0" />
          <span>
            <span className="font-semibold">{t('unlocks')}:</span>{' '}
            {unlocks.map((u) => u.text[locale]).join(' · ')}
          </span>
        </p>
      )}
    </div>
  );
}
