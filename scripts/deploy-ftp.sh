#!/usr/bin/env bash
# Überträgt ein Build-Verzeichnis per FTPS auf den Webspace (All-Inkl).
#   scripts/deploy-ftp.sh <verzeichnis> <zielpfad>
# Zugangsdaten: FTP_HOST, FTP_USER, FTP_PASSWORD (Umgebungsvariablen).
# api/config.php und api/data/ (Anfragen) existieren nur auf dem Server und bleiben unangetastet.
set -euo pipefail
SRC="${1%/}/"
TARGET="${2%/}/"

ftp() {
  lftp -u "$FTP_USER,$FTP_PASSWORD" "$FTP_HOST" -e "
    set ftp:ssl-force true; set ftp:ssl-protect-data true; set ssl:verify-certificate yes;
    set net:max-retries 3; set net:timeout 30; $1; bye"
}

# api/config.php (Empfänger, SMTP, CRM-Geheimnis) gibt es nur auf dem Server und wird NIE angelegt oder überschrieben.
# Fehlt sie, nur warnen – Ersteinrichtung von Hand nach public/api/config.example.php.
if ! ftp "cls -1 ${TARGET}api/config.php" > /dev/null 2>&1; then
  echo "::warning::api/config.php nicht gefunden (oder Auflisten fehlgeschlagen) – Formulare brauchen sie. Bitte auf dem Server prüfen."
fi

# 1. Alle Dateien abgleichen (neu/geändert nach Größe, gelöschte entfernen).
# 2. Seiten und Konfigurationsdateien immer übertragen (können bei gleicher Größe geändert sein).
# Nur auf dem Server vorhandene Dateien nie löschen: Konfiguration, Formulardaten/Warteschlangen, /e-zines/ (externe
# Backlinks, nicht im Repo), /.well-known/ (Zertifikate, Bestätigungsdateien).
EXCL="-x ^api/config\\.php$ -x ^api/config-github\\.php$ -x ^api/data/ -x ^e-zines/ -x ^\\.well-known/"
ftp "mirror -R --delete --ignore-time --parallel=8 $EXCL $SRC $TARGET"
ftp "mirror -R --parallel=8 $EXCL -I *.html -I *.xml -I *.txt -I *.json -I *.yml -I *.php -I .htaccess $SRC $TARGET"
echo "Übertragen nach $TARGET"
