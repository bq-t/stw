import { describe, expect, it } from 'vitest';
import { HISTORY_DAYS, addToHistory } from '../src/history';
import { msUntilRotation, nextRotation, rotationDay } from '../src/time';
import type { DaySnapshot } from '../src/types';

function snap(date: string, total: number): DaySnapshot {
  return {
    date,
    fetchedAt: `${date}T00:05:00.000Z`,
    expiresAt: '',
    missions: total
      ? [
          {
            id: 'x',
            zone: 'plankerton',
            missionType: '',
            missionGenerator: '',
            biome: '',
            powerLevel: 30,
            difficultyRow: '',
            tileIndex: 1,
            alertKind: 'mini-boss',
            alertRewards: [
              { itemId: 'AccountResource:currency_mtxswap', quantity: total, isVbucks: true },
            ],
            baseRewards: [],
            isGroup: false,
          },
        ]
      : [],
    vbucksTotal: total,
  };
}

describe('addToHistory', () => {
  it('adds newest first and replaces the same day', () => {
    let h = addToHistory(null, snap('2026-11-01', 50));
    h = addToHistory(h, snap('2026-11-02', 0));
    h = addToHistory(h, snap('2026-11-02', 80));
    expect(h.days).toEqual([
      { date: '2026-11-02', total: 80, missions: 1 },
      { date: '2026-11-01', total: 50, missions: 1 },
    ]);
  });

  it('keeps only the last 30 days', () => {
    let h = addToHistory(null, snap('2026-01-01', 1));
    for (let i = 1; i <= 40; i++) {
      const d = new Date(Date.UTC(2026, 0, 1 + i)).toISOString().slice(0, 10);
      h = addToHistory(h, snap(d, i));
    }
    expect(h.days).toHaveLength(HISTORY_DAYS);
    expect(h.days[0]?.date).toBe('2026-02-10');
  });
});

describe('rotation time', () => {
  it('uses the UTC day, not the local one', () => {
    // 02:30 in Moscow on Nov 5 is still Nov 4 in UTC.
    const now = new Date('2026-11-04T23:30:00Z');
    expect(rotationDay(now)).toBe('2026-11-04');
    expect(nextRotation(now).toISOString()).toBe('2026-11-05T00:00:00.000Z');
    expect(msUntilRotation(now)).toBe(30 * 60 * 1000);
  });

  it('exactly at midnight the next rotation is a day later', () => {
    const now = new Date('2026-11-05T00:00:00Z');
    expect(nextRotation(now).toISOString()).toBe('2026-11-06T00:00:00.000Z');
  });
});
