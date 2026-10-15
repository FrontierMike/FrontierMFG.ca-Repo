// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';

// Fonts are self-hosted from the @fontsource packages in node_modules (no
// Google Fonts or CDN requests, so the build works offline). Astro serves the
// latin files from the site itself and generates size-adjusted fallbacks so
// the swap doesn't shift the layout.
const fontsource = (pkg, file, weights) =>
  weights.map((weight) => ({
    weight,
    style: 'normal',
    src: [`@fontsource/${pkg}/files/${file}-latin-${weight}-normal.woff2`],
  }));

// https://astro.build/config
export default defineConfig({
  // Required for canonical URLs, the sitemap, and absolute JSON-LD @ids.
  site: 'https://frontiermfg.ca',
  // MDX for Learn articles and case studies (plain .md works without it).
  integrations: [mdx()],
  fonts: [
    { provider: fontProviders.local(), name: 'Barlow Condensed', cssVariable: '--font-barlow', fallbacks: ['Arial Narrow', 'sans-serif'],
      options: { variants: fontsource('barlow-condensed', 'barlow-condensed', [600, 700]) } },
    { provider: fontProviders.local(), name: 'IBM Plex Sans', cssVariable: '--font-plex-sans', fallbacks: ['sans-serif'],
      options: { variants: fontsource('ibm-plex-sans', 'ibm-plex-sans', [400, 500, 600]) } },
    { provider: fontProviders.local(), name: 'IBM Plex Mono', cssVariable: '--font-plex-mono', fallbacks: ['monospace'],
      options: { variants: fontsource('ibm-plex-mono', 'ibm-plex-mono', [400, 500]) } },
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});
