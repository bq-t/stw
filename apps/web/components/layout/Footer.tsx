import { useTranslations } from 'next-intl';

const CREATOR_CODE = process.env.NEXT_PUBLIC_CREATOR_CODE;

export function Footer() {
  const t = useTranslations('Footer');
  return (
    <footer className="border-t border-border bg-surface text-sm text-muted-foreground">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6">
        {CREATOR_CODE && (
          <p>
            {t('creatorCode')}:{' '}
            <span className="font-display font-semibold text-text">{CREATOR_CODE}</span>
          </p>
        )}
        <p>{t('disclaimer')}</p>
      </div>
    </footer>
  );
}
