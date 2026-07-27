(() => {
    "use strict";

    const escapeHTML = value => String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    function updateNavbarForSession() {
        try {
            const session = JSON.parse(localStorage.getItem("eduquestUserSession") || "null");
            const navActions = document.querySelector(".nav-actions");
            if (!navActions) return;
            if (navActions.querySelector(".profile-nav-link, #navUserBadge")) return;

            // Find the "Masuk" login button (using text content or href parameter)
            const loginBtn = [...navActions.querySelectorAll("a, button")].find(el => {
                const text = el.textContent.trim().toLowerCase();
                const href = el.getAttribute("href") || "";
                return text === "masuk" || href.includes("login.html");
            });

            if (session && session.isLoggedIn && loginBtn) {
                // Fetch active avatar from RPG engine database to integrate session with game state
                const rpg = JSON.parse(localStorage.getItem("eduquestRPG") || "{}");
                const currentAvatar = rpg.activeAvatar || session.avatar || "👨‍💻";

                const safeUsername = escapeHTML(session.username || "");
                const safeAvatar = escapeHTML(currentAvatar);

                // Create the profile badge
                const userBadge = document.createElement("div");
                userBadge.className = "user-nav-badge";
                userBadge.id = "navUserBadge";
                userBadge.tabIndex = 0;
                userBadge.setAttribute("role", "button");
                userBadge.setAttribute("aria-label", `Profil ${String(session.username || "Pengguna")}. Klik untuk membuka menu`);

                userBadge.innerHTML = `
                    <span class="user-avatar">${safeAvatar}</span>
                    <span class="user-name">${safeUsername}</span>
                    <div class="user-dropdown" id="navUserDropdown">
                        <a href="profile.html" class="dropdown-item">
                            <i class="fa-solid fa-user"></i> Profil Saya
                        </a>
                        <a href="login.html?logout=1" class="dropdown-item logout">
                            <i class="fa-solid fa-right-from-bracket"></i> Keluar
                        </a>
                    </div>
                `;

                // Handle click behavior for dropdown menu (mobile friendly toggle)
                userBadge.addEventListener("click", (e) => {
                    e.stopPropagation();
                    userBadge.classList.toggle("active");
                    if (typeof playSound === "function") {
                        try { playSound("click"); } catch (err) {}
                    }
                });

                // Dismiss menu on window click
                document.addEventListener("click", () => {
                    userBadge.classList.remove("active");
                });

                // Dismiss menu on escape key
                document.addEventListener("keydown", (e) => {
                    if (e.key === "Escape") {
                        userBadge.classList.remove("active");
                    }
                });

                // Replace "Masuk" button
                loginBtn.parentNode.replaceChild(userBadge, loginBtn);
            } else if (!session || !session.isLoggedIn) {
                const profileLink = document.createElement("a");
                profileLink.href = "profile.html";
                profileLink.className = "profile-nav-link";
                profileLink.setAttribute("aria-label", "Buka profil");
                profileLink.title = "Profil";
                profileLink.innerHTML = `<i class="fa-solid fa-user"></i>`;
                if (loginBtn) {
                    navActions.insertBefore(profileLink, loginBtn);
                } else {
                    navActions.appendChild(profileLink);
                }
            }
        } catch (e) {
            console.error("Auth helper navbar sync failed:", e);
        }
    }

    function updateSubscriptionBadge() {
        try {
            const navActions = document.querySelector(".nav-actions");
            if (!navActions) return;

            // Inject styles if not present
            if (!document.getElementById("navSubscriptionStyles")) {
                const style = document.createElement("style");
                style.id = "navSubscriptionStyles";
                style.textContent = `
                    .subscription-badge {
                        font-size: 11px;
                        font-weight: 800;
                        padding: 6px 12px;
                        border-radius: 12px;
                        letter-spacing: 0.05em;
                        text-transform: uppercase;
                        display: inline-flex;
                        align-items: center;
                        gap: 4px;
                        transition: all 0.3s ease;
                        font-family: inherit;
                        margin-right: 8px;
                    }
                    .subscription-badge.basic {
                        background: var(--item-bg, rgba(255, 255, 255, 0.05));
                        border: 1px solid var(--border, rgba(255, 255, 255, 0.1));
                        color: var(--muted, #8a99ad);
                    }
                    .subscription-badge.pro {
                        background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15));
                        border: 1px solid var(--blue, #6366f1);
                        color: var(--blue, #6366f1);
                        box-shadow: 0 0 10px rgba(99, 102, 241, 0.2);
                        animation: nav-pulse-glow 2s infinite;
                    }
                    @keyframes nav-pulse-glow {
                        0%, 100% { box-shadow: 0 0 10px rgba(99, 102, 241, 0.2); }
                        50% { box-shadow: 0 0 15px rgba(99, 102, 241, 0.4); }
                    }
                    .profile-nav-link,
                    .user-nav-badge {
                        position: relative;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        gap: 8px;
                        min-width: 44px;
                        height: 44px;
                        padding: 0 12px;
                        border: 1px solid var(--border, rgba(148, 163, 184, 0.25));
                        border-radius: 16px;
                        background: var(--item-bg, rgba(255, 255, 255, 0.08));
                        color: var(--dark, #112033);
                        cursor: pointer;
                        transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
                    }
                    .profile-nav-link:hover,
                    .user-nav-badge:hover {
                        transform: translateY(-2px);
                        border-color: var(--blue, #4f8cff);
                        box-shadow: 0 10px 24px rgba(79, 140, 255, 0.16);
                    }
                    .user-avatar {
                        display: grid;
                        place-items: center;
                        width: 30px;
                        height: 30px;
                        border-radius: 10px;
                        background: linear-gradient(135deg, rgba(50, 214, 107, 0.2), rgba(79, 140, 255, 0.2));
                        font-size: 19px;
                    }
                    .user-name {
                        max-width: 110px;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        font-size: 12px;
                        font-weight: 800;
                    }
                    .user-dropdown {
                        position: absolute;
                        top: calc(100% + 10px);
                        right: 0;
                        display: none;
                        min-width: 180px;
                        padding: 8px;
                        border: 1px solid var(--border, rgba(148, 163, 184, 0.25));
                        border-radius: 16px;
                        background: var(--white, #fff);
                        box-shadow: 0 18px 45px rgba(15, 23, 42, 0.18);
                        z-index: 100;
                    }
                    .user-nav-badge.active .user-dropdown { display: grid; }
                    .dropdown-item {
                        display: flex;
                        align-items: center;
                        gap: 9px;
                        padding: 11px 12px;
                        border-radius: 11px;
                        color: var(--dark, #112033);
                        font-size: 12px;
                        font-weight: 800;
                        text-decoration: none;
                    }
                    .dropdown-item:hover { background: var(--item-bg, #f1f5f9); }
                    .dropdown-item.logout { color: #ef4444; }
                    body.dark-theme .profile-nav-link,
                    body.dark-theme .user-nav-badge,
                    body.dark-theme .dropdown-item { color: var(--dark, #f8fafc); }
                    body.dark-theme .user-dropdown { background: var(--white, #0f172a); }
                    .nav-dropdown-trigger.active {
                        color: white !important;
                        background: linear-gradient(135deg, var(--green, #10b981), var(--blue, #6366f1)) !important;
                        box-shadow: 0 8px 20px rgba(99, 102, 241, 0.25) !important;
                    }
                    .nav-dropdown-menu a.active {
                        background: rgba(99, 102, 241, 0.12) !important;
                        color: var(--blue, #6366f1) !important;
                        font-weight: 800 !important;
                    }
                    body.dark-theme .nav-dropdown-menu a.active {
                        background: rgba(99, 102, 241, 0.2) !important;
                        color: hsl(226, 100%, 75%) !important;
                    }
                    @media (max-width: 720px) {
                        .user-name { display: none; }
                        .subscription-badge { display: none !important; }
                    }
                `;
                document.head.appendChild(style);
            }

            let badge = document.getElementById("navSubscriptionBadge");
            if (!badge) {
                badge = document.createElement("span");
                badge.id = "navSubscriptionBadge";
                navActions.insertBefore(badge, navActions.firstChild);
            }

            const currentSub = localStorage.getItem("eduquestSubscription") || "free";
            if (currentSub === "pro") {
                badge.textContent = "Pro 👑";
                badge.className = "subscription-badge pro";
            } else {
                badge.textContent = "Basic";
                badge.className = "subscription-badge basic";
            }
        } catch (e) {
            console.error("Subscription badge sync failed:", e);
        }
    }

    function cleanAndRestructureNavbar() {
        try {
            const navLinks = document.querySelector(".nav-links");
            if (!navLinks) return;

            const mobileMenuItems = [
                { href: "index.html", label: "Beranda", icon: "fa-house" },
                { href: "materi.html", label: "Materi belajar", icon: "fa-book-open" },
                { href: "projects.html", label: "Proyek", icon: "fa-hammer" },
                { href: "learning-path.html", label: "Roadmap belajar", icon: "fa-route" },
                { href: "library.html", label: "Library", icon: "fa-bookmark" },
                { href: "quiz.html", label: "Quiz & latihan", icon: "fa-circle-question" },
                { href: "snbt.html", label: "Persiapan TKA & SNBT", icon: "fa-graduation-cap" },
                { href: "bahasa-daerah.html", label: "Bahasa daerah", icon: "fa-language" },
                { href: "leaderboard.html", label: "Leaderboard", icon: "fa-trophy" },
                { href: "achievements.html", label: "Pencapaian", icon: "fa-medal" },
                { href: "profile.html", label: "Profil saya", icon: "fa-user" },
                { href: "payment.html", label: "Upgrade Pro", icon: "fa-crown" }
            ];

            const currentPage = (window.location.pathname.split("/").pop() || "index.html").split("?")[0];
            const mobileMenuMarkup = mobileMenuItems.map((item, index) => {
                const section = index === 0 ? "Utama" : index === 1 ? "Belajar" : index === 5 ? "Eksplorasi" : index === 7 ? "Progres" : index === 10 ? "Akun" : "";
                const active = item.href === currentPage;
                return `${section ? `<span class="mobile-menu-section">${section}</span>` : ""}<a href="${item.href}"${active ? ' class="active" aria-current="page"' : ""}><i class="fa-solid ${item.icon}" aria-hidden="true"></i><span>${item.label}</span></a>`;
            }).join("");

            const isNewNavbar = !!(document.getElementById("btnExplore") || document.getElementById("navSearchInput"));
            let links = [];

            if (!isNewNavbar) {
                // Legacy restructuring code
                const newMenus = [
                    { href: "learning-path.html", text: "Roadmap Belajar" },
                    { href: "leaderboard.html", text: "Leaderboard" },
                    { href: "profile.html", text: "Profil Saya" },
                    { href: "payment.html", text: "Upgrade Pro" },
                    { href: "achievements.html", text: "Pencapaian" }
                ];

                const currentLinks = Array.from(navLinks.querySelectorAll("a"));
                const currentHrefs = currentLinks.map(a => a.getAttribute("href") || "");

                newMenus.forEach(item => {
                    const exists = currentHrefs.some(href => href.includes(item.href));
                    if (!exists) {
                        const newLink = document.createElement("a");
                        newLink.href = item.href;
                        newLink.textContent = item.text;
                        const pagePath = window.location.pathname;
                        if (pagePath.includes(item.href)) {
                            newLink.className = "active";
                        }
                        navLinks.appendChild(newLink);
                    }
                });

                // Re-read links including the newly injected ones
                const allLinks = Array.from(navLinks.querySelectorAll("a"));
                if (allLinks.length === 0) return;

                const coreHrefs = ["index.html", "materi.html", "quiz.html"];
                const coreLinks = [];
                const extraLinks = [];

                allLinks.forEach(link => {
                    const href = link.getAttribute("href") || "";
                    const text = link.textContent.trim();
                    if (coreHrefs.some(ch => href.includes(ch)) || text === "Beranda" || text === "Materi" || text === "Quiz") {
                        coreLinks.push(link);
                    } else {
                        extraLinks.push(link);
                    }
                });

                navLinks.innerHTML = "";
                coreLinks.forEach(link => navLinks.appendChild(link));

                if (extraLinks.length > 0) {
                    const dropdown = document.createElement("div");
                    dropdown.className = "nav-dropdown";
                    
                    const trigger = document.createElement("button");
                    trigger.type = "button";
                    trigger.className = "nav-dropdown-trigger";
                    trigger.innerHTML = `Lainnya <i class="fa-solid fa-chevron-down" style="font-size:10px; margin-left: 2px;"></i>`;
                    
                    const menu = document.createElement("div");
                    menu.className = "nav-dropdown-menu";
                    
                    let hasActiveExtra = false;
                    extraLinks.forEach(link => {
                        const cloned = link.cloneNode(true);
                        const href = link.getAttribute("href") || "";
                        if (link.classList.contains("active") || window.location.pathname.includes(href)) {
                            cloned.classList.add("active");
                            hasActiveExtra = true;
                        } else {
                            cloned.classList.remove("active");
                        }
                        menu.appendChild(cloned);
                    });

                    if (hasActiveExtra) {
                        trigger.classList.add("active");
                    }
                    
                    dropdown.appendChild(trigger);
                    dropdown.appendChild(menu);
                    navLinks.appendChild(dropdown);

                    trigger.addEventListener("click", (e) => {
                        e.stopPropagation();
                        dropdown.classList.toggle("active");
                    });

                    document.addEventListener("click", () => {
                        dropdown.classList.remove("active");
                    });
                }

                // For legacy layout, the drawer gets all links in the rebuilt navLinks
                links = Array.from(navLinks.querySelectorAll("a"));
            } else {
                // FOR NEW NAVBAR: build links list including core links AND explore mega menu links
                links = Array.from(navLinks.querySelectorAll("a"));
                
                // Add mega menu items as links to the mobile drawer
                const megaLinks = Array.from(document.querySelectorAll(".explore-mega-menu .mega-item-link"));
                megaLinks.forEach(ml => {
                    const linkEl = document.createElement("a");
                    linkEl.href = ml.getAttribute("href");
                    
                    // Extract text and icon
                    const span = ml.querySelector("span");
                    const iconBox = ml.querySelector(".mega-icon-box");
                    const iconText = iconBox ? iconBox.textContent : "";
                    const text = span ? span.textContent : ml.textContent;
                    
                    linkEl.innerHTML = `<span style="margin-right: 8px;">${iconText}</span> ${text}`;
                    
                    // If current pathname matches, mark as active
                    const path = window.location.pathname;
                    const page = path.split("/").pop() || "index.html";
                    if (linkEl.getAttribute("href") === page) {
                        linkEl.className = "active";
                    }
                    
                    links.push(linkEl);
                });
            }

            const navbar = document.querySelector(".navbar");
            if (navbar && !navbar.querySelector(".nav-hamburger")) {
                const hamburger = document.createElement("button");
                hamburger.className = "nav-hamburger";
                hamburger.type = "button";
                hamburger.setAttribute("aria-label", "Menu Navigasi");
                hamburger.setAttribute("aria-expanded", "false");
                hamburger.setAttribute("aria-controls", "mobileNavigationDrawer");
                hamburger.innerHTML = `<i class="fa-solid fa-bars"></i>`;
                
                const navActions = document.querySelector(".nav-actions");
                if (navActions) {
                    navbar.insertBefore(hamburger, navActions);
                } else {
                    navbar.appendChild(hamburger);
                }

                const overlay = document.createElement("div");
                overlay.className = "mobile-menu-overlay";
                overlay.id = "mobileNavigationDrawer";
                overlay.setAttribute("aria-hidden", "true");
                overlay.setAttribute("inert", "");
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

                const drawerLinks = overlay.querySelector(".mobile-menu-links");

                // Inject session/profile section at the bottom of the drawer for mobile accessibility
                const drawer = overlay.querySelector(".mobile-menu-drawer");
                if (drawer) {
                    const session = JSON.parse(localStorage.getItem("eduquestUserSession") || "null");
                    const sessionSection = document.createElement("div");
                    sessionSection.className = "mobile-menu-session";
                    sessionSection.style.marginTop = "auto";
                    sessionSection.style.paddingTop = "16px";
                    sessionSection.style.borderTop = "1px solid var(--border)";
                    sessionSection.style.display = "flex";
                    sessionSection.style.flexDirection = "column";
                    sessionSection.style.gap = "10px";

                    if (session && session.isLoggedIn) {
                        const rpg = JSON.parse(localStorage.getItem("eduquestRPG") || "{}");
                        const currentAvatar = rpg.activeAvatar || session.avatar || "👨‍💻";
                        sessionSection.innerHTML = `
                            <div style="display: flex; align-items: center; gap: 12px; padding: 0 8px; margin-bottom: 4px;">
                                    <span class="user-avatar" style="font-size: 24px; display: grid; place-items: center; width: 36px; height: 36px; border-radius: 12px; background: linear-gradient(135deg, rgba(50,214,107,0.15), rgba(79,140,255,0.15));">${escapeHTML(currentAvatar)}</span>
                                <div style="display: flex; flex-direction: column; min-width: 0;">
                                    <span class="user-name-label" style="font-weight: 800; font-size: 14px; color: var(--dark); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHTML(session.username || "Pengguna")}</span>
                                    <span style="font-size: 11px; color: var(--muted); font-weight: 600;">${localStorage.getItem("eduquestSubscription") === "pro" ? "Pro Member 👑" : "Basic Member"}</span>
                                </div>
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 6px;">
                                <a href="profile.html" class="dropdown-item" style="padding: 10px 12px; border-radius: 10px; display: flex; align-items: center; gap: 8px; font-size: 12.5px; font-weight: 800; color: var(--dark); text-decoration: none;">
                                    <i class="fa-solid fa-user"></i> Profil Saya
                                </a>
                                <a href="login.html?logout=1" class="dropdown-item logout" style="padding: 10px 12px; border-radius: 10px; display: flex; align-items: center; gap: 8px; font-size: 12.5px; font-weight: 800; color: #ef4444; text-decoration: none;">
                                    <i class="fa-solid fa-right-from-bracket"></i> Keluar
                                </a>
                            </div>
                        `;
                    } else {
                        sessionSection.innerHTML = `
                            <a href="login.html" class="btn btn-primary" style="width: 100%; font-weight: 800; border-radius: 12px; text-align: center; display: flex; justify-content: center; align-items: center; min-height: 40px; text-decoration: none; color: white;">
                                Masuk / Daftar
                            </a>
                        `;
                    }
                    drawer.appendChild(sessionSection);
                }

                const openMenu = () => {
                    overlay.classList.add("is-active");
                    overlay.setAttribute("aria-hidden", "false");
                    overlay.removeAttribute("inert");
                    hamburger.setAttribute("aria-expanded", "true");
                    document.body.classList.add("nav-open");
                    window.setTimeout(() => overlay.querySelector(".mobile-menu-close")?.focus(), 80);
                    if (typeof playSound === "function") {
                        try { playSound("click"); } catch(err){}
                    }
                };
                const closeMenu = () => {
                    overlay.classList.remove("is-active");
                    overlay.setAttribute("aria-hidden", "true");
                    overlay.setAttribute("inert", "");
                    hamburger.setAttribute("aria-expanded", "false");
                    document.body.classList.remove("nav-open");
                    if (typeof playSound === "function") {
                        try { playSound("click"); } catch(err){}
                    }
                };

                drawerLinks.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));
                hamburger.addEventListener("click", openMenu);
                overlay.querySelector(".mobile-menu-close").addEventListener("click", closeMenu);
                overlay.addEventListener("click", (e) => {
                    if (e.target === overlay) closeMenu();
                });
                document.addEventListener("keydown", (e) => {
                    if (e.key === "Escape" && overlay.classList.contains("is-active")) {
                        closeMenu();
                        hamburger.focus();
                    }
                });
            }
        } catch (e) {
            console.error("Clean navbar failed:", e);
        }
    }
    function injectBububShortcut() {
        try {
            // Library has its own contextual librarian embedded in the workspace.
            if (document.body?.dataset.page === "library") return;
            const navActions = document.querySelector(".nav-actions");
            if (!navActions) return;
            if (document.getElementById("navBububShortcut")) return;

            // Inject styles if not present
            if (!document.getElementById("navBububStyles")) {
                const style = document.createElement("style");
                style.id = "navBububStyles";
                style.textContent = `
                    .bubub-nav-shortcut {
                        background: none;
                        border: none;
                        font-size: 18px;
                        cursor: pointer;
                        padding: 8px;
                        border-radius: 50%;
                        transition: background 0.3s, transform 0.2s;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        width: 38px;
                        height: 38px;
                        color: var(--blue, #4361ee);
                        margin-right: 8px;
                    }
                    .bubub-nav-shortcut:hover {
                        background: var(--item-bg, rgba(0, 0, 0, 0.05));
                        transform: scale(1.08);
                    }
                    body.dark-theme .bubub-nav-shortcut {
                        color: #70a1ff;
                    }
                `;
                document.head.appendChild(style);
            }

            const shortcut = document.createElement("button");
            shortcut.id = "navBububShortcut";
            shortcut.className = "bubub-nav-shortcut";
            shortcut.type = "button";
            shortcut.title = "Tanya BUBUB (AI)";
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
                            const link = document.createElement("link");
                            link.rel = "stylesheet";
                            link.href = "bubub-ai.css";
                            document.head.appendChild(link);
                        }
                        const script = document.createElement("script");
                        script.src = "bubub-ai.js";
                        script.onload = () => {
                            setTimeout(() => {
                                window.BUBUBAI?.open();
                            }, 150);
                        };
                        document.body.appendChild(script);
                    }
                }
                if (typeof window.playSound === "function") {
                    try { window.playSound("click"); } catch(e){}
                }
            });

            const themeBtn = document.getElementById("themeToggleBtn") || navActions.querySelector(".theme-toggle-btn");
            if (themeBtn) {
                navActions.insertBefore(shortcut, themeBtn);
            } else {
                navActions.appendChild(shortcut);
            }
        } catch (e) {
            console.error("Failed to inject BUBUB shortcut:", e);
        }
    }

    function initAuthAndSub() {
        updateNavbarForSession();
        updateSubscriptionBadge();
        cleanAndRestructureNavbar();
        injectBububShortcut();
        document.addEventListener("touchstart", () => {}, { passive: true });
    }

    // Run on script load & complete DOM content
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initAuthAndSub);
    } else {
        initAuthAndSub();
    }
})();
