import { posts, sitemap } from '../lib/urls';

export const GET = async () =>
  sitemap((await posts()).map((p) => ({ loc: `https://thinkfox.de/${p.id}/`, lastmod: p.data.modified ?? p.data.date })));
