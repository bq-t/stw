import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { alternatesFor } from '@/lib/site';
import { RotationTimer } from '@/components/missions/RotationTimer';
import { BrShop } from '@/components/shop/ShopView';

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/battle-royale/shop'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Shop' });
  return {
    title: t('title'),
    description: t('metaDescription'),
    alternates: alternatesFor('/battle-royale/shop', locale as Locale),
  };
}

export default async function BrShopPage({ params }: PageProps<'/[locale]/battle-royale/shop'>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Shop');
  return (
    <article className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-display text-2xl font-extrabold text-white uppercase">
            {t('title')}
          </h1>
          <RotationTimer label={t('nextShop')} />
        </div>
        <p className="text-white/80">{t('intro')}</p>
      </header>
      <BrShop />
    </article>
  );
}
