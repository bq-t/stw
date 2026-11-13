'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState, useSyncExternalStore, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { Link, usePathname } from '@/i18n/navigation';

type Mode = 'br' | 'stw';
type Page = { href: string; key: string; icon: string };

/**
 * The site's pages by game mode, in two rows: the main ones (three big cards) and the rest
 * (smaller cards, scrolling sideways). `key` names the card in the `Nav` messages.
 */
const PAGES: Record<Mode, [Page[], Page[]]> = {
  br: [
    [
      { href: '/battle-royale/shop', key: 'brShop', icon: '/images/menu/br-shop.webp' },
      {
        href: '/battle-royale/tournaments',
        key: 'tournaments',
        icon: '/images/menu/br-tournaments.webp',
      },
      {
        href: '/battle-royale/events',
        key: 'brEvents',
        icon: '/images/menu/events.webp',
      },
    ],
    [],
  ],
  stw: [
    [
      { href: '/pve', key: 'tracker', icon: '/icons/missions/fight-the-storm.webp' },
      { href: '/pve/shop', key: 'shop', icon: '/images/menu/pve-shop.webp' },
      { href: '/pve/events', key: 'events', icon: '/images/menu/events.webp' },
    ],
    [
      { href: '/pve/daily-quests', key: 'dailyQuests', icon: '/images/menu/pve-daily-quests.webp' },
      { href: '/pve/questline', key: 'questline', icon: '/icons/missions/launch-the-rocket.webp' },
      {
        href: '/pve/side-quests',
        key: 'sideQuests',
        icon: '/icons/missions/evacuate-the-survivors.webp',
      },
      { href: '/pve/faq', key: 'faq', icon: '/images/menu/pve-faq.webp' },
    ],
  ],
};

/** The mode a page belongs to, for the lit tab: its first path segment. */
function modeOf(pathname: string): Mode | null {
  const first = pathname.split('/')[1];
  return first === 'battle-royale' ? 'br' : first === 'pve' ? 'stw' : null;
}

const noSubscribe = () => () => {};

/** Where the panel starts: under the header's slanted bottom edge, so it comes out from behind it. */
function panelTop(): number {
  const header = document.querySelector('.site-header');
  return header ? Math.max(0, header.getBoundingClientRect().bottom - 16) : 0;
}

function PageCard({
  mode,
  page,
  index,
  onPick,
}: {
  mode: Mode;
  page: Page;
  /** Its place in the menu: the cards turn in one after another. */
  index: number;
  onPick: () => void;
}) {
  const t = useTranslations('Nav');
  return (
    <Link
      href={page.href}
      className="menu-card"
      data-mode={mode}
      style={{ '--i': index } as CSSProperties}
      onClick={onPick}
    >
      {/* Plain <img>: static export, local files. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={page.icon} alt="" width={64} height={64} className="menu-card-icon" />
      <span className="menu-card-title fn-title">{t(page.key)}</span>
    </Link>
  );
}

/**
 * Header menu: one tab per game mode. A tab fades in a blurred panel over the whole screen
 * under the header, with the mode's pages as cards (`.mode-panel`, `.menu-card` in
 * globals.css; their own style, not the mode screen's cards). The panel lives in <body>: the header's drop-shadow filter would make a fixed
 * element inside it fixed to the header instead of the screen.
 */
export function ModeMenu() {
  const t = useTranslations('Nav');
  const pathname = usePathname();
  const [open, setOpen] = useState<Mode | null>(null);
  // The mode whose cards the panel shows; kept while it slides away after closing.
  const [shown, setShown] = useState<Mode>('stw');
  const [top, setTop] = useState(0);
  const mounted = useSyncExternalStore(
    noSubscribe,
    () => true,
    () => false,
  );

  const toggle = (mode: Mode) => {
    if (open === mode) {
      setOpen(null);
      return;
    }
    setTop(panelTop());
    setShown(mode);
    setOpen(mode);
  };

  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    html.dataset.menuOpen = '';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
    };
    const onResize = () => setTop(panelTop());
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      delete html.dataset.menuOpen;
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, [open]);

  const [main, more] = PAGES[shown];
  const close = () => setOpen(null);

  return (
    <>
      {(['br', 'stw'] as const).map((mode) => {
        const active = open ? open === mode : modeOf(pathname) === mode;
        return (
          <button
            key={mode}
            type="button"
            aria-expanded={open === mode}
            aria-controls="mode-panel"
            onClick={() => toggle(mode)}
            className={`fn-tab px-3.5 py-1 ${active ? 'fn-tab-active' : ''}`}
          >
            <span>{t(mode)}</span>
          </button>
        );
      })}
      {mounted &&
        createPortal(
          <div
            id="mode-panel"
            className="mode-panel"
            data-open={open ? '' : undefined}
            style={{ top }}
            aria-hidden={!open}
            inert={!open}
            onClick={(e) => {
              // A click on the blur itself, outside the cards, closes the menu.
              if (!(e.target as Element).closest('.menu-card')) close();
            }}
          >
            <div className="mode-panel-body">
              <div className="mode-row-main">
                {main.map((page, i) => (
                  <PageCard key={page.key} mode={shown} page={page} index={i} onPick={close} />
                ))}
              </div>
              {more.length > 0 && (
                <div className="mode-row-more">
                  {more.map((page, i) => (
                    <PageCard
                      key={page.key}
                      mode={shown}
                      page={page}
                      index={main.length + i}
                      onPick={close}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
