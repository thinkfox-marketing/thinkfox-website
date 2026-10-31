// Hintergrundvideos (Elementor „background_video_link“) zugänglich und schneller machen:
// - komprimierte Fassung des Showreels (public/media/showreel.mp4, 5 MB statt 20 MB)
// - Standbild als Hintergrund, sichtbar bis das Video läuft bzw. statt des Videos
//   (Handy und „Bewegung reduzieren“, siehe src/scripts/hero-video.js)
// - Pause-Knopf (WCAG 2.2.2 „Pausieren, Beenden, Ausblenden“)

const SHOWREEL_ORIGINAL = '/wp-content/uploads/2025/10/SHOWREEL-1-KUNDEN-2023-thinkfox1080.mp4';
const SHOWREEL = '/media/showreel.mp4';
const STANDBILD = '/media/showreel-standbild.webp';
const STANDBILD_MOBIL = '/media/showreel-standbild-mobil.webp';

const PAUSE = '<svg class="tf-video-toggle__pause" viewBox="0 0 16 16" aria-hidden="true"><rect x="3" y="2" width="3.5" height="12"/><rect x="9.5" y="2" width="3.5" height="12"/></svg>';
const PLAY = '<svg class="tf-video-toggle__play" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2l10 6-10 6z"/></svg>';
const TOGGLE = `<button type="button" class="tf-video-toggle" aria-label="Hintergrundvideo anhalten" aria-pressed="false" hidden>${PAUSE}${PLAY}</button>`;

export function renderHeroVideos(main: string): string {
  const re = /data-settings="([^"]*background_video_link[^"]*)"/g;
  let out = '';
  let last = 0;
  for (let m = re.exec(main); m; m = re.exec(main)) {
    const raw = m[1];
    const mobil = raw.includes('.webm');
    const settings = raw.replace(SHOWREEL_ORIGINAL.replaceAll('/', '\\/'), SHOWREEL.replaceAll('/', '\\/'));
    const container = main.indexOf('<div class="elementor-background-video-container"', m.index);
    const containerEnd = main.indexOf('</div>', container) + '</div>'.length;
    const poster = mobil ? STANDBILD_MOBIL : STANDBILD;
    out += main.slice(last, m.index)
      + `data-settings="${settings}"`
      + main.slice(m.index + m[0].length, container)
      + `<div style="background:url(${poster}) center/cover no-repeat"`
      + main.slice(container + '<div'.length, containerEnd)
      + TOGGLE;
    last = containerEnd;
    re.lastIndex = containerEnd;
  }
  return out + main.slice(last);
}
