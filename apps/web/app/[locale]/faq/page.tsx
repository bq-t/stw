import type { Metadata } from 'next';
import { ZONES } from '@stw/shared';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { alternatesFor } from '@/lib/site';
import { questVbucks as questlineVbucks } from '@/data/questline';
import { QUESTS } from '@/data/questline-quests';
import { CHALLENGES, SIDE_QUESTS, questVbucks, seriesVbucks } from '@/data/side-quests';
import { VbucksIcon } from '@/components/missions/VbucksIcon';

export async function generateMetadata({ params }: PageProps<'/[locale]/faq'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Faq' });
  return {
    title: t('title'),
    description: t('metaDescription'),
    alternates: alternatesFor('/faq', locale as Locale),
  };
}

// One-time sources, counted from the same data as their pages.
const QUESTLINE = ZONES.flatMap((z) => QUESTS[z]).reduce((s, q) => s + questlineVbucks(q), 0);
const SSD = ZONES.flatMap((z) => SIDE_QUESTS[z]).reduce((s, q) => s + questVbucks(q), 0);
const CHALLENGE = CHALLENGES.reduce((s, c) => s + seriesVbucks(c), 0);
const LOK_QUEST = SIDE_QUESTS.lok.find((q) => questVbucks(q) > 0);
const LOK = LOK_QUEST ? questVbucks(LOK_QUEST) : 0;

type Row = { key: string; href: string; amount: string };

const ROWS: Row[] = [
  { key: 'daily', href: '/daily-quests', amount: '100+' },
  { key: 'alerts', href: '/?alert=vbucks', amount: '50+' },
  { key: 'questline', href: '/questline', amount: String(QUESTLINE) },
  { key: 'ssd', href: '/side-quests#group-stonewood', amount: String(SSD) },
  { key: 'challenges', href: '/side-quests#challenges', amount: String(CHALLENGE) },
  { key: 'lok', href: `/side-quests#${LOK_QUEST?.id ?? 'group-lok'}`, amount: String(LOK) },
  { key: 'events', href: '', amount: '0' },
];

export default async function FaqPage({ params }: PageProps<'/[locale]/faq'>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Faq');
  const nf = new Intl.NumberFormat(locale === 'ru' ? 'ru-RU' : 'en-US');

  return (
    <section className="flex max-w-4xl flex-col gap-6">
      <h1 className="font-display text-2xl font-extrabold uppercase">{t('title')}</h1>

      <section id="vbucks" aria-label={t('vbucks')} className="flex flex-col gap-10">
        <article id="how-many" className="flex flex-col gap-2">
          <h3 className="text-base font-semibold">{t('qHowMuch')}</h3>
          {/* One sentence per line: the answers have 
 between sentences. */}
          <p className="text-sm whitespace-pre-line text-muted-foreground">{t('aHowMuch')}</p>
          <div className="fn-table overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-2 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-2 font-semibold">{t('source')}</th>
                  <th className="px-4 py-2 text-right font-semibold">{t('amount')}</th>
                  <th className="hidden px-4 py-2 font-semibold sm:table-cell">{t('how')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {ROWS.map((r) => (
                  <tr key={r.key}>
                    <td className="px-4 py-2 align-top">
                      {r.href ? (
                        <Link
                          href={r.href}
                          className="font-medium text-accent-ui underline-offset-2 hover:underline"
                        >
                          {t(r.key)}
                        </Link>
                      ) : (
                        <span className="font-medium">{t(r.key)}</span>
                      )}
                      <p className="mt-0.5 text-xs text-muted-foreground sm:hidden">
                        {t(`${r.key}How`)}
                      </p>
                    </td>
                    <td className="px-4 py-2 text-right align-top whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 font-display font-extrabold tabular-nums">
                        <VbucksIcon className="size-3.5" />
                        {/^\d+$/.test(r.amount) ? nf.format(+r.amount) : r.amount}
                      </span>
                    </td>
                    <td className="hidden px-4 py-2 align-top text-xs text-muted-foreground sm:table-cell">
                      {t(`${r.key}How`)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm font-semibold">
            {t('once', { amount: nf.format(QUESTLINE + SSD + CHALLENGE + LOK) })}
          </p>
        </article>

        <article id="founders" className="flex flex-col gap-2">
          <h3 className="text-base font-semibold">{t('qWho')}</h3>
          <p className="text-sm whitespace-pre-line text-muted-foreground">{t('aWho')}</p>
        </article>
      </section>
    </section>
  );
}
