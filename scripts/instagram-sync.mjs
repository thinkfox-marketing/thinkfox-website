#!/usr/bin/env node
// Aktualisiert den Instagram-Feed (src/data/instagram.json + Bilder) über die Instagram-API.
// In WordPress hat das Plugin „Smash Balloon“ das automatisch erledigt.
//
//   INSTAGRAM_TOKEN=… node scripts/instagram-sync.mjs [--anzahl 40]
//
// Token: Instagram-API mit Instagram-Login (Business-/Creator-Konto), Long-Lived-Token
// (60 Tage gültig; das Skript verlängert ihn und gibt den neuen Wert aus).
// Ohne INSTAGRAM_TOKEN beendet sich das Skript ohne Änderungen (Snapshot bleibt bestehen).
import fs from 'node:fs/promises';
import path from 'node:path';

const token = process.env.INSTAGRAM_TOKEN;
if (!token) {
  console.log('INSTAGRAM_TOKEN nicht gesetzt – Instagram-Feed bleibt unverändert.');
  process.exit(0);
}
const anzahl = Number(process.argv[process.argv.indexOf('--anzahl') + 1]) || 40;
const API = 'https://graph.instagram.com';
const DATA = path.resolve('src/data/instagram.json');
const DIR = path.resolve('public/wp-content/uploads/sb-instagram-feed-images');

async function get(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json();
}

const fields = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp';
let url = `${API}/me/media?fields=${fields}&limit=50&access_token=${token}`;
const media = [];
while (url && media.length < anzahl) {
  const page = await get(url);
  media.push(...page.data);
  url = page.paging?.next;
}

const alt = JSON.parse(await fs.readFile(DATA, 'utf8'));
await fs.mkdir(DIR, { recursive: true });
const beitraege = [];
for (const m of media.slice(0, anzahl)) {
  const bildUrl = m.media_type === 'VIDEO' ? m.thumbnail_url : m.media_url;
  if (!bildUrl) continue;
  const datei = path.join(DIR, `${m.id}full.jpg`);
  try {
    await fs.access(datei);
  } catch {
    const res = await fetch(bildUrl);
    if (!res.ok) continue;
    const buf = Buffer.from(await res.arrayBuffer());
    await fs.writeFile(datei, buf);
    await fs.writeFile(path.join(DIR, `${m.id}low.jpg`), buf);
  }
  beitraege.push({
    id: m.id,
    datum: Math.floor(new Date(m.timestamp).getTime() / 1000),
    typ: { VIDEO: 'video', CAROUSEL_ALBUM: 'carousel' }[m.media_type] ?? 'image',
    link: m.permalink,
    basis: m.id,
    endung: '.jpg',
    seitenverhaeltnis: '1',
    bild: `/wp-content/uploads/sb-instagram-feed-images/${m.id}full.jpg`,
    bildKlein: `/wp-content/uploads/sb-instagram-feed-images/${m.id}low.jpg`,
    text: m.caption ?? '',
  });
}

await fs.writeFile(DATA, JSON.stringify({ ...alt, beitraege }, null, 1) + '\n');
console.log(`${beitraege.length} Instagram-Beiträge aktualisiert.`);

// Token verlängern (gilt danach wieder 60 Tage)
try {
  const neu = await get(`${API}/refresh_access_token?grant_type=ig_refresh_token&access_token=${token}`);
  console.log(`Token verlängert, gültig für ${Math.round(neu.expires_in / 86400)} Tage.`);
} catch (e) {
  console.warn('Token konnte nicht verlängert werden:', e.message);
}
