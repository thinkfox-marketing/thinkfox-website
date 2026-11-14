// Startseite (Relaunch, src/lib/startseite.ts): Highlight-Leiste mit Pfeilknöpfen und dezente Einblendungen.
// Ohne JavaScript: Leiste per Wischen/Scrollen bedienbar, alle Inhalte sofort sichtbar.
const start = document.querySelector('.tf-start2');
if (start) {
  // Leiste: Knöpfe blättern um eine Kachel, sind am Anfang/Ende deaktiviert
  for (const leiste of start.querySelectorAll('[data-tf-leiste]')) {
    const band = leiste.querySelector('.tf-leiste__band');
    const steuerung = leiste.querySelector('.tf-leiste__steuerung');
    const [zurueck, vor] = steuerung.querySelectorAll('button');
    const schritt = () => (band.querySelector('.tf-leiste__eintrag')?.getBoundingClientRect().width ?? 300) + 20;
    const glatt = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    const pruefen = () => {
      zurueck.disabled = band.scrollLeft <= 4;
      vor.disabled = band.scrollLeft + band.clientWidth >= band.scrollWidth - 4;
    };
    for (const b of [zurueck, vor]) {
      b.addEventListener('click', () => band.scrollBy({ left: Number(b.dataset.richtung) * schritt(), behavior: glatt }));
    }
    band.addEventListener('scroll', pruefen, { passive: true });
    window.addEventListener('resize', pruefen);
    steuerung.hidden = false;
    pruefen();
  }

  // Einblendungen: nur ohne „Bewegung reduzieren“; was beim Laden schon sichtbar ist, erscheint sofort
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
    const elemente = [...start.querySelectorAll('.tf-s-ein')];
    const beobachter = new IntersectionObserver((eintraege) => {
      for (const e of eintraege) {
        if (e.isIntersecting) { e.target.classList.add('ist-sichtbar'); beobachter.unobserve(e.target); }
      }
    }, { rootMargin: '0px 0px -8% 0px' });
    for (const el of elemente) {
      if (el.getBoundingClientRect().top < innerHeight) el.classList.add('ist-sichtbar');
      else beobachter.observe(el);
    }
    start.classList.add('tf-bewegt');
  }
}
