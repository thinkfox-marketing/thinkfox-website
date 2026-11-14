// Mega-Menü für Desktop (Relaunch): ersetzt ab 1200 px das Burger-Symbol in der Kopfzeile, darunter bleibt das
// Off-Canvas-Menü (Elementor) unverändert. Gestaltung public/css/megamenu.css, Bedienung src/scripts/megamenu.js.
// Muster: Disclosure-Navigation (Buttons mit aria-expanded/aria-controls), keine ARIA-Menü-Rollen.

const PFEIL = '<svg class="tf-mega__pfeil" viewBox="0 0 12 8" aria-hidden="true" focusable="false"><path d="M1 1.5 6 6.5l5-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const icon = (d: string) => `<span class="tf-mega__icon" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="${d}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`;
const I = {
  abteilung: 'M4 20V9l8-5 8 5v11M9 20v-6h6v6M3 20h18',
  web: 'M3 5h18v12H3zM8 21h8M12 17v4M7 9h6M7 12h10',
  film: 'M3 7h13v10H3zM16 10l5-3v10l-5-3',
  social: 'M8 12a4 4 0 1 0 8 0 4 4 0 0 0-8 0M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4',
  recruiting: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M19 8v6M22 11h-6',
  rundgang: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3',
  studio: 'M4 8h16v11H4zM9 8l1.5-3h3L15 8M12 16.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6',
  ampel: 'M9 3h6v18H9zM12 7.5v.01M12 12v.01M12 16.5v.01',
  ratgeber: 'M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2zM8 7h6M8 11h6',
  kontakt: 'M4 6h16v12H4zM4 7l8 6 8-6',
};

const eintrag = (href: string, ic: string, titel: string, text: string) => `<li><a class="tf-mega__eintrag" href="${href}">${icon(ic)}<span class="tf-mega__titel">${titel}</span><span class="tf-mega__text">${text}</span></a></li>`;

const LEISTUNGEN = `<div class="tf-mega__inhalt tf-mega__inhalt--drei">
  <div class="tf-mega__intro">
    <p class="tf-mega__dach">Leistungen</p>
    <p class="tf-mega__intro-text">Wir arbeiten wie eure externe Marketingabteilung: von der Strategie bis zum fertigen Film, laufend oder als Projekt.</p>
    <a class="tf-mega__mehr" href="/deine-externe-marketingabteilung-ganzheitliches-marketing-fuer-den-mittelstand/">So arbeiten wir <span aria-hidden="true">→</span></a>
  </div>
  <ul class="tf-mega__liste" role="list">
    ${eintrag('/deine-externe-marketingabteilung-ganzheitliches-marketing-fuer-den-mittelstand/', I.abteilung, 'Externe Marketingabteilung', 'Euer Marketing aus einer Hand, laufend betreut.')}
    ${eintrag('/professionelle-websites-fuer-den-mittelstand/', I.web, 'Websites, SEO &amp; KI-Sichtbarkeit', 'Websites, die bei Google und in KI-Suchen gefunden werden.')}
    ${eintrag('/professionelle-content-produktion-video-foto-social-media-aus-nordhessen/', I.film, 'Film, Foto &amp; Content', 'Imagefilm, Fotos und Reels, gedreht bei euch oder im eigenen Studio.')}
    ${eintrag('/mehr-aufmerksamkeit-und-reichweite-mit-social-media/', I.social, 'Social Media &amp; Kampagnen', 'Planung, Inhalte und Betreuung eurer Kanäle.')}
    ${eintrag('/employer-branding-agentur-recruitingfilm-karriereseite/', I.recruiting, 'Employer Branding &amp; Recruiting', 'Karriereseite, Recruitingfilm und Arbeitsplätze in 360°.')}
    ${eintrag('/360-grad-rundgaenge/', I.rundgang, '360°-Rundgänge', 'Räume und Arbeitsplätze virtuell begehbar machen.')}
  </ul>
  <div class="tf-mega__extra">
    <p class="tf-mega__dach">Was kostet …?</p>
    <ul class="tf-mega__links" role="list">
      <li><a href="/was-kostet-eine-website/">… eine Website</a></li>
      <li><a href="/was-kostet-ein-imagefilm/">… ein Imagefilm</a></li>
      <li><a href="/social-media-betreuung-kosten/">… Social-Media-Betreuung</a></li>
    </ul>
  </div>
</div>`;

const karte = (href: string, bild: string, alt: string, titel: string, text: string) => `<li><a class="tf-mega__karte" href="${href}">
      <img src="${bild}" alt="${alt}" width="768" height="632" loading="lazy" decoding="async">
      <span class="tf-mega__titel">${titel}</span><span class="tf-mega__text">${text}</span></a></li>`;

const BRANCHEN = `<div class="tf-mega__inhalt tf-mega__inhalt--branchen">
  <div class="tf-mega__intro">
    <p class="tf-mega__dach">Branchen</p>
    <p class="tf-mega__intro-text">Wo Vertrauen zählt, kennen wir uns aus: in Kliniken, Reha und sozialen Einrichtungen, in Verwaltungen und im beratungsstarken Mittelstand.</p>
    <a class="tf-mega__mehr" href="/#projekte">Alle Projekte <span aria-hidden="true">→</span></a>
  </div>
  <ul class="tf-mega__karten" role="list">
    ${karte('/branchen/gesundheit-soziales/', '/wp-content/uploads/2026/02/deutsche-rentenversicherung-karriere-website-768x904.jpg', '', 'Gesundheit &amp; Soziales', 'Kliniken, Reha, Pflege und soziale Träger')}
    ${karte('/branchen/oeffentliche-hand/', '/wp-content/uploads/2026/01/Stadt_waldeck_karriere-768x632.jpg', '', 'Kommunen &amp; öffentliche Hand', 'Städte, Gemeinden und kommunale Unternehmen')}
  </ul>
</div>`;

const AGENTUR = `<div class="tf-mega__inhalt tf-mega__inhalt--zwei">
  <ul class="tf-mega__liste tf-mega__liste--zwei" role="list">
    ${eintrag('/thinkfox-mietstudio-dein-fotostudio-videostudio-nordhessen/', I.studio, 'Unser Studio', 'Foto- und Videostudio in Edertal, auch zum Mieten.')}
    ${eintrag('/marketing-ampel/', I.ampel, 'Marketing-Ampel', 'Selbsttest: Wo steht dein Marketing?')}
    ${eintrag('/blog/', I.ratgeber, 'Ratgeber &amp; Blog', 'Wissen, Praxistipps und Kostenratgeber.')}
    ${eintrag('/kontakt/', I.kontakt, 'Kontakt', 'So erreichst du uns in Edertal.')}
  </ul>
  <div class="tf-mega__kontakt">
    <p class="tf-mega__dach">Lass uns reden</p>
    <p class="tf-mega__intro-text">Ein Gespräch klärt meist mehr als jede Leistungsliste.</p>
    <p class="tf-mega__daten"><a href="tel:+4956239737793">+49 (0)5623 9737793</a><br><a href="mailto:hallo@thinkfox.de">hallo@thinkfox.de</a></p>
    <a class="tf-mega__knopf" href="https://crm.thinkfox.marketing/termin.php">Erstgespräch vereinbaren</a>
  </div>
</div>`;

const punkt = (id: string, text: string, panel: string) => `<li class="tf-mega__punkt">
    <button type="button" class="tf-mega__auf" aria-expanded="false" aria-controls="tf-mega-${id}">${text}${PFEIL}</button>
    <div class="tf-mega__panel" id="tf-mega-${id}" hidden>${panel}</div>
  </li>`;

export const MEGA_MENUE = `<nav class="tf-mega" aria-label="Hauptnavigation">
  <ul class="tf-mega__leiste" role="list">
  ${punkt('leistungen', 'Leistungen', LEISTUNGEN)}
  ${punkt('branchen', 'Branchen', BRANCHEN)}
  <li class="tf-mega__punkt"><a class="tf-mega__link" href="/#projekte">Projekte</a></li>
  ${punkt('agentur', 'Agentur', AGENTUR)}
  </ul>
</nav>`;

/** Mega-Menü vor das Burger-Symbol der Kopfzeile setzen (Widget 9058bab). */
export function megaMenue(header: string): string {
  const marke = '<div class="elementor-element elementor-element-9058bab ';
  const i = header.indexOf(marke);
  return i < 0 ? header : header.slice(0, i) + MEGA_MENUE + '\n\t\t\t\t' + header.slice(i);
}
