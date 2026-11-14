// Referenzseiten (Projekte) und Referenzen-Übersicht im neuen Erscheinungsbild – Rahmen src/layouts/Seite.astro.
// Inhalte ausschließlich aus den CMS-Feldern (src/content/projekte/*.md): Aufgabe, Lösung, Ergebnis, Leistungen, Medien.
// Aufbau: Aufmacher mit Projektdaten → Bild/Video → Aufgabe · Lösung · Ergebnis → Leistungen → Medien → Kundenstimme →
// vergleichbare Projekte → Kontakt. Das frühere Layout (beitrag.ts → projektSeite) bleibt als Archiv bestehen.
import { markdown } from './markdown';
import { wpImg } from './media';
import { youtubeEinbettung } from './barrierefreiheit';
import { allPosts, categoryName, type Post, type Projekt } from './wp';
import { aehnliche, medium, teaserText } from './beitrag';
import { CONTENT, EB, SOCIAL, WEB } from './chrome';
import { KONTAKT, esc } from './seiten';

const LEISTUNGSSEITE: Record<string, [string, string]> = {
  website: [WEB, 'Websites und SEO'], seo: [WEB, 'Websites und SEO'],
  'video-filmproduktion': [CONTENT, 'Film und Foto'], fotoproduktion: [CONTENT, 'Film und Foto'], 'video-podcast': [CONTENT, 'Film und Foto'],
  'socialmedia-betreuung': [SOCIAL, 'Social Media'],
};

/** Kachel einer Referenz (Mosaik, Übersicht, „Vergleichbare Projekte“). */
export function kachel(p: Post, cls = '', sizes = '(min-width: 860px) 32vw, 100vw'): string {
  const d = p.data as Post['data'] & { kunde?: string };
  return `<figure class="kachel${cls ? ` ${cls}` : ''}"><a href="/${p.id}/">${wpImg(d.bild, { size: 'full', alt: d.bildAlt ?? d.title, cls: '', sizes })}<span class="kachel__kunde">${esc(d.kunde ?? categoryName(d.kategorien[0] ?? ''))}</span><span class="kachel__titel">${esc(d.title)}</span></a></figure>`;
}

export async function referenzSeite(p: Projekt): Promise<{ main: string; heroBild?: string }> {
  const d = p.data;
  const teile = (await Promise.all(([['Aufgabe', d.aufgabe], ['Lösung', d.loesung], ['Ergebnis', d.ergebnis]] as [string, string | undefined][])
    .filter(([, md]) => !!md?.trim())
    .map(async ([titel, md]) => [titel, await markdown(md!)] as [string, string])));
  const einleitung = teaserText(d, teile.filter(([t]) => t !== 'Ergebnis').map(([, h]) => h).join(' '));
  const steckbrief = [
    d.kunde && ['Kunde', esc(d.kunde)],
    d.branche && ['Branche', esc(d.branche)],
    d.veroeffentlichung && ['Jahr', esc(d.veroeffentlichung)],
    d.projektLink && ['Online', `<a href="${esc(d.projektLink.url)}" target="_blank" rel="noopener">${esc(d.projektLink.text)}<span class="sr"> (öffnet in neuem Tab)</span></a>`],
  ].filter(Boolean) as [string, string][];
  const recruiting: [string, string][] = /recruiting|karriere/i.test(`${d.title} ${d.leistungen.join(' ')}`) ? [[EB, 'Employer Branding']] : [];
  const seiten = [...new Map([...recruiting, ...d.kategorien.map((k) => LEISTUNGSSEITE[k]).filter(Boolean)].map((x) => [x[0], x])).values()].slice(0, 2);

  // Reine Videoprojekte: oben das erste Video statt des Beitragsbilds
  const kopfVideo = d.kopf === 'video' ? d.medien.find((m) => m.typ === 'video') : undefined;
  const medien = d.medien.filter((m) => m !== kopfVideo);
  const kopfMedium = kopfVideo
    ? `<figure class="t1__bild t1__bild--video">${youtubeEinbettung(kopfVideo.youtube, `Video: ${d.title} (YouTube)`)}</figure>`
    : d.bild ? `<figure class="t1__bild t1__bild--referenz">${wpImg(d.bild, { size: 'full', alt: d.bildAlt, fetchpriority: 'high', cls: '', sizes: '(min-width: 960px) 75vw, 100vw' })}</figure>` : '';
  const weitere = await aehnliche(p, 2);

  const main = `<article>
  <section class="t1 t1--unterseite" aria-labelledby="titel">
    <div class="huelle">
      <nav aria-label="Brotkrumen"><ol class="pfad" role="list"><li><a href="/">Start</a></li><li><a href="/referenzen/">Referenzen</a></li><li><span aria-current="page">${esc(d.kunde ?? d.title)}</span></li></ol></nav>
      <div class="raster">
        <h1 id="titel">${esc(d.title)}</h1>
        ${einleitung ? `<div class="t1__unten"><p class="t1__text">${esc(einleitung)}</p></div>` : ''}
      </div>
      ${steckbrief.length ? `<dl class="steckbrief">${steckbrief.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>` : ''}
      ${kopfMedium}
    </div>
  </section>

  ${teile.length ? `<section class="abschnitt fall" aria-label="Projektbeschreibung">
    <div class="huelle">
      ${teile.map(([titel, html]) => `<div class="raster fall__teil">
        <h2 class="label sp-label">${titel}</h2>
        <div class="sp-inhalt text">${html}</div>
      </div>`).join('\n      ')}
    </div>
  </section>` : ''}

  ${d.leistungen.length ? `<section class="abschnitt abschnitt--kalk" aria-labelledby="leistungen-titel">
    <div class="huelle raster">
      <h2 class="label sp-label" id="leistungen-titel">Leistungen</h2>
      <div class="sp-inhalt">
        <ul class="leistungsliste" role="list">${d.leistungen.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>
        ${seiten.length ? `<p class="mehr">${seiten.map(([url, text]) => `<a class="link" href="${url}">${esc(text)}</a>`).join(' &nbsp; ')}</p>` : ''}
      </div>
    </div>
  </section>` : ''}

  ${medien.length ? `<section class="abschnitt" aria-labelledby="medien-titel">
    <div class="huelle raster">
      <h2 class="label sp-label" id="medien-titel">Einblicke</h2>
      <div class="sp-inhalt medien">${medien.map(medium).join('\n')}</div>
    </div>
  </section>` : ''}

  ${d.kundenstimme ? `<section class="abschnitt abschnitt--linie" aria-label="Kundenstimme">
    <div class="huelle raster">
      <p class="label sp-label">Kundenstimme</p>
      <figure class="sp-inhalt stimme"><blockquote>„${esc(d.kundenstimme.zitat)}“</blockquote><figcaption>${esc(d.kundenstimme.name)}${d.kundenstimme.funktion ? `, ${esc(d.kundenstimme.funktion)}` : ''}</figcaption></figure>
    </div>
  </section>` : ''}

  ${weitere.length ? `<section class="abschnitt abschnitt--linie" aria-labelledby="weitere-titel">
    <div class="huelle raster">
      <p class="label sp-label">Weitere Referenzen</p>
      <div class="sp-inhalt"><h2 id="weitere-titel">Vergleichbare Projekte</h2></div>
      <div class="mosaik mosaik--zwei">${weitere.map((x) => kachel(x, '', '(min-width: 860px) 48vw, 100vw')).join('')}</div>
      <p class="sp-inhalt mehr"><a class="link" href="/referenzen/">Alle Referenzen</a></p>
    </div>
  </section>` : ''}
</article>

  ${KONTAKT}`;
  return { main };
}

/** Übersicht aller Referenzen unter /referenzen/. */
export async function referenzenSeite(): Promise<string> {
  const projekte = (await allPosts()).filter((p) => p.collection === 'projekte' && p.data.bild);
  return `<section class="t1 t1--unterseite t1--ohne-bild" aria-labelledby="titel">
    <div class="huelle">
      <nav aria-label="Brotkrumen"><ol class="pfad" role="list"><li><a href="/">Start</a></li><li><span aria-current="page">Referenzen</span></li></ol></nav>
      <div class="raster">
        <h1 id="titel">Referenzen</h1>
        <div class="t1__unten"><p class="t1__text">Projekte für mittelständische Unternehmen, Kliniken, soziale Träger und Kommunen: Websites, Social Media, Film, Foto und Print.</p></div>
      </div>
    </div>
  </section>
  <section class="abschnitt abschnitt--knapp" aria-label="Alle Referenzen">
    <div class="huelle">
      <div class="galerie">${projekte.map((p) => kachel(p)).join('\n      ')}</div>
    </div>
  </section>

  ${KONTAKT}`;
}
