/** Universe Of Tech — Academic Premium Library */
(() => {
    "use strict";

    const books = typeof BOOKS !== "undefined" && Array.isArray(BOOKS) ? BOOKS : [];
    const KEYS = {
        borrowed: "library_borrowed", favorites: "library_favorites", bookmarks: "library_bookmarks",
        positions: "library_read_positions", completed: "library_completed", lastRead: "library_last_read",
        view: "library_view_mode", sort: "library_sort_mode", deskSort: "library_desk_sort"
    };
    const store = {
        get(key, fallback) { try { const value = localStorage.getItem(key); return value === null ? fallback : (JSON.parse(value) ?? fallback); } catch { return fallback; } },
        set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } },
        text(key, fallback = "") { try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; } },
        remove(key) { try { localStorage.removeItem(key); } catch { /* storage is optional */ } },
        keys() { try { return Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i)).filter(Boolean); } catch { return []; } }
    };
    const validIds = new Set(books.map((book) => book.id));
    const uniqueIds = (value) => Array.isArray(value) ? [...new Set(value.filter((id) => typeof id === "string" && validIds.has(id)))] : [];
    const allowedSorts = ["recommended", "rating", "newest", "title", "duration"];
    const state = {
        borrowed: uniqueIds(store.get(KEYS.borrowed, [])),
        favorites: uniqueIds(store.get(KEYS.favorites, [])),
        status: "all", category: "all", level: "all", duration: "all", query: "",
        sort: allowedSorts.includes(store.get(KEYS.sort, "recommended")) ? store.get(KEYS.sort, "recommended") : "recommended",
        view: store.get(KEYS.view, "grid") === "list" ? "list" : "grid",
        deskSort: store.text(KEYS.deskSort, "recent") || "recent",
        recommendationSeed: 0, detailBookId: null
    };
    const el = {};
    let returnFocus = null;
    let noteTimer = null;
    let chatTimer = null;

    function escapeHtml(value) {
        return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
    }
    function getBook(id) { return books.find((book) => book.id === id) || null; }
    function isBorrowed(id) { return state.borrowed.includes(id); }
    function isFavorite(id) { return state.favorites.includes(id); }
    function positions() { const value = store.get(KEYS.positions, {}); return value && typeof value === "object" ? value : {}; }
    function completed() { const value = store.get(KEYS.completed, {}); return value && typeof value === "object" ? value : {}; }
    function chapterIndex(book) {
        const modern = Number(positions()[book.id]?.chapter);
        if (Number.isInteger(modern) && modern >= 0) return Math.min(modern, book.chapters.length - 1);
        const legacy = Number(store.get(KEYS.bookmarks, {})?.[book.id]);
        return Number.isInteger(legacy) && legacy >= 0 ? Math.min(legacy, book.chapters.length - 1) : -1;
    }
    function progress(book) {
        if (completed()[book.id]) return 100;
        const precise = Number(positions()[book.id]?.progress);
        if (Number.isFinite(precise) && precise >= 0) return Math.min(99, Math.round(precise));
        const index = chapterIndex(book);
        if (index < 0 || !book.chapters?.length) return 0;
        return Math.min(99, Math.round(((index + 0.5) / book.chapters.length) * 100));
    }
    function updatedAt(book) {
        const value = positions()[book.id]?.updatedAt;
        const time = value ? Date.parse(value) : 0;
        return Number.isFinite(time) ? time : 0;
    }
    function latestBook() {
        const active = state.borrowed.map(getBook).filter(Boolean);
        const recent = [...active].sort((a, b) => updatedAt(b) - updatedAt(a))[0];
        if (recent && updatedAt(recent) > 0) return recent;
        const saved = getBook(store.get(KEYS.lastRead, ""));
        return saved && isBorrowed(saved.id) ? saved : active.at(-1) || null;
    }
    function overallProgress() {
        const active = state.borrowed.map(getBook).filter(Boolean);
        return active.length ? Math.round(active.reduce((sum, book) => sum + progress(book), 0) / active.length) : 0;
    }
    function formatDate(value) {
        const date = value ? new Date(value) : null;
        return date && !Number.isNaN(date.valueOf()) ? new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(date) : "Belum dibuka";
    }
    function minutes(book) { return Number.parseInt(book.time, 10) || 0; }
    function chapterMinutes(chapter) { const holder = document.createElement("div"); holder.innerHTML = chapter?.content || ""; return Math.max(1, Math.ceil(holder.textContent.trim().split(/\s+/).filter(Boolean).length / 200)); }
    function mastery(book) { return book.chapters.filter((_, index) => store.get(`library_understood_${book.id}_${index}`, false) || (book.chapters[index].quiz && store.get(`library_quiz_${book.id}_${index}`, null) === book.chapters[index].quiz.correct)).length; }
    function bookNotes(book) { return book.chapters.reduce((total, _, index) => total + (store.get(`library_notes_${book.id}_${index}`, "").trim() ? 1 : 0), 0); }
    function bookHighlights(book) { return book.chapters.reduce((total, _, index) => total + store.get(`library_highlights_${book.id}_${index}`, []).length, 0); }
    function remainingTime(book) { const index = Math.max(0, chapterIndex(book)); return book.chapters.slice(index).reduce((total, chapter) => total + chapterMinutes(chapter), 0); }
    function play(name) { if (typeof window.playSound === "function") window.playSound(name); }
    function toast(message) {
        if (!el.toast) return;
        el.toast.textContent = message;
        el.toast.classList.add("show");
        clearTimeout(toast.timer);
        toast.timer = setTimeout(() => el.toast.classList.remove("show"), 2400);
    }

    function renderCategories() {
        const categories = [...new Map(books.map((book) => [book.category, book.categoryLabel])).entries()];
        el.libraryCategoryStrip.innerHTML = `<button class="category-chip" type="button" data-library-filter="all" aria-pressed="true">Semua bidang <span>${books.length}</span></button>${categories.map(([id, label]) => {
            const count = books.filter((book) => book.category === id).length;
            return `<button class="category-chip" type="button" data-library-filter="${escapeHtml(id)}" aria-pressed="false">${escapeHtml(label)} <span>${count}</span></button>`;
        }).join("")}`;
    }

    function renderContinue() {
        const book = latestBook();
        if (!book) {
            el.continueReadingCard.classList.add("is-empty");
            el.continueReadingLabel.textContent = "Koleksi pilihan";
            el.continueReadingTitle.textContent = "Pilih bacaan pertama kamu";
            el.continueReadingMeta.textContent = "Simpan buku dari katalog untuk membangun Meja Baca pribadi.";
            el.continueReadingButton.href = "#katalog";
            el.continueReadingButton.removeAttribute("data-action");
            el.continueReadingButton.removeAttribute("data-book-id");
            el.continueReadingButton.innerHTML = '<i class="fa-solid fa-arrow-right" aria-hidden="true"></i> Temukan bacaan';
            el.continueReadingProgress.hidden = true;
            el.continueReadingCover.className = "continue-cover is-empty";
            el.continueReadingCover.innerHTML = '<i class="fa-solid fa-book-open" aria-hidden="true"></i>';
            el.continueReadingCover.style.removeProperty("background");
            return;
        }
        const value = progress(book);
        el.continueReadingCard.classList.remove("is-empty");
        el.continueReadingLabel.textContent = `${book.code} · ${book.categoryLabel}`;
        el.continueReadingTitle.textContent = book.title;
        el.continueReadingMeta.textContent = `${book.author} · ${book.level} · terakhir ${formatDate(positions()[book.id]?.updatedAt)}`;
        el.continueReadingButton.href = `reader.html?book=${encodeURIComponent(book.id)}`;
        el.continueReadingButton.dataset.action = "read";
        el.continueReadingButton.dataset.bookId = book.id;
        el.continueReadingButton.innerHTML = `<i class="fa-solid ${value === 100 ? "fa-rotate-right" : "fa-play"}" aria-hidden="true"></i> ${value === 100 ? "Baca ulang" : "Lanjut membaca"}`;
        el.continueReadingProgress.hidden = false;
        el.continueReadingProgressValue.textContent = `${value}%`;
        el.continueReadingProgressFill.style.width = `${value}%`;
        el.continueReadingCover.className = "continue-cover";
        el.continueReadingCover.innerHTML = `<span>${escapeHtml(book.code)}</span><i class="fa-solid fa-book-open" aria-hidden="true"></i>`;
        el.continueReadingCover.style.background = book.coverGradient;
    }

    function interestCategories() {
        const weights = new Map();
        [...state.favorites, ...state.borrowed].forEach((id) => { const book = getBook(id); if (book) weights.set(book.category, (weights.get(book.category) || 0) + 1); });
        return [...weights].sort((a, b) => b[1] - a[1]).map(([category]) => category);
    }
    function recommendationScore(book) {
        let score = book.rating * 10 + (book.featured ? 8 : 0) + (isFavorite(book.id) ? 9 : 0);
        const interests = interestCategories();
        if (interests.includes(book.category)) score += 14 - interests.indexOf(book.category) * 2;
        if (isBorrowed(book.id)) score -= progress(book) === 100 ? 8 : 3;
        if (isBorrowed(book.id) && progress(book) > 0 && progress(book) < 100) score += 18;
        if (mastery(book)) score += Math.min(10, mastery(book) * 2);
        return score;
    }
    function curatedCard(book, reason) {
        return `<article class="curated-card">
            <button class="curated-cover" type="button" data-action="detail" data-book-id="${escapeHtml(book.id)}" style="background:${book.coverGradient}" aria-label="Lihat detail ${escapeHtml(book.title)}"><span>${escapeHtml(book.code)}</span><strong>${escapeHtml(book.title)}</strong></button>
            <div><span class="curated-reason">${escapeHtml(reason)}</span><button class="curated-title" type="button" data-action="detail" data-book-id="${escapeHtml(book.id)}">${escapeHtml(book.title)}</button><p>${escapeHtml(book.level)} · ${escapeHtml(book.time)} · ★ ${escapeHtml(book.rating)}</p></div>
        </article>`;
    }
    function renderCurated() {
        const recommended = [...books].sort((a, b) => recommendationScore(b) - recommendationScore(a));
        const shift = state.recommendationSeed % Math.max(1, recommended.length - 4);
        const forYou = recommended.slice(shift, shift + 4);
        const popular = [...books].sort((a, b) => b.rating - a.rating || b.pages - a.pages).slice(0, 4);
        const topics = [...new Map(books.map((book) => [book.category, book])).values()];
        const topicStart = (state.recommendationSeed * 4) % topics.length;
        const topicBooks = [...topics.slice(topicStart), ...topics.slice(0, topicStart)].slice(0, 4);
        const shelves = [
            ["Untukmu", "Berdasarkan aktivitas lokal", forYou, (book) => isFavorite(book.id) ? "Tersimpan di favorit" : interestCategories().includes(book.category) ? "Sesuai minatmu" : "Pilihan editor"],
            ["Paling diapresiasi", "Rating tertinggi di koleksi", popular, () => "Rating pembaca tinggi"],
            ["Jelajahi topik", "Temukan bidang yang berbeda", topicBooks, (book) => book.categoryLabel]
        ];
        el.curatedShelves.innerHTML = shelves.map(([title, subtitle, shelfBooks, reason]) => `<section class="curated-shelf"><div class="curated-shelf-head"><div><h3>${title}</h3><p>${subtitle}</p></div><a href="#katalog">Lihat katalog <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a></div><div class="curated-track">${shelfBooks.map((book) => curatedCard(book, reason(book))).join("")}</div></section>`).join("");
    }

    function matchesDuration(book) {
        const value = minutes(book);
        return state.duration === "all" || (state.duration === "short" && value <= 20) || (state.duration === "medium" && value >= 21 && value <= 25) || (state.duration === "long" && value > 25);
    }
    function filteredBooks() {
        const query = state.query.toLocaleLowerCase("id");
        const result = books.filter((book) => {
            const status = state.status === "all" || (state.status === "borrowed" && isBorrowed(book.id) && progress(book) < 100) || (state.status === "completed" && progress(book) === 100) || (state.status === "favorites" && isFavorite(book.id));
            const category = state.category === "all" || book.category === state.category;
            const level = state.level === "all" || book.level === state.level;
            const haystack = [book.title, book.author, book.code, book.categoryLabel, book.synopsis, ...(book.tags || []), ...(book.sources || []).flatMap((source) => [source.name, source.url])].join(" ").toLocaleLowerCase("id");
            return status && category && level && matchesDuration(book) && (!query || haystack.includes(query));
        });
        return result.sort((a, b) => {
            if (state.sort === "rating") return b.rating - a.rating;
            if (state.sort === "newest") return b.publishedAt.localeCompare(a.publishedAt);
            if (state.sort === "title") return a.title.localeCompare(b.title, "id");
            if (state.sort === "duration") return minutes(a) - minutes(b);
            return recommendationScore(b) - recommendationScore(a) || a.title.localeCompare(b.title, "id");
        });
    }
    function progressMarkup(book) {
        const value = progress(book);
        return `<div class="book-progress"><div class="progress-meta"><span>${value === 100 ? "Selesai dibaca" : "Progres membaca"}</span><strong>${value}%</strong></div><div class="progress-bar-container"><div class="progress-bar-fill ${value === 100 ? "is-complete" : ""}" style="width:${value}%"></div></div></div>`;
    }
    function catalogCard(book) {
        const borrowed = isBorrowed(book.id), favorite = isFavorite(book.id), value = progress(book);
        const status = borrowed ? (value === 100 ? "Selesai" : value > 0 ? "Sedang dibaca" : "Di Meja Baca") : "Tersedia";
        let snippetMarkup = "";
        if (state.query && state.query.trim()) {
            const q = state.query.trim().toLocaleLowerCase("id");
            if (book.synopsis.toLocaleLowerCase("id").includes(q) || book.tags.some(t => t.toLocaleLowerCase("id").includes(q))) {
                snippetMarkup = `<p style="margin-top:8px; font-size:11px; color:var(--blue); background:var(--library-blue-soft); padding:6px 8px; border-radius:8px;"><strong>✨ Cocok dengan:</strong> "${escapeHtml(state.query)}"</p>`;
            }
        }
        return `<article class="resource-card ${borrowed ? "is-borrowed" : ""} ${favorite ? "is-favorite" : ""}" data-book-id="${escapeHtml(book.id)}">
            <button class="book-cover" type="button" data-action="detail" data-book-id="${escapeHtml(book.id)}" style="background:${book.coverGradient}" aria-label="Lihat detail ${escapeHtml(book.title)}">
                <span class="book-cover-code">${escapeHtml(book.code)}</span><span class="favorite-visual" aria-hidden="true"><i class="fa-${favorite ? "solid" : "regular"} fa-heart"></i></span><strong class="book-cover-title">${escapeHtml(book.title)}</strong><span class="book-cover-footer"><span>${escapeHtml(book.categoryLabel)}</span><span>${escapeHtml(book.time)}</span></span>
            </button>
            <div class="resource-card-topline"><span class="category-badge">${escapeHtml(book.categoryLabel)}</span><span class="availability-badge ${borrowed ? "is-active" : ""}"><span aria-hidden="true"></span>${status}</span></div>
            <div class="resource-card-body"><button class="resource-title-button" type="button" data-action="detail" data-book-id="${escapeHtml(book.id)}"><h3>${escapeHtml(book.title)}</h3></button><p class="book-author">${escapeHtml(book.author)}</p><div class="book-facts"><span><i class="fa-solid fa-signal" aria-hidden="true"></i> ${escapeHtml(book.level)}</span><span><i class="fa-solid fa-star" aria-hidden="true"></i> ${escapeHtml(book.rating)}</span><span><i class="fa-regular fa-file-lines" aria-hidden="true"></i> ${escapeHtml(book.pages)} hlm</span></div>${snippetMarkup}${borrowed ? progressMarkup(book) : ""}</div>
            <div class="resource-card-actions"><button class="btn btn-ghost favorite-action ${favorite ? "is-active" : ""}" data-action="favorite" data-book-id="${escapeHtml(book.id)}" type="button" aria-pressed="${favorite}" aria-label="${favorite ? "Hapus dari favorit" : "Tambahkan ke favorit"}"><i class="fa-${favorite ? "solid" : "regular"} fa-heart" aria-hidden="true"></i></button>${borrowed ? `<button class="btn btn-blue" data-action="read" data-book-id="${escapeHtml(book.id)}" type="button"><i class="fa-solid fa-book-open" aria-hidden="true"></i> ${value ? "Lanjutkan" : "Baca"}</button>` : `<button class="btn btn-primary" data-action="borrow" data-book-id="${escapeHtml(book.id)}" type="button"><i class="fa-solid fa-plus" aria-hidden="true"></i> Simpan</button>`}</div>
        </article>`;
    }
    function renderCatalog() {
        const result = filteredBooks();
        el.resourceGrid.classList.toggle("is-list-view", state.view === "list");
        el.libraryResultCount.textContent = `${result.length} koleksi`;
        el.resourceGrid.setAttribute("aria-busy", "true");
        el.resourceGrid.innerHTML = result.length ? result.map(catalogCard).join("") : `<div class="empty-state catalog-empty" style="grid-column: 1 / -1; padding: 48px 24px; text-align: center; background: var(--library-panel); border-radius: 24px; border: 1px dashed var(--library-line); display: grid; gap: 14px; justify-items: center;">
            <span class="empty-state-icon" style="display: grid; width: 56px; height: 56px; place-items: center; border-radius: 16px; background: var(--library-blue-soft); color: var(--blue); font-size: 24px;"><i class="fa-solid fa-magnifying-glass-chart" aria-hidden="true"></i></span>
            <div>
                <strong style="font-size: 17px; color: var(--library-ink); display: block; margin-bottom: 4px;">Tidak ada koleksi yang cocok</strong>
                <span style="font-size: 13px; color: var(--library-muted); max-width: 420px; display: block;">Kami tidak menemukan buku untuk filter saat ini. Coba perluas pencarian atau tanyakan rekomendasi ke AI pemandu lokal.</span>
            </div>
            <div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; margin-top: 6px;">
                <button class="btn btn-primary" type="button" data-action="reset-filters"><i class="fa-solid fa-rotate-left"></i> Reset semua filter</button>
                <a class="btn btn-ghost" href="#workspace"><i class="fa-solid fa-robot"></i> Tanya BUBUB AI</a>
            </div>
        </div>`;
        el.resourceGrid.setAttribute("aria-busy", "false");
        renderActiveFilters();
    }

    function renderActiveFilters() {
        const labels = [];
        if (state.query) labels.push(["query", `Pencarian: ${state.query}`]);
        if (state.status !== "all") labels.push(["status", state.status === "borrowed" ? "Sedang dibaca" : state.status === "completed" ? "Selesai" : "Favorit"]);
        if (state.category !== "all") labels.push(["category", getBook(filteredBooks()[0]?.id)?.categoryLabel || books.find((book) => book.category === state.category)?.categoryLabel || state.category]);
        if (state.level !== "all") labels.push(["level", state.level]);
        if (state.duration !== "all") labels.push(["duration", state.duration === "short" ? "≤ 20 menit" : state.duration === "medium" ? "21–25 menit" : "> 25 menit"]);
        el.activeFilterRow.innerHTML = labels.length ? `<span>Filter aktif:</span>${labels.map(([key, label]) => `<button type="button" data-remove-filter="${key}">${escapeHtml(label)} <i class="fa-solid fa-xmark" aria-hidden="true"></i></button>`).join("")}<button class="reset-filter-link" type="button" data-action="reset-filters">Reset semua</button>` : "";
    }

    function renderDesk() {
        const borrowed = state.borrowed.map(getBook).filter(Boolean).sort((a, b) => {
            if (state.deskSort === "progress") return progress(b) - progress(a) || updatedAt(b) - updatedAt(a);
            if (state.deskSort === "title") return a.title.localeCompare(b.title, "id");
            return (progress(a) === 100) - (progress(b) === 100) || updatedAt(b) - updatedAt(a);
        });
        updateNoteOptions();
        if (!borrowed.length) {
            el.readingDeskList.innerHTML = `<div class="empty-state desk-empty"><span class="empty-state-icon"><i class="fa-solid fa-book-open" aria-hidden="true"></i></span><div><strong>Meja Baca masih kosong</strong><span>Pilih buku dari katalog untuk memulai perjalanan membaca.</span></div><a class="btn btn-blue" href="#katalog">Buka katalog</a></div>`;
            return;
        }
        const groups = [["Sedang dibaca", borrowed.filter((book) => progress(book) < 100)], ["Selesai", borrowed.filter((book) => progress(book) === 100)]];
        el.readingDeskList.innerHTML = groups.filter(([, items]) => items.length).map(([label, items]) => `<section class="desk-group"><div class="desk-group-title"><h3>${label}</h3><span>${items.length} buku</span></div>${items.map((book) => { const current = Math.max(0, chapterIndex(book)); return `<article class="desk-book-card ${progress(book) === 100 ? "is-complete" : ""}"><button class="desk-book-main" type="button" data-action="detail" data-book-id="${escapeHtml(book.id)}"><span class="mini-cover" style="background:${book.coverGradient}">${escapeHtml(book.code)}</span><span class="desk-book-meta"><span class="mini-label">${escapeHtml(book.categoryLabel)} · Bab ${current + 1} dari ${book.chapters.length}</span><strong>${escapeHtml(book.title)}</strong><span>${progress(book) === 100 ? "Selesai dipelajari" : `Sekitar ${remainingTime(book)} menit tersisa`} · terakhir ${formatDate(positions()[book.id]?.updatedAt)}</span><span class="desk-learning-meta"><b>${mastery(book)}/${book.chapters.length} dikuasai</b><b>${bookNotes(book)} catatan</b><b>${bookHighlights(book)} stabilo</b></span></span></button><div class="desk-book-actions"><button class="btn btn-blue" data-action="read" data-book-id="${escapeHtml(book.id)}" type="button"><i class="fa-solid fa-book-open" aria-hidden="true"></i><span>${progress(book) === 100 ? "Baca ulang" : "Lanjutkan"}</span></button><button class="btn btn-ghost" data-action="return" data-book-id="${escapeHtml(book.id)}" type="button" aria-label="Hapus ${escapeHtml(book.title)} dari Meja Baca"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button></div>${progressMarkup(book)}</article>`; }).join("")}</section>`).join("");
    }

    function noteCount() {
        const keys = store.keys();
        const general = store.text("library_note_general").trim() || store.text("library_note").trim() ? 1 : 0;
        const workspaceNotes = keys.filter((key) => /^library_note_(?!general$)/.test(key) && store.text(key).trim()).length;
        const readerNotes = keys.filter((key) => /^library_notes_/.test(key) && store.text(key).trim()).length;
        return general + workspaceNotes + readerNotes;
    }
    function learningEntries() {
        return books.flatMap((book) => book.chapters.flatMap((chapter, index) => {
            const note = store.get(`library_notes_${book.id}_${index}`, "").trim();
            const highlightIndexes = store.get(`library_highlights_${book.id}_${index}`, []);
            const holder = document.createElement("div"); holder.innerHTML = chapter.content;
            const paragraphs = [...holder.querySelectorAll("p")];
            const highlights = highlightIndexes.map((paragraphIndex) => paragraphs[paragraphIndex]?.textContent?.trim()).filter(Boolean);
            const mastered = store.get(`library_understood_${book.id}_${index}`, false) || (chapter.quiz && store.get(`library_quiz_${book.id}_${index}`, null) === chapter.quiz.correct);
            return note || highlights.length || mastered ? [{ book, chapter, index, note, highlights, mastered }] : [];
        }));
    }
    function renderLearningHub() {
        if (!el.learningHubSummary) return;
        const entries = learningEntries();
        const notes = entries.filter((item) => item.note).length;
        const highlights = entries.reduce((sum, item) => sum + item.highlights.length, 0);
        const mastered = entries.filter((item) => item.mastered).length;
        const recent = entries.slice(-6).reverse();
        const reviews = store.get("library_review_queue", []).filter((item) => !item.done).sort((a, b) => Date.parse(a.dueAt) - Date.parse(b.dueAt)).slice(0, 5);
        const reviewMarkup = reviews.length ? `<section class="review-queue"><div class="review-queue-head"><div><span class="section-kicker">Ulangi nanti</span><h3>${reviews.length} materi menunggumu</h3></div><i class="fa-solid fa-clock-rotate-left"></i></div><div class="review-queue-list">${reviews.map((item) => { const reviewBook = getBook(item.bookId); if (!reviewBook) return ""; const due = Date.parse(item.dueAt) <= Date.now() ? "Saatnya diulang" : `Terjadwal ${formatDate(item.dueAt)}`; return `<article><a href="reader.html?book=${encodeURIComponent(item.bookId)}&chapter=${item.chapter}${Number.isInteger(item.paragraph) ? `&paragraph=${item.paragraph}` : ""}"><span>${escapeHtml(reviewBook.code)} · Bab ${item.chapter + 1}</span><strong>${escapeHtml(item.text.slice(0, 100))}</strong><small>${due}</small></a><button type="button" data-action="complete-review" data-review-id="${escapeHtml(item.id)}" aria-label="Tandai review selesai"><i class="fa-solid fa-check"></i></button></article>`; }).join("")}</div></section>` : "";
        el.learningHubSummary.innerHTML = `${reviewMarkup}<div class="learning-hub-stats"><span><i class="fa-solid fa-circle-check"></i><b>${mastered}</b> bab dikuasai</span><span><i class="fa-solid fa-note-sticky"></i><b>${notes}</b> catatan bab</span><span><i class="fa-solid fa-highlighter"></i><b>${highlights}</b> stabilo</span></div><div class="learning-hub-list">${recent.length ? recent.map((item) => `<a href="reader.html?book=${encodeURIComponent(item.book.id)}&chapter=${item.index}"><span>${escapeHtml(item.book.code)} · Bab ${item.index + 1}</span><strong>${escapeHtml(item.chapter.title.replace(/^Bab\s+\d+\s*:\s*/i, ""))}</strong><small>${item.note ? escapeHtml(item.note.slice(0, 105)) : item.highlights[0] ? `“${escapeHtml(item.highlights[0].slice(0, 105))}”` : "Bab sudah dikuasai"}</small></a>`).join("") : `<div class="learning-hub-empty"><i class="fa-solid fa-seedling"></i><strong>Belum ada jejak belajar</strong><p>Mulai membaca, beri stabilo, atau selesaikan kuis untuk membangun pusat belajarmu.</p></div>`}</div>`;
    }
    function renderWeeklyDashboard() {
        if (!el.weeklyDashboard) return;
        const now = new Date(); const start = new Date(now); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - 6);
        const activity = store.get("library_read_activity", []).filter((item) => new Date(`${item.day}T00:00:00`) >= start);
        const activeDays = new Set(activity.map((item) => item.day)).size;
        const minutesRead = activity.reduce((sum, item) => sum + Number(item.minutes || 0), 0);
        const activeBooks = new Set(activity.map((item) => item.bookId)).size;
        const totalMastery = books.reduce((sum, book) => sum + mastery(book), 0);
        const next = latestBook();
        el.weeklyDashboard.innerHTML = `<div class="weekly-heading"><div><span class="section-kicker">7 hari terakhir</span><h2>Perkembangan belajarmu</h2></div><span class="weekly-streak"><i class="fa-solid fa-fire"></i> ${activeDays} hari aktif</span></div><div class="weekly-metrics"><article><span>Waktu membaca</span><strong>${minutesRead}<small> menit</small></strong></article><article><span>Buku aktif</span><strong>${activeBooks}</strong></article><article><span>Bab dikuasai</span><strong>${totalMastery}</strong></article><article class="weekly-next"><span>Langkah berikutnya</span><strong>${next ? escapeHtml(next.title) : "Pilih bacaan pertama"}</strong><a href="${next ? `reader.html?book=${encodeURIComponent(next.id)}` : "#katalog"}">${next ? `Lanjut Bab ${Math.max(0, chapterIndex(next)) + 1}` : "Buka katalog"} <i class="fa-solid fa-arrow-right"></i></a></article></div>`;
    }
    function updateStats() {
        el.statTotalBooks.textContent = String(books.length);
        el.statDeskBooks.textContent = String(state.borrowed.length);
        el.statNotesCount.textContent = String(noteCount());
        el.statReadingProgress.textContent = `${overallProgress()}%`;
        el.libraryFavoritesCount.textContent = String(state.favorites.length);
    }

    function sourceMarkup(book) {
        const sources = Array.isArray(book.sources) ? book.sources.filter((source) => source?.name && source?.url) : [];
        if (!sources.length) return "";
        return `<section class="detail-sources"><div class="detail-section-heading"><div><span class="section-kicker">Referensi terverifikasi</span><h3>Sumber utama</h3></div><span class="source-count">${sources.length} sumber</span></div><div class="source-link-list">${sources.map((source) => {
            let hostname = source.url;
            try { hostname = new URL(source.url).hostname.replace(/^www\./, ""); } catch { /* keep readable URL */ }
            return `<a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer"><span class="source-link-icon"><i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i></span><span><strong>${escapeHtml(source.name)}</strong><small>${escapeHtml(hostname)}</small></span></a>`;
        }).join("")}</div><p class="source-note"><i class="fa-solid fa-circle-info" aria-hidden="true"></i> Materi diringkas untuk pembelajaran. Buka sumber resmi untuk konteks dan pembaruan terbaru.</p></section>`;
    }
    function detailMarkup(book) {
        const value = progress(book), borrowed = isBorrowed(book.id), favorite = isFavorite(book.id);
        return `<div class="book-detail-hero"><div class="detail-cover" style="background:${book.coverGradient}"><span>${escapeHtml(book.code)}</span><strong>${escapeHtml(book.title)}</strong><small>${escapeHtml(book.categoryLabel)}</small></div><div class="detail-heading"><span class="detail-eyebrow">${escapeHtml(book.categoryLabel)} · ${escapeHtml(book.level)}</span><h2 id="bookDetailTitle">${escapeHtml(book.title)}</h2><p>${escapeHtml(book.author)}</p><div class="detail-facts"><span><i class="fa-solid fa-star" aria-hidden="true"></i> ${escapeHtml(book.rating)}</span><span><i class="fa-regular fa-clock" aria-hidden="true"></i> ${escapeHtml(book.time)}</span><span><i class="fa-regular fa-file-lines" aria-hidden="true"></i> ${escapeHtml(book.pages)} halaman</span><span><i class="fa-solid fa-layer-group" aria-hidden="true"></i> ${book.chapters.length} bab</span></div></div></div>
            <div class="detail-body"><section><h3>Tentang buku</h3><p id="bookDetailSynopsis">${escapeHtml(book.synopsis)}</p><div class="detail-tags">${book.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div></section><section><h3>Setelah membaca, kamu mampu</h3><ul class="detail-outcomes">${book.learningOutcomes.map((item) => `<li><i class="fa-solid fa-check" aria-hidden="true"></i><span>${escapeHtml(item)}</span></li>`).join("")}</ul></section>${sourceMarkup(book)}<section><h3>Perjalanan belajar</h3><div class="detail-learning-summary"><span><b>${value}%</b> progres</span><span><b>${mastery(book)}/${book.chapters.length}</b> dikuasai</span><span><b>${bookNotes(book)}</b> catatan</span><span><b>${bookHighlights(book)}</b> stabilo</span></div><ol class="detail-chapters">${book.chapters.map((chapter, index) => { const mastered = store.get(`library_understood_${book.id}_${index}`, false) || (chapter.quiz && store.get(`library_quiz_${book.id}_${index}`, null) === chapter.quiz.correct); return `<li class="${mastered ? "is-mastered" : index < chapterIndex(book) ? "is-read" : ""}"><span>${mastered ? "✓" : String(index + 1).padStart(2, "0")}</span><strong>${escapeHtml(chapter.title.replace(/^Bab\s+\d+\s*:\s*/i, ""))}</strong></li>`; }).join("")}</ol></section></div>
            <footer class="detail-actions"><button class="btn btn-ghost" type="button" data-action="favorite" data-book-id="${escapeHtml(book.id)}" aria-pressed="${favorite}"><i class="fa-${favorite ? "solid" : "regular"} fa-heart" aria-hidden="true"></i> ${favorite ? "Tersimpan" : "Simpan"}</button>${borrowed ? `<button class="btn btn-primary" type="button" data-action="read" data-book-id="${escapeHtml(book.id)}"><i class="fa-solid fa-book-open" aria-hidden="true"></i> ${value === 100 ? "Baca ulang" : value ? `Lanjutkan · ${value}%` : "Mulai membaca"}</button><button class="btn btn-ghost danger" type="button" data-action="return" data-book-id="${escapeHtml(book.id)}">Hapus dari Meja Baca</button>` : `<button class="btn btn-primary" type="button" data-action="borrow" data-book-id="${escapeHtml(book.id)}"><i class="fa-solid fa-plus" aria-hidden="true"></i> Simpan ke Meja Baca</button>`}</footer>`;
    }
    function openDetail(bookId, trigger) {
        const book = getBook(bookId); if (!book) return;
        returnFocus = trigger || document.activeElement;
        state.detailBookId = book.id;
        el.bookDetailContent.innerHTML = detailMarkup(book);
        el.bookDetailDrawer.hidden = false; el.bookDetailBackdrop.hidden = false;
        document.body.classList.add("detail-open");
        requestAnimationFrame(() => { el.bookDetailDrawer.classList.add("is-open"); el.bookDetailBackdrop.classList.add("is-open"); el.bookDetailClose.focus(); });
    }
    function closeDetail() {
        if (el.bookDetailDrawer.hidden) return;
        el.bookDetailDrawer.classList.remove("is-open"); el.bookDetailBackdrop.classList.remove("is-open");
        document.body.classList.remove("detail-open"); state.detailBookId = null;
        setTimeout(() => { el.bookDetailDrawer.hidden = true; el.bookDetailBackdrop.hidden = true; returnFocus?.focus?.(); }, 220);
    }
    function trapFocus(event) {
        if (event.key === "Escape") return closeDetail();
        if (event.key !== "Tab" || el.bookDetailDrawer.hidden) return;
        const focusable = [...el.bookDetailDrawer.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])')];
        if (!focusable.length) return;
        const first = focusable[0], last = focusable.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }

    function borrow(bookId) {
        if (!validIds.has(bookId) || isBorrowed(bookId)) return;
        state.borrowed.push(bookId); store.set(KEYS.borrowed, state.borrowed); store.set(KEYS.lastRead, bookId);
        toast("Buku ditambahkan ke Meja Baca."); play("success"); refresh(); refreshDetail();
    }
    function returnBook(bookId) {
        if (!isBorrowed(bookId)) return;
        state.borrowed = state.borrowed.filter((id) => id !== bookId); store.set(KEYS.borrowed, state.borrowed);
        if (store.get(KEYS.lastRead, "") === bookId) store.remove(KEYS.lastRead);
        toast("Buku dihapus dari Meja Baca. Progres tetap tersimpan."); play("click"); refresh(); refreshDetail();
    }
    function favorite(bookId) {
        if (!validIds.has(bookId)) return;
        state.favorites = isFavorite(bookId) ? state.favorites.filter((id) => id !== bookId) : [...state.favorites, bookId];
        store.set(KEYS.favorites, state.favorites); toast(isFavorite(bookId) ? "Buku disimpan ke favorit." : "Buku dihapus dari favorit."); play("click"); refresh(); refreshDetail();
    }
    function read(bookId) { if (!validIds.has(bookId)) return; store.set(KEYS.lastRead, bookId); location.href = `reader.html?book=${encodeURIComponent(bookId)}`; }
    function refreshDetail() { if (state.detailBookId) { const book = getBook(state.detailBookId); if (book) el.bookDetailContent.innerHTML = detailMarkup(book); } }

    function contextualRecommendations(query) {
        const words = query.toLocaleLowerCase("id").split(/\s+/).filter((word) => word.length > 2);
        const activeCategories = new Set([...state.borrowed, ...state.favorites].map(getBook).filter(Boolean).map((b) => b.category));
        return [...books].map((book) => {
            const text = [book.title, book.categoryLabel, book.synopsis, book.level, ...book.tags].join(" ").toLocaleLowerCase("id");
            const matches = words.filter((word) => text.includes(word)).length;
            let score = matches * 25 + recommendationScore(book);
            if (activeCategories.has(book.category)) score += 15;
            if (/pemula|mulai|dasar/.test(query.toLowerCase()) && book.level === "Pemula") score += 18;
            if (/lanjut|mahir|mendalam/.test(query.toLowerCase()) && book.level === "Lanjutan") score += 18;
            if (/singkat|cepat/.test(query.toLowerCase())) score += Math.max(0, 28 - minutes(book));
            return { book, score, matches };
        }).sort((a, b) => b.score - a.score).slice(0, 3);
    }
    function appendChat(sender, html, plain = false) {
        const bubble = document.createElement("div"); bubble.className = `chat-bubble ${sender}`;
        if (plain) bubble.textContent = html; else bubble.innerHTML = html;
        el.chatHistory.appendChild(bubble); el.chatHistory.scrollTop = el.chatHistory.scrollHeight;
    }
    function askBubub(query) {
        const clean = query.trim(); if (!clean) return;
        appendChat("user", clean, true); el.chatInput.value = "";
        const indicator = document.createElement("div"); indicator.className = "typing-indicator"; indicator.id = "typingIndicator"; indicator.setAttribute("aria-label", "BUBUB sedang menyusun rekomendasi"); indicator.innerHTML = "<span></span><span></span><span></span>"; el.chatHistory.appendChild(indicator);
        clearTimeout(chatTimer); chatTimer = setTimeout(() => {
            indicator.remove(); const picks = contextualRecommendations(clean);
            const context = state.borrowed.length ? `Saya mempertimbangkan ${state.borrowed.length} buku di Meja Baca dan minatmu.` : "Karena kamu belum memiliki riwayat baca, saya memakai topik, level, dan rating tertinggi sebagai dasar.";
            appendChat("ai", `<p><strong>Ini tiga pilihan yang paling relevan.</strong> ${escapeHtml(context)}</p><div class="bubub-recommendations">${picks.map(({ book, matches }) => {
                const borrowed = isBorrowed(book.id), favorite = isFavorite(book.id);
                return `<div class="ai-book-card" style="display:grid; gap:8px; padding:12px; border:1px solid var(--library-line); border-radius:14px; background:var(--library-panel); text-align:left;">
                    <div style="display:flex; justify-content:space-between; align-items:center; font-size:10px;"><span style="color:var(--blue); font-weight:800;">${escapeHtml(book.code)} · ${escapeHtml(book.level)}</span><span style="color:var(--library-muted);">${escapeHtml(book.time)}</span></div>
                    <strong style="font-size:14px; color:var(--library-ink);">${escapeHtml(book.title)}</strong>
                    <small style="color:var(--library-muted); font-size:11px;">${matches ? "✨ Cocok dengan kata kunci pertanyaanmu" : favorite ? "💖 Sesuai favoritmu" : `★ ${book.rating} · Rekomendasi teratas`}</small>
                    <div style="display:flex; gap:6px; margin-top:4px;">
                        <button class="btn btn-ghost" type="button" data-action="detail" data-book-id="${escapeHtml(book.id)}" style="flex:1; padding:6px; font-size:10px;">Detail</button>
                        ${borrowed ? `<button class="btn btn-blue" type="button" data-action="read" data-book-id="${escapeHtml(book.id)}" style="flex:1; padding:6px; font-size:10px;"><i class="fa-solid fa-book-open"></i> Lanjut</button>` : `<button class="btn btn-primary" type="button" data-action="borrow" data-book-id="${escapeHtml(book.id)}" style="flex:1; padding:6px; font-size:10px;"><i class="fa-solid fa-plus"></i> Simpan</button>`}
                    </div>
                </div>`;
            }).join("")}</div><p class="bubub-disclaimer">Rekomendasi dibuat lokal dari metadata katalog dan aktivitas di perangkat ini.</p>`);
            play("cyber");
        }, 520);
    }
    function initChat() {
        const borrowedCount = state.borrowed.length;
        const firstBorrowed = borrowedCount ? getBook(state.borrowed[0]) : null;
        const greeting = borrowedCount
            ? `<p>Halo! Saya <strong>BUBUB</strong>. Saya melihat kamu sedang mempelajari <strong>${borrowedCount} buku</strong> di Meja Baca (termasuk <em>${escapeHtml(firstBorrowed?.title || "buku pilihanmu")}</em>). Topik atau skill apa yang ingin kamu perdalam hari ini?</p>`
            : `<p>Halo, saya <strong>BUBUB</strong>. Ceritakan topik, level, atau waktu yang kamu punya—saya akan memilih buku dari katalog dan menjelaskan alasannya.</p>`;
        appendChat("ai", greeting);
        el.chatForm.addEventListener("submit", (event) => { event.preventDefault(); askBubub(el.chatInput.value); });
        const suggestionsBox = document.querySelector(".chat-suggestions");
        if (suggestionsBox && firstBorrowed) {
            suggestionsBox.innerHTML = `
                <button class="chat-suggest-chip" type="button" data-query="Rekomendasikan lanjutan atau referensi terkait ${escapeHtml(firstBorrowed.categoryLabel)}"><i class="fa-solid fa-sparkles" aria-hidden="true"></i> Lanjutan ${escapeHtml(firstBorrowed.categoryLabel)}</button>
                <button class="chat-suggest-chip" type="button" data-query="Rekomendasikan buku dengan durasi singkat di bawah 20 menit"><i class="fa-solid fa-bolt" aria-hidden="true"></i> Bacaan cepat (≤ 20 mnt)</button>
                <button class="chat-suggest-chip" type="button" data-query="Rekomendasikan buku pemrograman dasar dan coding"><i class="fa-solid fa-code" aria-hidden="true"></i> Rekomendasi coding</button>
            `;
        }
        document.querySelectorAll(".chat-suggest-chip").forEach((button) => button.addEventListener("click", () => askBubub(button.dataset.query || "")));
    }

    function noteKey(id) { if (id === "general") return "library_note_general"; if (id.startsWith("chapter:")) { const [, bookId, chapter] = id.split(":"); return `library_notes_${bookId}_${chapter}`; } return `library_note_${id}`; }
    function updateNoteOptions() {
        const previous = el.noteBookSelect.value;
        el.noteBookSelect.innerHTML = `<option value="general">Catatan umum</option>${state.borrowed.map(getBook).filter(Boolean).map((book) => `<optgroup label="${escapeHtml(book.code)} · ${escapeHtml(book.title)}"><option value="${escapeHtml(book.id)}">Ringkasan buku</option>${book.chapters.map((chapter, index) => `<option value="chapter:${escapeHtml(book.id)}:${index}">Bab ${index + 1} · ${escapeHtml(chapter.title.replace(/^Bab\s+\d+\s*:\s*/i, ""))}</option>`).join("")}</optgroup>`).join("")}`;
        el.noteBookSelect.value = [...el.noteBookSelect.options].some((option) => option.value === previous) ? previous : "general";
    }
    function loadNote() { const key = noteKey(el.noteBookSelect.value); el.libraryNote.value = store.get(key, el.noteBookSelect.value === "general" ? store.get("library_note", "") : ""); updateNoteCounter(); }
    function updateNoteCounter() { el.noteCharCount.textContent = `${el.libraryNote.value.length.toLocaleString("id-ID")} karakter`; }
    function saveNote(notify = false) {
        const key = noteKey(el.noteBookSelect.value); store.set(key, el.libraryNote.value); if (el.noteBookSelect.value === "general") store.set("library_note", el.libraryNote.value);
        el.autosaveStatus.innerHTML = '<i class="fa-solid fa-circle-check" aria-hidden="true"></i> Tersimpan lokal'; updateStats(); renderLearningHub(); if (notify) toast("Catatan berhasil disimpan.");
    }
    function initNotes() {
        el.noteBookSelect.addEventListener("change", loadNote);
        el.libraryNote.addEventListener("input", () => { updateNoteCounter(); el.autosaveStatus.textContent = "Menyimpan…"; clearTimeout(noteTimer); noteTimer = setTimeout(saveNote, 600); });
        el.saveLibraryNote.addEventListener("click", () => saveNote(true));
        el.clearLibraryNote.addEventListener("click", () => { if (!el.libraryNote.value || confirm("Bersihkan catatan yang sedang dibuka?")) { el.libraryNote.value = ""; saveNote(true); updateNoteCounter(); } });
        if (el.copyLibraryNote) {
            el.copyLibraryNote.addEventListener("click", async () => {
                const text = el.libraryNote.value || "";
                if (!text.trim()) return toast("Catatan masih kosong.");
                try {
                    await navigator.clipboard.writeText(text);
                    toast("Catatan disalin ke clipboard.");
                } catch {
                    el.libraryNote.select();
                    document.execCommand("copy");
                    toast("Catatan disalin ke clipboard.");
                }
            });
        }
        if (el.exportLibraryNote) {
            el.exportLibraryNote.addEventListener("click", () => {
                const text = el.libraryNote.value || "";
                if (!text.trim()) return toast("Tidak ada catatan untuk diekspor.");
                const title = el.noteBookSelect.options[el.noteBookSelect.selectedIndex]?.text || "Catatan Belajar";
                const filename = `QUIZNATION_${title.replace(/[^a-zA-Z0-9_-]/g, "_")}_${new Date().toISOString().slice(0,10)}.md`;
                const blob = new Blob([`# ${title}\n\nDiunduh dari QUIZNATION pada ${new Date().toLocaleDateString("id-ID")}\n\n---\n\n${text}\n`], { type: "text/markdown;charset=utf-8" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                toast("Catatan diekspor (.md)");
            });
        }
        loadNote();
    }

    function resetFilters() { state.status = "all"; state.category = "all"; state.level = "all"; state.duration = "all"; state.query = ""; el.librarySearch.value = ""; el.libraryLevel.value = "all"; el.libraryDuration.value = "all"; renderCatalog(); syncControls(); }
    function removeFilter(key) { if (key === "query") { state.query = ""; el.librarySearch.value = ""; } else state[key] = "all"; if (key === "level") el.libraryLevel.value = "all"; if (key === "duration") el.libraryDuration.value = "all"; renderCatalog(); syncControls(); }
    function handleAction(event) {
        const target = event.target.closest("[data-action]"); if (!target) return;
        const { action, bookId } = target.dataset;
        if (["detail", "favorite", "borrow", "return", "read", "reset-filters", "complete-review"].includes(action)) event.preventDefault();
        if (action === "detail") openDetail(bookId, target); else if (action === "favorite") favorite(bookId); else if (action === "borrow") borrow(bookId); else if (action === "return") returnBook(bookId); else if (action === "read") read(bookId); else if (action === "reset-filters") resetFilters();
        else if (action === "complete-review") { const queue = store.get("library_review_queue", []); const item = queue.find((entry) => entry.id === target.dataset.reviewId && !entry.done); if (item) { item.done = true; item.completedAt = new Date().toISOString(); store.set("library_review_queue", queue); renderLearningHub(); toast("Materi ditandai sudah diulang."); } }
    }
    function syncControls() {
        document.querySelectorAll("[data-library-status]").forEach((button) => { const active = button.dataset.libraryStatus === state.status; button.classList.toggle("is-active", active); button.setAttribute("aria-pressed", String(active)); });
        document.querySelectorAll("[data-library-filter]").forEach((button) => { const active = button.dataset.libraryFilter === state.category; button.classList.toggle("is-active", active); button.setAttribute("aria-pressed", String(active)); });
        el.librarySort.value = state.sort; el.libraryLevel.value = state.level; el.libraryDuration.value = state.duration;
        el.libraryViewGrid.classList.toggle("is-active", state.view === "grid"); el.libraryViewList.classList.toggle("is-active", state.view === "list");
        el.libraryViewGrid.setAttribute("aria-pressed", String(state.view === "grid")); el.libraryViewList.setAttribute("aria-pressed", String(state.view === "list")); el.libraryClearSearch.hidden = !state.query;
    }
    function initControls() {
        document.addEventListener("click", handleAction);
        el.librarySearch.addEventListener("input", (event) => { state.query = event.target.value.trim(); const navSearch = document.getElementById("navSearchInput"); if (navSearch && navSearch.value !== event.target.value) navSearch.value = event.target.value; renderCatalog(); syncControls(); });
        el.libraryClearSearch.addEventListener("click", () => { state.query = ""; el.librarySearch.value = ""; renderCatalog(); syncControls(); el.librarySearch.focus(); });
        el.libraryLevel.addEventListener("change", (event) => { state.level = event.target.value; renderCatalog(); syncControls(); });
        el.libraryDuration.addEventListener("change", (event) => { state.duration = event.target.value; renderCatalog(); syncControls(); });
        el.librarySort.addEventListener("change", (event) => { state.sort = allowedSorts.includes(event.target.value) ? event.target.value : "recommended"; store.set(KEYS.sort, state.sort); renderCatalog(); });
        el.libraryViewGrid.addEventListener("click", () => { state.view = "grid"; store.set(KEYS.view, state.view); renderCatalog(); syncControls(); });
        el.libraryViewList.addEventListener("click", () => { state.view = "list"; store.set(KEYS.view, state.view); renderCatalog(); syncControls(); });
        if (el.readingDeskSort) {
            el.readingDeskSort.value = state.deskSort || "recent";
            el.readingDeskSort.addEventListener("change", (event) => {
                state.deskSort = event.target.value;
                store.set(KEYS.deskSort, state.deskSort);
                renderDesk();
            });
        }
        document.querySelectorAll("[data-library-status]").forEach((button) => button.addEventListener("click", () => { state.status = button.dataset.libraryStatus; renderCatalog(); syncControls(); }));
        el.libraryCategoryStrip.addEventListener("click", (event) => { const button = event.target.closest("[data-library-filter]"); if (!button) return; state.category = button.dataset.libraryFilter; renderCatalog(); syncControls(); });
        el.activeFilterRow.addEventListener("click", (event) => { const button = event.target.closest("[data-remove-filter]"); if (button) removeFilter(button.dataset.removeFilter); });
        el.refreshRecommendations.addEventListener("click", () => { state.recommendationSeed += 1; renderCurated(); toast("Rak pilihan diperbarui."); });
        const navSearch = document.getElementById("navSearchInput");
        if (navSearch) {
            navSearch.placeholder = "Cari seluruh koleksi…";
            navSearch.addEventListener("input", () => { state.query = navSearch.value.trim(); el.librarySearch.value = navSearch.value; renderCatalog(); syncControls(); });
            navSearch.addEventListener("keydown", (event) => {
                if (event.key !== "Enter") return;
                event.preventDefault(); state.query = navSearch.value.trim(); el.librarySearch.value = state.query; renderCatalog(); syncControls(); el.katalog.scrollIntoView({ behavior: "smooth", block: "start" });
            });
        }
        el.bookDetailClose.addEventListener("click", closeDetail); el.bookDetailBackdrop.addEventListener("click", closeDetail); el.bookDetailDrawer.addEventListener("keydown", trapFocus);
    }

    function initTheme() {
        const saved = store.text("eduquest_theme", "light"); document.body.classList.toggle("dark-theme", saved === "dark");
        const update = () => { const dark = document.body.classList.contains("dark-theme"); el.themeToggleBtn.innerHTML = `<i class="fa-solid ${dark ? "fa-sun" : "fa-moon"}" aria-hidden="true"></i>`; el.themeToggleBtn.setAttribute("aria-label", dark ? "Gunakan tema terang" : "Gunakan tema gelap"); };
        update(); el.themeToggleBtn.addEventListener("click", () => { const dark = !document.body.classList.contains("dark-theme"); document.body.classList.toggle("dark-theme", dark); try { localStorage.setItem("eduquest_theme", dark ? "dark" : "light"); } catch { /* optional */ } update(); });
    }
    function activateTab(targetId) {
        if (!targetId) return;
        const cleanId = targetId.replace("#", "");
        const targetSection = document.getElementById(cleanId);
        if (!targetSection || !targetSection.classList.contains("tab-section")) return;

        document.querySelectorAll(".tab-section").forEach((sec) => {
            sec.classList.toggle("is-tab-active", sec.id === cleanId);
        });
        document.querySelectorAll('.ux-section-nav a[href^="#"]').forEach((link) => {
            const match = link.hash === `#${cleanId}`;
            link.classList.toggle("is-active", match);
            link.setAttribute("aria-selected", match ? "true" : "false");
        });

        if (window.scrollY > 280) {
            const navEl = document.querySelector(".ux-section-nav");
            if (navEl) navEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }

    function initSectionNav() {
        const links = [...document.querySelectorAll('.ux-section-nav a[href^="#"]')];
        links.forEach((link) => {
            link.addEventListener("click", (e) => {
                e.preventDefault();
                const targetId = link.hash.replace("#", "");
                activateTab(targetId);
                try { history.pushState(null, "", `#${targetId}`); } catch { /* ignore */ }
            });
        });

        document.addEventListener("click", (e) => {
            const trigger = e.target.closest('[data-tab-target], a[href^="#"]');
            if (!trigger || trigger.closest(".ux-section-nav")) return;
            const targetId = trigger.getAttribute("data-tab-target") || trigger.getAttribute("href")?.replace("#", "");
            if (targetId && ["readingDesk", "discovery", "katalog", "workspace"].includes(targetId)) {
                activateTab(targetId);
            }
        });

        window.addEventListener("hashchange", () => {
            if (window.location.hash) activateTab(window.location.hash);
        });

        if (window.location.hash) activateTab(window.location.hash);
    }
    function cache() {
        ["toast", "themeToggleBtn", "statTotalBooks", "statDeskBooks", "statNotesCount", "statReadingProgress", "libraryFavoritesCount", "continueReadingCard", "continueReadingCover", "continueReadingLabel", "continueReadingTitle", "continueReadingMeta", "continueReadingProgress", "continueReadingProgressValue", "continueReadingProgressFill", "continueReadingButton", "weeklyDashboard", "curatedShelves", "refreshRecommendations", "readingDesk", "readingDeskSort", "readingDeskList", "katalog", "librarySearch", "libraryClearSearch", "libraryResultCount", "libraryLevel", "libraryDuration", "librarySort", "libraryViewGrid", "libraryViewList", "libraryCategoryStrip", "activeFilterRow", "resourceGrid", "learningHubSummary", "chatHistory", "chatInput", "chatForm", "libraryNote", "saveLibraryNote", "clearLibraryNote", "copyLibraryNote", "exportLibraryNote", "noteBookSelect", "noteCharCount", "autosaveStatus", "bookDetailBackdrop", "bookDetailDrawer", "bookDetailClose", "bookDetailContent"].forEach((id) => { el[id] = document.getElementById(id); });
    }
    function refresh() { renderContinue(); renderWeeklyDashboard(); renderCurated(); renderCatalog(); renderDesk(); renderLearningHub(); updateStats(); syncControls(); }
    function init() {
        cache(); if (!books.length || !el.resourceGrid) return;
        document.getElementById("discovery")?.before(el.readingDesk);
        renderCategories(); initTheme(); initControls(); initChat(); initNotes(); initSectionNav(); refresh();
        window.LibraryPage = { refresh, getState: () => ({ ...state, borrowed: [...state.borrowed], borrowedIds: [...state.borrowed], favorites: [...state.favorites] }), openBookDetail: (id) => openDetail(id) };
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true }); else init();
})();
