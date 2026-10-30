// 배너 슬라이드 제어
$(function () {

    var banner = $("#visual .mySwiper");

    // 배너가 있는 경우에만 실행
    if (banner.length === 0) {
        return;
    }

    var fill = banner.find(".progress_fill");
    var character = banner.find(".progress_character");

    var swiper = new Swiper(banner[0], {
        slidesPerView: 1,
        loop: true,
        speed: 800,

        // 자동 슬라이드
        autoplay: {
            delay: 4000,
            disableOnInteraction: false
        },


        on: {
            // 다음 배너까지 남은 시간에 맞춰 실행
            autoplayTimeLeft: function (swiper, time, progress) {

                // 0~100% 범위로 계산
                var percent = Math.max(
                    0,
                    Math.min(100, (1 - progress) * 100)
                );

                // 진행 바 채우기
                fill.css("width", percent + "%");

                // 동글이를 오른쪽으로 이동
                character.css("left", percent + "%");
            }
        }
    });
});

// 검색바 제어: HTML 준비가 끝나면 실행
$(function () {

    var form = $(".popular_search");

    // 검색바가 없으면 실행 종료
    if (form.length === 0) {
        return;
    }

    var openBtn = form.find(".popular_open");
    var input = form.find(".search_input");
    var list = form.find(".popular_list");

    // 원래 메뉴 개수 저장
    var menuCount = list.children(".popular_item").length;

    if (menuCount === 0) {
        return;
    }

    // 첫 메뉴를 마지막에 복사해서 자연스럽게 연결
    list.children(".popular_item")
        .first()
        .clone()
        .attr("aria-hidden", "true")
        .appendTo(list);

    var index = 0;
    var timer;
    var editing = false;

    // 처음 상태 설정
    openBtn.prop("hidden", false);
    input.prop("hidden", true).prop("disabled", true);

    // 이전 transform 설정과 겹치지 않게 초기화
    list.css({
        transform: "none",
        transition: "none",
        marginTop: 0
    });


    // 메뉴를 한 줄 위로 이동
    function roll() {

        // 검색 중이거나 이동 중이면 실행하지 않음
        if (editing || list.is(":animated")) {
            return;
        }

        // 메뉴 한 칸의 높이
        var itemHeight = list.children(".popular_item")
            .first()
            .outerHeight();

        index++;

        // 위쪽으로 이동
        list.animate({
            marginTop: -(index * itemHeight)
        }, 450, function () {

            // 복사된 첫 메뉴에 도착하면 원래 위치로 복귀
            if (index === menuCount) {
                index = 0;
                list.css("margin-top", 0);
            }
        });
    }


    // 자동 전환 시작
    function start() {

        // 반복 실행이 중복되지 않게 정리
        clearInterval(timer);

        if (!editing && menuCount > 1) {
            timer = setInterval(roll, 3000);
        }
    }


    // 검색 입력창 열기
    function openSearch() {

        editing = true;
        clearInterval(timer);

        // 진행 중인 메뉴 이동을 마무리
        list.stop(true, true);

        // 인기 메뉴 버튼 숨기기
        openBtn.prop("hidden", true);

        // 입력창 표시 / 입력 허용 / 초점 이동
        input.prop("hidden", false)
            .prop("disabled", false)
            .trigger("focus");
    }


    // 인기 메뉴 표시로 돌아가기
    function closeSearch() {

        editing = false;

        // 입력창 숨기기 / 입력 비활성화
        input.prop("hidden", true)
            .prop("disabled", true);

        openBtn.prop("hidden", false);

        start();
    }


    // 인기 메뉴 클릭
    openBtn.on("click", openSearch);


    // 검색바의 빈 공간 클릭
    form.on("click", function (event) {

        if (event.target === this) {
            openSearch();
        }
    });


    // 돋보기 클릭 또는 Enter 입력
    form.on("submit", function (event) {

        // 입력창이 닫혀 있으면 먼저 열기
        if (!editing) {
            event.preventDefault();
            openSearch();
            return;
        }

        // 검색어 앞뒤 공백 제거
        input.val(input.val().trim());

        // 빈 검색어는 제출하지 않음
        if (input.val() === "") {
            event.preventDefault();
            input.trigger("focus");
        }

        // 검색어가 있으면 form의 action 주소로 이동
    });


    // 검색어 없이 검색바 밖을 클릭하면 닫기
    $(document).on("pointerdown", function (event) {

        // form[0]: jQuery 객체에서 실제 HTML 요소를 꺼냄
        var inside = form[0].contains(event.target);

        if (editing && !inside && input.val().trim() === "") {
            closeSearch();
        }
    });


    // Tab 키로 검색바 밖으로 이동한 경우
    form.on("focusout", function () {

        setTimeout(function () {

            var inside = form[0].contains(
                document.activeElement
            );

            if (editing && !inside && input.val().trim() === "") {
                closeSearch();
            }

        }, 0);
    });


    // Esc 키로 검색 취소
    input.on("keydown", function (event) {

        if (event.key === "Escape") {
            event.preventDefault();

            input.val("");
            closeSearch();
            openBtn.trigger("focus");
        }
    });


    // 자동 전환 시작
    start();
});

// ==================== 도시락 메뉴 선택 / 목록 교체 ====================
// HTML의 data-category를 기준으로 분류합니다. 상품 추가 시 JS 수정은 필요 없습니다.
(function () {
    const tabs = Array.from(document.querySelectorAll('.menu-tab'));
    const highlight = document.querySelector('.menu-highlight');
    const panel = document.querySelector('#menu-panel');
    const grid = document.querySelector('.lunch-grid');
    const cards = Array.from(document.querySelectorAll('.lunch-card'));
    const status = document.querySelector('#menu-status');
    if (!tabs.length || !highlight || !panel) return;
    // 새 페이지로 이동하며 생기는 포커스 링은 숨기고 실제 키보드 조작에만 표시합니다.
    document.addEventListener('keydown', event => {
        if (['Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
            document.documentElement.classList.add('menu-keyboard-navigation');
        }
    }, true);
    document.addEventListener('pointerdown', () => {
        document.documentElement.classList.remove('menu-keyboard-navigation');
    }, true);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let activeIndex = 0;
    let animation;

    function selectMenu(index, focusTab = false) {
        const tab = tabs[index];
        const direction = index >= activeIndex ? 1 : -1;
        const filter = tab.dataset.filter;
        tabs.forEach((item, i) => {
            item.setAttribute('aria-selected', String(i === index));
            item.tabIndex = i === index ? 0 : -1;
        });
        // 트레이와 수저를 하나의 묶음으로 좌우 이동합니다.
        highlight.style.transform = `translateX(${index * 100}%)`;
        panel.setAttribute('aria-labelledby', tab.id);
        let count = 0;
        cards.forEach(card => {
            const visible = filter === 'all' || card.dataset.category.split(/\s+/).includes(filter);
            card.hidden = !visible;
            if (visible) count++;
        });
        // 빠르게 연속 클릭해도 마지막 선택이 즉시 반영됩니다.
        if (animation) animation.cancel();
        if (!reducedMotion.matches && typeof grid.animate === 'function') {
            animation = grid.animate([
                { opacity: 0, transform: `translateX(${direction * 24}px)` },
                { opacity: 1, transform: 'translateX(0)' }
            ], { duration: 350, easing: 'ease-out' });
        }
        status.textContent = `${tab.textContent} 도시락 ${count}개`;
        activeIndex = index;
        if (focusTab) tab.focus({ preventScroll: true });
        // 작은 화면에서는 가로 메뉴판만 스크롤합니다 (페이지 위치 유지).
        const scroller = tab.closest('.menu-scroll');
        scroller.scrollTo({
            left: Math.max(0, tab.offsetLeft - (scroller.clientWidth - tab.offsetWidth) / 2),
            behavior: reducedMotion.matches ? 'instant' : 'smooth'
        });
    }
    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => selectMenu(index));
        tab.addEventListener('keydown', event => {
            let next = index;
            if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
            else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
            else if (event.key === 'Home') next = 0;
            else if (event.key === 'End') next = tabs.length - 1;
            else return;
            event.preventDefault();
            selectMenu(next, true);
        });
    });
    // 다른 페이지에서 분류 링크로 들어오면 해당 탭과 상품 목록을 바로 선택합니다.
    const linkedCategory = new URLSearchParams(window.location.search).get('category');
    const linkedIndex = tabs.findIndex(tab => tab.dataset.filter === linkedCategory);
    if (linkedIndex >= 0) selectMenu(linkedIndex);
})();

// ==================== 도시락 주문 팝업 ====================
$(function () {
    var dialog = document.getElementById('lunch-order-dialog');
    if (!dialog) return;
    var $dialog = $(dialog);
    // 저장 안내는 반찬 선택 영역 바깥에 두어 단품 팝업에서도 표시합니다.
    $dialog.find('.order-feedback').appendTo($dialog.find('.order-card'));
    var selected = new Set();
    var currentProduct = null;
    var opener = null;
    var closing = false;
    var closeTimer;
    var pageY = 0;
    var savedBodyStyle = null;
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    var regular = ['김치', '계란말이', '감자볶음', '콩자반', '멸치볶음', '메추리장조림', '미역줄기', '어묵볶음', '연근조림', '애호박볶음', '진미채볶음', '소·야볶음', '무생채', '오이소박이', '콩나물무침', '우엉조림'];
    var seasonal = ['감자콘샐러드', '콘슬로', '콘과일사라다', '콘치즈', '옥수수전'];
    var maxSides = 3; // 최대 선택 개수
    var cartKey = 'donggori-cart-v1';

    function buildOptions(names, group) {
        names.forEach(function (name) {
            $('<button>', { type: 'button', class: 'order-option', text: name, 'aria-pressed': 'false' })
                .attr('data-side', name).appendTo($dialog.find('[data-side-group="' + group + '"]'));
        });
    }
    buildOptions(regular, 'regular');
    buildOptions(seasonal, 'seasonal');
    function renderSelection() {
        $dialog.find('.order-option').each(function () {
            $(this).attr('aria-pressed', String(selected.has(this.dataset.side)));
        });
        $dialog.find('.order-count').text(selected.size + ' / ' + maxSides + ' 선택');
    }
    function feedback(message) { $dialog.find('.order-feedback').text(message); }
    function openOrder(card) {
        if (dialog.open || card.hidden) return;
        var $card = $(card);
        opener = card;
        // 반찬 배지 또는 custom 분류는 단품 반찬 팝업으로 표시합니다.
        var isSideDish = $card.find('.lunch-badge').text().trim() === '반찬' ||
            (card.dataset.category || '').split(/\s+/).includes('custom');
        currentProduct = {
            name: $card.find('h3').text().trim(),
            description: $card.find('.lunch-description').text().trim(),
            priceText: $card.find('.lunch-price').text().trim(),
            image: $card.find('.lunch-image').attr('src'),
            isSideDish: isSideDish
        };
        currentProduct.price = Number(currentProduct.priceText.replace(/[^0-9]/g, ''));
        currentProduct.id = currentProduct.name + '|' + currentProduct.image;
        // 팝업을 열 때마다 도시락은 김치만 기본 선택합니다.
        selected = new Set(isSideDish ? [] : ['김치']);
        $dialog.toggleClass('is-side-dish', isSideDish);
        $dialog.find('.order-sides').prop('hidden', isSideDish);
        $dialog.find('.order-image').attr({ src: currentProduct.image, alt: currentProduct.name });
        $dialog.find('#order-title').text(currentProduct.name);
        $dialog.find('#order-description').text(currentProduct.description);
        $dialog.find('.order-price').text(currentProduct.priceText);
        var badge = $card.find('.lunch-badge').text().trim();
        $dialog.find('.order-badge').text(badge).prop('hidden', !badge);
        feedback('');
        renderSelection();
        pageY = window.scrollY;
        savedBodyStyle = document.body.getAttribute('style');
        var gutter = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.position = 'fixed';
        document.body.style.top = -pageY + 'px';
        document.body.style.width = '100%';
        document.body.style.overflow = 'hidden';
        if (gutter > 0) document.body.style.paddingRight = gutter + 'px';
        dialog.showModal(); // 배경 클릭/키보드 접근 차단과 포커스 범위를 브라우저가 관리
        dialog.scrollTop = 0;
        $dialog.find('.order-close')[0].focus({ preventScroll: true });
    }
    // sub.html?product=상품ID 링크로 이동하면 해당 카드의 기존 팝업을 엽니다.
    function openLinkedProduct() {
        var productId = new URLSearchParams(window.location.search).get('product');
        if (!productId) return;
        // URL을 CSS 선택자나 HTML로 삽입하지 않고 실제 상품 ID와 비교합니다.
        var card = Array.from(document.querySelectorAll('.lunch-card[data-product-id]')).find(function (item) {
            return item.dataset.productId === productId;
        });
        if (!card) return; // 없는 상품이면 정상 메뉴 목록을 표시
        var allTab = document.getElementById('tab-all');
        if (card.hidden && allTab) allTab.click();
        card.scrollIntoView({ block: 'center', behavior: 'instant' });
        openOrder(card);
    }

    function closeOrder() {
        if (!dialog.open || closing) return;
        closing = true;
        dialog.classList.add('is-closing');
        closeTimer = setTimeout(function () { dialog.close(); }, reduced.matches ? 0 : 220);
    }
    dialog.addEventListener('close', function () {
        clearTimeout(closeTimer);
        closing = false;
        dialog.classList.remove('is-closing');
        // 닫은 뒤 새로고침해도 팝업이 다시 뜨지 않도록 주문 매개변수만 제거.
        var cleanURL = new URL(window.location.href);
        if (cleanURL.searchParams.has('product')) {
            cleanURL.searchParams.delete('product');
            try { window.history.replaceState(window.history.state, '', cleanURL.href); } catch (error) { /* 로컬 파일 브라우저 제한 시 무시 */ }
        }
        if (savedBodyStyle === null) document.body.removeAttribute('style');
        else document.body.setAttribute('style', savedBodyStyle);
        window.scrollTo({ top: pageY, behavior: 'instant' });
        if (opener && opener.isConnected) opener.focus({ preventScroll: true });
    });
    dialog.addEventListener('cancel', function (event) { event.preventDefault(); closeOrder(); });
    var downOnBackdrop = false;
    function outside(event) {
        var rect = dialog.getBoundingClientRect();
        return event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
    }
    dialog.addEventListener('pointerdown', function (event) { downOnBackdrop = event.target === dialog && outside(event); });
    dialog.addEventListener('click', function (event) {
        if (downOnBackdrop && event.target === dialog && outside(event)) closeOrder();
        downOnBackdrop = false;
    });
    $dialog.find('.order-close').on('click', closeOrder);
    $('.lunch-card').each(function () {
        $(this).attr({ role: 'button', tabindex: '0', 'aria-haspopup': 'dialog', 'aria-controls': dialog.id, 'aria-label': $(this).find('h3').text().trim() + ' 주문 옵션 열기' });
    });
    $('.lunch-grid').on('click', '.lunch-card', function () { openOrder(this); });
    $('.lunch-grid').on('keydown', '.lunch-card', function (event) {
        if (event.target !== this) return;
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openOrder(this); }
    });
    $dialog.on('click', '.order-option', function () {
        if (!currentProduct || currentProduct.isSideDish) return;
        var side = this.dataset.side;
        if (selected.has(side)) {
            selected.delete(side);
            feedback('');
        } else if (selected.size < maxSides) {
            selected.add(side);
            feedback('');
        } else {
            feedback('반찬은 최대 3개까지 선택할 수 있어요. 선택한 반찬 하나를 해제한 뒤 골라주세요.');
        }
        renderSelection();
    });
    $dialog.find('.order-add').on('click', function () {
        if (!currentProduct || closing) return;
        // 결제/서버 주문은 하지 않습니다. 현재 브라우저의 소쿠리에 저장합니다.
        // 소쿠리에 저장한 뒤 현재 팝업에서 완료 안내를 표시합니다.
        try {
            var cart = JSON.parse(localStorage.getItem(cartKey) || '[]');
            if (!Array.isArray(cart)) throw new Error('Invalid cart');
            var sides = currentProduct.isSideDish ? [] : Array.from(selected).sort();
            var matching = cart.find(function (item) {
                return item && item.id === currentProduct.id && item.price === currentProduct.price &&
                    Array.isArray(item.sides) && JSON.stringify(item.sides.slice().sort()) === JSON.stringify(sides);
            });
            if (matching) matching.quantity = (Number(matching.quantity) || 1) + 1;
            else cart.push({
                id: currentProduct.id, name: currentProduct.name, image: currentProduct.image,
                price: currentProduct.price, sides: sides, quantity: 1
            });
            localStorage.setItem(cartKey, JSON.stringify(cart));
            feedback(currentProduct.name + ' 1개를 소쿠리에 담았어요.');
        } catch (error) {
            feedback('소쿠리에 저장하지 못했어요. 브라우저 저장 설정을 확인한 뒤 다시 시도해 주세요.');
        }
    });
    openLinkedProduct();
});
