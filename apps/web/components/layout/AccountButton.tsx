'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Link } from '@/i18n/navigation';
import { fetchMe, loginUrl, logout } from '@/lib/api';

/**
 * Header account control: "Log in" (Discord) or the user's avatar with a menu.
 * Renders nothing until /api/me says login is enabled, so the static HTML and
 * the demo mode stay as they were.
 */
export function AccountButton() {
  const t = useTranslations('Account');
  const client = useQueryClient();
  const { data } = useQuery({
    queryKey: ['me'],
    queryFn: fetchMe,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
  const out = useMutation({
    mutationFn: logout,
    onSettled: () => client.invalidateQueries({ queryKey: ['me'] }),
  });

  if (!data?.loginEnabled) return null;

  if (!data.user) {
    return (
      <button
        type="button"
        onClick={() => {
          // Drop a leftover ?login=… from a failed attempt before coming back.
          const back = new URL(window.location.href);
          back.searchParams.delete('login');
          window.location.assign(loginUrl(back.toString()));
        }}
        title={t('loginWith')}
        className="fn-tab px-2.5 py-1 text-sm"
      >
        <span>{t('login')}</span>
      </button>
    );
  }

  const { user } = data;
  return (
    <Popover>
      <PopoverTrigger
        aria-label={t('menu')}
        className="fn-tab flex items-center gap-2 py-0.5 pr-2.5 pl-0.5 text-sm"
      >
        <span className="flex items-center gap-2">
          {/* Discord CDN, static export: plain <img>. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={user.avatarUrl} alt="" width={28} height={28} className="size-7" />
          <span className="hidden max-w-32 truncate normal-case sm:inline">{user.name}</span>
        </span>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 rounded-none">
        <p className="truncate font-semibold">{user.name}</p>
        <Link href="/notifications" className="fn-tab w-full justify-center px-3 py-1">
          <span>{t('notifications')}</span>
        </Link>
        <button
          type="button"
          onClick={() => out.mutate()}
          disabled={out.isPending}
          className="fn-tab w-full justify-center px-3 py-1"
        >
          <span>{t('logout')}</span>
        </button>
      </PopoverContent>
    </Popover>
  );
}
