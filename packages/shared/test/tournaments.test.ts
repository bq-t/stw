import { describe, expect, it } from 'vitest';
import { currentEvents, parseCalendar } from '../src/events';
import { parseStwCatalog } from '../src/shop';
import { extractTournamentNames, parseTournaments, upcomingSessions } from '../src/tournaments';

// Shapes copied from the real 2026-11-10 responses (fixtures/, not committed), trimmed.

const NOW = Date.parse('2026-11-10T12:00:00Z');

const window = (id: string, begin: string, extra: Record<string, unknown> = {}) => ({
  eventWindowId: id,
  beginTime: begin,
  endTime: new Date(Date.parse(begin) + 3 * 3600_000).toISOString(),
  visibility: 'public',
  isTBD: false,
  additionalRequirements: ['mfa'],
  ...extra,
});

const eventsRaw = {
  events: [
    {
      eventId: 'epicgames_S43_RankedCupSolo_EU',
      displayDataId: 's43_ranked_solo_br',
      regions: ['EU'],
      metadata: { tournamentType: 'RankedCup', minimumAccountLevel: 50 },
      eventWindows: [
        window('S43_RankedCupSolo_Event1_EU', '2026-11-03T18:00:00Z'),
        window('S43_RankedCupSolo_Event3_EU', '2026-11-17T18:00:00Z'),
        window('S43_RankedCupSolo_Event2_EU', '2026-11-10T18:00:00Z'),
        window('Hidden', '2026-11-11T18:00:00Z', { visibility: 'locked' }),
        window('Tbd', '2026-11-12T18:00:00Z', { isTBD: true }),
      ],
    },
    {
      eventId: 'epicgames_S43_ZoroCup_Mobile_EU',
      displayDataId: 's43_zoro_mobile',
      regions: ['EU'],
      metadata: { tournamentType: 'ShopCup' },
      eventWindows: [
        window('Zoro_Mobile', '2026-11-10T13:00:00Z', {
          additionalRequirements: ['mfa', 'input-touch'],
        }),
      ],
    },
    {
      eventId: 'epicgames_Past_EU',
      displayDataId: 'past',
      regions: ['EU'],
      eventWindows: [window('Past', '2026-11-01T18:00:00Z')],
    },
    {
      eventId: 'epicgames_S43_RankedCupSolo_NAC',
      displayDataId: 's43_ranked_solo_br',
      regions: ['NAC'],
      eventWindows: [window('NAC', '2026-11-10T23:00:00Z')],
    },
  ],
};

describe('parseTournaments', () => {
  const list = parseTournaments(eventsRaw, 'EU', NOW);

  it('keeps the region, public sessions that have not ended, earliest first', () => {
    expect(list.map((t) => t.eventId)).toEqual([
      'epicgames_S43_ZoroCup_Mobile_EU',
      'epicgames_S43_RankedCupSolo_EU',
    ]);
    expect(list[1]!.windows.map((w) => w.id)).toEqual([
      'S43_RankedCupSolo_Event2_EU',
      'S43_RankedCupSolo_Event3_EU',
    ]);
    expect(list[1]).toMatchObject({ type: 'RankedCup', minLevel: 50, region: 'EU' });
  });

  it('marks touch-only cups as mobile', () => {
    expect(list[0]!.mobile).toBe(true);
    expect(list[1]!.mobile).toBeUndefined();
  });

  it('lists sessions across tournaments in time order', () => {
    expect(upcomingSessions(list, NOW).map((s) => s.window.id)).toEqual([
      'Zoro_Mobile',
      'S43_RankedCupSolo_Event2_EU',
      'S43_RankedCupSolo_Event3_EU',
    ]);
  });
});

describe('extractTournamentNames', () => {
  const page = JSON.stringify({
    s43RankedSoloBr: {
      tournament_info: {
        title_line_1: 'Solo Ranked Cup',
        details_description: 'A "quoted" text with } and {',
        tournament_display_id: 's43_ranked_solo_br',
        title_line_2: 'Battle Royale',
        long_format_title: 'Solo Ranked Cup',
        square_poster_image: 'https://cdn/poster.jpg',
      },
    },
    other: { tournament_info: { tournament_display_id: 'other', title_line_1: 'Other' } },
  });

  it('cuts out only the ids asked for', () => {
    expect(extractTournamentNames(page, ['s43_ranked_solo_br', 'missing'])).toEqual({
      s43_ranked_solo_br: {
        title: 'Solo Ranked Cup',
        subtitle: 'Battle Royale',
        poster: 'https://cdn/poster.jpg',
      },
    });
  });
});

describe('calendar and events', () => {
  const raw = {
    channels: {
      'client-events': {
        states: [
          {
            validFrom: '2026-11-10T11:00:00Z',
            state: {
              seasonNumber: 43,
              seasonEnd: '2026-12-12T14:00:00Z',
              stwEventStoreEnd: '2026-11-19T00:00:00.000Z',
              stwWeeklyStoreEnd: '2026-11-12T00:00:00.000Z',
              activeEvents: [
                {
                  eventType: 'EventFlag.Event_S43_TreasureHuntQuests',
                  eventStart: '2026-11-01T14:00:00Z',
                  eventEnd: '2026-12-05T19:00:00Z',
                },
                {
                  eventType: 'EventFlag.Event_Unknown',
                  eventStart: '2026-11-01T14:00:00Z',
                  eventEnd: '2026-12-05T19:00:00Z',
                },
              ],
            },
          },
          { validFrom: '2026-11-10T13:00:00Z', state: { activeEvents: [] } },
        ],
      },
    },
  };

  it('reads the state in force and shows only known flags', () => {
    const cal = parseCalendar(raw, NOW);
    expect(cal.flags).toHaveLength(2);
    const events = currentEvents(cal, NOW, { en: 'Fortnitemares', ru: 'Fortnitemares' });
    expect(events.map((e) => e.id)).toEqual([
      'stw-weekly',
      'stw-event',
      'EventFlag.Event_S43_TreasureHuntQuests',
      'season',
    ]);
    expect(events[2]!.name.ru).toBe('Охота за сокровищами');
    expect(events[3]!.name.en).toBe('Season 43');
    expect(events[1]!.name.en).toBe('Fortnitemares');
  });

  it('names the STW event after its llama', () => {
    const shop = parseStwCatalog(
      {
        storefronts: [
          {
            name: 'CardPackStoreGameplay',
            catalogEntries: [
              {
                title: 'Mini Reward Llama',
                prices: [{ currencySubType: 'AccountResource:voucher_basicpack' }],
              },
              {
                title: 'Fortnitemares Llama',
                prices: [{ currencySubType: 'AccountResource:eventcurrency_candy' }],
              },
            ],
          },
        ],
      },
      '2026-11-10',
    );
    expect(shop.eventName).toBe('Fortnitemares');
  });
});
