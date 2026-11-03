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

# Erstinstallation: Formular-Konfiguration anlegen, falls noch keine existiert
# (danach nur noch auf dem Server pflegen – wird bei Deploys nie überschrieben)
if ! ftp "cls -1 ${TARGET}api/config.php" > /dev/null 2>&1; then
  SECRET=$(openssl rand -hex 32)
  sed "s/'BITTE-AENDERN-' . 'mindestens-32-zeichen-zufall'/'$SECRET'/" public/api/config.example.php > /tmp/config.php
  ftp "mkdir -p -f ${TARGET}api; put /tmp/config.php -o ${TARGET}api/config.php"
  echo "api/config.php angelegt – SMTP-Zugang und Empfänger auf dem Server eintragen."
fi

# 1. Alle Dateien abgleichen (neu/geändert nach Größe, gelöschte entfernen).
# 2. Seiten und Konfigurationsdateien immer übertragen (können bei gleicher Größe geändert sein).
# Nur auf dem Server vorhandene Ordner nie löschen: /e-zines/ (Inhalte mit externen Backlinks, nicht im Repo).
EXCL="-x ^api/config\\.php$ -x ^api/data/ -x ^e-zines/"
ftp "mirror -R --delete --ignore-time --parallel=8 $EXCL $SRC $TARGET"
ftp "mirror -R --parallel=8 $EXCL -I *.html -I *.xml -I *.txt -I *.json -I *.yml -I *.php -I .htaccess $SRC $TARGET"
echo "Übertragen nach $TARGET"
