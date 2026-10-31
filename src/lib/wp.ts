// Rendert das übernommene Elementor-Markup mit Inhalten aus den Content-Collections.
// Die Templates (src/legacy/**) stammen aus scripts/wp-import/import.py und enthalten
// Platzhalter wie {{TITLE}}, {{IMG}}, {{LOOP:name}}.
import { getCollection, type CollectionEntry } from 'astro:content';
import { dimensions, wpImg } from './media';
import { asset } from './asset';
import { markdown } from './markdown';
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
export const vorlagen = import.meta.glob<string>('../legacy/vorlagen/*.html', { eager: true, query: '?raw', import: 'default' });

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
    .replaceAll('{{IMG_URL}}', p.data.bild ?? '')
    .replaceAll('{{IMG}}', wpImg(p.data.bild, {
      size: imgSize, alt: p.data.bildAlt,
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

/** Inhalt eines Beitrags: Original-Markup (Import) oder aus CMS-Feldern erzeugt. */
export async function postContent(p: Post): Promise<string> {
  if (p.data.legacy) {
    const raw = postFiles[`../legacy/posts/${p.id}.html`];
    if (raw) return raw;
  }
  return p.collection === 'projekte' ? projektContent(p as Projekt) : blogContent(p as Blog);
}

function vorlage(name: string): string {
  return vorlagen[`../legacy/vorlagen/${name}.html`];
}

function youtubeSettings(url: string): string {
  return attr(JSON.stringify({ youtube_url: url, video_type: 'youtube', controls: 'yes' }));
}

async function projektContent(p: Projekt): Promise<string> {
  const d = p.data;
  const info = [
    '<p><strong>KUNDE</strong></p>',
    d.kunde ? `<h2 style="font-size: 1em;">${html(d.kunde)}</h2>` : '',
    d.veroeffentlichung ? `<p>Veröffentlichung: ${html(d.veroeffentlichung)}</p>` : '',
    d.leistungen.length ? `<p><strong>LEISTUNGEN</strong></p>\n<ul>\n${d.leistungen.map((l) => `<li>${html(l)}</li>`).join('\n')}\n</ul>` : '',
  ].join('\n');
  let text = await markdown(p.body ?? '');
  if (d.projektLink) {
    text += `<h3 style="font-size: 1em; line-height: 1.3em;"><a href="${attr(d.projektLink.url)}" target="_blank" rel="noopener">${html(d.projektLink.text)}</a></h3>`;
  }
  const medien = d.medien.map((m) => {
    if (m.typ === 'bild') {
      return vorlage('projekt-bild').replace('{{IMG}}', wpImg(m.bild, { size: 'full', alt: m.alt }));
    }
    if (m.typ === 'video') return vorlage('projekt-video').replace('{{SETTINGS}}', youtubeSettings(m.youtube));
    return vorlage('projekt-galerie').replace('{{ITEMS}}', galerie(m.bilder));
  }).join('\n');
  return vorlage('projekt')
    .replaceAll('{{ID}}', String(postId(p)))
    .replace('{{INFO}}', info)
    .replace('{{TEXT}}', text)
    .replace('{{MEDIEN}}', medien);
}

function galerie(bilder: { bild: string; alt: string }[]): string {
  return bilder.map((b) => {
    const d = dimensions(b.bild);
    const size = d ? ` data-width="${d.width}" data-height="${d.height}"` : '';
    return `
							<div class="e-gallery-item elementor-gallery-item elementor-animated-content">
					<div class="e-gallery-image elementor-gallery-item__image" data-thumbnail="${attr(b.bild)}"${size} aria-label="${attr(b.alt)}" role="img" ></div>
											<div class="elementor-gallery-item__overlay"></div>
														</div>`;
  }).join('');
}

async function blogContent(p: Blog): Promise<string> {
  const d = p.data;
  let faq = '';
  if (d.faq?.fragen.length) {
    const items = await Promise.all(d.faq.fragen.map(async (f, i) => vorlage('blog-faq-item')
      .replaceAll('{{N}}', String(i + 1))
      .replaceAll('{{ITEM_ID}}', `${postId(p)}${i}`)
      .replace('{{TABINDEX}}', i === 0 ? '0' : '-1')
      .replace('{{FRAGE}}', html(f.frage))
      .replace('{{ANTWORT}}', await markdown(f.antwort))));
    faq = vorlage('blog-faq').replace('{{FAQ_TITEL}}', html(d.faq.titel)).replace('{{FRAGEN}}', items.join('\n'));
  }
  const cta = d.cta ?? {
    text: '### Du hast Fragen oder benötigst Unterstützung bei deinen Marketingmaßnahmen?\n\nKontaktiere uns gerne für ein unverbindliches Erstgespräch.',
    button: 'Jetzt Unterstützung anfragen',
    link: '/thinkfox-marketing-projekt-anfragen/',
  };
  return vorlage('blog')
    .replaceAll('{{ID}}', String(postId(p)))
    .replace('{{TEXT}}', await markdown(p.body ?? ''))
    .replace('{{FAQ}}', faq)
    .replace('{{CTA_TEXT}}', await markdown(cta.text))
    .replace('{{CTA_BUTTON}}', html(cta.button))
    .replace('{{CTA_LINK}}', attr(cta.link));
}

export async function renderSingle(p: Post): Promise<string> {
  const t = singleTemplate(p);
  const isBlog = p.collection === 'blog';
  return t.template
    .replace('{{CONTENT}}', await postContent(p))
    .replaceAll('{{ID}}', String(postId(p)))
    .replaceAll('{{POST_CLASSES}}', postClasses(p))
    .replace('{{TITLE}}', wpTitle(p.data.title))
    .replace('{{IMG}}', wpImg(p.data.bild, { size: 'full', alt: p.data.bildAlt, fetchpriority: isBlog ? 'high' : undefined }));
}

/** Stylesheets für einen Beitrag: die des Originals (Import) bzw. die des Templates + Vorlage. */
export function postStyles(p: Post): { styles: StyleRef[]; scripts: ScriptRef[]; bodyClass: string } {
  const own = postMeta[`../legacy/posts/${p.id}.json`];
  if (p.data.legacy && own) return own.default;
  const t = singleTemplate(p);
  const ex = t.wpId;
  const styles = t.styles
    .filter((s) => !(s.type === 'link' && s.href?.endsWith(`/post-${ex}.css`)))
    .concat([{ type: 'link', href: asset(`/css/vorlage-${p.collection === 'blog' ? 'blog' : 'projekt'}.css`), id: 'vorlage-css' }]);
  const bodyClass = t.bodyClass
    .replace(new RegExp(`postid-${ex}\\b`), `postid-${postId(p)}`)
    .replace(new RegExp(`elementor-page-${ex}\\b`), `elementor-page-${postId(p)}`);
  return { styles, scripts: t.scripts, bodyClass };
}
