#!/usr/bin/env node
/**
 * Lädt von der Figma MCP zurückgegebene Asset-URLs herunter und legt sie
 * im Projekt ab. Die URLs laufen nach ca. 7 Tagen ab — Assets deshalb
 * immer herunterladen und committen, nie remote verlinken.
 *
 * Nutzung:
 *   node scripts/fetch-figma-assets.mjs <url> <zielpfad>
 *   node scripts/fetch-figma-assets.mjs --manifest assets.json
 *
 * Manifest-Format: { "<zielpfad relativ zu src/assets>": "<url>", ... }
 */
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ASSET_DIR = join(ROOT, 'src', 'assets');

async function download(url, target) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${url}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, buffer);
  console.log(`${target.replace(ROOT + '/', '')}  (${buffer.length} B)`);
}

function targetPath(p) {
  const abs = resolve(p.startsWith('src/') || p.startsWith('/') ? p : join(ASSET_DIR, p));
  if (!abs.startsWith(ROOT)) throw new Error(`Zielpfad liegt außerhalb des Projekts: ${p}`);
  return abs;
}

const args = process.argv.slice(2);

if (args[0] === '--manifest') {
  const manifest = JSON.parse(await readFile(args[1], 'utf8'));
  const entries = Object.entries(manifest);
  const results = await Promise.allSettled(
    entries.map(([target, url]) => download(url, targetPath(target)))
  );
  const failed = results.filter((r) => r.status === 'rejected');
  for (const f of failed) console.error(`FEHLER: ${f.reason.message}`);
  process.exit(failed.length > 0 ? 1 : 0);
} else if (args.length === 2) {
  await download(args[0], targetPath(args[1]));
} else {
  console.error('Nutzung: node scripts/fetch-figma-assets.mjs <url> <zielpfad>');
  console.error('  oder: node scripts/fetch-figma-assets.mjs --manifest <datei.json>');
  process.exit(1);
}
