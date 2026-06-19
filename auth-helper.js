(() => {
    "use strict";

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

                // Utility for HTML escaping to prevent XSS
                const escapeHTML = (str) => {
                    return String(str)
                        .replace(/&/g, "&amp;")
                        .replace(/</g, "&lt;")
                        .replace(/>/g, "&gt;")
                        .replace(/"/g, "&quot;")
                        .replace(/'/g, "&#039;");
                };

                const safeUsername = escapeHTML(session.username || "");
                const safeAvatar = escapeHTML(currentAvatar);

                // Create the profile badge
                const userBadge = document.createElement("div");
                userBadge.className = "user-nav-badge";
                userBadge.id = "navUserBadge";
                userBadge.tabIndex = 0;
                userBadge.setAttribute("role", "button");
                userBadge.setAttribute("aria-label", `Profil ${safeUsername}. Klik untuk membuka menu`);

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

            const links = Array.from(navLinks.querySelectorAll("a"));
            if (links.length === 0) return;

            const coreHrefs = ["index.html", "materi.html", "quiz.html"];
            const coreLinks = [];
            const extraLinks = [];

            links.forEach(link => {
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
                
                extraLinks.forEach(link => {
                    const cloned = link.cloneNode(true);
                    cloned.classList.remove("active");
                    menu.appendChild(cloned);
                });
                
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

            const navbar = document.querySelector(".navbar");
            if (navbar && !navbar.querySelector(".nav-hamburger")) {
                const hamburger = document.createElement("button");
                hamburger.className = "nav-hamburger";
                hamburger.type = "button";
                hamburger.setAttribute("aria-label", "Menu Navigasi");
                hamburger.innerHTML = `<i class="fa-solid fa-bars"></i>`;
                
                const navActions = document.querySelector(".nav-actions");
                if (navActions) {
                    navbar.insertBefore(hamburger, navActions);
                } else {
                    navbar.appendChild(hamburger);
                }

                const overlay = document.createElement("div");
                overlay.className = "mobile-menu-overlay";
                overlay.innerHTML = `
                    <div class="mobile-menu-drawer">
                        <div class="mobile-menu-header">
                            <span class="mobile-menu-title">Menu</span>
                            <button class="mobile-menu-close" type="button" aria-label="Tutup"><i class="fa-solid fa-xmark"></i></button>
                        </div>
                        <div class="mobile-menu-links"></div>
                    </div>
                `;
                document.body.appendChild(overlay);

                const drawerLinks = overlay.querySelector(".mobile-menu-links");
                links.forEach(link => {
                    const cloned = link.cloneNode(true);
                    cloned.addEventListener("click", () => {
                        overlay.classList.remove("is-active");
                    });
                    drawerLinks.appendChild(cloned);
                });

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
                                <span class="user-avatar" style="font-size: 24px; display: grid; place-items: center; width: 36px; height: 36px; border-radius: 12px; background: linear-gradient(135deg, rgba(50,214,107,0.15), rgba(79,140,255,0.15));">${currentAvatar}</span>
                                <div style="display: flex; flex-direction: column; min-width: 0;">
                                    <span class="user-name-label" style="font-weight: 800; font-size: 14px; color: var(--dark); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${session.username}</span>
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
                    if (typeof playSound === "function") {
                        try { playSound("click"); } catch(err){}
                    }
                };
                const closeMenu = () => {
                    overlay.classList.remove("is-active");
                    if (typeof playSound === "function") {
                        try { playSound("click"); } catch(err){}
                    }
                };

                hamburger.addEventListener("click", openMenu);
                overlay.querySelector(".mobile-menu-close").addEventListener("click", closeMenu);
                overlay.addEventListener("click", (e) => {
                    if (e.target === overlay) closeMenu();
                });
            }
        } catch (e) {
            console.error("Clean navbar failed:", e);
        }
    }

    function initAuthAndSub() {
        updateNavbarForSession();
        updateSubscriptionBadge();
        cleanAndRestructureNavbar();
        document.addEventListener("touchstart", () => {}, { passive: true });
    }

    // Run on script load & complete DOM content
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initAuthAndSub);
    } else {
        initAuthAndSub();
    }
})();
