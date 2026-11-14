// Mega-Menü (Desktop): Disclosure-Navigation – Klick/Enter/Leertaste öffnet, Maus öffnet beim Überfahren,
// Escape schließt (Fokus zurück auf den Button), Klick daneben oder Fokus außerhalb schließt. Markup: src/lib/megamenu.ts.
// Die unsichtbare Sticky-Kopie der Kopfzeile (.elementor-sticky__spacer) bekommt keine Bedienung.
for (const nav of document.querySelectorAll('.tf-mega')) {
  if (nav.closest('.elementor-sticky__spacer')) continue;
  const knoepfe = [...nav.querySelectorAll('.tf-mega__auf')];
  const panel = (b) => document.getElementById(b.getAttribute('aria-controls')) || b.nextElementSibling;
  let timer;

  const zu = (b) => { b.setAttribute('aria-expanded', 'false'); panel(b).hidden = true; };
  const alleZu = (ausser) => knoepfe.forEach((b) => { if (b !== ausser) zu(b); });
  const auf = (b) => { alleZu(b); b.setAttribute('aria-expanded', 'true'); panel(b).hidden = false; };

  for (const b of knoepfe) {
    const li = b.closest('.tf-mega__punkt');
    b.addEventListener('click', () => (b.getAttribute('aria-expanded') === 'true' ? zu(b) : auf(b)));
    li.addEventListener('pointerenter', (e) => {
      if (e.pointerType !== 'mouse') return;
      clearTimeout(timer); timer = setTimeout(() => auf(b), 90);
    });
    li.addEventListener('pointerleave', (e) => {
      if (e.pointerType !== 'mouse') return;
      clearTimeout(timer); timer = setTimeout(() => zu(b), 220);
    });
    li.addEventListener('focusout', (e) => { if (!li.contains(e.relatedTarget)) zu(b); });
    li.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && b.getAttribute('aria-expanded') === 'true') { zu(b); b.focus(); }
    });
  }
  document.addEventListener('click', (e) => { if (!nav.contains(e.target)) alleZu(); });
}
