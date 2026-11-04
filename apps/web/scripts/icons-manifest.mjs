// Lists the game icons present in public/icons/<group>/ into lib/icons-manifest.json,
// so components use a game icon when the file exists and a lucide icon otherwise,
// without requesting missing files. Runs before `dev` and `build`.

import { readdirSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, parse } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const ICONS = resolve(ROOT, 'public', 'icons');
const GROUPS = ['missions', 'alerts', 'rewards', 'ui'];
const EXT = new Set(['.png', '.webp', '.svg']);

const manifest = {};
for (const group of GROUPS) {
  const dir = resolve(ICONS, group);
  manifest[group] = {};
  if (!existsSync(dir)) continue;
  for (const file of readdirSync(dir).sort()) {
    const { name, ext } = parse(file);
    if (EXT.has(ext.toLowerCase())) manifest[group][name.toLowerCase()] = `/icons/${group}/${file}`;
  }
}

writeFileSync(
  resolve(ROOT, 'lib', 'icons-manifest.json'),
  JSON.stringify(manifest, null, 2) + '\n',
);
const total = Object.values(manifest).reduce((s, g) => s + Object.keys(g).length, 0);
console.log(`icons-manifest: ${total} icons`);
