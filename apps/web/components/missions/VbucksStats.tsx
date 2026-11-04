'use client';

import type { VbucksHistory } from '@stw/shared';
import { Coins } from 'lucide-react';
import { useTranslations } from 'next-intl';

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

/** One compact strip: V-Bucks in alerts today / yesterday / 7 / 30 days. */
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
  const items = [
    { label: t('today'), value: ready ? todayTotal : null, accent: true },
    { label: t('yesterday'), value: ready ? sumDays(history, today, 1, 1) : null },
    { label: t('week'), value: ready ? todayTotal + sumDays(history, today, 1, 6) : null },
    { label: t('month'), value: ready ? todayTotal + sumDays(history, today, 1, 29) : null },
  ];

  return (
    <section
      aria-label={t('title')}
      className="flex flex-wrap items-center gap-x-5 gap-y-1 rounded-md border border-border bg-card px-3 py-2"
    >
      <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase">
        <Coins aria-hidden className="size-4 text-vbucks" />
        {t('title')}
      </span>
      {items.map((it) => (
        <span key={it.label} className="flex items-baseline gap-1.5">
          <span className="text-xs text-muted-foreground">{it.label}</span>
          <span
            className={`font-display text-lg font-extrabold tabular-nums ${it.accent ? 'text-vbucks' : ''}`}
          >
            {it.value ?? '–'}
          </span>
        </span>
      ))}
    </section>
  );
}
