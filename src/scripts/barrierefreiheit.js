// Auswahlfelder mit Suchfunktion (select2, Marketing-Check): Das Plugin erzeugt eine eigene
// Combobox ohne zugänglichen Namen – mit dem Label des ursprünglichen Felds verknüpfen.
function beschriften() {
  for (const select of document.querySelectorAll('select.forminator-select2')) {
    const combobox = select.nextElementSibling?.querySelector('[role="combobox"]');
    const label = document.querySelector(`label[for="${CSS.escape(select.id)}"]`);
    if (!combobox || !label || combobox.hasAttribute('aria-labelledby')) continue;
    if (!label.id) label.id = `${select.id}-label`;
    combobox.setAttribute('aria-labelledby', label.id);
  }
}

if (document.querySelector('select.forminator-select2')) {
  // select2 wird von Forminator nach dem Laden erzeugt
  new MutationObserver(beschriften).observe(document.body, { childList: true, subtree: true });
  window.addEventListener('load', beschriften);
}

// ----------------------------------------------------------------------------------------------
// Review 03.11.2026: Korrekturen, die erst zur Laufzeit möglich sind (Elementor/Swiper erzeugen das Markup)

// Kopie der Kopfzeile (Sticky-Platzhalter): nicht fokussierbar, nicht vorgelesen, keine doppelten IDs
function platzhalterEntschaerfen() {
  for (const p of document.querySelectorAll('.elementor-sticky__spacer:not([data-tf])')) {
    p.dataset.tf = '1';
    p.inert = true;
    p.setAttribute('aria-hidden', 'true');
    for (const el of [p, ...p.querySelectorAll('[id]')]) el.removeAttribute('id');
  }
}

// Kopien in Endlos-Slidern (Swiper legt Folien doppelt an): aus Tab-Reihenfolge und Vorlesen nehmen
function kopienEntschaerfen() {
  // nicht „inert“: sichtbare Kopien müssen per Maus klickbar bleiben
  for (const k of document.querySelectorAll('.swiper-slide-duplicate:not([data-tf])')) {
    k.dataset.tf = '1';
    k.setAttribute('aria-hidden', 'true');
    for (const f of k.querySelectorAll('a, button, input, select, textarea, [tabindex]')) f.setAttribute('tabindex', '-1');
    for (const el of [k, ...k.querySelectorAll('[id]')]) el.removeAttribute('id'); // keine doppelten IDs
  }
}

// Akkordeon (Mietstudio): aria-expanded mit dem sichtbaren Zustand koppeln
function akkordeonZustand() {
  for (const k of document.querySelectorAll('.eael-accordion-header[role="button"]')) {
    const offen = k.classList.contains('active');
    if (k.getAttribute('aria-expanded') !== String(offen)) k.setAttribute('aria-expanded', String(offen));
  }
}

// Elementor-Hilfselement (gibt per CSS „desktop/mobile“ aus) und Popup-Reste nicht vorlesen
function stoerendesAusblenden() {
  document.getElementById('elementor-device-mode')?.setAttribute('aria-hidden', 'true');
}

let geplant = false;
const pruefen = () => {
  geplant = false;
  platzhalterEntschaerfen(); kopienEntschaerfen(); akkordeonZustand(); stoerendesAusblenden();
};
// höchstens einmal je Bild (Slider ändern laufend Klassen)
new MutationObserver(() => { if (!geplant) { geplant = true; requestAnimationFrame(pruefen); } })
  .observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
window.addEventListener('load', pruefen);

// Schein-Buttons (Links/Divs mit role="button"): Leertaste wie Klick, Enter für Nicht-Links (WCAG 2.1.1)
document.addEventListener('keydown', (e) => {
  const el = e.target instanceof Element ? e.target.closest('[role="button"]') : null;
  if (!el || el.tagName === 'BUTTON' || el.tagName === 'INPUT' || el.tagName === 'SUMMARY') return;
  // Akkordeon (Essential Addons) löst Enter/Leertaste selbst aus – nur das Seiten-Scrollen der Leertaste verhindern
  if (el.classList.contains('eael-accordion-header')) {
    if (e.key === ' ') e.preventDefault();
    return;
  }
  if (e.key === ' ' || (e.key === 'Enter' && el.tagName !== 'A')) {
    e.preventDefault();
    el.click();
  }
});

// Nach-oben-Knopf: Fokus an den Seitenanfang, damit Tastaturnutzer nicht am Seitenende bleiben
document.addEventListener('click', (e) => {
  if (!(e.target instanceof Element) || !e.target.closest('.eael-ext-scroll-to-top-button')) return;
  const ziel = document.querySelector('.tf-sprung');
  if (ziel) setTimeout(() => ziel.focus({ preventScroll: true }), 400);
});

// Pause-Knopf für automatisch laufende Slider und das Logo-Laufband (WCAG 2.2.2)
const PAUSE = '<svg class="tf-bewegung__aus" viewBox="0 0 16 16" aria-hidden="true"><rect x="3" y="2" width="3.5" height="12"/><rect x="9.5" y="2" width="3.5" height="12"/></svg>';
const PLAY = '<svg class="tf-bewegung__an" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2l10 6-10 6z"/></svg>';
function pauseKnoepfe() {
  for (const el of document.querySelectorAll('.swiper, .swiper-container')) {
    const sw = el.swiper;
    if (!sw || !sw.params?.autoplay?.enabled || el.dataset.tfPause) continue;
    el.dataset.tfPause = '1';
    const knopf = document.createElement('button');
    knopf.type = 'button';
    knopf.className = 'tf-bewegung';
    // fester Name + Zustand (wie der Video-Knopf): „Bewegung anhalten, gedrückt“ = angehalten
    knopf.setAttribute('aria-label', el.closest('.eael-logo-carousel-wrap, .eael-logo-carousel') || el.classList.contains('eael-logo-carousel') ? 'Logo-Laufband anhalten' : 'Slider anhalten');
    knopf.title = 'Bewegung anhalten';
    knopf.setAttribute('aria-pressed', String(matchMedia('(prefers-reduced-motion: reduce)').matches)); // dann schon angehalten
    if (knopf.getAttribute('aria-label') === 'Logo-Laufband anhalten') knopf.classList.add('tf-bewegung--laufband');
    knopf.innerHTML = `${PAUSE}${PLAY}`;
    knopf.addEventListener('click', () => {
      const anhalten = knopf.getAttribute('aria-pressed') !== 'true';
      if (anhalten) sw.autoplay.stop(); else sw.autoplay.start();
      knopf.setAttribute('aria-pressed', String(anhalten));
    });
    // Knopf neben den Slider (nicht hinein: Swiper verschiebt seinen Inhalt)
    const huelle = el.parentElement;
    if (getComputedStyle(huelle).position === 'static') huelle.style.position = 'relative';
    huelle.appendChild(knopf);
  }
}
window.addEventListener('load', () => {
  let n = 0;
  const t = setInterval(() => { pauseKnoepfe(); if (++n > 10) clearInterval(t); }, 500);
});

// Mobil: Leistungs-Kreise als Auswahl (einheitlich.css, 5b) auf der Startseite und den Leistungsseiten. Ein Tipp (oder Enter/Leertaste) auf einen Kreis
// zeigt seinen Text; die Kreise sind dann Schaltflächen mit Zustand (aria-expanded), die Texte Bereiche mit Bezug zum Kreis. Auf dem Desktop passiert nichts.
const KREIS_GRUPPEN = [
  { raster: '23c8bed', paare: [['42192f4', '7eb6f8f'], ['c1f37bf', 'a0792be'], ['40b09e2', 'b4c170d'], ['0ffa944', '1dc3daa']] },
  { raster: 'bb13776', paare: [['52f314b', 'f2361cc'], ['0cb7327', '8629023'], ['70e35cb', '5da47f6'], ['f8dcb27', 'b27f4ed']] },
];
function kreisAuswahl({ raster: rasterId, paare: ids }) {
  const raster = document.querySelector(`.elementor-element-${rasterId}`);
  if (!raster) return;
  const paare = ids.map(([k, t]) => [raster.querySelector(`.elementor-element-${k}`), raster.querySelector(`.elementor-element-${t}`)]).filter(([k, t]) => k && t);
  if (paare.length < 2) return;
  const mq = window.matchMedia('(max-width: 767px)');
  const waehlen = (n) => paare.forEach(([k, t], i) => {
    k.classList.toggle('tf-aktiv', i === n); t.classList.toggle('tf-aktiv', i === n);
    k.setAttribute('aria-expanded', String(i === n));
  });
  const handler = paare.map((_, n) => [() => waehlen(n), (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); waehlen(n); } }]);
  const links = paare.map(() => null);
  const an = () => {
    raster.classList.add('tf-auswahl');
    paare.forEach(([k, t], n) => {
      t.id = t.id || `tf-leistung-text-${n + 1}`; k.id = k.id || `tf-leistung-${n + 1}`;
      k.setAttribute('role', 'button'); k.tabIndex = 0; k.setAttribute('aria-controls', t.id);
      t.setAttribute('role', 'region'); t.setAttribute('aria-labelledby', k.id);
      k.classList.toggle('tf-lang', k.textContent.replace(/\s+/g, ' ').trim().length > 22);
      // Link im Kreis: mobil kein Link (ein Tipp wählt aus), stattdessen „Mehr zu …“ im Text
      const a = k.querySelector('a[href]'); const beschr = t.querySelector('.elementor-icon-box-description');
      if (a && beschr) {
        const mehr = document.createElement('a'); mehr.className = 'tf-mehr'; mehr.href = a.getAttribute('href');
        mehr.textContent = `Mehr zu ${k.textContent.trim().replace(/\s+/g, ' ')}`; beschr.append(mehr);
        links[n] = { a, href: a.getAttribute('href'), mehr }; a.removeAttribute('href');
      }
      k.addEventListener('click', handler[n][0]); k.addEventListener('keydown', handler[n][1]);
    });
    waehlen(0);
  };
  const aus = () => {
    raster.classList.remove('tf-auswahl');
    paare.forEach(([k, t], n) => {
      for (const a of ['role', 'tabindex', 'aria-controls', 'aria-expanded']) k.removeAttribute(a);
      for (const a of ['role', 'aria-labelledby']) t.removeAttribute(a);
      k.classList.remove('tf-aktiv', 'tf-lang'); t.classList.remove('tf-aktiv');
      k.removeEventListener('click', handler[n][0]); k.removeEventListener('keydown', handler[n][1]);
      if (links[n]) { links[n].a.setAttribute('href', links[n].href); links[n].mehr.remove(); links[n] = null; }
    });
  };
  const pruefen = () => (mq.matches ? an() : aus());
  pruefen();
  mq.addEventListener('change', pruefen);
}
KREIS_GRUPPEN.forEach(kreisAuswahl);
