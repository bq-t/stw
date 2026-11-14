'use client';

import { useEffect, useId, useRef, type Ref } from 'react';

/** Eye centres and pupil rest spots in the SVG's own units (same drawing as public/images/logo.svg). */
const EYES = [
  { cx: 28.5, cy: 33.4, px: 31.7, py: 36.4 },
  { cx: 240.4, cy: 31.7, px: 236.9, py: 34.7 },
] as const;
/** How far a pupil may leave the eye centre, in SVG units. */
const REACH = 10;
/** Pointer distance (px) at which the pupils reach their edge. */
const FULL_AT = 260;
/** Pupils widen as the pointer nears the Discord button: within this many px of it... */
const DILATE_RANGE = 200;
/** ...up to this much bigger (over the button itself). */
const DILATE = 0.8;
/** No pointer movement for this long: the eyes and the mouth go back to rest. */
const IDLE_MS = 1500;
/** Over the header fish itself: the pupils roll up and apart (unit directions per eye). */
const LOOK_UP = [
  { x: -0.45, y: -0.9 },
  { x: 0.45, y: -0.9 },
] as const;
/** Blinks: one every BLINK_MIN_MS..BLINK_MAX_MS, each this long, sometimes two in a row. */
const BLINK_MS = 170;
const BLINK_MIN_MS = 2500;
const BLINK_MAX_MS = 6000;
const DOUBLE_BLINK = 0.2;
/** A mouse or a pen: the eyes follow it and the mouth reacts. Not on touch screens. */
const followsPointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;
/** The fish itself: the header link, or its spot on the mode screen (the flying layer under it lets the pointer through). */
const isLogo = (target: EventTarget | null) =>
  target instanceof Element && target.closest('[data-header-logo], .intro-logo') !== null;

/*
 * Mouth shapes. Every outline is the same four cubic segments, left -> top -> right -> bottom ->
 * left, so any two can be blended point by point: the mouth morphs instead of swapping layers.
 * A shape is the start point plus 4 x (control 1, control 2, end) = 26 numbers.
 */
type Shape = number[];
const K = 0.5523; // circle-ish cubic

function ellipse(cx: number, cy: number, rx: number, ry: number): Shape {
  return [
    cx - rx,
    cy,
    cx - rx,
    cy - K * ry,
    cx - K * rx,
    cy - ry,
    cx,
    cy - ry,
    cx + K * rx,
    cy - ry,
    cx + rx,
    cy - K * ry,
    cx + rx,
    cy,
    cx + rx,
    cy + K * ry,
    cx + K * rx,
    cy + ry,
    cx,
    cy + ry,
    cx - K * rx,
    cy + ry,
    cx - rx,
    cy + K * ry,
    cx - rx,
    cy,
  ];
}

/** Thin lens from (x0, y0) to (x1, y1): its top edge passes ty and its bottom edge by mid-way. */
function lens(x0: number, y0: number, x1: number, y1: number, ty: number, by: number): Shape {
  const mx = (x0 + x1) / 2;
  const q = (x1 - x0) / 6;
  return [
    x0,
    y0,
    x0 + q,
    y0 + (ty - y0) * 0.6,
    mx - q,
    ty,
    mx,
    ty,
    mx + q,
    ty,
    x1 - q,
    y1 + (ty - y1) * 0.6,
    x1,
    y1,
    x1 - q,
    y1 + (by - y1) * 0.6,
    mx + q,
    by,
    mx,
    by,
    mx - q,
    by,
    x0 + q,
    y0 + (by - y0) * 0.6,
    x0,
    y0,
  ];
}

type Mood = 'rest' | 'o' | 'smile';
type Pose = { lips: Shape; inner: Shape; lipsStroke: number; innerStroke: number; shine: number };

const POSES: Record<Mood, Pose> = {
  // The logo as drawn: wide lips, a thin slit.
  rest: {
    lips: ellipse(135, 103, 68.5, 24.5),
    inner: lens(84, 104.6, 186, 104.2, 101.5, 107.7),
    lipsStroke: 1.2,
    innerStroke: 0,
    shine: 0,
  },
  // Over a mode card: a round "O", a little lower.
  o: {
    lips: ellipse(135, 108, 36.3, 23),
    inner: ellipse(135, 108, 23, 12),
    lipsStroke: 3,
    innerStroke: 2,
    shine: 0.75,
  },
  // Over the Discord button: a wide banana smile with a curved line.
  smile: {
    lips: [
      62, 96, 60, 85, 100, 91, 135, 91, 170, 91, 210, 85, 208, 96, 212, 111, 176, 132, 135, 132, 94,
      132, 58, 111, 62, 96,
    ],
    inner: lens(72, 99, 198, 99, 109, 113),
    lipsStroke: 1.5,
    innerStroke: 0,
    shine: 0,
  },
};

const MORPH_MS = 350;
/** Quick start, a small spring past the target at the end (ease-out "back"). */
function ease(t: number): number {
  const c = 1.2;
  return 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2;
}

function toPath(p: Shape): string {
  const n = p.map((v) => +v.toFixed(2));
  let d = `M${n[0]} ${n[1]}`;
  for (let i = 2; i < n.length; i += 6) d += `C${n.slice(i, i + 6).join(' ')}`;
  return `${d}Z`;
}

function blend(a: Pose, b: Pose, t: number): Pose {
  const mix = (x: number, y: number) => x + (y - x) * t;
  return {
    lips: a.lips.map((v, i) => mix(v, b.lips[i])),
    inner: a.inner.map((v, i) => mix(v, b.inner[i])),
    lipsStroke: Math.max(0, mix(a.lipsStroke, b.lipsStroke)),
    innerStroke: Math.max(0, mix(a.innerStroke, b.innerStroke)),
    shine: Math.min(1, Math.max(0, mix(a.shine, b.shine))),
  };
}

/** Anything one can click or type into. */
const INTERACTIVE =
  'a[href], button, input, select, textarea, label, summary, [role="button"], [role="tab"], [role="slider"], [tabindex]:not([tabindex="-1"])';

/**
 * What the pointer or focus is on: the Discord button, the login buttons (`data-fish-smile`) and
 * the fish itself make it smile, anything else one can interact with surprises it ("O"), except
 * the back-to-top button.
 */
function moodOf(target: EventTarget | null): Mood {
  if (!(target instanceof Element)) return 'rest';
  if (target.closest('.discord-fab, [data-fish-smile]') || isLogo(target)) return 'smile';
  if (target.closest('.scroll-top')) return 'rest';
  if (target.closest('.intro-card') || target.closest(INTERACTIVE)) return 'o';
  return 'rest';
}

/**
 * The fish logo drawn inline, so its parts can move: the pupils follow the pointer, and the
 * mouth morphs into an "O" over anything one can click and into a smile over the Discord button.
 * Over the fish itself it smiles and rolls its eyes up. After a few seconds without the pointer
 * moving, the eyes and the mouth settle back. Every few seconds it blinks.
 */
export function FishFace({ className, ref }: { className?: string; ref?: Ref<SVGSVGElement> }) {
  const svg = useRef<SVGSVGElement | null>(null);
  const pupils = useRef<(SVGGElement | null)[]>([]);
  const eyes = useRef<(SVGGElement | null)[]>([]);
  // Two faces can be on the page (intro and header): the gradient id must be their own.
  const holeFill = `fish-hole-${useId().replace(/[^\w-]/g, '')}`;
  const lips = useRef<SVGPathElement>(null);
  const inner = useRef<SVGPathElement>(null);
  const shine = useRef<SVGEllipseElement>(null);

  useEffect(() => {
    // Touch screens: no pointer to follow, and a tap would set the mouth off. Blinking stays.
    if (!followsPointer()) return;
    let mood: Mood = 'rest';
    let shown: Pose = POSES.rest;
    let frame = 0;
    const paint = (p: Pose) => {
      lips.current?.setAttribute('d', toPath(p.lips));
      lips.current?.setAttribute('stroke-width', p.lipsStroke.toFixed(2));
      inner.current?.setAttribute('d', toPath(p.inner));
      inner.current?.setAttribute('stroke-width', p.innerStroke.toFixed(2));
      shine.current?.setAttribute('opacity', p.shine.toFixed(2));
    };
    const go = (next: Mood) => {
      if (next === mood) return;
      mood = next;
      cancelAnimationFrame(frame);
      // Start from whatever is on screen, so a change mid-way does not jump.
      const from = shown;
      const to = POSES[next];
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        shown = to;
        paint(to);
        return;
      }
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / MORPH_MS);
        shown = blend(from, to, ease(t));
        paint(shown);
        if (t < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    };
    let idle = false;
    let timer = 0;
    const rest = () => {
      idle = true;
      go('rest');
    };
    const onOver = (e: Event) => go(moodOf(e.target));
    const onMove = (e: PointerEvent) => {
      window.clearTimeout(timer);
      timer = window.setTimeout(rest, IDLE_MS);
      if (idle) {
        // Woken up: pick the mood of whatever the pointer rests on again.
        idle = false;
        go(moodOf(e.target));
      }
    };
    document.addEventListener('pointerover', onOver);
    document.addEventListener('focusin', onOver);
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      document.removeEventListener('pointerover', onOver);
      document.removeEventListener('focusin', onOver);
      window.removeEventListener('pointermove', onMove);
      window.clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (!followsPointer()) return;
    let frame = 0;
    let timer = 0;
    let onLogo = false;
    let last: { x: number; y: number } | null = null;
    const settle = () => {
      pupils.current.forEach((p) => {
        if (!p) return;
        p.dataset.idle = '';
        p.style.removeProperty('transform');
      });
    };
    const draw = () => {
      frame = 0;
      const el = svg.current;
      if (!el || !last) return;
      pupils.current.forEach((p) => p && delete p.dataset.idle);
      const box = el.getBoundingClientRect();
      if (!box.width) return;
      const scale = box.width / 271;
      let near = 0;
      const fab = document.querySelector('.discord-fab');
      if (fab) {
        const b = fab.getBoundingClientRect();
        const gap = Math.hypot(
          Math.max(b.left - last.x, 0, last.x - b.right),
          Math.max(b.top - last.y, 0, last.y - b.bottom),
        );
        near = Math.max(0, 1 - gap / DILATE_RANGE);
      }
      const size = (onLogo ? 1.1 : 1 + DILATE * near).toFixed(3);
      EYES.forEach((eye, i) => {
        const dx = last!.x - (box.left + eye.cx * scale);
        const dy = last!.y - (box.top + eye.cy * scale);
        const dist = Math.hypot(dx, dy) || 1;
        const reach = onLogo ? REACH : REACH * Math.min(1, dist / FULL_AT);
        const dir = onLogo ? LOOK_UP[i]! : { x: dx / dist, y: dy / dist };
        const tx = eye.cx + dir.x * reach - eye.px;
        const ty = eye.cy + dir.y * reach - eye.py;
        pupils.current[i]?.style.setProperty(
          'transform',
          `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px) scale(${size})`,
        );
      });
    };
    const onMove = (e: PointerEvent) => {
      last = { x: e.clientX, y: e.clientY };
      onLogo = isLogo(e.target);
      if (!frame) frame = requestAnimationFrame(draw);
      window.clearTimeout(timer);
      timer = window.setTimeout(settle, IDLE_MS);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let timer = 0;
    const blink = () => {
      eyes.current.forEach((eye) =>
        eye?.animate(
          [
            { transform: 'scaleY(1)' },
            { transform: 'scaleY(0.08)', offset: 0.45 },
            { transform: 'scaleY(0.08)', offset: 0.55 },
            { transform: 'scaleY(1)' },
          ],
          { duration: BLINK_MS, easing: 'ease-in-out' },
        ),
      );
    };
    const schedule = () => {
      timer = window.setTimeout(
        () => {
          // A hidden tab has no one to blink at.
          if (!document.hidden) {
            blink();
            if (Math.random() < DOUBLE_BLINK) window.setTimeout(blink, BLINK_MS + 90);
          }
          schedule();
        },
        BLINK_MIN_MS + Math.random() * (BLINK_MAX_MS - BLINK_MIN_MS),
      );
    };
    schedule();
    return () => window.clearTimeout(timer);
  }, []);

  const setSvg = (el: SVGSVGElement | null) => {
    svg.current = el;
    if (typeof ref === 'function') ref(el);
    else if (ref) ref.current = el;
  };

  return (
    <svg
      ref={setSvg}
      viewBox="0 0 271 128"
      width={271}
      height={128}
      className={className}
      // The "O" and the smile reach a little below the drawing's box.
      overflow="visible"
      aria-hidden
    >
      <defs>
        <radialGradient id={holeFill} cx="0.5" cy="0.65" r="0.6">
          <stop offset="0" stopColor="#3a1a06" />
          <stop offset="1" stopColor="#0a0302" />
        </radialGradient>
      </defs>
      <g ref={(el) => void (eyes.current[0] = el)} className="fish-eye">
        <path
          d="M55.7 33C55.4 34.6 54.9 36.1 54.4 37.6C53.9 39 53.4 40.5 52.7 41.8C52.1 43.2 51.4 44.5 50.6 45.8C49.8 47 49 48.2 48.1 49.4C47.1 50.6 46.1 51.7 45.1 52.8C44 53.8 42.9 54.9 41.7 55.8C40.5 56.8 39.2 57.7 37.8 58.6C36.4 59.4 35 60.2 33.4 61C31.9 61.7 30.2 62.4 28.5 63C26.8 63.5 24.9 64.1 23 64.2C21.1 64.4 19.1 64.4 17.3 63.8C15.5 63.3 13.7 62.3 12.2 61.2C10.7 60 9.5 58.5 8.3 57.1C7.1 55.7 6 54.2 5.1 52.6C4.2 51.1 3.4 49.5 2.7 47.9C2.1 46.2 1.6 44.6 1.3 42.9C0.9 41.3 0.7 39.6 0.6 37.9C0.4 36.3 0.4 34.6 0.6 33C0.7 31.4 0.9 29.8 1.3 28.2C1.6 26.6 2.1 25.1 2.6 23.6C3.2 22.1 3.9 20.6 4.7 19.2C5.5 17.9 6.4 16.5 7.4 15.3C8.3 14 9.4 12.8 10.6 11.7C11.8 10.6 13 9.5 14.4 8.5C15.7 7.6 17.1 6.6 18.6 5.8C20.1 5.1 21.7 4.3 23.4 3.8C25 3.3 26.7 3 28.5 2.7C30.3 2.5 32.1 2.4 33.9 2.5C35.7 2.5 37.6 2.5 39.5 2.9C41.3 3.2 43.2 3.8 44.9 4.6C46.6 5.5 48.1 6.7 49.5 8C50.8 9.3 51.9 10.9 52.9 12.5C53.9 14.1 54.7 15.8 55.2 17.6C55.8 19.3 56.1 21.1 56.3 22.9C56.5 24.6 56.4 26.4 56.3 28.1C56.2 29.8 56 31.4 55.7 33Z"
          fill="#fff"
          stroke="#f4e6d2"
        />
        <g ref={(el) => void (pupils.current[0] = el)} className="fish-pupil">
          <circle cx="31.7" cy="36.4" r="6.8" fill="#060204" />
          <circle cx="28.8" cy="31.3" r="2.8" fill="#fff" />
        </g>
      </g>
      <g ref={(el) => void (eyes.current[1] = el)} className="fish-eye">
        <path
          d="M268.4 32C268.5 33.6 268.4 35.2 268.3 36.8C268.1 38.4 267.9 40 267.5 41.6C267.1 43.3 266.6 44.9 266 46.4C265.4 48 264.6 49.6 263.7 51.1C262.8 52.6 261.8 54.1 260.7 55.4C259.5 56.8 258.3 58.3 256.8 59.4C255.3 60.4 253.7 61.5 251.9 62C250.2 62.5 248.2 62.6 246.4 62.5C244.6 62.3 242.7 61.8 241 61.3C239.3 60.8 237.7 60.1 236.2 59.5C234.6 58.8 233.2 58.1 231.8 57.3C230.4 56.5 229.1 55.7 227.9 54.7C226.6 53.8 225.5 52.8 224.4 51.8C223.3 50.7 222.3 49.6 221.3 48.5C220.4 47.3 219.5 46.2 218.7 44.9C217.8 43.6 217.1 42.3 216.4 41C215.7 39.6 215.1 38.2 214.6 36.7C214 35.2 213.6 33.6 213.2 32C212.8 30.4 212.5 28.7 212.4 27C212.2 25.2 212.2 23.4 212.4 21.6C212.5 19.8 212.8 17.9 213.4 16.1C213.9 14.3 214.7 12.4 215.7 10.8C216.7 9.2 218 7.6 219.4 6.2C220.8 4.9 222.4 3.7 224.2 2.8C225.9 2 227.9 1.4 229.7 1.1C231.6 0.7 233.6 0.6 235.5 0.7C237.3 0.7 239.2 0.9 241 1.2C242.8 1.5 244.5 1.9 246.2 2.5C247.9 3.1 249.5 3.8 250.9 4.7C252.4 5.5 253.8 6.5 255.2 7.5C256.5 8.5 257.7 9.6 258.9 10.7C260 11.9 261.1 13.1 262 14.4C263 15.7 263.8 17 264.5 18.4C265.3 19.8 265.9 21.3 266.4 22.8C266.9 24.2 267.4 25.7 267.7 27.3C268 28.8 268.3 30.4 268.4 32Z"
          fill="#fff"
          stroke="#f4e6d2"
        />
        <g ref={(el) => void (pupils.current[1] = el)} className="fish-pupil">
          <circle cx="236.9" cy="34.7" r="6.8" fill="#060204" />
          <circle cx="239.2" cy="29.6" r="2.6" fill="#fff" />
        </g>
      </g>
      <path
        ref={lips}
        d={toPath(POSES.rest.lips)}
        fill="#eecf5a"
        stroke="#d9a634"
        strokeWidth={POSES.rest.lipsStroke}
        strokeLinejoin="round"
      />
      <path
        ref={inner}
        d={toPath(POSES.rest.inner)}
        fill={`url(#${holeFill})`}
        stroke="#c9831a"
        strokeWidth={0}
      />
      <ellipse
        ref={shine}
        cx="124"
        cy="89"
        rx="7"
        ry="2.2"
        fill="#fff"
        opacity={0}
        transform="rotate(-8 124 89)"
      />
    </svg>
  );
}
