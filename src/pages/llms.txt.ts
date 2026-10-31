// /llms.txt – kompakte Übersicht für KI-Assistenten und -Crawler (Vorschlag llmstxt.org):
// wer thinkfox ist, was angeboten wird, welche Seiten die wichtigsten Informationen enthalten.
import { allPosts } from '../lib/wp';
import { UNTERNEHMEN } from '../lib/geo';

const SITE = 'https://thinkfox.de';

export async function GET() {
  const posts = await allPosts();
  const projekte = posts.filter((p) => p.collection === 'projekte');
  const blog = posts.filter((p) => p.collection === 'blog');
  const zeile = (p: (typeof posts)[number]) =>
    `- [${p.data.title}](${SITE}/${p.id}/)${p.data.seo.beschreibung ? `: ${p.data.seo.beschreibung}` : ''}`;
  const a = UNTERNEHMEN.address;

  const body = `# thinkfox marketing GmbH

> ${UNTERNEHMEN.description}

Werbeagentur und externe Marketingabteilung für kleine und mittlere Unternehmen sowie öffentliche Auftraggeber,
seit ${UNTERNEHMEN.foundingDate}. Sitz in ${a.addressLocality} (Landkreis Waldeck-Frankenberg, Nordhessen, nahe Kassel), Projekte in ganz Deutschland.

- Adresse: ${UNTERNEHMEN.name}, ${a.streetAddress}, ${a.postalCode} ${a.addressLocality}
- Telefon: ${UNTERNEHMEN.telephone}
- E-Mail: ${UNTERNEHMEN.email}
- Projekt anfragen: ${SITE}/thinkfox-marketing-projekt-anfragen/

## Leistungen

- [Externe Marketingabteilung](${SITE}/deine-externe-marketingabteilung-ganzheitliches-marketing-fuer-den-mittelstand/): Strategie, Planung und Umsetzung des gesamten Marketings als feste Partnerin.
- [Websites, SEO & GEO](${SITE}/professionelle-websites-fuer-den-mittelstand/): Konzeption, Design und Umsetzung von Websites und Karriereseiten, Suchmaschinen- und KI-Sichtbarkeit.
- [Social-Media-Betreuung](${SITE}/mehr-aufmerksamkeit-und-reichweite-mit-social-media/): Redaktionsplanung, Produktion, Community und Kampagnen.
- [Content-Produktion](${SITE}/professionelle-content-produktion-video-foto-social-media-aus-nordhessen/): Imagefilme, Recruitingfilme, Video-Podcasts, Fotoshootings.
- [Mietstudio](${SITE}/thinkfox-mietstudio-dein-fotostudio-videostudio-nordhessen/): Foto- und Videostudio mit Ausstattung in Edertal.
- [360-Grad-Rundgänge](${SITE}/360-grad-rundgaenge/): virtuelle Rundgänge für Unternehmen, Tourismus und Recruiting.
- [Marketing-Check](${SITE}/thinkfox-marketing-check/): kostenlose Selbsteinschätzung des eigenen Marketings.
- [Werbeagentur Bad Wildungen](${SITE}/werbeagentur-bad-wildungen-thinkfox-marketing-fuer-den-mittelstand/)

## Referenzen und Projekte

${projekte.map(zeile).join('\n')}

## Blog

${blog.map(zeile).join('\n')}

## Kontakt

- [Kontakt](${SITE}/kontakt/)
- [Impressum](${SITE}/impressum/)
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
