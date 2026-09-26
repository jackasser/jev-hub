import { describe, expect, it } from 'vitest';
import { DEFAULT_SORT, SORT_MODES, isSortMode, sortRows, type SortRow } from '../../src/lib/sort';

const rows: SortRow[] = [
  { id: 'a', stars: 10, addedAt: '2026-09-20' },
  { id: 'b', stars: undefined, addedAt: '2026-09-26' },
  { id: 'c', stars: 0, addedAt: '2026-09-12' },
  { id: 'd', stars: 400, addedAt: '2026-09-20' },
];

const ids = (list: SortRow[]) => list.map((r) => r.id);

describe('sortRows', () => {
  it('AC-06-1: the featured mode keeps the order the server rendered', () => {
    const out = sortRows(rows, 'featured');
    expect(ids(out)).toEqual(['a', 'b', 'c', 'd']);
    expect(out).not.toBe(rows);
  });

  it('AC-06-1: stars sort descending, and an unknown count ranks below a real zero', () => {
    expect(ids(sortRows(rows, 'stars'))).toEqual(['d', 'a', 'c', 'b']);
  });

  it('AC-06-1: newest sorts by addedAt descending', () => {
    expect(ids(sortRows(rows, 'newest'))).toEqual(['b', 'a', 'd', 'c']);
  });

  it('AC-06-1: ties keep their original relative order', () => {
    // `a` and `d` share a date; `a` came first in the input and stays first.
    const sameDate = rows.filter((r) => r.addedAt === '2026-09-20');
    expect(ids(sortRows(sameDate, 'newest'))).toEqual(['a', 'd']);
  });

  it('AC-06-1: sorting never mutates the input', () => {
    const before = ids(rows);
    for (const mode of SORT_MODES) sortRows(rows, mode);
    expect(ids(rows)).toEqual(before);
  });

  it('isSortMode guards the query-string value', () => {
    for (const mode of SORT_MODES) expect(isSortMode(mode)).toBe(true);
    expect(isSortMode('stars; drop')).toBe(false);
    expect(isSortMode('')).toBe(false);
    expect(SORT_MODES).toContain(DEFAULT_SORT);
  });
});
