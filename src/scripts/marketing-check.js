// Ergebnisseite des Marketing-Checks (/marketing-check-ergebnis/).
// In WordPress hat ein PHP-Snippet das Ergebnis serverseitig erzeugt. Hier liefert
// api/ajax.php die Punktzahlen je Bereich als Token (?ergebnis=…), die Ausgabe passiert im Browser.
// Texte & Schwellenwerte: BEREICHE / ampel() unten.

const BEREICHE = {
  website_seo: {
    titel: 'Website & SEO',
    rot: 'Eure Website arbeitet noch nicht für euch: Sie bringt kaum Anfragen und wird bei Google schlecht gefunden. Hier liegt das größte Potenzial.',
    gelb: 'Die Basis steht, aber Sichtbarkeit und Anfragen bleiben hinter den Möglichkeiten. Mit gezielter SEO- und Conversion-Optimierung holt ihr deutlich mehr heraus.',
    gruen: 'Eure Website ist gut aufgestellt und bringt regelmäßig Anfragen. Jetzt geht es um Feinschliff und lokale Sichtbarkeit inkl. KI-Suche (GEO).',
  },
  content_social: {
    titel: 'Content & Social Media',
    rot: 'Inhalte entstehen eher zufällig. Ohne regelmäßigen Content fehlt euch Sichtbarkeit – bei Kunden und Bewerbern.',
    gelb: 'Ihr seid aktiv, aber nicht konstant. Ein Redaktionsplan und professionelle Produktion bringen Ruhe und Wirkung rein.',
    gruen: 'Ihr veröffentlicht regelmäßig und zeigt, was ihr könnt. Gezielte Kampagnen und Ads können die Reichweite weiter steigern.',
  },
  strategie: {
    titel: 'Strategie & Klarheit',
    rot: 'Zielgruppe und Maßnahmen sind noch unscharf. Ohne klare Strategie verpufft Budget – hier lohnt sich ein gemeinsamer Workshop.',
    gelb: 'Ihr habt eine Richtung, aber noch keinen klaren Plan. Eine geschärfte Positionierung macht alle weiteren Maßnahmen effizienter.',
    gruen: 'Ihr wisst, wen ihr erreichen wollt, und plant eure Aktivitäten. Sehr gute Grundlage für Wachstum.',
  },
  recruiting: {
    titel: 'Recruiting & Arbeitgebermarke',
    rot: 'Es kommen zu wenige passende Bewerbungen. Eine sichtbare Arbeitgebermarke mit Karriereseite und Recruiting-Content kann das ändern.',
    gelb: 'Bewerbungen kommen, aber nicht in der gewünschten Qualität oder Menge. Authentische Einblicke ins Team machen den Unterschied.',
    gruen: 'Ihr werdet als Arbeitgeber gut wahrgenommen. Bleibt sichtbar, damit das so bleibt.',
  },
  ganzheit: {
    titel: 'Ganzheitliches Marketing & Organisation',
    rot: 'Überblick, Erfolgsmessung und Budget fehlen weitgehend. Eine externe Marketingabteilung schafft Struktur und entlastet euch.',
    gelb: 'Teile laufen, aber nicht aus einem Guss. Klare Zuständigkeiten, Budget und Kennzahlen bringen euer Marketing auf Kurs.',
    gruen: 'Ihr habt euer Marketing gut im Griff. Mit einem festen Partner lässt sich das Tempo halten und weiter ausbauen.',
  },
};

const ampel = (wert) => (wert >= 4 ? 'gruen' : wert >= 2.5 ? 'gelb' : 'rot');
const SYMBOL = { rot: '🔴', gelb: '🟡', gruen: '🟢' };

function lesen() {
  const token = new URLSearchParams(location.search).get('ergebnis');
  if (!token) return null;
  try {
    const json = decodeURIComponent(escape(atob(token.replace(/-/g, '+').replace(/_/g, '/'))));
    const data = JSON.parse(json);
    return data && data.scores ? data : null;
  } catch {
    return null;
  }
}

function el(tag, text, cls) {
  const e = document.createElement(tag);
  if (text) e.textContent = text;
  if (cls) e.className = cls;
  return e;
}

const box = document.querySelector('.thinkfox-check-result');
const data = box && lesen();
if (data) {
  const style = box.querySelector('style');
  box.replaceChildren(...(style ? [style] : []));
  box.append(el('h2', data.firma ? `Dein Ergebnis für ${data.firma}` : 'Dein Ergebnis'));
  box.append(el('p', 'So steht euer Marketing heute da – auf einen Blick:'));

  const liste = el('ul', '', 'thinkfox-result-overview');
  const eintraege = Object.entries(BEREICHE).filter(([key]) => key in data.scores);
  for (const [key, bereich] of eintraege) {
    const wert = Number(data.scores[key]);
    const li = el('li');
    li.append(`${SYMBOL[ampel(wert)]} `, el('strong', bereich.titel), ` – ${wert.toFixed(1).replace('.', ',')} von 5`);
    liste.append(li);
  }
  box.append(liste);

  for (const [key, bereich] of eintraege) {
    box.append(el('h3', bereich.titel));
    box.append(el('p', bereich[ampel(Number(data.scores[key]))]));
  }

  const cta = el('a', 'Kostenloses Erstgespräch vereinbaren', 'button');
  cta.href = '/thinkfox-marketing-projekt-anfragen/';
  box.append(cta);
}
