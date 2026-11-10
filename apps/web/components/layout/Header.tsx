import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { AccountButton } from './AccountButton';
import { LocaleSwitch } from './LocaleSwitch';
import { StickyHeader } from './StickyHeader';

const NAV = [
  { href: '/', key: 'tracker' },
  { href: '/daily-quests', key: 'dailyQuests' },
  { href: '/questline', key: 'questline' },
  { href: '/side-quests', key: 'sideQuests' },
  { href: '/shop', key: 'shop' },
  { href: '/faq', key: 'faq' },
] as const;

export function Header() {
  const t = useTranslations();
  return (
    <StickyHeader>
      <header className="brand-fill slant-bottom">
        {/* md+: three columns, so the menu sits in the exact middle of the header. */}
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 md:grid md:grid-cols-[1fr_auto_1fr]">
          <Link
            href="/"
            className="shrink-0 md:justify-self-start xl:ml-30"
            aria-label={t('Meta.siteName')}
          >
            {/* Plain <img>: static export, local files. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo.webp"
              alt=""
              width={84}
              height={40}
              className="h-10 w-auto max-w-none"
            />
          </Link>
          <nav className="order-last -mx-4 flex w-full gap-2 overflow-x-auto px-4 py-1 text-base whitespace-nowrap md:order-none md:mx-0 md:w-auto md:px-1.5">
            {NAV.map((item) => (
              <Link key={item.key} href={item.href} className="fn-tab fn-tab-dim px-3.5 py-1">
                <span>{t(`Nav.${item.key}`)}</span>
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3 md:justify-self-end">
            <LocaleSwitch />
            <AccountButton />
          </div>
        </div>
      </header>
    </StickyHeader>
  );
}
