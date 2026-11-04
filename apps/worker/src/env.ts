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
}
