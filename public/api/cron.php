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
