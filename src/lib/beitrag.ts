// Einheitliches Layout für Projekte (Referenzen) und Blogbeiträge – eigene Ebene, semantisches HTML,
// Gestaltung in public/css/beitrag.css. Kopf- und Fußbereich der Website bleiben unverändert.
//
// Projekt: Kopf (Titel, Teaser, Steckbrief, Titelbild) → Aufgabe / Lösung / Ergebnis → Medien
//          (Video, Bild, Galerie) → Kundenstimme → Anfrage → weitere Projekte
// Blog:    Kopf (Datum, Lesezeit, Titel, Teaser, Titelbild) → Inhaltsverzeichnis → Text → FAQ →
//          Anfrage → weitere Beiträge
import { markdown } from './markdown';
import { wpImg } from './media';
import { youtubeEinbettung } from './barrierefreiheit';
import { allPosts, categoryName, postFiles, singleTemplate, type Blog, type Post, type Projekt, type ScriptRef, type StyleRef } from './wp';
import { asset } from './asset';
import { zerlegen, type Baustein } from './zerlegen';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const nurText = (h: string) => h.replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/g, ' ').replace(/\s+/g, ' ').trim();

const MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
const datum = (d: Date) => `${d.getDate()}. ${MONATE[d.getMonth()]} ${d.getFullYear()}`;

const ANFRAGE = '/thinkfox-marketing-projekt-anfragen/';

// Pfeil-Symbol der Buttons auf der Startseite (Font Awesome „arrow-alt-circle-right“)
const PFEIL = '<svg class="tf-knopf__symbol" aria-hidden="true" viewBox="0 0 512 512"><path d="M256 8c137 0 248 111 248 248S393 504 256 504 8 393 8 256 119 8 256 8zM140 300h116v70.9c0 10.7 13 16.1 20.5 8.5l114.3-114.9c4.7-4.7 4.7-12.2 0-16.9l-114.3-115c-7.6-7.6-20.5-2.2-20.5 8.5V212H140c-6.6 0-12 5.4-12 12v64c0 6.6 5.4 12 12 12z"/></svg>';
const knopf = (text: string, link: string, variante = '') =>
  `<a class="tf-knopf${variante ? ` tf-knopf--${variante}` : ''}" href="${esc(link)}">${PFEIL}<span>${esc(text)}</span></a>`;

/** Teaser unter dem Titel: eigene Einleitung, sonst SEO-Beschreibung – aber nicht, wenn er nur den
 *  Textanfang wiederholt (Beschreibung wurde in WordPress oft aus dem ersten Satz kopiert). */
function teaserText(d: Post['data'], textHtml: string): string {
  if (d.einleitung) return d.einleitung;
  const t = d.seo.beschreibung ?? '';
  const anfang = (x: string) => x.toLowerCase().replace(/[^a-zäöüß0-9]+/g, ' ').trim().slice(0, 45);
  return t && !anfang(nurText(textHtml)).includes(anfang(t).slice(0, 40)) && !nurText(textHtml).toLowerCase().includes(t.toLowerCase().slice(0, 40)) ? t : '';
}

function lesezeit(h: string): number {
  return Math.max(1, Math.round(nurText(h).split(' ').length / 200));
}

/** Überschriften-IDs für das Inhaltsverzeichnis. */
function ankerSetzen(h: string): { html: string; toc: { id: string; text: string }[] } {
  const toc: { id: string; text: string }[] = [];
  const vergeben = new Set<string>();
  // Gliederungsebene: H2, bei weniger als drei H2 die H3 (manche Beiträge sind nur mit H3 gegliedert)
  const ebene = (h.match(/<h2[\s>]/g) ?? []).length >= 3 ? 2 : 3;
  const re = new RegExp(`<h${ebene}(?: id="[^"]*")?>([\\s\\S]*?)<\\/h${ebene}>`, 'g');
  const out = h.replace(re, (m, inhalt: string) => {
    const t = nurText(inhalt);
    let id = t.toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'abschnitt';
    while (vergeben.has(id)) id += '-2';
    vergeben.add(id);
    toc.push({ id, text: t });
    return `<h${ebene} id="${id}">${inhalt}</h${ebene}>`;
  });
  return { html: out, toc };
}

function medium(m: Baustein | Projekt['data']['medien'][number]): string {
  if (m.typ === 'video') return `<figure class="tf-medium tf-medium--video">${youtubeEinbettung(m.youtube)}</figure>`;
  if (m.typ === 'bild') return `<figure class="tf-medium tf-medium--bild">${wpImg(m.bild, { size: 'full', alt: m.alt, cls: '' })}</figure>`;
  if (m.typ === 'galerie') {
    return `<ul class="tf-galerie" role="list">${m.bilder.map((b) =>
      `<li><a href="${esc(b.bild)}" target="_blank" rel="noopener">${wpImg(b.bild, { size: 'large', alt: b.alt, cls: '' })}<span class="tf-sr">(Bild in voller Größe öffnen)</span></a></li>`).join('')}</ul>`;
  }
  return '';
}

function faqHtml(titel: string, fragen: { frage: string; antwort: string }[]): string {
  if (!fragen.length) return '';
  return `<section class="tf-faq" aria-labelledby="tf-faq-titel">
  <h2 id="tf-faq-titel">${esc(titel || 'Häufige Fragen')}</h2>
  ${fragen.map((f) => `<details class="tf-faq__eintrag"><summary class="tf-faq__frage">${esc(f.frage)}</summary><div class="tf-faq__antwort">${f.antwort}</div></details>`).join('\n  ')}
</section>`;
}

function anfrage(o: { titel: string; text: string; button: string; link: string }): string {
  return `<aside class="tf-anfrage" aria-labelledby="tf-anfrage-titel">
  <div class="tf-huelle tf-anfrage__innen">
    <div><h2 id="tf-anfrage-titel" class="tf-anfrage__titel">${esc(o.titel)}</h2><p>${esc(o.text)}</p></div>
    ${knopf(o.button, o.link, 'rahmen')}
  </div>
</aside>`;
}

/** Themen für „Weitere …“: Alle Blogbeiträge haben dieselbe Kategorie – ohne Themenbezug bekämen sonst immer
 *  die drei neuesten Beiträge alle internen Links (und rankten statt der Leistungsseiten). */
const THEMEN: [string, RegExp][] = [
  ['web', /website|webseite|webdesign|relaunch|seo\b|suchmaschine|\bgeo\b|google/i],
  ['social', /social media|instagram|reichweite|personal branding|content/i],
  ['produktion', /video|film|foto|studio|360|podcast|rundg/i],
  ['recruiting', /employer|arbeitgeber|recruit|mitarbeit|karriere|bewerb|fachkr/i],
  ['strategie', /strategie|marke\b|marken|branding|marketingabteilung|start-?up|print|kampagne|corporate/i],
  ['ki', /\bki\b|künstliche intelligenz|prompt/i],
];

function themen(x: Post): Set<string> {
  const d = x.data as Record<string, unknown> & { seo?: { beschreibung?: string; fokusKeyword?: string } };
  const kopf = [d.title, d.seo?.beschreibung, d.seo?.fokusKeyword, d.einleitung, ...((d.leistungen as string[]) ?? [])]
    .filter(Boolean).join(' ');
  // Fließtext zählt erst ab mehreren Treffern – sonst passt jeder lange Artikel zu jedem Thema
  const text = [x.body, d.aufgabe, d.loesung, d.ergebnis].filter(Boolean).join(' ');
  return new Set(THEMEN.filter(([, re]) => re.test(kopf)
    || (text.match(new RegExp(re.source, 'gi'))?.length ?? 0) >= 4).map(([t]) => t));
}

async function weitere(p: Post, titel: string, mehr: string): Promise<string> {
  const alle = (await allPosts()).filter((x) => x.collection === p.collection && x.id !== p.id && x.data.bild);
  // Punkte: gleiche (fachliche) Kategorie + Themenähnlichkeit (Jaccard, damit „passt zu allem“-Beiträge nicht
  // überall auftauchen); bei Gleichstand die neueren zuerst
  const kat = new Set(p.data.kategorien.filter((k) => k !== 'blog'));
  const eigene = themen(p);
  const punkte = (x: Post) => {
    const andere = themen(x);
    const gemeinsam = [...andere].filter((t) => eigene.has(t)).length;
    const vereinigt = new Set([...andere, ...eigene]).size || 1;
    return 2 * x.data.kategorien.filter((k) => kat.has(k)).length + gemeinsam / vereinigt;
  };
  const auswahl = alle.map((x, i) => ({ x, i, s: punkte(x) })).sort((a, b) => b.s - a.s || a.i - b.i).slice(0, 3).map((o) => o.x);
  if (!auswahl.length) return '';
  return `<section class="tf-weitere" aria-labelledby="tf-weitere-titel">
  <div class="tf-huelle">
    <h2 id="tf-weitere-titel">${esc(titel)}</h2>
    <ul class="tf-karten" role="list">
    ${auswahl.map((x) => `<li class="tf-karte">
      <a class="tf-karte__link" href="/${x.id}/">
        <span class="tf-karte__bild">${wpImg(x.data.bild, { size: 'medium_large', alt: '', cls: '' })}</span>
        <span class="tf-karte__kategorie">${esc(categoryName(x.data.kategorien[0] ?? ''))}</span>
        <span class="tf-karte__titel">${esc(x.data.title)}</span>
        <span class="tf-karte__mehr" aria-hidden="true">${esc(mehr)} →</span>
      </a>
    </li>`).join('\n    ')}
    </ul>
  </div>
</section>`;
}

function pfad(stufen: { text: string; link?: string }[]): string {
  return `<nav class="tf-pfad" aria-label="Brotkrumen"><ol>${stufen.map((s) =>
    `<li>${s.link ? `<a href="${esc(s.link)}">${esc(s.text)}</a>` : `<span aria-current="page">${esc(s.text)}</span>`}</li>`).join('')}</ol></nav>`;
}

// ------------------------------------------------------------------ Projekt

/** Pfeile der Leistungs-Leiste: nur sichtbar, wenn die Leiste breiter als der Platz ist. */
const LEISTE_JS = `(()=>{const s=document.currentScript.parentElement,l=s.querySelector('.tf-leistungen__leiste'),p=s.querySelector('.tf-leistungen__pfeile'),b=p.querySelectorAll('button');
const z=()=>{const m=l.scrollWidth>l.clientWidth+2;p.hidden=!m;s.classList.toggle('tf-leistungen--mehr',m);b[0].disabled=l.scrollLeft<4;b[1].disabled=l.scrollLeft+l.clientWidth>l.scrollWidth-4;};
b.forEach(x=>x.addEventListener('click',()=>l.scrollBy({left:x.dataset.richtung*l.clientWidth*0.8,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})));
l.addEventListener('scroll',z,{passive:true});addEventListener('resize',z);z();})();`;

export async function projektSeite(p: Projekt): Promise<string> {
  const d = p.data;
  const teile = [
    ['Aufgabe', d.aufgabe], ['Lösung', d.loesung], ['Ergebnis', d.ergebnis],
  ].filter((t): t is [string, string] => !!t[1]?.trim());
  // Fließtext wie im Original: Aufgabe/Lösung/Ergebnis am Stück, nur mit schlichten Zwischenüberschriften
  const caseHtml = await Promise.all(teile.map(async ([titel, md]) => `<h2>${titel}</h2>\n${await markdown(md)}`));
  const einleitung = teaserText(d, (await Promise.all([d.aufgabe, d.loesung].map((x) => markdown(x ?? '')))).join(' '));
  const steckbrief = [
    d.kunde && ['Kunde', esc(d.kunde)],
    d.branche && ['Branche', esc(d.branche)],
    d.veroeffentlichung && ['Jahr', esc(d.veroeffentlichung)],
  ].filter(Boolean) as [string, string][];
  const link = d.projektLink
    ? `<div class="tf-steckbrief__link"><dt>Online ansehen</dt><dd><a href="${esc(d.projektLink.url)}" target="_blank" rel="noopener">${esc(d.projektLink.text)}<span class="tf-sr"> (öffnet in neuem Tab)</span> ↗</a></dd></div>` : '';
  // Leistungen als Wischleiste unter dem Kopfbereich (lange Einträge sprengten sonst den Steckbrief)
  const leistungen = d.leistungen.length ? `<section class="tf-leistungen" aria-labelledby="tf-leistungen-titel">
    <div class="tf-huelle tf-huelle--breit">
      <div class="tf-leistungen__kopf">
        <h2 id="tf-leistungen-titel" class="tf-leistungen__titel">Leistungen im Projekt</h2>
        <div class="tf-leistungen__pfeile" hidden>
          <button type="button" class="tf-leistungen__pfeil" data-richtung="-1" aria-label="Vorherige Leistungen">←</button>
          <button type="button" class="tf-leistungen__pfeil" data-richtung="1" aria-label="Weitere Leistungen">→</button>
        </div>
      </div>
      <div class="tf-leistungen__leiste" role="region" aria-labelledby="tf-leistungen-titel" tabindex="0">
        <ol class="tf-leistungen__liste" role="list">${d.leistungen.map((l, i) => `<li><span class="tf-leistungen__nr" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>${esc(l)}</li>`).join('')}</ol>
      </div>
    </div>
    <script>${LEISTE_JS}</script>
  </section>` : '';
  // Reine Videoprojekte: oben das erste Video statt des Beitragsbilds (wie im Original)
  const kopfVideo = d.kopf === 'video' ? d.medien.find((m) => m.typ === 'video') : undefined;
  const medien = d.medien.filter((m) => m !== kopfVideo);
  const kopfMedium = kopfVideo
    ? `<figure class="tf-kopf__bild tf-kopf__bild--video tf-huelle tf-huelle--breit">${youtubeEinbettung(kopfVideo.youtube, `Video: ${d.title} (YouTube)`)}</figure>`
    : d.bild ? `<figure class="tf-kopf__bild tf-huelle tf-huelle--breit">${wpImg(d.bild, { size: 'full', alt: d.bildAlt, fetchpriority: 'high', cls: '' })}</figure>` : '';
  const stimme = d.kundenstimme ? `<figure class="tf-stimme tf-huelle tf-huelle--text">
    <blockquote><p>${esc(d.kundenstimme.zitat)}</p></blockquote>
    <figcaption><strong>${esc(d.kundenstimme.name)}</strong>${d.kundenstimme.funktion ? `, ${esc(d.kundenstimme.funktion)}` : ''}</figcaption>
  </figure>` : '';

  return `<article class="tf-beitrag tf-beitrag--projekt">
  <header class="tf-kopf">
    <div class="tf-huelle tf-kopf__raster">
      <div class="tf-kopf__text">
        ${pfad([{ text: 'Start', link: '/' }, { text: 'Projekte', link: '/#projekte' }, { text: d.kunde ?? d.title }])}
        <p class="tf-kopf__marke">Projekt · ${esc(categoryName(d.kategorien[0] ?? ''))}</p>
        <h1 class="tf-kopf__titel">${esc(d.title)}</h1>
        ${einleitung ? `<p class="tf-kopf__teaser">${esc(einleitung)}</p>` : ''}
      </div>
    </div>
    ${kopfMedium}
  </header>
  ${leistungen}
  <div class="tf-case tf-huelle tf-huelle--breit">
    ${steckbrief.length || link ? `<aside class="tf-case__fakten" aria-label="Projektdaten">
      <dl class="tf-steckbrief">
        ${steckbrief.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('\n        ')}
        ${link}
      </dl>
    </aside>` : ''}
    ${caseHtml.length ? `<div class="tf-case__text tf-text">
      ${caseHtml.join('\n      ')}
    </div>` : ''}
  </div>
  ${medien.length ? `<section class="tf-medien tf-huelle" aria-label="Bilder und Videos">${medien.map(medium).join('\n')}</section>` : ''}
  ${stimme}
  ${anfrage({ titel: 'Ähnliches Projekt geplant?', text: 'Erzähl uns von deinem Vorhaben – wir melden uns mit einer ersten Einschätzung.', button: 'Projekt anfragen', link: ANFRAGE })}
  ${await weitere(p, 'Weitere Projekte', 'Projekt ansehen')}
</article>`;
}

// ------------------------------------------------------------------ Blog

/** Inhalt eines Blogbeitrags als Bausteine: aus dem Original (Import) oder aus dem Markdown-Text. */
async function blogBausteine(p: Blog): Promise<Baustein[]> {
  const raw = postFiles[`../legacy/posts/${p.id}.html`];
  if (p.data.legacy && raw) return zerlegen(raw);
  // YouTube-Link allein in einer Zeile → 2-Klick-Video
  const text = (await markdown(p.body ?? '')).replace(
    /<p>(?:<a href="[^"]*">)?(https:\/\/(?:www\.)?(?:youtu\.be|youtube\.com)\/[^<\s]+)(?:<\/a>)?<\/p>/g,
    (m, url: string) => medium({ typ: 'video', youtube: url }),
  );
  // interner Link allein in einer Zeile → Button (wie auf der Startseite)
  const mitKnoepfen = text.replace(/<p><a href="(\/[^"]*)">([^<]+)<\/a><\/p>/g, (m, link: string, t: string) => `<p>${knopf(t, link)}</p>`);
  const b: Baustein[] = [{ typ: 'text', html: mitKnoepfen }];
  if (p.data.faq?.fragen.length) {
    b.push({ typ: 'ueberschrift', ebene: 2, text: p.data.faq.titel });
    b.push({ typ: 'faq', fragen: await Promise.all(p.data.faq.fragen.map(async (f) => ({ frage: f.frage, antwort: await markdown(f.antwort) }))) });
  }
  return b;
}

export async function blogSeite(p: Blog, variante: 'neu' | 'klassisch' = 'klassisch'): Promise<string> {
  const d = p.data;
  const bausteine = await blogBausteine(p);
  // FAQ-Titel = Überschrift direkt vor dem FAQ; Abschluss-Text + Button am Ende = Anfrage-Box
  let faqTitel = d.faq?.titel ?? '';
  let cta = d.cta ? { titel: nurText(await markdown(d.cta.text.split('\n')[0])), text: nurText(await markdown(d.cta.text.split('\n').slice(1).join('\n'))), button: d.cta.button, link: d.cta.link } : null;
  const teile: string[] = [];
  let faq = '';
  for (let i = 0; i < bausteine.length; i++) {
    const b = bausteine[i], nach = bausteine[i + 1];
    if (b.typ === 'ueberschrift' && nach?.typ === 'faq') { faqTitel = b.text; continue; }
    if (b.typ === 'faq') { faq = faqHtml(faqTitel, b.fragen); continue; }
    if (b.typ === 'text' && nach?.typ === 'button' && i + 2 >= bausteine.length && !cta) {
      const t = b.html.match(/<h[2-4]>([\s\S]*?)<\/h[2-4]>/);
      cta = { titel: t ? nurText(t[1]) : 'Lass uns sprechen', text: nurText(b.html.replace(/<h[2-4]>[\s\S]*?<\/h[2-4]>/, '')), button: nach.text, link: nach.link };
      i++;
      continue;
    }
    if (b.typ === 'text') teile.push(b.html);
    else if (b.typ === 'ueberschrift') teile.push(`<h${b.ebene}>${esc(b.text)}</h${b.ebene}>`);
    else if (b.typ === 'button') teile.push(`<p>${knopf(b.text, b.link)}</p>`);
    else teile.push(medium(b));
  }
  const { html: text, toc } = ankerSetzen(teile.join('\n'));
  const min = lesezeit(text);
  const inhalt = toc.length >= 3 ? `<nav class="tf-inhalt" aria-labelledby="tf-inhalt-titel">
      <h2 id="tf-inhalt-titel" class="tf-inhalt__titel">Inhalt</h2>
      <ol>${toc.map((t) => `<li><a href="#${t.id}">${esc(t.text)}</a></li>`).join('')}</ol>
    </nav>` : '';
  cta ??= { titel: 'Du hast Fragen oder brauchst Unterstützung?', text: 'Kontaktiere uns gerne für ein unverbindliches Erstgespräch.', button: 'Jetzt Unterstützung anfragen', link: ANFRAGE };

  if (variante === 'klassisch') {
    // Aufbau wie im Original: Bild oben, leicht über dem hellblauen Hintergrund, Überschrift darunter,
    // breitere Textspalte; Abschluss und weitere Beiträge wie im neuen Layout
    return `<article class="tf-beitrag tf-beitrag--blog tf-beitrag--klassisch">
  <div class="tf-klassisch">
    ${d.bild ? `<figure class="tf-klassisch__bild">${wpImg(d.bild, { size: 'full', alt: d.bildAlt, fetchpriority: 'high', cls: '' })}</figure>` : ''}
    <div class="tf-klassisch__inhalt">
      <h1 class="tf-klassisch__titel">${esc(d.title)}</h1>
      <p class="tf-klassisch__meta"><time datetime="${d.date.toISOString().slice(0, 10)}">${datum(d.date)}</time> · ${min} Min. Lesezeit</p>
      <div class="tf-text">${text}</div>
      ${faq}
    </div>
  </div>
  ${anfrage(cta)}
  ${await weitere(p, 'Weitere Beiträge', 'Weiterlesen')}
</article>`;
  }

  return `<article class="tf-beitrag tf-beitrag--blog">
  <header class="tf-kopf">
    <div class="tf-huelle tf-huelle--text">
      ${pfad([{ text: 'Start', link: '/' }, { text: 'Blog', link: '/blog/' }, { text: d.title }])}
      <p class="tf-kopf__marke"><time datetime="${d.date.toISOString().slice(0, 10)}">${datum(d.date)}</time> · ${min} Min. Lesezeit</p>
      <h1 class="tf-kopf__titel">${esc(d.title)}</h1>
      ${teaserText(d, text) ? `<p class="tf-kopf__teaser">${esc(teaserText(d, text))}</p>` : ''}
    </div>
    ${kopfMedium}
  </header>
  ${leistungen}
  <div class="tf-huelle tf-huelle--text">
    ${inhalt}
    <div class="tf-text">${text}</div>
    ${faq}
  </div>
  ${anfrage(cta)}
  ${await weitere(p, 'Weitere Beiträge', 'Weiterlesen')}
</article>`;
}

export async function beitragSeite(p: Post, variante: 'neu' | 'klassisch' = 'klassisch'): Promise<string> {
  return p.collection === 'projekte' ? projektSeite(p as Projekt) : blogSeite(p as Blog, variante);
}

/** Stylesheets/Body-Klassen: Kopf- und Fußbereich wie bisher (Single-Vorlage), dazu beitrag.css. */
/** „Weitere Projekte“ unter den Original-Projektseiten (PROJEKTE_IM_ORIGINAL, src/lib/wp.ts). */
export async function weitereProjekte(p: Post): Promise<string> {
  const html = await weitere(p, 'Weitere Projekte', 'Projekt ansehen');
  return html ? `<div class="tf-beitrag tf-beitrag--anhang">${html}</div>` : '';
}

/** Stylesheets der Original-Projektseiten plus beitrag.css für „Weitere Projekte“. */
export function mitWeiteren(s: { styles: StyleRef[]; scripts: ScriptRef[]; bodyClass: string }) {
  return { ...s, styles: [...s.styles, { type: 'link' as const, href: asset('/css/beitrag.css'), id: 'beitrag-css' }] };
}

export function beitragStyles(p: Post): { styles: StyleRef[]; scripts: ScriptRef[]; bodyClass: string } {
  const t = singleTemplate(p);
  const styles = t.styles
    .filter((s) => !(s.type === 'link' && s.href?.endsWith(`/post-${t.wpId}.css`)))
    .concat([{ type: 'link', href: asset('/css/beitrag.css'), id: 'beitrag-css' }]);
  return { styles, scripts: t.scripts, bodyClass: `${t.bodyClass} tf-einheitlich` };
}
