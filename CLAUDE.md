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

- **Hintergrundvideos** (`src/lib/hero-video.ts`, `src/scripts/hero-video.js`): komprimiertes Showreel
  (`public/media/showreel.mp4`), Standbild statt Video auf dem Handy (≤ 767 px) und bei
  „Bewegung reduzieren“, Pause-Knopf (WCAG 2.2.2). In ausgeblendeten Bereichen wird kein Video geladen.
- **„Bewegung reduzieren“:** Slider/Logo-Laufband stoppen, Einblend-Animationen aus.

## Regeln

- **Optik:** Jede Änderung mit Screenshot-Vergleich prüfen (Playwright, 1440 px und 390 px).
  Ohne JavaScript muss das Ergebnis pixelgleich zur Vorlage sein; mit JavaScript sind nur
  Video-/Slider-Timing-Unterschiede zulässig.
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
