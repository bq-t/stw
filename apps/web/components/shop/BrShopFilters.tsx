'use client';

import type { BrShopItem } from '@stw/shared';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, RotateCcw } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { fetchBrShop, IS_DEMO } from '@/lib/api';
import { cn } from '@/lib/utils';
import {
  isDefaultBrFilters,
  NO_BR_FILTERS,
  setShowLego,
  TYPE_ORDER,
  typeKeyOf,
  useBrFilters,
  useShowLego,
  type BrOnly,
} from './brFilters';

/** Look lives in `.fn-chip` (globals.css): slant, header font, brand fill when active. */
const itemClass = 'fn-chip h-7 px-3';

/** Types the shop has today, in TYPE_ORDER, with the shop's own (localized) name. */
function typeOptions(items: BrShopItem[]) {
  const names = new Map<string, string>();
  for (const i of items) if (!names.has(typeKeyOf(i))) names.set(typeKeyOf(i), i.type);
  const rank = (k: string) => (TYPE_ORDER.includes(k) ? TYPE_ORDER.indexOf(k) : TYPE_ORDER.length);
  return [...names.keys()]
    .sort((a, b) => rank(a) - rank(b))
    .map((key) => ({ key, name: names.get(key)! }));
}

/** A slanted on/off switch in the chip style: the brand fill slides to the "on" side. */
function LegoSwitch() {
  const t = useTranslations('Shop.filters');
  const on = useShowLego();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => setShowLego(!on)}
      className="fn-chip flex h-7 items-center gap-2 px-3"
      title={t('legoHint')}
    >
      <span>{t('lego')}</span>
      <span
        aria-hidden
        className={cn('relative h-3.5 w-7 bg-white/20 transition-colors', on && 'bg-brand')}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 size-2.5 bg-white transition-transform',
            on && 'translate-x-3.5',
          )}
        />
      </span>
    </button>
  );
}

function Filters() {
  const t = useTranslations('Shop.filters');
  const locale = useLocale();
  const [value, onChange] = useBrFilters();
  // The same query as the shop below: one request, shared cache.
  const shop = useQuery({
    queryKey: ['shop', 'br', locale],
    queryFn: () => fetchBrShop(locale),
    staleTime: 5 * 60 * 1000,
  });
  const options = typeOptions((shop.data?.sections ?? []).flatMap((s) => s.items));
  const label = (o: { key: string; name: string }) =>
    o.key === 'bundle' ? t('bundle') : o.key === 'track' ? t('track') : o.name;
  const typeCount = value.types.length;

  return (
    <div className="fn-panel flex flex-wrap items-center gap-x-3 gap-y-2 py-2">
      <LegoSwitch />

      <ToggleGroup
        type="single"
        value={value.only ?? ''}
        onValueChange={(v) => onChange({ ...value, only: (v || null) as BrOnly | null })}
        spacing={1}
        aria-label={t('only')}
        className="max-w-full flex-wrap"
      >
        <ToggleGroupItem value="new" className={itemClass}>
          <span>{t('new')}</span>
        </ToggleGroupItem>
        <ToggleGroupItem value="first" className={itemClass}>
          <span>{t('first')}</span>
        </ToggleGroupItem>
        <ToggleGroupItem value="leaving" className={itemClass}>
          <span>{t('leaving')}</span>
        </ToggleGroupItem>
      </ToggleGroup>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            disabled={!options.length}
            className={typeCount ? 'fn-chip h-7 px-3 ring-1 ring-accent-ui' : 'fn-chip h-7 px-3'}
          >
            <span>{t('type')}</span>
            {typeCount > 0 && <span className="tabular-nums">({typeCount})</span>}
            <ChevronDown aria-hidden />
          </Button>
        </PopoverTrigger>
        {/* Right-aligned: the button is at the panel's right end, a left-aligned menu ran off. */}
        <PopoverContent
          align="end"
          alignOffset={-10}
          className="w-auto max-w-[min(32rem,90vw)] p-2"
        >
          <ToggleGroup
            type="multiple"
            value={value.types}
            onValueChange={(v) => onChange({ ...value, types: v })}
            spacing={1}
            className="flex-wrap"
          >
            {options.map((o) => (
              <ToggleGroupItem key={o.key} value={o.key} className={itemClass}>
                <span>{label(o)}</span>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </PopoverContent>
      </Popover>

      {!isDefaultBrFilters(value) && (
        <Button
          variant="ghost"
          size="sm"
          className="fn-chip h-7 px-2"
          title={t('reset')}
          onClick={() => onChange(NO_BR_FILTERS)}
        >
          <RotateCcw aria-hidden />
          <span className="sr-only">{t('reset')}</span>
        </Button>
      )}
    </div>
  );
}

/** The filter bar of the BR shop (page header, next to the intro). Nothing on demo data. */
export function BrShopFilters() {
  if (IS_DEMO) return null;
  // useSearchParams needs a Suspense boundary in a static export.
  return (
    <Suspense>
      <Filters />
    </Suspense>
  );
}
