// Hintergrundvideos (Elementor „background_video_link“) zugänglich und schneller machen:
// - komprimierte Fassungen des Showreels (public/media/showreel*.mp4)
// - Standbild als Hintergrund, sichtbar bis das Video läuft bzw. statt des Videos
//   („Bewegung reduzieren“ u. a., siehe src/scripts/hero-video.js)
// - Pause-Knopf (WCAG 2.2.2 „Pausieren, Beenden, Ausblenden“)

import { asset } from './asset';

const SHOWREEL_ORIGINAL = '/wp-content/uploads/2025/10/SHOWREEL-1-KUNDEN-2023-thinkfox1080.mp4';
const SHOWREEL = asset('/media/showreel.mp4');
// Hochkant-Fassung der Handy-Heroes: MP4 statt WebM (läuft auch auf iPhones), 2,8 MB statt 12 MB
const SHOWREEL_MOBIL_ORIGINAL = '/wp-content/uploads/2026/02/showreel-thinkfox-marketing.webm';
const SHOWREEL_MOBIL = asset('/media/showreel-mobil.mp4');
const STANDBILD = asset('/media/showreel-standbild.webp');
const STANDBILD_MOBIL = asset('/media/showreel-standbild-mobil.webp');

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
    const esc = (s: string) => s.replaceAll('/', '\\/');
    const settings = raw
      .replace(esc(SHOWREEL_ORIGINAL), esc(SHOWREEL))
      .replace(esc(SHOWREEL_MOBIL_ORIGINAL), esc(SHOWREEL_MOBIL));
    const container = main.indexOf('<div class="elementor-background-video-container"', m.index);
    const containerEnd = main.indexOf('</div>', container) + '</div>'.length;
    const poster = mobil ? STANDBILD_MOBIL : STANDBILD;
    out += main.slice(last, m.index)
      + `data-tf-hochkant="${SHOWREEL_MOBIL}" data-tf-standbild-hochkant="${STANDBILD_MOBIL}" `
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
