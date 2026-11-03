// Hintergrundbild des ersten Seitenabschnitts für <link rel="preload"> finden.
// Das Bild steht in Elementors Seiten-CSS (post-<id>.css) – der Browser entdeckt es sonst erst, wenn alle
// Stylesheets geladen und ausgewertet sind (PageSpeed: „LCP-Anfrage erkennen“). Die Adresse wird exakt so
// übernommen, wie sie im CSS steht, damit der Browser die vorgeladene Datei wiederverwendet.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { StyleRef } from './wp';

interface Regel { media: string | null; selektor: string; inhalt: string }

const cache = new Map<string, Regel[]>();

/** Sehr einfacher CSS-Leser: Regeln auf oberster Ebene und in @media-Blöcken. */
function regeln(css: string): Regel[] {
  const out: Regel[] = [];
  let i = 0;
  const block = (start: number): number => {
    let tiefe = 0;
    for (let j = start; j < css.length; j++) {
      if (css[j] === '{') tiefe++;
      else if (css[j] === '}' && --tiefe === 0) return j;
    }
    return css.length;
  };
  while (i < css.length) {
    const auf = css.indexOf('{', i);
    if (auf < 0) break;
    const kopf = css.slice(i, auf).trim();
    const zu = block(auf);
    if (kopf.startsWith('@media')) {
      for (const r of regeln(css.slice(auf + 1, zu))) out.push({ ...r, media: kopf.slice(6).trim() });
    } else if (!kopf.startsWith('@')) {
      out.push({ media: null, selektor: kopf, inhalt: css.slice(auf + 1, zu) });
    }
    i = zu + 1;
  }
  return out;
}

function seitenRegeln(styles: StyleRef[]): Regel[] {
  const alle: Regel[] = [];
  for (const s of styles) {
    if (s.type !== 'link' || !/\/elementor\/css\/post-\d+\.css/.test(s.href)) continue;
    const pfad = s.href.replace(/^https?:\/\/[^/]+/, '').split('?')[0];
    if (!cache.has(pfad)) {
      try { cache.set(pfad, regeln(readFileSync(join(process.cwd(), 'public', pfad), 'utf8'))); } catch { cache.set(pfad, []); }
    }
    alle.push(...cache.get(pfad)!);
  }
  return alle;
}

export interface Vorladen { href: string; media?: string }

/** Vorzuladende Bilder samt Media-Bedingung (Elementor-Breakpoints: Handy ≤ 767 px, Tablet ≤ 1024 px). */
export function heroBild(main: string, styles: StyleRef[]): Vorladen[] {
  // Oberste Abschnitte in Dokument-Reihenfolge; gesucht wird im ersten bzw. (falls dort kein Bild) im zweiten
  const starts = [...main.matchAll(/class="(elementor-section elementor-top-section [^"]*|elementor-element elementor-element-[0-9a-f]+ [^"]*\be-parent\b[^"]*)"/g)]
    .map((m) => ({ index: m.index!, klasse: m[1] }));
  const regelnAlle = seitenRegeln(styles);
  const bild = (r: Regel) => {
    const u = r.inhalt.match(/background(?:-image)?:[^;]*?url\(\s*["']?([^"')]+)["']?\s*\)/)?.[1];
    return u && !/placeholder\.png/.test(u) ? u.replace(/^https?:\/\/(www\.)?thinkfox\.de/, '') : undefined;
  };
  // nur das Element selbst (bzw. seine Motion-Effects-Ebene), keine verschachtelten Elemente, kein Hover
  const fuer = (id: string) => regelnAlle.filter((r) => bild(r) && r.selektor.split(',').some((sel) =>
    new RegExp(`\\.elementor-element-${id}(:not\\([^)]*\\))?(\\s*>\\s*\\.elementor-motion-effects-container\\s*>\\s*\\.elementor-motion-effects-layer)?\\s*$`).test(sel.trim())));
  for (let n = 0; n < Math.min(2, starts.length); n++) {
    // Nur auf einem Gerät sichtbarer Bereich (z. B. eigener Handy-Hero): kein Vorladen, sonst lädt das falsche Gerät
    if (/elementor-hidden-/.test(starts[n].klasse)) return [];
    const abschnitt = main.slice(starts[n].index, starts[n + 1]?.index ?? main.length);
    for (const treffer of abschnitt.matchAll(/class="([^"]*)"[^>]*data-id="([0-9a-f]+)"/g)) {
      const [, klasse, id] = treffer;
      const passend = fuer(id);
      if (!passend.length) continue;
      const aufHandy = !/elementor-hidden-mobile/.test(klasse);
      const aufTablet = !/elementor-hidden-tablet/.test(klasse);
      if (/elementor-hidden-desktop/.test(klasse)) continue;
      const d = passend.find((r) => r.media === null);
      const m = passend.find((r) => r.media && /max-width:\s*767px/.test(r.media));
      const db = d && bild(d);
      const mb = aufHandy ? m && bild(m) : undefined;
      const ab = aufHandy ? (aufTablet ? undefined : '(min-width: 768px)') : (aufTablet ? '(min-width: 768px)' : '(min-width: 1025px)');
      if (db && mb && db !== mb) return [{ href: db, media: '(min-width: 768px)' }, { href: mb, media: '(max-width: 767px)' }];
      if (!db && mb) return [{ href: mb, media: '(max-width: 767px)' }];
      if (db) return [{ href: db, media: ab }];
    }
  }
  return [];
}
