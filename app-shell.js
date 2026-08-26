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
            const isHero = image.classList.contains("hero-img") ||
                image.classList.contains("brand-logo") ||
                image.hasAttribute("data-hero") ||
                image.closest(".hero, .hero-section, .landing-hero, .hero-visual, .header-banner, .daerah-banner") ||
                image.getAttribute("fetchpriority") === "high";

            if (isHero) {
                image.loading = "eager";
                image.setAttribute("fetchpriority", "high");
            } else if (!image.hasAttribute("loading")) {
                image.loading = "lazy";
            }
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

    let lastFocusedElement = null;

    function trackLastFocus(e) {
        if (e.target && e.target !== document.body && !e.target.closest('[role="dialog"], .modal, .lms-modal, .mobile-menu-drawer')) {
            lastFocusedElement = e.target;
        }
    }
    document.addEventListener("focusin", trackLastFocus, { passive: true });

    function improveKeyboardEscape() {
        document.addEventListener("keydown", (event) => {
            if (event.key !== "Escape") return;
            const visibleDialog = [...document.querySelectorAll('[role="dialog"], .modal, .modal-overlay, .lms-modal, .confirm-modal, .concept-modal, .review-modal-overlay, .pro-paywall-modal, .mobile-menu-overlay.is-active, #commandPalette:not([hidden])')]
                .find((dialog) => {
                    if (dialog.hasAttribute("hidden") || dialog.style.display === "none") return false;
                    const rect = dialog.getBoundingClientRect();
                    return rect.width > 0 && rect.height > 0;
                });
            if (!visibleDialog) return;
            const close = visibleDialog.querySelector('[aria-label*="Tutup"], .modal-close, .lms-modal-close, .pro-paywall-close, .quiz-dialog-cancel, .btn-close, .close-btn');
            if (close) {
                close.click();
            } else if (visibleDialog.classList.contains("is-active")) {
                visibleDialog.classList.remove("is-active");
            } else if (visibleDialog.id === "commandPalette") {
                visibleDialog.setAttribute("hidden", "true");
            }
            if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
                window.setTimeout(() => lastFocusedElement.focus(), 50);
            }
        });
    }

    function setupFocusTrap() {
        document.addEventListener("keydown", (e) => {
            if (e.key !== "Tab") return;
            const activeModal = [...document.querySelectorAll('[role="dialog"], .modal.is-active, .lms-modal.is-active, .modal-overlay.is-active, .mobile-menu-overlay.is-active')]
                .find(el => el.offsetParent !== null && !el.hasAttribute("hidden"));
            if (!activeModal) return;

            const focusables = [...activeModal.querySelectorAll('a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])')]
                .filter(el => el.offsetParent !== null);
            if (focusables.length === 0) return;

            const first = focusables[0];
            const last = focusables[focusables.length - 1];

            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        });
    }

    function repairAccessibilityLabels() {
        // Icon-only buttons accessibility
        document.querySelectorAll("button, a[role='button']").forEach(btn => {
            const hasText = btn.textContent.trim().length > 0;
            const hasAria = btn.hasAttribute("aria-label") || btn.hasAttribute("aria-labelledby") || btn.hasAttribute("title");
            if (!hasText && !hasAria) {
                const icon = btn.querySelector("i, svg");
                if (icon) {
                    const iconClasses = icon.className || "";
                    if (iconClasses.includes("fa-moon") || iconClasses.includes("fa-sun")) {
                        btn.setAttribute("aria-label", "Ganti tema visual");
                    } else if (iconClasses.includes("fa-xmark") || iconClasses.includes("fa-times") || iconClasses.includes("fa-close")) {
                        btn.setAttribute("aria-label", "Tutup");
                    } else if (iconClasses.includes("fa-bars")) {
                        btn.setAttribute("aria-label", "Buka menu navigasi");
                    } else if (iconClasses.includes("fa-magnifying-glass") || iconClasses.includes("fa-search")) {
                        btn.setAttribute("aria-label", "Cari konten");
                    } else if (iconClasses.includes("fa-volume") || iconClasses.includes("fa-music")) {
                        btn.setAttribute("aria-label", "Pengaturan suara");
                    } else if (iconClasses.includes("fa-arrow-up")) {
                        btn.setAttribute("aria-label", "Kembali ke atas");
                    } else if (iconClasses.includes("fa-arrow-left")) {
                        btn.setAttribute("aria-label", "Kembali");
                    } else if (iconClasses.includes("fa-copy")) {
                        btn.setAttribute("aria-label", "Salin teks");
                    } else if (iconClasses.includes("fa-play")) {
                        btn.setAttribute("aria-label", "Putar");
                    } else {
                        btn.setAttribute("aria-label", "Tombol aksi");
                    }
                }
            }
        });

        // Form controls accessibility
        document.querySelectorAll("input, select, textarea").forEach(input => {
            if (input.type === "hidden") return;
            const hasLabel = input.id && document.querySelector(`label[for="${input.id}"]`);
            const wrappedInLabel = input.closest("label");
            const hasAria = input.hasAttribute("aria-label") || input.hasAttribute("aria-labelledby");
            if (!hasLabel && !wrappedInLabel && !hasAria) {
                const placeholder = input.getAttribute("placeholder") || input.name || "Input";
                input.setAttribute("aria-label", placeholder);
            }
        });

        // Tabs accessibility
        document.querySelectorAll(".tab-list, .tabs-nav, .hub-tabs, [role='tablist']").forEach(tablist => {
            if (!tablist.getAttribute("role")) tablist.setAttribute("role", "tablist");
            tablist.querySelectorAll("button, a").forEach(tab => {
                if (!tab.getAttribute("role")) tab.setAttribute("role", "tab");
                const isActive = tab.classList.contains("active") || tab.classList.contains("is-active") || tab.getAttribute("aria-current") === "true";
                tab.setAttribute("aria-selected", isActive ? "true" : "false");
                tab.setAttribute("tabindex", isActive ? "0" : "-1");
            });
        });

        // Mobile drawer hamburger
        document.querySelectorAll(".nav-hamburger, .menu-toggle").forEach(toggle => {
            if (!toggle.getAttribute("aria-expanded")) toggle.setAttribute("aria-expanded", "false");
            if (!toggle.getAttribute("aria-controls")) toggle.setAttribute("aria-controls", "mobileMenuDrawer");
            toggle.addEventListener("click", () => {
                const expanded = toggle.getAttribute("aria-expanded") === "true";
                toggle.setAttribute("aria-expanded", String(!expanded));
            });
        });

        // Table wrappers
        document.querySelectorAll("table").forEach(table => {
            if (!table.parentElement.classList.contains("table-responsive") && !table.parentElement.classList.contains("table-container")) {
                const wrapper = document.createElement("div");
                wrapper.className = "table-responsive";
                table.parentNode.insertBefore(wrapper, table);
                wrapper.appendChild(table);
            }
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

    function showPwaUpdateBanner(registration) {
        if (document.getElementById("pwaUpdateBanner")) return;
        const banner = document.createElement("aside");
        banner.id = "pwaUpdateBanner";
        banner.className = "pwa-update-toast";
        banner.setAttribute("role", "alert");
        banner.setAttribute("aria-live", "assertive");
        banner.innerHTML = `
            <div class="pwa-update-content">
                <span class="pwa-update-icon"><i class="fa-solid fa-cloud-arrow-down" aria-hidden="true"></i></span>
                <div class="pwa-update-text">
                    <strong>Versi Baru Tersedia</strong>
                    <p>Pembaruan sistem siap digunakan untuk pengalaman belajar lebih cepat.</p>
                </div>
            </div>
            <div class="pwa-update-actions">
                <button type="button" class="pwa-update-btn-refresh" id="pwaReloadBtn">Perbarui</button>
                <button type="button" class="pwa-update-btn-dismiss" id="pwaDismissBtn" aria-label="Tutup notifikasi"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
            </div>
        `;
        document.body.appendChild(banner);

        document.getElementById("pwaReloadBtn")?.addEventListener("click", () => {
            if (registration.waiting) {
                registration.waiting.postMessage({ type: "SKIP_WAITING" });
            } else {
                window.location.reload();
            }
        });

        document.getElementById("pwaDismissBtn")?.addEventListener("click", () => {
            banner.remove();
        });
    }

    function registerServiceWorker() {
        if (isLocal || !("serviceWorker" in navigator)) return;
        window.addEventListener("load", () => {
            navigator.serviceWorker.register("sw.js").then((reg) => {
                // If a worker is already waiting, prompt immediately
                if (reg.waiting && navigator.serviceWorker.controller) {
                    showPwaUpdateBanner(reg);
                }

                reg.addEventListener("updatefound", () => {
                    const newWorker = reg.installing;
                    if (!newWorker) return;
                    newWorker.addEventListener("statechange", () => {
                        if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                            showPwaUpdateBanner(reg);
                        }
                    });
                });
            }).catch(() => {});

            let isRefreshing = false;
            navigator.serviceWorker.addEventListener("controllerchange", () => {
                if (!isRefreshing) {
                    isRefreshing = true;
                    window.location.reload();
                }
            });
        });
    }

    function ensureSyncEngine() {
        if (!window.SyncEngine && !document.querySelector('script[src*="sync-engine.js"]')) {
            const script = document.createElement("script");
            script.src = "sync-engine.js";
            script.async = true;
            document.head.appendChild(script);
        }
    }

    function ensureActivityService() {
        if (!window.ActivityService && !document.querySelector('script[src*="activity-service.js"]')) {
            const script = document.createElement("script");
            script.src = "activity-service.js";
            script.async = true;
            document.head.appendChild(script);
        }
    }

    function setupActivityBusListeners() {
        window.addEventListener("uot:activity", (e) => {
            if (e.detail?.feedback?.title && typeof window.showToast === "function") {
                const fb = e.detail.feedback;
                if (fb.xpAwarded || fb.coinsAwarded) {
                    window.showToast(`✨ ${fb.title}: +${fb.xpAwarded || 0} XP ${fb.coinsAwarded ? `· +${fb.coinsAwarded} Coins` : ""}`);
                }
            }
        });
    }

    document.addEventListener("DOMContentLoaded", () => {
        setCanonical();
        ensureMetadata();
        installSkipLink();
        installConnectionStatus();
        ensureSyncEngine();
        ensureActivityService();
        setupActivityBusListeners();
        improveMediaLoading();
        repairVisualPlaceholders();
        markCurrentNavigation();
        improveKeyboardEscape();
        setupFocusTrap();
        repairAccessibilityLabels();
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
        new MutationObserver(() => {
            document.querySelectorAll(".theme-toggle-btn").forEach(setThemeIcon);
            repairAccessibilityLabels();
        }).observe(document.body, { attributes: true, attributeFilter: ["class"] });
        new MutationObserver(() => {
            enhanceEmptyStates();
            repairAccessibilityLabels();
        }).observe(document.body, { childList: true, subtree: true });
    });
    registerServiceWorker();
    if (!window.QuizNation) {
        window.QuizNation = { track };
    } else if (Object.isExtensible(window.QuizNation)) {
        window.QuizNation.track = track;
    }
})();
