'use client';

// BR shop filters. "New / first release" and the item types live in the URL (?only=new&type=
// outfit,backpack), like the tracker filters; the LEGO switch is a per-browser preference
// (localStorage), read through useSyncExternalStore so the static HTML renders without it.

import type { BrShopItem } from '@stw/shared';
import { useSearchParams } from 'next/navigation';
import { useMemo, useSyncExternalStore } from 'react';

export type BrOnly = 'new' | 'first' | 'leaving';

export interface BrFilters {
  /** Only offers new in the shop today, cosmetics new to the game, or offers leaving today. */
  only: BrOnly | null;
  /** `typeKey`s to show; empty = every type. */
  types: string[];
}

export const NO_BR_FILTERS: BrFilters = { only: null, types: [] };

/** Types in the menu, in this order; other types the shop has come after them. */
export const TYPE_ORDER = [
  'outfit',
  'backpack',
  'pickaxe',
  'glider',
  'emote',
  'wrap',
  'contrail',
  'shoe',
  'sidekick',
  'wheel',
  'bundle',
  'track',
];

export function brFiltersFromParams(p: URLSearchParams): BrFilters {
  const only = p.get('only');
  return {
    only: only === 'new' || only === 'first' || only === 'leaving' ? only : null,
    types: (p.get('type') ?? '').split(',').filter((x) => /^[a-z]{1,30}$/.test(x)),
  };
}

export function brFiltersToParams(f: BrFilters): URLSearchParams {
  const p = new URLSearchParams();
  if (f.only) p.set('only', f.only);
  if (f.types.length) p.set('type', f.types.join(','));
  return p;
}

export const isDefaultBrFilters = (f: BrFilters) => !f.only && !f.types.length;

/** Offers saved before format 3 have no typeKey: their localized type stands in. */
export const typeKeyOf = (item: BrShopItem) => item.typeKey ?? item.type;

const DAY_MS = 24 * 60 * 60 * 1000;

/** Its last day in the shop: it ends before the next reset (the shop day's end). */
export const isLeaving = (item: BrShopItem, date: string) =>
  Date.parse(item.outDate) < Date.parse(date) + DAY_MS;

/** Does the offer pass the filters? `date` is the shop day (YYYY-MM-DD). */
export function matchesBrFilters(item: BrShopItem, f: BrFilters, date: string): boolean {
  if (f.only === 'new' && item.inDate.slice(0, 10) !== date) return false;
  if (f.only === 'first' && !item.firstRelease) return false;
  if (f.only === 'leaving' && !isLeaving(item, date)) return false;
  if (f.types.length && !f.types.includes(typeKeyOf(item))) return false;
  return true;
}

/**
 * Filters from the URL and their setter. The setter only changes the query string with the
 * native replaceState (see TrackerView: a router navigation would reload the EN pages).
 * Needs a Suspense boundary (useSearchParams in a static export).
 */
export function useBrFilters(): [BrFilters, (next: BrFilters) => void] {
  const search = useSearchParams();
  const filters = useMemo(() => brFiltersFromParams(new URLSearchParams(search)), [search]);
  const set = (next: BrFilters) => {
    const q = brFiltersToParams(next).toString();
    const { pathname, hash } = window.location;
    window.history.replaceState(null, '', `${pathname}${q ? `?${q}` : ''}${hash}`);
  };
  return [filters, set];
}

// LEGO looks: on unless turned off in this browser ------------------------------------------

const LEGO_KEY = 'stw.shop.lego';
const LEGO_EVENT = 'stw-shop-lego';

function readLego(): boolean {
  try {
    return localStorage.getItem(LEGO_KEY) !== 'off';
  } catch {
    return true;
  }
}

export function setShowLego(on: boolean) {
  try {
    if (on) localStorage.removeItem(LEGO_KEY);
    else localStorage.setItem(LEGO_KEY, 'off');
  } catch {
    // Private mode or blocked storage: the choice lasts until the page reloads.
    legoFallback = on;
  }
  window.dispatchEvent(new Event(LEGO_EVENT));
}

let legoFallback: boolean | null = null;

function subscribeLego(cb: () => void) {
  window.addEventListener('storage', cb);
  window.addEventListener(LEGO_EVENT, cb);
  return () => {
    window.removeEventListener('storage', cb);
    window.removeEventListener(LEGO_EVENT, cb);
  };
}

/** Whether tiles show the LEGO look among their looks. True in the static HTML. */
export function useShowLego(): boolean {
  return useSyncExternalStore(
    subscribeLego,
    () => legoFallback ?? readLego(),
    () => true,
  );
}

/** The looks a tile cycles through: main image, styles, then LEGO when it is on. */
export function looksOf(item: BrShopItem, lego: boolean): string[] {
  if (!item.image) return [];
  return [item.image, ...(item.looks ?? []), ...(lego && item.lego ? [item.lego] : [])];
}
