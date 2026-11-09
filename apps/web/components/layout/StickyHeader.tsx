'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Keeps the header on screen. At the top of the page it sits in the flow as usual; once the page
 * scrolls past it, it is pinned to the top and slides in from above (`.header-stuck` in globals.css).
 * It unpins only back at the very top, so it never flickers in between. The wrapper keeps the
 * header's height while it is pinned, so the page does not jump.
 */
export function StickyHeader({ children }: { children: React.ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | null>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    let frame = 0;
    let pinned: number | null = null;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      if (pinned === null) {
        const h = el.offsetHeight;
        if (y > h) {
          pinned = h;
          setHeight(h);
        }
      } else if (y <= 0) {
        pinned = null;
        setHeight(null);
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={wrap} style={height === null ? undefined : { height }}>
      <div className={height === null ? undefined : 'header-stuck'}>{children}</div>
    </div>
  );
}
