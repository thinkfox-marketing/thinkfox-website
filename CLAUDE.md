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
     `src/legacy/posts/*`: Projekte werden vorerst daraus ausgegeben (1:1), Blogbeiträge nicht mehr.
   - `public/wp-content/**`, `public/wp-includes/**`: Original-Assets und Laufzeit (jQuery, Elementor,
     Swiper, Forminator). Nicht ersetzen/aktualisieren – sonst ist die 1:1-Optik nicht mehr garantiert.
   - Platzhalter in Templates: `{{LOOP:name}}`, `{{TITLE}}`, `{{IMG}}`, `{{CONTENT}}` … → `src/lib/wp.ts`.
2. **Eigene Ebene:** `src/lib/*.ts`, `src/pages/*`, `src/scripts/*`, `public/api/*`, `public/admin/*`,
   `public/media/*`, `public/css/ergaenzungen.css`, `public/css/einheitlich.css`.

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
  Seit Review 11/2026 zusätzlich: Sprunglink „Zum Inhalt springen“, Überschriften-Ebenen ohne Sprung (`aria-level`,
  `ebenenOhneSprung()`, Fußzeile `fussEbenen()`), Sticky-Kopie der Kopfzeile unsichtbar/inert ohne doppelte IDs,
  Slider-Kopien aus Tab-Reihenfolge, Pause-Knopf für Slider und Logo-Laufband (WCAG 2.2.2), Hintergrundvideo abgedunkelt
  (Kontrast), Akkordeon mit Rolle/Zustand, Leertaste für Schein-Buttons, autocomplete (Telefon/Firma/URL),
  `scroll-padding-top` gegen verdeckten Fokus, Kopfzeile bei < 500 px Höhe nicht fixiert, Bild-`title` entfernt,
  Termin-Popup entfällt (Button öffnet den Kalender direkt), Barrierefreiheitserklärung aktualisiert und in der Fußzeile verlinkt.
- **Karte:** OpenStreetMap statt Google Maps – statische Karte aus beim Build geladenen, lokal ausgelieferten
  Kacheln (`src/lib/osm-karte.mjs`, `scripts/astro-osm-karte.mjs`, Cache `.osm-cache/`), interaktiv erst auf Klick.
- **Datenschutz:** YouTube und Kuula per 2-Klick-Lösung (Iframe mit `srcdoc`-Hinweis),
  Bilder/Schriften des Bewertungs-Widgets und YouTube-Vorschaubilder lokal (`scripts/astro-extern-lokal.mjs`),
  kein WordPress-Emoji-Skript, Termin-Iframe lädt erst beim Öffnen. Google-Bewertungen statisch ohne Trustindex-Ladeskript
  (`src/lib/bewertungen.ts`, wischbare Reihe in `ergaenzungen.css`); kein Usercentrics-„Smart Data Protector“ (uc-block). Kein Gravatar-Hash im
  JSON-LD, Elementor-Zähler im Browser-Speicher werden entfernt (`src/scripts/datenschutz.js`), Opt-out-Link durch Hinweis auf den Usercentrics-Widerruf ersetzt. Google-Tag und Meta-Pixel laden erst nach
  Zustimmung zum jeweiligen Usercentrics-Dienst (`src/components/Tracking.astro`, Erkennung über den Dienstnamen).
- **Ladezeit:** Stylesheets als wenige Bündel (`src/lib/css-bundle.ts`, nur im Build), Hero-Standbild und
  Hausschriften per Preload, verdecktes Hero-Hintergrundbild entfernt. Gegen Layout-Verschiebungen (CLS):
  Logo-Laufband und Hintergrundvideos haben schon vor dem Skriptstart ihre Endgröße
  (`ergaenzungen.css`, nur `@media (scripting: enabled)` – ohne JavaScript unverändert).
  Bilder bekommen beim Build ihre echten Maße (`width`/`height` aus dem Dateikopf, `src/lib/bilder.ts`) und laden ab dem
  zweiten Abschnitt mit Bild erst beim Scrollen (`loading="lazy"`, Logo-Laufband ausgenommen).
  Projekt-Kacheln (CSS-Hintergrund) nutzen die kleinste passende WordPress-Fassung statt des Originals
  (`passendeFassung()`, ≥ 850 × 1000 px bzw. 85 % des Originals) – Startseite rund 40 % weniger Kachel-Bilddaten.
  Kachel-Hintergründe in Slidern erst, wenn sichtbar/als Nächste dran bzw. nach Bedienung (`kachelnSpaet()`,
  `src/scripts/kacheln.js`); Hintergrundbild des ersten Abschnitts per Preload (`src/lib/hero-bild.ts`,
  berücksichtigt `elementor-hidden-*`); jQuery am Body-Ende statt im `<head>`; nur Outfit vorgeladen;
  Font Awesome und Smash-Balloon-Editor-CSS nur bei Bedarf; Listen-Bilder mit `sizes="auto, …480px"`;
  Formular-Höhe vorab reserviert (Marketing-Ampel, Projektanfrage); kein Video bei Datensparmodus/2G/3G;
  HTML ohne ETag (304 über Last-Modified), Medien 7 Tage, `/media/extern/` 1 Jahr.
- **Beiträge:** Projekte und Blog nicht mehr im Elementor-Layout, sondern einheitlich (siehe Regeln unten);
  Blog im Aufbau des Originals (Bild oben über Hellblau, Titel darunter, 940 px Textbreite);
  überführt mit `scripts/umstellung/umstellen.py`.
  **Projekte vorerst 1:1 im Original** (Elementor-Markup aus `src/legacy/posts/`, ohne `einheitlich.css`;
  Schalter `PROJEKTE_IM_ORIGINAL` in `src/lib/wp.ts`). Textkorrekturen dort direkt im Original-Markup pflegen.
  Neue Projekte ohne Original-Markup nutzen das neue Layout (`src/lib/beitrag.ts`: Projektdaten links, Fließtext
  rechts, Leistungen als Wischleiste, bei `kopf: video` das erste Video statt des Beitragsbilds).
- **Einheitliches Erscheinungsbild (Design-Review 11/2026):** `public/css/einheitlich.css` – eine Typo-Skala
  (H1 60/38, H2 46/30, H3 26/21, Einleitung 21/19, Text 18/17 px), Buttons gefüllt Lila bzw. weißer Rahmen auf
  dunklem Grund (10 px Ecken, Pfeil), Dachzeilen als reine Textzeile ohne Hintergrund/Pille (Größe im Verhältnis zur Überschrift, mobil bündig) statt grauer Schein-Buttons, Grün nur als Akzent, nur Hausschrift,
  mobil linksbündig mit 20 px Rand, Prozess-Kreise mobil als schlichte Zwischenüberschriften ohne Kasten, 360°- und Mietstudio-Seite in den Hausfarben.
- **Handy-Darstellung:** zu lange Wörter in Überschriften mit Trennstellen (`src/lib/umbruch.ts`) bzw.
  `overflow-wrap`, Überstände am Rand abgeschnitten statt seitlich verschiebbar (iPhone), Menü-Links nicht unterstrichen.
  Beiträge bekommen ein `<main>` (fehlte im Original).
- **Selbsttest „Marketing-Ampel“** (`/marketing-ampel/`, Ergebnis `/marketing-ampel/ergebnis/`; alte Adressen per 301):
  hieß im Original „Marketing-Check“ – der Name gehört dem gleichnamigen Beratungsangebot. Skalenfragen als Einfachauswahl,
  Ergebnis-URL enthält nur Punktwerte (kein Firmenname), Werte werden auf 0–5 begrenzt (`api/ajax.php`, `src/scripts/marketing-check.js`).
  Kontaktdaten freiwillig (Datenminimierung, Kopplungsverbot): Auswertung auch ohne Name/E-Mail; nur mit E-Mail oder Telefon
  **und** Häkchen „thinkfox darf sich melden“ wird gespeichert und an hallo@ gemailt (`forms.json` → `einstellungen.kontakt_freiwillig`,
  diese Regeln haben Vorrang vor `api/config.php`).
- **Kontakt & Formulare:** Telefonnummer überall klickbar (`telefon()` in `src/lib/barrierefreiheit.ts`), Forminator-Formulare in der
  Hausschrift statt des extern geladenen Roboto, Buttons mit „buchen/vereinbaren“ führen zum Terminkalender.
  Projektanfragen (11213) gehen zusätzlich signiert ans CRM (`crm.thinkfox.marketing/api_website.php`, Vertrag
  `docs/crm-schnittstelle.md`, Code `public/api/lib.php`, Feldzuordnung `forms.json` → `crm`); Warteschlange mit
  Wiederholung in `api/data/crm/`, KAS-Cronjob `api/cron.php?token=…`. Mail an hallo@ immer, mit Link zum CRM-Eintrag.
- **SEO/GEO:** echte 404-Seite (Comic-Fuchs, „Fährten“ zu den Hauptseiten, `src/pages/404.astro`) statt Weiterleitung auf die Startseite (alte WordPress-Weiterleitungen einzeln in `public/.htaccess`), Kategorie-Archive `noindex`,
  Unternehmensprofil/Service/FAQ als JSON-LD (`src/lib/geo.ts`), `/llms.txt`.

## Regeln

- **Optik:** Jede Änderung mit Screenshot-Vergleich prüfen (Playwright, 1440 px und 390 px).
  Ohne JavaScript muss das Ergebnis pixelgleich zur Vorlage sein – abgesehen von den oben
  genannten bewussten Abweichungen; mit JavaScript sind zusätzlich Video-/Slider-Timing-Unterschiede zulässig.
- **Barrierefreiheit prüfen:** axe-core (WCAG 2.2 AA) muss ohne Befund bleiben.
- **Beiträge (Projekte/Blog)** haben ein einheitliches, eigenes Layout: `src/lib/beitrag.ts` +
  `public/css/beitrag.css`, Inhalte ausschließlich aus CMS-Feldern (keine Elementor-Markup-Ausgabe).
  Buttons wie auf der Startseite (Pfeil-Symbol), Farben Lila/Hellblau – kein Orange/Gelb.
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
