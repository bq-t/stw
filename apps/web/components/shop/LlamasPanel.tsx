'use client';

import { rewardCategory, type LlamaItem, type StwLlama, type StwOffer } from '@stw/shared';
import { iconNames, rarityOf } from '@stw/shared/items';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { EpicLinkPanel } from '@/components/account/EpicLinkPanel';
import { CardOverlay } from '@/components/layout/CardOverlay';
import { GameIcon } from '@/components/missions/GameIcon';
import { REWARD_ICONS } from '@/components/missions/icons';
import { useItemName } from '@/components/missions/labels';
import { CardSkeletons } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ApiError, fetchEpicLink, fetchLlamas, fetchMe, loginUrl } from '@/lib/api';
import { CurrencyPrice, spaced } from './StwShopView';

/**
 * One reward of a llama: an upright tile on its rarity (the reward tile's backdrop, no frame),
 * the icon, the amount in the top right corner; the name in a tooltip.
 */
function RewardCard({ item }: { item: LlamaItem }) {
  const name = useItemName();
  const category = rewardCategory(item.templateId);
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <li
          tabIndex={0}
          className="reward-tile llama-reward"
          data-rarity={item.rarity ?? rarityOf(item.templateId)}
          aria-label={name(item.templateId)}
        >
          <GameIcon
            group="rewards"
            names={iconNames(item.templateId, category)}
            fallback={REWARD_ICONS[category]}
            className="llama-reward-icon fill-current"
          />
          {item.quantity > 1 && <span className="llama-reward-qty">×{spaced(item.quantity)}</span>}
        </li>
      </TooltipTrigger>
      <TooltipContent>{name(item.templateId)}</TooltipContent>
    </Tooltip>
  );
}

/** The rewards: a grid of tiles, then each "choice of one" pack with its options. */
function Rewards({ items }: { items: LlamaItem[] }) {
  const t = useTranslations('Shop');
  const plain = items.filter((i) => !i.options);
  const choices = items.filter((i) => i.options);
  return (
    <div className="flex flex-col gap-3">
      <ul className="llama-rewards">
        {plain.map((item, n) => (
          <RewardCard key={n} item={item} />
        ))}
      </ul>
      {choices.map((c, n) => (
        <div key={n} className="flex flex-col gap-1.5">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase">
            {t('choiceOfOne')}
          </h3>
          <ul className="llama-rewards">
            {c.options!.map((o, k) => (
              <RewardCard key={k} item={o} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

type LlamaTier = 'bronze' | 'silver' | 'gold';

/** A llama's tier from a word in its ID or name: the plain llama is the blue "bronze" one. */
function llamaTier(key: string): LlamaTier {
  return /gold/.test(key) ? 'gold' : /silver/.test(key) ? 'silver' : 'bronze';
}

/**
 * Llama pictures (public/images/llamas) by a word in the llama's ID or name; else the plain one.
 * Silver and gold have one picture each, used for every silver or gold llama whatever its kind.
 */
const LLAMA_IMAGES: [RegExp, string][] = [
  [/bronze_weapons|weapon llama/, 'weapon'],
  [/bronze|upgrade/, 'upgrade'],
  [/melee/, 'melee'],
  [/ranged/, 'ranged'],
  [/trap/, 'trap'],
  [/jackpot|troll/, 'troll'],
  [/people|hero|survivor|worker|defender|manager/, 'people'],
];

function llamaLook(...keys: (string | undefined)[]): { image: string; tier: LlamaTier } {
  const key = keys.filter(Boolean).join(' ').toLowerCase();
  const tier = llamaTier(key);
  const kind =
    tier !== 'bronze' ? tier : (LLAMA_IMAGES.find(([re]) => re.test(key))?.[1] ?? 'llama');
  return { image: `/images/llamas/${kind}.webp`, tier };
}

interface LlamaView {
  id: string;
  name: string;
  image: string;
  tier: LlamaTier;
  offer?: Pick<StwOffer, 'price' | 'currency'>;
  items: LlamaItem[];
}

/** What a llama card shows (also the copy that flies into the open view). */
function LlamaFace({ llama }: { llama: LlamaView }) {
  return (
    <>
      {/* Plain <img>: static export, local file. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={llama.image} alt="" width={400} height={400} className="llama-card-img" />
      <span className="stw-offer-text">
        <span className="fn-title block text-xl leading-tight">{llama.name}</span>
      </span>
      {llama.offer && (
        <span className="stw-offer-price">
          <CurrencyPrice price={llama.offer.price} currency={llama.offer.currency} />
        </span>
      )}
    </>
  );
}

/**
 * A llama card, in the middle of its half: the mode screen card's shape, the backdrop by the
 * llama's tier (blue, purple silver, gold), the name and the price at the bottom. Hover: the
 * llama grows and tips back to the left, as in the game. A click opens the rewards.
 */
function LlamaCard({
  llama,
  hidden = false,
  onOpen,
}: {
  llama: LlamaView;
  hidden?: boolean;
  onOpen?: () => void;
}) {
  return (
    <li className="flex justify-center">
      <div
        className={`reward-tile stw-offer llama-card llama-${llama.tier}`}
        role={onOpen ? 'button' : undefined}
        tabIndex={onOpen ? 0 : undefined}
        aria-label={llama.name}
        data-llama={llama.id}
        style={hidden ? { opacity: 0 } : undefined}
        onClick={onOpen}
        onKeyDown={(e) => {
          if (onOpen && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onOpen();
          }
        }}
      >
        <LlamaFace llama={llama} />
      </div>
    </li>
  );
}

/** The open llama: its rewards on the left, the card on the right (CardOverlay). */
function LlamaDetail({ llama, onClosed }: { llama: LlamaView; onClosed: () => void }) {
  const t = useTranslations('Shop');
  const from = () =>
    document
      .querySelector(`.llama-card[data-llama="${CSS.escape(llama.id)}"]`)
      ?.getBoundingClientRect() ?? null;
  return (
    <CardOverlay
      label={llama.name}
      from={from}
      slotClassName="llama-slot"
      flyerClassName={`reward-tile stw-offer llama-card llama-open llama-${llama.tier}`}
      flyer={<LlamaFace llama={llama} />}
      onClosed={onClosed}
      info={(close) => (
        <>
          <h2 className="font-display text-2xl font-extrabold text-white uppercase">
            {llama.name}
          </h2>
          <h3 className="mt-1 text-sm font-semibold text-muted-foreground uppercase">
            {t('llamaContents')}
          </h3>
          <Rewards items={llama.items} />
          <button type="button" onClick={close} className="fn-tab mt-2 self-start px-4 py-1">
            <span>{t('close')}</span>
          </button>
        </>
      )}
    />
  );
}

/**
 * Behind the blur until the viewer logs in and links Epic: a row of llamas across the whole
 * width (as many whole cards as fit), the login window over its middle. The shop's Upgrade
 * Llama in its looks (blue, gold, silver) and the shop's other llamas, at their prices. Not
 * anyone's real llamas, just what the section looks like.
 */
function Locked({ offers, children }: { offers: StwOffer[]; children: React.ReactNode }) {
  const upgrade = offers.find((o) => /cardpack_bronze$/i.test(o.templateId)) ?? offers[0];
  const others = offers.filter((o) => o !== upgrade);
  const view = (id: string, name: string, look: string, offer?: StwOffer): LlamaView => ({
    id,
    name,
    ...llamaLook(look),
    offer,
    items: [],
  });
  const name = upgrade?.name ?? 'Upgrade Llama';
  const shown: LlamaView[] = [
    view('blue', name, 'upgrade', upgrade),
    view('gold', 'Gold Llama', 'gold', upgrade),
    ...others.map((o) => view(o.offerId, o.name, `${o.templateId} ${o.name}`, o)),
    view('silver', 'Silver Llama', 'silver', upgrade),
    view('blue-2', name, 'upgrade', upgrade),
    view('gold-2', 'Gold Llama', 'gold', upgrade),
  ];
  return (
    <div className="relative">
      <ul aria-hidden className="llama-locked pointer-events-none select-none" inert>
        {shown.map((l) => (
          <LlamaCard key={l.id} llama={l} />
        ))}
      </ul>
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="fn-block flex max-w-md flex-col items-center gap-3 bg-surface p-5 text-center shadow-[0_12px_32px_rgb(0_0_0/0.55)] ring-1 ring-white/25">
          {children}
        </div>
      </div>
    </div>
  );
}

const noSubscribe = () => () => {};

/** Loading: llama-shaped cards in the llamas' row. */
export function LlamaSkeletons() {
  return (
    <CardSkeletons
      count={2}
      listClassName="flex flex-wrap gap-6"
      cardClassName="reward-tile stw-offer llama-card"
    />
  );
}

/** The viewer's llamas with their rolls; a card opens its rewards. */
function LlamaList({ list, offers }: { list: StwLlama[]; offers: StwOffer[] }) {
  const t = useTranslations('Shop');
  const [open, setOpen] = useState<string | null>(null);
  const mounted = useSyncExternalStore(
    noSubscribe,
    () => true,
    () => false,
  );
  const views: LlamaView[] = list.map((l) => ({
    id: l.offerId,
    name: l.name ?? t('llamas'),
    // The picture by the catalog offer's ID when it is there, else by the name.
    ...llamaLook(
      offers.find((o) => o.offerId === l.offerId || o.name === l.name)?.templateId,
      l.name,
    ),
    offer: l.price !== undefined ? { price: l.price, currency: l.currency ?? 'xray' } : undefined,
    items: l.items,
  }));
  const opened = views.find((v) => v.id === open);
  if (!views.length) return <p className="text-muted-foreground">{t('llamasEmpty')}</p>;
  return (
    <>
      <ul className="flex flex-wrap gap-6">
        {views.map((v) => (
          <LlamaCard key={v.id} llama={v} hidden={open === v.id} onOpen={() => setOpen(v.id)} />
        ))}
      </ul>
      {mounted && opened && (
        <LlamaDetail key={opened.id} llama={opened} onClosed={() => setOpen(null)} />
      )}
    </>
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
  if (!llamas.data) return <LlamaSkeletons />;
  const list: StwLlama[] = llamas.data.llamas;
  return (
    <div className="flex flex-col items-start gap-3">
      <LlamaList list={list} offers={offers} />
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

  if (!me.data) return <LlamaSkeletons />;
  if (!user)
    return (
      <Locked offers={offers}>
        <p className="text-sm">{t('llamasLogin')}</p>
        {me.data.loginEnabled && (
          <button
            data-fish-smile
            type="button"
            onClick={() => window.location.assign(loginUrl(window.location.href))}
            className="fn-tab px-4 py-1.5"
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
