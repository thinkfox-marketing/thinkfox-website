# kling-klz

Statische Website. Designs werden über den **Figma MCP Server** direkt in
HTML/CSS/JavaScript umgesetzt.

## Setup

Der Figma MCP Server ist in `.mcp.json` hinterlegt (`https://mcp.figma.com/mcp`).

- **Claude Code (lokal):** Beim ersten Start des Projekts bestätigen, dass der
  MCP-Server aus `.mcp.json` genutzt werden darf. Danach `/mcp` → `figma` → *Authenticate*
  und im Browser mit dem Figma-Account anmelden.
- **Claude Code im Web / Cowork:** Figma ist als Connector am Account verbunden,
  `.mcp.json` wird dort nicht gebraucht — die Tools stehen direkt zur Verfügung.
- **Prüfen:** Tool `whoami` aufrufen. Es gibt Handle, E-Mail und Plan zurück.

Der Figma-Account braucht mindestens einen **Full Seat** (Dev- oder Design-Seat) —
mit View-only-Zugang liefert der Server keinen Design-Kontext.

## Ein Design umsetzen

In Figma den Frame/die Komponente auswählen → Rechtsklick → *Copy link to selection*.
Die URL enthält `fileKey` und `node-id`:

```
https://www.figma.com/design/<fileKey>/<name>?node-id=1-2
```

Dann in Claude Code z. B.:

> Setz diesen Screen um: https://www.figma.com/design/abc123/Website?node-id=42-118

Der Ablauf (Skill `figma-design-to-code` → `get_design_context` → `get_variable_defs`
→ Assets herunterladen → semantisches HTML/CSS) ist in `CLAUDE.md` beschrieben und
wird automatisch befolgt.

## Struktur

```
src/
  index.html
  css/
    tokens.css        Design-Tokens (Figma-Variablen)
    base.css          Reset + Basis-Typografie
    components.css    Komponenten
  js/
    main.js           Entry (ES-Modul)
    modules/          Feature-Module
  assets/
    images/  icons/   Exportierte Figma-Assets
scripts/
  fetch-figma-assets.mjs   Lädt Figma-Asset-URLs herunter (laufen nach ~7 Tagen ab)
```

## Lokal starten

```bash
npm run serve      # oder: python3 -m http.server 8000 --directory src
```

→ http://localhost:8000

## Assets nachladen

```bash
node scripts/fetch-figma-assets.mjs "<figma-asset-url>" images/hero.png
node scripts/fetch-figma-assets.mjs --manifest assets.json
```

Assets werden nach `src/assets/` geschrieben und mit committed. Remote-URLs von
Figma gehören **nie** ins HTML — sie sind nach etwa einer Woche tot.

### Hinweis: Assets in der Web-Session

In Claude Code im Web ist der ausgehende HTTP-Zugriff auf einen Allowlist-Proxy
beschränkt — `scripts/fetch-figma-assets.mjs` kann dort an einem `403` scheitern.
Dann stattdessen das MCP-Tool `download_assets` nutzen bzw. die Assets lokal
herunterladen. Auf dem eigenen Rechner greift die Einschränkung nicht.
