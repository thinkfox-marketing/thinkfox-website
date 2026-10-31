// Auswahlfelder mit Suchfunktion (select2, Marketing-Check): Das Plugin erzeugt eine eigene
// Combobox ohne zugänglichen Namen – mit dem Label des ursprünglichen Felds verknüpfen.
function beschriften() {
  for (const select of document.querySelectorAll('select.forminator-select2')) {
    const combobox = select.nextElementSibling?.querySelector('[role="combobox"]');
    const label = document.querySelector(`label[for="${CSS.escape(select.id)}"]`);
    if (!combobox || !label || combobox.hasAttribute('aria-labelledby')) continue;
    if (!label.id) label.id = `${select.id}-label`;
    combobox.setAttribute('aria-labelledby', label.id);
  }
}

if (document.querySelector('select.forminator-select2')) {
  // select2 wird von Forminator nach dem Laden erzeugt
  new MutationObserver(beschriften).observe(document.body, { childList: true, subtree: true });
  window.addEventListener('load', beschriften);
}
