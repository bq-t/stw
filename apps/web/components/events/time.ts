'use client';

import { useLocale } from 'next-intl';
import { useSyncExternalStore } from 'react';

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['day', 86_400_000],
  ['hour', 3_600_000],
  ['minute', 60_000],
];

/** "in 3 days", "через 2 часа": the largest whole unit, like Discord's <t:…:R>. */
export function useRelativeTime() {
  const locale = useLocale();
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  return (at: number, now = Date.now()) => {
    const diff = at - now;
    for (const [unit, ms] of UNITS)
      if (Math.abs(diff) >= ms || unit === 'minute') return rtf.format(Math.round(diff / ms), unit);
    return '';
  };
}

/** Local date and time of a session: "Tue, 10 Nov, 19:00". */
export function useSessionTime() {
  const locale = useLocale();
  const f = new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
  return (at: number) => f.format(new Date(at));
}

const MINUTE = 60_000;
const subscribe = (tick: () => void) => {
  const id = window.setInterval(tick, MINUTE / 2);
  return () => window.clearInterval(id);
};
const minuteNow = () => Math.floor(Date.now() / MINUTE) * MINUTE;

/** The current time to the minute, re-rendering as it passes (0 in the static HTML). */
export function useNow(): number {
  return useSyncExternalStore(subscribe, minuteNow, () => 0);
}
