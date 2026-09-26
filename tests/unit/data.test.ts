import { describe, expect, it } from 'vitest';
import raw from '../../src/data/entries.json';
import { entrySchema, type Entry } from '../../src/lib/schema';
import { CATEGORIES, isCategory } from '../../src/lib/taxonomy';
import { countByCategory } from '../../src/lib/entries';

const rows = raw as unknown[];
const parsed: Entry[] = rows.map((row, i) => {
  const result = entrySchema.safeParse(row);
  if (!result.success) {
    throw new Error(`entry ${i} failed the schema: ${JSON.stringify(result.error.issues, null, 2)}`);
  }
  return result.data;
});

/** `2026-09` compares as `2026-09-99` so a month-precision date is never "after" a day in it. */
function upperBound(date: string): string {
  if (date.length === 4) return `${date}-99-99`;
  if (date.length === 7) return `${date}-99`;
  return date;
}

describe('src/data/entries.json', () => {
  it('AC-01-6: every entry passes the schema', () => {
    expect(parsed.length).toBe(rows.length);
    expect(parsed.length).toBeGreaterThanOrEqual(15);
  });

  it('AC-01-6: ids are unique', () => {
    const ids = parsed.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('AC-01-7: no entry is dated after the day it was listed', () => {
    for (const entry of parsed) {
      expect(entry.date <= upperBound(entry.addedAt), `${entry.id}: ${entry.date} > ${entry.addedAt}`).toBe(
        true,
      );
    }
  });

  it('AC-01-7: nothing is dated in the future relative to the newest addedAt', () => {
    const newest = parsed.reduce((max, e) => (e.addedAt > max ? e.addedAt : max), '0000-00-00');
    for (const entry of parsed) {
      expect(entry.date.slice(0, 4) <= newest.slice(0, 4), `${entry.id}`).toBe(true);
    }
  });

  it('AC-02-2: every category is a defined slug', () => {
    for (const entry of parsed) {
      expect(isCategory(entry.category), `${entry.id}: ${entry.category}`).toBe(true);
    }
  });

  it('AC-02-3: every category has at least one entry', () => {
    const counts = countByCategory(parsed);
    for (const category of CATEGORIES) {
      expect(counts[category], `${category} is empty`).toBeGreaterThan(0);
    }
  });

  it('every entry keeps at least one source it was checked against', () => {
    for (const entry of parsed) {
      expect(entry.sourceRefs.length, entry.id).toBeGreaterThan(0);
      for (const ref of entry.sourceRefs) expect(ref).toMatch(/^https?:\/\//);
    }
  });

  it('a starred entry also records when the count was taken', () => {
    for (const entry of parsed) {
      if (entry.stars !== undefined) expect(entry.starsUpdatedAt, entry.id).toBeTruthy();
    }
  });

  it('only TypeSafe AI entries are marked official', () => {
    for (const entry of parsed) {
      if (entry.official) expect(entry.org, entry.id).toBe('TypeSafe AI');
    }
  });
});
