import { BASE, BASE_ROOT } from '../../site.config.mjs';

export { BASE, BASE_ROOT };

/**
 * R-12. Turn a site-root-relative path into one a browser can follow under the deployed base.
 * Only `localePath()` and `generatedCoverPath()` call this, so nothing else has to know.
 */
export function withBase(path: string): string {
  if (!BASE) return path === '' ? '/' : path;
  if (path === '' || path === '/') return BASE_ROOT;
  return path.startsWith('/') ? `${BASE}${path}` : `${BASE}/${path}`;
}

/** The inverse: drop the deployed base from a pathname, giving a site-root-relative path. */
export function stripBase(pathname: string): string {
  if (!pathname) return '/';
  if (!BASE) return pathname;
  if (pathname === BASE) return '/';
  if (pathname.startsWith(BASE_ROOT)) return pathname.slice(BASE.length) || '/';
  return pathname;
}

/** True when `pathname` is the deployed site root, which keeps its trailing slash. */
export function isSiteRoot(pathname: string): boolean {
  return pathname === '/' || pathname === BASE_ROOT;
}
