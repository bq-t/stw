// Images for the daily Discord message (apps/worker/src/notify/discord.ts), made from the site's own:
//   public/images/discord/zones/<zone>.webp     zone banners cropped to a low strip (Discord shows
//                                               a media gallery at the image's own aspect ratio)
//   public/images/discord/missions/<name>.webp  mission icons at the top of a larger transparent canvas,
//                                               because Discord draws section thumbnails at a fixed size
//   public/images/discord/vbucks-emoji.png      V-Bucks icon to upload as a server emoji
//
//   node apps/web/scripts/discord-assets.mjs    (re-run after adding zone or mission images)

import { mkdirSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

// sharp comes with Next (image optimisation), not as our own dependency.
const fromNext = createRequire(createRequire(import.meta.url).resolve('next/package.json'));
const sharp = fromNext('sharp');

const PUBLIC = resolve(import.meta.dirname, '..', 'public');
const OUT = resolve(PUBLIC, 'images', 'discord');

const BANNER = { width: 900, height: 200 };
/** Icon size inside the square canvas: the thumbnail shows the icon at about ICON/CANVAS of its size. */
const CANVAS = 128;
const ICON = 76;

mkdirSync(resolve(OUT, 'zones'), { recursive: true });
mkdirSync(resolve(OUT, 'missions'), { recursive: true });

for (const file of readdirSync(resolve(PUBLIC, 'images', 'zones'))) {
  if (!file.endsWith('.webp')) continue;
  await sharp(resolve(PUBLIC, 'images', 'zones', file))
    .resize(BANNER.width, BANNER.height, { fit: 'cover', position: 'centre' })
    .webp({ quality: 82 })
    .toFile(resolve(OUT, 'zones', file));
}

for (const file of readdirSync(resolve(PUBLIC, 'icons', 'missions'))) {
  if (!/\.(webp|png)$/.test(file)) continue;
  const icon = await sharp(resolve(PUBLIC, 'icons', 'missions', file))
    .resize(ICON, ICON, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  // Icon at the top of the canvas: Discord gives no alignment option for the thumbnail, so the
  // free space goes below and the icon lines up with the mission name instead of sitting lower.
  const pad = (CANVAS - ICON) / 2;
  await sharp(icon)
    .extend({
      top: 0,
      bottom: pad * 2,
      left: pad,
      right: pad,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .webp({ quality: 90 })
    .toFile(resolve(OUT, 'missions', file.replace(/\.png$/, '.webp')));
}

await sharp(resolve(PUBLIC, 'icons', 'ui', 'vbucks.webp'))
  .resize(128, 128)
  .png()
  .toFile(resolve(OUT, 'vbucks-emoji.png'));

console.log('discord assets written to', OUT);
