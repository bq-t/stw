// Shop messages of the bot: /shop replies and the shop boards (Components V2).
// BR: a gallery of today's new items and the sections as compact text (prices in V-Bucks),
// Jam Tracks only counted. STW: weekly and event gold shops, X-ray llama offers. The llama
// contents are personal (/llamas).

import {
  stwItemName,
  uniqueLlamas,
  type BrShop,
  type LlamaItem,
  type StwCurrency,
  type StwLlama,
  type StwOffer,
  type StwShop,
} from '@stw/shared';
import { itemInfo } from '@stw/shared/items';
import { fmt, messages, sitePath, type Locale } from '../i18n';
import type { BoardPage } from './boards';
import { FLAG_COMPONENTS_V2 } from './status';

const TEXT = 10;
const MEDIA_GALLERY = 12;
const SEPARATOR = 14;
const CONTAINER = 17;
const ACTION_ROW = 1;
const BUTTON = 2;
const BUTTON_LINK = 5;
const ORANGE = 0xf06c1e;
const GOLD = 0xf5c542;

/** Discord: 4000 characters of text per message; keep room for the header and links. */
const PAGE_TEXT = 3600;
const MAX_PAGES = 4;
const GALLERY_MAX = 10;
/** A section of Jam Tracks (its name is localized, so it is told by its items). */
const isTracks = (s: BrShop['sections'][number]) => s.items.every((i) => i.kind === 'track');

const unix = (ms: number) => Math.floor(ms / 1000);

/** Next shop reset: 00:00 UTC. */
export function nextReset(now: number): number {
  const d = new Date(now);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1);
}

const num = (n: number, locale: Locale) => n.toLocaleString(locale === 'ru' ? 'ru-RU' : 'en-US');

function page(accent: number, components: unknown[]): BoardPage {
  return {
    flags: FLAG_COMPONENTS_V2,
    components: [{ type: CONTAINER, accent_color: accent, components }],
    allowed_mentions: { parse: [] },
  };
}

function siteButton(siteUrl: string, locale: Locale, tab: 'br' | 'stw') {
  return {
    type: ACTION_ROW,
    components: [
      {
        type: BUTTON,
        style: BUTTON_LINK,
        label: messages(locale).Bot.shop.open,
        url: sitePath(siteUrl, locale, `/shop?tab=${tab}`),
      },
    ],
  };
}

// ---------- BR ----------

export function brShopPages(
  shop: BrShop,
  locale: Locale,
  siteUrl: string,
  now: number,
  vbucks = '',
): BoardPage[] {
  const t = messages(locale).Bot.shop;

  // Gallery: items that arrived today, else the first ones of the shop.
  const all = shop.sections.flatMap((s) => (isTracks(s) ? [] : s.items));
  const fresh = all.filter((i) => i.inDate.slice(0, 10) === shop.date);
  const gallery = (fresh.length ? fresh : all)
    .filter((i) => i.image)
    .slice(0, GALLERY_MAX)
    .map((i) => ({ media: { url: i.image! }, description: `${i.name} · ${i.price}` }));

  // Sections as text blocks: "**Section**\nName 800 · Name 1500".
  const blocks: string[] = [];
  let jam = 0;
  for (const s of shop.sections) {
    if (isTracks(s)) {
      jam += s.items.length;
      continue;
    }
    const items = s.items.map((i) => `${i.name} **${num(i.price, locale)}**`).join(' · ');
    blocks.push(`**${s.name}**\n${items}`);
  }
  const header = [
    `## ${t.brTitle}`,
    `-# ${fmt(t.resets, { time: `<t:${unix(nextReset(now))}:R>` })} · ${vbucks ? `${vbucks} ` : ''}${t.pricesVbucks}`,
    ...(jam ? [`-# ${fmt(t.jamTracks, { count: jam })}`] : []),
  ].join('\n');

  // Pack blocks into pages; whatever does not fit in MAX_PAGES goes to "and N more".
  const texts: string[][] = [[]];
  let size = 0;
  let left = 0;
  for (const [n, b] of blocks.entries()) {
    const block = b.length > PAGE_TEXT ? `${b.slice(0, PAGE_TEXT - 1)}…` : b;
    if (size + block.length > PAGE_TEXT) {
      if (texts.length === MAX_PAGES) {
        left = blocks.slice(n).reduce((sum, x) => sum + (x.split(' · ').length || 1), 0);
        break;
      }
      texts.push([]);
      size = 0;
    }
    texts[texts.length - 1]!.push(block);
    size += block.length + 2;
  }

  return texts.map((chunk, n) => {
    const parts: unknown[] = [];
    if (n === 0) {
      parts.push({ type: TEXT, content: header });
      if (gallery.length) parts.push({ type: MEDIA_GALLERY, items: gallery });
      parts.push({ type: SEPARATOR, divider: true, spacing: 1 });
    }
    parts.push({ type: TEXT, content: chunk.join('\n\n') || '—' });
    if (n === texts.length - 1) {
      if (left) parts.push({ type: TEXT, content: `-# ${fmt(t.more, { count: left })}` });
      parts.push(siteButton(siteUrl, locale, 'br'));
    }
    return page(ORANGE, parts);
  });
}

// ---------- STW ----------

function currency(c: StwCurrency | undefined, locale: Locale) {
  const t = messages(locale).Bot.shop;
  return c === 'gold' ? t.gold : c === 'xray' ? t.xray : c === 'candy' ? t.candy : t.voucher;
}

/** Item name in the user's language when we know it (resources), else the catalog name. */
export function offerName(o: Pick<StwOffer, 'name' | 'templateId'>, locale: Locale) {
  return itemInfo(o.templateId)?.name[locale] ?? o.name;
}

function offerLine(o: StwOffer, locale: Locale) {
  const t = messages(locale).Bot.shop;
  const qty = o.quantity > 1 ? `${num(o.quantity, locale)}× ` : '';
  const limits = [
    o.weeklyLimit !== undefined && fmt(t.perWeek, { n: o.weeklyLimit }),
    o.dailyLimit !== undefined && fmt(t.perDay, { n: o.dailyLimit }),
    o.eventLimit !== undefined && o.eventLimit > 1 && fmt(t.perEvent, { n: o.eventLimit }),
  ].filter(Boolean);
  return `${qty}${offerName(o, locale)} — **${num(o.price, locale)}** ${currency(o.currency, locale)}${
    limits.length ? ` · *${limits.join(', ')}*` : ''
  }`;
}

export function stwShopPages(shop: StwShop, locale: Locale, siteUrl: string): BoardPage[] {
  const t = messages(locale).Bot.shop;
  const section = (title: string, offers: StwOffer[]) =>
    offers.length ? `### ${title}\n${offers.map((o) => offerLine(o, locale)).join('\n')}` : '';
  const llamas = uniqueLlamas(shop.llamas);
  const parts: unknown[] = [
    { type: TEXT, content: `## ${t.stwTitle}` },
    { type: SEPARATOR, divider: true, spacing: 1 },
  ];
  for (const text of [section(t.weekly, shop.weekly), section(t.event, shop.event)])
    if (text) parts.push({ type: TEXT, content: text.slice(0, 1900) });
  if (llamas.length)
    parts.push({
      type: TEXT,
      content: `### ${t.llamas}\n${llamas
        .map((l) => `${l.name} — **${num(l.price, locale)}** ${currency(l.currency, locale)}`)
        .join('\n')}\n-# ${t.llamasNote}`,
    });
  parts.push(siteButton(siteUrl, locale, 'stw'));
  return [page(GOLD, parts)];
}

// ---------- /llamas ----------

function llamaItemLine(i: LlamaItem, locale: Locale): string {
  const t = messages(locale).Bot.shop;
  const rarity = i.rarity ? ` (${messages(locale).Rarity[i.rarity]})` : '';
  const qty = i.quantity > 1 ? `${num(i.quantity, locale)}× ` : '';
  const line = `${qty}${stwItemName(i.templateId)[locale]}${rarity}`;
  if (!i.options?.length) return `- ${line}`;
  return `- ${line}, ${t.choice}\n${i.options.map((o) => `  ${llamaItemLine(o, locale)}`).join('\n')}`;
}

export function llamasMessage(llamas: StwLlama[], locale: Locale, siteUrl: string, now: number) {
  const t = messages(locale).Bot.shop;
  const blocks = llamas.map(
    (l) =>
      `### ${l.name ?? t.llamas}${
        l.price !== undefined ? ` — ${num(l.price, locale)} ${currency(l.currency, locale)}` : ''
      }\n${l.items.map((i) => llamaItemLine(i, locale)).join('\n')}`,
  );
  return page(GOLD, [
    { type: TEXT, content: `## ${t.llamasTitle}` },
    {
      type: TEXT,
      content: (blocks.join('\n') || t.noLlamas).slice(0, 3600),
    },
    {
      type: TEXT,
      content: `-# ${fmt(t.refreshes, { time: `<t:${unix(nextReset(now))}:t>` })}`,
    },
    siteButton(siteUrl, locale, 'stw'),
  ]);
}
