import type { Metadata } from 'next';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { alternatesFor } from '@/lib/site';
import { SIDE_CHECKED } from '@/data/side-quests';
import { SideQuestsView } from '@/components/side-quests/SideQuestsView';

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/pve/side-quests'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'SideQuests' });
  return {
    title: t('title'),
    description: t('metaDescription'),
    alternates: alternatesFor('/pve/side-quests', locale as Locale),
  };
}

export default async function SideQuestsPage({ params }: PageProps<'/[locale]/pve/side-quests'>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('SideQuests');
  const format = await getFormatter();
  const checked = format.dateTime(new Date(`${SIDE_CHECKED}T00:00:00Z`), {
    dateStyle: 'long',
    timeZone: 'UTC',
  });

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
          <h1 className="font-display text-2xl font-extrabold text-white uppercase">
            {t('title')}
          </h1>
          <p className="text-xs text-white/80">{t('checked', { date: checked })}</p>
        </div>
        {/* One sentence per line: the message has \n between them. */}
        <p className="max-w-3xl text-sm whitespace-pre-line text-white/80">{t('intro')}</p>
      </div>
      <SideQuestsView />
    </section>
  );
}
