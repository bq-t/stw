import { rotationDay, type DaySnapshot, type VbucksHistory } from '@stw/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

/** No API configured → the tracker runs on generated demo data (lib/demo.ts). */
export const IS_DEMO = API_URL === '';

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  return (await res.json()) as T;
}

export async function fetchMissions(): Promise<DaySnapshot> {
  if (IS_DEMO) return (await import('@stw/shared/demo')).demoSnapshot();
  return get<DaySnapshot>('/api/missions');
}

export async function fetchHistory(): Promise<VbucksHistory> {
  if (IS_DEMO) return (await import('@stw/shared/demo')).demoHistory();
  return get<VbucksHistory>('/api/history');
}

/** The Worker has not saved today's snapshot yet: the page shows yesterday's with a note. */
export function isStale(snapshot: DaySnapshot, now: Date = new Date()): boolean {
  return snapshot.date !== rotationDay(now);
}

/**
 * When to refetch: right after the rotation (+1 min for the Worker),
 * or every 5 minutes while the snapshot is stale.
 */
export function refetchDelay(snapshot: DaySnapshot | undefined, now: Date = new Date()): number {
  const FIVE_MIN = 5 * 60 * 1000;
  if (!snapshot || isStale(snapshot, now)) return FIVE_MIN;
  return Math.max(FIVE_MIN / 5, Date.parse(snapshot.expiresAt) - now.getTime() + 60 * 1000);
}
