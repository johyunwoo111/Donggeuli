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
// 주문 페이지 본문: 자동 넘김(4초), 마우스 드래그, 기존 장바구니 불러오기.
(function () {
    function initOrderPage() {
        const page = document.getElementById('order-page');
        if (!page) return;
        const track = page.querySelector('.order-special-track');
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
        let timer;
        let dragging = false;
        let startX = 0;
        let startScroll = 0;
        let pointerId;
        function step(direction) {
            const card = track.querySelector('.order-special-card');
            const distance = card.getBoundingClientRect().width + parseFloat(getComputedStyle(track).gap);
            const max = track.scrollWidth - track.clientWidth;
            let next = track.scrollLeft + distance * direction;
            if (direction > 0 && track.scrollLeft >= max - 3) next = 0;
            if (direction < 0 && track.scrollLeft <= 3) next = max;
            track.scrollTo({ left: Math.max(0, Math.min(max, next)), behavior: reduced.matches ? 'auto' : 'smooth' });
        }
        function stop() { clearInterval(timer); }
        function start() {
            stop();
            if (!reduced.matches && !dragging && !document.hidden && !track.matches(':hover') && !track.contains(document.activeElement)) {
                timer = setInterval(() => step(1), 4000);
            }
        }
        track.addEventListener('pointerdown', event => {
            if (event.pointerType !== 'mouse' || event.button !== 0) return;
            dragging = true; pointerId = event.pointerId; startX = event.clientX; startScroll = track.scrollLeft;
            stop(); track.classList.add('is-dragging'); track.setPointerCapture(pointerId);
        });
        track.addEventListener('pointermove', event => {
            if (dragging) { event.preventDefault(); track.scrollLeft = startScroll - (event.clientX - startX); }
        });
        function endDrag() {
            if (!dragging) return;
            dragging = false; track.classList.remove('is-dragging');
            if (track.hasPointerCapture(pointerId)) track.releasePointerCapture(pointerId);
            start();
        }
        track.addEventListener('pointerup', endDrag);
        track.addEventListener('pointercancel', endDrag);
        track.addEventListener('lostpointercapture', endDrag);
        track.addEventListener('mouseenter', stop);
        track.addEventListener('mouseleave', start);
        track.addEventListener('focusin', stop);
        track.addEventListener('focusout', () => setTimeout(start, 0));
        track.addEventListener('keydown', event => {
            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                event.preventDefault(); step(event.key === 'ArrowRight' ? 1 : -1);
            }
        });
        document.addEventListener('visibilitychange', start);
        reduced.addEventListener('change', start);
        start();

        const cartField = page.querySelector('#order-cart');
        const totalLabel = page.querySelector('#order-cart-total');
        const cartNotice = page.querySelector('#order-cart-notice');
        const cartKey = 'donggori-cart-v1';
        const quantityOf = item => Number.isFinite(Number(item.quantity)) ? Math.max(1, Math.floor(Number(item.quantity))) : 1;
        function readCart() {
            const cart = JSON.parse(localStorage.getItem(cartKey) || '[]');
            if (!Array.isArray(cart)) throw new Error('Invalid cart');
            return cart;
        }
        function loadCart() {
            try {
                const cart = readCart();
                const fragment = document.createDocumentFragment();
                let total = 0;
                cart.forEach((item, index) => {
                    if (!item || typeof item.name !== 'string') return;
                    const quantity = quantityOf(item);
                    const price = Number.isFinite(Number(item.price)) ? Math.max(0, Number(item.price)) : 0;
                    total += price * quantity;
                    const row = document.createElement('div');
                    row.className = 'order-cart-row';
                    row.setAttribute('role', 'listitem');
                    const description = document.createElement('div');
                    description.className = 'order-cart-description';
                    const title = document.createElement('strong');
                    title.textContent = item.name;
                    description.append(title);
                    const sides = Array.isArray(item.sides) ? item.sides.filter(side => typeof side === 'string').join(', ') : '';
                    if (sides) {
                        const detail = document.createElement('small');
                        detail.textContent = '선택 반찬: ' + sides;
                        description.append(detail);
                    }
                    const amount = document.createElement('span');
                    amount.className = 'order-cart-amount';
                    amount.textContent = quantity + '개 · ' + (price * quantity).toLocaleString('ko-KR') + '원';
                    const minus = document.createElement('button');
                    minus.type = 'button';
                    minus.className = 'order-cart-minus';
                    minus.textContent = '−';
                    minus.setAttribute('aria-label', item.name + (sides ? ' (' + sides + ')' : '') + (quantity === 1 ? ' 삭제' : ' 수량 1개 줄이기'));
                    minus.addEventListener('click', () => {
                        try {
                            const latest = readCart();
                            // 다른 탭에서 내역이 바뀌었다면 목록을 갱신하고 다시 선택하도록 합니다.
                            if (JSON.stringify(latest) !== JSON.stringify(cart)) {
                                loadCart();
                                cartNotice.textContent = '장바구니 내역이 변경되었습니다. 다시 선택해 주세요.';
                                return;
                            }
                            if (quantity > 1) latest[index].quantity = quantity - 1;
                            else latest.splice(index, 1);
                            localStorage.setItem(cartKey, JSON.stringify(latest));
                            const rowIndex = Array.from(cartField.children).indexOf(row);
                            loadCart();
                            cartNotice.textContent = item.name + (quantity > 1 ? ' 수량을 1개 줄였습니다.' : ' 상품을 삭제했습니다.');
                            const buttons = cartField.querySelectorAll('.order-cart-minus');
                            const next = buttons[Math.min(rowIndex, buttons.length - 1)];
                            (next || page.querySelector('.order-cart-footer a')).focus({ preventScroll: true });
                        } catch (error) {
                            cartNotice.textContent = '변경 내용을 저장하지 못했습니다. 브라우저 저장 설정을 확인해 주세요.';
                        }
                    });
                    row.append(description, amount, minus);
                    fragment.append(row);
                });
                cartField.replaceChildren(fragment);
                if (!cartField.children.length) cartField.textContent = '아직 장바구니에 담은 도시락이 없습니다. 메뉴에서 도시락을 먼저 담아주세요.';
                totalLabel.textContent = total.toLocaleString('ko-KR') + '원';
            } catch (error) {
                cartField.textContent = '장바구니 정보를 불러오지 못했습니다. 메뉴 페이지에서 담은 내역을 확인해 주세요.';
                totalLabel.textContent = '—';
            }
        }
        loadCart();
        window.addEventListener('pageshow', loadCart);
        window.addEventListener('storage', event => { if (event.key === cartKey || event.key === null) loadCart(); });

        // 시안 단계: Enter를 눌러도 주문·결제·개인정보 전송을 하지 않습니다.
        page.querySelector('form').addEventListener('submit', event => event.preventDefault());
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initOrderPage);
    else initOrderPage();
}());
