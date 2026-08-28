/**
 * Canonical Navbar & Session Manager
 * Merges auth-helper.js and navbar-explore.js into a single robust script.
 */
(function() {
    function initUserSession() {
        try {
            const rawUser = localStorage.getItem("quiznationCurrentUser") || localStorage.getItem("uot_current_user") || localStorage.getItem("eduquestUserSession");
            if (rawUser) {
                const user = JSON.parse(rawUser);
                const userName = user.name || user.username || "User";
                const isLoggedIn = user.isLoggedIn !== false; // handle different session shapes
                const loginLink = document.querySelector("#navLoginLink") || document.querySelector(".nav-actions a[href*='login.html']");
                
                if (loginLink && userName && isLoggedIn) {
                    const initials = userName.slice(0, 1).toUpperCase();
                    const rpg = JSON.parse(localStorage.getItem("eduquestRPG") || "{}");
                    const avatar = rpg.activeAvatar || user.avatar || "";
                    
                    const newBadge = document.createElement("a");
                    newBadge.className = "user-nav-badge";
                    newBadge.id = "navProfileBadge";
                    newBadge.href = "profile.html";
                    newBadge.setAttribute("aria-label", "Profil " + userName);
                    
                    if (avatar && avatar.length <= 4) {
                        newBadge.innerHTML = `<span class="user-nav-avatar" style="background:var(--uot-primary); color:white;">${avatar}</span><span>${userName.split(" ")[0]}</span>`;
                    } else {
                        newBadge.innerHTML = `<span class="user-nav-avatar">${initials}</span><span>${userName.split(" ")[0]}</span>`;
                    }
                    
                    loginLink.replaceWith(newBadge);
                }
            }
        } catch (e) {
            console.error("Session init failed:", e);
        }
    }

    function initNavbarDropdown() {
        const dropdownWrapper = document.querySelector(".nav-dropdown-wrapper");
        if (dropdownWrapper) {
            const trigger = dropdownWrapper.querySelector(".nav-dropdown-trigger");
            const menu = dropdownWrapper.querySelector(".nav-mega-menu") || dropdownWrapper.querySelector(".nav-dropdown-menu");
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
        
        // Active states
        const currentPath = window.location.pathname.split("/").pop() || "index.html";
        document.querySelectorAll(".nav-links a, .nav-mega-item").forEach((link) => {
            const href = (link.getAttribute("href") || "").split("?")[0].split("#")[0];
            if (href && (href === currentPath || (currentPath === "" && href === "index.html"))) {
                link.classList.add("active");
                link.setAttribute("aria-current", "page");
            }
        });
    }

    function initMobileDrawer() {
        const navbar = document.querySelector(".navbar");
        if (!navbar) return;

        let hamburger = document.querySelector(".nav-hamburger");
        if (!hamburger) {
            hamburger = document.createElement("button");
            hamburger.className = "nav-hamburger";
            hamburger.type = "button";
            hamburger.setAttribute("aria-label", "Menu Navigasi");
            hamburger.setAttribute("aria-expanded", "false");
            hamburger.innerHTML = `<i class="fa-solid fa-bars"></i>`;
            
            const navActions = document.querySelector(".nav-actions");
            if (navActions) {
                navbar.insertBefore(hamburger, navActions);
            } else {
                navbar.appendChild(hamburger);
            }
        }

        let overlay = document.querySelector(".mobile-menu-overlay");
        let closeBtn = document.querySelector(".mobile-menu-close");
        let linksContainer;

        if (!overlay) {
            overlay = document.createElement("div");
            overlay.className = "mobile-menu-overlay";
            overlay.id = "mobileNavigationDrawer";
            overlay.setAttribute("aria-hidden", "true");
            overlay.setAttribute("inert", "");
            
            // Build links from navbar
            const navLinksContainer = navbar.querySelector(".nav-links");
            let mobileMenuMarkup = "";
            
            if (navLinksContainer) {
                const links = [];
                // Core links
                navLinksContainer.querySelectorAll("a:not(.nav-mega-item)").forEach(a => {
                    if (!a.closest(".nav-mega-menu") && !a.closest(".nav-dropdown-menu")) {
                        const href = a.getAttribute("href") || "";
                        const text = a.textContent.trim();
                        // Assign some default icons
                        let icon = "fa-compass";
                        if (text.includes("Beranda")) icon = "fa-home";
                        else if (text.includes("Proyek")) icon = "fa-rocket";
                        else if (text.includes("Library")) icon = "fa-bookmark";
                        else if (text.includes("Profil")) icon = "fa-user";
                        links.push({ href, label: text, icon });
                    }
                });
                
                mobileMenuMarkup += `<span class="mobile-menu-section">Utama</span>`;
                links.forEach(l => {
                    mobileMenuMarkup += `<a href="${l.href}"><i class="fa-solid ${l.icon}" aria-hidden="true"></i><span>${l.label}</span></a>`;
                });
                
                // Mega menu links
                const megaLinks = Array.from(document.querySelectorAll(".nav-mega-item"));
                if (megaLinks.length > 0) {
                    mobileMenuMarkup += `<span class="mobile-menu-section">Eksplorasi & Belajar</span>`;
                    megaLinks.forEach(ml => {
                        const iconEl = ml.querySelector("i");
                        const titleEl = ml.querySelector(".nav-mega-title") || ml.querySelector("span");
                        const href = ml.getAttribute("href");
                        mobileMenuMarkup += `<a href="${href}"><i class="${iconEl ? iconEl.className : 'fa-solid fa-star'}" aria-hidden="true"></i><span>${titleEl ? titleEl.textContent : ''}</span></a>`;
                    });
                }
            }

            
            overlay.innerHTML = `
                <div class="mobile-menu-drawer" role="dialog" aria-modal="true" aria-labelledby="mobileNavigationTitle">
                    <div class="mobile-menu-header">
                        <span class="mobile-menu-title" id="mobileNavigationTitle">Menu</span>
                        <button class="mobile-menu-close" type="button" aria-label="Tutup"><i class="fa-solid fa-xmark"></i></button>
                    </div>
                    <div class="mobile-menu-links">${mobileMenuMarkup}</div>
                </div>
            `;
            document.body.appendChild(overlay);
            closeBtn = overlay.querySelector(".mobile-menu-close");
            linksContainer = overlay.querySelector(".mobile-menu-links");
            
            // Inject session
            const drawer = overlay.querySelector(".mobile-menu-drawer");
            const rawUser = localStorage.getItem("quiznationCurrentUser") || localStorage.getItem("uot_current_user") || localStorage.getItem("eduquestUserSession");
            if (drawer) {
                const sessionSection = document.createElement("div");
                sessionSection.className = "mobile-menu-session";
                sessionSection.style.marginTop = "auto";
                sessionSection.style.paddingTop = "16px";
                sessionSection.style.borderTop = "1px solid var(--uot-border, rgba(15,23,42,0.1))";
                sessionSection.style.display = "flex";
                sessionSection.style.flexDirection = "column";
                sessionSection.style.gap = "10px";
                
                if (rawUser) {
                    const session = JSON.parse(rawUser);
                    const userName = session.name || session.username || "Pengguna";
                    if (session.isLoggedIn !== false) {
                        const rpg = JSON.parse(localStorage.getItem("eduquestRPG") || "{}");
                        const currentAvatar = rpg.activeAvatar || session.avatar || userName.slice(0, 1).toUpperCase();
                        
                        let avatarHtml = currentAvatar.length <= 4 
                            ? `<span style="width: 44px; height: 44px; border-radius: 12px; background: var(--uot-primary, #4361ee); color: white; display: grid; place-items: center; font-size: 20px; font-weight: 800;">${currentAvatar}</span>`
                            : `<span style="width: 44px; height: 44px; border-radius: 12px; background: var(--uot-surface-soft); color: var(--uot-primary); display: grid; place-items: center; font-size: 18px; font-weight: 800; border: 1px solid var(--uot-border);">${currentAvatar.slice(0, 1).toUpperCase()}</span>`;
                        
                        sessionSection.innerHTML = `
                            <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--uot-surface-soft, rgba(0,0,0,0.03)); border-radius: 12px; border: 1px solid var(--uot-border);">
                                ${avatarHtml}
                                <div style="display: flex; flex-direction: column; min-width: 0;">
                                    <span style="font-weight: 800; font-size: 14px; color: var(--uot-text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${userName}</span>
                                    <span style="font-size: 11px; color: var(--uot-text-muted); font-weight: 600;">${localStorage.getItem("eduquestSubscription") === "pro" ? "Pro Member 👑" : "Basic Member"}</span>
                                </div>
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 6px;">
                                <a href="profile.html" style="padding: 10px 12px; border-radius: 10px; display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; color: var(--uot-text); text-decoration: none;">
                                    <i class="fa-solid fa-user"></i> Profil Saya
                                </a>
                                <a href="login.html?logout=1" style="padding: 10px 12px; border-radius: 10px; display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; color: #ef4444; text-decoration: none;">
                                    <i class="fa-solid fa-right-from-bracket"></i> Keluar
                                </a>
                            </div>
                        `;
                    } else {
                        sessionSection.innerHTML = `
                            <a href="login.html" class="button button-primary" style="width: 100%; justify-content: center;">Masuk / Daftar</a>
                        `;
                    }
                } else {
                    sessionSection.innerHTML = `
                        <a href="login.html" class="button button-primary" style="width: 100%; justify-content: center;">Masuk / Daftar</a>
                    `;
                }
                drawer.appendChild(sessionSection);
            }

        } else {
            linksContainer = overlay.querySelector(".mobile-menu-links");
        }

        // Add Active State in mobile links
        if (linksContainer) {
            const currentPath = window.location.pathname.split("/").pop() || "index.html";
            linksContainer.querySelectorAll("a").forEach(link => {
                const href = (link.getAttribute("href") || "").split("?")[0].split("#")[0];
                if (href && (href === currentPath || (currentPath === "" && href === "index.html"))) {
                    link.classList.add("active");
                    link.setAttribute("aria-current", "page");
                }
            });
        }

        const openDrawer = () => {
            overlay.classList.add("is-active", "show");
            overlay.removeAttribute("aria-hidden");
            overlay.removeAttribute("inert");
            hamburger.setAttribute("aria-expanded", "true");
            document.body.classList.add("nav-open");
            window.setTimeout(() => closeBtn && closeBtn.focus(), 80);
        };
        const closeDrawer = () => {
            overlay.classList.remove("is-active", "show");
            overlay.setAttribute("aria-hidden", "true");
            overlay.setAttribute("inert", "");
            hamburger.setAttribute("aria-expanded", "false");
            document.body.classList.remove("nav-open");
        };

        hamburger.addEventListener("click", () => {
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
                hamburger.focus();
            }
        });
    }

    function initSearchAutocomplete() {
        const searchInput = document.querySelector(".nav-search-input") || document.querySelector("#navSearchInput");
        const suggestionsBox = document.querySelector(".search-suggestions-box") || document.querySelector("#searchSuggestionsBox");
        if (!searchInput || !suggestionsBox) return;

        const searchableItems = [
            { title: "Dasar Pemrograman", url: "materi-basic.html?topik=programming", category: "Materi" },
            { title: "Web Development", url: "materi-basic.html?topik=web", category: "Materi" },
            { title: "Database & SQL", url: "materi-basic.html?topik=database", category: "Materi" },
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
                    suggestionsBox.innerHTML = `<div style="padding: 10px; color: var(--uot-text-muted); font-size: 12px;">Tidak ada hasil</div>`;
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

    function injectBububShortcut() {
        if (document.body?.dataset.page === "library") return;
        const navActions = document.querySelector(".nav-actions");
        if (!navActions || document.getElementById("navBububShortcut")) return;
        
        if (!document.getElementById("navBububStyles")) {
            const style = document.createElement("style");
            style.id = "navBububStyles";
            style.textContent = `
                .bubub-nav-shortcut {
                    background: none; border: none; font-size: 18px; cursor: pointer; padding: 8px;
                    border-radius: 50%; transition: background 0.3s, transform 0.2s;
                    display: inline-flex; align-items: center; justify-content: center;
                    width: 38px; height: 38px; color: var(--blue, #4361ee); margin-right: 8px;
                }
                .bubub-nav-shortcut:hover { background: var(--item-bg, rgba(0, 0, 0, 0.05)); transform: scale(1.08); }
                body.dark-theme .bubub-nav-shortcut { color: #70a1ff; }
            `;
            document.head.appendChild(style);
        }
        
        const shortcut = document.createElement("button");
        shortcut.id = "navBububShortcut";
        shortcut.className = "bubub-nav-shortcut";
        shortcut.type = "button";
        shortcut.setAttribute("aria-label", "Tanya BUBUB (AI)");
        shortcut.innerHTML = `<i class="fa-solid fa-sparkles"></i>`;
        shortcut.addEventListener("click", () => {
            if (window.BUBUBAI) {
                window.BUBUBAI.open();
            } else {
                const scriptTag = document.querySelector('script[src*="bubub-ai.js"]');
                if (scriptTag) {
                    window.BUBUBAI?.open();
                } else {
                    if (!document.querySelector('link[href*="bubub-ai.css"]')) {
                        const link = document.createElement("link"); link.rel = "stylesheet"; link.href = "bubub-ai.css"; document.head.appendChild(link);
                    }
                    const script = document.createElement("script"); script.src = "bubub-ai.js";
                    script.onload = () => setTimeout(() => window.BUBUBAI?.open(), 150);
                    document.body.appendChild(script);
                }
            }
        });
        
        const themeBtn = document.getElementById("themeToggleBtn") || navActions.querySelector(".theme-toggle-btn");
        if (themeBtn) navActions.insertBefore(shortcut, themeBtn);
        else navActions.appendChild(shortcut);
    }

    function init() {
        initUserSession();
        initNavbarDropdown();
        initMobileDrawer();
        initSearchAutocomplete();
        injectBububShortcut();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();

    // Global subscription badge updater
    function updateSubscriptionBadge() {
        const subscription = localStorage.getItem("eduquestSubscription") || "basic";
        const badges = document.querySelectorAll(".subscription-badge");
        badges.forEach(badge => {
            if (subscription === "pro") {
                badge.textContent = "Pro Member 👑";
                badge.classList.remove("basic");
                badge.classList.add("pro");
            } else {
                badge.textContent = "Basic Member";
                badge.classList.remove("pro");
                badge.classList.add("basic");
            }
        });
    }

    // Call it immediately after DOM content loaded
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", updateSubscriptionBadge);
    } else {
        updateSubscriptionBadge();
    }
