// Showreel im Kopf der Leistungsseiten im Blog (layout: leistung, kopfVideo): stummes Hochformat-Video in Schleife.
// Lädt erst nach dem Seitenaufbau; bei „Bewegung reduzieren“, Datensparmodus oder langsamem Netz bleibt das Standbild.
// Pause-Knopf (WCAG 2.2.2) wie bei den Hintergrundvideos (src/scripts/hero-video.js).
const box = document.querySelector('[data-tf-kopfvideo]');
if (box) {
  const video = box.querySelector('video');
  const toggle = box.querySelector('.tf-video-toggle');
  const netz = navigator.connection;
  const sparen = Boolean(netz && (netz.saveData || /(^|-)2g$|^3g$/.test(netz.effectiveType || '')));
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || sparen) {
    video.remove();
    toggle.remove();
  } else {
    let vomNutzerPausiert = false;
    const geladen = new Promise((ok) => (document.readyState === 'complete' ? ok() : addEventListener('load', ok, { once: true })));
    new IntersectionObserver(async ([e]) => {
      if (!e.isIntersecting) { if (!video.paused) video.pause(); return; }
      await geladen;
      if (!video.getAttribute('src')) video.src = box.dataset.tfKopfvideo;
      if (!vomNutzerPausiert) video.play().catch(() => {});
    }, { rootMargin: '200px 0px' }).observe(box);
    const update = () => toggle.setAttribute('aria-pressed', String(video.paused));
    video.addEventListener('playing', () => { box.classList.add('tf-laeuft'); toggle.hidden = false; update(); });
    video.addEventListener('pause', update);
    toggle.addEventListener('click', () => {
      vomNutzerPausiert = !video.paused;
      if (video.paused) video.play(); else video.pause();
    });
  }
}
