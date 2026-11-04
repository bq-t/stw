// One-time setup: creates a device auth for the dedicated Epic account and saves it to .env.
//
// 1. Log in to https://www.epicgames.com with the dedicated (NOT your main) account.
// 2. Run `pnpm auth:setup`, open the printed URL in the same browser, copy "authorizationCode".
// 3. Paste it here. The script writes EPIC_CLIENT / EPIC_ACCOUNT_ID / EPIC_DEVICE_ID /
//    EPIC_DEVICE_SECRET to .env. To use another game client: EPIC_CLIENT=<name> pnpm auth:setup
// 4. Later: `wrangler secret put` for each of these values (see apps/worker/README).

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import {
  authCodeUrl,
  DEFAULT_EPIC_CLIENT,
  createDeviceAuth,
  epicClient,
  loginWithAuthorizationCode,
  type DeviceAuth,
} from '@stw/shared/epic';

const ENV_PATH = resolve(import.meta.dirname, '..', '.env');

function upsertEnv(values: Record<string, string>): void {
  const lines = existsSync(ENV_PATH) ? readFileSync(ENV_PATH, 'utf8').split(/\r?\n/) : [];
  for (const [key, value] of Object.entries(values)) {
    const i = lines.findIndex((l) => l.startsWith(`${key}=`));
    if (i >= 0) lines[i] = `${key}=${value}`;
    else lines.push(`${key}=${value}`);
  }
  writeFileSync(
    ENV_PATH,
    lines.filter((l, i, a) => l !== '' || i < a.length - 1).join('\n') + '\n',
  );
}

async function main(): Promise<void> {
  const client = epicClient(process.env.EPIC_CLIENT);
  console.log('Use the DEDICATED Epic account, not your main one.\n');
  console.log('Open this URL while logged in to epicgames.com and copy "authorizationCode":');
  console.log(`  ${authCodeUrl(client)}\n`);

  const rl = createInterface({ input: stdin, output: stdout });
  const input = (await rl.question('authorizationCode: ')).trim();
  rl.close();

  // Accept the bare code or the whole JSON the page shows.
  const code = input.match(/"authorizationCode"\s*:\s*"([0-9a-f]+)"/i)?.[1] ?? input;
  if (!/^[0-9a-f]{32}$/i.test(code))
    throw new Error('That does not look like an authorization code.');

  const token = await loginWithAuthorizationCode(client, code);
  console.log(`\nLogged in as ${token.displayName ?? token.accountId}.`);

  const auth: DeviceAuth = await createDeviceAuth(token);
  upsertEnv({
    EPIC_CLIENT: process.env.EPIC_CLIENT || DEFAULT_EPIC_CLIENT,
    EPIC_ACCOUNT_ID: auth.accountId,
    EPIC_DEVICE_ID: auth.deviceId,
    EPIC_DEVICE_SECRET: auth.secret,
  });
  console.log(`Device auth created and saved to ${ENV_PATH}.`);
  console.log('Next: `pnpm fetch:world` to check that world/info is reachable.');
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
