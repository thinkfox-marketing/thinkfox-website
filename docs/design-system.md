# Design-System thinkfox.de – Stand `design-v1` (22.11.2026, Commit `8a8f27d`)

Dieser Stand ist eingefroren. Neue Seiten und Erweiterungen werden **aus den Bausteinen unten** gebaut,
nicht mit neuen Farben, Größen oder Abständen. Jede Änderung läuft über einen Pull Request; der
**Design-Vergleich** (`.github/workflows/design-check.yml`) prüft dabei automatisch, ob sich bestehende
Seiten optisch verändern.

Technische Quellen: `public/css/einheitlich.css` (Leistungsseiten, Typo-Skala, Ausreißer),
`public/css/beitrag.css` (Projekte, Blog, Leistung im Blog), `public/css/ergaenzungen.css`
(Barrierefreiheit, Bewertungen, Formulare). Hintergründe und Entscheidungen: `CLAUDE.md`.

## 1. Farben

| Rolle | Wert | Verwendung |
|---|---|---|
| Lila (Marke) | `#5b4ec8` (`--tf-lila`) | Überschriften, gefüllte Buttons, Links, aktive Zustände |
| Dunkellila | `#3b3192` (`--tf-lila-dunkel`) | FAQ-Bereich, Hover, Dachzeilen in Beiträgen, Fokusrahmen |
| Hellblau Leistungsseiten | `#d5f5ff` | Abschnittshintergrund auf Leistungsseiten |
| Hellblau Beiträge | `#eef7ff` (`--tf-hell`) | Beiträge, Archive, Mietstudio |
| Lila hell | `#eceafb` (`--tf-lila-hell`) | Flächen, Hinweise |
| Text | `#313131` (`--tf-text`) | Fließtext |
| Grau | `#55536a` | Metadaten (Datum, Lesezeit) |
| Grün (nur Akzent) | `#267f32` | einzelne Akzente, nie flächig, nie für Text auf Weiß unter 18 px |
| Weiß | `#fff` | Karten, Text auf Lila |

Nicht verwenden: Orange, Gelb (außer Bewertungssterne), weitere Grau- oder Lilatöne.
Bekannte Altlasten, bewusst unverändert: Mint `#effff1` (Websites-Seite), `#8a6ee4` (ein Abschnitt Mietstudio),
lila Fließtext auf den Leistungsseiten.

## 2. Schrift und Größen

Nur **Outfit** (Hausschrift, lokal). Größen Desktop / Handy:

| Element | Größe | Variable |
|---|---|---|
| H1 | 60 / 38 px | `--fs-h1` |
| H1 Blogbeitrag | 44 / 30 px | – |
| H2 | 46 / 30 px | `--fs-h2` |
| H3 | 26 / 21 px | `--fs-h3` |
| H4 | 20 / 18 px | `--fs-h4` |
| Einleitung (unter H1) | 21 / 19 px | `--fs-lead` |
| Fließtext | 18 / 17 px | `--fs-text` |
| Dachzeile über H1 | 24 / 18 px | `--fs-dach-gross` |
| Dachzeile über H2 | 20 / 17 px | `--fs-dach` |
| Klein (Metadaten, Karten) | 15 px | `--fs-klein` |

Regeln: eine H1 je Seite; Überschriften-Ebenen ohne Sprung; Dachzeilen als reine Textzeile (kein Hintergrund,
keine Pille); lange Wörter in Überschriften mit Trennstellen (`src/lib/umbruch.ts`).

## 3. Raster und Abstände

- Inhaltsbreite 1140 px, Textspalte in Beiträgen 940 px. Handy: 20 px Rand links/rechts.
- Umbrüche wie Elementor: Handy bis 767 px, Tablet bis 1024 px, Desktop ab 1025 px.
- Abschnitte: 80 px oben/unten (Desktop), 48/32 px (Handy). Abschnitte mit Schräge oben: Schräge + Abstand
  (FAQ: 128/96 px Desktop, 96/64 px Handy).
- Übergänge zwischen Abschnitten: Schräge (Elementor-Formteiler) in der Farbe des **folgenden** Abschnitts;
  kein Abschnitt wird unter den vorherigen geschoben.

## 4. Bausteine

| Baustein | Aussehen | Beispiel | Technik |
|---|---|---|---|
| Button gefüllt | Lila, weiße Schrift, 10 px Ecken, Pfeil-Symbol, 17 px fett | „Projekt anfragen“ | `.tf-knopf`, Elementor-Button |
| Button Rahmen | weißer Rahmen auf dunklem Grund | Startseite Hero | – |
| Kopfbereich Leistungsseite | Dachzeile, H1, Einleitung, Button, Bild rechts | Social Media | Elementor |
| Kreis-Auswahl | Desktop 4 Kreise mit Text, Handy 2×2 mit Antippen | Startseite, Leistungsseiten | `einheitlich.css` 5b, `barrierefreiheit.js` |
| Projekte-Slider | „Aktuelle Kunden & Projekte“ | Startseite | `LOOP_QUERIES` |
| Kundenstimmen | Kopfzeile, Bewertungs-Kachel + 3 Karten, Pfeile, „Weiterlesen“ | alle Leistungsseiten | `bewertungen.ts/.js` |
| FAQ „Klartext“ | Dunkellila, Akkordeon links, Titel + Text + Button rechts | alle Leistungsseiten | Elementor `a0516f5` |
| Fußzeile mit CTA | „Lass uns reden!“, 2 Buttons, Lösungen, Kontakt | alle Seiten | `chrome/footer.html` |
| Projektseite | Pfad, Dachzeile, H1, Teaser, Bild; Projektdaten links, Text rechts | Karriereseite Waldeck | `beitrag.ts` |
| Blogbeitrag | Bild oben, H1 darunter, 940 px Text, FAQ, Anfrage-Box | Was kostet eine Website | `beitrag.ts` klassisch |
| Leistung im Blog | Kopf vollflächig: Showreel (Feld `kopfVideo`, Standbild = Beitragsbild) bzw. Foto rechts, lila abgedunkelt, weiße H1 bis 84 px, Button mit weißem Rahmen, Google-Bewertung; jede H2 eine Sektion (weiß/hellblau im Wechsel); Abschnitt mit Projekt-Link oder Video → asymmetrische Zeile mit Hochformat-Kachel bzw. Video, abwechselnd links/rechts; Listen mit fettem Anfang als Karten, nummerierte Listen als Schritt-Karten; „Aktuelle Kunden & Projekte.“ wie Startseite (Feld `referenzen`) | Employer Branding, Imagefilm | `layout: leistung`, `beitrag.ts` `leistungSeite()` |

## 5. Neue Seite bauen – Checkliste

1. Seitentyp aus Abschnitt 4 wählen; neuer Typ nur nach Absprache.
2. Nur Farben aus 1, Größen aus 2, Abstände aus 3.
3. Bei neuem Seitentyp: Referenzseite in `scripts/design-check/seiten.json` ergänzen.
4. Barrierefreiheit: axe-core ohne Befund, `alt`-Texte, Fokus sichtbar.
5. Pull Request → Design-Vergleich grün (oder Label `design-aenderung`, wenn bestehende Seiten sich gewollt ändern).

## 6. Ablauf bei Änderungen

1. Änderung auf eigenem Branch, Pull Request gegen `main`.
2. Der Design-Vergleich baut `main` und die Änderung und vergleicht 19 Referenzseiten bei 1440 und 390 px.
   - **grün**: keine bestehende Seite sieht anders aus.
   - **rot**: Abweichung. In der Zusammenfassung steht, welche Seite und wo; Vorher/Nachher/Unterschied als Bilder
     im Artefakt „design-vergleich“. Ist die Änderung gewollt (z. B. neuer Blogbeitrag erscheint auf der Startseite),
     Label `design-aenderung` setzen – dann wird der Haken grün.
3. Freigabe: ausdrückliches „ja“ im Chat (Claude merged dann) oder „Merge“ selbst im Pull Request. Danach veröffentlicht
   der Deploy-Ablauf automatisch, erledigte Branches löscht GitHub (Einstellung „Automatically delete head branches“).

Lokal: `npm i --no-save playwright@1.63.0 && npx playwright install chromium`, dann
`node scripts/design-check/vergleich.mjs <dist-alt> <dist-neu> <ausgabe>`.
