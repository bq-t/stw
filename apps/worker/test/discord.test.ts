import { describe, expect, it } from 'vitest';
import type { DaySnapshot, Mission, VbucksHistory } from '@stw/shared';
import { buildDiscordMessage } from '../src/notify/discord';

const VBUCKS = 'AccountResource:currency_mtxswap';

function mission(i: number, vbucks: number): Mission {
  return {
    id: `m${i}`,
    zone: i % 2 ? 'twine-peaks' : 'canny-valley',
    missionType: 'fight-the-storm',
    missionGenerator: '',
    biome: '',
    powerLevel: 40 + i,
    difficultyRow: '',
    tileIndex: i,
    alertKind: 'mini-boss',
    alertRewards: vbucks
      ? [
          { itemId: VBUCKS, quantity: vbucks, isVbucks: true },
          { itemId: 'AccountResource:reagent_c_t01', quantity: 10, isVbucks: false },
        ]
      : [],
    baseRewards: [],
    isGroup: false,
  };
}

function day(vbucksMissions: number): DaySnapshot {
  const missions = [
    ...Array.from({ length: vbucksMissions }, (_, i) => mission(i, 50)),
    mission(99, 0),
  ];
  return {
    date: '2026-11-06',
    fetchedAt: '2026-11-06T00:01:00.000Z',
    expiresAt: '2026-11-07T00:00:00.000Z',
    missions,
    vbucksTotal: vbucksMissions * 50,
  };
}

const history: VbucksHistory = {
  days: [
    { date: '2026-11-05', total: 80, missions: 1 },
    { date: '2026-11-01', total: 50, missions: 1 },
  ],
};
const opts = { siteUrl: 'https://stw.example/' };

/** Every component in the tree, nested ones included (Discord counts them all). */
function count(components: unknown[]): number {
  let n = 0;
  for (const c of components as Record<string, unknown>[]) {
    n += 1;
    if (Array.isArray(c.components)) n += count(c.components);
    if (c.accessory) n += 1;
  }
  return n;
}

/** All text display contents in the tree, joined. */
function texts(components: unknown[]): string {
  const out: string[] = [];
  for (const c of components as Record<string, unknown>[]) {
    if (typeof c.content === 'string') out.push(c.content);
    if (Array.isArray(c.components)) out.push(texts(c.components));
  }
  return out.join('\n');
}

describe('buildDiscordMessage', () => {
  it('lists V-Bucks missions in an orange card with stats and buttons', () => {
    const msg = buildDiscordMessage(day(2), history, opts);
    expect(msg.flags).toBe(1 << 15);
    const card = msg.components[0] as { accent_color: number; components: unknown[] };
    expect(card.accent_color).toBe(0xee8a2c);
    const t = texts(msg.components);
    expect(t).toContain('100 V-Bucks today');
    expect(t).toContain('Yesterday **80**');
    expect(t).toContain('7 days **230**');
    expect(t).toContain('Fight the Storm');
    expect(JSON.stringify(msg)).toContain('https://stw.example/pve?alert=vbucks');
    expect(JSON.stringify(msg)).not.toContain('example//');
  });

  it('says there are no V-Bucks and when they were last seen', () => {
    const msg = buildDiscordMessage(day(0), history, opts);
    const card = msg.components[0] as { accent_color: number };
    expect(card.accent_color).toBe(0x3fa9ff);
    const t = texts(msg.components);
    expect(t).toContain('No V-Bucks today');
    // Last V-Bucks day as a Discord timestamp: 2026-11-05 00:00 UTC.
    expect(t).toContain(`**80** <t:${Date.UTC(2026, 10, 5) / 1000}:R>`);
  });

  it('groups missions by zone in unlock order and takes the banner from the lowest power', () => {
    const snapshot = day(0);
    const m = (id: number, zone: Mission['zone'], pl: number) => ({
      ...mission(id, 50),
      zone,
      powerLevel: pl,
    });
    snapshot.missions = [m(1, 'twine-peaks', 100), m(2, 'plankerton', 30), m(3, 'plankerton', 20)];
    snapshot.vbucksTotal = 150;
    const msg = buildDiscordMessage(snapshot, history, opts);
    const t = texts(msg.components);
    expect(t).toContain('3 missions  ·  Plankerton  ·  Twine Peaks');
    expect(t.indexOf(' 20  ·')).toBeLessThan(t.indexOf(' 30  ·'));
    expect(t.indexOf(' 30  ·')).toBeLessThan(t.indexOf(' 100  ·'));
    expect(JSON.stringify(msg)).toContain('/images/discord/zones/plankerton.webp');
  });

  it('stays within Discord limits on a day with many V-Bucks missions', () => {
    const msg = buildDiscordMessage(day(20), history, opts);
    expect(count(msg.components)).toBeLessThanOrEqual(40);
    expect(texts(msg.components)).toContain('more on the site');
    const textLength = texts(msg.components).length;
    expect(textLength).toBeLessThan(4000);
  });
});
