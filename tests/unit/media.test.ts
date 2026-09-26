import { describe, expect, it } from 'vitest';
import raw from '../../src/data/entries.json';
import { entrySchema, type Entry } from '../../src/lib/schema';
import { CATEGORY_COLORS, coverFor, generatedCover, generatedCoverPath, githubRepo } from '../../src/lib/media';
import { CATEGORIES } from '../../src/lib/taxonomy';
import { BASE_ROOT, withBase } from '../../src/lib/base';

const entries: Entry[] = (raw as unknown[]).map((row) => entrySchema.parse(row));
const base = entries.find((e) => !e.repoUrl)!;

describe('githubRepo', () => {
  it('AC-11-2: reads owner/repo out of a GitHub URL', () => {
    expect(githubRepo('https://github.com/razorback16/openjev')).toBe('razorback16/openjev');
    expect(githubRepo('https://github.com/githubnext/localjev/')).toBe('githubnext/localjev');
    expect(githubRepo('https://github.com/o/r.git')).toBe('o/r');
    expect(githubRepo('https://github.com/o/r/tree/main/docs')).toBe('o/r');
  });

  it('AC-11-2: returns null for anything that is not a GitHub repository', () => {
    expect(githubRepo('https://docs.typesafe.ai/api')).toBeNull();
    expect(githubRepo('https://gitlab.com/o/r')).toBeNull();
    expect(githubRepo(undefined)).toBeNull();
    expect(githubRepo('not a url')).toBeNull();
  });
});

describe('coverFor', () => {
  it('AC-11-1: an embeddable preview image wins over everything else', () => {
    const entry: Entry = {
      ...base,
      image: 'https://example.com/preview.png',
      imageCredit: 'Example Org',
      repoUrl: 'https://github.com/o/r',
    };
    expect(coverFor(entry)).toEqual({
      kind: 'image',
      src: 'https://example.com/preview.png',
      credit: 'Example Org',
    });
  });

  it('AC-11-1: a GitHub repository falls back to the social preview GitHub generates', () => {
    const entry: Entry = { ...base, repoUrl: 'https://github.com/githubnext/localjev' };
    const cover = coverFor(entry);
    expect(cover.kind).toBe('github');
    expect(cover.src).toBe(`https://opengraph.githubassets.com/${entry.id}/githubnext/localjev`);
  });

  it('AC-11-1: everything else gets the generated cover', () => {
    const cover = coverFor(base);
    expect(cover).toEqual({ kind: 'generated', src: generatedCoverPath(base.id) });
  });

  it('AC-12-4: the generated cover path carries the deployment base', () => {
    expect(generatedCoverPath(base.id)).toBe(withBase(`/covers/${base.id}.svg`));
    expect(generatedCoverPath(base.id).startsWith(BASE_ROOT)).toBe(true);
    expect(generatedCoverPath(base.id).endsWith(`/covers/${base.id}.svg`)).toBe(true);
  });

  it('AC-11-1: every entry in the data set resolves to a cover', () => {
    for (const entry of entries) {
      const cover = coverFor(entry);
      expect(cover.src, entry.id).toBeTruthy();
      expect(['image', 'github', 'generated']).toContain(cover.kind);
    }
  });
});

describe('generatedCover', () => {
  it('AC-11-3: the same input always produces the same picture', () => {
    const a = generatedCover('localjev', 'oss', 'LocalJev');
    const b = generatedCover('localjev', 'oss', 'LocalJev');
    expect(a).toBe(b);
    expect(a).not.toBe(generatedCover('openjev', 'oss', 'OpenJev'));
  });

  it('AC-11-3: it is a standalone SVG carrying the category colour and the name', () => {
    const svg = generatedCover('localjev', 'oss', 'LocalJev');
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(svg).toContain('viewBox="0 0 1200 600"');
    expect(svg).toContain(CATEGORY_COLORS.oss.ink);
    expect(svg).toContain('LocalJev');
  });

  it('AC-11-3: the name is escaped so it cannot inject markup', () => {
    const svg = generatedCover('x', 'docs', 'a <script>&"');
    expect(svg).not.toContain('<script>');
    expect(svg).toContain('&lt;script&gt;');
    expect(svg).toContain('&amp;');
  });

  it('AC-11-3: the label says the bars are decorative, not a model output', () => {
    const svg = generatedCover('localjev', 'oss', 'LocalJev');
    expect(svg).toMatch(/aria-label="[^"]*decorative[^"]*"/i);
  });

  it('AC-11-3: renders for every category, and every category has colours', () => {
    expect(Object.keys(CATEGORY_COLORS).sort()).toEqual([...CATEGORIES].sort());
    for (const category of CATEGORIES) {
      const svg = generatedCover(`seed-${category}`, category, 'Example');
      expect(svg.startsWith('<svg'), category).toBe(true);
      expect(svg.endsWith('</svg>'), category).toBe(true);
    }
  });

  it('AC-11-3: a long name is truncated rather than overflowing the band', () => {
    const svg = generatedCover('x', 'guide', 'A name that is far too long to fit on one line of the cover band');
    expect(svg).toContain('…');
  });
});
