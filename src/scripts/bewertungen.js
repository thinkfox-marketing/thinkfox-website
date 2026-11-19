// Google-Bewertungen (statisches Trustindex-Markup, src/lib/bewertungen.ts): Pfeile zum Blättern und lange Texte gekürzt
// mit „Weiterlesen“. Ohne JavaScript bleibt die wischbare Reihe mit vollständigen Texten (ergaenzungen.css).
const ZEILEN_HINWEIS = 'Ganze Bewertung von ';

function bewertungen(widget) {
  const reihe = widget.querySelector('.ti-reviews-container-wrapper');
  const behaelter = widget.querySelector('.ti-reviews-container');
  // .ti-widget kommt verschachtelt doppelt vor – jede Reihe nur einmal einrichten
  if (!reihe || !behaelter || reihe.dataset.tfBew) return;
  reihe.dataset.tfBew = '1';
  (reihe.closest('.ti-goog') || widget).classList.add('tf-bew');

  // „Weiterlesen“ nur bei Texten, die gekürzt sind
  const knoepfe = [];
  reihe.querySelectorAll('.ti-review-item').forEach((karte, i) => {
    const text = karte.querySelector('.ti-review-content');
    if (!text) return;
    text.id = text.id || `tf-bew-text-${Math.random().toString(36).slice(2, 8)}-${i}`;
    const name = (karte.querySelector('.ti-name')?.textContent || '').trim();
    const knopf = document.createElement('button');
    knopf.type = 'button'; knopf.className = 'tf-bew-mehr'; knopf.setAttribute('aria-controls', text.id);
    knopf.setAttribute('aria-expanded', 'false'); knopf.textContent = 'Weiterlesen';
    if (name) knopf.setAttribute('aria-label', `${ZEILEN_HINWEIS}${name} lesen`);
    knopf.addEventListener('click', () => {
      const offen = karte.classList.toggle('tf-bew-offen');
      knopf.setAttribute('aria-expanded', String(offen));
      knopf.textContent = offen ? 'Weniger anzeigen' : 'Weiterlesen';
      if (name) knopf.setAttribute('aria-label', offen ? `Bewertung von ${name} kürzen` : `${ZEILEN_HINWEIS}${name} lesen`);
    });
    text.after(knopf);
    knoepfe.push([karte, text, knopf]);
  });
  const pruefen = () => knoepfe.forEach(([karte, text, knopf]) => {
    if (karte.classList.contains('tf-bew-offen')) return;
    knopf.hidden = text.scrollHeight <= text.clientHeight + 2;
  });

  // Pfeile: um die sichtbare Breite blättern
  const leiste = document.createElement('div');
  leiste.className = 'tf-bew-pfeile';
  const pfeil = (richtung, label) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = `tf-bew-pfeil tf-bew-pfeil--${richtung}`; b.setAttribute('aria-label', label);
    b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M15.5 4.5 8 12l7.5 7.5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    b.addEventListener('click', () => {
      const schritt = reihe.clientWidth * (richtung === 'vor' ? 1 : -1);
      reihe.scrollBy({ left: schritt, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    });
    leiste.append(b);
    return b;
  };
  const zurueck = pfeil('zurueck', 'Vorherige Bewertungen');
  const vor = pfeil('vor', 'Weitere Bewertungen');
  behaelter.after(leiste);
  const ende = () => {
    const max = reihe.scrollWidth - reihe.clientWidth;
    zurueck.disabled = reihe.scrollLeft <= 2;
    vor.disabled = reihe.scrollLeft >= max - 2;
    leiste.hidden = max <= 2;
  };
  reihe.addEventListener('scroll', () => requestAnimationFrame(ende), { passive: true });
  let rahmen = 0;
  const neu = () => { cancelAnimationFrame(rahmen); rahmen = requestAnimationFrame(() => { pruefen(); ende(); }); };
  window.addEventListener('resize', neu);
  if (document.fonts?.ready) document.fonts.ready.then(neu);
  neu();
}

document.querySelectorAll('.ti-widget').forEach(bewertungen);
