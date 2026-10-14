// Hand-rolled sitemap. Small enough that it avoids pulling in @astrojs/sitemap.
//
// Only <loc> is emitted: Google ignores <priority> and <changefreq> outright,
// and a <lastmod> that moves on every deploy is treated as unreliable and
// discarded — so publishing them would be noise at best.
//
// Drafts are never listed, even under `astro dev`. Case studies (index
// included) are listed only once at least one is published.
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { abs } from '../data/site';
import { isPublished } from '../data/content';

const pages = ['/', '/how-it-works', '/services', '/learn', '/payback-calculator', '/about', '/contact'];

export const GET: APIRoute = async () => {
  const learn = await getCollection('learn', isPublished);
  const caseStudies = await getCollection('case-studies', isPublished);
  const paths = [
    ...pages,
    ...learn.map((a) => `/learn/${a.id}`),
    ...(caseStudies.length > 0 ? ['/case-studies', ...caseStudies.map((c) => `/case-studies/${c.id}`)] : []),
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((p) => `  <url><loc>${abs(p)}</loc></url>`).join('\n')}
</urlset>
`;
  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
