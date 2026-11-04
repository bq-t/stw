'use client';

import type { VbucksHistory } from '@stw/shared';
import { Frown, Info } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { VbucksIcon } from './VbucksIcon';

function sumDays(history: VbucksHistory, today: string, from: number, to: number): number {
  // Days are newest first; offset 0 = today.
  const todayMs = Date.parse(`${today}T00:00:00Z`);
  let total = 0;
  for (const d of history.days) {
    const offset = Math.round((todayMs - Date.parse(`${d.date}T00:00:00Z`)) / 86_400_000);
    if (offset >= from && offset <= to) total += d.total;
  }
  return total;
}

/** One strip: V-Bucks in alerts today / yesterday / 7 / 30 days + "Let's Farm" (V-Bucks filter). */
export function VbucksStats({
  history,
  today,
  todayTotal,
  onFarm,
}: {
  history: VbucksHistory | undefined;
  today: string | undefined;
  todayTotal: number | undefined;
  onFarm: () => void;
}) {
  const t = useTranslations('Stats');
  const ready = history && today && todayTotal !== undefined;
  const items = [
    { label: t('today'), value: ready ? todayTotal : null, today: true },
    { label: t('yesterday'), value: ready ? sumDays(history, today, 1, 1) : null },
    { label: t('week'), value: ready ? todayTotal + sumDays(history, today, 1, 6) : null },
    { label: t('month'), value: ready ? todayTotal + sumDays(history, today, 1, 29) : null },
  ];

  return (
    <section
      aria-label={t('title')}
      className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-md border border-border bg-card px-3 py-2"
    >
      <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase">
        <VbucksIcon />
        {t('title')}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label={t('foundersInfo')}
              className="rounded-full text-muted-foreground hover:text-foreground"
            >
              <Info aria-hidden className="size-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="max-w-64 normal-case">{t('foundersInfo')}</TooltipContent>
        </Tooltip>
      </span>
      {items.map((it) => (
        <span key={it.label} className="flex items-baseline gap-1.5">
          <span className="text-xs text-muted-foreground">{it.label}</span>
          <span
            className={`font-display text-lg font-extrabold tabular-nums ${
              it.today ? (it.value ? 'vbucks-glow' : 'text-foreground') : 'text-foreground/55'
            }`}
          >
            {it.value ?? '–'}
          </span>
        </span>
      ))}
      {ready && todayTotal === 0 ? (
        <span className="ml-auto inline-flex items-center gap-1.5 rounded-sm border border-border bg-surface-2 px-2.5 py-1 text-xs font-semibold text-muted-foreground">
          <Frown aria-hidden className="size-4" />
          {t('noVbucksToday')}
        </span>
      ) : (
        <button type="button" onClick={onFarm} className="fn-button ml-auto">
          <span>{t('farm')}</span>
        </button>
      )}
    </section>
  );
}
