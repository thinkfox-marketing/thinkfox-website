// Inhalt wie bisher (WordPress), Pfade des neuen Systems ergänzt
export const GET = () => new Response(`User-Agent: *
Disallow: /wp-admin/
Disallow: /e-zines/
Disallow: /wp-content/plugins/
Disallow: /refer/
Disallow: /admin/
Disallow: /api/
Crawl-delay: 10

Sitemap: https://thinkfox.de/post-sitemap.xml
Sitemap: https://thinkfox.de/page-sitemap.xml
`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
