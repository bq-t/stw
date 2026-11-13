import type { PointerEvent } from 'react';

/**
 * Store-style cards (`.intro-card` in globals.css) tilt and shine towards the pointer through
 * CSS variables, with no re-render per move. Mouse only: a touch would leave the card tilted.
 */
export function tilt(e: PointerEvent<HTMLElement>) {
  if (e.pointerType !== 'mouse') return;
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width;
  const y = (e.clientY - r.top) / r.height;
  el.style.setProperty('--mx', x.toFixed(3));
  el.style.setProperty('--my', y.toFixed(3));
}

export function untilt(e: PointerEvent<HTMLElement>) {
  e.currentTarget.style.removeProperty('--mx');
  e.currentTarget.style.removeProperty('--my');
}
