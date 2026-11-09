// Builds the daily Discord message from the live Worker data and posts it to a webhook,
// so the design can be checked without waiting for the 00:00 UTC rotation.
//
//   pnpm discord:preview              # post today's message to DISCORD_WEBHOOK_URL from .env
//   pnpm discord:preview --none       # same day with the V-Bucks removed (the "no V-Bucks" variant)
//   pnpm discord:preview --vbucks     # on a day without V-Bucks: fake a few V-Bucks alerts
//   pnpm discord:preview --print     # print the JSON instead of posting
//
// Env (.env): DISCORD_WEBHOOK_URL; optional API_URL (default: production Worker),
// SITE_URL and DISCORD_VBUCKS_EMOJI (default: the [vars] in apps/worker/wrangler.toml).

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { DaySnapshot, VbucksHistory } from '@stw/shared';
import { buildDiscordMessage, postDiscord } from '../apps/worker/src/notify/discord';

/** A `NAME = "value"` line from the Worker config, so the preview matches production. */
function workerVar(name: string): string | undefined {
  const toml = readFileSync(resolve(import.meta.dirname, '../apps/worker/wrangler.toml'), 'utf8');
  return toml.match(new RegExp(`^${name}\\s*=\\s*"([^"]*)"`, 'm'))?.[1] || undefined;
}

const API_URL = process.env.API_URL ?? 'https://stw-vbucks-worker.w-bequiet.workers.dev';
const SITE_URL = process.env.SITE_URL ?? workerVar('SITE_URL') ?? 'https://stw.bq-t.pro';
const VBUCKS_EMOJI = process.env.DISCORD_VBUCKS_EMOJI ?? workerVar('DISCORD_VBUCKS_EMOJI');
const args = new Set(process.argv.slice(2));

async function get<T>(path: string): Promise<T> {
  const res = await fetch(API_URL + path);
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  return (await res.json()) as T;
}

let snapshot = await get<DaySnapshot>('/api/missions');
let history = await get<VbucksHistory>('/api/history');

if (args.has('--vbucks') && snapshot.vbucksTotal === 0) {
  // A quiet day: put V-Bucks on real alerts in Stonewood, Plankerton and Canny Valley
  // (1–3 per zone, each on its own power level and with other rewards than the rest),
  // so the V-Bucks variant can be checked any day.
  const plan: Record<string, number[]> = {
    stonewood: [50, 100],
    plankerton: [150, 50, 100],
    'canny-valley': [200],
  };
  const amountOf = new Map<string, number>();
  const usedRewards = new Set<string>();
  for (const [zone, amounts] of Object.entries(plan)) {
    const usedPl = new Set<number>();
    const candidates = snapshot.missions
      .filter((m) => m.zone === zone && m.alertRewards.length > 0)
      .sort((a, b) => a.powerLevel - b.powerLevel);
    for (const m of candidates) {
      const zoneCount = snapshot.missions.filter(
        (x) => x.zone === zone && amountOf.has(x.id),
      ).length;
      if (zoneCount >= amounts.length) break;
      const rewardKey = m.alertRewards.map((r) => r.itemId).join('|');
      if (usedPl.has(m.powerLevel) || usedRewards.has(rewardKey)) continue;
      usedPl.add(m.powerLevel);
      usedRewards.add(rewardKey);
      amountOf.set(m.id, amounts[zoneCount]!);
    }
  }
  let total = 0;
  snapshot = {
    ...snapshot,
    missions: snapshot.missions.map((m) => {
      const quantity = amountOf.get(m.id);
      if (quantity === undefined) return m;
      total += quantity;
      return {
        ...m,
        alertRewards: [
          { itemId: 'AccountResource:currency_mtxswap', quantity, isVbucks: true },
          ...m.alertRewards,
        ],
      };
    }),
  };
  snapshot = { ...snapshot, vbucksTotal: total };
}

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
  vbucksEmoji: VBUCKS_EMOJI,
});

if (args.has('--print')) {
  console.log(JSON.stringify(message, null, 2));
} else {
  const webhook = process.env.DISCORD_WEBHOOK_URL;
  if (!webhook) throw new Error('DISCORD_WEBHOOK_URL is missing in .env (or use --print).');
  await postDiscord(webhook, message);
  console.log(`Posted ${snapshot.date}: ${snapshot.vbucksTotal} V-Bucks.`);
}
