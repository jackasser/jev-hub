import { describe, expect, it } from 'vitest';
import { BASE, BASE_ROOT, isSiteRoot, stripBase, withBase } from '../../src/lib/base';

const PATHS = ['/', '/entries', '/entries/jev', '/what-is-jev', '/covers/jev.svg', '/rss.xml'];

describe('base (R-12)', () => {
  it('AC-12-1: BASE has a leading slash and no trailing slash, or is empty', () => {
    expect(BASE === '' || /^\/[^/](.*[^/])?$/.test(BASE), BASE).toBe(true);
    expect(BASE_ROOT).toBe(`${BASE}/`);
  });

  it('AC-12-1: withBase never produces a double slash', () => {
    for (const path of PATHS) {
      expect(withBase(path), path).not.toMatch(/\/\//);
      expect(withBase(path).startsWith('/'), path).toBe(true);
    }
  });

  it('AC-12-1: the site root keeps its trailing slash, other paths do not gain one', () => {
    expect(withBase('/')).toBe(BASE_ROOT);
    expect(withBase('')).toBe(BASE_ROOT);
    expect(withBase('/entries')).toBe(`${BASE}/entries`);
    expect(withBase('/entries').endsWith('/')).toBe(false);
  });

  it('AC-12-1: stripBase undoes withBase', () => {
    for (const path of PATHS) {
      expect(stripBase(withBase(path)), path).toBe(path === '' ? '/' : path);
    }
  });

  it('AC-12-1: stripBase leaves a path that does not carry the base alone', () => {
    expect(stripBase('/entries')).toBe(BASE ? '/entries' : '/entries');
    expect(stripBase('')).toBe('/');
  });

  it('AC-12-1: a path that merely starts with the same letters is not treated as based', () => {
    if (!BASE) return;
    const lookalike = `${BASE}-other/entries`;
    expect(stripBase(lookalike)).toBe(lookalike);
  });

  it('AC-12-1: isSiteRoot recognises the deployed root only', () => {
    expect(isSiteRoot(BASE_ROOT)).toBe(true);
    expect(isSiteRoot('/')).toBe(true);
    expect(isSiteRoot(withBase('/entries'))).toBe(false);
  });
});
