'use client';

import { useTranslations } from 'next-intl';
import { LegacyRedirect } from '@/components/layout/LegacyRedirect';
import { IS_DEMO } from '@/lib/api';
import { BrShopView } from './BrShopView';
import { StwShopView } from './StwShopView';

/** Battle Royale item shop (/battle-royale/shop). */
export function BrShop() {
  const t = useTranslations('Shop');
  if (IS_DEMO) return <p className="text-white/80">{t('demo')}</p>;
  return <BrShopView />;
}

/** Save the World shops and X-ray llamas (/pve/shop); the old `/shop?tab=br` goes to the BR shop. */
export function StwShop() {
  const t = useTranslations('Shop');
  return (
    <>
      <LegacyRedirect to={(q) => (q.get('tab') === 'br' ? '/battle-royale/shop' : null)} />
      {IS_DEMO ? <p className="text-white/80">{t('demo')}</p> : <StwShopView />}
    </>
  );
}
