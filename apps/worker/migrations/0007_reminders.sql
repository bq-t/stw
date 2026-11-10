-- Stage 4c of the Fishstick plan: tournament reminders (a DM N minutes before a session).
-- A sent reminder is deleted. users.dm_channel_id caches the DM channel with the bot.

CREATE TABLE reminders (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     TEXT NOT NULL,
  region      TEXT NOT NULL,             -- EU, NAC…
  event_id    TEXT NOT NULL,
  window_id   TEXT NOT NULL,             -- tournament session (eventWindowId)
  display_id  TEXT NOT NULL,             -- key of the tournament name
  begin_at    INTEGER NOT NULL,          -- session start, ms
  offset_min  INTEGER NOT NULL,          -- remind this many minutes before
  remind_at   INTEGER NOT NULL,          -- begin_at - offset
  locale      TEXT NOT NULL,
  created_at  INTEGER NOT NULL,
  UNIQUE (user_id, window_id, offset_min)
);
CREATE INDEX reminders_due ON reminders(remind_at);
CREATE INDEX reminders_user ON reminders(user_id, begin_at);

ALTER TABLE users ADD COLUMN dm_channel_id TEXT;
