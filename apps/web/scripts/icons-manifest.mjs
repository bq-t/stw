// Lists the game icons present in public/icons/<group>/ into lib/icons-manifest.json,
// so components use a game icon when the file exists and a lucide icon otherwise,
// without requesting missing files. Also lists Daily Quest screenshots from
// public/images/quests/<quest id>/ into lib/quest-shots.json. Runs before `dev` and `build`.

import { readdirSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { resolve, parse } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const ICONS = resolve(ROOT, 'public', 'icons');
const SHOTS = resolve(ROOT, 'public', 'images', 'quests');
const GROUPS = ['missions', 'alerts', 'rewards', 'ui', 'quests'];
const EXT = new Set(['.png', '.webp', '.svg']);
const SHOT_EXT = new Set(['.png', '.webp', '.jpg', '.jpeg', '.avif']);

const write = (file, data) =>
  writeFileSync(resolve(ROOT, 'lib', file), JSON.stringify(data, null, 2) + '\n');

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
write('icons-manifest.json', manifest);
const total = Object.values(manifest).reduce((s, g) => s + Object.keys(g).length, 0);

// Screenshots: 1.webp, 2.webp, ... in natural order (2 before 10).
const shots = {};
if (existsSync(SHOTS)) {
  const natural = new Intl.Collator('en', { numeric: true });
  for (const quest of readdirSync(SHOTS).sort()) {
    const dir = resolve(SHOTS, quest);
    if (!statSync(dir).isDirectory()) continue;
    const files = readdirSync(dir)
      .filter((f) => SHOT_EXT.has(parse(f).ext.toLowerCase()))
      .sort(natural.compare)
      .map((f) => `/images/quests/${quest}/${f}`);
    if (files.length) shots[quest] = files;
  }
}
write('quest-shots.json', shots);
const shotCount = Object.values(shots).reduce((s, l) => s + l.length, 0);

console.log(`icons-manifest: ${total} icons, ${shotCount} quest screenshots`);
