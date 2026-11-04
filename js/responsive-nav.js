
/* 동고리 모바일 메뉴 제어 */
(function () {
    "use strict";

    function initMobileMenu() {

        const toggle = document.querySelector(
            ".mobile-menu-toggle"
        );

        const nav = document.querySelector("#nav");

        if (!toggle || !nav) return;

        const mobile = window.matchMedia(
            "(max-width: 768px)"
        );

        // 메뉴 열기 / 닫기
        function setOpen(open) {

            const isOpen = open && mobile.matches;

            nav.classList.toggle("is-open", isOpen);

            toggle.setAttribute(
                "aria-expanded",
                String(isOpen)
            );

            toggle.setAttribute(
                "aria-label",
                isOpen ? "전체 메뉴 닫기" : "전체 메뉴 열기"
            );

            document.body.classList.toggle(
                "mobile-nav-open",
                isOpen
            );

            // 닫힌 메뉴에 키보드 포커스가 가지 않도록 설정
            nav.inert = mobile.matches && !isOpen;
        }

        // 처음에는 닫힌 상태
        setOpen(false);

        // 햄버거 버튼 클릭
        toggle.addEventListener("click", function () {

            const isOpen =
                toggle.getAttribute("aria-expanded") === "true";

            setOpen(!isOpen);
        });

        // 메뉴 링크 클릭 시 닫기
        nav.addEventListener("click", function (event) {

            if (event.target.closest(".gnb a")) {
                setOpen(false);
            }
        });

        // ESC 키로 닫기
        document.addEventListener("keydown", function (event) {

            if (
                event.key === "Escape" &&
                toggle.getAttribute("aria-expanded") === "true"
            ) {
                setOpen(false);
                toggle.focus();
            }
        });

        // 메뉴 바깥 클릭 시 닫기
        document.addEventListener("pointerdown", function (event) {

            const isOpen =
                toggle.getAttribute("aria-expanded") === "true";

            if (
                isOpen &&
                !nav.contains(event.target) &&
                !toggle.contains(event.target)
            ) {
                setOpen(false);
            }
        });

        // 모바일에서 PC로 넘어갈 때 메뉴 초기화
        mobile.addEventListener("change", function () {
            setOpen(false);
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initMobileMenu
        );
    } else {
        initMobileMenu();
    }

})();
