import { getCollection } from 'astro:content';
import type { Entry } from './schema';
import { sortEntries } from './entries';

let cache: Entry[] | null = null;

/** All entries from the content collection, sorted. Cached for the build. */
export async function loadEntries(): Promise<Entry[]> {
  if (!cache) {
    const rows = await getCollection('entries');
    cache = sortEntries(rows.map((r) => r.data as Entry));
  }
  return cache;
}
