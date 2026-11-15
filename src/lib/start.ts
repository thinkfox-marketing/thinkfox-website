// Startseite (Relaunch, zweite Fassung nach Rückmeldung vom 15.11.2026): weniger Abschnitte, jeder mit eigener Form und
// Fläche, damit sie sich klar voneinander absetzen; Besucher kommen im zweiten Abschnitt direkt von der Ausgangslage
// zur passenden Leistung. Reihenfolge und Flächen:
//   1 Aufmacher (Weiß, Bild läuft rechts aus dem Raster)      2 Ausgangslage → Lösung (Tinte, Zeilen als Links)
//   3 Ergebnis (Weiß, Bild links im Versatz)                  4 Referenzen (Weiß, Mosaik)
//   5 Branchen (Kalk, Karten)                                 6 Zusammenarbeit (Weiß, Stufengrafik)
//   7 Kundenstimme (Bild über die volle Breite)               8 Agentur und Studio (Kalk, Text neben Bild)
//   9 Kontakt (Tinte)
// Rahmen: src/layouts/Seite.astro, Gestaltung: public/css/seite.css, Wording/Positionierung: CLAUDE.md.
import { allPosts, categoryName, type Post } from './wp';
import { wpImg } from './media';
import { asset } from './asset';
import { CONTENT, EXTERN, SOCIAL, STUDIO, TERMIN, WEB } from './chrome';
import { KONTAKT, esc, knopf, still } from './seiten';

export const START_BESCHREIBUNG = 'Werbeagentur aus Nordhessen nahe Kassel: Marketing für mittelständische Unternehmen. Websites, Social Media, Film und Foto für mehr Sichtbarkeit bei Kunden und Fachkräften.';
export const START_HEROBILD = asset('/media/start/still-waldeck.webp');

/** Ausgangslage → Leistung: jede Zeile ist ein Link auf die Leistungsseite. */
const WEGE: { problem: string; leistung: string; text: string; href: string }[] = [
  { problem: 'Die Website bringt keine Anfragen.', leistung: 'Websites und SEO', text: 'Wir entwickeln Websites, die bei Google und in KI-Suchen gefunden werden.', href: WEB },
  { problem: 'Für Social Media fehlt die Zeit.', leistung: 'Social Media', text: 'Wir planen, produzieren und veröffentlichen Ihre Beiträge.', href: SOCIAL },
  { problem: 'Website und Broschüren zeigen austauschbare Bilder.', leistung: 'Film und Foto', text: 'Wir produzieren Filme und Fotos mit Ihren Mitarbeitenden.', href: CONTENT },
  { problem: 'Marketing läuft nur nebenbei.', leistung: 'Externe Marketingabteilung', text: 'Wir übernehmen Planung und Umsetzung Ihres Marketings.', href: EXTERN },
];

const REFERENZEN = ['recruitmentfilm-dwaz-wirtschaftskanzlei', 'karriereseite-stadt-waldeck', 'video-fotoproduktion-recup-stadt-korbach', 'vitos-haina-unternehmenskommunikation'];

export async function startSeite(): Promise<string> {
  const alle = await allPosts();
  const kacheln = REFERENZEN.map((id) => alle.find((p) => p.id === id)).filter((p): p is Post => !!p && !!p.data.bild);
  const sizes = ['(min-width: 860px) 40vw, 100vw', '(min-width: 860px) 48vw, 100vw', '(min-width: 860px) 24vw, 100vw', '(min-width: 860px) 24vw, 100vw'];
  const mosaik = kacheln.map((p, i) => {
    const d = p.data as Post['data'] & { kunde?: string };
    return `<figure class="kachel k${i + 1}"><a href="/${p.id}/">${wpImg(d.bild, { size: 'full', alt: d.bildAlt ?? d.title, cls: '', sizes: sizes[i] })}<span class="kachel__kunde">${esc(d.kunde ?? categoryName(d.kategorien[0] ?? ''))}</span><span class="kachel__titel">${esc(d.title)}</span></a></figure>`;
  }).join('\n        ');

  return `<section class="t1" aria-labelledby="titel">
    <div class="huelle">
      <ul class="t1__meta" role="list"><li>Werbeagentur in Edertal, Nordhessen</li><li>Seit 2015</li></ul>
      <div class="raster">
        <h1 id="titel">Marketing, das mittel&shy;ständische Unternehmen sichtbar macht.</h1>
        <div class="t1__unten">
          <p class="t1__text">Wir entwickeln Websites, betreuen Social-Media-Kanäle und produzieren Film und Foto, damit Kunden und Fachkräfte auf Ihr Unternehmen aufmerksam werden.</p>
          <div class="knoepfe">${knopf('Erstgespräch vereinbaren', TERMIN)}${knopf('Referenzen ansehen', '#referenzen', 'rahmen')}</div>
        </div>
      </div>
      <figure class="t1__bild">${still('still-waldeck', 'Forstwirt der Stadt Waldeck mit Schutzhelm, Szene aus dem Recruitingfilm', 1280, 720, true)}<figcaption class="bildtext">Recruitingfilm für die Nationalparkstadt Waldeck</figcaption></figure>
    </div>
  </section>

  <section class="abschnitt t-dunkel wege-abschnitt" id="leistungen" aria-labelledby="wege-titel">
    <div class="huelle raster">
      <p class="label sp-label">Leistungen</p>
      <div class="sp-inhalt">
        <h2 id="wege-titel">Typische Ausgangslagen und unsere Lösungen</h2>
      </div>
      <div class="wege-kopf" aria-hidden="true"><span>Ausgangslage</span><span></span><span>Lösung</span></div>
      <ul class="wege-liste" role="list">
        ${WEGE.map((w) => `<li><a class="weg" href="${w.href}">
          <span class="weg__problem">${esc(w.problem)}</span>
          <span class="weg__pfeil" aria-hidden="true"></span>
          <span class="weg__loesung"><b>${esc(w.leistung)}</b><span>${esc(w.text)}</span></span>
        </a></li>`).join('\n        ')}
      </ul>
    </div>
  </section>

  <section class="t3" aria-labelledby="wirkung-titel">
    <div class="huelle raster">
      <figure class="t3__bild sp-7">${still('still-wachenfeld', 'Bauleiter von Wachenfeld Bau auf einer Baustelle, Szene aus dem Recruitingfilm')}<figcaption class="bildtext">Recruitingfilm für Wachenfeld Bau, Korbach</figcaption></figure>
      <div class="t3__text sp-5r">
        <p class="label">Ergebnis</p>
        <h2 id="wirkung-titel" class="h2--klein">Was Sichtbarkeit bewirkt</h2>
        <div class="zwei">
          <div><h3>Kundengewinnung</h3><p>Interessenten finden Ihr Angebot, verstehen es und nehmen Kontakt auf.</p><p class="beleg">Beispiel: Über die Website des Vierbeiner Reha-Zentrums (Tiermedizin) werden Seminare und Kurse gebucht.</p></div>
          <div><h3>Personalgewinnung</h3><p>Bewerberinnen und Bewerber lernen Ihr Unternehmen als Arbeitgeber kennen, bevor sie sich bewerben.</p><p class="beleg">Beispiel: Die Stellenangebote der Stadt Waldeck erscheinen in der Google-Jobsuche.</p></div>
        </div>
      </div>
    </div>
  </section>

  <section class="abschnitt" id="referenzen" aria-labelledby="referenzen-titel">
    <span id="projekte"></span>
    <div class="huelle raster">
      <p class="label sp-label">Referenzen</p>
      <div class="sp-inhalt"><h2 id="referenzen-titel">Ausgewählte Projekte</h2></div>
      <div class="mosaik">
        ${mosaik}
      </div>
      <p class="sp-inhalt mehr"><a class="link" href="/referenzen/">Alle Referenzen</a></p>
    </div>
  </section>

  <section class="abschnitt abschnitt--kalk" id="branchen" aria-labelledby="branchen-titel">
    <div class="huelle raster">
      <p class="label sp-label">Branchen</p>
      <div class="sp-inhalt">
        <h2 id="branchen-titel">Branchenerfahrung</h2>
        <div class="branchen">
          <div class="branche"><h3>Kommunen &amp; öffentliche Hand</h3><p>Städte, Gemeinden und kommunale Unternehmen.</p><small>Stadt Waldeck · Stadt Korbach · Wirtschaftsförderung</small><a class="link" href="/branchen/oeffentliche-hand/">Kommunen &amp; öffentliche Hand</a></div>
          <div class="branche"><h3>Bau, Handwerk &amp; Industrie</h3><p>Betriebe, die Aufträge und Fachkräfte in der Region gewinnen wollen.</p><small>Wachenfeld Bau · Continental Korbach · KFZ Kling</small></div>
          <div class="branche"><h3>Gesundheit &amp; Soziales</h3><p>Einrichtungen im Gesundheits- und Sozialwesen.</p><small>DRV-Kliniken · Vitos Haina · Daniel Koch Jugendhilfe</small><a class="link" href="/branchen/gesundheit-soziales/">Gesundheit &amp; Soziales</a></div>
        </div>
      </div>
    </div>
  </section>

  <section class="abschnitt" aria-labelledby="zusammen-titel">
    <div class="huelle raster">
      <p class="label sp-label">Zusammenarbeit</p>
      <div class="sp-inhalt">
        <h2 id="zusammen-titel">Formen der Zusammenarbeit</h2>
        <p class="einleitung">Die meisten Kunden beginnen mit einem einzelnen Projekt.</p>
        <ol class="stufen" role="list">
          <li class="stufe" style="--hoehe:1"><h3>Einzelprojekt</h3><p>Ein abgegrenztes Vorhaben mit festem Leistungsumfang, etwa eine Website oder ein Imagefilm.</p></li>
          <li class="stufe" style="--hoehe:2"><h3>Laufende Betreuung</h3><p>Regelmäßige Leistungen in einem Bereich, zum Beispiel Social Media.</p></li>
          <li class="stufe" style="--hoehe:3"><h3>Externe Marketingabteilung</h3><p>Planung und Umsetzung Ihres gesamten Marketings mit festem Ansprechpartner.</p><a class="link" href="${EXTERN}">Externe Marketingabteilung</a></li>
        </ol>
      </div>
    </div>
  </section>

  <figure class="t2">
    <div class="t2__bild">${wpImg('/wp-content/uploads/2026/01/podcast_ederseensucht_setup.jpg', { size: 'full', alt: 'Kameras und Licht beim Dreh des Podcasts Ederseensucht', cls: '', sizes: '100vw' })}</div>
    <div class="t2__insel">
      <blockquote>„Hinter thinkfox steckt ein kreatives, professionelles und verlässliches Team, mit dem wir seit vielen Jahren gerne zusammenarbeiten.“</blockquote>
      <figcaption>Liane Linke, Google-Bewertung</figcaption>
    </div>
  </figure>

  <section class="abschnitt abschnitt--kalk" id="agentur" aria-labelledby="agentur-titel">
    <div class="huelle raster">
      <p class="label sp-label">Agentur</p>
      <div class="sp-inhalt">
        <h2 id="agentur-titel">Seit 2015 in Nordhessen</h2>
        <div class="neben">
          <div><p>thinkfox marketing ist eine Werbeagentur mit Sitz in Edertal. Strategie, Gestaltung, Webentwicklung und Produktion liegen im eigenen Team.</p><p>Für Film- und Fotoproduktionen steht ein eigenes Studio mit Hohlkehle zur Verfügung. Auf Anfrage vermieten wir es für externe Produktionen.</p><a class="link" href="${STUDIO}">Studio &amp; Vermietung</a></div>
          ${wpImg('/wp-content/uploads/2025/10/thinkfox_studio_header_12.jpg', { size: 'full', alt: 'Kamera und Leuchten vor der Hohlkehle im thinkfox Studio', cls: '', sizes: '(min-width: 860px) 40vw, 100vw' })}
        </div>
      </div>
    </div>
  </section>

  ${KONTAKT}`;
}
