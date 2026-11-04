'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';

function Switch() {
  const t = useTranslations('Nav');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const search = useSearchParams();

  function change(next: Locale) {
    // Keep the current page and its filters.
    const query = search.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { locale: next });
  }

  return (
    <div role="group" aria-label={t('language')} className="flex gap-1 text-xs font-semibold">
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => change(l)}
          aria-pressed={l === locale}
          className={`skew-tab rounded-none px-2 py-1 uppercase ${
            l === locale ? 'bg-surface-2 text-text' : 'text-muted-foreground hover:text-text'
          }`}
        >
          <span>{l}</span>
        </button>
      ))}
    </div>
  );
}

export function LocaleSwitch() {
  // useSearchParams needs a Suspense boundary in a static export.
  return (
    <Suspense>
      <Switch />
    </Suspense>
  );
}
