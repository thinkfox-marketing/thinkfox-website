// Fasst die Stylesheets einer Seite (bis zu ~50 Elementor-Dateien + Inline-Styles) in Original-
// Reihenfolge zu einer Datei zusammen: ein Request statt vieler, gleiche Kaskade → gleiche Optik.
// Die Dateien schreibt die Integration in astro.config.mjs nach dist/_css/ (nur im Build).
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import type { StyleRef } from './wp';

type Store = Map<string, string>;
const store: Store = ((globalThis as Record<string, unknown>).__tfCssBundles ??= new Map()) as Store;
const dateiCache = new Map<string, string>();

/** CSS einer Datei mit absoluten url()-Pfaden (relativ zur Datei aufgelöst). */
function lesen(href: string): string {
  const pfad = href.split(/[?#]/)[0];
  if (!dateiCache.has(pfad)) {
    let css = fs.readFileSync(path.join('public', decodeURI(pfad)), 'utf8');
    const dir = path.posix.dirname(pfad);
    css = css
      .replace(/@charset\s+"[^"]*";/gi, '')
      .replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, (m, q: string, u: string) =>
        /^(data:|https?:|\/|#)/.test(u) ? m : `url(${q}${path.posix.normalize(path.posix.join(dir, u))}${q})`);
    dateiCache.set(pfad, css);
  }
  return dateiCache.get(pfad)!;
}

const schluessel = (s: StyleRef) => (s.type === 'link' ? `L:${s.href}` : `S:${s.css}`);

/** Wie viele der übernommenen Seiten/Beiträge/Templates nutzen ein Stylesheet? */
const listen = Object.values(import.meta.glob<{ default: { styles?: StyleRef[] } }>(
  ['../legacy/pages/*.json', '../legacy/posts/*.json', '../legacy/templates/*.json'], { eager: true },
)).map((m) => m.default.styles ?? []).filter((l) => l.length);
const haeufigkeit = new Map<string, number>();
for (const l of listen) for (const k of new Set(l.map(schluessel))) haeufigkeit.set(k, (haeufigkeit.get(k) ?? 0) + 1);
const geteilt = (s: StyleRef) => (haeufigkeit.get(schluessel(s)) ?? 0) >= 0.8 * listen.length;

function schreiben(teile: string[]): string {
  const css = teile.join('\n');
  const hash = crypto.createHash('sha1').update(css).digest('hex').slice(0, 12);
  store.set(hash, css);
  return `/_css/${hash}.css`;
}

export interface Bundle { hrefs: string[]; ids: string[] }

/**
 * Teilt die Stylesheets in aufeinanderfolgende Abschnitte: Stylesheets, die (fast) alle Seiten nutzen,
 * und seitenspezifische. Gleiche Abschnitte ergeben auf allen Seiten dieselbe Datei → Browser-Cache.
 */
export function cssBundle(styles: StyleRef[], extra: string[] = []): Bundle {
  const hrefs: string[] = [];
  const ids: string[] = [];
  let teile: string[] = [];
  let modus: boolean | null = null;
  for (const s of styles) {
    const g = geteilt(s);
    if (modus !== null && g !== modus && teile.length) { hrefs.push(schreiben(teile)); teile = []; }
    modus = g;
    if (s.type === 'link' && s.href) {
      teile.push(`/* ${s.href} */\n${lesen(s.href)}`);
      if (s.id) ids.push(s.id);
    } else if (s.css) {
      teile.push(s.css.replace(/^<style\b[^>]*>/i, '').replace(/<\/style>\s*$/i, ''));
    }
  }
  if (teile.length) hrefs.push(schreiben(teile));
  for (const href of extra) hrefs.push(schreiben([`/* ${href} */\n${lesen(href)}`]));
  return { hrefs, ids };
}

/** Für die Integration: alle im Build erzeugten Bündel. */
export function alleBundles(): Store {
  return store;
}
