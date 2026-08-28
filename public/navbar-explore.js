/* ========================================================================== */
/* Universe of Tech - Canonical Navbar & Dropdown Controller                  */
/* Manages the "Belajar" dropdown, search autocomplete, mobile drawer, & auth */
/* ========================================================================== */
(() => {
    "use strict";

    const dropdownMarkup = `
        <button class="nav-dropdown-trigger" id="navBelajarTrigger" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="navBelajarMenu">
            <span>Belajar</span>
            <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
        </button>
        <div class="nav-mega-menu" id="navBelajarMenu" role="menu" aria-label="Menu Belajar & Latihan">
            <div class="nav-mega-group">
                <span class="nav-mega-heading">Jalur &amp; Materi</span>
                <a href="learning-journey.html" class="nav-mega-item" role="menuitem">
                    <span class="nav-mega-icon"><i class="fa-solid fa-compass" aria-hidden="true"></i></span>
                    <div class="nav-mega-text">
                        <span class="nav-mega-title">Learning Journey</span>
                        <span class="nav-mega-desc">Roadmap personal &amp; target harian</span>
                    </div>
                </a>
                <a href="materi.html" class="nav-mega-item" role="menuitem">
                    <span class="nav-mega-icon"><i class="fa-solid fa-book-open" aria-hidden="true"></i></span>
                    <div class="nav-mega-text">
                        <span class="nav-mega-title">Semua Materi</span>
                        <span class="nav-mega-desc">Katalog modul tech terstruktur</span>
                    </div>
                </a>
                <a href="materi-basic.html?topik=programming" class="nav-mega-item" role="menuitem">
                    <span class="nav-mega-icon"><i class="fa-solid fa-code" aria-hidden="true"></i></span>
                    <div class="nav-mega-text">
                        <span class="nav-mega-title">Dasar Pemrograman</span>
                        <span class="nav-mega-desc">Logika, variabel, dan algoritma</span>
                    </div>
                </a>
            </div>
            <div class="nav-mega-group">
                <span class="nav-mega-heading">Latihan &amp; Eksplorasi</span>
                <a href="quiz.html" class="nav-mega-item" role="menuitem">
                    <span class="nav-mega-icon"><i class="fa-solid fa-circle-question" aria-hidden="true"></i></span>
                    <div class="nav-mega-text">
                        <span class="nav-mega-title">Quiz &amp; Latihan</span>
                        <span class="nav-mega-desc">Uji pemahaman dengan feedback cepat</span>
                    </div>
                </a>
                <a href="snbt.html" class="nav-mega-item" role="menuitem">
                    <span class="nav-mega-icon"><i class="fa-solid fa-graduation-cap" aria-hidden="true"></i></span>
                    <div class="nav-mega-text">
                        <span class="nav-mega-title">Persiapan SNBT</span>
                        <span class="nav-mega-desc">Simulasi UTBK &amp; penalaran umum</span>
                    </div>
                </a>
                <a href="tka-lms.html" class="nav-mega-item" role="menuitem">
                    <span class="nav-mega-icon"><i class="fa-solid fa-pen-to-square" aria-hidden="true"></i></span>
                    <div class="nav-mega-text">
                        <span class="nav-mega-title">Persiapan TKA</span>
                        <span class="nav-mega-desc">Tes kemampuan akademik terarah</span>
                    </div>
                </a>
                <a href="bahasa-daerah.html" class="nav-mega-item" role="menuitem">
                    <span class="nav-mega-icon"><i class="fa-solid fa-map-location-dot" aria-hidden="true"></i></span>
                    <div class="nav-mega-text">
                        <span class="nav-mega-title">Bahasa &amp; Budaya</span>
                        <span class="nav-mega-desc">Kekayaan nusantara interaktif</span>
                    </div>
                </a>
            </div>
        </div>
    `;

    function initNavbarDropdown() {
        const dropdownWrapper = document.querySelector(".nav-dropdown-wrapper");
        if (dropdownWrapper && !dropdownWrapper.dataset.initialized) {
            dropdownWrapper.innerHTML = dropdownMarkup;
            dropdownWrapper.dataset.initialized = "true";

            const trigger = dropdownWrapper.querySelector("#navBelajarTrigger");
            const menu = dropdownWrapper.querySelector("#navBelajarMenu");

            if (trigger && menu) {
                const toggleDropdown = (open) => {
                    const isOpen = open !== undefined ? open : !dropdownWrapper.classList.contains("is-open");
                    dropdownWrapper.classList.toggle("is-open", isOpen);
                    trigger.setAttribute("aria-expanded", String(isOpen));
                    menu.classList.toggle("show", isOpen);
                };

                trigger.addEventListener("click", (e) => {
                    e.stopPropagation();
                    toggleDropdown();
                });

                document.addEventListener("click", (e) => {
                    if (!dropdownWrapper.contains(e.target)) {
                        toggleDropdown(false);
                    }
                });

                document.addEventListener("keydown", (e) => {
                    if (e.key === "Escape" && dropdownWrapper.classList.contains("is-open")) {
                        toggleDropdown(false);
                        trigger.focus();
                    }
                });
            }
        }

        // Highlight active navigation link
        const currentPath = window.location.pathname.split("/").pop() || "index.html";
        document.querySelectorAll(".nav-links a, .nav-mega-item, .mobile-menu-links a").forEach((link) => {
            const href = (link.getAttribute("href") || "").split("?")[0].split("#")[0];
            if (href && (href === currentPath || (currentPath === "" && href === "index.html"))) {
                link.classList.add("active");
                link.setAttribute("aria-current", "page");
            }
        });
    }

    function initMobileDrawer() {
        const toggle = document.querySelector("#menuToggle, .nav-hamburger");
        const overlay = document.querySelector("#mobileNav, .mobile-menu-overlay");
        const closeBtn = document.querySelector("#mobileMenuClose, .mobile-menu-close");

        if (!toggle || !overlay) return;

        const openDrawer = () => {
            overlay.classList.add("is-active", "show");
            overlay.removeAttribute("aria-hidden");
            overlay.removeAttribute("inert");
            toggle.setAttribute("aria-expanded", "true");
            document.body.style.overflow = "hidden";
        };

        const closeDrawer = () => {
            overlay.classList.remove("is-active", "show");
            overlay.setAttribute("aria-hidden", "true");
            overlay.setAttribute("inert", "");
            toggle.setAttribute("aria-expanded", "false");
            document.body.style.overflow = "";
        };

        toggle.addEventListener("click", () => {
            if (overlay.classList.contains("is-active") || overlay.classList.contains("show")) {
                closeDrawer();
            } else {
                openDrawer();
            }
        });

        if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) closeDrawer();
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && (overlay.classList.contains("is-active") || overlay.classList.contains("show"))) {
                closeDrawer();
                toggle.focus();
            }
        });
    }

    function initSearchAutocomplete() {
        const searchInput = document.querySelector("#navSearchInput");
        const suggestionsBox = document.querySelector("#searchSuggestionsBox");
        if (!searchInput || !suggestionsBox) return;

        const searchableItems = [
            { title: "Dasar Pemrograman (JavaScript & Logika)", url: "materi-basic.html?topik=programming", category: "Materi" },
            { title: "Web Development (HTML, CSS, DOM)", url: "materi-basic.html?topik=web", category: "Materi" },
            { title: "Database & SQL (Query, Relasi, JOIN)", url: "materi-basic.html?topik=database", category: "Materi" },
            { title: "UI/UX Design Fundamentals", url: "materi-basic.html?topik=design", category: "Materi" },
            { title: "Personal Learning Journey", url: "learning-journey.html", category: "Journey" },
            { title: "Quiz & Evaluasi Adaptif", url: "quiz.html", category: "Latihan" },
            { title: "Proyek Nyata & Portofolio", url: "projects.html", category: "Proyek" },
            { title: "Library & Bookmark Belajar", url: "library.html", category: "Library" },
            { title: "Simulasi & Latihan SNBT UTBK", url: "snbt.html", category: "Persiapan" },
            { title: "Persiapan TKA Akademik", url: "tka-lms.html", category: "Persiapan" },
            { title: "Bahasa Daerah & Budaya Nusantara", url: "bahasa-daerah.html", category: "Budaya" }
        ];

        let debounceTimer;
        searchInput.addEventListener("input", (e) => {
            clearTimeout(debounceTimer);
            const query = e.target.value.trim().toLowerCase();
            if (!query) {
                suggestionsBox.innerHTML = "";
                suggestionsBox.classList.remove("is-active");
                searchInput.setAttribute("aria-expanded", "false");
                return;
            }

            debounceTimer = setTimeout(() => {
                const matches = searchableItems.filter(item => 
                    item.title.toLowerCase().includes(query) || 
                    item.category.toLowerCase().includes(query)
                ).slice(0, 5);

                if (matches.length === 0) {
                    suggestionsBox.innerHTML = `<div style="padding: 10px; color: var(--uot-text-muted); font-size: 12px;">Tidak ada materi untuk "${e.target.value}"</div>`;
                    suggestionsBox.classList.add("is-active");
                    searchInput.setAttribute("aria-expanded", "true");
                    return;
                }

                suggestionsBox.innerHTML = matches.map(item => `
                    <a href="${item.url}" class="search-suggestion-item" role="option">
                        <i class="fa-solid fa-magnifying-glass" style="font-size: 11px; color: var(--uot-primary);" aria-hidden="true"></i>
                        <span>${item.title}</span>
                        <small style="margin-left: auto; color: var(--uot-text-muted); font-size: 10px; text-transform: uppercase;">${item.category}</small>
                    </a>
                `).join("");

                suggestionsBox.classList.add("is-active");
                searchInput.setAttribute("aria-expanded", "true");
            }, 150);
        });

        document.addEventListener("click", (e) => {
            if (!searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
                suggestionsBox.classList.remove("is-active");
                searchInput.setAttribute("aria-expanded", "false");
            }
        });
    }

    function initUserAuthState() {
        try {
            const rawUser = localStorage.getItem("quiznationCurrentUser") || localStorage.getItem("uot_current_user");
            if (rawUser) {
                const user = JSON.parse(rawUser);
                const loginLink = document.querySelector("#navLoginLink");
                if (loginLink && user?.name) {
                    const initials = (user.name || "User").slice(0, 1).toUpperCase();
                    loginLink.outerHTML = `
                        <a class="user-nav-badge" id="navProfileBadge" href="profile.html" aria-label="Profil ${user.name}">
                            <span class="user-nav-avatar">${initials}</span>
                            <span>${user.name.split(" ")[0]}</span>
                        </a>
                    `;
                }
            }
        } catch (_) {}
    }

    function render() {
        initNavbarDropdown();
        initMobileDrawer();
        initSearchAutocomplete();
        initUserAuthState();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", render);
    } else {
        render();
    }

    window.QuizNationExplore = Object.freeze({ render });
})();
