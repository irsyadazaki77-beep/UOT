(function () {
    "use strict";

    const curriculum = window.QNCurriculum;
    const root = document.getElementById("lessonReader");
    if (!curriculum || !root) return;

    const params = new URLSearchParams(location.search);
    let track = curriculum.getTrack(params.get("topik")) || curriculum.tracks[0];
    let progress = curriculum.readProgress();
    let lessonInfo = params.get("lesson") ? curriculum.findLesson(params.get("lesson")) : null;
    if (!lessonInfo || lessonInfo.track.id !== track.id) {
        lessonInfo = curriculum.findLesson(progress.lastTrackId === track.id ? progress.lastLessonId : "") ||
            curriculum.findLesson(curriculum.flattenLessons(track)[0].lesson.id);
    }

    if (!curriculum.isTrackUnlocked(track, progress)) {
        track = curriculum.tracks.find((item) => curriculum.isTrackUnlocked(item, progress)) || curriculum.tracks[0];
        lessonInfo = curriculum.findLesson(curriculum.flattenLessons(track)[0].lesson.id);
    }

    let chapter = lessonInfo.chapter;
    let lesson = lessonInfo.lesson;
    let selectedCheckpoint = null;
    let noteSaveTimer = null;
    let readingProgressFrame = null;
    let readerGlobalEventsBound = false;
    const fontScaleKey = "qnReaderFontScale";
    const focusModeKey = "qnReaderFocusMode";
    const allowedFontScales = [0.9, 1, 1.1, 1.2];

    document.body.classList.add("reader-v2");

    function getTrackRecord() {
        progress.tracks[track.id] = progress.tracks[track.id] || { lessons: {}, capstone: {} };
        progress.tracks[track.id].lessons = progress.tracks[track.id].lessons || {};
        return progress.tracks[track.id];
    }

    function getLessonRecord() {
        const trackRecord = getTrackRecord();
        trackRecord.lessons[lesson.id] = trackRecord.lessons[lesson.id] || {
            status: "available",
            bestScore: 0,
            attempts: 0,
            practiceCompleted: false,
            bookmarked: false,
            xpAwarded: false,
            notes: "",
            startedAt: new Date().toISOString()
        };
        return trackRecord.lessons[lesson.id];
    }

    function save() {
        progress.lastTrackId = track.id;
        progress.lastLessonId = lesson.id;
        progress = curriculum.writeProgress(progress);
    }

    function markStarted() {
        const record = getLessonRecord();
        if (record.status === "available") record.status = "in_progress";
        save();
    }

    function lessonUrl(target) {
        return `materi-basic.html?topik=${target.track.id}&lesson=${target.lesson.id}`;
    }

    function iconForStatus(status) {
        return status === "mastered" ? "?" : status === "completed" ? "?" : status === "locked" ? "??" : "•";
    }

    function buildSidebar() {
        return `
            <aside class="reader-sidebar" id="readerSidebar" aria-label="Daftar pelajaran">
                <div class="reader-track-card">
                    <div class="section-kicker">${track.mark} • ${track.level}</div>
                    <strong>${track.title}</strong>
                    <p>4 bab • 12 pelajaran • ${Math.round(track.durationMinutes / 60)} jam</p>
                </div>
                <label class="reader-search">
                    <span>Cari pelajaran</span>
                    <input id="readerLessonSearch" type="search" placeholder="Ketik judul atau bab..." autocomplete="off">
                </label>
                <div class="reader-chapters">
                    ${track.chapters.map((item, chapterIndex) => `
                        <section class="reader-chapter ${item.id === chapter.id ? "open" : ""}">
                            <button class="reader-chapter-toggle" type="button" aria-expanded="${item.id === chapter.id}">
                                <span><strong>${chapterIndex + 1}. ${item.title}</strong><small>${item.lessons.length} pelajaran</small></span><span>?</span>
                            </button>
                            <div class="reader-lesson-list">
                                ${item.lessons.map((itemLesson) => {
                                    const status = curriculum.getLessonState(track.id, itemLesson.id, progress);
                                    return `<a class="reader-lesson-link ${status} ${itemLesson.id === lesson.id ? "active" : ""}" href="${lessonUrl({ track, lesson: itemLesson })}">
                                        <span class="reader-lesson-dot ${status}">${iconForStatus(status)}</span><span>${itemLesson.title}</span>
                                    </a>`;
                                }).join("")}
                            </div>
                        </section>
                    `).join("")}
                </div>
                <div class="reader-search-empty" id="readerSearchEmpty" hidden>Tidak ada pelajaran yang cocok.</div>
            </aside>
        `;
    }

    function buildReader() {
        selectedCheckpoint = null;
        const record = getLessonRecord();
        const trackProgress = curriculum.getTrackProgress(track.id, progress);
        const flat = curriculum.flattenLessons(track);
        const currentIndex = flat.findIndex((entry) => entry.lesson.id === lesson.id);
        const previous = currentIndex > 0 ? { track, ...flat[currentIndex - 1] } : null;
        const next = currentIndex < flat.length - 1 ? { track, ...flat[currentIndex + 1] } : null;
        const nextState = next ? curriculum.getLessonState(track.id, next.lesson.id, progress) : "available";

        root.innerHTML = `
            <div class="reader-page-progress" aria-hidden="true"><i id="readerPageProgress"></i></div>
            <header class="reader-header">
                <a class="reader-brand" href="materi.html"><img src="logo.png" alt=""><span>Universe Of Tech</span></a>
                <div class="reader-header-progress">
                    <div><span>${track.title}</span><span>${trackProgress.completed}/${trackProgress.total} • ${trackProgress.percent}%</span></div>
                    <div class="reader-progress-bar"><i style="--value:${trackProgress.percent}%"></i></div>
                </div>
                <div class="reader-actions">
                    <button class="reader-icon-btn reader-mobile-menu" id="readerMenuBtn" type="button" aria-label="Buka daftar pelajaran">?</button>
                    <div class="reader-font-controls" aria-label="Ukuran teks">
                        <button class="reader-icon-btn" id="readerFontDownBtn" type="button" aria-label="Perkecil teks">A-</button>
                        <button class="reader-icon-btn" id="readerFontUpBtn" type="button" aria-label="Perbesar teks">A+</button>
                    </div>
                    <button class="reader-icon-btn" id="readerThemeBtn" type="button" aria-label="Ganti tema" title="Ganti tema">?</button>
                    <button class="reader-icon-btn ${record.bookmarked ? "active" : ""}" id="readerBookmarkBtn" type="button" aria-label="Bookmark pelajaran" aria-pressed="${record.bookmarked}" title="Bookmark (B)">?</button>
                    <button class="reader-icon-btn" id="readerFocusBtn" type="button" aria-label="Mode fokus" aria-pressed="false" title="Mode fokus (F)">?</button>
                </div>
            </header>
            <button class="reader-sidebar-backdrop" id="readerSidebarBackdrop" type="button" aria-label="Tutup daftar pelajaran"></button>
            <div class="reader-layout">
                ${buildSidebar()}
                <main class="reader-main">
                    <article class="reader-content">
                        <nav class="reader-breadcrumb" aria-label="Breadcrumb"><span>${track.title}</span><span>/</span><span>${chapter.title}</span><span>/</span><strong>${lesson.title}</strong></nav>
                        <header class="reader-hero">
                            <div class="section-kicker">Pelajaran ${currentIndex + 1} dari ${flat.length}</div>
                            <h1>${lesson.title}</h1>
                            <p>${chapter.summary}</p>
                            <div class="reader-meta"><span>${lesson.durationMinutes} menit</span><span>${lesson.xp} XP</span><span id="readerReadPercent">0% dibaca</span><span id="lessonStatusPill">${record.status.replace("_", " ")}</span></div>
                        </header>

                        <nav class="reader-on-page" aria-label="Isi pelajaran">
                            <strong>Di pelajaran ini</strong>
                            <a href="#lessonOutcomes">Hasil belajar</a>
                            <a href="#lessonDiscussion">Pembahasan</a>
                            <a href="#lessonExample">Contoh</a>
                            <a href="#lessonPractice">Praktik</a>
                            <a href="#lessonCheckpoint">Checkpoint</a>
                            <a href="#lessonNotes">Catatan</a>
                        </nav>

                        <section class="lesson-section" id="lessonOutcomes">
                            <h2>Hasil belajar</h2>
                            <div class="outcome-grid">${lesson.outcomes.map((outcome) => `<div class="outcome-card">${outcome}</div>`).join("")}</div>
                        </section>

                        <section class="lesson-section" id="lessonDiscussion">
                            <h2>Pembahasan</h2>
                            ${lesson.sections.map((section) => `<h3>${section.title}</h3><p>${section.body}</p>`).join("")}
                        </section>

                        <section class="lesson-section" id="lessonExample">
                            <h2>${lesson.example.title}</h2>
                            <p>${lesson.example.explanation}</p>
                            <div class="lesson-code">
                                <div class="lesson-code-head"><span>${lesson.example.language}</span><button class="btn btn-ghost" id="copyLessonCode" type="button">Salin</button></div>
                                <pre><code id="lessonCode">${escapeHtml(lesson.example.code)}</code></pre>
                            </div>
                        </section>

                        <section class="lesson-section" id="lessonPractice">
                            <h2>Latihan praktik</h2>
                            <div class="practice-card">
                                <p>${lesson.practice.prompt}</p>
                                <ul class="practice-deliverables">${lesson.practice.deliverables.map((item) => `<li>${item}</li>`).join("")}</ul>
                                <button class="btn btn-ghost" id="lessonHintBtn" type="button">Tampilkan petunjuk</button>
                                <div class="hint-box" id="lessonHint">${lesson.practice.hint}</div>
                                <label class="practice-check"><input id="practiceCompleted" type="checkbox" ${record.practiceCompleted ? "checked" : ""}> Saya sudah membuat dan memeriksa seluruh deliverable latihan.</label>
                            </div>
                        </section>

                        <section class="lesson-section" id="lessonCheckpoint">
                            <h2>Checkpoint</h2>
                            <div class="checkpoint-card">
                                <h3>${lesson.checkpoint.question}</h3>
                                <div class="checkpoint-options">
                                    ${lesson.checkpoint.options.map((option, index) => `<button class="checkpoint-option" type="button" data-answer="${index}">${String.fromCharCode(65 + index)}. ${option}</button>`).join("")}
                                </div>
                                <div class="checkpoint-footer">
                                    <div class="checkpoint-feedback" id="checkpointFeedback">${record.attempts ? `Skor terbaik: ${record.bestScore}% • ${record.attempts} percobaan` : "Pilih jawaban terbaik untuk menyelesaikan checkpoint."}</div>
                                    <button class="btn btn-ghost checkpoint-retry" id="checkpointRetryBtn" type="button" hidden>Coba lagi</button>
                                </div>
                            </div>
                        </section>

                        <section class="lesson-section" id="lessonNotes">
                            <div class="reader-section-heading">
                                <div><div class="section-kicker">Catatan pribadi</div><h2>Rekam pemahamanmu</h2></div>
                                <span class="reader-note-status" id="readerNoteStatus">Tersimpan otomatis</span>
                            </div>
                            <div class="reader-notes-card">
                                <textarea id="readerNotes" placeholder="Tulis ringkasan, pertanyaan, atau contoh versimu sendiri...">${escapeHtml(record.notes || "")}</textarea>
                                <div class="reader-notes-footer"><span id="readerNoteCount">0 karakter</span><button class="btn btn-ghost" id="clearReaderNotes" type="button">Hapus catatan</button></div>
                            </div>
                        </section>

                        <section class="lesson-section">
                            <h2>Referensi lanjutan</h2>
                            <ul>${lesson.references.map((reference) => `<li>${reference}</li>`).join("")}</ul>
                        </section>

                        ${currentIndex === flat.length - 1 ? buildCapstone() : ""}

                        <div class="reader-completion">
                            <div><strong id="completionTitle">${record.status === "mastered" ? "Pelajaran sudah mastered" : "Siap menyelesaikan pelajaran?"}</strong><p id="completionText">Mastery memerlukan latihan selesai dan checkpoint minimal 75%.</p></div>
                            <button class="btn btn-primary" id="completeLessonBtn" type="button">${record.status === "mastered" ? "Mastered ?" : "Tandai Selesai"}</button>
                        </div>
                        <nav class="reader-footer-nav" aria-label="Navigasi pelajaran">
                            ${previous ? `<a class="reader-nav-link" href="${lessonUrl(previous)}"><small>? Sebelumnya</small><strong>${previous.lesson.title}</strong></a>` : `<span class="reader-nav-link disabled"><small>Awal jalur</small><strong>Tidak ada pelajaran sebelumnya</strong></span>`}
                            ${next ? `<a class="reader-nav-link next ${nextState === "locked" ? "disabled" : ""}" href="${lessonUrl(next)}"><small>Berikutnya ?</small><strong>${next.lesson.title}</strong></a>` : `<a class="reader-nav-link next" href="materi.html?track=${track.id}"><small>Selesai</small><strong>Kembali ke dashboard</strong></a>`}
                        </nav>
                    </article>
                </main>
            </div>
        `;
        applyReaderPreferences();
        bindReader();
        updateReadingProgress();
        initReaderMotion();
    }

    function buildCapstone() {
        const capstone = track.capstone;
        const capstoneRecord = getTrackRecord().capstone || {};
        return `
            <section class="lesson-section">
                <div class="section-kicker">Capstone Project</div>
                <h2>${capstone.title}</h2>
                <div class="capstone-card">
                    <p>${capstone.brief}</p>
                    <h3>Rubrik kelulusan</h3>
                    <ul>${capstone.rubric.map((item) => `<li>${item.criterion}: ${item.weight}%</li>`).join("")}</ul>
                    <p>Nilai minimum: <strong>${capstone.passingScore}</strong> • Hadiah: <strong>${capstone.xp} XP</strong></p>
                    <label for="capstoneScore"><strong>Nilai review capstone</strong></label>
                    <div style="display:flex;gap:8px;margin-top:8px;align-items:center;">
                        <input id="capstoneScore" type="number" min="0" max="100" value="${capstoneRecord.bestScore || ""}" placeholder="0•100" style="min-height:44px;max-width:130px;border:1px solid var(--border);border-radius:13px;padding:0 12px;background:var(--item-bg);color:var(--dark);">
                        <button class="btn btn-primary" id="submitCapstone" type="button">Simpan Penilaian</button>
                    </div>
                    <p id="capstoneFeedback" style="margin-top:10px;">${capstoneRecord.passed ? "Capstone lulus dan jalur siap dipresentasikan." : "Gunakan rubrik untuk self-review atau review bersama mentor."}</p>
                </div>
            </section>
        `;
    }

    function escapeHtml(value) {
        return value.replace(/[&<>"']/g, (character) => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
        })[character]);
    }

    function recalculateStatus() {
        const record = getLessonRecord();
        if (record.practiceCompleted && record.bestScore >= 75 && (record.status === "completed" || record.status === "mastered")) {
            record.status = "mastered";
            if (!record.masteredAt) record.masteredAt = new Date().toISOString();
        }
        save();
        return record;
    }

    function awardXp(record) {
        if (record.xpAwarded) return;
        record.xpAwarded = true;
        progress.totalXpAwarded = Number(progress.totalXpAwarded || 0) + lesson.xp;
        if (typeof window.addXp === "function") window.addXp(lesson.xp);
    }

    function bindReader() {
        document.querySelectorAll(".reader-chapter-toggle").forEach((button) => {
            button.addEventListener("click", () => {
                const item = button.closest(".reader-chapter");
                item.classList.toggle("open");
                button.setAttribute("aria-expanded", String(item.classList.contains("open")));
            });
        });

        document.getElementById("readerMenuBtn")?.addEventListener("click", () => {
            setSidebarOpen(!document.getElementById("readerSidebar").classList.contains("open"));
        });
        document.getElementById("readerFocusBtn").addEventListener("click", (event) => {
            document.body.classList.toggle("reader-focus");
            const focusEnabled = document.body.classList.contains("reader-focus");
            event.currentTarget.classList.toggle("active", focusEnabled);
            event.currentTarget.setAttribute("aria-pressed", String(focusEnabled));
            localStorage.setItem(focusModeKey, focusEnabled ? "1" : "0");
        });
        document.getElementById("readerBookmarkBtn").addEventListener("click", (event) => {
            const record = getLessonRecord();
            record.bookmarked = !record.bookmarked;
            event.currentTarget.classList.toggle("active", record.bookmarked);
            event.currentTarget.setAttribute("aria-label", record.bookmarked ? "Hapus bookmark pelajaran" : "Bookmark pelajaran");
            event.currentTarget.setAttribute("aria-pressed", String(record.bookmarked));
            save();
        });
        document.getElementById("lessonHintBtn").addEventListener("click", () => {
            document.getElementById("lessonHint").classList.toggle("show");
        });
        document.getElementById("practiceCompleted").addEventListener("change", (event) => {
            getLessonRecord().practiceCompleted = event.target.checked;
            recalculateStatus();
            updateCompletionUi();
        });
        document.querySelectorAll(".checkpoint-option").forEach((button) => {
            button.addEventListener("click", () => answerCheckpoint(Number(button.dataset.answer)));
        });
        document.getElementById("checkpointRetryBtn").addEventListener("click", resetCheckpoint);
        document.getElementById("completeLessonBtn").addEventListener("click", completeLesson);
        document.getElementById("copyLessonCode").addEventListener("click", copyCode);
        document.getElementById("submitCapstone")?.addEventListener("click", submitCapstone);
        document.getElementById("readerFontDownBtn").addEventListener("click", () => changeFontScale(-1));
        document.getElementById("readerFontUpBtn").addEventListener("click", () => changeFontScale(1));
        document.getElementById("readerThemeBtn").addEventListener("click", toggleReaderTheme);
        document.getElementById("readerSidebarBackdrop").addEventListener("click", () => setSidebarOpen(false));
        document.getElementById("readerLessonSearch").addEventListener("input", filterLessons);
        document.querySelectorAll(".reader-lesson-link").forEach((link) => {
            link.addEventListener("click", () => {
                saveNotesNow();
                setSidebarOpen(false);
            });
        });
        document.querySelectorAll(".reader-on-page a").forEach((link) => {
            link.addEventListener("click", () => {
                document.querySelectorAll(".reader-on-page a").forEach((item) => item.classList.remove("active"));
                link.classList.add("active");
            });
        });

        document.getElementById("readerNotes").addEventListener("input", handleNotesInput);
        document.getElementById("readerNotes").addEventListener("change", saveNotesNow);
        document.getElementById("clearReaderNotes").addEventListener("click", clearNotes);
        updateNoteCount();

        if (!readerGlobalEventsBound) {
            readerGlobalEventsBound = true;
            window.addEventListener("scroll", scheduleReadingProgress, { passive: true });
            window.addEventListener("resize", scheduleReadingProgress, { passive: true });
            window.addEventListener("pagehide", saveNotesNow);
            document.addEventListener("keydown", handleReaderShortcuts);
        }
    }

    function setSidebarOpen(open) {
        document.getElementById("readerSidebar")?.classList.toggle("open", open);
        document.getElementById("readerSidebarBackdrop")?.classList.toggle("show", open);
        document.getElementById("readerMenuBtn")?.setAttribute("aria-expanded", String(open));
        document.body.classList.toggle("reader-menu-open", open);
    }

    function filterLessons(event) {
        const query = event.target.value.trim().toLowerCase();
        let visibleLessons = 0;
        document.querySelectorAll(".reader-chapter").forEach((chapterElement) => {
            const chapterTitle = chapterElement.querySelector(".reader-chapter-toggle strong").textContent.toLowerCase();
            let chapterMatches = 0;
            chapterElement.querySelectorAll(".reader-lesson-link").forEach((link) => {
                const matches = !query || chapterTitle.includes(query) || link.textContent.toLowerCase().includes(query);
                link.hidden = !matches;
                if (matches) chapterMatches += 1;
            });
            chapterElement.hidden = chapterMatches === 0;
            if (query && chapterMatches) {
                chapterElement.classList.add("open");
                chapterElement.querySelector(".reader-chapter-toggle").setAttribute("aria-expanded", "true");
            }
            visibleLessons += chapterMatches;
        });
        document.getElementById("readerSearchEmpty").hidden = visibleLessons !== 0;
    }

    function getFontScale() {
        const saved = Number(localStorage.getItem(fontScaleKey));
        return allowedFontScales.includes(saved) ? saved : 1;
    }

    function applyReaderPreferences() {
        const scale = getFontScale();
        applyFontScale(scale);
        applyReaderTheme(localStorage.getItem("eduquest_theme") || "light");
        const focusEnabled = localStorage.getItem(focusModeKey) === "1";
        document.body.classList.toggle("reader-focus", focusEnabled);
        document.getElementById("readerFocusBtn")?.classList.toggle("active", focusEnabled);
        document.getElementById("readerFocusBtn")?.setAttribute("aria-pressed", String(focusEnabled));
        updateFontButtons(scale);
    }

    function toggleReaderTheme() {
        const nextTheme = document.body.classList.contains("dark-theme") ? "light" : "dark";
        localStorage.setItem("eduquest_theme", nextTheme);
        applyReaderTheme(nextTheme);
    }

    function applyReaderTheme(theme) {
        const dark = theme === "dark";
        document.body.classList.toggle("dark-theme", dark);
        const button = document.getElementById("readerThemeBtn");
        if (button) {
            button.classList.toggle("active", dark);
            button.setAttribute("aria-label", dark ? "Gunakan tema terang" : "Gunakan tema gelap");
        }
    }

    function changeFontScale(direction) {
        const currentIndex = allowedFontScales.indexOf(getFontScale());
        const nextIndex = Math.max(0, Math.min(allowedFontScales.length - 1, currentIndex + direction));
        const nextScale = allowedFontScales[nextIndex];
        localStorage.setItem(fontScaleKey, String(nextScale));
        applyFontScale(nextScale);
        updateFontButtons(nextScale);
    }

    function applyFontScale(scale) {
        document.documentElement.style.setProperty("--reader-body-font-size", `${15 * scale}px`);
        document.documentElement.style.setProperty("--reader-control-font-size", `${13 * scale}px`);
        document.documentElement.style.setProperty("--reader-note-font-size", `${14 * scale}px`);
    }

    function updateFontButtons(scale) {
        document.getElementById("readerFontDownBtn")?.toggleAttribute("disabled", scale === allowedFontScales[0]);
        document.getElementById("readerFontUpBtn")?.toggleAttribute("disabled", scale === allowedFontScales[allowedFontScales.length - 1]);
    }

    function handleNotesInput() {
        const status = document.getElementById("readerNoteStatus");
        status.textContent = "Menyimpan...";
        status.classList.add("saving");
        updateNoteCount();
        clearTimeout(noteSaveTimer);
        noteSaveTimer = setTimeout(saveNotesNow, 450);
    }

    function saveNotesNow() {
        clearTimeout(noteSaveTimer);
        const notes = document.getElementById("readerNotes");
        if (!notes) return;
        getLessonRecord().notes = notes.value;
        save();
        const status = document.getElementById("readerNoteStatus");
        if (status) {
            status.textContent = "Tersimpan otomatis";
            status.classList.remove("saving");
        }
    }

    function updateNoteCount() {
        const value = document.getElementById("readerNotes")?.value || "";
        document.getElementById("readerNoteCount").textContent = `${value.length} karakter`;
    }

    function clearNotes() {
        const notes = document.getElementById("readerNotes");
        if (!notes.value) return;
        notes.value = "";
        getLessonRecord().notes = "";
        save();
        updateNoteCount();
        document.getElementById("readerNoteStatus").textContent = "Catatan dihapus";
        notes.focus();
    }

    function scheduleReadingProgress() {
        if (readingProgressFrame) return;
        readingProgressFrame = requestAnimationFrame(() => {
            readingProgressFrame = null;
            updateReadingProgress();
        });
    }

    function updateReadingProgress() {
        const content = document.querySelector(".reader-content");
        if (!content) return;
        const start = content.offsetTop;
        const distance = Math.max(1, content.scrollHeight - window.innerHeight * 0.65);
        const percent = Math.max(0, Math.min(100, Math.round(((window.scrollY - start + 90) / distance) * 100)));
        document.getElementById("readerPageProgress")?.style.setProperty("--value", `${percent}%`);
        const label = document.getElementById("readerReadPercent");
        if (label) label.textContent = `${percent}% dibaca`;
    }

    function handleReaderShortcuts(event) {
        if (event.target.matches("input, textarea, [contenteditable='true']")) return;
        if (event.key === "Escape") setSidebarOpen(false);
        if (event.key.toLowerCase() === "f") document.getElementById("readerFocusBtn")?.click();
        if (event.key.toLowerCase() === "b") document.getElementById("readerBookmarkBtn")?.click();
    }

    function initReaderMotion() {
        requestAnimationFrame(() => root.classList.add("reader-motion-ready"));
        if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            document.querySelectorAll(".lesson-section, .reader-completion, .reader-footer-nav").forEach((element) => {
                element.classList.add("reader-motion-visible");
            });
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("reader-motion-visible");
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.08, rootMargin: "0px 0px -8% 0px" });

        document.querySelectorAll(".lesson-section, .reader-completion, .reader-footer-nav").forEach((element, index) => {
            element.style.setProperty("--motion-index", index);
            observer.observe(element);
        });
    }

    async function copyCode(event) {
        const code = lesson.example.code;
        try {
            if (!navigator.clipboard || !window.isSecureContext) throw new Error("Clipboard unavailable");
            await navigator.clipboard.writeText(code);
            event.currentTarget.textContent = "Disalin!";
        } catch (error) {
            const range = document.createRange();
            range.selectNodeContents(document.getElementById("lessonCode"));
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            event.currentTarget.textContent = "Pilih & salin";
        }
        setTimeout(() => event.currentTarget.textContent = "Salin", 1800);
    }

    function answerCheckpoint(index) {
        if (selectedCheckpoint !== null) return;
        selectedCheckpoint = index;
        const record = getLessonRecord();
        record.attempts = Number(record.attempts || 0) + 1;
        const correct = index === lesson.checkpoint.correctIndex;
        const score = correct ? 100 : 0;
        record.bestScore = Math.max(Number(record.bestScore || 0), score);
        document.querySelectorAll(".checkpoint-option").forEach((button) => {
            const buttonIndex = Number(button.dataset.answer);
            button.disabled = true;
            if (buttonIndex === lesson.checkpoint.correctIndex) button.classList.add("correct");
            else if (buttonIndex === index) button.classList.add("wrong");
        });
        document.getElementById("checkpointFeedback").textContent = `${correct ? "Benar." : "Belum tepat."} ${lesson.checkpoint.explanation}`;
        document.getElementById("checkpointRetryBtn").hidden = correct;
        recalculateStatus();
        updateCompletionUi();
    }

    function resetCheckpoint() {
        selectedCheckpoint = null;
        document.querySelectorAll(".checkpoint-option").forEach((button) => {
            button.disabled = false;
            button.classList.remove("correct", "wrong");
        });
        document.getElementById("checkpointFeedback").textContent = "Coba kembali. Baca setiap pilihan dengan teliti.";
        document.getElementById("checkpointRetryBtn").hidden = true;
        document.querySelector(".checkpoint-option")?.focus();
    }

    function completeLesson() {
        const record = getLessonRecord();
        if (record.status !== "mastered") record.status = "completed";
        record.completedAt = record.completedAt || new Date().toISOString();
        awardXp(record);
        recalculateStatus();
        buildReader();
        document.querySelector(".reader-completion")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    function submitCapstone() {
        const input = document.getElementById("capstoneScore");
        const score = Math.max(0, Math.min(100, Number(input.value)));
        const trackRecord = getTrackRecord();
        const previous = trackRecord.capstone || {};
        trackRecord.capstone = {
            bestScore: Math.max(Number(previous.bestScore || 0), score),
            attempts: Number(previous.attempts || 0) + 1,
            passed: Math.max(Number(previous.bestScore || 0), score) >= track.capstone.passingScore,
            reviewedAt: new Date().toISOString(),
            xpAwarded: Boolean(previous.xpAwarded)
        };
        if (trackRecord.capstone.passed && !trackRecord.capstone.xpAwarded) {
            trackRecord.capstone.xpAwarded = true;
            progress.totalXpAwarded = Number(progress.totalXpAwarded || 0) + track.capstone.xp;
            if (typeof window.addXp === "function") window.addXp(track.capstone.xp);
        }
        save();
        document.getElementById("capstoneFeedback").textContent = trackRecord.capstone.passed
            ? `Lulus dengan skor terbaik ${trackRecord.capstone.bestScore}. Capstone XP diberikan satu kali.`
            : `Skor terbaik ${trackRecord.capstone.bestScore}. Perbaiki artefak sampai mencapai ${track.capstone.passingScore}.`;
    }

    function updateCompletionUi() {
        const record = getLessonRecord();
        const title = document.getElementById("completionTitle");
        const text = document.getElementById("completionText");
        const button = document.getElementById("completeLessonBtn");
        if (record.status === "mastered") {
            title.textContent = "Pelajaran sudah mastered";
            text.textContent = "Latihan selesai dan checkpoint memenuhi batas mastery.";
            button.textContent = "Mastered ?";
        } else {
            title.textContent = "Siap menyelesaikan pelajaran?";
            text.textContent = `Praktik: ${record.practiceCompleted ? "selesai" : "belum"} • Skor terbaik: ${record.bestScore || 0}%`;
            button.textContent = record.status === "completed" ? "Selesai ?" : "Tandai Selesai";
        }
        document.getElementById("lessonStatusPill").textContent = record.status.replace("_", " ");
    }

    markStarted();
    const canonical = new URL(location.href);
    canonical.searchParams.set("topik", track.id);
    canonical.searchParams.set("lesson", lesson.id);
    history.replaceState({ trackId: track.id, lessonId: lesson.id }, "", canonical);
    buildReader();
})();
