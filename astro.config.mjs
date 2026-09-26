// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { SITE, BASE } from './site.config.mjs';

// R-12: the deployment target lives in site.config.mjs, which the app and the tests read too.
export default defineConfig({
  site: SITE,
  base: BASE || '/',
  output: 'static',
  // GitHub Pages redirects a bare directory URL to its slashed form, so emit that form.
  trailingSlash: 'always',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ja'],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    // The sitemap follows `trailingSlash`, which now matches what the host serves.
    sitemap({
      i18n: { defaultLocale: 'en', locales: { en: 'en', ja: 'ja' } },
    }),
  ],
});
