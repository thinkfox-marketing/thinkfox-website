// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://thinkfox.de',
  // URLs wie bisher in WordPress: /seite/ mit Slash am Ende
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'never' },
  compressHTML: false,
  vite: { build: { assetsInlineLimit: 0 } },
});
