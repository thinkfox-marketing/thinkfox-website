// Neue Seiten im Relaunch (Markenentwurf 14.11.2026): gemeinsame Bausteine und Startseite. Leistungsseiten: src/lib/leistungen.ts.
// Rahmen: src/layouts/Seite.astro, Gestaltung: public/css/seite.css (Sektionsbaukasten t1–t8).
// Wording: sachlich-fachlich, Sie-Form, Aufbau Ausgangslage → Lösung → Ergebnis; Positionierung siehe CLAUDE.md.
// Inhalte nur aus belegten Projektfakten; Kunden ohne Freigabe werden nicht namentlich genannt.
import { allPosts, categoryName, type Post } from './wp';
import { wpImg } from './media';
import { asset } from './asset';
import { ANFRAGE, CONTENT, EXTERN, SOCIAL, STUDIO, TERMIN, WEB } from './chrome';

export const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const PFEIL = '<span aria-hidden="true">→</span>';
export const knopf = (text: string, href: string, variante = '') => `<a class="knopf${variante ? ` knopf--${variante}` : ''}" href="${href}">${esc(text)}${variante ? '' : ` ${PFEIL}`}</a>`;

/** SEO-Kopf einer übernommenen Seite für die neue Fassung: Die alten Fragen (FAQPage von Rank Math) und die Artikel-Angaben
 *  (Lesedauer, Autor) stehen nicht mehr auf der Seite – die neuen Fragen kommen über strukturierteDaten() in Seite.astro. */
export function seoNeu(seo: string): string {
  return seo
    .replace(/<meta name="twitter:(?:label|data)\d" content="[^"]*" \/>\n?/g, '')
    .replace(/(<script type="application\/ld\+json"[^>]*>)([\s\S]*?)(<\/script>)/g, (m, auf: string, json: string, zu: string) => {
      let daten: { '@graph'?: Record<string, unknown>[] };
      try { daten = JSON.parse(json); } catch { return m; }
      if (!daten['@graph']) return m;
      // FAQPage steht als eigener Knoten oder verschachtelt (z. B. Article → subjectOf) im Graphen
      const istFaq = (n: unknown) => !!n && typeof n === 'object' && [(n as { '@type'?: unknown })['@type']].flat().includes('FAQPage');
      const ohne = (n: unknown): unknown => {
        if (Array.isArray(n)) return n.filter((x) => !istFaq(x)).map(ohne);
        if (n && typeof n === 'object') {
          const o: Record<string, unknown> = {};
          for (const [k, v] of Object.entries(n)) {
            if (istFaq(v)) continue;
            const w = ohne(v);
            if (Array.isArray(w) && Array.isArray(v) && v.length && !w.length) continue; // Liste bestand nur aus der FAQ
            o[k] = w;
          }
          return o;
        }
        return n;
      };
      daten = ohne(daten) as typeof daten;
      return auf + JSON.stringify(daten).replace(/</g, '\\u003c') + zu;
    });
}

/** Abschnitt im Raster: links die Rubrik, rechts Überschrift, Einleitung und Inhalt. */
export function abschnitt(o: { id: string; rubrik: string; titel: string; einleitung?: string; inhalt: string; cls?: string; anker?: string }): string {
  return `<section class="abschnitt${o.cls ? ` ${o.cls}` : ''}"${o.anker ? ` id="${o.anker}"` : ''} aria-labelledby="${o.id}">
    <div class="huelle raster">
      <p class="label sp-label">${esc(o.rubrik)}</p>
      <div class="sp-inhalt">
        <h2 id="${o.id}">${o.titel}</h2>
        ${o.einleitung ? `<p class="einleitung">${esc(o.einleitung)}</p>` : ''}
        ${o.inhalt}
      </div>
    </div>
  </section>`;
}

export const drei = (punkte: [string, string][]) => `<div class="drei">${punkte.map(([t, p]) => `<div><h3>${esc(t)}</h3><p>${esc(p)}</p></div>`).join('')}</div>`;

const leistung = (titel: string, text: string, ergebnis: string, link?: [string, string]) => `<li class="zeile"><h3>${titel}</h3><div><p>${esc(text)}</p><p class="ergebnis"><b>Ergebnis</b>${esc(ergebnis)}</p>${link ? `<a class="link" href="${link[1]}">${esc(link[0])}</a>` : ''}</div></li>`;

export const preis = (titel: string, text: string, betrag: string) => `<div class="preis"><h3>${esc(titel)}</h3><p>${esc(text)}</p><strong>${esc(betrag)}</strong></div>`;

/** Filmstills und Website-Ansichten als seitlich scrollbare Reihe („Kontaktbogen“). */
export function bogen(label: string, eintraege: { bild: string; hoehe: number; kunde: string; art: string; href: string }[]): string {
  return `<ul class="bogen" aria-label="${esc(label)}" tabindex="0">
      ${eintraege.map((e) => `<li style="--h:${e.hoehe}px"><figure><a href="${e.href}">${e.bild}<figcaption><b>${esc(e.kunde)}</b>${esc(e.art)}</figcaption></a></figure></li>`).join('\n      ')}
    </ul>`;
}

export const still = (name: string, alt: string, w = 1280, h = 720, eager = false) =>
  `<img src="${asset(`/media/start/${name}.webp`)}" alt="${esc(alt)}" width="${w}" height="${h}"${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async">`;

/** Abschluss jeder Seite: Erstgespräch und Kontaktwege. */
export const KONTAKT = `<section class="abschnitt abschnitt--linie schluss" id="kontakt" aria-labelledby="schluss-titel">
    <div class="huelle raster">
      <p class="label sp-label">Kontakt</p>
      <div class="sp-inhalt">
        <h2 id="schluss-titel">Erstgespräch vereinbaren</h2>
        <p class="einleitung">In einem ersten Gespräch besprechen wir Ihre Ausgangslage und die möglichen nächsten Schritte.</p>
        <div class="knoepfe" style="margin-top:32px">${knopf('Termin auswählen', TERMIN)}${knopf('Projekt anfragen', ANFRAGE, 'rahmen')}</div>
        <div class="wege">
          <div><small>Telefon</small><span><a href="tel:+4956239737793">05623 9737793</a></span></div>
          <div><small>E-Mail</small><span><a href="mailto:hallo@thinkfox.de">hallo@thinkfox.de</a></span></div>
          <div><small>Anschrift</small><span>Bahnhofstraße 39a, Edertal</span></div>
        </div>
      </div>
    </div>
  </section>`;

// ------------------------------------------------------------------ Startseite

export const START_BESCHREIBUNG = 'Werbeagentur aus Nordhessen nahe Kassel: Marketing für mittelständische Unternehmen. Websites, Social Media, Film und Foto für mehr Sichtbarkeit bei Kunden und Fachkräften.';
export const START_HEROBILD = asset('/media/start/still-waldeck.webp');

const REFERENZEN = ['recruitmentfilm-dwaz-wirtschaftskanzlei', 'karriereseite-stadt-waldeck', 'video-fotoproduktion-recup-stadt-korbach', 'vitos-haina-unternehmenskommunikation'];

export async function startSeite(): Promise<string> {
  const alle = await allPosts();
  const kacheln = REFERENZEN.map((id) => alle.find((p) => p.id === id)).filter((p): p is Post => !!p && !!p.data.bild);
  const sizes = ['(min-width: 860px) 40vw, 100vw', '(min-width: 860px) 48vw, 100vw', '(min-width: 860px) 24vw, 100vw', '(min-width: 860px) 24vw, 100vw'];
  const mosaik = kacheln.map((p, i) => {
    const d = p.data as Post['data'] & { kunde?: string };
    return `<figure class="kachel k${i + 1}"><a href="/${p.id}/">${wpImg(d.bild, { size: 'full', alt: d.bildAlt ?? d.title, cls: '', sizes: sizes[i] })}<span class="kachel__kunde">${esc(d.kunde ?? categoryName(d.kategorien[0] ?? ''))}</span><span class="kachel__titel">${esc(d.title)}</span></a></figure>`;
  }).join('\n        ');

  return `<section class="t1" aria-labelledby="titel">
    <div class="huelle">
      <ul class="t1__meta" role="list"><li>Werbeagentur in Edertal, Nordhessen</li><li>Seit 2015</li></ul>
      <div class="raster">
        <h1 id="titel">Marketing, das mittel&shy;ständische Unternehmen sichtbar macht.</h1>
        <div class="t1__unten">
          <p class="t1__text">thinkfox ist Marketingpartner für mittelständische Unternehmen und Einrichtungen in Nordhessen. Wir entwickeln Websites, betreuen Social-Media-Kanäle und produzieren Film und Foto, damit Kunden und Fachkräfte auf Ihr Unternehmen aufmerksam werden.</p>
          <div class="knoepfe">${knopf('Erstgespräch vereinbaren', TERMIN)}${knopf('Referenzen ansehen', '#referenzen', 'rahmen')}</div>
        </div>
      </div>
      <figure class="t1__bild">${still('still-waldeck', 'Forstwirt der Stadt Waldeck mit Schutzhelm, Szene aus dem Recruitingfilm', 1280, 720, true)}<figcaption class="bildtext">Recruitingfilm für die Nationalparkstadt Waldeck</figcaption></figure>
    </div>
  </section>

  ${abschnitt({ id: 'lage-titel', rubrik: 'Ausgangslage', titel: 'Typische Ausgangslagen im Mittelstand',
    einleitung: 'Viele mittelständische Unternehmen leisten gute Arbeit, sind für neue Kunden und Fachkräfte aber kaum sichtbar. Drei Situationen begegnen uns besonders häufig.',
    inhalt: drei([
      ['Die Website bringt keine Anfragen', 'Sie ist veraltet, wird bei Google kaum gefunden oder spricht die Zielgruppe nicht an.'],
      ['Für Social Media fehlt die Zeit', 'Themenplanung, Produktion und regelmäßige Veröffentlichung bleiben im Tagesgeschäft liegen.'],
      ['Wettbewerber werden zuerst gefunden', 'Bei regionalen Suchanfragen erscheinen andere Anbieter vor dem eigenen Unternehmen.'],
    ]) })}

  ${abschnitt({ id: 'leistungen-titel', anker: 'leistungen', cls: 'abschnitt--linie', rubrik: 'Lösung', titel: 'Unsere Leistungen',
    einleitung: 'Jede Leistung kann einzeln beauftragt werden. Die meisten Kunden beginnen mit einem Projekt.',
    inhalt: `<ul class="zeilen" role="list">
          ${leistung('Websites und Suchmaschinen&shy;optimierung', 'Wir konzipieren, gestalten und entwickeln Unternehmenswebsites und optimieren sie für Google und KI-Suchen.', 'Interessenten finden Ihr Unternehmen bei der Suche und gelangen ohne Umwege zur Anfrage.', ['Websites und SEO', WEB])}
          ${leistung('Social Media', 'Wir planen die Themen, produzieren Beiträge und Videos, betreuen Ihre Kanäle und schalten Anzeigen.', 'Ihr Unternehmen ist bei Kunden und potenziellen Mitarbeitenden regelmäßig präsent.', ['Social Media', SOCIAL])}
          ${leistung('Film und Foto', 'Wir produzieren Imagefilme, Recruitingfilme, Fotos und 360°-Rundgänge, an Ihrem Standort oder in unserem Studio.', 'Kunden und Bewerber gewinnen einen realistischen Eindruck von Ihrem Unternehmen und Ihren Mitarbeitenden.', ['Film und Foto', CONTENT])}
          ${leistung('Marke und Print', 'Wir entwickeln Corporate Designs und gestalten Geschäftsausstattung und Printmedien.', 'Ihr Unternehmen tritt in allen Medien einheitlich und wiedererkennbar auf.')}
        </ul>` })}

  <section class="t3" aria-labelledby="wirkung-titel">
    <div class="huelle raster">
      <figure class="t3__bild sp-7">${still('still-wachenfeld', 'Bauleiter von Wachenfeld Bau auf einer Baustelle, Szene aus dem Recruitingfilm')}<figcaption class="bildtext">Recruitingfilm für Wachenfeld Bau, Korbach</figcaption></figure>
      <div class="t3__text sp-5r">
        <p class="label">Ergebnis</p>
        <h2 id="wirkung-titel" class="h2--klein">Was Sichtbarkeit bewirkt</h2>
        <div class="zwei">
          <div><h3>Kundengewinnung</h3><p>Interessenten finden Ihr Angebot, verstehen es und nehmen Kontakt auf.</p><p class="beleg">Beispiel: Über die Website des Vierbeiner Reha-Zentrums werden Seminare und Kurse gebucht.</p></div>
          <div><h3>Personalgewinnung</h3><p>Bewerberinnen und Bewerber lernen Ihr Unternehmen als Arbeitgeber kennen, bevor sie sich bewerben.</p><p class="beleg">Beispiel: Die Stellenangebote der Stadt Waldeck erscheinen in der Google-Jobsuche.</p></div>
        </div>
      </div>
    </div>
  </section>

  <section class="abschnitt" id="referenzen" aria-labelledby="referenzen-titel">
    <span id="projekte"></span>
    <div class="huelle raster">
      <p class="label sp-label">Referenzen</p>
      <div class="sp-inhalt"><h2 id="referenzen-titel">Ausgewählte Projekte</h2><p class="einleitung">Arbeiten für Unternehmen, Kliniken und Kommunen.</p></div>
      <div class="mosaik">
        ${mosaik}
      </div>
    </div>
  </section>

  <section class="t4" aria-labelledby="bogen-titel">
    <div class="huelle raster">
      <p class="label sp-label">Film und Foto</p>
      <div class="sp-inhalt"><h2 id="bogen-titel">Einblicke in unsere Filmproduktionen</h2><p class="einleitung">Standbilder aus Image- und Recruitingfilmen. Vor der Kamera stehen die Mitarbeitenden unserer Kunden.</p></div>
    </div>
    ${bogen('Filmstills, seitlich scrollbar', [
      { bild: still('still-continental', 'Mitarbeiter von Continental im Interview', 840, 720), hoehe: 340, kunde: 'Continental, Korbach', art: 'Imagefilm', href: '/imagefilm-continental-korbach-3d-druck/' },
      { bild: still('still-daniel-koch', 'Jugendliche mit Reithelm beim Pferd'), hoehe: 260, kunde: 'Daniel Koch Jugendhilfe', art: 'Recruiting-Clip', href: '/daniel-koch-jugendhilfe/' },
      { bild: still('still-wachenfeld', 'Bauleiter auf der Baustelle'), hoehe: 380, kunde: 'Wachenfeld Bau', art: 'Recruitingfilm', href: '/recruitmentfilm-wachenfeld-bau-korbach/' },
      { bild: still('still-dwaz', 'Mitarbeiterin im Büro', 1280, 540), hoehe: 300, kunde: 'DWAZ Wirtschaftskanzlei', art: 'Recruitingfilm', href: '/recruitmentfilm-dwaz-wirtschaftskanzlei/' },
      { bild: still('still-waldeck', 'Forstwirt mit Schutzhelm'), hoehe: 240, kunde: 'Stadt Waldeck', art: 'Recruitingfilm', href: '/karriereseite-stadt-waldeck/' },
    ])}
  </section>

  ${abschnitt({ id: 'branchen-titel', anker: 'branchen', cls: 'abschnitt--kalk', rubrik: 'Branchen', titel: 'Branchenerfahrung',
    einleitung: 'Wir arbeiten für mittelständische Unternehmen aller Branchen. In drei Bereichen verfügen wir über besonders viel Erfahrung.',
    inhalt: `<div class="branchen">
          <div class="branche"><h3>Gesundheit &amp; Soziales</h3><p>Patienteninformation, Karriereportale für mehrere Standorte und Gestaltung nach Corporate Design.</p><small>DRV-Kliniken · Vitos Haina · Vierbeiner Reha-Zentrum</small><a class="link" href="/branchen/gesundheit-soziales/">Marketing für Gesundheit &amp; Soziales</a></div>
          <div class="branche"><h3>Kommunen &amp; öffentliche Hand</h3><p>Karriereseiten, Kampagnen und barrierefreie Websites, mit Angeboten für die Direktvergabe.</p><small>Stadt Waldeck · Stadt Korbach · Wirtschaftsförderung</small><a class="link" href="/branchen/oeffentliche-hand/">Marketing für Kommunen</a></div>
          <div class="branche"><h3>Bau, Handwerk &amp; Industrie</h3><p>Websites, Imagefilme und Recruitingfilme für Betriebe, die Aufträge und Fachkräfte in der Region gewinnen wollen.</p><small>Wachenfeld Bau · Continental Korbach · KFZ Kling</small></div>
        </div>` })}

  ${abschnitt({ id: 'zusammen-titel', rubrik: 'Zusammenarbeit', titel: 'Formen der Zusammenarbeit',
    einleitung: 'Die meisten Kunden beginnen mit einem einzelnen Projekt. Daraus entwickelt sich häufig eine dauerhafte Betreuung.',
    inhalt: `<div class="drei">
          <div><h3>Einzelprojekt</h3><p>Ein klar abgegrenztes Vorhaben mit festem Leistungsumfang, etwa eine Website, ein Imagefilm oder eine Kampagne.</p></div>
          <div><h3>Laufende Betreuung</h3><p>Regelmäßige Leistungen in einem Bereich, zum Beispiel die Betreuung Ihrer Social-Media-Kanäle oder die Pflege Ihrer Website.</p></div>
          <div><h3>Externe Marketingabteilung</h3><p>Wir übernehmen Planung und Umsetzung Ihres gesamten Marketings. Ein fester Ansprechpartner steuert alle Maßnahmen.</p><p style="margin-top:12px"><a class="link" href="${EXTERN}">Externe Marketingabteilung</a></p></div>
        </div>
        <h3 class="unter">Preise</h3>
        <div class="preise" style="margin-top:16px">
          ${preis('OnePager', 'Kompakte Website auf einer Seite', 'ab ca. 2.200 €')}
          ${preis('Unternehmenswebsite', 'Mehrere Seiten, eigenständig pflegbar', 'ab ca. 5.500 €')}
        </div>
        <p class="fussnote">Alle Preise zzgl. MwSt. Weitere Angaben in den Ratgebern <a href="/was-kostet-eine-website/">Was kostet eine Website?</a>, <a href="/was-kostet-ein-imagefilm/">Was kostet ein Imagefilm?</a> und <a href="/social-media-betreuung-kosten/">Was kostet Social-Media-Betreuung?</a></p>` })}

  <figure class="t2">
    <div class="t2__bild">${wpImg('/wp-content/uploads/2026/01/podcast_ederseensucht_setup.jpg', { size: 'full', alt: 'Kameras und Licht beim Dreh des Podcasts Ederseensucht', cls: '', sizes: '100vw' })}</div>
    <div class="t2__insel">
      <blockquote>„Hinter thinkfox steckt ein kreatives, professionelles und verlässliches Team, mit dem wir seit vielen Jahren gerne zusammenarbeiten.“</blockquote>
      <figcaption>Liane Linke, Google-Bewertung</figcaption>
    </div>
  </figure>

  ${abschnitt({ id: 'studio-titel', anker: 'studio', rubrik: 'Studio', titel: 'Eigenes Film- und Fotostudio',
    inhalt: `<div class="neben">
          <div><p>Für Film- und Fotoproduktionen steht uns in Edertal ein eigenes Studio mit Hohlkehle zur Verfügung. Aufnahmen entstehen dort unabhängig von Wetter und Tageslicht oder an Ihrem Standort.</p><p>Auf Anfrage vermieten wir das Studio für externe Produktionen.</p><a class="link" href="${STUDIO}">Studio &amp; Vermietung</a></div>
          ${wpImg('/wp-content/uploads/2025/10/thinkfox_studio_header_12.jpg', { size: 'full', alt: 'Kamera und Leuchten vor der Hohlkehle im thinkfox Studio', cls: '', sizes: '(min-width: 860px) 40vw, 100vw' })}
        </div>` })}

  ${abschnitt({ id: 'agentur-titel', anker: 'agentur', cls: 'abschnitt--kalk', rubrik: 'Agentur', titel: 'Seit 2015 in Nordhessen',
    einleitung: 'thinkfox marketing ist eine Werbeagentur mit Sitz in Edertal. Strategie, Gestaltung, Webentwicklung und Produktion liegen im eigenen Team.',
    inhalt: '' })}

  ${KONTAKT}`;
}
