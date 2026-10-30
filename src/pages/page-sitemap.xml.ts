import { pages, sitemap } from '../lib/urls';

export const GET = () => sitemap(pages().map((p) => ({ loc: `https://thinkfox.de${p.path}` })));
