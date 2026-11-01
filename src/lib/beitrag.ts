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

/** Erster Satz bzw. die ersten ~30 Wörter als Teaser. */
function teaser(t: string): string {
  const satz = t.match(/^(.{40,260}?[.!?])(\s|$)/)?.[1];
  if (satz) return satz;
  const w = t.split(/\s+/);
  return w.length > 30 ? `${w.slice(0, 30).join(' ')} …` : t;
}

function lesezeit(h: string): number {
  return Math.max(1, Math.round(nurText(h).split(' ').length / 200));
}

/** Überschriften-IDs für das Inhaltsverzeichnis. */
function ankerSetzen(h: string): { html: string; toc: { id: string; text: string }[] } {
  const toc: { id: string; text: string }[] = [];
  const vergeben = new Set<string>();
  const out = h.replace(/<h2>([\s\S]*?)<\/h2>/g, (m, inhalt: string) => {
    const t = nurText(inhalt);
    let id = t.toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'abschnitt';
    while (vergeben.has(id)) id += '-2';
    vergeben.add(id);
    toc.push({ id, text: t });
    return `<h2 id="${id}">${inhalt}</h2>`;
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
    <a class="tf-knopf tf-knopf--gelb" href="${esc(o.link)}">${esc(o.button)}</a>
  </div>
</aside>`;
}

async function weitere(p: Post, titel: string, mehr: string): Promise<string> {
  const alle = (await allPosts()).filter((x) => x.collection === p.collection && x.id !== p.id && x.data.bild);
  const kat = new Set(p.data.kategorien);
  const passend = [...alle.filter((x) => x.data.kategorien.some((k) => kat.has(k))), ...alle];
  const auswahl = [...new Map(passend.map((x) => [x.id, x])).values()].slice(0, 3);
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

export async function projektSeite(p: Projekt): Promise<string> {
  const d = p.data;
  const teile = [
    ['Aufgabe', d.aufgabe], ['Lösung', d.loesung], ['Ergebnis', d.ergebnis],
  ].filter((t): t is [string, string] => !!t[1]?.trim());
  const caseHtml = await Promise.all(teile.map(async ([titel, md], i) => `<section class="tf-case__teil">
      <p class="tf-case__nr" aria-hidden="true">${String(i + 1).padStart(2, '0')}</p>
      <h2>${titel}</h2>
      <div class="tf-text">${await markdown(md)}</div>
    </section>`));
  const einleitung = d.einleitung ?? d.seo.beschreibung ?? teaser(d.auszug);
  const steckbrief = [
    d.kunde && ['Kunde', esc(d.kunde)],
    d.branche && ['Branche', esc(d.branche)],
    d.veroeffentlichung && ['Jahr', esc(d.veroeffentlichung)],
    d.leistungen.length && ['Leistungen', `<ul class="tf-chips" role="list">${d.leistungen.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>`],
  ].filter(Boolean) as [string, string][];
  const link = d.projektLink
    ? `<p class="tf-steckbrief__link"><a href="${esc(d.projektLink.url)}" target="_blank" rel="noopener">${esc(d.projektLink.text)} ↗</a></p>` : '';
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
        <p class="tf-kopf__teaser">${esc(einleitung)}</p>
      </div>
      <dl class="tf-steckbrief">
        ${steckbrief.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('\n        ')}
        ${link}
      </dl>
    </div>
    ${d.bild ? `<figure class="tf-kopf__bild tf-huelle tf-huelle--breit">${wpImg(d.bild, { size: 'full', alt: d.bildAlt, fetchpriority: 'high', cls: '' })}</figure>` : ''}
  </header>
  <div class="tf-case tf-huelle">
    ${caseHtml.join('\n    ')}
  </div>
  ${d.medien.length ? `<section class="tf-medien tf-huelle" aria-label="Bilder und Videos">${d.medien.map(medium).join('\n')}</section>` : ''}
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
  const b: Baustein[] = [{ typ: 'text', html: await markdown(p.body ?? '') }];
  if (p.data.faq?.fragen.length) {
    b.push({ typ: 'ueberschrift', ebene: 2, text: p.data.faq.titel });
    b.push({ typ: 'faq', fragen: await Promise.all(p.data.faq.fragen.map(async (f) => ({ frage: f.frage, antwort: await markdown(f.antwort) }))) });
  }
  return b;
}

export async function blogSeite(p: Blog): Promise<string> {
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
    else if (b.typ === 'button') teile.push(`<p><a class="tf-knopf" href="${esc(b.link)}">${esc(b.text)}</a></p>`);
    else teile.push(medium(b));
  }
  const { html: text, toc } = ankerSetzen(teile.join('\n'));
  const min = lesezeit(text);
  const inhalt = toc.length >= 3 ? `<nav class="tf-inhalt" aria-labelledby="tf-inhalt-titel">
      <h2 id="tf-inhalt-titel" class="tf-inhalt__titel">Inhalt</h2>
      <ol>${toc.map((t) => `<li><a href="#${t.id}">${esc(t.text)}</a></li>`).join('')}</ol>
    </nav>` : '';
  cta ??= { titel: 'Du hast Fragen oder brauchst Unterstützung?', text: 'Kontaktiere uns gerne für ein unverbindliches Erstgespräch.', button: 'Jetzt Unterstützung anfragen', link: ANFRAGE };

  return `<article class="tf-beitrag tf-beitrag--blog">
  <header class="tf-kopf">
    <div class="tf-huelle tf-huelle--text">
      ${pfad([{ text: 'Start', link: '/' }, { text: 'Blog', link: '/blog/' }, { text: d.title }])}
      <p class="tf-kopf__marke"><time datetime="${d.date.toISOString().slice(0, 10)}">${datum(d.date)}</time> · ${min} Min. Lesezeit · ${esc(d.autor ?? 'thinkfox marketing')}</p>
      <h1 class="tf-kopf__titel">${esc(d.title)}</h1>
      <p class="tf-kopf__teaser">${esc(d.einleitung ?? d.seo.beschreibung ?? teaser(d.auszug))}</p>
    </div>
    ${d.bild ? `<figure class="tf-kopf__bild tf-huelle tf-huelle--breit">${wpImg(d.bild, { size: 'full', alt: d.bildAlt, fetchpriority: 'high', cls: '' })}</figure>` : ''}
  </header>
  <div class="tf-huelle tf-huelle--text">
    ${inhalt}
    <div class="tf-text">${text}</div>
    ${faq}
  </div>
  ${anfrage(cta)}
  ${await weitere(p, 'Weitere Beiträge', 'Weiterlesen')}
</article>`;
}

export async function beitragSeite(p: Post): Promise<string> {
  return p.collection === 'projekte' ? projektSeite(p as Projekt) : blogSeite(p as Blog);
}

/** Stylesheets/Body-Klassen: Kopf- und Fußbereich wie bisher (Single-Vorlage), dazu beitrag.css. */
export function beitragStyles(p: Post): { styles: StyleRef[]; scripts: ScriptRef[]; bodyClass: string } {
  const t = singleTemplate(p);
  const styles = t.styles
    .filter((s) => !(s.type === 'link' && s.href?.endsWith(`/post-${t.wpId}.css`)))
    .concat([{ type: 'link', href: asset('/css/beitrag.css'), id: 'beitrag-css' }]);
  return { styles, scripts: t.scripts, bodyClass: `${t.bodyClass} tf-einheitlich` };
}
