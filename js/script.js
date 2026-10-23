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

// ================= 동고리 메뉴 제어 =================
$(function () {

    // 메뉴 전체 영역 선택
    var section = $("#menu_section");

    // 메뉴 영역이 없으면 실행 종료
    if (section.length === 0) {
        return;
    }

    // 카테고리 탭의 li 목록
    var tabs = section.find(".menu_tabs > li");

    // HTML에 작성한 카테고리별 콘텐츠
    var panels = section.find(".menu_panel");

    // 하단 점 버튼
    var dots = section.find(".menu_dots > button");

    // 메뉴 카드 버튼
    var cards = section.find(".menu_card");

    // 현재 선택한 카테고리 번호
    // 0: 전체 / 1: 특산물 / 2: 한상 동고리 / 3: 메인반찬
    var currentIndex = 0;

    // 표시할 콘텐츠가 없으면 종료
    if (panels.length === 0) {
        return;
    }


    // 카드와 설명을 연결하는 고유 id 설정
    cards.each(function (index) {

        var detail = $(this).find(".menu_detail");
        var detailId = "donggori_menu_detail_" + index;

        detail.attr("id", detailId);

        $(this).attr("aria-controls", detailId);
    });


    // 모든 카드 설명 닫기
    function closeDetails() {

        cards.removeClass("on")
            .attr("aria-expanded", "false");

        cards.find(".menu_detail")
            .attr("aria-hidden", "true");
    }


    // 선택한 카테고리 표시
    function showCategory(index) {

        /*
            카테고리 번호를 순환시킴

            마지막에서 다음 클릭 → 전체
            전체에서 이전 클릭 → 메인반찬
        */
        currentIndex =
            (index + panels.length) % panels.length;

        // 모든 카테고리 숨기기
        panels.prop("hidden", true);

        // 선택한 카테고리만 보여주기
        panels.eq(currentIndex)
            .prop("hidden", false);


        // 상단 탭 선택 표시 초기화
        tabs.removeClass("on");

        tabs.children("button")
            .attr("aria-pressed", "false");

        // 선택한 탭에 on 클래스 추가
        tabs.eq(currentIndex)
            .addClass("on")
            .children("button")
            .attr("aria-pressed", "true");


        // 하단 점 선택 표시 초기화
        dots.removeClass("on")
            .removeAttr("aria-current");

        // 현재 카테고리의 점 강조
        dots.eq(currentIndex)
            .addClass("on")
            .attr("aria-current", "true");


        // HTML의 data-name에서 카테고리 이름 가져오기
        var categoryName = panels.eq(currentIndex)
            .attr("data-name");

        // 예: 도시락 · 2 / 5
        section.find(".menu_position").text(
            categoryName + " · " +
            (currentIndex + 1) + " / " + panels.length
        );

        // 카테고리를 바꿀 때 열린 설명 닫기
        closeDetails();
    }


    // 상단 카테고리 버튼 클릭
    tabs.children("button").on("click", function () {

        // 클릭한 버튼의 부모 li가 몇 번째인지 확인
        var index = tabs.index($(this).parent());

        showCategory(index);
    });


    // 왼쪽 숟가락: 이전 카테고리
    section.find(".menu_prev").on("click", function () {
        showCategory(currentIndex - 1);
    });


    // 오른쪽 젓가락: 다음 카테고리
    section.find(".menu_next").on("click", function () {
        showCategory(currentIndex + 1);
    });


    // 하단 점 클릭: 해당 카테고리로 이동
    dots.on("click", function () {

        var index = dots.index(this);

        showCategory(index);
    });


    // 메뉴 카드 클릭: 설명 열기 / 닫기
    cards.on("click", function () {

        var card = $(this);

        // 클릭하기 전에 닫혀 있던 카드인지 확인
        var willOpen = !card.hasClass("on");

        // 다른 카드의 설명은 모두 닫기
        closeDetails();

        // 닫혀 있던 카드라면 설명 열기
        if (willOpen) {

            card.addClass("on")
                .attr("aria-expanded", "true");

            card.find(".menu_detail")
                .attr("aria-hidden", "false");
        }
    });


    // Esc 키로 카드 설명 닫기
    cards.on("keydown", function (event) {

        if (event.key === "Escape") {
            event.preventDefault();
            closeDetails();
        }
    });


    // 처음에는 전체 카테고리 표시
    showCategory(0);
});

// 회전하는 동고리 메뉴
$(function () {

    var section = $("#donggori_rotate");

    // 해당 콘텐츠가 없으면 실행하지 않음
    if (section.length === 0) {
        return;
    }

    var wheel = section.find(".rotate_wheel");
    var items = section.find(".rotate_item");
    var descriptions = section.find(".rotate_description");

    var count = items.length;

    // 이미지와 설명의 개수가 같아야 정상 실행
    if (count === 0 || descriptions.length !== count) {
        return;
    }

    // 도시락 사이의 각도
    // 도시락 5개라면 360 ÷ 5 = 72도
    var angleStep = 360 / count;

    // 현재 선택된 도시락 번호
    var currentIndex = 0;

    // 전체 회전 각도
    var rotation = 0;
    var autoDirection = 1; // 1: 반시계, -1: 시계. 마지막 수동 이동 방향을 유지

    // 이동 중인지 확인
    var moving = false;
    var drag = null;
    var rotationAnimation;
    var suppressClick = false;


    var timer;

    // 이동 시간: 0.9초
    var moveTime = 900;

    // 이동을 마친 뒤 머무르는 시간: 3초 (클릭 이동 후에도 동일)
    var waitTime = 3000;

    // 사용자가 움직임 줄이기를 설정했다면 자동 재생을 멈춘 상태로 시작
    var reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) {
        moveTime = 0;

    }

    // 회전 궤도의 가로 / 세로 반지름
    var radiusX;
    var radiusY;

    function measureWheel() {
        // contain으로 표시된 쟁반에 맞춰 원형 궤도를 사용
        radiusX = Math.min(wheel.width(), wheel.height()) * 0.43;
        radiusY = radiusX;
    }

    // 현재 회전 각도에 맞춰 도시락 배치
    function drawItems() {

        items.each(function (index) {

            // 180도는 원의 왼쪽 위치
            // 첫 도시락이 설명 카드 옆에서 시작하도록 설정
            var degree = 180 + angleStep * index + rotation;

            // 삼각함수 계산을 위해 각도를 라디안으로 변환
            var radian = degree * Math.PI / 180;

            // 원형 궤도 위의 가로 / 세로 위치 계산
            var x = Math.cos(radian) * radiusX;
            var y = Math.sin(radian) * radiusY;

            // 왼쪽 주인공 위치에 가까워질수록 값이 1에 가까워짐
            var emphasis = Math.pow(
                Math.max(0, -Math.cos(radian)),
                8
            );

            // 작은 도시락은 0.8배, 주인공은 1.85배
            var scale = 0.8 + emphasis * 1.05;

            $(this).css({
                transform:
                    "translate(-50%, -50%) " +
                    "translate(" + x + "px, " + y + "px) " +
                    "scale(" + scale + ")",

                // 커진 도시락이 다른 도시락보다 앞에 보이도록 설정
                zIndex: Math.round(10 + emphasis * 10)
            });
        });
    }

    // 설명 / 선택 상태 / 현재 번호 변경
    function showDescription(index) {

        descriptions
            .prop("hidden", true)
            .eq(index)
            .prop("hidden", false);

        items
            .removeClass("is-active")
            .attr("aria-pressed", "false");

        items.eq(index)
            .addClass("is-active")
            .attr("aria-pressed", "true");

    }

    // 다음 자동 이동 예약
    function scheduleNext() {

        clearTimeout(timer);

        if (reduceMotion || moving || drag || count < 2 || document.hidden) {
            return;
        }

        timer = setTimeout(function () {
            moveBy(autoDirection);
        }, waitTime);
    }

    // steps만큼 이동
    // 양수: 반시계 방향 / 음수: 시계 방향
    function moveBy(steps) {

        if (moving || drag || steps === 0) {
            return;
        }

        clearTimeout(timer);
        moving = true;

        var nextIndex =
            ((currentIndex + steps) % count + count) % count;

        // 각도를 줄이면 화면에서 반시계 방향으로 회전
        var targetRotation = rotation - angleStep * steps;

        animateRotation(targetRotation, nextIndex);
    }

    // 클릭, 자동 회전, 드래그 후 정렬에서 공통으로 사용
    function animateRotation(targetRotation, nextIndex) {
        clearTimeout(timer);
        moving = true;
        // 이동 중에는 기존 설명을 유지하고 도착하면 교체

        // 숫자 값을 애니메이션으로 바꾸면서 위치를 다시 계산
        rotationAnimation = $({ angle: rotation });
        rotationAnimation.animate(
            { angle: targetRotation },
            {
                duration: moveTime,
                easing: "swing",

                step: function (value) {
                    rotation = value;
                    drawItems();
                },

                complete: function () {

                    // 반복해도 각도가 지나치게 커지지 않도록 정리
                    rotation = targetRotation % 360;
                    currentIndex = nextIndex;

                    drawItems();
                    showDescription(currentIndex);

                    moving = false;
                    scheduleNext();
                }
            }
        );
    }

    // 도시락을 클릭하면 가까운 방향으로 주인공 위치까지 이동
    items.on("click", function () {

        if (moving || drag || suppressClick) {
            return;
        }

        var clickedIndex = items.index(this);

        // 클릭한 도시락까지 가장 짧은 방향으로 이동
        var steps = (clickedIndex - currentIndex + count) % count;
        if (steps > count / 2) {
            steps -= count; // 음수이면 반대 방향으로 되돌아가기
        }

        if (steps === 0) {
            scheduleNext();
            return;
        }

        autoDirection = steps > 0 ? 1 : -1;
        moveBy(steps);
    });

    // 마우스를 누른 채 좌우로 움직이는 만큼 연속 회전
    wheel[0].addEventListener("pointerdown", function (event) {
        if (event.pointerType !== "mouse" || event.button !== 0 || drag) return;
        clearTimeout(timer);
        suppressClick = false;
        var interrupted = moving;
        if (rotationAnimation) rotationAnimation.stop(true, false);
        moving = false;
        drag = {
            id: event.pointerId,
            x: event.clientX,
            y: event.clientY,
            lastX: event.clientX,
            interrupted: interrupted,
            moved: false
        };
    });

    window.addEventListener("pointermove", function (event) {
        if (!drag || event.pointerId !== drag.id) return;
        // 작은 손떨림은 드래그로 처리하지 않아 기존 클릭 유지
        if (!drag.moved && Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < 6) return;
        if (!drag.moved) {
            drag.moved = true;
            suppressClick = true;
            wheel[0].setPointerCapture(drag.id);
            wheel.addClass("is-dragging");
        }
        event.preventDefault();
        // 1px 이동마다 0.35도 회전. 누른 상태에서는 횟수 제한 없이 계속 반영
        var deltaX = event.clientX - drag.lastX;
        rotation += deltaX * 0.35;
        // 오른쪽 드래그는 시계 방향, 왼쪽 드래그는 반시계 방향
        if (deltaX !== 0) autoDirection = deltaX > 0 ? -1 : 1;
        drag.lastX = event.clientX;
        drawItems();
    });

    function finishDrag(event) {
        if (!drag || (event.pointerId !== undefined && event.pointerId !== drag.id)) return;
        var ended = drag;
        drag = null;
        wheel.removeClass("is-dragging");
        if (wheel[0].hasPointerCapture(ended.id)) wheel[0].releasePointerCapture(ended.id);
        if (ended.moved || ended.interrupted) {
            // 손을 놓으면 가장 가까운 도시락을 왼쪽 주인공 위치에 맞춤
            var slot = Math.round(rotation / angleStep);
            animateRotation(slot * angleStep, ((-slot % count) + count) % count);
        } else {
            scheduleNext();
        }
    }
    window.addEventListener("pointerup", finishDrag);
    window.addEventListener("pointercancel", finishDrag);
    window.addEventListener("blur", finishDrag);
    wheel[0].addEventListener("lostpointercapture", finishDrag);
    wheel[0].addEventListener("dragstart", function (event) {
        event.preventDefault(); // 이미지 자체를 끄는 브라우저 기본 동작 방지
    });
    wheel[0].addEventListener("click", function (event) {
        // 드래그를 끝내며 발생한 클릭으로 도시락이 다시 이동하지 않도록 함
        if (suppressClick && event.detail !== 0) {
            event.preventDefault();
            event.stopImmediatePropagation();
            suppressClick = false;
        } else if (event.detail === 0) {
            suppressClick = false; // 키보드 클릭은 허용
        }
    }, true);

    // 다른 브라우저 탭을 보고 있을 때는 자동 이동 중지
    $(document).on("visibilitychange", function () {
        scheduleNext();
    });

    // 화면 크기가 바뀌면 회전 위치 다시 계산
    $(window).on("resize", function () {
        measureWheel();
        drawItems();
    });

    // HTML의 제목을 사용해 잘못 복사된 도시락 버튼 이름도 맞춤
    items.each(function (index) {
        $(this).attr("aria-label", descriptions.eq(index).find("h2").text().trim() + " 선택");
    });

    // 최초 실행
    measureWheel();
    drawItems();
    showDescription(0);

    scheduleNext();
});
// ================= 세 번째 콘텐츠 이후 =================
$(function () {
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    // data-aos="fade-right" / "fade-left": 외부 AOS 파일 없이 방향 효과 적용.
    // JS가 실행되지 않더라도 콘텐츠는 기본적으로 보이도록 설계합니다.
    var revealItems = document.querySelectorAll('#event [data-aos]');
    if ('IntersectionObserver' in window && !reducedMotion.matches) {
        var revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('aos-animate');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });
        revealItems.forEach(function (item) {
            item.classList.add('reveal_ready');
            revealObserver.observe(item);
        });
    }

    // 네 번째 콘텐츠: 페이지 스크롤 거리를 도시락 목록 이동에 연결합니다.
    // 처음과 마지막에 여유 스크롤 구간을 두고, 마지막 여유 구간까지 지나면 고정이 풀립니다.
    var specialtySection = document.querySelector('#local_specialty');
    var specialtyList = document.querySelector('.specialty_scroll');
    if (specialtySection && specialtyList) {
        var pin = document.createElement('div');
        pin.className = 'specialty_pin';
        while (specialtySection.firstChild) pin.appendChild(specialtySection.firstChild);
        specialtySection.appendChild(pin);
        specialtySection.classList.add('specialty_pinned');

        var travel = 0;
        // 첫 메뉴와 마지막 메뉴에서 화면을 유지하는 추가 스크롤 거리(px).
        // 더 오래 머무르게 하려면 아래 숫자를 키우세요.
        var holdBefore = 240;
        var holdAfter = 320;
        var scrollFrame = 0;
        var measureFrame = 0;
        function sectionStart() {
            return specialtySection.getBoundingClientRect().top + window.scrollY;
        }
        function syncSpecialty() {
            scrollFrame = 0;
            var progress = Math.max(0, Math.min(travel, window.scrollY - sectionStart() - holdBefore));
            specialtyList.scrollTop = progress;
        }
        function queueSpecialtyScroll() {
            if (!scrollFrame) scrollFrame = requestAnimationFrame(syncSpecialty);
        }
        function measureSpecialty() {
            measureFrame = 0;
            travel = Math.max(0, specialtyList.scrollHeight - specialtyList.clientHeight);
            // 추가 스크롤 거리만큼 섹션을 늘려 다음 콘텐츠와 겹치지 않도록 합니다.
            specialtySection.style.height = (pin.offsetHeight + holdBefore + travel + holdAfter) + 'px';
            syncSpecialty();
        }
        function queueSpecialtyMeasure() {
            if (!measureFrame) measureFrame = requestAnimationFrame(measureSpecialty);
        }
        window.addEventListener('scroll', queueSpecialtyScroll, { passive: true });
        window.addEventListener('resize', queueSpecialtyMeasure);
        window.addEventListener('load', queueSpecialtyMeasure);
        specialtySection.querySelectorAll('img').forEach(function (image) {
            image.addEventListener('load', queueSpecialtyMeasure);
        });
        if ('ResizeObserver' in window) {
            var specialtyObserver = new ResizeObserver(queueSpecialtyMeasure);
            specialtyObserver.observe(pin);
            specialtyObserver.observe(specialtyList);
            specialtyObserver.observe(specialtySection.querySelector('.specialty_list'));
        }
        if (document.fonts) document.fonts.ready.then(queueSpecialtyMeasure);
        // Tab으로 화면 밖의 메뉴를 선택해도 해당 메뉴가 보이도록 페이지 진행도를 맞춤.
        specialtyList.addEventListener('focusin', function (event) {
            var link = event.target.closest('a');
            if (!link) return;
            var listRect = specialtyList.getBoundingClientRect();
            var linkRect = link.getBoundingClientRect();
            var itemTop = linkRect.top - listRect.top + specialtyList.scrollTop;
            var progress = Math.max(0, Math.min(travel, itemTop));
            window.scrollTo({ top: sectionStart() + holdBefore + progress, behavior: 'instant' });
            syncSpecialty();
        });
        measureSpecialty();
    }

    // 새 영역의 임시 # 링크만 상단 점프를 막습니다.
    // 실제 주소를 넣으면 자동으로 정상 이동합니다.
    $('.home_addition').on('click', 'a[href="#"]', function (event) {
        event.preventDefault();
    });

    // 두 가로 영역이 같은 함수를 사용합니다.
    $('.continuous_flow').each(function () {
        var viewport = this;
        var track = viewport.querySelector('.flow_track');
        var originals = Array.from(track.children);
        var button = $(viewport).closest('section').find('.flow_toggle');
        var speed = Number(viewport.dataset.speed) || 40; // 초당 이동 거리(px)
        var enlarge = viewport.dataset.enlarge === 'true';
        var items = [];
        var width = 0, cardWidth = 0, step = 0, span = 0, offset = 0;
        var paused = reducedMotion.matches;
        var focused = false, visible = true, drag = null, suppressClick = false;
        var previousTime = 0;
        if (!originals.length) return;

        function modulo(value, divisor) {
            return ((value % divisor) + divisor) % divisor;
        }
        function updateButton() {
            button.text(paused ? '자동 이동 재생' : '자동 이동 정지')
                .attr('aria-pressed', String(paused));
        }
        function measure() {
            var oldStep = step;
            var computed = getComputedStyle(viewport);
            width = viewport.clientWidth;
            cardWidth = parseFloat(computed.getPropertyValue('--flow-card-width')) || 310;
            step = cardWidth + (parseFloat(computed.getPropertyValue('--flow-gap')) || 100);
            if (oldStep) offset = offset / oldStep * step;
            track.querySelectorAll('[data-flow-copy]').forEach(function (copy) { copy.remove(); });
            // 화면 양끝 밖에도 충분한 카드를 확보하여 넓은 화면에서도 빈틈 없이 반복.
            var repeats = Math.max(1, Math.ceil((width + step * 4) / (originals.length * step)));
            for (var repeat = 1; repeat < repeats; repeat++) {
                originals.forEach(function (original) {
                    var copy = original.cloneNode(true);
                    copy.dataset.flowCopy = 'true';
                    copy.setAttribute('aria-hidden', 'true');
                    copy.setAttribute('tabindex', '-1');
                    track.appendChild(copy);
                });
            }
            items = Array.from(track.children);
            span = items.length * step;
            offset = modulo(offset, span);
            viewport.classList.add('flow_ready');
            draw();
        }
        function draw() {
            if (!span) return;
            items.forEach(function (item, index) {
                // 위치가 화면 밖으로 나간 뒤 반대편 화면 밖에 다시 배치.
                var x = modulo(index * step - offset + step, span) - step;
                var distance = Math.abs(x + cardWidth / 2 - width / 2);
                var weight = Math.max(0, 1 - distance / (step * 1.05));
                // 중앙에서 최대 1.55배. 속도는 줄이지 않아 멈추지 않고 흐릅니다.
                var scale = enlarge ? 0.84 + 0.71 * weight * weight : 1;
                item.style.transform = 'translate3d(' + x + 'px, -50%, 0) scale(' + scale + ')';
                item.style.zIndex = String(Math.round(weight * 10));
            });
        }
        function frame(time) {
            var elapsed = previousTime ? Math.min((time - previousTime) / 1000, 0.05) : 0;
            previousTime = time;
            if (visible && !document.hidden && !paused && !focused && !drag) {
                offset = modulo(offset + speed * elapsed, span);
                draw();
            }
            requestAnimationFrame(frame);
        }
        button.on('click', function () { paused = !paused; updateButton(); });
        $(viewport).on('focusin', '.flow_item', function () {
            focused = true;
            var index = items.indexOf(this);
            // 키보드로 선택한 링크가 항상 화면 가운데 오도록 이동.
            offset = modulo(index * step - (width - cardWidth) / 2, span);
            draw();
        });
        $(viewport).on('focusout', function () {
            setTimeout(function () { focused = viewport.contains(document.activeElement); }, 0);
        });
        viewport.addEventListener('keydown', function (event) {
            if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
            event.preventDefault();
            var current = originals.indexOf(document.activeElement);
            var direction = event.key === 'ArrowRight' ? 1 : -1;
            originals[modulo(current + direction, originals.length)].focus({ preventScroll: true });
        });
        viewport.addEventListener('pointerdown', function (event) {
            if (event.button !== 0 || drag) return;
            suppressClick = false;
            drag = { id: event.pointerId, x: event.clientX, y: event.clientY, lastX: event.clientX, moved: false };
        });
        window.addEventListener('pointermove', function (event) {
            if (!drag || drag.id !== event.pointerId) return;
            var dx = event.clientX - drag.x, dy = event.clientY - drag.y;
            if (!drag.moved) {
                if (event.pointerType !== 'mouse' && Math.abs(dy) > Math.abs(dx) + 6) { drag = null; return; }
                if (Math.abs(dx) < 6) return;
                drag.moved = true;
                suppressClick = true;
                viewport.classList.add('is-dragging');
                viewport.setPointerCapture(drag.id);
            }
            event.preventDefault();
            offset = modulo(offset - (event.clientX - drag.lastX), span);
            drag.lastX = event.clientX;
            draw();
        }, { passive: false });
        function finishDrag(event) {
            if (!drag || (event.pointerId !== undefined && event.pointerId !== drag.id)) return;
            var id = drag.id;
            drag = null;
            viewport.classList.remove('is-dragging');
            if (viewport.hasPointerCapture(id)) viewport.releasePointerCapture(id);
        }
        window.addEventListener('pointerup', finishDrag);
        window.addEventListener('pointercancel', finishDrag);
        window.addEventListener('blur', finishDrag);
        viewport.addEventListener('lostpointercapture', finishDrag);
        viewport.addEventListener('dragstart', function (event) { event.preventDefault(); });
        viewport.addEventListener('click', function (event) {
            if (suppressClick && event.detail !== 0) {
                event.preventDefault();
                event.stopImmediatePropagation();
            }
            suppressClick = false;
        }, true);
        if ('IntersectionObserver' in window) {
            new IntersectionObserver(function (entries) {
                visible = entries[0].isIntersecting;
            }).observe(viewport);
        }
        if ('ResizeObserver' in window) new ResizeObserver(measure).observe(viewport);
        else $(window).on('resize', measure);
        reducedMotion.addEventListener('change', function (event) {
            paused = event.matches;
            updateButton();
        });
        measure();
        updateButton();
        requestAnimationFrame(frame);
    });
});
