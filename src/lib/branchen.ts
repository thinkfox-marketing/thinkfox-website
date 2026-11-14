// Branchenseiten (/branchen/<slug>/) – Sammelseiten für eine Zielgruppe (Relaunch, Zweig „relaunch“).
// Aufbau im einheitlichen Beitragslayout (public/css/beitrag.css + branchen.css): Kopf, Aufgaben aus echten
// Projekten, Projektkacheln (automatisch aus dem Feld `branchen` der Projekte), Einstieg, Fragen, Anfrage.
// Inhalte nur aus belegten Projektfakten; Kunden ohne Freigabe werden nicht namentlich genannt.
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
    beschreibung: 'Externe Marketingabteilung für Kliniken, Reha-Zentren und soziale Träger in Nordhessen: Social Media, Gestaltung nach Ihrem CD, Karriereportale, Websites, Film und Foto.',
    teaser: 'Wer sich für eine Klinik, eine Reha oder einen Träger entscheidet, will wissen, wem er vertraut. Wir zeigen Ihre Einrichtung so, wie sie ist: mit Ihren Mitarbeitenden, Ihren Räumen und Informationen, die Patienten, Angehörige und Bewerber verstehen.',
    aufgabenTitel: 'Was wir für Einrichtungen im Gesundheits- und Sozialwesen machen',
    aufgaben: [
      { titel: 'Laufende Betreuung als externe Marketingabteilung', text: 'Social Media, Patienteninformation und Wissensvermittlung, abgestimmt mit Ihrem Team. Für eine Klinikgruppe in der Region machen wir genau das laufend.' },
      { titel: 'Gestaltung nach Ihrem Corporate Design', text: 'Flyer, Broschüren, Anzeigen und Layouts, sauber nach Ihren Vorgaben. So arbeiten wir zum Beispiel für Vitos Haina.', link: { text: 'Projekt Vitos Haina', href: '/vitos-haina-unternehmenskommunikation/' } },
      { titel: 'Karriereportale für mehrere Häuser', text: 'Für drei Kliniken der Deutschen Rentenversicherung haben wir eigene Karriereseiten im gleichen Design gebaut, mit Stellenbörse, Suche und Filter. Jede Klinik pflegt ihre Stellen selbst.', link: { text: 'Projekt DRV-Kliniken', href: '/karriereseiten-relaunch-fuer-deutsche-rentenversicherung-kliniken/' } },
      { titel: 'Websites, über die gebucht wird', text: 'Beim Vierbeiner Reha-Zentrum verkauft die Website Seminare und Kurse. Wir betreuen dazu Social Media und sorgen mit SEO und GEO dafür, dass die Kurse bei Google und in KI-Suchen gefunden werden.', link: { text: 'Projekt Vierbeiner Reha-Zentrum', href: '/website-vierbeiner-reha-zentrum/' } },
      { titel: 'Ein Auftritt aus einer Hand', text: 'Für die Daniel Koch Jugendhilfe haben wir vom Logo über die Website mit Karrierebereich bis zu Recruiting-Shorts für Social Media alles aufeinander abgestimmt.', link: { text: 'Projekt Daniel Koch Jugendhilfe', href: '/daniel-koch-jugendhilfe/' } },
      { titel: 'Barrierefreiheit mitgedacht', text: 'Die Karriereseiten der DRV-Kliniken sind barrierearm umgesetzt. Unsere eigene Website erfüllt WCAG 2.2 AA und wird bei jeder Änderung automatisch geprüft.' },
    ],
    projekteTitel: 'Projekte aus Gesundheit und Sozialem',
    einstiegTitel: 'So fangen wir an',
    einstiegText: 'Am Anfang steht ein Gespräch darüber, was bei Ihnen gerade drückt: offene Stellen, zu wenige Anfragen oder eine Website, die keiner mehr pflegen mag. Danach starten wir mit einem klar umrissenen ersten Projekt. Viele unserer Kunden sind so geblieben.',
    einstiege: [
      { titel: 'Recruiting-Paket', text: 'Karriereseite mit Google-Jobs-Anbindung, kurze Videos aus Ihren Arbeitsbereichen und ein 360°-Rundgang durch die Arbeitsplätze.', link: { text: 'Mehr zu Employer Branding', href: '/employer-branding-agentur-recruitingfilm-karriereseite/' } },
      { titel: 'Imagefilm', text: 'Ein Film mit Ihren Mitarbeitenden, bei Ihnen vor Ort oder in unserem Studio gedreht, mit Fassungen für Website und Social Media.', link: { text: 'Was kostet ein Imagefilm?', href: '/was-kostet-ein-imagefilm/' } },
      { titel: 'Website-Relaunch', text: 'Eine Website, die Patienten, Angehörige und Bewerber schnell zum Ziel bringt. OnePager ab ca. 2.200 €, umfangreichere Websites ab ca. 5.500 € zzgl. MwSt.', link: { text: 'Was kostet eine Website?', href: '/was-kostet-eine-website/' } },
    ],
    fragen: [
      { frage: 'Arbeiten Sie nach unserem Corporate Design?', antwort: '<p>Ja. Für Vitos Haina setzen wir zum Beispiel Flyer, Broschüren und Anzeigen nach den Vorgaben des Hauses um.</p>' },
      { frage: 'Können Sie mehrere Häuser oder Standorte einheitlich abbilden?', antwort: '<p>Ja. Für drei Kliniken der Deutschen Rentenversicherung haben wir eigene Karriereseiten im gleichen Design gebaut. Jede Klinik pflegt ihre Stellen selbst.</p>' },
      { frage: 'Wo wird gedreht und fotografiert?', antwort: '<p>Bei Ihnen vor Ort oder in unserem Studio in Edertal.</p>' },
      { frage: 'Ist die Website barrierefrei?', antwort: '<p>Barrierefreiheit planen wir von Anfang an mit ein. Unsere eigene Website erfüllt WCAG 2.2 AA und wird bei jeder Änderung automatisch geprüft.</p>' },
    ],
    anfrage: { titel: 'Ihre Einrichtung soll sichtbarer werden?', text: 'Ob Fachkräfte, Patientenanfragen oder ein neuer Auftritt: Erzählen Sie uns, was gerade ansteht.' },
  },
  {
    slug: 'oeffentliche-hand',
    menue: 'Kommunen & öffentliche Hand',
    titel: 'Marketing für Kommunen und öffentliche Einrichtungen',
    seoTitel: 'Marketing für Kommunen & öffentliche Einrichtungen | thinkfox',
    beschreibung: 'Karriereseiten, Kampagnen und barrierefreie Websites für Städte, Gemeinden und kommunale Unternehmen in Nordhessen, mit Film und Foto aus dem eigenen Studio.',
    teaser: 'Städte, Gemeinden und kommunale Unternehmen suchen Personal und müssen erklären, was sie tun. Wir machen beides verständlich und barrierefrei, mit Bildern aus Ihrer Verwaltung statt aus der Bilddatenbank.',
    aufgabenTitel: 'Was wir für Kommunen und öffentliche Einrichtungen machen',
    aufgaben: [
      { titel: 'Karriereseiten für die Verwaltung', text: 'Für die Nationalparkstadt Waldeck haben wir eine Karriereseite mit Google-Jobs-Anbindung gebaut, dazu kurze Videos aus drei Arbeitsbereichen und einen 360°-Rundgang, der auf die Videos verlinkt.', link: { text: 'Projekt Stadt Waldeck', href: '/karriereseite-stadt-waldeck/' } },
      { titel: 'Kampagnen, die man im Ort sieht', text: 'Für die Stadt Korbach haben wir die Mehrweg-Kampagne „Korbach becher machen!“ mit Fotos, Erklärvideo und Reels umgesetzt. Für die Energie Waldeck-Frankenberg die Kampagne „ein Leben lang“ mit Claim, Film, Foto und Print.', link: { text: 'Projekt „Korbach becher machen!“', href: '/korbach-becher-machen/' } },
      { titel: 'Websites für Wirtschaftsförderung und Verwaltung', text: 'Für die Wirtschaftsförderung Waldeck-Frankenberg haben wir die Website neu aufgebaut, mit einem Verzeichnis freier Gewerbeflächen und Objekte.', link: { text: 'Projekt Wirtschaftsförderung', href: '/website-relaunch-wirtschaftsfoerderung-waldeck-frankenberg/' } },
      { titel: 'Barrierefreiheit nach BITV', text: 'Öffentliche Stellen müssen barrierefrei sein. Unsere eigene Website erfüllt WCAG 2.2 AA und wird bei jeder Änderung automatisch geprüft. Diese Arbeitsweise bringen wir in Ihre Projekte mit.' },
      { titel: 'Angebote, die Sie direkt vergeben können', text: 'In Hessen dürfen Liefer- und Dienstleistungen seit Juni 2026 bis 100.000 € netto direkt vergeben werden (HVTG). Wir erstellen ein Angebot mit klar beschriebenem Leistungsumfang. Ihre eigene Vergaberichtlinie kann strengere Regeln haben.' },
    ],
    projekteTitel: 'Projekte für Kommunen und öffentliche Einrichtungen',
    einstiegTitel: 'So fangen wir an',
    einstiegText: 'Wir klären zuerst, welche Stellen schwer zu besetzen sind oder was die Bürger verstehen sollen. Dann schlagen wir ein erstes, klar abgegrenztes Projekt vor, das sich in Ihren Haushalt und Ihre Vergaberegeln einfügt.',
    einstiege: [
      { titel: 'Recruiting-Paket für die Verwaltung', text: 'Karriereseite mit Google-Jobs-Anbindung, kurze Videos aus Ihren Arbeitsbereichen und ein 360°-Rundgang, wie bei der Stadt Waldeck.', link: { text: 'Projekt Stadt Waldeck', href: '/karriereseite-stadt-waldeck/' } },
      { titel: 'Kampagne', text: 'Eine Idee, die zu Ihrem Ort passt, mit Fotos, Film und Material für Social Media und Print.', link: { text: 'Projekt EWF', href: '/kampagne-ewf-ein-leben-lang/' } },
      { titel: 'Website-Relaunch', text: 'Eine barrierefreie Website, die Bürger und Unternehmen schnell zum Ziel bringt. OnePager ab ca. 2.200 €, umfangreichere Websites ab ca. 5.500 € zzgl. MwSt.', link: { text: 'Was kostet eine Website?', href: '/was-kostet-eine-website/' } },
    ],
    fragen: [
      { frage: 'Können Sie ein Angebot erstellen, das wir direkt vergeben können?', antwort: '<p>Ja. Wir beschreiben den Leistungsumfang so, dass Sie ihn prüfen und vergeben können. Seit Juni 2026 sind in Hessen Direktvergaben für Dienstleistungen bis 100.000 € netto möglich (HVTG). Ob Ihre eigene Vergaberichtlinie strenger ist, klärt am besten Ihre Vergabestelle.</p>' },
      { frage: 'Ist die Website barrierefrei nach BITV?', antwort: '<p>Barrierefreiheit planen wir von Anfang an mit ein. Unsere eigene Website erfüllt WCAG 2.2 AA, den Standard, auf den die BITV verweist, und wird bei jeder Änderung automatisch geprüft.</p>' },
      { frage: 'Können die Stellenanzeigen in der Google-Jobsuche erscheinen?', antwort: '<p>Ja. Die Karriereseite der Stadt Waldeck ist so umgesetzt, dass die Stellen in Google Jobs erscheinen.</p>' },
      { frage: 'Wo wird gedreht und fotografiert?', antwort: '<p>Bei Ihnen vor Ort, in der Verwaltung, im Bauhof oder in der Kita, oder in unserem Studio in Edertal.</p>' },
    ],
    anfrage: { titel: 'Sie suchen Personal oder wollen etwas erklären?', text: 'Erzählen Sie uns, was ansteht. Wir schlagen ein erstes Projekt vor, das zu Haushalt und Vergabe passt.' },
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
