// Hintergrundvideos mit Pause-Knopf. Auf dem Handy läuft immer die Hochkant-Fassung (2,8 MB statt
// 5 MB Querformat), bei „Bewegung reduzieren“ nur das Standbild.
// Läuft vor der Elementor-Initialisierung (Modul-Skript, Elementor startet erst bei DOMContentLoaded)
// und kann deshalb die Einstellungen anpassen.
// Adressen samt Versionskennung setzt src/lib/hero-video.ts als data-Attribute
const QUERFORMAT = '/media/showreel.mp4';
const bewegungReduziert = matchMedia('(prefers-reduced-motion: reduce)').matches;
const handy = matchMedia('(max-width: 767px)').matches;

for (const el of document.querySelectorAll('[data-settings*="background_video_link"]')) {
  const video = el.querySelector('.elementor-background-video-container video');
  const toggle = el.querySelector('.tf-video-toggle');
  if (!video) continue;

  // Auf diesem Gerät ausgeblendete Bereiche (z. B. der Handy-Hero am Desktop) laden kein Video
  const versteckt = el.getClientRects().length === 0;
  const settings = JSON.parse(el.dataset.settings);
  if (bewegungReduziert || versteckt) {
    delete settings.background_video_link;
    settings.background_background = 'classic';
    el.dataset.settings = JSON.stringify(settings);
    video.remove();
    toggle?.remove();
    continue;
  }

  if (handy && settings.background_video_link.startsWith(QUERFORMAT)) {
    settings.background_video_link = el.dataset.tfHochkant;
    el.dataset.settings = JSON.stringify(settings);
    video.parentElement.style.backgroundImage = `url(${el.dataset.tfStandbildHochkant})`;
  }

  if (!toggle) continue;
  const update = () => {
    const pausiert = video.paused;
    toggle.setAttribute('aria-pressed', String(pausiert));
    toggle.setAttribute('aria-label', pausiert ? 'Hintergrundvideo abspielen' : 'Hintergrundvideo anhalten');
  };
  video.addEventListener('playing', () => { toggle.hidden = false; update(); });
  video.addEventListener('pause', update);
  toggle.addEventListener('click', () => (video.paused ? video.play() : video.pause()));
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
