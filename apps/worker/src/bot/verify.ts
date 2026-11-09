// Discord signs every interaction with Ed25519: X-Signature-Ed25519 over timestamp + body.
// Requests that fail the check must get 401, Discord tests this when the endpoint is saved.

function hexToBytes(hex: string): Uint8Array<ArrayBuffer> {
  if (!/^(?:[0-9a-f]{2})+$/i.test(hex)) throw new Error('bad hex');
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

const keys = new Map<string, Promise<CryptoKey>>();

function importKey(publicKeyHex: string): Promise<CryptoKey> {
  let key = keys.get(publicKeyHex);
  if (!key) {
    key = crypto.subtle.importKey('raw', hexToBytes(publicKeyHex), { name: 'Ed25519' }, false, [
      'verify',
    ]);
    keys.set(publicKeyHex, key);
  }
  return key;
}

export async function verifyDiscordRequest(
  publicKeyHex: string,
  signatureHex: string | null,
  timestamp: string | null,
  body: string,
): Promise<boolean> {
  if (!signatureHex || !timestamp) return false;
  try {
    return await crypto.subtle.verify(
      { name: 'Ed25519' },
      await importKey(publicKeyHex),
      hexToBytes(signatureHex),
      new TextEncoder().encode(timestamp + body),
    );
  } catch {
    return false;
  }
}
