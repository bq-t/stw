'use client';

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * An opened card (tournaments, shop items): the page blurs, a copy of the card flies from its
 * place to the right and the details appear on the left; closing runs it back. The flying copy
 * is laid over the original's spot (FLIP), the caller hides the original meanwhile. Styles:
 * `.tour-overlay`, `.tour-detail`, `.tour-info`, `.tour-flyer` in globals.css.
 */
export function CardOverlay({
  label,
  from,
  slotClassName,
  slotStyle,
  flyerClassName,
  flyerStyle,
  flyer,
  info,
  onClosed,
  wide = false,
}: {
  label: string;
  /** A wide card (a shop bundle): the open view gets more room so it stays beside the details. */
  wide?: boolean;
  /** Where the card sits on the page, to fly from and back to. */
  from: () => DOMRect | null;
  /** The card's place in the open view (its size). */
  slotClassName: string;
  slotStyle?: CSSProperties;
  flyerClassName: string;
  flyerStyle?: CSSProperties;
  /** What the flying card shows. */
  flyer: ReactNode;
  /** The details panel; `close` runs the closing animation. */
  info: (close: () => void) => ReactNode;
  onClosed: () => void;
}) {
  const slot = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const [closing, setClosing] = useState(false);

  const place = () => {
    const f = card.current;
    const r = slot.current?.getBoundingClientRect();
    if (!f || !r) return null;
    Object.assign(f.style, {
      left: `${r.left}px`,
      top: `${r.top}px`,
      width: `${r.width}px`,
      height: `${r.height}px`,
    });
    return r;
  };
  const fly = (a: DOMRect, b: DOMRect, back: boolean) =>
    card.current!.animate(
      [
        {
          transform: `translate(${a.left - b.left}px, ${a.top - b.top}px) scale(${a.width / b.width}, ${a.height / b.height})`,
        },
        { transform: 'none' },
      ],
      {
        duration: reduceMotion() ? 0 : 380,
        easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
        direction: back ? 'reverse' : 'normal',
        fill: 'both',
      },
    );

  useLayoutEffect(() => {
    const to = place();
    const start = from();
    if (to && start) fly(start, to, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Closing only flips the state; the flight back runs in an effect (refs are read there).
  const close = () => setClosing(true);

  useEffect(() => {
    if (!closing) return;
    const to = place();
    const start = from();
    if (!to || !start) return onClosed();
    fly(start, to, true).finished.then(onClosed, onClosed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closing]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    const onResize = () => place();
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    const body = document.body.style;
    const overflow = body.overflow;
    body.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
      body.overflow = overflow;
    };
  });

  return createPortal(
    <>
      <div
        className="tour-overlay"
        data-closing={closing ? '' : undefined}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        onClick={(e) => {
          // A click on the blur itself closes it.
          if (e.target === e.currentTarget) close();
        }}
      >
        <div
          className={wide ? 'tour-detail tour-detail-wide' : 'tour-detail'}
          onClick={(e) => e.target === e.currentTarget && close()}
        >
          <div className="tour-info fn-block flex flex-col gap-3 p-5">{info(close)}</div>
          <div ref={slot} className={slotClassName} style={slotStyle} />
        </div>
      </div>
      {/* Outside the overlay (it fades as it closes): the card stays solid all the way back. */}
      <div ref={card} className={`tour-flyer ${flyerClassName}`} style={flyerStyle} aria-hidden>
        {flyer}
      </div>
    </>,
    document.body,
  );
}
