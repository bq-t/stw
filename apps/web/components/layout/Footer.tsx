import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

const CREATOR_CODE = process.env.NEXT_PUBLIC_CREATOR_CODE;

export function Footer() {
  const t = useTranslations('Footer');
  return (
    <div className="brand-shadow-up">
      <footer className="brand-fill slant-top text-sm font-semibold text-white! [text-shadow:0_1px_1px_rgb(0_0_0/0.25)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6">
          {CREATOR_CODE && (
            <p>
              {t('creatorCode')}:{' '}
              <span className="font-display font-extrabold">{CREATOR_CODE}</span>
            </p>
          )}
          <p>{t('disclaimer')}</p>
          <p>
            <Link href="/privacy" className="underline underline-offset-4 hover:decoration-2">
              {t('privacy')}
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
