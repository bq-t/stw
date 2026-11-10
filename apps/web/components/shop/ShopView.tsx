'use client';

import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Suspense } from 'react';
import { IS_DEMO } from '@/lib/api';
import { BrShopView } from './BrShopView';
import { StwShopView } from './StwShopView';

const TABS = ['br', 'stw'] as const;
type Tab = (typeof TABS)[number];

function ShopTabs() {
  const t = useTranslations('Shop');
  const search = useSearchParams();
  const tab: Tab = search.get('tab') === 'stw' ? 'stw' : 'br';
  // The tab only changes the query string: native replaceState updates useSearchParams
  // without a navigation (EN "/" paths are rewrites, see TrackerView).
  const select = (next: Tab) =>
    window.history.replaceState(null, '', `${window.location.pathname}?tab=${next}`);

  return (
    <div className="flex flex-col gap-6">
      <div role="tablist" className="flex flex-wrap gap-2">
        {TABS.map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => select(key)}
            className={`fn-tab px-4 py-1.5 ${tab === key ? 'fn-tab-active' : 'fn-tab-dim'}`}
          >
            <span>{t(key === 'br' ? 'tabBr' : 'tabStw')}</span>
          </button>
        ))}
      </div>
      {tab === 'br' ? <BrShopView /> : <StwShopView />}
    </div>
  );
}

export function ShopView() {
  const t = useTranslations('Shop');
  if (IS_DEMO) return <p className="text-muted-foreground">{t('demo')}</p>;
  // useSearchParams needs a Suspense boundary in a static export.
  return (
    <Suspense>
      <ShopTabs />
    </Suspense>
  );
}
