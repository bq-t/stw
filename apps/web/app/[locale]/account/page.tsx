import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { alternatesFor } from '@/lib/site';
import { AccountView } from '@/components/account/AccountView';

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/account'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Epic' });
  return {
    title: t('title'),
    description: t('metaDescription'),
    alternates: alternatesFor('/account', locale as Locale),
    robots: { index: false },
  };
}

export default async function AccountPage({ params }: PageProps<'/[locale]/account'>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Epic');
  return (
    <article className="flex max-w-3xl flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-2xl font-extrabold text-white uppercase">{t('title')}</h1>
        <p className="text-white/80">{t('intro')}</p>
      </header>
      <AccountView />
    </article>
  );
}
