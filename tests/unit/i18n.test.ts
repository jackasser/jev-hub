import { describe, expect, it } from 'vitest';
import { en } from '../../src/i18n/en';
import { ja } from '../../src/i18n/ja';
import {
  LOCALES,
  categoryPath,
  localePath,
  localeFromPath,
  otherLocale,
  otherLocalePath,
  stripLocale,
  t,
} from '../../src/i18n';
import { BASE, BASE_ROOT, withBase } from '../../src/lib/base';

const PATHS = ['/', '/entries', '/entries/jev', '/what-is-jev', '/about', '/category/oss'];

describe('i18n', () => {
  it('AC-05-2: both locales define exactly the same keys', () => {
    expect(Object.keys(ja).sort()).toEqual(Object.keys(en).sort());
  });

  it('AC-05-2: no message is empty', () => {
    for (const locale of LOCALES) {
      for (const key of Object.keys(en) as (keyof typeof en)[]) {
        expect(t(locale, key).trim(), `${locale}:${key}`).not.toBe('');
      }
    }
  });

  it('AC-03-1: the vendor-claim notice exists in both locales and names TypeSafe', () => {
    expect(t('en', 'claims.body')).toMatch(/TypeSafe/);
    expect(t('ja', 'claims.body')).toMatch(/TypeSafe/);
    expect(t('en', 'claims.body')).toMatch(/Nothing on this site is an independent benchmark/i);
    expect(t('ja', 'claims.body')).toMatch(/独立に測定したものではない/);
  });

  it('AC-05-1: localePath round-trips through stripLocale', () => {
    for (const path of PATHS) {
      expect(stripLocale(localePath('en', path))).toBe(path);
      expect(stripLocale(localePath('ja', path))).toBe(path);
    }
  });

  it('AC-05-1: the English path carries no locale prefix and the Japanese one does', () => {
    expect(localePath('en', '/entries')).toBe(withBase('/entries'));
    expect(localePath('ja', '/entries')).toBe(withBase('/ja/entries'));
    expect(localePath('en', '/')).toBe(BASE_ROOT);
    expect(localePath('ja', '/')).toBe(withBase('/ja/'));
  });

  it('AC-12-2: every path localePath builds starts from the deployment base', () => {
    for (const path of PATHS) {
      for (const locale of LOCALES) {
        expect(localePath(locale, path).startsWith(BASE_ROOT), `${locale}:${path}`).toBe(true);
      }
    }
  });

  it('AC-05-1: localeFromPath reads the prefix back', () => {
    expect(localeFromPath('/entries')).toBe('en');
    expect(localeFromPath('/ja')).toBe('ja');
    expect(localeFromPath('/ja/entries')).toBe('ja');
    // A path that merely starts with the letters "ja" is not the Japanese locale.
    expect(localeFromPath('/jaggedness')).toBe('en');
  });

  it('AC-12-3: localeFromPath reads a real browser pathname, base and all', () => {
    expect(localeFromPath(`${BASE}/entries`)).toBe('en');
    expect(localeFromPath(`${BASE}/ja/entries`)).toBe('ja');
    expect(localeFromPath(BASE_ROOT)).toBe('en');
    expect(localeFromPath(withBase('/ja/'))).toBe('ja');
  });

  it('AC-05-1: otherLocalePath flips the locale and keeps the page', () => {
    for (const path of PATHS) {
      const enPath = localePath('en', path);
      const jaPath = localePath('ja', path);
      expect(otherLocalePath(enPath)).toBe(jaPath);
      expect(otherLocalePath(jaPath)).toBe(enPath);
    }
    expect(otherLocale('en')).toBe('ja');
    expect(otherLocale('ja')).toBe('en');
  });

  it('AC-04-3: a category link lands on the list with the facet preselected', () => {
    expect(categoryPath('en', 'oss')).toBe(`${withBase('/entries')}?category=oss`);
    expect(categoryPath('ja', 'oss')).toBe(`${withBase('/ja/entries')}?category=oss`);
  });
});
