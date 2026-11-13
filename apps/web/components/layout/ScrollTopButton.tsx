'use client';

import { ArrowUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

/**
 * Back to the top. Shows once the page has scrolled past half a screen. On wide screens the
 * whole empty margin left of the content, top to bottom, is the button (`.scroll-top` in
 * globals.css); the visible part sits at the bottom left, level with the Discord button.
 */
export function ScrollTopButton() {
  const t = useTranslations('Nav');
  const [shown, setShown] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setShown(window.scrollY > window.innerHeight / 2);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <button
      type="button"
      aria-label={t('toTop')}
      title={t('toTop')}
      className="scroll-top"
      data-shown={shown ? '' : undefined}
      tabIndex={shown ? 0 : -1}
      onClick={() => {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
      }}
    >
      <span className="scroll-top-face fn-tab px-3 py-2 text-xl">
        <ArrowUp aria-hidden className="size-6" strokeWidth={3} />
      </span>
    </button>
  );
}
