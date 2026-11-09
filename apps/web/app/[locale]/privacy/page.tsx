import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { alternatesFor } from '@/lib/site';

const UPDATED = '2026-11-10';

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/privacy'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Privacy' });
  return { title: t('title'), alternates: alternatesFor('/privacy', locale as Locale) };
}

export default async function PrivacyPage({ params }: PageProps<'/[locale]/privacy'>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Privacy');
  const date = new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' }).format(
    new Date(`${UPDATED}T00:00:00Z`),
  );

  const sections = [
    {
      title: t('collectTitle'),
      items: [t('analytics'), t('hosting'), t('account'), t('settings')],
    },
    { title: t('notTitle'), items: [t('not')] },
    { title: t('linksTitle'), items: [t('links')] },
    { title: t('contactTitle'), items: [t('contact')] },
  ];

  return (
    <article className="flex max-w-2xl flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-2xl font-extrabold uppercase">{t('title')}</h1>
        <p className="text-sm text-muted-foreground">{t('updated', { date })}</p>
        <p>{t('intro')}</p>
      </header>
      {sections.map((s) => (
        <section key={s.title} className="flex flex-col gap-2">
          <h2 className="font-display text-lg font-extrabold uppercase">{s.title}</h2>
          {s.items.map((text) => (
            <p key={text} className="text-muted-foreground">
              {text}
            </p>
          ))}
        </section>
      ))}
    </article>
  );
}
