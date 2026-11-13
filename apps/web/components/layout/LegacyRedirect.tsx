'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';

/**
 * Old links (already posted in Discord) used one page with tabs for both modes: `/shop?tab=br`,
 * `/events?tab=tournaments&region=EU`. The site is a static export with no server redirects for
 * query strings, so the page sends such a visitor on in the browser. `to` maps the query to the
 * new path, or null to stay.
 */
function Redirect({ to }: { to: (query: URLSearchParams) => string | null }) {
  const search = useSearchParams();
  const router = useRouter();
  const target = to(new URLSearchParams(search));
  useEffect(() => {
    if (target) router.replace(target);
  }, [router, target]);
  return null;
}

export function LegacyRedirect({ to }: { to: (query: URLSearchParams) => string | null }) {
  // useSearchParams needs a Suspense boundary in a static export.
  return (
    <Suspense>
      <Redirect to={to} />
    </Suspense>
  );
}
