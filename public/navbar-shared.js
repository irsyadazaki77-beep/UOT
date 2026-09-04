/**
 * UNIVERSE OF TECH - UNIFIED NAVBAR & SEARCH ENGINE (FASE 3)
 * Dynamic Navbar Builder, Fixed Mobile Drawer & Content-backed Live Search
 */

document.addEventListener('DOMContentLoaded', () => {
    initUnifiedNavbar();
});

function initUnifiedNavbar() {
    const siteHeader = document.getElementById('siteHeader');
    if (!siteHeader) return;

    // Detect Current Page
    const path = window.location.pathname;
    const pageName = path.substring(path.lastIndexOf('/') + 1) || 'index.html';

    // 1. Inject Desktop & Base Navbar HTML
    siteHeader.innerHTML = `
        <div class="nav-left-group">
            <a href="index.html" class="brand" aria-label="Universe Of Tech, kembali ke beranda">
                <img src="logo-uot-display.webp" alt="Logo Universe Of Tech" class="brand-logo" width="32" height="32" fetchpriority="high">
                <span>Universe Of Tech</span>
            </a>
        </div>

        <div class="nav-links">
            <a class="${pageName === 'index.html' || pageName === '' ? 'active' : ''}" href="index.html">Beranda</a>
            
            <!-- Tech Academy Dropdown -->
            <div class="nav-dropdown-wrapper">
                <button class="nav-dropdown-trigger" id="navTechAcademyTrigger" type="button" aria-haspopup="true" aria-expanded="false">
                    <span>Tech Academy</span>
                    <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
                </button>
                <div class="nav-mega-menu" role="menu" aria-label="Menu Tech Academy">
                    <div class="nav-mega-group">
                        <span class="nav-mega-heading">Jalur &amp; Materi</span>
                        <a href="materi.html" class="nav-mega-item ${pageName === 'materi.html' ? 'active' : ''}" role="menuitem">
                            <span class="nav-mega-icon"><i class="fa-solid fa-book-open" aria-hidden="true"></i></span>
                            <div class="nav-mega-text">
                                <span class="nav-mega-title">Semua Materi</span>
                                <span class="nav-mega-desc">Modul tech terstruktur</span>
                            </div>
                        </a>
                        <a href="learning-journey.html" class="nav-mega-item ${pageName === 'learning-journey.html' ? 'active' : ''}" role="menuitem">
                            <span class="nav-mega-icon"><i class="fa-solid fa-compass" aria-hidden="true"></i></span>
                            <div class="nav-mega-text">
                                <span class="nav-mega-title">Learning Path</span>
                                <span class="nav-mega-desc">Roadmap personal &amp; target</span>
                            </div>
                        </a>
                    </div>
                    <div class="nav-mega-group">
                        <span class="nav-mega-heading">Latihan &amp; Eksplorasi</span>
                        <a href="quiz.html" class="nav-mega-item ${pageName === 'quiz.html' ? 'active' : ''}" role="menuitem">
                            <span class="nav-mega-icon"><i class="fa-solid fa-circle-question" aria-hidden="true"></i></span>
                            <div class="nav-mega-text">
                                <span class="nav-mega-title">Quiz &amp; Latihan</span>
                                <span class="nav-mega-desc">Uji pemahaman kilat</span>
                            </div>
                        </a>
                        <a href="projects.html" class="nav-mega-item ${pageName === 'projects.html' ? 'active' : ''}" role="menuitem">
                            <span class="nav-mega-icon"><i class="fa-solid fa-hammer" aria-hidden="true"></i></span>
                            <div class="nav-mega-text">
                                <span class="nav-mega-title">Projects</span>
                                <span class="nav-mega-desc">Portofolio proyek nyata</span>
                            </div>
                        </a>
                        <a href="sandbox-runner.html" class="nav-mega-item ${pageName === 'sandbox-runner.html' ? 'active' : ''}" role="menuitem">
                            <span class="nav-mega-icon"><i class="fa-solid fa-terminal" aria-hidden="true"></i></span>
                            <div class="nav-mega-text">
                                <span class="nav-mega-title">Sandbox</span>
                                <span class="nav-mega-desc">Uji coba kode langsung</span>
                            </div>
                        </a>
                        <a href="games.html" class="nav-mega-item ${pageName === 'games.html' ? 'active' : ''}" role="menuitem">
                            <span class="nav-mega-icon"><i class="fa-solid fa-gamepad" aria-hidden="true"></i></span>
                            <div class="nav-mega-text">
                                <span class="nav-mega-title">Games</span>
                                <span class="nav-mega-desc">Asah pemahaman interaktif</span>
                            </div>
                        </a>
                    </div>
                </div>
            </div>

            <!-- Exam Prep Dropdown -->
            <div class="nav-dropdown-wrapper">
                <button class="nav-dropdown-trigger" id="navExamPrepTrigger" type="button" aria-haspopup="true" aria-expanded="false">
                    <span>Exam Prep</span>
                    <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
                </button>
                <div class="nav-mega-menu" role="menu" aria-label="Menu Persiapan Ujian">
                    <div class="nav-mega-group">
                        <span class="nav-mega-heading">Materi Ujian</span>
                        <a href="snbt.html" class="nav-mega-item ${pageName === 'snbt.html' ? 'active' : ''}" role="menuitem">
                            <span class="nav-mega-icon"><i class="fa-solid fa-graduation-cap" aria-hidden="true"></i></span>
                            <div class="nav-mega-text">
                                <span class="nav-mega-title">SNBT</span>
                                <span class="nav-mega-desc">UTBK &amp; penalaran umum</span>
                            </div>
                        </a>
                        <a href="tka-lms.html" class="nav-mega-item ${pageName === 'tka-lms.html' ? 'active' : ''}" role="menuitem">
                            <span class="nav-mega-icon"><i class="fa-solid fa-pen-to-square" aria-hidden="true"></i></span>
                            <div class="nav-mega-text">
                                <span class="nav-mega-title">TKA</span>
                                <span class="nav-mega-desc">Tes kemampuan akademik</span>
                            </div>
                        </a>
                    </div>
                    <div class="nav-mega-group">
                        <span class="nav-mega-heading">Progress</span>
                        <a href="snbt.html#tryout" class="nav-mega-item" role="menuitem">
                            <span class="nav-mega-icon"><i class="fa-solid fa-clock" aria-hidden="true"></i></span>
                            <div class="nav-mega-text">
                                <span class="nav-mega-title">Tryout</span>
                                <span class="nav-mega-desc">Simulasi ujian berwaktu</span>
                            </div>
                        </a>
                        <a href="profile.html#analytics" class="nav-mega-item" role="menuitem">
                            <span class="nav-mega-icon"><i class="fa-solid fa-chart-line" aria-hidden="true"></i></span>
                            <div class="nav-mega-text">
                                <span class="nav-mega-title">Analytics</span>
                                <span class="nav-mega-desc">Analisis kesiapan ujian</span>
                            </div>
                        </a>
                    </div>
                </div>
            </div>

            <!-- Nusantara Dropdown -->
            <div class="nav-dropdown-wrapper">
                <button class="nav-dropdown-trigger" id="navNusantaraTrigger" type="button" aria-haspopup="true" aria-expanded="false">
                    <span>Nusantara</span>
                    <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
                </button>
                <div class="nav-mega-menu" role="menu" aria-label="Menu Nusantara">
                    <div class="nav-mega-group">
                        <span class="nav-mega-heading">Bahasa &amp; Budaya</span>
                        <a href="bahasa-daerah.html" class="nav-mega-item ${pageName === 'bahasa-daerah.html' ? 'active' : ''}" role="menuitem">
                            <span class="nav-mega-icon"><i class="fa-solid fa-language" aria-hidden="true"></i></span>
                            <div class="nav-mega-text">
                                <span class="nav-mega-title">Bahasa Daerah</span>
                                <span class="nav-mega-desc">Belajar bahasa lokal nusantara</span>
                            </div>
                        </a>
                        <a href="quiz-budaya-lms.html" class="nav-mega-item ${pageName === 'quiz-budaya-lms.html' ? 'active' : ''}" role="menuitem">
                            <span class="nav-mega-icon"><i class="fa-solid fa-map-location-dot" aria-hidden="true"></i></span>
                            <div class="nav-mega-text">
                                <span class="nav-mega-title">Budaya</span>
                                <span class="nav-mega-desc">Ensiklopedia budaya indonesia</span>
                            </div>
                        </a>
                    </div>
                    <div class="nav-mega-group">
                        <span class="nav-mega-heading">Latihan</span>
                        <a href="quiz-budaya.html" class="nav-mega-item ${pageName === 'quiz-budaya.html' ? 'active' : ''}" role="menuitem">
                            <span class="nav-mega-icon"><i class="fa-solid fa-puzzle-piece" aria-hidden="true"></i></span>
                            <div class="nav-mega-text">
                                <span class="nav-mega-title">Culture Games</span>
                                <span class="nav-mega-desc">Asah wawasan kebudayaan</span>
                            </div>
                        </a>
                    </div>
                </div>
            </div>

            <a class="${pageName === 'library.html' ? 'active' : ''}" href="library.html">Library</a>
            <a class="${pageName === 'profile.html' ? 'active' : ''}" href="profile.html">Profil</a>
        </div>

        <div class="nav-search-wrapper">
            <div class="search-input-group">
                <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
                <input type="search" class="nav-search-input" id="navSearchInput" placeholder="Cari materi, quiz, proyek..." autocomplete="off" aria-label="Cari materi belajar" aria-controls="searchSuggestionsBox" aria-expanded="false">
            </div>
            <div class="search-suggestions-box" id="searchSuggestionsBox" role="listbox" aria-label="Saran pencarian"></div>
        </div>

        <div class="nav-actions">
            <button class="theme-toggle-btn" id="themeToggleBtn" type="button" aria-label="Ganti mode visual"><i class="fa-solid fa-moon" aria-hidden="true"></i></button>
            <a class="btn-ghost" id="navLoginLink" href="login.html">Masuk</a>
            <a class="btn-primary" href="learning-journey.html">Lanjut Belajar</a>
        </div>

        <button class="nav-hamburger" id="menuToggle" type="button" aria-label="Buka menu navigasi" aria-expanded="false" aria-controls="mobileNav">
            <i class="fa-solid fa-bars" aria-hidden="true"></i>
        </button>
    `;

    // 2. Inject Mobile Drawer Overlay to Body if missing
    let mobileNav = document.getElementById('mobileNav');
    if (!mobileNav) {
        mobileNav = document.createElement('div');
        mobileNav.className = 'mobile-menu-overlay';
        mobileNav.id = 'mobileNav';
        mobileNav.setAttribute('aria-hidden', 'true');
        mobileNav.setAttribute('inert', 'true');
        document.body.appendChild(mobileNav);
    }

    mobileNav.innerHTML = `
        <div class="mobile-menu-drawer" role="dialog" aria-modal="true" aria-labelledby="mobileMenuTitle">
            <div class="mobile-menu-header">
                <span class="mobile-menu-title" id="mobileMenuTitle">Navigasi UOT</span>
                <button class="mobile-menu-close" id="mobileMenuClose" type="button" aria-label="Tutup menu"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
            </div>
            <div class="mobile-menu-links">
                <span class="mobile-menu-section">Utama</span>
                <a class="${pageName === 'index.html' || pageName === '' ? 'active' : ''}" href="index.html"><i class="fa-solid fa-house" aria-hidden="true"></i><span>Beranda</span></a>
                <a class="${pageName === 'library.html' ? 'active' : ''}" href="library.html"><i class="fa-solid fa-bookmark" aria-hidden="true"></i><span>Library</span></a>
                <a class="${pageName === 'profile.html' ? 'active' : ''}" href="profile.html"><i class="fa-solid fa-user" aria-hidden="true"></i><span>Profil &amp; Progress</span></a>

                <span class="mobile-menu-section">Tech Academy</span>
                <a class="${pageName === 'materi.html' ? 'active' : ''}" href="materi.html"><i class="fa-solid fa-book-open" aria-hidden="true"></i><span>Materi Belajar</span></a>
                <a class="${pageName === 'learning-journey.html' ? 'active' : ''}" href="learning-journey.html"><i class="fa-solid fa-compass" aria-hidden="true"></i><span>Learning Path</span></a>
                <a class="${pageName === 'quiz.html' ? 'active' : ''}" href="quiz.html"><i class="fa-solid fa-circle-question" aria-hidden="true"></i><span>Quiz &amp; Latihan</span></a>
                <a class="${pageName === 'projects.html' ? 'active' : ''}" href="projects.html"><i class="fa-solid fa-hammer" aria-hidden="true"></i><span>Proyek Nyata</span></a>
                <a class="${pageName === 'sandbox-runner.html' ? 'active' : ''}" href="sandbox-runner.html"><i class="fa-solid fa-terminal" aria-hidden="true"></i><span>Sandbox</span></a>
                <a class="${pageName === 'games.html' ? 'active' : ''}" href="games.html"><i class="fa-solid fa-gamepad" aria-hidden="true"></i><span>Games</span></a>

                <span class="mobile-menu-section">Exam Prep</span>
                <a class="${pageName === 'snbt.html' ? 'active' : ''}" href="snbt.html"><i class="fa-solid fa-graduation-cap" aria-hidden="true"></i><span>Simulasi SNBT</span></a>
                <a class="${pageName === 'tka-lms.html' ? 'active' : ''}" href="tka-lms.html"><i class="fa-solid fa-pen-to-square" aria-hidden="true"></i><span>Persiapan TKA</span></a>

                <span class="mobile-menu-section">Nusantara</span>
                <a class="${pageName === 'bahasa-daerah.html' ? 'active' : ''}" href="bahasa-daerah.html"><i class="fa-solid fa-language" aria-hidden="true"></i><span>Bahasa Daerah</span></a>
                <a class="${pageName === 'quiz-budaya-lms.html' ? 'active' : ''}" href="quiz-budaya-lms.html"><i class="fa-solid fa-map-location-dot" aria-hidden="true"></i><span>Budaya</span></a>
                <a class="${pageName === 'quiz-budaya.html' ? 'active' : ''}" href="quiz-budaya.html"><i class="fa-solid fa-puzzle-piece" aria-hidden="true"></i><span>Culture Games</span></a>
            </div>
            <a class="mobile-login" id="mobileLoginLink" href="login.html">Masuk / Daftar Akun</a>
        </div>
    `;

    // 3. Initialize Shared Navigation Interactive Listeners
    setupThemeToggle();
    setupMobileDrawer(mobileNav);
    setupDropdownAria();
    setupContentBackedSearch();
    updateLoginStatus();
}

/* --- Login & Auth Dynamic Status Updates --- */
async function updateLoginStatus() {
    const loginLink = document.getElementById('navLoginLink');
    const mobileLoginLink = document.getElementById('mobileLoginLink');

    function renderLoggedIn(user) {
        const name = user.username || user.name || 'Pengguna';
        const initial = name.charAt(0).toUpperCase();
        const firstName = name.split(' ')[0] || 'User';
        const avatar = user.avatar || initial;

        const existingBadge = document.querySelector('.user-nav-badge');
        if (!existingBadge && loginLink) {
            const userBadge = document.createElement('a');
            userBadge.href = 'profile.html';
            userBadge.className = 'user-nav-badge';
            userBadge.setAttribute('aria-label', 'Buka profil');

            const avatarSpan = document.createElement('span');
            avatarSpan.className = 'user-nav-avatar';
            avatarSpan.textContent = avatar.length <= 2 ? avatar : initial;

            const nameSpan = document.createElement('span');
            nameSpan.textContent = firstName;

            userBadge.appendChild(avatarSpan);
            userBadge.appendChild(nameSpan);

            loginLink.replaceWith(userBadge);
        }

        if (mobileLoginLink) {
            mobileLoginLink.textContent = '';
            mobileLoginLink.href = 'profile.html';
            mobileLoginLink.className = 'mobile-login';

            const icon = document.createElement('i');
            icon.className = 'fa-solid fa-user-circle';
            icon.setAttribute('aria-hidden', 'true');

            const text = document.createTextNode(` Dashboard Profil (${firstName})`);
            mobileLoginLink.appendChild(icon);
            mobileLoginLink.appendChild(text);
        }
    }

    function renderLoggedOut() {
        const existingBadge = document.querySelector('.user-nav-badge');
        if (existingBadge) {
            const newLoginLink = document.createElement('a');
            newLoginLink.className = 'btn-ghost';
            newLoginLink.id = 'navLoginLink';
            newLoginLink.href = 'login.html';
            newLoginLink.textContent = 'Masuk';
            existingBadge.replaceWith(newLoginLink);
        }
        if (mobileLoginLink) {
            mobileLoginLink.textContent = 'Masuk / Daftar Akun';
            mobileLoginLink.href = 'login.html';
            mobileLoginLink.className = 'mobile-login';
        }
    }

    // 1. Read cached server snapshot for instant rendering (cache only)
    let cachedSnapshot = null;
    try {
        cachedSnapshot = JSON.parse(localStorage.getItem('uot_canonical_user_state') || 'null');
    } catch (_) {}

    if (cachedSnapshot && cachedSnapshot.authenticated && cachedSnapshot.user) {
        renderLoggedIn(cachedSnapshot.user);
    }

    // 2. Authoritative Verification with Server (/api/me)
    try {
        const res = await fetch('/api/me', {
            headers: { 'Accept': 'application/json' },
            credentials: 'include'
        });
        if (res.ok) {
            const data = await res.json();
            if (data && data.authenticated && data.user) {
                // Server confirmed authenticated
                localStorage.setItem('uot_canonical_user_state', JSON.stringify(data));
                renderLoggedIn(data.user);
                return;
            }
        }
        // Server says unauthenticated (401 or authenticated: false) -> Server Wins!
        if (cachedSnapshot && cachedSnapshot.authenticated) {
            localStorage.removeItem('uot_canonical_user_state');
            renderLoggedOut();
        }
    } catch (err) {
        // Network offline: retain cached snapshot if offline
    }
}

/* --- Theme Selection & Persistence Handler --- */
function setupThemeToggle() {
    const themeBtn = document.getElementById('themeToggleBtn');
    if (!themeBtn) return;

    function setTheme(theme) {
        const isDark = theme === 'dark';
        document.body.classList.toggle('dark-theme', isDark);
        themeBtn.setAttribute('aria-label', isDark ? 'Aktifkan tema terang' : 'Aktifkan tema gelap');
        themeBtn.innerHTML = isDark ? '<i class="fa-solid fa-sun" aria-hidden="true"></i>' : '<i class="fa-solid fa-moon" aria-hidden="true"></i>';
        
        // Save using canonical theme preference key
        try {
            localStorage.setItem('eduquest_theme', theme);
        } catch (_) {}
    }

    // Initialize Theme
    try {
        const saved = localStorage.getItem('eduquest_theme');
        const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        setTheme(saved || preferred);
    } catch (_) {
        setTheme('light');
    }

    themeBtn.addEventListener('click', () => {
        const isDark = document.body.classList.contains('dark-theme');
        setTheme(isDark ? 'light' : 'dark');
    });
}

/* --- Mobile Navigation Drawer Toggle Handler --- */
function setupMobileDrawer(overlay) {
    const hamburger = document.getElementById('menuToggle');
    const closeBtn = document.getElementById('mobileMenuClose');
    if (!hamburger || !overlay) return;

    function openDrawer() {
        overlay.classList.add('is-active', 'show');
        overlay.removeAttribute('inert');
        overlay.setAttribute('aria-hidden', 'false');
        hamburger.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
        if (closeBtn) closeBtn.focus();
    }

    function closeDrawer() {
        overlay.classList.remove('is-active', 'show');
        overlay.setAttribute('inert', 'true');
        overlay.setAttribute('aria-hidden', 'true');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        hamburger.focus();
    }

    hamburger.addEventListener('click', openDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

    // Close on overlay backdrop tap
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeDrawer();
        }
    });

    // Close on ESC key press
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('is-active')) {
            closeDrawer();
        }
    });
}

/* --- Dropdown Expand / Access Handling --- */
function setupDropdownAria() {
    const dropdowns = document.querySelectorAll('.nav-dropdown-wrapper');
    
    dropdowns.forEach(dropdown => {
        const trigger = dropdown.querySelector('.nav-dropdown-trigger');
        if (!trigger) return;

        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = dropdown.classList.contains('is-open');
            
            // Close other open dropdowns
            dropdowns.forEach(d => {
                d.classList.remove('is-open');
                d.querySelector('.nav-dropdown-trigger')?.setAttribute('aria-expanded', 'false');
            });

            if (!isOpen) {
                dropdown.classList.add('is-open');
                trigger.setAttribute('aria-expanded', 'true');
            }
        });
    });

    // Close dropdowns on clicking outside
    document.addEventListener('click', () => {
        dropdowns.forEach(d => {
            d.classList.remove('is-open');
            d.querySelector('.nav-dropdown-trigger')?.setAttribute('aria-expanded', 'false');
        });
    });
}

/* --- Content-Backed Dynamic Search Suggestion Engine --- */
function setupContentBackedSearch() {
    const searchInput = document.getElementById('navSearchInput');
    const suggestionBox = document.getElementById('searchSuggestionsBox');
    if (!searchInput || !suggestionBox) return;

    let debounceTimer = null;

    searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        const query = searchInput.value.trim();

        if (query.length < 2) {
            suggestionBox.innerHTML = '';
            suggestionBox.classList.remove('is-active');
            searchInput.setAttribute('aria-expanded', 'false');
            return;
        }

        debounceTimer = setTimeout(async () => {
            try {
                const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
                const result = await response.json();

                if (result.ok && Array.isArray(result.results) && result.results.length > 0) {
                    suggestionBox.textContent = '';
                    for (const item of result.results) {
                        const a = document.createElement('a');
                        a.href = item.url;
                        a.className = 'search-suggestion-item';

                        const icon = document.createElement('i');
                        icon.className = 'fa-solid fa-file-lines';
                        icon.style.opacity = '0.7';

                        const textContainer = document.createElement('div');
                        textContainer.style.display = 'flex';
                        textContainer.style.flexDirection = 'column';

                        const titleSpan = document.createElement('span');
                        titleSpan.style.fontWeight = '700';
                        titleSpan.style.fontSize = '13.5px';
                        titleSpan.textContent = item.title;

                        const descSpan = document.createElement('span');
                        descSpan.style.fontSize = '11px';
                        descSpan.style.opacity = '0.8';
                        descSpan.textContent = `${item.type} - ${item.description}`;

                        textContainer.appendChild(titleSpan);
                        textContainer.appendChild(descSpan);

                        a.appendChild(icon);
                        a.appendChild(textContainer);
                        suggestionBox.appendChild(a);
                    }
                    suggestionBox.classList.add('is-active');
                    searchInput.setAttribute('aria-expanded', 'true');
                } else {
                    suggestionBox.textContent = '';
                    const emptyDiv = document.createElement('div');
                    emptyDiv.style.padding = '12px 14px';
                    emptyDiv.style.textAlign = 'center';
                    emptyDiv.style.color = 'var(--uot-text-muted)';
                    emptyDiv.style.fontSize = '13px';
                    emptyDiv.textContent = `Tidak ada hasil untuk "${query}"`;
                    suggestionBox.appendChild(emptyDiv);
                    suggestionBox.classList.add('is-active');
                    searchInput.setAttribute('aria-expanded', 'true');
                }
            } catch (err) {
                console.error('[Search] Failed to fetch suggestions:', err);
            }
        }, 250);
    });

    // Close search suggestions on clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !suggestionBox.contains(e.target)) {
            suggestionBox.classList.remove('is-active');
            searchInput.setAttribute('aria-expanded', 'false');
        }
    });

    // Prevent propagation inside suggestion box to keep it open during clicks
    suggestionBox.addEventListener('click', (e) => {
        e.stopPropagation();
    });
}

function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>'"]/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;"
    })[char]);
}
