-- Stage 2 of the Fishstick plan: servers with the bot and the Epic status board.

CREATE TABLE guilds (
  id                TEXT PRIMARY KEY,  -- Discord guild id
  locale            TEXT NOT NULL DEFAULT 'en',
  status_channel_id TEXT,
  status_message_id TEXT,
  updated_at        INTEGER NOT NULL
);
CREATE INDEX guilds_status ON guilds(status_message_id) WHERE status_message_id IS NOT NULL;

-- Last known Epic status (one row per source, 'epic' for now).
CREATE TABLE service_status (
  id          TEXT PRIMARY KEY,
  fingerprint TEXT NOT NULL,
  json        TEXT NOT NULL,           -- EpicStatus
  checked_at  INTEGER NOT NULL,
  changed_at  INTEGER NOT NULL
);
