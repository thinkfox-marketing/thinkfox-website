// Versionskennung für eigene Dateien ohne Hash im Namen (public/css, public/media):
// /css/ergaenzungen.css → /css/ergaenzungen.css?v=1a2b3c4d. Ändert sich der Inhalt, ändert sich die
// Adresse – Browser dürfen die Datei deshalb ein Jahr zwischenspeichern (siehe public/.htaccess).
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const cache = new Map<string, string>();

export function asset(url: string): string {
  if (!cache.has(url)) {
    const hash = crypto.createHash('sha1').update(fs.readFileSync(path.join('public', url))).digest('hex').slice(0, 8);
    cache.set(url, `${url}?v=${hash}`);
  }
  return cache.get(url)!;
}
