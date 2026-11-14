import { pages, sitemap } from '../lib/urls';
import { BRANCHEN } from '../lib/branchen';

// übernommene Seiten + eigene Seiten ohne Vorlage in src/legacy/pages (Referenzen-Übersicht, Branchenseiten)
export const GET = () => sitemap([
  ...pages().map((p) => p.path),
  '/referenzen/',
  ...BRANCHEN.map((b) => `/branchen/${b.slug}/`),
].map((pfad) => ({ loc: `https://thinkfox.de${pfad}` })));
