import { throwEpicError, type EpicToken } from './auth';
import { EPIC_WORLD_INFO_URL } from './constants';

/** Raw world/info response. Validate with worldInfoSchema and convert with parseWorldInfo. */
export async function fetchWorldInfo(token: EpicToken): Promise<unknown> {
  const res = await fetch(EPIC_WORLD_INFO_URL, {
    headers: {
      Authorization: `bearer ${token.accessToken}`,
      'Accept-Language': 'en',
    },
  });
  if (!res.ok) await throwEpicError(res, 'world/info');
  return res.json();
}
