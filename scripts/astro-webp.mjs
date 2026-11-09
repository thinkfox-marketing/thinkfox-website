// WebP-Fassungen aller JPG/PNG im Build (dist/…/bild.jpg → bild.jpg.webp), nur wenn spürbar kleiner.
// Ausgeliefert werden sie per Content Negotiation in public/.htaccess: Browser, die image/webp akzeptieren,
// bekommen unter derselben Adresse die WebP-Datei – HTML, CSS (Kachel-Hintergründe) und srcset bleiben unverändert.
// Bewusste Abweichung vom Original (11/2026): Bilder neu komprimiert, sichtbar gleich, nicht pixelgleich.
// sharp ist über Astro bereits installiert (keine neue Abhängigkeit).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const CACHE = path.resolve('.webp-cache');

function* bilder(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* bilder(p);
    else if (/\.(jpe?g|png)$/i.test(e.name)) yield p;
  }
}

export default function webp() {
  return {
    name: 'webp',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        let sharp;
        try { sharp = (await import('sharp')).default; } catch { logger.warn('sharp nicht verfügbar – keine WebP-Fassungen'); return; }
        fs.mkdirSync(CACHE, { recursive: true });
        let neu = 0, cache = 0, ausgelassen = 0, vorher = 0, nachher = 0;
        for (const datei of bilder(dir.pathname)) {
          const buf = fs.readFileSync(datei);
          const png = /\.png$/i.test(datei);
          // Cache nach Inhalt: unveränderte Bilder werden nicht bei jedem Build neu kodiert
          const key = crypto.createHash('sha1').update(buf).digest('hex') + (png ? '-p1' : '-j1');
          const cached = path.join(CACHE, key + '.webp');
          let out;
          if (fs.existsSync(cached)) { out = fs.readFileSync(cached); cache++; }
          else {
            try {
              out = await sharp(buf, { animated: false })
                .webp(png ? { quality: 88, alphaQuality: 95, effort: 5 } : { quality: 82, effort: 5 })
                .toBuffer();
            } catch { ausgelassen++; continue; }
            fs.writeFileSync(cached, out); neu++;
          }
          // nur ausliefern, wenn mindestens 10 % kleiner – sonst bleibt das Original
          if (out.length < buf.length * 0.9) {
            fs.writeFileSync(datei + '.webp', out);
            vorher += buf.length; nachher += out.length;
          } else ausgelassen++;
        }
        const mb = (n) => (n / 1048576).toFixed(1);
        logger.info(`WebP: ${neu} neu, ${cache} aus Cache, ${ausgelassen} ohne Vorteil – ${mb(vorher)} MB → ${mb(nachher)} MB`);
      },
    },
  };
}
