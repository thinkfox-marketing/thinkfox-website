<?php
/**
 * Gemeinsame Funktionen für ajax.php (Formulare) und cron.php (Warteschlangen, Löschfristen).
 * Per .htaccess nicht direkt abrufbar.
 *
 * Ablage in api/data/ (gesperrt):
 *   anfragen-<formular>.jsonl   jede Anfrage (Löschung nach 'aufbewahrung_tage')
 *   crm/<id>.json               Übergabe ans CRM, noch offen (Rumpf + Versuche)
 *   crm/abgelehnt/<id>.json     vom CRM abgelehnt oder nach allen Wiederholungen gescheitert
 *   mail/<id>.json              Benachrichtigung, deren Versand gescheitert ist (wird wiederholt)
 */

declare(strict_types=1);

if (!defined('TF_API')) {
    http_response_code(403);
    exit;
}

const TF_WIEDERHOLUNG = [60, 300, 1800, 7200, 43200]; // 1 min, 5 min, 30 min, 2 h, 12 h
const TF_FELD_MAX = 5000;

function data_dir(string $unter = ''): string
{
    $dir = __DIR__ . '/data' . ($unter !== '' ? '/' . $unter : '');
    if (!is_dir($dir)) {
        @mkdir($dir, 0750, true);
    }
    $basis = __DIR__ . '/data/.htaccess';
    if (!is_file($basis)) {
        @file_put_contents($basis, "Require all denied\n"); // zusätzlich zur Sperre in api/.htaccess
    }
    return $dir;
}

/** Eingaben für Mail/CRM: Zeilenenden vereinheitlichen, Steuerzeichen entfernen, Länge begrenzen. Kein HTML-Escaping (Mail ist Text, das CRM maskiert selbst). */
function clean(string $value): string
{
    $value = str_replace(["\r\n", "\r"], "\n", $value);
    $value = (string) preg_replace('/[^\P{C}\n\t]/u', '', $value);
    return mb_substr(trim($value), 0, TF_FELD_MAX);
}

function json_text(mixed $daten): string
{
    return json_encode($daten, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE) ?: '{}';
}

/** Datei atomar schreiben (erst Hilfsdatei, dann umbenennen). */
function schreiben(string $datei, string $inhalt): bool
{
    $tmp = $datei . '.tmp' . bin2hex(random_bytes(3));
    if (@file_put_contents($tmp, $inhalt, LOCK_EX) === false) {
        return false;
    }
    return @rename($tmp, $datei);
}

// ------------------------------------------------------------------ Anfragen ablegen, Löschfristen

function store(string $formId, array $values): bool
{
    $line = json_text(['zeit' => date('c'), 'formular' => $formId, 'werte' => $values]) . "\n";
    return @file_put_contents(data_dir() . '/anfragen-' . $formId . '.jsonl', $line, FILE_APPEND | LOCK_EX) !== false;
}

/** DSGVO-Löschfristen – höchstens einmal täglich (Merkdatei), auch ohne neue Anfragen (cron.php). */
function aufraeumen(array $config, bool $sofort = false): void
{
    $merker = data_dir() . '/aufgeraeumt';
    if (!$sofort && is_file($merker) && filemtime($merker) > time() - 86400) {
        return;
    }
    @touch($merker);
    $grenze = time() - (int) ($config['aufbewahrung_tage'] ?? 90) * 86400;
    foreach (glob(data_dir() . '/anfragen-*.jsonl') ?: [] as $file) {
        $fp = @fopen($file, 'c+');
        if (!$fp) {
            continue;
        }
        flock($fp, LOCK_EX); // gleichzeitig angehängte Anfragen gehen nicht verloren
        $zeilen = preg_split('/\n/', (string) stream_get_contents($fp), -1, PREG_SPLIT_NO_EMPTY) ?: [];
        $behalten = array_filter($zeilen, function ($z) use ($grenze) {
            $zeit = json_decode($z, true)['zeit'] ?? null;
            return is_string($zeit) && strtotime($zeit) >= $grenze; // unlesbare Zeilen werden ebenfalls gelöscht
        });
        if (count($behalten) !== count($zeilen)) {
            ftruncate($fp, 0);
            rewind($fp);
            fwrite($fp, $behalten ? implode("\n", $behalten) . "\n" : '');
        }
        flock($fp, LOCK_UN);
        fclose($fp);
    }
    foreach (['crm/abgelehnt', 'mail/abgelehnt'] as $ordner) {
        foreach (glob(data_dir($ordner) . '/*.json') ?: [] as $file) {
            if (filemtime($file) < $grenze) {
                @unlink($file);
            }
        }
    }
}

// ------------------------------------------------------------------ Mail

/** Nachricht versenden; scheitert der Versand, landet sie in der Warteschlange (mail/) und wird wiederholt. */
function benachrichtigen(array $config, array $to, string $subject, string $body, string $replyTo = ''): bool
{
    $nachricht = ['to' => array_values($to), 'subject' => $subject, 'body' => $body, 'reply_to' => $replyTo];
    if (mail_senden($config, $nachricht)) {
        return true;
    }
    $id = date('Ymd-His') . '-' . bin2hex(random_bytes(6));
    schreiben(data_dir('mail') . "/$id.json", json_text($nachricht + ['versuche' => 1, 'naechster' => time() + TF_WIEDERHOLUNG[0]]));
    error_log("Mail-Versand gescheitert, Vorgang $id in der Warteschlange");
    return false;
}

function mail_senden(array $config, array $n): bool
{
    $from = $config['mail']['from'];
    $fromName = $config['mail']['from_name'] ?? 'thinkfox.de';
    $replyTo = filter_var($n['reply_to'] ?? '', FILTER_VALIDATE_EMAIL) ? $n['reply_to'] : $from;
    $headers = [
        'From' => mb_encode_mimeheader($fromName) . " <$from>",
        'Reply-To' => $replyTo,
        'MIME-Version' => '1.0',
        'Content-Type' => 'text/plain; charset=UTF-8',
        'Content-Transfer-Encoding' => 'quoted-printable',
        'Date' => date('r'),
        'Message-ID' => '<' . bin2hex(random_bytes(12)) . '@' . substr((string) strrchr($from, '@'), 1) . '>',
    ];
    // quoted-printable: Zeilen höchstens 76 Zeichen, nur ASCII, CRLF (RFC 5322/2045)
    $body = quoted_printable_encode(str_replace("\n", "\r\n", str_replace(["\r\n", "\r"], "\n", (string) $n['body'])));
    $subject = mb_encode_mimeheader(str_replace(["\r", "\n"], ' ', (string) $n['subject']), 'UTF-8');
    $to = array_values(array_filter((array) $n['to'], fn ($a) => filter_var($a, FILTER_VALIDATE_EMAIL)));
    if (!$to) {
        return false;
    }
    if (empty($config['smtp']['host'])) {
        return mail(implode(', ', $to), $subject, $body, $headers, '-f' . $from);
    }
    return smtp_send($config['smtp'], $from, $to, $subject, $headers, $body);
}

/** Minimaler SMTP-Client (SSL auf 465 oder STARTTLS auf 587, AUTH LOGIN) mit Zeitlimit. */
function smtp_send(array $smtp, string $from, array $to, string $subject, array $headers, string $body): bool
{
    $secure = $smtp['secure'] ?? 'tls';
    $lokal = in_array($smtp['host'], ['127.0.0.1', 'localhost', '::1'], true);
    if (!in_array($secure, ['tls', 'ssl'], true) && !($secure === 'none' && $lokal)) {
        error_log('SMTP: secure muss tls oder ssl sein');
        return false; // nie Zugangsdaten unverschlüsselt über das Netz senden (ohne Verschlüsselung nur zum eigenen Rechner)
    }
    $host = ($secure === 'ssl' ? 'ssl://' : '') . $smtp['host'];
    $fp = @stream_socket_client($host . ':' . ($smtp['port'] ?? 587), $errno, $errstr, 10);
    if (!$fp) {
        error_log("SMTP: Verbindung fehlgeschlagen ($errstr)");
        return false;
    }
    stream_set_timeout($fp, 10);
    $ende = time() + 25; // Gesamtfrist
    $read = function () use ($fp, $ende): string {
        $data = '';
        while (time() < $ende && ($line = fgets($fp, 515)) !== false) {
            $data .= $line;
            if (isset($line[3]) && $line[3] === ' ') {
                break;
            }
        }
        return $data;
    };
    $cmd = function (string $c, array $ok, bool $geheim = false) use ($fp, $read): bool {
        fwrite($fp, $c . "\r\n");
        $r = $read();
        if (!in_array((int) substr($r, 0, 3), $ok, true)) {
            $zeige = $geheim || strlen($c) > 60 ? '[…]' : $c;
            error_log('SMTP: ' . (trim($r) ?: 'keine Antwort') . ' auf ' . $zeige);
            return false;
        }
        return true;
    };
    $ehlo = 'EHLO ' . ($smtp['ehlo'] ?? 'thinkfox.de');
    $gruss = $read();
    $ok = (int) substr($gruss, 0, 3) === 220;
    if (!$ok) {
        error_log('SMTP: keine Begrüßung (' . (trim($gruss) ?: 'Zeitüberschreitung') . ')');
    }
    $ok = $ok && $cmd($ehlo, [250]);
    if ($ok && $secure === 'tls') {
        $ok = $cmd('STARTTLS', [220])
            && stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)
            && $cmd($ehlo, [250]);
    }
    $ok = $ok && $cmd('AUTH LOGIN', [334]) && $cmd(base64_encode($smtp['user']), [334], true) && $cmd(base64_encode($smtp['pass']), [235], true);
    $ok = $ok && $cmd("MAIL FROM:<$from>", [250]);
    foreach ($to as $rcpt) {
        $ok = $ok && $cmd("RCPT TO:<$rcpt>", [250, 251]);
    }
    if ($ok && $cmd('DATA', [354])) {
        $msg = 'To: ' . implode(', ', $to) . "\r\nSubject: $subject\r\n";
        foreach ($headers as $k => $v) {
            $msg .= "$k: $v\r\n";
        }
        $msg .= "\r\n" . preg_replace('/^\./m', '..', $body);
        $ok = $cmd($msg . "\r\n.", [250]);
    } else {
        $ok = false;
    }
    if ($ok) {
        $cmd('QUIT', [221]);
    }
    fclose($fp);
    return $ok;
}

// ------------------------------------------------------------------ CRM (Vertrag: docs/crm-schnittstelle.md + Antwort des CRM vom 03.11.2026)

function crm_aktiv(array $config, string $formId, array $forms): bool
{
    return !empty($config['crm']['url']) && !empty($config['crm']['secret'])
        && strlen((string) $config['crm']['secret']) >= 32 && isset($forms[$formId]['crm']);
}

/** Rumpf einmal bilden – er bleibt über alle Wiederholungen byte-gleich (Signatur wird je Versuch neu gebildet). */
function crm_rumpf(string $id, string $formId, array $forms, array $post, array $utm): string
{
    $f = $forms[$formId];
    $m = $f['crm'];
    $wert = fn (string $feld) => is_array($post[$feld] ?? null)
        ? implode(', ', array_map('clean', array_map('strval', $post[$feld])))
        : clean((string) ($post[$feld] ?? ''));
    $liste = fn (string $feld) => array_values(array_filter(array_map(fn ($v) => clean((string) $v), (array) ($post[$feld] ?? [])), 'strlen'));
    $kurz = fn (string $s, int $n) => $s === '' ? null : mb_substr($s, 0, $n);

    $kontakt = [];
    foreach (['name' => 255, 'firma' => 255, 'email' => 255, 'telefon' => 100, 'website' => 255] as $schluessel => $max) {
        $kontakt[$schluessel] = isset($m['kontakt'][$schluessel]) ? $kurz($wert($m['kontakt'][$schluessel]), $max) : null;
    }
    $anfrage = [];
    foreach ($m['anfrage'] ?? [] as $schluessel => $def) {
        $anfrage[$schluessel] = $def['liste'] ?? false ? $liste($def['feld']) : ($kurz($wert($def['feld']), TF_FELD_MAX));
    }
    $felder = [];
    foreach ($f['felder'] as $name => $frage) {
        if (preg_match('/^(html|calculation)-/', $name)) {
            continue;
        }
        $antwort = str_starts_with($name, 'consent-') ? (empty($post[$name]) ? '' : 'ja') : $wert($name);
        if ($antwort !== '') {
            $felder[] = ['schluessel' => $name, 'frage' => str_starts_with($name, 'consent-') ? 'Datenschutz-Einwilligung' : $frage, 'antwort' => $antwort];
        }
    }
    $quelle = [
        'website' => 'thinkfox.de',
        'formular_id' => $formId,
        'formular' => mb_substr((string) $m['formular'], 0, 100),
        'seite' => 'https://thinkfox.de/' . trim((string) $f['seite'], '/') . '/',
    ];
    if ($utm) {
        $quelle['utm'] = $utm;
    }
    return json_text([
        'version' => 1,
        'id' => $id,
        'eingegangen' => date('c'),
        'quelle' => $quelle,
        'kontakt' => $kontakt,
        'anfrage' => $anfrage,
        'felder' => $felder,
        'einwilligung' => ['datenschutz' => true, 'zeitpunkt' => date('c'), 'text' => (string) ($m['einwilligung_text'] ?? '')],
    ]);
}

/** UTM-Parameter (nur diese fünf, keine Klick-Kennungen wie gclid), vom Formular-Skript als tf_utm_* mitgeschickt. */
function crm_utm(array $post): array
{
    $utm = [];
    foreach (['source', 'medium', 'campaign', 'term', 'content'] as $k) {
        $v = clean((string) ($post['tf_utm_' . $k] ?? ''));
        if ($v !== '') {
            $utm['utm_' . $k] = mb_substr($v, 0, 255);
        }
    }
    return $utm;
}

/**
 * Ein Sendeversuch. Ergebnis: ['status' => 'ok'|'wiederholen'|'abgelehnt', 'lead_id', 'crm_url', 'fehler'].
 * Zeitstempel und Signatur entstehen unmittelbar vor dem Senden.
 */
function crm_senden(array $config, string $rumpf, int $timeout = 5): array
{
    $zeit = (string) time();
    $header = [
        'Content-Type: application/json; charset=utf-8',
        'X-Thinkfox-Zeit: ' . $zeit,
        'X-Thinkfox-Signatur: sha256=' . hash_hmac('sha256', $zeit . '.' . $rumpf, (string) $config['crm']['secret']),
    ];
    if (!empty($config['crm']['test'])) {
        $header[] = 'X-Thinkfox-Test: 1';
    }
    $ch = curl_init((string) $config['crm']['url']);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $rumpf,
        CURLOPT_HTTPHEADER => $header,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 3,
        CURLOPT_TIMEOUT => $timeout,
        CURLOPT_FOLLOWLOCATION => false,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
        CURLOPT_USERAGENT => 'thinkfox.de-Website',
    ]);
    $antwort = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $cfehler = curl_error($ch);
    curl_close($ch);

    if ($antwort === false || $status === 0) {
        return ['status' => 'wiederholen', 'fehler' => 'nicht erreichbar: ' . $cfehler];
    }
    $daten = json_decode((string) $antwort, true) ?: [];
    if (($status === 200 || $status === 201) && !empty($daten['ok'])) {
        return ['status' => 'ok', 'lead_id' => (string) ($daten['lead_id'] ?? ''), 'crm_url' => (string) ($daten['crm_url'] ?? '')];
    }
    if ($status >= 500 || $status === 429 || $status === 200 || $status === 201) {
        $hinweis = mb_substr((string) preg_replace('/\s+/', ' ', trim(strip_tags((string) ($daten['fehler'] ?? $antwort)))), 0, 120);
        return ['status' => 'wiederholen', 'fehler' => "HTTP $status" . ($hinweis !== '' ? ": $hinweis" : '')];
    }
    $text = isset($daten['fehler']) ? (string) $daten['fehler'] : trim(strip_tags((string) $antwort));
    return ['status' => 'abgelehnt', 'fehler' => "HTTP $status: " . mb_substr((string) preg_replace('/\s+/', ' ', $text), 0, 200)];
}

/** Anfrage in die Warteschlange legen und sofort einen Versuch starten. */
function crm_uebergeben(array $config, string $id, string $rumpf): array
{
    $datei = data_dir('crm') . "/$id.json";
    schreiben($datei, json_text(['id' => $id, 'rumpf' => $rumpf, 'versuche' => 0, 'naechster' => time(), 'erstellt' => date('c')]));
    return crm_versuch($config, $datei);
}

function crm_versuch(array $config, string $datei, int $timeout = 5): array
{
    $eintrag = json_decode((string) @file_get_contents($datei), true);
    if (!$eintrag || !isset($eintrag['rumpf'])) {
        @unlink($datei);
        return ['status' => 'abgelehnt', 'fehler' => 'Eintrag unlesbar'];
    }
    $ergebnis = crm_senden($config, $eintrag['rumpf'], $timeout);
    $id = (string) $eintrag['id'];
    if ($ergebnis['status'] === 'ok') {
        @unlink($datei);
        error_log("CRM: Vorgang $id übergeben, Lead " . $ergebnis['lead_id']);
        return $ergebnis;
    }
    $eintrag['versuche']++;
    $eintrag['letzter_fehler'] = $ergebnis['fehler'];
    $aufgeben = $ergebnis['status'] === 'abgelehnt' || $eintrag['versuche'] > count(TF_WIEDERHOLUNG);
    if (!$aufgeben) {
        $eintrag['naechster'] = time() + TF_WIEDERHOLUNG[$eintrag['versuche'] - 1];
        schreiben($datei, json_text($eintrag));
        error_log("CRM: Vorgang $id Versuch {$eintrag['versuche']} gescheitert ({$ergebnis['fehler']}), neuer Versuch geplant");
        return $ergebnis;
    }
    schreiben(data_dir('crm/abgelehnt') . "/$id.json", json_text($eintrag));
    @unlink($datei);
    error_log("CRM: Vorgang $id aufgegeben ({$ergebnis['fehler']})");
    crm_hinweis($config, $eintrag, $ergebnis);
    return ['status' => 'abgelehnt'] + $ergebnis;
}

/** Hinweis-Mail, wenn eine Anfrage nicht ins CRM kam – mit den Kontaktdaten, damit sie von Hand angelegt werden kann. */
function crm_hinweis(array $config, array $eintrag, array $ergebnis): void
{
    $r = json_decode((string) $eintrag['rumpf'], true) ?: [];
    $k = $r['kontakt'] ?? [];
    $zeilen = [
        'Eine Website-Anfrage konnte nicht ins CRM übernommen werden und muss von Hand angelegt werden.',
        '',
        'Grund: ' . ($ergebnis['fehler'] ?? 'unbekannt') . ' (nach ' . $eintrag['versuche'] . ' Versuch(en))',
        'Vorgang: ' . $eintrag['id'],
        'Eingegangen: ' . ($r['eingegangen'] ?? $eintrag['erstellt'] ?? ''),
        'Formular: ' . ($r['quelle']['formular'] ?? ''),
        '',
        'Name: ' . ($k['name'] ?? ''),
        'Firma: ' . ($k['firma'] ?? ''),
        'E-Mail: ' . ($k['email'] ?? ''),
        'Telefon: ' . ($k['telefon'] ?? ''),
        '',
        'Die vollständige Anfrage kam bereits als eigene Mail.',
    ];
    $an = (array) ($config['crm']['hinweis_an'] ?? 'hallo@thinkfox.de');
    benachrichtigen($config, $an, 'CRM-Übernahme fehlgeschlagen: ' . ($k['firma'] ?? $k['name'] ?? $eintrag['id']), implode("\n", $zeilen));
}

// ------------------------------------------------------------------ Warteschlangen abarbeiten

/** Fällige Einträge abarbeiten (CRM und Mail). Zeitbudget in Sekunden. */
function warteschlangen_abarbeiten(array $config, int $budget = 50): array
{
    $lock = @fopen(data_dir() . '/warteschlange.lock', 'c');
    if (!$lock || !flock($lock, LOCK_EX | LOCK_NB)) {
        return ['laeuft_bereits' => true];
    }
    $ende = time() + $budget;
    $bericht = ['crm' => 0, 'mail' => 0];
    if (!empty($config['crm']['url']) && !empty($config['crm']['secret'])) {
        foreach (glob(data_dir('crm') . '/*.json') ?: [] as $datei) {
            if (time() >= $ende) {
                break;
            }
            $e = json_decode((string) @file_get_contents($datei), true);
            if ($e && ($e['naechster'] ?? 0) <= time()) {
                crm_versuch($config, $datei, 5);
                $bericht['crm']++;
            }
        }
    }
    foreach (glob(data_dir('mail') . '/*.json') ?: [] as $datei) {
        if (time() >= $ende) {
            break;
        }
        $n = json_decode((string) @file_get_contents($datei), true);
        if (!$n || ($n['naechster'] ?? 0) > time()) {
            continue;
        }
        $bericht['mail']++;
        if (mail_senden($config, $n)) {
            @unlink($datei);
            continue;
        }
        $n['versuche'] = ($n['versuche'] ?? 1) + 1;
        if ($n['versuche'] > count(TF_WIEDERHOLUNG)) {
            schreiben(data_dir('mail/abgelehnt') . '/' . basename($datei), json_text($n));
            @unlink($datei);
            error_log('Mail endgültig gescheitert: ' . basename($datei) . ' (liegt in api/data/mail/abgelehnt/)');
        } else {
            $n['naechster'] = time() + TF_WIEDERHOLUNG[$n['versuche'] - 1];
            schreiben($datei, json_text($n));
        }
    }
    flock($lock, LOCK_UN);
    fclose($lock);
    return $bericht;
}
