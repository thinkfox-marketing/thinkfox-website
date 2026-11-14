// Übrige Seiten im neuen Erscheinungsbild (Relaunch): Kontakt, Mietstudio, 360°-Rundgänge (Übersicht + vier Touren),
// Danke-Seiten, Rechtliches (Impressum, Datenschutz, Barrierefreiheit) und Blog-Übersicht – jeweils unter der bisherigen
// Adresse, Rahmen src/layouts/Seite.astro. Texte aus den bisherigen Seiten in die Sie-Form übertragen; Rechtstexte
// werden unverändert aus dem übernommenen Markup gelesen (prosa()).
import { allPosts, type LegacyPage, type Post } from './wp';
import { wpImg } from './media';
import { ANFRAGE, STUDIO, TERMIN } from './chrome';
import { KONTAKT, abschnitt, esc, knopf, preis } from './seiten';

const kopf = (o: { pfad: [string, string?][]; titel: string; text?: string; knoepfe?: string; bild?: string; bildtext?: string }) => `<section class="t1 t1--unterseite${o.bild ? '' : ' t1--ohne-bild'}" aria-labelledby="titel">
    <div class="huelle">
      <nav aria-label="Brotkrumen"><ol class="pfad" role="list"><li><a href="/">Start</a></li>${o.pfad.map(([t, h]) => `<li>${h ? `<a href="${h}">${esc(t)}</a>` : `<span aria-current="page">${esc(t)}</span>`}</li>`).join('')}</ol></nav>
      <div class="raster">
        <h1 id="titel">${o.titel}</h1>
        ${o.text || o.knoepfe ? `<div class="t1__unten">${o.text ? `<p class="t1__text">${esc(o.text)}</p>` : ''}${o.knoepfe ? `<div class="knoepfe">${o.knoepfe}</div>` : ''}</div>` : ''}
      </div>
      ${o.bild ? `<figure class="t1__bild">${o.bild}${o.bildtext ? `<figcaption class="bildtext">${esc(o.bildtext)}</figcaption>` : ''}</figure>` : ''}
    </div>
  </section>`;

const bild = (datei: string, alt: string, sizes = '(min-width: 960px) 75vw, 100vw', eager = false) =>
  wpImg(`/wp-content/uploads/${datei}`, { size: 'full', alt, cls: '', sizes, ...(eager ? { fetchpriority: 'high' as const } : {}) });
const liste = (punkte: string[]) => `<ul class="leistungsliste" role="list">${punkte.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>`;

// ------------------------------------------------------------------ Kontakt

const kontakt = () => `${kopf({ pfad: [['Kontakt']], titel: 'Kontakt', text: 'Sie erreichen uns telefonisch, per E-Mail oder in einem persönlichen Gespräch in Edertal.' })}
  <section class="abschnitt abschnitt--knapp" aria-label="Kontaktwege">
    <div class="huelle raster">
      <p class="label sp-label">Anschrift</p>
      <div class="sp-inhalt">
        <div class="neben">
          <div>
            <p><b>thinkfox marketing GmbH</b><br>Agentur &amp; Studio<br>Bahnhofstraße 39a<br>34549 Edertal</p>
            <p>Telefon: <a href="tel:+4956239737793">05623 9737793</a><br>E-Mail: <a href="mailto:hallo@thinkfox.de">hallo@thinkfox.de</a></p>
            <p>Für ein erstes Gespräch können Sie online einen Termin für ein 30-minütiges Beratungsgespräch auswählen.</p>
            <div class="knoepfe">${knopf('Termin auswählen', TERMIN)}${knopf('Projekt anfragen', ANFRAGE, 'rahmen')}</div>
          </div>
          <iframe class="karte" loading="lazy" src="https://maps.google.com/maps?q=thinkfox.marketing%20GmbH&amp;t=m&amp;z=16&amp;output=embed&amp;iwloc=near"></iframe>
        </div>
      </div>
    </div>
  </section>`;

// ------------------------------------------------------------------ Mietstudio

const studio = () => `${kopf({ pfad: [['Studio & Vermietung']], titel: 'Mietstudio Nordhessen – Foto- &amp; Videostudio',
    text: 'Rund 70 Quadratmeter Spielfläche mit Hohlkehle in Edertal. Sie können das Studio stunden- oder tageweise mieten, auf Wunsch mit Technik und fachlicher Unterstützung.',
    knoepfe: knopf('Studio anfragen', 'mailto:hallo@thinkfox.de?subject=Anfrage%20Mietstudio') + knopf('Preise ansehen', '#preise', 'rahmen'),
    bild: bild('2025/10/thinkfox_studio_6.jpg', 'Studiofläche mit Hohlkehle im thinkfox Studio', undefined, true), bildtext: 'Studiofläche mit Hohlkehle über Eck' })}

  ${abschnitt({ id: 'raum-titel', rubrik: 'Ausstattung', titel: 'Raum und Ausstattung',
    einleitung: 'Für Foto- und Filmaufnahmen, vom Porträt bis zum Werbespot.',
    inhalt: `<div class="zwei">
          <div><h3>Raum</h3>${liste(['ca. 70 m² Spielfläche', 'Hohlkehle über Eck, ca. 6,50 m × 4 m, Höhe ca. 3,40 m', 'Besprechungstisch (verschiebbar)', 'Arbeitsplatz mit Bildschirm und Schminktisch', 'Küchenbereich mit Kühlschrank und Mikrowelle', 'Internet ca. 50 Mbit/s (Download), ca. 8 Mbit/s (Upload)', '4 kostenlose Parkplätze vor der Tür'])}</div>
          <div><h3>Technik zur Miete</h3>${liste(['2 Studioblitze und 2 Aufsteckblitze (Godox)', 'Auslösesystem Godox für Canon und Sony', 'Verschiedene Lichtaufbauten und Lichtformer', 'Kameras: 2 × Canon C70, EOS R6, EOS R, Canon C200', 'Objektive von Canon und Sigma', 'Tontechnik (Tentacle, Rode u. a.)', 'Weitere Technik auf Anfrage'])}</div>
        </div>` })}

  <section class="t3" aria-labelledby="preise-titel" id="preise">
    <div class="huelle raster">
      <figure class="t3__bild sp-7">${bild('2025/10/thinkfox_studio_3.jpg', 'Besprechungsbereich im thinkfox Studio', '(min-width: 960px) 58vw, 100vw')}<figcaption class="bildtext">Besprechungs- und Arbeitsbereich</figcaption></figure>
      <div class="t3__text sp-5r">
        <p class="label">Preise</p>
        <h2 id="preise-titel" class="h2--klein">Mietpreise</h2>
        <div class="preise" style="margin-top:32px">
          ${preis('Pro Stunde', '', '45 €')}
          ${preis('Halber Tag', '4 Stunden', '160 €')}
          ${preis('Ganzer Tag', '8 Stunden', '280 €')}
        </div>
        <p class="fussnote">Alle Preise zzgl. MwSt. Im Preis enthalten: Getränke (Wasser und Kaffee), Internet und Arbeitsplatz, Schminktisch, Endreinigung, Strom und Heizung, Parkplätze. Technik ist gegen Aufpreis mietbar.</p>
      </div>
    </div>
  </section>

  ${abschnitt({ id: 'buchung-titel', rubrik: 'Buchung', titel: 'Buchung und Unterstützung',
    inhalt: `<div class="drei">
          <div><h3>Zeiten</h3><p>Werktags von 9 bis 18 Uhr, außerhalb dieser Zeiten nach Absprache.</p></div>
          <div><h3>Anfrage</h3><p>Per E-Mail an <a href="mailto:hallo@thinkfox.de">hallo@thinkfox.de</a> oder telefonisch unter <a href="tel:+4956239737793">05623 9737793</a>.</p></div>
          <div><h3>Unterstützung</h3><p>Auf Wunsch steht Ihnen gegen Aufpreis ein Fotograf oder Kameramann zur Seite.</p></div>
        </div>` })}

  ${KONTAKT}`;

// ------------------------------------------------------------------ 360°-Rundgänge

interface Tour { slug: string; titel: string; kurz: string; text: string; kuula: string; bild: string; alt: string }
const TOUREN: Tour[] = [
  { slug: 'altstadtblick-1', titel: 'Beysshaus – Ferienhaus Altstadtblick 1, Bad Wildungen', kurz: 'Ferienhaus Altstadtblick 1',
    text: 'Mit diesem virtuellen 360-Grad-Rundgang lässt sich das Ferienhaus Altstadtblick 1 von Beysshaus in Bad Wildungen vorab besichtigen. Besucher bewegen sich frei durch die Räume und sehen, wie die Unterkunft wirkt, bevor sie buchen.',
    kuula: 'https://kuula.co/share/collection/7J21c?logo=1&info=0&logosize=99&fs=1&vr=0&sd=1&initload=0&thumbs=4&inst=0', bild: '2023/09/altstadtblick.jpg', alt: 'Ferienhaus Altstadtblick 1 in Bad Wildungen' },
  { slug: 'cine-k-korbach', titel: 'Korbach – Cine K – das Kino in der Hansestadt', kurz: 'Cine K in Korbach',
    text: 'Das Cine K ist das Kino in der Hansestadt Korbach, mit Kino und Bowling-Bahnen unter einem Dach. Im virtuellen Rundgang können sich Besucher schon vor ihrem Besuch umsehen.',
    kuula: 'https://kuula.co/share/collection/7J2xV?logo=1&info=0&logosize=99&fs=1&vr=0&sd=1&initload=0&thumbs=4&inst=0', bild: '2023/09/cine-k.jpg', alt: 'Cine K in Korbach' },
  { slug: 'auszeithaus-2', titel: 'Beysshaus – Auszeithaus Edertal, Kleinern', kurz: 'Ferienhaus „Auszeit“',
    text: 'Das Auszeithaus von Beysshaus ist ein modernes Ferienhaus in Kleinern im Edertal. Der 360-Grad-Rundgang zeigt das Haus so, wie Gäste es beim Ankommen erleben: Raum für Raum, auf dem Handy wie am Rechner.',
    kuula: 'https://kuula.co/share/collection/7JwRF?logo=1&info=0&logosize=99&fs=1&vr=0&sd=1&initload=0&thumbs=4&inst=0', bild: '2023/09/auszeithaus.jpg', alt: 'Ferienhaus Auszeithaus in Edertal-Kleinern' },
  { slug: 'altstadtblick-2', titel: 'Beysshaus – Ferienhaus Altstadtblick 2, Bad Wildungen', kurz: 'Ferienhaus Altstadtblick 2',
    text: 'Das Ferienhaus Altstadtblick 2 von Beysshaus liegt mitten in Bad Wildungen. Im Rundgang gehen Besucher von Raum zu Raum und erhalten einen realistischen Eindruck der Unterkunft.',
    kuula: 'https://kuula.co/share/collection/7J2Dn?logo=1&info=0&logosize=99&fs=1&vr=0&sd=1&initload=0&thumbs=4&inst=0', bild: '2023/09/altstadtblick2.jpg', alt: 'Ferienhaus Altstadtblick 2 in Bad Wildungen' },
];
const RUNDGAENGE = '/360-grad-rundgaenge/';

const rundgaenge = () => `${kopf({ pfad: [['360°-Rundgänge']], titel: '360-Grad-Rundgänge für Unternehmen und Objekte',
    text: 'Mit einem virtuellen Rundgang zeigen Sie Räume so, wie sie wirken: online, jederzeit und von überall. Wir übernehmen Beratung, Aufnahmen, Erstellung und Hosting.',
    knoepfe: knopf('Rundgang anfragen', 'mailto:hallo@thinkfox.de?subject=Anfrage%20360-Grad-Rundgang') + knopf('Preise ansehen', '#preise', 'rahmen') })}

  <section class="abschnitt abschnitt--knapp" aria-labelledby="beispiele-titel">
    <div class="huelle raster">
      <p class="label sp-label">Beispiele</p>
      <div class="sp-inhalt"><h2 id="beispiele-titel">Virtuelle Rundgänge aus der Region</h2></div>
      <div class="galerie galerie--vier">
        ${TOUREN.map((t) => `<figure class="kachel"><a href="${RUNDGAENGE}${t.slug}/">${bild(t.bild, t.alt, '(min-width: 1024px) 24vw, (min-width: 640px) 48vw, 100vw')}<span class="kachel__kunde">360°-Rundgang</span><span class="kachel__titel">${esc(t.kurz)}</span></a></figure>`).join('\n        ')}
      </div>
    </div>
  </section>

  ${abschnitt({ id: 'nutzen-titel', cls: 'abschnitt--kalk', rubrik: 'Ergebnis', titel: 'Was ein Rundgang bewirkt',
    inhalt: `<div class="drei">
          <div><h3>Weniger Vor-Ort-Termine</h3><p>Interessenten sehen sich die Räume online an, bevor sie anfragen.</p></div>
          <div><h3>Bessere Anfragen</h3><p>Wer anfragt, kennt das Objekt bereits und weiß, was ihn erwartet.</p></div>
          <div><h3>Rund um die Uhr verfügbar</h3><p>Der Rundgang läuft auf Computer, Smartphone und Tablet.</p></div>
        </div>
        <h3 class="unter">Geeignet für</h3>
        ${liste(['Hotels und Ferienwohnungen', 'Cafés, Bars und Restaurants', 'Museen und Kultureinrichtungen', 'Eventlocations und Galerien', 'Autohäuser', 'Immobilienmakler', 'Verkaufs- und Büroräume', 'Produktionsräume', 'Bau- und Hausanbieter'])}` })}

  ${abschnitt({ id: 'preise-titel', anker: 'preise', rubrik: 'Preise', titel: 'Pakete und Preise',
    inhalt: `<div class="preise">
          ${preis('Paket S', 'bis ca. 80 m², 5–7 Panoramen, Hosting für 3 Monate – z. B. Ferienwohnung, Boutique', '399 €')}
          ${preis('Paket L', 'bis ca. 150 m², 8–15 Panoramen, Hosting für 6 Monate – z. B. Restaurant, Ladenlokal, Büro, kleines Hotel', '599 €')}
          ${preis('Paket XL', 'bis ca. 300 m², 16–25 Panoramen, Hosting für 9 Monate – z. B. Autohaus, Fitness-Studio, größeres Hotel', '999 €')}
        </div>
        <p class="fussnote">In allen Paketen enthalten: Beratung und Planung, Erstellung des Rundgangs, Backup, Darstellung auf Computer, Smartphone und Tablet, keine Anfahrtskosten bis 30 km. Hosting nach Ablauf der Inklusivzeit: 5 € je Monat.</p>` })}

  ${KONTAKT}`;

const tour = (t: Tour) => `${kopf({ pfad: [['360°-Rundgänge', RUNDGAENGE], [t.kurz]], titel: esc(t.titel), text: t.text })}
  <section class="abschnitt abschnitt--knapp" aria-label="360°-Rundgang">
    <div class="huelle">
      <iframe class="rundgang" allow="xr-spatial-tracking; gyroscope; accelerometer" allowfullscreen scrolling="no" data-tf-bild="/wp-content/uploads/${t.bild}" src="${t.kuula.replace(/&/g, '&amp;')}"></iframe>
      <p class="mehr"><a class="link" href="${RUNDGAENGE}">Mehr zu 360°-Rundgängen</a></p>
    </div>
  </section>

  ${KONTAKT}`;

// ------------------------------------------------------------------ Danke-Seiten

const danke = (thema: string) => `${kopf({ pfad: [['Vielen Dank']], titel: 'Vielen Dank für Ihre Anfrage',
    text: `Wir bearbeiten Ihre Anfrage${thema ? ` zum Thema ${thema}` : ''} und melden uns umgehend bei Ihnen. Bei Rückfragen erreichen Sie uns telefonisch oder per E-Mail.`,
    knoepfe: knopf('Zur Startseite', '/') + knopf('Referenzen ansehen', '/referenzen/', 'rahmen') })}
  <section class="abschnitt abschnitt--knapp" aria-label="Kontakt">
    <div class="huelle raster">
      <p class="label sp-label">Kontakt</p>
      <div class="sp-inhalt text"><p>thinkfox marketing GmbH<br>Bahnhofstraße 39a, 34549 Edertal</p><p>Telefon: <a href="tel:+4956239737793">05623 9737793</a><br>E-Mail: <a href="mailto:hallo@thinkfox.de">hallo@thinkfox.de</a></p></div>
    </div>
  </section>`;

// ------------------------------------------------------------------ Rechtliches (Text unverändert)

/** Überschriften, Absätze, Listen und Tabellen aus dem übernommenen Elementor-Markup, in Reihenfolge und ohne Hüllen. */
export function prosa(main: string): { titel: string; html: string } {
  const ohne = main.replace(/<(script|style|svg|form|iframe)\b[\s\S]*?<\/\1>/g, '');
  const teile: string[] = [];
  let titel = '';
  const re = /<(h[1-6]|p|ul|ol|table)\b[^>]*>([\s\S]*?)<\/\1>/g;
  for (let m = re.exec(ohne); m; m = re.exec(ohne)) {
    const tag = m[1];
    // innen nur Textauszeichnung, Links, Listenpunkte und Tabellenzellen behalten; Klassen/Stile entfernen
    const innen = m[2]
      .replace(/<(?!\/?(?:a|strong|b|em|i|br|li|ul|ol|tr|td|th|thead|tbody|span)\b)[^>]+>/g, '')
      .replace(/<span\b[^>]*>|<\/span>/g, '')
      .replace(/\s(?:class|style|id|data-[a-z-]+|role|aria-level)="[^"]*"/g, '')
      .trim();
    if (!innen.replace(/<[^>]+>|&nbsp;/g, '').trim()) continue;
    if (tag === 'h1' && !titel) { titel = innen.replace(/<[^>]+>/g, ''); continue; }
    const t = tag === 'h1' ? 'h2' : tag;
    teile.push(`<${t}>${innen}</${t}>`);
  }
  return { titel, html: teile.join('\n') };
}

const recht = (page: LegacyPage, name: string) => {
  const p = prosa(page.main);
  return `${kopf({ pfad: [[name]], titel: p.titel || esc(name) })}
  <section class="abschnitt abschnitt--knapp" aria-label="${esc(name)}">
    <div class="huelle raster">
      <div class="sp-inhalt prosa">${p.html}</div>
    </div>
  </section>`;
};

// ------------------------------------------------------------------ Blog-Übersicht

const MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
export const beitragKachel = (p: Post) => {
  const d = new Date(p.data.date as unknown as string);
  return `<figure class="kachel"><a href="/${p.id}/">${wpImg(p.data.bild, { size: 'full', alt: p.data.bildAlt ?? p.data.title, cls: '', sizes: '(min-width: 1024px) 32vw, (min-width: 640px) 48vw, 100vw' })}<span class="kachel__kunde">${MONATE[d.getMonth()]} ${d.getFullYear()}</span><span class="kachel__titel">${esc(p.data.title)}</span></a></figure>`;
};

const blog = async () => {
  const posts = (await allPosts()).filter((p) => p.collection === 'blog' && p.data.bild);
  return `${kopf({ pfad: [['Ratgeber']], titel: 'Ratgeber', text: 'Beiträge zu Kosten, Vorgehen und Hintergründen rund um Websites, Social Media, Film und Foto.' })}
  <section class="abschnitt abschnitt--knapp" aria-label="Alle Beiträge">
    <div class="huelle"><div class="galerie">${posts.map(beitragKachel).join('\n      ')}</div></div>
  </section>

  ${KONTAKT}`;
};

// ------------------------------------------------------------------ Zuordnung Adresse → Seite

export const SONDERSEITEN: Record<string, (page: LegacyPage) => string | Promise<string>> = {
  '/kontakt/': kontakt,
  [STUDIO]: studio,
  [RUNDGAENGE]: rundgaenge,
  ...Object.fromEntries(TOUREN.map((t) => [`${RUNDGAENGE}${t.slug}/`, () => tour(t)])),
  '/danke_projektanfrage/': () => danke('Projektanfrage'),
  '/danke_websites/': () => danke('Website'),
  '/danke_social-media/': () => danke('Social Media'),
  '/danke_content-produktion/': () => danke('Film und Foto'),
  '/impressum/': (p) => recht(p, 'Impressum'),
  '/datenschutz/': (p) => recht(p, 'Datenschutz'),
  '/barrierefreiheitserklaerung/': (p) => recht(p, 'Barrierefreiheit'),
  '/blog/': blog,
};
