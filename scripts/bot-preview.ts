// Posts what a Fishstick command (or a notification) would show to the test channel, using
// the local Worker (pnpm dev:worker) and its local KV/D1. No deploy, no slash commands.
//
//   pnpm bot:preview shop kind=stw          # /shop stw
//   pnpm bot:preview shop kind=br --ru      # in Russian
//   pnpm bot:preview missions zone=twine-peaks alert=vbucks
//   pnpm bot:preview setup list             # subcommand: second word without "="
//   pnpm bot:preview notify vbucks          # the /setup vbucks card (fake_vbucks=20, no_vbucks=1)
//   pnpm bot:preview notify subscription reward=evo
//   pnpm bot:preview notify reminder region=NAE
//   pnpm bot:preview --refresh              # load snapshot, status, shops, tournaments into the local DBs
//   pnpm bot:preview shop kind=stw --print  # print the message JSON, post nothing
//
// Needs DEV_PREVIEW_TARGET in apps/worker/.dev.vars (a test channel id, posted by the bot,
// or a webhook URL), optionally DEV_PREVIEW_USER (your Discord user id). Restart
// dev:worker after changing .dev.vars. Env: WORKER_URL (default http://localhost:8787).

const WORKER_URL = process.env.WORKER_URL ?? 'http://localhost:8787';
const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith('--')));
const words = args.filter((a) => !a.startsWith('--') && !a.includes('='));
const options: Record<string, string | number> = {};
for (const a of args.filter((x) => !x.startsWith('--') && x.includes('='))) {
  const [k, ...v] = a.split('=');
  const value = v.join('=');
  options[k!] = /^\d+$/.test(value) ? Number(value) : value;
}

const [first, second] = words;
const body = {
  ...(first === 'notify' ? { notify: second } : { command: first, sub: second }),
  options,
  locale: flags.has('--ru') ? 'ru' : 'en',
  refresh: flags.has('--refresh'),
  dry: flags.has('--print'),
};
if (!first && !body.refresh) {
  console.error('usage: pnpm bot:preview <command> [sub] [key=value…] [--ru] [--refresh]');
  process.exit(1);
}

const res = await fetch(`${WORKER_URL}/__dev/bot`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
}).catch((err: unknown) => {
  console.error(`No Worker on ${WORKER_URL} (pnpm dev:worker):`, String(err));
  process.exit(1);
});
if (res.status === 404 || res.status === 405) {
  console.error(
    'Preview is off: set DEV_PREVIEW_TARGET in apps/worker/.dev.vars and restart dev:worker.',
  );
  process.exit(1);
}
const out = (await res.json()) as { ok: boolean; error?: string };
console.log(JSON.stringify(out, null, 2));
if (!out.ok) process.exit(1);
