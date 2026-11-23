# Seitenstruktur thinkfox.de – Stand 23.11.2026

Verbindlich für neue Seiten, zusammen mit `docs/design-system.md` (wie es aussieht) – dieses Dokument regelt,
**welche Seiten es gibt und wofür**. Grundlage: Ranking-Check 23.11.2026 (Seobility-Projekt 909710) und
Abstimmung mit Marcus Brauer.

## 1. Strategie in einem Satz

**Regional verwurzelt, bundesweit über Themen:** Nordhessen bleibt die Heimat der Website (rund 80 % der
Kunden sind regional). Bundesweite Reichweite entsteht nicht über allgemeinere Hauptseiten, sondern über
eigene Themenseiten mit echten Projekten – vor allem Video (Imagefilm) und Recruiting.

| Leistung | Reichweite | Begründung |
|---|---|---|
| Social Media (Betreuung, Content) | regional | Betreuung und Produktion vor Ort |
| Webdesign | regional, Fernbetreuung möglich | Kern-Rankings regional |
| Video, vor allem hochwertige Produktionen | **bundesweit** | wird bundesweit produziert, Suchnachfrage vorhanden |
| Recruiting / Employer Branding | **bundesweit** über Branchen | Belege in mehreren Branchen |

## 2. Die drei Ebenen

1. **Kern (regional):** Startseite und Leistungsseiten tragen „Nordhessen“ in Titel, H1 bzw. Einleitung.
   Die Region wird hier **nicht** entfernt – dort liegen die heutigen Top-Platzierungen
   („werbeagentur nordhessen“ Platz 2, „werbeagentur/webdesign/seo edertal“ Platz 1).
2. **Regionen:** eigene Seite nur für Orte mit echten Projekten (siehe Regel in 3).
3. **Themen und Branchen (bundesweit):** Seiten zu einem konkreten Bedarf („Imagefilm“, „Recruitingfilm für
   Kanzleien“) mit Fallbeispielen; Ratgeber-Artikel („Was kostet …“) verweisen darauf.

## 3. Regel für jede neue Landingpage

Eine neue Seite nur, wenn **mindestens zwei** von drei Punkten erfüllt sind:

1. **Suchnachfrage** – der Hauptbegriff wird nachweislich gesucht (Seobility/Search Console).
2. **Eigener Inhalt mit Beleg** – Projekte, Kunden, Besonderheiten, die es nur für diese Region/Branche gibt.
3. **Klares Angebot** – ein konkreter nächster Schritt für genau diese Zielgruppe.

**Nicht erlaubt:** Ortsseiten mit ausgetauschtem Ortsnamen und sonst gleichem Text. Google wertet sie als
Doorway Pages (Spam-Richtlinie) – im schlimmsten Fall leidet die ganze Domain.

## 4. Ein Suchbegriff – eine Seite

Jeder Hauptbegriff gehört **einer** Seite. Konkurrieren Blogbeitrag und Leistungsseite um denselben Begriff
(Kannibalisierung), bekommt der Blogbeitrag einen informativen Schwerpunkt und verlinkt mit passendem
Ankertext auf die Leistungsseite.

| Hauptbegriff | Zielseite | Stand 23.11.2026 |
|---|---|---|
| werbeagentur nordhessen / edertal | Startseite `/` | Platz 2 / 1 |
| webdesign nordhessen | `/professionelle-websites-fuer-den-mittelstand/` | nicht in Top 100 → PR #17 |
| social media agentur nordhessen | `/mehr-aufmerksamkeit-und-reichweite-mit-social-media/` | Startseite auf Platz 10 |
| videoproduktion nordhessen | `/professionelle-content-produktion-video-foto-social-media-aus-nordhessen/` | Blogbeitrag Platz 2 |
| externe marketingabteilung | `/deine-externe-marketingabteilung-ganzheitliches-marketing-fuer-den-mittelstand/` | Blogbeitrag Platz 5 |
| werbeagentur bad wildungen | `/werbeagentur-bad-wildungen-thinkfox-marketing-fuer-den-mittelstand/` | Platz 2 |
| imagefilm (agentur, erstellen lassen) | **neue Imagefilm-Seite** (geplant) | nicht in Top 100 |
| imagefilm kosten | `/was-kostet-ein-imagefilm/` → verlinkt Imagefilm-Seite | nicht in Top 100 |
| employer branding agentur, recruitingfilm | `/employer-branding-agentur-recruitingfilm-karriereseite/` | nicht in Top 100 |
| website kosten | `/was-kostet-eine-website/` → verlinkt Webdesign-Seite | – |
| social media betreuung kosten | `/social-media-betreuung-kosten/` → verlinkt Social-Media-Seite | – |

Blogbeiträge, die heute für Leistungsbegriffe ranken und auf die Leistungsseite verweisen sollen:
`/die-externe-marketingabteilung-warum-kmu-ihr-marketing-neu-denken-sollten/`,
`/videoproduktion-nordhessen-mit-thinkfox-marketing/`, `/social-media-aus-nordhessen-sichtbarkeit-reichweite/`,
`/seo-agentur-optimierung-nordhessen-sichtbarkeit-fuer-dein-unternehmen/`.

## 5. Bestand und Planung

| Seite | Ebene | Status |
|---|---|---|
| Startseite, Social Media, Webdesign, Content/Video, Externe Marketingabteilung | Kern | besteht |
| Mietstudio, 360°-Rundgänge | Kern (Zusatzleistung) | besteht |
| Bad Wildungen | Region | besteht (Platz 2, aber ~10 Suchen/Monat) |
| Korbach | Region | **später** – wenig Suche, aber viele echte Projekte (Continental, Wachenfeld, Stadt Korbach/ReCup, Cine K, Korbach-Becher) |
| Kassel | Region | **zurückgestellt** – hohe Nachfrage, aber derzeit nur eine Referenz (DWAZ) |
| weitere Orte (Fritzlar, Frankenberg …) | Region | nein – keine Nachfrage, keine Belege |
| Imagefilm | Thema, bundesweit | **als Nächstes** – Continental, Rektol, DWAZ, Wachenfeld |
| Employer Branding / Recruiting | Thema, bundesweit | besteht; Fallbeispiele je Branche (Kanzlei, Kommune, Bau) ergänzen |
| Video-Podcast | – | keine eigene Seite (kaum Suchnachfrage), bleibt Referenz auf den Video-Seiten |
| Gesundheitsbranche | Branche | zurückhaltend (siehe CLAUDE.md), keine eigene Seite |

## 6. Verlinkung

- Ratgeber → Themen-/Leistungsseite (Ankertext = Hauptbegriff der Zielseite).
- Projekt → passende Leistungs- oder Themenseite („Mehr zur Leistung“, schon in `src/lib/beitrag.ts`).
- Themenseite → 3–4 passende Projekte als Belege.
- Startseite → alle Leistungsseiten; Regionalseiten über Fußzeile oder Leistungsseiten, nicht über das Hauptmenü.

## 7. Überprüfung

Ranking-Check alle 4–6 Wochen (Seobility-Projekt 909710). Neue Seiten frühestens nach 6–8 Wochen bewerten.
Tabelle in Abschnitt 4 und 5 dabei aktualisieren. Externe Verlinkungen (Kunden, Partner, regionale Presse)
sind für bundesweite Themen Voraussetzung – ohne sie ranken diese Seiten kaum.
