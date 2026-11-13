'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Skeleton } from '@/components/ui/skeleton';
import { IS_DEMO, fetchMe, loginUrl } from '@/lib/api';
import { EpicLinkPanel } from './EpicLinkPanel';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="fn-block flex flex-col gap-3 p-4">
      <h2 className="font-display text-lg font-extrabold uppercase">{title}</h2>
      {children}
    </section>
  );
}

export function AccountView() {
  const t = useTranslations('Epic');
  const tn = useTranslations('Notifications');
  const me = useQuery({ queryKey: ['me'], queryFn: fetchMe, staleTime: 10 * 60 * 1000 });

  if (IS_DEMO || me.data?.loginEnabled === false)
    return <p className="text-muted-foreground">{t('notConfigured')}</p>;
  if (me.isError) return <p className="text-destructive">{t('error')}</p>;
  if (!me.data) return <Skeleton className="h-40 w-full" />;
  const user = me.data.user;
  if (!user) {
    return (
      <Section title={t('discord')}>
        <p className="text-muted-foreground">{t('loginFirst')}</p>
        <div>
          <button
            data-fish-smile
            type="button"
            onClick={() => window.location.assign(loginUrl(window.location.href))}
            className="fn-tab fn-tab-active px-4 py-1.5"
          >
            <span>{tn('login')}</span>
          </button>
        </div>
      </Section>
    );
  }
  return (
    <>
      <Section title={t('discord')}>
        <div className="flex items-center gap-3">
          {/* Discord CDN, static export: plain <img>. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={user.avatarUrl} alt="" width={40} height={40} className="size-10" />
          <span className="font-semibold">{user.name}</span>
        </div>
      </Section>
      <Section title={t('title')}>
        <EpicLinkPanel />
      </Section>
    </>
  );
}
