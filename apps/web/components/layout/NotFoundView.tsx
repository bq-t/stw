'use client';

import { useSyncExternalStore } from 'react';
import en from '@/messages/en.json';
import ru from '@/messages/ru.json';

const subscribe = () => () => {};
/** RU when the missing URL is under /ru; the static HTML is rendered in EN. */
const isRu = () => /^\/ru(\/|$)/.test(window.location.pathname);

/** 404 body (between the site header and footer): the fish, a big white caption and a brand button home. */
export function NotFoundView() {
  const isRuPath = useSyncExternalStore(subscribe, isRu, () => false);
  const t = (isRuPath ? ru : en).NotFound;

  return (
    <>
      <main
        lang={isRuPath ? 'ru' : 'en'}
        className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center gap-5 px-4 pt-9 pb-12 text-center"
      >
        {/* Plain <img>: static export, local files. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/fishstick-404.webp" alt="" width={240} height={240} className="size-56" />
        <div className="flex flex-col items-center gap-1">
          <p className="fn-title text-7xl">404</p>
          <h1 className="fn-title text-3xl">{t.title}</h1>
        </div>
        <a href={isRuPath ? '/ru' : '/'} className="fn-button">
          <span>{t.home}</span>
        </a>
      </main>
    </>
  );
}
