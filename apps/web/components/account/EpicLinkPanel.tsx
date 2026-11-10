'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import {
  ApiError,
  fetchEpicLink,
  pollEpicLink,
  startEpicLink,
  unlinkEpic,
  type EpicLinkStatus,
} from '@/lib/api';

const POLL_MS = 5000;

/**
 * Link / unlink the Epic account. Needs a Discord login (the caller checks it).
 * While a link is pending the panel polls the Worker, which asks Epic at most once
 * per Epic's interval.
 */
export function EpicLinkPanel({ compact = false }: { compact?: boolean }) {
  const t = useTranslations('Epic');
  const client = useQueryClient();
  const query = useQuery({ queryKey: ['epic'], queryFn: fetchEpicLink, retry: false });
  const set = (s: EpicLinkStatus) => client.setQueryData(['epic'], s);

  const start = useMutation({ mutationFn: startEpicLink, onSuccess: set });

  /**
   * The tab is opened right in the click (a tab opened after the request would be
   * blocked as a popup) and pointed to Epic once the Worker returns the link.
   */
  function link() {
    const tab = window.open('about:blank', '_blank');
    if (tab) tab.opener = null;
    start.mutate(undefined, {
      onSuccess: (r) => {
        if (tab) tab.location.href = r.verificationUrl;
      },
      onError: () => tab?.close(),
    });
  }
  const unlink = useMutation({ mutationFn: unlinkEpic, onSuccess: set });

  const status = query.data?.status;
  useEffect(() => {
    if (status !== 'pending') return;
    const id = window.setInterval(() => {
      pollEpicLink().then(set, () => undefined);
    }, POLL_MS);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  if (query.isError) {
    const code = query.error instanceof ApiError ? query.error.code : '';
    return (
      <p className="text-sm text-muted-foreground">
        {code === 'not configured'
          ? t('notConfigured')
          : code === 'login required'
            ? t('loginFirst')
            : t('error')}
      </p>
    );
  }
  if (!query.data) return null;
  const s = query.data;

  if (s.status === 'linked') {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-semibold">{t('linked', { name: s.displayName })}</span>
        <button
          type="button"
          onClick={() => unlink.mutate()}
          disabled={unlink.isPending}
          className="fn-tab px-4 py-1.5"
        >
          <span>{t('unlink')}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-3">
      {!compact && <p className="text-sm text-muted-foreground">{t('warning')}</p>}
      {s.status === 'pending' ? (
        <>
          <p role="status" className="text-sm">
            {t('waiting')}
          </p>
          <a
            href={s.verificationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="fn-tab px-4 py-1.5"
          >
            <span>{t('openAgain')}</span>
          </a>
        </>
      ) : (
        <>
          {s.status === 'expired' && <p className="text-sm text-destructive">{t('expired')}</p>}
          <button
            type="button"
            onClick={link}
            disabled={start.isPending}
            className="fn-tab fn-tab-active px-4 py-1.5"
          >
            <span>{t('link')}</span>
          </button>
          {start.isError && <p className="text-sm text-destructive">{t('error')}</p>}
        </>
      )}
    </div>
  );
}
