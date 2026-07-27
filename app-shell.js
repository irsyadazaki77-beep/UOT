/* Shared progressive enhancement for QUIZNATION pages. */
(() => {
    "use strict";

    // Load the shared density layer after each page's own styles.
    if (!document.querySelector('link[data-compact-ui]')) {
        const compactUI = document.createElement("link");
        compactUI.rel = "stylesheet";
        compactUI.href = "compact-global.css?v=20260720-neat-polish";
        compactUI.dataset.compactUi = "true";
        document.head.appendChild(compactUI);
    }
    document.body.classList.add("compact-ui");

    const isLocal = /^(localhost|127\.0\.0\.1|::1)$/.test(window.location.hostname);
    const pageUrl = new URL(window.location.href);
    pageUrl.search = "";
    pageUrl.hash = "";

    function setCanonical() {
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement("link");
            canonical.rel = "canonical";
            document.head.appendChild(canonical);
        }
        canonical.href = pageUrl.href;
        if (isLocal) canonical.dataset.environment = "development";
    }

    function ensureMetadata() {
        if (!document.querySelector('meta[name="theme-color"]')) {
            const theme = document.createElement("meta");
            theme.name = "theme-color";
            theme.content = "#2563eb";
            document.head.appendChild(theme);
        }
        const description = document.querySelector('meta[name="description"]');
        if (description && description.content.length > 160) description.content = `${description.content.slice(0, 157)}...`;
        if (!document.querySelector('meta[name="referrer"]')) {
            const referrer = document.createElement("meta");
            referrer.name = "referrer";
            referrer.content = "strict-origin-when-cross-origin";
            document.head.appendChild(referrer);
        }
    }

    function installSkipLink() {
        const target = document.querySelector("main");
        if (!target || document.querySelector(".skip-link")) return;
        if (!target.id) target.id = "main-content";
        const link = document.createElement("a");
        link.className = "skip-link";
        link.href = `#${target.id}`;
        link.textContent = "Lewati ke konten utama";
        document.body.prepend(link);
    }

    function installConnectionStatus() {
        const status = document.createElement("div");
        status.className = "connection-status";
        status.setAttribute("role", "status");
        status.setAttribute("aria-live", "polite");
        document.body.appendChild(status);
        const update = () => {
            const offline = !navigator.onLine;
            status.textContent = offline ? "Anda offline. Perubahan akan tersimpan di perangkat ini." : "Koneksi kembali tersedia.";
            status.classList.toggle("is-visible", offline);
            if (!offline) window.setTimeout(() => status.classList.remove("is-visible"), 2600);
        };
        window.addEventListener("offline", update);
        window.addEventListener("online", update);
        if (!navigator.onLine) update();
    }

    function improveMediaLoading() {
        document.querySelectorAll("img").forEach((image) => {
            image.decoding = "async";
            if (!image.classList.contains("brand-logo") && !image.hasAttribute("loading")) image.loading = "lazy";
        });
    }

    function setThemeIcon(button) {
        const dark = document.body.classList.contains("dark-theme");
        button.innerHTML = `<i class="fa-solid ${dark ? "fa-sun" : "fa-moon"}" aria-hidden="true"></i>`;
        button.setAttribute("aria-label", dark ? "Gunakan tema terang" : "Gunakan tema gelap");
        button.setAttribute("title", dark ? "Tema terang" : "Tema gelap");
    }

    function repairVisualPlaceholders() {
        document.querySelectorAll(".theme-toggle-btn").forEach(setThemeIcon);
        const menuIcons = {
            "materi-basic.html": "fa-code", "materi.html": "fa-laptop-code", "snbt.html": "fa-graduation-cap",
            "tka-lms.html": "fa-pen-to-square", "bahasa-daerah.html": "fa-map-location-dot",
            "learning-path.html": "fa-route", "learning-journey.html": "fa-compass", "leaderboard.html": "fa-trophy", "achievements.html": "fa-medal",
            "profile.html": "fa-user", "payment.html": "fa-crown", "pro-hub.html": "fa-crown",
            "quiz.html": "fa-circle-question", "library.html": "fa-bookmark"
        };
        document.querySelectorAll(".mega-item-link").forEach((link) => {
            const icon = menuIcons[(link.getAttribute("href") || "").split("/").pop().split("?")[0]];
            const box = link.querySelector(".mega-icon-box");
            if (box && icon) box.innerHTML = `<i class="fa-solid ${icon}" aria-hidden="true"></i>`;
        });
        document.querySelectorAll(".empty-icon, .tka-info-card-icon").forEach((element) => {
            if (/^\?+$/.test(element.textContent.trim())) element.innerHTML = '<i class="fa-solid fa-circle-info" aria-hidden="true"></i>';
        });
    }

    function markCurrentNavigation() {
        const current = pageUrl.pathname.split("/").pop() || "index.html";
        document.querySelectorAll(".nav-links a, .mega-item-link").forEach((link) => {
            const href = (link.getAttribute("href") || "").split("?")[0];
            if (href === current) link.setAttribute("aria-current", "page");
        });
    }

    function improveKeyboardEscape() {
        document.addEventListener("keydown", (event) => {
            if (event.key !== "Escape") return;
            const visibleDialog = [...document.querySelectorAll('[role="dialog"][aria-modal="true"]')]
                .find((dialog) => dialog.offsetParent !== null);
            if (!visibleDialog) return;
            const close = visibleDialog.querySelector('[aria-label*="Tutup"], .modal-close, .lms-modal-close, .pro-paywall-close, .quiz-dialog-cancel');
            if (close) close.click();
        });
    }

    function enhanceEmptyStates() {
        document.querySelectorAll(".empty-state").forEach((state) => {
            if (state.querySelector(".empty-state-icon") || !state.textContent.trim()) return;
            const icon = document.createElement("span");
            icon.className = "empty-state-icon";
            icon.setAttribute("aria-hidden", "true");
            icon.innerHTML = '<i class="fa-regular fa-compass"></i>';
            state.prepend(icon);
        });
    }

    function installBackToTop() {
        if (document.querySelector("#backToTop, .back-to-top, .ux-back-to-top")) return;
        const button = document.createElement("button");
        button.className = "ux-back-to-top";
        button.type = "button";
        button.setAttribute("aria-label", "Kembali ke atas");
        button.innerHTML = '<i class="fa-solid fa-arrow-up" aria-hidden="true"></i>';
        button.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
        window.addEventListener("scroll", () => button.classList.toggle("is-visible", window.scrollY > 560), { passive: true });
        document.body.appendChild(button);
    }

    function installSectionNavigation() {
        const main = document.querySelector("main");
        if (!main || document.querySelector(".ux-section-nav")) return;
        const sections = [...main.querySelectorAll("section[id]")]
            .filter((section) => !section.closest(".tab-content:not(.active)") && section.offsetParent !== null)
            .map((section) => ({ section, heading: section.querySelector("h2, h3") }))
            .filter(({ heading }) => heading?.textContent.trim())
            .slice(0, 6);
        if (sections.length < 3) return;
        const nav = document.createElement("nav");
        nav.className = "ux-section-nav";
        nav.setAttribute("aria-label", "Navigasi cepat halaman");
        sections.forEach(({ section, heading }) => {
            const link = document.createElement("a");
            link.href = `#${section.id}`;
            link.textContent = heading.textContent.trim().slice(0, 34);
            nav.appendChild(link);
        });
        const navbar = main.querySelector(".navbar");
        if (navbar) navbar.insertAdjacentElement("afterend", nav);
    }

    function installLearningResume() {
        if (document.body.dataset.page !== "index" || document.querySelector(".ux-resume-card")) return;
        try {
            const progress = JSON.parse(localStorage.getItem("quiznationCurriculumProgress") || "null");
            if (!progress?.lastTrackId || !progress?.lastLessonId) return;
            const card = document.createElement("a");
            card.className = "ux-resume-card";
            card.href = `materi-basic.html?topik=${encodeURIComponent(progress.lastTrackId)}&lesson=${encodeURIComponent(progress.lastLessonId)}`;
            card.innerHTML = '<span class="ux-resume-icon"><i class="fa-solid fa-play" aria-hidden="true"></i></span><span><small>Lanjutkan belajar</small><strong>Sesi terakhir Anda siap dilanjutkan</strong></span><i class="fa-solid fa-arrow-right" aria-hidden="true"></i>';
            const main = document.querySelector("main");
            const navbar = main?.querySelector(".navbar");
            if (navbar) navbar.insertAdjacentElement("afterend", card);
        } catch (_) { /* Resume is optional and must not block the home page. */ }
    }

    function installSearchShortcut() {
        document.addEventListener("keydown", (event) => {
            if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "k") return;
            if (document.querySelector("#commandPalette")) return;
            const search = document.querySelector('#navSearchInput, input[type="search"]');
            if (!search) return;
            event.preventDefault();
            search.focus();
        });
    }

    function track(name, properties = {}) {
        const event = { name, properties, path: pageUrl.pathname, at: new Date().toISOString() };
        window.dispatchEvent(new CustomEvent("quiznation:analytics", { detail: event }));
        try {
            const key = "quiznation_analytics_queue";
            const entries = JSON.parse(localStorage.getItem(key) || "[]");
            entries.push(event);
            localStorage.setItem(key, JSON.stringify(entries.slice(-100)));
        } catch (_) { /* Analytics must never block the learning experience. */ }
    }

    function registerServiceWorker() {
        if (isLocal || !("serviceWorker" in navigator)) return;
        window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
    }

    document.addEventListener("DOMContentLoaded", () => {
        setCanonical();
        ensureMetadata();
        installSkipLink();
        installConnectionStatus();
        improveMediaLoading();
        repairVisualPlaceholders();
        markCurrentNavigation();
        improveKeyboardEscape();
        enhanceEmptyStates();
        installBackToTop();
        installSectionNavigation();
        installLearningResume();
        installSearchShortcut();
        track("page_view", { title: document.title });
        document.addEventListener("click", (event) => {
            const link = event.target.closest("a[href]");
            if (link && !link.matches('[href^="#"]')) track("navigation_click", { href: link.getAttribute("href") });
        });
        new MutationObserver(() => document.querySelectorAll(".theme-toggle-btn").forEach(setThemeIcon))
            .observe(document.body, { attributes: true, attributeFilter: ["class"] });
        new MutationObserver(enhanceEmptyStates)
            .observe(document.body, { childList: true, subtree: true });
    });
    registerServiceWorker();
    if (!window.QuizNation) {
        window.QuizNation = { track };
    } else if (Object.isExtensible(window.QuizNation)) {
        window.QuizNation.track = track;
    }
})();
