import { loadEntries } from '../lib/load';
import { toSearchIndex } from '../lib/entries';

/** R-06: the same index the client island uses, also served as a file. */
export async function GET() {
  const index = toSearchIndex(await loadEntries());
  return new Response(JSON.stringify(index), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
