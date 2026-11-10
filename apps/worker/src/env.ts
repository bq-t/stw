export interface Env {
  MISSIONS: KVNamespace;
  ALLOWED_ORIGINS: string;
  SITE_URL: string;
  /** Game client the device auth was created with, see EPIC_CLIENTS. */
  EPIC_CLIENT?: string;
  EPIC_ACCOUNT_ID: string;
  EPIC_DEVICE_ID: string;
  EPIC_DEVICE_SECRET: string;
  DISCORD_WEBHOOK_URL?: string;
  /** Custom server emoji shown next to V-Bucks amounts, e.g. "<:vbucks:123456789>". */
  DISCORD_VBUCKS_EMOJI?: string;
  /** D1 "stw" (migrations/). Optional until the database is created. */
  DB?: D1Database;
  /** Discord application "Fishstick": Application ID (var) and Client Secret (secret). */
  DISCORD_CLIENT_ID?: string;
  DISCORD_CLIENT_SECRET?: string;
  /** Bot: Public Key (var, checks interaction signatures) and Bot Token (secret, REST calls). */
  DISCORD_PUBLIC_KEY?: string;
  DISCORD_BOT_TOKEN?: string;
  /** AES-GCM key (32 bytes, base64) for linked Epic accounts in D1. Losing it = everyone links again. */
  EPIC_LINK_KEY?: string;
  /** Origin of the OAuth callback; only for local dev (wrangler dev rewrites the host). */
  AUTH_ORIGIN?: string;
}
