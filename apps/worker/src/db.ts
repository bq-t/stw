import type { DaySnapshot } from '@stw/shared';

// D1 layout: migrations/*.sql. Times are Unix milliseconds.

export interface DiscordUser {
  id: string;
  username: string;
  global_name: string | null;
  avatar: string | null;
  locale?: string;
}

export interface UserRow {
  id: string;
  username: string;
  global_name: string | null;
  avatar: string | null;
  locale: string | null;
}

export interface GuildRow {
  id: string;
  locale: string;
  status_channel_id: string | null;
  status_message_id: string | null;
  updated_at: number;
  board_fingerprint: string | null;
}

export type OwnerType = 'user' | 'guild';

export interface SubscriptionRow {
  id: number;
  owner_type: OwnerType;
  owner_id: string;
  target: 'dm' | 'channel' | 'webhook';
  target_id: string;
  dm_channel_id: string | null;
  filter: string;
  locale: string;
  created_at: number;
  checked_date: string | null;
  last_sent_at: number | null;
  last_error: string | null;
}

export interface ServiceStatusRow {
  id: string;
  fingerprint: string;
  /** EpicStatus as JSON. */
  json: string;
  checked_at: number;
  changed_at: number;
}

export class Db {
  constructor(private readonly d1: D1Database) {}

  async saveSnapshot(snapshot: DaySnapshot): Promise<void> {
    await this.d1
      .prepare(
        `INSERT INTO snapshots (date, fetched_at, vbucks_total, json) VALUES (?1, ?2, ?3, ?4)
         ON CONFLICT(date) DO UPDATE SET fetched_at = ?2, vbucks_total = ?3, json = ?4`,
      )
      .bind(snapshot.date, snapshot.fetchedAt, snapshot.vbucksTotal, JSON.stringify(snapshot))
      .run();
  }

  async upsertUser(user: DiscordUser, now: number): Promise<void> {
    await this.d1
      .prepare(
        `INSERT INTO users (id, username, global_name, avatar, locale, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?6)
         ON CONFLICT(id) DO UPDATE SET
           username = ?2, global_name = ?3, avatar = ?4, locale = ?5, updated_at = ?6`,
      )
      .bind(user.id, user.username, user.global_name, user.avatar, user.locale ?? null, now)
      .run();
  }

  async createSession(tokenHash: string, userId: string, now: number, ttlMs: number) {
    await this.d1
      .prepare(
        'INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (?1, ?2, ?3, ?4)',
      )
      .bind(tokenHash, userId, now, now + ttlMs)
      .run();
  }

  /** The user of a live session, or null. */
  sessionUser(tokenHash: string, now: number): Promise<UserRow | null> {
    return this.d1
      .prepare(
        `SELECT u.id, u.username, u.global_name, u.avatar, u.locale
         FROM sessions s JOIN users u ON u.id = s.user_id
         WHERE s.token_hash = ?1 AND s.expires_at > ?2`,
      )
      .bind(tokenHash, now)
      .first<UserRow>();
  }

  async deleteSession(tokenHash: string): Promise<void> {
    await this.d1.prepare('DELETE FROM sessions WHERE token_hash = ?1').bind(tokenHash).run();
  }

  // ---------- bot: guilds and the status board ----------

  getGuild(id: string): Promise<GuildRow | null> {
    return this.d1.prepare('SELECT * FROM guilds WHERE id = ?1').bind(id).first<GuildRow>();
  }

  async setStatusBoard(
    guildId: string,
    locale: string,
    channelId: string | null,
    messageId: string | null,
    now: number,
    fingerprint: string | null = null,
  ): Promise<void> {
    await this.d1
      .prepare(
        `INSERT INTO guilds (id, locale, status_channel_id, status_message_id, updated_at, board_fingerprint)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)
         ON CONFLICT(id) DO UPDATE SET
           locale = ?2, status_channel_id = ?3, status_message_id = ?4, updated_at = ?5,
           board_fingerprint = ?6`,
      )
      .bind(guildId, locale, channelId, messageId, now, fingerprint)
      .run();
  }

  /** Boards that do not show `fingerprint` yet, oldest first. */
  async staleBoards(fingerprint: string, limit: number): Promise<GuildRow[]> {
    const { results } = await this.d1
      .prepare(
        `SELECT * FROM guilds
         WHERE status_message_id IS NOT NULL
           AND (board_fingerprint IS NULL OR board_fingerprint != ?1)
         ORDER BY updated_at LIMIT ?2`,
      )
      .bind(fingerprint, limit)
      .all<GuildRow>();
    return results;
  }

  async setBoardFingerprint(guildId: string, fingerprint: string, now: number): Promise<void> {
    await this.d1
      .prepare('UPDATE guilds SET board_fingerprint = ?2, updated_at = ?3 WHERE id = ?1')
      .bind(guildId, fingerprint, now)
      .run();
  }

  // ---------- subscriptions ----------

  async countSubscriptions(ownerType: OwnerType, ownerId: string): Promise<number> {
    const row = await this.d1
      .prepare('SELECT COUNT(*) AS n FROM subscriptions WHERE owner_type = ?1 AND owner_id = ?2')
      .bind(ownerType, ownerId)
      .first<{ n: number }>();
    return row?.n ?? 0;
  }

  async listSubscriptions(ownerType: OwnerType, ownerId: string): Promise<SubscriptionRow[]> {
    const { results } = await this.d1
      .prepare('SELECT * FROM subscriptions WHERE owner_type = ?1 AND owner_id = ?2 ORDER BY id')
      .bind(ownerType, ownerId)
      .all<SubscriptionRow>();
    return results;
  }

  getSubscription(id: number): Promise<SubscriptionRow | null> {
    return this.d1
      .prepare('SELECT * FROM subscriptions WHERE id = ?1')
      .bind(id)
      .first<SubscriptionRow>();
  }

  async addSubscription(
    s: Pick<
      SubscriptionRow,
      'owner_type' | 'owner_id' | 'target' | 'target_id' | 'filter' | 'locale'
    >,
    today: string,
    now: number,
  ): Promise<void> {
    // checked_date = today: a new subscription starts with the next rotation.
    await this.d1
      .prepare(
        `INSERT INTO subscriptions (owner_type, owner_id, target, target_id, filter, locale, created_at, checked_date)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)`,
      )
      .bind(s.owner_type, s.owner_id, s.target, s.target_id, s.filter, s.locale, now, today)
      .run();
  }

  async deleteSubscription(id: number): Promise<void> {
    await this.d1.prepare('DELETE FROM subscriptions WHERE id = ?1').bind(id).run();
  }

  async dueSubscriptions(today: string, limit: number): Promise<SubscriptionRow[]> {
    const { results } = await this.d1
      .prepare(
        `SELECT * FROM subscriptions WHERE checked_date IS NULL OR checked_date < ?1
         ORDER BY id LIMIT ?2`,
      )
      .bind(today, limit)
      .all<SubscriptionRow>();
    return results;
  }

  async markChecked(
    id: number,
    today: string,
    result: { sentAt?: number; error?: string | null; dmChannelId?: string },
  ): Promise<void> {
    await this.d1
      .prepare(
        `UPDATE subscriptions SET checked_date = ?2,
           last_sent_at = COALESCE(?3, last_sent_at),
           last_error = CASE WHEN ?4 = 1 THEN ?5 ELSE last_error END,
           dm_channel_id = COALESCE(?6, dm_channel_id)
         WHERE id = ?1`,
      )
      .bind(
        id,
        today,
        result.sentAt ?? null,
        result.error !== undefined ? 1 : 0,
        result.error ?? null,
        result.dmChannelId ?? null,
      )
      .run();
  }

  getServiceStatus(id: string): Promise<ServiceStatusRow | null> {
    return this.d1
      .prepare('SELECT * FROM service_status WHERE id = ?1')
      .bind(id)
      .first<ServiceStatusRow>();
  }

  async saveServiceStatus(row: ServiceStatusRow): Promise<void> {
    await this.d1
      .prepare(
        `INSERT INTO service_status (id, fingerprint, json, checked_at, changed_at)
         VALUES (?1, ?2, ?3, ?4, ?5)
         ON CONFLICT(id) DO UPDATE SET fingerprint = ?2, json = ?3, checked_at = ?4, changed_at = ?5`,
      )
      .bind(row.id, row.fingerprint, row.json, row.checked_at, row.changed_at)
      .run();
  }

  /**
   * Claims the test-DM slot of a user: true if the last test was `intervalMs` ago or
   * never (and records `now`), false while it is too soon. One atomic UPDATE.
   */
  async claimTestDm(userId: string, now: number, intervalMs: number): Promise<boolean> {
    const res = await this.d1
      .prepare(
        `UPDATE users SET last_test_dm_at = ?2
         WHERE id = ?1 AND (last_test_dm_at IS NULL OR last_test_dm_at <= ?3)`,
      )
      .bind(userId, now, now - intervalMs)
      .run();
    return res.meta.changes > 0;
  }

  async deleteExpiredSessions(now: number): Promise<void> {
    await this.d1.prepare('DELETE FROM sessions WHERE expires_at <= ?1').bind(now).run();
  }
}
