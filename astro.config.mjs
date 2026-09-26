// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { SITE, BASE, BASE_ROOT } from './site.config.mjs';

// R-12: the deployment target lives in site.config.mjs, which the app and the tests read too.
export default defineConfig({
  site: SITE,
  base: BASE || '/',
  output: 'static',
  trailingSlash: 'ignore',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ja'],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'en', locales: { en: 'en', ja: 'ja' } },
      // Match canonical URLs, which carry no trailing slash except at the deployed root.
      serialize(item) {
        const u = new URL(item.url);
        const root = u.pathname === '/' || u.pathname === BASE_ROOT;
        if (!root && u.pathname.endsWith('/')) item.url = item.url.replace(/\/+$/, '');
        return item;
      },
    }),
  ],
});
