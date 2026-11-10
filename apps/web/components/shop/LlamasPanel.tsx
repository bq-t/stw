'use client';

import type { LlamaItem, StwLlama, StwOffer } from '@stw/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { EpicLinkPanel } from '@/components/account/EpicLinkPanel';
import { RewardChip } from '@/components/missions/RewardChip';
import { useItemName } from '@/components/missions/labels';
import { Skeleton } from '@/components/ui/skeleton';
import { ApiError, fetchEpicLink, fetchLlamas, fetchMe, loginUrl } from '@/lib/api';
import { CurrencyPrice } from './StwShopView';

function ItemLine({ item }: { item: LlamaItem }) {
  const t = useTranslations('Shop');
  const name = useItemName();
  return (
    <li className="flex flex-col gap-1">
      <span className="flex items-center gap-2 text-sm">
        <RewardChip
          reward={{
            itemId: item.templateId,
            quantity: item.quantity,
            rarity: item.rarity,
            isVbucks: false,
          }}
        />
        <span>{name(item.templateId)}</span>
        {item.options && <span className="text-muted-foreground">{t('choice')}</span>}
      </span>
      {item.options && (
        <ul className="ml-6 flex flex-col gap-1">
          {item.options.map((o, n) => (
            <ItemLine key={n} item={o} />
          ))}
        </ul>
      )}
    </li>
  );
}

/** One llama card: name and price, then the contents (or a placeholder to blur). */
function LlamaCard({
  name,
  offer,
  items,
}: {
  name: string;
  offer?: Pick<StwOffer, 'price' | 'currency'>;
  items: LlamaItem[];
}) {
  return (
    <li className="fn-block flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold">{name}</h3>
        {offer && <CurrencyPrice price={offer.price} currency={offer.currency} />}
      </div>
      <ul className="flex flex-col gap-1.5">
        {items.map((item, n) => (
          <ItemLine key={n} item={item} />
        ))}
      </ul>
    </li>
  );
}

/** Made-up contents behind the blur: what a roll looks like, not anyone's real one. */
const PLACEHOLDER: LlamaItem[] = [
  { templateId: 'Worker:workerbasic_uc_t01', quantity: 1, rarity: 'uncommon' },
  { templateId: 'Hero:hid_commando_guntough_uc_t01', quantity: 1, rarity: 'uncommon' },
  { templateId: 'Schematic:sid_pistol_semiauto_r_ore_t01', quantity: 1, rarity: 'rare' },
  { templateId: 'Worker:workerbasic_r_t01', quantity: 1, rarity: 'rare' },
  { templateId: 'AccountResource:schematicxp', quantity: 800 },
];

function Locked({ offers, children }: { offers: StwOffer[]; children: React.ReactNode }) {
  return (
    <div className="relative">
      <ul
        aria-hidden
        className="pointer-events-none grid gap-3 blur-sm select-none sm:grid-cols-2"
        inert
      >
        {(offers.length ? offers : [undefined]).map((o, n) => (
          <LlamaCard key={n} name={o?.name ?? '—'} offer={o} items={PLACEHOLDER} />
        ))}
      </ul>
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="fn-block flex max-w-md flex-col items-start gap-3 bg-background/95 p-4 shadow-lg">
          {children}
        </div>
      </div>
    </div>
  );
}

function Contents({ offers }: { offers: StwOffer[] }) {
  const t = useTranslations('Shop');
  const client = useQueryClient();
  const llamas = useQuery({
    queryKey: ['llamas'],
    queryFn: fetchLlamas,
    staleTime: 60 * 1000,
    retry: false,
  });

  const code = llamas.error instanceof ApiError ? llamas.error.code : '';
  const gone = code === 'gone' || code === 'not linked';
  useEffect(() => {
    // The link is gone on Epic's side (the Worker deleted it): back to the link button.
    if (gone) void client.invalidateQueries({ queryKey: ['epic'] });
  }, [gone, client]);

  if (llamas.isError) {
    if (gone) {
      return (
        <Locked offers={offers}>
          <p className="text-sm">{t('llamasGone')}</p>
        </Locked>
      );
    }
    return <p className="text-destructive">{t('llamasError')}</p>;
  }
  if (!llamas.data) return <Skeleton className="h-60 w-full" />;
  const list: StwLlama[] = llamas.data.llamas;
  return (
    <div className="flex flex-col items-start gap-3">
      {list.length ? (
        <ul className="grid w-full gap-3 sm:grid-cols-2">
          {list.map((l) => (
            <LlamaCard
              key={l.offerId}
              name={l.name ?? t('llamas')}
              offer={
                l.price !== undefined
                  ? { price: l.price, currency: l.currency ?? 'xray' }
                  : undefined
              }
              items={l.items}
            />
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground">{t('llamasEmpty')}</p>
      )}
      <button
        type="button"
        onClick={() => void llamas.refetch()}
        disabled={llamas.isFetching}
        className="fn-tab px-4 py-1.5"
      >
        <span>{t('refresh')}</span>
      </button>
    </div>
  );
}

/**
 * X-ray llama contents: personal, so shown only with a Discord login and a linked Epic
 * account. Without them the cards are blurred placeholders with the next step on top.
 */
export function LlamasPanel({ offers }: { offers: StwOffer[] }) {
  const t = useTranslations('Shop');
  const me = useQuery({ queryKey: ['me'], queryFn: fetchMe, staleTime: 10 * 60 * 1000 });
  const user = me.data?.user;
  const epic = useQuery({
    queryKey: ['epic'],
    queryFn: fetchEpicLink,
    retry: false,
    enabled: Boolean(user),
  });

  if (!me.data) return <Skeleton className="h-60 w-full" />;
  if (!user)
    return (
      <Locked offers={offers}>
        <p className="text-sm">{t('llamasLogin')}</p>
        {me.data.loginEnabled && (
          <button
            type="button"
            onClick={() => window.location.assign(loginUrl(window.location.href))}
            className="fn-tab fn-tab-active px-4 py-1.5"
          >
            <span>{t('loginButton')}</span>
          </button>
        )}
      </Locked>
    );
  if (epic.data?.status === 'linked') return <Contents offers={offers} />;
  return (
    <Locked offers={offers}>
      <p className="text-sm">{t('llamasLink')}</p>
      <EpicLinkPanel compact />
    </Locked>
  );
}
