export interface Env {
  MISSIONS: KVNamespace;
  ALLOWED_ORIGINS: string;
  SITE_URL: string;
  /** Game client the device auth was created with, see EPIC_CLIENTS. */
  EPIC_CLIENT?: string;
  EPIC_ACCOUNT_ID: string;
  EPIC_DEVICE_ID: string;
  EPIC_DEVICE_SECRET: string;
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
  /**
   * Local dev only (.dev.vars), never in production: where POST /__dev/bot posts bot
   * messages. A channel id (posted by the bot, app emoji work) or a webhook URL.
   */
  DEV_PREVIEW_TARGET?: string;
  /** Local dev only: the Discord user the preview runs commands as (/subscriptions, /llamas). */
  DEV_PREVIEW_USER?: string;
}
