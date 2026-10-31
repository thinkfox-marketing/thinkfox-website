# thinkfox.de — Astro + Decap CMS (aus WordPress/Elementor übernommen)

Statische Website der thinkfox marketing GmbH. Ziel der Übernahme: **pixelgenau identisch zur
bisherigen WordPress-Seite**, aber ohne WordPress. Details zu Betrieb und Pflege: `README.md`.

## Stack

- **Astro 5** (statischer Build, `npm run build` → `dist/`), URLs mit Slash am Ende wie in WordPress.
- **Decap CMS** unter `/admin/` (`public/admin/config.yml`), Inhalte als Markdown in `src/content/`.
- **PHP** nur für `public/api/ajax.php` (Formulare) und `public/api/cms-auth.php` (CMS-Login).
- Keine weiteren Abhängigkeiten ohne Rücksprache.

## Architektur – zwei Ebenen

1. **Legacy-Ebene (eingefroren):** Markup, CSS und Frontend-JS der Elementor-Seite.
   - `src/legacy/pages/*.json`, `src/legacy/chrome/*.html`, `src/legacy/templates/*`, `src/legacy/posts/*`
     werden von `scripts/wp-import/import.py` erzeugt – nicht von Hand umbauen, sondern gezielt editieren.
   - `public/wp-content/**`, `public/wp-includes/**`: Original-Assets und Laufzeit (jQuery, Elementor,
     Swiper, Forminator). Nicht ersetzen/aktualisieren – sonst ist die 1:1-Optik nicht mehr garantiert.
   - Platzhalter in Templates: `{{LOOP:name}}`, `{{TITLE}}`, `{{IMG}}`, `{{CONTENT}}` … → `src/lib/wp.ts`.
2. **Eigene Ebene:** `src/lib/*.ts`, `src/pages/*`, `src/scripts/*`, `public/api/*`, `public/admin/*`,
   `public/media/*`, `public/css/ergaenzungen.css`.

## Bewusste Abweichungen vom Original

- **Hintergrundvideos** (`src/lib/hero-video.ts`, `src/scripts/hero-video.js`): komprimierte Showreels
  (`public/media/showreel.mp4` Querformat 5 MB, `showreel-mobil.mp4` Hochkant 2,8 MB statt WebM),
  auf dem Handy immer die Hochkant-Fassung, Standbild bei „Bewegung reduzieren“,
  Pause-Knopf (WCAG 2.2.2). In ausgeblendeten Bereichen wird kein Video geladen.
  Videos werden erst nach dem Seitenaufbau und nur im sichtbaren Bereich geladen.
- **„Bewegung reduzieren“:** Slider/Logo-Laufband stoppen, Einblend-Animationen aus.
- **Barrierefreiheit (WCAG 2.2 AA, axe-core ohne Befund):** Kontraste minimal angehoben (Grün `#267f32`
  statt `#61ce70`, Lila, Grautöne – `public/css/ergaenzungen.css`), Links im Fließtext unterstrichen,
  ARIA-Korrekturen im Markup (`src/lib/barrierefreiheit.ts`, `src/scripts/barrierefreiheit.js`).
- **Karte:** OpenStreetMap statt Google Maps – statische Karte aus beim Build geladenen, lokal ausgelieferten
  Kacheln (`src/lib/osm-karte.mjs`, `scripts/astro-osm-karte.mjs`, Cache `.osm-cache/`), interaktiv erst auf Klick.
- **Datenschutz:** YouTube und Kuula per 2-Klick-Lösung (Iframe mit `srcdoc`-Hinweis),
  Bilder/Schriften des Bewertungs-Widgets und YouTube-Vorschaubilder lokal (`scripts/astro-extern-lokal.mjs`),
  kein WordPress-Emoji-Skript, Termin-Iframe lädt erst beim Öffnen. Google-Tag und Meta-Pixel laden erst nach
  Zustimmung zum jeweiligen Usercentrics-Dienst (`src/components/Tracking.astro`, Erkennung über den Dienstnamen).
- **Ladezeit:** Stylesheets als wenige Bündel (`src/lib/css-bundle.ts`, nur im Build), Hero-Standbild und
  Hausschriften per Preload, verdecktes Hero-Hintergrundbild entfernt. Gegen Layout-Verschiebungen (CLS):
  Logo-Laufband und Hintergrundvideos haben schon vor dem Skriptstart ihre Endgröße
  (`ergaenzungen.css`, nur `@media (scripting: enabled)` – ohne JavaScript unverändert).
- **Handy-Darstellung:** Projekt-Vorlage ohne die −8-px-Verschiebung des Inhalts (randlose Bilder/Videos wieder
  volle Breite, Texte unverändert), zu lange Wörter in Überschriften mit Trennstellen (`src/lib/umbruch.ts`) bzw.
  `overflow-wrap`, Überstände am Rand abgeschnitten statt seitlich verschiebbar (iPhone), Menü-Links nicht unterstrichen.
  Beiträge bekommen ein `<main>` (fehlte im Original).
- **SEO/GEO:** echte 404-Seite statt Weiterleitung auf die Startseite (alte WordPress-Weiterleitungen einzeln in `public/.htaccess`), Kategorie-Archive `noindex`,
  Unternehmensprofil/Service/FAQ als JSON-LD (`src/lib/geo.ts`), `/llms.txt`.

## Regeln

- **Optik:** Jede Änderung mit Screenshot-Vergleich prüfen (Playwright, 1440 px und 390 px).
  Ohne JavaScript muss das Ergebnis pixelgleich zur Vorlage sein – abgesehen von den oben
  genannten bewussten Abweichungen; mit JavaScript sind zusätzlich Video-/Slider-Timing-Unterschiede zulässig.
- **Barrierefreiheit prüfen:** axe-core (WCAG 2.2 AA) muss ohne Befund bleiben.
- **Neue Beiträge** nutzen die Vorlagen in `src/legacy/vorlagen/` + `public/css/vorlage-*.css`
  (abgeleitet aus den Beiträgen „Karriereseite Stadt Waldeck“ und „Die externe Marketingabteilung …“).
- **Slider-Abfragen** stehen in `LOOP_QUERIES` (`src/lib/wp.ts`) und entsprechen den Elementor-Queries.
- **Neue Komponenten** (außerhalb der Legacy-Ebene): semantisches HTML, mobile-first,
  vorhandene Elementor-Klassen/Farben (`--e-global-color-*` aus `post-52.css`) wiederverwenden.
- **Formulare:** Das Forminator-Frontend bleibt unverändert; serverseitig antwortet `public/api/ajax.php`
  im Forminator-Format. Empfänger/Weiterleitungen in `api/config.php` (nur auf dem Server, nie committen).
- **Barrierefreiheit:** `alt`-Texte pflegen, Fokus-Styles nicht entfernen.

## Figma

Der Figma MCP Server ist in `.mcp.json` konfiguriert. Für neue Designs vor `get_design_context`
den Skill `/figma-design-to-code` laden; Assets nach `public/uploads/` statt Remote-URLs
(`scripts/fetch-figma-assets.mjs`).

## Lokal

```bash
npm install && npm run dev   # http://localhost:4321
npm run cms                  # CMS ohne Login (local_backend)
```
