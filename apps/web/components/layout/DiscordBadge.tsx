import { useTranslations } from 'next-intl';

const DISCORD_URL = process.env.NEXT_PUBLIC_DISCORD_URL;

export function DiscordBadge() {
  const t = useTranslations('Discord');
  if (!DISCORD_URL) return null;
  return (
    <a
      href={DISCORD_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="skew-tab fixed right-4 bottom-4 rounded-sm border border-border bg-surface-2 px-4 py-2 text-sm font-semibold shadow-lg hover:border-vbucks"
    >
      <span>{t('join')}</span>
    </a>
  );
}
