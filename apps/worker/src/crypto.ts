// AES-GCM for secrets kept in D1 (a linked player's device auth, pending device codes).
// Key: secret EPIC_LINK_KEY, 32 random bytes in base64 (never in D1 or the repo).
// Each value gets a random IV; `aad` (e.g. "epic-link:<discord user id>") binds the
// ciphertext to its row, so a value copied to another user's row does not decrypt.
// Format: "v1.<iv b64url>.<ciphertext b64url>" (v1 = key version, for rotation).

const VERSION = 'v1';
const keys = new Map<string, Promise<CryptoKey>>();

function b64url(bytes: Uint8Array): string {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromB64(s: string): Uint8Array<ArrayBuffer> {
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

function importKey(keyB64: string): Promise<CryptoKey> {
  let key = keys.get(keyB64);
  if (!key) {
    const raw = fromB64(keyB64);
    if (raw.length !== 32) throw new Error('EPIC_LINK_KEY must be 32 bytes (base64)');
    key = crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']);
    keys.set(keyB64, key);
  }
  return key;
}

export async function encrypt(keyB64: string, plaintext: string, aad: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv, additionalData: new TextEncoder().encode(aad) },
    await importKey(keyB64),
    new TextEncoder().encode(plaintext),
  );
  return `${VERSION}.${b64url(iv)}.${b64url(new Uint8Array(ct))}`;
}

export async function decrypt(keyB64: string, value: string, aad: string): Promise<string> {
  const [version, iv, ct] = value.split('.');
  if (version !== VERSION || !iv || !ct) throw new Error('unknown ciphertext format');
  const pt = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: fromB64(iv), additionalData: new TextEncoder().encode(aad) },
    await importKey(keyB64),
    fromB64(ct),
  );
  return new TextDecoder().decode(pt);
}
