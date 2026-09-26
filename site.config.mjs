/**
 * R-12. Where this site is deployed, in one place.
 *
 * `astro.config.mjs`, the app, the tests and the Playwright config all read these, so the
 * deployment target can move without hunting for hard-coded paths. Both are overridable by
 * environment variable, which is how a preview deployment points somewhere else.
 */

/** Leading slash, no trailing slash. Empty string when the site is served from the origin root. */
function normaliseBase(value) {
  const trimmed = String(value).trim().replace(/\/+$/, '');
  if (trimmed === '' || trimmed === '/') return '';
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

/** Canonical origin, without a trailing slash. */
export const SITE = (process.env.PUBLIC_SITE_URL || 'https://jackasser.github.io').replace(/\/+$/, '');

/** GitHub Pages serves a project repository under `/<repo>/`. */
export const BASE = normaliseBase(process.env.PUBLIC_BASE_PATH ?? '/jev-hub');

/** The site root as a browser path: `/` at the origin root, `/jev-hub/` under a base. */
export const BASE_ROOT = `${BASE}/`;
