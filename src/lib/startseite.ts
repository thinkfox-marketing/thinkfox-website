// Startseite (Relaunch, Entscheidung 14.11.2026): eigene Seite statt Elementor-Markup, Gestaltung über Typografie
// (public/css/startseite.css, ergänzt beitrag.css + branchen.css). Positionierung breit (externe Marketingabteilung
// aus Nordhessen), Schwerpunkt-Branchen als zweite Ebene. Tonalität: CLAUDE.md → Regeln → Tonalität.
// Inhalte nur aus belegten Projektfakten; Kunden ohne Freigabe werden nicht namentlich genannt.
import { allPosts, categoryName, type Post } from './wp';
import { wpImg } from './media';
import { esc, faqHtml, knopf, projektKarten } from './beitrag';
import { videoHintergrund } from './hero-video';
import legacyStart from '../legacy/pages/index.json';

const TERMIN = 'https://crm.thinkfox.marketing/termin.php';
const ANFRAGE = '/thinkfox-marketing-projekt-anfragen/';
const EXTERN = '/deine-externe-marketingabteilung-ganzheitliches-marketing-fuer-den-mittelstand/';
const WEB = '/professionelle-websites-fuer-den-mittelstand/';
const CONTENT = '/professionelle-content-produktion-video-foto-social-media-aus-nordhessen/';
const SOCIAL = '/mehr-aufmerksamkeit-und-reichweite-mit-social-media/';
const EB = '/employer-branding-agentur-recruitingfilm-karriereseite/';
const STUDIO = '/thinkfox-mietstudio-dein-fotostudio-videostudio-nordhessen/';

interface Link { text: string; href: string }
interface Block { titel: string; text: string; links: Link[] }

const KOPF = {
  marke: 'Werbeagentur aus Edertal, Nordhessen',
  titel: 'Ihre externe Marketing­abteilung aus Nordhessen',
  teaser: 'Für Unternehmen, Kliniken, soziale Träger und Kommunen, die bei Kunden, Patienten, Bürgern und Bewerbern Vertrauen gewinnen müssen. Wir übernehmen Strategie, Website und Social Media; Film und Foto produzieren wir selbst.',
};

const ANLIEGEN: { titel: string; einleitung: string; bloecke: Block[] } = {
  titel: 'Wobei wir Sie unterstützen',
  einleitung: 'Unsere Leistungen sind nach den Anliegen gegliedert, mit denen Organisationen zu uns kommen. Je nach Ausgangslage übernehmen wir ein einzelnes Projekt oder die laufende Betreuung.',
  bloecke: [
    {
      titel: 'Fachkräfte gewinnen',
      text: 'Karriereseiten mit Anbindung an Google Jobs, Recruitingfilme und 360°-Rundgänge durch Ihre Arbeitsplätze. Umgesetzt unter anderem für die Stadt Waldeck, die DWAZ Wirtschaftskanzlei und Wachenfeld Bau.',
      links: [{ text: 'Employer Branding & Recruiting', href: EB }],
    },
    {
      titel: 'Sichtbar werden und Kunden gewinnen',
      text: 'Websites, die bei Google und in KI-Suchen gefunden werden, und Social-Media-Betreuung mit Redaktionsplan, Produktion und Anzeigen. OnePager ab ca. 2.200 €, umfangreichere Websites ab ca. 5.500 € zzgl. MwSt.',
      links: [{ text: 'Websites, SEO & KI-Sichtbarkeit', href: WEB }, { text: 'Social Media & Kampagnen', href: SOCIAL }],
    },
    {
      titel: 'Marke und Vertrauen stärken',
      text: 'Corporate Design, Imagefilme, Fotos von Mitarbeitenden und Räumen sowie Printmedien. Gedreht und fotografiert wird in Ihrem Haus oder in unserem Studio in Edertal.',
      links: [{ text: 'Film, Foto & Content', href: CONTENT }],
    },
    {
      titel: 'Marketing auslagern',
      text: 'Ein fester Ansprechpartner plant und steuert Ihr Marketing und setzt es mit unserem Team um. Auf diese Weise arbeiten wir dauerhaft unter anderem für Vitos Haina und eine Klinikgruppe in der Region.',
      links: [{ text: 'Externe Marketingabteilung', href: EXTERN }],
    },
  ],
};

const ZIELGRUPPEN: { titel: string; einleitung: string; bloecke: Block[] } = {
  titel: 'Für wen wir arbeiten',
  einleitung: 'Für Kliniken, soziale Träger und Kommunen gelten besondere Anforderungen an die Kommunikation: Sie muss verständlich, barrierefrei und vergabefähig sein. Für diese beiden Bereiche finden Sie eigene Seiten mit Referenzen.',
  bloecke: [
    {
      titel: 'Gesundheit & Soziales',
      text: 'Kliniken, Reha-Zentren und soziale Träger: Patienteninformation, Karriereportale für mehrere Standorte und Gestaltung nach Corporate Design, etwa für die Kliniken der Deutschen Rentenversicherung, Vitos Haina und das Vierbeiner Reha-Zentrum.',
      links: [{ text: 'Marketing für Gesundheit & Soziales', href: '/branchen/gesundheit-soziales/' }],
    },
    {
      titel: 'Kommunen & öffentliche Hand',
      text: 'Städte, Gemeinden und kommunale Unternehmen: Karriereseiten, Kampagnen und barrierefreie Websites, mit Angeboten für die Direktvergabe. Referenzen sind unter anderem die Stadt Waldeck, die Stadt Korbach und die Wirtschaftsförderung Waldeck-Frankenberg.',
      links: [{ text: 'Marketing für Kommunen & öffentliche Hand', href: '/branchen/oeffentliche-hand/' }],
    },
    {
      titel: 'Mittelstand',
      text: 'Industrie, Handwerk, Kanzleien und Dienstleister: Recruiting, Imagefilm und Website-Relaunch, etwa für Continental in Korbach, die DWAZ Wirtschaftskanzlei und Wachenfeld Bau.',
      links: [{ text: 'Externe Marketingabteilung für den Mittelstand', href: EXTERN }],
    },
  ],
};

/** Großes Statement unter dem Kopf (Kernaussage der Positionierung, Hervorhebung in Lila). */
const STATEMENT = 'Wir planen, gestalten und produzieren Kommunikation für Organisationen, die <span>Vertrauen gewinnen</span> müssen.';

const PRODUKTION = {
  titel: 'Film und Foto entstehen bei uns im Haus.',
  text: 'Imagefilme, Recruitingfilme, Social-Media-Clips, Fotos von Mitarbeitenden und Räumen sowie 360°-Rundgänge: gedreht in unserem Studio in Edertal oder bei Ihnen vor Ort.',
};

const REFERENZEN = [
  'karriereseiten-relaunch-fuer-deutsche-rentenversicherung-kliniken',
  'karriereseite-stadt-waldeck',
  'vitos-haina-unternehmenskommunikation',
  'imagefilm-continental-korbach-3d-druck',
  'kampagne-ewf-ein-leben-lang',
  'korbach-becher-machen',
  'website-re-design-fuer-wachenfeld-bau',
  'website-relaunch-fuer-kkd-gmbh-essen',
];

const UEBER = {
  titel: 'Über thinkfox',
  text: 'thinkfox marketing ist eine Werbeagentur mit Sitz in Edertal. Seit 2015 betreuen wir Unternehmen und öffentliche Auftraggeber aus Nordhessen und ganz Deutschland. Strategie, Gestaltung, Webentwicklung und Produktion liegen bei uns im Haus.',
  fakten: [
    { wert: 'Seit 2015', text: 'Werbeagentur mit Sitz in Edertal' },
    { wert: 'Eigenes Studio', text: 'für Film- und Fotoproduktion in Edertal' },
    { wert: 'Ein Ansprech\u00adpartner', text: 'für Strategie, Gestaltung und Produktion' },
    { wert: 'WCAG 2.2 AA', text: 'Barrierefreiheit unserer Website, bei jeder Änderung automatisch geprüft' },
  ],
  studio: { text: 'Unser Studio vermieten wir auch für eigene Produktionen', href: STUDIO },
};

const EINSTIEG = {
  titel: 'Der Einstieg in die Zusammenarbeit',
  text: 'Am Anfang steht ein Gespräch über Ihre Ausgangslage. Darauf aufbauend schlagen wir ein klar abgegrenztes erstes Projekt vor. Viele unserer Kunden betreuen wir anschließend dauerhaft.',
  bloecke: [
    { titel: 'Recruiting-Paket', text: 'Karriereseite mit Anbindung an Google Jobs, kurze Videos aus Ihren Arbeitsbereichen und ein 360°-Rundgang durch die Arbeitsplätze.', links: [{ text: 'Mehr zu Employer Branding', href: EB }] },
    { titel: 'Imagefilm', text: 'Ein Film mit Ihren Mitarbeitenden, gedreht bei Ihnen vor Ort oder in unserem Studio, mit Fassungen für Website und Social Media.', links: [{ text: 'Was kostet ein Imagefilm?', href: '/was-kostet-ein-imagefilm/' }] },
    { titel: 'Website-Relaunch', text: 'Eine Website, auf der Ihre Zielgruppen schnell finden, was sie suchen. OnePager ab ca. 2.200 €, umfangreichere Websites ab ca. 5.500 € zzgl. MwSt.', links: [{ text: 'Was kostet eine Website?', href: '/was-kostet-eine-website/' }] },
  ] as Block[],
};

const FRAGEN = [
  { frage: 'Was bedeutet „externe Marketingabteilung“ konkret?', antwort: `<p>Sie erhalten einen festen Ansprechpartner, der Ihr Marketing plant und steuert: Strategie, Website, Social Media, Gestaltung sowie Film und Foto. Umgesetzt wird mit unserem Team. Der Umfang richtet sich nach Ihrem Bedarf, von einzelnen Projekten bis zur laufenden Betreuung. <a href="${EXTERN}">Mehr zur externen Marketingabteilung</a></p>` },
  { frage: 'Für welche Unternehmen und Einrichtungen arbeiten Sie?', antwort: '<p>Für mittelständische Unternehmen, Kliniken, Reha-Zentren, soziale Träger, Kommunen und kommunale Unternehmen, aus Nordhessen und darüber hinaus, etwa für die KKD GmbH in Essen.</p>' },
  { frage: 'Produzieren Sie Film und Foto selbst?', antwort: '<p>Ja. Wir drehen und fotografieren selbst, entweder bei Ihnen vor Ort oder in unserem eigenen Film- und Fotostudio in Edertal.</p>' },
  { frage: 'Was kostet eine Website oder ein Imagefilm?', antwort: '<p>Ein OnePager beginnt bei rund 2.200 €, eine umfangreichere Unternehmenswebsite bei rund 5.500 €, jeweils zzgl. MwSt. Wovon die Kosten abhängen, erläutern wir in unseren Ratgebern <a href="/was-kostet-eine-website/">Was kostet eine Website?</a> und <a href="/was-kostet-ein-imagefilm/">Was kostet ein Imagefilm?</a></p>' },
  { frage: 'Wie beginnt die Zusammenarbeit?', antwort: `<p>Mit einem Erstgespräch über Ihre Ausgangslage. Anschließend erhalten Sie einen Vorschlag für ein klar abgegrenztes erstes Projekt mit Leistungsumfang und Kosten. <a href="${TERMIN}">Erstgespräch vereinbaren</a></p>` },
];

const RATGEBER = ['was-kostet-eine-website', 'was-kostet-ein-imagefilm', 'employer-branding-agentur-recruitingfilm-karriereseite'];

/** Neue Meta-Beschreibung; <title> bleibt (rankt für „Werbeagentur Nordhessen/Kassel“). */
export const BESCHREIBUNG = 'Werbeagentur aus Nordhessen nahe Kassel: externe Marketingabteilung für Mittelstand, Gesundheitswesen und Kommunen. Websites, Social Media, Film und Foto.';

// --- Gestaltung nach dem Muster großer Produktseiten (Entscheidung 14.11.2026): große Typografie, Bilder über die volle
// Breite, Highlight-Leiste, Bento-Kacheln mit großen Rundungen, Buttons mit 10 px Ecken, dezente Einblendungen.

/** Bilder der Bento-Kacheln (Anliegen) – eigene Produktionen bzw. Projektbilder. */
const ANLIEGEN_BILDER: Record<string, { bild: string; alt: string }> = {
  'Fachkräfte gewinnen': { bild: '/wp-content/uploads/2025/10/DWAZ_Wirtschaftskanzlei_recruitmentfilm.jpg', alt: 'Szene aus dem Recruitingfilm für die DWAZ Wirtschaftskanzlei' },
  'Sichtbar werden und Kunden gewinnen': { bild: '/wp-content/uploads/2025/02/Website-vierbeiner-reha-zentrum-bad-wildungen.jpg', alt: 'Website des Vierbeiner Reha-Zentrums auf verschiedenen Geräten' },
  'Marke und Vertrauen stärken': { bild: '/wp-content/uploads/2022/05/Daniel_Koch_Branding.jpg', alt: 'Erscheinungsbild der Daniel Koch Jugendhilfe auf Website und Ausweis' },
  'Marketing auslagern': { bild: '/wp-content/uploads/2026/01/thinkfox_studio_header_03.jpg', alt: 'Beratungsgespräch bei thinkfox' },
};
const PRODUKTION_BILD = { bild: '/wp-content/uploads/2025/10/thinkfox_studio_header_12.jpg', alt: 'Kamera und Leuchten im thinkfox Studio in Edertal' };

const PFEIL_KLEIN = '<span aria-hidden="true">&nbsp;›</span>';
const mehr = (l: Link) => `<a class="tf-s-link" href="${esc(l.href)}">${esc(l.text)}${PFEIL_KLEIN}</a>`;
/** Abschnittskopf: Dachzeile, große Überschrift, optional Einleitung */
const kopf = (dach: string, id: string, titel: string, text = '') => `<header class="tf-s-kopf tf-s-ein">
        <p class="tf-s-dach">${esc(dach)}</p>
        <h2 id="${id}" class="tf-s-titel">${esc(titel)}</h2>
        ${text ? `<p class="tf-s-einleitung">${esc(text)}</p>` : ''}
      </header>`;

function bento(): string {
  return ANLIEGEN.bloecke.map((b, i) => {
    const bild = ANLIEGEN_BILDER[b.titel];
    return `<li class="tf-bento__kachel tf-bento__kachel--${i + 1} tf-s-ein">
          <div class="tf-bento__text">
            <h3 class="tf-bento__titel">${esc(b.titel)}</h3>
            <p>${esc(b.text)}</p>
            <p class="tf-bento__links">${b.links.map(mehr).join(' ')}</p>
          </div>
          ${bild ? `<div class="tf-bento__bild">${wpImg(bild.bild, { size: 'full', alt: bild.alt, cls: '', sizes: '(min-width: 1024px) 40vw, 90vw' })}</div>` : ''}
        </li>`;
  }).join('\n        ');
}

function highlights(projekte: Post[]): string {
  return `<section id="projekte" class="tf-s tf-s--hell tf-highlights" aria-labelledby="tf-referenzen-titel">
    <div class="tf-huelle">
      ${kopf('Referenzen', 'tf-referenzen-titel', 'Projekte für Kliniken, Kommunen und Mittelstand')}
    </div>
    <div class="tf-leiste" data-tf-leiste>
      <ul class="tf-leiste__band" role="list" tabindex="0" aria-label="Referenzen, seitlich wischen oder mit den Pfeiltasten blättern">
        ${projekte.map((x) => {
          const d = x.data as Post['data'] & { kunde?: string };
          return `<li class="tf-leiste__eintrag">
          <a class="tf-leiste__link" href="/${x.id}/">
            <span class="tf-leiste__bild" aria-hidden="true">${wpImg(d.bild, { size: 'full', alt: d.title, cls: '', sizes: '(min-width: 1024px) 760px, 82vw' })}</span>
            <span class="tf-leiste__kunde">${esc(d.kunde ?? categoryName(d.kategorien[0] ?? ''))}</span>
            <span class="tf-leiste__titel">${esc(d.title)}</span>
          </a>
        </li>`;
        }).join('\n        ')}
      </ul>
      <div class="tf-leiste__steuerung tf-huelle" hidden>
        <button type="button" class="tf-leiste__knopf" data-richtung="-1" aria-label="Vorherige Referenz"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
        <button type="button" class="tf-leiste__knopf" data-richtung="1" aria-label="Nächste Referenz"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="m6 3 5 5-5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
      </div>
    </div>
  </section>`;
}

/** Google-Bewertungen: vorgerendertes Trustindex-Markup aus der bisherigen Startseite (statisch, src/lib/bewertungen.ts). */
function bewertungen(): string {
  const m = (legacyStart as { main: string }).main;
  const a = m.indexOf('<pre class="ti-widget">');
  if (a < 0) return '';
  const e = m.indexOf('</pre>', a) + '</pre>'.length;
  return `<section class="tf-s tf-s--hell tf-start__bewertungen" aria-labelledby="tf-bewertungen-titel">
    <div class="tf-huelle">
      ${kopf('Kundenstimmen', 'tf-bewertungen-titel', 'Bewertungen unserer Kunden', 'Was Kundinnen und Kunden in ihren Google-Rezensionen über die Zusammenarbeit mit uns schreiben.')}
      ${m.slice(a, e)}
    </div>
  </section>`;
}

/** Stylesheet des Bewertungs-Widgets (stand auf der bisherigen Startseite in den Seiten-Stilen). */
export const BEWERTUNGEN_CSS = (legacyStart as { styles: { href?: string; id?: string | null; type: 'link' | 'style' }[] }).styles
  .filter((s) => /trustindex/.test(s.href ?? ''));

export async function startSeite(): Promise<string> {
  const alle = await allPosts();
  const nach = (ids: string[]) => ids.map((id) => alle.find((p) => p.id === id)).filter((p): p is Post => !!p && !!p.data.bild);
  const video = videoHintergrund();
  return `<div class="tf-beitrag tf-start2">
  <header class="tf-start-kopf" ${video.attribute}>
    ${video.html}
    <div class="tf-huelle tf-start-kopf__inhalt">
      <p class="tf-start-kopf__marke">${esc(KOPF.marke)}</p>
      <h1 class="tf-start-kopf__titel">${KOPF.titel.replace('\u00ad', '&shy;')}</h1>
      <p class="tf-start-kopf__teaser">${esc(KOPF.teaser)}</p>
      <p class="tf-start-kopf__knoepfe">${knopf('Erstgespräch vereinbaren', TERMIN)} ${knopf('Projekt anfragen', ANFRAGE, 'rahmen')}</p>
    </div>
  </header>

  <section class="tf-s tf-statement" aria-labelledby="tf-statement-titel">
    <div class="tf-huelle">
      <h2 id="tf-statement-titel" class="tf-statement__text tf-s-ein">${STATEMENT}</h2>
    </div>
  </section>

  ${highlights(nach(REFERENZEN))}

  <section class="tf-s tf-anliegen" aria-labelledby="tf-anliegen-titel">
    <div class="tf-huelle">
      ${kopf('Leistungen', 'tf-anliegen-titel', ANLIEGEN.titel, ANLIEGEN.einleitung)}
      <ul class="tf-bento" role="list">
        ${bento()}
      </ul>
    </div>
  </section>

  <section class="tf-s tf-s--dunkel tf-produktion" aria-labelledby="tf-produktion-titel">
    <div class="tf-huelle">
      ${kopf('Film & Foto', 'tf-produktion-titel', PRODUKTION.titel, PRODUKTION.text)}
      <figure class="tf-produktion__bild tf-s-ein">${wpImg(PRODUKTION_BILD.bild, { size: 'full', alt: PRODUKTION_BILD.alt, cls: '', sizes: '(min-width: 1280px) 1180px, 94vw' })}</figure>
      <dl class="tf-kennzahlen">
        ${UEBER.fakten.map((f) => `<div class="tf-s-ein"><dt>${esc(f.wert)}</dt><dd>${esc(f.text)}</dd></div>`).join('\n        ')}
      </dl>
      <p class="tf-produktion__links">${mehr({ text: 'Film, Foto & Content', href: CONTENT })} ${mehr({ text: UEBER.studio.text, href: UEBER.studio.href })}</p>
    </div>
  </section>

  <section class="tf-s tf-zielgruppen" aria-labelledby="tf-zielgruppen-titel">
    <div class="tf-huelle">
      ${kopf('Branchen', 'tf-zielgruppen-titel', ZIELGRUPPEN.titel, ZIELGRUPPEN.einleitung)}
      <ul class="tf-zielgruppen__raster" role="list">
        ${ZIELGRUPPEN.bloecke.map((b, i) => `<li class="tf-zielgruppe tf-zielgruppe--${i + 1} tf-s-ein">
          <h3 class="tf-zielgruppe__titel">${esc(b.titel)}</h3>
          <p>${esc(b.text)}</p>
          <p class="tf-zielgruppe__link">${b.links.map(mehr).join(' ')}</p>
        </li>`).join('\n        ')}
      </ul>
    </div>
  </section>

  ${bewertungen()}

  <section class="tf-s tf-einstiege2" aria-labelledby="tf-einstieg-titel">
    <div class="tf-huelle">
      ${kopf('Einstieg', 'tf-einstieg-titel', EINSTIEG.titel, EINSTIEG.text)}
      <ul class="tf-vergleich" role="list">
        ${EINSTIEG.bloecke.map((b) => `<li class="tf-vergleich__spalte tf-s-ein">
          <h3 class="tf-vergleich__titel">${esc(b.titel)}</h3>
          <p>${esc(b.text)}</p>
          <p class="tf-vergleich__link">${b.links.map(mehr).join(' ')}</p>
        </li>`).join('\n        ')}
      </ul>
    </div>
  </section>

  <section class="tf-s tf-s--hell tf-fragen" aria-label="Häufige Fragen">
    <div class="tf-huelle tf-huelle--text">
      ${faqHtml('Häufige Fragen', FRAGEN)}
    </div>
  </section>

  ${projektKarten(nach(RATGEBER), 'Ratgeber', 'Weiterlesen', 'tf-ratgeber-titel').replace('<section class="tf-weitere"', '<section class="tf-weitere tf-ratgeber"')}

  <section class="tf-s tf-s--dunkel tf-schluss" aria-labelledby="tf-schluss-titel">
    <div class="tf-huelle tf-s-ein">
      <h2 id="tf-schluss-titel" class="tf-schluss__titel">Sprechen Sie mit uns über Ihr Vorhaben.</h2>
      <p class="tf-s-einleitung">In einem ersten Gespräch klären wir, wo Sie stehen und welcher Schritt sich als Nächstes lohnt.</p>
      <p class="tf-start-kopf__knoepfe">${knopf('Erstgespräch vereinbaren', TERMIN)} ${knopf('Projekt anfragen', ANFRAGE, 'rahmen')}</p>
    </div>
  </section>
</div>`;
}
