// Builds the daily Discord message from the live Worker data and posts it to a webhook,
// so the design can be checked without waiting for the 00:00 UTC rotation.
//
//   pnpm discord:preview              # post today's message to DISCORD_WEBHOOK_URL from .env
//   pnpm discord:preview --none       # same day with the V-Bucks removed (the "no V-Bucks" variant)
//   pnpm discord:preview --print      # print the JSON instead of posting
//
// Env (.env): DISCORD_WEBHOOK_URL, optional DISCORD_VBUCKS_EMOJI, API_URL (default: production Worker),
// SITE_URL (default: https://stw-vbucks.pages.dev).

import type { DaySnapshot, VbucksHistory } from '@stw/shared';
import { buildDiscordMessage, postDiscord } from '../apps/worker/src/notify/discord';

const API_URL = process.env.API_URL ?? 'https://stw-vbucks-worker.w-bequiet.workers.dev';
const SITE_URL = process.env.SITE_URL ?? 'https://stw-vbucks.pages.dev';
const args = new Set(process.argv.slice(2));

async function get<T>(path: string): Promise<T> {
  const res = await fetch(API_URL + path);
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  return (await res.json()) as T;
}

let snapshot = await get<DaySnapshot>('/api/missions');
let history = await get<VbucksHistory>('/api/history');

if (args.has('--none')) {
  snapshot = {
    ...snapshot,
    vbucksTotal: 0,
    missions: snapshot.missions.map((m) => ({
      ...m,
      alertRewards: m.alertRewards.filter((r) => !r.isVbucks),
    })),
  };
  history = {
    days: history.days.map((d) => (d.date === snapshot.date ? { ...d, total: 0, missions: 0 } : d)),
  };
}

const message = buildDiscordMessage(snapshot, history, {
  siteUrl: SITE_URL,
  vbucksEmoji: process.env.DISCORD_VBUCKS_EMOJI || undefined,
});

if (args.has('--print')) {
  console.log(JSON.stringify(message, null, 2));
} else {
  const webhook = process.env.DISCORD_WEBHOOK_URL;
  if (!webhook) throw new Error('DISCORD_WEBHOOK_URL is missing in .env (or use --print).');
  await postDiscord(webhook, message);
  console.log(`Posted ${snapshot.date}: ${snapshot.vbucksTotal} V-Bucks.`);
}
