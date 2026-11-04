// Dev only: puts a demo snapshot and 30-day history into the Worker's LOCAL KV,
// so `pnpm dev:worker` serves data and the site can run against it before the
// real Epic feed works.
//
//   pnpm seed:local                                   # demo data
//   pnpm seed:local fixtures/world-info-YYYY-MM-DD.json # a real saved response
//   pnpm dev:worker
//   NEXT_PUBLIC_API_URL=http://localhost:8787 pnpm dev:web

import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { addToHistory, parseWorldInfo } from '@stw/shared';
import { demoHistory, demoSnapshot } from '@stw/shared/demo';

const WORKER_DIR = resolve(import.meta.dirname, '..', 'apps', 'worker');
const WRANGLER = resolve(WORKER_DIR, 'node_modules', 'wrangler', 'bin', 'wrangler.js');
const TMP = resolve(WORKER_DIR, '.wrangler', 'seed');

function put(key: string, value: unknown): void {
  const file = resolve(TMP, `${key.replace(/[^a-z0-9-]/gi, '_')}.json`);
  writeFileSync(file, JSON.stringify(value));
  execFileSync(
    process.execPath,
    [WRANGLER, 'kv', 'key', 'put', key, '--path', file, '--binding', 'MISSIONS', '--local'],
    { cwd: WORKER_DIR, stdio: ['ignore', 'ignore', 'inherit'] },
  );
  console.log(`  ${key}`);
}

const file = process.argv[2];
const snapshot = file
  ? parseWorldInfo(JSON.parse(readFileSync(resolve(file), 'utf8')))
  : demoSnapshot();
const history = file ? addToHistory(null, snapshot) : demoHistory();
mkdirSync(TMP, { recursive: true });
console.log(`Seeding local KV (${file ? file : 'demo data'}):`);
put('snapshot:current', snapshot);
put(`snapshot:${snapshot.date}`, snapshot);
put('history:vbucks', history);
put('health', { lastSuccessAt: snapshot.fetchedAt, lastSnapshotDate: snapshot.date });
console.log(`Done: ${snapshot.missions.length} missions, ${snapshot.vbucksTotal} V-Bucks.`);
