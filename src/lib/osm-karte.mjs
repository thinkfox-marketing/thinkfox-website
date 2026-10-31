// Kontakt-Karte mit OpenStreetMap statt Google Maps.
// Angezeigt wird eine statische Karte aus lokal gespeicherten OSM-Kacheln (beim Build geladen,
// scripts/astro-osm-karte.mjs) – beim Seitenaufruf gehen keine Daten an Dritte. Erst auf Klick
// lädt der Rahmen die interaktive Karte bzw. die Routenplanung von openstreetmap.org.
// Wird auch vom Build-Skript importiert, deshalb JavaScript statt TypeScript.

export const ZOOM = 16;
export const SPALTEN = 5; // 5 × 5 Kacheln à 256 px (1280 px) decken den Kartenrahmen auch auf großen Bildschirmen ab
export const ZEILEN = 5;
const FONT = '/wp-content/uploads/elementor/google-fonts/fonts/outfit-97312486.woff2';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/** Kachel-Koordinaten (gebrochen) eines Punkts */
export function kachel(lat, lon, z = ZOOM) {
  const n = 2 ** z;
  const r = (lat * Math.PI) / 180;
  return { x: ((lon + 180) / 360) * n, y: ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * n };
}

/** Die Kacheln rund um den Punkt (Ausschnitt ZEILEN × SPALTEN) */
export function kacheln(lat, lon) {
  const { x, y } = kachel(lat, lon);
  const x0 = Math.floor(x) - Math.floor(SPALTEN / 2);
  const y0 = Math.floor(y) - Math.floor(ZEILEN / 2);
  const liste = [];
  for (let j = 0; j < ZEILEN; j++) for (let i = 0; i < SPALTEN; i++) liste.push({ z: ZOOM, x: x0 + i, y: y0 + j });
  return { liste, versatzX: (x - x0) * 256, versatzY: (y - y0) * 256 };
}

const STIL = `@font-face{font-family:Outfit;src:url(${FONT}) format("woff2");font-weight:100 900}
html,body{height:100%;margin:0;overflow:hidden}
body{position:relative;font-family:Outfit,system-ui,sans-serif;background:#f2efe9;color:#fff}
.karte{position:absolute;left:50%;top:50%;display:grid;grid-template-columns:repeat(${SPALTEN},256px)}
.karte img{display:block;width:256px;height:256px}
.pin{position:absolute;left:50%;top:50%;width:36px;height:48px;transform:translate(-50%,-100%);filter:drop-shadow(0 2px 3px rgb(0 0 0/.35))}
.box{position:absolute;left:16px;bottom:32px;max-width:23rem;margin-right:16px;padding:1rem 1.2rem;border-radius:12px;background:rgb(20 16 60/.92);font-size:15px;line-height:1.45}
.box strong{display:block;font-size:17px}
.box p{margin:0}
a{color:#fff}
.laden{display:inline-block;margin:.7rem .5rem 0 0;padding:.55rem 1rem;border-radius:6px;background:#5b4ec8;font-weight:600;text-decoration:none}
.laden:hover{background:#4a3fb0}
.hinweis{margin-top:.6rem!important;font-size:13px}
.quelle{position:absolute;right:0;bottom:0;padding:2px 6px;background:rgb(255 255 255/.9);font:12px/1.4 system-ui,sans-serif;color:#333}
.quelle a{color:#333}
a:focus-visible{outline:3px solid #fff;outline-offset:2px}
.quelle a:focus-visible{outline-color:#3b3192}`;

const PIN = '<svg class="pin" viewBox="0 0 24 32" aria-hidden="true"><path d="M12 0C5.4 0 0 5.3 0 11.9 0 20.8 12 32 12 32s12-11.2 12-20.1C24 5.3 18.6 0 12 0z" fill="#3b3192"/><circle cx="12" cy="12" r="4.5" fill="#fff"/></svg>';

/**
 * Inhalt des Karten-Rahmens (für srcdoc, bereits maskiert).
 * Ohne Koordinaten bzw. Kacheln: nur Adresse + Link zu OpenStreetMap.
 * @param {{ name: string, strasse: string, plz: string, ort: string, lat?: number, lon?: number, kachelUrl?: (k: {z:number,x:number,y:number}) => string }} o
 */
export function kartenDokument(o) {
  const adresse = `${o.strasse}, ${o.plz} ${o.ort}`;
  const mitKarte = o.lat != null && o.lon != null && o.kachelUrl;
  let karte = '';
  let links;
  if (mitKarte) {
    const { liste, versatzX, versatzY } = kacheln(o.lat, o.lon);
    const imgs = liste.map((k) => `<img src="${o.kachelUrl(k)}" alt="" loading="lazy">`).join('');
    karte = `<div class="karte" aria-hidden="true" style="transform:translate(${-versatzX.toFixed(1)}px,${-versatzY.toFixed(1)}px)">${imgs}</div>${PIN}`;
    const d = 0.006;
    const embed = `https://www.openstreetmap.org/export/embed.html?bbox=${(o.lon - d).toFixed(5)},${(o.lat - d / 2).toFixed(5)},${(o.lon + d).toFixed(5)},${(o.lat + d / 2).toFixed(5)}&layer=mapnik&marker=${o.lat.toFixed(5)},${o.lon.toFixed(5)}`;
    const route = `https://www.openstreetmap.org/directions?route=%3B${o.lat.toFixed(5)}%2C${o.lon.toFixed(5)}#map=15/${o.lat.toFixed(5)}/${o.lon.toFixed(5)}`;
    links = `<a class="laden" href="${esc(embed)}">Karte bewegen</a><a class="laden" href="${esc(route)}" target="_blank" rel="noopener">Route planen</a>`;
  } else {
    links = `<a class="laden" href="https://www.openstreetmap.org/search?query=${encodeURIComponent(adresse)}" target="_blank" rel="noopener">In OpenStreetMap öffnen</a>`;
  }
  const doc = `<!doctype html><html lang="de"><head><meta charset="utf-8"><base target="_self"><style>${STIL}</style></head><body${mitKarte ? '' : ' style="background:#3b3192"'}>
${karte}<div class="box"><p><strong>${esc(o.name)}</strong>${esc(o.strasse)}<br>${esc(o.plz)} ${esc(o.ort)}</p>
${links}
<p class="hinweis">Interaktive Karte und Route kommen von OpenStreetMap: Dabei werden Daten wie deine IP-Adresse an die OpenStreetMap Foundation übertragen. <a href="/datenschutz/" target="_top">Datenschutz</a></p></div>
${mitKarte ? '<div class="quelle">© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>-Mitwirkende</div>' : ''}
</body></html>`;
  return esc(doc);
}
