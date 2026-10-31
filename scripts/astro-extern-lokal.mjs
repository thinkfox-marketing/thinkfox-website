// Astro-Integration: Bilder und Schriften von Drittanbietern, die ohne Einwilligung geladen würden
// (Bewertungs-Widget: Google-Profilbilder, Trustindex-Icons/-Schriften), beim Build herunterladen
// und lokal unter /media/extern/ ausliefern. Skripte (z. B. das Trustindex-Ladeskript) bleiben
// unverändert – die steuert die Einwilligungsverwaltung (Usercentrics).
//
// Ohne Internetzugang (z. B. lokal in gesperrten Umgebungen) bleiben die Adressen, wie sie sind;
// im GitHub-Workflow ist das Netz offen.
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

const HOSTS = /https:\/\/(?:cdn\.trustindex\.io|lh3\.googleusercontent\.com)\/[^"'()\s<>]+/g;

async function* dateien(dir) {
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* dateien(p);
    else if (/\.(html|css)$/.test(e.name)) yield p;
  }
}

function endung(url, typ) {
  const ext = path.extname(new URL(url).pathname).toLowerCase();
  if (/^\.(svg|png|jpe?g|webp|gif|woff2?|ttf)$/.test(ext)) return ext;
  return { 'image/svg+xml': '.svg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif', 'font/woff2': '.woff2' }[typ] ?? '.jpg';
}

export default function externLokal() {
  return {
    name: 'extern-lokal',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const root = dir.pathname;
        const ziel = path.join(root, 'media', 'extern');
        const files = [];
        const urls = new Set();
        for await (const f of dateien(root)) {
          const text = await fs.readFile(f, 'utf8');
          const treffer = (text.match(HOSTS) ?? []).filter((u) => !/\.js($|\?)/.test(u));
          if (treffer.length) files.push(f);
          treffer.forEach((u) => urls.add(u));
        }
        if (!urls.size) return;

        const lokal = new Map();
        let fehler = 0;
        await fs.mkdir(ziel, { recursive: true });
        await Promise.all([...urls].map(async (u) => {
          try {
            const res = await fetch(u.replaceAll('&amp;', '&'), { signal: AbortSignal.timeout(15000) });
            if (!res.ok) throw new Error(String(res.status));
            const name = crypto.createHash('sha1').update(u).digest('hex').slice(0, 16) + endung(u, res.headers.get('content-type'));
            await fs.writeFile(path.join(ziel, name), Buffer.from(await res.arrayBuffer()));
            lokal.set(u, `/media/extern/${name}`);
          } catch {
            fehler++;
          }
        }));
        if (fehler) logger.warn(`${fehler} von ${urls.size} externen Dateien nicht geladen – Adressen bleiben extern.`);

        // längste Adressen zuerst ersetzen, damit keine Teil-Treffer entstehen
        const paare = [...lokal].sort((a, b) => b[0].length - a[0].length);
        for (const f of files) {
          let text = await fs.readFile(f, 'utf8');
          for (const [von, nach] of paare) text = text.replaceAll(von, nach);
          await fs.writeFile(f, text);
        }
        logger.info(`${lokal.size} externe Dateien lokal abgelegt (/media/extern/).`);
      },
    },
  };
}
