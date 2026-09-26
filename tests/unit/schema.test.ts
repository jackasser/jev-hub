import { describe, expect, it } from 'vitest';
import { entrySchema, type EntryInput } from '../../src/lib/schema';

/** A minimal entry that satisfies every required field (R-01). */
function valid(overrides: Partial<EntryInput> = {}): Record<string, unknown> {
  return {
    id: 'example-entry',
    name: 'Example',
    url: 'https://example.com/',
    category: 'docs',
    org: 'Example Org',
    date: '2026-09',
    addedAt: '2026-09-26',
    description_en:
      'A description long enough to clear the sixty character minimum that the schema asks for.',
    description_ja: 'スキーマが求める四十文字の下限をきちんと超える長さの、日本語の説明文をここに置いている。',
    sourceRefs: ['https://example.com/'],
    ...overrides,
  };
}

describe('entrySchema', () => {
  it('AC-01-1: accepts a well-formed entry and fills the defaults', () => {
    const parsed = entrySchema.parse(valid());
    expect(parsed.tags).toEqual([]);
    expect(parsed.status).toBe('active');
    expect(parsed.official).toBe(false);
    expect(parsed.featured).toBe(false);
  });

  it('AC-01-2: rejects a url that is not http(s)', () => {
    for (const url of ['javascript:alert(1)', 'data:text/html,<b>x</b>', 'ftp://example.com/x']) {
      expect(entrySchema.safeParse(valid({ url })).success, url).toBe(false);
    }
  });

  it('AC-01-2: rejects a non-http(s) source reference', () => {
    expect(entrySchema.safeParse(valid({ sourceRefs: ['javascript:alert(1)'] })).success).toBe(false);
  });

  it('AC-01-3: rejects an unknown key', () => {
    expect(entrySchema.safeParse({ ...valid(), sponsored: true }).success).toBe(false);
  });

  it('AC-01-4: rejects an empty sourceRefs list', () => {
    expect(entrySchema.safeParse(valid({ sourceRefs: [] })).success).toBe(false);
  });

  it('AC-01-5: rejects stars without a repoUrl, and accepts them together', () => {
    expect(entrySchema.safeParse(valid({ stars: 10 })).success).toBe(false);
    expect(
      entrySchema.safeParse(valid({ stars: 10, repoUrl: 'https://github.com/o/r' })).success,
    ).toBe(true);
  });

  it('rejects an id that is not a lowercase slug', () => {
    for (const id of ['Example', 'has space', 'under_score']) {
      expect(entrySchema.safeParse(valid({ id })).success, id).toBe(false);
    }
  });

  it('rejects a malformed date or addedAt', () => {
    expect(entrySchema.safeParse(valid({ date: '26-09' })).success).toBe(false);
    expect(entrySchema.safeParse(valid({ addedAt: '2026-09' })).success).toBe(false);
  });

  it('rejects descriptions outside the length bounds', () => {
    expect(entrySchema.safeParse(valid({ description_en: 'too short' })).success).toBe(false);
    expect(entrySchema.safeParse(valid({ description_ja: '短い' })).success).toBe(false);
    expect(entrySchema.safeParse(valid({ description_en: 'a'.repeat(601) })).success).toBe(false);
  });
});
