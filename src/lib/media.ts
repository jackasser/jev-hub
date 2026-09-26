import type { Entry } from './schema';
import { CATEGORY_META, type Category } from './taxonomy';
import { withBase } from './base';

export type Cover =
  | { kind: 'image'; src: string; credit: string }
  | { kind: 'github'; src: string }
  | { kind: 'generated'; src: string };

/** "https://github.com/owner/repo/..." -> "owner/repo", else null. */
export function githubRepo(url: string | undefined): string | null {
  if (!url) return null;
  const m = /^https?:\/\/(?:www\.)?github\.com\/([^/\s]+)\/([^/\s#?]+)/i.exec(url);
  return m ? `${m[1]}/${m[2]!.replace(/\.git$/i, '')}` : null;
}

/** Path of the build-time generated cover. Written for every entry, so it is always a valid fallback. */
export function generatedCoverPath(id: string): string {
  return withBase(`/covers/${id}.svg`);
}

/** R-11: an embeddable preview image, else GitHub's social preview, else our own drawing. */
export function coverFor(entry: Entry): Cover {
  if (entry.image) return { kind: 'image', src: entry.image, credit: entry.imageCredit ?? '' };
  const repo = githubRepo(entry.repoUrl);
  if (repo) return { kind: 'github', src: `https://opengraph.githubassets.com/${entry.id}/${repo}` };
  return { kind: 'generated', src: generatedCoverPath(entry.id) };
}

/** `ink` draws the bars, `tint` is the pale plot background, `deep` is the label band. */
export const CATEGORY_COLORS: Record<Category, { ink: string; tint: string; deep: string }> = {
  model: { ink: '#0f4d3f', tint: '#e3efe9', deep: '#0b3a30' },
  docs: { ink: '#1d4ed8', tint: '#e5ecfb', deep: '#1e3a8a' },
  sdk: { ink: '#6d28d9', tint: '#efe8fb', deep: '#4c1d95' },
  gateway: { ink: '#0e7490', tint: '#e0eff3', deep: '#155e75' },
  oss: { ink: '#b45309', tint: '#fbeedd', deep: '#7c3a06' },
  integration: { ink: '#be185d', tint: '#fbe6ef', deep: '#8a1043' },
  guide: { ink: '#475569', tint: '#e9edf2', deep: '#334155' },
  benchmark: { ink: '#b91c1c', tint: '#fbe7e7', deep: '#7f1d1d' },
};

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed: number): () => number {
  let a = seed || 1;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const FONT = 'ui-sans-serif,system-ui,sans-serif';
const MONO = 'ui-monospace,SFMono-Regular,Menlo,monospace';

/**
 * Deterministic 2:1 cover: a row of bars standing for the probability of each option, with the
 * winning one picked out — the shape of what this site is about. The numbers come from the id,
 * not from a model, which the aria-label says out loud so the picture cannot be read as data.
 *
 * Served as its own SVG file rather than inlined, so gradient ids cannot collide on a page.
 */
export function generatedCover(id: string, category: Category, name: string): string {
  const W = 1200;
  const H = 600;
  const BAND = 160;
  const PLOT_TOP = 96;
  const PLOT_BOTTOM = H - BAND - 48;
  const LEFT = 64;
  const RIGHT = W - 64;

  const { ink, tint, deep } = CATEGORY_COLORS[category];
  const r = rng(hash(id));

  const n = 5 + Math.floor(r() * 5);
  // Weights sharpened a little so one option clearly wins, the way a confident answer looks.
  const weights = Array.from({ length: n }, () => r() ** 2 + 0.02);
  const total = weights.reduce((a, b) => a + b, 0);
  const probs = weights.map((w) => w / total);
  const top = probs.reduce((best, p, i) => (p > probs[best]! ? i : best), 0);

  const span = RIGHT - LEFT;
  const gap = 18;
  const barW = (span - gap * (n - 1)) / n;
  const plotH = PLOT_BOTTOM - PLOT_TOP;
  const maxP = probs[top]!;

  const bars = probs
    .map((p, i) => {
      const h = Math.max(8, Math.round((p / maxP) * plotH));
      const x = Math.round(LEFT + i * (barW + gap));
      const y = PLOT_BOTTOM - h;
      const opacity = i === top ? '0.92' : (0.16 + (p / maxP) * 0.22).toFixed(2);
      const radius = Math.min(10, Math.round(barW / 4));
      return `<rect x="${x}" y="${y}" width="${Math.round(barW)}" height="${h}" rx="${radius}" fill="${ink}" fill-opacity="${opacity}"/>`;
    })
    .join('');

  const topX = Math.round(LEFT + top * (barW + gap) + barW / 2);
  const topY = PLOT_BOTTOM - Math.round(plotH) - 26;
  const reading = maxP.toFixed(2);

  const label = name.length > 30 ? `${name.slice(0, 29)}…` : name;
  const cat = CATEGORY_META[category].label.en;
  const fontSize = label.length > 18 ? 50 : 64;

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" ` +
    `aria-label="${esc(name)} — decorative cover: the bars are drawn from the entry id, not from a model">` +
    `<rect width="${W}" height="${H}" fill="${tint}"/>` +
    `<g>${bars}</g>` +
    `<line x1="${LEFT}" y1="${PLOT_BOTTOM + 0.5}" x2="${RIGHT}" y2="${PLOT_BOTTOM + 0.5}" stroke="${ink}" stroke-opacity="0.35" stroke-width="2"/>` +
    `<text x="${topX}" y="${topY}" text-anchor="middle" font-family="${MONO}" font-size="34" fill="${ink}" fill-opacity="0.9">${reading}</text>` +
    `<rect x="0" y="${H - BAND}" width="${W}" height="${BAND}" fill="${deep}"/>` +
    `<text x="56" y="${H - 96}" font-family="${FONT}" font-size="26" fill="#ffffff" fill-opacity="0.85" letter-spacing="4">${esc(cat.toUpperCase())}</text>` +
    `<text x="56" y="${H - 40}" font-family="${FONT}" font-size="${fontSize}" font-weight="700" fill="#ffffff">${esc(label)}</text>` +
    `</svg>`
  );
}
