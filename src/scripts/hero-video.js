// Hintergrundvideos mit Pause-Knopf. Läuft vor der Elementor-Initialisierung (Modul-Skript,
// Elementor startet erst bei DOMContentLoaded) und übernimmt die Videos selbst:
// - geladen wird erst nach dem Seitenaufbau und nur, wenn der Bereich sichtbar ist
//   (bis dahin zeigt der Bereich das Standbild, siehe src/lib/hero-video.ts)
// - auf dem Handy immer die Hochkant-Fassung (2,8 MB statt 5 MB Querformat)
// - „Bewegung reduzieren“, Datensparmodus/langsames Netz und ausgeblendete Bereiche: nur Standbild, kein Download
// Adressen samt Versionskennung setzt src/lib/hero-video.ts als data-Attribute.
const QUERFORMAT = '/media/showreel.mp4';
const bewegungReduziert = matchMedia('(prefers-reduced-motion: reduce)').matches;
const handy = matchMedia('(max-width: 767px)').matches;
// Datensparmodus oder langsames Netz: nur Standbild (spart auf dem Handy 2,8 MB)
const netz = navigator.connection;
const sparen = Boolean(netz && (netz.saveData || /(^|-)2g$|^3g$/.test(netz.effectiveType || '')));
const seiteGeladen = new Promise((fertig) => {
  if (document.readyState === 'complete') fertig();
  else window.addEventListener('load', () => fertig(), { once: true });
});

for (const el of document.querySelectorAll('[data-settings*="background_video_link"]')) {
  const video = el.querySelector('.elementor-background-video-container video');
  const toggle = el.querySelector('.tf-video-toggle');
  if (!video) continue;

  const settings = JSON.parse(el.dataset.settings);
  let link = settings.background_video_link;
  const start = Number(settings.background_video_start) || 0;
  const ende = Number(settings.background_video_end) || 0;

  // Elementor soll das Video nicht selbst starten
  delete settings.background_video_link;
  settings.background_background = 'classic';
  el.dataset.settings = JSON.stringify(settings);

  // Auf diesem Gerät ausgeblendete Bereiche (z. B. der Handy-Hero am Desktop) laden kein Video
  if (bewegungReduziert || sparen || el.getClientRects().length === 0) {
    video.remove();
    toggle?.remove();
    continue;
  }

  if (handy && link.startsWith(QUERFORMAT)) {
    link = el.dataset.tfHochkant;
    video.parentElement.style.backgroundImage = `url(${el.dataset.tfStandbildHochkant})`;
  }

  // Größe wie bei Elementor: Bereich füllen, Seitenverhältnis halten (object-fit: cover aus dem CSS)
  Object.assign(video.style, { width: '100%', height: '100%' });
  let vomNutzerPausiert = false;

  video.addEventListener('loadedmetadata', () => { if (start) video.currentTime = start; }, { once: true });
  video.addEventListener('timeupdate', () => {
    if (ende && video.currentTime >= ende) video.currentTime = start;
  });

  // erst laden, wenn sichtbar und die Seite fertig ist; außerhalb des Bildschirms pausieren
  new IntersectionObserver(async ([eintrag]) => {
    if (!eintrag.isIntersecting) { if (!video.paused) video.pause(); return; }
    await seiteGeladen;
    if (!video.getAttribute('src')) video.src = link;
    if (!vomNutzerPausiert) video.play().catch(() => {});
  }, { rootMargin: '200px 0px' }).observe(el);

  if (!toggle) continue;
  const update = () => {
    const pausiert = video.paused;
    toggle.setAttribute('aria-pressed', String(pausiert));
    toggle.setAttribute('aria-label', pausiert ? 'Hintergrundvideo abspielen' : 'Hintergrundvideo anhalten');
  };
  video.addEventListener('playing', () => { toggle.hidden = false; update(); });
  video.addEventListener('pause', update);
  toggle.addEventListener('click', () => {
    vomNutzerPausiert = !video.paused;
    if (video.paused) video.play(); else video.pause();
  });
}

// „Bewegung reduzieren“: automatisch laufende Slider und das Logo-Laufband anhalten
if (bewegungReduziert) {
  const stoppen = () => {
    for (const el of document.querySelectorAll('.swiper, .swiper-container')) el.swiper?.autoplay?.stop();
  };
  // Elementor erzeugt die Slider zeitversetzt
  window.addEventListener('load', () => {
    stoppen();
    let n = 0;
    const timer = setInterval(() => { stoppen(); if (++n > 10) clearInterval(timer); }, 500);
  });
}
