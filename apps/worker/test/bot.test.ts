import { describe, expect, it } from 'vitest';
import type { DaySnapshot, Mission } from '@stw/shared';
import { missionFilters, missionsMessage } from '../src/bot/interactions';
import {
  buildStatusMessage,
  parseSummary,
  statusFingerprint,
  type RawSummary,
} from '../src/bot/status';
import { verifyDiscordRequest } from '../src/bot/verify';
import { COMMANDS } from '../src/bot/commands';
import { buildDiscordMessage } from '../src/notify/discord';
import summary from './statuspage-summary.json';

const hex = (b: ArrayBuffer) => Buffer.from(b).toString('hex');

describe('verifyDiscordRequest', () => {
  it('accepts a valid signature and rejects tampering', async () => {
    const pair = (await crypto.subtle.generateKey({ name: 'Ed25519' }, true, [
      'sign',
      'verify',
    ])) as CryptoKeyPair;
    const pub = hex((await crypto.subtle.exportKey('raw', pair.publicKey)) as ArrayBuffer);
    const body = '{"type":1}';
    const ts = '1762700000';
    const sig = hex(
      await crypto.subtle.sign(
        { name: 'Ed25519' },
        pair.privateKey,
        new TextEncoder().encode(ts + body),
      ),
    );
    expect(await verifyDiscordRequest(pub, sig, ts, body)).toBe(true);
    expect(await verifyDiscordRequest(pub, sig, ts, '{"type":2}')).toBe(false);
    expect(await verifyDiscordRequest(pub, sig, '1762700001', body)).toBe(false);
    expect(await verifyDiscordRequest(pub, null, ts, body)).toBe(false);
    expect(await verifyDiscordRequest(pub, 'zz', ts, body)).toBe(false);
  });
});

describe('Epic status', () => {
  it('reads the Fortnite group from a real summary and skips other products', () => {
    const s = parseSummary(summary as RawSummary);
    expect(s.components.map((c) => c.name)).toContain('Game Services');
    expect(s.components.length).toBeGreaterThan(3);
    // The fixture has an EOS maintenance: not Fortnite.
    expect(s.maintenances).toEqual([]);
    expect(s.indicator).toBe('none');
  });

  it('turns component problems into the indicator and changes the fingerprint', () => {
    const raw = structuredClone(summary) as RawSummary;
    const group = raw.components.find((c) => c.group && c.name === 'Fortnite')!;
    const mm = raw.components.find((c) => c.group_id === group.id && c.name === 'Matchmaking')!;
    const before = statusFingerprint(parseSummary(raw));
    mm.status = 'partial_outage';
    const s = parseSummary(raw);
    expect(s.indicator).toBe('minor');
    expect(statusFingerprint(s)).not.toBe(before);
    mm.status = 'major_outage';
    expect(parseSummary(raw).indicator).toBe('major');
  });

  it('builds a board in the requested language', () => {
    const s = parseSummary(summary as RawSummary);
    const ru = JSON.stringify(buildStatusMessage(s, Date.parse('2026-11-09T12:00:00Z'), 'ru'));
    expect(ru).toContain('Серверы Fortnite');
    expect(ru).toContain('status:refresh');
    expect(ru).toContain(`<t:${Date.parse('2026-11-09T12:00:00Z') / 1000}:R>`);
  });
});

function mission(i: number, over: Partial<Mission> = {}): Mission {
  return {
    id: `m${i}`,
    zone: 'twine-peaks',
    missionType: 'fight-the-storm',
    missionGenerator: '',
    biome: '',
    powerLevel: 100 + i,
    difficultyRow: '',
    tileIndex: i,
    alertKind: 'mini-boss',
    alertRewards: [{ itemId: 'AccountResource:reagent_c_t04', quantity: 30, isVbucks: false }],
    baseRewards: [],
    isGroup: false,
    ...over,
  };
}

describe('/missions', () => {
  it('maps options to filters, every alert by default', () => {
    expect(missionFilters(undefined)).toMatchObject({ zones: [], alert: 'alerts', rewards: [] });
    const f = missionFilters([
      { name: 'zone', type: 3, value: 'canny-valley' },
      { name: 'reward', type: 3, value: 'evo' },
      { name: 'pl_min', type: 4, value: 80 },
      { name: 'pl_max', type: 4, value: 40 },
      { name: 'alert', type: 3, value: 'nonsense' },
    ]);
    expect(f).toEqual({
      zones: ['canny-valley'],
      alert: 'alerts',
      rewards: ['evo'],
      plMin: 40,
      plMax: 80,
    });
  });

  it('lists matches with a tracker link in the user language', () => {
    const missions = [mission(1), mission(2, { zone: 'stonewood', powerLevel: 5 })];
    const msg = JSON.stringify(
      missionsMessage(
        missions,
        missionFilters([{ name: 'zone', type: 3, value: 'twine-peaks' }]),
        'ru',
        'https://stw.bq-t.pro',
      ),
    );
    expect(msg).toContain('1 миссия');
    expect(msg).toContain('**101**');
    expect(msg).not.toContain('**5**');
    expect(msg).toContain('https://stw.bq-t.pro/ru?zone=twine-peaks&alert=alerts');
  });
});

describe('localized V-Bucks card', () => {
  it('renders RU texts and /ru links', () => {
    const snapshot: DaySnapshot = {
      date: '2026-11-09',
      fetchedAt: '2026-11-09T00:01:00Z',
      expiresAt: '2026-11-10T00:00:00Z',
      missions: [
        mission(1, {
          alertRewards: [
            { itemId: 'AccountResource:currency_mtxswap', quantity: 50, isVbucks: true },
          ],
        }),
      ],
      vbucksTotal: 50,
    };
    const msg = JSON.stringify(
      buildDiscordMessage(snapshot, null, { siteUrl: 'https://stw.bq-t.pro', locale: 'ru' }),
    );
    expect(msg).toContain('50 V-Bucks сегодня');
    expect(msg).toContain('1 миссия');
    expect(msg).toContain('https://stw.bq-t.pro/ru?alert=vbucks');
    expect(msg).toContain('https://stw.bq-t.pro/ru/faq');
  });
});

describe('command definitions', () => {
  it('fit Discord limits', () => {
    const walk = (o: {
      name: string;
      description: string;
      description_localizations?: { ru: string };
      options?: unknown[];
      choices?: unknown[];
    }) => {
      expect(o.name).toMatch(/^[a-z0-9_-]{1,32}$/);
      expect(o.description.length).toBeLessThanOrEqual(100);
      expect(o.description_localizations?.ru.length ?? 0).toBeLessThanOrEqual(100);
      expect((o.choices ?? []).length).toBeLessThanOrEqual(25);
      for (const c of (o.options ?? []) as Parameters<typeof walk>[0][]) walk(c);
    };
    for (const c of COMMANDS) walk(c);
  });
});

describe('emoji sets', () => {
  it('the channel post keeps server emoji, the bot uses application emoji', async () => {
    const app = (await import('../src/bot/app-emojis.json')).default;
    const snapshot: DaySnapshot = {
      date: '2026-11-09',
      fetchedAt: '2026-11-09T00:01:00Z',
      expiresAt: '2026-11-10T00:00:00Z',
      missions: [
        mission(1, {
          alertRewards: [
            { itemId: 'AccountResource:currency_mtxswap', quantity: 50, isVbucks: true },
          ],
        }),
      ],
      vbucksTotal: 50,
    };
    const site = { siteUrl: 'https://stw.bq-t.pro' };
    const channel = JSON.stringify(buildDiscordMessage(snapshot, null, site));
    const bot = JSON.stringify(buildDiscordMessage(snapshot, null, { ...site, emojis: app }));
    expect(channel).toContain('<:powerlevel:1569264880299802724>');
    expect(bot).toContain(app.power);
    expect(bot).toContain(app.vbucks);
    expect(bot).not.toContain('1569264880299802724');
  });
});

describe('subscriptions', () => {
  const DROP = 'AccountResource:reagent_c_t01';

  it('maps /subscribe options and describes the filter in both languages', async () => {
    const { subscriptionFilter } = await import('../src/bot/interactions');
    const { describeFilter } = await import('../src/bot/subscriptions');
    const f = subscriptionFilter([
      { name: 'item', type: 3, value: DROP },
      { name: 'min', type: 4, value: 30 },
      { name: 'zone', type: 3, value: 'twine-peaks' },
      { name: 'pl_min', type: 4, value: 100 },
    ]);
    expect(f).toMatchObject({ item: DROP, minQty: 30, zones: ['twine-peaks'], plMin: 100 });
    expect(describeFilter(f, 'en')).toBe('Pure Drop of Rain ≥ 30 · Twine Peaks · PL 100–160');
    expect(describeFilter(f, 'ru')).toContain('Чистая капля дождя ≥ 30');
    expect(subscriptionFilter([{ name: 'item', type: 3, value: 'Hack:x' }])).not.toHaveProperty(
      'item',
    );
    expect(describeFilter(subscriptionFilter(undefined), 'en')).toBe('Any alert');
  });

  it('builds the notification only from matching missions', async () => {
    const { notificationMessage } = await import('../src/bot/subscriptions');
    const { parseSubscriptionFilter } = await import('@stw/shared');
    const snapshot: DaySnapshot = {
      date: '2026-11-09',
      fetchedAt: '2026-11-09T00:01:00Z',
      expiresAt: '2026-11-10T00:00:00Z',
      missions: [
        mission(1, { alertRewards: [{ itemId: DROP, quantity: 35, isVbucks: false }] }),
        mission(2, { alertRewards: [{ itemId: DROP, quantity: 10, isVbucks: false }] }),
      ],
      vbucksTotal: 0,
    };
    const f = parseSubscriptionFilter({ item: DROP, minQty: 30 })!;
    const { found, message } = notificationMessage(f, snapshot, 'en', 'https://stw.bq-t.pro');
    expect(found).toBe(1);
    const json = JSON.stringify(message);
    expect(json).toContain('Pure Drop of Rain ×35');
    expect(json).not.toContain('×10');
  });

  it('lists subscriptions with delete buttons, five per row', async () => {
    const { subscriptionList } = await import('../src/bot/interactions');
    const rows = Array.from({ length: 7 }, (_, n) => ({
      id: 100 + n,
      owner_type: 'user' as const,
      owner_id: 'u',
      target: 'dm' as const,
      target_id: 'u',
      dm_channel_id: null,
      filter: JSON.stringify({ item: DROP, minQty: 30 }),
      locale: 'en',
      created_at: 0,
      checked_date: null,
      last_sent_at: null,
      last_error: n === 0 ? 'cannot DM this user' : null,
    }));
    const list = subscriptionList(rows, 'user', 'en');
    expect(list.components).toHaveLength(2);
    expect(JSON.stringify(list.components)).toContain('sub:del:106');
    expect(list.content).toContain('cannot DM this user');
    expect(subscriptionList([], 'guild', 'ru').content).toContain('/setup alerts');
  });

  it('every command fits 25 options', () => {
    const count = (o: object): void => {
      const opts = (o as { options?: object[] }).options ?? [];
      expect(opts.length).toBeLessThanOrEqual(25);
      for (const c of opts) count(c);
    };
    for (const c of COMMANDS) count(c);
  });
});
