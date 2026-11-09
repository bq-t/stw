'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

/** Show the bar only when a page takes longer than this, so instant transitions do not flash. */
const SHOW_AFTER_MS = 120;
/** Give up if the new page never arrives (e.g. the link was not a page). */
const GIVE_UP_MS = 10_000;

type Phase = 'idle' | 'loading' | 'done';

/**
 * Thin bar at the top of the screen while the next page loads (`.route-progress` in globals.css).
 * App Router has no navigation events, so it starts on a click on an internal link to another
 * page and finishes when the pathname changes.
 */
export function RouteProgress() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>('idle');
  const timers = useRef<number[]>([]);

  const clear = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  };

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }
      const a = (e.target as Element | null)?.closest?.('a');
      if (!a || !a.href || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      // Same page (only the hash or the query changes): no page load.
      if (url.pathname === window.location.pathname) return;
      clear();
      timers.current.push(
        window.setTimeout(() => setPhase('loading'), SHOW_AFTER_MS),
        window.setTimeout(() => setPhase('idle'), GIVE_UP_MS),
      );
    };
    document.addEventListener('click', onClick, true);
    return () => {
      document.removeEventListener('click', onClick, true);
      clear();
    };
  }, []);

  // New page is here: run the bar to the end and fade it out (state adjusted during render,
  // as React recommends for "reset on prop change")...
  const [shownPath, setShownPath] = useState(pathname);
  if (pathname !== shownPath) {
    setShownPath(pathname);
    setPhase((p) => (p === 'loading' ? 'done' : 'idle'));
  }
  // ...and drop pending timers, so a fast page does not show the bar after it arrived.
  useEffect(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }, [pathname]);

  useEffect(() => {
    if (phase !== 'done') return;
    const id = window.setTimeout(() => setPhase('idle'), 400);
    return () => window.clearTimeout(id);
  }, [phase]);

  if (phase === 'idle') return null;
  return <div aria-hidden className="route-progress" data-phase={phase} />;
}
