// Registers Fishstick's slash commands and its install settings with Discord.
//
//   pnpm bot:register                   # commands + install settings
//   pnpm bot:register --endpoint        # also set the Interactions Endpoint URL to the site
//   pnpm bot:register --endpoint=URL    # ...or to another URL (Discord sends a signed PING to check it)
//
// Env (.env): DISCORD_BOT_TOKEN. App id and site come from apps/worker/wrangler.toml.

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { BOT_PERMISSIONS, COMMANDS, inviteUrl } from '../apps/worker/src/bot/commands';

function workerVar(name: string): string | undefined {
  const toml = readFileSync(resolve(import.meta.dirname, '../apps/worker/wrangler.toml'), 'utf8');
  return toml.match(new RegExp(`^${name}\\s*=\\s*"([^"]*)"`, 'm'))?.[1] || undefined;
}

const token = process.env.DISCORD_BOT_TOKEN;
const appId = workerVar('DISCORD_CLIENT_ID');
const site = workerVar('SITE_URL') ?? 'https://stw.bq-t.pro';
if (!token || !appId) {
  console.error('Need DISCORD_BOT_TOKEN in .env and DISCORD_CLIENT_ID in wrangler.toml');
  process.exit(1);
}

async function api(method: string, path: string, body: unknown) {
  const res = await fetch(`https://discord.com/api/v10${path}`, {
    method,
    headers: { Authorization: `Bot ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path}: HTTP ${res.status} ${text}`);
  return JSON.parse(text) as unknown;
}

const registered = (await api('PUT', `/applications/${appId}/commands`, COMMANDS)) as {
  name: string;
}[];
console.log(`Commands: ${registered.map((c) => `/${c.name}`).join(', ')}`);

const endpointArg = process.argv.find((a) => a.startsWith('--endpoint'));
const endpoint = endpointArg?.includes('=')
  ? endpointArg.split('=')[1]
  : endpointArg
    ? `${site}/api/discord/interactions`
    : undefined;

await api('PATCH', '/applications/@me', {
  integration_types_config: {
    // Server install: the bot user joins, so /setup can post the status board.
    '0': {
      oauth2_install_params: {
        scopes: ['applications.commands', 'bot'],
        permissions: BOT_PERMISSIONS,
      },
    },
    // User install: commands anywhere, no bot user.
    '1': { oauth2_install_params: { scopes: ['applications.commands'], permissions: '0' } },
  },
  ...(endpoint ? { interactions_endpoint_url: endpoint } : {}),
});
console.log('Install settings updated' + (endpoint ? `, interactions endpoint: ${endpoint}` : ''));
console.log(`Invite: ${inviteUrl(appId)}`);
