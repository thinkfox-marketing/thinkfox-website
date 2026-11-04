// Elementor Pro zählt Seitenaufrufe und Sitzungen im Browser (für Popup-Auslöser, die hier nicht genutzt werden).
// Ohne Einwilligung soll nichts im Browser gespeichert bleiben (§ 25 TDDDG) – Einträge wieder entfernen.
function aufraeumen() {
  try { localStorage.removeItem('elementor'); } catch { /* Speicher gesperrt */ }
  try { sessionStorage.removeItem('activeSession'); sessionStorage.removeItem('elementor'); } catch { /* Speicher gesperrt */ }
}
window.addEventListener('load', () => { aufraeumen(); setTimeout(aufraeumen, 3000); });
window.addEventListener('pagehide', aufraeumen);
