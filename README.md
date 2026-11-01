# thinkfox.de

Website der thinkfox marketing GmbH – aus WordPress/Elementor in ein eigenes, statisches System
überführt. Optik und Verhalten entsprechen 1:1 der bisherigen Seite; Projekte, Referenzen (Kundenlogos)
und Blogbeiträge werden über ein Backend gepflegt.

| Baustein | Technik |
|---|---|
| Seitengenerator | [Astro](https://astro.build) 5 – erzeugt reines HTML/CSS/JS, keine Datenbank |
| Backend/CMS | [Decap CMS](https://decapcms.org) unter `/admin/` – speichert Inhalte als Dateien im Git-Repository |
| Formulare | PHP-Endpunkt `public/api/ajax.php` (Mail per SMTP oder `mail()`) |
| Hosting | beliebiger Webspace mit PHP ≥ 8.1 und Apache (`.htaccess`) |
| Deployment | GitHub Actions: Build bei jedem Push auf `main`, Übertragung per FTPS |

## Inhalte pflegen (Redaktion)

1. `https://thinkfox.de/admin/` öffnen und mit GitHub anmelden (Konto braucht Schreibrechte auf das Repository).
2. **Projekte & Referenzen**, **Blog** oder **Kundenlogos** wählen → „Neu“ bzw. Eintrag öffnen.
3. Speichern legt einen Entwurf an; über **Status → Bereit → Veröffentlichen** geht der Inhalt live.
   Der Build dauert ca. 1–2 Minuten.

Wichtige Felder:

- **Platzierung** (Projekte): in welchen Projekt-Slidern das Projekt erscheint – Startseite (20 neueste),
  „Websites für den Mittelstand“ (12 neueste), „Content Produktion“.
- **Kategorien**: steuern die Archive `/category/<kategorie>/`.
- **Projekte**: Einleitung, Steckbrief (Kunde, Branche, Jahr, Leistungen), die drei Abschnitte
  **01 Aufgabe – 02 Lösung – 03 Ergebnis** (leere Abschnitte werden ausgeblendet), Bilder & Videos,
  optional eine Kundenstimme.
- **Blog**: Einleitung, Text (H2-Zwischenüberschriften ergeben das Inhaltsverzeichnis; ein
  YouTube-Link allein in einer Zeile wird zum Video, ein interner Link allein in einer Zeile zum Button),
  optionaler FAQ-Block und Abschluss-Box mit Button.

Alle Projekte und Blogbeiträge nutzen ein einheitliches Layout (`src/lib/beitrag.ts`,
`public/css/beitrag.css`). Die übernommenen WordPress-Beiträge wurden mit
`scripts/umstellung/umstellen.py` in diese Felder überführt; das Original-Markup liegt weiter unter
`src/legacy/posts/` (nur noch als Quelle, nicht mehr ausgegeben).

## Entwicklung

```bash
npm install
npm run dev          # http://localhost:4321
npm run cms          # zusätzlich: CMS lokal ohne Login → http://localhost:4321/admin/
npm run build        # Ausgabe in dist/
```

Formulare lokal testen: `npm run build`, dann `php -S 127.0.0.1:8080 -t dist` und eine
`dist/api/config.php` nach Vorlage `public/api/config.example.php` anlegen.

### Aufbau

```
src/
  pages/[...slug].astro          Alle Seiten und Beiträge unter ihrer bisherigen URL
  pages/category/[slug]/…        Kategorie-Archive (10 pro Seite, wie WordPress)
  pages/*.xml.ts, robots.txt.ts  Sitemaps, RSS-Feed (/feed/), robots.txt
  layouts/Legacy.astro           Seitenrahmen (Head, Header, Footer, Skripte)
  lib/wp.ts                      Rendert Templates + Inhalte (Slider-Abfragen, Beiträge, Logos, Instagram)
  lib/media.ts                   Bildgrößen/srcset wie WordPress
  lib/seo.ts                     Meta-Tags + JSON-LD im Rank-Math-Format
  content/{projekte,blog,referenzen}/   Inhalte (Markdown, gepflegt über das CMS)
  data/instagram.json            Instagram-Feed
  legacy/                        Aus WordPress übernommenes Markup (Seiten, Header/Footer, Templates)
  scripts/                       Eigene Browser-Skripte (Instagram „Mehr laden“, Marketing-Check-Ergebnis)
public/
  wp-content/, wp-includes/      Übernommene Bilder, Fonts, CSS und die Elementor-Frontend-Laufzeit
  uploads/                       Neue Uploads aus dem CMS
  admin/                         CMS (config.yml)
  api/                           ajax.php (Formulare), cms-auth.php (CMS-Login), config.example.php
scripts/
  wp-import/import.py            Import aus WordPress (wiederholbar)
  instagram-sync.mjs             Aktualisiert den Instagram-Feed über die Instagram-API
```

### Warum noch `wp-content` im Projekt?

Für eine pixelgenaue Übernahme wird das von Elementor erzeugte Markup samt Original-CSS und
Frontend-JavaScript (jQuery, Elementor, Swiper, Forminator) unverändert ausgeliefert. Damit verhalten
sich Sticky-Header, Scroll-Effekte, Slider, Akkordeons, Popups und Formulare exakt wie bisher.
Die Pfade bleiben erhalten, damit alle Bild-URLs (Google-Bildersuche, Social-Media-Vorschauen) gültig
bleiben. WordPress selbst (PHP, Datenbank, Plugins) wird nicht mehr benötigt.

Die statischen Seiten (Startseite, Leistungsseiten, Kontakt, Impressum …) liegen als Markup in
`src/legacy/pages/*.json`. Textänderungen dort sind möglich, aber Entwicklerarbeit.

## Staging bei All-Inkl (Vorschau vor dem Umzug)

1. KAS → **Domain → Subdomain** `neu.thinkfox.de` mit eigenem Verzeichnis anlegen, SSL aktivieren
   (DNS bei Domain Factory: A-Record `neu` → IP des All-Inkl-Servers).
2. KAS → **FTP → Neuer FTP-Benutzer**, Verzeichnis = Verzeichnis der Subdomain.
3. GitHub → Repository → **Settings → Secrets and variables → Actions** → „New repository secret“:
   `FTP_HOST` (z. B. `w0123456.kasserver.com`), `FTP_USER`, `FTP_PASSWORD`, `STAGING_PATH` (`/`).
4. GitHub → **Actions → Build & Deploy → Run workflow** – oder einfach auf `main` pushen.
   Jeder Stand auf `main` geht auf die Vorschau; mit gesetztem `DEPLOY_PATH` zusätzlich live.

Übertragen wird per FTPS. Die Staging-Seite ist für Suchmaschinen gesperrt (robots.txt + `X-Robots-Tag`).
Beim ersten Deploy wird `api/config.php` mit Standardwerten angelegt – danach per FTP/KAS-Dateimanager
anpassen (SMTP-Zugang!); Deploys überschreiben sie nie.

## Einrichtung auf dem Server (einmalig)

1. **Webspace**: neues Verzeichnis als Document Root für thinkfox.de anlegen (nicht in die bestehende
   WordPress-Installation deployen – der Abgleich löscht alles, was nicht zur neuen Seite gehört).
2. **`api/config.php`** auf dem Server anlegen (Vorlage `public/api/config.example.php`):
   SMTP-Zugang, Empfänger je Formular, zufälliges `secret`, GitHub-OAuth-Daten.
3. **GitHub-OAuth-App** (für den CMS-Login): GitHub → Settings → Developer settings → OAuth Apps →
   Homepage `https://thinkfox.de`, Callback `https://thinkfox.de/api/cms-auth.php`.
   Client-ID und -Secret in `api/config.php` eintragen.
4. **GitHub-Secrets** für den Workflow (`.github/workflows/deploy.yml`): `FTP_HOST`, `FTP_USER`,
   `FTP_PASSWORD`, `DEPLOY_PATH`, optional `INSTAGRAM_TOKEN`.
5. **Branch `main`** als Produktionszweig verwenden (das CMS schreibt dorthin, siehe `public/admin/config.yml`).
6. Domain auf das neue Verzeichnis umstellen.

## Erneut aus WordPress importieren

Solange die alte Seite online ist:

```bash
python3 scripts/wp-import/import.py           # Seiten, Beiträge, Assets
python3 scripts/wp-import/import.py --skip-assets
```

Achtung: Der Import überschreibt `src/content/**` mit dem Stand aus WordPress – im CMS gemachte
Änderungen an übernommenen Beiträgen gehen dabei verloren.
