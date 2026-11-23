// Design-Vergleich: baut nichts, sondern vergleicht zwei fertige Builds (alt = main, neu = Änderung) Bild für Bild.
// Aufruf: node scripts/design-check/vergleich.mjs <alt-dist> <neu-dist> <ausgabe-ordner>
// Screenshots im Zustand ohne JavaScript (CLAUDE.md: ohne JS pixelgleich), alle Bilder vollständig geladen.
// Ergebnis: ausgabe/bericht.md (für die Zusammenfassung im Pull Request) und Bilder alt/neu/diff je Abweichung.
// Exit-Code 1, wenn sich etwas unterscheidet.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const [altDir, neuDir, ausDir] = process.argv.slice(2);
if (!altDir || !neuDir || !ausDir) { console.error('Aufruf: vergleich.mjs <alt-dist> <neu-dist> <ausgabe>'); process.exit(2); }
const cfg = JSON.parse(fs.readFileSync(new URL('./seiten.json', import.meta.url), 'utf8'));
fs.mkdirSync(ausDir, { recursive: true });

const TYPEN = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.avif': 'image/avif',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.ico': 'image/x-icon', '.mp4': 'video/mp4', '.txt': 'text/plain' };
function server(dir) {
  return new Promise((ok) => {
    const s = http.createServer((req, res) => {
      let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      let f = path.join(dir, p);
      if (!f.startsWith(path.resolve(dir))) { res.writeHead(403); return res.end(); }
      if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
      if (!fs.existsSync(f)) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { 'content-type': TYPEN[path.extname(f).toLowerCase()] || 'application/octet-stream' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok(s));
  });
}

const browser = await chromium.launch();
const [sAlt, sNeu] = await Promise.all([server(path.resolve(altDir)), server(path.resolve(neuDir))]);
const basis = (s) => `http://127.0.0.1:${s.address().port}`;

async function foto(url, breite) {
  // Zustand „ohne JavaScript“ nachgebildet: Skripte aus dem HTML entfernt, <noscript>-Inhalte sichtbar.
  // JavaScript bleibt für Playwright an, damit wir warten können, bis alle Bilder und Schriften geladen sind.
  const ctx = await browser.newContext({ viewport: { width: breite, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.route('**/*', async (route) => {
    const r = route.request();
    // Skripte nie; Videodaten nicht (Pufferstand in der Bedienleiste wäre bei jedem Lauf anders)
    if (r.resourceType() === 'script' || r.resourceType() === 'media') return route.abort();
    if (r.resourceType() !== 'document') return route.continue();
    const resp = await route.fetch();
    const body = (await resp.text())
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<noscript>([\s\S]*?)<\/noscript>/gi, '$1')
      .replace(/\sloading="lazy"/g, '');   // lazy geladene Bilder für den Vergleich sofort laden
    return route.fulfill({ response: resp, body });
  });
  const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map((i) => (i.complete ? i.decode().catch(() => {}) : new Promise((ok) => { i.onload = i.onerror = ok; }))));
  });
  await page.addStyleTag({ content: 'video::-webkit-media-controls { display: none !important; }' });
  await page.waitForTimeout(300);
  const png = await page.screenshot({ fullPage: true, animations: 'disabled' });
  await ctx.close();
  return { png, status: resp ? resp.status() : 0 };
}

// Bildvergleich im Browser (Canvas), damit keine weitere Bibliothek nötig ist
const rechner = await (await browser.newContext()).newPage();
async function vergleiche(a, b) {
  return rechner.evaluate(async ([a64, b64]) => {
    const lade = (s) => new Promise((ok, err) => { const i = new Image(); i.onload = () => ok(i); i.onerror = err; i.src = 'data:image/png;base64,' + s; });
    const [A, B] = await Promise.all([lade(a64), lade(b64)]);
    const w = Math.max(A.width, B.width), h = Math.max(A.height, B.height);
    const daten = (img) => { const c = new OffscreenCanvas(w, h); const x = c.getContext('2d'); x.fillStyle = '#ff00ff'; x.fillRect(0, 0, w, h); x.drawImage(img, 0, 0); return x.getImageData(0, 0, w, h).data; };
    const da = daten(A), db = daten(B);
    const diff = new OffscreenCanvas(w, h); const dx = diff.getContext('2d'); dx.drawImage(B, 0, 0); dx.fillStyle = 'rgba(255,255,255,0.75)'; dx.fillRect(0, 0, w, h);
    const out = dx.getImageData(0, 0, w, h); let n = 0, oben = -1, unten = -1;
    for (let i = 0; i < da.length; i += 4) {
      const d = Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2]);
      if (d > 24) { n++; out.data[i] = 230; out.data[i + 1] = 0; out.data[i + 2] = 60; out.data[i + 3] = 255; const y = Math.floor(i / 4 / w); if (oben < 0) oben = y; unten = y; }
    }
    if (!n) return { n: 0, groesse: [A.width, A.height, B.width, B.height] };
    dx.putImageData(out, 0, 0);
    const blob = await diff.convertToBlob({ type: 'image/png' });
    const buf = new Uint8Array(await blob.arrayBuffer()); let s = ''; for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode(...buf.subarray(i, i + 0x8000));
    return { n, oben, unten, groesse: [A.width, A.height, B.width, B.height], diff: btoa(s) };
  }, [a.toString('base64'), b.toString('base64')]);
}

const zeilen = []; let abweichungen = 0;
for (const [name, pfad] of Object.entries(cfg.seiten)) {
  for (const breite of cfg.breiten) {
    const [alt, neu] = await Promise.all([foto(basis(sAlt) + pfad, breite), foto(basis(sNeu) + pfad, breite)]);
    const r = await vergleiche(alt.png, neu.png);
    const [aw, ah, nw, nh] = r.groesse;
    let ergebnis = 'gleich';
    if (r.n || alt.status !== neu.status) {
      abweichungen++;
      const datei = `${name}-${breite}`;
      fs.writeFileSync(path.join(ausDir, `${datei}-alt.png`), alt.png);
      fs.writeFileSync(path.join(ausDir, `${datei}-neu.png`), neu.png);
      if (r.diff) fs.writeFileSync(path.join(ausDir, `${datei}-diff.png`), Buffer.from(r.diff, 'base64'));
      const hoehe = ah !== nh ? `, Seitenhöhe ${ah} → ${nh} px` : '';
      const status = alt.status !== neu.status ? `, HTTP ${alt.status} → ${neu.status}` : '';
      ergebnis = `**geändert**: ${r.n.toLocaleString('de-DE')} Pixel, Bereich y ${r.oben}–${r.unten}${hoehe}${status}`;
    }
    zeilen.push(`| ${name} | ${pfad} | ${breite} | ${ergebnis} |`);
    console.log(name.padEnd(28), String(breite).padEnd(5), ergebnis.replace(/\*/g, ''));
  }
}
await browser.close(); sAlt.close(); sNeu.close();

const kopf = abweichungen
  ? `### Design-Vergleich: ${abweichungen} Abweichung(en)\n\nSind die Änderungen gewollt, im Pull Request das Label \`design-aenderung\` setzen. Bilder (alt/neu/diff, rot = geändert) im Artefakt **design-vergleich**.\n`
  : '### Design-Vergleich: keine Abweichung\n\nAlle Referenzseiten sind bei 1440 und 390 px pixelgleich zu `main`.\n';
fs.writeFileSync(path.join(ausDir, 'bericht.md'), `${kopf}\n| Seite | Pfad | Breite | Ergebnis |\n|---|---|---|---|\n${zeilen.join('\n')}\n`);
process.exit(abweichungen ? 1 : 0);
