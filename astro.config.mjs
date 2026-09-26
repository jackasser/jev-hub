// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Canonical origin: explicit env first, then a placeholder so builds are reproducible offline.
const site = process.env.PUBLIC_SITE_URL || 'https://example.com';

export default defineConfig({
  site,
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
      // Match canonical URLs, which carry no trailing slash (except the site root).
      serialize(item) {
        const u = new URL(item.url);
        if (u.pathname !== '/' && u.pathname.endsWith('/')) item.url = item.url.replace(/\/+$/, '');
        return item;
      },
    }),
  ],
});
