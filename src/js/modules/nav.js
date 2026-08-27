/**
 * Markiert den Navigationslink, der zum aktuellen Hash gehört.
 */
export function initNav() {
  const links = document.querySelectorAll('.site-header__nav a[href^="#"]');
  if (links.length === 0) return;

  const sync = () => {
    for (const link of links) {
      const isCurrent = link.getAttribute('href') === (window.location.hash || '#start');
      link.setAttribute('aria-current', isCurrent ? 'page' : 'false');
    }
  };

  window.addEventListener('hashchange', sync);
  sync();
}
