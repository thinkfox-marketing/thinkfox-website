// Kopf- und Fußzeile im neuen Erscheinungsbild (Relaunch, Markenentwurf 14.11.2026) – ersetzt auf allen Seiten die
// übernommene Elementor-Kopfzeile samt Mega-Menü und die Elementor-Fußzeile (src/legacy/chrome/* bleibt als Archiv).
// Gestaltung: public/css/chrome.css, Bedienung: src/scripts/chrome.js (Disclosure-Navigation, keine ARIA-Menü-Rollen).
// Navigation nach der Positionierung in CLAUDE.md: Leistungen, Branchen, Referenzen, Agentur; Studio unter „Agentur“.

export const TERMIN = 'https://crm.thinkfox.marketing/termin.php';
export const ANFRAGE = '/thinkfox-marketing-projekt-anfragen/';
export const WEB = '/professionelle-websites-fuer-den-mittelstand/';
export const SOCIAL = '/mehr-aufmerksamkeit-und-reichweite-mit-social-media/';
export const CONTENT = '/professionelle-content-produktion-video-foto-social-media-aus-nordhessen/';
export const EXTERN = '/deine-externe-marketingabteilung-ganzheitliches-marketing-fuer-den-mittelstand/';
export const EB = '/employer-branding-agentur-recruitingfilm-karriereseite/';
export const STUDIO = '/thinkfox-mietstudio-dein-fotostudio-videostudio-nordhessen/';

interface Link { text: string; href: string; zusatz?: string }
interface Gruppe { id: string; titel: string; links: Link[] }

const GRUPPEN: Gruppe[] = [
  { id: 'leistungen', titel: 'Leistungen', links: [
    { text: 'Websites und SEO', href: WEB, zusatz: 'Unternehmenswebsites, Suchmaschinenoptimierung, KI-Sichtbarkeit' },
    { text: 'Social Media', href: SOCIAL, zusatz: 'Redaktionsplanung, Produktion, Betreuung, Anzeigen' },
    { text: 'Film und Foto', href: CONTENT, zusatz: 'Imagefilm, Recruitingfilm, Fotografie, 360°-Rundgang' },
    { text: 'Employer Branding', href: EB, zusatz: 'Karriereseite, Recruitingfilm, Arbeitgeberkommunikation' },
    { text: 'Externe Marketingabteilung', href: EXTERN, zusatz: 'Planung und Umsetzung des gesamten Marketings' },
  ] },
  { id: 'branchen', titel: 'Branchen', links: [
    { text: 'Kommunen & öffentliche Hand', href: '/branchen/oeffentliche-hand/', zusatz: 'Städte, Gemeinden, kommunale Unternehmen' },
    { text: 'Gesundheit & Soziales', href: '/branchen/gesundheit-soziales/', zusatz: 'Gesundheits- und Sozialwesen, soziale Träger' },
  ] },
  { id: 'agentur', titel: 'Agentur', links: [
    { text: 'Studio & Vermietung', href: STUDIO, zusatz: 'Film- und Fotostudio mit Hohlkehle in Edertal' },
    { text: 'Ratgeber', href: '/blog/', zusatz: 'Kosten, Vorgehen und Hintergründe' },
    { text: 'Marketing-Ampel', href: '/marketing-ampel/', zusatz: 'Selbsttest für Ihr Marketing' },
    { text: 'Kontakt', href: '/kontakt/', zusatz: 'Anschrift, Telefon, Anfahrt' },
  ] },
];
const REFERENZEN: Link = { text: 'Referenzen', href: '/referenzen/' };

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const PFEIL = '<svg class="tfk-nav__pfeil" viewBox="0 0 12 8" aria-hidden="true" focusable="false"><path d="M1 1.5 6 6.5l5-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const WORTMARKE = (href?: string) => href
  ? `<a class="tfk-wm" href="${href}" aria-label="thinkfox – zur Startseite">thinkfox</a>`
  : '<span class="tfk-wm" role="img" aria-label="thinkfox">thinkfox</span>';

const punkt = (g: Gruppe) => `<li class="tfk-nav__punkt">
        <button type="button" class="tfk-nav__auf" aria-expanded="false" aria-controls="tfk-p-${g.id}">${g.titel}${PFEIL}</button>
        <div class="tfk-nav__panel" id="tfk-p-${g.id}" hidden><ul role="list">${g.links.map((l) =>
    `<li><a href="${l.href}">${esc(l.text)}${l.zusatz ? `<small>${esc(l.zusatz)}</small>` : ''}</a></li>`).join('')}</ul></div>
      </li>`;

const mobil = (g: Gruppe) => `<p class="tfk-menue__gruppe" id="tfk-m-${g.id}">${g.titel}</p>
    <ul role="list" aria-labelledby="tfk-m-${g.id}">${g.links.map((l) => `<li><a href="${l.href}">${esc(l.text)}</a></li>`).join('')}</ul>`;

export const KOPF = `<header class="tfk">
  <div class="tfk__innen">
    ${WORTMARKE('/')}
    <nav class="tfk-nav" aria-label="Hauptnavigation">
      <ul role="list">
      ${punkt(GRUPPEN[0])}
      ${punkt(GRUPPEN[1])}
      <li class="tfk-nav__punkt"><a class="tfk-nav__link" href="${REFERENZEN.href}">${REFERENZEN.text}</a></li>
      ${punkt(GRUPPEN[2])}
      </ul>
    </nav>
    <a class="tfk-knopf" href="${TERMIN}">Erstgespräch vereinbaren <span aria-hidden="true">→</span></a>
    <button type="button" class="tfk-menue-knopf" aria-expanded="false" aria-controls="tfk-menue"><i aria-hidden="true"></i>Menü</button>
  </div>
  <nav class="tfk-menue" id="tfk-menue" aria-label="Hauptnavigation mobil" hidden>
    ${mobil(GRUPPEN[0])}
    ${mobil(GRUPPEN[1])}
    <p class="tfk-menue__gruppe" id="tfk-m-referenzen">Referenzen</p>
    <ul role="list" aria-labelledby="tfk-m-referenzen"><li><a href="${REFERENZEN.href}">Ausgewählte Projekte</a></li></ul>
    ${mobil(GRUPPEN[2])}
    <a class="tfk-knopf" href="${TERMIN}">Erstgespräch vereinbaren</a>
  </nav>
</header>`;

const liste = (links: Link[]) => `<ul role="list">${links.map((l) => `<li><a href="${l.href}"${/^https?:/.test(l.href) ? ' rel="noopener"' : ''}>${esc(l.text)}</a></li>`).join('')}</ul>`;

export const FUSS = `<footer class="tff">
  <div class="tff__innen">
    ${WORTMARKE()}
    <div class="tff__raster">
      <p>Marketingpartner für mittelständische Unternehmen in Nordhessen. Websites, Social Media, Film und Foto. Seit 2015.</p>
      <div><p class="tff__titel">Leistungen</p>${liste(GRUPPEN[0].links)}</div>
      <div><p class="tff__titel">Agentur</p>${liste([REFERENZEN, ...GRUPPEN[1].links, ...GRUPPEN[2].links.filter((l) => l.href !== '/kontakt/')])}</div>
      <div><p class="tff__titel">Kontakt</p>
        <p>thinkfox marketing GmbH<br>Bahnhofstraße 39a<br>34549 Edertal</p>
        <ul role="list" style="margin-top:8px"><li><a href="tel:+4956239737793">05623 9737793</a></li><li><a href="mailto:hallo@thinkfox.de">hallo@thinkfox.de</a></li><li><a href="/kontakt/">Kontakt und Anfahrt</a></li></ul>
      </div>
    </div>
    <div class="tff__unten">
      ${liste([
        { text: 'Instagram', href: 'https://www.instagram.com/thinkfox.marketing/' },
        { text: 'Facebook', href: 'https://www.facebook.com/thinkfox.marketing/' },
        { text: 'YouTube', href: 'https://www.youtube.com/channel/UCj0AA1nkmvjMYt3zQbq1FsA' },
        { text: 'LinkedIn', href: 'https://de.linkedin.com/company/thinkfox-marketing' },
      ])}
      ${liste([
        { text: 'Impressum', href: '/impressum/' },
        { text: 'Datenschutz', href: '/datenschutz/' },
        { text: 'Barrierefreiheit', href: '/barrierefreiheitserklaerung/' },
      ])}
    </div>
  </div>
</footer>`;
