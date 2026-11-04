# Worker

Daily snapshot of StW missions in KV + JSON API for the site.

## One-time setup

1. `pnpm auth:setup` in the repo root (dedicated Epic account) → values in root `.env`.
2. `pnpm wrangler login`
3. `pnpm wrangler kv namespace create MISSIONS` → put the id into `wrangler.toml`.
4. Secrets:
   ```sh
   pnpm wrangler secret put EPIC_CLIENT
   pnpm wrangler secret put EPIC_ACCOUNT_ID
   pnpm wrangler secret put EPIC_DEVICE_ID
   pnpm wrangler secret put EPIC_DEVICE_SECRET
   pnpm wrangler secret put DISCORD_WEBHOOK_URL   # optional
   ```
5. Set `ALLOWED_ORIGINS` and `SITE_URL` in `wrangler.toml` to the real site domain.
6. `pnpm run deploy` (in CI: on push to `main`, needs `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` repo secrets)

## Local

```sh
cp .dev.vars.example .dev.vars   # fill from root .env
pnpm dev
curl "http://localhost:8787/__scheduled?cron=*/15+*+*+*+*"   # run the cron once
curl http://localhost:8787/api/health
```

## Behaviour

- Cron every 15 minutes. If today's snapshot is already in KV, the run exits after one read.
- If the alerts are identical to yesterday's, Epic has not rotated yet: nothing is saved, the next run retries.
- Errors go to the `health` key and `/api/health`; the site keeps the last good snapshot.
