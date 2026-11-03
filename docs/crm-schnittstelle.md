# Schnittstelle Website → CRM (Entwurf zur Abstimmung)

Stand: 03.11.2026 · Absender: Website thinkfox.de (`public/api/ajax.php`) · Empfänger: CRM `crm.thinkfox.marketing` (Eigenbau, PHP)

Ziel: Jede **Projektanfrage** von thinkfox.de landet automatisch als Lead im CRM. Die E-Mail an hallo@thinkfox.de
bleibt zusätzlich bestehen (Sicherheitsnetz). Dieses Dokument beschreibt, was die Website sendet – das CRM baut
dazu eine Annahme-Adresse. Weicht das CRM-Briefing ab, wird die Website-Seite angepasst.

---

## 1. Transport

| Punkt | Festlegung |
|---|---|
| Methode | `POST`, `Content-Type: application/json; charset=utf-8` |
| Adresse | vom CRM festgelegt, Vorschlag: `https://crm.thinkfox.marketing/api/website-anfrage.php` |
| Verschlüsselung | nur HTTPS (gültiges Zertifikat, Website prüft es) |
| Zeitlimit | Website wartet max. 5 s auf Antwort |
| Häufigkeit | eine Anfrage pro Formular-Absendung, bei Fehlern Wiederholungen (siehe 5) |

## 2. Absicherung

Zwei Header, beide Pflicht:

```
X-Thinkfox-Zeit:     1793718555                      (Unix-Zeit in Sekunden beim Senden)
X-Thinkfox-Signatur: sha256=<hex>                    (HMAC-SHA256 über  Zeit + "." + Roh-Body)
```

- Gemeinsamer geheimer Schlüssel (mind. 32 Zeichen Zufall): liegt auf der Website **nur** in `api/config.php`
  (`'crm' => ['secret' => …]`), im CRM in dessen Konfiguration. Nie in Git, nie per Chat/Mail im Klartext.
- Das CRM prüft: Signatur stimmt (zeitkonstanter Vergleich, `hash_equals`) **und** Zeit liegt höchstens
  300 s zurück. Sonst `401`.
- Beispiel Prüfung im CRM (PHP):
  ```php
  $body = file_get_contents('php://input');
  $zeit = $_SERVER['HTTP_X_THINKFOX_ZEIT'] ?? '';
  $soll = 'sha256=' . hash_hmac('sha256', $zeit . '.' . $body, $SECRET);
  if (!hash_equals($soll, $_SERVER['HTTP_X_THINKFOX_SIGNATUR'] ?? '') || abs(time() - (int) $zeit) > 300) {
      http_response_code(401); exit;
  }
  ```

## 3. Inhalt (JSON)

```json
{
  "version": 1,
  "id": "11213-1793718555-3f9a1c2b7d4e5f60",
  "eingegangen": "2026-11-03T12:35:05+01:00",
  "quelle": {
    "website": "thinkfox.de",
    "formular_id": "11213",
    "formular": "Projektanfrage",
    "seite": "https://thinkfox.de/thinkfox-marketing-projekt-anfragen/"
  },
  "kontakt": {
    "name": "Hansi Dampfi",
    "firma": "Beispiel GmbH",
    "email": "hansi@beispiel.de",
    "telefon": "+49 5623 000000",
    "website": "https://beispiel.de"
  },
  "anfrage": {
    "themen": ["Externe Unterstützung im Marketing"],
    "dringend": ["SocialMedia Betreuung"],
    "aktuelle_betreuung": "Externe Marketingagentur"
  },
  "felder": [
    { "schluessel": "checkbox-1", "frage": "Bei welchem Thema dürfen wir Dich unterstützen?", "antwort": "Externe Unterstützung im Marketing" }
  ],
  "einwilligung": { "datenschutz": true, "zeitpunkt": "2026-11-03T12:35:05+01:00" }
}
```

Zuordnung der Formularfelder (Projektanfrage, Forminator-ID 11213):

| Formularfeld | Frage auf der Website | JSON |
|---|---|---|
| `name-1` | Wie können wir Dich erreichen? | `kontakt.name` |
| `text-1` | Name des Unternehmens | `kontakt.firma` |
| `email-1` | Deine geschäftliche E-Mail Adresse | `kontakt.email` |
| `phone-1` | Deine Telefonnummer | `kontakt.telefon` |
| `url-1` | Geschäftliche Webseite | `kontakt.website` |
| `checkbox-1` | Bei welchem Thema dürfen wir Dich unterstützen? | `anfrage.themen` (Liste) |
| `checkbox-2` | Was benötigst du deiner Meinung nach am dringendsten? | `anfrage.dringend` (Liste) |
| `radio-2` | Wer kümmert sich aktuell um Dein Marketing? | `anfrage.aktuelle_betreuung` |
| `consent-1` | Zustimmung Datenschutz | `einwilligung.datenschutz` |

- `felder` enthält zusätzlich **alle** Felder genau wie in der E-Mail – so gehen neue Formularfelder nicht verloren,
  auch wenn das CRM sie noch nicht kennt.
- Leere optionale Felder: `null` (bei Listen `[]`).
- Bewusst **nicht** übertragen (Datenminimierung): IP-Adresse, Browser-Kennung, Cookies, Tracking-IDs.
- Zeichensatz UTF-8, Umlaute unverändert. Länge je Feld max. 5.000 Zeichen.

## 4. Antwort des CRM

| Status | Bedeutung | Website reagiert |
|---|---|---|
| `200`/`201` + `{"ok": true, "lead_id": "…"}` | angelegt | erledigt, `lead_id` wird im Protokoll vermerkt |
| `409` | `id` schon bekannt (Wiederholung) | erledigt |
| `400`/`422` + `{"ok": false, "fehler": "…"}` | Inhalt abgelehnt | keine Wiederholung, Hinweis-Mail an hallo@ |
| `401`/`403` | Signatur/Zeit falsch | keine Wiederholung, Hinweis-Mail (Konfiguration prüfen) |
| `5xx`, Zeitüberschreitung, keine Verbindung | CRM vorübergehend nicht erreichbar | Wiederholung (siehe 5) |

**Doppelte vermeiden:** Das CRM speichert die `id` und legt bei gleicher `id` keinen zweiten Lead an (Antwort `409`
oder erneut `200` mit derselben `lead_id`). Dubletten-Erkennung über E-Mail-Adresse (bestehender Kontakt → neue
Anfrage am Kontakt) entscheidet das CRM.

## 5. Zuverlässigkeit auf Website-Seite

- Die Besucherin bekommt ihre Erfolgsmeldung sofort; die Übergabe ans CRM läuft danach und bremst das Formular nicht.
- Jede Anfrage kommt zuerst in eine Warteschlange auf dem Server (`api/data/`, von außen gesperrt).
- Wiederholungen nach 1 min, 5 min, 30 min, 2 h, 12 h; danach Hinweis-Mail an hallo@ mit der Anfrage.
- Die Mail an hallo@ geht in jedem Fall raus – unabhängig vom CRM.
- Löschung: Warteschlangen-Einträge werden nach erfolgreicher Übergabe gelöscht; Aufbewahrung der Anfragen auf
  dem Webserver wie bisher (`aufbewahrung_tage`).

## 6. Datenschutz

- Website und CRM gehören zum selben Verantwortlichen (thinkfox marketing GmbH) – keine Auftragsverarbeitung nötig,
  aber die **Datenschutzerklärung** muss die Übernahme der Anfragen ins CRM, Zweck, Speicherdauer und den Hoster des
  CRM nennen.
- Liegt das CRM nicht bei All-Inkl: Hoster des CRM benennen (Auftragsverarbeitungsvertrag mit diesem Hoster).

## 7. Offene Fragen an das CRM-Projekt

1. Endgültige Annahme-Adresse?
2. Soll das CRM bestehende Kontakte per E-Mail-Adresse zusammenführen?
3. Welcher Status bzw. welche Pipeline-Stufe für neue Website-Leads, wer wird benachrichtigt?
4. Sollen später weitere Formulare folgen (Marketing-Ampel, Kontakt)? Das Format ist dafür vorbereitet
   (`quelle.formular_id`).
5. Wo wird das CRM gehostet (für Datenschutzerklärung)?

## 8. Test

- Testmodus: Header `X-Thinkfox-Test: 1` → CRM prüft und antwortet wie echt, legt aber nichts an.
- Abnahme: eine Testanfrage über die Website → Lead im CRM mit allen Feldern, Mail an hallo@, keine Dublette bei
  erneutem Senden derselben `id`.
