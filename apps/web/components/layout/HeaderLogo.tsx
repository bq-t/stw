'use client';

import { Link } from '@/i18n/navigation';
import { FishFace } from './FishFace';

/** IntroGate listens for it; cancelling it means the intro opened and the link must not navigate. */
export const OPEN_INTRO_EVENT = 'stw:open-intro';

/**
 * The fish in the header. A click brings the mode screen back (IntroGate) instead of going home;
 * where there is no IntroGate (the 404 page) the event is not cancelled and the link works.
 */
export function HeaderLogo({ label }: { label: string }) {
  return (
    <Link
      href="/pve"
      className="relative top-1 block shrink-0"
      aria-label={label}
      data-header-logo
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        const open = new Event(OPEN_INTRO_EVENT, { cancelable: true });
        if (!window.dispatchEvent(open)) e.preventDefault();
      }}
    >
      <FishFace className="aspect-[271/128] h-10 w-auto max-w-none" />
    </Link>
  );
}
