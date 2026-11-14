// Kopfzeile im neuen Erscheinungsbild (src/lib/chrome.ts): Aufklapp-Navigation am Desktop und Handy-Menü.
// Klick/Enter/Leertaste öffnet, Maus öffnet beim Überfahren, Escape schließt (Fokus zurück auf den Button),
// Klick daneben oder Fokus außerhalb schließt. Ohne JavaScript bleiben Wortmarke, „Referenzen“ und die Fußzeile bedienbar.
for (const kopf of document.querySelectorAll('.tfk')) {
  const knoepfe = [...kopf.querySelectorAll('.tfk-nav__auf')];
  const panel = (b) => document.getElementById(b.getAttribute('aria-controls'));
  let timer;
  const zu = (b) => { b.setAttribute('aria-expanded', 'false'); panel(b).hidden = true; };
  const alleZu = (ausser) => knoepfe.forEach((b) => { if (b !== ausser) zu(b); });
  const auf = (b) => { alleZu(b); b.setAttribute('aria-expanded', 'true'); panel(b).hidden = false; };

  for (const b of knoepfe) {
    const li = b.closest('.tfk-nav__punkt');
    b.addEventListener('click', () => (b.getAttribute('aria-expanded') === 'true' ? zu(b) : auf(b)));
    li.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { clearTimeout(timer); timer = setTimeout(() => auf(b), 90); } });
    li.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') { clearTimeout(timer); timer = setTimeout(() => zu(b), 220); } });
    li.addEventListener('focusout', (e) => { if (!li.contains(e.relatedTarget)) zu(b); });
    li.addEventListener('keydown', (e) => { if (e.key === 'Escape' && b.getAttribute('aria-expanded') === 'true') { zu(b); b.focus(); } });
  }
  document.addEventListener('click', (e) => { if (!kopf.contains(e.target)) alleZu(); });

  // Handy-Menü
  const m = kopf.querySelector('.tfk-menue-knopf');
  const menue = kopf.querySelector('.tfk-menue');
  if (m && menue) {
    const setze = (offen) => { m.setAttribute('aria-expanded', String(offen)); menue.hidden = !offen; };
    m.addEventListener('click', () => setze(m.getAttribute('aria-expanded') !== 'true'));
    kopf.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menue.hidden) { setze(false); m.focus(); } });
    menue.addEventListener('click', (e) => { if (e.target.closest('a')) setze(false); });
  }
}
