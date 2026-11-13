'use client';

import { useSyncExternalStore } from 'react';

/**
 * Big game data files in public/ (item icon index, item names) loaded once per tab on first use,
 * so they stay out of the page bundle. Returns null until loaded (and on the server).
 */
const cache = new Map<string, { data: unknown; loading: boolean; listeners: Set<() => void> }>();

function entry(url: string) {
  let e = cache.get(url);
  if (!e) {
    e = { data: null, loading: false, listeners: new Set() };
    cache.set(url, e);
  }
  return e;
}

export function useLazyJson<T>(url: string): T | null {
  return useSyncExternalStore(
    (cb) => {
      const e = entry(url);
      e.listeners.add(cb);
      if (!e.loading) {
        e.loading = true;
        fetch(url)
          .then((r) => (r.ok ? r.json() : {}))
          .catch(() => ({}))
          .then((data) => {
            e.data = data;
            e.listeners.forEach((l) => l());
          });
      }
      return () => e.listeners.delete(cb);
    },
    () => entry(url).data as T | null,
    () => null,
  );
}
