# StW V-Bucks Guide

Fortnite Save the World mission tracker + V-Bucks farming guide. EN by default, RU under `/ru`.

Plans (source of truth for scope and decisions):

- Project plan: https://claude.ai/artifact/VB6jDcTfZk74y6Cx6BsKRZ
- Tech plan: https://claude.ai/artifact/D2Dsw5K9rz5RZrvptsbnRG (local copy in `docs/`, may lag behind)
- Fishstick bot + accounts plan (stages 1–5, D1 schema, free-tier limits): `docs/StW V-Bucks Guide — план бота Fishstick и аккаунтов.md`

## Layout

- `apps/web` — Next.js 16, App Router, `output: 'export'` (static HTML on Cloudflare Pages). See `apps/web/AGENTS.md`: read `node_modules/next/dist/docs/` before using Next APIs.
- `apps/worker` — Cloudflare Worker: cron fetches Epic `world/info` → KV; serves `/api/missions`, `/api/history`, `/api/health`, Discord login (`src/auth.ts`: `/api/auth/discord/*`, `/api/me`, `/api/auth/logout`, session in D1); D1 `stw` (`src/db.ts`, `migrations/`) next to KV; Discord bot Fishstick (`src/bot/`: HTTP interactions on `/api/discord/interactions`, `/vbucks` `/missions` `/status` `/subscribe` `/subscriptions` `/setup status|alerts|list`, `/shop br|stw`, `/llamas`, `/link`, `/unlink`, `/tournaments`, `/events`, `/reminders`, `/setup shop|tournaments|events`; boards (`src/bot/boards.ts`, D1 `boards`): bot messages posted once with `/setup` and edited in place when their data fingerprint changes (status, BR shop, STW shop, events, tournaments per region); board data in D1 `service_status` via `src/feeds.ts` (Statuspage, fortnite-api.com BR shop EN+RU, Epic STW catalog, Epic events service per region, tournament names, calendar); the 5-minute cron runs snapshot → status boards → tournament reminders (D1 `reminders`, `src/bot/reminders.ts`) → subscriptions → one big download (a shop after reset, else one tournament region or the calendar in turn) → other boards with a shared budget of 38 Discord requests (free plan: 50 subrequests per invocation); shop parsers in `packages/shared/src/shop.ts`; X-ray llama contents via the Epic link (`src/llamas.ts`, `/api/shop/llamas`); subscription filters in `packages/shared/src/subscriptions.ts`; site API for personal subscriptions in `src/api/subscriptions.ts` (`/api/subscriptions`, used by `/notifications`). Bot DMs: Discord refuses with 50278 (no mutual server) or 50007 (DMs closed); installing the app to the user's account (`userInstallUrl`, integration_type=1) does open DMs (checked 2026-11-10), so every refusal shows that link; bot texts in the `Bot` section of `messages/*.json` via `src/i18n.ts`); Discord webhook (`src/notify/discord.ts`: Components V2 card, one per rotation with or without V-Bucks; names from `apps/web/messages/en.json`, icons from `apps/web/lib/icons-manifest.json`, images loaded from `SITE_URL`; preview with `pnpm discord:preview`).
- `packages/shared` — types, `parse.ts` (raw Epic → `DaySnapshot`), zod schema, Epic client (`src/epic`), item catalog (`src/items`). Imported as `@stw/shared`, `@stw/shared/epic`, `@stw/shared/items`.
- `scripts/` — `setup-device-auth.ts` (one-time), `fetch-world-info.ts` (stage-2 check, saves to `fixtures/`).
- `tools/game-export` — .NET (CUE4Parse) exporter for the local Fortnite install: localization, quests, data tables, icons → `game-export/` (git-ignored). See its README for what came from there; game files never go into git, only the data and 128px WebP icons we picked.

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
pnpm --filter worker db:migrate:local   # D1 schema into the local DB (db:migrate = remote)
pnpm bot:emojis         # copy our server emoji into the app emoji (bot/app-emojis.json), so the bot shows them anywhere
pnpm bot:register       # Fishstick slash commands + install settings (--endpoint sets the Interactions URL to the site)
pnpm seed:local         # demo snapshot + history into the Worker LOCAL KV (then dev:worker + dev:web with NEXT_PUBLIC_API_URL)
pnpm discord:preview    # post today's Discord message (live Worker data) to DISCORD_WEBHOOK_URL from .env; --none = no-V-Bucks variant, --vbucks = fake V-Bucks alerts in SW/PL/CV on a quiet day, --print = JSON only
```

## Deploy

- Site: Cloudflare Pages project `stw-vbucks`, Git integration (push to `main` builds it). Build command `pnpm --filter web build`, output `apps/web/out`, env `NEXT_PUBLIC_API_URL` = Worker URL, `NODE_VERSION=24`, `PNPM_VERSION=11.8.0`. Live on `https://stw.bq-t.pro` (custom domain, DNS on Cloudflare) and `stw-vbucks.pages.dev`.
- Worker: `stw-vbucks-worker` on `https://stw-vbucks-worker.w-bequiet.workers.dev`, KV `MISSIONS`, secrets `EPIC_*` and `DISCORD_WEBHOOK_URL` (production Discord server) set. Note: `pnpm discord:preview` posts to the webhook in `.env`, which is the production channel too. CI deploys it on push to `main` when the repo has `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` secrets. A new site domain goes into `ALLOWED_ORIGINS` in `apps/worker/wrangler.toml`.

## Web specifics

- No `NEXT_PUBLIC_API_URL` → the tracker runs on generated demo data (`apps/web/lib/demo.ts`) with a "demo data" banner. Set it to the Worker URL (`http://localhost:8787` locally).
- Filter state lives in the URL (`?zone=…&alert=vbucks&reward=evo&pl=40-80`); parsing/matching is pure code in `packages/shared/src/missions.ts`.
- Reference content (Daily Quests now, questline/side quests later) lives in `apps/web/data/*.ts` with `{ en, ru }` on every string, so TypeScript rejects a missing translation. UI chrome stays in `messages/*.json`.
- Questline: `apps/web/data/questline.ts` (types, reward vocabulary, RU labels) + `questline-quests.ts` (244 quests: list, order, icons and PL from the wiki, edited by hand; rewards and objectives are rewritten from the game files by `tools/game-export/apply.mts`, do not edit them by hand). Game rewards are `game(id, n)` with names/rarity/icons in `data/game-items.ts` (generated); RU quest names in `data/quest-names-ru.ts` (generated by `names.mts`). The game is the source of truth; `verify.mts` writes the remaining differences to `game-export/verify.md`. The "I'm here" marker lives in localStorage (`stw.questline.current`), read through `useSyncExternalStore` so the static HTML renders without it.
- Side quests: `apps/web/data/side-quests.ts` (types, groups, V-Bucks summary) + `side-quests-data.ts` (wiki "Side Quests" and "Challenge Quests"; side quest rewards and objectives rewritten from the game like the questline). Questline SSD 1–6, hidden and test quests from the wiki are left out. The FAQ V-Bucks table counts its one-time totals from the questline and side quest data.
- Events page `/events` (`components/events`): tournaments by region with reminders (`/api/tournaments`, `/api/reminders`) and current events (`/api/events`). Event names: `KNOWN_EVENTS` in `packages/shared/src/events.ts` (calendar flags → our names; dates come from the calendar).
- Shop page `/shop` (`components/shop`): BR and STW tabs from `/api/shop/br|stw`; X-ray llama contents need a Discord login and an Epic link (`/account`), blurred otherwise.
- There is no V-Bucks Guide page any more: the FAQ "V-Bucks" section replaced it.
- Daily Quest screenshots: `public/images/quests/<quest id>/1.webp…`, picked up by `scripts/icons-manifest.mjs` → `lib/quest-shots.json` (see `apps/web/ICONS.md`).
- `public/_redirects` serves EN without a prefix. Cloudflare applies these rules BEFORE static files, so every root asset (`/_next/*`, `/icons/*`, `/images/*`, `favicon.ico`, `sitemap.xml`, `robots.txt`) needs an explicit pass-through rule above the `/*` catch-all. Check after changes with `wrangler pages dev apps/web/out`.
- shadcn/ui (radix-nova) lives in `components/ui`; its tokens (`--background`, `--muted`…) map to our palette in `globals.css`. `text-muted-foreground` is grey text; `bg-muted` is a surface.
- Screenshots for visual checks: headless Chrome `--screenshot` against `pnpm dev:web` or `wrangler pages dev`.
- Style building blocks live in `globals.css`: `.fn-panel` (slanted bar), `.fn-block` (square block), `.fn-card` (leaning card via skew: short cards, keeps box-shadow glows), `.fn-tall` (fixed 8px slant via clip-path: cards that grow, stripe colour via `[--stripe:…]`), `.fn-chip` / `.fn-chip-nav` (filter and anchor buttons), `.fn-tab` (header buttons), `.fn-badge` (V-Bucks amount), `.fn-tile` (reward preview), `.vbucks-shape-glow` (glow that follows any shape; put it on a wrapper of a clip-path card).
- Background: triangle grid from `scripts/bg-plexus.mjs` (→ `public/images/bg-plexus*.svg`), drifting under `body::before` plus a shine band (`PlexusShine.tsx`). The header pins and slides in on scroll (`StickyHeader.tsx`, anchors offset by `scroll-padding-top`); `RouteProgress.tsx` is the page loading bar.
- Tracker filters update the URL with `window.history.replaceState`, not `router.replace`: EN `/` is a rewrite to `/en`, so a router navigation to it reloads the whole page.
- 404 is `app/global-not-found.tsx` (`experimental.globalNotFound`): the root layout sits under `[locale]`, so it renders its own document with the EN header/footer; the body text switches to RU on `/ru/...` in the browser. It has its own provider tree: a provider added to `[locale]/layout.tsx` goes there too (check with `pnpm --filter web build`, typecheck does not catch it).
- Shop and reward item icons: `public/icons/items/` (953 game textures, WebP 256px) + `index.json` (item key → file), fetched by the browser on first use through `ItemIcon` (`GameIcon` with group `rewards`), so the 180 KB index stays out of the bundle. Regenerate with `tools/game-export/item-icons.mts`.
- Images from `icons-inbox/` (git-ignored) are turned into `public/` files with sharp: flat dark backgrounds are flood-filled to transparent from the corners. The fish pictures (logo, 404, no-V-Bucks, favicon) came from the owner.

## Rules

- The raw Epic response never leaves `packages/shared/src/parse.ts`. Everything else uses the types in `types.ts`.
- If Epic changes the response, zod in `schema.ts` must fail loudly; the site keeps showing the last good snapshot.
- Never commit secrets: `.env`, `.dev.vars`, `fixtures/` are git-ignored. Worker secrets go to `wrangler secret put`.
- Use the dedicated Epic account, never the owner's main account.
- All UI text goes through next-intl (`apps/web/messages/en.json` and `ru.json`), both files updated together.
- Design ("Fishstick"): neutral dark grey page, orange brand `#F06C1E` (header, footer and brand fills use the `#db5814 → #fd8a3b` radial gradient, darker in the corners), Fortnite-style square corners and slanted sides, no outlines on blocks. Rarity colors only as borders/stripes and reward tiles; V-Bucks keep the legendary gold. No purple-pink gradients, glassmorphism, emoji in UI. All caps only through CSS (`uppercase`), never in the text itself.
- TypeScript strict. pnpm 11 refuses packages younger than 1 day: pick a slightly older version rather than relaxing the policy.
- Change parse.ts → extend packages/shared/test (synthetic world-info fixture there is committed; real ones in /fixtures are not).
- Versions: TypeScript stays on 6.0.x (typescript-eslint does not support 7 yet); ESLint 9 (eslint-config-next does not support 10 yet).

## Working agreements

- The owner writes in Russian: reply in Russian.
- Production steps (remote D1 migrations, push to `main`, `wrangler secret put`, `pnpm bot:register`, Discord app settings) only after the owner says yes for that step. The owner sets Worker secrets: Claude's auto mode blocks secret writes.
- Order of a deploy: secrets and `db:migrate` (remote) before the push (CI deploys the Worker on push), `bot:register` after it.
- Run `pnpm --filter web build` before pushing web changes: typecheck misses static export errors.
- Locally the bot and DMs go through the production Discord app: `/…` commands can only be tried after a deploy, and a local cron run sends real DMs.
- Do not stop processes you did not start (the owner may run `wrangler pages dev` on port 8788). `wrangler dev` leaves `workerd` children behind when its task is stopped: find them by port and parent.
- Moving to another PC: `.env`, `apps/worker/.dev.vars`, `apps/web/.env.local` (secrets), `icons-inbox/` (owner's source images) and `fixtures/` (regenerable with `pnpm epic:explore` / `pnpm fetch:world`) are not in git: copy them by hand. Local D1/KV: `pnpm --filter worker db:migrate:local`, `pnpm seed:local`.

## Open TODOs

- Side quests: SSD 10 = 150 V-Bucks is confirmed by the game files (43.10). Canny Valley SSD 3: the questline quest `cannyvalleyquest_outpost_l3` has no V-Bucks in the game files; the owner confirmed 100 (forced in `apply.mts`). "Trail By Fire" (Twine Peaks side quest) is not in the game files. Many Canny Valley side quests on the wiki ask for 22+–30+ zones, which looks like the old power scaling; check that they still exist. FAQ minimums (daily 100+, alerts 50+) come from the v37.50 rounding to 50.

- Questline and side quests: rewards, objectives and RU names come from the game files (414 of 416 quests match, see `game-export/verify.md`); the quest order matches the game unlock chain. Still from the wiki only: the quest list itself ("... While Screaming" kept once, Plankerton has 51).

- Daily Quests (`apps/web/data/daily-quests.ts`): screenshots for Destroy/Discovery/Safe/Treasure quests are still to be taken in game. RU quest names and the "Replay Intro" label match the game (43.10). Still unchecked: the tips marked as less certain (Safe locations, Arcade Machines, Exploration Party has no tip yet).

- `parse.ts` is built from the real 2026-11-04 response (excerpt in `packages/shared/test/world-info.2026-11-04.json`). The PL ladder matches the game table; `PtS` = Vindertech Research Lab. `HTM` (Hunt the Titan) has no generator in the 43.10 files. After an Epic patch run `pnpm fetch:world` and check its "Unmapped" section.
- RU names of zones, mission types, biomes, daily quests and resources were checked against the game localization (43.10). Husks are «мозгляки» in RU, as in the game.
