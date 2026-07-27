(function () {
    "use strict";

    const curriculum = window.QNCurriculum;
    if (!curriculum) {
        console.error("Data kurikulum tidak tersedia.");
        return;
    }

    const storage = {
        memory: Object.create(null),
        get(key) {
            try { return localStorage.getItem(key); }
            catch (_) { return this.memory[key] ?? null; }
        },
        set(key, value) {
            try { localStorage.setItem(key, String(value)); }
            catch (_) { this.memory[key] = String(value); }
        }
    };

    const state = {
        query: "",
        category: "all",
        level: "all",
        career: "all",
        sort: "recommended",
        selectedId: curriculum.tracks[0]?.id || null
    };

    const elements = {
        header: document.getElementById("siteHeader"),
        themeToggle: document.getElementById("themeToggleBtn"),
        menuToggle: document.getElementById("menuToggle"),
        mobileNav: document.getElementById("mobileNav"),
        mobileMenuClose: document.getElementById("mobileMenuClose"),
        search: document.getElementById("moduleSearch"),
        clearSearch: document.getElementById("clearSearch"),
        career: document.getElementById("careerFilter"),
        level: document.getElementById("levelFilter"),
        sort: document.getElementById("sortModules"),
        categories: document.getElementById("categoryFilters"),
        reset: document.getElementById("resetFilters"),
        emptyReset: document.getElementById("emptyReset"),
        results: document.getElementById("resultsStatus"),
        grid: document.getElementById("moduleGrid"),
        empty: document.getElementById("emptyState"),
        detail: document.getElementById("moduleDetail"),
        detailContent: document.getElementById("detailContent"),
        detailClose: document.getElementById("detailClose"),
        detailBackdrop: document.getElementById("detailBackdrop"),
        live: document.getElementById("liveRegion")
    };

    const categoryMarks = {
        engineering: "DEV", data: "DATA", design: "UX", security: "SEC", operations: "OPS", quality: "QA"
    };

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>'"]/g, char => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
        })[char]);
    }

    function formatDuration(minutes) {
        const hours = Math.round(minutes / 60);
        return `${hours} jam`;
    }

    function readOverview() {
        const progress = curriculum.readProgress();
        let completed = 0;
        let total = 0;
        let active = 0;
        let continueTrack = curriculum.tracks[0];
        let highestActivity = -1;

        curriculum.tracks.forEach(track => {
            const trackProgress = curriculum.getTrackProgress(track.id, progress);
            completed += trackProgress.completed;
            total += trackProgress.total;
            if (trackProgress.completed > 0 && trackProgress.percent < 100) active += 1;
            if (trackProgress.completed > highestActivity && trackProgress.percent < 100) {
                highestActivity = trackProgress.completed;
                continueTrack = track;
            }
        });

        return { progress, completed, total, active, percent: total ? Math.round(completed / total * 100) : 0, continueTrack };
    }

    function updateOverview() {
        const data = readOverview();
        const totalLessons = curriculum.tracks.reduce((sum, track) => sum + curriculum.flattenLessons(track).length, 0);
        document.getElementById("heroTrackCount").textContent = curriculum.tracks.length;
        document.getElementById("heroLessonCount").textContent = totalLessons;
        document.getElementById("completedLessons").textContent = data.completed;
        document.getElementById("activeTracks").textContent = data.active;
        document.getElementById("progressPercent").textContent = `${data.percent}%`;
        const ring = document.getElementById("progressRing");
        ring.style.setProperty("--progress", `${data.percent * 3.6}deg`);
        ring.setAttribute("aria-label", `Progres belajar ${data.percent} persen`);

        const track = data.continueTrack;
        document.getElementById("continueMark").textContent = track.mark;
        document.getElementById("continueTitle").textContent = track.title;
        const link = document.getElementById("continueLink");
        link.href = `materi-basic.html?topik=${encodeURIComponent(track.id)}`;
        link.setAttribute("aria-label", `Lanjutkan ${track.title}`);
    }

    function renderCategories() {
        const chips = [["all", "Semua"], ...Object.entries(curriculum.categories)];
        elements.categories.innerHTML = chips.map(([id, label]) => `
            <button class="category-chip${state.category === id ? " active" : ""}" type="button" data-category="${escapeHTML(id)}" aria-pressed="${state.category === id}">
                ${escapeHTML(label)}
            </button>
        `).join("");
    }

    function getFilteredTracks() {
        const overview = readOverview();
        const query = state.query.trim().toLocaleLowerCase("id");
        const sourceIndex = new Map(curriculum.tracks.map((track, index) => [track.id, index]));
        const items = curriculum.tracks.filter(track => {
            const searchable = [
                track.title, track.summary, track.project, track.categoryLabel,
                ...track.chapters.map(chapter => chapter.title),
                ...curriculum.flattenLessons(track).map(({ lesson }) => lesson.title)
            ].join(" ").toLocaleLowerCase("id");
            return (!query || searchable.includes(query))
                && (state.category === "all" || track.category === state.category)
                && (state.level === "all" || track.level === state.level)
                && (state.career === "all" || track.careerTags.includes(state.career));
        });

        return items.sort((a, b) => {
            if (state.sort === "title") return a.title.localeCompare(b.title, "id");
            if (state.sort === "shortest") return a.durationMinutes - b.durationMinutes;
            if (state.sort === "progress") {
                return curriculum.getTrackProgress(b.id, overview.progress).percent - curriculum.getTrackProgress(a.id, overview.progress).percent;
            }
            if (state.career !== "all") {
                const aRank = a.careerTags.indexOf(state.career);
                const bRank = b.careerTags.indexOf(state.career);
                if (aRank !== bRank) return aRank - bRank;
            }
            return sourceIndex.get(a.id) - sourceIndex.get(b.id);
        });
    }

    function statusFor(track, progress) {
        const trackProgress = curriculum.getTrackProgress(track.id, progress);
        if (trackProgress.percent === 100) return { label: "Selesai", className: "complete" };
        if (trackProgress.completed > 0) return { label: "Dipelajari", className: "in-progress" };
        if (!curriculum.isTrackUnlocked(track, progress)) return { label: "Terkunci", className: "locked" };
        return { label: "Tersedia", className: "" };
    }

    function cardTemplate(track, index, progress) {
        const trackProgress = curriculum.getTrackProgress(track.id, progress);
        const status = statusFor(track, progress);
        return `
            <article class="module-card${state.selectedId === track.id ? " selected" : ""}" data-track-card="${escapeHTML(track.id)}">
                <button class="module-card-main" type="button" data-open-track="${escapeHTML(track.id)}" aria-label="Lihat detail ${escapeHTML(track.title)}">
                    <span class="card-topline">
                        <span class="module-mark">${escapeHTML(track.mark || categoryMarks[track.category] || "QN")}</span>
                        <span class="status-pill ${status.className}">${status.label}</span>
                    </span>
                    <h3>${escapeHTML(track.title)}</h3>
                    <p>${escapeHTML(track.summary)}</p>
                    <span class="card-footer">
                        <span>${escapeHTML(track.level)}</span><i></i><span>${formatDuration(track.durationMinutes)}</span><i></i><span>${trackProgress.completed}/${trackProgress.total} pelajaran</span>
                    </span>
                    <span class="card-progress" aria-hidden="true"><span></span></span>
                </button>
            </article>
        `;
    }

    function renderModules(announce = false) {
        const items = getFilteredTracks();
        const overview = readOverview();
        elements.grid.innerHTML = items.map((track, index) => cardTemplate(track, index, overview.progress)).join("");
        elements.grid.querySelectorAll(".module-card").forEach((card, index) => {
            card.style.setProperty("--card-index", index);
            const track = curriculum.getTrack(card.dataset.trackCard);
            const progress = curriculum.getTrackProgress(track.id, overview.progress);
            card.querySelector(".card-progress span").style.setProperty("--card-progress", `${progress.percent}%`);
        });

        elements.empty.hidden = items.length !== 0;
        elements.grid.hidden = items.length === 0;
        elements.results.textContent = `${items.length} dari ${curriculum.tracks.length} jalur ditampilkan`;
        elements.reset.classList.toggle("visible", hasFilters());
        elements.clearSearch.hidden = !state.query;
        renderCategories();

        if (announce) elements.live.textContent = `${items.length} jalur belajar ditemukan.`;
        if (items.length && !items.some(item => item.id === state.selectedId)) {
            state.selectedId = items[0].id;
            renderDetail(items[0], false);
        }
    }

    function renderDetail(track, shouldOpen = true) {
        if (!track) return;
        state.selectedId = track.id;
        const overview = readOverview();
        const progress = curriculum.getTrackProgress(track.id, overview.progress);
        const unlocked = curriculum.isTrackUnlocked(track, overview.progress);
        const prerequisites = track.prerequisites.map(id => curriculum.getTrack(id)?.title).filter(Boolean);
        elements.detailContent.innerHTML = `
            <div class="detail-content">
                <div class="detail-mark">${escapeHTML(track.mark || "QN")}</div>
                <p class="detail-kicker">${escapeHTML(track.categoryLabel)}</p>
                <h3 id="detailTitle">${escapeHTML(track.title)}</h3>
                <p class="detail-summary">${escapeHTML(track.summary)}</p>
                <div class="detail-meta">
                    <span>${escapeHTML(track.level)}</span>
                    <span>${formatDuration(track.durationMinutes)}</span>
                    <span>${progress.percent}% selesai</span>
                </div>
                <div class="detail-section">
                    <strong>Isi jalur</strong>
                    <ol class="chapter-list">
                        ${track.chapters.map((chapter, index) => `<li><span>${index + 1}</span>${escapeHTML(chapter.title)}</li>`).join("")}
                    </ol>
                </div>
                <div class="detail-section">
                    <strong>Proyek akhir</strong>
                    <p class="project-note">${escapeHTML(track.project)}</p>
                </div>
                ${prerequisites.length ? `<div class="detail-section"><strong>Prasyarat</strong><p class="project-note">${escapeHTML(prerequisites.join(", "))}</p></div>` : ""}
                <a class="button detail-action${unlocked ? "" : " locked"}" href="${unlocked ? `materi-basic.html?topik=${encodeURIComponent(track.id)}` : "#"}" ${unlocked ? "" : 'aria-disabled="true"'}>
                    ${progress.completed ? "Lanjutkan materi" : unlocked ? "Mulai jalur ini" : "Selesaikan prasyarat"} <span aria-hidden="true">→</span>
                </a>
            </div>
        `;

        document.querySelectorAll("[data-track-card]").forEach(card => card.classList.toggle("selected", card.dataset.trackCard === track.id));
        if (shouldOpen && isMobileDetail()) openDetail();
    }

    function isMobileDetail() { return window.matchMedia("(max-width: 820px)").matches; }

    function openDetail() {
        elements.detail.removeAttribute("inert");
        elements.detail.classList.add("open");
        elements.detailBackdrop.classList.add("open");
        elements.detail.setAttribute("aria-hidden", "false");
        document.body.classList.add("drawer-open");
        window.setTimeout(() => elements.detailClose.focus({ preventScroll: true }), 80);
    }

    function closeDetail() {
        elements.detail.classList.remove("open");
        elements.detailBackdrop.classList.remove("open");
        if (isMobileDetail()) {
            elements.detail.setAttribute("aria-hidden", "true");
            elements.detail.setAttribute("inert", "");
        }
        document.body.classList.remove("drawer-open");
        document.querySelector(`[data-open-track="${CSS.escape(state.selectedId)}"]`)?.focus({ preventScroll: true });
    }

    function hasFilters() {
        return Boolean(state.query) || state.category !== "all" || state.level !== "all" || state.career !== "all" || state.sort !== "recommended";
    }

    function resetFilters() {
        state.query = "";
        state.category = "all";
        state.level = "all";
        state.career = "all";
        state.sort = "recommended";
        elements.search.value = "";
        elements.career.value = "all";
        elements.level.value = "all";
        elements.sort.value = "recommended";
        renderModules(true);
        elements.search.focus();
    }

    function setTheme(theme) {
        const dark = theme === "dark";
        document.body.classList.toggle("dark-theme", dark);
        elements.themeToggle.setAttribute("aria-label", dark ? "Aktifkan tema terang" : "Aktifkan tema gelap");
        elements.themeToggle.innerHTML = dark
            ? '<i class="fa-solid fa-sun" aria-hidden="true"></i>'
            : '<i class="fa-solid fa-moon" aria-hidden="true"></i>';
        document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#09140f" : "#f6fbf8");
    }

    function initTheme() {
        const saved = storage.get("eduquest_theme");
        const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        setTheme(saved || preferred);
        elements.themeToggle.addEventListener("click", () => {
            const next = document.body.classList.contains("dark-theme") ? "light" : "dark";
            storage.set("eduquest_theme", next);
            setTheme(next);
        });
    }

    function initReveal() {
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const targets = document.querySelectorAll(".reveal");
        if (reduced || !("IntersectionObserver" in window)) {
            targets.forEach(target => target.classList.add("in-view"));
            return;
        }
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("in-view");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: .12 });
        targets.forEach(target => observer.observe(target));
    }

    function bindEvents() {
        let searchTimer;
        elements.search.addEventListener("input", event => {
            state.query = event.target.value;
            clearTimeout(searchTimer);
            searchTimer = setTimeout(() => renderModules(true), 90);
        });
        elements.clearSearch.addEventListener("click", () => {
            state.query = "";
            elements.search.value = "";
            renderModules(true);
            elements.search.focus();
        });
        elements.career.addEventListener("change", event => { state.career = event.target.value; renderModules(true); });
        elements.level.addEventListener("change", event => { state.level = event.target.value; renderModules(true); });
        elements.sort.addEventListener("change", event => { state.sort = event.target.value; renderModules(true); });
        elements.categories.addEventListener("click", event => {
            const button = event.target.closest("[data-category]");
            if (!button) return;
            state.category = button.dataset.category;
            renderModules(true);
        });
        elements.grid.addEventListener("click", event => {
            const button = event.target.closest("[data-open-track]");
            if (!button) return;
            renderDetail(curriculum.getTrack(button.dataset.openTrack));
        });
        elements.reset.addEventListener("click", resetFilters);
        elements.emptyReset.addEventListener("click", resetFilters);
        elements.detailClose.addEventListener("click", closeDetail);
        elements.detailBackdrop.addEventListener("click", closeDetail);
        document.addEventListener("keydown", event => {
            if (event.key === "Escape") {
                closeDetail();
                if (elements.mobileNav.classList.contains("is-active")) toggleMenu(false);
            }
        });
        elements.menuToggle.addEventListener("click", () => toggleMenu(!elements.mobileNav.classList.contains("is-active")));
        elements.mobileMenuClose.addEventListener("click", () => toggleMenu(false));
        elements.mobileNav.addEventListener("click", event => {
            if (event.target === elements.mobileNav) toggleMenu(false);
        });
        elements.mobileNav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => toggleMenu(false)));
        window.addEventListener("scroll", () => elements.header.classList.toggle("ux-scrolled", window.scrollY > 24), { passive: true });
        window.addEventListener("resize", () => {
            if (!isMobileDetail()) {
                elements.detail.removeAttribute("inert");
                elements.detail.classList.remove("open");
                elements.detailBackdrop.classList.remove("open");
                elements.detail.setAttribute("aria-hidden", "false");
                document.body.classList.remove("drawer-open");
            } else if (!elements.detail.classList.contains("open")) {
                elements.detail.setAttribute("aria-hidden", "true");
                elements.detail.setAttribute("inert", "");
            }
        });
        window.addEventListener("curriculum-progress", () => {
            updateOverview();
            renderModules(false);
            renderDetail(curriculum.getTrack(state.selectedId), false);
        });
    }

    function toggleMenu(open) {
        elements.mobileNav.toggleAttribute("inert", !open);
        elements.mobileNav.classList.toggle("is-active", open);
        elements.mobileNav.setAttribute("aria-hidden", String(!open));
        elements.menuToggle.setAttribute("aria-expanded", String(open));
        document.body.classList.toggle("nav-open", open);
        if (open) window.setTimeout(() => elements.mobileMenuClose.focus(), 80);
        else elements.menuToggle.focus({ preventScroll: true });
    }

    function init() {
        initTheme();
        updateOverview();
        renderCategories();
        renderModules();
        renderDetail(curriculum.getTrack(state.selectedId), false);
        if (isMobileDetail()) {
            elements.detail.setAttribute("aria-hidden", "true");
            elements.detail.setAttribute("inert", "");
        }
        bindEvents();
        initReveal();
        const subscription = storage.get("eduquestSubscription") === "pro" ? "pro" : "basic";
        const badge = document.getElementById("navSubscriptionBadge");
        badge.className = `subscription-badge ${subscription}`;
        badge.textContent = subscription === "pro" ? "Pro" : "Basic";
        elements.mobileNav.setAttribute("inert", "");
        elements.header.classList.toggle("ux-scrolled", window.scrollY > 24);
    }

    init();
})();
