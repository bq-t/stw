-- Stage 3b: "Send a test" on the site's Notifications page, at most once a minute per user.
ALTER TABLE users ADD COLUMN last_test_dm_at INTEGER;
