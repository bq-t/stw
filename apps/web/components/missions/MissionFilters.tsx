'use client';

import {
  DEFAULT_FILTERS,
  PL_MAX,
  PL_MIN,
  REWARD_CATEGORIES,
  ZONES,
  isDefaultFilters,
  type AlertFilter,
  type MissionFilters as Filters,
  type RewardCategory,
  type Zone,
} from '@stw/shared';
import { ChevronDown, RotateCcw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { VbucksIcon } from './VbucksIcon';

const itemClass =
  'h-7 px-2.5 text-xs data-[state=on]:bg-surface-2 data-[state=on]:text-foreground data-[state=on]:ring-1 data-[state=on]:ring-accent-ui';

const ALERT_OPTIONS: { value: AlertFilter; label: string }[] = [
  { value: 'miniboss', label: 'alertMiniboss' },
  { value: 'alerts', label: 'alertAlerts' },
  { value: 'all', label: 'alertAll' },
  { value: 'vbucks', label: 'alertVbucks' },
];

/** Moves locally while dragging and commits to the URL on release. Re-keyed when the URL changes. */
function PowerLevelSlider({
  label,
  min,
  max,
  onCommit,
}: {
  label: string;
  min: number;
  max: number;
  onCommit: (min: number, max: number) => void;
}) {
  const [pl, setPl] = useState<[number, number]>([min, max]);
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs whitespace-nowrap text-muted-foreground">
        {label}:{' '}
        <span className="font-semibold text-foreground tabular-nums">
          {pl[0]}–{pl[1]}
        </span>
      </span>
      <Slider
        className="w-36"
        min={PL_MIN}
        max={PL_MAX}
        step={1}
        value={pl}
        onValueChange={(v) => setPl([v[0] ?? PL_MIN, v[1] ?? PL_MAX])}
        onValueCommit={(v) => onCommit(v[0] ?? PL_MIN, v[1] ?? PL_MAX)}
      />
    </div>
  );
}

export function MissionFilters({
  value,
  onChange,
}: {
  value: Filters;
  onChange: (next: Filters) => void;
}) {
  const t = useTranslations();
  const rewardCount = value.rewards.length;

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-md border border-border bg-card px-3 py-2">
      <ToggleGroup
        type="single"
        value={value.alert}
        onValueChange={(v) => v && onChange({ ...value, alert: v as AlertFilter })}
        spacing={1}
        aria-label={t('Filters.alert')}
        className="max-w-full flex-wrap"
      >
        {ALERT_OPTIONS.map((o) => (
          <ToggleGroupItem
            key={o.value}
            value={o.value}
            className={o.value === 'vbucks' ? `${itemClass} text-vbucks` : itemClass}
          >
            {o.value === 'vbucks' && <VbucksIcon className="size-3.5" />}
            {t(`Filters.${o.label}`)}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <ToggleGroup
        type="multiple"
        value={value.zones}
        onValueChange={(v) => onChange({ ...value, zones: v as Zone[] })}
        spacing={1}
        aria-label={t('Filters.zone')}
        className="max-w-full flex-wrap"
      >
        {ZONES.map((z) => (
          <ToggleGroupItem key={z} value={z} className={itemClass}>
            {t(`Zone.${z}`)}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={rewardCount ? 'h-7 ring-1 ring-accent-ui' : 'h-7'}
          >
            {t('Filters.reward')}
            {rewardCount > 0 && <span className="tabular-nums">({rewardCount})</span>}
            <ChevronDown aria-hidden />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto max-w-[min(32rem,90vw)] p-2">
          <ToggleGroup
            type="multiple"
            value={value.rewards}
            onValueChange={(v) => onChange({ ...value, rewards: v as RewardCategory[] })}
            spacing={1}
            className="flex-wrap"
          >
            {REWARD_CATEGORIES.map((c) => (
              <ToggleGroupItem key={c} value={c} className={itemClass}>
                {c === 'vbucks' && <VbucksIcon className="size-3.5" />}
                {t(`RewardCategory.${c}`)}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </PopoverContent>
      </Popover>

      <PowerLevelSlider
        key={`${value.plMin}-${value.plMax}`}
        label={t('Filters.powerLevel')}
        min={value.plMin}
        max={value.plMax}
        onCommit={(plMin, plMax) => onChange({ ...value, plMin, plMax })}
      />

      {!isDefaultFilters(value) && (
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto h-7"
          onClick={() => onChange(DEFAULT_FILTERS)}
        >
          <RotateCcw aria-hidden />
          {t('Tracker.resetFilters')}
        </Button>
      )}
    </div>
  );
}
