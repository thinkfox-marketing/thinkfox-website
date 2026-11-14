// /llms.txt – kompakte Übersicht für KI-Assistenten und -Crawler (Vorschlag llmstxt.org):
// wer thinkfox ist, was angeboten wird, welche Seiten die wichtigsten Informationen enthalten.
import { allPosts } from '../lib/wp';
import { UNTERNEHMEN } from '../lib/geo';
import { BRANCHEN } from '../lib/branchen';

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

Werbeagentur und Marketingpartner für mittelständische Unternehmen, Einrichtungen und öffentliche Auftraggeber,
seit ${UNTERNEHMEN.foundingDate}. Sitz in ${a.addressLocality} (Landkreis Waldeck-Frankenberg, Nordhessen, nahe Kassel), Projekte in ganz Deutschland.
Kernleistung ist Sichtbarkeit bei Kunden und Bewerbern über Website, Social Media, Film und Foto. Die Zusammenarbeit beginnt
meist mit einem einzelnen Projekt; die laufende Betreuung als externe Marketingabteilung ist ein eigenes Angebot.

- Adresse: ${UNTERNEHMEN.name}, ${a.streetAddress}, ${a.postalCode} ${a.addressLocality}
- Telefon: ${UNTERNEHMEN.telephone}
- E-Mail: ${UNTERNEHMEN.email}
- Projekt anfragen: ${SITE}/thinkfox-marketing-projekt-anfragen/

## Leistungen

- [Websites und SEO](${SITE}/professionelle-websites-fuer-den-mittelstand/): Konzeption, Gestaltung und Umsetzung von Unternehmenswebsites und Karriereseiten, Suchmaschinenoptimierung und KI-Sichtbarkeit.
- [Social Media](${SITE}/mehr-aufmerksamkeit-und-reichweite-mit-social-media/): Redaktionsplanung, Produktion, Betreuung der Kanäle und Anzeigen.
- [Film und Foto](${SITE}/professionelle-content-produktion-video-foto-social-media-aus-nordhessen/): Imagefilme, Recruitingfilme, Video-Podcasts und Fotografie.
- [Employer Branding](${SITE}/employer-branding-agentur-recruitingfilm-karriereseite/): Recruitingfilme, Karriereseiten mit Google-Jobs-Anbindung, Arbeitsplätze als 360-Grad-Rundgang, Mitarbeiterfotos und Recruiting-Kampagnen.
- [Externe Marketingabteilung](${SITE}/deine-externe-marketingabteilung-ganzheitliches-marketing-fuer-den-mittelstand/): Planung und Umsetzung des gesamten Marketings mit festem Ansprechpartner.
- [360-Grad-Rundgänge](${SITE}/360-grad-rundgaenge/): virtuelle Rundgänge für Unternehmen, Tourismus und Recruiting.
- [Studio und Vermietung](${SITE}/thinkfox-mietstudio-dein-fotostudio-videostudio-nordhessen/): Foto- und Videostudio mit Hohlkehle in Edertal, Vermietung auf Anfrage.
- [Marketing-Ampel](${SITE}/marketing-ampel/): kostenloser Selbsttest zur Einschätzung des eigenen Marketings (Ampel je Bereich).
- [Werbeagentur Bad Wildungen](${SITE}/werbeagentur-bad-wildungen-thinkfox-marketing-fuer-den-mittelstand/)

## Branchen

${BRANCHEN.map((b) => `- [${b.menue}](${SITE}/branchen/${b.slug}/): ${b.beschreibung}`).join('\n')}

## Referenzen und Projekte

- [Alle Referenzen](${SITE}/referenzen/)
${projekte.map(zeile).join('\n')}

## Blog

${blog.map(zeile).join('\n')}

## Kontakt

- [Kontakt](${SITE}/kontakt/)
- [Impressum](${SITE}/impressum/)
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
