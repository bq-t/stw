import { Db, type DiscordUser, type UserRow } from './db';
import type { Env } from './env';

// Discord OAuth2 login for the site (stage 1 of the Fishstick plan).
//   GET  /api/auth/discord/login?return=<url>  → Discord
//   GET  /api/auth/discord/callback            → session cookie, back to <url>
//   GET  /api/me                               → { user } or { user: null }
//   POST /api/auth/logout
// The cookie holds a random token; D1 stores only its SHA-256.

const DISCORD_API = 'https://discord.com/api/v10';
export const SESSION_COOKIE = 'stw_session';
const STATE_COOKIE = 'stw_oauth';
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const STATE_TTL_S = 10 * 60;

// ---------- helpers (pure, tested) ----------

export function base64url(bytes: Uint8Array): string {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function randomToken(bytes = 32): string {
  return base64url(crypto.getRandomValues(new Uint8Array(bytes)));
}

export async function sha256(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return base64url(new Uint8Array(digest));
}

export function parseCookies(header: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq < 0) continue;
    const name = part.slice(0, eq).trim();
    if (name && !(name in out)) out[name] = part.slice(eq + 1).trim();
  }
  return out;
}

export function cookie(
  name: string,
  value: string,
  opts: { maxAge: number; path?: string },
): string {
  return `${name}=${value}; Path=${opts.path ?? '/'}; Max-Age=${opts.maxAge}; HttpOnly; Secure; SameSite=Lax`;
}

/**
 * Where to send the user after login: an absolute URL on an allowed origin,
 * otherwise the site root. Blocks open redirects.
 */
export function safeReturnUrl(
  raw: string | null,
  siteUrl: string,
  isAllowedOrigin: (origin: string) => boolean,
): string {
  if (raw) {
    try {
      const url = new URL(raw, siteUrl);
      if ((url.protocol === 'https:' || url.protocol === 'http:') && isAllowedOrigin(url.origin))
        return url.toString();
    } catch {
      // fall through
    }
  }
  return new URL('/', siteUrl).toString();
}

export function avatarUrl(user: Pick<UserRow, 'id' | 'avatar'>): string {
  if (user.avatar)
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=64`;
  // Default avatars: (id >> 22) % 6 for the new username system.
  const index = Number((BigInt(user.id) >> 22n) % 6n);
  return `https://cdn.discordapp.com/embed/avatars/${index}.png`;
}

// ---------- handlers ----------

export interface AuthContext {
  env: Env;
  isAllowedOrigin: (origin: string) => boolean;
  now: number;
}

function redirect(location: string, cookies: string[] = []): Response {
  const headers = new Headers({ Location: location, 'Cache-Control': 'no-store' });
  for (const c of cookies) headers.append('Set-Cookie', c);
  return new Response(null, { status: 302, headers });
}

/**
 * Must match a Redirect in the Discord app. `wrangler dev` rewrites request.url to the
 * route's host (stw.bq-t.pro), so local dev sets AUTH_ORIGIN=http://localhost:8787.
 */
function callbackUrl(request: Request, env: Env): string {
  return new URL('/api/auth/discord/callback', env.AUTH_ORIGIN || request.url).toString();
}

export function isAuthConfigured(env: Env): env is Env & {
  DB: D1Database;
  DISCORD_CLIENT_ID: string;
  DISCORD_CLIENT_SECRET: string;
} {
  return Boolean(env.DB && env.DISCORD_CLIENT_ID && env.DISCORD_CLIENT_SECRET);
}

export function handleLogin(request: Request, ctx: AuthContext): Response {
  const url = new URL(request.url);
  const back = safeReturnUrl(url.searchParams.get('return'), ctx.env.SITE_URL, ctx.isAllowedOrigin);
  const state = randomToken(16);
  const authorize = new URL('https://discord.com/oauth2/authorize');
  authorize.search = new URLSearchParams({
    client_id: ctx.env.DISCORD_CLIENT_ID ?? '',
    response_type: 'code',
    redirect_uri: callbackUrl(request, ctx.env),
    scope: 'identify',
    state,
    prompt: 'none',
  }).toString();
  const value = `${state}.${base64url(new TextEncoder().encode(back))}`;
  return redirect(authorize.toString(), [
    cookie(STATE_COOKIE, value, { maxAge: STATE_TTL_S, path: '/api/auth' }),
  ]);
}

function decodeState(value: string | undefined): { state: string; back: string } | null {
  if (!value) return null;
  const dot = value.indexOf('.');
  if (dot < 0) return null;
  try {
    const b64 = value
      .slice(dot + 1)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    return { state: value.slice(0, dot), back: new TextDecoder().decode(bytes) };
  } catch {
    return null;
  }
}

export async function handleCallback(request: Request, ctx: AuthContext): Promise<Response> {
  const { env } = ctx;
  if (!isAuthConfigured(env)) return new Response('auth not configured', { status: 503 });
  const url = new URL(request.url);
  const saved = decodeState(parseCookies(request.headers.get('Cookie'))[STATE_COOKIE]);
  const clearState = cookie(STATE_COOKIE, '', { maxAge: 0, path: '/api/auth' });
  const back = safeReturnUrl(saved?.back ?? null, env.SITE_URL, ctx.isAllowedOrigin);

  const fail = (reason: string) => {
    const target = new URL(back);
    target.searchParams.set('login', reason);
    return redirect(target.toString(), [clearState]);
  };

  const code = url.searchParams.get('code');
  // User pressed "Cancel" on Discord: error=access_denied.
  if (!code) return fail(url.searchParams.get('error') === 'access_denied' ? 'cancelled' : 'error');
  if (!saved || saved.state !== url.searchParams.get('state')) return fail('error');

  const tokenRes = await fetch(`${DISCORD_API}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: env.DISCORD_CLIENT_ID,
      client_secret: env.DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: callbackUrl(request, env),
    }),
  });
  if (!tokenRes.ok) {
    console.error('discord token', tokenRes.status, await tokenRes.text());
    return fail('error');
  }
  const { access_token } = (await tokenRes.json()) as { access_token: string };

  const meRes = await fetch(`${DISCORD_API}/users/@me`, {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  if (!meRes.ok) {
    console.error('discord @me', meRes.status, await meRes.text());
    return fail('error');
  }
  const user = (await meRes.json()) as DiscordUser;

  const db = new Db(env.DB);
  const token = randomToken();
  await db.upsertUser(user, ctx.now);
  await db.createSession(await sha256(token), user.id, ctx.now, SESSION_TTL_MS);

  return redirect(back, [
    clearState,
    cookie(SESSION_COOKIE, token, { maxAge: SESSION_TTL_MS / 1000 }),
  ]);
}

/** The logged-in user of this request, or null. */
export async function currentUser(request: Request, env: Env, now: number) {
  if (!env.DB) return null;
  const token = parseCookies(request.headers.get('Cookie'))[SESSION_COOKIE];
  if (!token) return null;
  return new Db(env.DB).sessionUser(await sha256(token), now);
}

export interface PublicUser {
  id: string;
  name: string;
  avatarUrl: string;
  locale: string | null;
}

export function publicUser(row: UserRow): PublicUser {
  return {
    id: row.id,
    name: row.global_name ?? row.username,
    avatarUrl: avatarUrl(row),
    locale: row.locale,
  };
}

/** Deletes the session and returns the cookie that clears it. */
export async function logout(request: Request, env: Env): Promise<string> {
  const token = parseCookies(request.headers.get('Cookie'))[SESSION_COOKIE];
  if (token && env.DB) await new Db(env.DB).deleteSession(await sha256(token));
  return cookie(SESSION_COOKIE, '', { maxAge: 0 });
}
