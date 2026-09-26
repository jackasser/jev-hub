import type { APIContext } from 'astro';
import { feed } from '../lib/rss';

export function GET(context: APIContext) {
  return feed('en', context.site);
}
