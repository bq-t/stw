'use client';

import { useEffect } from 'react';

/** Opens the quest named in the URL hash (/daily-quests#destroy-tvs), on load and on hash change. */
export function OpenQuestFromHash() {
  useEffect(() => {
    const open = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id) return;
      const details = document.querySelector<HTMLDetailsElement>(
        `details[data-quest="${CSS.escape(id)}"]`,
      );
      if (details) details.open = true;
      document.getElementById(id)?.scrollIntoView({ block: 'start' });
    };
    open();
    window.addEventListener('hashchange', open);
    return () => window.removeEventListener('hashchange', open);
  }, []);
  return null;
}
