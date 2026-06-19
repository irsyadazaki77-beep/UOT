(function () {
    "use strict";

    // Enable iOS CSS active state touch feedback
    document.addEventListener("touchstart", () => {}, { passive: true });

    // Global Visual Error Catcher for Debugging
    const showDebugErrors = new URLSearchParams(location.search).get("debug") === "1"
        || localStorage.getItem("qnDebugErrors") === "1";
    if (showDebugErrors) window.addEventListener("error", (e) => {
        const div = document.createElement("div");
        div.style.position = "fixed";
        div.style.top = "0";
        div.style.left = "0";
        div.style.width = "100%";
        div.style.background = "#ef4444";
        div.style.color = "white";
        div.style.padding = "20px";
        div.style.zIndex = "999999";
        div.style.fontFamily = "monospace";
        div.style.fontSize = "14px";
        div.style.whiteSpace = "pre-wrap";
        div.textContent = `CRASH DETECTED: ${e.message}\nAt: ${e.filename}:${e.lineno}:${e.colno}\n\nStack:\n${e.error ? e.error.stack : 'No stack'}`;
        document.body.appendChild(div);
    });

    const curriculum = window.QNCurriculum;
    if (!curriculum) return;

    const dashboard = document.getElementById("curriculumDashboard");
    if (!dashboard) return;

    // Robust local storage wrapper that falls back to in-memory object on security restrictions (like file:// protocol)
    const safeStorage = {
        getItem(key) {
            try {
                return localStorage.getItem(key);
            } catch {
                return safeStorage.fallbackStore[key] || null;
            }
        },
        setItem(key, value) {
            try {
                localStorage.setItem(key, value);
            } catch {
                safeStorage.fallbackStore[key] = String(value);
            }
        },
        removeItem(key) {
            try {
                localStorage.removeItem(key);
            } catch {
                delete safeStorage.fallbackStore[key];
            }
        },
        fallbackStore: {}
    };

    // Local Storage keys
    const BOOKMARKS_KEY = "eduquestBookmarks";
    const SESSION_KEY = "eduquestUserSession";
    const PRO_KEY = "eduquestSubscription";
    const NOTES_KEY = "eduquestStudyNotes";

    // Read bookmarks
    let bookmarks = readJSON(BOOKMARKS_KEY, []);
    if (!Array.isArray(bookmarks)) {
        bookmarks = [];
    }

    let state = {
        query: "",
        category: "all",
        level: "all",
        status: "all",
        sort: "recommended",
        view: safeStorage.getItem("curriculumView") || "grid",
        activeTab: "learn",
        drawerTrackId: null,
        showOnlyBookmarked: false,
        focusMode: false
    };

    const careerGoalMap = {
        frontend: ["web", "design", "programming", "git", "testing", "gamedev", "product"],
        backend: ["programming", "backend", "database", "cloud", "cyber", "testing", "iot", "blockchain", "sysdesign", "linux", "nosql"],
        data: ["analytics", "database", "programming", "ai", "testing", "datascience", "dataware", "nosql", "product"],
        security: ["cyber", "web", "backend", "cloud", "database", "blockchain", "sysdesign", "networks", "linux"],
        ai: ["ai", "programming", "analytics", "backend", "cloud", "datascience"]
    };

    function readJSON(key, fallback) {
        try {
            return JSON.parse(safeStorage.getItem(key) || "null") ?? fallback;
        } catch {
            return fallback;
        }
    }

    function isProUser() {
        return safeStorage.getItem(PRO_KEY) === "pro";
    }

    // Render primary skeleton
    dashboard.innerHTML = `
        <div class="curriculum-shell">
            <!-- Top Controls: Focus Mode & Live simulated count -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 10px;">
                <div class="live-room-pill" id="liveUserCounter">
                    <span class="live-room-dot"></span>
                    <strong id="liveUserVal">243</strong> siswa sedang belajar sekarang
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-ghost" id="btnFocusMode" type="button" style="min-height: 38px; padding: 6px 12px; font-size:11px;">
                        <i class="fa-solid fa-eye-slash"></i> Focus Mode
                    </button>
                    <button class="btn btn-ghost" id="btnOpenBubub" type="button" style="min-height: 38px; padding: 6px 12px; font-size:11px; background: rgba(79, 140, 255, 0.1); border-color: rgba(79, 140, 255, 0.2); color: var(--blue);">
                        <i class="fa-solid fa-sparkles"></i> BUBUB
                    </button>
                </div>
            </div>

            <div class="curriculum-overview">
                <div class="curriculum-summary-card">
                    <div>
                        <div class="section-kicker">Learning Command Center ${isProUser() ? '<span class="pro-premium-badge-gold">PRO BOOST</span>' : ''}</div>
                        <h2 id="curriculumContinueTitle">Mulai jalur profesionalmu.</h2>
                        <p id="curriculumContinueText">Pilih jalur, ikuti prerequisite, selesaikan checkpoint, dan buktikan kemampuan lewat capstone.</p>
                        <a class="btn btn-primary" id="curriculumContinueBtn" href="materi-basic.html?topik=programming">Mulai Belajar</a>
                    </div>
                    <div class="curriculum-ring" id="curriculumRing"><strong id="curriculumPercent">0%</strong></div>
                </div>
                <div class="curriculum-metric"><strong id="curriculumTrackCount">12</strong><span>Jalur profesional</span></div>
                <div class="curriculum-metric"><strong id="curriculumLessonCount">144</strong><span>Pelajaran terstruktur</span></div>
                <div class="curriculum-metric"><strong id="curriculumMasteredCount">0</strong><span>Pelajaran mastered</span></div>
            </div>

            <div class="curriculum-tabs" role="tablist" aria-label="Area pembelajaran">
                <button class="curriculum-tab active" type="button" role="tab" aria-selected="true" data-tab="learn">Belajar</button>
                <button class="curriculum-tab" type="button" role="tab" aria-selected="false" data-tab="practice">Latihan &amp; Radar</button>
                <button class="curriculum-tab" type="button" role="tab" aria-selected="false" data-tab="tools">Playground Tools</button>
                <button class="curriculum-tab" type="button" role="tab" aria-selected="false" data-tab="reference">Referensi &amp; Flashcards</button>
                <button class="curriculum-tab" type="button" role="tab" aria-selected="false" data-tab="achievements"><i class="fa-solid fa-trophy"></i> Trophy Case</button>
            </div>

            <!-- TAB 1: BELAJAR -->
            <div class="curriculum-panel" id="curriculumPanelLearn" data-panel="learn">
                <div class="curriculum-toolbar" style="position:relative;">
                    <div style="position:relative; width: 100%; display: flex; align-items:center; gap: 8px;">
                        <input id="curriculumSearch" type="search" placeholder="Cari jalur, bab, skill..." aria-label="Cari materi" autocomplete="off">
                        <!-- Auto-suggest box -->
                        <div class="search-auto-suggest-box" id="searchSuggestBox"></div>
                    </div>
                    <select id="curriculumCareerGoal" aria-label="Target Karier">
                        <option value="frontend">Target: Frontend</option>
                        <option value="backend">Target: Backend</option>
                        <option value="data">Target: Data Analyst</option>
                        <option value="security">Target: Security</option>
                        <option value="ai">Target: AI Builder</option>
                    </select>
                    <select id="curriculumCategory" aria-label="Filter kategori"><option value="all">Semua kategori</option></select>
                    <select id="curriculumLevel" aria-label="Filter level">
                        <option value="all">Semua level</option>
                        <option value="Pemula">Pemula</option>
                        <option value="Menengah">Menengah</option>
                        <option value="Lanjut">Lanjut</option>
                    </select>
                    <select id="curriculumStatus" aria-label="Filter status">
                        <option value="all">Semua status</option>
                        <option value="available">Tersedia</option>
                        <option value="in_progress">Sedang dipelajari</option>
                        <option value="completed">Selesai</option>
                        <option value="locked">Terkunci</option>
                    </select>
                    <select id="curriculumSort" aria-label="Urutkan materi">
                        <option value="recommended">Rekomendasi</option>
                        <option value="duration">Durasi Tercepat</option>
                        <option value="progress">Progres Terbanyak</option>
                        <option value="title">Nama A-Z</option>
                    </select>
                    <div style="display:flex; gap: 6px; align-items:center;">
                        <button class="filter-btn" id="btnFilterBookmarks" type="button" style="padding: 10px 12px; min-height: 44px; display:inline-flex; align-items:center;" title="Tampilkan Bookmark Saja">
                            <i class="fa-solid fa-star"></i>
                        </button>
                        <div class="curriculum-view-toggle" aria-label="Mode tampilan">
                            <button type="button" data-view="grid" aria-label="Tampilan grid">▦</button>
                            <button type="button" data-view="list" aria-label="Tampilan daftar">☷</button>
                        </div>
                    </div>
                </div>
                <div class="curriculum-results-meta" id="curriculumResultsMeta"></div>
                <div class="curriculum-grid" id="curriculumGrid"></div>
                <div class="curriculum-legacy-panel" id="curriculumLearnLegacy"></div>
            </div>

            <!-- TAB 2: LATIHAN & RADAR -->
            <div class="curriculum-panel" id="curriculumPanelPractice" data-panel="practice" hidden>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px;">
                    <div>
                        <div class="section-kicker">Performance Radar</div>
                        <h3>Pro Skill Analyzer</h3>
                        <p style="color: var(--muted); font-size:12.5px; margin-bottom: 8px;">Persebaran keahlian Anda di 5 sektor teknologi utama berdasarkan materi koding yang diselesaikan.</p>
                        <!-- SVG Skill Radar -->
                        <div class="radar-chart-container" id="radarContainer">
                            <!-- SVG will be injected here -->
                        </div>
                    </div>
                    <div>
                        <div class="section-kicker">Interactive Drill</div>
                        <h3>Pomodoro Study Timer</h3>
                        <p style="color: var(--muted); font-size:12.5px; margin-bottom: 8px;">Gunakan metode Pomodoro untuk membagi sesi belajar Anda menjadi blok fokus terfokus.</p>
                        <!-- Pomodoro widget -->
                        <div class="pomodoro-widget" id="pomodoroContainer">
                            <span class="section-kicker">Timer Fokus</span>
                            <div class="pomodoro-timer-display" id="pomoTime">25:00</div>
                            <div class="pomodoro-controls">
                                <button class="pomodoro-btn start-btn" id="btnPomoStart" type="button">Start</button>
                                <button class="pomodoro-btn" id="btnPomoReset" type="button">Reset</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- TAB 3: PLAYGROUND TOOLS -->
            <div class="curriculum-panel" id="curriculumPanelTools" data-panel="tools" hidden>
                <div style="max-width: 720px; margin: 0 auto;">
                    <div class="section-kicker">Code Sandbox</div>
                    <h3>Pro JS Live Playground</h3>
                    <p style="color: var(--muted); font-size:13px; margin-bottom: 12px;">Eksklusif untuk latihan: Tulis kode JavaScript standar di bawah dan jalankan langsung untuk melihat output log secara real-time.</p>
                    <div class="code-sandbox-box">
                        <textarea id="sandboxCode" placeholder="// Tulis kode JS di sini...&#10;let nama = 'Elite Dev';&#10;console.log('Halo ' + nama);&#10;console.log('XP bonus: ' + (50 * 2));" autocomplete="off" spellcheck="false"></textarea>
                        <div style="display:flex; justify-content: space-between; align-items:center;">
                            <span style="font-size:11px; color:rgba(255,255,255,0.4);">Console Output</span>
                            <button class="btn btn-blue" id="btnRunCode" type="button" style="min-height:38px; padding: 6px 16px;">Jalankan Kode ⚡</button>
                        </div>
                        <div class="code-sandbox-output" id="sandboxOutput">> Ready to compile...</div>
                    </div>
                </div>
            </div>

            <!-- TAB 4: REFERENSI & FLASHCARDS -->
            <div class="curriculum-panel" id="curriculumPanelReference" data-panel="reference" hidden>
                <div style="max-width: 600px; margin: 0 auto;">
                    <div class="section-kicker">Study Flashcards</div>
                    <h3>Interactive Glossary Flashcards</h3>
                    <p style="color: var(--muted); font-size:13px; margin-bottom: 12px;">Klik kartu di bawah untuk membalik dan melihat arti istilah koding penting.</p>
                    
                    <div class="flashcard-flip-container" id="flashcardBox">
                        <div class="flashcard-inner-card">
                            <div class="flashcard-front">
                                <strong id="flashcardTerm">HTML (HyperText Markup Language)</strong>
                                <span style="font-size: 10px; color:var(--muted); margin-top: 14px;">Klik untuk melihat arti</span>
                            </div>
                            <div class="flashcard-back">
                                <p id="flashcardDefinition">Bahasa markup standar untuk membuat dan menyusun struktur halaman web dasar.</p>
                                <span style="font-size: 10px; color:var(--muted); margin-top: 14px;">Klik untuk melihat istilah</span>
                            </div>
                        </div>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items:center; margin-top: 12px;">
                        <button class="btn btn-ghost" id="btnPrevCard" type="button" style="min-height:36px; padding: 6px 12px;"><i class="fa-solid fa-arrow-left"></i></button>
                        <span id="flashcardIndexText" style="font-size:12px; font-weight:800;">1 / 10</span>
                        <button class="btn btn-ghost" id="btnNextCard" type="button" style="min-height:36px; padding: 6px 12px;"><i class="fa-solid fa-arrow-right"></i></button>
                    </div>
                </div>
            </div>

            <!-- TAB 5: TROPHY CASE (NEW) -->
            <div class="curriculum-panel" id="curriculumPanelAchievements" data-panel="achievements" hidden>
                <div class="section-kicker">Trophy Case</div>
                <h3 style="margin-bottom: 16px;">Sertifikat &amp; Lencana Anda</h3>
                <div class="achievement-grid" id="achievementGridBox">
                    <!-- Achievements rendered dynamically -->
                </div>
            </div>
        </div>
    `;
    document.getElementById("btnOpenBubub")?.addEventListener("click", () => {
        window.BUBUBAI?.open();
        if (typeof playSound === "function") playSound("click");
    });
    // Fast Resume Floating Button Injection
    if (!document.getElementById("fastResumeBtn")) {
        const resumeBtn = document.createElement("button");
        resumeBtn.id = "fastResumeBtn";
        resumeBtn.className = "fast-resume-btn";
        resumeBtn.type = "button";
        resumeBtn.innerHTML = `<i class="fa-solid fa-play"></i> Lanjutkan Pelajaran Terakhir`;
        document.body.appendChild(resumeBtn);
        
        // Show / Hide on scroll
        window.addEventListener("scroll", () => {
            if (window.scrollY > 200) {
                resumeBtn.classList.add("show");
            } else {
                resumeBtn.classList.remove("show");
            }
        });

        resumeBtn.addEventListener("click", () => {
            const progress = curriculum.readProgress();
            const lastTrackId = progress.lastTrackId || curriculum.tracks[0].id;
            const lastLessonId = progress.lastLessonId || nextLesson(curriculum.getTrack(lastTrackId), progress).id;
            location.href = `materi-basic.html?topik=${lastTrackId}&lesson=${lastLessonId}`;
        });
    }

    const categorySelect = document.getElementById("curriculumCategory");
    Object.entries(curriculum.categories).forEach(([value, label]) => {
        categorySelect.insertAdjacentHTML("beforeend", `<option value="${value}">${label}</option>`);
    });

    const elements = {
        grid: document.getElementById("curriculumGrid"),
        results: document.getElementById("curriculumResultsMeta"),
        search: document.getElementById("curriculumSearch"),
        careerGoal: document.getElementById("curriculumCareerGoal"),
        category: categorySelect,
        level: document.getElementById("curriculumLevel"),
        status: document.getElementById("curriculumStatus"),
        sort: document.getElementById("curriculumSort"),
        ring: document.getElementById("curriculumRing"),
        percent: document.getElementById("curriculumPercent"),
        mastered: document.getElementById("curriculumMasteredCount"),
        continueTitle: document.getElementById("curriculumContinueTitle"),
        continueText: document.getElementById("curriculumContinueText"),
        continueBtn: document.getElementById("curriculumContinueBtn")
    };

    // --- LEGACHY COMPATIBILITY & MOVEMENT ---
    function moveLegacySections() {
        const oldModule = document.getElementById("modul");
        const learningOs = document.getElementById("learning-os");
        if (oldModule) oldModule.hidden = true;
        if (learningOs) learningOs.hidden = true;

        const roadmap = oldModule?.nextElementSibling;
        const planner = document.querySelector(".planner-layout");
        const drill = document.querySelector(".drill-card");
        const sandbox = document.getElementById("sandbox-section");
        const glossary = document.getElementById("glossaryGridList")?.closest("section");
        const toolsPanel = document.getElementById("curriculumPanelTools");
        if (toolsPanel && !document.getElementById("curriculumBububDock")) {
            const aiDock = document.createElement("section");
            aiDock.className = "curriculum-ai-dock";
            aiDock.id = "curriculumBububDock";
            aiDock.innerHTML = `
                <div>
                    <div class="section-kicker">BUBUB</div>
                    <h2>Diskusikan materi bersama BUBUB.</h2>
                    <p>Gunakan BUBUB untuk meminta penjelasan ulang, contoh, atau arah latihan berikutnya.</p>
                    <button class="btn btn-primary" id="btnOpenDockBubub" type="button" style="margin-top: 12px; font-weight: 800;">Buka BUBUB</button>
                </div>
            `;
            toolsPanel.appendChild(aiDock);
            document.getElementById("btnOpenDockBubub")?.addEventListener("click", () => window.BUBUBAI?.open());
        }
        if (glossary) document.getElementById("curriculumPanelReference").appendChild(glossary);
    }

    function trackSearchText(track) {
        return [
            track.title,
            track.summary,
            track.project,
            track.capstone.title,
            track.capstone.brief,
            track.categoryLabel,
            track.level,
            track.careerTags.join(" "),
            ...track.chapters.flatMap((chapter) => [chapter.title, ...chapter.lessons.map((lesson) => lesson.title)])
        ].join(" ").toLowerCase();
    }

    function getStatus(track, progress) {
        const value = curriculum.getTrackProgress(track.id, progress);
        if (!curriculum.isTrackUnlocked(track, progress)) return "locked";
        if (value.percent === 100) return "completed";
        if (value.completed > 0) return "in_progress";
        return "available";
    }

    function statusLabel(status) {
        return {
            locked: "Terkunci",
            completed: "Selesai",
            in_progress: "Berjalan",
            available: "Tersedia"
        }[status];
    }

    function nextLesson(track, progress) {
        return curriculum.flattenLessons(track).find(({ lesson }) => {
            const status = curriculum.getLessonState(track.id, lesson.id, progress);
            return status === "available" || status === "in_progress";
        })?.lesson || curriculum.flattenLessons(track)[0].lesson;
    }

    // --- RENDER DYNAMIC SKILL RADAR SVG ---
    function renderRadarChart() {
        const container = document.getElementById("radarContainer");
        if (!container) return;

        if (!isProUser()) {
            container.style.position = "relative";
            container.innerHTML = `
                <div style="position: absolute; inset: 0; background: rgba(11, 21, 35, 0.82); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 20px; padding: 16px; text-align: center; border: 1px solid rgba(255,255,255,0.06);">
                    <i class="fa-solid fa-crown" style="font-size: 28px; color: #ffd166; margin-bottom: 8px; filter: drop-shadow(0 0 8px rgba(255, 209, 102, 0.4));"></i>
                    <h5 style="color: white; font-size: 13.5px; font-weight: 800; margin-bottom: 4px;">Pro Skill Radar</h5>
                    <p style="color: rgba(255,255,255,0.7); font-size: 11.5px; max-width: 240px; margin-bottom: 12px; line-height: 1.4;">Analisis persebaran skill koding Anda secara detail lewat diagram radar interaktif.</p>
                    <a href="profile.html" class="btn" style="background: linear-gradient(135deg, #ffd166, #ff9f43); color: #0d1726; font-weight: 900; border-radius: 10px; font-size: 10.5px; min-height: 32px; padding: 6px 12px;">
                        Upgrade Pro 👑
                    </a>
                </div>
            `;
            return;
        }
        const progress = curriculum.readProgress();

        // Core skills mapping
        const skills = [
            { name: "Frontend", key: "web", val: 20 },
            { name: "Database", key: "database", val: 20 },
            { name: "Programming", key: "programming", val: 20 },
            { name: "Cyber Sec", key: "cyber", val: 20 },
            { name: "AI Tech", key: "ai", val: 20 }
        ];

        // Read progress for each category to scale values
        skills.forEach(s => {
            const tracks = curriculum.tracks.filter(t => t.category === s.key);
            if (tracks.length === 0) return;
            let totalPercent = 0;
            tracks.forEach(t => {
                totalPercent += curriculum.getTrackProgress(t.id, progress).percent;
            });
            s.val = Math.max(15, Math.round(totalPercent / tracks.length));
        });

        const size = 220;
        const center = size / 2;
        const radius = 80;
        const totalAxes = skills.length;
        const points = [];

        // Grid lines
        let gridsHtml = "";
        for (let j = 1; j <= 4; j++) {
            const r = (radius / 4) * j;
            const gridPoints = [];
            for (let i = 0; i < totalAxes; i++) {
                const angle = (i * 2 * Math.PI) / totalAxes - Math.PI / 2;
                const x = center + r * Math.cos(angle);
                const y = center + r * Math.sin(angle);
                gridPoints.push(`${x},${y}`);
            }
            gridsHtml += `<polygon points="${gridPoints.join(" ")}" class="radar-grid-line" />`;
        }

        // Axes lines & labels
        let axesHtml = "";
        skills.forEach((s, i) => {
            const angle = (i * 2 * Math.PI) / totalAxes - Math.PI / 2;
            const x = center + radius * Math.cos(angle);
            const y = center + radius * Math.sin(angle);
            axesHtml += `<line x1="${center}" y1="${center}" x2="${x}" y2="${y}" class="radar-axis-line" />`;

            // Label position offset
            const labelDist = radius + 20;
            const lx = center + labelDist * Math.cos(angle) - 26;
            const ly = center + labelDist * Math.sin(angle) + 4;
            axesHtml += `<text x="${lx}" y="${ly}" class="radar-axis-label">${s.name}</text>`;

            // Data value coordinates mapping
            const valueDist = (s.val / 100) * radius;
            const vx = center + valueDist * Math.cos(angle);
            const vy = center + valueDist * Math.sin(angle);
            points.push(`${vx},${vy}`);
        });

        container.innerHTML = `
            <svg width="${size}" height="${size}">
                ${gridsHtml}
                ${axesHtml}
                <polygon points="${points.join(" ")}" class="radar-poly-area" />
            </svg>
        `;
    }

    // --- TROPHY ACHIEVEMENTS CASE ---
    const badges = [
        { name: "Syntax Squire", desc: "Mulai belajar programming", icon: "fa-code", minXp: 1 },
        { name: "Web Architect", desc: "Lulus modul web pemula", icon: "fa-laptop-code", minXp: 150 },
        { name: "Database Warden", desc: "Selesaikan materi SQL", icon: "fa-database", minXp: 300 },
        { name: "Cyber Centurion", desc: "Menyelesaikan cybersecurity", icon: "fa-shield-halved", minXp: 600 },
        { name: "AI Alchemist", desc: "Membuka modul kecerdasan buatan", icon: "fa-brain", minXp: 1000 },
        { name: "Universe Overlord", desc: "XP melebihi 2,500 XP", icon: "fa-crown", minXp: 2500 }
    ];

    function renderAchievements() {
        const box = document.getElementById("achievementGridBox");
        if (!box) return;
        const progress = curriculum.readProgress();
        const totalXp = Math.max(
            Number(safeStorage.getItem("eduquestXP") || 0),
            Number(progress.xp || 0)
        );

        box.innerHTML = badges.map(b => {
            const unlocked = totalXp >= b.minXp;
            return `
                <div class="achievement-badge-card ${unlocked ? 'unlocked' : ''}">
                    <i class="fa-solid ${b.icon}"></i>
                    <strong>${b.name}</strong>
                    <span>${b.desc}</span>
                    <small style="display:block; margin-top: 6px; font-weight:800; color:var(--green-dark);">${unlocked ? 'TERBUKA ✓' : `Min XP: ${b.minXp}`}</small>
                </div>
            `;
        }).join("");
    }

    // --- BOOKMARK TRACKS FUNCTIONALITY ---
    function toggleBookmark(trackId) {
        const index = bookmarks.indexOf(trackId);
        if (index === -1) {
            bookmarks.push(trackId);
        } else {
            bookmarks.splice(index, 1);
        }
        safeStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
        renderTracks();
        if (typeof playSound === "function") playSound("click");
    }

    // --- POMODORO TIMER SYSTEM ---
    let pomoTimer = null;
    let pomoSeconds = 1500; // 25 minutes
    let pomoRunning = false;

    function initPomodoro() {
        const display = document.getElementById("pomoTime");
        const startBtn = document.getElementById("btnPomoStart");
        const resetBtn = document.getElementById("btnPomoReset");
        if (!display) return;

        const updateDisplay = () => {
            const m = Math.floor(pomoSeconds / 60).toString().padStart(2, '0');
            const s = (pomoSeconds % 60).toString().padStart(2, '0');
            display.textContent = `${m}:${s}`;
        };

        startBtn.addEventListener("click", () => {
            if (pomoRunning) {
                clearInterval(pomoTimer);
                pomoRunning = false;
                startBtn.textContent = "Start";
                startBtn.className = "pomodoro-btn start-btn";
            } else {
                pomoRunning = true;
                startBtn.textContent = "Pause";
                startBtn.className = "pomodoro-btn";
                pomoTimer = setInterval(() => {
                    pomoSeconds--;
                    updateDisplay();
                    if (pomoSeconds <= 0) {
                        clearInterval(pomoTimer);
                        pomoRunning = false;
                        pomoSeconds = 1500;
                        updateDisplay();
                        startBtn.textContent = "Start";
                        startBtn.className = "pomodoro-btn start-btn";
                        if (typeof playSound === "function") playSound("success");
                        alert("Waktu fokus habis! Istirahatlah sejenak.");
                    }
                }, 1000);
            }
            if (typeof playSound === "function") playSound("click");
        });

        resetBtn.addEventListener("click", () => {
            clearInterval(pomoTimer);
            pomoRunning = false;
            pomoSeconds = 1500;
            updateDisplay();
            startBtn.textContent = "Start";
            startBtn.className = "pomodoro-btn start-btn";
            if (typeof playSound === "function") playSound("click");
        });
    }

    // --- CODESANDBOX RUNNER ---
    function initSandbox() {
        const runBtn = document.getElementById("btnRunCode");
        const codeText = document.getElementById("sandboxCode");
        const outputConsole = document.getElementById("sandboxOutput");
        if (!runBtn) return;

        if (!isProUser()) {
            const sandboxBox = document.querySelector(".code-sandbox-box");
            if (sandboxBox) {
                sandboxBox.style.position = "relative";
                const lockOverlay = document.createElement("div");
                lockOverlay.className = "pro-sandbox-lock-overlay";
                lockOverlay.style.position = "absolute";
                lockOverlay.style.inset = "0";
                lockOverlay.style.background = "rgba(11, 21, 35, 0.82)";
                lockOverlay.style.backdropFilter = "blur(8px)";
                lockOverlay.style.webkitBackdropFilter = "blur(8px)";
                lockOverlay.style.display = "flex";
                lockOverlay.style.flexDirection = "column";
                lockOverlay.style.alignItems = "center";
                lockOverlay.style.justifyContent = "center";
                lockOverlay.style.zIndex = "10";
                lockOverlay.style.borderRadius = "20px";
                lockOverlay.style.padding = "24px";
                lockOverlay.style.textAlign = "center";
                lockOverlay.style.border = "1px solid rgba(255, 255, 255, 0.1)";
                lockOverlay.innerHTML = `
                    <i class="fa-solid fa-crown" style="font-size: 38px; color: #ffd166; margin-bottom: 12px; filter: drop-shadow(0 0 10px rgba(255, 209, 102, 0.4));"></i>
                    <h4 style="color: white; font-size: 17px; font-weight: 800; margin-bottom: 6px;">JS Live Sandbox Terkunci</h4>
                    <p style="color: rgba(255,255,255,0.75); font-size: 12.5px; max-width: 340px; margin-bottom: 16px; line-height: 1.55;">Tulis dan jalankan JavaScript standar secara instan langsung di dashboard dengan akun Pro.</p>
                    <a href="profile.html" class="btn" style="background: linear-gradient(135deg, #ffd166, #ff9f43); color: #0d1726; font-weight: 900; border-radius: 12px; font-size:12px; min-height: 38px; padding: 8px 16px;">
                        Upgrade ke Pro 👑
                    </a>
                `;
                sandboxBox.appendChild(lockOverlay);
                if (codeText) codeText.disabled = true;
                runBtn.disabled = true;
            }
            return;
        }

        runBtn.addEventListener("click", () => {
            const code = codeText.value;
            outputConsole.textContent = "> Compiling and running...\n";
            
            // Mock console capture
            const logs = [];
            const originalLog = console.log;
            console.log = function (...args) {
                logs.push(args.map(arg => typeof arg === "object" ? JSON.stringify(arg) : arg).join(" "));
            };

            try {
                // Execute code safely using Function
                const runner = new Function(code);
                runner();
                outputConsole.textContent = logs.length > 0 ? logs.join("\n") : "> Code ran successfully with no output.";
                if (typeof playSound === "function") playSound("success");
            } catch (err) {
                outputConsole.textContent = `Error: ${err.message}`;
            }

            // Restore console log
            console.log = originalLog;
        });
    }

    // --- FLASHCARD WIDGET SYSTEM ---
    const flashcardTerms = [
        { term: "HTML", def: "Bahasa markup standar untuk menstrukturkan halaman web dasar." },
        { term: "SQL", def: "Structured Query Language, digunakan untuk mengelola data relasional dalam RDBMS." },
        { term: "CSS Grid", def: "Sistem tata letak dua dimensi yang kuat untuk menyelaraskan elemen secara presisi." },
        { term: "Git", def: "Sistem version control terdistribusi untuk melacak riwayat revisi kode tim." },
        { term: "API", def: "Application Programming Interface, protokol untuk menghubungkan sistem perangkat lunak." },
        { term: "Binaural Beat", def: "Fenomena pendengaran frekuensi gelombang otak untuk mendorong fokus konsentrasi." }
    ];
    let activeCardIdx = 0;

    function initFlashcards() {
        const box = document.getElementById("flashcardBox");
        const termEl = document.getElementById("flashcardTerm");
        const defEl = document.getElementById("flashcardDefinition");
        const nextBtn = document.getElementById("btnNextCard");
        const prevBtn = document.getElementById("btnPrevCard");
        const idxText = document.getElementById("flashcardIndexText");
        if (!box) return;

        const updateCard = () => {
            box.classList.remove("flipped");
            setTimeout(() => {
                termEl.textContent = flashcardTerms[activeCardIdx].term;
                defEl.textContent = flashcardTerms[activeCardIdx].def;
                idxText.textContent = `${activeCardIdx + 1} / ${flashcardTerms.length}`;
            }, 150);
        };

        box.addEventListener("click", () => {
            box.classList.toggle("flipped");
            if (typeof playSound === "function") playSound("hover");
        });

        nextBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            activeCardIdx = (activeCardIdx + 1) % flashcardTerms.length;
            updateCard();
            if (typeof playSound === "function") playSound("click");
        });

        prevBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            activeCardIdx = (activeCardIdx - 1 + flashcardTerms.length) % flashcardTerms.length;
            updateCard();
            if (typeof playSound === "function") playSound("click");
        });

        updateCard();
    }

    // --- AUTO-SUGGEST DYNAMIC PANEL ---
    function initSearchSuggests() {
        const search = document.getElementById("curriculumSearch");
        const panel = document.getElementById("searchSuggestBox");
        if (!search || !panel) return;

        search.addEventListener("input", () => {
            const val = search.value.trim().toLowerCase();
            if (!val) {
                panel.style.display = "none";
                return;
            }

            // Find matching track titles
            const matches = curriculum.tracks.filter(t => t.title.toLowerCase().includes(val)).slice(0, 4);
            if (matches.length === 0) {
                panel.style.display = "none";
                return;
            }

            panel.innerHTML = matches.map(m => `
                <div class="search-suggest-item" data-id="${m.id}">${m.title} <small style="color:var(--muted)">• Lihat Silabus</small></div>
            `).join("");
            panel.style.display = "flex";
        });

        panel.addEventListener("click", (e) => {
            const item = e.target.closest(".search-suggest-item");
            if (!item) return;
            const trackId = item.dataset.id;
            search.value = "";
            panel.style.display = "none";
            openDrawer(trackId);
        });

        // Hide on focus out
        document.addEventListener("click", (e) => {
            if (!search.contains(e.target) && !panel.contains(e.target)) {
                panel.style.display = "none";
            }
        });
    }

    // --- AI COACH sidebar chatbot logic ---
    function initAiCoach() {}

    function getCoachResponse(query) {
        query = query.toLowerCase();
        if (query.includes("html")) {
            return "HTML adalah fondasi layout web. Gunakan tag semantik seperti <header>, <main>, dan <footer> agar web Anda SEO-friendly dan berstruktur rapi.";
        }
        if (query.includes("sql") || query.includes("database")) {
            return "Dalam SQL, selalu pastikan kunci relasi primary-key & foreign-key sejalan. Gunakan indeks pada kolom yang paling sering disaring dalam klausa WHERE.";
        }
        if (query.includes("pro") || query.includes("subscription")) {
            return "Subscription Pro Anda aktif! Dapatkan keuntungan prioritas syllabus lane, ambient audio, dan live playground JS.";
        }
        return "Pertanyaan menarik! Teruslah berlatih, coba buat sandbox code kecil di tab 'Playground Tools' untuk membuktikan teorinya secara langsung.";
    }

    // --- CONFETTI LEVEL UP MELODY TRIGGER ---
    function triggerConfetti() {
        const canvas = document.getElementById("confettiCanvas");
        if (!canvas) return;
        const ctx = canvas.getContext("2d");

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const colors = ["#32d66b", "#4f8cff", "#ffd166", "#ff9f43", "#8b5cf6", "#ff4d6d"];
        const particleCount = 120;
        const particles = [];

        class Particle {
            constructor() {
                this.x = canvas.width / 2;
                this.y = canvas.height + 15;
                this.radius = Math.random() * 6 + 4;
                this.vx = Math.random() * 14 - 7;
                this.vy = -(Math.random() * 15 + 10);
                this.gravity = 0.38;
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.opacity = 1;
                this.decay = Math.random() * 0.012 + 0.008;
            }
            update() {
                this.vy += this.gravity;
                this.x += this.vx;
                this.y += this.vy;
                this.opacity -= this.decay;
            }
            draw() {
                ctx.save();
                ctx.globalAlpha = this.opacity;
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        let animationFrameId;
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let active = false;
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                if (p.opacity > 0) {
                    p.update();
                    p.draw();
                    active = true;
                }
            }
            if (active) {
                animationFrameId = requestAnimationFrame(animate);
            } else {
                cancelAnimationFrame(animationFrameId);
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
        animate();
    }

    function renderOverview(progress) {
        const allLessons = curriculum.tracks.flatMap((track) => curriculum.flattenLessons(track));
        let completed = 0;
        let mastered = 0;
        curriculum.tracks.forEach((track) => {
            const trackProgress = curriculum.getTrackProgress(track.id, progress);
            completed += trackProgress.completed;
            mastered += trackProgress.mastered;
        });
        const percent = Math.round((completed / allLessons.length) * 100);
        elements.ring.style.setProperty("--progress", `${percent}%`);
        elements.percent.textContent = `${percent}%`;
        elements.mastered.textContent = mastered;

        const lastTrack = curriculum.getTrack(progress.lastTrackId) || curriculum.tracks[0];
        const lessonInfo = curriculum.findLesson(progress.lastLessonId);
        const lesson = lessonInfo?.track.id === lastTrack.id ? lessonInfo.lesson : nextLesson(lastTrack, progress);
        elements.continueTitle.textContent = completed ? `Lanjutkan: ${lesson.title}` : "Mulai jalur profesionalmu.";
        elements.continueText.textContent = completed
            ? `${lastTrack.title} • ${curriculum.getTrackProgress(lastTrack.id, progress).percent}% selesai`
            : "Mulai dari fondasi, ikuti prerequisite, dan selesaikan checkpoint untuk membuka jalur berikutnya.";
        elements.continueBtn.href = `materi-basic.html?topik=${lastTrack.id}&lesson=${lesson.id}`;
        elements.continueBtn.textContent = completed ? "Lanjutkan Belajar" : "Mulai Belajar";
    }

    function renderTracks() {
        const progress = curriculum.readProgress();
        renderOverview(progress);
        const recommended = careerGoalMap[safeStorage.getItem("materiCareerGoal") || "frontend"] || careerGoalMap.frontend;
        
        let tracks = curriculum.tracks.filter((track) => {
            const status = getStatus(track, progress);
            const queryMatch = !state.query || trackSearchText(track).includes(state.query);
            const categoryMatch = state.category === "all" || track.category === state.category;
            const levelMatch = state.level === "all" || track.level.includes(state.level);
            const statusMatch = state.status === "all" || status === state.status;
            
            // Check bookmark filter
            const bookmarkMatch = !state.showOnlyBookmarked || bookmarks.includes(track.id);

            return queryMatch && categoryMatch && levelMatch && statusMatch && bookmarkMatch;
        });

        tracks.sort((a, b) => {
            if (state.sort === "duration") return a.durationMinutes - b.durationMinutes;
            if (state.sort === "progress") return curriculum.getTrackProgress(b.id, progress).percent - curriculum.getTrackProgress(a.id, progress).percent;
            if (state.sort === "title") return a.title.localeCompare(b.title, "id");
            return (recommended.indexOf(a.id) === -1 ? 99 : recommended.indexOf(a.id)) -
                (recommended.indexOf(b.id) === -1 ? 99 : recommended.indexOf(b.id));
        });

        elements.grid.classList.toggle("list-view", state.view === "list");
        dashboard.querySelectorAll("[data-view]").forEach((button) => button.classList.toggle("active", button.dataset.view === state.view));
        elements.results.textContent = `${tracks.length} dari ${curriculum.tracks.length} jalur ditampilkan`;

        if (!tracks.length) {
            elements.grid.innerHTML = `<div class="curriculum-empty"><h3>Materi tidak ditemukan</h3><p>Coba kata kunci atau kombinasi filter yang berbeda.</p></div>`;
            return;
        }

        elements.grid.innerHTML = tracks.map((track, index) => {
            const value = curriculum.getTrackProgress(track.id, progress);
            const status = getStatus(track, progress);
            const lesson = nextLesson(track, progress);
            const prerequisite = track.prerequisites.map((id) => curriculum.getTrack(id)?.title).filter(Boolean).join(", ");
            const isBookmarked = bookmarks.includes(track.id);

            return `
                <article class="track-card ${status === "locked" ? "is-locked" : ""}" data-track="${track.id}" style="--motion-index:${index}">
                    <div class="track-card-head">
                        <div class="track-mark">${track.mark}</div>
                        <div style="flex:1; min-width:0;">
                            <h3 style="display:flex; align-items:center; gap:8px;">
                                ${track.title}
                                <button type="button" class="bookmark-track-btn ${isBookmarked ? 'is-bookmarked' : ''}" data-bookmark="${track.id}">
                                    <i class="fa-${isBookmarked ? 'solid' : 'regular'} fa-star"></i>
                                </button>
                            </h3>
                            <small>${track.categoryLabel}</small>
                        </div>
                        <span class="track-status ${status}">${statusLabel(status)}</span>
                    </div>
                    <p class="track-description">${track.summary}</p>
                    <div class="track-meta">
                        <span>${track.level}</span><span>4 bab</span><span>12 pelajaran</span><span>${Math.round(track.durationMinutes / 60)} jam</span>
                        ${prerequisite ? `<span style="color:var(--orange);">Prasyarat: ${prerequisite}</span>` : ""}
                    </div>
                    <div class="track-progress">
                        <div class="track-progress-label"><span>${value.completed}/${value.total} selesai</span><strong>${value.percent}%</strong></div>
                        <div class="track-progress-bar"><i style="--value:${value.percent}%"></i></div>
                    </div>
                    <div class="track-actions">
                        <button class="btn btn-ghost" type="button" data-open-track="${track.id}">Lihat Silabus</button>
                        <a class="btn btn-primary ${status === "locked" ? "disabled" : ""}" ${status === "locked" ? 'aria-disabled="true" tabindex="-1"' : ""} href="materi-basic.html?topik=${track.id}&lesson=${lesson.id}">${value.completed ? "Lanjutkan" : "Mulai"}</a>
                    </div>
                </article>
            `;
        }).join("");

        // Bind bookmark buttons inside grid
        elements.grid.querySelectorAll("[data-bookmark]").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                toggleBookmark(btn.dataset.bookmark);
            });
        });
    }

    function ensureDrawer() {
        if (document.getElementById("syllabusDrawer")) return;
        document.body.insertAdjacentHTML("beforeend", `
            <button class="syllabus-backdrop" id="syllabusBackdrop" type="button" aria-label="Tutup silabus"></button>
            <aside class="syllabus-drawer" id="syllabusDrawer" aria-hidden="true" aria-labelledby="syllabusTitle">
                <div class="syllabus-head">
                    <div>
                        <div class="section-kicker">Silabus Jalur</div>
                        <h2 id="syllabusTitle"></h2>
                    </div>
                    <button class="syllabus-close" type="button" aria-label="Tutup silabus">✕</button>
                </div>
                <div class="syllabus-body" id="syllabusBody"></div>
                
                <!-- Notes / Summary Controls at footer -->
                <div style="padding: 12px 20px; border-top: 1px solid var(--border); display: flex; gap: 8px;" id="syllabusProSection">
                    <button class="btn btn-ghost" id="btnSyllabusSummarize" type="button" style="flex:1; min-height: 38px; padding:6px 10px; font-size:11px;">
                        <i class="fa-solid fa-sparkles"></i> AI Summary
                    </button>
                    <button class="btn btn-ghost" id="btnSyllabusExport" type="button" style="flex:1; min-height: 38px; padding:6px 10px; font-size:11px;">
                        <i class="fa-solid fa-file-export"></i> Export Notes
                    </button>
                </div>

                <div class="syllabus-footer"><a class="btn btn-primary" id="syllabusStart" href="#">Mulai jalur</a></div>
            </aside>
        `);
        document.getElementById("syllabusBackdrop").addEventListener("click", closeDrawer);
        document.querySelector(".syllabus-close").addEventListener("click", closeDrawer);
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && state.drawerTrackId) closeDrawer();
            if (event.key === "Tab" && state.drawerTrackId) trapDrawerFocus(event);
        });
    }

    function trapDrawerFocus(event) {
        const drawer = document.getElementById("syllabusDrawer");
        const focusable = Array.from(drawer.querySelectorAll("button, a[href]")).filter((element) => !element.hasAttribute("disabled") && element.tabIndex !== -1);
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }

    function openDrawer(trackId, updateUrl = true) {
        const track = curriculum.getTrack(trackId);
        if (!track) return;
        ensureDrawer();
        const progress = curriculum.readProgress();
        const value = curriculum.getTrackProgress(track.id, progress);
        const unlocked = curriculum.isTrackUnlocked(track, progress);
        const firstLesson = nextLesson(track, progress);
        state.drawerTrackId = track.id;
        document.getElementById("syllabusTitle").textContent = track.title;
        document.getElementById("syllabusBody").innerHTML = `
            <div class="syllabus-intro">
                <div class="syllabus-meta"><span>${track.level}</span><span>${Math.round(track.durationMinutes / 60)} jam</span><span>${value.percent}% selesai</span></div>
                <p>${track.summary}</p>
                <strong>Capstone: ${track.capstone.title}</strong>
                ${track.prerequisites.length ? `<small style="color:var(--orange);">Prasyarat: ${track.prerequisites.map((id) => curriculum.getTrack(id).title).join(", ")}</small>` : ""}
            </div>
            <div class="chapter-list">
                ${track.chapters.map((chapter, chapterIndex) => `
                    <section class="chapter-item ${chapterIndex === 0 ? "open" : ""}">
                        <button class="chapter-toggle" type="button" aria-expanded="${chapterIndex === 0}">
                            <span><strong>${chapterIndex + 1}. ${chapter.title}</strong><small>${chapter.summary}</small></span><span>⌄</span>
                        </button>
                        <div class="chapter-lessons">
                            ${chapter.lessons.map((lesson) => {
                                const lessonState = curriculum.getLessonState(track.id, lesson.id, progress);
                                const icon = lessonState === "mastered" ? "★" : lessonState === "completed" ? "✓" : lessonState === "locked" ? "🔒" : "→";
                                return `<a class="lesson-row ${lessonState}" href="materi-basic.html?topik=${track.id}&lesson=${lesson.id}">
                                    <span class="lesson-state ${lessonState}">${icon}</span>
                                    <span><strong>${lesson.title}</strong><small>${lesson.durationMinutes} menit • ${lesson.xp} XP</small></span>
                                    <small>${lessonState.replace("_", " ")}</small>
                                </a>`;
                            }).join("")}
                        </div>
                    </section>
                `).join("")}
            </div>
        `;
        const start = document.getElementById("syllabusStart");
        start.href = `materi-basic.html?topik=${track.id}&lesson=${firstLesson.id}`;
        start.textContent = unlocked ? (value.completed ? "Lanjutkan jalur" : "Mulai jalur") : "Selesaikan prasyarat dahulu";
        start.setAttribute("aria-disabled", String(!unlocked));
        start.tabIndex = unlocked ? 0 : -1;
        start.classList.toggle("disabled", !unlocked);

        const summarizeBtn = document.getElementById("btnSyllabusSummarize");
        const exportBtn = document.getElementById("btnSyllabusExport");

        if (isProUser()) {
            if (summarizeBtn) summarizeBtn.innerHTML = `<i class="fa-solid fa-sparkles"></i> AI Summary`;
            if (exportBtn) exportBtn.innerHTML = `<i class="fa-solid fa-file-export"></i> Export Notes`;
        } else {
            if (summarizeBtn) summarizeBtn.innerHTML = `<i class="fa-solid fa-sparkles"></i> AI Summary <i class="fa-solid fa-crown" style="color:#d8b868; font-size:10px; margin-left:4px;"></i>`;
            if (exportBtn) exportBtn.innerHTML = `<i class="fa-solid fa-file-export"></i> Export Notes <i class="fa-solid fa-crown" style="color:#d8b868; font-size:10px; margin-left:4px;"></i>`;
        }

        // Bind AI Summarizer inside syllabus
        if (summarizeBtn) {
            summarizeBtn.onclick = () => {
                if (!isProUser()) {
                    alert("AI Summary eksklusif untuk member Pro!");
                    return;
                }
                alert(`[AI RANGKUMAN - ${track.title}]\n1. Membahas fundamental konsep ${track.title}.\n2. Mengerjakan studi kasus capstone: ${track.capstone.title}.\n3. Disertai evaluasi checkpoint di akhir pelajaran.`);
            };
        }

        // Bind Export notes inside syllabus
        if (exportBtn) {
            exportBtn.onclick = () => {
                if (!isProUser()) {
                    alert("Ekspor catatan eksklusif untuk member Pro!");
                    return;
                }
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
                    track: track.title,
                    summary: track.summary,
                    capstone: track.capstone.title
                }));
                const downloadAnchor = document.createElement('a');
                downloadAnchor.setAttribute("href", dataStr);
                downloadAnchor.setAttribute("download", `materi-${track.id}-notes.json`);
                document.body.appendChild(downloadAnchor);
                downloadAnchor.click();
                downloadAnchor.remove();
            };
        }

        document.querySelectorAll(".chapter-toggle").forEach((button) => {
            button.addEventListener("click", () => {
                const item = button.closest(".chapter-item");
                item.classList.toggle("open");
                button.setAttribute("aria-expanded", String(item.classList.contains("open")));
            });
        });

        document.getElementById("syllabusDrawer").classList.add("show");
        document.getElementById("syllabusBackdrop").classList.add("show");
        document.getElementById("syllabusDrawer").setAttribute("aria-hidden", "false");
        document.body.classList.add("syllabus-open");
        document.querySelector(".syllabus-close").focus();
        if (updateUrl) {
            const url = new URL(location.href);
            url.searchParams.set("track", track.id);
            history.pushState({ track: track.id }, "", url);
        }
    }

    function closeDrawer(updateUrl = true) {
        if (!state.drawerTrackId) return;
        state.drawerTrackId = null;
        document.getElementById("syllabusDrawer")?.classList.remove("show");
        document.getElementById("syllabusBackdrop")?.classList.remove("show");
        document.getElementById("syllabusDrawer")?.setAttribute("aria-hidden", "true");
        document.body.classList.remove("syllabus-open");
        if (updateUrl) {
            const url = new URL(location.href);
            url.searchParams.delete("track");
            history.pushState({}, "", url);
        }
    }

    function setTab(tab) {
        state.activeTab = tab;
        dashboard.querySelectorAll(".curriculum-tab").forEach((button) => {
            const active = button.dataset.tab === tab;
            button.classList.toggle("active", active);
            button.setAttribute("aria-selected", String(active));
        });
        dashboard.querySelectorAll(".curriculum-panel").forEach((panel) => {
            panel.hidden = panel.dataset.panel !== tab;
        });

        // Load specific sub widgets
        if (tab === "practice") {
            renderRadarChart();
        } else if (tab === "achievements") {
            renderAchievements();
        }

        document.dispatchEvent(new CustomEvent("curriculum-tab-change", { detail: { tab } }));
    }

    function bindControls() {
        elements.search.addEventListener("input", () => {
            state.query = elements.search.value.trim().toLowerCase();
            renderTracks();
        });

        // Filter bookmarks click toggle
        const filterBookmarksBtn = document.getElementById("btnFilterBookmarks");
        filterBookmarksBtn.addEventListener("click", () => {
            state.showOnlyBookmarked = !state.showOnlyBookmarked;
            filterBookmarksBtn.classList.toggle("active", state.showOnlyBookmarked);
            renderTracks();
        });

        // Focus mode click toggle
        const focusModeBtn = document.getElementById("btnFocusMode");
        focusModeBtn.addEventListener("click", () => {
            state.focusMode = !state.focusMode;
            document.body.classList.toggle("focus-mode-active", state.focusMode);
            focusModeBtn.classList.toggle("active", state.focusMode);
            focusModeBtn.innerHTML = state.focusMode
                ? `<i class="fa-solid fa-eye"></i> Exit Focus`
                : `<i class="fa-solid fa-eye-slash"></i> Focus Mode`;
            if (typeof playSound === "function") playSound("success");
        });

        [["category", elements.category], ["level", elements.level], ["status", elements.status], ["sort", elements.sort]].forEach(([key, element]) => {
            if (element) {
                element.addEventListener("change", () => {
                    state[key] = element.value;
                    renderTracks();
                });
            }
        });

        if (elements.careerGoal) {
            elements.careerGoal.value = safeStorage.getItem("materiCareerGoal") || "frontend";
            elements.careerGoal.addEventListener("change", () => {
                safeStorage.setItem("materiCareerGoal", elements.careerGoal.value);
                renderTracks();
            });
        }

        dashboard.addEventListener("click", (event) => {
            const tab = event.target.closest("[data-tab]");
            const view = event.target.closest("[data-view]");
            const open = event.target.closest("[data-open-track]");
            if (tab) setTab(tab.dataset.tab);
            if (view) {
                state.view = view.dataset.view;
                safeStorage.setItem("curriculumView", state.view);
                renderTracks();
            }
            if (open) openDrawer(open.dataset.openTrack);
        });

        window.addEventListener("curriculum-progress", () => renderTracks());
        document.addEventListener("curriculum-open-track", (event) => {
            const trackId = event.detail?.trackId;
            if (trackId && curriculum.getTrack(trackId)) {
                openDrawer(trackId);
            }
        });
        window.addEventListener("popstate", () => {
            const trackId = new URLSearchParams(location.search).get("track");
            if (trackId) openDrawer(trackId, false);
            else closeDrawer(false);
        });

        // Simulated online student room count periodic update
        setInterval(() => {
            const el = document.getElementById("liveUserVal");
            if (el) {
                const change = Math.floor(Math.random() * 9) - 4;
                const current = Math.max(100, Number(el.textContent) + change);
                el.textContent = current;
            }
        }, 4000);
    }

    moveLegacySections();
    bindControls();
    renderTracks();
    setTab("learn");
    
    // Init widgets
    initPomodoro();
    initSandbox();
    initFlashcards();
    initSearchSuggests();
    initAiCoach();

    requestAnimationFrame(() => dashboard.classList.add("motion-ready"));
    const initialTrack = new URLSearchParams(location.search).get("track");
    if (initialTrack) openDrawer(initialTrack, false);
})();
