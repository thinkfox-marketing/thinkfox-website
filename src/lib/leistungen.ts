// Leistungsseiten im neuen Erscheinungsbild (Relaunch) – unter den bisherigen Adressen, Rahmen src/layouts/Seite.astro.
// Alle Seiten haben denselben Aufbau: Aufmacher → Ausgangslage → Lösung (Leistungsumfang) → Ergebnis → Vorgehen →
// Referenzen → Kosten → Häufige Fragen → Kontakt. Wording und Positionierung: CLAUDE.md.
// Inhalte aus den bisherigen Seiten und Projekten übernommen und in die Sie-Form gebracht; keine neuen Tatsachenbehauptungen.
import { wpImg } from './media';
import { CONTENT, EXTERN, SOCIAL, STUDIO, TERMIN, WEB } from './chrome';
import { KONTAKT, abschnitt, bogen, drei, esc, knopf, preis, still } from './seiten';

interface Zeile { titel: string; text: string; link?: [string, string] }
interface Leistungsseite {
  kurz: string;                       // Name im Brotkrumenpfad
  ohneEltern?: boolean;               // Brotkrumenpfad ohne „Leistungen“ (z. B. Ortsseite)
  rubrikLage?: string;                // Rubrik des ersten Abschnitts (Standard: Ausgangslage)
  titel: string;                      // H1 (darf &shy; enthalten)
  einleitung: string;
  zweiterKnopf: [string, string];
  bild: { datei: string; alt: string; text: string };          // Aufmacherbild (wp-content/uploads/…)
  lage: { titel: string; punkte: [string, string][] };
  loesung: { titel: string; zeilen: Zeile[]; bild: { datei: string; alt: string; text: string }; hinweis?: string };
  ergebnis: { titel: string; punkte: [string, string][]; beispiele: [string, string][] };
  ablauf?: { titel: string; schritte: [string, string][] };
  referenzen?: { titel: string; eintraege: { bild: string; hoehe: number; kunde: string; art: string; href: string }[] };
  kosten?: { titel: string; html: string };
  fragen: [string, string][];
}

const web = (datei: string, alt: string, sizes = '480px', eager = false) =>
  wpImg(`/wp-content/uploads/${datei}`, { size: 'full', alt, cls: '', sizes, ...(eager ? { fetchpriority: 'high' as const } : {}) });

const FILMSTILLS = [
  { bild: still('still-continental', 'Mitarbeiter von Continental im Interview', 840, 720), hoehe: 340, kunde: 'Continental, Korbach', art: 'Imagefilm', href: '/imagefilm-continental-korbach-3d-druck/' },
  { bild: still('still-daniel-koch', 'Jugendliche mit Reithelm beim Pferd'), hoehe: 260, kunde: 'Daniel Koch Jugendhilfe', art: 'Recruiting-Clip', href: '/daniel-koch-jugendhilfe/' },
  { bild: still('still-wachenfeld', 'Bauleiter auf der Baustelle'), hoehe: 380, kunde: 'Wachenfeld Bau', art: 'Recruitingfilm', href: '/recruitmentfilm-wachenfeld-bau-korbach/' },
  { bild: still('still-dwaz', 'Mitarbeiterin im Büro', 1280, 540), hoehe: 300, kunde: 'DWAZ Wirtschaftskanzlei', art: 'Recruitingfilm', href: '/recruitmentfilm-dwaz-wirtschaftskanzlei/' },
  { bild: still('still-waldeck', 'Forstwirt mit Schutzhelm'), hoehe: 240, kunde: 'Stadt Waldeck', art: 'Recruitingfilm', href: '/karriereseite-stadt-waldeck/' },
];

export const LEISTUNGSSEITEN: Record<string, Leistungsseite> = {
  [WEB]: {
    kurz: 'Websites und SEO',
    titel: 'Websites, mit denen mittel&shy;ständische Unternehmen gefunden werden.',
    einleitung: 'Wir konzipieren, gestalten und entwickeln Unternehmenswebsites. Sie sind so aufgebaut, dass Google und KI-Suchen ihre Inhalte erfassen und Besucher schnell zur Anfrage gelangen.',
    zweiterKnopf: ['Preise ansehen', '#kosten'],
    bild: { datei: '2025/02/Website-vierbeiner-reha-zentrum-bad-wildungen.jpg', alt: 'Website des Vierbeiner Reha-Zentrums auf mehreren Bildschirmen', text: 'Website für das Vierbeiner Reha-Zentrum, Bad Wildungen' },
    lage: { titel: 'Typische Schwachstellen bestehender Websites', punkte: [
      ['Geringe Auffindbarkeit', 'Das Unternehmen erscheint bei relevanten Suchanfragen nicht oder erst hinter dem Wettbewerb.'],
      ['Unklare Nutzerführung', 'Besucher finden Leistungen, Ansprechpartner und Kontaktwege nicht schnell genug.'],
      ['Aufwendige Pflege', 'Inhalte lassen sich nicht selbst aktualisieren. Die Website veraltet.'],
    ] },
    loesung: { titel: 'Leistungsumfang', zeilen: [
      { titel: 'Konzeption', text: 'Ziele, Zielgruppen und Seitenstruktur.' },
      { titel: 'Webdesign', text: 'Gestaltung im Erscheinungsbild Ihres Unternehmens, für alle Bildschirmgrößen.' },
      { titel: 'Technische Umsetzung', text: 'Entwicklung mit WordPress, sodass Sie Inhalte selbst pflegen können.' },
      { titel: 'Suchmaschinenoptimierung', text: 'Struktur und Inhalte für Google (SEO) und KI-Suchen (GEO).' },
      { titel: 'Barrierefreiheit', text: 'Wir berücksichtigen sie von Beginn an. Unsere eigene Website erfüllt die WCAG 2.2 AA.' },
    ], bild: { datei: '2026/01/Stadt_waldeck_karriere.jpg', alt: 'Karriereseite der Stadt Waldeck auf Tablets', text: 'Karriereseite der Nationalparkstadt Waldeck' } },
    ergebnis: { titel: 'Was Ihre neue Website leistet', punkte: [
      ['Auffindbar', 'Suchmaschinen und KI-Assistenten erfassen Ihre Leistungen und zeigen sie bei passenden Suchanfragen an.'],
      ['Verständlich', 'Besucher erkennen, was Sie anbieten, und finden den Weg zur Anfrage oder Bewerbung.'],
      ['Selbst pflegbar', 'Ihr Team aktualisiert Texte, Bilder und Stellenangebote eigenständig.'],
    ], beispiele: [
      ['Vierbeiner Reha-Zentrum', 'Seminare und Kurse werden über die Website gebucht.'],
      ['Wirtschaftsförderung Waldeck-Frankenberg', 'Verzeichnis freier Gewerbeflächen und Objekte.'],
      ['Kliniken der Deutschen Rentenversicherung', 'Jede Klinik pflegt ihre Stellenangebote selbst.'],
    ] },
    ablauf: { titel: 'Ablauf eines Website-Projekts', schritte: [
      ['Erstgespräch und Analyse', 'Ziele, Zielgruppen und Bestandsaufnahme der bisherigen Website.'],
      ['Konzept und Gestaltung', 'Seitenstruktur, Inhalte und Design zur Abstimmung.'],
      ['Umsetzung', 'Technische Entwicklung, Texte, Bilder und Suchmaschinenoptimierung.'],
      ['Veröffentlichung und Betreuung', 'Livegang, Einweisung Ihres Teams, auf Wunsch Wartung und Weiterentwicklung.'],
    ] },
    referenzen: { titel: 'Websites für unsere Kunden', eintraege: [
      { bild: web('2025/02/Website-vierbeiner-reha-zentrum-bad-wildungen.jpg', 'Website des Vierbeiner Reha-Zentrums'), hoehe: 340, kunde: 'Vierbeiner Reha-Zentrum', art: 'Website mit Kursbuchung', href: '/website-vierbeiner-reha-zentrum/' },
      { bild: web('2025/10/website_wfg_waldeck_frankenberg-1.jpg', 'Website der Wirtschaftsförderung Waldeck-Frankenberg'), hoehe: 380, kunde: 'Wirtschaftsförderung Waldeck-Frankenberg', art: 'Website-Relaunch', href: '/website-relaunch-wirtschaftsfoerderung-waldeck-frankenberg/' },
      { bild: web('2025/09/wachenfeld_website-2.jpg', 'Website von Wachenfeld Bau'), hoehe: 300, kunde: 'Wachenfeld Bau', art: 'Website-Redesign', href: '/website-re-design-fuer-wachenfeld-bau/' },
      { bild: web('2025/11/website_relaunch_kkd_essen.jpg', 'Website der KKD GmbH'), hoehe: 360, kunde: 'KKD GmbH, Essen', art: 'Website-Relaunch', href: '/website-relaunch-fuer-kkd-gmbh-essen/' },
    ] },
    kosten: { titel: 'Kosten einer Website', html: `<div class="preise">
          ${preis('OnePager', 'Kompakte Website auf einer Seite', 'ab ca. 2.200 €')}
          ${preis('Unternehmenswebsite', 'Mehrere Seiten, eigenständig pflegbar', 'ab ca. 5.500 €')}
        </div>
        <p class="fussnote">Alle Preise zzgl. MwSt. Wovon die Kosten abhängen, erläutert der Ratgeber <a href="/was-kostet-eine-website/">Was kostet eine Website?</a></p>` },
    fragen: [
      ['Mit welchem System arbeiten Sie?', 'Wir arbeiten vorrangig mit dem Content-Management-System WordPress.'],
      ['Können wir Inhalte selbst pflegen?', 'Ja. Ihr Team erhält eine Einweisung und aktualisiert Texte, Bilder und Stellenangebote eigenständig.'],
      ['Ist die Website barrierefrei?', 'Barrierefreiheit berücksichtigen wir von Beginn an. Unsere eigene Website erfüllt die WCAG 2.2 AA und wird bei jeder Änderung automatisch geprüft.'],
    ],
  },

  [SOCIAL]: {
    kurz: 'Social Media',
    titel: 'Social-Media-Betreuung für mittel&shy;ständische Unternehmen',
    einleitung: 'Wir planen die Themen, produzieren Beiträge und Videos, veröffentlichen sie auf Ihren Kanälen und schalten Anzeigen. Ihr Unternehmen ist damit regelmäßig bei Kunden und potenziellen Mitarbeitenden präsent.',
    zweiterKnopf: ['Leistungsumfang ansehen', '#loesung'],
    bild: { datei: '2025/02/social_media_thinkfox_marketing.jpg', alt: 'Social-Media-Beiträge verschiedener Kunden auf Smartphones', text: 'Beiträge aus unserer Social-Media-Betreuung' },
    lage: { titel: 'Typische Ausgangslagen bei Social Media', punkte: [
      ['Keine Zeit im Tagesgeschäft', 'Themenplanung, Produktion und regelmäßige Veröffentlichung bleiben liegen.'],
      ['Kein Redaktionsplan', 'Beiträge entstehen, wenn gerade etwas anfällt. Eine Linie ist nicht erkennbar.'],
      ['Keine messbaren Ergebnisse', 'Reichweite und Likes lassen sich nicht auf Anfragen oder Bewerbungen zurückführen.'],
    ] },
    loesung: { titel: 'Leistungsumfang', zeilen: [
      { titel: 'Strategie und Redaktionsplan', text: 'In einem Workshop klären wir Ziele, Zielgruppen und Themen und leiten daraus den Redaktionsplan ab.' },
      { titel: 'Produktion', text: 'Fotos, Reels und Videos, an Ihrem Standort oder in unserem Studio. Inhalte entstehen für mehrere Wochen im Voraus.' },
      { titel: 'Veröffentlichung', text: 'Wir bereiten die Beiträge auf und veröffentlichen sie nach Ihrer Freigabe.' },
      { titel: 'Anzeigen', text: 'Kampagnen auf Social Media, ausgerichtet auf Kundenanfragen oder Bewerbungen.' },
      { titel: 'Auswertung', text: 'Regelmäßige Berichte. Auf dieser Grundlage passen wir Themen und Anzeigen an.' },
    ], bild: { datei: '2023/03/korbach-becher-machen.jpg', alt: 'Motive der Kampagne „Korbach becher machen!“ auf Plakat, Bildschirm und Smartphone', text: 'Kampagne „Korbach becher machen!“ mit Fotos, Erklärvideo und Reels' } },
    ergebnis: { titel: 'Was die Betreuung bewirkt', punkte: [
      ['Regelmäßige Präsenz', 'Ihre Kanäle werden verlässlich bespielt, mit Inhalten aus Ihrem Unternehmen.'],
      ['Geringer Aufwand für Ihr Team', 'Ihr Beitrag beschränkt sich auf regelmäßige Abstimmungstermine und die Freigabe der Inhalte.'],
      ['Klare Ziele', 'Vor dem Start legen wir fest, ob Kundenanfragen oder Bewerbungen im Vordergrund stehen, und werten die Anzeigen danach aus.'],
    ], beispiele: [
      ['Vierbeiner Reha-Zentrum', 'Laufende Social-Media-Betreuung, ergänzend zur Website.'],
      ['Stadt Korbach', 'Fotos, Erklärvideo und Reels für die Mehrweg-Kampagne.'],
      ['Daniel Koch Jugendhilfe', 'Recruiting-Videos für Social Media.'],
    ] },
    ablauf: { titel: 'Ablauf der Zusammenarbeit', schritte: [
      ['Strategie-Workshop', 'Ziele, Zielgruppen und Themen Ihres Unternehmens.'],
      ['Redaktionsplan', 'Formate, Kanäle und Veröffentlichungstermine zur Abstimmung.'],
      ['Produktion', 'Foto- und Videoaufnahmen für mehrere Wochen, an Ihrem Standort oder im Studio.'],
      ['Veröffentlichung und Auswertung', 'Beiträge und Anzeigen laufen nach Plan. Sie erhalten regelmäßige Berichte.'],
    ] },
    kosten: { titel: 'Kosten der Social-Media-Betreuung', html: `<p class="einleitung" style="margin-top:0">Die Kosten richten sich nach der Zahl der Kanäle, dem Umfang der Produktion und dem Werbebudget.</p>
        <p class="fussnote">Was eine Betreuung umfasst und wie sich Angebote vergleichen lassen, erläutert der Ratgeber <a href="/social-media-betreuung-kosten/">Was kostet Social-Media-Betreuung?</a></p>` },
    fragen: [
      ['Lohnt sich Social Media auch für B2B-Unternehmen mit erklärungsbedürftigen Produkten?', 'Ja. Kaufentscheidungen werden heute häufig online vorbereitet: Einkäufer und Geschäftsführer informieren sich vor dem ersten Kontakt. Auf Social Media zeigen Sie Ihre Fachkompetenz, geben Einblicke in die Produktion und machen komplexe Leistungen verständlich, zum Beispiel auf LinkedIn oder Instagram.'],
      ['Wie viel Zeit müssen wir selbst einplanen?', 'Wir produzieren Inhalte für mehrere Wochen oder Monate im Voraus und übernehmen danach die Abwicklung. Ihr Aufwand beschränkt sich im Wesentlichen auf regelmäßige Abstimmungstermine und die Freigabe der Inhalte.'],
      ['Welche Themen eignen sich, wenn unsere Produkte wenig anschaulich sind?', 'Häufig sind es die Menschen im Unternehmen, die Präzision der Fertigung oder die Aufgaben, die Sie für Ihre Kunden lösen. Diese Themen erarbeiten wir im Strategie-Workshop und setzen sie mit Foto und Video um.'],
      ['Warum eine Agentur und keine eigene Stelle?', 'Eine einzelne Person deckt selten alles ab, was Social Media erfordert: Strategie, Kamera, Schnitt, Text und Anzeigen. Bei uns arbeitet dafür ein Team, und die Betreuung läuft auch bei Urlaub oder Krankheit weiter.'],
    ],
  },

  [CONTENT]: {
    kurz: 'Film und Foto',
    titel: 'Videoproduktion und Fotografie für mittel&shy;ständische Unternehmen',
    einleitung: 'Wir produzieren Imagefilme, Recruitingfilme, Social-Media-Clips und Fotos für Unternehmen in Nordhessen und darüber hinaus: von der Konzeption über Dreh und Schnitt bis zu fertigen Fassungen für Website und Social Media.',
    zweiterKnopf: ['Formate ansehen', '#loesung'],
    bild: { datei: '2026/01/podcast_ederseensucht_setup.jpg', alt: 'Kameras und Licht beim Dreh des Podcasts Ederseensucht', text: 'Dreh des Video-Podcasts „Ederseensucht“' },
    lage: { titel: 'Typische Ausgangslagen bei Film und Foto', punkte: [
      ['Austauschbare Bilder', 'Website und Broschüren zeigen Bilder aus der Bilddatenbank statt das eigene Unternehmen.'],
      ['Erklärungsbedürftige Leistungen', 'Produkte und Abläufe lassen sich in Textform nur schwer vermitteln.'],
      ['Material für nur einen Zweck', 'Ein Film entsteht für einen Anlass und lässt sich danach nicht weiterverwenden.'],
    ] },
    loesung: { titel: 'Formate', zeilen: [
      { titel: 'Imagefilm', text: 'Zeigt Ihr Unternehmen, Ihre Arbeitsweise und Ihre Mitarbeitenden.' },
      { titel: 'Recruitingfilm', text: 'Zeigt Arbeitsalltag und Team für Bewerberinnen und Bewerber.' },
      { titel: 'Social-Media-Clips', text: 'Kurze Videos und Reels, häufig aus dem Material eines Hauptfilms.' },
      { titel: 'Video-Podcast', text: 'Gesprächsformate zur Vermittlung Ihres Fachwissens.' },
      { titel: 'Unternehmens- und Mitarbeiterfotografie', text: 'Porträts, Arbeitsplätze, Produktion und Räume.' },
      { titel: '360°-Rundgang', text: 'Virtueller Rundgang durch Räume und Arbeitsbereiche.', link: ['360°-Rundgänge', '/360-grad-rundgaenge/'] },
    ], bild: { datei: '2026/01/12.-Oktober-2022_B1A4240.jpg', alt: 'Mitarbeitende einer Steuerkanzlei im Gespräch auf einem Sofa', text: 'Mitarbeiterfotografie für die Steuerkanzlei Hentschke – Kohl – Pflug' },
      hinweis: `Aufnahmen entstehen an Ihrem Standort oder in unserem Studio mit Hohlkehle in Edertal. <a href="${STUDIO}">Studio &amp; Vermietung</a>` },
    ergebnis: { titel: 'Was Sie am Ende erhalten', punkte: [
      ['Einsatzfertige Fassungen', 'Hoch- und Querformate, Versionen mit und ohne Untertitel sowie Kurzfassungen für Social Media.'],
      ['Mehrfach nutzbares Material', 'Aus den Aufnahmen eines Drehtags entstehen der Hauptfilm und kurze Clips für weitere Kanäle.'],
      ['Ein realistisches Bild', 'Kunden und Bewerber sehen Ihr Unternehmen, Ihre Arbeitsplätze und Ihre Mitarbeitenden.'],
    ], beispiele: [
      ['Continental, Korbach', 'Imagefilm zum 3D-Druck.'],
      ['Energie Waldeck-Frankenberg', 'Kampagne „ein Leben lang“ mit Film, Foto und Printmedien.'],
      ['Stadt Waldeck', 'Videos aus drei Arbeitsbereichen und 360°-Rundgang für die Karriereseite.'],
    ] },
    ablauf: { titel: 'Ablauf einer Produktion', schritte: [
      ['Analyse und Bedarf', 'Was soll der Film oder das Foto leisten, und auf welchen Kanälen wird es eingesetzt?'],
      ['Konzeption', 'Kernbotschaft, Ablauf und Formate, auf Wunsch mit Skript und Drehplan.'],
      ['Produktion', 'Dreh oder Fotoaufnahmen mit Licht, Ton und Regie, an Ihrem Standort oder im Studio.'],
      ['Postproduktion', 'Schnitt, Ton, Farbkorrektur, Untertitel und Fassungen für die einzelnen Kanäle.'],
    ] },
    referenzen: { titel: 'Einblicke in unsere Filmproduktionen', eintraege: FILMSTILLS },
    kosten: { titel: 'Kosten einer Produktion', html: `<p class="einleitung" style="margin-top:0">Die Kosten hängen vom Format, der Zahl der Drehtage und Drehorte, dem Aufwand in der Postproduktion und den Nutzungsrechten ab.</p>
        <p class="fussnote">Wofür im Einzelnen Kosten entstehen, erläutert der Ratgeber <a href="/was-kostet-ein-imagefilm/">Was kostet ein Imagefilm?</a></p>` },
    fragen: [
      ['Wo produzieren Sie?', 'Unser Schwerpunkt liegt in Nordhessen, unter anderem rund um Kassel, Korbach, Bad Wildungen, Fritzlar, Frankenberg (Eder) und den Edersee. Je nach Projekt drehen wir in ganz Hessen und darüber hinaus.'],
      ['Welche Informationen benötigen Sie zum Start?', 'Vor allem Ziel und Einsatzbereich: Was soll der Film bewirken, und wo wird er eingesetzt? Hilfreich sind außerdem Ihre Gestaltungsvorgaben, ein Überblick über die Zielgruppen und Beispiele, die Ihnen gefallen oder nicht gefallen.'],
      ['Wie laufen Abstimmung und Freigabe ab?', 'Vor der Produktion erhalten Sie ein Konzept, je nach Projekt mit Skript oder Drehplan. In der Postproduktion arbeiten wir mit festen Korrekturschleifen.'],
    ],
  },

  [EXTERN]: {
    kurz: 'Externe Marketingabteilung',
    titel: 'Externe Marketing&shy;abteilung für mittel&shy;ständische Unternehmen',
    einleitung: 'Wir übernehmen Planung und Umsetzung Ihres Marketings: von der Bestandsaufnahme über die Strategie bis zu Website, Social Media, Film, Foto und Print. Ein fester Ansprechpartner steuert alle Maßnahmen.',
    zweiterKnopf: ['Leistungsbereiche ansehen', '#loesung'],
    bild: { datei: '2021/12/vitos_haina_broschueren_flyer_social_media.jpg', alt: 'Broschüren und Flyer für Vitos Haina', text: 'Unternehmenskommunikation für Vitos Haina' },
    lage: { titel: 'Wann eine externe Marketingabteilung sinnvoll ist', punkte: [
      ['Marketing läuft nebenbei', 'Im Tagesgeschäft fehlt die Zeit für Planung und kontinuierliche Umsetzung.'],
      ['Fachwissen fehlt im Haus', 'Website, Social Media, Film und Gestaltung erfordern unterschiedliche Spezialisten.'],
      ['Einzelmaßnahmen ohne Zusammenhang', 'Website, Anzeigen und Drucksachen entstehen getrennt und folgen keiner gemeinsamen Linie.'],
    ] },
    loesung: { titel: 'Leistungsbereiche', zeilen: [
      { titel: 'Marke und Strategie', text: 'Positionierung und Strategie als Grundlage aller Maßnahmen.' },
      { titel: 'Websites, SEO und GEO', text: 'Unternehmenswebsites, die bei relevanten Suchanfragen gefunden werden.', link: ['Websites und SEO', WEB] },
      { titel: 'Social Media und Anzeigen', text: 'Betreuung Ihrer Kanäle und Kampagnen mit regelmäßiger Auswertung.', link: ['Social Media', SOCIAL] },
      { titel: 'Film und Foto', text: 'Foto- und Videomaterial für alle Kanäle.', link: ['Film und Foto', CONTENT] },
      { titel: 'Print und Corporate Design', text: 'Broschüren, Kataloge und Geschäftsausstattung im Erscheinungsbild Ihres Unternehmens.' },
    ], bild: { datei: '2025/02/Website-vierbeiner-reha-zentrum-bad-wildungen.jpg', alt: 'Website des Vierbeiner Reha-Zentrums auf mehreren Bildschirmen', text: 'Vierbeiner Reha-Zentrum: Website, Social Media, SEO und GEO' } },
    ergebnis: { titel: 'Was sich für Ihr Unternehmen ändert', punkte: [
      ['Ein Ansprechpartner', 'Sie stimmen sich mit einer Person ab, die alle Maßnahmen steuert.'],
      ['Abgestimmte Maßnahmen', 'Inhalte werden mehrfach genutzt: Ein Film kommt auf der Website, in Social Media und im Vertrieb zum Einsatz.'],
      ['Nachvollziehbare Ergebnisse', 'Wir legen vorab Kennzahlen fest und berichten regelmäßig.'],
    ], beispiele: [
      ['Vitos Haina', 'Flyer, Broschüren und Anzeigen nach den Gestaltungsvorgaben des Hauses.'],
      ['Klinikgruppe in der Region', 'Dauerhafte Betreuung von Social Media und Patienteninformation.'],
      ['Vierbeiner Reha-Zentrum', 'Website, Social Media sowie SEO und GEO.'],
    ] },
    ablauf: { titel: 'Vorgehen in vier Phasen', schritte: [
      ['Bestandsaufnahme', 'Wir analysieren den Ist-Zustand und prüfen die bestehenden Maßnahmen.'],
      ['Strategie und Konzept', 'Wir definieren messbare Ziele und legen Kanäle und Botschaften fest.'],
      ['Umsetzung', 'Wir setzen die Maßnahmen um, etwa Website-Relaunch, Content-Produktion oder Kampagnen.'],
      ['Auswertung und Weiterentwicklung', 'Wir prüfen fortlaufend, ob die Ziele erreicht werden, und steuern nach.'],
    ] },
    kosten: { titel: 'Umfang und Einstieg', html: `<p class="einleitung" style="margin-top:0">Der Umfang richtet sich nach Ihrem Bedarf. Die meisten Kunden beginnen mit einem einzelnen Projekt und erweitern die Zusammenarbeit schrittweise.</p>` },
    fragen: [
      ['Ist eine externe Marketingabteilung nur für große Unternehmen sinnvoll?', 'Nein. Gerade im Mittelstand müssen begrenzte Budgets effizient eingesetzt werden. Wenn Maßnahmen ineinandergreifen, etwa ein Film für Website, Social Media und Vertrieb, sparen Sie Zeit und Kosten gegenüber getrennten Einzelaufträgen.'],
      ['Müssen wir alles auf einmal umstellen?', 'Nein. Nach der Bestandsaufnahme legen wir Prioritäten fest und setzen den Plan schrittweise um, passend zu Budget und Ressourcen.'],
      ['Wie wird der Erfolg gemessen?', 'Wir definieren vorab Kennzahlen für Ihre Hauptziele, etwa Umsatz, Bewerbungen oder Bekanntheit, und berichten regelmäßig.'],
      ['Wann zeigen sich erste Ergebnisse?', 'Anzeigen auf Social Media wirken kurzfristig. Suchmaschinenoptimierung und Markenaufbau brauchen länger. Beides läuft parallel.'],
    ],
  },

  '/werbeagentur-bad-wildungen-thinkfox-marketing-fuer-den-mittelstand/': {
    kurz: 'Werbeagentur Bad Wildungen', ohneEltern: true, rubrikLage: 'Region',
    titel: 'Werbeagentur für Bad Wildungen und die Edersee-Region',
    einleitung: 'thinkfox marketing hat seinen Sitz in Edertal, zwischen Bad Wildungen und dem Edersee. Wir unterstützen Unternehmen im Landkreis Waldeck-Frankenberg mit Websites, Social Media, Film und Foto.',
    zweiterKnopf: ['Leistungen ansehen', '#loesung'],
    bild: { datei: '2025/02/Website-vierbeiner-reha-zentrum-bad-wildungen.jpg', alt: 'Website des Vierbeiner Reha-Zentrums auf mehreren Bildschirmen', text: 'Website für das Vierbeiner Reha-Zentrum, Bad Wildungen' },
    lage: { titel: 'Eine Agentur aus der Region', punkte: [
      ['Kurze Wege', 'Termine finden bei Ihnen in Bad Wildungen, am Edersee oder an unserem Standort in Edertal statt.'],
      ['Regionale Erfahrung', 'Seit über zehn Jahren arbeiten wir für Unternehmen und Einrichtungen in Waldeck-Frankenberg.'],
      ['Lokale Auffindbarkeit', 'Wir richten Websites auf Suchanfragen aus der Region aus, bei Google und in KI-Suchen.'],
    ] },
    loesung: { titel: 'Leistungen', zeilen: [
      { titel: 'Websites und SEO', text: 'Webauftritte für Gäste und Kunden aus der Region, optimiert für alle Geräte.', link: ['Websites und SEO', WEB] },
      { titel: 'Social Media', text: 'Redaktionsplan, Produktion und Anzeigen mit regionalem Schwerpunkt.', link: ['Social Media', SOCIAL] },
      { titel: 'Film und Foto', text: 'Aufnahmen bei Ihnen vor Ort oder in unserem Studio in Edertal.', link: ['Film und Foto', CONTENT] },
      { titel: 'Marke und Print', text: 'Logos, Corporate Designs und Printmedien.' },
      { titel: 'Externe Marketingabteilung', text: 'Planung und Umsetzung Ihres gesamten Marketings.', link: ['Externe Marketingabteilung', EXTERN] },
    ], bild: { datei: '2026/01/Stadt_waldeck_karriere.jpg', alt: 'Karriereseite der Stadt Waldeck auf Tablets', text: 'Karriereseite der Nationalparkstadt Waldeck' } },
    ergebnis: { titel: 'Was Sichtbarkeit in der Region bewirkt', punkte: [
      ['Kundengewinnung', 'Interessenten aus Bad Wildungen und der Edersee-Region finden Ihr Angebot und nehmen Kontakt auf.'],
      ['Personalgewinnung', 'Bewerberinnen und Bewerber aus der Region lernen Ihr Unternehmen als Arbeitgeber kennen.'],
      ['Einheitlicher Auftritt', 'Website, Social Media und Printmedien folgen einer gemeinsamen Linie.'],
    ], beispiele: [
      ['Vierbeiner Reha-Zentrum, Bad Wildungen', 'Website mit Kursbuchung, Social Media sowie SEO und GEO.'],
      ['Beysshaus, Bad Wildungen und Edertal', '360°-Rundgänge für drei Ferienhäuser.'],
      ['Nationalparkstadt Waldeck', 'Karriereseite mit Videos und 360°-Rundgang.'],
    ] },
    fragen: [
      ['Welche Vorteile hat eine Agentur aus der Region?', 'Kurze Wege und Kenntnis des Marktes in Nordhessen. Beratungstermine finden bei Ihnen vor Ort oder an unserem Standort in Edertal statt.'],
      ['Unterstützen Sie auch kleine und mittlere Unternehmen beim Webdesign?', 'Ja. In über zehn Jahren haben wir zahlreiche Projekte für kleine und mittlere Unternehmen umgesetzt. Die Websites sind auf Suchanfragen aus der Region ausgerichtet.'],
    ],
  },
};

export function leistungsSeite(pfad: string): string {
  const s = LEISTUNGSSEITEN[pfad];
  const zeile = (z: Zeile) => `<li class="zeile"><h3>${esc(z.titel)}</h3><p>${esc(z.text)}${z.link ? ` <a class="link" href="${z.link[1]}">${esc(z.link[0])}</a>` : ''}</p></li>`;
  return `<section class="t1 t1--unterseite" aria-labelledby="titel">
    <div class="huelle">
      <nav aria-label="Brotkrumen"><ol class="pfad" role="list"><li><a href="/">Start</a></li>${s.ohneEltern ? '' : '<li><a href="/#leistungen">Leistungen</a></li>'}<li><span aria-current="page">${esc(s.kurz)}</span></li></ol></nav>
      <div class="raster">
        <h1 id="titel">${s.titel}</h1>
        <div class="t1__unten">
          <p class="t1__text">${esc(s.einleitung)}</p>
          <div class="knoepfe">${knopf('Erstgespräch vereinbaren', TERMIN)}${knopf(s.zweiterKnopf[0], s.zweiterKnopf[1], 'rahmen')}</div>
        </div>
      </div>
      <figure class="t1__bild">${web(s.bild.datei, s.bild.alt, '(min-width: 960px) 75vw, 100vw', true)}<figcaption class="bildtext">${esc(s.bild.text)}</figcaption></figure>
    </div>
  </section>

  ${abschnitt({ id: 'lage-titel', rubrik: s.rubrikLage ?? 'Ausgangslage', titel: esc(s.lage.titel), inhalt: drei(s.lage.punkte) })}

  <section class="t3 t3--rechts" id="loesung" aria-labelledby="loesung-titel">
    <div class="huelle raster">
      <div class="t3__text sp-5" style="order:1">
        <p class="label">Lösung</p>
        <h2 id="loesung-titel" class="h2--klein">${esc(s.loesung.titel)}</h2>
        <ul class="zeilen zeilen--eng" role="list">
          ${s.loesung.zeilen.map(zeile).join('\n          ')}
        </ul>
        ${s.loesung.hinweis ? `<p class="fussnote">${s.loesung.hinweis}</p>` : ''}
      </div>
      <figure class="t3__bild sp-7r" style="order:2">${web(s.loesung.bild.datei, s.loesung.bild.alt, '(min-width: 960px) 58vw, 100vw')}<figcaption class="bildtext">${esc(s.loesung.bild.text)}</figcaption></figure>
    </div>
  </section>

  ${abschnitt({ id: 'ergebnis-titel', rubrik: 'Ergebnis', titel: esc(s.ergebnis.titel),
    inhalt: `${drei(s.ergebnis.punkte)}
        <h3 class="unter">Beispiele aus Projekten</h3>
        <ul class="leistungsliste" role="list" style="margin-top:16px">${s.ergebnis.beispiele.map(([k, t]) => `<li><b>${esc(k)}</b><br>${esc(t)}</li>`).join('')}</ul>` })}

  ${s.ablauf ? abschnitt({ id: 'ablauf-titel', cls: 'abschnitt--linie', rubrik: 'Vorgehen', titel: esc(s.ablauf.titel),
    inhalt: `<ol class="ablauf">
          ${s.ablauf.schritte.map(([t, p]) => `<li><b>${esc(t)}</b><span>${esc(p)}</span></li>`).join('\n          ')}
        </ol>` }) : ''}

  ${s.referenzen ? `<section class="t4" aria-labelledby="ref-titel">
    <div class="huelle raster">
      <p class="label sp-label">Referenzen</p>
      <div class="sp-inhalt"><h2 id="ref-titel">${esc(s.referenzen.titel)}</h2></div>
    </div>
    ${bogen('Referenzen, seitlich scrollbar', s.referenzen.eintraege)}
  </section>` : ''}

  ${s.kosten ? abschnitt({ id: 'kosten-titel', anker: 'kosten', rubrik: 'Kosten', titel: esc(s.kosten.titel), inhalt: s.kosten.html }) : ''}

  ${abschnitt({ id: 'faq-titel', cls: 'abschnitt--kalk', rubrik: 'Fragen', titel: 'Häufige Fragen',
    inhalt: `<div class="faq">
          ${s.fragen.map(([f, a]) => `<details class="tf-faq__eintrag"><summary class="tf-faq__frage">${esc(f)}</summary><p>${esc(a)}</p></details>`).join('\n          ')}
        </div>` })}

  ${KONTAKT}`;
}
