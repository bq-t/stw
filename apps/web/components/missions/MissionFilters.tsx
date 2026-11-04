'use client';

import {
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
import { RotateCcw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <span className="text-xs font-semibold text-muted-foreground uppercase">{label}</span>
      {children}
    </div>
  );
}

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
    <Group label={`${label}: ${pl[0]}–${pl[1]}`}>
      <Slider
        className="w-48 max-w-full"
        min={PL_MIN}
        max={PL_MAX}
        step={1}
        value={pl}
        onValueChange={(v) => setPl([v[0] ?? PL_MIN, v[1] ?? PL_MAX])}
        onValueCommit={(v) => onCommit(v[0] ?? PL_MIN, v[1] ?? PL_MAX)}
      />
    </Group>
  );
}

const itemClass =
  'h-7 px-2.5 text-xs data-[state=on]:bg-surface-2 data-[state=on]:text-foreground data-[state=on]:ring-1 data-[state=on]:ring-vbucks';

export function MissionFilters({
  value,
  onChange,
}: {
  value: Filters;
  onChange: (next: Filters) => void;
}) {
  const t = useTranslations();
  return (
    <div className="flex flex-wrap items-end gap-x-6 gap-y-4 rounded-md border border-border bg-card p-3">
      <Group label={t('Filters.alert')}>
        <ToggleGroup
          type="single"
          value={value.alert}
          onValueChange={(v) => v && onChange({ ...value, alert: v as AlertFilter })}
          spacing={1}
        >
          <ToggleGroupItem value="all" className={itemClass}>
            {t('Filters.alertAll')}
          </ToggleGroupItem>
          <ToggleGroupItem value="alerts" className={itemClass}>
            {t('Filters.alertAlerts')}
          </ToggleGroupItem>
          <ToggleGroupItem value="vbucks" className={`${itemClass} text-vbucks`}>
            {t('Filters.alertVbucks')}
          </ToggleGroupItem>
        </ToggleGroup>
      </Group>

      <Group label={t('Filters.zone')}>
        <ToggleGroup
          type="multiple"
          value={value.zones}
          onValueChange={(v) => onChange({ ...value, zones: v as Zone[] })}
          spacing={1}
          className="max-w-full flex-wrap"
        >
          {ZONES.map((z) => (
            <ToggleGroupItem key={z} value={z} className={itemClass}>
              {t(`Zone.${z}`)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </Group>

      <Group label={t('Filters.reward')}>
        <ToggleGroup
          type="multiple"
          value={value.rewards}
          onValueChange={(v) => onChange({ ...value, rewards: v as RewardCategory[] })}
          spacing={1}
          className="max-w-full flex-wrap"
        >
          {REWARD_CATEGORIES.filter((c) => c !== 'vbucks').map((c) => (
            <ToggleGroupItem key={c} value={c} className={itemClass}>
              {t(`RewardCategory.${c}`)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </Group>

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
          className="ml-auto"
          onClick={() =>
            onChange({ zones: [], alert: 'all', rewards: [], plMin: PL_MIN, plMax: PL_MAX })
          }
        >
          <RotateCcw aria-hidden />
          {t('Tracker.resetFilters')}
        </Button>
      )}
    </div>
  );
}
