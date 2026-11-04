import { EPIC_TOKEN_URL, deviceAuthCreateUrl, type EpicClient } from './constants';

export interface DeviceAuth {
  accountId: string;
  deviceId: string;
  secret: string;
}

export interface EpicToken {
  accessToken: string;
  accountId: string;
  displayName?: string;
  expiresAt: string;
}

export class EpicApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly errorCode?: string,
  ) {
    super(message);
    this.name = 'EpicApiError';
  }
}

function basicAuth(client: EpicClient): string {
  return `basic ${btoa(`${client.id}:${client.secret}`)}`;
}

/** Reads an Epic error body ({ errorCode, errorMessage }) and throws EpicApiError. */
export async function throwEpicError(res: Response, what: string): Promise<never> {
  let errorCode: string | undefined;
  let detail = '';
  try {
    const body = (await res.json()) as { errorCode?: string; errorMessage?: string };
    errorCode = body.errorCode;
    detail = body.errorMessage ?? '';
  } catch {
    // not JSON
  }
  throw new EpicApiError(
    `${what} failed: HTTP ${res.status}${errorCode ? ` ${errorCode}` : ''}${detail ? ` — ${detail}` : ''}`,
    res.status,
    errorCode,
  );
}

async function requestToken(
  client: EpicClient,
  params: Record<string, string>,
): Promise<EpicToken> {
  const res = await fetch(EPIC_TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: basicAuth(client),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ ...params, token_type: 'eg1' }),
  });
  if (!res.ok) await throwEpicError(res, `Token (${params.grant_type})`);
  const body = (await res.json()) as {
    access_token: string;
    account_id: string;
    displayName?: string;
    expires_at: string;
  };
  return {
    accessToken: body.access_token,
    accountId: body.account_id,
    displayName: body.displayName,
    expiresAt: body.expires_at,
  };
}

/** One-time login with a code from EPIC_AUTH_CODE_URL. */
export function loginWithAuthorizationCode(client: EpicClient, code: string): Promise<EpicToken> {
  return requestToken(client, { grant_type: 'authorization_code', code });
}

/** Regular login used by the Worker every day. */
export function loginWithDeviceAuth(client: EpicClient, auth: DeviceAuth): Promise<EpicToken> {
  return requestToken(client, {
    grant_type: 'device_auth',
    account_id: auth.accountId,
    device_id: auth.deviceId,
    secret: auth.secret,
  });
}

/** Creates a long-lived device auth for the logged-in account. The secret is shown only once. */
export async function createDeviceAuth(token: EpicToken): Promise<DeviceAuth> {
  const res = await fetch(deviceAuthCreateUrl(token.accountId), {
    method: 'POST',
    headers: { Authorization: `bearer ${token.accessToken}` },
  });
  if (!res.ok) await throwEpicError(res, 'Create device auth');
  const body = (await res.json()) as DeviceAuth;
  return { accountId: body.accountId, deviceId: body.deviceId, secret: body.secret };
}
