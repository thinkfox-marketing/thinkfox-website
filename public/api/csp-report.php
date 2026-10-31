<?php
/**
 * Nimmt Berichte der Content-Security-Policy (Beobachtungsmodus, siehe .htaccess) entgegen.
 * Gespeichert werden nur Seite, verletzte Regel und blockierte Quelle – keine Besucherdaten.
 * Ablage: api/data/csp.jsonl (höchstens 500 Einträge, älteste fallen heraus).
 */

declare(strict_types=1);
http_response_code(204);

$raw = file_get_contents('php://input', false, null, 0, 20000);
$report = json_decode((string) $raw, true)['csp-report'] ?? null;
if (!is_array($report)) {
    exit;
}

$dir = __DIR__ . '/data';
if (!is_dir($dir)) {
    @mkdir($dir, 0750, true);
    @file_put_contents($dir . '/.htaccess', "Require all denied\n");
}
$eintrag = json_encode([
    'zeit' => date('c'),
    'seite' => parse_url((string) ($report['document-uri'] ?? ''), PHP_URL_PATH),
    'regel' => (string) ($report['effective-directive'] ?? $report['violated-directive'] ?? ''),
    'quelle' => substr((string) ($report['blocked-uri'] ?? ''), 0, 200),
], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

$file = $dir . '/csp.jsonl';
$zeilen = is_file($file) ? (file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: []) : [];
$zeilen[] = $eintrag;
@file_put_contents($file, implode("\n", array_slice($zeilen, -500)) . "\n", LOCK_EX);
