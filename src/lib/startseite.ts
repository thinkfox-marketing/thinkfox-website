// Startseite (Relaunch, Entscheidung 14.11.2026): eigene Seite statt Elementor-Markup, Gestaltung über Typografie
// (public/css/startseite.css, ergänzt beitrag.css + branchen.css). Positionierung breit (externe Marketingabteilung
// aus Nordhessen), Schwerpunkt-Branchen als zweite Ebene. Tonalität: CLAUDE.md → Regeln → Tonalität.
// Inhalte nur aus belegten Projektfakten; Kunden ohne Freigabe werden nicht namentlich genannt.
import { allPosts, type Post } from './wp';
import { anfrage, esc, faqHtml, knopf, projektKarten } from './beitrag';
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

const REFERENZEN = [
  'karriereseiten-relaunch-fuer-deutsche-rentenversicherung-kliniken',
  'karriereseite-stadt-waldeck',
  'vitos-haina-unternehmenskommunikation',
  'recruitmentfilm-dwaz-wirtschaftskanzlei',
  'imagefilm-continental-korbach-3d-druck',
  'website-vierbeiner-reha-zentrum',
  'kampagne-ewf-ein-leben-lang',
  'website-re-design-fuer-wachenfeld-bau',
];

const UEBER = {
  titel: 'Über thinkfox',
  text: 'thinkfox marketing ist eine Werbeagentur mit Sitz in Edertal. Seit 2015 betreuen wir Unternehmen und öffentliche Auftraggeber aus Nordhessen und ganz Deutschland. Strategie, Gestaltung, Webentwicklung und Produktion liegen bei uns im Haus.',
  fakten: [
    { wert: 'Seit 2015', text: 'Werbeagentur mit Sitz in Edertal' },
    { wert: 'Eigenes Studio', text: 'für Film- und Fotoproduktion in Edertal' },
    { wert: 'Ein Ansprechpartner', text: 'für Strategie, Gestaltung und Produktion' },
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

const bloeckeHtml = (bloecke: Block[]) => bloecke.map((b) => `<li class="tf-aufgabe">
        <h3 class="tf-aufgabe__titel">${esc(b.titel)}</h3>
        <p>${esc(b.text)}</p>
        ${b.links.map((l) => `<p class="tf-aufgabe__link"><a href="${esc(l.href)}">${esc(l.text)}</a></p>`).join('')}
      </li>`).join('\n      ');

const abschnitt = (id: string, titel: string, einleitung: string, bloecke: Block[], cls = '') => `<section class="tf-start__abschnitt${cls}" aria-labelledby="${id}">
    <div class="tf-huelle">
      <h2 id="${id}">${esc(titel)}</h2>
      <p class="tf-branche__einleitung">${esc(einleitung)}</p>
      <ul class="tf-aufgaben" role="list">
      ${bloeckeHtml(bloecke)}
      </ul>
    </div>
  </section>`;

/** Google-Bewertungen: vorgerendertes Trustindex-Markup aus der bisherigen Startseite (statisch, src/lib/bewertungen.ts). */
function bewertungen(): string {
  const m = (legacyStart as { main: string }).main;
  const a = m.indexOf('<pre class="ti-widget">');
  if (a < 0) return '';
  const e = m.indexOf('</pre>', a) + '</pre>'.length;
  return `<section class="tf-start__bewertungen" aria-labelledby="tf-bewertungen-titel">
    <div class="tf-huelle">
      <h2 id="tf-bewertungen-titel">Bewertungen unserer Kunden</h2>
      <p class="tf-branche__einleitung">Was Kundinnen und Kunden in ihren Google-Rezensionen über die Zusammenarbeit mit uns schreiben.</p>
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
  return `<div class="tf-beitrag tf-branche tf-start">
  <header class="tf-start-kopf" ${video.attribute}>
    ${video.html}
    <div class="tf-huelle tf-huelle--text tf-start-kopf__inhalt">
      <p class="tf-kopf__marke">${esc(KOPF.marke)}</p>
      <h1 class="tf-kopf__titel">${KOPF.titel.replace('­', '&shy;')}</h1>
      <p class="tf-kopf__teaser">${esc(KOPF.teaser)}</p>
      <p class="tf-branche__knoepfe">${knopf('Erstgespräch vereinbaren', TERMIN)} ${knopf('Projekt anfragen', ANFRAGE, 'rahmen')}</p>
    </div>
  </header>
  ${abschnitt('tf-anliegen-titel', ANLIEGEN.titel, ANLIEGEN.einleitung, ANLIEGEN.bloecke, ' tf-start__anliegen')}
  ${abschnitt('tf-zielgruppen-titel', ZIELGRUPPEN.titel, ZIELGRUPPEN.einleitung, ZIELGRUPPEN.bloecke, ' tf-start__zielgruppen')}
  <div id="projekte" class="tf-start__referenzen">
  ${projektKarten(nach(REFERENZEN), 'Ausgewählte Referenzen', 'Projekt ansehen', 'tf-referenzen-titel')}
  </div>
  <section class="tf-start__ueber" aria-labelledby="tf-ueber-titel">
    <div class="tf-huelle">
      <h2 id="tf-ueber-titel">${esc(UEBER.titel)}</h2>
      <p class="tf-branche__einleitung">${esc(UEBER.text)}</p>
      <dl class="tf-fakten">
        ${UEBER.fakten.map((f) => `<div><dt>${esc(f.wert)}</dt><dd>${esc(f.text)}</dd></div>`).join('\n        ')}
      </dl>
      <p class="tf-aufgabe__link"><a href="${UEBER.studio.href}">${esc(UEBER.studio.text)}</a></p>
    </div>
  </section>
  ${bewertungen()}
  ${abschnitt('tf-einstieg-titel', EINSTIEG.titel, EINSTIEG.text, EINSTIEG.bloecke, ' tf-branche__einstieg')}
  <div class="tf-huelle tf-huelle--text">
    ${faqHtml('Häufige Fragen', FRAGEN)}
  </div>
  ${projektKarten(nach(RATGEBER), 'Ratgeber', 'Weiterlesen', 'tf-ratgeber-titel').replace('<section class="tf-weitere"', '<section class="tf-weitere tf-start__ratgeber"')}
  ${anfrage({ titel: 'Sprechen Sie mit uns über Ihr Vorhaben', text: 'In einem ersten Gespräch klären wir, wo Sie stehen und welcher Schritt sich als Nächstes lohnt.', button: 'Erstgespräch vereinbaren', link: TERMIN })}
</div>`;
}
