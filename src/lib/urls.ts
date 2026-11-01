// Alle öffentlichen URLs (für Sitemaps und Feed).
import { allPosts, pageFiles, type LegacyPage } from './wp';

export const pages = () =>
  Object.values(pageFiles)
    .map((m) => m.default as LegacyPage)
    // Danke- und Ergebnisseiten sowie alles mit „noindex“ (Impressum, Datenschutz …) gehören nicht in die Sitemap
    .filter((p) => !/danke_|ergebnis/.test(p.path))
    .filter((p) => !/<meta name="robots" content="[^"]*noindex/.test(p.seo));

export const posts = allPosts;

export function sitemap(entries: { loc: string; lastmod?: Date }[]): Response {
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map((e) => `  <url><loc>${e.loc}</loc>${e.lastmod ? `<lastmod>${e.lastmod.toISOString()}</lastmod>` : ''}</url>`).join('\n')}
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
