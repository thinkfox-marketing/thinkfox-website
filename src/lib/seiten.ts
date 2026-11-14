// Neue Seiten im Relaunch (Markenentwurf 14.11.2026): gemeinsame Bausteine. Startseite: src/lib/start.ts, Leistungsseiten: src/lib/leistungen.ts.
// Rahmen: src/layouts/Seite.astro, Gestaltung: public/css/seite.css (Sektionsbaukasten t1–t8).
// Wording: sachlich-fachlich, Sie-Form, Aufbau Ausgangslage → Lösung → Ergebnis; Positionierung siehe CLAUDE.md.
// Inhalte nur aus belegten Projektfakten; Kunden ohne Freigabe werden nicht namentlich genannt.
import { wpImg } from './media';
import { asset } from './asset';
import { ANFRAGE, TERMIN } from './chrome';

export const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const PFEIL = '<span aria-hidden="true">→</span>';
export const knopf = (text: string, href: string, variante = '') => `<a class="knopf${variante ? ` knopf--${variante}` : ''}" href="${href}">${esc(text)}${variante ? '' : ` ${PFEIL}`}</a>`;

/** SEO-Kopf einer übernommenen Seite für die neue Fassung: Die alten Fragen (FAQPage von Rank Math) und die Artikel-Angaben
 *  (Lesedauer, Autor) stehen nicht mehr auf der Seite – die neuen Fragen kommen über strukturierteDaten() in Seite.astro. */
export function seoNeu(seo: string): string {
  return seo
    .replace(/<meta name="twitter:(?:label|data)\d" content="[^"]*" \/>\n?/g, '')
    .replace(/(<meta property="og:image:alt" content="[^"]*?)für dein Unternehmen/g, '$1für Ihr Unternehmen')
    .replace(/(<script type="application\/ld\+json"[^>]*>)([\s\S]*?)(<\/script>)/g, (m, auf: string, json: string, zu: string) => {
      let daten: { '@graph'?: Record<string, unknown>[] };
      try { daten = JSON.parse(json); } catch { return m; }
      if (!daten['@graph']) return m;
      // FAQPage steht als eigener Knoten oder verschachtelt (z. B. Article → subjectOf) im Graphen
      const istFaq = (n: unknown) => !!n && typeof n === 'object' && [(n as { '@type'?: unknown })['@type']].flat().some((t) => t === 'FAQPage' || t === 'VideoObject');
      const ohne = (n: unknown): unknown => {
        if (Array.isArray(n)) return n.filter((x) => !istFaq(x)).map(ohne);
        if (n && typeof n === 'object') {
          const o: Record<string, unknown> = {};
          for (const [k, v] of Object.entries(n)) {
            if (istFaq(v)) continue;
            const w = ohne(v);
            if (Array.isArray(w) && Array.isArray(v) && v.length && !w.length) continue; // Liste bestand nur aus der FAQ
            o[k] = w;
          }
          return o;
        }
        return n;
      };
      daten = ohne(daten) as typeof daten;
      return auf + JSON.stringify(daten).replace(/</g, '\\u003c') + zu;
    });
}

/** Abschnitt im Raster: links die Rubrik, rechts Überschrift, Einleitung und Inhalt. */
export function abschnitt(o: { id: string; rubrik: string; titel: string; einleitung?: string; inhalt: string; cls?: string; anker?: string }): string {
  return `<section class="abschnitt${o.cls ? ` ${o.cls}` : ''}"${o.anker ? ` id="${o.anker}"` : ''} aria-labelledby="${o.id}">
    <div class="huelle raster">
      <p class="label sp-label">${esc(o.rubrik)}</p>
      <div class="sp-inhalt">
        <h2 id="${o.id}">${o.titel}</h2>
        ${o.einleitung ? `<p class="einleitung">${esc(o.einleitung)}</p>` : ''}
        ${o.inhalt}
      </div>
    </div>
  </section>`;
}

export const drei = (punkte: [string, string][]) => `<div class="drei">${punkte.map(([t, p]) => `<div><h3>${esc(t)}</h3><p>${esc(p)}</p></div>`).join('')}</div>`;

const leistung = (titel: string, text: string, ergebnis: string, link?: [string, string]) => `<li class="zeile"><h3>${titel}</h3><div><p>${esc(text)}</p><p class="ergebnis"><b>Ergebnis</b>${esc(ergebnis)}</p>${link ? `<a class="link" href="${link[1]}">${esc(link[0])}</a>` : ''}</div></li>`;

export const preis = (titel: string, text: string, betrag: string) => `<div class="preis"><h3>${esc(titel)}</h3><p>${esc(text)}</p><strong>${esc(betrag)}</strong></div>`;

/** Filmstills und Website-Ansichten als seitlich scrollbare Reihe („Kontaktbogen“). */
export function bogen(label: string, eintraege: { bild: string; hoehe: number; kunde: string; art: string; href: string }[]): string {
  return `<ul class="bogen" aria-label="${esc(label)}" tabindex="0">
      ${eintraege.map((e) => `<li style="--h:${e.hoehe}px"><figure><a href="${e.href}">${e.bild}<figcaption><b>${esc(e.kunde)}</b>${esc(e.art)}</figcaption></a></figure></li>`).join('\n      ')}
    </ul>`;
}

export const still = (name: string, alt: string, w = 1280, h = 720, eager = false) =>
  `<img src="${asset(`/media/start/${name}.webp`)}" alt="${esc(alt)}" width="${w}" height="${h}"${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async">`;

/** Abschluss jeder Seite: Erstgespräch und Kontaktwege. */
export const KONTAKT = `<section class="abschnitt t-dunkel schluss" id="kontakt" aria-labelledby="schluss-titel">
    <div class="huelle raster">
      <p class="label sp-label">Kontakt</p>
      <div class="sp-inhalt">
        <h2 id="schluss-titel">Erstgespräch vereinbaren</h2>
        <p class="einleitung">In einem ersten Gespräch besprechen wir Ihre Ausgangslage und die möglichen nächsten Schritte.</p>
        <div class="knoepfe" style="margin-top:32px">${knopf('Termin auswählen', TERMIN)}${knopf('Projekt anfragen', ANFRAGE, 'rahmen')}</div>
        <div class="wege">
          <div><small>Telefon</small><span><a href="tel:+4956239737793">05623 9737793</a></span></div>
          <div><small>E-Mail</small><span><a href="mailto:hallo@thinkfox.de">hallo@thinkfox.de</a></span></div>
          <div><small>Anschrift</small><span>Bahnhofstraße 39a, Edertal</span></div>
        </div>
      </div>
    </div>
  </section>`;
