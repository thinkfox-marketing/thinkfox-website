export const GET = () => new Response(`<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>https://thinkfox.de/post-sitemap.xml</loc></sitemap>
  <sitemap><loc>https://thinkfox.de/page-sitemap.xml</loc></sitemap>
</sitemapindex>
`, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
