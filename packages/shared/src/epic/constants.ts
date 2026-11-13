// Epic endpoints and the public game-client credentials used by the community.
// Source: https://github.com/LeleDerGrasshalmi/FortniteEndpointsDocumentation
// (checked 2026-11-04). These are internal, undocumented APIs: they may change.

export const EPIC_ACCOUNT_HOST = 'https://account-public-service-prod.ol.epicgames.com';
export const EPIC_TOKEN_URL = `${EPIC_ACCOUNT_HOST}/account/api/oauth/token`;
export const EPIC_WORLD_INFO_URL =
  'https://fngw-mcp-gc-livefn.ol.epicgames.com/fortnite/api/game/v2/world/info';

export interface EpicClient {
  id: string;
  secret: string;
}

/**
 * Known game clients. Epic disables clients from time to time: on 2026-11-04 a local
 * run got `errors.com.epicgames.account.client_disabled` for fortniteIOSGameClient.
 * Pick another one with the EPIC_CLIENT env var. fortniteAndroidGameClient (the default) works:
 * the production Worker fetches world/info with it every day (checked 2026-11-13).
 */
export const EPIC_CLIENTS = {
  fortniteAndroidGameClient: {
    id: '3f69e56c7649492c8cc29f1af08a8a12',
    secret: 'b51ee9cb12234f50a69efa67ef53812e',
  },
  fortnitePCGameClient: {
    id: 'ec684b8c687f479fadea3cb2ad83f5c6',
    secret: 'e1f31c211f28413186262d37a13fc84d',
  },
  fortniteNewSwitchGameClient: {
    id: '98f7e42c2e3a4f86a74eb43fbb41ed39',
    secret: '0a2449a2-001a-451e-afec-3e812901c4d7',
  },
  fortniteIOSGameClient: {
    id: '3446cd72694c4a4485d81b77adbb2141',
    secret: '9209d4a5e25a457fb9b07489d313b41a',
  },
} as const satisfies Record<string, EpicClient>;

export type EpicClientName = keyof typeof EPIC_CLIENTS;

export const DEFAULT_EPIC_CLIENT: EpicClientName = 'fortniteAndroidGameClient';

/**
 * Device auths are bound to the client that created them, so the same client
 * must be used to create the device auth and to log in with it.
 */
export function epicClient(name: string | undefined): EpicClient {
  const key = (name || DEFAULT_EPIC_CLIENT) as EpicClientName;
  const client = EPIC_CLIENTS[key];
  if (!client) {
    throw new Error(
      `Unknown EPIC_CLIENT "${name}". Known: ${Object.keys(EPIC_CLIENTS).join(', ')}`,
    );
  }
  return client;
}

/** Open while logged in to epicgames.com to get a one-time authorization code. */
export function authCodeUrl(client: EpicClient): string {
  return `https://www.epicgames.com/id/api/redirect?clientId=${client.id}&responseType=code`;
}

export function deviceAuthCreateUrl(accountId: string): string {
  return `${EPIC_ACCOUNT_HOST}/account/api/public/account/${accountId}/deviceAuth`;
}
