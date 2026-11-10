-- Stage 4a: a player's Epic account linked to their Discord account.
-- Secrets are AES-GCM encrypted with EPIC_LINK_KEY (src/crypto.ts), bound to user_id.

CREATE TABLE epic_links (
  user_id         TEXT PRIMARY KEY,   -- Discord user id
  account_id      TEXT NOT NULL,      -- Epic account id
  display_name    TEXT NOT NULL,
  device_auth_enc TEXT NOT NULL,      -- {deviceId, secret}
  created_at      INTEGER NOT NULL,
  used_at         INTEGER
);

-- A link in progress: the device code waits here until the player confirms (10 minutes).
CREATE TABLE epic_link_requests (
  user_id         TEXT PRIMARY KEY,
  device_code_enc TEXT NOT NULL,
  verification_url TEXT NOT NULL,
  expires_at      INTEGER NOT NULL,
  interval_s      INTEGER NOT NULL,
  last_poll_at    INTEGER
);
