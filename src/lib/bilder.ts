// Bilder ohne width/height bekommen beim Build ihre echten Maße (aus dem Dateikopf gelesen).
// Der Browser reserviert damit den Platz, bevor das Bild geladen ist – kein Springen des Layouts (CLS).
// Die Darstellung ändert sich nicht: Das Theme setzt `img { height: auto }`, die Attribute wirken nur als Seitenverhältnis.
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname, basename, extname } from 'node:path';

const cache = new Map<string, [number, number] | null>();

/** Breite/Höhe aus PNG, JPEG (inkl. EXIF-Drehung), WebP oder GIF; sonst null. */
export function masse(buf: Buffer): [number, number] | null {
  if (buf.length < 30) return null;
  // PNG
  if (buf.readUInt32BE(0) === 0x89504e47) return [buf.readUInt32BE(16), buf.readUInt32BE(20)];
  // GIF
  if (buf.toString('ascii', 0, 3) === 'GIF') return [buf.readUInt16LE(6), buf.readUInt16LE(8)];
  // WebP
  if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
    const art = buf.toString('ascii', 12, 16);
    if (art === 'VP8 ') return [buf.readUInt16LE(26) & 0x3fff, buf.readUInt16LE(28) & 0x3fff];
    if (art === 'VP8L') {
      const b = buf.readUInt32LE(21);
      return [(b & 0x3fff) + 1, ((b >> 14) & 0x3fff) + 1];
    }
    if (art === 'VP8X') return [buf.readUIntLE(24, 3) + 1, buf.readUIntLE(27, 3) + 1];
    return null;
  }
  // JPEG
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    let gedreht = false;
    while (i + 9 < buf.length) {
      if (buf[i] !== 0xff) { i++; continue; }
      const marker = buf[i + 1];
      const laenge = buf.readUInt16BE(i + 2);
      if (marker === 0xe1 && buf.toString('ascii', i + 4, i + 8) === 'Exif') gedreht = exifGedreht(buf, i + 10);
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
        const h = buf.readUInt16BE(i + 5);
        const w = buf.readUInt16BE(i + 7);
        return gedreht ? [h, w] : [w, h];
      }
      i += 2 + laenge;
    }
  }
  return null;
}

/** EXIF-Ausrichtung 5–8 = um 90° gedreht (Browser zeigen das Bild dann hochkant/quer vertauscht). */
function exifGedreht(buf: Buffer, start: number): boolean {
  try {
    const le = buf.toString('ascii', start, start + 2) === 'II';
    const u16 = (o: number) => (le ? buf.readUInt16LE(o) : buf.readUInt16BE(o));
    const u32 = (o: number) => (le ? buf.readUInt32LE(o) : buf.readUInt32BE(o));
    const ifd = start + u32(start + 4);
    for (let k = 0, n = u16(ifd); k < n; k++) {
      const e = ifd + 2 + k * 12;
      if (u16(e) === 0x0112) return u16(e + 8) >= 5;
    }
  } catch { /* defekter EXIF-Block: wie ungedreht behandeln */ }
  return false;
}

function dateiMasse(src: string): [number, number] | null {
  const pfad = decodeURIComponent(src.split(/[?#]/)[0]);
  if (!/\.(png|jpe?g|webp|gif)$/i.test(pfad) || pfad.includes('..')) return null;
  if (!cache.has(pfad)) {
    let m: [number, number] | null = null;
    try { m = masse(readFileSync(join(process.cwd(), 'public', pfad))); } catch { m = null; }
    cache.set(pfad, m && m[0] > 0 && m[1] > 0 ? m : null);
  }
  return cache.get(pfad) ?? null;
}

/** Ergänzt width/height an <img> mit lokalem src, denen beides fehlt. */
export function bildMasse(html: string): string {
  return html.replace(/<img\b[^>]*>/g, (tag) => {
    if (/\swidth="/.test(tag) || /\sheight="/.test(tag)) return tag;
    const src = tag.match(/\ssrc="(\/[^"]+)"/)?.[1];
    const m = src ? dateiMasse(src) : null;
    return m ? tag.replace(/^<img\b/, `<img width="${m[0]}" height="${m[1]}"`) : tag;
  });
}

/** Bilder ab dem zweiten Seitenabschnitt erst beim Scrollen laden (natives loading="lazy").
 *  Bis zum ersten Abschnitt mit Bild (Hero/Slider, meist das größte sichtbare Element) lädt alles sofort. Bilder mit eigener
 *  loading-/fetchpriority-Angabe, „skip-lazy“ oder im Logo-Laufband bleiben unverändert. Ausgeblendete Varianten
 *  (z. B. Desktop-Bilder am Handy) werden so gar nicht mehr geladen. */
export function spaetLaden(html: string): string {
  const starts = [...html.matchAll(/class="elementor-section elementor-top-section|class="elementor-element [^"]*\be-parent\b/g)];
  // Ohne Elementor-Abschnitte (Beiträge im eigenen Layout): alles nach dem ersten Bild (Titelbild)
  const erstesBild = html.match(/<img\b[^>]*>/);
  // Mit Abschnitten: sofort laden bis zum Ende des ersten Abschnitts, der ein Bild enthält (Hero/Slider)
  const anfang = starts.map((m) => m.index!);
  const mitBild = anfang.findIndex((a, i) => /<img\b/.test(html.slice(a, anfang[i + 1] ?? html.length)));
  const grenze = anfang.length >= 2
    ? (mitBild >= 0 && mitBild + 1 < anfang.length ? anfang[mitBild + 1] : -1)
    : erstesBild ? erstesBild.index! + erstesBild[0].length : -1;
  if (grenze < 0) return html;
  return html.slice(0, grenze) + html.slice(grenze).replace(/<img\b[^>]*>/g, (tag) =>
    // Logo-Laufband ausgenommen: läuft seitwärts, natives Lazy Loading erfasst das nicht zuverlässig (leere Logos)
    /\s(loading|fetchpriority)=|skip-lazy|eael-lc-img-src/.test(tag) ? tag : tag.replace(/^<img\b/, '<img loading="lazy"'));
}

const ordnerCache = new Map<string, string[]>();

/** Kleinste vorhandene WordPress-Fassung (name-BREITExHÖHE.ext) mit mindestens minB × minH Pixeln, sonst das Original.
 *  Für Hintergrundbilder der Projekt-Kacheln (max. 460 × 540 px angezeigt; 1000 px Höhe reichen auch für Retina).
 *  Ist das Original selbst kleiner, reicht eine Fassung mit mindestens 85 % seiner Breite und Höhe. */
export function passendeFassung(url: string, minB = 850, minH = 1000): string {
  if (!url.startsWith('/wp-content/uploads/')) return url;
  const ordner = dirname(url);
  const ext = extname(url);
  const name = basename(url, ext);
  if (!ordnerCache.has(ordner)) {
    try { ordnerCache.set(ordner, readdirSync(join(process.cwd(), 'public', ordner))); } catch { ordnerCache.set(ordner, []); }
  }
  const [ob, oh] = dateiMasse(url) ?? [Infinity, Infinity];
  const muster = new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-(\\d+)x(\\d+)${ext.replace('.', '\\.')}$`);
  const fassungen = ordnerCache.get(ordner)!
    .map((f) => { const m = f.match(muster); return m ? { f, b: +m[1], h: +m[2] } : null; })
    // Ist schon das Original kleiner als gefordert, genügt eine Fassung mit 85 % seiner Größe (kaum sichtbarer Unterschied)
    .filter((x): x is { f: string; b: number; h: number } => !!x && x.b >= Math.min(minB, ob * 0.85) && x.h >= Math.min(minH, oh * 0.85))
    .sort((a, b) => a.b * a.h - b.b * b.h);
  return fassungen.length ? `${ordner}/${fassungen[0].f}` : url;
}
