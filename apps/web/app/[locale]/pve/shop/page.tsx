import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { alternatesFor } from '@/lib/site';
import { StwShop } from '@/components/shop/ShopView';

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/pve/shop'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Shop' });
  return {
    title: t('stwTitle'),
    description: t('stwMetaDescription'),
    alternates: alternatesFor('/pve/shop', locale as Locale),
  };
}

export default async function StwShopPage({ params }: PageProps<'/[locale]/pve/shop'>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Shop');
  return (
    <article className="flex flex-col gap-6">
      <h1 className="sr-only">{t('stwTitle')}</h1>
      <StwShop />
    </article>
  );
}
