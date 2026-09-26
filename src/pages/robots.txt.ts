import type { APIContext } from 'astro';
import { BASE_ROOT } from '../lib/base';

export function GET(context: APIContext) {
  const site = context.site?.toString() ?? 'https://example.com/';
  // R-12: the sitemap lives under the deployment base, not at the origin root.
  const sitemap = new URL(`${BASE_ROOT}sitemap-index.xml`.replace(/^\//, ''), site).toString();
  const body = ['User-agent: *', 'Allow: /', '', `Sitemap: ${sitemap}`, ''].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
