'use client';

import type { BrShopItem, BrShopSection } from '@stw/shared';
import { useQuery } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';
import { Skeleton } from '@/components/ui/skeleton';
import { VbucksIcon } from '@/components/missions/VbucksIcon';
import { fetchBrShop } from '@/lib/api';

const isTracks = (s: BrShopSection) => s.items.every((i) => i.kind === 'track');

function Price({ item }: { item: BrShopItem }) {
  const locale = useLocale();
  const n = (v: number) => v.toLocaleString(locale);
  return (
    <span className="inline-flex items-center gap-1 text-sm font-bold tabular-nums">
      <VbucksIcon className="size-3.5" />
      {n(item.price)}
      {item.regularPrice > item.price && (
        <span className="font-normal text-muted-foreground line-through">
          {n(item.regularPrice)}
        </span>
      )}
    </span>
  );
}

function Tile({ item, isNew }: { item: BrShopItem; isNew: boolean }) {
  const t = useTranslations('Shop');
  // Shop tile colours from the game, as a dark gradient behind the render.
  const [a = '3a3f4a', b = a] = item.colors.map((c) => c.slice(0, 6));
  return (
    <li className="fn-block flex flex-col overflow-hidden">
      <div
        className="relative aspect-square"
        style={{ background: `radial-gradient(circle at 50% 35%, #${b}cc, #${a}66 70%, #0000)` }}
      >
        {item.image && (
          // fortnite-api CDN, static export: plain <img>.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image}
            alt=""
            loading="lazy"
            className="absolute inset-0 size-full object-contain"
          />
        )}
        {isNew && (
          <span className="fn-badge absolute top-1.5 left-1.5 px-1.5 text-xs uppercase">
            {t('newItem')}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-0.5 p-2">
        <p className="text-sm leading-tight font-semibold">{item.name}</p>
        <p className="text-xs text-muted-foreground">
          {item.type}
          {item.kind === 'bundle' &&
            item.count > 1 &&
            ` · ${t('bundleItems', { count: item.count })}`}
        </p>
        <div className="mt-auto pt-1">
          <Price item={item} />
        </div>
      </div>
    </li>
  );
}

function TrackList({ section }: { section: BrShopSection }) {
  const t = useTranslations('Shop');
  return (
    <details className="fn-block p-3">
      <summary className="cursor-pointer font-display text-lg font-extrabold uppercase">
        {t('jamTracks', { count: section.items.length })}
      </summary>
      <ul className="mt-3 grid gap-x-6 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
        {section.items.map((item) => (
          <li key={item.offerId} className="flex items-center justify-between gap-2 text-sm">
            <span className="truncate">{item.name}</span>
            <Price item={item} />
          </li>
        ))}
      </ul>
    </details>
  );
}

export function BrShopView() {
  const t = useTranslations('Shop');
  const locale = useLocale();
  const shop = useQuery({
    queryKey: ['shop', 'br', locale],
    queryFn: () => fetchBrShop(locale),
    staleTime: 5 * 60 * 1000,
  });

  if (shop.isError) return <p className="text-destructive">{t('error')}</p>;
  if (!shop.data) return <Skeleton className="h-96 w-full" />;
  const { date, sections } = shop.data;
  const tracks = sections.filter(isTracks);

  return (
    <div className="flex flex-col gap-8">
      <p className="text-sm text-muted-foreground">{t('resets')}</p>
      {sections
        .filter((s) => !isTracks(s))
        .map((s) => (
          <section key={s.name} className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-extrabold uppercase">{s.name}</h2>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {s.items.map((item) => (
                <Tile key={item.offerId} item={item} isNew={item.inDate.slice(0, 10) === date} />
              ))}
            </ul>
          </section>
        ))}
      {tracks.map((s) => (
        <TrackList key={s.name} section={s} />
      ))}
    </div>
  );
}
