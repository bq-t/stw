// Linking a player's Epic account (Fishstick stage 4a) and reading their profile.
// Device code flow, checked 2026-11-10 with scripts/epic-explore.ts:
//   Switch client: client_credentials → deviceAuthorization → (player confirms on
//   epicgames.com/activate) → device_code token → exchange code → game client token
//   → device auth (kept encrypted by the Worker).
//
// Only the MCP operations in MCP_ALLOWED can be sent: reading the profile and the
// daily quest / research actions agreed in the plan. Purchases, gifts and opening
// llamas are not in the list and cannot be sent by mistake.

import { EPIC_ACCOUNT_HOST, EPIC_CLIENTS, EPIC_TOKEN_URL, type EpicClient } from './constants';
import { throwEpicError, type EpicToken } from './auth';

const FN_API = 'https://fngw-mcp-gc-livefn.ol.epicgames.com/fortnite/api';
/** The client Epic allows the device code flow for. */
export const DEVICE_CODE_CLIENT: EpicClient = EPIC_CLIENTS.fortniteNewSwitchGameClient;

const basic = (c: EpicClient) => `basic ${btoa(`${c.id}:${c.secret}`)}`;

async function tokenRequest(client: EpicClient, params: Record<string, string>) {
  return fetch(EPIC_TOKEN_URL, {
    method: 'POST',
    headers: { Authorization: basic(client), 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params),
  });
}

interface RawToken {
  access_token: string;
  account_id: string;
  displayName?: string;
  expires_at: string;
}

function toToken(body: RawToken): EpicToken {
  return {
    accessToken: body.access_token,
    accountId: body.account_id,
    displayName: body.displayName,
    expiresAt: body.expires_at,
  };
}

export interface DeviceCodeStart {
  userCode: string;
  deviceCode: string;
  /** epicgames.com/activate?userCode=… */
  verificationUrl: string;
  expiresIn: number;
  /** Seconds between polls Epic asks for. */
  interval: number;
}

/** Step 1: a code the player confirms on epicgames.com. `prompt: login` lets them pick the account. */
export async function startDeviceCode(): Promise<DeviceCodeStart> {
  const cc = await tokenRequest(DEVICE_CODE_CLIENT, { grant_type: 'client_credentials' });
  if (!cc.ok) await throwEpicError(cc, 'Token (client_credentials)');
  const { access_token } = (await cc.json()) as { access_token: string };
  const res = await fetch(`${EPIC_ACCOUNT_HOST}/account/api/oauth/deviceAuthorization`, {
    method: 'POST',
    headers: {
      Authorization: `bearer ${access_token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ prompt: 'login' }),
  });
  if (!res.ok) await throwEpicError(res, 'deviceAuthorization');
  const b = (await res.json()) as {
    user_code: string;
    device_code: string;
    verification_uri_complete: string;
    expires_in: number;
    interval?: number;
  };
  return {
    userCode: b.user_code,
    deviceCode: b.device_code,
    verificationUrl: b.verification_uri_complete,
    expiresIn: b.expires_in,
    interval: b.interval ?? 10,
  };
}

export type DeviceCodePoll =
  { status: 'pending' } | { status: 'expired' } | { status: 'confirmed'; token: EpicToken };

const PENDING = 'errors.com.epicgames.account.oauth.authorization_pending';
const EXPIRED = [
  'errors.com.epicgames.account.oauth.expired_device_code',
  'errors.com.epicgames.account.oauth.device_code_not_found',
  'errors.com.epicgames.account.oauth.authorization_declined',
];

/** Step 2: one poll. "pending" until the player confirms; the token is the Switch client's. */
export async function pollDeviceCode(deviceCode: string): Promise<DeviceCodePoll> {
  const res = await tokenRequest(DEVICE_CODE_CLIENT, {
    grant_type: 'device_code',
    device_code: deviceCode,
    token_type: 'eg1',
  });
  if (res.ok) return { status: 'confirmed', token: toToken((await res.json()) as RawToken) };
  const body = (await res.json().catch(() => ({}))) as { errorCode?: string };
  if (body.errorCode === PENDING) return { status: 'pending' };
  if (body.errorCode && EXPIRED.includes(body.errorCode)) return { status: 'expired' };
  throw new Error(`device_code poll: HTTP ${res.status} ${body.errorCode ?? ''}`);
}

/** Step 3: a token of another client for the same account (the MCP needs the game client). */
export async function exchangeToClient(token: EpicToken, client: EpicClient): Promise<EpicToken> {
  const ex = await fetch(`${EPIC_ACCOUNT_HOST}/account/api/oauth/exchange`, {
    headers: { Authorization: `bearer ${token.accessToken}` },
  });
  if (!ex.ok) await throwEpicError(ex, 'exchange');
  const { code } = (await ex.json()) as { code: string };
  const res = await tokenRequest(client, {
    grant_type: 'exchange_code',
    exchange_code: code,
    token_type: 'eg1',
  });
  if (!res.ok) await throwEpicError(res, 'Token (exchange_code)');
  return toToken((await res.json()) as RawToken);
}

/** Ends a session (temporary tokens after linking). Failures are ignored. */
export async function killSession(token: EpicToken): Promise<void> {
  await fetch(`${EPIC_ACCOUNT_HOST}/account/api/oauth/sessions/kill/${token.accessToken}`, {
    method: 'DELETE',
    headers: { Authorization: `bearer ${token.accessToken}` },
  }).catch(() => undefined);
}

/** Removes a device auth on Epic's side ("Unlink"). */
export async function deleteDeviceAuth(token: EpicToken, deviceId: string): Promise<void> {
  const res = await fetch(
    `${EPIC_ACCOUNT_HOST}/account/api/public/account/${token.accountId}/deviceAuth/${deviceId}`,
    { method: 'DELETE', headers: { Authorization: `bearer ${token.accessToken}` } },
  );
  if (!res.ok && res.status !== 404) await throwEpicError(res, 'Delete device auth');
}

// ---------- MCP (profile operations) ----------

/** The only operations Fishstick may send for a linked player (see the plan, "Привязка Epic"). */
export const MCP_ALLOWED = {
  QueryProfile: ['campaign', 'common_core', 'athena'],
  /** Grants the daily quest, as logging into the game does. */
  ClientQuestLogin: ['campaign'],
  FortRerollDailyQuest: ['campaign'],
  /** Collects accumulated research points. */
  ClaimCollectedResources: ['campaign'],
  /** Rolls the X-ray llama contents for viewing (the game does it when the store opens). */
  PopulatePrerolledOffers: ['campaign'],
} as const satisfies Record<string, readonly string[]>;

export type McpOperation = keyof typeof MCP_ALLOWED;

export async function mcp<T = unknown>(
  token: EpicToken,
  operation: McpOperation,
  profileId: string,
  body: Record<string, unknown> = {},
): Promise<T> {
  return JSON.parse(await mcpText(token, operation, profileId, body)) as T;
}

/** The raw response text, for callers that cut out only what they need (big profiles). */
export async function mcpText(
  token: EpicToken,
  operation: McpOperation,
  profileId: string,
  body: Record<string, unknown> = {},
): Promise<string> {
  const allowed = MCP_ALLOWED[operation] as readonly string[] | undefined;
  if (!allowed?.includes(profileId))
    throw new Error(`MCP ${operation} on ${profileId} is not allowed`);
  const res = await fetch(
    `${FN_API}/game/v2/profile/${token.accountId}/client/${operation}?profileId=${profileId}&rvn=-1`,
    {
      method: 'POST',
      headers: { Authorization: `bearer ${token.accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  );
  if (!res.ok) await throwEpicError(res, `MCP ${operation}`);
  return res.text();
}

/** Catalog of the dedicated account (BR and STW storefronts). */
export async function fetchCatalog(token: EpicToken): Promise<unknown> {
  const res = await fetch(`${FN_API}/storefront/v2/catalog`, {
    headers: { Authorization: `bearer ${token.accessToken}`, 'Accept-Language': 'en' },
  });
  if (!res.ok) await throwEpicError(res, 'catalog');
  return res.json();
}
