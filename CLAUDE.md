# StW V-Bucks Guide

Fortnite Save the World mission tracker + V-Bucks farming guide. EN by default, RU under `/ru`.

Plans (source of truth for scope and decisions):

- Project plan: https://claude.ai/artifact/VB6jDcTfZk74y6Cx6BsKRZ
- Tech plan: https://claude.ai/artifact/D2Dsw5K9rz5RZrvptsbnRG (local copy in `docs/`, may lag behind)

## Layout

- `apps/web` — Next.js 16, App Router, `output: 'export'` (static HTML on Cloudflare Pages). See `apps/web/AGENTS.md`: read `node_modules/next/dist/docs/` before using Next APIs.
- `apps/worker` — Cloudflare Worker: cron fetches Epic `world/info` → KV; serves `/api/missions`, `/api/history`, `/api/health`; Discord webhook.
- `packages/shared` — types, `parse.ts` (raw Epic → `DaySnapshot`), zod schema, Epic client (`src/epic`), item catalog (`src/items`). Imported as `@stw/shared`, `@stw/shared/epic`, `@stw/shared/items`.
- `scripts/` — `setup-device-auth.ts` (one-time), `fetch-world-info.ts` (stage-2 check, saves to `fixtures/`).

The Epic client lives in `packages/shared/src/epic` (not in the worker, as the tech plan first said) so the local scripts and the Worker use the same code.

## Commands

```sh
pnpm install
pnpm dev:web            # http://localhost:3000
pnpm dev:worker         # http://localhost:8787, trigger cron: curl "localhost:8787/__scheduled?cron=*/15+*+*+*+*"
pnpm typecheck          # all packages
pnpm lint
pnpm test               # vitest for packages/shared (parser, filters, history)
pnpm format
pnpm auth:setup         # create device auth for the dedicated Epic account → .env
pnpm fetch:world [file] # fetch world/info (or parse a saved fixture) and print what parse.ts sees
pnpm --filter web build # static export to apps/web/out
pnpm seed:local         # demo snapshot + history into the Worker LOCAL KV (then dev:worker + dev:web with NEXT_PUBLIC_API_URL)
```

## Web specifics

- No `NEXT_PUBLIC_API_URL` → the tracker runs on generated demo data (`apps/web/lib/demo.ts`) with a "demo data" banner. Set it to the Worker URL (`http://localhost:8787` locally).
- Filter state lives in the URL (`?zone=…&alert=vbucks&reward=evo&pl=40-80`); parsing/matching is pure code in `packages/shared/src/missions.ts`.
- `public/_redirects` serves EN without a prefix. Cloudflare applies these rules BEFORE static files, so every root asset (`/_next/*`, `/icons/*`, `favicon.ico`, `sitemap.xml`, `robots.txt`) needs an explicit pass-through rule above the `/*` catch-all. Check after changes with `wrangler pages dev apps/web/out`.
- shadcn/ui (radix-nova) lives in `components/ui`; its tokens (`--background`, `--muted`…) map to our palette in `globals.css`. `text-muted-foreground` is grey text; `bg-muted` is a surface.
- Screenshots for visual checks: headless Chrome `--screenshot` against `pnpm dev:web` or `wrangler pages dev`.

## Rules

- The raw Epic response never leaves `packages/shared/src/parse.ts`. Everything else uses the types in `types.ts`.
- If Epic changes the response, zod in `schema.ts` must fail loudly; the site keeps showing the last good snapshot.
- Never commit secrets: `.env`, `.dev.vars`, `fixtures/` are git-ignored. Worker secrets go to `wrangler secret put`.
- Use the dedicated Epic account, never the owner's main account.
- All UI text goes through next-intl (`apps/web/messages/en.json` and `ru.json`), both files updated together.
- Design: dark navy, rarity colors only as borders/stripes, V-Bucks is the only bright accent. No purple-pink gradients, glassmorphism, emoji in UI.
- TypeScript strict. pnpm 11 refuses packages younger than 1 day: pick a slightly older version rather than relaxing the policy.
- Change parse.ts → extend packages/shared/test (synthetic world-info fixture there is committed; real ones in /fixtures are not).
- Versions: TypeScript stays on 6.0.x (typescript-eslint does not support 7 yet); ESLint 9 (eslint-config-next does not support 10 yet).

## Open TODOs (stage 2, need a real `world/info` response)

- `parse.ts`: verify zone theater IDs, mission-type names, `POWER_LEVEL_BY_ROW`, alert categories, group detection, biome.
- RU names of zones, mission types, biomes and alert kinds in `messages/ru.json` were written from memory: check against the game's Russian localization.
- `rewardCategory()` in `packages/shared/src/missions.ts`: check prefixes against real reward IDs.
- `epic/constants.ts`: `fortniteIOSGameClient` returned `client_disabled` on 2026-11-04; default is now `fortniteAndroidGameClient`, unverified.
