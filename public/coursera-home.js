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

    // 5. Feature Showcase Tabs & Interactive Demo
    initShowcaseTabs();

    // 6. FAQ Accordion Handler
    initFAQAccordion();

    // 7. Diagnostic Test Stepper
    initDiagnosticTest();
});

// --- 1. EXPLORE MEGA MENU LOGIC ---
function initExploreMenu() {
    if (window.QuizNationExplore) window.QuizNationExplore.render();
    const exploreBtn = document.getElementById("btnExplore");
    const megaMenu = document.getElementById("exploreMegaMenu");

    if (!exploreBtn || !megaMenu) return;

    const setMenuState = (open) => {
        megaMenu.classList.toggle("show", open);
        exploreBtn.classList.toggle("active", open);
        exploreBtn.setAttribute("aria-expanded", String(open));
        megaMenu.setAttribute("aria-hidden", String(!open));
    };

    exploreBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = megaMenu.classList.contains("show");
        
        if (isOpen) {
            setMenuState(false);
        } else {
            setMenuState(true);
            // Hide search box suggestions when mega menu opens
            const suggestionsBox = document.getElementById("searchSuggestionsBox");
            if (suggestionsBox) suggestionsBox.classList.remove("show");
        }
    });

    // Close on click outside
    document.addEventListener("click", (e) => {
        if (!megaMenu.contains(e.target) && e.target !== exploreBtn) {
            setMenuState(false);
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && megaMenu.classList.contains("show")) {
            setMenuState(false);
            exploreBtn.focus();
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
    { name: "Dasar SQL & Database Relasional", category: "SQL Database", url: "materi.html" },
    { name: "Query, Filter & JOIN SQL", category: "SQL Database", url: "materi.html" },
    { name: "Array, Linked List, Stack", category: "Struktur Data", url: "materi.html" },
    { name: "Pohon Biner & Hash Table", category: "Struktur Data", url: "materi.html" },
    { name: "Object Oriented Programming (OOP)", category: "OOP Java/C++", url: "materi.html" },
    { name: "Simulasi Ujian SNBT", category: "TKA SNBT", url: "snbt.html" },
    { name: "LMS TKA SNBT UTBK", category: "LMS TKA", url: "tka-lms.html" },
    { name: "Library Rangkuman Buku", category: "Library", url: "library.html" },
    { name: "Proyek Portofolio Teknologi", category: "Proyek", url: "projects.html" },
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
            searchInput.setAttribute("aria-expanded", "false");
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
                <div class="suggestion-item" data-url="${item.url}" role="option" tabindex="0">
                    <i class="fa-solid fa-magnifying-glass"></i>
                    <span>${item.name}</span>
                    <span class="sugg-cat">${item.category}</span>
                </div>
            `).join("");

            // Add click listeners to items
            suggestionsBox.querySelectorAll(".suggestion-item").forEach(el => {
                const openResult = () => {
                    const url = el.getAttribute("data-url");
                    if (url) {
                        // Play a sound if available
                        if (typeof playSound === "function") playSound("click");
                        window.location.href = url;
                    }
                };
                el.addEventListener("click", openResult);
                el.addEventListener("keydown", (event) => {
                    if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openResult();
                    }
                });
            });
        }

        suggestionsBox.classList.add("show");
        searchInput.setAttribute("aria-expanded", "true");
    });

    // Close on focus loss or click outside
    document.addEventListener("click", (e) => {
        if (!searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
            suggestionsBox.classList.remove("show");
            searchInput.setAttribute("aria-expanded", "false");
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
            if (megaMenu) megaMenu.setAttribute("aria-hidden", "true");
            if (exploreBtn) {
                exploreBtn.classList.remove("active");
                exploreBtn.setAttribute("aria-expanded", "false");
            }
        }
    });

    searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            suggestionsBox.classList.remove("show");
            searchInput.setAttribute("aria-expanded", "false");
            searchInput.blur();
        } else if (e.key === "ArrowDown" && suggestionsBox.classList.contains("show")) {
            const items = suggestionsBox.querySelectorAll(".suggestion-item");
            if (items.length > 0) {
                e.preventDefault();
                items[0].focus();
            }
        }
    });

    suggestionsBox.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            const items = Array.from(suggestionsBox.querySelectorAll(".suggestion-item"));
            const activeIndex = items.indexOf(document.activeElement);
            if (activeIndex !== -1) {
                e.preventDefault();
                let nextIndex = activeIndex + (e.key === "ArrowDown" ? 1 : -1);
                if (nextIndex >= 0 && nextIndex < items.length) {
                    items[nextIndex].focus();
                } else if (nextIndex < 0) {
                    searchInput.focus();
                }
            }
        } else if (e.key === "Escape") {
            suggestionsBox.classList.remove("show");
            searchInput.setAttribute("aria-expanded", "false");
            searchInput.focus();
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

// --- 6. FEATURE SHOWCASE TABS & DEMO INTERACTION ---
function initShowcaseTabs() {
    const tabs = document.querySelectorAll(".showcase-tab");
    const screens = document.querySelectorAll(".showcase-screen");
    
    if (tabs.length === 0) return;
    if (document.documentElement.dataset.showcaseTabsReady === "true") return;
    document.documentElement.dataset.showcaseTabsReady = "true";

    tabs.forEach((tab, index) => {
        tab.setAttribute("role", "tab");
        tab.setAttribute("tabindex", tab.classList.contains("active") ? "0" : "-1");
        tab.setAttribute("aria-selected", String(tab.classList.contains("active")));
        const activateTab = () => {
            const feature = tab.getAttribute("data-feature");
            
            // Deactivate all
            tabs.forEach(t => {
                t.classList.remove("active");
                t.setAttribute("aria-selected", "false");
                t.setAttribute("tabindex", "-1");
            });
            screens.forEach(s => s.classList.remove("active"));
            
            // Activate current
            tab.classList.add("active");
            tab.setAttribute("aria-selected", "true");
            tab.setAttribute("tabindex", "0");
            const targetScreen = document.getElementById(`feat-${feature}`);
            if (targetScreen) {
                targetScreen.classList.add("active");
            }
            
            if (typeof playSound === "function") playSound("click");
        };
        tab.addEventListener("click", activateTab);
        tab.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                activateTab();
            }
        });
    });
}

// Global Demo Interactive Functions (inline onclick handlers)
window.checkDemoQuiz = function(btn, isCorrect) {
    const options = btn.parentElement.querySelectorAll(".demo-opt");
    const feedback = document.getElementById("demoQuizFeedback");
    
    options.forEach(opt => {
        opt.style.pointerEvents = "none";
        opt.style.opacity = "0.65";
    });
    
    btn.style.opacity = "1";
    
    if (isCorrect) {
        btn.style.background = "var(--green, #10b981)";
        btn.style.color = "#fff";
        btn.style.borderColor = "var(--green, #10b981)";
        if (feedback) {
            feedback.innerHTML = "🎉 <strong>Tepat Sekali!</strong> &lt;article&gt;, &lt;section&gt;, dan &lt;header&gt; adalah tag semantic HTML5 yang mendefinisikan struktur mandiri dan membantu performa SEO web.";
            feedback.style.color = "var(--green, #10b981)";
            feedback.style.padding = "12px";
            feedback.style.background = "rgba(16, 185, 129, 0.12)";
            feedback.style.borderRadius = "8px";
            feedback.style.marginTop = "14px";
            feedback.style.display = "block";
        }
        if (typeof playSound === "function") playSound("correct");
    } else {
        btn.style.background = "var(--red, #ef4444)";
        btn.style.color = "#fff";
        btn.style.borderColor = "var(--red, #ef4444)";
        if (feedback) {
            feedback.innerHTML = "💡 <strong>Kurang tepat.</strong> &lt;div&gt; dan &lt;span&gt; adalah tag non-semantic. Pilih tag semantic yang menjelaskan makna konten kepada mesin pencari.";
            feedback.style.color = "#ef4444";
            feedback.style.padding = "12px";
            feedback.style.background = "rgba(239, 68, 68, 0.12)";
            feedback.style.borderRadius = "8px";
            feedback.style.marginTop = "14px";
            feedback.style.display = "block";
        }
        if (typeof playSound === "function") playSound("wrong");
    }
};

let demoStreakCount = 0;
window.increaseStreakDemo = function(btn) {
    demoStreakCount++;
    const valEl = document.getElementById("demoStreakVal");
    if (valEl) {
        const flames = "🔥".repeat(Math.min(demoStreakCount, 5));
        valEl.textContent = `${demoStreakCount} Hari Streak! ${flames}`;
        valEl.style.transform = "scale(1.15)";
        setTimeout(() => valEl.style.transform = "scale(1)", 250);
    }
    
    if (btn) {
        btn.textContent = `✅ Streak Hari Ke-${demoStreakCount} Diklaim!`;
        btn.style.background = "var(--green, #10b981)";
        btn.style.color = "#fff";
        btn.style.borderColor = "var(--green, #10b981)";
    }
    
    if (typeof playSound === "function") playSound("success");
};

let demoXpCount = 0;
window.boostXPDemo = function(btn) {
    demoXpCount += 100;
    const xpEl = document.getElementById("myDemoXpVal");
    if (xpEl) {
        xpEl.textContent = `${demoXpCount.toLocaleString("id-ID")} XP`;
        xpEl.style.transform = "scale(1.2)";
        xpEl.style.color = "#10b981";
        setTimeout(() => xpEl.style.transform = "scale(1)", 250);
    }
    
    if (btn) {
        btn.textContent = `🚀 +100 XP Ditambahkan! (Total: ${demoXpCount})`;
        btn.style.background = "rgba(16, 185, 129, 0.15)";
        btn.style.borderColor = "#10b981";
        btn.style.color = "#10b981";
    }
    if (typeof playSound === "function") playSound("coin");
};

// --- 7. DIAGNOSTIC TEST STEPPER & ROADMAP GENERATOR ---
let diagState = {
    step1: "coding",
    step2: "30",
    step3: "newbie"
};

function initDiagnosticTest() {
    // Reset to step 1 on load
    const step1 = document.getElementById("diag-step-1");
    if (step1 && !document.querySelector(".diag-step.active")) {
        step1.classList.add("active");
    }
}

window.selectDiagOption = function(stepNum, btn) {
    const parent = document.getElementById(`diag-step-${stepNum}`);
    if (!parent) return;
    
    parent.querySelectorAll(".diag-pill").forEach(p => p.classList.remove("active", "selected"));
    btn.classList.add("active", "selected");
    
    const val = btn.getAttribute("data-val");
    if (stepNum === 1) diagState.step1 = val;
    if (stepNum === 2) diagState.step2 = val;
    if (stepNum === 3) diagState.step3 = val;
    
    if (typeof playSound === "function") playSound("click");
};

window.nextDiagStep = function(currentStep) {
    const currentEl = document.getElementById(`diag-step-${currentStep}`);
    if (currentEl) currentEl.classList.remove("active");
    
    if (currentStep === 1 || currentStep === 2) {
        const nextEl = document.getElementById(`diag-step-${currentStep + 1}`);
        if (nextEl) {
            nextEl.classList.add("active");
            // Highlight default if none selected
            if (!nextEl.querySelector(".diag-pill.selected")) {
                const firstPill = nextEl.querySelector(".diag-pill");
                if (firstPill) firstPill.classList.add("active", "selected");
            }
        }
        if (typeof playSound === "function") playSound("swoosh");
    } else if (currentStep === 3) {
        // Show loading spinner
        const loadingEl = document.getElementById("diag-step-loading");
        if (loadingEl) loadingEl.classList.add("active");
        if (typeof playSound === "function") playSound("swoosh");
        
        setTimeout(() => {
            if (loadingEl) loadingEl.classList.remove("active");
            generateDiagResult();
            const resultEl = document.getElementById("diag-step-result");
            if (resultEl) resultEl.classList.add("active");
            if (typeof playSound === "function") playSound("success");
        }, 1300);
    }
};

window.prevDiagStep = function(currentStep) {
    const currentEl = document.getElementById(`diag-step-${currentStep}`);
    if (currentEl) currentEl.classList.remove("active");
    
    const prevEl = document.getElementById(`diag-step-${currentStep - 1}`);
    if (prevEl) prevEl.classList.add("active");
    if (typeof playSound === "function") playSound("click");
};

window.resetDiag = function() {
    document.querySelectorAll(".diag-step").forEach(s => s.classList.remove("active"));
    const step1 = document.getElementById("diag-step-1");
    if (step1) step1.classList.add("active");
    if (typeof playSound === "function") playSound("click");
};

function generateDiagResult() {
    const titleEl = document.getElementById("diag-result-title");
    const descEl = document.getElementById("diag-result-desc");
    const startBtn = document.getElementById("diag-start-btn");
    
    const t1 = document.getElementById("diag-road-title-1");
    const p1 = document.getElementById("diag-road-1");
    const t2 = document.getElementById("diag-road-title-2");
    const p2 = document.getElementById("diag-road-2");
    const t3 = document.getElementById("diag-road-title-3");
    const p3 = document.getElementById("diag-road-3");
    
    if (diagState.step1 === "tka") {
        if (titleEl) titleEl.textContent = "Akselerasi Intensif TKA & TPS SNBT 2026";
        if (descEl) descEl.textContent = `Jalur belajar intensif dengan ritme ${diagState.step2} menit/hari yang disesuaikan untuk tingkat ${diagState.step3 === 'newbie' ? 'pemula' : 'lanjutan'}.`;
        if (startBtn) startBtn.href = "snbt.html";
        
        if (t1) t1.textContent = "Hari 1-5: Diagnosis & Pola Soal IRT";
        if (p1) p1.textContent = "Memahami bobot skoring IRT dan strategi manajemen waktu penalaran umum.";
        if (t2) t2.textContent = "Hari 6-10: Drill Adaptif & Bank Soal";
        if (p2) p2.textContent = "Latihan kuis harian dengan fokus pada subtes yang paling membutuhkan peningkatan skor.";
        if (t3) t3.textContent = "Hari 11-15: Tryout Nasional & Evaluasi";
        if (p3) p3.textContent = "Simulasi ujian penuh dengan skoring IRT real-time dan analisis peluang kelulusan.";
    } else if (diagState.step1 === "design") {
        if (titleEl) titleEl.textContent = "UI/UX & Product Design Mastery";
        if (descEl) descEl.textContent = `Kurikulum terstruktur merancang antarmuka profesional dengan ritme konsisten ${diagState.step2} menit/hari.`;
        if (startBtn) startBtn.href = "materi.html";
        
        if (t1) t1.textContent = "Hari 1-5: Prinsip Desain & Wireframing";
        if (p1) p1.textContent = "Mempelajari hierarki visual, tipografi, psikologi warna, dan struktur layout UI.";
        if (t2) t2.textContent = "Hari 6-10: Prototyping & Design System";
        if (p2) p2.textContent = "Membangun komponen interaktif dan sistem desain konsisten berstandar industri.";
        if (t3) t3.textContent = "Hari 11-15: Case Study & Portofolio Karir";
        if (p3) p3.textContent = "Menyelesaikan proyek desain aplikasi nyata untuk lampiran portofolio profesional.";
    } else {
        // Coding (default)
        if (titleEl) titleEl.textContent = "Fullstack Software Engineering Bootcamp";
        if (descEl) descEl.textContent = `Jalur pengembangan karir developer modern dengan ritme konsisten ${diagState.step2} menit/hari.`;
        if (startBtn) startBtn.href = "materi-basic.html";
        
        if (t1) t1.textContent = "Hari 1-5: Pondasi Logika & Web Dasar";
        if (p1) p1.textContent = "Menguasai struktur HTML5 semantic, CSS3 Grid/Flexbox, dan algoritma dasar JavaScript.";
        if (t2) t2.textContent = "Hari 6-10: Pengembangan Aplikasi DOM & Async";
        if (p2) p2.textContent = "Membangun antarmuka web dinamis, manipulasi DOM, dan integrasi data API eksternal.";
        if (t3) t3.textContent = "Hari 11-15: Capstone Project & Sertifikasi Resmi";
        if (p3) p3.textContent = "Penyelesaian proyek akhir berskala industri dan klaim e-sertifikat terverifikasi.";
    }
}

// --- 8. FAQ ACCORDION LOGIC ---
function initFAQAccordion() {
    const faqQuestions = document.querySelectorAll(".faq-question");
    
    if (faqQuestions.length === 0) return;
    if (document.documentElement.dataset.faqReady === "true") return;
    document.documentElement.dataset.faqReady = "true";
    
    faqQuestions.forEach((btn, index) => {
        const item = btn.closest(".faq-item");
        const answer = item ? item.querySelector(".faq-answer") : null;
        if (answer) {
            const answerId = `faq-answer-${index + 1}`;
            answer.id = answerId;
            btn.setAttribute("aria-controls", answerId);
        }
        btn.setAttribute("aria-expanded", "false");
        btn.addEventListener("click", () => {
            const item = btn.closest(".faq-item");
            if (!item) return;
            
            const isOpen = item.classList.contains("open") || item.classList.contains("active");
            
            // Close all items first for clean single-accordion behavior
            document.querySelectorAll(".faq-item").forEach(el => {
                el.classList.remove("active", "open");
                const ans = el.querySelector(".faq-answer");
                if (ans) {
                    ans.style.maxHeight = null;
                }
                const question = el.querySelector(".faq-question");
                if (question) question.setAttribute("aria-expanded", "false");
            });
            
            // If it was not active/open, expand it
            if (!isOpen) {
                item.classList.add("active", "open");
                btn.setAttribute("aria-expanded", "true");
                const answer = item.querySelector(".faq-answer");
                if (answer) {
                    answer.style.maxHeight = answer.scrollHeight + 30 + "px";
                }
                if (typeof playSound === "function") playSound("click");
            }
        });
    });
}

