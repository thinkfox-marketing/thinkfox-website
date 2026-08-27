# kling-klz — Figma → HTML/CSS/JS

Statisches Frontend-Projekt. Designs kommen aus Figma und werden über den
Figma MCP Server in Vanilla HTML/CSS/JavaScript umgesetzt.

## Stack

- **Kein Framework, kein Build-Step.** Vanilla HTML, CSS, JS (ES-Module).
- `src/index.html` — Einstiegspunkt
- `src/css/tokens.css` — Design-Tokens (Farben, Spacing, Typo, Radien) als CSS Custom Properties
- `src/css/base.css` — Reset + Basis-Typografie
- `src/css/components.css` — Komponenten-Klassen (BEM-artig: `.card`, `.card__title`, `.card--featured`)
- `src/js/main.js` — Entry, importiert Module aus `src/js/modules/`
- `src/assets/images/`, `src/assets/icons/` — exportierte Figma-Assets (committed, keine Remote-URLs)

## Figma-MCP-Workflow (Design → Code)

Der Figma MCP Server ist in `.mcp.json` konfiguriert. Beim Umsetzen eines Designs
**immer** in dieser Reihenfolge:

1. **Skill laden:** `/figma-design-to-code` (bzw. Resource `skill://figma/figma-design-to-code/SKILL.md`).
   Pflicht vor jedem `get_design_context`-Aufruf.
2. **`get_design_context`** auf den Ziel-Node (`fileKey` + `nodeId` aus der Figma-URL:
   `https://figma.com/design/<fileKey>/<name>?node-id=1-2` → `nodeId` = `1:2`).
   Bei `get_design_context` `skillNames: "figma-design-to-code"` mitgeben.
3. **`get_variable_defs`** auf denselben Node → Figma-Variablen nach `src/css/tokens.css` mappen.
   Neue Tokens ergänzen, bestehende wiederverwenden — keine rohen Hex-Werte in Komponenten-CSS.
4. **Referenz adaptieren, nicht kopieren.** `get_design_context` liefert React + Tailwind.
   Das ist eine *Referenz*: umschreiben nach semantischem HTML + CSS-Klassen aus `components.css`.
   Bestehende Klassen wiederverwenden, bevor neue entstehen.
5. **Assets herunterladen:** Figma-Asset-URLs laufen nach ca. 7 Tagen ab.
   `node scripts/fetch-figma-assets.mjs <url> <zielpfad>` oder `download_assets` nutzen und
   die Dateien nach `src/assets/` committen. Nie eine Remote-URL im HTML hinterlassen.
6. **Geometrie erhalten:** Icon-/Bild-Boxen mit den designten Außen- *und* Innenmaßen setzen.
   Kein `auto` für fix dimensionierte Assets, keine globale Größenregel über ungleiche Assets.

Weitere Tools: `get_metadata` (Struktur-Überblick / Node finden), `get_screenshot`
(visueller Abgleich nach der Umsetzung), `download_assets`.

## Konventionen

- Semantisches HTML (`<header>`, `<nav>`, `<main>`, `<section>`, `<button>`), keine Div-Suppe.
- CSS: mobile-first, `min-width`-Media-Queries. Layout mit Flexbox/Grid statt absoluter Positionierung —
  auch wenn Figma absolute Koordinaten liefert.
- Alle Farben/Abstände über `var(--…)` aus `tokens.css`.
- JS: ES-Module, `type="module"`, keine globalen Variablen, keine Dependencies ohne Rücksprache.
- Barrierefreiheit: `alt`-Texte, Fokus-Styles nicht entfernen, Kontrast prüfen.

## Lokal ansehen

```bash
python3 -m http.server 8000 --directory src
# http://localhost:8000
```
