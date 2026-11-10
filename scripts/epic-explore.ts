/* eslint-disable @typescript-eslint/no-explicit-any -- exploring raw, undocumented Epic responses */
// Read-only checks before the Epic link and the shops (Fishstick stage 4). Saves raw
// responses to fixtures/ (git-ignored).
//
//   pnpm epic:explore catalog   # STW storefronts with the dedicated account + BR shop source
//   pnpm epic:explore preroll   # X-ray llama contents of the dedicated account (populates them
//                               # like opening the store in game does)
//   pnpm epic:explore events    # tournaments (events service), their names, calendar, news
//   pnpm epic:explore link      # device code flow: prints a link, waits for "Confirm",
//                               # then reads the profile summary. Creates nothing permanent.
//
// Env (.env): EPIC_CLIENT, EPIC_ACCOUNT_ID, EPIC_DEVICE_ID, EPIC_DEVICE_SECRET.

import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  EPIC_ACCOUNT_HOST,
  EPIC_CLIENTS,
  EPIC_TOKEN_URL,
  epicClient,
  loginWithDeviceAuth,
  type EpicClient,
} from '@stw/shared/epic';

const FN = 'https://fngw-mcp-gc-livefn.ol.epicgames.com/fortnite/api';
const out = resolve(import.meta.dirname, '../fixtures');
mkdirSync(out, { recursive: true });

function save(name: string, data: unknown) {
  const file = resolve(out, name);
  writeFileSync(file, JSON.stringify(data, null, 2));
  console.log(`  saved ${file}`);
}

const basic = (c: EpicClient) => `basic ${btoa(`${c.id}:${c.secret}`)}`;

async function json(res: Response, what: string): Promise<any> {
  const text = await res.text();
  if (!res.ok) throw new Error(`${what}: HTTP ${res.status} ${text.slice(0, 300)}`);
  return JSON.parse(text);
}

async function catalog() {
  const token = await loginWithDeviceAuth(epicClient(process.env.EPIC_CLIENT), {
    accountId: process.env.EPIC_ACCOUNT_ID!,
    deviceId: process.env.EPIC_DEVICE_ID!,
    secret: process.env.EPIC_DEVICE_SECRET!,
  });
  console.log('Catalog (storefront v2):');
  const cat = await json(
    await fetch(`${FN}/storefront/v2/catalog`, {
      headers: { Authorization: `bearer ${token.accessToken}`, 'Accept-Language': 'en' },
    }),
    'catalog',
  );
  save('catalog.json', cat);
  for (const sf of cat.storefronts ?? []) {
    const entries = sf.catalogEntries ?? [];
    const sample = entries
      .slice(0, 3)
      .map(
        (e: any) =>
          `${e.devName ?? e.offerId} [${(e.prices ?? []).map((p: any) => `${p.finalPrice} ${p.currencySubType || p.currencyType}`).join(', ')}]`,
      )
      .join(' | ');
    console.log(`  ${sf.name}: ${entries.length} entries${sample ? ` — ${sample}` : ''}`);
  }
  console.log(`  refresh: dailyPurchaseHrs=${cat.dailyPurchaseHrs} expiration=${cat.expiration}`);

  console.log('BR shop (fortnite-api.com):');
  const res = await fetch('https://fortnite-api.com/v2/shop?language=en');
  console.log(`  HTTP ${res.status}`);
  if (res.ok) {
    const shop: any = await res.json();
    save('br-shop.json', shop);
    const entries = shop.data?.entries ?? [];
    console.log(`  ${entries.length} entries, date ${shop.data?.date}`);
  }
}

async function link() {
  // Device code flow works with the Switch client; its token is then exchanged for the
  // game client the MCP accepts (the one in EPIC_CLIENT).
  const sw = EPIC_CLIENTS.fortniteNewSwitchGameClient;
  const cc = await json(
    await fetch(EPIC_TOKEN_URL, {
      method: 'POST',
      headers: { Authorization: basic(sw), 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'client_credentials' }),
    }),
    'client_credentials',
  );
  const da = await json(
    await fetch(`${EPIC_ACCOUNT_HOST}/account/api/oauth/deviceAuthorization`, {
      method: 'POST',
      headers: {
        Authorization: `bearer ${cc.access_token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ prompt: 'login' }),
    }),
    'deviceAuthorization',
  );
  console.log(
    `\nOpen and confirm (expires in ${da.expires_in}s):\n  ${da.verification_uri_complete}\n`,
  );

  let token: any = null;
  const deadline = Date.now() + da.expires_in * 1000;
  while (!token && Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, (da.interval ?? 10) * 1000));
    let res: Response;
    try {
      res = await fetch(EPIC_TOKEN_URL, {
        method: 'POST',
        headers: { Authorization: basic(sw), 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ grant_type: 'device_code', device_code: da.device_code }),
      });
    } catch (err) {
      // A dropped connection is not an answer: ask again on the next tick.
      console.log(`  poll failed (${(err as Error).message}), retrying`);
      continue;
    }
    const body: any = await res.json();
    if (res.ok) token = body;
    else if (body.errorCode !== 'errors.com.epicgames.account.oauth.authorization_pending')
      throw new Error(`device_code: ${res.status} ${body.errorCode}`);
  }
  if (!token) throw new Error('not confirmed in time');
  console.log(`Confirmed: ${token.displayName} (${token.account_id})`);

  // Exchange the Switch token for the game client token.
  const ex = await json(
    await fetch(`${EPIC_ACCOUNT_HOST}/account/api/oauth/exchange`, {
      headers: { Authorization: `bearer ${token.access_token}` },
    }),
    'exchange',
  );
  const game = epicClient(process.env.EPIC_CLIENT);
  const gameToken = await json(
    await fetch(EPIC_TOKEN_URL, {
      method: 'POST',
      headers: { Authorization: basic(game), 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'exchange_code',
        exchange_code: ex.code,
        token_type: 'eg1',
      }),
    }),
    'exchange_code',
  );
  console.log(`Game client token OK (${process.env.EPIC_CLIENT || 'default'})`);

  // Read-only: QueryProfile campaign.
  const qp = await json(
    await fetch(
      `${FN}/game/v2/profile/${gameToken.account_id}/client/QueryProfile?profileId=campaign&rvn=-1`,
      {
        method: 'POST',
        headers: {
          Authorization: `bearer ${gameToken.access_token}`,
          'Content-Type': 'application/json',
        },
        body: '{}',
      },
    ),
    'QueryProfile',
  );
  save('profile-campaign.json', qp);
  const items = Object.values(qp.profileChanges?.[0]?.profile?.items ?? {}) as any[];
  const byType = new Map<string, number>();
  for (const it of items) {
    const t = String(it.templateId).split(':')[0] ?? '';
    byType.set(t, (byType.get(t) ?? 0) + 1);
  }
  console.log('Campaign profile items by type:', Object.fromEntries(byType));
  const quests = items.filter((i) => String(i.templateId).startsWith('Quest:'));
  console.log(
    `Quests: ${quests.length}, claimed: ${quests.filter((q) => q.attributes?.quest_state === 'Claimed').length}`,
  );

  // Close both sessions: nothing stays behind.
  for (const t of [token.access_token, gameToken.access_token]) {
    await fetch(`${EPIC_ACCOUNT_HOST}/account/api/oauth/sessions/kill/${t}`, {
      method: 'DELETE',
      headers: { Authorization: `bearer ${t}` },
    });
  }
  console.log('Sessions closed.');
}

async function events() {
  const token = await loginWithDeviceAuth(epicClient(process.env.EPIC_CLIENT), {
    accountId: process.env.EPIC_ACCOUNT_ID!,
    deviceId: process.env.EPIC_DEVICE_ID!,
    secret: process.env.EPIC_DEVICE_SECRET!,
  });
  const auth = { Authorization: `bearer ${token.accessToken}` };
  const get = async (name: string, url: string, headers: Record<string, string> = auth) => {
    const res = await fetch(url, { headers });
    console.log(`${name}: HTTP ${res.status}`);
    if (!res.ok) {
      console.log('  ', (await res.text()).slice(0, 300));
      return null;
    }
    const data = await res.json();
    save(`${name}.json`, data);
    return data;
  };
  // Tournaments: events of a region/platform (the same list the game's Compete tab shows).
  for (const region of ['EU', 'NAC']) {
    const ev: any = await get(
      `events-${region}`,
      `https://events-public-service-live.ol.epicgames.com/api/v1/events/Fortnite/download/${token.accountId}?region=${region}&platform=Windows&teamAccountIds=${token.accountId}`,
    );
    if (ev) console.log(`  events: ${ev.events?.length}, templates: ${ev.templates?.length}`);
  }
  // Tournament names and posters.
  await get(
    'tournamentinformation',
    'https://fortnitecontent-website-prod07.ol.epicgames.com/content/api/pages/fortnite-game/tournamentinformation',
    {},
  );
  // Calendar: active client events (BR and STW event flags).
  await get('calendar', `${FN}/calendar/v1/timeline`);
  // News and the whole content page (STW and BR event texts).
  await get(
    'fortnite-game',
    'https://fortnitecontent-website-prod07.ol.epicgames.com/content/api/pages/fortnite-game',
    {},
  );
  await killSessionToken(token.accessToken);
}

async function killSessionToken(t: string) {
  await fetch(`${EPIC_ACCOUNT_HOST}/account/api/oauth/sessions/kill/${t}`, {
    method: 'DELETE',
    headers: { Authorization: `bearer ${t}` },
  });
}

async function preroll() {
  const token = await loginWithDeviceAuth(epicClient(process.env.EPIC_CLIENT), {
    accountId: process.env.EPIC_ACCOUNT_ID!,
    deviceId: process.env.EPIC_DEVICE_ID!,
    secret: process.env.EPIC_DEVICE_SECRET!,
  });
  const call = async (op: string) =>
    json(
      await fetch(
        `${FN}/game/v2/profile/${token.accountId}/client/${op}?profileId=campaign&rvn=-1`,
        {
          method: 'POST',
          headers: {
            Authorization: `bearer ${token.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: '{}',
        },
      ),
      op,
    );
  const prerolls = (r: any) =>
    Object.entries(r.profileChanges?.[0]?.profile?.items ?? {}).filter(([, v]: any) =>
      String(v.templateId).startsWith('PrerollData:'),
    );
  let r = await call('QueryProfile');
  console.log('PrerollData before:', prerolls(r).length);
  if (!prerolls(r).length) {
    const p = await call('PopulatePrerolledOffers');
    save('populate-prerolled.json', p);
    r = await call('QueryProfile');
  }
  save('profile-campaign-preroll.json', r);
  for (const [id, v] of prerolls(r) as any[]) console.log(id, JSON.stringify(v).slice(0, 2000));
}

const mode = process.argv[2];
if (mode === 'catalog') await catalog();
else if (mode === 'link') await link();
else if (mode === 'preroll') await preroll();
else if (mode === 'events') await events();
else console.log('Usage: pnpm epic:explore catalog|preroll|events|link');
