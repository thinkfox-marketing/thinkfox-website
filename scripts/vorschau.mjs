// Baut aus dist/ die passwortgeschützte Vorschau unter thinkfox.de/vorschau/ (Entwicklungszweig „relaunch“).
//   PUBLIC_VORSCHAU=1 npm run build && node scripts/vorschau.mjs
// Ergebnis: dist-vorschau/ – wird per scripts/deploy-ftp.sh nach <DEPLOY_PATH>/vorschau/ übertragen.
// - Alle eigenen Pfade (/seite/, /css/, /_astro/, /media/ …) bekommen das Präfix /vorschau, damit jeder Klick in der
//   Vorschau bleibt. /wp-content/ und /wp-includes/ (unveränderte Original-Assets) kommen weiter von der Live-Seite.
// - noindex auf jeder Seite, Band „Vorschau – nicht öffentlich“, Formulare senden nichts (kein CRM, keine Mail),
//   kein Tracking (Legacy.astro rendert <Tracking /> bei PUBLIC_VORSCHAU nicht).
// - Nicht übertragen: Sitemaps, llms.txt, robots.txt, Feed, .htaccess, api/, admin/, wp-content/, wp-includes/.
//   Den Passwortschutz (.htaccess/.htpasswd im Ordner vorschau/) legt der Verzeichnisschutz von All-Inkl an.
import fs from 'node:fs';
import path from 'node:path';

const SRC = path.resolve('dist');
const OUT = path.resolve('dist-vorschau');
const BASE = '/vorschau';
const GETEILT = /^\/(wp-content|wp-includes)\//;            // bleibt auf der Live-Seite
const WEGLASSEN = new Set(['wp-content', 'wp-includes', 'api', 'admin', 'feed', 'page-sitemap.xml', 'post-sitemap.xml',
  'sitemap_index.xml', 'sitemap.xml', 'llms.txt', 'robots.txt', '.htaccess']);

if (!fs.existsSync(path.join(SRC, 'index.html'))) { console.error('dist/ fehlt – erst bauen.'); process.exit(1); }
fs.rmSync(OUT, { recursive: true, force: true });

// Pfad umschreiben: "/x" → "/vorschau/x", "https://thinkfox.de/x" → "/vorschau/x"; Fremdes und Geteiltes bleibt.
function pfad(u) {
  if (/^https?:\/\/(www\.)?thinkfox\.de(\/|$)/i.test(u)) u = u.replace(/^https?:\/\/(www\.)?thinkfox\.de/i, '') || '/';
  if (!u.startsWith('/') || u.startsWith('//') || u.startsWith(BASE + '/') || u === BASE) return u;
  if (GETEILT.test(u)) return u;
  return BASE + u;
}
// jedes Attribut mit Wurzelpfad (href, src, data-tf-hochkant …) und absolute thinkfox.de-Adressen in Link-Attributen
const ATTR = /(\s[a-zA-Z][\w:-]*)=(["'])(\/(?!\/)[^"']*)\2/g;
const ABS = /\b(href|src|action|content)=(["'])(https?:\/\/(?:www\.)?thinkfox\.de(?:\/[^"']*)?)\2/gi;
const SRCSET = /\b(srcset|data-srcset|imagesrcset)=(["'])([^"']*)\2/gi;
const CSSURL = /url\(\s*(["']?)(\/[^"')]*)\1\s*\)/gi;

const BAND = `<div id="tf-vorschau-band" role="note" style="position:sticky;top:0;z-index:100000;background:#1d1b33;color:#fff;font:600 14px/1.4 Outfit,system-ui,sans-serif;text-align:center;padding:8px 16px">Vorschau – nicht öffentlich. Formulare senden in der Vorschau nichts ab. <a id="tf-vorschau-live" href="/" style="color:#fff;text-decoration:underline;margin-left:8px">Gleiche Seite live ansehen</a></div>`;
// Link „live ansehen“ zeigt auf dieselbe Seite ohne /vorschau (wird beim Aufruf gesetzt)
const LIVELINK = `<script>(function(){var a=document.getElementById('tf-vorschau-live');if(a)a.href=location.pathname.replace(/^\\/vorschau(?=\\/)/,'')||'/';})();</script>`;
const SPERRE = `<script>(function(){function m(f){var n=f.querySelector('.tf-vorschau-hinweis');if(!n){n=document.createElement('p');n.className='tf-vorschau-hinweis';n.setAttribute('role','status');n.style.cssText='background:#fff3cd;color:#5c4400;padding:10px 12px;border-radius:6px;font-weight:600';f.prepend(n);}n.textContent='Vorschau: Dieses Formular sendet nichts ab.';}document.addEventListener('submit',function(e){e.preventDefault();e.stopImmediatePropagation();m(e.target);},true);})();</script>`;

function html(s) {
  s = s.replace(ATTR, (m, a, q, u) => `${a}=${q}${pfad(u)}${q}`);
  s = s.replace(ABS, (m, a, q, u) => `${a}=${q}${pfad(u)}${q}`);
  s = s.replace(SRCSET, (m, a, q, v) => `${a}=${q}${v.split(',').map((t) => t.replace(/^(\s*)(\S+)/, (x, w, u) => w + pfad(u))).join(',')}${q}`);
  s = s.replace(CSSURL, (m, q, u) => `url(${q}${pfad(u)}${q})`);
  // Formular-Endpunkt (auch JSON-escaped im Forminator-Setup) unbrauchbar machen – nichts erreicht die Live-API.
  s = s.replace(/\\\/api\\\/ajax\.php/g, '\\/vorschau\\/gesperrt').replace(/(["'])\/api\/ajax\.php/g, '$1/vorschau/gesperrt');
  // feste Pfade in eingebetteten Skripten (z. B. Hintergrundvideo) – Attribute sind oben schon umgeschrieben
  s = s.replace(/(['`])\/(media|css|_css|_astro|uploads|js)\//g, `$1${BASE}/$2/`);
  // dieselben Pfade JSON-escaped in Elementor-Einstellungen (data-settings, &quot;\/media\/…&quot;)
  s = s.replace(/(&quot;|")\\\/(media|css|_css|_astro|uploads|js)\\\//g, `$1\\/vorschau\\/$2\\/`);
  s = s.replace(/<meta name="robots"[^>]*>/gi, '');
  s = s.replace(/<head>/i, '<head>\n<meta name="robots" content="noindex, nofollow">');
  s = s.replace(/(<body[^>]*>)/i, `$1${BAND}`);
  s = s.replace(/<\/body>/i, `${SPERRE}${LIVELINK}</body>`);
  return s;
}
function css(s) { return s.replace(CSSURL, (m, q, u) => `url(${q}${pfad(u)}${q})`); }
// eigene Skripte: feste Pfade in Zeichenketten (z. B. hero-video.js '/media/showreel.mp4') und den Formular-Endpunkt
function js(s) {
  return s.replace(/(["'`])\/(media|css|_css|_astro|uploads|js)\//g, `$1${BASE}/$2/`).replace(/\/api\/ajax\.php/g, '/vorschau/gesperrt');
}

let n = { html: 0, css: 0, js: 0, kopie: 0 };
function lauf(rel) {
  const von = path.join(SRC, rel), nach = path.join(OUT, rel);
  for (const e of fs.readdirSync(von, { withFileTypes: true })) {
    if (rel === '' && WEGLASSEN.has(e.name)) continue;
    const r = path.join(rel, e.name);
    if (e.isDirectory()) { lauf(r); continue; }
    fs.mkdirSync(path.dirname(path.join(OUT, r)), { recursive: true });
    const z = path.join(OUT, r), q = path.join(SRC, r);
    if (/\.html$/i.test(e.name)) { fs.writeFileSync(z, html(fs.readFileSync(q, 'utf8'))); n.html++; }
    else if (/\.css$/i.test(e.name)) { fs.writeFileSync(z, css(fs.readFileSync(q, 'utf8'))); n.css++; }
    else if (/\.m?js$/i.test(e.name)) { fs.writeFileSync(z, js(fs.readFileSync(q, 'utf8'))); n.js++; }
    else { fs.copyFileSync(q, z); n.kopie++; }
  }
}
lauf('');
console.log(`Vorschau: ${n.html} Seiten, ${n.css} CSS, ${n.js} JS umgeschrieben, ${n.kopie} Dateien kopiert → dist-vorschau/ (Ziel ${BASE}/)`);
