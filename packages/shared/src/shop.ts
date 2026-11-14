// Shops (Fishstick stage 4b): BR item shop from fortnite-api.com, STW storefronts from
// Epic's catalog, and the X-ray llama contents of a linked player. Raw responses are
// reduced here to the small types below; nothing else reads them.
// Checked 2026-11-10 against fixtures/br-shop.json, catalog.json, profile-campaign-preroll.json.

import { itemInfo, rarityOf, readableItemId, gameItemName, type GameNames } from './items';

// What an item is (kind, hero class, weapon) lives with the item catalog, which picks icons by
// it; the shop code and its users import it from here as before.
export {
  stwItemInfo,
  type StwHeroClass,
  type StwItemInfo,
  type StwItemKind,
  type StwWeapon,
} from './items';
import type { Rarity } from './types';

// ---------- BR ----------

export interface BrShopItem {
  offerId: string;
  /** Jam Tracks are sold by the hundred: the bot only counts them. */
  kind: 'bundle' | 'track' | 'item';
  name: string;
  /** "Outfit", "Bundle"… in the language the shop was fetched in (from fortnite-api). */
  type: string;
  /**
   * The same in any language, for filters: fortnite-api's type value ("outfit", "backpack",
   * "pickaxe"…), "bundle" or "track".
   */
  typeKey: string;
  /** fortnite-api rarity or series value: "epic", "marvel", "icon"… */
  rarity: string;
  image: string | null;
  price: number;
  regularPrice: number;
  /** Shop tile colours (hex without #), for the site's tile background. */
  colors: string[];
  /** The game's tile colours by role (hex without #): background, its light, the name's band. */
  tile?: { base?: string; light?: string; text?: string };
  /** A cosmetic in it is new to the game (added in the last week), not a return. */
  firstRelease?: boolean;
  /** Number of cosmetics in the offer (bundles have several). */
  count: number;
  inDate: string;
  outDate: string;
  /** What else the cosmetics in it have: selectable styles, a built-in emote. */
  extras?: BrExtra[];
  /** The game's note on the offer ("Backbling is reactive to eliminations!"). */
  offerTag?: string;
  /** YouTube id of the cosmetic's showcase video. */
  video?: string;
  /**
   * More looks of it, shown in turn after the main image: its other styles (the game's extra
   * Battle Royale renders).
   */
  looks?: string[];
  /** The LEGO look (shown after the styles; the site can turn it off). */
  lego?: string;
}

export type BrExtra = 'styles' | 'emote';

export interface BrShopSection {
  name: string;
  /**
   * The game's group of sections ("Start Your Engines" holds one section per car), or null for a
   * section of its own. Sections of a group come one after another.
   */
  category?: string | null;
  items: BrShopItem[];
}

/**
 * Bumped when the stored BR shop changes shape or order: the Worker fetches today's shop again.
 * 2: bundles first, sections without a layout left out, categories (shops saved before had "Other").
 * 3: `typeKey`, the LEGO look apart from the styles (`lego`).
 */
export const BR_SHOP_FORMAT = 3;

export interface BrShop {
  /** Shop day, YYYY-MM-DD (resets at 00:00 UTC). Stays the first field (see refreshShops). */
  date: string;
  /** BR_SHOP_FORMAT the shop was parsed with; the second field. */
  format?: number;
  hash: string;
  sections: BrShopSection[];
}

/* eslint-disable @typescript-eslint/no-explicit-any -- raw third-party JSON, read defensively */
const str = (v: unknown): string | undefined => (typeof v === 'string' && v ? v : undefined);

function brExtras(e: any): BrExtra[] {
  const found = new Set<BrExtra>();
  for (const c of e.brItems ?? []) {
    // "Reactivity" variants are not styles to pick; the offer tag tells what reacts.
    if ((c.variants ?? []).some((v: any) => !/reactiv/i.test(String(v?.type ?? ''))))
      found.add('styles');
    if (Array.isArray(c.builtInEmoteIds) && c.builtInEmoteIds.length) found.add('emote');
  }
  return (['styles', 'emote'] as const).filter((x) => found.has(x));
}

/**
 * Styles (extra Battle Royale renders, `Product.BR`, in the game's order) without the main
 * image, and the LEGO look (`Product.Juno`, or the cosmetic's LEGO image).
 */
function brLooks(e: any, cosmetic: any, main: string | null) {
  const renders: any[] = e.newDisplayAsset?.renderImages ?? [];
  const styles = renders
    .filter((r) => r?.productTag === 'Product.BR')
    .map((r) => str(r?.image))
    .filter((u): u is string => u !== undefined && u !== main);
  const lego =
    str(renders.find((r) => r?.productTag === 'Product.Juno')?.image) ??
    (e.bundle ? undefined : str(cosmetic?.images?.lego?.large));
  return { looks: [...new Set(styles)], lego: lego !== main ? lego : undefined };
}

/** Cosmetics added to the game this long before the shop day count as new content. */
const NEW_CONTENT_MS = 7 * 24 * 60 * 60 * 1000;

const hex = (v: unknown) => (typeof v === 'string' && v ? v.slice(0, 6) : undefined);

function brItem(e: any, day?: string): BrShopItem | null {
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
    typeKey: kind === 'bundle' || kind === 'track' ? kind : (str(cosmetic?.type?.value) ?? 'other'),
    rarity: str(cosmetic?.rarity?.value) ?? 'common',
    image,
    price: e.finalPrice,
    regularPrice: typeof e.regularPrice === 'number' ? e.regularPrice : e.finalPrice,
    colors: Object.values(e.colors ?? {}).filter((c): c is string => typeof c === 'string'),
    count: Math.max(count, 1),
    inDate: String(e.inDate ?? ''),
    outDate: String(e.outDate ?? ''),
    extras: brExtras(e),
    offerTag: str(e.offerTag?.text)?.trim(),
    video: (e.brItems ?? []).map((c: any) => str(c?.showcaseVideo)).find(Boolean),
    ...brLooks(e, cosmetic, image),
    tile: {
      base: hex(e.colors?.color1),
      light: hex(e.colors?.color2) ?? hex(e.colors?.color3),
      text: hex(e.colors?.textBackgroundColor),
    },
    firstRelease:
      day !== undefined &&
      (e.brItems ?? []).some((c: any) => {
        const added = Date.parse(String(c?.added ?? ''));
        const shop = Date.parse(day);
        return Number.isFinite(added) && shop - added >= 0 && shop - added < NEW_CONTENT_MS;
      }),
  };
}

/**
 * fortnite-api.com /v2/shop → sections in the game's order: by the layout rank, highest first
 * (the layout index does not follow the game), sections of one category kept together where the
 * highest of them stands, bundles first, then offers by their sort priority (the API's order
 * breaks ties). Offers
 * without a layout are left out: single items of a bundle that the game does not show on their own.
 */
export function parseBrShop(raw: unknown): BrShop {
  const data = (raw as any)?.data;
  if (!data || !Array.isArray(data.entries)) throw new Error('BR shop: no data.entries');
  type Group = {
    rank: number;
    category: string | null;
    items: { item: BrShopItem; p: number }[];
  };
  const sections = new Map<string, Group>();
  const day = String(data.date ?? '').slice(0, 10) || undefined;
  for (const e of data.entries) {
    const name = str(e.layout?.name)?.trim();
    if (!name) continue;
    const item = brItem(e, day);
    if (!item) continue;
    const rank = typeof e.layout.rank === 'number' ? e.layout.rank : 0;
    const category = str(e.layout.category)?.trim() ?? null;
    const s: Group = sections.get(name) ?? { rank, category, items: [] };
    s.rank = Math.max(s.rank, rank);
    s.category ??= category;
    s.items.push({ item, p: typeof e.sortPriority === 'number' ? e.sortPriority : 0 });
    sections.set(name, s);
  }
  // A category stands where its highest section does.
  const categoryRank = new Map<string, number>();
  for (const s of sections.values())
    if (s.category)
      categoryRank.set(s.category, Math.max(categoryRank.get(s.category) ?? s.rank, s.rank));
  const place = (s: Group) => (s.category ? categoryRank.get(s.category)! : s.rank);
  return {
    date: String(data.date ?? '').slice(0, 10),
    format: BR_SHOP_FORMAT,
    hash: String(data.hash ?? ''),
    sections: [...sections.entries()]
      .sort((a, b) => place(b[1]) - place(a[1]) || b[1].rank - a[1].rank)
      .map(([name, s]) => ({
        name,
        category: s.category,
        // Bundles first (two-cell tiles on the site), then the game's sort priority.
        items: s.items
          .sort(
            (a, b) =>
              Number(b.item.kind === 'bundle') - Number(a.item.kind === 'bundle') || b.p - a.p,
          )
          .map((x) => x.item),
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
  /**
   * The running STW event, told by its llama bought with event currency (candy and the
   * like): "Fortnitemares Llama" → "Fortnitemares". EN only (the catalog has no RU titles).
   */
  eventName?: string;
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
export function stwItemName(
  templateId: string,
  names?: GameNames | null,
): { en: string; ru: string } {
  const known = itemInfo(templateId)?.name;
  if (known) return known;
  const [type = '', id = ''] = templateId.toLowerCase().split(':');
  // Survivors and defenders keep the generic name below ("Epic Survivor"), as the game shows them.
  if (type !== 'worker' && type !== 'defender') {
    const game = gameItemName(templateId, names);
    if (game) return game;
  }
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
  const eventLlama = (
    fronts.find((f: any) => f?.name === 'CardPackStoreGameplay')?.catalogEntries ?? []
  )
    .map((e: any) => ({
      title: str(e?.title),
      currency: String(e?.prices?.[0]?.currencySubType ?? ''),
    }))
    .find(
      (x: { title?: string; currency: string }) =>
        x.title &&
        x.currency.startsWith('AccountResource:eventcurrency_') &&
        x.currency !== 'AccountResource:eventcurrency_scaling',
    );
  const eventName = eventLlama?.title?.replace(/s*Llama$/i, '').trim();
  return {
    date,
    weekly: offers('STWRotationalEventStorefront'),
    event: offers('STWSpecialEventStorefront'),
    llamas: offers('CardPackStorePreroll'),
    ...(eventName ? { eventName } : {}),
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
