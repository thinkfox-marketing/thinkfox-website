// Strukturierte Daten für Suchmaschinen und KI-Assistenten (SEO/GEO):
// - Unternehmensprofil als lokales Dienstleistungsunternehmen (ergänzt den Organization-Knoten
//   von Rank Math über dieselbe @id)
// - Leistungen (Service) auf den Leistungsseiten
// - FAQPage aus den FAQ-Akkordeons der Seite
// Außerdem: Korrekturen an übernommenen SEO-Angaben, die einen erneuten WordPress-Import überstehen.

export const SITE = 'https://thinkfox.de';

/** Standort für Karte und JSON-LD (OpenStreetMap/Nominatim für Bahnhofstraße 39a, Edertal-Giflitz).
 *  null → wird beim Build über Nominatim aus der Adresse ermittelt (z. B. nach einem Umzug). */
export const KOORDINATEN: { lat: number; lon: number } | null = { lat: 51.1606349, lon: 9.1357474 };

export const UNTERNEHMEN = {
  '@type': ['Organization', 'ProfessionalService'],
  '@id': `${SITE}/#organization`,
  name: 'thinkfox marketing GmbH',
  alternateName: 'thinkfox marketing',
  url: SITE,
  logo: `${SITE}/wp-content/uploads/2026/01/Logo-Finale_V2.png`,
  image: `${SITE}/media/showreel-standbild.webp`,
  description:
    'Werbeagentur aus Edertal in Nordhessen (nahe Kassel), Marketingpartner für mittelständische Unternehmen und Einrichtungen: '
    + 'Websites und SEO, Social Media, Film und Foto für mehr Sichtbarkeit bei Kunden und Bewerbern – auf Wunsch als externe Marketingabteilung.',
  foundingDate: '2015',
  email: 'hallo@thinkfox.de',
  telephone: '+49 5623 9737793',
  priceRange: '€€',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Bahnhofstraße 39a',
    postalCode: '34549',
    addressLocality: 'Edertal',
    addressRegion: 'Hessen',
    addressCountry: 'DE',
  },
  ...(KOORDINATEN ? {
    geo: { '@type': 'GeoCoordinates', latitude: KOORDINATEN.lat, longitude: KOORDINATEN.lon },
    hasMap: `https://www.openstreetmap.org/?mlat=${KOORDINATEN.lat}&mlon=${KOORDINATEN.lon}#map=17/${KOORDINATEN.lat}/${KOORDINATEN.lon}`,
  } : {}),
  areaServed: [
    'Edertal', 'Bad Wildungen', 'Korbach', 'Frankenberg (Eder)', 'Fritzlar', 'Kassel',
    'Landkreis Waldeck-Frankenberg', 'Nordhessen', 'Deutschland',
  ].map((name) => ({ '@type': 'Place', name })),
  knowsAbout: [
    'Externe Marketingabteilung', 'Markenentwicklung', 'Corporate Design', 'Webdesign', 'WordPress',
    'Suchmaschinenoptimierung (SEO)', 'Generative Engine Optimization (GEO)', 'Suchmaschinenwerbung (SEA)',
    'Social-Media-Marketing', 'Videoproduktion', 'Imagefilm', 'Recruitingfilm', 'Fotografie', 'Employer Branding',
    '360-Grad-Rundgänge', 'Printdesign',
  ],
  sameAs: [
    'https://www.facebook.com/thinkfox.marketing/',
    'https://www.instagram.com/thinkfox.marketing/',
    'https://www.youtube.com/channel/UCj0AA1nkmvjMYt3zQbq1FsA',
  ],
  contactPoint: [{
    '@type': 'ContactPoint', contactType: 'customer service', telephone: '+49 5623 9737793',
    email: 'hallo@thinkfox.de', availableLanguage: ['de'],
  }],
};

/** Leistungsseiten → Service-Schema */
const LEISTUNGEN: Record<string, { name: string; serviceType: string }> = {
  '/deine-externe-marketingabteilung-ganzheitliches-marketing-fuer-den-mittelstand/':
    { name: 'Externe Marketingabteilung für den Mittelstand', serviceType: 'Marketingberatung und -umsetzung' },
  '/professionelle-websites-fuer-den-mittelstand/':
    { name: 'Websites, SEO & GEO für den Mittelstand', serviceType: 'Webdesign und Suchmaschinenoptimierung' },
  '/mehr-aufmerksamkeit-und-reichweite-mit-social-media/':
    { name: 'Social-Media-Betreuung', serviceType: 'Social-Media-Marketing' },
  '/professionelle-content-produktion-video-foto-social-media-aus-nordhessen/':
    { name: 'Content-Produktion: Video, Foto, Social Media', serviceType: 'Video- und Fotoproduktion' },
  '/thinkfox-mietstudio-dein-fotostudio-videostudio-nordhessen/':
    { name: 'Mietstudio für Foto- und Videoproduktionen in Edertal', serviceType: 'Studiovermietung' },
  '/360-grad-rundgaenge/':
    { name: '360-Grad-Rundgänge', serviceType: 'Virtuelle Rundgänge' },
  '/werbeagentur-bad-wildungen-thinkfox-marketing-fuer-den-mittelstand/':
    { name: 'Werbeagentur für Bad Wildungen und die Edersee-Region', serviceType: 'Werbeagentur' },
};

/** Seitentitel (<title>, og:title, twitter:title) für übernommene Seiten – auf Suchbegriffe ausgerichtet (11/2026).
 *  H1 und Text der Seiten bleiben unverändert. Startseite bewusst nicht (rankt für „Werbeagentur Nordhessen/Edertal“). */
export const TITEL: Record<string, string> = {
  '/professionelle-websites-fuer-den-mittelstand/': 'Webdesign & Websites für den Mittelstand | thinkfox',
  '/mehr-aufmerksamkeit-und-reichweite-mit-social-media/': 'Social-Media-Agentur für den Mittelstand | thinkfox',
  '/professionelle-content-produktion-video-foto-social-media-aus-nordhessen/': 'Videoproduktion & Imagefilm aus Nordhessen | thinkfox',
  '/360-grad-rundgaenge/': '360-Grad-Rundgänge erstellen lassen | thinkfox',
  '/thinkfox-mietstudio-dein-fotostudio-videostudio-nordhessen/': 'Foto- & Videostudio mieten in Nordhessen | thinkfox',
  '/deine-externe-marketingabteilung-ganzheitliches-marketing-fuer-den-mittelstand/': 'Externe Marketingabteilung für den Mittelstand | thinkfox',
  '/werbeagentur-bad-wildungen-thinkfox-marketing-fuer-den-mittelstand/': 'Werbeagentur Bad Wildungen | thinkfox marketing',
  '/kontakt/': 'Kontakt | thinkfox marketing',
  '/thinkfox-marketing-projekt-anfragen/': 'Projekt anfragen | thinkfox marketing',
  '/marketing-ampel/': 'Marketing-Ampel: Selbsttest für Ihr Marketing | thinkfox',
  '/marketing-ampel/ergebnis/': 'Ihre Marketing-Ampel | thinkfox marketing',
  '/danke_projektanfrage/': 'Vielen Dank für Ihre Anfrage | thinkfox marketing',
  '/danke_websites/': 'Vielen Dank für Ihre Anfrage | thinkfox marketing',
  '/danke_social-media/': 'Vielen Dank für Ihre Anfrage | thinkfox marketing',
  '/danke_content-produktion/': 'Vielen Dank für Ihre Anfrage | thinkfox marketing',
};

/** Titel/Beschreibung auch im übernommenen JSON-LD (WebPage, Article) setzen – dort stehen sonst die alten Texte. */
export function jsonLdTexte(seo: string, t: { beschreibung?: string; titel?: string }): string {
  if (!t.beschreibung && !t.titel) return seo;
  return seo.replace(/(<script type="application\/ld\+json"[^>]*>)([\s\S]*?)(<\/script>)/g, (m, a: string, json: string, z: string) => {
    try {
      const daten = JSON.parse(json);
      const lauf = (k: unknown): void => {
        if (Array.isArray(k)) { k.forEach(lauf); return; }
        if (!k || typeof k !== 'object') return;
        const o = k as Record<string, unknown>;
        if (/WebPage|Article|BlogPosting/.test([o['@type']].flat().join(' '))) {
          if (t.beschreibung && 'description' in o) o.description = t.beschreibung;
          if (t.titel && 'name' in o) o.name = t.titel;
          if (t.titel && 'headline' in o) o.headline = t.titel;
        } else if (/VideoObject/.test([o['@type']].flat().join(' ')) && t.beschreibung && 'description' in o) {
          o.description = t.beschreibung;
        }
        Object.values(o).forEach(lauf);
      };
      lauf(daten);
      return `${a}${JSON.stringify(daten)}${z}`;
    } catch { return m; }
  });
}

/** Bessere Meta-Beschreibungen für übernommene Seiten (Original zu kurz). */
export const BESCHREIBUNGEN: Record<string, string> = {
  // Relaunch: Sie-Form und Positionierung (Sichtbarkeit für mittelständische Unternehmen)
  '/professionelle-websites-fuer-den-mittelstand/':
    'Websites für mittelständische Unternehmen: Konzeption, Gestaltung, Umsetzung und Pflege – mit SEO und KI-Sichtbarkeit, damit Anfragen und Bewerbungen ankommen.',
  '/mehr-aufmerksamkeit-und-reichweite-mit-social-media/':
    'Social-Media-Betreuung für mittelständische Unternehmen: Redaktionsplanung, Produktion vor Ort, Veröffentlichung und Anzeigen aus Nordhessen.',
  '/professionelle-content-produktion-video-foto-social-media-aus-nordhessen/':
    'Imagefilm, Recruitingfilm und Fotografie aus Nordhessen: Konzeption, Dreh und Schnitt für Website, Social Media und Personalgewinnung.',
  '/360-grad-rundgaenge/':
    'Virtuelle 360-Grad-Rundgänge für Unternehmen, Ferienobjekte und Veranstaltungsorte: Beratung, Aufnahmen, Erstellung und Hosting aus Nordhessen.',
  '/thinkfox-mietstudio-dein-fotostudio-videostudio-nordhessen/':
    'Foto- und Videostudio mit Hohlkehle in Edertal (Nordhessen) mieten: rund 70 m² Spielfläche, Technik auf Wunsch, stunden- oder tageweise.',
  '/kontakt/':
    'Kontakt zu thinkfox marketing in Edertal: Telefon, E-Mail, Anfahrt und Terminauswahl für ein Erstgespräch.',
  '/thinkfox-marketing-projekt-anfragen/':
    'Projektanfrage an thinkfox marketing: Mit wenigen Angaben zu Thema und Bedarf ordnen wir Ihre Anfrage ein und melden uns bei Ihnen.',
  '/barrierefreiheitserklaerung/':
    'Barrierefreiheit von thinkfox.de: Stand der Vereinbarkeit mit WCAG 2.2 AA, bekannte Einschränkungen und wie Sie uns Barrieren melden.',
  '/danke_projektanfrage/': 'Ihre Anfrage ist bei thinkfox marketing eingegangen. Wir melden uns bei Ihnen.',
  '/danke_websites/': 'Ihre Anfrage ist bei thinkfox marketing eingegangen. Wir melden uns bei Ihnen.',
  '/danke_social-media/': 'Ihre Anfrage ist bei thinkfox marketing eingegangen. Wir melden uns bei Ihnen.',
  '/danke_content-produktion/': 'Ihre Anfrage ist bei thinkfox marketing eingegangen. Wir melden uns bei Ihnen.',
  '/marketing-ampel/':
    'Kostenloser Marketing-Selbsttest für KMU: Website, Content, Strategie und Recruiting in wenigen Minuten bewerten – mit Ampel je Bereich.',
  '/360-grad-rundgaenge/cine-k-korbach/':
    'Virtueller 360-Grad-Rundgang durch das Kino Cine K in Korbach – erstellt von thinkfox marketing. Säle und Foyer bequem online erkunden.',
  '/360-grad-rundgaenge/altstadtblick-1/':
    'Virtueller 360-Grad-Rundgang durch das Ferienhaus Altstadtblick in Bad Wildungen – Zimmer, Ausstattung und Ausblick vorab online ansehen.',
};

const text = (html: string) => html
  .replace(/&shy;|\u00AD|<wbr>/g, '')
  .replace(/<svg[\s\S]*?<\/svg>/g, '')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#8222;|&#8220;/g, '"')
  .replace(/&#8211;/g, '–').replace(/&[a-z]+;|&#\d+;/g, ' ')
  .replace(/\s+/g, ' ').trim();

/** Fragen und Antworten aus den Elementor-FAQ-Akkordeons (<details>/<summary>). */
export function faqAus(html: string): { frage: string; antwort: string }[] {
  const faq: { frage: string; antwort: string }[] = [];
  for (const m of html.matchAll(/<details[^>]*class="e-n-accordion-item"[^>]*>([\s\S]*?)<\/details>/g)) {
    const frage = text(m[1].match(/<div class="e-n-accordion-item-title-text">([\s\S]*?)<\/div>/)?.[1] ?? '');
    const antwort = text(m[1].split('</summary>')[1] ?? '');
    if (frage.endsWith('?') && antwort) faq.push({ frage, antwort });
  }
  // einheitliches Beitrags-Layout (src/lib/beitrag.ts)
  for (const m of html.matchAll(/<details class="tf-faq__eintrag"><summary class="tf-faq__frage">([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/g)) {
    const frage = text(m[1]);
    const antwort = text(m[2]);
    if (frage && antwort) faq.push({ frage, antwort });
  }
  return faq;
}

const ld = (daten: unknown) =>
  `<script type="application/ld+json">${JSON.stringify(daten).replace(/</g, '\\u003c')}</script>`;

/** Zusätzliche JSON-LD-Blöcke für eine Seite. */
export function strukturierteDaten(pfad: string, html: string, beschreibung?: string): string {
  const graph: Record<string, unknown>[] = [UNTERNEHMEN];
  const leistung = LEISTUNGEN[pfad];
  if (leistung) {
    graph.push({
      '@type': 'Service', '@id': `${SITE}${pfad}#service`, name: leistung.name, serviceType: leistung.serviceType,
      url: `${SITE}${pfad}`, ...(beschreibung ? { description: beschreibung } : {}),
      provider: { '@id': `${SITE}/#organization` }, areaServed: UNTERNEHMEN.areaServed,
    });
  }
  const faq = faqAus(html);
  if (faq.length >= 2) {
    graph.push({
      '@type': 'FAQPage', '@id': `${SITE}${pfad}#faq`,
      mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.frage, acceptedAnswer: { '@type': 'Answer', text: f.antwort } })),
    });
  }
  return ld({ '@context': 'https://schema.org', '@graph': graph });
}

/** Unternehmensangaben im übernommenen Rank-Math-JSON-LD an UNTERNEHMEN angleichen: Beide Graphen beschreiben
 *  dieselbe @id, widersprachen sich aber (legalName „thinkfox“, nur ein Facebook-Link, andere Telefonschreibweise). */
export function organisationAngleichen(seo: string): string {
  return seo.replace(/(<script type="application\/ld\+json"[^>]*>)([\s\S]*?)(<\/script>)/g, (m, auf: string, json: string, zu: string) => {
    let daten: { '@graph'?: Record<string, unknown>[] };
    try { daten = JSON.parse(json); } catch { return m; }
    const knoten = (daten['@graph'] ?? []).find((n) => n['@id'] === UNTERNEHMEN['@id']);
    if (!knoten) return m;
    Object.assign(knoten, {
      name: UNTERNEHMEN.name, legalName: UNTERNEHMEN.name, sameAs: UNTERNEHMEN.sameAs,
      email: UNTERNEHMEN.email, contactPoint: UNTERNEHMEN.contactPoint,
    });
    return auf + JSON.stringify(daten).replace(/</g, '\\u003c') + zu;
  });
}
