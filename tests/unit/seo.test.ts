import { describe, expect, it } from 'vitest';
import raw from '../../src/data/entries.json';
import { entrySchema, type Entry } from '../../src/lib/schema';
import { alternates, canonical, jsonLd, serializeJsonLd } from '../../src/lib/seo';
import { CATEGORY_META } from '../../src/lib/taxonomy';
import { BASE, BASE_ROOT } from '../../src/lib/base';
import { localePath } from '../../src/i18n';

const entries: Entry[] = (raw as unknown[]).map((row) => entrySchema.parse(row));
const SITE = 'https://example.com';

describe('seo', () => {
  it('AC-07-1: the JSON-LD type follows the category', () => {
    for (const entry of entries) {
      const ld = jsonLd(entry, 'en');
      expect(ld['@type'], entry.id).toBe(CATEGORY_META[entry.category].jsonLdType);
      expect(ld['@context']).toBe('https://schema.org');
      expect(ld.name).toBe(entry.name);
      expect(ld.url).toBe(entry.url);
      expect(ld.description).toBe(entry.description_en);
    }
  });

  it('AC-07-1: the Japanese page describes the entry in Japanese', () => {
    const entry = entries[0]!;
    expect(jsonLd(entry, 'ja').description).toBe(entry.description_ja);
  });

  it('AC-07-1: optional fields appear only when the entry has them', () => {
    const withRepo = entries.find((e) => e.repoUrl)!;
    const withoutRepo = entries.find((e) => !e.repoUrl)!;
    expect(jsonLd(withRepo, 'en').codeRepository).toBe(withRepo.repoUrl);
    expect(jsonLd(withoutRepo, 'en').codeRepository).toBeUndefined();
  });

  it('AC-07-2: serializeJsonLd escapes "<" so data cannot close the script tag', () => {
    const out = serializeJsonLd({ name: '</script><img src=x onerror=alert(1)>' });
    expect(out).not.toContain('<');
    expect(out).toContain('\\u003c');
    expect(JSON.parse(out).name).toBe('</script><img src=x onerror=alert(1)>');
  });

  it('every entry serialises to JSON-LD without a raw "<"', () => {
    for (const entry of entries) {
      expect(serializeJsonLd(jsonLd(entry, 'ja')), entry.id).not.toContain('<');
    }
  });

  it('alternates returns en, ja and x-default as absolute URLs', () => {
    const links = alternates(SITE, '/entries/jev');
    expect(links.map((l) => l.hreflang)).toEqual(['en', 'ja', 'x-default']);
    expect(links[0]!.href).toBe(`${SITE}${BASE}/entries/jev`);
    expect(links[1]!.href).toBe(`${SITE}${BASE}/ja/entries/jev`);
    expect(links[2]!.href).toBe(links[0]!.href);
  });

  it('AC-12-5: every alternate is absolute and sits under the deployment base', () => {
    for (const path of ['/', '/entries', '/entries/jev', '/about']) {
      for (const link of alternates(SITE, path)) {
        expect(link.href.startsWith(`${SITE}${BASE_ROOT}`), `${path} ${link.hreflang}`).toBe(true);
      }
    }
  });

  it('AC-12-5: the deployed site root keeps its trailing slash, deeper pages do not', () => {
    expect(canonical(SITE, localePath('en', '/'))).toBe(`${SITE}${BASE_ROOT}`);
    expect(canonical(SITE, localePath('en', '/entries'))).toBe(`${SITE}${BASE}/entries`);
    expect(canonical(SITE, localePath('ja', '/'))).toBe(`${SITE}${BASE}/ja`);
  });

  it('canonical drops a trailing slash except at the site root', () => {
    expect(canonical(SITE, '/')).toBe('https://example.com/');
    expect(canonical(SITE, '/entries/')).toBe('https://example.com/entries');
    expect(canonical(SITE, '/ja/')).toBe('https://example.com/ja');
  });
});
