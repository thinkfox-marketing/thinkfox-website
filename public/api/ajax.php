<?php
/**
 * Ersatz für /wp-admin/admin-ajax.php.
 *
 * Bedient die Aktionen, die das (unveränderte) Forminator-Frontend aufruft:
 *   - forminator_get_nonce                  → Formular-Token
 *   - forminator_submit_form_custom-forms   → Prüfen, per E-Mail versenden, ablegen, Antwort/Weiterleitung
 * Alle anderen Aktionen (Elementor, Essential Addons, Instagram) antworten mit success:false.
 *
 * Konfiguration: api/config.php (Vorlage: config.example.php) – nicht im Git.
 * Anfragen werden zusätzlich als JSON-Zeilen in api/data/ abgelegt (per .htaccess gesperrt)
 * und nach 'aufbewahrung_tage' (Standard 90) automatisch gelöscht.
 *
 * Spam-Schutz (für Besucher unsichtbar): Honeypot-Feld, signierter Zeitstempel als Token
 * (Absenden frühestens 3 Sekunden nach dem Laden), höchstens 5 Anfragen pro Stunde je IP-Adresse.
 */

declare(strict_types=1);
date_default_timezone_set('Europe/Berlin');
header('Content-Type: application/json; charset=utf-8');
header('X-Robots-Tag: noindex');

$configFile = __DIR__ . '/config.php';
if (!is_file($configFile)) {
    respond(false, ['message' => 'Formularversand ist noch nicht eingerichtet (api/config.php fehlt).']);
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
$form = $config['forms'][$formId] ?? null;
if (!$form || !isset($forms[$formId])) {
    respond(false, ['message' => 'Unbekanntes Formular.']);
}

// Spam-Schutz – Bots erhalten jeweils eine normale Erfolgsantwort, damit sie nichts lernen
$alter = nonce_age($formId, (string) ($_POST['forminator_nonce'] ?? ''), $config);
if ($alter === null || $alter > 2 * 86400) {
    respond(false, ['message' => 'Die Sitzung ist abgelaufen. Bitte lade die Seite neu und sende das Formular erneut.']);
}
if ($alter < 3) {
    respond(true, behaviour($form, []));
}
foreach ($_POST as $key => $value) {
    if (preg_match('/^input_\d+$/', (string) $key) && trim((string) $value) !== '') {
        respond(true, behaviour($form, []));
    }
}
if (!rate_limit_ok($config)) {
    respond(false, ['message' => 'Es wurden gerade sehr viele Anfragen gesendet. Bitte versuche es in einer Stunde erneut oder schreib uns an hallo@thinkfox.de.']);
}

// Pflichtfelder
$errors = [];
foreach ($form['required'] ?? [] as $field) {
    $value = $_POST[$field] ?? '';
    if ((is_array($value) && !array_filter($value)) || (!is_array($value) && trim((string) $value) === '')) {
        $errors[] = [$field => 'Erforderlich.'];
    }
}
$email = trim((string) ($_POST[$form['reply_to'] ?? 'email-1'] ?? ''));
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = [$form['reply_to'] ?? 'email-1' => 'Keine gültige E-Mail-Adresse.'];
}
if ($errors) {
    respond(false, ['message' => 'Bitte korrigiere die Fehler vor der Übermittlung.', 'errors' => $errors]);
}

// Werte in Feldreihenfolge des Formulars einsammeln
$labels = $forms[$formId]['felder'];
$values = [];
foreach ($labels as $name => $label) {
    if (str_starts_with($name, 'html-') || str_starts_with($name, 'calculation-')) {
        continue;
    }
    $raw = $_POST[$name] ?? ($_POST[$name . '[]'] ?? null);
    if ($raw === null || $raw === '' || $raw === []) {
        continue;
    }
    if (str_starts_with($name, 'consent-')) {
        $label = 'Datenschutz-Einwilligung';
        $raw = 'ja';
    }
    $values[$label] = is_array($raw) ? implode(', ', array_map('clean', $raw)) : clean((string) $raw);
}

// Marketing-Check: Punktzahlen je Bereich (gleiche Formeln wie im Formular)
$extra = [];
if (!empty($form['scores'])) {
    $scores = [];
    foreach ($form['scores'] as $key => $fields) {
        $sum = 0.0;
        foreach ($fields as $field) {
            $sum += array_sum(array_map('floatval', (array) ($_POST[$field] ?? [])));
        }
        $scores[$key] = round($sum / max(count($fields), 1), 2);
    }
    $values['Auswertung'] = implode(', ', array_map(fn ($k, $v) => "$k: $v", array_keys($scores), $scores));
    $extra['scores'] = $scores;
    $extra['firma'] = clean((string) ($_POST[$form['company_field'] ?? 'name-2'] ?? ''));
}

store($formId, $values, (int) ($config['aufbewahrung_tage'] ?? 90));
$sent = send_mail($config, $form, $values, $email);
if (!$sent) {
    respond(false, ['message' => 'Bei der Bearbeitung des Formulars ist ein Fehler aufgetreten. Bitte versuche es erneut']);
}
respond(true, behaviour($form, $extra));

// ---------------------------------------------------------------------------

function respond(bool $success, mixed $data): never
{
    echo json_encode(['success' => $success, 'data' => $data], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
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

function data_dir(): string
{
    $dir = __DIR__ . '/data';
    if (!is_dir($dir)) {
        @mkdir($dir, 0750, true);
    }
    if (!is_file($dir . '/.htaccess')) {
        // zusätzlich zur Sperre in api/.htaccess
        @file_put_contents($dir . '/.htaccess', "Require all denied\n");
    }
    return $dir;
}

/** Höchstens 5 Anfragen pro Stunde je (gehashter) IP-Adresse. */
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
    $ip = hash_hmac('sha256', (string) ($_SERVER['REMOTE_ADDR'] ?? ''), (string) $config['secret']);
    foreach ($limits as $key => $zeiten) {
        $limits[$key] = array_values(array_filter($zeiten, fn ($t) => $t > $jetzt - 3600));
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

function clean(string $value): string
{
    return trim(strip_tags(str_replace(["\r\n", "\r"], "\n", $value)));
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

function store(string $formId, array $values, int $aufbewahrungTage): void
{
    $dir = data_dir();
    $line = json_encode(['zeit' => date('c'), 'formular' => $formId, 'werte' => $values], JSON_UNESCAPED_UNICODE) . "\n";
    @file_put_contents($dir . '/anfragen-' . $formId . '.jsonl', $line, FILE_APPEND | LOCK_EX);

    // DSGVO: ältere Anfragen löschen
    $grenze = time() - $aufbewahrungTage * 86400;
    foreach (glob($dir . '/anfragen-*.jsonl') ?: [] as $file) {
        $zeilen = file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [];
        $behalten = array_filter($zeilen, function ($z) use ($grenze) {
            $zeit = json_decode($z, true)['zeit'] ?? null;
            return $zeit === null || strtotime($zeit) >= $grenze;
        });
        if (count($behalten) !== count($zeilen)) {
            @file_put_contents($file, $behalten ? implode("\n", $behalten) . "\n" : '', LOCK_EX);
        }
    }
}

function send_mail(array $config, array $form, array $values, string $replyTo): bool
{
    $subject = $form['subject'] ?? 'Neue Anfrage über thinkfox.de';
    $lines = [];
    foreach ($values as $label => $value) {
        $lines[] = $label . ":\n" . $value . "\n";
    }
    $body = implode("\n", $lines) . "\n--\nGesendet über " . ($_POST['current_url'] ?? 'thinkfox.de');
    $to = (array) $form['to'];
    $from = $config['mail']['from'];
    $fromName = $config['mail']['from_name'] ?? 'thinkfox.de';

    $headers = [
        'From' => mb_encode_mimeheader($fromName) . " <$from>",
        'Reply-To' => $replyTo !== '' ? $replyTo : $from,
        'MIME-Version' => '1.0',
        'Content-Type' => 'text/plain; charset=UTF-8',
        'Content-Transfer-Encoding' => '8bit',
        'Date' => date('r'),
        'Message-ID' => '<' . bin2hex(random_bytes(12)) . '@' . substr(strrchr($from, '@'), 1) . '>',
    ];

    if (empty($config['smtp']['host'])) {
        $h = '';
        foreach ($headers as $k => $v) {
            $h .= "$k: $v\r\n";
        }
        return mail(implode(', ', $to), mb_encode_mimeheader($subject), $body, $h, '-f' . $from);
    }
    return smtp_send($config['smtp'], $from, $to, mb_encode_mimeheader($subject), $headers, $body);
}

/** Minimaler SMTP-Client (SSL auf 465 oder STARTTLS auf 587, AUTH LOGIN). */
function smtp_send(array $smtp, string $from, array $to, string $subject, array $headers, string $body): bool
{
    $secure = $smtp['secure'] ?? 'tls';
    $host = ($secure === 'ssl' ? 'ssl://' : '') . $smtp['host'];
    $fp = @stream_socket_client($host . ':' . ($smtp['port'] ?? 587), $errno, $errstr, 15);
    if (!$fp) {
        error_log("SMTP: $errstr");
        return false;
    }
    $read = function () use ($fp): string {
        $data = '';
        while (($line = fgets($fp, 515)) !== false) {
            $data .= $line;
            if (isset($line[3]) && $line[3] === ' ') {
                break;
            }
        }
        return $data;
    };
    $cmd = function (string $c, array $ok) use ($fp, $read): bool {
        fwrite($fp, $c . "\r\n");
        $r = $read();
        if (!in_array((int) substr($r, 0, 3), $ok, true)) {
            error_log('SMTP: ' . trim($r) . ' auf ' . (str_starts_with($c, 'AUTH') || strlen($c) > 40 ? '[…]' : $c));
            return false;
        }
        return true;
    };
    $ehlo = 'EHLO ' . ($_SERVER['SERVER_NAME'] ?? 'localhost');
    $ok = (int) substr($read(), 0, 3) === 220 && $cmd($ehlo, [250]);
    if ($ok && $secure === 'tls') {
        $ok = $cmd('STARTTLS', [220])
            && stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)
            && $cmd($ehlo, [250]);
    }
    $ok = $ok && $cmd('AUTH LOGIN', [334]) && $cmd(base64_encode($smtp['user']), [334]) && $cmd(base64_encode($smtp['pass']), [235]);
    $ok = $ok && $cmd("MAIL FROM:<$from>", [250]);
    foreach ($to as $rcpt) {
        $ok = $ok && $cmd("RCPT TO:<$rcpt>", [250, 251]);
    }
    if ($ok && $cmd('DATA', [354])) {
        $msg = 'To: ' . implode(', ', $to) . "\r\nSubject: $subject\r\n";
        foreach ($headers as $k => $v) {
            $msg .= "$k: $v\r\n";
        }
        $msg .= "\r\n" . preg_replace('/^\./m', '..', str_replace("\n", "\r\n", $body));
        $ok = $cmd($msg . "\r\n.", [250]);
    } else {
        $ok = false;
    }
    $cmd('QUIT', [221]);
    fclose($fp);
    return $ok;
}
