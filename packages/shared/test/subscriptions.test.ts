import { describe, expect, it } from 'vitest';
import { matchesSubscription, parseSubscriptionFilter } from '../src/subscriptions';
import type { Mission } from '../src/types';

const DROP = 'AccountResource:reagent_c_t01';
const SHARD = 'AccountResource:reagent_c_t04';

function mission(rewards: [string, number][], over: Partial<Mission> = {}): Mission {
  return {
    id: 'm',
    zone: 'twine-peaks',
    missionType: 'fight-the-storm',
    missionGenerator: '',
    biome: '',
    powerLevel: 108,
    difficultyRow: '',
    tileIndex: 1,
    alertKind: 'mini-boss',
    alertRewards: rewards.map(([itemId, quantity]) => ({
      itemId,
      quantity,
      isVbucks: itemId === 'AccountResource:currency_mtxswap',
    })),
    baseRewards: [],
    isGroup: false,
    ...over,
  };
}

describe('parseSubscriptionFilter', () => {
  it('fills defaults and drops junk', () => {
    expect(parseSubscriptionFilter({})).toEqual({
      zones: [],
      alert: 'alerts',
      rewards: [],
      plMin: 1,
      plMax: 160,
    });
    expect(
      parseSubscriptionFilter({
        zones: ['twine-peaks', 'mars'],
        alert: 'nope',
        rewards: ['evo', 1],
        plMin: 140,
        plMax: 100,
        item: DROP,
        minQty: 30,
      }),
    ).toEqual({
      zones: ['twine-peaks'],
      alert: 'alerts',
      rewards: ['evo'],
      plMin: 100,
      plMax: 140,
      item: DROP,
      minQty: 30,
    });
    expect(parseSubscriptionFilter({ item: 'x; drop table', minQty: 1.5 })).not.toHaveProperty(
      'item',
    );
    expect(parseSubscriptionFilter(null)).toBeNull();
    expect(parseSubscriptionFilter([])).toBeNull();
  });
});

describe('matchesSubscription', () => {
  const drops30 = parseSubscriptionFilter({ item: DROP, minQty: 30 })!;

  it('checks the exact item and its amount', () => {
    expect(matchesSubscription(mission([[DROP, 30]]), drops30)).toBe(true);
    expect(matchesSubscription(mission([[DROP, 29]]), drops30)).toBe(false);
    expect(matchesSubscription(mission([[SHARD, 50]]), drops30)).toBe(false);
  });

  it('keeps the tracker filters', () => {
    const f = parseSubscriptionFilter({ item: DROP, minQty: 30, zones: ['stonewood'] })!;
    expect(matchesSubscription(mission([[DROP, 40]]), f)).toBe(false);
    expect(
      matchesSubscription(mission([[DROP, 40]], { zone: 'stonewood', powerLevel: 9 }), f),
    ).toBe(true);
  });

  it('applies the minimum to a reward category', () => {
    const f = parseSubscriptionFilter({ rewards: ['evo'], minQty: 40 })!;
    expect(matchesSubscription(mission([[SHARD, 40]]), f)).toBe(true);
    expect(matchesSubscription(mission([[SHARD, 39]]), f)).toBe(false);
  });

  it('ignores event currency for "any reward >= N"', () => {
    const f = parseSubscriptionFilter({ minQty: 100 })!;
    expect(
      matchesSubscription(mission([['AccountResource:campaign_event_currency', 500]]), f),
    ).toBe(false);
    expect(matchesSubscription(mission([['AccountResource:currency_mtxswap', 100]]), f)).toBe(true);
  });
});
