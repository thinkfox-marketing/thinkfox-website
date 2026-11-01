// Ergebnisseite der Marketing-Ampel (/marketing-ampel/ergebnis/, früher /marketing-check-ergebnis/).
// api/ajax.php liefert die Punktzahlen je Bereich als Token (?ergebnis=…), die Ausgabe passiert im Browser.
// Der Token enthält nur Zahlen (kein Firmenname) und wird hier auf 0–5 begrenzt: Ein gebastelter Link
// kann keine fremden Texte auf thinkfox.de anzeigen.
// Texte & Schwellenwerte: BEREICHE / ampel() unten.

const BEREICHE = {
  website_seo: {
    titel: 'Website & SEO',
    rot: 'Deine Website arbeitet noch nicht für dich: Sie bringt kaum Anfragen und wird bei Google schlecht gefunden. Hier liegt das größte Potenzial.',
    gelb: 'Die Basis steht, aber Sichtbarkeit und Anfragen bleiben hinter den Möglichkeiten. Mit gezielter SEO- und Conversion-Optimierung holst du deutlich mehr heraus.',
    gruen: 'Deine Website ist gut aufgestellt und bringt regelmäßig Anfragen. Jetzt geht es um Feinschliff und lokale Sichtbarkeit inkl. KI-Suche (GEO).',
  },
  content_social: {
    titel: 'Content & Social Media',
    rot: 'Inhalte entstehen eher zufällig. Ohne regelmäßigen Content fehlt dir Sichtbarkeit – bei Kunden und Bewerbern.',
    gelb: 'Du bist aktiv, aber nicht konstant. Ein Redaktionsplan und professionelle Produktion bringen Ruhe und Wirkung rein.',
    gruen: 'Du veröffentlichst regelmäßig und zeigst, was dein Unternehmen kann. Gezielte Kampagnen und Anzeigen können die Reichweite weiter steigern.',
  },
  strategie: {
    titel: 'Strategie & Klarheit',
    rot: 'Zielgruppe und Maßnahmen sind noch unscharf. Ohne klare Strategie verpufft Budget – hier lohnt sich ein gemeinsamer Workshop.',
    gelb: 'Du hast eine Richtung, aber noch keinen klaren Plan. Eine geschärfte Positionierung macht alle weiteren Maßnahmen effizienter.',
    gruen: 'Du weißt, wen du erreichen willst, und planst deine Aktivitäten. Sehr gute Grundlage für Wachstum.',
  },
  recruiting: {
    titel: 'Recruiting & Arbeitgebermarke',
    rot: 'Es kommen zu wenige passende Bewerbungen. Eine sichtbare Arbeitgebermarke mit Karriereseite und Recruiting-Content kann das ändern.',
    gelb: 'Bewerbungen kommen, aber nicht in der gewünschten Qualität oder Menge. Authentische Einblicke ins Team machen den Unterschied.',
    gruen: 'Dein Unternehmen wird als Arbeitgeber gut wahrgenommen. Bleib sichtbar, damit das so bleibt.',
  },
  ganzheit: {
    titel: 'Ganzheitliches Marketing & Organisation',
    rot: 'Überblick, Erfolgsmessung und Budget fehlen weitgehend. Eine externe Marketingabteilung schafft Struktur und entlastet dich.',
    gelb: 'Teile laufen, aber nicht aus einem Guss. Klare Zuständigkeiten, Budget und Kennzahlen bringen dein Marketing auf Kurs.',
    gruen: 'Du hast dein Marketing gut im Griff. Mit einem festen Partner lässt sich das Tempo halten und weiter ausbauen.',
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
  box.append(el('h2', 'So steht dein Marketing heute da'));

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
