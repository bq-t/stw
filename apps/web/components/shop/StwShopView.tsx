'use client';

import {
  rewardCategory,
  stwItemInfo,
  stwItemName,
  uniqueLlamas,
  type StwCurrency,
  type StwOffer,
} from '@stw/shared';
import { gameItemName, iconNames, itemInfo, RARITY_ORDER, rarityOf } from '@stw/shared/items';
import { useQuery } from '@tanstack/react-query';
import { Coins, Ticket } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useState, useSyncExternalStore, type CSSProperties } from 'react';
import { CardOverlay } from '@/components/layout/CardOverlay';
import { GameIcon } from '@/components/missions/GameIcon';
import { REWARD_ICONS } from '@/components/missions/icons';
import { useGameNames } from '@/components/missions/labels';
import { CardSkeletons } from '@/components/ui/skeleton';
import { fetchStwShop } from '@/lib/api';
import { LlamaSkeletons, LlamasPanel } from './LlamasPanel';

/** 12345 → "12 345" in both languages: thousands split by a space, never a comma. */
export const spaced = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

export function CurrencyPrice({ price, currency }: { price: number; currency?: StwCurrency }) {
  const t = useTranslations('Shop');
  const label = currency === 'gold' ? t('gold') : currency === 'xray' ? t('xray') : t('other');
  return (
    <span className="inline-flex items-center gap-1 text-sm font-bold whitespace-nowrap tabular-nums">
      {currency === 'gold' ? (
        <GameIcon
          group="rewards"
          names={['eventcurrency_scaling']}
          fallback={Coins}
          label={label}
          className="size-5 text-vbucks"
        />
      ) : currency === 'xray' ? (
        <GameIcon
          group="rewards"
          names={['currency_xrayllama']}
          fallback={Ticket}
          label={label}
          className="size-5"
        />
      ) : (
        <Ticket aria-label={label} className="size-4" style={{ color: 'var(--rarity-rare)' }} />
      )}
      {spaced(price)}
    </span>
  );
}

/** The rarity backdrop and frame colours (the reward tile's --hi/--lo/--edge) as inline vars. */
function rarityVars(rarity: string | undefined): CSSProperties | undefined {
  if (!rarity) return undefined;
  return {
    ['--hi' as string]: `var(--rarity-${rarity}-hi)`,
    ['--lo' as string]: `var(--rarity-${rarity}-lo)`,
    ['--edge' as string]: `var(--rarity-${rarity})`,
  };
}

/**
 * The offer's rarity, worked out again from its ID: the stored shop keeps the rarity it was
 * parsed with, so a fix (mythic heroes) shows at once instead of after the next shop reset.
 */
const rarityOfOffer = (offer: StwOffer) => rarityOf(offer.templateId) ?? offer.rarity;

/** Rarest first (mythic → common), then those without a rarity; the shop's order within a rarity. */
function byRarity(offers: StwOffer[]): StwOffer[] {
  const rank = (o: StwOffer) => {
    const r = rarityOfOffer(o);
    return r ? RARITY_ORDER.indexOf(r) : -1;
  };
  return [...offers].sort((a, b) => rank(b) - rank(a));
}

/** Name, type line and limits of an offer, shared by the card and its open view. */
function useOfferText(offer: StwOffer) {
  const t = useTranslations('Shop');
  const locale = useLocale();
  const names = useGameNames();
  const ru = locale === 'ru';
  const generic = stwItemName(offer.templateId, names);
  // Epic's catalog names offers in English only: on /ru the game's own Russian name.
  const translated = generic.en === offer.name || (ru && !!gameItemName(offer.templateId, names));
  const name = translated ? generic[ru ? 'ru' : 'en'] : offer.name;
  const info = stwItemInfo(offer.templateId);
  // The card's type line is the kind only ("Hero"); class and weapon are in the open view.
  const type = t(`itemKind.${info.kind}`);
  const limit =
    offer.weeklyLimit !== undefined
      ? t('perWeek', { n: offer.weeklyLimit })
      : offer.dailyLimit !== undefined
        ? t('perDay', { n: offer.dailyLimit })
        : offer.eventLimit !== undefined && offer.eventLimit > 1
          ? t('perEvent', { n: offer.eventLimit })
          : null;
  return { name, type, info, limit };
}

/** What a card shows: also the copy that flies into the open view. */
function OfferFace({ offer }: { offer: StwOffer }) {
  const { name, type, limit } = useOfferText(offer);
  const category = rewardCategory(offer.templateId);
  return (
    <>
      <GameIcon
        group="rewards"
        names={iconNames(offer.templateId, category)}
        fallback={REWARD_ICONS[category]}
        className="stw-offer-icon fill-current"
      />
      {limit && <span className="stw-offer-limit">{limit}</span>}
      {offer.quantity > 1 && <span className="stw-offer-qty">×{spaced(offer.quantity)}</span>}
      <span className="stw-offer-text">
        <span className="block text-[0.7rem] font-semibold text-white/80 uppercase">{type}</span>
        <span className="fn-title block text-base leading-tight">{name}</span>
      </span>
      <span className="stw-offer-price">
        <CurrencyPrice price={offer.price} currency={offer.currency} />
      </span>
    </>
  );
}

/**
 * A gold shop item as a square card: the reward tile's rarity backdrop, a see-through frame in
 * the rarity colour, the icon down to the price strip, the limit and the amount in the top
 * corners, type and name centred over the art and the price on a dark strip at the bottom.
 */
function OfferCard({
  offer,
  hidden,
  onOpen,
}: {
  offer: StwOffer;
  hidden: boolean;
  onOpen: () => void;
}) {
  const { name } = useOfferText(offer);
  return (
    <li
      className="reward-tile stw-offer"
      role="button"
      tabIndex={0}
      aria-label={name}
      data-offer={offer.offerId}
      style={{ ...rarityVars(rarityOfOffer(offer)), opacity: hidden ? 0 : undefined }}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onOpen())}
    >
      <OfferFace offer={offer} />
    </li>
  );
}

/**
 * The open item: the card flies to the right, the details sit on the left (CardOverlay). The
 * card is bigger there, but its icon only grows by a quarter of its grid size (CSS): the icons
 * are small files and blur when blown up much.
 */
function OfferDetail({ offer, onClosed }: { offer: StwOffer; onClosed: () => void }) {
  const t = useTranslations();
  const locale = useLocale();
  const { name, info, limit } = useOfferText(offer);
  const description = itemInfo(offer.templateId)?.description?.[locale === 'ru' ? 'ru' : 'en'];
  const from = () =>
    document
      .querySelector(`.stw-offer[data-offer="${CSS.escape(offer.offerId)}"]`)
      ?.getBoundingClientRect() ?? null;
  // The icon's size in the grid, measured once when the card opens.
  const icon = document
    .querySelector(`.stw-offer[data-offer="${CSS.escape(offer.offerId)}"] .stw-offer-icon`)
    ?.getBoundingClientRect();
  const iconVars = icon
    ? { ['--icon-w' as string]: `${icon.width}px`, ['--icon-h' as string]: `${icon.height}px` }
    : undefined;
  const rows: [string, string][] = [
    [t('Shop.detail.type'), t(`Shop.itemKind.${info.kind}`)],
    ...(info.heroClass
      ? [[t('Shop.detail.heroClass'), t(`Shop.heroClass.${info.heroClass}`)] as [string, string]]
      : []),
    ...(info.weapon
      ? [[t('Shop.detail.weapon'), t(`Shop.weapon.${info.weapon}`)] as [string, string]]
      : []),
    ...(info.material
      ? [[t('Shop.detail.material'), t(`Shop.material.${info.material}`)] as [string, string]]
      : []),
    ...(rarityOfOffer(offer)
      ? [[t('Shop.detail.rarity'), t(`Rarity.${rarityOfOffer(offer)}`)] as [string, string]]
      : []),
    ...(offer.quantity > 1 ? [['×', spaced(offer.quantity)] as [string, string]] : []),
    ...(limit ? [[t('Shop.detail.limit'), limit] as [string, string]] : []),
  ];
  return (
    <CardOverlay
      label={name}
      from={from}
      slotClassName="stw-offer-slot"
      flyerClassName="reward-tile stw-offer stw-offer-open"
      flyerStyle={{ ...rarityVars(rarityOfOffer(offer)), ...iconVars }}
      flyer={<OfferFace offer={offer} />}
      onClosed={onClosed}
      info={(close) => (
        <>
          <h2 className="font-display text-2xl font-extrabold text-white uppercase">{name}</h2>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
            {rows.map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="text-muted-foreground">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          {description && <p className="text-sm text-white/80">{description}</p>}
          <button type="button" onClick={close} className="fn-tab mt-2 self-start px-4 py-1">
            <span>{t('Shop.close')}</span>
          </button>
        </>
      )}
    />
  );
}

function OfferList({
  title,
  note,
  offers,
  open,
  onOpen,
}: {
  title: string;
  note: string;
  offers: StwOffer[];
  open: string | null;
  onOpen: (id: string) => void;
}) {
  if (!offers.length) return null;
  return (
    <section className="flex flex-col gap-3">
      <header>
        <h2 className="font-display text-xl font-extrabold uppercase">{title}</h2>
        <p className="text-sm text-white/80">{note}</p>
      </header>
      <ul className="stw-offer-grid">
        {offers.map((o) => (
          <OfferCard
            key={o.offerId}
            offer={o}
            hidden={open === o.offerId}
            onOpen={() => onOpen(o.offerId)}
          />
        ))}
      </ul>
    </section>
  );
}

const noSubscribe = () => () => {};

export function StwShopView() {
  const t = useTranslations('Shop');
  const shop = useQuery({
    queryKey: ['shop', 'stw'],
    queryFn: fetchStwShop,
    staleTime: 5 * 60 * 1000,
  });
  const [open, setOpen] = useState<string | null>(null);
  const mounted = useSyncExternalStore(
    noSubscribe,
    () => true,
    () => false,
  );

  if (shop.isError) return <p className="text-destructive">{t('error')}</p>;
  if (!shop.data)
    return (
      // The loaded page's shape: the llamas' row, then the two gold shops of square cards.
      <div className="flex flex-col gap-8">
        <LlamaSkeletons />
        <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-x-14">
          {[0, 1].map((n) => (
            <CardSkeletons
              key={n}
              count={6}
              listClassName="stw-offer-grid"
              cardClassName="reward-tile stw-offer"
            />
          ))}
        </div>
      </div>
    );
  const { weekly, event, llamas } = shop.data;
  const opened = [...event, ...weekly].find((o) => o.offerId === open);

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <header>
          <h2 className="font-display text-xl font-extrabold uppercase">{t('llamas')}</h2>
          <p className="text-sm text-white/80">{t('llamasNote')}</p>
        </header>
        <LlamasPanel offers={uniqueLlamas(llamas)} />
      </section>
      {/* Event shop on the left, weekly on the right; one under the other on a phone. */}
      <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-x-14">
        <OfferList
          title={t('event')}
          note={t('eventNote')}
          offers={byRarity(event)}
          open={open}
          onOpen={setOpen}
        />
        <OfferList
          title={t('weekly')}
          note={t('weeklyNote')}
          offers={byRarity(weekly)}
          open={open}
          onOpen={setOpen}
        />
      </div>
      {mounted && opened && (
        <OfferDetail key={opened.offerId} offer={opened} onClosed={() => setOpen(null)} />
      )}
    </div>
  );
}
