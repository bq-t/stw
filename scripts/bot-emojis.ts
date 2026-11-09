// Copies the server emoji used in Discord messages into Fishstick's application emoji, so
// the bot shows them on any server and in DMs (server emoji only render where the bot is).
// Writes apps/worker/src/bot/app-emojis.json ({ key: "<:name:id>" }); safe to re-run.
//
//   pnpm bot:emojis
//
// Env (.env): DISCORD_BOT_TOKEN. App id from apps/worker/wrangler.toml.

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

/** Key in app-emojis.json → server emoji (name and id) it is copied from. */
const SOURCES = {
  vbucks: { name: 'vbucks', id: '1568138713823838388' },
  vbucksStack: { name: 'vbucksstack', id: '1569255073886900224' },
  power: { name: 'powerlevel', id: '1569264880299802724' },
  zone: { name: 'stormshield', id: '1569271087978512494' },
  miniBoss: { name: 'miniboss', id: '1569265406542348439' },
  megaAlert: { name: 'megaalert', id: '1569266298582597632' },
} as const;

const root = resolve(import.meta.dirname, '..');
const toml = readFileSync(resolve(root, 'apps/worker/wrangler.toml'), 'utf8');
const appId = toml.match(/^DISCORD_CLIENT_ID\s*=\s*"([^"]*)"/m)?.[1];
const token = process.env.DISCORD_BOT_TOKEN;
if (!token || !appId) {
  console.error('Need DISCORD_BOT_TOKEN in .env and DISCORD_CLIENT_ID in wrangler.toml');
  process.exit(1);
}

async function api<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`https://discord.com/api/v10${path}`, {
    method,
    headers: { Authorization: `Bot ${token}`, 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path}: HTTP ${res.status} ${text}`);
  return JSON.parse(text) as T;
}

interface Emoji {
  id: string;
  name: string;
  animated?: boolean;
}

const { items: existing } = await api<{ items: Emoji[] }>('GET', `/applications/${appId}/emojis`);
const out: Record<string, string> = {};

for (const [key, src] of Object.entries(SOURCES)) {
  let emoji = existing.find((e) => e.name === src.name);
  if (!emoji) {
    const img = await fetch(`https://cdn.discordapp.com/emojis/${src.id}.png?size=128`);
    if (!img.ok) throw new Error(`download ${src.name}: HTTP ${img.status}`);
    const data = Buffer.from(await img.arrayBuffer()).toString('base64');
    emoji = await api<Emoji>('POST', `/applications/${appId}/emojis`, {
      name: src.name,
      image: `data:image/png;base64,${data}`,
    });
    console.log(`uploaded ${src.name}`);
  } else {
    console.log(`exists   ${src.name}`);
  }
  out[key] = `<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`;
}

const file = resolve(root, 'apps/worker/src/bot/app-emojis.json');
writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
console.log(`wrote ${file}`);
