// Shops (Fishstick stage 4b): BR item shop from fortnite-api.com, STW storefronts from
// Epic's catalog, and the X-ray llama contents of a linked player. Raw responses are
// reduced here to the small types below; nothing else reads them.
// Checked 2026-11-10 against fixtures/br-shop.json, catalog.json, profile-campaign-preroll.json.

import { itemInfo, rarityOf, readableItemId } from './items';
import type { Rarity } from './types';

// ---------- BR ----------

export interface BrShopItem {
  offerId: string;
  /** Jam Tracks are sold by the hundred: the bot only counts them. */
  kind: 'bundle' | 'track' | 'item';
  name: string;
  /** "Outfit", "Bundle"… in the language the shop was fetched in (from fortnite-api). */
  type: string;
  /** fortnite-api rarity or series value: "epic", "marvel", "icon"… */
  rarity: string;
  image: string | null;
  price: number;
  regularPrice: number;
  /** Shop tile colours (hex without #), for the site's tile background. */
  colors: string[];
  /** Number of cosmetics in the offer (bundles have several). */
  count: number;
  inDate: string;
  outDate: string;
}

export interface BrShopSection {
  name: string;
  items: BrShopItem[];
}

export interface BrShop {
  /** Shop day, YYYY-MM-DD (resets at 00:00 UTC). */
  date: string;
  hash: string;
  sections: BrShopSection[];
}

/* eslint-disable @typescript-eslint/no-explicit-any -- raw third-party JSON, read defensively */
const str = (v: unknown): string | undefined => (typeof v === 'string' && v ? v : undefined);

function brItem(e: any): BrShopItem | null {
  const cosmetic = e.brItems?.[0] ?? e.cars?.[0] ?? e.instruments?.[0] ?? e.legoKits?.[0];
  const track = e.tracks?.[0];
  const name = str(e.bundle?.name) ?? str(cosmetic?.name) ?? str(track?.title);
  if (!name || typeof e.finalPrice !== 'number') return null;
  const image =
    str(e.bundle?.image) ??
    str(e.newDisplayAsset?.renderImages?.[0]?.image) ??
    str(cosmetic?.images?.featured) ??
    str(cosmetic?.images?.icon) ??
    str(cosmetic?.images?.large) ??
    str(track?.albumArt) ??
    null;
  const count =
    (e.brItems?.length ?? 0) +
    (e.cars?.length ?? 0) +
    (e.instruments?.length ?? 0) +
    (e.tracks?.length ?? 0) +
    (e.legoKits?.length ?? 0);
  const kind = e.bundle ? 'bundle' : track && !cosmetic ? 'track' : 'item';
  return {
    offerId: String(e.offerId ?? ''),
    kind,
    name: name.trim(),
    type:
      kind === 'bundle'
        ? (str(e.bundle.info) ?? 'Bundle')
        : (str(cosmetic?.type?.displayValue) ?? str(e.tracks?.[0]?.type) ?? ''),
    rarity: str(cosmetic?.rarity?.value) ?? 'common',
    image,
    price: e.finalPrice,
    regularPrice: typeof e.regularPrice === 'number' ? e.regularPrice : e.finalPrice,
    colors: Object.values(e.colors ?? {}).filter((c): c is string => typeof c === 'string'),
    count: Math.max(count, 1),
    inDate: String(e.inDate ?? ''),
    outDate: String(e.outDate ?? ''),
  };
}

/** fortnite-api.com /v2/shop → sections in the game's order. */
export function parseBrShop(raw: unknown): BrShop {
  const data = (raw as any)?.data;
  if (!data || !Array.isArray(data.entries)) throw new Error('BR shop: no data.entries');
  type Group = { index: number; items: { item: BrShopItem; p: number }[] };
  const sections = new Map<string, Group>();
  for (const e of data.entries) {
    const item = brItem(e);
    if (!item) continue;
    const name = str(e.layout?.name)?.trim() ?? 'Other';
    const index = typeof e.layout?.index === 'number' ? e.layout.index : 1000;
    const s: Group = sections.get(name) ?? { index, items: [] };
    s.index = Math.min(s.index, index);
    s.items.push({ item, p: typeof e.sortPriority === 'number' ? e.sortPriority : 0 });
    sections.set(name, s);
  }
  return {
    date: String(data.date ?? '').slice(0, 10),
    hash: String(data.hash ?? ''),
    sections: [...sections.entries()]
      .sort((a, b) => a[1].index - b[1].index)
      .map(([name, s]) => ({
        name,
        items: s.items.sort((a, b) => b.p - a.p).map((x) => x.item),
      })),
  };
}

// ---------- STW ----------

export type StwCurrency = 'gold' | 'xray' | 'candy' | 'voucher' | 'other';

export interface StwOffer {
  offerId: string;
  name: string;
  templateId: string;
  quantity: number;
  rarity?: Rarity;
  price: number;
  currency: StwCurrency;
  /** Purchases allowed per week / day / event (-1 or missing = no limit). */
  weeklyLimit?: number;
  dailyLimit?: number;
  eventLimit?: number;
}

export interface StwShop {
  /** Day the catalog was read, YYYY-MM-DD. */
  date: string;
  /** Weekly gold shop. */
  weekly: StwOffer[];
  /** Event gold shop. */
  event: StwOffer[];
  /** X-ray llamas: contents are personal (StwLlama). */
  llamas: StwOffer[];
}

const CURRENCIES: Record<string, StwCurrency> = {
  'AccountResource:eventcurrency_scaling': 'gold',
  'AccountResource:currency_xrayllama': 'xray',
  'AccountResource:eventcurrency_candy': 'candy',
};

function currencyOf(id: string): StwCurrency {
  return CURRENCIES[id] ?? (id.includes('voucher') ? 'voucher' : 'other');
}

const DEFENDER_WEAPON: Record<string, { en: string; ru: string }> = {
  pistol: { en: 'Pistol', ru: 'с пистолетом' },
  assault: { en: 'Assault', ru: 'с автоматом' },
  shotgun: { en: 'Shotgun', ru: 'с дробовиком' },
  sniper: { en: 'Sniper', ru: 'со снайперской винтовкой' },
  melee: { en: 'Melee', ru: 'ближнего боя' },
};

/**
 * Display name of an STW item ID, for offers and llama contents. Known resources come
 * from the item catalog; survivors, defenders and choice packs get a generic name;
 * the rest a readable form of the ID (heroes and schematics are named in the catalog
 * offers themselves).
 */
export function stwItemName(templateId: string): { en: string; ru: string } {
  const known = itemInfo(templateId)?.name;
  if (known) return known;
  const [type = '', id = ''] = templateId.toLowerCase().split(':');
  if (type === 'worker')
    return id.startsWith('manager')
      ? { en: 'Lead Survivor', ru: 'Лидер выживших' }
      : { en: 'Survivor', ru: 'Выживший' };
  if (type === 'defender') {
    const w = DEFENDER_WEAPON[/^did_defender([a-z]+)/.exec(id)?.[1] ?? ''];
    return w
      ? { en: `${w.en} Defender`, ru: `Защитник ${w.ru}` }
      : { en: 'Defender', ru: 'Защитник' };
  }
  if (type === 'cardpack' && id.includes('choice'))
    return { en: 'Choice of one', ru: 'Один на выбор' };
  // Schematics: "sid_edged_sword_light_r_ore_t01" → "Edged Sword Light" (rarity, material and
  // tier are shown separately).
  const readable = readableItemId(
    type === 'schematic'
      ? templateId.replace(/_(c|uc|r|vr|sr|ur)(_(ore|crystal))?(_t\d\d)?$/i, '')
      : templateId,
  );
  return { en: readable, ru: readable };
}

const VIRTUAL = /^\[VIRTUAL\]\s*(\d+)\s*x\s*(.+?)\s+for\s+\d+\s/;

function offerName(e: any, templateId: string): string {
  const fromTitle = str(e.title);
  if (fromTitle) return fromTitle;
  const m = VIRTUAL.exec(String(e.devName ?? ''));
  const name = m?.[2]?.trim().replace(/\s{2,}/g, ' ');
  // Some devNames carry an item ID instead of a name ("workerbasic_vr_t01").
  if (name && !/^[a-z0-9_]+$/.test(name)) return name;
  return stwItemName(templateId).en;
}

const limit = (v: unknown) => (typeof v === 'number' && v >= 0 ? v : undefined);

function stwOffer(e: any): StwOffer | null {
  const grant = e.itemGrants?.[0];
  const price = e.prices?.[0];
  if (!grant || !price) return null;
  const templateId = String(grant.templateId ?? '');
  const meta = e.meta ?? {};
  const eventLimit = Number(meta.EventLimit);
  return {
    offerId: String(e.offerId ?? ''),
    name: offerName(e, templateId),
    templateId,
    quantity: typeof grant.quantity === 'number' ? grant.quantity : 1,
    rarity: rarityOf(templateId),
    price: typeof price.finalPrice === 'number' ? price.finalPrice : 0,
    currency: currencyOf(String(price.currencySubType || price.currencyType || '')),
    weeklyLimit: limit(e.weeklyLimit),
    dailyLimit: limit(e.dailyLimit),
    eventLimit: Number.isFinite(eventLimit) && eventLimit > 0 ? eventLimit : undefined,
  };
}

/** Epic storefront/v2/catalog (any account) → the STW storefronts. */
export function parseStwCatalog(raw: unknown, date: string): StwShop {
  const fronts = (raw as any)?.storefronts;
  if (!Array.isArray(fronts)) throw new Error('catalog: no storefronts');
  const offers = (name: string) =>
    (fronts.find((f: any) => f?.name === name)?.catalogEntries ?? [])
      .map(stwOffer)
      .filter((o: StwOffer | null): o is StwOffer => o !== null);
  return {
    date,
    weekly: offers('STWRotationalEventStorefront'),
    event: offers('STWSpecialEventStorefront'),
    llamas: offers('CardPackStorePreroll'),
  };
}

/**
 * X-ray llamas to show: the store lists the Upgrade Llama several times (for X-ray tickets,
 * for a voucher, a first free one, linked offers). One per name, the X-ray ticket price first.
 */
export function uniqueLlamas<T extends { name?: string; currency?: StwCurrency; price?: number }>(
  llamas: T[],
): T[] {
  const rank = (l: T) => (l.currency === 'xray' && (l.price ?? 0) > 0 ? 0 : 1);
  const best = new Map<string, T>();
  for (const l of llamas) {
    const key = l.name ?? '';
    const prev = best.get(key);
    if (!prev || rank(l) < rank(prev)) best.set(key, l);
  }
  return llamas.filter((l) => best.get(l.name ?? '') === l);
}

// ---------- X-ray llama contents (linked player) ----------

export interface LlamaItem {
  templateId: string;
  quantity: number;
  rarity?: Rarity;
  /** Choice packs ("pick one of"): the options. */
  options?: LlamaItem[];
}

export interface StwLlama {
  offerId: string;
  /** From the catalog when the offer is listed there. */
  name?: string;
  price?: number;
  currency?: StwCurrency;
  items: LlamaItem[];
  expiresAt: string;
}

function llamaItem(x: any): LlamaItem {
  const templateId = String(x?.itemType ?? '');
  const options = x?.attributes?.options;
  return {
    templateId,
    quantity: typeof x?.quantity === 'number' ? x.quantity : 1,
    rarity: rarityOf(templateId),
    ...(Array.isArray(options) && options.length ? { options: options.map(llamaItem) } : {}),
  };
}

/** The JSON object starting at `start` (string-aware brace matching). */
function objectAt(text: string, start: number): string | null {
  let depth = 0;
  let inString = false;
  for (let i = start; i < text.length; i++) {
    const ch = text.charCodeAt(i);
    if (inString) {
      if (ch === 92 /* \ */) i++;
      else if (ch === 34 /* " */) inString = false;
    } else if (ch === 34) inString = true;
    else if (ch === 123 /* { */) depth++;
    else if (ch === 125 /* } */ && --depth === 0) return text.slice(start, i + 1);
  }
  return null;
}

/**
 * PrerollData items of a campaign profile response, given as text. A veteran's profile
 * is megabytes: instead of parsing all of it (CPU time), only the PrerollData objects are
 * cut out and parsed.
 */
export function parsePrerolls(profileText: string, catalog?: StwShop, now = Date.now()) {
  const byOffer = new Map((catalog?.llamas ?? []).map((o) => [o.offerId, o]));
  const llamas: StwLlama[] = [];
  const marker = /"templateId"\s*:\s*"PrerollData:/g;
  for (let m = marker.exec(profileText); m; m = marker.exec(profileText)) {
    const open = profileText.lastIndexOf('{', m.index);
    const json = open >= 0 ? objectAt(profileText, open) : null;
    if (!json) continue;
    let item: any;
    try {
      item = JSON.parse(json);
    } catch {
      continue;
    }
    const a = item?.attributes;
    if (!a || !Array.isArray(a.items)) continue;
    const expiresAt = String(a.expiration ?? '');
    if (expiresAt && Date.parse(expiresAt) <= now) continue;
    const offerId = String(a.offerId ?? '');
    const offer = byOffer.get(offerId);
    // Rolls for offers the store does not list (hidden or retired) are not for sale.
    if (catalog && !offer) continue;
    llamas.push({
      offerId,
      name: offer?.name,
      price: offer?.price,
      currency: offer?.currency,
      items: a.items.map(llamaItem),
      expiresAt,
    });
  }
  return catalog ? uniqueLlamas(llamas) : llamas;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/** Short stable hash (FNV-1a, hex) for board fingerprints. */
export function fingerprintOf(value: unknown): string {
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}
