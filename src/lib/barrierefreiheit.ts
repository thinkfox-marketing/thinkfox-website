// Korrekturen am übernommenen Elementor-Markup für Barrierefreiheit und Datenschutz.
// Alles hier ändert die Optik nicht, nur Semantik bzw. das Nachladen fremder Inhalte.

import { KOORDINATEN, UNTERNEHMEN } from './geo';
import { kartenDokument } from './osm-karte.mjs';

const TERMIN = 'https://crm.thinkfox.marketing/termin.php';
const attr = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/** ARIA-/Beschriftungs-Korrekturen (Befunde aus axe-core, WCAG 2.2 AA). */
export function zugaenglich(html: string): string {
  return html
    // Off-Canvas-Menü: Icon-Links ohne Text
    .replace(/<a ([^>]*href="#elementor-action%3Aaction%3Doff_canvas%3Aopen[^"]*")/g, '<a role="button" aria-label="Menü öffnen" $1')
    .replace(/<a ([^>]*href="#elementor-action%3Aaction%3Doff_canvas%3Aclose[^"]*")/g, '<a role="button" aria-label="Menü schließen" $1')
    // Instagram-Kopf: Profilbild neben dem Namen „thinkfox.marketing“ → für Screenreader ausgeblendet (sonst doppelt),
    // Alt-Text für Crawler/Bildausfall (Seobility zählt leeres alt als „fehlend“)
    .replace(/(<img [^>]*src="\/wp-content\/uploads\/sb-instagram-feed-images\/thinkfox\.marketing\.webp"[^>]*?) alt=""/g,
      '$1 alt="Profilbild thinkfox.marketing" aria-hidden="true"')
    // Slider: role="list" passt nicht zu Folien mit role="group"
    .replace(/(<div class="swiper elementor-loop-container[^"]*") role="list"/g, '$1')
    // Beitragsraster (Blog): Listeneinträge auszeichnen
    .replace(/<div data-elementor-type="loop-item"(?![^>]*swiper-slide)([^>]*class="elementor elementor-\d+ e-loop-item)/g, '<div role="listitem" data-elementor-type="loop-item"$1')
    // Beitrags-Widget: <article> darf nicht role="listitem" tragen – Artikel ohne Listen-Rollen
    .replace(/(<div class="elementor-posts-container[^"]*") role="list"/g, '$1')
    .replace(/(<article class="elementor-post [^"]*") role="listitem"/g, '$1')
    // Hintergrundvideos: role="presentation" ist an <video> nicht erlaubt → aus dem Baum nehmen
    .replace(/(<video class="elementor-background-video-hosted") role="presentation"/g, '$1 aria-hidden="true"')
    // Etiketten über Überschriften sind als Button ohne Funktion ausgezeichnet → einfache Beschriftung
    .replace(/<a class="elementor-button elementor-size-sm" role="button">/g, '<a class="elementor-button elementor-size-sm">')
    // Pfeil-Symbol, das zum nächsten Abschnitt springt (ohne Text)
    .replace(/<a class="elementor-icon" href="#([\w-]+)">/g, '<a class="elementor-icon" href="#$1" aria-label="Weiter zum nächsten Abschnitt">')
    // „Weiterlesen »“: zugänglicher Name muss den sichtbaren Text enthalten
    .replace(/aria-label="Mehr über ([^"]*)"/g, 'aria-label="Weiterlesen » $1"')
    // Instagram-Kopfzeile: englisches aria-label weicht vom sichtbaren Text ab – sichtbarer Text genügt
    .replace(/(class="sbi_header_link"[^>]*?) aria-label="[^"]*"/g, '$1')
    // Termin-Popup (Kontakt): Fokusfalle ließ den Kalender per Tastatur nicht erreichen → Kalender direkt öffnen
    .replace(/href="#elementor-action%3Aaction%3Dpopup%3Aopen[^"]*"/g, `href="${TERMIN}" target="_blank" rel="noopener"`)
    // Projekt-Kacheln: Überlagerungs-Link doppelt zum Kachel-Link (gleiches Ziel, Name nur im title) → nur Mausfläche
    .replace(/<a class="(eael-wrapper-link-[0-9a-f]+[^"]*)" href=/g, '<a class="$1" aria-hidden="true" tabindex="-1" href=')
    // Akkordeon (Mietstudio): Rolle und Zustand (Zustand hält src/scripts/barrierefreiheit.js aktuell)
    .replace(/<div (id="[^"]*" )?class="elementor-tab-title eael-accordion-header( active-default)?"/g,
      (_m, id = '', aktiv) => `<div ${id}class="elementor-tab-title eael-accordion-header${aktiv ?? ''}" role="button" aria-expanded="${aktiv ? 'true' : 'false'}"`)
    .replace(/aria-label="Accordion\. Open links with Enter or Space, close with Escape, and navigate with Arrow Keys"/g,
      'aria-label="Fragen und Antworten. Öffnen mit Enter oder Leertaste, schließen mit Escape, wechseln mit den Pfeiltasten"')
    // Off-Canvas-Menü benennen
    .replace(/aria-label="Off-Canvas"/g, 'aria-label="Menü"')
    // Formulare: Telefon und Firma automatisch ausfüllbar (WCAG 1.3.5)
    .replace(/(<input type="text" name="phone-1"[^>]*?) autocomplete="off"/g, '$1 autocomplete="tel" inputmode="tel"')
    .replace(/(<input [^>]*name="name-2"[^>]*?) autocomplete="name"/g, '$1 autocomplete="organization"')
    .replace(/(<input type="text" name="text-1" [^>]*placeholder="[^"]*Unternehmen[^"]*"[^>]*?)( \/?>)/g, (m, a, b) => (a.includes('autocomplete=') ? m : `${a} autocomplete="organization"${b}`))
    .replace(/(<input type="url" name="url-1"[^>]*?)( \/?>)/g, (m, a, b) => (a.includes('autocomplete=') ? m : `${a} autocomplete="url"${b}`))
    // Logo-Laufband steht (Desktop/Handy) mehrfach in der Seite – IDs eindeutig machen (nirgends referenziert)
    .replace(/id="(eael-lc-logo-ref\d+)"/g, ((gesehen: Map<string, number>) => (_m: string, id: string) => {
      const n = (gesehen.get(id) ?? 0) + 1;
      gesehen.set(id, n);
      return `id="${n === 1 ? id : `${id}-${n}`}"`;
    })(new Map()))
    // Stil-Blöcke der Slider-Vorlagen tragen bei mehreren Slidern dieselbe ID
    .replace(/<style id="loop-dynamic-\d+">/g, '<style>')
    // Überschriften-Ebenen ohne Sprung (Optik bleibt: nur die Ebene für Screenreader)
    .replace(/<h6 class="elementor-heading-title([^"]*)">(\s*thinkfox auf Instagram)/g, '<h6 class="elementor-heading-title$1" aria-level="3">$2');
}

/** Fußzeile: Überschriften-Ebenen ohne Sprung (h4/h5/h6 → Ebene 2/3), Optik unverändert. */
export function fussEbenen(html: string): string {
  return html
    // Überschriften der Fußzeile als role="heading" statt h4–h6: Screenreader behalten sie (Ebene 2/3), in der
    // Gliederung für Suchmaschinen entsteht kein Sprung H1 → H4 (Seobility „Strukturproblem“ auf kurzen Seiten).
    // data-tf-h: Gestaltung wie das frühere Tag (ergaenzungen.css)
    .replace(/<h([456]) class="elementor-heading-title([^"]*)">([\s\S]*?)<\/h\1>/g, (m, n: string, k: string, t: string) =>
      `<div class="elementor-heading-title${k}" role="heading" aria-level="${n === '4' ? 2 : 3}" data-tf-h="${n}">${t}</div>`)
    // Fettungen der Fußzeile sind Gestaltung, keine Betonung (zählten sonst auf jeder Seite als <strong>)
    .replace(/<strong>([^<]*)<\/strong>/g, '<span class="tf-fett">$1</span>');
}

/** Telefonnummer überall anrufbar machen (im Original nur Text bzw. ein defekter tel:-Link ohne Vorwahl). */
const TEL = 'tel:+4956239737793';
export function telefon(html: string): string {
  return html
    // Fußzeile/Danke-Seiten: Nummer war von einem <span> zerteilt – Link davor, Span bleibt für die Struktur erhalten
    .replace(/Tel\.: \+49 \((<span data-qa="label_AddetionalPhoneNumber">)0\)5623 9737793/g,
      `Tel.: <a href="${TEL}" style="color: inherit">+49 (0)5623 9737793</a>$1`)
    // Kontakt, Impressum, Datenschutz: „Telefon: +49 (0)5623 9737793“
    .replace(/(Tel(?:efon|\.)?:\s*)\+49 \(0\)5623 9737793(?!<\/a>)/g, `$1<a href="${TEL}" style="color: inherit">+49 (0)5623 9737793</a>`)
    // 360°-Seite: vorhandener Link ohne Landesvorwahl
    .replace(/href="tel:5623 9737793"/g, `href="${TEL}"`);
}

// --- 2-Klick-Lösung für YouTube und Kuula, Karte mit OpenStreetMap -------------------------------------------

const FONT = '/wp-content/uploads/elementor/google-fonts/fonts/outfit-97312486.woff2';

/** Platzhalter-Dokument (srcdoc): Hinweis + Link, der den Rahmen erst auf Klick zum Anbieter navigiert. */
function platzhalter(o: { anbieter: string; firma: string; was: string; ziel: string; bild?: string }): string {
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
<a class="laden" href="${attr(o.ziel)}">${o.was.replace(/^(ein|eine|einen) /, '').replace(/^./, (c) => c.toUpperCase())} laden</a>
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

  // Google Maps → OpenStreetMap (statische Karte aus lokalen Kacheln, siehe src/lib/osm-karte.mjs;
  // die Kacheln lädt scripts/astro-osm-karte.mjs beim Build)
  html = html.replace(/<iframe\b([^>]*?)\ssrc="https:\/\/maps\.google\.com\/[^"]+"([^>]*)>/g, (m, vor: string, nach: string) => {
    const a = UNTERNEHMEN.address;
    const daten = { name: UNTERNEHMEN.name, strasse: a.streetAddress, plz: a.postalCode, ort: a.addressLocality };
    const rest = `${vor}${nach}`.replace(/\s(title|aria-label)="[^"]*"/g, '');
    return `<iframe${rest} title="Karte: ${attr(UNTERNEHMEN.name)} (OpenStreetMap)" data-tf-karte="${attr(JSON.stringify({ ...daten, ...(KOORDINATEN ?? {}) }))}" srcdoc="${kartenDokument(daten)}">`;
  });

  // Kuula (360°-Rundgänge): Iframe behält Größe und Stil, zeigt aber zuerst den Hinweis
  return html.replace(/<iframe\b([^>]*?)\ssrc="(https:\/\/kuula\.co\/[^"]+)"([^>]*)>/g,
    (m, vor: string, src: string, nach: string) => {
      const ziel = src.replace(/&#0?38;|&amp;/g, '&');
      const doc = platzhalter({ anbieter: 'Kuula', firma: 'Kuula', was: 'ein 360°-Rundgang', ziel });
      const rest = `${vor}${nach}`.replace(/\s(title|aria-label)="[^"]*"/g, '');
      return `<iframe${rest} title="360°-Rundgang (Kuula)" srcdoc="${doc}">`;
    });
}

/** YouTube-Video als 2-Klick-Platzhalter (für das einheitliche Beitrags-Layout, src/lib/beitrag.ts). */
export function youtubeEinbettung(url: string, titel = 'Video (YouTube)'): string {
  const id = youtubeId(url);
  if (!id) return '';
  const doc = platzhalter({
    anbieter: 'YouTube', firma: 'Google', was: 'ein Video',
    ziel: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1`,
    bild: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
  });
  return `<iframe title="${attr(titel)}" srcdoc="${doc}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen loading="lazy"></iframe>`;
}

/** Überschriften-Ebenen ohne Sprung (WCAG 1.3.1, axe „heading-order“): springt eine Überschrift mehr als eine Ebene
 *  tiefer als die vorige (z. B. H2 → H4), bekommt sie für Screenreader die passende Ebene (aria-level).
 *  Tag und Optik bleiben unverändert. */
export function ebenenOhneSprung(html: string): string {
  let vorige = 0;
  return html.replace(/<h([1-6])(\s[^>]*)?>/g, (m, n: string, rest = '') => {
    const vorhanden = rest.match(/\saria-level="(\d)"/);
    const ebene = vorhanden ? Number(vorhanden[1]) : Number(n);
    const soll = Math.min(ebene, vorige + 1);
    vorige = soll;
    if (soll === ebene) return m;
    return vorhanden ? m.replace(/aria-level="\d"/, `aria-level="${soll}"`) : `<h${n}${rest} aria-level="${soll}">`;
  });
}
