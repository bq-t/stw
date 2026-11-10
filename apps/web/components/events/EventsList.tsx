'use client';

import type { GameEvent } from '@stw/shared';
import { useQuery } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchEvents } from '@/lib/api';
import { useNow, useRelativeTime } from './time';

function EventRow({ event }: { event: GameEvent }) {
  const t = useTranslations('Events');
  const locale = useLocale();
  const rel = useRelativeTime();
  const time = rel(Date.parse(event.end), useNow());
  const when =
    event.kind === 'season'
      ? t('seasonEnds', { time })
      : event.kind === 'stw-weekly'
        ? t('resets', { time })
        : t('ends', { time });
  return (
    <li className="fn-tall flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 bg-muted py-2.5 [--stripe:var(--brand)]">
      <span className="font-semibold">{event.name[locale === 'ru' ? 'ru' : 'en']}</span>
      <span className="text-sm text-muted-foreground">
        <time dateTime={event.end} title={new Date(event.end).toLocaleString(locale)}>
          {when}
        </time>
      </span>
    </li>
  );
}

export function EventsList() {
  const t = useTranslations('Events');
  const q = useQuery({ queryKey: ['events'], queryFn: fetchEvents, staleTime: 5 * 60 * 1000 });
  if (q.isError) return <p className="text-destructive">{t('error')}</p>;
  if (!q.data) return <Skeleton className="h-60 w-full" />;
  const { events } = q.data;
  if (!events.length) return <p className="text-muted-foreground">{t('noEvents')}</p>;
  return (
    <div className="flex flex-col gap-8">
      {(['br', 'stw'] as const).map((mode) => {
        const list = events.filter((e) => e.mode === mode);
        if (!list.length) return null;
        return (
          <section key={mode} className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-extrabold uppercase">{t(mode)}</h2>
            <ul className="flex max-w-3xl flex-col gap-2">
              {list.map((e) => (
                <EventRow key={e.id} event={e} />
              ))}
            </ul>
          </section>
        );
      })}
      <p className="text-sm text-muted-foreground">{t('eventsNote')}</p>
    </div>
  );
}
