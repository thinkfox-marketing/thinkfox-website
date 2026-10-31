// @ts-check
import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'astro/config';
import externLokal from './scripts/astro-extern-lokal.mjs';

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

export default defineConfig({
  site: 'https://thinkfox.de',
  // URLs wie bisher in WordPress: /seite/ mit Slash am Ende
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'never' },
  compressHTML: false,
  vite: { build: { assetsInlineLimit: 0 } },
  integrations: [decapCms, externLokal()],
});
