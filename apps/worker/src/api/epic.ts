// Epic link for the site (logged-in users).
//
//   GET    /api/epic             → LinkStatus
//   POST   /api/epic/link        → { status: 'pending', verificationUrl, expiresAt }
//   POST   /api/epic/link/poll   → LinkStatus (asks Epic at most once per its interval)
//   DELETE /api/epic             → { status: 'none' }

import { currentUser } from '../auth';
import { EpicLinks, isEpicLinkConfigured } from '../epic-link';
import type { Env } from '../env';
import type { ApiResult } from './subscriptions';

export async function handleEpicApi(
  request: Request,
  env: Env,
  url: URL,
  now: number,
): Promise<ApiResult> {
  if (!isEpicLinkConfigured(env)) return { status: 503, body: { error: 'not configured' } };
  const user = await currentUser(request, env, now);
  if (!user) return { status: 401, body: { error: 'login required' } };
  const links = new EpicLinks(env);
  const path = url.pathname.replace(/\/$/, '');

  if (request.method === 'GET' && path === '/api/epic')
    return { status: 200, body: await links.status(user.id, now) };
  if (request.method === 'POST' && path === '/api/epic/link')
    return { status: 200, body: { status: 'pending', ...(await links.start(user.id, now)) } };
  if (request.method === 'POST' && path === '/api/epic/link/poll')
    return { status: 200, body: await links.poll(user.id, now) };
  if (request.method === 'DELETE' && path === '/api/epic') {
    await links.unlink(user.id);
    return { status: 200, body: { status: 'none' } };
  }
  return { status: 405, body: { error: 'method not allowed' } };
}
