-- Stage 3 of the Fishstick plan: subscriptions to missions.
-- Delivery: after the day's snapshot, the 5-minute cron checks due rows in small batches
-- (checked_date < today) and sends one message per matching subscription per rotation.

CREATE TABLE subscriptions (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_type    TEXT NOT NULL CHECK (owner_type IN ('user', 'guild')),
  owner_id      TEXT NOT NULL,     -- Discord user id or guild id
  target        TEXT NOT NULL CHECK (target IN ('dm', 'channel', 'webhook')),
  target_id     TEXT NOT NULL,     -- user id (dm), channel id, webhooks.id
  dm_channel_id TEXT,              -- cached DM channel for target 'dm'
  filter        TEXT NOT NULL,     -- SubscriptionFilter JSON
  locale        TEXT NOT NULL DEFAULT 'en',
  created_at    INTEGER NOT NULL,
  checked_date  TEXT,              -- last rotation day the row was checked
  last_sent_at  INTEGER,
  last_error    TEXT
);
CREATE INDEX subscriptions_owner ON subscriptions(owner_type, owner_id);
CREATE INDEX subscriptions_due ON subscriptions(checked_date);

-- Boards are re-edited until they show the current status (no board is left behind
-- when one cron run cannot edit them all).
ALTER TABLE guilds ADD COLUMN board_fingerprint TEXT;
