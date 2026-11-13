'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { tilt, untilt } from './cardTilt';
import { FishFace } from './FishFace';
import { OPEN_INTRO_EVENT } from './HeaderLogo';

/** Set once a mode was picked: the intro never shows again in this browser. */
const DONE_KEY = 'stw.intro.done';
/** If the picked page is slow to arrive, drain anyway after this. */
const NAV_TIMEOUT_MS = 2500;
/** The logo's flight between the middle of the intro and the header. */
/** As long as the header takes to come down, so the logo lands as it arrives. */
const FLIGHT_MS = 450;
const FLIGHT_EASING = 'cubic-bezier(0.3, 0, 0.2, 1)';

/**
 * Runs while the HTML is parsed, before the first paint: on the home page (/, /pve, also /ru/…)
 * of a first visit it
 * marks <html data-intro>, and the CSS shows the intro (`.intro` in globals.css). The static
 * HTML has no access to localStorage, so React alone could only show it with a flash.
 */
export const INTRO_SCRIPT = `try{if(!localStorage.getItem(${JSON.stringify(DONE_KEY)})&&/^\\/((en|ru)\\/?)?(pve\\/?)?$/.test(location.pathname))document.documentElement.dataset.intro=''}catch(e){}`;

type Mode = 'br' | 'pve';
/** `open` also stands for "hidden": whether the intro shows is <html data-intro>. */
type Phase = 'open' | 'navigating' | 'leaving' | 'entering';

/** `hero`: the character in the card window (cut from the owner's renders, public/images/intro). */
const MODES: { mode: Mode; href: string; hero: string; badge?: boolean }[] = [
  { mode: 'br', href: '/battle-royale/shop', hero: '/images/intro/br.webp', badge: true },
  { mode: 'pve', href: '/pve', hero: '/images/intro/stw.webp' },
];

const isShown = () => 'intro' in document.documentElement.dataset;

/** How far an element is shifted down right now by its transform (a transition or an animation). */
function shiftY(el: Element | null): number {
  if (!el) return 0;
  const t = getComputedStyle(el).transform;
  return t && t !== 'none' ? new DOMMatrix(t).m42 : 0;
}

/** Where the header fish sits once the header is in place (it slides away while the intro is up). */
function headerLogoRect(): DOMRect | null {
  const svg = document.querySelector('[data-header-logo] svg');
  if (!svg) return null;
  const r = svg.getBoundingClientRect();
  return new DOMRect(r.x, r.y - shiftY(document.querySelector('.site-header')), r.width, r.height);
}

/** Where `spot` settles once `mover` (an ancestor sliding with a transform) comes to rest. */
function settledRect(spot: Element, mover: Element | null): DOMRect {
  const r = spot.getBoundingClientRect();
  return new DOMRect(r.x, r.y - shiftY(mover), r.width, r.height);
}

function pin(el: HTMLElement | null, r: DOMRect) {
  if (!el) return;
  el.style.left = `${r.x}px`;
  el.style.top = `${r.y}px`;
  el.style.width = `${r.width}px`;
  el.style.height = `${r.height}px`;
}

/** Lands `el` on `to`, starting from where `from` is. */
function fly(el: HTMLElement, from: DOMRect, to: DOMRect): Animation {
  pin(el, to);
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return el.animate(
    [
      {
        transform: `translate(${from.x - to.x}px, ${from.y - to.y}px) scale(${from.width / to.width})`,
      },
      { transform: 'none' },
    ],
    { duration: reduce ? 0 : FLIGHT_MS, easing: FLIGHT_EASING },
  );
}

/**
 * Mode screen: orange, the fish logo and two mode cards. Shown on the first visit, and again
 * when the header fish is clicked. A pick opens its section and the screen comes apart: the logo
 * flies into the header, the header slides down into place, and the orange with the content
 * drains down with a wave edge. Coming back runs it in reverse: the header slides up, the orange
 * flows in from the top and the logo flies back to the middle.
 *
 * The markup is always in the page and hidden by CSS unless <html data-intro> is set, so the
 * server and client renders match. The flying logo is its own fixed layer: inside the intro it
 * would drain with the orange, inside the header its slanted clip would cut it.
 */
export function IntroGate() {
  const t = useTranslations('Intro');
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>('open');
  const [fromPath, setFromPath] = useState(pathname);
  const timer = useRef<number | undefined>(undefined);
  const root = useRef<HTMLDivElement>(null);
  const slot = useRef<HTMLDivElement>(null);
  const flyer = useRef<HTMLDivElement>(null);
  const flight = useRef<Animation | null>(null);

  // The picked page is here: drain (state adjusted during render, as in RouteProgress).
  if (phase === 'navigating' && pathname !== fromPath) setPhase('leaving');

  // The header reads the phase: it stays up while the intro is shown, except when leaving.
  useEffect(() => {
    document.documentElement.dataset.introPhase = phase;
  }, [phase]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // While the intro is up, the flying logo sits on its slot, and the background's light sits
  // right under it (its spot depends on the screen height).
  useEffect(() => {
    const el = root.current;
    const spot = slot.current;
    if (!el || !spot) return;
    const place = () => {
      // Fixed elements have no offsetParent: rendered = has boxes.
      if (!isShown() || !el.getClientRects().length) return;
      const box = el.getBoundingClientRect();
      const r = spot.getBoundingClientRect();
      const x = r.left + r.width / 2 - box.left;
      const y = r.top + r.height / 2 - box.top + el.scrollTop;
      el.style.setProperty('--glow', `${Math.round(x)}px ${Math.round(y)}px`);
      if (flight.current?.playState !== 'running') pin(flyer.current, settledRect(spot, el));
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(el);
    ro.observe(spot);
    el.addEventListener('scroll', place, { passive: true });
    window.addEventListener('resize', place);
    return () => {
      ro.disconnect();
      el.removeEventListener('scroll', place);
      window.removeEventListener('resize', place);
    };
  }, []);

  // Leaving: the logo flies to the header.
  useEffect(() => {
    const f = flyer.current;
    const spot = slot.current;
    if (phase !== 'leaving' || !f || !spot) return;
    const to = headerLogoRect();
    if (!to) return;
    flight.current?.cancel();
    flight.current = fly(f, settledRect(spot, root.current), to);
  }, [phase]);

  // The header fish was clicked: come back from the top, the logo flies to the middle.
  useEffect(() => {
    const onOpen = (e: Event) => {
      e.preventDefault();
      if (isShown()) return;
      const from = headerLogoRect();
      if (from) pin(flyer.current, from);
      document.documentElement.dataset.intro = '';
      setPhase('entering');
      // After React has rendered the entering phase and the orange has started moving.
      requestAnimationFrame(() => {
        const f = flyer.current;
        const spot = slot.current;
        if (!f || !spot) return;
        const to = settledRect(spot, root.current);
        flight.current?.cancel();
        if (from) flight.current = fly(f, from, to);
        else pin(f, to);
      });
    };
    window.addEventListener(OPEN_INTRO_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_INTRO_EVENT, onOpen);
  }, []);

  const pick = (mode: Mode, href: string) => {
    if (phase !== 'open') return;
    try {
      localStorage.setItem(DONE_KEY, mode);
    } catch {
      // Private mode: the intro shows again next time, nothing breaks.
    }
    const [path] = href.split('?');
    if (path === pathname) {
      // Already there (the intro was reopened from this page): only the query may change.
      if (href !== path) router.replace(href);
      setPhase('leaving');
      return;
    }
    setFromPath(pathname);
    setPhase('navigating');
    router.push(href);
    timer.current = window.setTimeout(() => setPhase('leaving'), NAV_TIMEOUT_MS);
  };

  /** Closes the screen where it stands, as a pick of the page under it. */
  const dismiss = () => {
    if (phase !== 'open') return;
    try {
      localStorage.setItem(DONE_KEY, pathname.startsWith('/battle-royale') ? 'br' : 'pve');
    } catch {
      // Private mode: the intro shows again next time, nothing breaks.
    }
    setPhase('leaving');
  };

  const finish = () => {
    window.clearTimeout(timer.current);
    flight.current?.cancel();
    flight.current = null;
    delete document.documentElement.dataset.intro;
    setPhase('open');
  };

  return (
    <>
      <div
        ref={root}
        className="intro"
        data-phase={phase}
        role="dialog"
        aria-modal="true"
        aria-labelledby="intro-title"
        onAnimationEnd={(e) => {
          if (e.target !== e.currentTarget) return;
          if (e.animationName === 'intro-drain') finish();
          if (e.animationName === 'intro-fill') setPhase('open');
        }}
      >
        {/* The site's background grid and its shine, faint on the orange (globals.css, .intro-grid). */}
        <div aria-hidden className="intro-grid">
          <div className="intro-grid-pattern" />
          <div className="intro-grid-shine">
            <div>
              <div className="intro-grid-pattern" />
            </div>
          </div>
        </div>
        <div className="intro-body">
          {/* The logo's place: the logo itself is the flying layer below. A click closes the
              screen and stays on the page under it. */}
          <div
            ref={slot}
            className="intro-logo cursor-pointer"
            role="button"
            tabIndex={0}
            aria-label={t('close')}
            onClick={dismiss}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && dismiss()}
          />
          <h1
            id="intro-title"
            className="intro-title fn-title text-center text-3xl text-white sm:text-5xl"
          >
            {t('title')}
          </h1>
          <div className="intro-cards">
            {MODES.map(({ mode, href, hero, badge }) => (
              <button
                key={mode}
                type="button"
                className="intro-card"
                data-mode={mode}
                onPointerMove={tilt}
                onPointerLeave={untilt}
                onClick={() => pick(mode, href)}
              >
                <span aria-hidden className="intro-card-window">
                  <span className="intro-card-art" />
                  {/* Plain <img>: static export, local files. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={hero} alt="" width={600} height={750} className="intro-card-hero" />
                  <span className="intro-card-shine" />
                </span>
                <span className="intro-card-plate">
                  <span className="fn-title block text-xl sm:text-3xl">{t(mode)}</span>
                  <span className="mt-1 block text-xs leading-snug text-neutral-600 sm:text-sm">
                    {t(`${mode}Text`)}
                  </span>
                </span>
                {badge && (
                  <span className="intro-card-badge-wrap">
                    <span className="intro-card-badge">{t('new')}</span>
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div ref={flyer} aria-hidden className="intro-flyer">
        <FishFace />
      </div>
    </>
  );
}
