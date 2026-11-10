import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { alternatesFor } from '@/lib/site';
import { ShopView } from '@/components/shop/ShopView';

export async function generateMetadata({ params }: PageProps<'/[locale]/shop'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Shop' });
  return {
    title: t('title'),
    description: t('metaDescription'),
    alternates: alternatesFor('/shop', locale as Locale),
  };
}

export default async function ShopPage({ params }: PageProps<'/[locale]/shop'>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Shop');
  return (
    <article className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-2xl font-extrabold uppercase">{t('title')}</h1>
        <p className="text-muted-foreground">{t('intro')}</p>
      </header>
      <ShopView />
    </article>
  );
}
