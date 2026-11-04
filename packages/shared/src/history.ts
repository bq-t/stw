import type { DaySnapshot, VbucksHistory } from './types';

export const HISTORY_DAYS = 30;

/** Adds (or replaces) the snapshot's day and keeps the last 30 days, newest first. */
export function addToHistory(history: VbucksHistory | null, snapshot: DaySnapshot): VbucksHistory {
  const day = {
    date: snapshot.date,
    total: snapshot.vbucksTotal,
    missions: snapshot.missions.filter((m) => m.alertRewards.some((r) => r.isVbucks)).length,
  };
  const days = [day, ...(history?.days ?? []).filter((d) => d.date !== snapshot.date)]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, HISTORY_DAYS);
  return { days };
}
