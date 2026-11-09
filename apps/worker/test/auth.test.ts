import { describe, expect, it } from 'vitest';
import { avatarUrl, base64url, cookie, parseCookies, safeReturnUrl, sha256 } from '../src/auth';

const SITE = 'https://stw.bq-t.pro';
const allowed = (o: string) => o === SITE || o === 'http://localhost:3000';

describe('safeReturnUrl', () => {
  it('keeps URLs on allowed origins', () => {
    expect(safeReturnUrl('https://stw.bq-t.pro/ru/questline?x=1', SITE, allowed)).toBe(
      'https://stw.bq-t.pro/ru/questline?x=1',
    );
    expect(safeReturnUrl('http://localhost:3000/', SITE, allowed)).toBe('http://localhost:3000/');
  });

  it('resolves relative paths against the site', () => {
    expect(safeReturnUrl('/ru', SITE, allowed)).toBe('https://stw.bq-t.pro/ru');
  });

  it('blocks open redirects', () => {
    for (const bad of [
      'https://evil.example/',
      '//evil.example/x',
      'javascript:alert(1)',
      null,
      '',
    ])
      expect(safeReturnUrl(bad, SITE, allowed)).toBe('https://stw.bq-t.pro/');
  });
});

describe('cookies', () => {
  it('parses a Cookie header, first value wins', () => {
    expect(parseCookies('a=1; stw_session=abc_-; a=2')).toEqual({ a: '1', stw_session: 'abc_-' });
    expect(parseCookies(null)).toEqual({});
  });

  it('builds a secure session cookie', () => {
    expect(cookie('s', 'v', { maxAge: 60 })).toBe(
      's=v; Path=/; Max-Age=60; HttpOnly; Secure; SameSite=Lax',
    );
  });
});

describe('tokens', () => {
  it('base64url has no padding or +/', () => {
    expect(base64url(new Uint8Array([251, 255, 254]))).toBe('-__-');
  });

  it('sha256 is stable', async () => {
    expect(await sha256('abc')).toBe('ungWv48Bz-pBQUDeXa4iI7ADYaOWF3qctBD_YfIAFa0');
  });
});

describe('avatarUrl', () => {
  it('uses the avatar hash or a default avatar', () => {
    expect(avatarUrl({ id: '80351110224678912', avatar: 'abc' })).toBe(
      'https://cdn.discordapp.com/avatars/80351110224678912/abc.png?size=64',
    );
    expect(avatarUrl({ id: '80351110224678912', avatar: null })).toMatch(
      /^https:\/\/cdn\.discordapp\.com\/embed\/avatars\/[0-5]\.png$/,
    );
  });
});
