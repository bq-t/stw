// Generates public/images/bg-plexus.svg: the page background pattern, as in the Fortnite menus.
// A regular grid of equal triangles with a dot on every corner. The tile is seamless, so CSS
// repeats it, tilts and leans the whole layer to the left and slides it by one tile forever
// (see `body::before` in app/globals.css; --tile-w / --tile-h there must match TILE_W / TILE_H).
// Run after changing the numbers: `node scripts/bg-plexus.mjs`.

import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const SIDE = 110; // px, triangle side
// Row height is SIDE·√3/2, rounded to whole pixels so the tile repeats without seams.
const ROW = Math.round((SIDE * Math.sqrt(3)) / 2);
const TILE_W = SIDE;
const TILE_H = ROW * 2;

// Corners in one tile: row A at x = 0, row B shifted by half a side. Offset by half a row
// so no line lies exactly on the tile edge.
const yA = ROW / 2;
const yB = yA + ROW;
const corners = [
  [0, yA],
  [SIDE / 2, yB],
];

// Edges from each corner: right, down-left, down-right. Together they draw every triangle once.
const edges = [];
for (const [x, y] of corners) {
  edges.push([x, y, x + SIDE, y]);
  edges.push([x, y, x - SIDE / 2, y + ROW]);
  edges.push([x, y, x + SIDE / 2, y + ROW]);
}

// Repeat each line and dot one tile around, so the parts that cross the edge show up on the other side.
const shifts = [];
for (const sx of [-TILE_W, 0, TILE_W]) for (const sy of [-TILE_H, 0, TILE_H]) shifts.push([sx, sy]);
const r = (n) => Math.round(n * 10) / 10;

const lines = [];
for (const [x1, y1, x2, y2] of edges) {
  for (const [sx, sy] of shifts) {
    const xs = [x1 + sx, x2 + sx];
    const ys = [y1 + sy, y2 + sy];
    if (Math.max(...xs) < 0 || Math.min(...xs) > TILE_W) continue;
    if (Math.max(...ys) < 0 || Math.min(...ys) > TILE_H) continue;
    lines.push(`M${r(xs[0])} ${r(ys[0])}L${r(xs[1])} ${r(ys[1])}`);
  }
}
const dots = [];
for (const [x, y] of corners) {
  for (const [sx, sy] of shifts) {
    const cx = x + sx;
    const cy = y + sy;
    if (cx < -3 || cx > TILE_W + 3 || cy < -3 || cy > TILE_H + 3) continue;
    dots.push(`<circle cx="${r(cx)}" cy="${r(cy)}" r="1.8"/>`);
  }
}

// Depth: every line has a soft wide halo under it, every dot a faint glow around it.
const path = lines.join('');
const halos = dots.map((d) => d.replace('r="1.8"', 'r="5"')).join('');
/** Opacities: [line halo, line, dot glow, dot]. */
const tile = ([haloLine, line, haloDot, dot]) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${TILE_W}" height="${TILE_H}" viewBox="0 0 ${TILE_W} ${TILE_H}">
<path d="${path}" stroke="#fff" stroke-opacity="${haloLine}" stroke-width="4" stroke-linecap="round" fill="none"/>
<path d="${path}" stroke="#fff" stroke-opacity="${line}" stroke-width="1" fill="none"/>
<g fill="#fff" fill-opacity="${haloDot}">${halos}</g>
<g fill="#fff" fill-opacity="${dot}">${dots.join('')}</g>
</svg>
`;

const dir = resolve(import.meta.dirname, '..', 'public', 'images');
// The grid itself, and a brighter copy shown only where the moving shine passes (.plexus-shine).
writeFileSync(resolve(dir, 'bg-plexus.svg'), tile([0.03, 0.09, 0.07, 0.35]));
writeFileSync(resolve(dir, 'bg-plexus-shine.svg'), tile([0.12, 0.6, 0.25, 1]));
console.log(`tile ${TILE_W}x${TILE_H}, ${lines.length} lines, ${dots.length} dots`);
