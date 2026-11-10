import { describe, expect, it } from 'vitest';
import { decrypt, encrypt } from '../src/crypto';

const KEY = Buffer.alloc(32, 7).toString('base64');
const OTHER = Buffer.alloc(32, 9).toString('base64');

describe('crypto', () => {
  it('round-trips and uses a fresh IV each time', async () => {
    const a = await encrypt(KEY, 'secret', 'epic-link:1');
    const b = await encrypt(KEY, 'secret', 'epic-link:1');
    expect(a).not.toBe(b);
    expect(a.startsWith('v1.')).toBe(true);
    expect(a).not.toContain('secret');
    expect(await decrypt(KEY, a, 'epic-link:1')).toBe('secret');
  });

  it('refuses another row, another key or a changed value', async () => {
    const v = await encrypt(KEY, 'secret', 'epic-link:1');
    await expect(decrypt(KEY, v, 'epic-link:2')).rejects.toThrow();
    await expect(decrypt(OTHER, v, 'epic-link:1')).rejects.toThrow();
    const broken = v.slice(0, -2) + (v.endsWith('A') ? 'BB' : 'AA');
    await expect(decrypt(KEY, broken, 'epic-link:1')).rejects.toThrow();
  });

  it('rejects a key of the wrong size', async () => {
    await expect(encrypt(Buffer.alloc(16).toString('base64'), 'x', 'a')).rejects.toThrow(
      /32 bytes/,
    );
  });
});
