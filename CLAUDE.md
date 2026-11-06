# StW V-Bucks Guide

Fortnite Save the World mission tracker + V-Bucks farming guide. EN by default, RU under `/ru`.

Plans (source of truth for scope and decisions):

- Project plan: https://claude.ai/artifact/VB6jDcTfZk74y6Cx6BsKRZ
- Tech plan: https://claude.ai/artifact/D2Dsw5K9rz5RZrvptsbnRG (local copy in `docs/`, may lag behind)

## Layout

- `apps/web` — Next.js 16, App Router, `output: 'export'` (static HTML on Cloudflare Pages). See `apps/web/AGENTS.md`: read `node_modules/next/dist/docs/` before using Next APIs.
- `apps/worker` — Cloudflare Worker: cron fetches Epic `world/info` → KV; serves `/api/missions`, `/api/history`, `/api/health`; Discord webhook (`src/notify/discord.ts`: Components V2 card, one per rotation with or without V-Bucks; names from `apps/web/messages/en.json`, icons from `apps/web/lib/icons-manifest.json`, images loaded from `SITE_URL`; preview with `pnpm discord:preview`).
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
pnpm discord:preview    # post today's Discord message (live Worker data) to DISCORD_WEBHOOK_URL from .env; --none = no-V-Bucks variant, --print = JSON only
```

## Deploy

- Site: Cloudflare Pages project `stw-vbucks`, Git integration (push to `main` builds it). Build command `pnpm --filter web build`, output `apps/web/out`, env `NEXT_PUBLIC_API_URL` = Worker URL, `NODE_VERSION=24`, `PNPM_VERSION=11.8.0`. Live on `https://stw.bq-t.pro` (custom domain, DNS on Cloudflare) and `stw-vbucks.pages.dev`.
- Worker: `stw-vbucks-worker` on `https://stw-vbucks-worker.w-bequiet.workers.dev`, KV `MISSIONS`, secrets `EPIC_*` and `DISCORD_WEBHOOK_URL` (production Discord server) set. Note: `pnpm discord:preview` posts to the webhook in `.env`, which is the production channel too. CI deploys it on push to `main` when the repo has `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` secrets. A new site domain goes into `ALLOWED_ORIGINS` in `apps/worker/wrangler.toml`.

## Web specifics

- No `NEXT_PUBLIC_API_URL` → the tracker runs on generated demo data (`apps/web/lib/demo.ts`) with a "demo data" banner. Set it to the Worker URL (`http://localhost:8787` locally).
- Filter state lives in the URL (`?zone=…&alert=vbucks&reward=evo&pl=40-80`); parsing/matching is pure code in `packages/shared/src/missions.ts`.
- Reference content (Daily Quests now, questline/side quests later) lives in `apps/web/data/*.ts` with `{ en, ru }` on every string, so TypeScript rejects a missing translation. UI chrome stays in `messages/*.json`.
- Questline: `apps/web/data/questline.ts` (types, reward vocabulary, RU labels) + `questline-quests.ts` (244 quests, generated once from the Fortnite wiki and now edited by hand: do not regenerate). The "I'm here" marker lives in localStorage (`stw.questline.current`), read through `useSyncExternalStore` so the static HTML renders without it.
- Side quests: `apps/web/data/side-quests.ts` (types, groups, V-Bucks summary) + `side-quests-data.ts` (wiki "Side Quests" and "Challenge Quests", generated once, edited by hand). Questline SSD 1–6, hidden and test quests from the wiki are left out. The FAQ V-Bucks table counts its one-time totals from the questline and side quest data.
- There is no V-Bucks Guide page any more: the FAQ "V-Bucks" section replaced it.
- Daily Quest screenshots: `public/images/quests/<quest id>/1.webp…`, picked up by `scripts/icons-manifest.mjs` → `lib/quest-shots.json` (see `apps/web/ICONS.md`).
- `public/_redirects` serves EN without a prefix. Cloudflare applies these rules BEFORE static files, so every root asset (`/_next/*`, `/icons/*`, `/images/*`, `favicon.ico`, `sitemap.xml`, `robots.txt`) needs an explicit pass-through rule above the `/*` catch-all. Check after changes with `wrangler pages dev apps/web/out`.
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

## Open TODOs

- Side quests: SSD 10 = 150 V-Bucks follows freethevbucks and the wiki side quest list (single SSD 10 wiki pages say 100): check in game. Many Canny Valley side quests on the wiki ask for 22+–30+ zones, which looks like the old power scaling; check that they still exist. FAQ minimums (daily 100+, alerts 50+) come from the v37.50 rounding to 50.

- Questline: quest names are EN on /ru too until the owner sends the game's Russian names. From the wiki, unchecked in game: rewards of Deeply Disturbing Simulations are unknown; the wiki lists "... While Screaming" twice in Plankerton (we keep one, so Plankerton has 51); some reward rarities and item kinds were guessed from wiki templates.

- Daily Quests (`apps/web/data/daily-quests.ts`): screenshots for Destroy/Discovery/Safe/Treasure quests are still to be taken in game. RU quest names are our translation; check against the game, along with the RU label of "Replay Intro" and the tips marked as less certain (Safe locations, Arcade Machines, Exploration Party has no tip yet).

- `parse.ts` is built from the real 2026-11-04 response (excerpt in `packages/shared/test/world-info.2026-11-04.json`). Still to confirm in game: the PL ladder values (tier → PL), mission types `HTM` and `PtS`. After an Epic patch run `pnpm fetch:world` and check its "Unmapped" section.
- RU names of zones, mission types, biomes and alert kinds in `messages/ru.json` were written from memory: check against the game's Russian localization.
- `rewardCategory()` in `packages/shared/src/missions.ts`: check prefixes against real reward IDs.
- `epic/constants.ts`: `fortniteIOSGameClient` returned `client_disabled` on 2026-11-04; default is now `fortniteAndroidGameClient`, unverified.
