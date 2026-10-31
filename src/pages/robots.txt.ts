// Inhalt wie bisher (WordPress), Pfade des neuen Systems ergänzt. Ohne Crawl-delay: bremste
// Suchmaschinen und KI-Crawler unnötig aus (Google ignoriert ihn ohnehin). /wp-content/plugins/ nicht
// sperren: dort liegt das Elementor-Skript, ohne das eingeblendete Inhalte für Google unsichtbar bleiben.
export const GET = () => new Response(`User-Agent: *
Disallow: /wp-admin/
Disallow: /e-zines/
Disallow: /refer/
Disallow: /admin/
Disallow: /api/

Sitemap: https://thinkfox.de/sitemap_index.xml
Sitemap: https://thinkfox.de/post-sitemap.xml
Sitemap: https://thinkfox.de/page-sitemap.xml
`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
