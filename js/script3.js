// 회사 소개: AOS와 같은 data-aos 속성을 외부 라이브러리 없이 제어합니다.
(function () {
    'use strict';
    function initBrand() {
        var root = document.getElementById('brand-story');
        if (!root) return;
        var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
        var finale = root.querySelector('.brand-finale');
        var card = root.querySelector('.brand-finale-card');
        var reveals = Array.from(root.querySelectorAll('[data-aos]'));
        var pending = false;
        var clamp = function (n) { return Math.max(0, Math.min(1, n)); };
        function render() {
            pending = false;
            var height = window.innerHeight;
            reveals.forEach(function (element) {
                var rect = element.getBoundingClientRect();
                var center = element.dataset.aosAnchorPlacement === 'center-center';
                // 중앙 기준 효과는 카드 중앙이 화면 중앙에 도착할 때 표시합니다.
                var pin = center && element.closest('.brand-pin');
                var pinTop = pin ? Math.max(0, pin.getBoundingClientRect().top) : 0;
                var visible = center ? rect.top + rect.height / 2 <= (height + pinTop) / 2 + 4 : rect.top < height * .88;
                if (visible || reduced.matches) element.classList.add('aos-animate');
            });
            if (!finale || !card) return;
            var rect = finale.getBoundingClientRect();
            // 처음 90vh 동안 확대하고, 남은 고정 구간에서는 최대 크기를 유지합니다.
            var zoomDistance = Math.min(height * .9, Math.max(1, finale.offsetHeight - height));
            var progress = clamp(-rect.top / zoomDistance);
            // 데스크톱: 600 → 1200px. 모바일: 화면 안에서 비례 확대합니다.
            var max = Math.min(1200, document.documentElement.clientWidth - 40);
            var min = Math.min(600, max * .78);
            if (reduced.matches || height <= 650) progress = 1;
            card.style.width = (min + (max - min) * progress) + 'px';
        }
        function schedule() {
            if (!pending) { pending = true; requestAnimationFrame(render); }
        }
        root.classList.add('brand-motion');
        window.addEventListener('scroll', schedule, { passive: true });
        window.addEventListener('resize', schedule);
        window.addEventListener('load', schedule);
        reduced.addEventListener('change', schedule);
        if (document.fonts) document.fonts.ready.then(schedule);
        render();
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initBrand);
    else initBrand();
}());

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