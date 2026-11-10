// Personal part of the shop for the site: GET /api/shop/llamas (logged in, Epic linked).

import { currentUser } from '../auth';
import type { Env } from '../env';
import { fetchLlamas } from '../llamas';
import type { ApiResult } from './subscriptions';

export async function handleLlamasApi(
  request: Request,
  env: Env,
  _url: URL,
  now: number,
): Promise<ApiResult> {
  if (request.method !== 'GET') return { status: 405, body: { error: 'method not allowed' } };
  const user = await currentUser(request, env, now);
  if (!user) return { status: 401, body: { error: 'login required' } };
  const r = await fetchLlamas(env, user.id, now);
  if (r.status === 'ok') return { status: 200, body: { llamas: r.llamas } };
  if (r.status === 'not configured') return { status: 503, body: { error: 'not configured' } };
  return { status: 409, body: { error: r.status } };
}
