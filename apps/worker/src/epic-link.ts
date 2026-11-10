// A player's Epic account linked to their Discord account (stage 4a, option C of the plan).
// The device auth is stored AES-GCM encrypted (crypto.ts) and decrypted only for a request
// to Epic. Tokens and secrets never go to logs, API responses or bot messages.

import {
  createDeviceAuth,
  deleteDeviceAuth,
  EpicApiError,
  epicClient,
  exchangeToClient,
  killSession,
  loginWithDeviceAuth,
  pollDeviceCode,
  startDeviceCode,
  type EpicToken,
} from '@stw/shared/epic';
import { decrypt, encrypt } from './crypto';
import type { Env } from './env';

interface LinkRow {
  user_id: string;
  account_id: string;
  display_name: string;
  device_auth_enc: string;
  created_at: number;
  used_at: number | null;
}

interface RequestRow {
  user_id: string;
  device_code_enc: string;
  verification_url: string;
  expires_at: number;
  interval_s: number;
  last_poll_at: number | null;
}

export type LinkStatus =
  | { status: 'none' }
  | { status: 'pending'; verificationUrl: string; expiresAt: number }
  | { status: 'expired' }
  | { status: 'linked'; displayName: string };

/** The device auth no longer works (password changed, removed by the player): link again. */
export class EpicLinkGone extends Error {}

const linkAad = (userId: string) => `epic-link:${userId}`;
const requestAad = (userId: string) => `epic-request:${userId}`;

export function isEpicLinkConfigured(
  env: Env,
): env is Env & { DB: D1Database; EPIC_LINK_KEY: string } {
  return Boolean(env.DB && env.EPIC_LINK_KEY);
}

export class EpicLinks {
  private readonly d1: D1Database;
  private readonly key: string;

  constructor(private readonly env: Env & { DB: D1Database; EPIC_LINK_KEY: string }) {
    this.d1 = env.DB;
    this.key = env.EPIC_LINK_KEY;
  }

  private client() {
    // Device auths belong to the client that created them: always the Worker's game client.
    return epicClient(this.env.EPIC_CLIENT);
  }

  private getLink(userId: string) {
    return this.d1
      .prepare('SELECT * FROM epic_links WHERE user_id = ?1')
      .bind(userId)
      .first<LinkRow>();
  }

  private getRequest(userId: string) {
    return this.d1
      .prepare('SELECT * FROM epic_link_requests WHERE user_id = ?1')
      .bind(userId)
      .first<RequestRow>();
  }

  private async deleteRequest(userId: string) {
    await this.d1.prepare('DELETE FROM epic_link_requests WHERE user_id = ?1').bind(userId).run();
  }

  async status(userId: string, now: number): Promise<LinkStatus> {
    const link = await this.getLink(userId);
    if (link) return { status: 'linked', displayName: link.display_name };
    const req = await this.getRequest(userId);
    if (req && req.expires_at > now)
      return {
        status: 'pending',
        verificationUrl: req.verification_url,
        expiresAt: req.expires_at,
      };
    return { status: 'none' };
  }

  /** Starts (or resumes) a link: the URL the player opens to confirm on epicgames.com. */
  async start(
    userId: string,
    now: number,
  ): Promise<{ verificationUrl: string; expiresAt: number }> {
    const req = await this.getRequest(userId);
    // Keep a fresh code: opening "Link" twice should not invalidate the page already open.
    if (req && req.expires_at - now > 60_000)
      return { verificationUrl: req.verification_url, expiresAt: req.expires_at };
    const dc = await startDeviceCode();
    const expiresAt = now + dc.expiresIn * 1000;
    await this.d1
      .prepare(
        `INSERT INTO epic_link_requests (user_id, device_code_enc, verification_url, expires_at, interval_s, last_poll_at)
         VALUES (?1, ?2, ?3, ?4, ?5, NULL)
         ON CONFLICT(user_id) DO UPDATE SET device_code_enc = ?2, verification_url = ?3,
           expires_at = ?4, interval_s = ?5, last_poll_at = NULL`,
      )
      .bind(
        userId,
        await encrypt(this.key, dc.deviceCode, requestAad(userId)),
        dc.verificationUrl,
        expiresAt,
        dc.interval,
      )
      .run();
    return { verificationUrl: dc.verificationUrl, expiresAt };
  }

  /**
   * One check of a link in progress. Asks Epic at most once per its interval, so the
   * site can poll every few seconds. On confirmation stores the device auth.
   */
  async poll(userId: string, now: number): Promise<LinkStatus> {
    const req = await this.getRequest(userId);
    if (!req) return this.status(userId, now);
    if (req.expires_at <= now) {
      await this.deleteRequest(userId);
      return { status: 'expired' };
    }
    const pending: LinkStatus = {
      status: 'pending',
      verificationUrl: req.verification_url,
      expiresAt: req.expires_at,
    };
    if (req.last_poll_at && now - req.last_poll_at < req.interval_s * 1000) return pending;
    await this.d1
      .prepare('UPDATE epic_link_requests SET last_poll_at = ?2 WHERE user_id = ?1')
      .bind(userId, now)
      .run();

    const result = await pollDeviceCode(
      await decrypt(this.key, req.device_code_enc, requestAad(userId)),
    );
    if (result.status === 'pending') return pending;
    if (result.status === 'expired') {
      await this.deleteRequest(userId);
      return { status: 'expired' };
    }

    // Confirmed: Switch token → game client token → device auth. Close both sessions.
    const game = await exchangeToClient(result.token, this.client());
    const auth = await createDeviceAuth(game);
    const displayName = result.token.displayName ?? game.displayName ?? game.accountId;
    await killSession(result.token);
    await killSession(game);

    // Linking again replaces the old device auth: remove it on Epic's side as well.
    await this.revokeOld(userId).catch(() => undefined);
    await this.d1
      .prepare(
        `INSERT INTO epic_links (user_id, account_id, display_name, device_auth_enc, created_at, used_at)
         VALUES (?1, ?2, ?3, ?4, ?5, NULL)
         ON CONFLICT(user_id) DO UPDATE SET account_id = ?2, display_name = ?3,
           device_auth_enc = ?4, created_at = ?5, used_at = NULL`,
      )
      .bind(
        userId,
        auth.accountId,
        displayName,
        await encrypt(
          this.key,
          JSON.stringify({ deviceId: auth.deviceId, secret: auth.secret }),
          linkAad(userId),
        ),
        now,
      )
      .run();
    await this.deleteRequest(userId);
    return { status: 'linked', displayName };
  }

  private async deviceAuth(link: LinkRow) {
    const { deviceId, secret } = JSON.parse(
      await decrypt(this.key, link.device_auth_enc, linkAad(link.user_id)),
    ) as { deviceId: string; secret: string };
    return { accountId: link.account_id, deviceId, secret };
  }

  private async revokeOld(userId: string) {
    const link = await this.getLink(userId);
    if (!link) return;
    const auth = await this.deviceAuth(link);
    const token = await loginWithDeviceAuth(this.client(), auth);
    await deleteDeviceAuth(token, auth.deviceId);
    await killSession(token);
  }

  /** "Unlink": removes the device auth on Epic's side (if it still works) and our row. */
  async unlink(userId: string): Promise<boolean> {
    const link = await this.getLink(userId);
    await this.deleteRequest(userId);
    if (!link) return false;
    await this.revokeOld(userId).catch((err: unknown) =>
      console.log(
        'unlink: device auth already gone',
        err instanceof EpicApiError ? err.errorCode : '',
      ),
    );
    await this.d1.prepare('DELETE FROM epic_links WHERE user_id = ?1').bind(userId).run();
    return true;
  }

  /** A fresh game client token of the linked player. Throws EpicLinkGone if it stopped working. */
  async token(userId: string, now: number): Promise<EpicToken | null> {
    const link = await this.getLink(userId);
    if (!link) return null;
    try {
      const token = await loginWithDeviceAuth(this.client(), await this.deviceAuth(link));
      await this.d1
        .prepare('UPDATE epic_links SET used_at = ?2 WHERE user_id = ?1')
        .bind(userId, now)
        .run();
      return token;
    } catch (err) {
      if (err instanceof EpicApiError && err.status === 400) {
        // invalid_account_credentials and the like: the player removed access.
        await this.d1.prepare('DELETE FROM epic_links WHERE user_id = ?1').bind(userId).run();
        throw new EpicLinkGone(err.errorCode ?? 'device auth rejected');
      }
      throw err;
    }
  }
}
