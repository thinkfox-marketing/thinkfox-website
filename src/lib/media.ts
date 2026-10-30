// Bildvarianten & Abmessungen zur Build-Zeit.
// Importierte WordPress-Bilder liegen mit allen Größen (name-300x200.jpg …) unter
// public/wp-content/uploads. Neue CMS-Uploads (public/uploads) haben nur das Original.
import fs from 'node:fs';
import path from 'node:path';

const PUBLIC = path.resolve('public');

export interface Variant { url: string; width: number; height: number }

const dimCache = new Map<string, { width: number; height: number } | null>();

/** Liest Breite/Höhe aus PNG-, JPEG-, GIF- oder WebP-Headern. */
export function dimensions(url: string): { width: number; height: number } | null {
  if (dimCache.has(url)) return dimCache.get(url)!;
  let result: { width: number; height: number } | null = null;
  try {
    const buf = fs.readFileSync(path.join(PUBLIC, decodeURI(url)));
    result = readDimensions(buf);
  } catch {
    result = null;
  }
  dimCache.set(url, result);
  return result;
}

function readDimensions(b: Buffer): { width: number; height: number } | null {
  // PNG
  if (b.readUInt32BE(0) === 0x89504e47) return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
  // GIF
  if (b.toString('ascii', 0, 3) === 'GIF') return { width: b.readUInt16LE(6), height: b.readUInt16LE(8) };
  // WebP
  if (b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') {
    const chunk = b.toString('ascii', 12, 16);
    if (chunk === 'VP8X') return { width: 1 + b.readUIntLE(24, 3), height: 1 + b.readUIntLE(27, 3) };
    if (chunk === 'VP8 ') return { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff };
    if (chunk === 'VP8L') {
      const bits = b.readUInt32LE(21);
      return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
    }
  }
  // JPEG
  if (b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i < b.length) {
      if (b[i] !== 0xff) { i++; continue; }
      const marker = b[i + 1];
      const len = b.readUInt16BE(i + 2);
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
        return { width: b.readUInt16BE(i + 7), height: b.readUInt16BE(i + 5) };
      }
      i += 2 + len;
    }
  }
  return null;
}

/** Original + alle von WordPress erzeugten Größen eines Bildes (gleiches Seitenverhältnis). */
export function variants(url: string): { full: Variant; all: Variant[] } | null {
  const dims = dimensions(url);
  if (!dims) return null;
  const full: Variant = { url, ...dims };
  const all: Variant[] = [full];
  const dir = path.posix.dirname(url);
  const ext = path.posix.extname(url);
  const base = path.posix.basename(url, ext).replace(/-scaled$/, '');
  let files: string[] = [];
  try { files = fs.readdirSync(path.join(PUBLIC, decodeURI(dir))); } catch { /* keine Varianten */ }
  const re = new RegExp(`^${base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-(\\d+)x(\\d+)${ext.replace('.', '\\.')}$`);
  const ratio = full.width / full.height;
  for (const f of files) {
    const m = f.match(re);
    if (!m) continue;
    const w = +m[1], h = +m[2];
    if (Math.abs(w / h - ratio) > 0.02) continue; // beschnittene Thumbnails
    all.push({ url: `${dir}/${f}`, width: w, height: h });
  }
  return { full, all };
}

type WpSize = 'full' | 'large' | 'medium_large' | 'medium';
const MAX: Record<WpSize, number> = { full: Infinity, large: 1024, medium_large: 768, medium: 300 };

/** Wählt die Variante, die WordPress für eine Größe ausgeben würde. */
export function pick(url: string, size: WpSize = 'full'): { chosen: Variant; all: Variant[] } | null {
  const v = variants(url);
  if (!v) return null;
  if (size === 'full') return { chosen: v.full, all: v.all };
  const limit = MAX[size];
  const fits = v.all.filter((x) => (size === 'medium_large' ? x.width <= limit : x.width <= limit && x.height <= limit));
  const chosen = fits.sort((a, b) => b.width - a.width)[0] ?? v.full;
  return { chosen, all: v.all };
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/**
 * Erzeugt ein <img> im WordPress-Format (width/height/src/class/srcset/sizes).
 * `extraClass` z. B. "attachment-large size-large wp-image-123".
 */
export function wpImg(url: string | undefined, opts: {
  size?: WpSize; alt?: string; cls?: string; loading?: 'lazy' | 'eager'; fetchpriority?: 'high'; title?: string;
} = {}): string {
  if (!url) return '';
  const size = opts.size ?? 'full';
  const p = pick(url, size);
  const attrs: string[] = [];
  if (opts.fetchpriority) attrs.push(`fetchpriority="${opts.fetchpriority}"`);
  else if (opts.loading !== 'eager') attrs.push('loading="lazy"');
  attrs.push('decoding="async"');
  if (!p) {
    attrs.push(`src="${esc(url)}"`, `class="${opts.cls ?? ''}"`, `alt="${esc(opts.alt ?? '')}"`);
    return `<img ${attrs.join(' ')} />`;
  }
  const { chosen, all } = p;
  // WordPress begrenzt die ausgegebene Breite benannter Größen auf $content_width (800 im Hello-Theme)
  let w = chosen.width, h = chosen.height;
  if (size !== 'full' && w > 800) { h = Math.round((h * 800) / w); w = 800; }
  attrs.push(`width="${w}"`, `height="${h}"`, `src="${esc(chosen.url)}"`);
  attrs.push(`class="${opts.cls ?? `attachment-${size} size-${size}`}"`, `alt="${esc(opts.alt ?? '')}"`);
  if (opts.title) attrs.push(`title="${esc(opts.title)}"`);
  if (all.length > 1) {
    const set = [chosen, ...all.filter((x) => x.url !== chosen.url && x.width <= Math.max(chosen.width, 2560))];
    attrs.push(`srcset="${set.map((x) => `${esc(x.url)} ${x.width}w`).join(', ')}"`);
    attrs.push(`sizes="(max-width: ${w}px) 100vw, ${w}px"`);
  }
  return `<img ${attrs.join(' ')} />`;
}
