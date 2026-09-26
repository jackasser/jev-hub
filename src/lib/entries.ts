import type { Entry } from './schema';
import { CATEGORIES, type Category } from './taxonomy';

/** Featured first, then newest `addedAt`, then id for stability. */
export function sortEntries(entries: Entry[]): Entry[] {
  return [...entries].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    if (a.addedAt !== b.addedAt) return a.addedAt < b.addedAt ? 1 : -1;
    return a.id.localeCompare(b.id);
  });
}

export function latest(entries: Entry[], n = 6): Entry[] {
  return [...entries]
    .sort((a, b) => (a.date === b.date ? a.id.localeCompare(b.id) : a.date < b.date ? 1 : -1))
    .slice(0, n);
}

export function featured(entries: Entry[]): Entry[] {
  return sortEntries(entries.filter((e) => e.featured));
}

export function byCategory(entries: Entry[], category: Category): Entry[] {
  return sortEntries(entries.filter((e) => e.category === category));
}

export function countByCategory(entries: Entry[]): Record<Category, number> {
  const out = Object.fromEntries(CATEGORIES.map((c) => [c, 0])) as Record<Category, number>;
  for (const e of entries) out[e.category] += 1;
  return out;
}

export function allTags(entries: Entry[]): [string, number][] {
  const m = new Map<string, number>();
  for (const e of entries) for (const t of e.tags) m.set(t, (m.get(t) ?? 0) + 1);
  return [...m].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

export interface SearchItem {
  id: string;
  name: string;
  category: Category;
  tags: string[];
  org: string;
  description_en: string;
  description_ja: string;
  url: string;
  official: boolean;
  stars: number | null;
}

export function toSearchIndex(entries: Entry[]): SearchItem[] {
  return sortEntries(entries).map((e) => ({
    id: e.id,
    name: e.name,
    category: e.category,
    tags: [...e.tags],
    org: e.org,
    description_en: e.description_en,
    description_ja: e.description_ja,
    url: e.url,
    official: e.official,
    stars: e.stars ?? null,
  }));
}
