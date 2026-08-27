(() => {
    "use strict";

    const core = window.QuizNation;
    const questionBank = Array.isArray(window.questionBank) ? window.questionBank : [];
    const localStore = getStorage("localStorage");
    const sessionStore = getStorage("sessionStorage");

    function getStorage(name) {
        try {
            return window[name];
        } catch {
            return null;
        }
    }
    const keys = {
        best: "eduquestBestScore",
        last: "eduquestLastSession",
        bookmarks: "eduquestBookmarks",
        active: "eduquestQuizActiveState",
        session: "eduquestQuizSession"
    };
    const labels = {
        all: "Semua topik",
        programming: "Programming",
        web: "Web Development",
        database: "Database & SQL",
        design: "UI/UX Design",
        analytics: "Data & Analytics",
        cyber: "Cyber Security",
        ai: "AI & Machine Learning",
        cloud: "Cloud & DevOps",
        mobile: "Mobile App Dev",
        quantum: "Quantum Computing",
        blockchain: "Blockchain & Web3",
        biotech: "Bio-Tech & Rekayasa Genetika",
        futuretech: "Teknologi Otonom & Dirgantara",
        easy: "Pemanasan",
        medium: "Menengah",
        hard: "Tantangan",
        practice: "Practice",
        exam: "Exam",
        sprint: "Sprint"
    };
    const difficultyLabels = { all: "Campuran", easy: "Pemanasan", medium: "Menengah", hard: "Tantangan" };
    const catalogLevelLabels = { easy: "Fondasi", medium: "Pendalaman", hard: "Tantangan" };
    const modeSeconds = { practice: 90, exam: 50, sprint: 25 };
    const catalogCategoryMeta = {
        programming: { short: "Coding", icon: "fa-code", tone: "green", focus: "logika, struktur program, dan praktik clean code" },
        web: { short: "Web Development", icon: "fa-globe", tone: "blue", focus: "fondasi web, frontend, dan cara kerja aplikasi modern" },
        database: { short: "Database & SQL", icon: "fa-database", tone: "purple", focus: "pemodelan data, query SQL, dan pengelolaan database" },
        design: { short: "UI/UX Design", icon: "fa-pen-ruler", tone: "amber", focus: "prinsip desain, riset pengguna, dan keputusan antarmuka" },
        analytics: { short: "Data & Analytics", icon: "fa-chart-column", tone: "blue", focus: "literasi data, analisis, dan pengambilan keputusan" },
        cyber: { short: "Cyber Security", icon: "fa-shield-halved", tone: "purple", focus: "keamanan digital, risiko, dan respons terhadap ancaman" },
        ai: { short: "AI & Machine Learning", icon: "fa-robot", tone: "amber", focus: "konsep AI, machine learning, dan penerapannya" },
        cloud: { short: "Cloud & DevOps", icon: "fa-cloud", tone: "blue", focus: "infrastruktur cloud, deployment, dan alur DevOps" },
        mobile: { short: "Mobile App Dev", icon: "fa-mobile-screen-button", tone: "green", focus: "pengembangan aplikasi mobile dan arsitektur perangkat" },
        quantum: { short: "Quantum Computing", icon: "fa-atom", tone: "blue", focus: "sirkuit kuantum, superposisi, qubit, enkripsi pasca-kuantum, dan algoritma Shor" },
        blockchain: { short: "Blockchain & Web3", icon: "fa-cubes", tone: "violet", focus: "kontrak pintar (smart contracts), kriptografi terdesentralisasi, konsensus, dan arsitektur Web3" },
        biotech: { short: "Bio-Tech", icon: "fa-dna", tone: "green", focus: "CRISPR-Cas9, bio-komputasi, sintesis DNA, dan teknologi medis masa depan" },
        futuretech: { short: "Teknologi Otonom & Dirgantara", icon: "fa-rocket", tone: "amber", focus: "robotika otonom, kolonisasi luar angkasa, satelit mini, IoT pintar, dan fusi nuklir" }
    };
    const catalogLevelMeta = {
        easy: { prefix: "Fondasi", amount: 5, mode: "practice", description: "Bangun pemahaman awal tentang" },
        medium: { prefix: "Pendalaman", amount: 10, mode: "practice", description: "Perkuat kemampuanmu dalam" },
        hard: { prefix: "Tantangan", amount: 10, mode: "exam", description: "Uji kesiapanmu menghadapi soal lanjutan tentang" }
    };
    const featuredCatalogIds = new Set(["quantum-hard", "blockchain-medium", "biotech-easy", "futuretech-medium", "ai-medium"]);
    const catalogPackages = Object.entries(catalogCategoryMeta).flatMap(([category, meta]) =>
        Object.entries(catalogLevelMeta).map(([difficulty, level]) => ({
            id: `${category}-${difficulty}`,
            category,
            difficulty,
            amount: level.amount,
            mode: level.mode,
            title: `${level.prefix} ${meta.short}`,
            description: `${level.description} ${meta.focus}.`,
            icon: meta.icon,
            tone: meta.tone,
            featured: featuredCatalogIds.has(`${category}-${difficulty}`)
        }))
    ).sort((left, right) => Number(right.featured) - Number(left.featured));
    const catalogState = {
        query: "",
        topic: "all",
        difficulty: "all",
        visible: 9,
        selectedId: ""
    };
    let catalogSearchTimer = 0;
    let sessionStarting = false;

    const elements = {
        form: document.getElementById("quizForm"),
        category: document.getElementById("category"),
        difficulty: document.getElementById("difficulty"),
        amount: document.getElementById("amount"),
        previewTitle: document.getElementById("previewTitle"),
        previewDetail: document.getElementById("previewDetail"),
        start: document.getElementById("startQuizButton"),
        continueButton: document.getElementById("continueSessionButton"),
        toast: document.getElementById("quizToast"),
        theme: document.getElementById("themeToggleBtn"),
        menu: document.getElementById("menuToggle"),
        mobileNav: document.getElementById("mobileNav"),
        menuClose: document.getElementById("mobileMenuClose"),
        customPanel: document.getElementById("customQuizPanel"),
        catalogPanel: document.getElementById("catalogQuizPanel"),
        catalogGrid: document.getElementById("quizCatalogGrid"),
        catalogSearch: document.getElementById("catalogSearch"),
        catalogTopic: document.getElementById("catalogTopicFilter"),
        catalogDifficulty: document.getElementById("catalogDifficultyFilter"),
        catalogCount: document.getElementById("catalogResultCount"),
        catalogEmpty: document.getElementById("catalogEmpty"),
        catalogLoadMore: document.getElementById("catalogLoadMore"),
        catalogReview: document.getElementById("catalogReview"),
        catalogReviewEmpty: document.getElementById("catalogReviewEmpty"),
        catalogReviewContent: document.getElementById("catalogReviewContent"),
        startCatalog: document.getElementById("startCatalogButton")
    };

    function safeRead(storage, key, fallback = null) {
        try {
            const raw = storage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (error) {
            return fallback;
        }
    }

    function safeNumber(storage, key) {
        try {
            const value = Number(storage.getItem(key));
            return Number.isFinite(value) ? value : 0;
        } catch (error) {
            return 0;
        }
    }

    function readSetting(storage, key, fallback = "") {
        try {
            return storage.getItem(key) || fallback;
        } catch {
            return fallback;
        }
    }

    function writeSetting(storage, key, value) {
        try {
            storage.setItem(key, String(value));
            return true;
        } catch {
            return false;
        }
    }

    function setTheme(theme) {
        if (!elements.theme) return;
        const dark = theme === "dark";
        document.body.classList.toggle("dark-theme", dark);
        elements.theme.setAttribute("aria-label", dark ? "Aktifkan tema terang" : "Aktifkan tema gelap");
        elements.theme.setAttribute("aria-pressed", String(dark));
        elements.theme.innerHTML = dark
            ? '<i class="fa-solid fa-sun" aria-hidden="true"></i>'
            : '<i class="fa-solid fa-moon" aria-hidden="true"></i>';
        document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#08130f" : "#f7fbf9");
    }

    function setupTheme() {
        if (!elements.theme) return;
        const preferred = window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        const initialTheme = readSetting(localStore, "eduquest_theme", preferred);
        writeSetting(localStore, "eduquest_theme", initialTheme);
        setTheme(initialTheme);
        elements.theme.addEventListener("click", () => {
            const next = document.body.classList.contains("dark-theme") ? "light" : "dark";
            writeSetting(localStore, "eduquest_theme", next);
            setTheme(next);
        });
    }

    function setupMobileMenu() {
        if (!elements.menu || !elements.mobileNav || !elements.menuClose) return;
        const toggle = (open) => {
            elements.mobileNav.toggleAttribute("inert", !open);
            elements.mobileNav.classList.toggle("is-active", open);
            elements.mobileNav.setAttribute("aria-hidden", String(!open));
            elements.menu.setAttribute("aria-expanded", String(open));
            document.body.classList.toggle("nav-open", open);
            window.setTimeout(() => (open ? elements.menuClose : elements.menu).focus({ preventScroll: true }), 80);
        };
        elements.menu.addEventListener("click", () => toggle(!elements.mobileNav.classList.contains("is-active")));
        elements.menuClose.addEventListener("click", () => toggle(false));
        elements.mobileNav.addEventListener("click", (event) => { if (event.target === elements.mobileNav) toggle(false); });
        elements.mobileNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => toggle(false)));
        document.addEventListener("keydown", (event) => {
            if (!elements.mobileNav.classList.contains("is-active")) return;
            if (event.key === "Escape") {
                event.preventDefault();
                toggle(false);
                return;
            }
            if (event.key !== "Tab") return;
            const focusables = [...elements.mobileNav.querySelectorAll('button:not([disabled]), a[href]')];
            if (!focusables.length) return;
            const current = focusables.indexOf(document.activeElement);
            const next = event.shiftKey
                ? (current <= 0 ? focusables.length - 1 : current - 1)
                : (current === -1 || current === focusables.length - 1 ? 0 : current + 1);
            event.preventDefault();
            focusables[next].focus();
        });
    }

    function clamp(value, min, max) {
        return Math.min(max, Math.max(min, Number(value) || 0));
    }

    function shuffle(items) {
        const result = [...items];
        for (let index = result.length - 1; index > 0; index -= 1) {
            const swapIndex = Math.floor(Math.random() * (index + 1));
            [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
        }
        return result;
    }

    function currentMode() {
        return elements.form?.querySelector('input[name="mode"]:checked')?.value || "practice";
    }

    function matchingQuestions(config = {}) {
        const category = config.category || elements.category?.value || "all";
        const difficulty = config.difficulty || elements.difficulty?.value || "all";
        return questionBank.filter((question) => {
            const categoryMatch = category === "all" || question.category === category;
            const difficultyMatch = difficulty === "all" || question.difficulty === difficulty;
            return categoryMatch && difficultyMatch;
        });
    }

    function prepareQuestion(question) {
        const answers = Array.isArray(question.answers)
            ? question.answers.map((text, originalIndex) => ({ text, originalIndex }))
            : [];
        const shuffledAnswers = shuffle(answers);
        return {
            ...question,
            answers: [...(question.answers || [])],
            shuffledAnswers,
            shuffledCorrect: shuffledAnswers.findIndex((answer) => answer.originalIndex === Number(question.correct))
        };
    }

    function getTimeLimit(amount, mode) {
        return amount * (modeSeconds[mode] || modeSeconds.practice);
    }

    function formatDuration(seconds) {
        const minutes = Math.max(1, Math.ceil(seconds / 60));
        return `${minutes} menit`;
    }

    function showToast(message) {
        if (!elements.toast) return;
        elements.toast.textContent = message;
        elements.toast.classList.add("show");
        window.clearTimeout(showToast.timer);
        showToast.timer = window.setTimeout(() => elements.toast.classList.remove("show"), 3200);
    }

    function animateNumber(element, target, suffix = "") {
        if (!element) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || target <= 0) {
            element.textContent = `${target}${suffix}`;
            return;
        }
        const duration = 650;
        const startTime = performance.now();
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentVal = Math.round(target * easeProgress);
            element.textContent = `${currentVal}${suffix}`;
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        requestAnimationFrame(update);
    }

    function updatePreview() {
        if (!elements.form) return;
        const requested = Number(elements.amount.value) || 10;
        const available = matchingQuestions().length;
        const actual = Math.min(requested, available);
        const mode = currentMode();
        const category = labels[elements.category.value] || labels.all;
        elements.previewTitle.textContent = `${actual} soal · ${category}`;
        elements.previewDetail.textContent = available
            ? `${labels[mode]} · sekitar ${formatDuration(getTimeLimit(actual, mode))}${actual < requested ? ` · ${available} soal cocok tersedia` : ""}`
            : "Tidak ada soal yang cocok dengan pilihan ini";
        elements.start.disabled = available === 0;

        if (elements.previewTitle) {
            const previewBox = elements.previewTitle.closest(".session-preview");
            if (previewBox) {
                previewBox.classList.remove("pulse-anim");
                void previewBox.offsetWidth;
                previewBox.classList.add("pulse-anim");
            }
        }
    }

    function customSessionConfig() {
        return {
            category: elements.category?.value || "all",
            difficulty: elements.difficulty?.value || "all",
            amount: Number(elements.amount?.value) || 10,
            mode: currentMode(),
            categoryLabel: labels[elements.category?.value] || labels.all,
            strictAmount: false
        };
    }

    function buildSession(config = customSessionConfig(), trigger = elements.start) {
        if (sessionStarting) return;
        if (!core?.sessions || !core?.storage) {
            showToast("Mesin quiz belum siap. Muat ulang halaman dan coba lagi.");
            return;
        }
        const category = config.category || "all";
        const difficulty = config.difficulty || "all";
        const mode = config.mode || "practice";
        const requested = Number(config.amount) || 10;
        const availableQuestions = matchingQuestions({ category, difficulty });
        if (config.strictAmount && availableQuestions.length < requested) {
            showToast("Paket ini belum memiliki cukup soal dan belum dapat dimulai.");
            return;
        }
        const questions = shuffle(availableQuestions).slice(0, requested).map(prepareQuestion);
        if (!questions.length) {
            showToast("Tidak ada soal yang cocok. Coba ubah topik atau tingkat kesulitan.");
            return;
        }
        sessionStarting = true;
        if (trigger) trigger.disabled = true;
        try {
            const payload = core.sessions.create({
                source: "quick",
                config: {
                    category,
                    difficulty,
                    amount: questions.length,
                    mode,
                    categoryLabel: config.categoryLabel || labels[category] || labels.all,
                    difficultyLabel: difficultyLabels[difficulty] || "Campuran",
                    modeLabel: labels[mode]
                },
                timeLimit: getTimeLimit(questions.length, mode),
                questions
            });
            if (!core.storage.write(sessionStore, keys.session, payload)) {
                throw new Error("Session storage tidak tersedia");
            }
            core.storage.remove(sessionStore, keys.active);
            trigger?.classList.add("is-loading");
            trigger?.setAttribute("aria-busy", "true");
            window.setTimeout(() => { window.location.href = "quiz-session.html"; }, 220);
        } catch (error) {
            console.warn("Sesi quiz tidak dapat dibuat:", error);
            sessionStarting = false;
            showToast("Sesi tidak dapat dibuka di perangkat ini. Coba muat ulang halaman.");
            if (trigger) trigger.disabled = false;
            trigger?.classList.remove("is-loading");
            trigger?.removeAttribute("aria-busy");
        }
    }

    function getWeakestTopic(session) {
        if (!session || !Array.isArray(session.answers) || !session.answers.length) return null;
        const grouped = new Map();
        session.answers.forEach((answer) => {
            const category = labels[answer.category] || "Topik campuran";
            const current = grouped.get(category) || { correct: 0, total: 0 };
            current.total += 1;
            if (answer.isCorrect === true) current.correct += 1;
            grouped.set(category, current);
        });
        return [...grouped.entries()]
            .map(([name, value]) => ({ name, accuracy: Math.round((value.correct / value.total) * 100) }))
            .sort((a, b) => a.accuracy - b.accuracy)[0] || null;
    }

    function formatDate(date) {
        const parsed = new Date(date);
        if (Number.isNaN(parsed.getTime())) return "Baru saja";
        return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(parsed);
    }

    function renderProgress() {
        const best = clamp(safeNumber(localStore, keys.best), 0, 100);
        const last = safeRead(localStore, keys.last, null);
        const bookmarks = core?.sanitize?.bookmarks
            ? core.sanitize.bookmarks(safeRead(localStore, keys.bookmarks, []))
            : [];
        const weakest = getWeakestTopic(last);

        const bestScoreElem = document.getElementById("heroBestScore");
        const bestMetricElem = document.getElementById("bestScoreMetric");
        const bankCountElem = document.getElementById("questionBankCount");
        const bookmarkElem = document.getElementById("bookmarkMetric");
        const bookmarkBadgeElem = document.getElementById("bookmarkCountBadge");

        if (bestScoreElem && bestMetricElem) {
            animateNumber(bestScoreElem, best, "%");
            animateNumber(bestMetricElem, best, "%");
        }
        if (bankCountElem) {
            animateNumber(bankCountElem, questionBank.length);
        }
        if (bookmarkElem && bookmarkBadgeElem) {
            animateNumber(bookmarkElem, bookmarks.length);
            animateNumber(bookmarkBadgeElem, bookmarks.length);
        }

        document.getElementById("bestScoreNote").textContent = best >= 80 ? "Pemahamanmu sudah kuat" : best > 0 ? "Terus naikkan akurasimu" : "Selesaikan quiz pertamamu";
        document.getElementById("scoreRing").style.setProperty("--score", String(best));
        document.getElementById("lastActivityLabel").textContent = last ? formatDate(last.date) : "Belum mulai";
        document.getElementById("lastAccuracyMetric").textContent = last ? `${clamp(last.score, 0, 100)}%` : "—";
        document.getElementById("lastAccuracyNote").textContent = last ? `${clamp(last.correct, 0, 99)} benar dari ${clamp(last.total, 0, 99)} soal` : "Belum ada sesi";
        document.getElementById("focusMetric").textContent = weakest?.name || "Mulai quiz";
        document.getElementById("focusNote").textContent = weakest ? `Akurasi terakhir ${weakest.accuracy}%` : "Rekomendasi muncul dari hasilmu";

        renderLastSession(last, weakest);
        renderBookmarks(bookmarks);
    }

    function renderLastSession(session, weakest) {
        const empty = document.getElementById("lastSessionEmpty");
        const content = document.getElementById("lastSessionContent");
        if (!session || typeof session !== "object") return;
        empty.hidden = true;
        content.hidden = false;
        const score = clamp(session.score, 0, 100);
        const total = clamp(session.total, 0, 99);
        const correct = clamp(session.correct, 0, total);
        const wrong = clamp(session.wrong, 0, total);
        const category = labels[session.category] || labels.all;
        content.innerHTML = `
            <div class="session-head"><div><small>Sesi terakhir · ${formatDate(session.date)}</small><h3>${category}</h3></div><span class="session-score">${score}%</span></div>
            <div class="session-stats"><div><small>Benar</small><strong>${correct}/${total}</strong></div><div><small>Perlu review</small><strong>${wrong}</strong></div><div><small>Best combo</small><strong>${clamp(session.bestStreak, 0, total)}</strong></div></div>
            <p class="session-message">${weakest ? `Fokuskan latihan berikutnya pada ${weakest.name}. Akurasi topik ini masih ${weakest.accuracy}%.` : "Ulangi sesi dengan tingkat kesulitan lebih tinggi untuk mengukur perkembanganmu."}</p>
            <div class="session-actions"><button class="button button-secondary" id="repeatLastButton" type="button">Ulangi topik</button><a class="button button-primary" href="materi.html">Pelajari materi</a></div>`;
        document.getElementById("repeatLastButton")?.addEventListener("click", () => {
            const categoryValue = String(session.category || "");
            const difficultyValue = String(session.difficulty || "");
            const amountValue = String(session.total || "");
            const modeValue = String(session.mode || "");
            if ([...elements.category.options].some((option) => option.value === categoryValue)) elements.category.value = categoryValue;
            if ([...elements.difficulty.options].some((option) => option.value === difficultyValue)) elements.difficulty.value = difficultyValue;
            if ([...elements.amount.options].some((option) => option.value === amountValue)) elements.amount.value = amountValue;
            const mode = [...elements.form.querySelectorAll('input[name="mode"]')].find((input) => input.value === modeValue);
            if (mode) mode.checked = true;
            updatePreview();
            setQuizPath("custom");
            document.getElementById("quizSetup")?.scrollIntoView({ behavior: "smooth", block: "start" });
            showToast("Pengaturan sesi terakhir diterapkan.");
        });
    }

    function renderBookmarks(bookmarks) {
        const list = document.getElementById("bookmarkList");
        if (!list || !bookmarks.length) return;
        list.replaceChildren();
        bookmarks.slice(-3).reverse().forEach((bookmark) => {
            const item = document.createElement("div");
            item.className = "bookmark-item";
            const category = document.createElement("span");
            category.textContent = labels[bookmark.category] || "Topik tersimpan";
            const question = document.createElement("p");
            question.textContent = bookmark.question;
            item.append(category, question);
            list.append(item);
        });
    }

    function setQuizPath(path, options = {}) {
        const selectedPath = path === "catalog" ? "catalog" : "custom";
        document.querySelectorAll("[data-quiz-path]").forEach((button) => {
            const active = button.dataset.quizPath === selectedPath;
            button.classList.toggle("is-active", active);
            button.setAttribute("aria-selected", String(active));
            button.tabIndex = active ? 0 : -1;
            if (active && options.focus) button.focus({ preventScroll: true });
        });
        if (elements.customPanel) elements.customPanel.hidden = selectedPath !== "custom";
        if (elements.catalogPanel) elements.catalogPanel.hidden = selectedPath !== "catalog";
    }

    function setupQuizPaths() {
        const pathButtons = [...document.querySelectorAll("[data-quiz-path]")];
        pathButtons.forEach((button, index) => {
            button.addEventListener("click", () => setQuizPath(button.dataset.quizPath));
            button.addEventListener("keydown", (event) => {
                if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
                event.preventDefault();
                let nextIndex = index;
                if (event.key === "ArrowLeft") nextIndex = (index - 1 + pathButtons.length) % pathButtons.length;
                if (event.key === "ArrowRight") nextIndex = (index + 1) % pathButtons.length;
                if (event.key === "Home") nextIndex = 0;
                if (event.key === "End") nextIndex = pathButtons.length - 1;
                setQuizPath(pathButtons[nextIndex].dataset.quizPath, { focus: true });
            });
        });
        document.querySelectorAll("[data-open-quiz-path]").forEach((link) => {
            link.addEventListener("click", () => setQuizPath(link.dataset.openQuizPath));
        });
        setQuizPath("custom");
    }

    function catalogAvailability(item) {
        return matchingQuestions(item).length;
    }

    function filteredCatalogPackages() {
        const query = catalogState.query.trim().toLocaleLowerCase("id-ID");
        return catalogPackages.filter((item) => {
            const topicMatch = catalogState.topic === "all" || item.category === catalogState.topic;
            const difficultyMatch = catalogState.difficulty === "all" || item.difficulty === catalogState.difficulty;
            const searchable = `${item.title} ${item.description} ${labels[item.category]} ${catalogLevelLabels[item.difficulty]}`.toLocaleLowerCase("id-ID");
            return topicMatch && difficultyMatch && (!query || searchable.includes(query));
        });
    }

    function renderCatalog() {
        if (!elements.catalogGrid) return;
        const filtered = filteredCatalogPackages();
        const selectionCleared = Boolean(
            catalogState.selectedId &&
            !filtered.some((item) => item.id === catalogState.selectedId)
        );
        if (selectionCleared) catalogState.selectedId = "";
        const shown = filtered.slice(0, catalogState.visible);
        elements.catalogGrid.replaceChildren();
        shown.forEach((item) => {
            const available = catalogAvailability(item);
            const ready = available >= item.amount;
            const card = document.createElement("button");
            card.type = "button";
            card.className = `quiz-catalog-card tone-${item.tone}${catalogState.selectedId === item.id ? " is-selected" : ""}`;
            card.dataset.catalogId = item.id;
            card.disabled = !ready;
            card.setAttribute("aria-pressed", String(catalogState.selectedId === item.id));
            card.innerHTML = `
                <span class="catalog-card-top">
                    <span class="catalog-card-icon"><i class="fa-solid ${item.icon}" aria-hidden="true"></i></span>
                    ${item.featured ? '<span class="catalog-featured"><i class="fa-solid fa-star" aria-hidden="true"></i> Pilihan populer</span>' : ""}
                </span>
                <span class="catalog-card-copy"><strong>${item.title}</strong><small>${item.description}</small></span>
                <span class="catalog-card-meta">
                    <span>${catalogLevelLabels[item.difficulty]}</span>
                    <span>${item.amount} soal</span>
                    <span>${labels[item.mode]}</span>
                </span>
                <span class="catalog-card-status ${ready ? "is-ready" : "is-unavailable"}">${ready ? `Sekitar ${formatDuration(getTimeLimit(item.amount, item.mode))}` : `Belum tersedia · ${available}/${item.amount} soal`}</span>`;
            elements.catalogGrid.append(card);
        });
        if (elements.catalogCount) elements.catalogCount.textContent = String(filtered.length);
        const liveRegion = document.getElementById("liveRegion");
        if (liveRegion) liveRegion.textContent = `${filtered.length} paket quiz ditemukan.`;
        if (elements.catalogEmpty) elements.catalogEmpty.hidden = filtered.length > 0;
        if (elements.catalogLoadMore) {
            elements.catalogLoadMore.hidden = filtered.length <= catalogState.visible;
            elements.catalogLoadMore.textContent = `Tampilkan lebih banyak (${Math.max(0, filtered.length - catalogState.visible)})`;
        }
        if (selectionCleared) renderCatalogReview();
    }

    function renderCatalogReview() {
        const item = catalogPackages.find((entry) => entry.id === catalogState.selectedId);
        if (!item) {
            if (elements.catalogReviewEmpty) elements.catalogReviewEmpty.hidden = false;
            if (elements.catalogReviewContent) elements.catalogReviewContent.hidden = true;
            elements.catalogReview?.setAttribute("aria-labelledby", "catalogReviewTitle");
            return;
        }
        const available = catalogAvailability(item);
        const ready = available >= item.amount;
        elements.catalogReviewEmpty.hidden = true;
        elements.catalogReviewContent.hidden = false;
        elements.catalogReview?.setAttribute("aria-labelledby", "catalogReviewName");
        document.getElementById("catalogReviewTopic").textContent = labels[item.category];
        document.getElementById("catalogReviewLevel").textContent = catalogLevelLabels[item.difficulty];
        document.getElementById("catalogReviewName").textContent = item.title;
        document.getElementById("catalogReviewDescription").textContent = item.description;
        document.getElementById("catalogReviewAmount").textContent = `${item.amount} soal`;
        document.getElementById("catalogReviewMode").textContent = labels[item.mode];
        document.getElementById("catalogReviewDuration").textContent = formatDuration(getTimeLimit(item.amount, item.mode));
        const availability = document.getElementById("catalogAvailability");
        availability.classList.toggle("is-unavailable", !ready);
        availability.textContent = ready
            ? `${available} soal cocok tersedia. Paket siap dimulai.`
            : `Paket belum tersedia karena baru ada ${available} dari ${item.amount} soal yang dibutuhkan.`;
        elements.startCatalog.disabled = !ready;
    }

    function selectCatalogPackage(id) {
        const item = catalogPackages.find((entry) => entry.id === id);
        if (!item || catalogAvailability(item) < item.amount) return;
        catalogState.selectedId = id;
        elements.catalogGrid?.querySelectorAll("[data-catalog-id]").forEach((card) => {
            const selected = card.dataset.catalogId === id;
            card.classList.toggle("is-selected", selected);
            card.setAttribute("aria-pressed", String(selected));
        });
        renderCatalogReview();
        if (window.matchMedia("(max-width: 1024px)").matches) {
            window.setTimeout(() => elements.catalogReview?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
        }
    }

    function resetCatalogFilters() {
        window.clearTimeout(catalogSearchTimer);
        catalogState.query = "";
        catalogState.topic = "all";
        catalogState.difficulty = "all";
        catalogState.visible = 9;
        if (elements.catalogSearch) elements.catalogSearch.value = "";
        if (elements.catalogTopic) elements.catalogTopic.value = "all";
        if (elements.catalogDifficulty) elements.catalogDifficulty.value = "all";
        renderCatalog();
        elements.catalogSearch?.focus();
    }

    function setupCatalog() {
        if (!elements.catalogGrid) return;
        elements.catalogGrid.addEventListener("click", (event) => {
            const card = event.target.closest("[data-catalog-id]");
            if (card) selectCatalogPackage(card.dataset.catalogId);
        });
        elements.catalogSearch?.addEventListener("input", (event) => {
            const query = event.target.value;
            window.clearTimeout(catalogSearchTimer);
            catalogSearchTimer = window.setTimeout(() => {
                catalogState.query = query;
                catalogState.visible = 9;
                renderCatalog();
            }, 180);
        });
        elements.catalogTopic?.addEventListener("change", (event) => {
            catalogState.topic = event.target.value;
            catalogState.visible = 9;
            renderCatalog();
        });
        elements.catalogDifficulty?.addEventListener("change", (event) => {
            catalogState.difficulty = event.target.value;
            catalogState.visible = 9;
            renderCatalog();
        });
        document.getElementById("catalogReset")?.addEventListener("click", resetCatalogFilters);
        document.getElementById("catalogEmptyReset")?.addEventListener("click", resetCatalogFilters);
        elements.catalogLoadMore?.addEventListener("click", () => {
            catalogState.visible += 9;
            renderCatalog();
        });
        elements.startCatalog?.addEventListener("click", () => {
            const item = catalogPackages.find((entry) => entry.id === catalogState.selectedId);
            if (!item) return;
            buildSession({ ...item, categoryLabel: item.title, strictAmount: true }, elements.startCatalog);
        });
        renderCatalog();
        renderCatalogReview();
    }

    function setupContinueSession() {
        const active = safeRead(sessionStore, keys.active, null);
        const session = core?.sessions?.read?.();
        if (!active?.running || !session?.ok || active.sessionId !== session.value.sessionId || !elements.continueButton) return;
        elements.continueButton.hidden = false;
        elements.continueButton.addEventListener("click", () => { window.location.href = "quiz-session.html"; });
    }

    function setupReveal() {
        const nodes = document.querySelectorAll(".reveal, .progress-strip");
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
            nodes.forEach((node) => node.classList.add("is-visible"));
            return;
        }
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            });
        }, { threshold: .12, rootMargin: "0px 0px -30px" });
        nodes.forEach((node) => observer.observe(node));
    }

    elements.form?.addEventListener("submit", (event) => {
        event.preventDefault();
        buildSession();
    });
    elements.form?.addEventListener("change", updatePreview);

    updatePreview();
    renderProgress();
    setupTheme();
    setupMobileMenu();
    setupQuizPaths();
    setupCatalog();
    setupContinueSession();
    setupReveal();
})();
