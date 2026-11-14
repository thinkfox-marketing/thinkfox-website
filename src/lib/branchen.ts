// Branchenseiten (/branchen/<slug>/) – Sammelseiten für eine Zielgruppe (Relaunch, Zweig „relaunch“).
// Aufbau im einheitlichen Beitragslayout (public/css/beitrag.css + branchen.css): Kopf, Aufgaben aus echten
// Projekten, Projektkacheln (automatisch aus dem Feld `branchen` der Projekte), Einstieg, Fragen, Anfrage.
// Inhalte nur aus belegten Projektfakten; Kunden ohne Freigabe werden nicht namentlich genannt.
// Tonalität (14.11.): Sie-Form, sachlich-fachlich, keine Umgangssprache, keine Werbefloskeln, belegen statt behaupten.
import { allPosts, type Post } from './wp';
import { anfrage, esc, faqHtml, knopf, pfad, projektKarten } from './beitrag';

const TERMIN = 'https://crm.thinkfox.marketing/termin.php';
const ANFRAGE = '/thinkfox-marketing-projekt-anfragen/';

interface Aufgabe { titel: string; text: string; link?: { text: string; href: string } }
interface Einstieg { titel: string; text: string; link?: { text: string; href: string } }
export interface Branche {
  slug: string;
  menue: string;            // Bezeichnung in Navigation und Brotkrumen
  titel: string;            // H1
  seoTitel: string;
  beschreibung: string;     // Meta-Beschreibung
  teaser: string;
  aufgabenTitel: string;
  aufgabenEinleitung: string; // ein Satz unter der Überschrift: konkrete Ziele statt Floskel
  aufgaben: Aufgabe[];
  projekteTitel: string;
  einstiegTitel: string;
  einstiegText: string;
  einstiege: Einstieg[];
  fragen: { frage: string; antwort: string }[];
  anfrage: { titel: string; text: string };
}

export const BRANCHEN: Branche[] = [
  {
    slug: 'gesundheit-soziales',
    menue: 'Gesundheit & Soziales',
    titel: 'Marketing für Kliniken, Reha und soziale Einrichtungen',
    seoTitel: 'Marketing für Kliniken, Reha & soziale Einrichtungen | thinkfox',
    beschreibung: 'Marketing für Kliniken, Reha-Zentren und soziale Träger in Nordhessen: laufende Betreuung, Gestaltung nach Corporate Design, Karriereportale, Websites, Film und Foto.',
    teaser: 'Patienten, Angehörige und Bewerber entscheiden sich für Einrichtungen, denen sie vertrauen. Wir machen sichtbar, wofür Ihre Einrichtung steht: mit Aufnahmen Ihrer Mitarbeitenden und Räumlichkeiten und mit verständlich aufbereiteten Informationen.',
    aufgabenTitel: 'Wie wir Einrichtungen im Gesundheits- und Sozialwesen unterstützen',
    aufgabenEinleitung: 'Ob Patientenkommunikation, Personalgewinnung oder ein neuer Markenauftritt: Wir übernehmen Konzeption und Umsetzung und arbeiten dabei eng mit Ihrer Geschäftsführung, Ihrer Pflegedienstleitung oder Ihrer Personalabteilung zusammen.',
    aufgaben: [
      { titel: 'Laufende Betreuung als externe Marketingabteilung', text: 'Social Media, Patienteninformation und Wissensvermittlung in enger Abstimmung mit Ihrem Team. Diese Aufgabe übernehmen wir unter anderem dauerhaft für eine Klinikgruppe in der Region.' },
      { titel: 'Gestaltung nach Ihrem Corporate Design', text: 'Flyer, Broschüren, Anzeigen und Layouts, umgesetzt nach Ihren gestalterischen Vorgaben. So arbeiten wir beispielsweise für Vitos Haina.', link: { text: 'Projekt Vitos Haina', href: '/vitos-haina-unternehmenskommunikation/' } },
      { titel: 'Karriereportale für mehrere Standorte', text: 'Für drei Kliniken der Deutschen Rentenversicherung haben wir eigenständige Karriereseiten in einheitlichem Design entwickelt, mit Stellenbörse, Suche und Filter. Jede Klinik pflegt ihre Stellenangebote selbst.', link: { text: 'Projekt DRV-Kliniken', href: '/karriereseiten-relaunch-fuer-deutsche-rentenversicherung-kliniken/' } },
      { titel: 'Websites mit Buchungsfunktion', text: 'Über die Website des Vierbeiner Reha-Zentrums werden Seminare und Kurse gebucht. Ergänzend betreuen wir Social Media und sorgen mit SEO und GEO dafür, dass die Angebote bei Google und in KI-Suchen gefunden werden.', link: { text: 'Projekt Vierbeiner Reha-Zentrum', href: '/website-vierbeiner-reha-zentrum/' } },
      { titel: 'Einheitlicher Auftritt vom Logo bis zur Stellenanzeige', text: 'Für die Daniel Koch Jugendhilfe haben wir Logo, Website mit Karrierebereich und Recruiting-Videos für Social Media aufeinander abgestimmt.', link: { text: 'Projekt Daniel Koch Jugendhilfe', href: '/daniel-koch-jugendhilfe/' } },
      { titel: 'Barrierefreie Umsetzung', text: 'Die Karriereseiten der DRV-Kliniken sind barrierearm umgesetzt. Unsere eigene Website erfüllt die WCAG 2.2 AA und wird bei jeder Änderung automatisch geprüft.' },
    ],
    projekteTitel: 'Referenzen aus dem Gesundheits- und Sozialwesen',
    einstiegTitel: 'Der Einstieg in die Zusammenarbeit',
    einstiegText: 'Am Anfang steht ein Gespräch über Ihre aktuelle Situation, etwa offene Stellen, rückläufige Anfragen oder eine Website, die sich nicht mehr pflegen lässt. Darauf aufbauend schlagen wir ein klar abgegrenztes erstes Projekt vor. Viele unserer Kunden betreuen wir anschließend dauerhaft.',
    einstiege: [
      { titel: 'Recruiting-Paket', text: 'Karriereseite mit Anbindung an Google Jobs, kurze Videos aus Ihren Arbeitsbereichen und ein 360°-Rundgang durch die Arbeitsplätze.', link: { text: 'Mehr zu Employer Branding', href: '/employer-branding-agentur-recruitingfilm-karriereseite/' } },
      { titel: 'Imagefilm', text: 'Ein Film mit Ihren Mitarbeitenden, gedreht in Ihrer Einrichtung oder in unserem Studio, mit Fassungen für Website und Social Media.', link: { text: 'Was kostet ein Imagefilm?', href: '/was-kostet-ein-imagefilm/' } },
      { titel: 'Website-Relaunch', text: 'Eine Website, auf der Patienten, Angehörige und Bewerber schnell finden, was sie suchen. OnePager ab ca. 2.200 €, umfangreichere Websites ab ca. 5.500 € zzgl. MwSt.', link: { text: 'Was kostet eine Website?', href: '/was-kostet-eine-website/' } },
    ],
    fragen: [
      { frage: 'Arbeiten Sie nach unserem Corporate Design?', antwort: '<p>Ja. Für Vitos Haina setzen wir beispielsweise Flyer, Broschüren und Anzeigen nach den Gestaltungsvorgaben des Hauses um.</p>' },
      { frage: 'Können Sie mehrere Häuser oder Standorte einheitlich abbilden?', antwort: '<p>Ja. Für drei Kliniken der Deutschen Rentenversicherung haben wir eigenständige Karriereseiten in einheitlichem Design entwickelt. Jede Klinik pflegt ihre Stellenangebote selbst.</p>' },
      { frage: 'Wo finden Dreharbeiten und Fotoaufnahmen statt?', antwort: '<p>In Ihrer Einrichtung oder in unserem Studio in Edertal.</p>' },
      { frage: 'Ist die Website barrierefrei?', antwort: '<p>Barrierefreiheit berücksichtigen wir von Beginn an. Unsere eigene Website erfüllt die WCAG 2.2 AA und wird bei jeder Änderung automatisch geprüft.</p>' },
    ],
    anfrage: { titel: 'Sprechen Sie mit uns über Ihr Vorhaben', text: 'In einem ersten Gespräch klären wir, wo Sie stehen und welcher Schritt sich als Nächstes lohnt.' },
  },
  {
    slug: 'oeffentliche-hand',
    menue: 'Kommunen & öffentliche Hand',
    titel: 'Marketing für Kommunen und öffentliche Einrichtungen',
    seoTitel: 'Marketing für Kommunen & öffentliche Einrichtungen | thinkfox',
    beschreibung: 'Marketing für Kommunen und öffentliche Einrichtungen in Nordhessen: Karriereseiten, Kampagnen und barrierefreie Websites, mit Film und Foto aus eigener Produktion.',
    teaser: 'Städte, Gemeinden und kommunale Unternehmen gewinnen Personal und informieren Bürgerinnen und Bürger. Wir unterstützen beides mit verständlicher, barrierefreier Kommunikation und mit Aufnahmen aus Ihrer Verwaltung statt aus der Bilddatenbank.',
    aufgabenTitel: 'Wie wir Kommunen und öffentliche Einrichtungen unterstützen',
    aufgabenEinleitung: 'Ob Personalgewinnung, Bürgerinformation oder eine neue Website: Wir übernehmen Konzeption und Umsetzung und erstellen Angebote, die zu Ihrem Haushalt und Ihren Vergaberegeln passen.',
    aufgaben: [
      { titel: 'Karriereseiten für die Verwaltung', text: 'Für die Nationalparkstadt Waldeck haben wir eine Karriereseite mit Anbindung an Google Jobs entwickelt, ergänzt um kurze Videos aus drei Arbeitsbereichen und einen 360°-Rundgang, der auf die Videos verweist.', link: { text: 'Projekt Stadt Waldeck', href: '/karriereseite-stadt-waldeck/' } },
      { titel: 'Kampagnen für Stadt und Region', text: 'Für die Stadt Korbach haben wir die Mehrweg-Kampagne „Korbach becher machen!“ mit Fotos, Erklärvideo und Reels umgesetzt, für die Energie Waldeck-Frankenberg die Kampagne „ein Leben lang“ mit Claim, Film, Foto und Printmedien.', link: { text: 'Projekt „Korbach becher machen!“', href: '/korbach-becher-machen/' } },
      { titel: 'Websites für Wirtschaftsförderung und Verwaltung', text: 'Für die Wirtschaftsförderung Waldeck-Frankenberg haben wir die Website neu konzipiert, einschließlich eines Verzeichnisses freier Gewerbeflächen und Objekte.', link: { text: 'Projekt Wirtschaftsförderung', href: '/website-relaunch-wirtschaftsfoerderung-waldeck-frankenberg/' } },
      { titel: 'Barrierefreiheit nach BITV', text: 'Öffentliche Stellen sind zur Barrierefreiheit verpflichtet. Unsere eigene Website erfüllt die WCAG 2.2 AA und wird bei jeder Änderung automatisch geprüft. Diese Arbeitsweise übertragen wir auf Ihre Projekte.' },
      { titel: 'Angebote für die Direktvergabe', text: 'In Hessen dürfen Liefer- und Dienstleistungen seit Juni 2026 bis 100.000 € netto direkt vergeben werden (HVTG). Wir erstellen Angebote mit klar beschriebenem Leistungsumfang. Ihre eigene Vergaberichtlinie kann strengere Regeln vorsehen.' },
    ],
    projekteTitel: 'Referenzen aus Kommunen und öffentlichen Einrichtungen',
    einstiegTitel: 'Der Einstieg in die Zusammenarbeit',
    einstiegText: 'Zunächst klären wir, welche Stellen schwer zu besetzen sind oder welche Informationen Bürgerinnen und Bürger erreichen sollen. Darauf aufbauend schlagen wir ein klar abgegrenztes erstes Projekt vor, das zu Ihrem Haushalt und Ihren Vergaberegeln passt.',
    einstiege: [
      { titel: 'Recruiting-Paket für die Verwaltung', text: 'Karriereseite mit Anbindung an Google Jobs, kurze Videos aus Ihren Arbeitsbereichen und ein 360°-Rundgang, wie bei der Stadt Waldeck.', link: { text: 'Projekt Stadt Waldeck', href: '/karriereseite-stadt-waldeck/' } },
      { titel: 'Kampagne', text: 'Eine Kampagnenidee, die zu Ihrer Stadt oder Region passt, umgesetzt mit Fotos, Film sowie Material für Social Media und Print.', link: { text: 'Projekt Energie Waldeck-Frankenberg', href: '/kampagne-ewf-ein-leben-lang/' } },
      { titel: 'Website-Relaunch', text: 'Eine barrierefreie Website, auf der Bürgerinnen, Bürger und Unternehmen schnell finden, was sie suchen. OnePager ab ca. 2.200 €, umfangreichere Websites ab ca. 5.500 € zzgl. MwSt.', link: { text: 'Was kostet eine Website?', href: '/was-kostet-eine-website/' } },
    ],
    fragen: [
      { frage: 'Können Sie ein Angebot für eine Direktvergabe erstellen?', antwort: '<p>Ja. Wir beschreiben den Leistungsumfang so, dass Ihre Vergabestelle ihn prüfen und vergeben kann. Seit Juni 2026 sind in Hessen Direktvergaben für Dienstleistungen bis 100.000 € netto möglich (HVTG). Ob Ihre eigene Vergaberichtlinie strengere Regeln vorsieht, klärt Ihre Vergabestelle.</p>' },
      { frage: 'Ist die Website barrierefrei nach BITV?', antwort: '<p>Barrierefreiheit berücksichtigen wir von Beginn an. Unsere eigene Website erfüllt die WCAG 2.2 AA, auf die die BITV verweist, und wird bei jeder Änderung automatisch geprüft.</p>' },
      { frage: 'Können die Stellenanzeigen in der Google-Jobsuche erscheinen?', antwort: '<p>Ja. Die Karriereseite der Stadt Waldeck ist so umgesetzt, dass die Stellenangebote in Google Jobs erscheinen.</p>' },
      { frage: 'Wo finden Dreharbeiten und Fotoaufnahmen statt?', antwort: '<p>Vor Ort, etwa in der Verwaltung, im Bauhof oder in der Kita, oder in unserem Studio in Edertal.</p>' },
    ],
    anfrage: { titel: 'Sprechen Sie mit uns über Ihr Vorhaben', text: 'In einem ersten Gespräch klären wir Ziele, Rahmen und Vergabeweg und schlagen einen ersten Schritt vor.' },
  },
];

export async function brancheSeite(b: Branche): Promise<string> {
  const projekte = (await allPosts())
    .filter((p): p is Post => p.collection === 'projekte' && !!(p.data as { branchen?: string[] }).branchen?.includes(b.slug) && !!p.data.bild);
  const aufgaben = b.aufgaben.map((a) => `<li class="tf-aufgabe">
        <h3 class="tf-aufgabe__titel">${esc(a.titel)}</h3>
        <p>${esc(a.text)}</p>
        ${a.link ? `<p class="tf-aufgabe__link"><a href="${esc(a.link.href)}">${esc(a.link.text)}</a></p>` : ''}
      </li>`).join('\n      ');
  const einstiege = b.einstiege.map((e) => `<li class="tf-einstieg">
        <h3 class="tf-einstieg__titel">${esc(e.titel)}</h3>
        <p>${esc(e.text)}</p>
        ${e.link ? `<p class="tf-einstieg__link"><a href="${esc(e.link.href)}">${esc(e.link.text)}</a></p>` : ''}
      </li>`).join('\n      ');
  return `<article class="tf-beitrag tf-branche">
  <header class="tf-kopf">
    <div class="tf-huelle tf-huelle--text">
      ${pfad([{ text: 'Start', link: '/' }, { text: 'Branchen' }, { text: b.menue }])}
      <p class="tf-kopf__marke">Branche</p>
      <h1 class="tf-kopf__titel">${esc(b.titel)}</h1>
      <p class="tf-kopf__teaser">${esc(b.teaser)}</p>
      <p class="tf-branche__knoepfe">${knopf('Erstgespräch vereinbaren', TERMIN)} ${knopf('Projekt anfragen', ANFRAGE, 'zweit')}</p>
    </div>
  </header>
  <section class="tf-branche__aufgaben" aria-labelledby="tf-aufgaben-titel">
    <div class="tf-huelle">
      <h2 id="tf-aufgaben-titel">${esc(b.aufgabenTitel)}</h2>
      <p class="tf-branche__einleitung">${esc(b.aufgabenEinleitung)}</p>
      <ul class="tf-aufgaben" role="list">
      ${aufgaben}
      </ul>
    </div>
  </section>
  ${projekte.length ? projektKarten(projekte, b.projekteTitel, 'Projekt ansehen', 'tf-branche-projekte') : ''}
  <section class="tf-branche__einstieg" aria-labelledby="tf-einstieg-titel">
    <div class="tf-huelle">
      <h2 id="tf-einstieg-titel">${esc(b.einstiegTitel)}</h2>
      <p class="tf-branche__einleitung">${esc(b.einstiegText)}</p>
      <ul class="tf-einstiege" role="list">
      ${einstiege}
      </ul>
    </div>
  </section>
  <div class="tf-huelle tf-huelle--text">
    ${faqHtml(`Häufige Fragen: ${b.menue}`, b.fragen)}
  </div>
  ${anfrage({ titel: b.anfrage.titel, text: b.anfrage.text, button: 'Erstgespräch vereinbaren', link: TERMIN })}
</article>`;
}
