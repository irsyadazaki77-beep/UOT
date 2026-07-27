(function () {
    "use strict";

    const curriculum = window.QNCurriculum;
    const root = document.getElementById("lessonReader");
    if (!root) return;
    if (!curriculum) {
        renderError("Materi belum dapat dimuat", "Data kurikulum tidak tersedia. Muat ulang halaman atau kembali ke dashboard materi.");
        return;
    }

    const params = new URLSearchParams(location.search);
    let progress = curriculum.readProgress();
    let track = curriculum.getTrack(params.get("topik")) || curriculum.tracks[0];
    let quizChapter = params.get("mode") === "quiz" ? curriculum.getChapter(track.id, params.get("chapter")) : null;
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
    if (quizChapter) chapter = quizChapter;
    let selectedCheckpoint = null;
    let quizQuestions = [];
    let quizAnswers = [];
    let quizIndex = 0;
    let quizSubmitted = false;
    let certificatePreviewTimer = null;
    let noteSaveTimer = null;
    let readerEventsBound = false;
    let playgroundFrame = null;
    let sectionObserver = null;
    let drawerReturnFocus = null;
    const FONT_KEY = "qnReaderFontScale";
    const FOCUS_KEY = "qnReaderFocusMode";
    const allowedScales = [0.9, 1, 1.1, 1.2];
    const icons = {
        menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
        minus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12"/></svg>',
        plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 6v12M6 12h12"/></svg>',
        theme: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 1 0 9 9c0-.6-.06-1.18-.17-1.74A7 7 0 0 1 12 3Z"/></svg>',
        bookmark: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 4.5h11v16L12 17l-5.5 3.5v-16Z"/></svg>',
        focus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4H4v4m12-4h4v4M8 20H4v-4m12 4h4v-4"/><circle cx="12" cy="12" r="3"/></svg>',
        check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>',
        lock: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="3"/><path d="M8 10V8a4 4 0 0 1 8 0v2"/></svg>',
        dot: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/></svg>',
        star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z"/></svg>'
    };

    function getTrackRecord() {
        progress.tracks[track.id] = progress.tracks[track.id] || { lessons: {}, chapterAssessments: {}, capstone: {} };
        progress.tracks[track.id].lessons = progress.tracks[track.id].lessons || {};
        progress.tracks[track.id].chapterAssessments = progress.tracks[track.id].chapterAssessments || {};
        return progress.tracks[track.id];
    }

    function getLessonRecord() {
        const trackRecord = getTrackRecord();
        trackRecord.lessons[lesson.id] = trackRecord.lessons[lesson.id] || {
            status: "available", bestScore: 0, attempts: 0, practiceCompleted: false,
            bookmarked: false, xpAwarded: false, notes: "", startedAt: new Date().toISOString()
        };
        return trackRecord.lessons[lesson.id];
    }

    function save() {
        progress.lastTrackId = track.id;
        progress.lastLessonId = lesson.id;
        progress = curriculum.writeProgress(progress);
    }

    function lessonUrl(target) {
        return `materi-basic.html?topik=${encodeURIComponent(target.track.id)}&lesson=${encodeURIComponent(target.lesson.id)}`;
    }

    function assessmentUrl(targetChapter) {
        return `materi-basic.html?topik=${encodeURIComponent(track.id)}&mode=quiz&chapter=${encodeURIComponent(targetChapter.id)}`;
    }

    function escapeHtml(value) {
        return String(value ?? "").replace(/[&<>"']/g, (char) => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
        })[char]);
    }

    function showToast(message) {
        const toast = document.getElementById("studioToast");
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add("show");
        clearTimeout(showToast.timer);
        showToast.timer = setTimeout(() => toast.classList.remove("show"), 2200);
    }

    function awardXpSafely(amount) {
        if (typeof window.addXp !== "function") return;
        try {
            window.addXp(amount);
        } catch (error) {
            console.warn("XP global belum dapat disinkronkan; progres Learning Studio tetap tersimpan.", error);
        }
    }

    function statusIcon(status) {
        if (status === "mastered" || status === "passed") return icons.star;
        if (status === "completed") return icons.check;
        if (status === "locked") return icons.lock;
        return icons.dot;
    }

    function statusLabel(status) {
        return ({ available: "Tersedia", in_progress: "Sedang dipelajari", completed: "Selesai", mastered: "Dikuasai", locked: "Terkunci" })[status] || "Tersedia";
    }

    function assessmentLabel(status) {
        return ({ locked: "Terkunci", available: "Siap dikerjakan", attempted: "Belum lulus", passed: "Lulus" })[status] || "Tersedia";
    }

    function buildHeader(trackProgress, options = {}) {
        const includeBookmark = Boolean(options.includeBookmark);
        const record = includeBookmark ? getLessonRecord() : null;
        return `<header class="studio-header">
            <a class="studio-brand" href="materi.html" aria-label="Kembali ke dashboard materi">
                <span class="studio-brand-mark"><img src="universe-of-tech-logo.webp" alt=""></span>
                <span class="studio-brand-copy"><strong>Universe Of Tech</strong><small>Learning Studio</small></span>
            </a>
            <div class="studio-track-progress" aria-label="Progres ${escapeHtml(track.title)} ${trackProgress.percent} persen">
                <div><strong>${escapeHtml(track.title)}</strong><span>${trackProgress.completed}/${trackProgress.total} pelajaran <span aria-hidden="true">·</span> ${trackProgress.percent}%</span></div>
                <div class="studio-progress-track" aria-hidden="true"><i style="--value:${trackProgress.percent}%"></i></div>
            </div>
            <div class="studio-actions" aria-label="Pengaturan pembaca">
                <button class="studio-icon-btn studio-menu-btn" id="studioMenuBtn" type="button" aria-label="Buka daftar pelajaran" aria-controls="studioSidebar" aria-expanded="false">${icons.menu}</button>
                <span class="studio-font-group" aria-label="Ukuran teks">
                    <button class="studio-icon-btn font-control" id="studioFontDown" type="button" aria-label="Perkecil teks"><span class="font-letter" aria-hidden="true">A</span>${icons.minus}</button>
                    <button class="studio-icon-btn font-control" id="studioFontUp" type="button" aria-label="Perbesar teks"><span class="font-letter" aria-hidden="true">A</span>${icons.plus}</button>
                </span>
                <button class="studio-icon-btn" id="studioThemeBtn" data-reader-control="theme" type="button" aria-label="Aktifkan tema gelap" aria-pressed="false">${icons.theme}</button>
                ${includeBookmark ? `<button class="studio-icon-btn ${record.bookmarked ? "active" : ""}" id="studioBookmarkBtn" data-reader-control="bookmark" type="button" aria-label="${record.bookmarked ? "Hapus bookmark" : "Bookmark pelajaran"}" aria-pressed="${record.bookmarked}">${icons.bookmark}</button>` : ""}
                <button class="studio-icon-btn" id="studioFocusBtn" data-reader-control="focus" type="button" aria-label="Aktifkan mode fokus" aria-pressed="false">${icons.focus}<span class="action-label">Fokus</span></button>
            </div>
        </header>`;
    }

    function buildMobileDock(includeBookmark = false) {
        return `<nav class="studio-mobile-dock" aria-label="Aksi cepat pembaca">
            <button type="button" data-mobile-action="menu" aria-label="Buka daftar pelajaran">${icons.menu}<span>Materi</span></button>
            ${includeBookmark ? `<button type="button" data-mobile-action="bookmark" data-reader-control="bookmark" aria-label="Bookmark pelajaran" aria-pressed="false">${icons.bookmark}<span>Simpan</span></button>` : ""}
            <button type="button" data-mobile-action="theme" data-reader-control="theme" aria-label="Aktifkan tema gelap" aria-pressed="false">${icons.theme}<span>Tema</span></button>
            <button type="button" data-mobile-action="focus" data-reader-control="focus" aria-label="Aktifkan mode fokus" aria-pressed="false">${icons.focus}<span>Fokus</span></button>
        </nav>`;
    }

    function buildSidebar() {
        const sidebarProgress = curriculum.getTrackProgress(track.id, progress);
        return `
            <aside class="studio-sidebar" id="studioSidebar" aria-label="Daftar pelajaran">
                <div class="studio-sidebar-heading">
                    <span class="studio-kicker">Kurikulum belajar</span>
                    <button class="studio-sidebar-close" type="button" data-close-sidebar aria-label="Tutup daftar pelajaran">×</button>
                </div>
                <div class="studio-track-card">
                    <div class="studio-kicker">${escapeHtml(track.mark)} <span aria-hidden="true">·</span> ${escapeHtml(track.level)}</div>
                    <strong>${escapeHtml(track.title)}</strong>
                    <p>${track.chapters.length} bab <span aria-hidden="true">·</span> ${curriculum.flattenLessons(track).length} pelajaran <span aria-hidden="true">·</span> sekitar ${Math.round(track.durationMinutes / 60)} jam</p>
                    <div class="studio-track-card-progress"><span>${sidebarProgress.percent}% selesai</span><span>${sidebarProgress.completed}/${sidebarProgress.total}</span></div>
                    <div class="studio-progress-track" aria-hidden="true"><i style="--value:${sidebarProgress.percent}%"></i></div>
                </div>
                <label class="studio-search"><span>Cari dalam jalur ini</span><input id="studioLessonSearch" type="search" placeholder="Judul pelajaran atau bab" autocomplete="off"></label>
                <div class="studio-chapters">
                    ${track.chapters.map((item, chapterIndex) => `
                        <section class="studio-chapter ${item.id === chapter.id ? "open current" : ""}">
                            <button class="studio-chapter-toggle" type="button" aria-expanded="${item.id === chapter.id}">
                                <span class="studio-chapter-index" aria-hidden="true">${chapterIndex + 1}</span>
                                <span><strong>${escapeHtml(item.title)}</strong><small>${item.lessons.length} pelajaran</small></span>
                                <span class="studio-chevron" aria-hidden="true">⌄</span>
                            </button>
                            <div class="studio-lesson-list">
                                ${item.lessons.map((itemLesson) => {
                                    const status = curriculum.getLessonState(track.id, itemLesson.id, progress);
                                    return `<a class="studio-lesson-link ${status} ${itemLesson.id === lesson.id ? "active" : ""}" href="${lessonUrl({ track, lesson: itemLesson })}" ${itemLesson.id === lesson.id ? 'aria-current="page"' : ""} ${status === "locked" ? 'aria-disabled="true" tabindex="-1" data-locked="true"' : ""}>
                                        <span class="studio-status-dot" aria-hidden="true">${statusIcon(status)}</span><span class="studio-lesson-copy">${escapeHtml(itemLesson.title)}<small>${statusLabel(status)}</small></span>
                                    </a>`;
                                }).join("")}
                                ${(() => {
                                    const status = curriculum.getChapterAssessmentState(track.id, item.id, progress);
                                    const active = quizChapter?.id === item.id;
                                    return `<a class="studio-lesson-link studio-assessment-link ${status} ${active ? "active" : ""}" href="${assessmentUrl(item)}" ${active ? 'aria-current="page"' : ""} ${status === "locked" ? 'aria-disabled="true" tabindex="-1" data-locked="true"' : ""}>
                                        <span class="studio-status-dot" aria-hidden="true">${statusIcon(status)}</span>
                                        <span><strong>Kuis akhir bab</strong><small>${assessmentLabel(status)}</small></span>
                                    </a>`;
                                })()}
                            </div>
                        </section>`).join("")}
                </div>
                ${(() => {
                    const certificate = curriculum.getCertificateEligibility(track.id, progress);
                    return `<div class="studio-certificate-mini ${certificate.eligible ? "ready" : ""}">
                        <span class="studio-kicker">Sertifikat jalur</span>
                        <strong>${certificate.eligible ? "Sertifikatmu siap" : `${certificate.passed}/${certificate.total} kuis bab lulus`}</strong>
                        <p>${certificate.eligible ? `Nilai akhir ${certificate.score}%. Unduh kembali kapan saja.` : "Lulus semua kuis dengan nilai minimal 80%."}</p>
                        ${certificate.eligible ? '<button class="studio-btn primary" type="button" data-open-certificate>Buka sertifikat</button>' : ""}
                    </div>`;
                })()}
                <div class="studio-search-empty" id="studioSearchEmpty" hidden>Tidak ada pelajaran yang cocok.</div>
            </aside>`;
    }

    function fallbackTakeaways() {
        return lesson.outcomes.slice(0, 3);
    }

    function fallbackGlossary() {
        return [
            { term: lesson.title, definition: `Konsep utama yang sedang dipelajari dalam jalur ${track.title}.` },
            { term: "Constraint", definition: "Batasan yang memengaruhi pilihan solusi dan cara memvalidasinya." },
            { term: "Validasi", definition: "Proses membuktikan bahwa hasil sesuai kebutuhan dan tetap aman pada kondisi gagal." }
        ];
    }

    function fallbackPracticeLevels() {
        return [
            { label: "Terpandu", title: "Ikuti pola dasar", prompt: lesson.practice.prompt },
            { label: "Mandiri", title: "Terapkan pada skenario baru", prompt: `Buat versi berbeda dari contoh ${lesson.title} dan jelaskan keputusanmu.` },
            { label: "Tantangan", title: "Uji kondisi gagal", prompt: "Tambahkan satu edge case, bukti pengujian, dan catatan perbaikan berikutnya." }
        ];
    }

    function buildCapstone() {
        const capstone = track.capstone;
        const record = getTrackRecord().capstone || {};
        return `<section class="lesson-section" id="lessonCapstone">
            <div class="studio-kicker">Capstone project</div><h2>${escapeHtml(capstone.title)}</h2>
            <p>${escapeHtml(capstone.brief)}</p>
            <div class="studio-grid">${capstone.rubric.map((item) => `<div class="studio-card"><strong>${escapeHtml(item.criterion)}</strong>${item.weight}% dari penilaian</div>`).join("")}</div>
            <label for="capstoneScore"><strong>Nilai review capstone</strong></label>
            <div class="checkpoint-footer"><input id="capstoneScore" type="number" min="0" max="100" value="${record.bestScore || ""}" placeholder="0–100"><button class="studio-btn primary" id="submitCapstone" type="button">Simpan penilaian</button></div>
            <div class="checkpoint-feedback" id="capstoneFeedback">${record.passed ? `Lulus dengan skor terbaik ${record.bestScore}.` : `Nilai minimum ${capstone.passingScore}. Gunakan rubrik untuk review terarah.`}</div>
        </section>`;
    }

    function shuffle(items) {
        const result = items.slice();
        for (let index = result.length - 1; index > 0; index -= 1) {
            const swap = Math.floor(Math.random() * (index + 1));
            [result[index], result[swap]] = [result[swap], result[index]];
        }
        return result;
    }

    function prepareQuiz() {
        quizQuestions = shuffle(chapter.assessment.questions).map((question) => {
            const options = shuffle(question.options.map((text, index) => ({ text, correct: index === question.correctIndex })));
            return { ...question, options: options.map((item) => item.text), correctIndex: options.findIndex((item) => item.correct) };
        });
        quizAnswers = Array(quizQuestions.length).fill(null);
        quizIndex = 0;
        quizSubmitted = false;
    }

    function certificateDialogMarkup() {
        return `<dialog class="certificate-dialog" id="certificateDialog" aria-labelledby="certificateDialogTitle">
            <div class="certificate-dialog-head">
                <div><span class="studio-kicker">Premium Nusantara Tech</span><h2 id="certificateDialogTitle">Sertifikat ${escapeHtml(track.title)}</h2></div>
                <button class="studio-icon-btn" type="button" data-close-certificate aria-label="Tutup pratinjau">×</button>
            </div>
            <div class="certificate-preview-frame"><div class="certificate-preview-loading" id="certificatePreviewLoading">Menyiapkan pratinjau sertifikat…</div><img id="certificatePreviewImage" alt=""></div>
            <div class="certificate-dialog-actions">
                <label><span>Nama pada sertifikat</span><input id="certificateRecipientName" type="text" maxlength="80" autocomplete="name"></label>
                <button class="studio-btn primary" id="downloadCertificateBtn" type="button">Unduh PDF</button>
            </div>
            <p class="certificate-local-note">Credential disimpan dan diverifikasi secara lokal pada perangkat ini.</p>
        </dialog>`;
    }

    function getSessionName() {
        try {
            const session = JSON.parse(localStorage.getItem("eduquestUserSession") || "{}");
            return String(session.username || session.name || "").trim();
        } catch {
            return "";
        }
    }

    function certificateData(name) {
        const eligibility = curriculum.getCertificateEligibility(track.id, progress);
        const existing = progress.certificates?.[track.id];
        return {
            ...(existing || {}),
            id: existing?.id || "Diterbitkan saat diunduh",
            verification: existing?.verification || "LOCAL",
            issuedAt: existing?.issuedAt || new Date().toISOString(),
            recipientName: name || existing?.recipientName || getSessionName() || "Pembelajar Universe Of Tech",
            trackTitle: track.title,
            score: eligibility.score,
            completedChapters: eligibility.passed,
            totalChapters: eligibility.total,
            logoUrl: "universe-of-tech-logo.webp"
        };
    }

    async function updateCertificatePreview(name) {
        const loading = document.getElementById("certificatePreviewLoading");
        const image = document.getElementById("certificatePreviewImage");
        if (!image || !window.QNCertificatePDF) return;
        if (loading) loading.hidden = false;
        try {
            await window.QNCertificatePDF.renderPreview(certificateData(name), image);
            if (loading) loading.hidden = true;
        } catch {
            if (loading) loading.textContent = "Pratinjau belum dapat dibuat. Coba muat ulang halaman.";
        }
    }

    async function openCertificate() {
        const eligibility = curriculum.getCertificateEligibility(track.id, progress);
        if (!eligibility.eligible) {
            showToast("Luluskan seluruh kuis bab untuk membuka sertifikat.");
            return;
        }
        const dialog = document.getElementById("certificateDialog");
        const input = document.getElementById("certificateRecipientName");
        if (!dialog || !input) return;
        const defaultName = progress.certificates?.[track.id]?.recipientName || getSessionName() || "Pembelajar Universe Of Tech";
        input.value = defaultName;
        dialog.showModal();
        await updateCertificatePreview(defaultName);
        dialog.scrollTop = 0;
    }

    async function downloadCertificate() {
        const button = document.getElementById("downloadCertificateBtn");
        const input = document.getElementById("certificateRecipientName");
        const name = input?.value.trim();
        if (!name) {
            input?.focus();
            showToast("Masukkan nama penerima sertifikat.");
            return;
        }
        if (!window.QNCertificatePDF) {
            showToast("Generator PDF belum tersedia. Muat ulang halaman.");
            return;
        }
        button.disabled = true;
        button.textContent = "Membuat PDF…";
        try {
            const certificate = curriculum.issueCertificate(track.id, name, progress);
            progress = curriculum.readProgress();
            const eligibility = curriculum.getCertificateEligibility(track.id, progress);
            await window.QNCertificatePDF.download({
                ...certificate,
                completedChapters: eligibility.passed,
                totalChapters: eligibility.total,
                logoUrl: "universe-of-tech-logo.webp"
            });
            await updateCertificatePreview(name);
            showToast("Sertifikat PDF berhasil diunduh.");
        } catch (error) {
            showToast(error.message || "Sertifikat belum dapat dibuat.");
        } finally {
            button.disabled = false;
            button.textContent = "Unduh PDF";
        }
    }

    function bindCertificateControls() {
        document.querySelectorAll("[data-open-certificate]").forEach((button) => button.addEventListener("click", openCertificate));
        document.querySelectorAll("[data-close-certificate]").forEach((button) => button.addEventListener("click", () => document.getElementById("certificateDialog")?.close()));
        document.getElementById("certificateDialog")?.addEventListener("click", (event) => {
            if (event.target === event.currentTarget) event.currentTarget.close();
        });
        document.getElementById("certificateRecipientName")?.addEventListener("input", (event) => {
            clearTimeout(certificatePreviewTimer);
            certificatePreviewTimer = setTimeout(() => updateCertificatePreview(event.target.value.trim()), 260);
        });
        document.getElementById("downloadCertificateBtn")?.addEventListener("click", downloadCertificate);
    }

    function quizHeader(trackProgress) {
        return buildHeader(trackProgress);
    }

    function buildQuizQuestion() {
        const question = quizQuestions[quizIndex];
        const answered = quizAnswers.filter((answer) => answer !== null).length;
        return `<section class="chapter-quiz-card" aria-labelledby="quizQuestionTitle">
            <div class="quiz-card-meta"><span class="quiz-difficulty ${escapeHtml(question.difficulty)}">${escapeHtml(question.difficulty)}</span><span>${answered}/${quizQuestions.length} terjawab</span></div>
            <h2 id="quizQuestionTitle"><span>${quizIndex + 1}.</span> ${escapeHtml(question.prompt)}</h2>
            <div class="chapter-quiz-options" role="radiogroup" aria-label="Pilihan jawaban">
                ${question.options.map((option, index) => `<button class="chapter-quiz-option ${quizAnswers[quizIndex] === index ? "selected" : ""}" type="button" role="radio" aria-checked="${quizAnswers[quizIndex] === index}" data-quiz-answer="${index}"><span>${String.fromCharCode(65 + index)}</span>${escapeHtml(option)}</button>`).join("")}
            </div>
        </section>`;
    }

    function buildQuizNavigator() {
        return `<div class="quiz-navigator" aria-label="Navigasi soal">${quizQuestions.map((_, index) => `<button type="button" class="${index === quizIndex ? "active" : ""} ${quizAnswers[index] !== null ? "answered" : ""}" data-quiz-index="${index}" aria-label="Soal ${index + 1}${quizAnswers[index] !== null ? ", sudah dijawab" : ""}">${index + 1}</button>`).join("")}</div>
            <div class="quiz-navigation">
                <button class="studio-btn" type="button" data-quiz-previous ${quizIndex === 0 ? "disabled" : ""}>Sebelumnya</button>
                ${quizIndex === quizQuestions.length - 1
                    ? '<button class="studio-btn primary" type="button" data-review-quiz>Kumpulkan jawaban</button>'
                    : '<button class="studio-btn primary" type="button" data-quiz-next>Berikutnya</button>'}
            </div>`;
    }

    function buildQuizResults() {
        const record = getTrackRecord().chapterAssessments[chapter.id];
        const passed = record.lastScore >= chapter.assessment.passingScore;
        const eligibility = curriculum.getCertificateEligibility(track.id, progress);
        return `<section class="quiz-result-hero ${passed ? "passed" : "failed"}">
            <span class="studio-kicker">${passed ? "Kuis bab lulus" : "Belum mencapai batas lulus"}</span>
            <strong>${record.lastScore}%</strong>
            <h2>${passed ? "Hebat, pemahamanmu terbukti." : "Tinjau pembahasan dan coba lagi."}</h2>
            <p>Nilai terbaik ${record.bestScore}% · Percobaan ${record.attempts} · Minimal lulus ${chapter.assessment.passingScore}%</p>
            <div class="quiz-result-actions"><button class="studio-btn" type="button" data-retry-quiz>Ulangi kuis</button>${passed ? `<a class="studio-btn primary" href="${lessonUrl({ track, lesson: chapter.lessons.at(-1) })}">Kembali ke materi</a>` : ""}</div>
        </section>
        ${eligibility.eligible ? `<section class="certificate-unlocked">
            <div><span class="studio-kicker">Pencapaian jalur terbuka</span><h2>Sertifikat ${escapeHtml(track.title)} siap diunduh</h2><p>Seluruh ${eligibility.total} kuis bab lulus dengan nilai akhir ${eligibility.score}%.</p></div>
            <button class="studio-btn primary" type="button" data-open-certificate>Buka sertifikat</button>
        </section>` : `<section class="certificate-progress-panel"><div><span class="studio-kicker">Menuju sertifikat</span><h2>${eligibility.passed} dari ${eligibility.total} kuis bab lulus</h2></div><div class="certificate-progress-track"><i style="--value:${(eligibility.passed / eligibility.total) * 100}%"></i></div></section>`}
        <section class="quiz-review"><div class="studio-kicker">Pembahasan jawaban</div><h2>Pelajari setiap keputusan</h2>
            ${quizQuestions.map((question, index) => {
                const chosen = quizAnswers[index];
                const correct = chosen === question.correctIndex;
                return `<article class="quiz-review-item ${correct ? "correct" : "wrong"}"><div class="quiz-review-title"><span>${correct ? "Benar" : "Perlu ditinjau"}</span><strong>${index + 1}. ${escapeHtml(question.prompt)}</strong></div><p>Jawabanmu: <b>${chosen === null ? "Tidak dijawab" : escapeHtml(question.options[chosen])}</b></p>${correct ? "" : `<p>Jawaban tepat: <b>${escapeHtml(question.options[question.correctIndex])}</b></p>`}<p>${escapeHtml(question.explanation)}</p></article>`;
            }).join("")}
        </section>`;
    }

    function buildQuiz() {
        sectionObserver?.disconnect();
        const state = curriculum.getChapterAssessmentState(track.id, chapter.id, progress);
        if (state !== "locked" && !quizQuestions.length) prepareQuiz();
        const trackProgress = curriculum.getTrackProgress(track.id, progress);
        const record = getTrackRecord().chapterAssessments[chapter.id] || {};
        root.innerHTML = `<div class="studio-page-progress" aria-hidden="true"><i id="studioPageProgress"></i></div>
            ${quizHeader(trackProgress)}
            <button class="studio-sidebar-backdrop" id="studioSidebarBackdrop" type="button" aria-label="Tutup daftar pelajaran"></button>
            <div class="studio-layout">${buildSidebar()}
                <main class="studio-main" id="lessonContent"><article class="studio-content quiz-content">
                    <nav class="studio-breadcrumb" aria-label="Breadcrumb"><span>${escapeHtml(track.title)}</span><span>/</span><span>${escapeHtml(chapter.title)}</span><span>/</span><strong>Kuis akhir bab</strong></nav>
                    <header class="lesson-hero quiz-hero"><div class="lesson-hero-top"><div class="studio-kicker">Assessment bab ${track.chapters.findIndex((item) => item.id === chapter.id) + 1} dari ${track.chapters.length}</div><span class="lesson-status">${assessmentLabel(state)}</span></div><h1>${escapeHtml(chapter.assessment.title)}</h1><p>Jawab 10 soal untuk membuktikan pemahaman tiga pelajaran dalam bab ini. Nilai minimal kelulusan adalah ${chapter.assessment.passingScore}%.</p><div class="lesson-meta"><span><strong>10</strong> soal</span><span><strong>80%</strong> batas lulus</span><span><strong>${record.bestScore || 0}%</strong> nilai terbaik</span></div></header>
                    ${state === "locked"
                        ? `<section class="quiz-locked-panel"><span aria-hidden="true">${icons.lock}</span><h2>Kuis masih terkunci</h2><p>Selesaikan tiga pelajaran pada bab ${escapeHtml(chapter.title)} sebelum mengerjakan assessment.</p><a class="studio-btn primary" href="${lessonUrl({ track, lesson: chapter.lessons[0] })}">Lanjutkan belajar</a></section>`
                        : quizSubmitted ? buildQuizResults() : `<div class="quiz-progress-line"><i style="--value:${((quizIndex + 1) / quizQuestions.length) * 100}%"></i></div>${buildQuizQuestion()}${buildQuizNavigator()}`}
                </article></main>
            </div>
            ${buildMobileDock(false)}
            <dialog class="quiz-confirm-dialog" id="quizConfirmDialog"><span class="studio-kicker">Konfirmasi pengumpulan</span><h2>Kumpulkan jawaban sekarang?</h2><p>Kamu telah menjawab <strong>${quizAnswers.filter((answer) => answer !== null).length} dari ${quizAnswers.length}</strong> soal. Jawaban kosong akan dihitung salah.</p><div><button class="studio-btn" type="button" data-cancel-submit>Kembali memeriksa</button><button class="studio-btn primary" type="button" data-submit-quiz>Ya, nilai jawaban</button></div></dialog>
            ${certificateDialogMarkup()}`;
        applyPreferences();
        bindQuiz();
        updateReadingProgress();
    }

    function submitQuiz() {
        const correct = quizQuestions.reduce((total, question, index) => total + (quizAnswers[index] === question.correctIndex ? 1 : 0), 0);
        const score = Math.round((correct / quizQuestions.length) * 100);
        const trackRecord = getTrackRecord();
        const previous = trackRecord.chapterAssessments[chapter.id] || {};
        const passed = Boolean(previous.passed) || score >= chapter.assessment.passingScore;
        trackRecord.chapterAssessments[chapter.id] = {
            bestScore: Math.max(Number(previous.bestScore || 0), score),
            lastScore: score,
            attempts: Number(previous.attempts || 0) + 1,
            passed,
            passedAt: previous.passedAt || (passed ? new Date().toISOString() : null),
            lastAttemptAt: new Date().toISOString(),
            xpAwarded: Boolean(previous.xpAwarded) || passed
        };
        if (passed && !previous.xpAwarded) {
            progress.totalXpAwarded = Number(progress.totalXpAwarded || 0) + 100;
            awardXpSafely(100);
        }
        save();
        quizSubmitted = true;
        document.getElementById("quizConfirmDialog")?.close();
        buildQuiz();
        scrollTo({ top: 0, behavior: "smooth" });
        showToast(passed ? "Kuis bab lulus. Progres sertifikat diperbarui." : "Nilai tersimpan. Pelajari pembahasan lalu coba lagi.");
    }

    function bindQuiz() {
        document.querySelectorAll(".studio-chapter-toggle").forEach((button) => button.addEventListener("click", () => {
            const owner = button.closest(".studio-chapter");
            owner.classList.toggle("open");
            button.setAttribute("aria-expanded", String(owner.classList.contains("open")));
        }));
        document.getElementById("studioMenuBtn")?.addEventListener("click", () => setSidebar(true));
        document.querySelector("[data-mobile-action='menu']")?.addEventListener("click", () => setSidebar(true));
        document.querySelector("[data-close-sidebar]")?.addEventListener("click", () => setSidebar(false));
        document.getElementById("studioSidebarBackdrop")?.addEventListener("click", () => setSidebar(false));
        document.getElementById("studioLessonSearch")?.addEventListener("input", filterLessons);
        document.getElementById("studioFontDown")?.addEventListener("click", () => changeFont(-1));
        document.getElementById("studioFontUp")?.addEventListener("click", () => changeFont(1));
        document.getElementById("studioThemeBtn")?.addEventListener("click", toggleTheme);
        document.querySelector("[data-mobile-action='theme']")?.addEventListener("click", toggleTheme);
        document.getElementById("studioFocusBtn")?.addEventListener("click", toggleFocus);
        document.querySelector("[data-mobile-action='focus']")?.addEventListener("click", toggleFocus);
        document.querySelectorAll("[data-locked='true']").forEach((link) => link.addEventListener("click", (event) => event.preventDefault()));
        document.querySelectorAll("[data-quiz-answer]").forEach((button) => button.addEventListener("click", () => {
            quizAnswers[quizIndex] = Number(button.dataset.quizAnswer);
            buildQuiz();
        }));
        document.querySelectorAll("[data-quiz-index]").forEach((button) => button.addEventListener("click", () => {
            quizIndex = Number(button.dataset.quizIndex);
            buildQuiz();
        }));
        document.querySelector("[data-quiz-previous]")?.addEventListener("click", () => { quizIndex = Math.max(0, quizIndex - 1); buildQuiz(); });
        document.querySelector("[data-quiz-next]")?.addEventListener("click", () => { quizIndex = Math.min(quizQuestions.length - 1, quizIndex + 1); buildQuiz(); });
        document.querySelector("[data-review-quiz]")?.addEventListener("click", () => document.getElementById("quizConfirmDialog")?.showModal());
        document.querySelector("[data-cancel-submit]")?.addEventListener("click", () => document.getElementById("quizConfirmDialog")?.close());
        document.querySelector("[data-submit-quiz]")?.addEventListener("click", submitQuiz);
        document.querySelector("[data-retry-quiz]")?.addEventListener("click", () => { prepareQuiz(); buildQuiz(); scrollTo({ top: 0, behavior: "smooth" }); });
        bindCertificateControls();
    }

    function buildReader() {
        selectedCheckpoint = null;
        const record = getLessonRecord();
        if (record.status === "available") record.status = "in_progress";
        save();
        const trackProgress = curriculum.getTrackProgress(track.id, progress);
        const flat = curriculum.flattenLessons(track);
        const currentIndex = flat.findIndex((entry) => entry.lesson.id === lesson.id);
        const previous = currentIndex > 0 ? { track, ...flat[currentIndex - 1] } : null;
        const next = currentIndex < flat.length - 1 ? { track, ...flat[currentIndex + 1] } : null;
        const nextState = next ? curriculum.getLessonState(track.id, next.lesson.id, progress) : "available";
        const takeaways = lesson.keyTakeaways || fallbackTakeaways();
        const glossary = lesson.glossary || fallbackGlossary();
        const mistakes = lesson.commonMistakes || ["Menerapkan pola tanpa memeriksa kebutuhan dan constraint.", "Hanya menguji happy path dan melewatkan kondisi gagal.", "Tidak mencatat alasan di balik keputusan implementasi."];
        const practiceLevels = lesson.practice.levels || fallbackPracticeLevels();
        const currentStatusLabel = statusLabel(record.status);

        sectionObserver?.disconnect();

        root.innerHTML = `
            <div class="studio-page-progress" aria-hidden="true"><i id="studioPageProgress"></i></div>
            ${buildHeader(trackProgress, { includeBookmark: true })}
            <button class="studio-sidebar-backdrop" id="studioSidebarBackdrop" type="button" aria-label="Tutup daftar pelajaran"></button>
            <div class="studio-layout">${buildSidebar()}
                <main class="studio-main" id="lessonContent"><article class="studio-content">
                    <nav class="studio-breadcrumb" aria-label="Breadcrumb"><span>${escapeHtml(track.title)}</span><span>/</span><span>${escapeHtml(chapter.title)}</span><span>/</span><strong>${escapeHtml(lesson.title)}</strong></nav>
                    <header class="lesson-hero">
                        <div class="lesson-hero-top"><div class="studio-kicker">Pelajaran ${currentIndex + 1} dari ${flat.length}</div><span class="lesson-status" id="lessonStatusPill">${escapeHtml(currentStatusLabel)}</span></div>
                        <h1>${escapeHtml(lesson.title)}</h1>
                        <p>${escapeHtml(chapter.summary)}</p>
                        <div class="lesson-meta"><span><strong>${lesson.durationMinutes}</strong> menit</span><span><strong>${lesson.xp}</strong> XP</span><span id="studioReadPercent"><strong>0%</strong> dibaca</span></div>
                        <div class="lesson-read-progress" aria-hidden="true"><i id="studioHeroReadProgress"></i></div>
                    </header>
                    <nav class="studio-on-page" id="studioOnPage" aria-label="Isi pelajaran"><a href="#lessonOutcomes" data-section="lessonOutcomes">Tujuan</a><a href="#lessonTakeaways" data-section="lessonTakeaways">Inti</a><a href="#lessonDiscussion" data-section="lessonDiscussion">Pembahasan</a><a href="#lessonExample" data-section="lessonExample">Playground</a><a href="#lessonPractice" data-section="lessonPractice">Latihan</a><a href="#lessonCheckpoint" data-section="lessonCheckpoint">Checkpoint</a><a href="#lessonNotes" data-section="lessonNotes">Catatan</a></nav>
                    <section class="lesson-section editorial-section lesson-outcomes" id="lessonOutcomes"><div class="studio-kicker">Hasil belajar</div><h2>Yang akan kamu kuasai</h2><div class="studio-grid">${lesson.outcomes.map((item) => `<div class="studio-card">${escapeHtml(item)}</div>`).join("")}</div></section>
                    <section class="lesson-section editorial-section lesson-takeaways" id="lessonTakeaways"><div class="studio-kicker">Inti pelajaran</div><h2>Tiga hal yang perlu diingat</h2><div class="studio-grid takeaway-grid">${takeaways.map((item) => `<div class="studio-card takeaway-card">${escapeHtml(item)}</div>`).join("")}</div></section>
                    <section class="lesson-section editorial-section lesson-discussion" id="lessonDiscussion"><div class="studio-kicker">Model mental</div><h2>Pembahasan terarah</h2>${lesson.sections.map((section) => `<div class="discussion-block"><h3>${escapeHtml(section.title)}</h3><p>${escapeHtml(section.body)}</p></div>`).join("")}</section>
                    <section class="lesson-section editorial-section lesson-glossary"><div class="studio-kicker">Bahasa praktis</div><h2>Glosarium cepat</h2><div class="glossary-grid">${glossary.map((item) => `<div class="studio-card"><strong>${escapeHtml(item.term)}</strong>${escapeHtml(item.definition)}</div>`).join("")}</div><h3>Kesalahan yang perlu dihindari</h3><ul class="mistake-list">${mistakes.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section>
                    <section class="lesson-section interactive-panel" id="lessonExample"><div class="studio-kicker">Eksperimen aman</div><h2>${escapeHtml(lesson.example.title)}</h2><p>${escapeHtml(lesson.example.explanation)}</p>
                        <div class="studio-code"><div class="studio-code-head"><span>${escapeHtml(lesson.example.language)}</span><div class="studio-code-actions"><button class="studio-btn" id="resetPlayground" type="button">Reset</button><button class="studio-btn" id="copyPlayground" type="button">Salin</button><button class="studio-btn" id="runPlayground" type="button">Jalankan</button></div></div><textarea id="studioCodeInput" aria-label="Editor kode" spellcheck="false">${escapeHtml(lesson.example.code)}</textarea><div class="studio-console" id="studioConsole" role="status" aria-live="polite">Siap. Ubah contoh lalu pilih Jalankan.</div><iframe class="studio-preview" id="studioPreview" title="Preview kode" sandbox="allow-scripts" hidden></iframe></div>
                    </section>
                    <section class="lesson-section interactive-panel" id="lessonPractice"><div class="studio-kicker">Belajar dengan membuat</div><h2>Latihan bertingkat</h2><div class="practice-levels">${practiceLevels.map((level) => `<div class="practice-level"><span>${escapeHtml(level.label)}</span><h3>${escapeHtml(level.title)}</h3><p>${escapeHtml(level.prompt)}</p></div>`).join("")}</div><button class="studio-btn" id="lessonHintBtn" type="button" aria-controls="lessonHint" aria-expanded="false">Tampilkan petunjuk</button><div class="hint-box" id="lessonHint" hidden>${escapeHtml(lesson.practice.hint)}</div><label class="practice-check"><input id="practiceCompleted" type="checkbox" ${record.practiceCompleted ? "checked" : ""}><span>Saya sudah membuat artefak dan memeriksa seluruh deliverable latihan.</span></label></section>
                    <section class="lesson-section interactive-panel" id="lessonCheckpoint"><div class="studio-kicker">Uji pemahaman</div><h2>Checkpoint</h2><h3>${escapeHtml(lesson.checkpoint.question)}</h3><div class="checkpoint-options">${lesson.checkpoint.options.map((option, index) => `<button class="checkpoint-option" type="button" data-answer="${index}"><span>${String.fromCharCode(65 + index)}</span>${escapeHtml(option)}</button>`).join("")}</div><div class="checkpoint-feedback" id="checkpointFeedback" role="status" aria-live="polite">${record.attempts ? `Skor terbaik ${record.bestScore}% dari ${record.attempts} percobaan.` : "Pilih jawaban terbaik, lalu baca penjelasannya."}</div><div class="checkpoint-footer"><span class="note-status">Mastery memerlukan latihan selesai dan skor minimal 75%.</span><button class="studio-btn" id="checkpointRetryBtn" type="button" hidden>Coba lagi</button></div></section>
                    <section class="lesson-section interactive-panel" id="lessonNotes"><div class="studio-kicker">Catatan pribadi</div><h2>Rekam pemahamanmu</h2><div class="notes-card"><label class="sr-only" for="studioNotes">Catatan pelajaran</label><textarea id="studioNotes" placeholder="Tulis ringkasan, pertanyaan, atau contoh versimu sendiri…"></textarea><div class="notes-footer"><span class="note-status" id="studioNoteStatus"><span id="studioNoteStatusText">Tersimpan otomatis</span> <span aria-hidden="true">·</span> <span id="studioNoteCount">0 karakter</span></span><button class="studio-btn" id="clearStudioNotes" type="button">Hapus catatan</button></div></div></section>
                    <section class="lesson-section editorial-section lesson-next-step"><div class="studio-kicker">Langkah berikutnya</div><h2>${escapeHtml(lesson.nextStep?.title || "Lanjutkan dengan satu eksperimen kecil")}</h2><p>${escapeHtml(lesson.nextStep?.description || `Gunakan konsep ${lesson.title} pada konteks yang berbeda, catat hasilnya, lalu bandingkan keputusanmu dengan kebutuhan pengguna.`)}</p><h3>Referensi lanjutan</h3><ul>${lesson.references.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section>
                    ${currentIndex === flat.length - 1 ? buildCapstone() : ""}
                    <div class="lesson-completion"><div><strong id="completionTitle">${record.status === "mastered" ? "Pelajaran sudah dikuasai" : "Siap menyelesaikan pelajaran?"}</strong><p id="completionText">Latihan: ${record.practiceCompleted ? "selesai" : "belum"} <span aria-hidden="true">·</span> Skor terbaik: ${record.bestScore || 0}%</p></div><button class="studio-btn primary" id="completeLessonBtn" type="button" ${record.status === "mastered" ? "disabled" : ""}>${record.status === "mastered" ? "Sudah dikuasai" : "Tandai selesai"}</button></div>
                    <nav class="studio-footer-nav" aria-label="Navigasi pelajaran">${previous ? `<a class="studio-nav-link" href="${lessonUrl(previous)}"><small>Sebelumnya</small><strong>${escapeHtml(previous.lesson.title)}</strong></a>` : `<span class="studio-nav-link disabled"><small>Awal jalur</small><strong>Tidak ada pelajaran sebelumnya</strong></span>`}${next ? `<a class="studio-nav-link next ${nextState === "locked" ? "disabled" : ""}" href="${lessonUrl(next)}" ${nextState === "locked" ? 'aria-disabled="true" tabindex="-1"' : ""}><small>Berikutnya</small><strong>${escapeHtml(next.lesson.title)}</strong></a>` : `<a class="studio-nav-link next" href="materi.html?track=${encodeURIComponent(track.id)}"><small>Selesai</small><strong>Kembali ke dashboard</strong></a>`}</nav>
                </article></main>
            </div>
            ${buildMobileDock(true)}
            ${certificateDialogMarkup()}`;

        applyPreferences();
        bindReader();
        setupSectionNavigation();
        updateReadingProgress();
    }

    function bindReader() {
        document.querySelectorAll(".studio-chapter-toggle").forEach((button) => button.addEventListener("click", () => {
            const owner = button.closest(".studio-chapter");
            owner.classList.toggle("open");
            button.setAttribute("aria-expanded", String(owner.classList.contains("open")));
        }));
        document.getElementById("studioMenuBtn")?.addEventListener("click", () => setSidebar(true));
        document.querySelector("[data-mobile-action='menu']")?.addEventListener("click", () => setSidebar(true));
        document.querySelector("[data-close-sidebar]")?.addEventListener("click", () => setSidebar(false));
        document.getElementById("studioSidebarBackdrop")?.addEventListener("click", () => setSidebar(false));
        document.getElementById("studioLessonSearch")?.addEventListener("input", filterLessons);
        document.getElementById("studioFontDown")?.addEventListener("click", () => changeFont(-1));
        document.getElementById("studioFontUp")?.addEventListener("click", () => changeFont(1));
        document.getElementById("studioThemeBtn")?.addEventListener("click", toggleTheme);
        document.querySelector("[data-mobile-action='theme']")?.addEventListener("click", toggleTheme);
        document.getElementById("studioFocusBtn")?.addEventListener("click", toggleFocus);
        document.querySelector("[data-mobile-action='focus']")?.addEventListener("click", toggleFocus);
        document.getElementById("studioBookmarkBtn")?.addEventListener("click", toggleBookmark);
        document.querySelector("[data-mobile-action='bookmark']")?.addEventListener("click", toggleBookmark);
        document.getElementById("lessonHintBtn")?.addEventListener("click", toggleHint);
        document.getElementById("practiceCompleted")?.addEventListener("change", (event) => {
            getLessonRecord().practiceCompleted = event.target.checked;
            recalculateStatus();
            updateCompletion();
            showToast(event.target.checked ? "Latihan ditandai selesai." : "Status latihan diperbarui.");
        });
        document.querySelectorAll(".checkpoint-option").forEach((button) => button.addEventListener("click", () => answerCheckpoint(Number(button.dataset.answer))));
        document.getElementById("checkpointRetryBtn")?.addEventListener("click", resetCheckpoint);
        document.getElementById("completeLessonBtn")?.addEventListener("click", completeLesson);
        document.getElementById("studioNotes")?.addEventListener("input", handleNotes);
        document.getElementById("studioNotes")?.addEventListener("change", saveNotesNow);
        document.getElementById("clearStudioNotes")?.addEventListener("click", clearNotes);
        document.getElementById("copyPlayground")?.addEventListener("click", copyCode);
        document.getElementById("resetPlayground")?.addEventListener("click", resetCode);
        document.getElementById("runPlayground")?.addEventListener("click", runPlayground);
        document.getElementById("submitCapstone")?.addEventListener("click", submitCapstone);
        document.querySelectorAll("[data-locked='true']").forEach((link) => link.addEventListener("click", (event) => event.preventDefault()));
        bindCertificateControls();
        const notes = document.getElementById("studioNotes");
        if (notes) notes.value = getLessonRecord().notes || "";
        updateNoteCount();
        if (!readerEventsBound) {
            readerEventsBound = true;
            window.addEventListener("scroll", updateReadingProgress, { passive: true });
            window.addEventListener("resize", updateReadingProgress, { passive: true });
            window.addEventListener("resize", handleViewportChange, { passive: true });
            window.addEventListener("pagehide", saveNotesNow);
            document.addEventListener("keydown", handleShortcuts);
        }
    }

    function setSidebar(open, restoreFocus = true) {
        const sidebar = document.getElementById("studioSidebar");
        if (!sidebar) return;
        if (open) drawerReturnFocus = document.activeElement;
        if (open) sidebar.removeAttribute("inert");
        sidebar.classList.toggle("open", open);
        document.getElementById("studioSidebarBackdrop")?.classList.toggle("show", open);
        document.getElementById("studioMenuBtn")?.setAttribute("aria-expanded", String(open));
        document.body.classList.toggle("studio-drawer-open", open);
        if (open) {
            requestAnimationFrame(() => document.getElementById("studioLessonSearch")?.focus());
        } else {
            if (restoreFocus && drawerReturnFocus instanceof HTMLElement) drawerReturnFocus.focus();
            drawerReturnFocus = null;
            if (innerWidth <= 980) sidebar.setAttribute("inert", "");
        }
    }

    function handleViewportChange() {
        const sidebar = document.getElementById("studioSidebar");
        if (!sidebar) return;
        if (innerWidth > 980) {
            if (sidebar.classList.contains("open")) setSidebar(false, false);
            sidebar.removeAttribute("inert");
        } else if (!sidebar.classList.contains("open")) {
            sidebar.setAttribute("inert", "");
        }
    }

    function toggleHint(event) {
        const hint = document.getElementById("lessonHint");
        if (!hint) return;
        const expanded = event.currentTarget.getAttribute("aria-expanded") === "true";
        event.currentTarget.setAttribute("aria-expanded", String(!expanded));
        event.currentTarget.textContent = expanded ? "Tampilkan petunjuk" : "Sembunyikan petunjuk";
        hint.hidden = expanded;
    }

    function setupSectionNavigation() {
        const links = [...document.querySelectorAll(".studio-on-page a[data-section]")];
        const sections = links.map((link) => document.getElementById(link.dataset.section)).filter(Boolean);
        const activate = (id) => links.forEach((link) => {
            const active = link.dataset.section === id;
            link.classList.toggle("active", active);
            if (active) {
                link.setAttribute("aria-current", "location");
                const navigation = link.closest(".studio-on-page");
                if (navigation && navigation.scrollWidth > navigation.clientWidth) {
                    navigation.scrollTo({ left: Math.max(0, link.offsetLeft - (navigation.clientWidth - link.offsetWidth) / 2), behavior: "smooth" });
                }
            } else link.removeAttribute("aria-current");
        });
        if (!sections.length) return;
        activate(sections[0].id);
        if (!("IntersectionObserver" in window)) return;
        sectionObserver = new IntersectionObserver((entries) => {
            const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
            if (visible[0]) activate(visible[0].target.id);
        }, { rootMargin: "-20% 0px -68%", threshold: 0 });
        sections.forEach((section) => sectionObserver.observe(section));
    }

    function filterLessons(event) {
        const query = event.target.value.trim().toLowerCase();
        let visible = 0;
        document.querySelectorAll(".studio-chapter").forEach((owner) => {
            const chapterTitle = owner.querySelector("strong").textContent.toLowerCase();
            let chapterVisible = 0;
            owner.querySelectorAll(".studio-lesson-link").forEach((link) => {
                const match = !query || chapterTitle.includes(query) || link.textContent.toLowerCase().includes(query);
                link.hidden = !match;
                if (match) chapterVisible++;
            });
            owner.hidden = chapterVisible === 0;
            if (query && chapterVisible) owner.classList.add("open");
            visible += chapterVisible;
        });
        document.getElementById("studioSearchEmpty").hidden = visible !== 0;
    }

    function applyPreferences() {
        const saved = Number(localStorage.getItem(FONT_KEY));
        const scale = allowedScales.includes(saved) ? saved : 1;
        document.documentElement.style.setProperty("--studio-font-scale", scale);
        document.body.classList.toggle("dark-theme", localStorage.getItem("eduquest_theme") === "dark");
        const focus = localStorage.getItem(FOCUS_KEY) === "1";
        document.body.classList.toggle("reader-focus", focus);
        updateFocusButtons(focus);
        if (document.getElementById("studioBookmarkBtn")) syncBookmarkButtons();
        updateThemeButton();
        document.querySelector('meta[name="theme-color"]')?.setAttribute("content", document.body.classList.contains("dark-theme") ? "#09140f" : "#f5f7f2");
        handleViewportChange();
        updateFontButtons(scale);
    }

    function changeFont(direction) {
        const current = Number(getComputedStyle(document.documentElement).getPropertyValue("--studio-font-scale")) || 1;
        const index = allowedScales.indexOf(current);
        const next = allowedScales[Math.max(0, Math.min(allowedScales.length - 1, index + direction))];
        localStorage.setItem(FONT_KEY, String(next));
        document.documentElement.style.setProperty("--studio-font-scale", next);
        updateFontButtons(next);
    }

    function updateFontButtons(scale) {
        const down = document.getElementById("studioFontDown");
        const up = document.getElementById("studioFontUp");
        if (down) down.disabled = scale === allowedScales[0];
        if (up) up.disabled = scale === allowedScales.at(-1);
    }

    function toggleTheme() {
        const dark = !document.body.classList.contains("dark-theme");
        document.body.classList.toggle("dark-theme", dark);
        localStorage.setItem("eduquest_theme", dark ? "dark" : "light");
        updateThemeButton();
        document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#09140f" : "#f5f7f2");
        showToast(dark ? "Tema gelap diaktifkan." : "Tema terang diaktifkan.");
    }

    function updateThemeButton() {
        const dark = document.body.classList.contains("dark-theme");
        document.querySelectorAll("[data-reader-control='theme']").forEach((button) => {
            button.classList.toggle("active", dark);
            button.setAttribute("aria-pressed", String(dark));
            button.setAttribute("aria-label", dark ? "Aktifkan tema terang" : "Aktifkan tema gelap");
        });
    }

    function updateFocusButtons(enabled) {
        document.querySelectorAll("[data-reader-control='focus']").forEach((button) => {
            button.classList.toggle("active", enabled);
            button.setAttribute("aria-pressed", String(enabled));
            button.setAttribute("aria-label", enabled ? "Nonaktifkan mode fokus" : "Aktifkan mode fokus");
        });
    }

    function toggleFocus() {
        const enabled = document.body.classList.toggle("reader-focus");
        if (enabled) setSidebar(false, false);
        localStorage.setItem(FOCUS_KEY, enabled ? "1" : "0");
        updateFocusButtons(enabled);
        showToast(enabled ? "Mode fokus diaktifkan." : "Mode fokus dinonaktifkan.");
    }

    function syncBookmarkButtons() {
        const record = getLessonRecord();
        document.querySelectorAll("[data-reader-control='bookmark']").forEach((button) => {
            button.classList.toggle("active", record.bookmarked);
            button.setAttribute("aria-pressed", String(record.bookmarked));
            button.setAttribute("aria-label", record.bookmarked ? "Hapus bookmark" : "Bookmark pelajaran");
        });
    }

    function toggleBookmark() {
        const record = getLessonRecord();
        record.bookmarked = !record.bookmarked;
        save();
        syncBookmarkButtons();
        showToast(record.bookmarked ? "Pelajaran ditambahkan ke bookmark." : "Bookmark dihapus.");
    }

    function updateReadingProgress() {
        const content = document.querySelector(".studio-content");
        if (!content) return;
        const distance = Math.max(1, content.scrollHeight - innerHeight * .6);
        const percent = Math.max(0, Math.min(100, Math.round(((scrollY - content.offsetTop + 90) / distance) * 100)));
        document.getElementById("studioPageProgress")?.style.setProperty("--value", `${percent}%`);
        document.getElementById("studioHeroReadProgress")?.style.setProperty("--value", `${percent}%`);
        const label = document.getElementById("studioReadPercent");
        if (label) label.textContent = `${percent}% dibaca`;
    }

    function handleNotes() {
        const status = document.getElementById("studioNoteStatusText");
        if (status) status.textContent = "Menyimpan…";
        updateNoteCount();
        clearTimeout(noteSaveTimer);
        noteSaveTimer = setTimeout(saveNotesNow, 450);
    }

    function saveNotesNow() {
        const input = document.getElementById("studioNotes");
        if (!input) return;
        getLessonRecord().notes = input.value;
        save();
        const status = document.getElementById("studioNoteStatusText");
        if (status) status.textContent = "Tersimpan otomatis";
    }

    function updateNoteCount() {
        const count = document.getElementById("studioNoteCount");
        const input = document.getElementById("studioNotes");
        if (count) count.textContent = `${input?.value.length || 0} karakter`;
    }

    function clearNotes() {
        const input = document.getElementById("studioNotes");
        if (!input || !input.value) return;
        input.value = "";
        saveNotesNow();
        updateNoteCount();
        input.focus();
    }

    async function copyCode(event) {
        const button = event.currentTarget;
        const code = document.getElementById("studioCodeInput").value;
        try {
            await navigator.clipboard.writeText(code);
            button.textContent = "Disalin";
        } catch {
            document.getElementById("studioCodeInput").select();
            button.textContent = "Pilih & salin";
        }
        setTimeout(() => { if (button.isConnected) button.textContent = "Salin"; }, 1500);
    }

    function resetCode() {
        document.getElementById("studioCodeInput").value = lesson.example.code;
        document.getElementById("studioConsole").textContent = "Contoh dikembalikan ke versi awal.";
        const preview = document.getElementById("studioPreview");
        preview.hidden = true;
        preview.removeAttribute("srcdoc");
    }

    function runPlayground() {
        const language = String(lesson.example.language).toLowerCase();
        const code = document.getElementById("studioCodeInput").value;
        const output = document.getElementById("studioConsole");
        const preview = document.getElementById("studioPreview");
        clearTimeout(playgroundFrame);
        preview.hidden = true;
        preview.removeAttribute("srcdoc");
        if (language.includes("html")) {
            preview.hidden = false;
            preview.srcdoc = code;
            output.textContent = "Preview HTML dirender dalam area terisolasi.";
            return;
        }
        if (!language.includes("javascript") && language !== "js") {
            output.textContent = `Mode ${language.toUpperCase()} menggunakan simulasi aman.\n\nKode tervalidasi sebagai contoh pembelajaran dan tidak dijalankan pada perangkat.\n${code.split("\n").slice(0, 6).join("\n")}`;
            return;
        }
        if (/while\s*\(\s*true\s*\)|for\s*\(\s*;\s*;\s*\)/i.test(code)) {
            output.textContent = "Eksekusi dibatalkan: pola loop tanpa batas terdeteksi. Tambahkan kondisi berhenti sebelum menjalankan ulang.";
            return;
        }
        const token = `studio-${Date.now()}`;
        const runner = `<!doctype html><script>
            const send=(type,args)=>parent.postMessage({source:'${token}',type,args:args.map(v=>typeof v==='object'?JSON.stringify(v,null,2):String(v))},'*');
            console.log=(...args)=>send('log',args);console.error=(...args)=>send('error',args);console.warn=(...args)=>send('warn',args);
            try{${code.replace(/<\/script/gi, "<\\/script")}}catch(error){send('error',[error.name+': '+error.message]);}
            send('done',[]);
        <\/script>`;
        const lines = [];
        const handler = (event) => {
            if (event.source !== preview.contentWindow || event.data?.source !== token) return;
            if (event.data.type === "done") {
                if (!lines.length) lines.push("Kode selesai tanpa output console.");
                output.textContent = lines.join("\n");
                removeEventListener("message", handler);
                clearTimeout(playgroundFrame);
                return;
            }
            lines.push(`${event.data.type === "error" ? "ERROR " : event.data.type === "warn" ? "WARN  " : "> "}${event.data.args.join(" ")}`);
            output.textContent = lines.join("\n");
        };
        addEventListener("message", handler);
        output.textContent = "Menjalankan dalam sandbox…";
        preview.srcdoc = runner;
        playgroundFrame = setTimeout(() => {
            removeEventListener("message", handler);
            preview.removeAttribute("srcdoc");
            output.textContent = `${lines.join("\n")}\nProses dihentikan setelah batas waktu aman.`.trim();
        }, 1800);
    }

    function answerCheckpoint(index) {
        if (selectedCheckpoint !== null) return;
        selectedCheckpoint = index;
        const record = getLessonRecord();
        record.attempts = Number(record.attempts || 0) + 1;
        const correct = index === lesson.checkpoint.correctIndex;
        record.bestScore = Math.max(Number(record.bestScore || 0), correct ? 100 : 0);
        document.querySelectorAll(".checkpoint-option").forEach((button) => {
            const buttonIndex = Number(button.dataset.answer);
            button.disabled = true;
            if (buttonIndex === lesson.checkpoint.correctIndex) button.classList.add("correct");
            else if (buttonIndex === index) button.classList.add("wrong");
        });
        document.getElementById("checkpointFeedback").textContent = `${correct ? "Benar." : "Belum tepat."} ${lesson.checkpoint.explanation}`;
        document.getElementById("checkpointRetryBtn").hidden = correct;
        recalculateStatus();
        updateCompletion();
        showToast(correct ? "Jawaban benar. Pemahamanmu bertambah." : "Belum tepat. Pelajari penjelasan lalu coba lagi.");
    }

    function resetCheckpoint() {
        selectedCheckpoint = null;
        document.querySelectorAll(".checkpoint-option").forEach((button) => { button.disabled = false; button.classList.remove("correct", "wrong"); });
        document.getElementById("checkpointFeedback").textContent = "Coba lagi. Bandingkan setiap pilihan dengan kebutuhan dan constraint.";
        document.getElementById("checkpointRetryBtn").hidden = true;
        document.querySelector(".checkpoint-option")?.focus();
    }

    function recalculateStatus() {
        const record = getLessonRecord();
        if (record.practiceCompleted && record.bestScore >= 75 && ["completed", "mastered"].includes(record.status)) {
            record.status = "mastered";
            record.masteredAt ||= new Date().toISOString();
        }
        save();
    }

    function completeLesson() {
        const record = getLessonRecord();
        if (record.status !== "mastered") record.status = "completed";
        record.completedAt ||= new Date().toISOString();
        if (!record.xpAwarded) {
            record.xpAwarded = true;
            progress.totalXpAwarded = Number(progress.totalXpAwarded || 0) + lesson.xp;
            awardXpSafely(lesson.xp);
        }
        recalculateStatus();
        buildReader();
        document.querySelector(".lesson-completion")?.scrollIntoView({ behavior: "smooth", block: "center" });
        showToast("Progres pelajaran diperbarui.");
    }

    function updateCompletion() {
        const record = getLessonRecord();
        document.getElementById("completionTitle").textContent = record.status === "mastered" ? "Pelajaran sudah dikuasai" : "Siap menyelesaikan pelajaran?";
        document.getElementById("completionText").textContent = `Latihan: ${record.practiceCompleted ? "selesai" : "belum"} · Skor terbaik: ${record.bestScore || 0}%`;
        const button = document.getElementById("completeLessonBtn");
        button.textContent = record.status === "mastered" ? "Sudah dikuasai" : "Tandai selesai";
        button.disabled = record.status === "mastered";
        document.getElementById("lessonStatusPill").textContent = statusLabel(record.status);
    }

    function submitCapstone() {
        const input = document.getElementById("capstoneScore");
        if (!input || input.value === "") return;
        const parsedScore = Number(input.value);
        if (!Number.isFinite(parsedScore)) {
            document.getElementById("capstoneFeedback").textContent = "Masukkan nilai antara 0 dan 100.";
            input.focus();
            return;
        }
        const score = Math.max(0, Math.min(100, parsedScore));
        input.value = String(score);
        const trackRecord = getTrackRecord();
        const previous = trackRecord.capstone || {};
        trackRecord.capstone = { bestScore: Math.max(Number(previous.bestScore || 0), score), attempts: Number(previous.attempts || 0) + 1, passed: Math.max(Number(previous.bestScore || 0), score) >= track.capstone.passingScore, reviewedAt: new Date().toISOString(), xpAwarded: Boolean(previous.xpAwarded) };
        if (trackRecord.capstone.passed && !trackRecord.capstone.xpAwarded) {
            trackRecord.capstone.xpAwarded = true;
            progress.totalXpAwarded = Number(progress.totalXpAwarded || 0) + track.capstone.xp;
            awardXpSafely(track.capstone.xp);
        }
        save();
        document.getElementById("capstoneFeedback").textContent = trackRecord.capstone.passed ? `Lulus dengan skor terbaik ${trackRecord.capstone.bestScore}. XP capstone diberikan satu kali.` : `Skor terbaik ${trackRecord.capstone.bestScore}. Perbaiki artefak hingga mencapai ${track.capstone.passingScore}.`;
        showToast(trackRecord.capstone.passed ? "Capstone dinyatakan lulus." : "Penilaian capstone tersimpan.");
    }

    function handleShortcuts(event) {
        const sidebar = document.getElementById("studioSidebar");
        const drawerOpen = sidebar?.classList.contains("open");
        if (drawerOpen && event.key === "Tab") {
            const focusable = [...sidebar.querySelectorAll('a:not([tabindex="-1"]), button:not(:disabled), input:not(:disabled)')];
            if (focusable.length) {
                const first = focusable[0];
                const last = focusable.at(-1);
                if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
                else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
            }
            return;
        }
        if (event.key === "Escape") { setSidebar(false); return; }
        if (event.target.matches("input, textarea, [contenteditable='true']")) return;
        if (event.ctrlKey || event.metaKey || event.altKey) return;
        if (event.key.toLowerCase() === "f") document.getElementById("studioFocusBtn")?.click();
        if (event.key.toLowerCase() === "b") document.getElementById("studioBookmarkBtn")?.click();
    }

    function renderError(title, message) {
        root.innerHTML = `<main class="studio-error"><div class="studio-kicker">Universe Of Tech</div><h1>${escapeHtml(title)}</h1><p>${escapeHtml(message)}</p><a class="studio-btn primary" href="materi.html">Kembali ke dashboard materi</a></main>`;
    }

    const canonical = new URL(location.href);
    canonical.searchParams.set("topik", track.id);
    if (quizChapter) {
        canonical.searchParams.set("mode", "quiz");
        canonical.searchParams.set("chapter", quizChapter.id);
        canonical.searchParams.delete("lesson");
        history.replaceState({ trackId: track.id, chapterId: quizChapter.id, mode: "quiz" }, "", canonical);
        buildQuiz();
    } else {
        canonical.searchParams.delete("mode");
        canonical.searchParams.delete("chapter");
        canonical.searchParams.set("lesson", lesson.id);
        history.replaceState({ trackId: track.id, lessonId: lesson.id }, "", canonical);
        buildReader();
    }
})();
