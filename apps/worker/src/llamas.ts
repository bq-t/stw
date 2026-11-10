// X-ray llama contents of a linked player (site /shop and bot /llamas).
// Reads the campaign profile; if the rolls are not there yet (the store was not opened in
// game today), asks Epic to roll them, which is what opening the store does. Both answers
// are full profiles: only the PrerollData items are cut out of the text (parsePrerolls).

import { parsePrerolls, type StwLlama } from '@stw/shared';
import { killSession, mcpText } from '@stw/shared/epic';
import { EpicLinkGone, EpicLinks, isEpicLinkConfigured } from './epic-link';
import type { Env } from './env';
import { Db } from './db';
import { readStwShop } from './feeds';

export type LlamasResult =
  | { status: 'ok'; llamas: StwLlama[] }
  | { status: 'not linked' }
  | { status: 'gone' }
  | { status: 'not configured' };

export async function fetchLlamas(env: Env, userId: string, now: number): Promise<LlamasResult> {
  if (!isEpicLinkConfigured(env)) return { status: 'not configured' };
  let token;
  try {
    token = await new EpicLinks(env).token(userId, now);
  } catch (err) {
    if (err instanceof EpicLinkGone) return { status: 'gone' };
    throw err;
  }
  if (!token) return { status: 'not linked' };
  try {
    const catalog = (await readStwShop(new Db(env.DB)))?.data;
    let llamas = parsePrerolls(await mcpText(token, 'QueryProfile', 'campaign'), catalog, now);
    if (!llamas.length)
      llamas = parsePrerolls(
        await mcpText(token, 'PopulatePrerolledOffers', 'campaign'),
        catalog,
        now,
      );
    return { status: 'ok', llamas };
  } finally {
    await killSession(token);
  }
}
