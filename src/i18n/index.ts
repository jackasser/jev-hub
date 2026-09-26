import { en, type MessageKey } from './en';
import { ja } from './ja';
import { stripBase, withBase } from '../lib/base';
import type { Category, Locale } from '../lib/taxonomy';

export type { Locale, MessageKey };

export const LOCALES: readonly Locale[] = ['en', 'ja'];
export const DEFAULT_LOCALE: Locale = 'en';

const messages: Record<Locale, Record<MessageKey, string>> = { en, ja };

export function t(locale: Locale, key: MessageKey): string {
  return messages[locale][key] ?? en[key];
}

/**
 * Drop the deployment base and any locale prefix, giving the locale-agnostic path
 * (always starts with "/"). R-12: the inverse of `localePath`.
 */
export function stripLocale(path: string): string {
  const bare = withoutTrailingSlash(stripBase(path));
  if (bare === '/ja' || bare.startsWith('/ja/')) {
    const rest = bare.slice(3);
    return rest === '' ? '/' : rest;
  }
  return bare === '' ? '/' : bare;
}

export function localeFromPath(path: string): Locale {
  const bare = withoutTrailingSlash(stripBase(path));
  return bare === '/ja' || bare.startsWith('/ja/') ? 'ja' : 'en';
}

/**
 * Build the browser path for `locale` from a locale-agnostic path. R-12: together with
 * `generatedCoverPath()` this is the only place the deployment base gets applied, so no
 * component has to know the site is served from a sub-path.
 */
export function localePath(locale: Locale, path: string): string {
  const bare = stripLocale(path);
  const localised = locale === 'en' ? bare : bare === '/' ? '/ja/' : `/ja${bare}`;
  return withBase(withTrailingSlash(localised));
}

/** "/entries/" -> "/entries"; the root and file paths are left alone. */
function withoutTrailingSlash(path: string): string {
  if (path === '') return '/';
  if (path === '/' || !path.endsWith('/')) return path;
  return path.replace(/\/+$/, '') || '/';
}

/**
 * GitHub Pages serves a directory only at its slashed URL and 301s the bare one, so every
 * page link carries the slash (R-12). A path with an extension is a file, not a directory.
 */
function withTrailingSlash(path: string): string {
  if (path.endsWith('/')) return path;
  const last = path.split('/').pop() ?? '';
  return last.includes('.') ? path : `${path}/`;
}

/**
 * Where a category click lands: the full list with the category facet pre-selected,
 * so search and sort stay available. The per-category page exists for the sitemap.
 */
export function categoryPath(locale: Locale, category: Category): string {
  return `${localePath(locale, '/entries')}?category=${category}`;
}

/** Same page in the other locale. */
export function otherLocalePath(path: string): string {
  const current = localeFromPath(path);
  return localePath(current === 'en' ? 'ja' : 'en', path);
}

export function otherLocale(locale: Locale): Locale {
  return locale === 'en' ? 'ja' : 'en';
}

export function pick<T>(locale: Locale, values: Record<Locale, T>): T {
  return values[locale];
}
