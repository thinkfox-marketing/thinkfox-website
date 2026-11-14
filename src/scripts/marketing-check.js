// Ergebnisseite der Marketing-Ampel (/marketing-ampel/ergebnis/, früher /marketing-check-ergebnis/).
// api/ajax.php liefert die Punktzahlen je Bereich als Token (?ergebnis=…), die Ausgabe passiert im Browser.
// Der Token enthält nur Zahlen (kein Firmenname) und wird hier auf 0–5 begrenzt: Ein gebastelter Link
// kann keine fremden Texte auf thinkfox.de anzeigen.
// Texte & Schwellenwerte: BEREICHE / ampel() unten.

const BEREICHE = {
  website_seo: {
    titel: 'Website & SEO',
    rot: 'Ihre Website bringt bisher kaum Anfragen und wird bei Google selten gefunden. Hier liegt das größte Potenzial.',
    gelb: 'Die Grundlage steht, Sichtbarkeit und Anfragen bleiben aber hinter den Möglichkeiten. Suchmaschinenoptimierung und eine klarere Nutzerführung bringen hier am meisten.',
    gruen: 'Ihre Website ist gut aufgestellt und bringt regelmäßig Anfragen. Sinnvoll sind jetzt Feinarbeit sowie die Sichtbarkeit in der regionalen Suche und in KI-Suchen.',
  },
  content_social: {
    titel: 'Content & Social Media',
    rot: 'Inhalte entstehen bisher unregelmäßig. Ohne laufende Veröffentlichungen fehlt Sichtbarkeit bei Kunden und Bewerbern.',
    gelb: 'Sie veröffentlichen, aber nicht durchgehend. Ein Redaktionsplan und eine feste Produktion sorgen für Regelmäßigkeit.',
    gruen: 'Sie veröffentlichen regelmäßig und zeigen, was Ihr Unternehmen leistet. Anzeigen und Kampagnen können die Reichweite weiter erhöhen.',
  },
  strategie: {
    titel: 'Strategie & Klarheit',
    rot: 'Zielgruppe und Maßnahmen sind noch nicht klar festgelegt. Ohne diese Grundlage wird Budget wenig wirksam eingesetzt. Hier empfiehlt sich ein gemeinsamer Workshop.',
    gelb: 'Die Richtung ist erkennbar, ein verbindlicher Plan fehlt noch. Eine geschärfte Positionierung macht alle weiteren Maßnahmen wirksamer.',
    gruen: 'Sie wissen, wen Sie erreichen wollen, und planen Ihre Maßnahmen. Das ist eine gute Grundlage für den weiteren Ausbau.',
  },
  recruiting: {
    titel: 'Recruiting & Arbeitgebermarke',
    rot: 'Es kommen zu wenige passende Bewerbungen. Eine Karriereseite und Einblicke in den Arbeitsalltag machen Ihr Unternehmen als Arbeitgeber sichtbar.',
    gelb: 'Bewerbungen kommen, aber nicht in der gewünschten Zahl oder Eignung. Einblicke in Team und Arbeitsalltag verbessern die Passung.',
    gruen: 'Ihr Unternehmen wird als Arbeitgeber gut wahrgenommen. Mit regelmäßigen Einblicken bleibt das so.',
  },
  ganzheit: {
    titel: 'Organisation & Steuerung',
    rot: 'Überblick, Erfolgsmessung und Budget fehlen weitgehend. Eine externe Marketingabteilung übernimmt Planung und Umsetzung und entlastet Sie.',
    gelb: 'Einzelne Maßnahmen laufen, sind aber nicht aufeinander abgestimmt. Klare Zuständigkeiten, ein Budget und Kennzahlen schaffen Verbindlichkeit.',
    gruen: 'Ihr Marketing ist gut organisiert. Mit einem festen Ansprechpartner lässt sich dieser Stand halten und ausbauen.',
  },
};

const ampel = (wert) => (wert >= 4 ? 'gruen' : wert >= 2.5 ? 'gelb' : 'rot');
const SYMBOL = { rot: '🔴', gelb: '🟡', gruen: '🟢' };
// Status auch als Text (Screenreader sagen sonst nur „roter Kreis“)
const STATUS = { rot: 'Handlungsbedarf', gelb: 'Ausbaufähig', gruen: 'Gut aufgestellt' };
const KALENDER = 'https://crm.thinkfox.marketing/termin.php';

function lesen() {
  const token = new URLSearchParams(location.search).get('ergebnis');
  if (!token) return null;
  try {
    const json = decodeURIComponent(escape(atob(token.replace(/-/g, '+').replace(/_/g, '/'))));
    const data = JSON.parse(json);
    if (!data || typeof data.scores !== 'object') return null;
    // nur bekannte Bereiche, nur Zahlen zwischen 0 und 5
    const scores = {};
    for (const key of Object.keys(BEREICHE)) {
      const wert = Number(data.scores[key]);
      if (Number.isFinite(wert)) scores[key] = Math.min(5, Math.max(0, wert));
    }
    return Object.keys(scores).length ? { scores } : null;
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
  box.append(el('h2', 'So steht Ihr Marketing heute da'));

  const liste = el('ul', '', 'thinkfox-result-overview');
  const eintraege = Object.entries(BEREICHE).filter(([key]) => key in data.scores);
  for (const [key, bereich] of eintraege) {
    const wert = data.scores[key];
    const farbe = ampel(wert);
    const li = el('li');
    const symbol = el('span', `${SYMBOL[farbe]} `);
    symbol.setAttribute('aria-hidden', 'true');
    li.append(symbol, el('strong', bereich.titel), ` – ${wert.toFixed(1).replace('.', ',')} von 5 · ${STATUS[farbe]}`);
    liste.append(li);
  }
  box.append(liste);

  for (const [key, bereich] of eintraege) {
    box.append(el('h3', bereich.titel));
    box.append(el('p', bereich[ampel(data.scores[key])]));
  }

  // Termin statt zweitem Formular: Beschriftung = Ziel (Kalender)
  const cta = el('a', '', 'elementor-button');
  cta.href = KALENDER;
  cta.target = '_blank';
  cta.rel = 'noopener';
  cta.title = 'Termin im Kalender auswählen (öffnet in neuem Tab)';
  cta.append(el('span', 'Ergebnis im Erstgespräch besprechen', 'elementor-button-content-wrapper'));
  box.append(cta);
}
