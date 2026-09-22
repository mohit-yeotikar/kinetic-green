// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/**
 * Kinetic Green — Homepage Redesign
 *
 * Static-first Astro build → plain HTML/CSS/JS in ./dist
 * - No client framework runtime shipped
 * - Zero-JS baseline content (all copy/specs live in HTML)
 * - Island-level progressive enhancement via small vanilla modules
 */
export default defineConfig({
  site: 'https://kineticgreen.com',
  output: 'static',
  trailingSlash: 'ignore',
  build: {
    // Ship real files for tiny enhancement scripts instead of inline blobs,
    // so they are cached once and reused across navigations.
    inlineStylesheets: 'auto',
    assets: '_astro',
  },
  compressHTML: true,
  prefetch: false,
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404'),
    }),
  ],
  vite: {
    build: {
      cssMinify: 'lightningcss',
      // Keep the enhanced modules small enough to stay on the critical path
      // without hurting Core Web Vitals.
      assetsInlineLimit: 0,
    },
  },
});
