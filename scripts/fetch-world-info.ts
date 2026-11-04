// Stage 2 checkpoint: logs in with the device auth from .env, downloads world/info,
// saves the raw response to fixtures/ and runs the parser on it.
//
//   pnpm fetch:world            # fetch from Epic and parse
//   pnpm fetch:world <file>     # parse an already saved fixture, no network

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ZodError } from 'zod';
import { parseWorldInfo, rotationDay, type DaySnapshot } from '@stw/shared';
import { epicClient, fetchWorldInfo, loginWithDeviceAuth } from '@stw/shared/epic';

const ROOT = resolve(import.meta.dirname, '..');
const FIXTURES = resolve(ROOT, 'fixtures');

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is missing. Run \`pnpm auth:setup\` first.`);
  return value;
}

async function loadRaw(file: string | undefined): Promise<unknown> {
  if (file) {
    console.log(`Reading ${file}`);
    return JSON.parse(readFileSync(resolve(file), 'utf8'));
  }
  const token = await loginWithDeviceAuth(epicClient(process.env.EPIC_CLIENT), {
    accountId: requireEnv('EPIC_ACCOUNT_ID'),
    deviceId: requireEnv('EPIC_DEVICE_ID'),
    secret: requireEnv('EPIC_DEVICE_SECRET'),
  });
  console.log(`Logged in as ${token.displayName ?? token.accountId}`);

  const raw = await fetchWorldInfo(token);
  mkdirSync(FIXTURES, { recursive: true });
  const path = resolve(FIXTURES, `world-info-${rotationDay()}.json`);
  writeFileSync(path, JSON.stringify(raw, null, 2));
  console.log(`Saved raw response to ${path}`);
  return raw;
}

function summarize(snapshot: DaySnapshot): void {
  const byZone = new Map<string, number>();
  for (const m of snapshot.missions) byZone.set(m.zone, (byZone.get(m.zone) ?? 0) + 1);

  console.log(`\nDay ${snapshot.date}, expires ${snapshot.expiresAt}`);
  console.log(`Missions: ${snapshot.missions.length}`, Object.fromEntries(byZone));
  console.log(`V-Bucks total: ${snapshot.vbucksTotal}`);

  for (const m of snapshot.missions.filter((x) => x.alertRewards.some((r) => r.isVbucks))) {
    const vb = m.alertRewards.filter((r) => r.isVbucks).reduce((s, r) => s + r.quantity, 0);
    console.log(
      `  ${m.zone} tile ${m.tileIndex}: ${m.missionType}, ${m.difficultyRow}, ${vb} V-Bucks`,
    );
  }

  // What still needs a mapping in parse.ts (stage 2).
  const unique = (xs: string[]) => [...new Set(xs)].sort();
  console.log('\nDifficulty rows (→ POWER_LEVEL_BY_ROW):');
  console.log(unique(snapshot.missions.map((m) => m.difficultyRow)).join('\n'));
  console.log('\nMission types:');
  console.log(unique(snapshot.missions.map((m) => m.missionType)).join(', '));
  console.log('\nAlert kinds:');
  console.log(unique(snapshot.missions.map((m) => m.alertKind)).join(', '));
}

async function main(): Promise<void> {
  const raw = await loadRaw(process.argv[2]);
  try {
    summarize(parseWorldInfo(raw));
  } catch (err) {
    if (err instanceof ZodError) {
      console.error('\nworld/info does not match schema.ts:');
      console.error(JSON.stringify(err.issues.slice(0, 20), null, 2));
      process.exit(2);
    }
    throw err;
  }
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
