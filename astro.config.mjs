// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Required for canonical URLs, the sitemap, and absolute JSON-LD @ids.
  site: 'https://frontiermfg.ca',
  vite: {
    plugins: [tailwindcss()]
  }
});
