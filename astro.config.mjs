// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  // Required for canonical URLs, the sitemap, and absolute JSON-LD @ids.
  site: 'https://frontiermfg.ca',
  // MDX for Learn articles and case studies (plain .md works without it).
  integrations: [mdx()],
  vite: {
    plugins: [tailwindcss()]
  }
});
