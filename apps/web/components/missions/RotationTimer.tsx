'use client';

import { msUntilRotation, nextRotation } from '@stw/shared';
import { useFormatter, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

function format(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':');
}

/**
 * Countdown to the daily rotation at 00:00 UTC (missions and the item shop reset together).
 * `label`: the text before it, the tracker's "Next rotation in" by default.
 */
export function RotationTimer({ label }: { label?: string }) {
  const t = useTranslations('Tracker');
  const formatter = useFormatter();
  const [ms, setMs] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setMs(msUntilRotation());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const localTime = formatter.dateTime(nextRotation(), { hour: '2-digit', minute: '2-digit' });

  return (
    <div title={t('rotationAt', { time: localTime })} className="flex items-baseline gap-2">
      <span className="text-sm text-white/80">{label ?? t('nextRotation')}</span>
      <span className="font-display text-xl font-extrabold text-white tabular-nums">
        {ms === null ? '--:--:--' : format(ms)}
      </span>
    </div>
  );
}
