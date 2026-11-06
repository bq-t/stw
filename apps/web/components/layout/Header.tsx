import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { LocaleSwitch } from './LocaleSwitch';

const NAV = [
  { href: '/', key: 'tracker' },
  { href: '/daily-quests', key: 'dailyQuests' },
  { href: '/questline', key: 'questline' },
  { href: '/side-quests', key: 'sideQuests' },
  { href: '/faq', key: 'faq' },
] as const;

export function Header() {
  const t = useTranslations();
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3">
        <Link href="/" className="font-display text-lg font-extrabold tracking-wide uppercase">
          StW <span className="text-vbucks">V-Bucks</span>
        </Link>
        <nav className="order-last -mx-4 flex w-full gap-1 overflow-x-auto px-4 text-sm whitespace-nowrap md:order-none md:mx-0 md:w-auto md:flex-1 md:px-0">
          {NAV.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="skew-tab rounded-none px-3 py-1.5 text-muted-foreground transition-colors hover:bg-surface-2 hover:text-text"
            >
              <span>{t(`Nav.${item.key}`)}</span>
            </Link>
          ))}
        </nav>
        <LocaleSwitch />
      </div>
    </header>
  );
}
