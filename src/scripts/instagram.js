// „Mehr laden“ im Instagram-Feed: zeigt weitere bereits gerenderte Beiträge statt
// (wie in WordPress) per admin-ajax nachzuladen.
document.addEventListener('click', (event) => {
  const button = event.target.closest('#sbi_load .sbi_load_btn');
  if (!button) return;
  // vor dem Handler des Plugins abfangen (der würde admin-ajax.php aufrufen)
  event.stopImmediatePropagation();
  event.preventDefault();
  const feed = button.closest('#sb_instagram');
  const perPage = Number(feed.dataset.num) || 20;
  const hidden = [...feed.querySelectorAll('.sbi_item[data-tf-more]')];
  hidden.slice(0, perPage).forEach((item) => {
    item.removeAttribute('data-tf-more');
    item.style.display = '';
  });
  if (hidden.length <= perPage) button.style.display = 'none';
}, true);
