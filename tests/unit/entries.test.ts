import { describe, expect, it } from 'vitest';
import raw from '../../src/data/entries.json';
import { entrySchema, type Entry } from '../../src/lib/schema';
import {
  allTags,
  byCategory,
  countByCategory,
  featured,
  latest,
  sortEntries,
  toSearchIndex,
} from '../../src/lib/entries';
import { CATEGORIES } from '../../src/lib/taxonomy';

const entries: Entry[] = (raw as unknown[]).map((row) => entrySchema.parse(row));

describe('entries', () => {
  it('sortEntries puts featured first, then the newest addedAt', () => {
    const sorted = sortEntries(entries);
    const firstUnfeatured = sorted.findIndex((e) => !e.featured);
    expect(firstUnfeatured).toBeGreaterThan(0);
    expect(sorted.slice(0, firstUnfeatured).every((e) => e.featured)).toBe(true);
    expect(sorted.slice(firstUnfeatured).some((e) => e.featured)).toBe(false);
  });

  it('sortEntries is stable and does not mutate its input', () => {
    const before = entries.map((e) => e.id);
    sortEntries(entries);
    expect(entries.map((e) => e.id)).toEqual(before);
    expect(sortEntries(entries).map((e) => e.id)).toEqual(sortEntries(entries).map((e) => e.id));
  });

  it('latest returns the requested number, newest publication first', () => {
    const recent = latest(entries, 6);
    expect(recent).toHaveLength(6);
    for (let i = 1; i < recent.length; i += 1) {
      expect(recent[i - 1]!.date >= recent[i]!.date).toBe(true);
    }
  });

  it('featured and byCategory select the right subsets', () => {
    expect(featured(entries).every((e) => e.featured)).toBe(true);
    for (const category of CATEGORIES) {
      expect(byCategory(entries, category).every((e) => e.category === category)).toBe(true);
    }
  });

  it('countByCategory covers every category and totals the data set', () => {
    const counts = countByCategory(entries);
    expect(Object.keys(counts).sort()).toEqual([...CATEGORIES].sort());
    expect(Object.values(counts).reduce((a, b) => a + b, 0)).toBe(entries.length);
  });

  it('allTags counts each tag and sorts by frequency', () => {
    const tags = allTags(entries);
    expect(tags.length).toBeGreaterThan(0);
    for (let i = 1; i < tags.length; i += 1) expect(tags[i - 1]![1] >= tags[i]![1]).toBe(true);
  });

  it('AC-06-2: toSearchIndex keeps every entry and the fields search needs', () => {
    const index = toSearchIndex(entries);
    expect(index).toHaveLength(entries.length);
    expect(new Set(index.map((i) => i.id)).size).toBe(entries.length);
    for (const item of index) {
      expect(item.name).toBeTruthy();
      expect(item.org).toBeTruthy();
      expect(item.description_en).toBeTruthy();
      expect(item.description_ja).toBeTruthy();
      expect(Array.isArray(item.tags)).toBe(true);
      expect(item.stars === null || typeof item.stars === 'number').toBe(true);
    }
  });

  it('AC-06-2: the index carries no field the client does not need', () => {
    const [first] = toSearchIndex(entries);
    expect(Object.keys(first!).sort()).toEqual(
      ['category', 'description_en', 'description_ja', 'id', 'name', 'official', 'org', 'stars', 'tags', 'url'].sort(),
    );
  });
});
