// 배너 슬라이드 제어
$(function () {

    var banner = $("#visual .mySwiper");

    // 배너가 있는 경우에만 실행
    if (banner.length === 0 || typeof Swiper === "undefined") {
        return;
    }

    var fill = banner.find(".progress_fill");
    var character = banner.find(".progress_character");

    var swiper = new Swiper(banner[0], {
        slidesPerView: 1,
        initialSlide: 1,
        loop: true,
        speed: 800,

        // 배너 안의 이전 / 다음 버튼 연결
        navigation: {
            nextEl: banner.find(".swiper-button-next")[0],
            prevEl: banner.find(".swiper-button-prev")[0]
        },

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
})();
