/* ==========================================================================
   COURSERA-STYLE HOMEPAGE LOGIC - UNIVERSE OF TECH
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    // Highlight active link based on current URL
    highlightActiveNavLink();

    // 1. Explore Mega Menu Toggle
    initExploreMenu();

    // 2. Search Autocomplete
    initSearchAutocomplete();

    // 3. Career Path Tab Switcher
    initCareerTabs();

    // 4. Outcomes Counter Animation
    initOutcomesCounter();
});

// --- 1. EXPLORE MEGA MENU LOGIC ---
function initExploreMenu() {
    const exploreBtn = document.getElementById("btnExplore");
    const megaMenu = document.getElementById("exploreMegaMenu");

    if (!exploreBtn || !megaMenu) return;

    exploreBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = megaMenu.classList.contains("show");
        
        if (isOpen) {
            megaMenu.classList.remove("show");
            exploreBtn.classList.remove("active");
        } else {
            megaMenu.classList.add("show");
            exploreBtn.classList.add("active");
            // Hide search box suggestions when mega menu opens
            const suggestionsBox = document.getElementById("searchSuggestionsBox");
            if (suggestionsBox) suggestionsBox.classList.remove("show");
        }
    });

    // Close on click outside
    document.addEventListener("click", (e) => {
        if (!megaMenu.contains(e.target) && e.target !== exploreBtn) {
            megaMenu.classList.remove("show");
            exploreBtn.classList.remove("active");
        }
    });
}

// --- 2. SEARCH AUTOCOMPLETE LOGIC ---
const searchIndex = [
    { name: "Variabel & Tipe Data", category: "Dasar Pemrograman", url: "materi-basic.html" },
    { name: "Looping & Percabangan", category: "Dasar Pemrograman", url: "materi-basic.html" },
    { name: "Fungsi & Problem Solving", category: "Dasar Pemrograman", url: "materi-basic.html" },
    { name: "HTML5 Semantic & SEO", category: "Web Development", url: "materi.html" },
    { name: "CSS Grid & Flexbox", category: "Web Development", url: "materi.html" },
    { name: "JavaScript DOM", category: "Web Development", url: "materi.html" },
    { name: "Array, Linked List, Stack", category: "Struktur Data", url: "materi.html" },
    { name: "Pohon Biner & Hash Table", category: "Struktur Data", url: "materi.html" },
    { name: "Object Oriented Programming (OOP)", category: "OOP Java/C++", url: "materi.html" },
    { name: "Simulasi Ujian SNBT", category: "TKA SNBT", url: "snbt.html" },
    { name: "LMS TKA SNBT UTBK", category: "LMS TKA", url: "tka-lms.html" },
    { name: "Library Rangkuman Buku", category: "Library", url: "library.html" },
    { name: "Wonderful Indonesia Budaya", category: "Kebudayaan", url: "bahasa-daerah.html" }
];

function initSearchAutocomplete() {
    const searchInput = document.getElementById("navSearchInput");
    const suggestionsBox = document.getElementById("searchSuggestionsBox");

    if (!searchInput || !suggestionsBox) return;

    searchInput.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase().trim();
        
        if (query === "") {
            suggestionsBox.classList.remove("show");
            return;
        }

        // Filter search items
        const results = searchIndex.filter(item => 
            item.name.toLowerCase().includes(query) || 
            item.category.toLowerCase().includes(query)
        ).slice(0, 5); // Limit to top 5 results

        if (results.length === 0) {
            suggestionsBox.innerHTML = `
                <div style="padding: 12px 16px; font-size: 13px; color: var(--muted); font-weight: bold; text-align: center;">
                    🔍 Tidak ada hasil untuk "${e.target.value}"
                </div>
            `;
        } else {
            suggestionsBox.innerHTML = results.map(item => `
                <div class="suggestion-item" data-url="${item.url}">
                    <i class="fa-solid fa-magnifying-glass"></i>
                    <span>${item.name}</span>
                    <span class="sugg-cat">${item.category}</span>
                </div>
            `).join("");

            // Add click listeners to items
            suggestionsBox.querySelectorAll(".suggestion-item").forEach(el => {
                el.addEventListener("click", () => {
                    const url = el.getAttribute("data-url");
                    if (url) {
                        // Play a sound if available
                        if (typeof playSound === "function") playSound("click");
                        window.location.href = url;
                    }
                });
            });
        }

        suggestionsBox.classList.add("show");
    });

    // Close on focus loss or click outside
    document.addEventListener("click", (e) => {
        if (!searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
            suggestionsBox.classList.remove("show");
        }
    });

    // Show suggestion box on focus if not empty
    searchInput.addEventListener("focus", () => {
        if (searchInput.value.trim() !== "") {
            suggestionsBox.classList.add("show");
            // Close explore menu if open
            const megaMenu = document.getElementById("exploreMegaMenu");
            const exploreBtn = document.getElementById("btnExplore");
            if (megaMenu) megaMenu.classList.remove("show");
            if (exploreBtn) exploreBtn.classList.remove("active");
        }
    });
}

// --- 3. CAREER PATH TAB SWITCHER LOGIC ---
function initCareerTabs() {
    const tabButtons = document.querySelectorAll(".career-tab-btn");
    const tabContents = document.querySelectorAll(".career-tab-content");

    if (tabButtons.length === 0) return;

    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const role = btn.getAttribute("data-role");

            // Deactivate all buttons
            tabButtons.forEach(b => b.classList.remove("active"));
            // Deactivate all contents
            tabContents.forEach(c => c.classList.remove("active"));

            // Activate current
            btn.classList.add("active");
            const activeContent = document.getElementById(`path-${role}`);
            if (activeContent) {
                activeContent.classList.add("active");
            }

            // Play a sound if available
            if (typeof playSound === "function") playSound("click");
        });
    });
}

// --- 4. OUTCOMES COUNTER ANIMATION ---
function initOutcomesCounter() {
    const outcomesSection = document.getElementById("outcomes-section");
    if (!outcomesSection) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Trigger counter animation
                startCounting();
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    observer.observe(outcomesSection);
}

function startCounting() {
    const counterElements = [
        { id: "outcome-ptn", target: 87, suffix: "%" },
        { id: "outcome-kerja", target: 92, suffix: "%" },
        { id: "outcome-cert", target: 15, suffix: "K+" } // Target 15, scale by 1000 dynamically or just count to 15
    ];

    counterElements.forEach(item => {
        const el = document.getElementById(item.id);
        if (!el) return;

        let current = 0;
        const duration = 1500; // 1.5 seconds
        const stepTime = Math.max(Math.floor(duration / item.target), 12);
        
        const timer = setInterval(() => {
            current += 1;
            el.textContent = current + item.suffix;

            if (current >= item.target) {
                el.textContent = item.target + item.suffix;
                clearInterval(timer);
            }
        }, stepTime);
    });
}

// --- 5. ACTIVE NAV LINK HIGHLIGHTER ---
function highlightActiveNavLink() {
    const path = window.location.pathname;
    const page = path.split("/").pop() || "index.html";
    
    const navLinks = document.querySelectorAll(".nav-links a");
    navLinks.forEach(link => {
        const href = link.getAttribute("href");
        if (href === page || (page === "index.html" && href === "#") || (page === "" && href === "index.html")) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });
}
