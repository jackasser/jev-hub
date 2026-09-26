import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import ClaimsNotice from '../../src/components/ClaimsNotice.astro';
import EntryCard from '../../src/components/EntryCard.astro';
import EntryGrid from '../../src/components/EntryGrid.astro';
import Badge from '../../src/components/Badge.astro';
import raw from '../../src/data/entries.json';
import { entrySchema, type Entry } from '../../src/lib/schema';
import { t } from '../../src/i18n';

const entries: Entry[] = (raw as unknown[]).map((row) => entrySchema.parse(row));
const container = await AstroContainer.create();

// URL.pathname keeps non-ASCII segments percent-encoded, which breaks on a Japanese path.
const css = readFileSync(fileURLToPath(new URL('../../src/styles/global.css', import.meta.url)), 'utf8');

describe('ClaimsNotice', () => {
  it('AC-03-2: renders the vendor-claim notice in English', async () => {
    const html = await container.renderToString(ClaimsNotice, { props: { locale: 'en' } });
    expect(html).toContain('data-claims-notice');
    expect(html).toContain(t('en', 'claims.title'));
    expect(html).toContain('TypeSafe');
    expect(html).toMatch(/Nothing on this site is an independent benchmark/i);
  });

  it('AC-03-2: renders the vendor-claim notice in Japanese', async () => {
    const html = await container.renderToString(ClaimsNotice, { props: { locale: 'ja' } });
    expect(html).toContain('data-claims-notice');
    expect(html).toContain(t('ja', 'claims.title'));
    expect(html).toContain('独立に測定したものではない');
  });
});

describe('EntryCard', () => {
  const entry = entries.find((e) => e.stars !== undefined)!;

  it('carries the sort keys the client island reads', async () => {
    const html = await container.renderToString(EntryCard, { props: { entry, locale: 'en' } });
    expect(html).toContain(`data-entry="${entry.id}"`);
    expect(html).toContain(`data-category="${entry.category}"`);
    expect(html).toContain(`data-stars="${entry.stars}"`);
    expect(html).toContain(`data-added="${entry.addedAt}"`);
  });

  it('omits data-stars when the entry has no repository', async () => {
    const noStars = entries.find((e) => e.stars === undefined)!;
    const html = await container.renderToString(EntryCard, { props: { entry: noStars, locale: 'en' } });
    expect(html).not.toContain('data-stars');
  });

  it('links to the localised detail page and shows the matching description', async () => {
    const en = await container.renderToString(EntryCard, { props: { entry, locale: 'en' } });
    const ja = await container.renderToString(EntryCard, { props: { entry, locale: 'ja' } });
    expect(en).toContain(`href="/entries/${entry.id}"`);
    expect(ja).toContain(`href="/ja/entries/${entry.id}"`);
    expect(ja).toContain(entry.description_ja.slice(0, 20));
  });

  it('marks an official entry and leaves a third-party one unmarked', async () => {
    const official = entries.find((e) => e.official)!;
    const third = entries.find((e) => !e.official)!;
    expect(await container.renderToString(EntryCard, { props: { entry: official, locale: 'en' } })).toContain(
      t('en', 'card.official'),
    );
    expect(await container.renderToString(EntryCard, { props: { entry: third, locale: 'en' } })).not.toContain(
      `>${t('en', 'card.official')}<`,
    );
  });
});

describe('EntryGrid', () => {
  it('renders one card per entry under the grid id the island queries', async () => {
    const html = await container.renderToString(EntryGrid, {
      props: { entries: entries.slice(0, 5), locale: 'en', gridId: 'entry-grid' },
    });
    expect(html).toContain('data-grid="entry-grid"');
    expect(html.match(/class="card"/g)).toHaveLength(5);
  });
});

describe('Badge', () => {
  it('applies the variant class', async () => {
    const accent = await container.renderToString(Badge, {
      props: { variant: 'accent' },
      slots: { default: 'Official' },
    });
    expect(accent).toContain('badge badge-accent');
    const plain = await container.renderToString(Badge, { slots: { default: 'tag' } });
    expect(plain).toContain('class="badge"');
  });
});

describe('global.css', () => {
  it('AC-09-1: the hidden attribute beats the card display rule', () => {
    expect(css).toMatch(/\[hidden\]\s*\{\s*display:\s*none\s*!important;?\s*\}/);
  });

  it('AC-09-1: cards use flex, which is exactly why that override is needed', () => {
    expect(css).toMatch(/\.card\s*\{[^}]*display:\s*flex/);
  });

  it('AC-09-2: dark mode redefines the colour tokens', () => {
    expect(css).toContain('@media (prefers-color-scheme: dark)');
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
  });
});
