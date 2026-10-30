// RSS-Feed wie bisher unter /feed/ (per .htaccess auf diese Datei abgebildet)
import { posts } from '../../lib/urls';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export async function GET() {
  const items = (await posts()).slice(0, 10).map((p) => `
    <item>
      <title>${esc(p.data.title)}</title>
      <link>https://thinkfox.de/${p.id}/</link>
      <guid isPermaLink="true">https://thinkfox.de/${p.id}/</guid>
      <pubDate>${p.data.date.toUTCString()}</pubDate>
      ${p.data.kategorien.map((k) => `<category>${esc(k)}</category>`).join('')}
      <description>${esc(p.data.auszug)}</description>
    </item>`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>thinkfox marketing</title>
    <atom:link href="https://thinkfox.de/feed/" rel="self" type="application/rss+xml" />
    <link>https://thinkfox.de</link>
    <description>Werbeagentur aus Nordhessen</description>
    <language>de-DE</language>${items}
  </channel>
</rss>
`, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
