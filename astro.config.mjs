// @ts-check
import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'astro/config';
import externLokal from './scripts/astro-extern-lokal.mjs';
import osmKarte from './scripts/astro-osm-karte.mjs';

/** Kopiert Decap CMS aus node_modules nach public/admin/decap (selbst gehostet, kein CDN). */
const decapCms = {
  name: 'decap-cms',
  hooks: {
    'astro:config:setup': () => {
      const src = path.resolve('node_modules/decap-cms/dist');
      const dest = path.resolve('public/admin/decap');
      fs.mkdirSync(dest, { recursive: true });
      for (const file of fs.readdirSync(src)) {
        if (file.endsWith('decap-cms.js')) fs.copyFileSync(path.join(src, file), path.join(dest, file));
      }
    },
  },
};

/** Schreibt die gebündelten Stylesheets (src/lib/css-bundle.ts) nach dist/_css/. */
const cssBundles = {
  name: 'css-bundles',
  hooks: {
    'astro:build:done': ({ dir, logger }) => {
      const bundles = globalThis.__tfCssBundles;
      if (!bundles?.size) throw new Error('Keine CSS-Bündel erzeugt');
      const ziel = path.join(dir.pathname, '_css');
      fs.mkdirSync(ziel, { recursive: true });
      for (const [hash, css] of bundles) fs.writeFileSync(path.join(ziel, `${hash}.css`), css);
      logger.info(`${bundles.size} CSS-Bündel geschrieben`);
    },
  },
};

export default defineConfig({
  site: 'https://thinkfox.de',
  // URLs wie bisher in WordPress: /seite/ mit Slash am Ende
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'never' },
  compressHTML: false,
  vite: { build: { assetsInlineLimit: 0 } },
  integrations: [decapCms, cssBundles, osmKarte(), externLokal()],
});
