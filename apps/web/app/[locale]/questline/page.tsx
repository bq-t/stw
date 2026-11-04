import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Placeholder } from '@/components/Placeholder';
import type { Locale } from '@/i18n/routing';
import { alternatesFor } from '@/lib/site';

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/questline'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Nav' });
  return { title: t('questline'), alternates: alternatesFor('/questline', locale as Locale) };
}

export default async function Page({ params }: PageProps<'/[locale]/questline'>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Nav');
  return <Placeholder title={t('questline')} />;
}
