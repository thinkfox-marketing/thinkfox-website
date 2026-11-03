<?php
/**
 * Regelmäßige Aufgaben: fällige Wiederholungen (CRM-Übergabe, Mails) und DSGVO-Löschfristen.
 *
 * Aufruf alle 10 Minuten als KAS-Cronjob (Tools → Cronjobs → URL):
 *   https://thinkfox.de/api/cron.php?token=<cron_token aus api/config.php>
 * oder per Kommandozeile: php api/cron.php
 */

declare(strict_types=1);
define('TF_API', true);
date_default_timezone_set('Europe/Berlin');
header('Content-Type: text/plain; charset=utf-8');
header('X-Robots-Tag: noindex');
header('Cache-Control: no-store');
require __DIR__ . '/lib.php';

$configFile = __DIR__ . '/config.php';
if (!is_file($configFile)) {
    http_response_code(503);
    exit("nicht eingerichtet\n");
}
$config = require $configFile;

if (PHP_SAPI !== 'cli') {
    $soll = (string) ($config['cron_token'] ?? '');
    if (strlen($soll) < 32 || !hash_equals($soll, (string) ($_GET['token'] ?? ''))) {
        http_response_code(403);
        exit("verboten\n");
    }
}

aufraeumen($config, true);
$bericht = warteschlangen_abarbeiten($config, 50);
$offen = ['crm' => count(glob(data_dir('crm') . '/*.json') ?: []), 'mail' => count(glob(data_dir('mail') . '/*.json') ?: [])];
$haengt = count(glob(data_dir('crm/abgelehnt') . '/*.json') ?: []) + count(glob(data_dir('mail/abgelehnt') . '/*.json') ?: []);
echo 'ok ' . json_encode(['bearbeitet' => $bericht, 'offen' => $offen, 'aufgegeben' => $haengt]) . "\n";

// Übersicht ohne Personendaten: je Vorgang Versuche, nächster Versuch, letzter Fehler
foreach (['crm' => 'offen', 'crm/abgelehnt' => 'aufgegeben'] as $ordner => $art) {
    foreach (glob(data_dir($ordner) . '/*.json') ?: [] as $datei) {
        $e = json_decode((string) @file_get_contents($datei), true) ?: [];
        printf("%s %s versuche=%d naechster=%s fehler=%s\n", $art, basename($datei, '.json'), (int) ($e['versuche'] ?? 0),
            isset($e['naechster']) ? date('d.m. H:i', (int) $e['naechster']) : '-', mb_substr((string) preg_replace('/\s+/', ' ', (string) ($e['letzter_fehler'] ?? '-')), 0, 160));
    }
}
if (!function_exists('curl_init')) {
    echo "WARNUNG: PHP-Erweiterung curl fehlt – CRM-Übergabe unmöglich\n";
}
