import { describe, expect, it } from 'vitest';
import { CATEGORIES, CATEGORY_META, isCategory } from '../../src/lib/taxonomy';

describe('taxonomy', () => {
  it('AC-02-1: every category has a label and a blurb in both locales', () => {
    for (const category of CATEGORIES) {
      const meta = CATEGORY_META[category];
      for (const locale of ['en', 'ja'] as const) {
        expect(meta.label[locale].trim(), `${category}.label.${locale}`).not.toBe('');
        expect(meta.blurb[locale].trim(), `${category}.blurb.${locale}`).not.toBe('');
      }
      expect(meta.jsonLdType, `${category}.jsonLdType`).toBeTruthy();
    }
  });

  it('AC-02-1: CATEGORY_META has no key outside the category list', () => {
    expect(Object.keys(CATEGORY_META).sort()).toEqual([...CATEGORIES].sort());
  });

  it('category slugs are unique lowercase tokens', () => {
    expect(new Set(CATEGORIES).size).toBe(CATEGORIES.length);
    for (const category of CATEGORIES) expect(category).toMatch(/^[a-z][a-z-]*$/);
  });

  it('isCategory accepts defined slugs and rejects anything else', () => {
    for (const category of CATEGORIES) expect(isCategory(category)).toBe(true);
    expect(isCategory('connectome')).toBe(false);
    expect(isCategory('')).toBe(false);
  });
});
