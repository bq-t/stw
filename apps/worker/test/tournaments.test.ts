import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Tournament, TournamentNames } from '@stw/shared';
import type { Db, ReminderRow } from '../src/db';
import { deliverReminders } from '../src/bot/reminders';
import {
  findSession,
  offsetsMessage,
  pickerMessage,
  reminderRows,
  tournamentsPage,
} from '../src/bot/tournaments';

const NOW = Date.parse('2026-11-10T12:00:00Z');

const cup: Tournament = {
  eventId: 'epicgames_S43_RankedCupSolo_EU',
  displayId: 's43_ranked_solo_br',
  region: 'EU',
  windows: [
    {
      id: 'S43_RankedCupSolo_Event2_EU',
      begin: '2026-11-10T18:00:00Z',
      end: '2026-11-10T21:00:00Z',
    },
    {
      id: 'S43_RankedCupSolo_Event3_EU',
      begin: '2026-11-17T18:00:00Z',
      end: '2026-11-17T21:00:00Z',
    },
    {
      id: 'S43_RankedCupSolo_Event4_EU',
      begin: '2026-11-24T18:00:00Z',
      end: '2026-11-24T21:00:00Z',
    },
  ],
};
const names: TournamentNames = {
  en: { s43_ranked_solo_br: { title: 'Solo Ranked Cup', subtitle: 'Battle Royale' } },
  ru: { s43_ranked_solo_br: { title: 'Рейтинговый кубок для одиночек' } },
};

describe('tournament messages', () => {
  it('board lists sessions of the next week with a remind button', () => {
    const page = JSON.stringify(tournamentsPage('EU', [cup], names, 'ru', 'https://s', NOW));
    expect(page).toContain('Рейтинговый кубок для одиночек');
    expect(page).toContain('<t:1794333600:F>');
    expect(page).not.toContain('Event4'); // two weeks away
    expect(page).toContain('"custom_id":"tr:pick:EU"');
    expect(page).toContain('/ru/events?tab=tournaments&region=EU');
  });

  it('picker offers upcoming sessions; offsets carry everything in custom_ids', () => {
    const picker = pickerMessage('EU', [cup], names, 'en', NOW);
    const options = (picker.components[0] as { components: { options: { value: string }[] }[] })
      .components[0]!.options;
    expect(options.map((o) => o.value)).toHaveLength(3);
    const session = findSession([cup], 'S43_RankedCupSolo_Event2_EU')!;
    const msg = JSON.stringify(offsetsMessage('EU', session, names, 'en', true));
    expect(msg).toContain('tr:add:EU:1:30:S43_RankedCupSolo_Event2_EU');
    expect(msg).toContain('tr:all:EU:0:S43_RankedCupSolo_Event2_EU');
  });

  it('"all sessions" creates a reminder per later session', () => {
    const session = findSession([cup], 'S43_RankedCupSolo_Event3_EU')!;
    const rows = reminderRows('u', 'EU', session, 60, true, 'ru', NOW);
    expect(rows.map((r) => r.window_id)).toEqual([
      'S43_RankedCupSolo_Event3_EU',
      'S43_RankedCupSolo_Event4_EU',
    ]);
    expect(rows[0]!.remind_at).toBe(Date.parse('2026-11-17T17:00:00Z'));
    expect(reminderRows('u', 'EU', session, 60, false, 'ru', NOW)).toHaveLength(1);
  });
});

describe('deliverReminders', () => {
  afterEach(() => vi.unstubAllGlobals());

  const row = (over: Partial<ReminderRow>): ReminderRow => ({
    id: 1,
    user_id: 'u',
    region: 'EU',
    event_id: cup.eventId,
    window_id: 'S43_RankedCupSolo_Event2_EU',
    display_id: cup.displayId,
    begin_at: Date.parse('2026-11-10T18:00:00Z'),
    offset_min: 30,
    remind_at: Date.parse('2026-11-10T17:30:00Z'),
    locale: 'en',
    created_at: 0,
    ...over,
  });

  function fakeDb(rows: ReminderRow[], begin = cup.windows[0]!.begin) {
    const removed: number[] = [];
    const moved: [number, number][] = [];
    const feeds: Record<string, unknown> = {
      tournaments_EU: { tournaments: [{ ...cup, windows: [{ ...cup.windows[0]!, begin }] }] },
      tournament_names: names,
    };
    const db = {
      dueReminders: async () => rows,
      removeReminder: async (id: number) => void removed.push(id),
      rescheduleReminder: async (id: number, b: number) => void moved.push([id, b]),
      getDmChannel: async () => 'dm1',
      setDmChannel: async () => undefined,
      getServiceStatus: async (id: string) =>
        feeds[id]
          ? { id, fingerprint: '', json: JSON.stringify(feeds[id]), checked_at: 0, changed_at: 0 }
          : null,
    };
    return { db: db as unknown as Db, removed, moved };
  }

  it('DMs a due reminder and deletes it', async () => {
    const sent: string[] = [];
    vi.stubGlobal('fetch', async (url: string, init: RequestInit) => {
      sent.push(`${init.method} ${url.replace('https://discord.com/api/v10', '')} ${init.body}`);
      return Response.json({ id: 'm' });
    });
    const { db, removed } = fakeDb([row({})]);
    const used = await deliverReminders('t', db, Date.parse('2026-11-10T17:31:00Z'), 10);
    expect(used).toBe(1);
    expect(sent[0]).toContain('POST /channels/dm1/messages');
    expect(sent[0]).toContain('Solo Ranked Cup · Battle Royale');
    expect(removed).toEqual([1]);
  });

  it('reschedules when Epic moved the session later', async () => {
    vi.stubGlobal('fetch', async () => Response.json({ id: 'm' }));
    const { db, removed, moved } = fakeDb([row({})], '2026-11-10T20:00:00Z');
    const used = await deliverReminders('t', db, Date.parse('2026-11-10T17:31:00Z'), 10);
    expect(used).toBe(0);
    expect(moved).toEqual([[1, Date.parse('2026-11-10T20:00:00Z')]]);
    expect(removed).toEqual([]);
  });

  it('drops a reminder for a session that already started', async () => {
    const { db, removed } = fakeDb([row({})]);
    expect(await deliverReminders('t', db, Date.parse('2026-11-10T18:05:00Z'), 10)).toBe(0);
    expect(removed).toEqual([1]);
  });
});
