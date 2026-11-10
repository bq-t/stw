// Minimal Discord REST client for the bot (bot token auth).

const API = 'https://discord.com/api/v10';
const MAX_RETRY_WAIT_S = 5;

export class DiscordApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: number | undefined,
    detail: string,
  ) {
    super(`Discord API ${status}${code ? ` (${code})` : ''}: ${detail}`);
  }
}

export async function discordApi<T = unknown>(
  token: string,
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE',
  path: string,
  body?: unknown,
): Promise<T> {
  let res: Response;
  for (let attempt = 0; ; attempt++) {
    res = await fetch(`${API}${path}`, {
      method,
      headers: {
        Authorization: `Bot ${token}`,
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    // Rate limited (a multi-message board hits the per-channel limit): wait if it is short.
    // Waiting costs no CPU time; a long wait is left to the next cron run.
    if (res.status !== 429 || attempt >= 2) break;
    const after = Number(res.headers.get('Retry-After') ?? '1');
    if (!(after <= MAX_RETRY_WAIT_S)) break;
    await new Promise((r) => setTimeout(r, after * 1000 + 100));
  }
  if (!res.ok) {
    const text = await res.text();
    let code: number | undefined;
    try {
      code = (JSON.parse(text) as { code?: number }).code;
    } catch {
      // not JSON
    }
    throw new DiscordApiError(res.status, code, text.slice(0, 300));
  }
  return (res.status === 204 ? undefined : await res.json()) as T;
}

/** Discord error codes we react to. */
export const DISCORD_UNKNOWN_CHANNEL = 10003;
export const DISCORD_UNKNOWN_MESSAGE = 10008;
export const DISCORD_MISSING_ACCESS = 50001;
export const DISCORD_MISSING_PERMISSIONS = 50013;

/**
 * Discord refuses a DM: 50007 (DMs closed or blocked), 50278 (no server in common with the
 * bot). The user has to share a server with Fishstick and allow DMs from its members.
 */
export function isCannotDm(err: unknown): boolean {
  return err instanceof DiscordApiError && (err.code === 50007 || err.code === 50278);
}
