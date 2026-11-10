import { afterEach, describe, expect, it, vi } from 'vitest';
import type { BrShop, StwShop } from '@stw/shared';
import type { BoardKind, BoardRow, Db } from '../src/db';
import { postBoard, updateBoards, type BoardSource } from '../src/bot/boards';
import { brShopPages, llamasMessage, nextReset, stwShopPages } from '../src/bot/shop';

const NOW = Date.parse('2026-11-10T12:00:00Z');

// ---------- shop pages stay within Discord's limits ----------

/** All text of a message and the number of components (nested ones count too). */
function measure(page: Record<string, unknown>) {
  let text = 0;
  let components = 0;
  const walk = (c: Record<string, unknown>) => {
    components++;
    if (typeof c.content === 'string') text += c.content.length;
    for (const item of (c.items as { description?: string }[] | undefined) ?? [])
      text += item.description?.length ?? 0;
    for (const child of (c.components as Record<string, unknown>[] | undefined) ?? []) walk(child);
  };
  for (const c of page.components as Record<string, unknown>[]) walk(c);
  return { text, components };
}

function bigBrShop(): BrShop {
  const item = (n: number, section: number) => ({
    offerId: `o${section}-${n}`,
    kind: section === 99 ? ('track' as const) : ('item' as const),
    name: `A rather long cosmetic name ${section}-${n}`,
    type: 'Outfit',
    rarity: 'epic',
    image: `https://cdn/${section}-${n}.png`,
    price: 1500,
    regularPrice: 1500,
    colors: [],
    count: 1,
    inDate: n % 3 ? '2026-11-01T00:00:00Z' : '2026-11-10T00:00:00Z',
    outDate: '2026-11-12T23:59:59Z',
  });
  return {
    date: '2026-11-10',
    hash: 'h',
    sections: [
      ...Array.from({ length: 30 }, (_, s) => ({
        name: `Section ${s}`,
        items: Array.from({ length: 12 }, (_, n) => item(n, s)),
      })),
      { name: 'Jam Tracks', items: Array.from({ length: 116 }, (_, n) => item(n, 99)) },
    ],
  };
}

describe('shop pages', () => {
  it('BR: at most 4 messages, each within 4000 characters and 40 components', () => {
    const pages = brShopPages(bigBrShop(), 'en', 'https://stw.bq-t.pro', NOW, '<:vbucks:1>');
    expect(pages.length).toBeLessThanOrEqual(4);
    for (const p of pages) {
      const m = measure(p);
      expect(m.text).toBeLessThanOrEqual(4000);
      expect(m.components).toBeLessThanOrEqual(40);
    }
    const all = JSON.stringify(pages);
    expect(all).toContain('And ');
    expect(all).toContain('Jam Tracks: 116');
    expect(all).not.toContain('99-5');
  });

  it('BR: gallery shows up to 10 of the items new today', () => {
    const pages = brShopPages(bigBrShop(), 'ru', 'https://stw.bq-t.pro', NOW);
    const gallery = JSON.stringify(pages[0]).match(/"media"/g) ?? [];
    expect(gallery).toHaveLength(10);
    expect(JSON.stringify(pages.at(-1))).toContain('/ru/shop?tab=br');
    expect(JSON.stringify(pages[0])).not.toContain('·  ');
  });

  const stw: StwShop = {
    date: '2026-11-10',
    weekly: Array.from({ length: 16 }, (_, n) => ({
      offerId: `w${n}`,
      name: 'Pure Drop of Rain',
      templateId: 'AccountResource:reagent_c_t01',
      quantity: 10,
      price: 50,
      currency: 'gold',
      weeklyLimit: 10,
    })),
    event: Array.from({ length: 24 }, (_, n) => ({
      offerId: `e${n}`,
      name: 'Copper Plasmatic Discharger',
      templateId: 'Schematic:sid_x_sr_ore_t01',
      quantity: 1,
      price: 1680,
      currency: 'gold',
      eventLimit: 1,
    })),
    llamas: [
      {
        offerId: 'u',
        name: 'Upgrade Llama',
        templateId: 'CardPack:cardpack_bronze',
        quantity: 1,
        price: 50,
        currency: 'xray',
      },
    ],
  };

  it('STW: one message within the limits, resource names translated', () => {
    const pages = stwShopPages(stw, 'ru', 'https://stw.bq-t.pro');
    expect(pages).toHaveLength(1);
    expect(measure(pages[0]!).text).toBeLessThanOrEqual(4000);
    const text = JSON.stringify(pages[0]);
    expect(text).not.toContain('Pure Drop of Rain');
    expect(text).toContain('10 в неделю');
    expect(text).toContain('Upgrade Llama');
  });

  it('llamas: contents with choice options', () => {
    const msg = llamasMessage(
      [
        {
          offerId: 'm',
          name: 'Super Melee Llama',
          price: 1000,
          currency: 'xray',
          expiresAt: '2026-11-11T00:00:00Z',
          items: [
            { templateId: 'Worker:workerbasic_uc_t01', quantity: 1, rarity: 'uncommon' },
            {
              templateId: 'CardPack:cardpack_choice_melee_sr',
              quantity: 1,
              rarity: 'legendary',
              options: [
                {
                  templateId: 'Schematic:sid_edged_sword_light_sr_ore_t01',
                  quantity: 1,
                  rarity: 'legendary',
                },
              ],
            },
          ],
        },
      ],
      'en',
      'https://stw.bq-t.pro',
      NOW,
    );
    const text = JSON.stringify(msg);
    expect(text).toContain('Survivor (Uncommon)');
    expect(text).toContain('Choice of one (Legendary), one of:');
    expect(text).toContain('Edged Sword Light (Legendary)');
  });

  it('next reset is the coming 00:00 UTC', () => {
    expect(new Date(nextReset(NOW)).toISOString()).toBe('2026-11-11T00:00:00.000Z');
  });
});

// ---------- board engine ----------

class FakeDb {
  rows = new Map<string, BoardRow>();
  key = (g: string, k: BoardKind) => `${g}|${k}`;
  getBoard = async (g: string, k: BoardKind) => this.rows.get(this.key(g, k)) ?? null;
  saveBoard = async (r: BoardRow) => void this.rows.set(this.key(r.guild_id, r.kind), { ...r });
  deleteBoard = async (g: string, k: BoardKind) => void this.rows.delete(this.key(g, k));
  staleBoards = async (k: BoardKind, fp: string, limit: number) =>
    [...this.rows.values()].filter((r) => r.kind === k && r.fingerprint !== fp).slice(0, limit);
}

/** Discord stub: records calls; POST returns a new id; ids in `gone` answer 10008. */
function stubDiscord(gone: string[] = []) {
  const calls: string[] = [];
  let next = 100;
  vi.stubGlobal('fetch', async (url: string, init: RequestInit) => {
    const path = url.replace('https://discord.com/api/v10', '');
    calls.push(`${init.method} ${path}`);
    if (gone.some((id) => path.endsWith(`/${id}`)))
      return new Response(JSON.stringify({ code: 10008, message: 'Unknown Message' }), {
        status: 404,
      });
    if (init.method === 'POST') return Response.json({ id: String(next++) });
    if (init.method === 'DELETE') return new Response(null, { status: 204 });
    return Response.json({});
  });
  return calls;
}

const source = (pages: number, fingerprint = 'fp2'): BoardSource => ({
  kind: 'shop_br',
  fingerprint,
  pages: (locale) => Array.from({ length: pages }, (_, n) => ({ content: `${locale} ${n}` })),
});

const row = (ids: string[], fingerprint = 'fp1'): BoardRow => ({
  guild_id: 'g',
  kind: 'shop_br',
  channel_id: 'c',
  message_ids: JSON.stringify(ids),
  locale: 'ru',
  fingerprint,
  updated_at: 0,
});

afterEach(() => vi.unstubAllGlobals());

describe('updateBoards', () => {
  it('edits pages in place and posts the missing ones at the end', async () => {
    const db = new FakeDb();
    await db.saveBoard(row(['1']));
    const calls = stubDiscord();
    const used = await updateBoards('t', db as unknown as Db, [source(2)], NOW, 10);
    expect(calls).toEqual(['PATCH /channels/c/messages/1', 'POST /channels/c/messages']);
    expect(used).toBe(2);
    const saved = (await db.getBoard('g', 'shop_br'))!;
    expect(JSON.parse(saved.message_ids)).toEqual(['1', '100']);
    expect(saved.fingerprint).toBe('fp2');
  });

  it('deletes pages that are no longer needed', async () => {
    const db = new FakeDb();
    await db.saveBoard(row(['1', '2', '3']));
    const calls = stubDiscord();
    await updateBoards('t', db as unknown as Db, [source(1)], NOW, 10);
    expect(calls).toEqual([
      'PATCH /channels/c/messages/1',
      'DELETE /channels/c/messages/2',
      'DELETE /channels/c/messages/3',
    ]);
    expect(JSON.parse((await db.getBoard('g', 'shop_br'))!.message_ids)).toEqual(['1']);
  });

  it('forgets a board whose message was deleted', async () => {
    const db = new FakeDb();
    await db.saveBoard(row(['1']));
    stubDiscord(['1']);
    await updateBoards('t', db as unknown as Db, [source(1)], NOW, 10);
    expect(await db.getBoard('g', 'shop_br')).toBeNull();
  });

  it('stops before the budget runs out and leaves the rest for the next run', async () => {
    const db = new FakeDb();
    await db.saveBoard(row(['1', '2']));
    await db.saveBoard({ ...row(['5', '6']), guild_id: 'h' });
    const calls = stubDiscord();
    const used = await updateBoards('t', db as unknown as Db, [source(2)], NOW, 3);
    expect(used).toBe(2);
    expect(calls).toHaveLength(2);
    expect((await db.getBoard('h', 'shop_br'))!.fingerprint).toBe('fp1');
  });

  it('skips up-to-date boards', async () => {
    const db = new FakeDb();
    await db.saveBoard(row(['1'], 'fp2'));
    const calls = stubDiscord();
    expect(await updateBoards('t', db as unknown as Db, [source(1)], NOW, 10)).toBe(0);
    expect(calls).toEqual([]);
  });
});

describe('postBoard', () => {
  it('posts every page and removes the previous board of that kind', async () => {
    const db = new FakeDb();
    await db.saveBoard({ ...row(['7']), channel_id: 'old' });
    const calls = stubDiscord();
    await postBoard('t', db as unknown as Db, 'g', 'c', 'en', source(2), NOW);
    expect(calls).toEqual([
      'POST /channels/c/messages',
      'POST /channels/c/messages',
      'DELETE /channels/old/messages/7',
    ]);
    const saved = (await db.getBoard('g', 'shop_br'))!;
    expect(saved).toMatchObject({ channel_id: 'c', locale: 'en', fingerprint: 'fp2' });
    expect(JSON.parse(saved.message_ids)).toEqual(['100', '101']);
  });
});
