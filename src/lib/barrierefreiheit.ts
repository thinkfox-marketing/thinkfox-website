// Korrekturen am übernommenen Elementor-Markup für Barrierefreiheit und Datenschutz.
// Alles hier ändert die Optik nicht, nur Semantik bzw. das Nachladen fremder Inhalte.

const attr = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/** ARIA-/Beschriftungs-Korrekturen (Befunde aus axe-core, WCAG 2.2 AA). */
export function zugaenglich(html: string): string {
  return html
    // Off-Canvas-Menü: Icon-Links ohne Text
    .replace(/<a ([^>]*href="#elementor-action%3Aaction%3Doff_canvas%3Aopen[^"]*")/g, '<a role="button" aria-label="Menü öffnen" $1')
    .replace(/<a ([^>]*href="#elementor-action%3Aaction%3Doff_canvas%3Aclose[^"]*")/g, '<a role="button" aria-label="Menü schließen" $1')
    // Slider: role="list" passt nicht zu Folien mit role="group"
    .replace(/(<div class="swiper elementor-loop-container[^"]*") role="list"/g, '$1')
    // Beitragsraster (Blog): Listeneinträge auszeichnen
    .replace(/<div data-elementor-type="loop-item"(?![^>]*swiper-slide)([^>]*class="elementor elementor-\d+ e-loop-item)/g, '<div role="listitem" data-elementor-type="loop-item"$1')
    // „Weiterlesen »“: zugänglicher Name muss den sichtbaren Text enthalten
    .replace(/aria-label="Mehr über ([^"]*)"/g, 'aria-label="Weiterlesen » $1"')
    // Instagram-Kopfzeile: englisches aria-label weicht vom sichtbaren Text ab – sichtbarer Text genügt
    .replace(/(class="sbi_header_link"[^>]*?) aria-label="[^"]*"/g, '$1');
}

// --- 2-Klick-Lösung für YouTube, Kuula und Google Maps -------------------------------------------

const FONT = '/wp-content/uploads/elementor/google-fonts/fonts/outfit-97312486.woff2';

/** Platzhalter-Dokument (srcdoc): Hinweis + Link, der den Rahmen erst auf Klick zum Anbieter navigiert. */
function platzhalter(o: { anbieter: string; firma: string; was: string; ziel: string; bild?: string; extern?: string }): string {
  const hintergrund = o.bild ? `url(${o.bild}) center/cover no-repeat, #3b3192` : '#3b3192';
  const doc = `<!doctype html><html lang="de"><head><meta charset="utf-8"><style>
@font-face{font-family:Outfit;src:url(${FONT}) format("woff2");font-weight:100 900}
html,body{height:100%;margin:0}
body{display:grid;place-items:center;font-family:Outfit,system-ui,sans-serif;color:#fff;background:${hintergrund}}
.box{max-width:30rem;margin:1rem;padding:1.1rem 1.4rem;border-radius:12px;background:rgb(20 16 60/.85);text-align:center;font-size:15px;line-height:1.45}
p{margin:0}
a{color:#fff}
.laden{display:inline-block;margin:.8rem .3rem 0;padding:.6rem 1.1rem;border-radius:6px;background:#5b4ec8;font-weight:600;text-decoration:none}
.laden:hover{background:#4a3fb0}
a:focus-visible{outline:3px solid #fff;outline-offset:2px}
</style></head><body><div class="box">
<p>Hier ist ${o.was} von <strong>${o.anbieter}</strong> eingebunden. Beim Laden werden Daten wie deine IP-Adresse an ${o.firma} übertragen. <a href="/datenschutz/" target="_top">Datenschutz</a></p>
<a class="laden" href="${attr(o.ziel)}">${o.was.replace(/^(ein|eine|einen) /, '').replace(/^./, (c) => c.toUpperCase())} laden</a>${o.extern ? `<a class="laden" href="${attr(o.extern)}" target="_blank" rel="noopener">In ${o.anbieter} öffnen</a>` : ''}
</div></body></html>`;
  return attr(doc);
}

function youtubeId(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  return m ? m[1] : null;
}

export function einbettungen(html: string): string {
  // YouTube (Elementor-Video-Widget): Elementor würde den Player sofort laden.
  html = html.replace(
    /(<div class="[^"]*elementor-widget-video" [^>]*data-settings="([^"]*)" data-widget_type=")video\.default("(?:(?!data-widget_type)[\s\S])*?)<div class="elementor-video"><\/div>/g,
    (m, anfang: string, settings: string, mitte: string) => {
      const s = JSON.parse(settings.replace(/&quot;/g, '"'));
      if (s.video_type !== 'youtube') return m;
      const id = youtubeId(String(s.youtube_url ?? '').replace(/\\\//g, '/'));
      if (!id) return m;
      const doc = platzhalter({
        anbieter: 'YouTube', firma: 'Google', was: 'ein Video',
        ziel: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1`,
        bild: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      });
      // eigener Widget-Typ: Elementor hängt dann keinen Player-Handler an
      return `${anfang}video.tf-einbettung${mitte}<iframe class="elementor-video" title="Video (YouTube)" srcdoc="${doc}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
    },
  );

  // Kuula (360°-Rundgänge) und Google Maps: Iframe behält Größe und Stil, zeigt aber zuerst den Hinweis
  return html.replace(/<iframe\b([^>]*?)\ssrc="(https:\/\/(kuula\.co|maps\.google\.com)\/[^"]+)"([^>]*)>/g,
    (m, vor: string, src: string, host: string, nach: string) => {
      const ziel = src.replace(/&#0?38;|&amp;/g, '&');
      const kuula = host === 'kuula.co';
      const q = kuula ? '' : new URL(ziel).searchParams.get('q') ?? '';
      const doc = platzhalter(kuula
        ? { anbieter: 'Kuula', firma: 'Kuula', was: 'ein 360°-Rundgang', ziel }
        : { anbieter: 'Google Maps', firma: 'Google', was: 'eine Karte', ziel,
          extern: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}` });
      const rest = `${vor}${nach}`.replace(/\s(title|aria-label)="[^"]*"/g, '');
      return `<iframe${rest} title="${kuula ? '360°-Rundgang (Kuula)' : 'Karte (Google Maps)'}" srcdoc="${doc}">`;
    });
}
