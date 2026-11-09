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
  ): Promise<void> {
    await this.d1
      .prepare(
        `INSERT INTO guilds (id, locale, status_channel_id, status_message_id, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5)
         ON CONFLICT(id) DO UPDATE SET
           locale = ?2, status_channel_id = ?3, status_message_id = ?4, updated_at = ?5`,
      )
      .bind(guildId, locale, channelId, messageId, now)
      .run();
  }

  async statusBoards(): Promise<GuildRow[]> {
    const { results } = await this.d1
      .prepare('SELECT * FROM guilds WHERE status_message_id IS NOT NULL')
      .all<GuildRow>();
    return results;
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

  async deleteExpiredSessions(now: number): Promise<void> {
    await this.d1.prepare('DELETE FROM sessions WHERE expires_at <= ?1').bind(now).run();
  }
}
