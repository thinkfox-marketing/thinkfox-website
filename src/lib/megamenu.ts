// Mega-Menü für Desktop (Relaunch): ersetzt ab 1200 px das Burger-Symbol in der Kopfzeile, darunter bleibt das
// Off-Canvas-Menü (Elementor) unverändert. Gestaltung public/css/megamenu.css, Bedienung src/scripts/megamenu.js.
// Aufbau angelehnt an eine 21st.dev-Vorlage (Spalten mit Pillen-Überschrift, große Links, Vorschaubild mit
// Bildunterschrift, Fußlinks, Social-Icons) – umgesetzt ohne React/Tailwind in den Hausfarben.
// Links stehen Anliegen bzw. Branchen; beim Überfahren/Fokussieren wechseln rechts Leistungen/Beispiele und Bild.
// Muster: Disclosure-Navigation (Buttons mit aria-expanded/aria-controls), keine ARIA-Menü-Rollen.

const PFEIL = '<svg class="tf-mega__pfeil" viewBox="0 0 12 8" aria-hidden="true" focusable="false"><path d="M1 1.5 6 6.5l5-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const TERMIN = 'https://crm.thinkfox.marketing/termin.php';
const EXTERN = '/deine-externe-marketingabteilung-ganzheitliches-marketing-fuer-den-mittelstand/';
const WEB = '/professionelle-websites-fuer-den-mittelstand/';
const CONTENT = '/professionelle-content-produktion-video-foto-social-media-aus-nordhessen/';
const SOCIAL = '/mehr-aufmerksamkeit-und-reichweite-mit-social-media/';
const EB = '/employer-branding-agentur-recruitingfilm-karriereseite/';

interface Link { text: string; href: string }
interface Wahl { titel: string; href: string; links: Link[]; bild: string; bildB: number; bildH: number; unterschrift: string }
interface Spalte2 { auge: string; links: Link[] }

const esc = (s: string) => s.replace(/&(?!amp;)/g, '&amp;').replace(/"/g, '&quot;');
const pille = (t: string) => `<p class="tf-mega__rubrik">${t}</p>`;
const linkListe = (links: Link[], cls = '') => `<ul class="tf-mega__gross${cls}" role="list">${links.map((l) => `<li><a href="${esc(l.href)}">${esc(l.text)}</a></li>`).join('')}</ul>`;
const fuss = (links: Link[], socials = false) => `<div class="tf-mega__fuss">
    <ul class="tf-mega__fusslinks" role="list">${links.map((l) => `<li><a href="${esc(l.href)}">${esc(l.text)}</a></li>`).join('')}</ul>
    ${socials ? SOCIALS : ''}
  </div>`;

const ICON = {
  instagram: 'M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 5.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9zm0 2a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM17.5 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z',
  facebook: 'M14 8.5V7c0-.8.2-1.2 1.4-1.2H17V2.6c-.3 0-1.4-.1-2.6-.1-2.6 0-4.3 1.6-4.3 4.5v1.5H7.3v3.4h2.8V22H14v-10.1h2.8l.4-3.4z',
  youtube: 'M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12 31 31 0 0 0 1 16.8a3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8zM9.8 15.1V8.9l5.7 3.1z',
  linkedin: 'M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zm7 0h3.8v1.7h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6V21h-4v-5.6c0-1.3 0-3-1.9-3s-2.1 1.4-2.1 2.9V21h-4z',
};
const social = (href: string, name: string, d: string) => `<li><a href="${href}" aria-label="thinkfox auf ${name}" rel="noopener"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${d}" fill="currentColor"/></svg></a></li>`;
const SOCIALS = `<ul class="tf-mega__socials" role="list">
    ${social('https://www.instagram.com/thinkfox.marketing/', 'Instagram', ICON.instagram)}
    ${social('https://www.facebook.com/thinkfox.marketing/', 'Facebook', ICON.facebook)}
    ${social('https://www.youtube.com/channel/UCj0AA1nkmvjMYt3zQbq1FsA', 'YouTube', ICON.youtube)}
    ${social('https://de.linkedin.com/company/thinkfox-marketing', 'LinkedIn', ICON.linkedin)}
  </ul>`;

const bild = (w: Pick<Wahl, 'bild' | 'bildB' | 'bildH' | 'unterschrift'>) => `<figure class="tf-mega__bild">
      <img src="${w.bild}" alt="" width="${w.bildB}" height="${w.bildH}" loading="lazy" decoding="async">
      <figcaption>${esc(w.unterschrift)}</figcaption>
    </figure>`;

/** Panel mit Auswahl links (wechselnd) und passender Liste + Bild rechts. */
function wechselPanel(auge1: string, auge2: string, wahlen: Wahl[], fussLinks: Link[], socials = false): string {
  return `<div class="tf-mega__inhalt">
  <div class="tf-mega__spalte">
    ${pille(auge1)}
    <ul class="tf-mega__gross tf-mega__wahl" role="list">${wahlen.map((w, i) => `<li><a href="${esc(w.href)}" data-tf-wahl="${i}"${i === 0 ? ' class="is-aktiv"' : ''}>${esc(w.titel)}<span class="tf-mega__weiter" aria-hidden="true">→</span></a></li>`).join('')}</ul>
  </div>
  <div class="tf-mega__spalte">
    ${pille(auge2)}
    ${wahlen.map((w, i) => `<div class="tf-mega__wechsel" data-tf-wahl="${i}"${i ? ' hidden' : ''}>${linkListe(w.links, ' tf-mega__gross--klein')}</div>`).join('')}
  </div>
  <div class="tf-mega__vorschau">
    ${wahlen.map((w, i) => `<div class="tf-mega__wechsel" data-tf-wahl="${i}"${i ? ' hidden' : ''}>${bild(w)}</div>`).join('')}
  </div>
</div>
${fuss(fussLinks, socials)}`;
}

/** Panel mit zwei festen Spalten + Bild (ohne Wechsel). */
function festPanel(s1: Spalte2, s2: Spalte2, b: Pick<Wahl, 'bild' | 'bildB' | 'bildH' | 'unterschrift'>, fussLinks: Link[], socials = false): string {
  return `<div class="tf-mega__inhalt">
  <div class="tf-mega__spalte">${pille(s1.auge)}${linkListe(s1.links)}</div>
  <div class="tf-mega__spalte">${pille(s2.auge)}${linkListe(s2.links)}</div>
  <div class="tf-mega__vorschau">${bild(b)}</div>
</div>
${fuss(fussLinks, socials)}`;
}

const LEISTUNGEN = wechselPanel('Ihr Anliegen', 'Passende Leistungen', [
  {
    titel: 'Fachkräfte gewinnen', href: EB,
    links: [
      { text: 'Employer Branding & Recruiting', href: EB },
      { text: 'Karriereseite mit Google Jobs', href: '/karriereseite-stadt-waldeck/' },
      { text: 'Recruitingfilm', href: '/recruitmentfilm-wachenfeld-bau-korbach/' },
      { text: '360°-Rundgang der Arbeitsplätze', href: '/360-grad-rundgaenge/' },
    ],
    bild: '/wp-content/uploads/2026/01/Stadt_waldeck_karriere-768x632.jpg', bildB: 768, bildH: 632,
    unterschrift: 'Karriereseite der Stadt Waldeck mit 360°-Rundgang',
  },
  {
    titel: 'Sichtbar werden & Kunden gewinnen', href: WEB,
    links: [
      { text: 'Websites, SEO & KI-Sichtbarkeit', href: WEB },
      { text: 'Social Media & Kampagnen', href: SOCIAL },
      { text: 'Was kostet eine Website?', href: '/was-kostet-eine-website/' },
    ],
    bild: '/wp-content/uploads/2025/02/Website-vierbeiner-reha-zentrum-bad-wildungen-768x578.jpg', bildB: 768, bildH: 578,
    unterschrift: 'Vierbeiner Reha-Zentrum: Kurse über die Website verkaufen',
  },
  {
    titel: 'Marke & Vertrauen stärken', href: CONTENT,
    links: [
      { text: 'Film, Foto & Content', href: CONTENT },
      { text: 'Corporate Design', href: '/category/corporate-design/' },
      { text: 'Was kostet ein Imagefilm?', href: '/was-kostet-ein-imagefilm/' },
    ],
    bild: '/wp-content/uploads/2022/05/Daniel_Koch_Branding-768x512.jpg', bildB: 768, bildH: 512,
    unterschrift: 'Daniel Koch Jugendhilfe: ein Auftritt vom Logo bis zum Recruiting-Short',
  },
  {
    titel: 'Marketing auslagern', href: EXTERN,
    links: [
      { text: 'Externe Marketingabteilung', href: EXTERN },
      { text: 'Social-Media-Betreuung', href: SOCIAL },
      { text: 'Gestaltung nach Ihrem Corporate Design', href: '/vitos-haina-unternehmenskommunikation/' },
      { text: 'Marketing-Ampel: Selbsttest', href: '/marketing-ampel/' },
    ],
    bild: '/wp-content/uploads/2021/12/vitos_haina_broschueren_flyer_social_media-768x816.jpg', bildB: 768, bildH: 816,
    unterschrift: 'Vitos Haina: Gestaltung nach dem Corporate Design des Hauses',
  },
], [
  { text: 'Was kostet eine Website?', href: '/was-kostet-eine-website/' },
  { text: 'Was kostet ein Imagefilm?', href: '/was-kostet-ein-imagefilm/' },
  { text: 'Was kostet Social-Media-Betreuung?', href: '/social-media-betreuung-kosten/' },
]);

const BRANCHEN = wechselPanel('Branchen', 'Beispiele aus der Praxis', [
  {
    titel: 'Gesundheit & Soziales', href: '/branchen/gesundheit-soziales/',
    links: [
      { text: 'Karriereportale für drei DRV-Kliniken', href: '/karriereseiten-relaunch-fuer-deutsche-rentenversicherung-kliniken/' },
      { text: 'Vitos Haina', href: '/vitos-haina-unternehmenskommunikation/' },
      { text: 'Vierbeiner Reha-Zentrum', href: '/website-vierbeiner-reha-zentrum/' },
      { text: 'Daniel Koch Jugendhilfe', href: '/daniel-koch-jugendhilfe/' },
    ],
    bild: '/wp-content/uploads/2026/02/deutsche-rentenversicherung-karriere-website-768x904.jpg', bildB: 768, bildH: 904,
    unterschrift: 'Kliniken, Reha, Pflege und soziale Träger',
  },
  {
    titel: 'Kommunen & öffentliche Hand', href: '/branchen/oeffentliche-hand/',
    links: [
      { text: 'Karriereseite der Stadt Waldeck', href: '/karriereseite-stadt-waldeck/' },
      { text: 'Kampagne „Korbach becher machen!“', href: '/korbach-becher-machen/' },
      { text: 'Wirtschaftsförderung Waldeck-Frankenberg', href: '/website-relaunch-wirtschaftsfoerderung-waldeck-frankenberg/' },
      { text: 'Kampagne Energie Waldeck-Frankenberg', href: '/kampagne-ewf-ein-leben-lang/' },
    ],
    bild: '/wp-content/uploads/2025/10/website_wfg_waldeck_frankenberg-1-768x784.jpg', bildB: 768, bildH: 784,
    unterschrift: 'Städte, Gemeinden und kommunale Unternehmen',
  },
], [{ text: 'Alle Projekte', href: '/#projekte' }]);

const AGENTUR = festPanel(
  { auge: 'Agentur', links: [
    { text: 'So arbeiten wir', href: EXTERN },
    { text: 'Unser Studio', href: '/thinkfox-mietstudio-dein-fotostudio-videostudio-nordhessen/' },
    { text: 'Ratgeber & Blog', href: '/blog/' },
  ] },
  { auge: 'Kontakt', links: [
    { text: 'Erstgespräch vereinbaren', href: TERMIN },
    { text: 'Projekt anfragen', href: '/thinkfox-marketing-projekt-anfragen/' },
    { text: 'Kontakt & Anfahrt', href: '/kontakt/' },
  ] },
  { bild: '/wp-content/uploads/2024/09/thinkfox_studio_7-768x512.jpg', bildB: 768, bildH: 512, unterschrift: 'Unser Foto- und Videostudio in Edertal' },
  [{ text: '+49 (0)5623 9737793', href: 'tel:+4956239737793' }, { text: 'hallo@thinkfox.de', href: 'mailto:hallo@thinkfox.de' }],
  true,
);

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
