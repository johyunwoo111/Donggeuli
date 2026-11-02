(() => {
  function normalize(value) {
    return value.normalize('NFC').replace(/\s+/g, '').toLowerCase();
  }

  const form = document.querySelector('.popular_search');
  const input = form.querySelector('.search_input');
  form.action = 'sub.html#lunch-menu';
  form.addEventListener('submit', event => {
    if (input.disabled || normalize(input.value).length >= 2) return;
    event.preventDefault();
    input.setCustomValidity('도시락이나 반찬 이름을 두 글자 이상 입력해 주세요.');
    input.reportValidity();
    input.setCustomValidity('');
  });

  const panel = document.querySelector('#menu-panel');
  const url = new URL(location.href);
  const keyword = (url.searchParams.get('keyword') || '').trim();
  const query = normalize(keyword);
  if (!panel || query.length < 2) return;

  const cards = [...panel.querySelectorAll('.lunch-card[data-product-id]')];
  const isSideDish = card => card.dataset.category.split(/\s+/).includes('custom');
  const matches = cards.filter(card =>
    (query === '반찬' && isSideDish(card)) ||
    normalize(card.querySelector('h3').textContent).includes(query)
  );

  if (matches.length === 1 && !isSideDish(matches[0])) {
    location.replace('sub.html?product=' + encodeURIComponent(matches[0].dataset.productId));
    return;
  }

  cards.forEach(card => { card.hidden = !matches.includes(card); });
  const summary = document.createElement('p');
  summary.textContent = matches.length
    ? '“' + keyword + '” 검색 결과 ' + matches.length + '개'
    : '“' + keyword + '”에 일치하는 메뉴가 없습니다.';
  panel.prepend(summary);

  // 카테고리를 선택하면 기존 메뉴 필터가 상품 목록을 다시 표시합니다.
  const tabs = document.querySelector('.menu-tabs');
  function clearSearch() {
    summary.remove();
    url.searchParams.delete('keyword');
    history.replaceState(null, '', url);
    tabs.removeEventListener('click', onTabClick);
    tabs.removeEventListener('keydown', onTabKey);
  }
  function onTabKey(event) {
    if (['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) clearSearch();
  }
  function onTabClick(event) {
    if (event.target.closest('.menu-tab') && summary.isConnected) clearSearch();
  }
  tabs.addEventListener('click', onTabClick);
  tabs.addEventListener('keydown', onTabKey);
})();