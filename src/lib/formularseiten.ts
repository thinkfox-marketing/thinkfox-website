// Formularseiten (Projektanfrage, Marketing-Ampel, Ergebnis) in Sie-Form und im Wording des Relaunchs.
// Die drei Seiten bleiben wegen der Forminator-Formulare im Elementor-Rahmen (Legacy.astro); das Formular-Markup
// (Feldnamen, Werte, Skripte) bleibt unverändert. Ersetzt werden nur sichtbare Texte: Textknoten, Platzhalter,
// title-/aria-label-Attribute und die Fehlermeldungen in den Forminator-Einstellungen – nie value="…" (die Werte
// wertet api/ajax.php aus). Findet eine Ersetzung ihren Ausgangstext nicht mehr, bricht der Build ab: so fällt auf,
// wenn sich die Vorlage (src/legacy/pages/*.json) ändert. Gestaltung: public/css/formular.css.

type Paar = [alt: string, neu: string, ganz?: true]; // ganz: der Textknoten muss genau so lauten

const GEMEINSAM: Paar[] = [
  ['Bitte fülle dieses Feld nicht aus.', 'Bitte füllen Sie dieses Feld nicht aus.'],
  ['Deine Telefonnummer', 'Telefonnummer'],
];

const ANFRAGE: Paar[] = [
  ['Jetzt thinkfox marketing Projekt anfragen', 'Projektanfrage'],
  ['Wie kann thinkfox dich unterstützen?', 'Wobei können wir Sie unterstützen?'],
  ['Welche Themen sind für dich relevant und was erwartest du von einer Zusammenarbeit mit thinkfox marketing? Jetzt unverbindlich Projekt anfragen – wir sind gespannt auf dich und deine Marke! Du möchtest lieber eine E-Mail schreiben oder uns anrufen? Hier geht es zum ',
    'Mit wenigen Angaben können wir Ihre Anfrage einordnen und uns gezielt bei Ihnen melden. Die Anfrage ist unverbindlich. Wenn Sie lieber schreiben oder anrufen möchten: Hier geht es zum '],
  ['Bei welchem Thema dürfen wir dich unterstützen?', 'Bei welchem Thema können wir Sie unterstützen?'],
  ['StartUp? Dann einmal mit &quot;Alles&quot; bitte!', 'Unternehmensgründung: gesamter Auftritt'],
  ['StartUp? Dann einmal mit "Alles" bitte!', 'Unternehmensgründung: gesamter Auftritt'],
  ['Was benötigst du deiner Meinung nach am dringendsten?', 'Was benötigen Sie aus Ihrer Sicht am dringendsten?'],
  ['SocialMedia Betreuung', 'Social-Media-Betreuung'],
  ['Spannende Inhalte (Imagefilm, Fotoproduktion etc.)', 'Film und Foto (Imagefilm, Fotoproduktion etc.)'],
  ['Beratung, Ideen &amp; Konzepte', 'Beratung und Konzeption'],
  ['Ganzheitliches Marketing/Unterstützung', 'Laufende Marketingbetreuung'],
  ['Wer kümmert sich aktuell um dein Marketing?', 'Wer betreut Ihr Marketing derzeit?'],
  ['Weiß nicht genau, wahrscheinlich niemand ...?', 'Derzeit ist niemand fest zuständig'],
  ['Wie können wir dich erreichen?', 'Wie erreichen wir Sie?'],
  ['Deine geschäftliche E-Mail Adresse', 'Geschäftliche E-Mail-Adresse'],
  ['Dein Vor- und Nachname', 'Vor- und Nachname'],
];

const AMPEL: Paar[] = [
  ['Marketing-Ampel: Wo steht dein Marketing?', 'Marketing-Ampel: Wo steht Ihr Marketing?'],
  ['bekommst du in wenigen Minuten eine ehrliche Momentaufnahme deiner aktuellen Situation. Du siehst klar, wo du gerade gut aufgestellt bist und wo du ',
    'erhalten Sie in wenigen Minuten eine Einschätzung Ihrer aktuellen Situation. Sie sehen, wo Ihr Unternehmen gut aufgestellt ist und wo es '],
  ['liegen lässt. Auf dieser Basis kannst du gezielt entscheiden, welche Baustellen du zuerst angehst – und ob wir dich dabei unterstützen sollen. Du hast vorab Fragen zur Marketing-Ampel? Dann ',
    'verliert. Auf dieser Grundlage entscheiden Sie, welche Themen Sie zuerst angehen und ob wir Sie dabei unterstützen sollen. Fragen vorab beantworten wir über die '],
  ['kontaktiere', 'Kontaktseite', true],
  [' uns gerne.', '.', true],
  ['Optional Rückruf &amp; individuelle Maßnahmen', 'Auf Wunsch Rückruf und Empfehlungen'],
  ['Wähle deine Branche', 'Branche'],
  ['Deine Rolle im Unternehmen', 'Ihre Rolle im Unternehmen'],
  ['Bitte wähle eine Option', 'Bitte auswählen'],
  ['Hand aufs Herz: Wie gut funktioniert deine Website aktuell für neue Anfragen?', 'Wie gut funktioniert Ihre Website derzeit für neue Anfragen?'],
  ['1 – Eigentlich nur Visitenkarte', '1 – Reine Visitenkarte'],
  ['3 – Ab und zu kommt was', '3 – Gelegentlich Anfragen'],
  ['5 – Bringt konstant gute Leads', '5 – Bringt laufend passende Anfragen'],
  ['Wenn jemand nach deinen Leistungen und deinem Ort googelt – wie sichtbar bist du?', 'Wie sichtbar ist Ihr Unternehmen, wenn jemand bei Google nach Ihren Leistungen und Ihrem Ort sucht?'],
  ['5 – Wir dominieren die Ergebnisse bei unseren Kernleistungen in der Region', '5 – Wir stehen bei unseren Kernleistungen in der Region ganz vorn'],
  ['Wie aktuell sind Inhalte, Bilder und Referenzen auf deiner Website?', 'Wie aktuell sind Inhalte, Bilder und Referenzen auf Ihrer Website?'],
  ['1 – Viele Inhalte sind deutlich veraltet – wir erkennen uns selbst kaum wieder', '1 – Viele Inhalte sind deutlich veraltet'],
  ['2 – Ein Teil ist aktuell, aber vieles wirkt noch „von früher“', '2 – Ein Teil ist aktuell, vieles aber nicht mehr'],
  ['Referenzen und Bilder könnten frischer sein', 'Referenzen und Bilder könnten aktueller sein'],
  ['Wie regelmäßig veröffentlicht dein Unternehmen Inhalte', 'Wie regelmäßig veröffentlicht Ihr Unternehmen Inhalte'],
  ['3 – Es geht irgendwie dazwischen', '3 – Wird nebenbei erledigt'],
  ['Wie klar ist definiert, wer deine Wunschkunden sind?', 'Wie klar ist definiert, wer Ihre Wunschkunden sind?'],
  ['5 – Glasklar inkl. Profilen', '5 – Klar definiert, mit Zielgruppenprofilen'],
  ['Wie geplant sind deine Marketing-Aktivitäten?', 'Wie geplant sind Ihre Marketing-Aktivitäten?'],
  ['1 – Fast nur spontaner Aktionismus', '1 – Fast nur spontane Einzelaktionen'],
  ['Bekommst du aktuell genug passende Bewerbungen?', 'Erhalten Sie derzeit genug passende Bewerbungen?'],
  ['3 – Mal so, mal so', '3 – Schwankend'],
  ['Wie gut wird dein Unternehmen als Arbeitgeber von außen wahrgenommen?', 'Wie gut wird Ihr Unternehmen als Arbeitgeber von außen wahrgenommen?'],
  ['3 – Mittel – man kennt uns etwas', '3 – Teilweise bekannt'],
  ['Ganzheitliches Marketing &amp; Organisation', 'Organisation &amp; Steuerung'],
  ['Wie gut hast du den Überblick über deine Marketing-Aktivitäten?', 'Wie gut haben Sie den Überblick über Ihre Marketing-Aktivitäten?'],
  ['2 – Grobe Ahnung', '2 – Grober Überblick'],
  ['Wie konkret misst du den Erfolg deines Marketings?', 'Wie konkret messen Sie den Erfolg Ihres Marketings?'],
  ['Wie klar ist dein Marketing-Budget definiert?', 'Wie klar ist Ihr Marketing-Budget definiert?'],
  ['Deine ', '', true],
  ['Schmerzpunkte &amp; noch 2 Fragen', 'Handlungsbedarf und zwei offene Fragen'],
  ['Ok, wo drückt der Schuh deiner Meinung nach am meisten?', 'Wo sehen Sie den größten Handlungsbedarf?'],
  ['Irgendwie überall ein bisschen', 'In mehreren Bereichen'],
  ['Wenn du eine Marketing-Baustelle sofort gelöst haben könntest – welche wäre das?', 'Welche Marketing-Aufgabe würden Sie am liebsten sofort lösen?'],
  ['Was hat in der Vergangenheit im Marketing schon nicht so funktioniert, wie du es dir erhofft hast?', 'Was hat im Marketing bisher nicht so funktioniert, wie Sie es erwartet haben?'],
  ['Schritt 8 – Fast geschafft: deine Kontaktdaten &amp; Einwilligung', 'Schritt 8 – Kontaktdaten und Einwilligung'],
  ['Wie können wir dich erreichen? (freiwillig)', 'Wie erreichen wir Sie? (freiwillig)'],
  ['Deine E-Mail Adresse (freiwillig)', 'E-Mail-Adresse (freiwillig)'],
  ['Deine Website', 'Website'],
  ['Dein Name', 'Name', true],
  ['Deine E-Mail', 'E-Mail-Adresse', true],
  ['thinkfox darf sich bei mir melden!', 'thinkfox darf sich bei mir melden'],
  ['Eine persönliche Kontaktaufnahme erfolgt nur, wenn du ihr ausdrücklich zustimmst.', 'Eine persönliche Kontaktaufnahme erfolgt nur, wenn Sie ihr ausdrücklich zustimmen.'],
];

const ERGEBNIS: Paar[] = [
  ['Deine Marketing-Ampel', 'Ihre Marketing-Ampel'],
  ['Vielen Dank für deine Einschätzung, hier siehst du unsere Auswertung und mögliche Handlungsempfehlungen. Bei Fragen wende dich gerne an uns unter hallo@thinkfox.de oder die ',
    'Vielen Dank für Ihre Einschätzung. Hier sehen Sie unsere Auswertung und mögliche Handlungsempfehlungen. Bei Fragen erreichen Sie uns unter hallo@thinkfox.de oder über die '],
  ['Ups – hier fehlt noch dein Ergebnis', 'Es liegt noch kein Ergebnis vor'],
  ['Sieht so aus, als wärst du direkt auf der Ergebnis-Seite gelandet. Bitte starte zuerst die Marketing-Ampel.', 'Sie haben die Ergebnisseite direkt aufgerufen. Bitte füllen Sie zuerst die Marketing-Ampel aus.'],
];

const SEITEN: Record<string, Paar[]> = {
  '/thinkfox-marketing-projekt-anfragen/': [...GEMEINSAM, ...ANFRAGE],
  '/marketing-ampel/': [...GEMEINSAM, ...AMPEL],
  '/marketing-ampel/ergebnis/': ERGEBNIS,
};

// Fehlermeldungen in den Forminator-Einstellungen (JSON in <script>, Umlaute dort als \u…-Folgen)
const MELDUNGEN: [RegExp, string][] = [
  [/Bitte versuche es erneut/g, 'Bitte versuchen Sie es erneut'],
  [/fe deine URL\./g, 'fen Sie die Adresse.'],
  [/Bitte gib den Namen deines Unternehmens ein\./g, 'Bitte geben Sie den Namen Ihres Unternehmens ein.'],
  [/Bitte gib eine g/g, 'Bitte geben Sie eine g'],
];

export const istFormularseite = (pfad: string) => pfad in SEITEN;

/** Fehlermeldungen in eingebetteten Skripten (Forminator) in Sie-Form. */
export function sieFormSkript(inline: string): string {
  return MELDUNGEN.reduce((s, [von, nach]) => s.replace(von, nach), inline);
}

/** Sichtbare Texte einer Formularseite in Sie-Form. */
export function sieForm(pfad: string, main: string): string {
  const paare = SEITEN[pfad];
  if (!paare) return main;
  const benutzt = new Set<Paar>();
  const ersetzen = (text: string) => {
    for (const p of paare) {
      const [alt, neu, ganz] = p;
      if (ganz) { if (text === alt) { text = neu; benutzt.add(p); } }
      else if (text.includes(alt)) { text = text.replaceAll(alt, neu); benutzt.add(p); }
    }
    return text;
  };
  const html = main.split(/(<(?:script|style)\b[\s\S]*?<\/(?:script|style)>)/).map((teil, i) => (i % 2
    ? sieFormSkript(teil)
    : teil
      .replace(/>([^<>]+)</g, (_m, text: string) => `>${ersetzen(text)}<`)
      .replace(/\s(title|placeholder|data-placeholder|aria-label)="([^"]*)"/g, (_m, name: string, wert: string) => ` ${name}="${ersetzen(wert)}"`)
  )).join('');
  const offen = paare.filter((p) => !benutzt.has(p)).map(([alt]) => alt.slice(0, 60));
  if (offen.length) throw new Error(`formularseiten.ts: Ausgangstext nicht gefunden auf ${pfad}: ${offen.join(' | ')}`);
  return html;
}
