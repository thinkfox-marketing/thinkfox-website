#!/usr/bin/env bash
# Überträgt dist-vorschau/ nach <DEPLOY_PATH>/vorschau/ (passwortgeschützte Vorschau, Zweig „relaunch“).
#   scripts/deploy-vorschau.sh dist-vorschau "$DEPLOY_PATH/vorschau"
# Zugangsdaten: FTP_HOST, FTP_USER, FTP_PASSWORD. Schutz: Ziel MUSS auf /vorschau enden – nie die Live-Seite spiegeln.
# .htaccess/.htpasswd im Zielordner (Verzeichnisschutz von All-Inkl) werden nie überschrieben oder gelöscht.
set -euo pipefail
SRC="${1%/}/"
TARGET="${2%/}"
case "$TARGET" in
  */vorschau) ;;
  *) echo "::error::Ziel '$TARGET' endet nicht auf /vorschau – Abbruch, um die Live-Seite zu schützen."; exit 1 ;;
esac
[ -n "${FTP_HOST:-}" ] && [ -n "${FTP_USER:-}" ] && [ -n "${FTP_PASSWORD:-}" ] || { echo "::error::FTP-Zugangsdaten fehlen"; exit 1; }
[ -f "${SRC}index.html" ] || { echo "::error::${SRC}index.html fehlt"; exit 1; }
EXCL="-x ^\\.htaccess$ -x ^\\.htpasswd$"
lftp -u "$FTP_USER,$FTP_PASSWORD" "$FTP_HOST" -e "
  set ftp:ssl-force true; set ftp:ssl-protect-data true; set ssl:verify-certificate yes;
  set net:max-retries 3; set net:timeout 30;
  mirror -R --delete --ignore-time --parallel=8 $EXCL $SRC $TARGET/;
  mirror -R --parallel=8 $EXCL -I *.html -I *.css -I *.js $SRC $TARGET/;
  bye"
echo "Vorschau übertragen nach $TARGET/"
