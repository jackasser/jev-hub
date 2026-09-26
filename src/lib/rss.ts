import rss from '@astrojs/rss';
import { loadEntries } from './load';
import { t, localePath, type Locale } from '../i18n';

/** R-07: one feed per locale, newest `addedAt` first, then id for stability. */
export async function feed(locale: Locale, site: URL | undefined) {
  const entries = [...(await loadEntries())].sort((a, b) =>
    a.addedAt === b.addedAt ? a.id.localeCompare(b.id) : a.addedAt < b.addedAt ? 1 : -1,
  );
  return rss({
    title: t(locale, 'site.name'),
    description: t(locale, 'site.description'),
    // R-12: the feed points at the deployed site root, not the bare origin.
    site: new URL(localePath(locale, '/'), site ?? 'https://example.com').toString(),
    items: entries.map((entry) => ({
      title: entry.name,
      description: locale === 'ja' ? entry.description_ja : entry.description_en,
      link: localePath(locale, `/entries/${entry.id}`),
      pubDate: new Date(`${entry.addedAt}T00:00:00Z`),
    })),
  });
}
