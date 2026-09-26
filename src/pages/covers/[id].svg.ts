import type { APIContext } from 'astro';
import { loadEntries } from '../../lib/load';
import { generatedCover } from '../../lib/media';
import type { Entry } from '../../lib/schema';

/**
 * R-11: one generated cover per entry. Used directly for entries with no embeddable image,
 * and as the `onerror` fallback for every external one, so it is written for all of them.
 */
export async function getStaticPaths() {
  const entries = await loadEntries();
  return entries.map((entry) => ({ params: { id: entry.id }, props: { entry } }));
}

export function GET({ props }: APIContext<{ entry: Entry }>) {
  const { entry } = props;
  return new Response(generatedCover(entry.id, entry.category, entry.name), {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
