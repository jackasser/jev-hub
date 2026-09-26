import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { CATEGORY_COLORS } from '../../src/lib/media';
import { CATEGORIES } from '../../src/lib/taxonomy';

const css = readFileSync(fileURLToPath(new URL('../../src/styles/global.css', import.meta.url)), 'utf8');

/** The `:root` block, and the `:root` block inside the dark-mode media query. */
function tokens(mode: 'light' | 'dark'): Record<string, string> {
  const source =
    mode === 'light'
      ? (css.split('@media (prefers-color-scheme: dark)')[0] ?? '')
      : (css.split('@media (prefers-color-scheme: dark)')[1] ?? '');
  const block = /:root\s*\{([^}]*)\}/.exec(source)?.[1] ?? '';
  const out: Record<string, string> = {};
  for (const [, name, value] of block.matchAll(/--([a-z-]+):\s*(#[0-9a-f]{3,8})/gi)) {
    out[name!] = value!;
  }
  return out;
}

function channel(hex: string, index: number): number {
  const full = hex.length === 4 ? hex.replace(/#(.)(.)(.)/, '#$1$1$2$2$3$3') : hex;
  const v = parseInt(full.slice(1 + index * 2, 3 + index * 2), 16) / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  return 0.2126 * channel(hex, 0) + 0.7152 * channel(hex, 1) + 0.0722 * channel(hex, 2);
}

function ratio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
}

describe('colour contrast', () => {
  it('reads the tokens out of both themes', () => {
    for (const mode of ['light', 'dark'] as const) {
      const set = tokens(mode);
      expect(Object.keys(set).length, mode).toBeGreaterThan(8);
      expect(set.bg, mode).toBeTruthy();
      expect(set.ink, mode).toBeTruthy();
    }
  });

  it('AC-09-2: body text clears 4.5:1 against every surface, in both themes', () => {
    for (const mode of ['light', 'dark'] as const) {
      const c = tokens(mode);
      for (const surface of ['bg', 'bg-raised', 'bg-sunken'] as const) {
        expect(ratio(c.ink!, c[surface]!), `${mode}/ink on ${surface}`).toBeGreaterThanOrEqual(4.5);
        expect(ratio(c['ink-soft']!, c[surface]!), `${mode}/ink-soft on ${surface}`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it('AC-09-2: the faint text and accents clear the 3:1 large-text threshold', () => {
    for (const mode of ['light', 'dark'] as const) {
      const c = tokens(mode);
      expect(ratio(c['ink-faint']!, c.bg!), `${mode}/ink-faint`).toBeGreaterThanOrEqual(3);
      expect(ratio(c.accent!, c.bg!), `${mode}/accent`).toBeGreaterThanOrEqual(3);
      expect(ratio(c.flag!, c.bg!), `${mode}/flag`).toBeGreaterThanOrEqual(3);
    }
  });

  it('AC-09-2: the primary button text clears 4.5:1 on its own background', () => {
    for (const mode of ['light', 'dark'] as const) {
      const c = tokens(mode);
      expect(ratio(c['accent-ink']!, c.accent!), `${mode}/button`).toBeGreaterThanOrEqual(4.5);
      expect(ratio(c.accent!, c['accent-soft']!), `${mode}/accent badge`).toBeGreaterThanOrEqual(4.5);
      expect(ratio(c.flag!, c['flag-soft']!), `${mode}/flag badge`).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe('generated cover colours (R-11)', () => {
  it('AC-09-2: the label band keeps its white text above 4.5:1', () => {
    for (const category of CATEGORIES) {
      expect(ratio('#ffffff', CATEGORY_COLORS[category].deep), category).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('AC-09-2: the bars stay visible against their own tint', () => {
    for (const category of CATEGORIES) {
      expect(
        ratio(CATEGORY_COLORS[category].ink, CATEGORY_COLORS[category].tint),
        category,
      ).toBeGreaterThanOrEqual(3);
    }
  });

  it('every category gets its own hue', () => {
    const inks = CATEGORIES.map((c) => CATEGORY_COLORS[c].ink);
    expect(new Set(inks).size).toBe(inks.length);
  });
});
