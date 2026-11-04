'use client';

import type { VbucksHistory } from '@stw/shared';
import { useTranslations } from 'next-intl';
import { Skeleton } from '@/components/ui/skeleton';

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

export function VbucksStats({
  history,
  today,
  todayTotal,
}: {
  history: VbucksHistory | undefined;
  today: string | undefined;
  todayTotal: number | undefined;
}) {
  const t = useTranslations('Stats');
  const ready = history && today && todayTotal !== undefined;

  const items = ready
    ? [
        { label: t('today'), value: todayTotal, accent: true },
        { label: t('yesterday'), value: sumDays(history, today, 1, 1) },
        { label: t('week'), value: todayTotal + sumDays(history, today, 1, 6) },
        { label: t('month'), value: todayTotal + sumDays(history, today, 1, 29) },
      ]
    : null;

  return (
    <section aria-label={t('title')} className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {items
        ? items.map((it) => (
            <div
              key={it.label}
              className={`rounded-md border bg-card px-3 py-2 ${it.accent ? 'border-vbucks' : 'border-border'}`}
            >
              <p className="text-xs text-muted-foreground uppercase">{it.label}</p>
              <p
                className={`font-display text-2xl font-extrabold tabular-nums ${it.accent ? 'text-vbucks' : ''}`}
              >
                {it.value}
              </p>
            </div>
          ))
        : Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-16" />)}
    </section>
  );
}
