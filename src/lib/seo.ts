// SEO-Head für Beiträge im Format, das Rank Math bisher ausgegeben hat
// (Title, Description, Canonical, Open Graph, Twitter, JSON-LD).
import { dimensions } from './media';
import { categoryName, type Post } from './wp';

export const SITE = 'https://thinkfox.de';
const SITE_NAME = 'thinkfox marketing GmbH – Die Werbeagentur aus Nordhessen, Nähe Kassel für ganzheitliches Marketing.';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** ISO-Datum mit Zeitzone Europe/Berlin (+01:00 / +02:00) wie im Original. */
function isoBerlin(d: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZoneName: 'longOffset',
  }).formatToParts(d);
  const g = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  const off = g('timeZoneName').replace('GMT', '') || '+00:00';
  return `${g('year')}-${g('month')}-${g('day')}T${g('hour') === '24' ? '00' : g('hour')}:${g('minute')}:${g('second')}${off}`;
}

const ORGANIZATION = {
  '@type': 'Organization', '@id': `${SITE}/#organization`, name: 'thinkfox marketing GmbH', url: SITE,
  sameAs: ['https://de-de.facebook.com/thinkfox.marketing'], email: 'hallo@thinkfox.de',
  address: { '@type': 'PostalAddress', streetAddress: 'Bahnhofstraße 39a', addressLocality: 'Edertal', postalCode: '34549' },
  logo: {
    '@type': 'ImageObject', '@id': `${SITE}/#logo`, url: `${SITE}/wp-content/uploads/2026/01/Logo-Finale_V2.png`,
    contentUrl: `${SITE}/wp-content/uploads/2026/01/Logo-Finale_V2.png`, caption: SITE_NAME, inLanguage: 'de', width: '1543', height: '1541',
  },
  contactPoint: [{ '@type': 'ContactPoint', telephone: '+49 (0)5623 9737793', contactType: 'customer support' }],
  description: 'Marketingagentur, Content Marketing und Markenentwicklung aus Nordhessen, Nähe Kassel - ganzheitliches Marketing für den Mittelstand.',
  legalName: 'thinkfox', location: { '@id': `${SITE}/#place` },
};

export function seoHead(p: Post): string {
  const d = p.data;
  const url = `${SITE}/${p.id}/`;
  const title = d.seo.titel || `${d.title} - thinkfox marketing`;
  const desc = d.seo.beschreibung || d.auszug.split(/\s+/).slice(0, 30).join(' ');
  const img = d.bild ? SITE + d.bild : '';
  const dim = d.bild ? dimensions(d.bild) : null;
  const published = isoBerlin(d.date);
  const modified = isoBerlin(d.modified ?? d.date);
  const section = categoryName(d.kategorien[0] ?? 'blog');
  const isBlog = p.collection === 'blog';

  const meta: string[] = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(desc)}"/>`,
    '<meta name="robots" content="follow, index, max-snippet:-1, max-video-preview:-1, max-image-preview:large"/>',
    `<link rel="canonical" href="${url}" />`,
    '<meta property="og:locale" content="de_DE" />',
    '<meta property="og:type" content="article" />',
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(desc)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:site_name" content="${esc(SITE_NAME)}" />`,
    '<meta property="article:publisher" content="https://de-de.facebook.com/thinkfox.marketing" />',
    ...d.schlagworte.map((t) => `<meta property="article:tag" content="${esc(t.replace(/-/g, ' '))}" />`),
    `<meta property="article:section" content="${esc(section)}" />`,
    `<meta property="og:updated_time" content="${modified}" />`,
  ];
  if (img) {
    meta.push(
      `<meta property="og:image" content="${img}" />`,
      `<meta property="og:image:secure_url" content="${img}" />`,
      ...(dim ? [`<meta property="og:image:width" content="${dim.width}" />`, `<meta property="og:image:height" content="${dim.height}" />`] : []),
      `<meta property="og:image:alt" content="${esc(d.bildAlt || d.title)}" />`,
    );
  }
  meta.push(
    `<meta property="article:published_time" content="${published}" />`,
    `<meta property="article:modified_time" content="${modified}" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(desc)}" />`,
    ...(img ? [`<meta name="twitter:image" content="${img}" />`] : []),
    '<meta name="twitter:label1" content="Verfasst von" />',
    '<meta name="twitter:data1" content="thinkfox" />',
    ...(d.seo.lesedauer ? ['<meta name="twitter:label2" content="Lesedauer" />', `<meta name="twitter:data2" content="${esc(d.seo.lesedauer)}" />`] : []),
  );

  const graph: Record<string, unknown>[] = [
    { '@type': 'Place', '@id': `${SITE}/#place`, address: ORGANIZATION.address },
    ORGANIZATION,
    { '@type': 'WebSite', '@id': `${SITE}/#website`, url: SITE, name: SITE_NAME, publisher: { '@id': `${SITE}/#organization` }, inLanguage: 'de' },
  ];
  if (img) graph.push({ '@type': 'ImageObject', '@id': img, url: img, ...(dim ? { width: String(dim.width), height: String(dim.height) } : {}), caption: d.bildAlt || d.title, inLanguage: 'de' });
  graph.push(
    {
      '@type': 'WebPage', '@id': `${url}#webpage`, url, name: title, datePublished: published, dateModified: modified,
      isPartOf: { '@id': `${SITE}/#website` }, ...(img ? { primaryImageOfPage: { '@id': img } } : {}), inLanguage: 'de',
    },
    { '@type': 'Person', '@id': `${url}#author`, name: 'thinkfox', worksFor: { '@id': `${SITE}/#organization` } },
    {
      '@type': isBlog ? 'BlogPosting' : 'Article', headline: title, ...(d.seo.fokusKeyword ? { keywords: d.seo.fokusKeyword } : {}),
      datePublished: published, dateModified: modified, articleSection: d.kategorien.map(categoryName).join(', '),
      author: { '@id': `${url}#author`, name: 'thinkfox' }, publisher: { '@id': `${SITE}/#organization` },
      description: desc, name: title, '@id': `${url}#richSnippet`, isPartOf: { '@id': `${url}#webpage` },
      ...(img ? { image: { '@id': img } } : {}), inLanguage: 'de', mainEntityOfPage: { '@id': `${url}#webpage` },
    },
  );
  const ld = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');
  meta.push(`<script type="application/ld+json" class="rank-math-schema-pro">${ld}</script>`);
  return meta.join('\n');
}
