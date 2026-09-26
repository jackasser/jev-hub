import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import raw from '../../src/data/entries.json';
import { entrySchema, type Entry } from '../../src/lib/schema';
import { CATEGORIES } from '../../src/lib/taxonomy';
import { BASE, BASE_ROOT, stripBase } from '../../src/lib/base';

// URL.pathname keeps non-ASCII segments percent-encoded; fileURLToPath does not.
const ROOT = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const DIST = resolve(ROOT, 'dist');

const entries: Entry[] = (raw as unknown[]).map((row) => entrySchema.parse(row));

function read(relative: string): string {
  const path = resolve(DIST, relative);
  if (!existsSync(path)) throw new Error(`missing build output: ${relative} — run \`npm run build\` first`);
  return readFileSync(path, 'utf8');
}

function page(relative: string): string {
  if (relative === '') return read('index.html');
  return read(relative.endsWith('.html') ? relative : `${relative}/index.html`);
}

/** Every HTML page the build is expected to produce, as a dist-relative directory. */
const PAGES: string[] = [
  '',
  'entries',
  'what-is-jev',
  'about',
  'ja',
  'ja/entries',
  'ja/what-is-jev',
  'ja/about',
  ...CATEGORIES.map((c) => `category/${c}`),
  ...CATEGORIES.map((c) => `ja/category/${c}`),
  ...entries.map((e) => `entries/${e.id}`),
  ...entries.map((e) => `ja/entries/${e.id}`),
];

beforeAll(() => {
  if (!existsSync(DIST)) throw new Error('dist/ is missing — run `npm run build` first');
});

describe('build output', () => {
  it('AC-04-1: every entry has a detail page in both locales', () => {
    for (const entry of entries) {
      expect(() => page(`entries/${entry.id}`), entry.id).not.toThrow();
      expect(() => page(`ja/entries/${entry.id}`), entry.id).not.toThrow();
    }
  });

  it('AC-04-1: a detail page shows the description for its own locale', () => {
    const entry = entries[0]!;
    expect(page(`entries/${entry.id}`)).toContain(entry.description_en.slice(0, 40));
    expect(page(`ja/entries/${entry.id}`)).toContain(entry.description_ja.slice(0, 20));
  });

  it('AC-04-2: every page carries a non-empty title and meta description', () => {
    for (const relative of PAGES) {
      const html = page(relative);
      const title = /<title>([^<]*)<\/title>/.exec(html)?.[1] ?? '';
      const description = /<meta name="description" content="([^"]*)"/.exec(html)?.[1] ?? '';
      expect(title.trim(), `${relative || '/'} title`).not.toBe('');
      expect(description.trim().length, `${relative || '/'} description`).toBeGreaterThan(20);
    }
  });

  it('AC-04-4: a 404 page is built for both locales and asks not to be indexed', () => {
    // Astro emits the root 404 as a file so a host can serve it; the localised one is a page.
    for (const relative of ['404.html', 'ja/404']) {
      const html = page(relative);
      expect(html).toContain('<meta name="robots" content="noindex"');
    }
  });

  it('AC-05-3: every page has one canonical link and three hreflang alternates', () => {
    for (const relative of PAGES) {
      const html = page(relative);
      expect(html.match(/<link rel="canonical"/g)?.length, `${relative || '/'} canonical`).toBe(1);
      const langs = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)"/g)].map((m) => m[1]);
      expect(langs, `${relative || '/'} hreflang`).toEqual(['en', 'ja', 'x-default']);
    }
  });

  it('AC-05-3: the English and Japanese versions of a page point at each other', () => {
    const entry = entries[0]!;
    const en = page(`entries/${entry.id}`);
    const ja = page(`ja/entries/${entry.id}`);
    const hrefs = (html: string) =>
      [...html.matchAll(/<link rel="alternate" hreflang="[^"]+" href="([^"]+)"/g)].map((m) => m[1]);
    expect(hrefs(en)).toEqual(hrefs(ja));
    expect(hrefs(en)[1]).toContain(`/ja/entries/${entry.id}`);
  });

  it('AC-05-4: html lang matches the locale of the page', () => {
    for (const relative of PAGES) {
      const html = page(relative);
      const lang = /<html lang="([^"]+)"/.exec(html)?.[1];
      const expected = relative === 'ja' || relative.startsWith('ja/') ? 'ja' : 'en';
      expect(lang, `${relative || '/'} lang`).toBe(expected);
    }
  });

  it('AC-06-3: the list page server-renders every entry, so it works without JavaScript', () => {
    for (const relative of ['entries', 'ja/entries']) {
      const html = page(relative);
      for (const entry of entries) {
        expect(html, `${relative} is missing ${entry.id}`).toContain(`data-entry="${entry.id}"`);
      }
      expect(html.match(/class="card"/g)?.length, relative).toBe(entries.length);
    }
  });

  it('AC-06-4: search-index.json is built and matches the data', () => {
    const index = JSON.parse(read('search-index.json')) as { id: string }[];
    expect(index).toHaveLength(entries.length);
    expect(new Set(index.map((i) => i.id))).toEqual(new Set(entries.map((e) => e.id)));
  });

  it('AC-06-4: the inline search index is escaped and parses back to the same entries', () => {
    for (const relative of ['entries', 'ja/entries']) {
      const html = page(relative);
      const marker = '<script type="application/json" data-search-index>';
      const start = html.indexOf(marker);
      expect(start, relative).toBeGreaterThan(-1);
      const inline = html.slice(start + marker.length, html.indexOf('</script>', start));
      expect(inline.length, relative).toBeGreaterThan(0);
      expect(inline, relative).not.toContain('<');
      expect((JSON.parse(inline) as unknown[]).length, relative).toBe(entries.length);
    }
  });

  it('AC-07-3: the sitemap index and robots.txt are generated and reference each other', () => {
    const robots = read('robots.txt');
    expect(robots).toContain('User-agent: *');
    expect(robots).toMatch(/Sitemap: https?:\/\/[^\s]+\/sitemap-index\.xml/);
    expect(read('sitemap-index.xml')).toContain('<sitemapindex');
  });

  it('AC-07-4: both feeds are built, newest first', () => {
    for (const relative of ['rss.xml', 'ja/rss.xml']) {
      const xml = read(relative);
      expect(xml).toContain('<rss');
      const dates = [...xml.matchAll(/<pubDate>([^<]+)<\/pubDate>/g)].map((m) => Date.parse(m[1]!));
      expect(dates.length, relative).toBe(entries.length);
      for (let i = 1; i < dates.length; i += 1) {
        expect(dates[i - 1]! >= dates[i]!, `${relative} is out of order at ${i}`).toBe(true);
      }
    }
  });

  it('AC-07-4: an entry detail page carries JSON-LD that parses', () => {
    const entry = entries[0]!;
    const html = page(`entries/${entry.id}`);
    const ld = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(html)?.[1];
    expect(ld).toBeTruthy();
    const parsed = JSON.parse(ld!) as { name: string; url: string };
    expect(parsed.name).toBe(entry.name);
    expect(parsed.url).toBe(entry.url);
  });

  it('AC-03-3: the vendor-claim notice is on the home and explainer pages, in both locales', () => {
    for (const relative of ['', 'what-is-jev', 'about', 'ja', 'ja/what-is-jev', 'ja/about']) {
      expect(page(relative), `${relative || '/'} is missing the claims notice`).toContain(
        'data-claims-notice',
      );
    }
  });

  it('AC-08-1: every link that opens a new tab is also given rel=noopener', () => {
    for (const relative of PAGES) {
      const html = page(relative);
      for (const [tag] of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) {
        expect(tag, `${relative || '/'}: ${tag}`).toMatch(/rel="[^"]*noopener[^"]*"/);
        expect(tag, `${relative || '/'}: ${tag}`).toMatch(/rel="[^"]*noreferrer[^"]*"/);
      }
    }
  });

  it('AC-08-2: no page emits a javascript: or data: href', () => {
    for (const relative of PAGES) {
      const html = page(relative);
      expect(html, relative || '/').not.toMatch(/href="\s*javascript:/i);
      expect(html, relative || '/').not.toMatch(/href="\s*data:/i);
    }
  });

  it('every internal link on the list pages resolves to a built file', () => {
    for (const relative of ['entries', 'ja/entries']) {
      const html = page(relative);
      const hrefs = new Set(
        [...html.matchAll(/href="(\/[^"#?]*)"/g)].map((m) => m[1]!).filter((h) => !h.endsWith('.xml')),
      );
      for (const href of hrefs) {
        // Links carry the deployment base; dist/ does not (R-12).
        const bare = stripBase(href);
        const target = bare === '/' ? 'index.html' : `${bare.replace(/^\//, '').replace(/\/$/, '')}`;
        const asFile = resolve(DIST, target);
        const asDir = resolve(DIST, target, 'index.html');
        expect(existsSync(asFile) || existsSync(asDir), `${relative}: dead link ${href}`).toBe(true);
        expect(href.startsWith(BASE_ROOT), `${relative}: ${href} is missing the base`).toBe(true);
      }
    }
  });
});

describe('covers (R-11)', () => {
  it('AC-11-6: every entry has a generated cover written to disk', () => {
    for (const entry of entries) {
      const svg = read(`covers/${entry.id}.svg`);
      expect(svg.startsWith('<svg'), entry.id).toBe(true);
      expect(svg, entry.id).toContain('viewBox="0 0 1200 600"');
      expect(svg, entry.id).toContain('decorative cover');
    }
  });

  it('AC-11-6: every card on the list pages carries a cover, and none of them is inline SVG', () => {
    for (const relative of ['entries', 'ja/entries']) {
      const html = page(relative);
      expect(html.match(/class="card__cover"/g)?.length, relative).toBe(entries.length);
      expect(html, relative).not.toContain('<svg');
    }
  });

  it('AC-11-6: About says where the cover pictures come from', () => {
    expect(page('about')).toContain('not a model output');
    expect(page('ja/about')).toContain('モデルの出力ではなく飾り');
  });

  it('AC-11-6: a detail page carries an eagerly loaded cover', () => {
    const html = page(`entries/${entries[0]!.id}`);
    expect(html).toContain('detail__cover');
    expect(html).toContain('loading="eager"');
  });
});
