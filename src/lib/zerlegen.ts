// Zerlegt das Elementor-Markup eines übernommenen Beitrags (src/legacy/posts/*.html) in einfache,
// layoutfreie Bausteine – Grundlage für das einheitliche Beitrags-Layout (src/lib/beitrag.ts) und die
// Überführung in CMS-Felder. Erkannt werden die im Bestand verwendeten Widgets: Text, Überschrift,
// Bild, Video, Galerie, Button und FAQ-Akkordeon.
import { matchElement } from './wp';

export type Baustein =
  | { typ: 'text'; html: string }
  | { typ: 'ueberschrift'; ebene: number; text: string }
  | { typ: 'bild'; bild: string; alt: string }
  | { typ: 'video'; youtube: string }
  | { typ: 'galerie'; bilder: { bild: string; alt: string }[] }
  | { typ: 'button'; text: string; link: string }
  | { typ: 'faq'; fragen: { frage: string; antwort: string }[] };

const ERLAUBT = new Set(['p', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'strong', 'b', 'em', 'i', 'a', 'br', 'blockquote']);

const entities = (s: string) => s.replace(/&#8211;/g, '–').replace(/&#8222;/g, '„').replace(/&#8220;/g, '“')
  .replace(/&#8217;/g, '’').replace(/&#038;/g, '&amp;').replace(/&nbsp;/g, ' ');

/** Nur einfache Text-Auszeichnung behalten, alle Klassen/Stile/Daten-Attribute entfernen. */
export function saeubern(html: string): string {
  return entities(html)
    .replace(/<(script|style|svg)\b[\s\S]*?<\/\1>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(\/?)([a-z0-9]+)\b([^>]*)>/gi, (m, zu: string, tag: string, attrs: string) => {
      const t = tag.toLowerCase();
      if (t === 'img' && !zu) {
        const src = attrs.match(/\ssrc="([^"]*)"/)?.[1];
        if (!src) return '';
        const w = attrs.match(/\swidth="(\d+)"/)?.[1], h = attrs.match(/\sheight="(\d+)"/)?.[1];
        const alt = attrs.match(/\salt="([^"]*)"/)?.[1] ?? '';
        return `<img src="${src}" alt="${alt}"${w && h ? ` width="${w}" height="${h}"` : ''} loading="lazy" decoding="async">`;
      }
      if (!ERLAUBT.has(t)) return '';
      if (zu) return `</${t}>`;
      if (t === 'a') {
        const href = attrs.match(/\shref="([^"]*)"/)?.[1];
        if (!href) return '';
        const extern = /^https?:\/\//.test(href) && !/^https?:\/\/(www\.)?thinkfox\.de/.test(href);
        const lokal = href.replace(/^https?:\/\/(www\.)?thinkfox\.de/, '') || '/';
        return extern ? `<a href="${href}" target="_blank" rel="noopener">` : `<a href="${lokal}">`;
      }
      return `<${t}>`;
    })
    .replace(/<b>/g, '<strong>').replace(/<\/b>/g, '</strong>')
    .replace(/<i>/g, '<em>').replace(/<\/i>/g, '</em>')
    .replace(/<(p|li|h[2-4])>\s*(<br>\s*)*<\/\1>/g, '')
    .replace(/<strong>\s*<\/strong>/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\s*\n\s*/g, '\n')
    .trim();
}

const text = (html: string) => entities(html).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

function settings(div: string): Record<string, unknown> {
  const raw = div.match(/data-settings="([^"]*)"/)?.[1];
  if (!raw) return {};
  try { return JSON.parse(raw.replace(/&quot;/g, '"')); } catch { return {}; }
}

/** Bausteine in Dokument-Reihenfolge. */
export function zerlegen(html: string): Baustein[] {
  const out: Baustein[] = [];
  const re = /<div class="elementor-element [^"]*elementor-widget [^"]*"[^>]*data-widget_type="([a-z-]+)\.default"[^>]*>/g;
  let bisher = -1;
  for (let m = re.exec(html); m; m = re.exec(html)) {
    if (m.index < bisher) continue; // verschachteltes Widget (z. B. Text im FAQ) – schon erfasst
    const ende = matchElement(html, m.index);
    bisher = ende;
    const div = html.slice(m.index, ende);
    const typ = m[1];
    if (typ === 'text-editor') {
      const inhalt = div.slice(m[0].length).replace(/<\/div>\s*$/, '');
      const h = saeubern(inhalt);
      if (text(h)) out.push({ typ: 'text', html: h });
    } else if (typ === 'heading') {
      const t = div.match(/<(h[1-6]|p|div|span)[^>]*class="elementor-heading-title[^"]*"[^>]*>([\s\S]*?)<\/\1>/);
      const ebene = t && /^h[1-6]$/.test(t[1]) ? Math.max(2, Number(t[1][1])) : 3;
      if (t && text(t[2])) out.push({ typ: 'ueberschrift', ebene, text: text(t[2]) });
    } else if (typ === 'image') {
      const img = div.match(/<img\b[^>]*>/)?.[0] ?? '';
      const src = img.match(/\ssrc="([^"]+)"/)?.[1];
      if (src) out.push({ typ: 'bild', bild: src, alt: entities(img.match(/\salt="([^"]*)"/)?.[1] ?? '') });
    } else if (typ === 'video') {
      const s = settings(div);
      const url = String(s.youtube_url ?? '').replace(/\\\//g, '/');
      if (url) out.push({ typ: 'video', youtube: url });
    } else if (typ === 'gallery') {
      const bilder = [...div.matchAll(/data-thumbnail="([^"]+)"[^>]*?(?:aria-label="([^"]*)")?/g)]
        .map((x) => ({ bild: x[1], alt: entities(x[2] ?? '') }));
      if (bilder.length) out.push({ typ: 'galerie', bilder });
    } else if (typ === 'button') {
      const link = div.match(/<a\b[^>]*href="([^"]+)"/)?.[1];
      const t = div.match(/class="elementor-button-text"[^>]*>([\s\S]*?)<\/span>/)?.[1];
      if (link && t) out.push({ typ: 'button', text: text(t), link: link.replace(/^https?:\/\/(www\.)?thinkfox\.de/, '') || '/' });
    } else if (typ === 'nested-accordion') {
      const fragen = [...div.matchAll(/<details[^>]*class="e-n-accordion-item"[^>]*>([\s\S]*?)<\/details>/g)].map((d) => {
        const frage = text(d[1].match(/<div class="e-n-accordion-item-title-text">([\s\S]*?)<\/div>/)?.[1] ?? '');
        const antwort = saeubern(d[1].split('</summary>')[1] ?? '');
        return { frage, antwort };
      }).filter((f) => f.frage && text(f.antwort));
      if (fragen.length) out.push({ typ: 'faq', fragen });
    }
  }
  return out;
}
