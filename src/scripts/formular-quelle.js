// Kampagnen-Angaben (utm_*) an die Projektanfrage hängen, damit das CRM sieht, über welche Kampagne eine Anfrage kam.
// Nur die fünf UTM-Parameter, keine Klick-Kennungen (gclid/fbclid). Nichts wird im Browser gespeichert:
// Quelle ist die Adresse der Formularseite selbst oder – einen Schritt zurück – die vorherige Seite auf thinkfox.de.
const SCHLUESSEL = ['source', 'medium', 'campaign', 'term', 'content'];

function utmAus(adresse) {
  try {
    const url = new URL(adresse, location.href);
    if (url.origin !== location.origin) return null;
    const werte = SCHLUESSEL.map((k) => [k, url.searchParams.get('utm_' + k) || '']);
    return werte.some(([, v]) => v) ? werte : null;
  } catch {
    return null;
  }
}

function anhaengen() {
  const formular = document.querySelector('form.forminator-custom-form-11213');
  if (!formular) return;
  const werte = utmAus(location.href) || (document.referrer ? utmAus(document.referrer) : null);
  if (!werte) return;
  for (const [k, v] of werte) {
    if (!v || formular.querySelector(`input[name="tf_utm_${k}"]`)) continue;
    const feld = document.createElement('input');
    feld.type = 'hidden';
    feld.name = 'tf_utm_' + k;
    feld.value = v.slice(0, 255);
    formular.appendChild(feld);
  }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', anhaengen);
else anhaengen();
