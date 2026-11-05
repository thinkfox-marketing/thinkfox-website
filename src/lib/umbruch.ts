// Trennstellen für lange Wörter in Überschriften (Handy-Darstellung).
// Diese Wörter sind auf Handys (360–414 px) breiter als die Zeile und liefen über den Rand.
// Weiche Trennstriche (&shy;) wirken am Zeilenende: Passt das Wort dort nicht mehr ganz, wird an der
// Trennstelle umbrochen. Deshalb nur für Wörter, die auf dem Handy ohnehin nicht in eine Zeile passen.
// Als Rückfall bricht ergaenzungen.css zu lange Wörter um (overflow-wrap), damit nie etwas abgeschnitten wird.
// Neue lange Wörter bei Bedarf unten ergänzen.

// Trennstelle mit „|“ markieren; „nurH1“: nur im Seitentitel (das Wort kommt auch in kleineren
// Überschriften vor, die dort passen – ein Trennstrich würde deren Zeilenumbruch verändern).
const WOERTER: { wort: string; nurH1?: boolean }[] = [
  { wort: 'Unternehmens|kommunikation' },
  { wort: 'Unternehmens|marketing' },
  { wort: 'Video-/|Foto|produktion' },
  { wort: 'SHOW|REEL' },
  { wort: 'Marketing|partner', nurH1: true },
  { wort: 'Marketing|abteilung', nurH1: true },
];

const eintraege = WOERTER.map(({ wort, nurH1 }) => ({
  wort: wort.replaceAll('|', ''),
  // nach „/“ ohne Strich trennen (<wbr>), sonst mit weichem Trennstrich
  getrennt: wort.replace(/\/\|/g, '/<wbr>').replaceAll('|', '&shy;'),
  nurH1: !!nurH1,
}));
const regex = (liste: typeof eintraege) => new RegExp(
  `(?<![\\p{L}\\d])(${liste.map((e) => e.wort.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')).join('|')})(?![\\p{L}\\d])`, 'gu',
);
const muster = { alle: regex(eintraege), ohneH1: regex(eintraege.filter((e) => !e.nurH1)) };
const ersatz = new Map(eintraege.map((e) => [e.wort, e.getrennt]));

/** Setzt die Trennstellen im Text von <h1>–<h6> und <div role="heading" aria-level="n"> (nicht in Attributen). */
export function trennstellen(html: string): string {
  const setzen = (auf: string, n: string, inhalt: string, zu: string) =>
    auf + inhalt.replace(/(^|>)([^<]+)/g, (t, vor: string, text: string) =>
      vor + text.replace(n === '1' ? muster.alle : muster.ohneH1, (w) => ersatz.get(w) ?? w)) + zu;
  return html
    .replace(/(<h([1-6])\b[^>]*>)([\s\S]*?)(<\/h\2>)/g, (m, auf: string, n: string, inhalt: string, zu: string) => setzen(auf, n, inhalt, zu))
    .replace(/(<div\b[^>]*\brole="heading"[^>]*\baria-level="([1-6])"[^>]*>)([^<]*)(<\/div>)/g,
      (m, auf: string, n: string, inhalt: string, zu: string) => setzen(auf, n, inhalt, zu));
}
