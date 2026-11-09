'use client';

import {
  DEFAULT_FILTERS,
  MIN_QTY_MAX,
  SUBSCRIBABLE_ITEMS,
  type MissionFilters as Filters,
  type SubscriptionFilter,
} from '@stw/shared';
import { ITEMS } from '@stw/shared/items';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import { useFormatter, useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { DISCORD_URL } from '@/components/layout/DiscordButton';
import { MissionFilters } from '@/components/missions/MissionFilters';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ApiError,
  IS_DEMO,
  createSubscription,
  deleteSubscription,
  fetchMe,
  fetchSubscriptions,
  loginUrl,
  testSubscription,
  type SubscriptionsResponse,
} from '@/lib/api';

/** Subscriptions get every alert by default, not only the tracker's mini-bosses. */
const START_FILTERS: Filters = { ...DEFAULT_FILTERS, alert: 'alerts' };

type Notice = { tone: 'ok' | 'error'; text: string; link?: { href: string; label: string } } | null;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="fn-block flex flex-col gap-3 p-4">
      <h2 className="font-display text-lg font-extrabold uppercase">{title}</h2>
      {children}
    </section>
  );
}

function errorText(err: unknown, t: ReturnType<typeof useTranslations<'Notifications'>>): string {
  const code = err instanceof ApiError ? err.code : '';
  if (code === 'cannot dm') return t('cannotDm');
  if (code === 'too soon') return t('tooSoon');
  if (code === 'limit') return t('limit');
  return t('error');
}

function SubscriptionList({ data }: { data: SubscriptionsResponse }) {
  const t = useTranslations('Notifications');
  const format = useFormatter();
  const locale = useLocale();
  const client = useQueryClient();
  const remove = useMutation({
    mutationFn: (id: number) => deleteSubscription(id, locale),
    onSuccess: (next) => client.setQueryData(['subscriptions', locale], next),
  });

  return (
    <Section title={t('listTitle')}>
      <p className="text-sm text-muted-foreground">
        {t('count', { count: data.subscriptions.length, max: data.max })}
      </p>
      {data.subscriptions.length === 0 ? (
        <p className="text-muted-foreground">{t('empty')}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {data.subscriptions.map((s) => (
            <li key={s.id} className="flex items-start gap-3 bg-muted px-3 py-2">
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="font-semibold">{s.summary}</span>
                <span className="text-xs text-muted-foreground">
                  {s.lastSentAt
                    ? t('lastSent', {
                        date: format.dateTime(new Date(s.lastSentAt), {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        }),
                      })
                    : t('neverSent')}
                </span>
                {s.lastError && <span className="text-xs text-destructive">{s.lastError}</span>}
              </div>
              <button
                type="button"
                onClick={() => remove.mutate(s.id)}
                disabled={remove.isPending}
                title={t('delete')}
                className="fn-chip h-7 px-2"
              >
                <Trash2 aria-hidden className="size-4" />
                <span className="sr-only">{t('delete')}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

function NewSubscription({ full }: { full: boolean }) {
  const t = useTranslations('Notifications');
  const locale = useLocale() as 'en' | 'ru';
  const client = useQueryClient();
  const [filters, setFilters] = useState<Filters>(START_FILTERS);
  const [item, setItem] = useState('');
  const [min, setMin] = useState('');
  const [notice, setNotice] = useState<Notice>(null);

  const filter = (): SubscriptionFilter => {
    const f: SubscriptionFilter = { ...filters };
    if (item) f.item = item;
    const n = Number.parseInt(min, 10);
    if (Number.isFinite(n) && n > 1) f.minQty = Math.min(n, MIN_QTY_MAX);
    return f;
  };

  const save = useMutation({
    mutationFn: () => createSubscription(filter(), locale),
    onSuccess: (next) => {
      client.setQueryData(['subscriptions', locale], next);
      setFilters(START_FILTERS);
      setItem('');
      setMin('');
      setNotice(null);
    },
    onError: (err) => setNotice({ tone: 'error', text: errorText(err, t) }),
  });
  const test = useMutation({
    mutationFn: () => testSubscription(filter(), locale),
    onSuccess: (r) => setNotice({ tone: 'ok', text: t('testSent', { count: r.found }) }),
    onError: (err) => {
      const installUrl = err instanceof ApiError ? err.data.installUrl : undefined;
      setNotice({
        tone: 'error',
        text: errorText(err, t),
        link: typeof installUrl === 'string' ? { href: installUrl, label: t('addApp') } : undefined,
      });
    },
  });

  return (
    <Section title={t('newTitle')}>
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground">{t('item')}</span>
          <select
            value={item}
            onChange={(e) => setItem(e.target.value)}
            className="h-8 min-w-56 bg-muted px-2"
          >
            <option value="">{t('anyItem')}</option>
            {SUBSCRIBABLE_ITEMS.map((id) => (
              <option key={id} value={id}>
                {ITEMS[id]?.name[locale] ?? id}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground">{t('min')}</span>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={MIN_QTY_MAX}
            value={min}
            onChange={(e) => setMin(e.target.value)}
            placeholder="1"
            className="h-8 w-24 bg-muted px-2 tabular-nums"
          />
        </label>
      </div>
      <MissionFilters value={filters} onChange={setFilters} />
      <p className="text-sm text-muted-foreground">{t('filtersHint')}</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => save.mutate()}
          disabled={!full || save.isPending}
          className="fn-tab fn-tab-active px-4 py-1.5"
        >
          <span>{t('save')}</span>
        </button>
        <button
          type="button"
          onClick={() => test.mutate()}
          disabled={test.isPending}
          className="fn-tab px-4 py-1.5"
        >
          <span>{t('test')}</span>
        </button>
      </div>
      {!full && <p className="text-sm text-muted-foreground">{t('limit')}</p>}
      {notice && (
        <div role="status" className="flex flex-col items-start gap-2">
          <p
            className={notice.tone === 'ok' ? 'text-sm text-accent-ui' : 'text-sm text-destructive'}
          >
            {notice.text}
          </p>
          {notice.link && (
            <a
              href={notice.link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="fn-tab fn-tab-active px-4 py-1.5"
            >
              <span>{notice.link.label}</span>
            </a>
          )}
        </div>
      )}
    </Section>
  );
}

function DmHelp({ installUrl }: { installUrl: string }) {
  const t = useTranslations('Notifications');
  return (
    <Section title={t('dmTitle')}>
      <p className="text-muted-foreground">{t('dmText')}</p>
      <div className="flex flex-wrap gap-2">
        <a
          href={installUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="fn-tab fn-tab-active px-4 py-1.5"
        >
          <span>{t('addApp')}</span>
        </a>
        <a
          href={DISCORD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="fn-tab px-4 py-1.5"
        >
          <span>{t('joinServer')}</span>
        </a>
      </div>
      <p className="text-sm text-muted-foreground">{t('serverNote')}</p>
    </Section>
  );
}

function Subscriptions() {
  const locale = useLocale();
  const t = useTranslations('Notifications');
  const { data, isError } = useQuery({
    queryKey: ['subscriptions', locale],
    queryFn: () => fetchSubscriptions(locale),
  });
  if (isError) return <p className="text-destructive">{t('error')}</p>;
  if (!data) return <Skeleton className="h-40 w-full" />;
  return (
    <>
      <SubscriptionList data={data} />
      <NewSubscription full={data.subscriptions.length < data.max} />
      <DmHelp installUrl={data.installUrl} />
    </>
  );
}

export function NotificationsView() {
  const t = useTranslations('Notifications');
  const me = useQuery({ queryKey: ['me'], queryFn: fetchMe, staleTime: 10 * 60 * 1000 });

  if (IS_DEMO) return <p className="text-muted-foreground">{t('demo')}</p>;
  if (me.isError) return <p className="text-destructive">{t('error')}</p>;
  if (!me.data) return <Skeleton className="h-40 w-full" />;
  if (!me.data.loginEnabled) return <p className="text-muted-foreground">{t('demo')}</p>;
  if (!me.data.user) {
    return (
      <Section title={t('loginTitle')}>
        <p className="text-muted-foreground">{t('loginText')}</p>
        <div>
          <button
            type="button"
            onClick={() => window.location.assign(loginUrl(window.location.href))}
            className="fn-tab px-4 py-1.5"
          >
            <span>{t('login')}</span>
          </button>
        </div>
      </Section>
    );
  }
  return <Subscriptions />;
}
