-- Stage 4b of the Fishstick plan: boards. A board is one or more bot messages in a server
-- channel that the cron edits in place when its data changes (status, BR shop, STW shop,
-- later events). Replaces the status columns of guilds (left in place, no longer read).

CREATE TABLE boards (
  guild_id    TEXT NOT NULL,
  kind        TEXT NOT NULL,            -- status | shop_br | shop_stw
  channel_id  TEXT NOT NULL,
  message_ids TEXT NOT NULL,            -- JSON array, in channel order
  locale      TEXT NOT NULL,
  fingerprint TEXT,                     -- data the messages show; NULL = redraw
  updated_at  INTEGER NOT NULL,
  PRIMARY KEY (guild_id, kind)
);
CREATE INDEX boards_kind ON boards(kind, updated_at);

INSERT INTO boards (guild_id, kind, channel_id, message_ids, locale, fingerprint, updated_at)
SELECT id, 'status', status_channel_id, json_array(status_message_id), locale, board_fingerprint, updated_at
FROM guilds WHERE status_message_id IS NOT NULL AND status_channel_id IS NOT NULL;
