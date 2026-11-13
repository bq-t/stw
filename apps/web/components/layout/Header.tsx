import { useTranslations } from 'next-intl';
import { AccountButton } from './AccountButton';
import { HeaderLogo } from './HeaderLogo';
import { LocaleSwitch } from './LocaleSwitch';
import { ModeMenu } from './ModeMenu';
import { StickyHeader } from './StickyHeader';

export function Header() {
  const t = useTranslations();
  return (
    <StickyHeader>
      <div className="brand-shadow-down">
        <header className="site-header brand-fill slant-bottom">
          {/*
            md+: three columns: language on the left, the fish in the exact middle, mode tabs and
            the account on the right. Phones: the fish, language and account in the first row,
            the mode tabs in a row of their own (the right group is `contents` there).
          */}
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 md:grid md:grid-cols-[1fr_auto_1fr]">
            <div className="order-2 md:order-none md:justify-self-start">
              <LocaleSwitch />
            </div>
            <div className="order-1 md:order-none">
              <HeaderLogo label={t('Meta.siteName')} />
            </div>
            <div className="contents md:flex md:items-center md:gap-3 md:justify-self-end">
              <nav className="order-last -mx-4 flex w-full gap-2 overflow-x-auto px-4 py-1 text-base whitespace-nowrap md:order-none md:mx-0 md:w-auto md:px-1.5">
                <ModeMenu />
              </nav>
              <div className="order-3 md:order-none">
                <AccountButton />
              </div>
            </div>
          </div>
        </header>
      </div>
    </StickyHeader>
  );
}
