'use client';

import type { GameEvent, GameMode } from '@stw/shared';
import { useQuery } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';
import { CardSkeletons } from '@/components/ui/skeleton';
import { fetchEvents } from '@/lib/api';
import { useNow } from './time';

/** "Ends soon" badge: less than this left. */
const SOON_MS = 3 * 86_400_000;

/**
 * An event as a poster card (BR and STW): the tournament card's look at the mode screen card's
 * size. Art from the event's `image`; without one, a gradient by kind (event, season, STW event,
 * STW weekly store). The weekly store resets every week, so it says when and never "ends soon".
 */
function EventCard({ event }: { event: GameEvent }) {
  const t = useTranslations('Events');
  const locale = useLocale();
  const now = useNow();
  const end = Date.parse(event.end);
  // "1 Nov – 5 Dec": local dates, the year only when it is not this one.
  const fmt = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    ...(new Date(end).getFullYear() !== new Date().getFullYear() ? { year: 'numeric' } : {}),
  });
  const weekly = event.kind === 'stw-weekly';
  const dates = weekly
    ? t('resetsOn', { date: fmt.format(new Date(end)) })
    : event.start
      ? fmt.formatRange(new Date(event.start), new Date(end))
      : t('until', { date: fmt.format(new Date(end)) });
  const soon = !weekly && now > 0 && end - now < SOON_MS;
  return (
    <li className="event-card" data-kind={event.kind}>
      <span className="tour-card-art">
        {event.image && (
          // Static export, local file: plain <img>.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={event.image} alt="" width={600} height={934} />
        )}
        <span className="tour-card-text">
          <span className="fn-title block text-2xl leading-tight">
            {event.name[locale === 'ru' ? 'ru' : 'en']}
          </span>
          <span
            title={new Date(end).toLocaleString(locale)}
            className="mt-1 block text-sm text-white/85"
          >
            {dates}
          </span>
        </span>
      </span>
      {soon && (
        <span className="tour-card-badge">
          <span className="intro-card-badge">{t('endsSoonBadge')}</span>
        </span>
      )}
    </li>
  );
}

/** The events of one game mode, soonest end first as the API sends them. */
export function EventsList({ mode }: { mode: GameMode }) {
  const t = useTranslations('Events');
  const q = useQuery({ queryKey: ['events'], queryFn: fetchEvents, staleTime: 5 * 60 * 1000 });
  if (q.isError) return <p className="text-destructive">{t('error')}</p>;
  if (!q.data)
    return (
      <CardSkeletons
        count={2}
        listClassName="flex w-full flex-wrap gap-4 sm:gap-6"
        cardClassName="event-card"
      />
    );
  const events = q.data.events.filter((e) => e.mode === mode);
  if (!events.length) return <p className="text-white/80">{t('noEvents')}</p>;
  return (
    <ul className="flex w-full flex-wrap gap-4 sm:gap-6">
      {events.map((e) => (
        <EventCard key={e.id} event={e} />
      ))}
    </ul>
  );
}
