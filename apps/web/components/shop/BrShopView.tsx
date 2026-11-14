'use client';

import type { BrShopItem, BrShopSection } from '@stw/shared';
import { useQuery } from '@tanstack/react-query';
import { Play } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Suspense, useEffect, useRef, useState, useSyncExternalStore, type RefObject } from 'react';
import { CardSkeletons } from '@/components/ui/skeleton';
import { VbucksIcon } from '@/components/missions/VbucksIcon';
import { CardOverlay } from '@/components/layout/CardOverlay';
import { useNow } from '@/components/events/time';
import { fetchBrShop } from '@/lib/api';
import {
  isDefaultBrFilters,
  isLeaving,
  looksOf,
  matchesBrFilters,
  NO_BR_FILTERS,
  useBrFilters,
  useShowLego,
} from './brFilters';

const isTracks = (s: BrShopSection) => s.items.every((i) => i.kind === 'track');

function Price({ item }: { item: BrShopItem }) {
  const locale = useLocale();
  const n = (v: number) => v.toLocaleString(locale);
  return (
    <span className="inline-flex items-center gap-1 text-sm font-bold tabular-nums">
      <VbucksIcon className="size-3.5" />
      {n(item.price)}
      {item.regularPrice > item.price && (
        <span className="font-normal opacity-60 line-through">{n(item.regularPrice)}</span>
      )}
    </span>
  );
}

/** Tile colours and the CSS variables for them (the game's colours by role). */
function tileLook(item: BrShopItem): React.CSSProperties {
  const [a = '3a3f4a', b = a] = item.colors.map((c) => c.slice(0, 6));
  const base = item.tile?.base ?? a;
  const light = item.tile?.light ?? b;
  const text = item.tile?.text ?? base;
  return {
    '--tile': `#${base}`,
    '--tile-text': `#${text}`,
    background: `radial-gradient(circle at 50% 35%, #${light}, #${base} 75%)`,
  } as React.CSSProperties;
}

/** One look on screen this long; the wipe between two looks takes WIPE_MS of it. */
const LOOK_MS = 5000;
const WIPE_MS = 1400;
/** Shown, outgoing and incoming masks: complementary slanted (105deg) edges, so one wipes out as the other wipes in. */
const MASK_OUT = 'linear-gradient(105deg, transparent 42%, #000 58%)';
const MASK_IN = 'linear-gradient(105deg, #000 42%, transparent 58%)';

const subscribeClock = (tick: () => void) => {
  const id = window.setInterval(tick, 250);
  return () => window.clearInterval(id);
};

/** The look due now on the clock that drives the tiles. */
const lookIndexNow = (count: number, delay: number) =>
  count < 2 ? 0 : Math.floor((Date.now() + delay * 1000) / LOOK_MS) % count;

/** Which look to show now: steps every LOOK_MS, shifted by `delay` seconds. */
function useLookIndex(count: number, delay: number): number {
  return useSyncExternalStore(
    subscribeClock,
    () =>
      count < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 0
        : Math.floor((Date.now() + delay * 1000) / LOOK_MS) % count,
    () => 0,
  );
}

/**
 * The tile's render. With more looks (styles, LEGO) they take turns: normal, styles, LEGO and
 * round again. The outgoing look wipes out along a slanted line as the next wipes in, and a
 * glare runs along the frame at the same angle (`glare`, the card's own element).
 */
function Art({
  item,
  delay = 0,
  glare,
  index: picked,
}: {
  item: BrShopItem;
  delay?: number;
  glare?: RefObject<HTMLSpanElement | null>;
  /** The look to show (the open card steps it itself); the clock's look when omitted. */
  index?: number;
}) {
  const looks = looksOf(item, useShowLego());
  const clock = useLookIndex(looks.length, delay);
  const index = picked !== undefined && picked < looks.length ? picked : clock;
  const imgs = useRef<(HTMLImageElement | null)[]>([]);
  // Mount on the look that is due now (the open card copies a tile mid-cycle), not on the first.
  const [first] = useState(index);
  const shown = useRef(first);

  useEffect(() => {
    const next = imgs.current[index];
    if (!next || shown.current === index) return;
    const from = shown.current;
    const prev = imgs.current[from];
    shown.current = index;
    // A switch that is still running (a square clicked mid-wipe) is cut short: its animations
    // are cancelled (their `finished` rejects, so they do not settle), and every look but the
    // outgoing and the incoming one is hidden.
    imgs.current.forEach((img, k) => {
      if (!img) return;
      img.getAnimations().forEach((a) => a.cancel());
      if (k === index || k === from) return;
      img.style.visibility = 'hidden';
      img.style.removeProperty('mask-image');
    });
    glare?.current?.getAnimations().forEach((a) => a.cancel());
    const wipe = { duration: WIPE_MS, easing: 'ease-in-out', fill: 'forwards' } as const;
    next.style.visibility = 'visible';
    next.style.zIndex = '1';
    next.style.maskImage = MASK_IN;
    if (prev) {
      prev.style.visibility = 'visible';
      prev.style.zIndex = '0';
      prev.style.maskImage = MASK_OUT;
    }
    const frames = [{ maskPosition: '100% 0' }, { maskPosition: '0% 0' }];
    const run = next.animate(frames, wipe);
    prev?.animate(frames, wipe);
    glare?.current?.animate(
      [
        { opacity: 0, backgroundPosition: '100% 0' },
        { opacity: 1, offset: 0.15 },
        { opacity: 1, offset: 0.8 },
        { opacity: 0, backgroundPosition: '0% 0' },
      ],
      { duration: WIPE_MS, easing: 'ease-in-out' },
    );
    run.finished.then(
      () => {
        // Settled: only the new look stays, unmasked.
        if (shown.current !== index) return;
        imgs.current.forEach((img, k) => {
          if (!img || k === index) return;
          img.getAnimations().forEach((a) => a.cancel());
          img.style.visibility = 'hidden';
          img.style.removeProperty('mask-image');
        });
        next.getAnimations().forEach((a) => a.cancel());
        next.style.maskImage = 'none';
      },
      () => {},
    );
  }, [index, glare]);

  if (!looks.length) return null;
  return (
    <span className="shop-card-art">
      {looks.map((src, k) => (
        // fortnite-api CDN, static export: plain <img>.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          ref={(el) => void (imgs.current[k] = el)}
          src={src}
          alt=""
          loading="lazy"
          className="shop-card-img"
          style={k === first ? undefined : { visibility: 'hidden' }}
        />
      ))}
    </span>
  );
}

/** The render with its frame glare, for the open card. */
function LooksArt({ item, delay, index }: { item: BrShopItem; delay: number; index: number }) {
  const glare = useRef<HTMLSpanElement>(null);
  const many = looksOf(item, useShowLego()).length > 1;
  return (
    <>
      <Art item={item} delay={delay} glare={glare} index={index} />
      {many && <span ref={glare} aria-hidden className="shop-card-glare" />}
    </>
  );
}

/** "Leaving today" with the time left: "5h 12m". */
function useTimeLeft(outDate: string) {
  const t = useTranslations('Shop');
  const now = useNow();
  const left = Math.max(0, Date.parse(outDate) - now);
  const h = Math.floor(left / 3_600_000);
  const m = Math.floor((left % 3_600_000) / 60_000);
  return t('timeLeft', { h, m });
}

function LeavingTag({ outDate }: { outDate: string }) {
  const t = useTranslations('Shop');
  const left = useTimeLeft(outDate);
  return (
    <span className="shop-card-leaving">
      <span className="block">{t('leavingToday')}</span>
      <span className="block text-[0.8em] opacity-85">{left}</span>
    </span>
  );
}

function extrasLine(item: BrShopItem, t: (key: string) => string): string | null {
  const lines = [item.offerTag, ...(item.extras ?? []).map((x) => `+ ${t(`extra.${x}`)}`)].filter(
    Boolean,
  );
  return lines.length ? lines.join(' · ') : null;
}

/**
 * Shop tile: a plain block on the game's tile colours with a see-through edge of the same
 * colour; a light haze of the game's name band colour over the bottom of the render, with the
 * name, type and price on it. On hover a line with the game's note and the extras slides in.
 * Bundles are two cells wide; new content glows yellow with its badge. A click opens it.
 */
function Tile({
  item,
  isNew,
  leaving,
  delay,
  hidden,
  onOpen,
}: {
  item: BrShopItem;
  isNew: boolean;
  /** Its last day in the shop: gone after the next reset. */
  leaving: boolean;
  /** Start of the look switch, so the tiles do not all switch at once. */
  delay: number;
  /** Open in the detail view (its copy is there). */
  hidden: boolean;
  onOpen: () => void;
}) {
  const t = useTranslations('Shop');
  const extras = extrasLine(item, t);
  const glare = useRef<HTMLSpanElement>(null);
  const many = looksOf(item, useShowLego()).length > 1;
  return (
    <li
      className="shop-card"
      role="button"
      tabIndex={0}
      aria-label={item.name}
      data-offer={item.offerId}
      data-wide={item.kind === 'bundle' ? '' : undefined}
      data-first={item.firstRelease ? '' : undefined}
      // Opacity, not visibility: the shown look sets its own visibility and would stay in sight.
      style={{ ...tileLook(item), opacity: hidden ? 0 : undefined }}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onOpen())}
    >
      <Art item={item} delay={delay} glare={glare} />
      {many && <span ref={glare} aria-hidden className="shop-card-glare" />}
      <div className="shop-card-text">
        <p className="fn-title text-xl leading-tight">{item.name}</p>
        <p className="shop-card-type">
          {item.type}
          {item.kind === 'bundle' &&
            item.count > 1 &&
            ` · ${t('bundleItems', { count: item.count })}`}
        </p>
        <Price item={item} />
        {extras && <p className="shop-card-extras">{extras}</p>}
      </div>
      {item.video && (
        <span className="shop-card-video" title={t('hasVideo')}>
          <Play aria-hidden className="size-3.5 fill-current" />
        </span>
      )}
      {leaving && <LeavingTag outDate={item.outDate} />}
      {item.firstRelease ? (
        <span className="shop-card-badge shop-card-badge-first">
          <span className="intro-card-badge shop-badge-first">{t('newContent')}</span>
        </span>
      ) : (
        isNew && (
          <span className="shop-card-badge">
            <span className="intro-card-badge">{t('newItem')}</span>
          </span>
        )
      )}
    </li>
  );
}

/**
 * The looks of the open card as a row of squares under it, like a timeline: the ones shown
 * are full, the current one fills up over LOOK_MS and then steps to the next (a CSS
 * animation: paused while the pointer is on the card). A click shows that look.
 */
function LookSteps({
  count,
  index,
  paused,
  onPick,
  onDone,
}: {
  count: number;
  index: number;
  paused: boolean;
  onPick: (index: number) => void;
  onDone: () => void;
}) {
  const t = useTranslations('Shop');
  return (
    <div className="shop-looks" role="group" aria-label={t('looks')}>
      {Array.from({ length: count }, (_, k) => (
        <button
          key={k}
          type="button"
          className="shop-look"
          data-state={k < index ? 'done' : k === index ? 'current' : undefined}
          aria-label={t('look', { n: k + 1, count })}
          aria-current={k === index ? 'true' : undefined}
          onClick={() => onPick(k)}
        >
          {k === index && (
            // Re-keyed per look so the fill starts over on every step.
            <span
              key={index}
              className="shop-look-fill"
              style={{
                animationDuration: `${LOOK_MS}ms`,
                animationPlayState: paused ? 'paused' : 'running',
              }}
              onAnimationEnd={onDone}
            />
          )}
        </button>
      ))}
    </div>
  );
}

/** The open offer: its render alone on the right, everything about it on the left. */
function ItemDetail({
  item,
  leaving,
  delay,
  onClosed,
}: {
  item: BrShopItem;
  leaving: boolean;
  /** The tile's look clock, so the open card shows the same look as the tile. */
  delay: number;
  onClosed: () => void;
}) {
  const t = useTranslations('Shop');
  const locale = useLocale();
  const left = useTimeLeft(item.outDate);
  const until = new Date(item.outDate).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
  });
  const from = () =>
    document
      .querySelector(`.shop-card[data-offer="${CSS.escape(item.offerId)}"]`)
      ?.getBoundingClientRect() ?? null;
  const rect = from();
  const ratio = rect ? `${rect.width} / ${rect.height}` : '3 / 4';
  const count = looksOf(item, useShowLego()).length;
  // Starts on the look the tile shows now, then steps on its own.
  const [index, setIndex] = useState(() => lookIndexNow(count, delay));
  const [hover, setHover] = useState(false);
  const shown = index < count ? index : 0;
  return (
    <CardOverlay
      label={item.name}
      from={from}
      slotClassName="tour-slot shop-slot"
      slotStyle={
        {
          aspectRatio: ratio,
          '--slot-w': item.kind === 'bundle' ? '36rem' : '22rem',
          '--slot-ratio': rect ? rect.width / rect.height : 0.75,
        } as React.CSSProperties
      }
      flyerClassName="shop-card shop-card-plain"
      flyerStyle={tileLook(item)}
      flyer={<LooksArt item={item} delay={delay} index={shown} />}
      slotProps={{
        onMouseEnter: () => setHover(true),
        onMouseLeave: () => setHover(false),
      }}
      below={
        count > 1 && (
          <LookSteps
            count={count}
            index={shown}
            paused={hover}
            onPick={setIndex}
            onDone={() => setIndex((shown + 1) % count)}
          />
        )
      }
      onClosed={onClosed}
      wide={item.kind === 'bundle'}
      info={(close) => (
        <>
          <h2 className="font-display text-2xl font-extrabold text-white uppercase">{item.name}</h2>
          <p className="shop-card-type text-base!">
            {item.type}
            {item.kind === 'bundle' &&
              item.count > 1 &&
              ` · ${t('bundleItems', { count: item.count })}`}
          </p>
          <div className="text-lg">
            <Price item={item} />
          </div>
          {item.offerTag && <p className="text-white/90">{item.offerTag}</p>}
          {(item.extras ?? []).length > 0 && (
            <ul className="flex flex-col gap-0.5 text-sm text-white/80">
              {(item.extras ?? []).map((x) => (
                <li key={x}>+ {t(`extra.${x}`)}</li>
              ))}
            </ul>
          )}
          <p className="text-sm text-white/80">
            {leaving ? `${t('leavingToday')} · ${left}` : t('inShopUntil', { date: until })}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {item.video ? (
              <a
                href={`https://www.youtube.com/watch?v=${item.video}`}
                target="_blank"
                rel="noopener noreferrer"
                className="fn-tab px-4 py-1"
              >
                <span>{t('watchVideo')}</span>
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="fn-tab cursor-not-allowed px-4 py-1 opacity-50"
              >
                <span>{t('watchVideo')}</span>
              </button>
            )}
            <button type="button" onClick={close} className="fn-tab fn-tab-active px-4 py-1">
              <span>{t('close')}</span>
            </button>
          </div>
        </>
      )}
    />
  );
}

/** The Jam Tracks section: square tiles, eight to a row, folded away by default. */
function TrackList({
  section,
  tile,
}: {
  section: BrShopSection;
  tile: (item: BrShopItem) => React.ReactNode;
}) {
  const t = useTranslations('Shop');
  return (
    <details className="fn-block p-3">
      <summary className="cursor-pointer font-display text-lg font-extrabold uppercase">
        {t('jamTracks', { count: section.items.length })}
      </summary>
      <ul className="shop-grid shop-grid-tracks mt-4">{section.items.map(tile)}</ul>
    </details>
  );
}

/** Anchor id of a section (names repeat across days, not within one shop). */
const sectionId = (name: string) =>
  `shop-${name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-|-$/g, '')}`;

type NavEntry = { id: string; name: string };

/**
 * The shop's sections on the left, like the game's: folded into a column of dots (the one in
 * view lit) that unfolds to the right over the items on hover, showing the names. On phones a
 * scrolling row of names on top.
 */
function SectionNav({ entries }: { entries: NavEntry[] }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const seen = new Map<string, boolean>();
    const io = new IntersectionObserver(
      (records) => {
        for (const r of records) seen.set(r.target.id, r.isIntersecting);
        const first = entries.find((e) => seen.get(e.id));
        if (first) setActive(first.id);
      },
      // The band under the sticky header.
      { rootMargin: '-120px 0px -55% 0px' },
    );
    for (const e of entries) {
      const el = document.getElementById(e.id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, [entries]);

  return (
    <nav className="shop-nav" aria-label="Shop sections">
      <ul>
        {entries.map((e) => (
          <li key={e.id}>
            <a href={`#${e.id}`} aria-current={active === e.id ? 'true' : undefined}>
              <span aria-hidden className="shop-nav-dot" />
              <span className="shop-nav-label">{e.name}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Loading: the loaded page's shape, a section title and a grid of tiles (the nav column kept free). */
function ShopSkeleton() {
  return (
    <div className="shop-layout">
      <div className="hidden lg:block" />
      <div className="flex flex-col gap-4">
        <span aria-hidden className="block h-8 w-56 -skew-x-8 bg-white/25" />
        <CardSkeletons count={8} listClassName="shop-grid" cardClassName="shop-card" />
      </div>
    </div>
  );
}

/** The BR shop under its filters (BrShopFilters in the page header shares the URL state). */
export function BrShopView() {
  // useSearchParams needs a Suspense boundary in a static export.
  return (
    <Suspense fallback={<ShopSkeleton />}>
      <Shop />
    </Suspense>
  );
}

function Shop() {
  const t = useTranslations('Shop');
  const locale = useLocale();
  const [filters, setFilters] = useBrFilters();
  const [open, setOpen] = useState<string | null>(null);
  const shop = useQuery({
    queryKey: ['shop', 'br', locale],
    queryFn: () => fetchBrShop(locale),
    staleTime: 5 * 60 * 1000,
  });

  if (shop.isError) return <p className="text-destructive">{t('error')}</p>;
  if (!shop.data) return <ShopSkeleton />;
  const { date } = shop.data;
  // Delays and the open offer count over the whole shop, so filtering does not reshuffle them.
  const all = shop.data.sections.flatMap((x) => x.items);
  const sections = shop.data.sections
    .map((s) => ({ ...s, items: s.items.filter((i) => matchesBrFilters(i, filters, date)) }))
    .filter((s) => s.items.length > 0);
  const opened = all.find((x) => x.offerId === open);
  // Each tile switches looks at its own moment, so they do not all switch at once.
  const delayOf = (item: BrShopItem) => (all.indexOf(item) % 9) * 1.3;
  const leavingOf = (item: BrShopItem) => isLeaving(item, date);
  const tile = (item: BrShopItem) => (
    <Tile
      key={item.offerId}
      item={item}
      isNew={item.inDate.slice(0, 10) === date}
      leaving={leavingOf(item)}
      delay={delayOf(item)}
      hidden={open === item.offerId}
      onOpen={() => setOpen(item.offerId)}
    />
  );
  const items = sections.filter((s) => !isTracks(s));
  const tracks = sections.filter(isTracks);
  const nav: NavEntry[] = [
    ...items.map((s) => ({ id: sectionId(s.name), name: s.name })),
    ...tracks.map((s) => ({
      id: sectionId(s.name),
      name: t('jamTracks', { count: s.items.length }),
    })),
  ];

  if (!sections.length)
    return (
      <div className="fn-panel flex flex-wrap items-center gap-3 py-3 text-sm text-muted-foreground">
        <span>{t('filters.empty')}</span>
        <button
          type="button"
          className="fn-chip h-7 px-3"
          onClick={() => setFilters(NO_BR_FILTERS)}
        >
          <span>{t('filters.reset')}</span>
        </button>
      </div>
    );

  return (
    <div className="shop-layout">
      <SectionNav
        key={isDefaultBrFilters(filters) ? 'all' : nav.map((e) => e.id).join()}
        entries={nav}
      />
      <div className="flex min-w-0 flex-col gap-12">
        {items.map((s) => (
          <section key={s.name} id={sectionId(s.name)} className="flex flex-col gap-4">
            <h2 className="font-display text-2xl font-extrabold text-white uppercase sm:text-3xl">
              {s.name}
            </h2>
            <ul className="shop-grid">{s.items.map(tile)}</ul>
          </section>
        ))}
        {tracks.map((s) => (
          <div key={s.name} id={sectionId(s.name)}>
            <TrackList section={s} tile={tile} />
          </div>
        ))}
      </div>
      {opened && (
        <ItemDetail
          key={opened.offerId}
          item={opened}
          leaving={leavingOf(opened)}
          delay={delayOf(opened)}
          onClosed={() => setOpen(null)}
        />
      )}
    </div>
  );
}
