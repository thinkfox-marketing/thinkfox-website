<?php
/**
 * Ersatz für /wp-admin/admin-ajax.php.
 *
 * Bedient die Aktionen, die das (unveränderte) Forminator-Frontend aufruft:
 *   - forminator_get_nonce                  → Formular-Token
 *   - forminator_submit_form_custom-forms   → Prüfen, ablegen, ans CRM übergeben, per E-Mail melden, Antwort/Weiterleitung
 * Alle anderen Aktionen (Elementor, Essential Addons, Instagram) antworten mit success:false.
 *
 * Konfiguration: api/config.php (Vorlage: config.example.php) – nicht im Git.
 * Formular-Metadaten (Feldnamen, CRM-Zuordnung): forms.json. Gemeinsame Funktionen: lib.php.
 * Anfragen werden zusätzlich als JSON-Zeilen in api/data/ abgelegt (per .htaccess gesperrt)
 * und nach 'aufbewahrung_tage' (Standard 90) automatisch gelöscht.
 *
 * Ablauf einer Anfrage: speichern → CRM (ein Versuch, max. 5 s; sonst Warteschlange) → Mail an das Team
 * (mit Link zum CRM-Eintrag, falls schon übergeben; scheitert die Mail, wird sie wiederholt). Die Besucherin
 * bekommt Erfolg, sobald die Anfrage gespeichert ist. Wiederholungen: cron.php (KAS-Cronjob) und nach jeder Anfrage.
 *
 * Spam-Schutz (für Besucher unsichtbar): Honeypot-Feld, signierter Zeitstempel als Token
 * (Absenden frühestens 3 Sekunden nach dem Laden), höchstens 5 Anfragen pro Stunde je IP-Adresse.
 */

declare(strict_types=1);
define('TF_API', true);
date_default_timezone_set('Europe/Berlin');
header('Content-Type: application/json; charset=utf-8');
header('X-Robots-Tag: noindex');
header('Cache-Control: no-store');
require __DIR__ . '/lib.php';

$configFile = __DIR__ . '/config.php';
if (!is_file($configFile)) {
    respond(false, ['message' => 'Der Formularversand ist gerade nicht verfügbar. Bitte schreib uns an hallo@thinkfox.de oder ruf an: 05623 9737793.']);
}
$config = require $configFile;
$forms = json_decode((string) file_get_contents(__DIR__ . '/forms.json'), true) ?: [];

$action = $_POST['action'] ?? '';

if ($action === 'forminator_get_nonce') {
    respond(true, nonce((string) ($_POST['form_id'] ?? ''), $config));
}

if ($action !== 'forminator_submit_form_custom-forms') {
    respond(false, null);
}

$formId = (string) ($_POST['form_id'] ?? '');
if (!isset($forms[$formId]) || (!isset($config['forms'][$formId]) && !isset($forms[$formId]['einstellungen']))) {
    respond(false, ['message' => 'Unbekanntes Formular.']);
}
// Formular-Regeln aus forms.json („einstellungen“, im Repository) haben Vorrang; api/config.php liefert v. a. die Empfänger
$form = array_replace($config['forms'][$formId] ?? [], $forms[$formId]['einstellungen'] ?? []);
$form['to'] = $form['to'] ?? ['hallo@thinkfox.de'];

// Spam-Schutz – Bots erhalten jeweils eine normale Erfolgsantwort, damit sie nichts lernen
$alter = nonce_age($formId, (string) ($_POST['forminator_nonce'] ?? ''), $config);
if ($alter === null || $alter > 2 * 86400) {
    respond(false, ['message' => 'Die Sitzung ist abgelaufen. Bitte lade die Seite neu und sende das Formular erneut.']);
}
if ($alter < 3) {
    spam_merken($formId, 'zu schnell');
    respond(true, behaviour($form, []));
}
foreach ($_POST as $key => $value) {
    if (preg_match('/^input_\d+$/', (string) $key) && trim(is_array($value) ? implode('', $value) : (string) $value) !== '') {
        spam_merken($formId, 'Honeypot');
        respond(true, behaviour($form, []));
    }
}

// Pflichtfelder
$errors = [];
foreach ($form['required'] ?? [] as $field) {
    $value = $_POST[$field] ?? '';
    if ((is_array($value) && !array_filter($value)) || (!is_array($value) && trim((string) $value) === '')) {
        $errors[] = [$field => 'Erforderlich.'];
    }
}
$replyField = $form['reply_to'] ?? 'email-1';
$email = is_string($_POST[$replyField] ?? null) ? trim($_POST[$replyField]) : '';
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = [$replyField => 'Keine gültige E-Mail-Adresse.'];
}
if ($errors) {
    respond(false, ['message' => 'Bitte korrigiere die Fehler vor der Übermittlung.', 'errors' => $errors]);
}
// Rate-Limit erst nach bestandener Prüfung (Tippfehler zählen nicht mit)
if (!rate_limit_ok($config)) {
    respond(false, ['message' => 'Es wurden gerade sehr viele Anfragen gesendet. Bitte versuche es in einer Stunde erneut, schreib uns an hallo@thinkfox.de oder ruf an: 05623 9737793.']);
}

// Werte in Feldreihenfolge des Formulars einsammeln
$labels = $forms[$formId]['felder'];
$values = [];
foreach ($labels as $name => $label) {
    if (str_starts_with($name, 'html-') || str_starts_with($name, 'calculation-')) {
        continue;
    }
    $raw = $_POST[$name] ?? null;
    if ($raw === null || $raw === '' || $raw === []) {
        continue;
    }
    if (str_starts_with($name, 'consent-')) {
        $label = $forms[$formId]['einwilligung_bezeichnung'] ?? 'Datenschutz-Einwilligung';
        $raw = 'ja';
    }
    $values[$label] = is_array($raw) ? implode(', ', array_map(fn ($v) => clean((string) $v), $raw)) : clean((string) $raw);
}

// Marketing-Ampel (Selbsttest, Formular 12432): Punktzahlen je Bereich
$extra = [];
if (!empty($form['scores'])) {
    $scores = [];
    foreach ($form['scores'] as $key => $fields) {
        $sum = 0.0;
        foreach ($fields as $field) {
            // Skalenfrage: genau ein Wert zwischen 0 und 5 (Mehrfachauswahl oder manipulierte Werte zählen nicht)
            $werte = array_map('floatval', (array) ($_POST[$field] ?? []));
            $sum += count($werte) === 1 ? max(0.0, min(5.0, $werte[0])) : 0.0;
        }
        $scores[$key] = round($sum / max(count($fields), 1), 2);
    }
    $values['Auswertung'] = implode(', ', array_map(fn ($k, $v) => "$k: $v", array_keys($scores), $scores));
    // Nur die Punktzahlen kommen in die Ergebnis-URL – kein Firmenname (Server-Logs, Verlauf, Analyse-Tools)
    $extra['scores'] = $scores;
}

// Freiwillige Kontaktdaten (Marketing-Ampel): ohne E-Mail/Telefon nur die Auswertung – nichts speichern, nichts mailen
if (!empty($form['kontakt_freiwillig'])) {
    $kf = $form['kontakt_freiwillig'];
    $mitKontakt = false;
    foreach ($kf['felder'] ?? [] as $feld) {
        $mitKontakt = $mitKontakt || (is_string($_POST[$feld] ?? null) && trim($_POST[$feld]) !== '');
    }
    if (!$mitKontakt) {
        respond(true, behaviour($form, $extra));
    }
    if (empty($_POST[$kf['einwilligung'] ?? 'consent-1'])) {
        respond(false, ['message' => 'Bitte bestätige, dass wir uns bei dir melden dürfen – oder lass die Kontaktfelder leer.',
            'errors' => [[($kf['einwilligung'] ?? 'consent-1') => 'Bitte bestätigen oder Kontaktfelder leer lassen.']]]);
    }
}

$gespeichert = store($formId, $values);
aufraeumen($config);

// CRM: Rumpf einmal bilden, sofort ein Versuch; scheitert er, übernimmt die Warteschlange
$crm = null;
$vorgang = $formId . '-' . time() . '-' . bin2hex(random_bytes(8));
if (crm_aktiv($config, $formId, $forms) && !empty($_POST[$forms[$formId]['crm']['einwilligung_feld'] ?? 'consent-1'])) {
    $crm = crm_uebergeben($config, $vorgang, crm_rumpf($vorgang, $formId, $forms, $_POST, crm_utm($_POST)));
}

// Mail an das Team
$lines = [];
foreach ($values as $label => $value) {
    $lines[] = $label . ":\n" . $value . "\n";
}
if ($crm !== null) {
    $lines[] = match (true) {
        $crm['status'] === 'ok' && ($crm['crm_url'] ?? '') !== '' => "Im CRM:\n" . $crm['crm_url'] . "\n",
        $crm['status'] === 'ok' => "Im CRM angelegt (Lead " . ($crm['lead_id'] ?? '') . ")\n",
        $crm['status'] === 'wiederholen' => "CRM: noch nicht übernommen, wird automatisch nachgeholt (Vorgang $vorgang)\n",
        default => "CRM: Übernahme abgelehnt – bitte von Hand anlegen (Vorgang $vorgang, Hinweis-Mail folgt)\n",
    };
}
$body = implode("\n", $lines) . "\n--\nGesendet über https://thinkfox.de/" . trim((string) $forms[$formId]['seite'], '/') . '/';
$gemeldet = benachrichtigen($config, (array) $form['to'], $form['subject'] ?? 'Neue Anfrage über thinkfox.de', $body, $email);

if (!$gespeichert && !$gemeldet) {
    respond(false, ['message' => 'Leider konnte deine Anfrage gerade nicht übermittelt werden. Bitte schreib uns an hallo@thinkfox.de oder ruf an: 05623 9737793.']);
}
respond(true, behaviour($form, $extra), true);

// ---------------------------------------------------------------------------

/** Antwort senden; danach (falls PHP-FPM) noch fällige Wiederholungen abarbeiten, ohne die Besucherin warten zu lassen. */
function respond(bool $success, mixed $data, bool $nacharbeiten = false): never
{
    echo json_encode(['success' => $success, 'data' => $data], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($nacharbeiten && function_exists('fastcgi_finish_request')) {
        fastcgi_finish_request();
        global $config;
        warteschlangen_abarbeiten($config, 20);
    }
    exit;
}

/** Token = Zeitstempel beim Laden des Formulars + Signatur. */
function nonce(string $formId, array $config): string
{
    $zeit = (string) time();
    return $zeit . '.' . substr(hash_hmac('sha256', $formId . '|' . $zeit, (string) $config['secret']), 0, 16);
}

/** Alter des Tokens in Sekunden, null bei ungültiger Signatur. */
function nonce_age(string $formId, string $token, array $config): ?int
{
    if (!preg_match('/^(\d{10})\.([0-9a-f]{16})$/', $token, $m)) {
        return null;
    }
    $soll = substr(hash_hmac('sha256', $formId . '|' . $m[1], (string) $config['secret']), 0, 16);
    return hash_equals($soll, $m[2]) ? time() - (int) $m[1] : null;
}

/** Spam-Treffer kurz vermerken (ohne Inhalte), damit Fehlalarme auffallen. */
function spam_merken(string $formId, string $grund): void
{
    @file_put_contents(data_dir() . '/spam.log', date('c') . " $formId $grund\n", FILE_APPEND | LOCK_EX);
}

/** Höchstens 5 Anfragen pro Stunde je (gehashter) IP-Adresse; IPv6 je /64-Netz. */
function rate_limit_ok(array $config): bool
{
    $file = data_dir() . '/limits.json';
    $fp = @fopen($file, 'c+');
    if (!$fp) {
        return true;
    }
    flock($fp, LOCK_EX);
    $limits = json_decode((string) stream_get_contents($fp), true) ?: [];
    $jetzt = time();
    $adresse = (string) ($_SERVER['REMOTE_ADDR'] ?? '');
    if (filter_var($adresse, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6)) {
        $adresse = implode(':', array_slice(explode(':', (string) inet_ntop((string) inet_pton($adresse))), 0, 4)) . '::/64';
    }
    $ip = hash_hmac('sha256', $adresse, (string) $config['secret']);
    foreach ($limits as $key => $zeiten) {
        $limits[$key] = array_values(array_filter((array) $zeiten, fn ($t) => $t > $jetzt - 3600));
        if (!$limits[$key]) {
            unset($limits[$key]);
        }
    }
    $ok = count($limits[$ip] ?? []) < 5;
    if ($ok) {
        $limits[$ip][] = $jetzt;
    }
    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode($limits));
    flock($fp, LOCK_UN);
    fclose($fp);
    return $ok;
}

/** Antwort im Forminator-Format: Danke-Text oder Weiterleitung. */
function behaviour(array $form, array $extra): array
{
    if (!empty($form['redirect'])) {
        $url = $form['redirect'];
        if (isset($extra['scores'])) {
            $token = rtrim(strtr(base64_encode(json_encode($extra, JSON_UNESCAPED_UNICODE)), '+/', '-_'), '=');
            $url .= (str_contains($url, '?') ? '&' : '?') . 'ergebnis=' . $token;
        }
        return ['success' => true, 'url' => $url, 'newtab' => 'sametab', 'behav' => 'behaviour-redirect'];
    }
    return ['success' => true, 'message' => $form['message'] ?? '<p>Vielen Dank! Wir melden uns in Kürze.</p>', 'behav' => 'behaviour-thankyou'];
}
