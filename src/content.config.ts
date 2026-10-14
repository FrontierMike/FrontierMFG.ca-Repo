// Content collections: Learn articles and case studies, as Markdown or MDX.
//
// Both carry a `draft` flag. Drafts render under `astro dev` only; every
// `astro build` (production, and Cloudflare's branch previews) leaves them out
// of the pages, the sitemap, and the nav. See src/data/content.ts.
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Files starting with "_" are ignored, so a template can sit in the folder.
const pattern = '**/[^_]*.{md,mdx}';

const learn = defineCollection({
  loader: glob({ pattern, base: './src/content/learn' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum(['benefits', 'methods']),
    pubDate: z.coerce.date(),
    draft: z.boolean().default(false),
  }),
});

const caseStudies = defineCollection({
  loader: glob({ pattern, base: './src/content/case-studies' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    /** e.g. "Metal fabrication". Name a client only with their written permission. */
    industry: z.string().optional(),
    pubDate: z.coerce.date(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { learn, 'case-studies': caseStudies };
