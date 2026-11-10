'use client';

import { stwItemName, uniqueLlamas, type StwCurrency, type StwOffer } from '@stw/shared';
import { useQuery } from '@tanstack/react-query';
import { Coins, Ticket } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { GameIcon } from '@/components/missions/GameIcon';
import { RewardChip } from '@/components/missions/RewardChip';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchStwShop } from '@/lib/api';
import { LlamasPanel } from './LlamasPanel';

export function CurrencyPrice({ price, currency }: { price: number; currency?: StwCurrency }) {
  const t = useTranslations('Shop');
  const locale = useLocale();
  const label = currency === 'gold' ? t('gold') : currency === 'xray' ? t('xray') : t('other');
  return (
    <span className="inline-flex items-center gap-1 text-sm font-bold whitespace-nowrap tabular-nums">
      {currency === 'gold' ? (
        <GameIcon
          group="rewards"
          names={['eventcurrency_scaling']}
          fallback={Coins}
          label={label}
          className="size-4 text-vbucks"
        />
      ) : (
        <Ticket aria-label={label} className="size-4" style={{ color: 'var(--rarity-rare)' }} />
      )}
      {price.toLocaleString(locale)}
    </span>
  );
}

function OfferRow({ offer }: { offer: StwOffer }) {
  const t = useTranslations('Shop');
  const locale = useLocale();
  const name =
    stwItemName(offer.templateId).en === offer.name
      ? stwItemName(offer.templateId)[locale === 'ru' ? 'ru' : 'en']
      : offer.name;
  const limits = [
    offer.weeklyLimit !== undefined && t('perWeek', { n: offer.weeklyLimit }),
    offer.dailyLimit !== undefined && t('perDay', { n: offer.dailyLimit }),
    offer.eventLimit !== undefined &&
      offer.eventLimit > 1 &&
      t('perEvent', { n: offer.eventLimit }),
  ].filter(Boolean);
  return (
    <li
      className="fn-tall flex items-center gap-3 bg-muted py-2"
      style={offer.rarity ? { ['--stripe' as string]: `var(--rarity-${offer.rarity})` } : undefined}
    >
      <RewardChip
        reward={{
          itemId: offer.templateId,
          quantity: offer.quantity,
          rarity: offer.rarity,
          isVbucks: false,
        }}
      />
      <span className="min-w-0 flex-1">
        <span className="font-semibold">{name}</span>
        {limits.length > 0 && (
          <span className="block text-xs text-muted-foreground">{limits.join(', ')}</span>
        )}
      </span>
      <CurrencyPrice price={offer.price} currency={offer.currency} />
    </li>
  );
}

function OfferList({ title, note, offers }: { title: string; note: string; offers: StwOffer[] }) {
  if (!offers.length) return null;
  return (
    <section className="flex flex-col gap-3">
      <header>
        <h2 className="font-display text-xl font-extrabold uppercase">{title}</h2>
        <p className="text-sm text-muted-foreground">{note}</p>
      </header>
      <ul className="grid gap-2 lg:grid-cols-2">
        {offers.map((o) => (
          <OfferRow key={o.offerId} offer={o} />
        ))}
      </ul>
    </section>
  );
}

export function StwShopView() {
  const t = useTranslations('Shop');
  const shop = useQuery({
    queryKey: ['shop', 'stw'],
    queryFn: fetchStwShop,
    staleTime: 5 * 60 * 1000,
  });

  if (shop.isError) return <p className="text-destructive">{t('error')}</p>;
  if (!shop.data) return <Skeleton className="h-96 w-full" />;
  const { weekly, event, llamas } = shop.data;

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <header>
          <h2 className="font-display text-xl font-extrabold uppercase">{t('llamas')}</h2>
          <p className="text-sm text-muted-foreground">{t('llamasNote')}</p>
        </header>
        <LlamasPanel offers={uniqueLlamas(llamas)} />
      </section>
      <OfferList title={t('weekly')} note={t('weeklyNote')} offers={weekly} />
      <OfferList title={t('event')} note={t('eventNote')} offers={event} />
    </div>
  );
}
