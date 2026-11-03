// Projekt-Slider: Kachel-Hintergründe erst laden, wenn die Kachel sichtbar oder eine Slider-Breite entfernt ist
// (CSS aus src/lib/bilder.ts → kachelnSpaet blendet die übrigen aus). Sobald jemand den Slider bedient oder er
// automatisch weiterläuft, werden alle Kacheln freigegeben.
const NAH = 'tf-nah';

function freigeben(slider, alle) {
  const c = slider.getBoundingClientRect();
  for (const s of slider.querySelectorAll(`.swiper-slide.e-loop-item:not(.${NAH})`)) {
    const r = s.getBoundingClientRect();
    if (alle || (r.right > c.left - c.width && r.left < c.right + c.width)) s.classList.add(NAH);
  }
}

for (const slider of document.querySelectorAll('.swiper, .swiper-container')) {
  if (!slider.querySelector('.swiper-slide.e-loop-item')) continue;
  let aktiv = false;
  const alle = () => freigeben(slider, true);
  new IntersectionObserver((eintraege, beobachter) => {
    if (!eintraege.some((e) => e.isIntersecting)) return;
    beobachter.disconnect();
    freigeben(slider, false);
    if (aktiv) return;
    aktiv = true;
    for (const art of ['pointerdown', 'touchstart', 'keydown', 'focusin', 'mouseenter']) {
      slider.addEventListener(art, alle, { once: true, passive: true });
    }
    slider.querySelector('.swiper-wrapper')?.addEventListener('transitionstart', alle, { once: true });
  }, { rootMargin: '400px 0px' }).observe(slider);
}
