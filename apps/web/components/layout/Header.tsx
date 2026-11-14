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
            Three columns: language on the left, the fish in the exact middle, the account on the
            right. lg+: the mode tabs sit on the right next to the account. Phones and tablets: the mode tabs
            get a centred row of their own under the fish (the right group is `contents` there,
            so its two parts take their own grid cells).
          */}
          <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-x-4 gap-y-2 px-4 py-3 lg:gap-x-6">
            <div className="justify-self-start">
              <LocaleSwitch />
            </div>
            <div className="col-start-2 row-start-1">
              <HeaderLogo label={t('Meta.siteName')} />
            </div>
            <div className="contents lg:col-start-3 lg:row-start-1 lg:flex lg:items-center lg:gap-3 lg:justify-self-end">
              <nav className="col-span-3 row-start-2 flex justify-center gap-2 py-1 text-base whitespace-nowrap lg:col-auto lg:row-auto lg:px-1.5">
                <ModeMenu />
              </nav>
              <div className="col-start-3 row-start-1 justify-self-end lg:col-auto lg:row-auto">
                <AccountButton />
              </div>
            </div>
          </div>
        </header>
      </div>
    </StickyHeader>
  );
}
