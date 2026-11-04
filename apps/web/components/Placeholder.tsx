import { useTranslations } from 'next-intl';

export function Placeholder({ title }: { title: string }) {
  const t = useTranslations('Placeholder');
  return (
    <section className="flex flex-col gap-3">
      <h1 className="font-display text-2xl font-extrabold uppercase">{title}</h1>
      <p className="text-muted-foreground">{t('soon')}</p>
    </section>
  );
}
