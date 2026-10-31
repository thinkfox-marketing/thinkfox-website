// Astro-Integration: Kontakt-Karte (src/lib/osm-karte.mjs) mit OpenStreetMap-Kacheln füllen.
// - Koordinaten: aus src/lib/geo.ts (KOORDINATEN) oder per Nominatim aus der Adresse
// - Kacheln: einmalig von tile.openstreetmap.org laden, im Cache (.osm-cache/, im Workflow per
//   actions/cache) aufheben und unter /media/osm/ ausliefern – Besucher laden nichts von OSM
// Ohne Internetzugang bleibt der Platzhalter (Adresse + Link) stehen.
// Nutzungsregeln: https://operations.osmfoundation.org/policies/tiles/ und /nominatim/
import fs from 'node:fs/promises';
import path from 'node:path';
import { kacheln, kartenDokument } from '../src/lib/osm-karte.mjs';

const UA = 'thinkfox-website-build/1.0 (+https://thinkfox.de/kontakt/)';
const CACHE = path.resolve('.osm-cache');

async function holen(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res;
}

async function koordinaten(d) {
  if (d.lat != null && d.lon != null) return { lat: d.lat, lon: d.lon };
  const datei = path.join(CACHE, 'koordinaten.json');
  const schluessel = `${d.strasse}|${d.plz}|${d.ort}`;
  try {
    const c = JSON.parse(await fs.readFile(datei, 'utf8'));
    if (c.schluessel === schluessel) return c;
  } catch { /* noch nicht im Cache */ }
  const q = new URLSearchParams({ street: d.strasse, postalcode: d.plz, city: d.ort, countrycodes: 'de', format: 'jsonv2', limit: '1' });
  const [treffer] = await (await holen(`https://nominatim.openstreetmap.org/search?${q}`)).json();
  if (!treffer) throw new Error(`Adresse nicht gefunden: ${schluessel}`);
  const c = { schluessel, lat: +treffer.lat, lon: +treffer.lon };
  await fs.writeFile(datei, JSON.stringify(c));
  return c;
}

async function kachelLaden({ z, x, y }, ziel) {
  const name = `${z}-${x}-${y}.png`;
  const cache = path.join(CACHE, name);
  try {
    await fs.access(cache);
  } catch {
    const res = await holen(`https://tile.openstreetmap.org/${z}/${x}/${y}.png`);
    await fs.writeFile(cache, Buffer.from(await res.arrayBuffer()));
  }
  await fs.copyFile(cache, path.join(ziel, name));
  return `/media/osm/${name}`;
}

const unescape = (s) => s.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&amp;/g, '&');

export default function osmKarte() {
  return {
    name: 'osm-karte',
    hooks: {
      'astro:build:done': async ({ dir, pages, logger }) => {
        const root = dir.pathname;
        for (const { pathname } of pages) {
          const datei = path.join(root, pathname, 'index.html');
          let html;
          try { html = await fs.readFile(datei, 'utf8'); } catch { continue; }
          if (!html.includes('data-tf-karte=')) continue;
          const neu = [];
          for (const m of html.matchAll(/data-tf-karte="([^"]*)" srcdoc="[^"]*"/g)) {
            const d = JSON.parse(unescape(m[1]));
            try {
              await fs.mkdir(CACHE, { recursive: true });
              const ziel = path.join(root, 'media', 'osm');
              await fs.mkdir(ziel, { recursive: true });
              const { lat, lon } = await koordinaten(d);
              const urls = new Map();
              for (const k of kacheln(lat, lon).liste) urls.set(`${k.z}/${k.x}/${k.y}`, await kachelLaden(k, ziel));
              const doc = kartenDokument({ ...d, lat, lon, kachelUrl: (k) => urls.get(`${k.z}/${k.x}/${k.y}`) });
              const json = JSON.stringify({ ...d, lat, lon }).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
              neu.push([m[0], `data-tf-karte="${json}" srcdoc="${doc}"`]);
              logger.info(`Karte /${pathname}: ${lat.toFixed(5)}, ${lon.toFixed(5)}`);
            } catch (e) {
              logger.warn(`Karte /${pathname}: OpenStreetMap nicht erreichbar (${e.message}) – Platzhalter bleibt.`);
            }
          }
          for (const [von, nach] of neu) html = html.replace(von, nach);
          if (neu.length) await fs.writeFile(datei, html);
        }
      },
    },
  };
}
