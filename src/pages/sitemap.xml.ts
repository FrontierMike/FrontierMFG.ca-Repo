// Hand-rolled sitemap. The site is three pages, so this avoids pulling in
// @astrojs/sitemap for what fits in a dozen lines.
//
// Only <loc> is emitted: Google ignores <priority> and <changefreq> outright,
// and a <lastmod> that moves on every deploy is treated as unreliable and
// discarded — so publishing them would be noise at best.
import type { APIRoute } from 'astro';
import { abs } from '../data/site';

const paths = ['/', '/services', '/lightwell'];

export const GET: APIRoute = () => {
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((p) => `  <url><loc>${abs(p)}</loc></url>`).join('\n')}
</urlset>
`;
  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
