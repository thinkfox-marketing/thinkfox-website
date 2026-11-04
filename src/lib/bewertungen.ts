// Google-Bewertungen (Trustindex-Widget) statisch: Das Markup mit allen Bewertungen liegt schon vorgerendert in der
// Seite; das externe Ladeskript (cdn.trustindex.io, ohne Einwilligung) machte es nur sichtbar und zum Slider.
// Jetzt: Ladeskript entfällt, Bewertungen als wischbare Reihe (CSS in ergaenzungen.css, .ti-widget),
// Bilder/Symbole lokal (scripts/astro-extern-lokal.mjs). Pfeile entfallen (Wischen, Scrollen, Tastatur).
export function bewertungenStatisch(html: string): string {
  if (!html.includes('class=" ti-widget')) return html;
  return html
    // vom Ladeskript entfernte Ausblendung
    .replace(/<div style="opacity: 0;height: 0 !important;overflow: hidden !important" (data-css-url=)/g, '<div $1')
    // Stylesheet steht schon im CSS-Bündel – doppelter Abruf im Body entfällt
    .replace(/<link data-noptimize="1"[^>]*href="\/wp-content\/uploads\/trustindex-google-widget\.css[^"]*"[^>]*>/g, '')
    // Pfeil-Schaltflächen ohne Funktion
    .replace(/<div class="ti-controls">[\s\S]*?<\/div>\s*<\/div>\s*(?=<div class="ti-reviews-container-wrapper")/g, '')
    // eingebettetes Nachlade-Skript für cdn.trustindex.io/loader.js
    .replace(/<script>\s*\(function \(\) \{ if \(window\.tiLoaderFallback\)[\s\S]*?<\/script>/g, '')
    // Sterne einmal als Text („5 von 5 Sternen“) statt fünfmal „Google star n“
    .replace(/<span class="ti-stars([^"]*)">([\s\S]*?)<\/span>(?=\s*(?:<span class="ti-verified|<div|<\/div>))/g, (m, k, inner: string) => {
      const voll = (inner.match(/star\/f\.svg/g) ?? []).length;
      const halb = (inner.match(/star\/h\.svg/g) ?? []).length;
      if (!voll && !halb) return m;
      const wert = String(voll + halb / 2).replace('.', ',');
      return `<span class="ti-stars${k}" role="img" aria-label="${wert} von 5 Sternen">${inner.replace(/alt="Google star \d"/g, 'alt=""')}</span>`;
    })
    // Profilbilder: Name steht daneben → dekorativ
    .replace(/alt="[^"]*profile picture"/g, 'alt=""')
    // Reihe per Tastatur scrollbar und benannt
    .replace(/<div class="ti-reviews-container-wrapper">/g, '<div class="ti-reviews-container-wrapper" role="region" aria-label="Google-Bewertungen" tabindex="0">');
}
