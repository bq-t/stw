-- Stage 1 of the Fishstick plan (docs/StW V-Bucks Guide — план бота Fishstick и аккаунтов.md).
-- Times are Unix milliseconds.

CREATE TABLE users (
  id          TEXT PRIMARY KEY,   -- Discord user id
  username    TEXT NOT NULL,
  global_name TEXT,
  avatar      TEXT,               -- Discord avatar hash
  locale      TEXT,
  created_at  INTEGER NOT NULL,
  updated_at  INTEGER NOT NULL
);

-- The cookie holds a random token; only its SHA-256 is stored.
CREATE TABLE sessions (
  token_hash  TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  INTEGER NOT NULL,
  expires_at  INTEGER NOT NULL
);
CREATE INDEX sessions_user ON sessions(user_id);
CREATE INDEX sessions_expires ON sessions(expires_at);

-- Daily snapshots (KV keeps snapshot:current as a cache).
CREATE TABLE snapshots (
  date         TEXT PRIMARY KEY,  -- rotation day, YYYY-MM-DD
  fetched_at   TEXT NOT NULL,
  vbucks_total INTEGER NOT NULL,
  json         TEXT NOT NULL
);
