import { describe, expect, it } from 'vitest';
import { applyStars, parseRepo } from '../../scripts/refresh-stars.mjs';

const TODAY = '2026-09-27';

describe('refresh-stars', () => {
  it('AC-10-1: reads owner/repo out of a GitHub URL', () => {
    expect(parseRepo('https://github.com/razorback16/openjev')).toBe('razorback16/openjev');
    expect(parseRepo('https://github.com/githubnext/localjev/')).toBe('githubnext/localjev');
    expect(parseRepo('https://www.github.com/o/r.git')).toBe('o/r');
    expect(parseRepo('https://github.com/o/r/tree/main/docs')).toBe('o/r');
    expect(parseRepo('https://github.com/o/r?tab=readme')).toBe('o/r');
  });

  it('AC-10-1: ignores anything that is not a GitHub repository', () => {
    expect(parseRepo('https://docs.typesafe.ai/api')).toBeNull();
    expect(parseRepo('https://github.com/onlyowner')).toBeNull();
    expect(parseRepo(undefined)).toBeNull();
    expect(parseRepo('')).toBeNull();
  });

  it('AC-10-2: writes the count and the date for a repo that was fetched', () => {
    const entries = [{ id: 'a', repoUrl: 'https://github.com/o/r', stars: 1, starsUpdatedAt: '2026-09-01' }];
    const { entries: out, updated } = applyStars(entries, new Map([['o/r', 42]]), TODAY);
    expect(updated).toBe(1);
    expect(out[0]).toMatchObject({ stars: 42, starsUpdatedAt: TODAY });
  });

  it('AC-10-2: an entry whose lookup failed keeps the value it had', () => {
    const entries = [
      { id: 'a', repoUrl: 'https://github.com/o/ok', stars: 1, starsUpdatedAt: '2026-09-01' },
      { id: 'b', repoUrl: 'https://github.com/o/failed', stars: 7, starsUpdatedAt: '2026-09-01' },
    ];
    const { entries: out, updated } = applyStars(entries, new Map([['o/ok', 9]]), TODAY);
    expect(updated).toBe(1);
    expect(out[1]).toEqual(entries[1]);
  });

  it('AC-10-2: an empty result set changes nothing at all', () => {
    const entries = [{ id: 'a', repoUrl: 'https://github.com/o/r', stars: 5, starsUpdatedAt: '2026-09-01' }];
    const { entries: out, updated } = applyStars(entries, new Map(), TODAY);
    expect(updated).toBe(0);
    expect(out).toEqual(entries);
  });

  it('AC-10-2: a nonsense count is refused rather than written', () => {
    const entries = [{ id: 'a', repoUrl: 'https://github.com/o/r', stars: 5, starsUpdatedAt: '2026-09-01' }];
    for (const bad of [-1, Number.NaN, 'many', null]) {
      const { entries: out, updated } = applyStars(entries, new Map([['o/r', bad]]), TODAY);
      expect(updated, String(bad)).toBe(0);
      expect(out[0]!.stars).toBe(5);
    }
  });

  it('leaves entries without a repository untouched', () => {
    const entries = [{ id: 'docs', url: 'https://docs.typesafe.ai/' }];
    const { entries: out, updated } = applyStars(entries, new Map([['o/r', 3]]), TODAY);
    expect(updated).toBe(0);
    expect(out[0]).toEqual(entries[0]);
  });
});
