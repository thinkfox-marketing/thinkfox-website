// Rendert das übernommene Elementor-Markup mit Inhalten aus den Content-Collections.
// Die Templates (src/legacy/**) stammen aus scripts/wp-import/import.py und enthalten
// Platzhalter wie {{TITLE}}, {{IMG}}, {{LOOP:name}}.
import { getCollection, type CollectionEntry } from 'astro:content';
import { wpImg } from './media';
import { passendeFassung } from './bilder';
import loops from '../legacy/loops.json';
import taxonomies from '../legacy/taxonomies.json';
import instagram from '../data/instagram.json';
import instagramItems from '../legacy/instagram-items.json';

export type Projekt = CollectionEntry<'projekte'>;
export type Blog = CollectionEntry<'blog'>;
export type Post = Projekt | Blog;

export interface StyleRef { type: 'link' | 'style'; href?: string; id?: string | null; css?: string }
export interface ScriptRef {
  where: 'head' | 'body'; id?: string | null; type?: string | null; src?: string; async?: boolean; defer?: boolean; inline?: string;
}

export const pageFiles = import.meta.glob<{ default: LegacyPage }>('../legacy/pages/*.json', { eager: true });
export const postFiles = import.meta.glob<string>('../legacy/posts/*.html', { eager: true, query: '?raw', import: 'default' });
export const postMeta = import.meta.glob<{ default: { styles: StyleRef[]; scripts: ScriptRef[]; bodyClass: string } }>('../legacy/posts/*.json', { eager: true });
export const templateFiles = import.meta.glob<{ default: SingleTemplate }>('../legacy/templates/single-*.json', { eager: true });

export interface LegacyPage {
  path: string; wpId: number; seo: string; styles: StyleRef[]; scripts: ScriptRef[]; bodyClass: string; canvas: boolean; main: string;
}
interface SingleTemplate { template: string; styles: StyleRef[]; scripts: ScriptRef[]; bodyClass: string; wpId: number; example: string }

export const slugOf = (p: Post) => p.id;
export const urlOf = (p: Post) => `/${p.id}/`;

const html = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const attr = (s: string) => html(s).replace(/"/g, '&quot;');

/** WordPress-artige Typografie für Titel (– statt -, „“ statt "") wie im Original-Output. */
export function wpTitle(s: string): string {
  return html(s)
    .replace(/ - /g, ' &#8211; ')
    .replace(/"([^"]*)"/g, '&#8222;$1&#8220;');
}

/** Stabile numerische ID für neue Beiträge (Elementor nutzt die ID in Klassen). */
export function postId(p: Post): number {
  if (p.data.wpId) return p.data.wpId;
  let h = 0;
  for (const c of p.id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return 100000 + (h % 900000);
}

export function postClasses(p: Post): string {
  const d = p.data;
  return [
    `post-${postId(p)}`, 'post', 'type-post', 'status-publish', 'format-standard',
    ...(d.bild ? ['has-post-thumbnail'] : []), 'hentry',
    ...d.kategorien.map((c) => `category-${c}`), ...d.schlagworte.map((t) => `tag-${t}`),
  ].join(' ');
}

const MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
/** Datumsformat der Original-Seite ("F j, Y"): "März 17, 2026" */
export const wpDate = (d: Date) => `${MONATE[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;

export function excerpt(p: Post, words: number): string {
  const w = p.data.auszug.split(/\s+/).filter(Boolean);
  return html(w.slice(0, words).join(' '));
}

export function categoryName(slug: string): string {
  return taxonomies.kategorien.find((c) => c.slug === slug)?.name ?? slug;
}

// ------------------------------------------------------------------ queries

export async function allPosts(): Promise<Post[]> {
  const [p, b] = await Promise.all([getCollection('projekte'), getCollection('blog')]);
  return [...p, ...b]
    .filter((x) => !x.data.entwurf || import.meta.env.DEV)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

interface LoopQuery { collection: 'projekte' | 'blog'; platzierung?: string; limit?: number; exclude?: string[] }

/** Abfragen der dynamischen Listen – entsprechen den Elementor-Query-Einstellungen im Original. */
const LOOP_QUERIES: Record<string, LoopQuery> = {
  'index-0': { collection: 'projekte', platzierung: 'startseite', limit: 20 },
  'index-1': { collection: 'blog', limit: 6 },
  'blog-0': { collection: 'blog' },
  'professionelle-websites-fuer-den-mittelstand-0': { collection: 'projekte', platzierung: 'website', limit: 12 },
  'professionelle-content-produktion-video-foto-social-media-aus-nordhessen-0': { collection: 'projekte', platzierung: 'content-produktion' },
  'werbeagentur-bad-wildungen-thinkfox-marketing-fuer-den-mittelstand-0': {
    collection: 'projekte', platzierung: 'startseite', limit: 20,
    exclude: ['website-relaunch-fuer-kkd-gmbh-essen', 'markus-krebs-video-podcast-comedykation'],
  },
};

async function runQuery(q: LoopQuery): Promise<Post[]> {
  const posts = (await allPosts()).filter((p) => p.collection === q.collection);
  return posts
    .filter((p) => !q.platzierung || (p.data.platzierung as string[]).includes(q.platzierung))
    .filter((p) => !q.exclude?.includes(p.id))
    .slice(0, q.limit ?? Infinity);
}

// ------------------------------------------------------------------ templating

function fillItem(tpl: string, p: Post, imgSize: 'full' | 'large'): string {
  const words = +(tpl.match(/<!--excerptWords:(\d+)-->/)?.[1] ?? 55);
  const id = String(postId(p));
  const title = wpTitle(p.data.title);
  return tpl
    .replace(/<!--excerptWords:\d+-->/, '')
    .replaceAll('{{ID}}', id)
    .replaceAll('{{POST_CLASSES}}', postClasses(p))
    .replaceAll('{{URL}}', urlOf(p))
    .replaceAll('{{TITLE_ATTR}}', attr(p.data.title))
    .replaceAll('{{TITLE}}', title)
    .replaceAll('{{IMG_URL}}', passendeFassung(p.data.bild ?? ''))
    .replaceAll('{{IMG}}', wpImg(p.data.bild, {
      size: imgSize, alt: p.data.bildAlt,
      // Kacheln in Listen/Slidern sind höchstens ~460 px breit („auto“: Chromium nimmt die echte Breite)
      sizes: 'auto, (max-width: 767px) 100vw, 480px',
      cls: `attachment-${imgSize} size-${imgSize}${p.data.wpId ? '' : ''}`,
    }))
    .replaceAll('{{EXCERPT}}', excerpt(p, words))
    .replaceAll('{{DATE}}', wpDate(p.data.date));
}

/** Ersetzt {{LOOP:name}}-Platzhalter durch gerenderte Beitragslisten. */
export async function renderLoops(main: string): Promise<string> {
  const names = [...main.matchAll(/\{\{LOOP:([^}]+)\}\}/g)].map((m) => m[1]);
  for (const name of names) {
    const loop = (loops as Record<string, { widget: string; templateStyle: string; itemTemplate: string }>)[name];
    const query = LOOP_QUERIES[name];
    if (!loop || !query) throw new Error(`Unbekannter Loop ${name}`);
    const posts = await runQuery(query);
    const size = loop.itemTemplate.includes('size-large') || loop.widget === 'posts.classic' ? 'large' : 'full';
    const items = posts.map((p, i) => {
      let item = fillItem(loop.itemTemplate, p, size);
      // Elementor setzt das Template-Stylesheet einmalig hinter das erste Item-Style
      if (i === 0 && loop.templateStyle) {
        const afterStyle = item.indexOf('</style>');
        item = afterStyle >= 0 && item.startsWith('<style')
          ? item.slice(0, afterStyle + 8) + loop.templateStyle + item.slice(afterStyle + 8)
          : loop.templateStyle + item;
      }
      return item;
    });
    main = main.replace(`{{LOOP:${name}}}`, items.join('\n'));
  }
  return main;
}

/** Ersetzt die Logos in allen Logo-Karussells durch die Referenzen aus dem CMS. */
export async function renderReferenzen(main: string): Promise<string> {
  if (!main.includes('eael-logo-carousel')) return main;
  const refs = (await getCollection('referenzen')).sort((a, b) => a.data.reihenfolge - b.data.reihenfolge);
  const slides = refs.map((r, i) => {
    const img = `<img decoding="async" class="eael-lc-img-src" src="${attr(r.data.logo)}" alt="${attr(r.data.name)}" title="${attr(r.data.name)}">`;
    const inner = r.data.link ? `<a href="${attr(r.data.link)}" target="_blank" rel="noopener">${img}</a>` : img;
    return `<div class="swiper-slide"><div class="eael-lc-logo-wrap"><div id="eael-lc-logo-ref${i}" class="eael-lc-logo">${inner}</div></div></div>`;
  }).join('\n');
  let from = 0;
  for (;;) {
    const w = main.indexOf('eael-logo-carousel-wrap', from);
    if (w < 0) break;
    const start = main.indexOf('<div class="swiper-wrapper">', w);
    const [ib, ie] = innerRange(main, start);
    main = main.slice(0, ib) + '\n' + slides + '\n' + main.slice(ie);
    from = ib + slides.length;
  }
  return main;
}

/**
 * Instagram-Feed (Smash Balloon-Markup) aus src/data/instagram.json.
 * Die Daten aktualisiert scripts/instagram-sync.mjs über die Instagram-API.
 */
export function renderInstagram(main: string): string {
  const start = main.indexOf('<div id="sbi_images"');
  if (start < 0) return main;
  const perPage = +(main.match(/data-num="(\d+)"/)?.[1] ?? 20);
  const items = instagram.beitraege.map((b, i) => {
    const srcset = attr(JSON.stringify({ d: b.bild, 150: b.bildKlein, 320: b.bildKlein, 640: b.bildKlein }));
    const tpl = (instagramItems as Record<string, string>)[b.typ] ?? instagramItems.image;
    return tpl
      .replace('{{ID}}', b.id)
      .replace('{{DATUM}}', String(b.datum))
      .replace('{{TYP}}', b.typ)
      .replace('{{LINK}}', attr(b.link))
      .replace('{{BILD}}', attr(b.bild))
      .replace('{{SRCSET}}', srcset)
      .replace('{{KURZTEXT}}', html(b.text.replace(/\s+/g, ' ').slice(0, 50)))
      .replace('{{TEXT}}', attr(b.text))
      .replace(' title="{{TITEL}}"', '')
      // weitere Beiträge bleiben bis „Mehr laden“ verborgen (siehe src/scripts/instagram.js)
      .replace('class="sbi_item ', i >= perPage ? 'style="display:none" data-tf-more class="sbi_item ' : 'class="sbi_item ');
  }).join('');
  const [ib, ie] = innerRange(main, start);
  main = main.slice(0, ib) + items + main.slice(ie);
  // Zuordnung Beitrag → lokale Bilddateien, die das Feed-Skript zum Laden nutzt
  const resized = Object.fromEntries(instagram.beitraege.map((b) => [b.id, {
    id: b.basis, ratio: b.seitenverhaeltnis, sizes: { full: 640, low: 320, thumb: 150 },
    extension: (b as { endung?: string }).endung ?? '.webp',
  }]));
  return main
    .replace(/data-resized="[^"]*"/g, `data-resized="${attr(JSON.stringify(resized))}"`)
    .replace(/data-avatar-url="[^"]*"/g, `data-avatar-url="${instagram.avatar}"`)
    // Bilder liegen bereits lokal vor – kein Nachladen/Resizing über WordPress (admin-ajax)
    .replace(/data-sbi-flags="favorLocal,?/g, 'data-sbi-flags="');
}

/** Position hinter dem schließenden Tag des Elements, das bei `start` beginnt. */
export function matchElement(s: string, start: number): number {
  const tag = /^<([a-zA-Z0-9]+)/.exec(s.slice(start))![1];
  const re = new RegExp(`<(/?)${tag}\\b[^>]*?(/?)>`, 'g');
  re.lastIndex = start;
  let depth = 0;
  for (let m = re.exec(s); m; m = re.exec(s)) {
    if (m[2]) continue;
    depth += m[1] ? -1 : 1;
    if (depth === 0) return m.index + m[0].length;
  }
  throw new Error(`Kein Ende für <${tag}> bei ${start}`);
}

/** [Anfang, Ende] des Inhalts eines Elements, das bei `start` beginnt. */
export function innerRange(s: string, start: number): [number, number] {
  const end = matchElement(s, start);
  return [s.indexOf('>', start) + 1, s.lastIndexOf('</', end)];
}

// ------------------------------------------------------------------ single posts

export function singleTemplate(p: Post): SingleTemplate {
  const id = p.data.template ?? (p.collection === 'blog' ? '11303' : '10946');
  const t = templateFiles[`../legacy/templates/single-${id}.json`];
  if (!t) throw new Error(`Template ${id} fehlt`);
  return t.default;
}


// --- Projekte vorerst 1:1 im Original-Layout (Elementor-Markup aus dem Import) -----------------------
// Gilt für alle Projekte, zu denen es Original-Markup gibt (src/legacy/posts/<slug>.html); neue Projekte
// aus dem CMS erscheinen im einheitlichen Layout (src/lib/beitrag.ts). Achtung: Änderungen an den CMS-Feldern
// bestehender Projekte wirken erst, wenn PROJEKTE_IM_ORIGINAL wieder auf false steht.
export const PROJEKTE_IM_ORIGINAL = true;

export function imOriginal(p: Post): boolean {
  return PROJEKTE_IM_ORIGINAL && p.collection === 'projekte'
    && !!postFiles[`../legacy/posts/${p.id}.html`] && !!postMeta[`../legacy/posts/${p.id}.json`];
}

export function originalSeite(p: Post): string {
  const t = singleTemplate(p);
  return t.template
    .replace('{{CONTENT}}', postFiles[`../legacy/posts/${p.id}.html`])
    .replaceAll('{{ID}}', String(postId(p)))
    .replaceAll('{{POST_CLASSES}}', postClasses(p))
    .replace('{{TITLE}}', wpTitle(p.data.title))
    .replace('{{IMG}}', wpImg(p.data.bild, { size: 'full', alt: p.data.bildAlt }));
}

export function originalStyles(p: Post): { styles: StyleRef[]; scripts: ScriptRef[]; bodyClass: string } {
  return postMeta[`../legacy/posts/${p.id}.json`].default;
}
