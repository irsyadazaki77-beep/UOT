(function () {
    "use strict";

    const app = document.getElementById("bookReaderApp");
    if (!app) return;
    const storage = {
        get(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } },
        set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage may be unavailable */ } }
    };
    const books = typeof window.BOOKS !== "undefined" ? window.BOOKS : (typeof BOOKS !== "undefined" ? BOOKS : null);
    if (!books || !Array.isArray(books) || !books.length) {
        renderError("Buku belum dapat dibuka", "Katalog buku belum termuat.");
        return;
    }
    const params = new URLSearchParams(location.search);
    let bookId = params.get("book");
    if (!bookId) {
        const lastRead = storage.get("library_last_opened_book", null);
        bookId = books.some((b) => b.id === lastRead) ? lastRead : books[0].id;
    }
    const book = books.find((item) => item.id === bookId);
    if (!book) {
        renderError("Buku tidak ditemukan", "Buku ini belum tersedia di koleksi. Pilih buku lain dari perpustakaan.");
        return;
    }
    storage.set("library_last_opened_book", book.id);

    const legacyBookmarks = storage.get("library_bookmarks", {});
    const positions = storage.get("library_read_positions", {});
    const savedPosition = positions[bookId] || {};
    let chapterIndex = Number.isInteger(savedPosition.chapter) ? savedPosition.chapter : Number(legacyBookmarks[bookId] || 0);
    const requestedChapter = Number(params.get("chapter"));
    const requestedParagraph = Number(params.get("paragraph"));
    let pendingParagraph = Number.isInteger(requestedParagraph) && requestedParagraph >= 0 ? requestedParagraph : null;
    if (Number.isInteger(requestedChapter) && requestedChapter >= 0) chapterIndex = requestedChapter;
    if (chapterIndex < 0 || chapterIndex >= book.chapters.length) chapterIndex = 0;
    let fontScale = Number(storage.get("library_reader_font_scale", 1));
    if (![0.9, 1, 1.1, 1.2, 1.3].includes(fontScale)) {
        const legacySize = storage.get("library_reader_font_size", "medium");
        fontScale = legacySize === "small" ? 0.9 : legacySize === "large" ? 1.2 : 1;
    }
    let lineHeight = Number(storage.get("library_reader_line_height", 1.82));
    if (![1.6, 1.82, 2].includes(lineHeight)) lineHeight = 1.82;
    let theme = storage.get("library_reader_theme", "light");
    if (!["light", "sepia", "dark", "oled", "paper"].includes(theme)) theme = "light";
    let fontFamily = storage.get("library_reader_font_family", "Source Serif 4, Georgia, serif");
    let maxWidth = storage.get("library_reader_max_width", "900px");
    let ttsRate = Number(storage.get("library_tts_rate", 1));
    if (![0.8, 1, 1.2, 1.4].includes(ttsRate)) ttsRate = 1;
    let highlighterMode = false;
    let activeParagraph = null;
    let searchHits = [];
    let searchIndex = -1;
    let speech = null;
    let speechState = "idle";
    let speechItems = [];
    let speechIndex = -1;
    let noteTimer = null;
    let scrollTimer = null;
    let searchTimer = null;
    let progressFrame = null;
    const readingMinuteCache = new Map();

    function chapterState(index) {
        const understood = storage.get(`library_understood_${bookId}_${index}`, false);
        const quizAnswer = storage.get(`library_quiz_${bookId}_${index}`, null);
        if (understood || (book.chapters[index].quiz && quizAnswer === book.chapters[index].quiz.correct)) return "done";
        if (index === chapterIndex) return "current";
        return "todo";
    }

    function remainingMinutes() {
        return book.chapters.slice(chapterIndex).reduce((total, chapter) => total + estimateMinutes(chapter.content), 0);
    }

    function escapeHtml(value) {
        return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
    }

    function showToast(message) {
        const toast = document.getElementById("readerToast");
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add("show");
        clearTimeout(showToast.timer);
        showToast.timer = setTimeout(() => toast.classList.remove("show"), 2200);
    }

    function formatHighlightLabel(color) {
        if (color === "green") return "[🟢 Paham]";
        if (color === "red") return "[🔴 Ulangi]";
        return "[🟡 Konsep]";
    }

    function cleanChapterContentHtml(rawHtml, chapterTitle) {
        const holder = document.createElement("div");
        holder.innerHTML = rawHtml || "";
        const titleClean = (chapterTitle || "").replace(/^Bab\s+\d+\s*:\s*/i, "").trim();
        holder.querySelectorAll("h1, h2, h3").forEach((heading) => {
            const text = heading.textContent.trim();
            if (/^Bab\s+\d+/i.test(text) || text.toLowerCase() === (chapterTitle || "").trim().toLowerCase() || text.toLowerCase() === titleClean.toLowerCase()) {
                heading.remove();
            }
        });
        return holder.innerHTML;
    }

    function buildApp() {
        app.innerHTML = `
            <div class="book-progress" aria-hidden="true"><i id="bookProgressBar"></i></div>
            <header class="book-header">
                <div class="book-header-side"><button class="reader-control icon" id="backLibrary" type="button" aria-label="Kembali ke perpustakaan">←</button><button class="reader-control" id="toggleToc" type="button" aria-expanded="false"><span aria-hidden="true">☰</span><span class="control-label">Daftar isi</span></button></div>
                <div class="book-title-center"><span>${escapeHtml(book.categoryLabel || book.category)}</span><div class="book-header-title">${escapeHtml(book.title)}</div></div>
                <div class="book-header-side end"><button class="reader-control icon" id="searchToggle" type="button" aria-label="Cari dalam bab">⌕</button><button class="reader-control" id="ttsToggle" type="button"><span aria-hidden="true">▶</span><span class="control-label">Dengar</span></button><button class="reader-control" id="toolsToggle" type="button" aria-expanded="false"><span aria-hidden="true">✦</span><span class="control-label">Alat baca</span></button></div>
            </header>
            <div class="reader-workspace">
                <aside class="book-toc" id="bookToc" aria-label="Daftar isi buku">
                    <div class="book-summary-card"><span class="book-code">${escapeHtml(book.code || book.category)}</span><h2>${escapeHtml(book.title)}</h2><p>${escapeHtml(book.author)} · ${book.chapters.length} bab · ${escapeHtml(book.time)}</p><div class="resume-card"><div><strong id="resumePercent">0%</strong><span>progres buku</span></div><p>Bab ${chapterIndex + 1} · sekitar ${remainingMinutes()} menit tersisa</p></div></div>
                    <nav class="chapter-list" id="chapterList">${book.chapters.map((chapter, index) => chapterItemMarkup(chapter, index)).join("")}</nav>
                </aside>
                <main class="book-stage" id="bookStage"><div class="book-sheet-wrap"><article class="book-sheet" id="readerArticle"></article><nav class="book-pagination" aria-label="Navigasi bab"><button class="reader-control" id="prevChapter" type="button">← Bab sebelumnya</button><button class="reader-control" id="nextChapter" type="button">Bab berikutnya →</button></nav></div></main>
                <aside class="book-tools" id="bookTools" aria-label="Alat baca">
                    <div class="reader-panel-head"><div><strong>Alat baca</strong><span id="toolStatus">Tersimpan otomatis</span></div><button class="reader-control icon" id="closeTools" type="button" aria-label="Tutup alat baca">×</button></div>
                    <div class="tool-tabs" role="tablist"><button class="tool-tab active" data-tool="notes" role="tab">Catatan</button><button class="tool-tab" data-tool="collection" role="tab">Koleksi</button><button class="tool-tab" data-tool="summary" role="tab">Inti bab</button><button class="tool-tab" data-tool="settings" role="tab">Atur</button></div>
                    <section class="tool-panel active" id="tool-notes" role="tabpanel"><textarea id="readerNotes" placeholder="Tulis catatan atau sematkan kutipan dari bab ini…"></textarea><div class="tool-status" id="noteStatus">Tersimpan otomatis</div><div class="tool-export-actions"><button class="reader-control" id="copyNotes" type="button">Salin Teks</button><button class="reader-control" id="copyNotesMd" type="button">Salin Markdown</button><button class="reader-control" id="exportNotesTxt" type="button">Ekspor TXT</button></div></section>
                    <section class="tool-panel" id="tool-collection" role="tabpanel"><div class="collection-list" id="collectionList"></div><div class="tool-export-actions"><button class="reader-control" id="exportCollectionTxt" type="button">Ekspor Koleksi</button></div></section>
                    <section class="tool-panel" id="tool-summary" role="tabpanel"><ul class="summary-list" id="summaryList"></ul></section>
                    <section class="tool-panel" id="tool-settings" role="tabpanel"><div class="reader-settings">
                        <label class="setting-row"><span>Tema baca</span><span class="setting-buttons"><button class="theme-dot light" data-theme="light" type="button" aria-label="Tema terang"></button><button class="theme-dot sepia" data-theme="sepia" type="button" aria-label="Tema sepia"></button><button class="theme-dot dark" data-theme="dark" type="button" aria-label="Tema gelap"></button><button class="theme-dot oled" data-theme="oled" type="button" aria-label="Tema OLED"></button><button class="theme-dot paper" data-theme="paper" type="button" aria-label="Tema Paper"></button></span></label>
                        <div class="setting-row"><span>Font baca</span><div class="setting-buttons"><button class="reader-control" data-font="Source Serif 4, Georgia, serif" type="button">Serif</button><button class="reader-control" data-font="Manrope, Inter, sans-serif" type="button">Sans</button><button class="reader-control" data-font="Inter, system-ui, sans-serif" type="button">Clean</button></div></div>
                        <div class="setting-row"><span>Lebar kolom</span><div class="setting-buttons"><button class="reader-control" data-width="700px" type="button">Fokus</button><button class="reader-control" data-width="900px" type="button">Nyaman</button><button class="reader-control" data-width="1100px" type="button">Lega</button></div></div>
                        <div class="setting-row"><span>Ukuran teks</span><div class="setting-buttons"><button class="reader-control" id="fontDown" type="button">A−</button><button class="reader-control" id="fontUp" type="button">A+</button></div></div>
                        <div class="setting-row"><span>Jarak baris</span><div class="setting-buttons"><button class="reader-control" data-line="1.6" type="button">Rapat</button><button class="reader-control" data-line="1.82" type="button">Nyaman</button><button class="reader-control" data-line="2" type="button">Lega</button></div></div>
                        <div class="setting-row"><span>Kecepatan audio</span><div class="setting-buttons"><button class="reader-control" data-rate="0.8" type="button">0.8×</button><button class="reader-control" data-rate="1" type="button">1×</button><button class="reader-control" data-rate="1.2" type="button">1.2×</button><button class="reader-control" data-rate="1.4" type="button">1.4×</button></div></div>
                        <button class="reader-control" id="highlighterToggle" type="button">Stabilo paragraf</button><button class="reader-control" id="fullscreenToggle" type="button">Layar penuh</button><button class="reader-control" id="zenToggle" type="button">Mode fokus</button>
                    </div></section>
                </aside>
            </div>
            <div class="reader-searchbar" id="readerSearchbar"><input id="readerSearchInput" type="search" placeholder="Cari kata atau frasa dalam bab" aria-label="Cari dalam bab"><span class="reader-search-count" id="searchCount">0/0</span><button class="reader-control icon" id="searchPrev" type="button" aria-label="Hasil sebelumnya">↑</button><button class="reader-control icon" id="searchNext" type="button" aria-label="Hasil berikutnya">↓</button><button class="reader-control icon" id="searchClose" type="button" aria-label="Tutup pencarian">×</button></div>
            <div class="reader-popover" id="paragraphPopover"><div class="popover-colors"><button class="popover-color-btn" data-color="yellow" type="button" aria-label="Stabilo Kuning" title="Konsep Utama"></button><button class="popover-color-btn" data-color="green" type="button" aria-label="Stabilo Hijau" title="Sudah Paham"></button><button class="popover-color-btn" data-color="red" type="button" aria-label="Stabilo Merah" title="Perlu Diulang"></button></div><button class="reader-control" id="highlightParagraph" type="button">Stabilo</button><button class="reader-control" id="pinParagraph" type="button">Sematkan</button><button class="reader-control" id="reviewParagraph" type="button">Ulangi nanti</button></div>
            <nav class="mobile-reader-nav" aria-label="Navigasi pembaca"><button data-mobile-action="toc" type="button"><span>☰</span>Bab</button><button data-mobile-action="search" type="button"><span>⌕</span>Cari</button><button data-mobile-action="study" type="button"><span>✓</span>Belajar</button><button data-mobile-action="audio" type="button"><span>▶</span>Dengar</button><button data-mobile-action="notes" type="button"><span>✎</span>Catatan</button></nav>
            <button class="reader-control zen-exit" id="zenExit" type="button">Keluar fokus</button>`;
        applyPreferences();
        bindApp();
        renderChapter(true);
    }

    function chapterItemMarkup(chapter, index) {
        const state = chapterState(index);
        const status = state === "done" ? "Selesai" : state === "current" ? "Sedang dibaca" : "Belum dibaca";
        return `<button class="chapter-item ${index === chapterIndex ? "active" : ""} state-${state}" type="button" data-chapter="${index}"><span class="chapter-index">${state === "done" ? "✓" : String(index + 1).padStart(2, "0")}</span><span><strong>${escapeHtml(chapter.title)}</strong><small>${estimateMinutes(chapter.content)} menit · ${status}</small></span></button>`;
    }

    function renderChapter(restoreScroll = true) {
        stopSpeech();
        clearSearch();
        const chapter = book.chapters[chapterIndex];
        const article = document.getElementById("readerArticle");
        const cleanContent = cleanChapterContentHtml(chapter.content, chapter.title);
        article.innerHTML = `<header class="book-sheet-header"><div class="chapter-label">Bab ${chapterIndex + 1} dari ${book.chapters.length}</div><h1>${escapeHtml(chapter.title.replace(/^Bab\s+\d+\s*:\s*/i, ""))}</h1><p>${estimateMinutes(chapter.content)} menit baca · Posisi dan catatan disimpan otomatis pada perangkat ini.</p></header><div class="book-content" id="bookContent">${cleanContent}</div>${buildStudyCheckpoint(chapter)}`;
        applyHighlights();
        attachParagraphActions();
        renderSummary();
        renderCollection();
        loadNotes();
        document.querySelectorAll(".chapter-item").forEach((item) => item.classList.toggle("active", Number(item.dataset.chapter) === chapterIndex));
        document.getElementById("prevChapter").disabled = chapterIndex === 0;
        document.getElementById("nextChapter").textContent = chapterIndex === book.chapters.length - 1 ? "Selesai membaca" : "Bab berikutnya →";
        const stage = document.getElementById("bookStage");
        requestAnimationFrame(() => {
            const offset = restoreScroll ? Number(positions[bookId]?.offsets?.[chapterIndex] || 0) : 0;
            stage.scrollTop = Math.min(offset, Math.max(0, stage.scrollHeight - stage.clientHeight));
            if (pendingParagraph !== null) {
                document.querySelector(`#bookContent p[data-paragraph="${pendingParagraph}"]`)?.scrollIntoView({ block: "center" });
                pendingParagraph = null;
            }
            updateProgress();
            const searchbar = document.getElementById("readerSearchbar");
            const searchInput = document.getElementById("readerSearchInput");
            if (searchbar?.classList.contains("open") && searchInput?.value.trim()) {
                performSearch({ target: searchInput });
            }
        });
        savePosition();
        refreshChapterStates();
    }

    function buildStudyCheckpoint(chapter) {
        const understood = storage.get(`library_understood_${bookId}_${chapterIndex}`, false);
        return `<section class="study-checkpoint" id="studyCheckpoint"><div class="study-checkpoint-head"><div><span class="studio-kicker">Study Mode</span><h2>Selesaikan bab ini dengan yakin</h2><p>Baca inti bab, kerjakan praktik, uji pemahaman, lalu tandai jika konsepnya sudah kamu kuasai.</p></div><span class="mastery-badge ${understood ? "done" : ""}" id="masteryBadge">${understood ? "Dikuasai" : "Belum selesai"}</span></div>${buildPracticeStudio(chapter)}${buildFlashcards(chapter)}${buildQuiz(chapter)}<div class="study-actions"><button class="reader-control" id="scheduleChapterReview" type="button">Ulangi nanti</button><button class="reader-control" id="reviewSummary" type="button">Baca inti bab</button><button class="reader-control primary" id="markUnderstood" type="button">${understood ? "✓ Sudah dipahami" : "Tandai sudah paham"}</button></div></section>`;
    }

    function buildPracticeStudio(chapter) {
        const practice = chapter.practice || {
            title: "Praktik singkat: terapkan konsep bab",
            scenario: `Pilih satu contoh nyata yang berkaitan dengan ${chapter.title.replace(/^Bab\s+\d+\s*:\s*/i, "").toLowerCase()}.`,
            task: "Jelaskan masalah, terapkan konsep utama, lalu nilai hasil dan keterbatasannya.",
            prompts: [
                "Apa konteks, tujuan, dan batasan kasus yang kamu pilih?",
                "Bagaimana konsep dalam bab ini kamu terapkan langkah demi langkah?",
                "Apa bukti hasilnya, keterbatasannya, dan perbaikan berikutnya?"
            ],
            checklist: ["Konteks dan tujuan sudah jelas", "Konsep bab benar-benar diterapkan", "Ada bukti atau contoh konkret", "Ada refleksi dan perbaikan"]
        };
        const saved = storage.get(`library_practice_${bookId}_${chapterIndex}`, { answers: [], checks: [] });
        const checks = practice.checklist || [];
        const completed = checks.filter((_, index) => saved.checks?.[index]).length;
        return `<section class="guided-practice" aria-labelledby="guidedPracticeTitle">
            <div class="guided-practice-head"><div><span class="studio-kicker">Praktik terbimbing</span><h3 id="guidedPracticeTitle">${escapeHtml(practice.title)}</h3></div><span class="practice-progress" id="practiceProgress">${completed}/${checks.length} langkah</span></div>
            <div class="practice-brief"><strong>Skenario</strong><p>${escapeHtml(practice.scenario)}</p><strong>Tantangan</strong><p>${escapeHtml(practice.task)}</p></div>
            <div class="practice-workspace">${(practice.prompts || []).map((prompt, index) => `<label class="practice-prompt"><span>${index + 1}</span><strong>${escapeHtml(prompt)}</strong><textarea data-practice-answer="${index}" rows="3" placeholder="Tulis jawabanmu di sini…">${escapeHtml(saved.answers?.[index] || "")}</textarea></label>`).join("")}</div>
            <div class="practice-checklist"><strong>Checklist hasil</strong>${checks.map((item, index) => `<label><input type="checkbox" data-practice-check="${index}" ${saved.checks?.[index] ? "checked" : ""}><span>${escapeHtml(item)}</span></label>`).join("")}</div>
            <div class="practice-save-status ${completed === checks.length && checks.length ? "complete" : ""}" id="practiceSaveStatus" role="status" aria-live="polite">${completed === checks.length && checks.length ? "Praktik lengkap dan tersimpan." : "Jawaban tersimpan otomatis di perangkat ini."}</div>
        </section>`;
    }

    function buildFlashcards(chapter) {
        const holder = document.createElement("div");
        holder.innerHTML = cleanChapterContentHtml(chapter.content, chapter.title);
        const headings = [...holder.querySelectorAll("h2, h3")].slice(0, 3);
        const cards = headings.map((h, idx) => {
            let nextEl = h.nextElementSibling;
            while (nextEl && !nextEl.matches("p, div, ul, ol, blockquote")) {
                nextEl = nextEl.nextElementSibling;
            }
            const nextText = nextEl?.textContent?.trim() || `Penjelasan lengkap konsep ${h.textContent.trim()} dapat dipelajari pada bab ini.`;
            return { question: h.textContent.trim(), answer: nextText };
        });
        if (!cards.length && chapter.quiz) {
            cards.push({ question: `Konsep utama dari ${chapter.title}?`, answer: chapter.quiz.explanation || "Lihat kembali bagian ringkasan bab untuk penguatan materi." });
        }
        if (!cards.length) return "";
        return `<section class="flashcard-section"><div class="studio-kicker">Uji Ingatan Cepat (Flashcards)</div><h3>Klik kartu untuk melihat kunci jawaban</h3><div class="flashcard-deck">${cards.map((card, idx) => `<div class="flashcard-card" data-flashcard-idx="${idx}"><span class="flashcard-tag">Konsep ${idx + 1}</span><div class="flashcard-question">${escapeHtml(card.question)}</div><div class="flashcard-action"><span class="card-unflipped">🔄 Klik lihat jawaban</span><span class="card-flipped">↩ Tutup jawaban</span></div><div class="flashcard-answer">${escapeHtml(card.answer)}</div></div>`).join("")}</div></section>`;
    }

    function buildQuiz(chapter) {
        if (!chapter.quiz) return "";
        const key = `library_quiz_${bookId}_${chapterIndex}`;
        const saved = storage.get(key, null);
        const solved = saved === chapter.quiz.correct;
        const attempts = storage.get(`library_quiz_attempts_${bookId}_${chapterIndex}`, 0);
        return `<section class="chapter-quiz"><div class="studio-kicker">Cek pemahaman</div><h2>${escapeHtml(chapter.quiz.question)}</h2><div class="quiz-options">${chapter.quiz.options.map((option, index) => `<button class="quiz-option ${solved && index === chapter.quiz.correct ? "correct" : ""}" type="button" data-quiz="${index}" ${solved ? "disabled" : ""}>${String.fromCharCode(65 + index)}. ${escapeHtml(option)}</button>`).join("")}</div><div class="quiz-feedback" id="quizFeedback" role="status" aria-live="polite">${solved ? escapeHtml(chapter.quiz.explanation) : attempts ? `Belum selesai · ${attempts} percobaan. Coba lagi saat siap.` : "Pilih jawaban untuk memeriksa pemahamanmu."}</div></section>`;
    }

    function bindApp() {
        document.getElementById("backLibrary")?.addEventListener("click", () => { savePosition(); location.href = "library.html"; });
        document.getElementById("toggleToc")?.addEventListener("click", () => togglePanel("bookToc"));
        document.getElementById("toolsToggle")?.addEventListener("click", () => togglePanel("bookTools"));
        document.getElementById("closeTools")?.addEventListener("click", () => closePanel("bookTools"));
        document.querySelectorAll(".chapter-item").forEach((item) => item.addEventListener("click", () => changeChapter(Number(item.dataset.chapter))));
        document.getElementById("prevChapter")?.addEventListener("click", () => changeChapter(chapterIndex - 1));
        document.getElementById("nextChapter")?.addEventListener("click", () => chapterIndex < book.chapters.length - 1 ? changeChapter(chapterIndex + 1) : finishBook());
        document.getElementById("bookStage")?.addEventListener("scroll", () => {
            scheduleProgressUpdate();
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(savePosition, 220);
        }, { passive: true });
        document.querySelectorAll(".tool-tab").forEach((tab) => tab.addEventListener("click", () => openTool(tab.dataset.tool)));
        document.getElementById("readerNotes")?.addEventListener("input", scheduleNoteSave);
        document.getElementById("copyNotes")?.addEventListener("click", copyNotes);
        document.getElementById("copyNotesMd")?.addEventListener("click", copyNotesMarkdown);
        document.getElementById("exportNotesTxt")?.addEventListener("click", exportNotes);
        document.getElementById("exportCollectionTxt")?.addEventListener("click", exportCollection);
        document.querySelectorAll("[data-theme]").forEach((button) => button.addEventListener("click", () => setTheme(button.dataset.theme)));
        document.querySelectorAll("[data-font]").forEach((button) => button.addEventListener("click", () => setFontFamily(button.dataset.font)));
        document.querySelectorAll("[data-width]").forEach((button) => button.addEventListener("click", () => setColumnWidth(button.dataset.width)));
        document.getElementById("fontDown")?.addEventListener("click", () => changeFont(-1));
        document.getElementById("fontUp")?.addEventListener("click", () => changeFont(1));
        document.querySelectorAll("[data-line]").forEach((button) => button.addEventListener("click", () => setLineHeight(Number(button.dataset.line))));
        document.querySelectorAll("[data-rate]").forEach((button) => button.addEventListener("click", () => setTtsRate(Number(button.dataset.rate))));
        document.getElementById("highlighterToggle")?.addEventListener("click", toggleHighlighter);
        document.getElementById("fullscreenToggle")?.addEventListener("click", toggleFullscreen);
        document.getElementById("zenToggle")?.addEventListener("click", toggleZen);
        document.getElementById("zenExit")?.addEventListener("click", toggleZen);
        document.getElementById("ttsToggle")?.addEventListener("click", toggleSpeech);
        document.getElementById("searchToggle")?.addEventListener("click", openSearch);
        document.getElementById("searchClose")?.addEventListener("click", closeSearch);
        document.getElementById("readerSearchInput")?.addEventListener("input", scheduleSearch);
        document.getElementById("searchNext")?.addEventListener("click", () => moveSearch(1));
        document.getElementById("searchPrev")?.addEventListener("click", () => moveSearch(-1));
        document.getElementById("highlightParagraph")?.addEventListener("click", () => toggleParagraphHighlight("yellow"));
        document.querySelectorAll(".popover-color-btn").forEach((btn) => btn.addEventListener("click", () => toggleParagraphHighlight(btn.dataset.color)));
        document.getElementById("pinParagraph")?.addEventListener("click", pinParagraph);
        document.getElementById("reviewParagraph")?.addEventListener("click", () => scheduleReview(activeParagraph));
        document.getElementById("readerArticle")?.addEventListener("click", handleArticleClick);
        document.getElementById("readerArticle")?.addEventListener("input", (event) => {
            if (!event.target.matches("[data-practice-answer]")) return;
            clearTimeout(savePractice.timer);
            savePractice.timer = setTimeout(savePractice, 300);
        });
        document.getElementById("readerArticle")?.addEventListener("change", (event) => {
            if (event.target.matches("[data-practice-check]")) savePractice();
        });
        document.querySelectorAll("[data-mobile-action]").forEach((button) => button.addEventListener("click", () => mobileAction(button.dataset.mobileAction)));
        document.addEventListener("keydown", handleKeyboard);
        document.addEventListener("fullscreenchange", () => { const fsBtn = document.getElementById("fullscreenToggle"); if (fsBtn) fsBtn.textContent = document.fullscreenElement ? "Keluar layar penuh" : "Layar penuh"; });
        window.addEventListener("pagehide", () => {
            clearTimeout(savePractice.timer);
            clearTimeout(searchTimer);
            if (progressFrame) cancelAnimationFrame(progressFrame);
            savePosition();
            saveNotes();
            savePractice();
            stopSpeech();
        });
        document.addEventListener("click", (event) => {
            const popover = document.getElementById("paragraphPopover");
            if (popover?.classList.contains("open") && !event.target.closest("#paragraphPopover") && !event.target.closest("#bookContent p")) {
                closePopover();
            }
        });
    }

    function handleArticleClick(event) {
        const flashcard = event.target.closest(".flashcard-card");
        if (flashcard) {
            flashcard.classList.toggle("flipped");
            if (typeof window.playSound === "function") window.playSound("click");
            return;
        }
        const quiz = event.target.closest("[data-quiz]");
        if (quiz) answerQuiz(Number(quiz.dataset.quiz));
        if (event.target.closest("#markUnderstood")) toggleUnderstood();
        if (event.target.closest("#reviewSummary")) {
            openTool("summary");
            document.getElementById("bookTools")?.classList.add("open");
            document.getElementById("toolsToggle")?.setAttribute("aria-expanded", "true");
        }
        if (event.target.closest("#scheduleChapterReview")) scheduleReview(null);
    }

    function savePractice() {
        const answers = [...document.querySelectorAll("[data-practice-answer]")].map((field) => field.value.trim());
        const checks = [...document.querySelectorAll("[data-practice-check]")].map((field) => field.checked);
        storage.set(`library_practice_${bookId}_${chapterIndex}`, { answers, checks, updatedAt: new Date().toISOString() });
        const completed = checks.filter(Boolean).length;
        const progress = document.getElementById("practiceProgress");
        const status = document.getElementById("practiceSaveStatus");
        if (progress) progress.textContent = `${completed}/${checks.length} langkah`;
        if (status) {
            const complete = completed === checks.length && checks.length > 0;
            status.textContent = complete ? "Praktik lengkap dan tersimpan." : "Jawaban tersimpan otomatis di perangkat ini.";
            status.classList.toggle("complete", complete);
        }
    }

    function mobileAction(action) {
        if (action === "toc") togglePanel("bookToc");
        if (action === "search") openSearch();
        if (action === "audio") toggleSpeech();
        if (action === "study") document.getElementById("studyCheckpoint")?.scrollIntoView({ behavior: "smooth", block: "start" });
        if (action === "notes") {
            openTool("notes");
            document.getElementById("bookTools")?.classList.add("open");
            document.getElementById("toolsToggle")?.setAttribute("aria-expanded", "true");
        }
    }

    function changeChapter(index) {
        if (index < 0 || index >= book.chapters.length || index === chapterIndex) return;
        clearTimeout(savePractice.timer);
        clearTimeout(searchTimer);
        clearTimeout(scrollTimer);
        savePosition();
        saveNotes();
        savePractice();
        chapterIndex = index;
        closePanel("bookToc");
        renderChapter(true);
        document.getElementById("readerArticle").focus({ preventScroll: true });
    }

    function savePosition() {
        const all = storage.get("library_read_positions", {});
        const stage = document.getElementById("bookStage");
        const entry = all[bookId] || { offsets: {} };
        entry.chapter = chapterIndex;
        entry.offsets ||= {};
        if (stage) entry.offsets[chapterIndex] = Math.round(stage.scrollTop);
        const chapterProgress = stage && stage.scrollHeight > stage.clientHeight ? stage.scrollTop / (stage.scrollHeight - stage.clientHeight) : 1;
        entry.progress = Math.min(100, Math.round(((chapterIndex + chapterProgress) / book.chapters.length) * 100));
        entry.updatedAt = new Date().toISOString();
        all[bookId] = entry;
        storage.set("library_read_positions", all);
        const bookmarks = storage.get("library_bookmarks", {});
        bookmarks[bookId] = chapterIndex;
        storage.set("library_bookmarks", bookmarks);
        positions[bookId] = entry;
        const activity = storage.get("library_read_activity", []);
        const day = entry.updatedAt.slice(0, 10);
        const record = { day, bookId, chapter: chapterIndex, progress: entry.progress, minutes: Math.max(1, Math.round(estimateMinutes(book.chapters[chapterIndex].content) * chapterProgress)) };
        const existing = activity.findIndex((item) => item.day === day && item.bookId === bookId);
        if (existing >= 0) activity[existing] = record; else activity.push(record);
        storage.set("library_read_activity", activity.slice(-120));
    }

    function updateProgress() {
        const stage = document.getElementById("bookStage");
        if (!stage) return;
        const local = stage.scrollHeight <= stage.clientHeight ? 100 : (stage.scrollTop / (stage.scrollHeight - stage.clientHeight)) * 100;
        const overall = ((chapterIndex + local / 100) / book.chapters.length) * 100;
        document.getElementById("bookProgressBar")?.style.setProperty("--value", `${Math.min(100, overall)}%`);
        const resume = document.getElementById("resumePercent");
        if (resume) resume.textContent = `${Math.round(Math.min(100, overall))}%`;
    }

    function scheduleProgressUpdate() {
        if (progressFrame) return;
        progressFrame = requestAnimationFrame(() => {
            progressFrame = null;
            updateProgress();
        });
    }

    function refreshChapterStates() {
        document.querySelectorAll(".chapter-item").forEach((item) => {
            const index = Number(item.dataset.chapter);
            const fresh = document.createElement("div");
            fresh.innerHTML = chapterItemMarkup(book.chapters[index], index);
            const next = fresh.firstElementChild;
            next.addEventListener("click", () => changeChapter(index));
            item.replaceWith(next);
        });
    }

    function finishBook() {
        const completed = storage.get("library_completed", {});
        completed[bookId] = { completedAt: new Date().toISOString(), chapters: book.chapters.length };
        storage.set("library_completed", completed);
        showToast("Buku selesai. Hebat—catatanmu tetap tersimpan.");
        setTimeout(() => location.href = "library.html", 1400);
    }

    function togglePanel(id) {
        const panel = document.getElementById(id);
        const open = panel.classList.toggle("open");
        if (id === "bookToc") document.getElementById("toggleToc").setAttribute("aria-expanded", String(open));
        if (id === "bookTools") document.getElementById("toolsToggle").setAttribute("aria-expanded", String(open));
    }

    function closePanel(id) {
        document.getElementById(id)?.classList.remove("open");
        if (id === "bookToc") document.getElementById("toggleToc")?.setAttribute("aria-expanded", "false");
        if (id === "bookTools") document.getElementById("toolsToggle")?.setAttribute("aria-expanded", "false");
    }

    function openTool(name) {
        document.querySelectorAll(".tool-tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.tool === name));
        document.querySelectorAll(".tool-panel").forEach((panel) => panel.classList.toggle("active", panel.id === `tool-${name}`));
    }

    function noteKey() { return `library_notes_${bookId}_${chapterIndex}`; }
    function loadNotes() { document.getElementById("readerNotes").value = storage.get(noteKey(), ""); }
    function scheduleNoteSave() { document.getElementById("noteStatus").textContent = "Menyimpan…"; clearTimeout(noteTimer); noteTimer = setTimeout(saveNotes, 420); }
    function saveNotes() { const input = document.getElementById("readerNotes"); if (!input) return; storage.set(noteKey(), input.value); document.getElementById("noteStatus").textContent = "Tersimpan otomatis"; renderCollection(); }
    async function copyNotes() { const value = document.getElementById("readerNotes").value; if (!value) return showToast("Catatan masih kosong."); try { await navigator.clipboard.writeText(value); showToast("Catatan disalin."); } catch { document.getElementById("readerNotes").select(); showToast("Catatan dipilih. Salin secara manual."); } }

    function renderCollection() {
        const container = document.getElementById("collectionList");
        if (!container) return;
        const entries = book.chapters.flatMap((chapter, index) => {
            const note = storage.get(`library_notes_${bookId}_${index}`, "").trim();
            const highlightIndexes = storage.get(`library_highlights_${bookId}_${index}`, []);
            const colorMap = storage.get(`library_highlight_colors_${bookId}_${index}`, {});
            const holder = document.createElement("div");
            holder.innerHTML = cleanChapterContentHtml(chapter.content, chapter.title);
            const paragraphs = [...holder.querySelectorAll("p")];
            const highlights = highlightIndexes.map((paragraphIndex) => {
                const text = paragraphs[paragraphIndex]?.textContent?.trim();
                if (!text) return null;
                const color = colorMap[paragraphIndex] || "yellow";
                return { text, color };
            }).filter(Boolean);
            if (!note && !highlights.length) return [];
            return [{ chapter, index, note, highlights }];
        });
        container.innerHTML = entries.length ? entries.map((entry) => `<article class="collection-card"><button type="button" data-collection-chapter="${entry.index}"><span>Bab ${entry.index + 1}</span><strong>${escapeHtml(entry.chapter.title.replace(/^Bab\s+\d+\s*:\s*/i, ""))}</strong></button>${entry.note ? `<p class="collection-note">${escapeHtml(entry.note.slice(0, 220))}${entry.note.length > 220 ? "…" : ""}</p>` : ""}${entry.highlights.map((item) => `<blockquote class="quote-${item.color}">${escapeHtml(item.text)}</blockquote>`).join("")}</article>`).join("") : `<div class="collection-empty"><strong>Koleksimu masih kosong</strong><p>Beri stabilo atau tulis catatan. Semuanya akan terkumpul di sini.</p></div>`;
        container.querySelectorAll("[data-collection-chapter]").forEach((button) => button.addEventListener("click", () => changeChapter(Number(button.dataset.collectionChapter))));
    }

    function highlightKey() { return `library_highlights_${bookId}_${chapterIndex}`; }
    function highlightColorKey() { return `library_highlight_colors_${bookId}_${chapterIndex}`; }
    function getHighlights() { return storage.get(highlightKey(), []); }
    function getHighlightColors() { return storage.get(highlightColorKey(), {}); }
    function applyHighlights() {
        const active = new Set(getHighlights());
        const colorMap = getHighlightColors();
        document.querySelectorAll("#bookContent p").forEach((paragraph, index) => {
            paragraph.dataset.paragraph = index;
            const isHighlighted = active.has(index);
            paragraph.classList.remove("highlighted", "highlight-yellow", "highlight-green", "highlight-red");
            if (isHighlighted) {
                const color = colorMap[index] || "yellow";
                paragraph.classList.add(`highlight-${color}`);
            }
        });
    }
    function attachParagraphActions() {
        document.querySelectorAll("#bookContent p").forEach((paragraph) => paragraph.addEventListener("click", (event) => {
            if (highlighterMode) {
                activeParagraph = paragraph;
                const index = Number(activeParagraph.dataset.paragraph);
                const active = new Set(getHighlights());
                const colorMap = getHighlightColors();
                if (active.has(index)) {
                    toggleParagraphHighlight(colorMap[index] || "yellow");
                } else {
                    toggleParagraphHighlight(window.lastSelectedHighlightColor || "yellow");
                }
                return;
            }
            if (!window.getSelection()?.toString()) return;
            activeParagraph = paragraph;
            const popover = document.getElementById("paragraphPopover");
            popover.style.left = `${Math.max(8, Math.min(event.clientX, innerWidth - 315))}px`;
            popover.style.top = `${Math.min(event.clientY + 10, innerHeight - 70)}px`;
            popover.classList.add("open");
            event.stopPropagation();
        }));
    }
    function toggleHighlighter(event) { highlighterMode = !highlighterMode; event.currentTarget.classList.toggle("active", highlighterMode); showToast(highlighterMode ? "Klik langsung paragraf untuk stabilo instan." : "Mode stabilo dinonaktifkan."); }
    function toggleParagraphHighlight(color = "yellow") {
        if (!activeParagraph) return;
        window.lastSelectedHighlightColor = color;
        const index = Number(activeParagraph.dataset.paragraph);
        const active = new Set(getHighlights());
        const colorMap = getHighlightColors();
        if (active.has(index) && colorMap[index] === color) {
            active.delete(index);
            delete colorMap[index];
        } else {
            active.add(index);
            colorMap[index] = color;
        }
        storage.set(highlightKey(), [...active]);
        storage.set(highlightColorKey(), colorMap);
        applyHighlights();
        closePopover();
        renderCollection();
        if (typeof window.playSound === "function") window.playSound("click");
    }
    function pinParagraph() {
        if (!activeParagraph) return;
        const notes = document.getElementById("readerNotes");
        notes.value = `${notes.value.trim()}${notes.value.trim() ? "\n\n" : ""}> “${activeParagraph.textContent.trim()}”\n`.trimStart();
        saveNotes();
        openTool("notes");
        document.getElementById("bookTools")?.classList.add("open");
        document.getElementById("toolsToggle")?.setAttribute("aria-expanded", "true");
        closePopover();
        showToast("Kutipan disematkan ke catatan.");
    }
    function scheduleReview(paragraph) {
        const queue = storage.get("library_review_queue", []);
        const paragraphIndex = paragraph ? Number(paragraph.dataset.paragraph) : null;
        const id = `${bookId}:${chapterIndex}:${paragraphIndex ?? "chapter"}`;
        const due = new Date(); due.setDate(due.getDate() + 1); due.setHours(8, 0, 0, 0);
        const entry = { id, bookId, chapter: chapterIndex, paragraph: paragraphIndex, text: paragraph?.textContent.trim() || book.chapters[chapterIndex].title, dueAt: due.toISOString(), createdAt: new Date().toISOString(), done: false };
        const existing = queue.findIndex((item) => item.id === id && !item.done);
        if (existing >= 0) queue[existing] = entry; else queue.push(entry);
        storage.set("library_review_queue", queue.slice(-150));
        closePopover();
        showToast("Dijadwalkan untuk diulangi besok.");
    }
    function closePopover() { document.getElementById("paragraphPopover")?.classList.remove("open"); activeParagraph = null; }

    function renderSummary() {
        const content = document.getElementById("bookContent");
        const headings = [...content.querySelectorAll("h2, h3")].slice(0, 8);
        const items = headings.length ? headings.map((heading) => {
            let text = heading.textContent.trim();
            let nextEl = heading.nextElementSibling;
            while (nextEl && !nextEl.matches("p, div, ul, ol, blockquote")) {
                nextEl = nextEl.nextElementSibling;
            }
            const nextText = nextEl?.textContent?.trim();
            if (nextText) text += ` — ${nextText.slice(0, 140)}${nextText.length > 140 ? "…" : ""}`;
            return text;
        }) : [...content.querySelectorAll("p")].slice(0, 5).map((p) => p.textContent.slice(0, 160));
        document.getElementById("summaryList").innerHTML = items.map((item, index) => `<li><span>${String(index + 1).padStart(2, "0")}</span>${escapeHtml(item)}</li>`).join("") || "<li>Belum ada poin rangkuman pada bab ini.</li>";
    }

    function openSearch() { document.getElementById("readerSearchbar").classList.add("open"); document.getElementById("readerSearchInput").focus(); }
    function closeSearch() { clearTimeout(searchTimer); document.getElementById("readerSearchbar").classList.remove("open"); const input = document.getElementById("readerSearchInput"); if (input) input.value = ""; clearSearch(); }
    function clearSearch() { searchHits.forEach((mark) => mark.replaceWith(document.createTextNode(mark.textContent))); searchHits = []; searchIndex = -1; document.getElementById("bookContent")?.normalize(); updateSearchCount(); }
    function scheduleSearch(event) {
        const input = event.target;
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => performSearch({ target: input }), 160);
    }
    function performSearch(event) {
        clearSearch();
        const query = event.target.value.trim();
        if (!query) return;
        const content = document.getElementById("bookContent");
        const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT, { acceptNode(node) { return node.parentElement.closest("script, style, mark") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; } });
        const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
        const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(escaped, "gi");
        nodes.forEach((node) => { if (!regex.test(node.nodeValue)) return; regex.lastIndex = 0; const fragment = document.createDocumentFragment(); let last = 0; node.nodeValue.replace(regex, (match, offset) => { fragment.append(node.nodeValue.slice(last, offset)); const mark = document.createElement("mark"); mark.className = "search-hit"; mark.textContent = match; fragment.append(mark); searchHits.push(mark); last = offset + match.length; return match; }); fragment.append(node.nodeValue.slice(last)); node.replaceWith(fragment); });
        if (searchHits.length) { searchIndex = 0; focusSearchHit(); }
        updateSearchCount();
    }
    function moveSearch(direction) { if (!searchHits.length) return; searchIndex = (searchIndex + direction + searchHits.length) % searchHits.length; focusSearchHit(); updateSearchCount(); }
    function focusSearchHit() { searchHits.forEach((hit, index) => hit.classList.toggle("active", index === searchIndex)); searchHits[searchIndex]?.scrollIntoView({ behavior: "smooth", block: "center" }); }
    function updateSearchCount() { const count = document.getElementById("searchCount"); if (count) count.textContent = searchHits.length ? `${searchIndex + 1}/${searchHits.length}` : "0/0"; }

    function toggleSpeech() {
        if (!("speechSynthesis" in window)) return showToast("Text-to-speech tidak didukung browser ini.");
        if (speechState === "playing") { speechSynthesis.pause(); speechState = "paused"; updateSpeechButton(); return; }
        if (speechState === "paused") { speechSynthesis.resume(); speechState = "playing"; updateSpeechButton(); return; }
        speechItems = [...document.querySelectorAll("#bookContent h2, #bookContent h3, #bookContent p, #bookContent li")].filter((item) => item.textContent.trim() && !item.querySelector("p, li"));
        if (!speechItems.length) return showToast("Tidak ada teks yang dapat dibacakan.");
        speechIndex = 0; speechSynthesis.cancel(); speechState = "playing"; speakCurrentItem(); updateSpeechButton();
    }
    function speakCurrentItem() {
        clearSpokenItem();
        const item = speechItems[speechIndex];
        if (!item) { stopSpeech(); return; }
        item.classList.add("tts-speaking");
        item.scrollIntoView({ behavior: "smooth", block: "center" });
        speech = new SpeechSynthesisUtterance(item.textContent.replace(/\s+/g, " ").trim());
        speech.lang = "id-ID"; speech.rate = ttsRate;
        speech.onend = () => { if (speechState === "idle") return; speechIndex += 1; if (speechIndex >= speechItems.length) stopSpeech(); else speakCurrentItem(); };
        speech.onerror = (event) => { if (event.error === "canceled" || event.error === "interrupted") return; stopSpeech(); showToast("Audio berhenti sebelum selesai."); };
        speechSynthesis.speak(speech);
    }
    function clearSpokenItem() { document.querySelectorAll(".tts-speaking").forEach((item) => item.classList.remove("tts-speaking")); }
    function stopSpeech() { if ("speechSynthesis" in window) speechSynthesis.cancel(); clearSpokenItem(); speech = null; speechItems = []; speechIndex = -1; speechState = "idle"; updateSpeechButton(); }
    function updateSpeechButton() { const button = document.getElementById("ttsToggle"); if (!button) return; button.classList.toggle("active", speechState !== "idle"); button.innerHTML = speechState === "playing" ? '<span aria-hidden="true">Ⅱ</span><span class="control-label">Jeda</span>' : speechState === "paused" ? '<span aria-hidden="true">▶</span><span class="control-label">Lanjut</span>' : '<span aria-hidden="true">▶</span><span class="control-label">Dengar</span>'; const mobile = document.querySelector('[data-mobile-action="audio"]'); if (mobile) { mobile.classList.toggle("active", speechState !== "idle"); mobile.innerHTML = speechState === "playing" ? '<span>Ⅱ</span>Jeda' : speechState === "paused" ? '<span>▶</span>Lanjut' : '<span>▶</span>Dengar'; } }
    function setTtsRate(rate) { ttsRate = rate; storage.set("library_tts_rate", rate); document.querySelectorAll("[data-rate]").forEach((button) => button.classList.toggle("active", Number(button.dataset.rate) === rate)); if (speechState !== "idle") { stopSpeech(); showToast("Kecepatan disimpan. Mulai ulang audio untuk menerapkan."); } }

    function applyPreferences() {
        setTheme(theme);
        document.documentElement.style.setProperty("--book-font-scale", fontScale);
        document.documentElement.style.setProperty("--book-line-height", lineHeight);
        document.documentElement.style.setProperty("--book-font-family", fontFamily);
        document.documentElement.style.setProperty("--book-max-width", maxWidth);
        updateSettings();
    }
    function setTheme(next) {
        theme = next;
        document.body.classList.remove("dark-theme", "read-theme-sepia", "read-theme-oled", "read-theme-paper");
        if (theme === "dark") document.body.classList.add("dark-theme");
        if (theme === "sepia") document.body.classList.add("read-theme-sepia");
        if (theme === "oled") document.body.classList.add("read-theme-oled");
        if (theme === "paper") document.body.classList.add("read-theme-paper");
        storage.set("library_reader_theme", theme);
        const themeColorMeta = document.querySelector('meta[name="theme-color"]');
        if (themeColorMeta) {
            const colorMap = { light: "#f4f7fb", sepia: "#f4eddf", dark: "#111c2c", oled: "#05070a", paper: "#eaf0f6" };
            themeColorMeta.setAttribute("content", colorMap[theme] || "#f4f7fb");
        }
        updateSettings();
    }
    function setFontFamily(font) {
        fontFamily = font;
        storage.set("library_reader_font_family", font);
        document.documentElement.style.setProperty("--book-font-family", font);
        updateSettings();
    }
    function setColumnWidth(width) {
        maxWidth = width;
        storage.set("library_reader_max_width", width);
        document.documentElement.style.setProperty("--book-max-width", width);
        updateSettings();
    }
    function changeFont(direction) { const values = [0.9, 1, 1.1, 1.2, 1.3]; fontScale = values[Math.max(0, Math.min(values.length - 1, values.indexOf(fontScale) + direction))]; storage.set("library_reader_font_scale", fontScale); storage.set("library_reader_font_size", fontScale < 1 ? "small" : fontScale > 1.1 ? "large" : "medium"); document.documentElement.style.setProperty("--book-font-scale", fontScale); updateSettings(); }
    function setLineHeight(value) { lineHeight = value; storage.set("library_reader_line_height", value); document.documentElement.style.setProperty("--book-line-height", value); updateSettings(); }
    function updateSettings() {
        document.querySelectorAll("[data-theme]").forEach((button) => button.classList.toggle("active", button.dataset.theme === theme));
        document.querySelectorAll("[data-font]").forEach((button) => button.classList.toggle("active", button.dataset.font === fontFamily));
        document.querySelectorAll("[data-width]").forEach((button) => button.classList.toggle("active", button.dataset.width === maxWidth));
        document.querySelectorAll("[data-line]").forEach((button) => button.classList.toggle("active", Number(button.dataset.line) === lineHeight));
        document.querySelectorAll("[data-rate]").forEach((button) => button.classList.toggle("active", Number(button.dataset.rate) === ttsRate));
        const down = document.getElementById("fontDown"); const up = document.getElementById("fontUp");
        if (down) down.disabled = fontScale === 0.9; if (up) up.disabled = fontScale === 1.3;
    }

    function copyNotesMarkdown() {
        const notes = storage.get(`library_notes_${bookId}_${chapterIndex}`, "").trim();
        const highlightIndexes = storage.get(`library_highlights_${bookId}_${chapterIndex}`, []);
        const colorMap = storage.get(`library_highlight_colors_${bookId}_${chapterIndex}`, {});
        const holder = document.createElement("div");
        holder.innerHTML = cleanChapterContentHtml(book.chapters[chapterIndex].content, book.chapters[chapterIndex].title);
        const paragraphs = [...holder.querySelectorAll("p")];
        const highlights = highlightIndexes.map((idx) => {
            const text = paragraphs[idx]?.textContent?.trim();
            if (!text) return null;
            const color = colorMap[idx] || "yellow";
            return `${formatHighlightLabel(color)} "${text}"`;
        }).filter(Boolean);
        let md = `# Catatan: ${book.title} — ${book.chapters[chapterIndex].title}\n\n`;
        if (notes) md += `## Catatan Pembaca\n${notes}\n\n`;
        if (highlights.length) {
            md += `## Kutipan & Stabilo\n` + highlights.map((h) => `> ${h}`).join("\n\n") + `\n`;
        }
        navigator.clipboard?.writeText(md).then(() => showToast("Catatan tersalin format Markdown."))
            .catch(() => showToast("Gagal menyalin."));
    }

    function exportNotes() {
        const notes = storage.get(`library_notes_${bookId}_${chapterIndex}`, "").trim();
        if (!notes) { showToast("Belum ada catatan untuk diekspor."); return; }
        const blob = new Blob([notes], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = `${book.code || "book"}-bab-${chapterIndex + 1}-catatan.txt`;
        a.click(); URL.revokeObjectURL(url);
        showToast("Catatan diunduh (.txt).");
    }

    function exportCollection() {
        const entries = book.chapters.flatMap((chapter, index) => {
            const note = storage.get(`library_notes_${bookId}_${index}`, "").trim();
            const highlightIndexes = storage.get(`library_highlights_${bookId}_${index}`, []);
            const colorMap = storage.get(`library_highlight_colors_${bookId}_${index}`, {});
            const holder = document.createElement("div"); holder.innerHTML = cleanChapterContentHtml(chapter.content, chapter.title);
            const paragraphs = [...holder.querySelectorAll("p")];
            const highlights = highlightIndexes.map((idx) => {
                const text = paragraphs[idx]?.textContent?.trim();
                if (!text) return null;
                const color = colorMap[idx] || "yellow";
                return `${formatHighlightLabel(color)} "${text}"`;
            }).filter(Boolean);
            if (!note && !highlights.length) return [];
            return `--- Bab ${index + 1}: ${chapter.title} ---\n${note ? `Catatan:\n${note}\n\n` : ""}${highlights.length ? `Stabilo:\n${highlights.map((h) => `- ${h}`).join("\n")}\n\n` : ""}`;
        }).join("\n");
        if (!entries) { showToast("Koleksi masih kosong."); return; }
        const blob = new Blob([`Koleksi Catatan & Stabilo: ${book.title}\n\n` + entries], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = `${book.code || "book"}-koleksi-lengkap.txt`;
        a.click(); URL.revokeObjectURL(url);
        showToast("Koleksi diunduh (.txt).");
    }

    function toggleFullscreen() { if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => showToast("Mode layar penuh tidak tersedia.")); else document.exitFullscreen?.(); }
    function toggleZen() { document.body.classList.toggle("reader-zen"); }
    function answerQuiz(index) { const chapter = book.chapters[chapterIndex]; const correct = index === chapter.quiz.correct; const attemptsKey = `library_quiz_attempts_${bookId}_${chapterIndex}`; storage.set(attemptsKey, storage.get(attemptsKey, 0) + 1); document.querySelectorAll("[data-quiz]").forEach((button) => { button.classList.remove("wrong"); const value = Number(button.dataset.quiz); if (correct) { button.disabled = true; if (value === chapter.quiz.correct) button.classList.add("correct"); } else if (value === index) button.classList.add("wrong"); }); const feedback = document.getElementById("quizFeedback"); if (correct) { storage.set(`library_quiz_${bookId}_${chapterIndex}`, index); feedback.textContent = `Benar. ${chapter.quiz.explanation}`; refreshChapterStates(); } else { feedback.innerHTML = `<strong>Belum tepat.</strong> Petunjuk: cari kembali istilah kunci pada pertanyaan di bagian inti bab, lalu coba pilihan lain.`; } if (typeof window.playSound === "function") window.playSound(correct ? "success" : "click"); }
    function toggleUnderstood() {
        const key = `library_understood_${bookId}_${chapterIndex}`;
        const understood = !storage.get(key, false);
        storage.set(key, understood);
        const button = document.getElementById("markUnderstood");
        const badge = document.getElementById("masteryBadge");
        if (button) button.textContent = understood ? "✓ Sudah dipahami" : "Tandai sudah paham";
        if (badge) { badge.textContent = understood ? "Dikuasai" : "Belum selesai"; badge.classList.toggle("done", understood); }
        refreshChapterStates();
        showToast(understood ? "Bab ditandai sudah dipahami." : "Status pemahaman dibatalkan.");
        if (typeof window.playSound === "function" && understood) window.playSound("fanfare");
    }
    function estimateMinutes(html) {
        if (readingMinuteCache.has(html)) return readingMinuteCache.get(html);
        const holder = document.createElement("div");
        holder.innerHTML = html;
        const words = holder.textContent.trim().split(/\s+/).filter(Boolean).length;
        const minutes = Math.max(1, Math.ceil(words / 200));
        readingMinuteCache.set(html, minutes);
        return minutes;
    }

    function handleKeyboard(event) {
        if (event.target.closest("input, textarea, button, a, select, summary, [contenteditable='true']")) return;
        if (event.ctrlKey || event.metaKey || event.altKey) return;
        if (event.key === "Escape") { closePanel("bookToc"); closePanel("bookTools"); closeSearch(); closePopover(); if (document.body.classList.contains("reader-zen")) toggleZen(); }
        if (event.key === "ArrowRight" && chapterIndex < book.chapters.length - 1) changeChapter(chapterIndex + 1);
        if (event.key === "ArrowLeft" && chapterIndex > 0) changeChapter(chapterIndex - 1);
        if (event.key.toLowerCase() === "f") toggleZen();
        if (event.key.toLowerCase() === "s") openSearch();
    }

    function renderError(title, message) {
        app.innerHTML = `<main class="reader-error"><div class="studio-kicker">Universe Of Tech Library</div><h1>${escapeHtml(title)}</h1><p>${escapeHtml(message)}</p><a class="studio-btn primary" href="library.html">Kembali ke perpustakaan</a></main>`;
    }

    buildApp();
})();
