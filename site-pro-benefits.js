(function () {
    "use strict";
    const subscription = window.QuizNationSubscription;
    if (!subscription) return;
    const page = document.body.dataset.page;
    if (!["materi", "snbt", "bahasa"].includes(page)) return;
    const pro = subscription.isPro();

    function read(key, fallback) {
        try { return JSON.parse(localStorage.getItem(key) || "null") ?? fallback; }
        catch { return fallback; }
    }

    function escapeHtml(value) {
        return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
    }

    function showToast(message) {
        let toast = document.getElementById("siteProToast") || document.getElementById("toast");
        if (!toast) {
            toast = document.createElement("div");
            toast.id = "siteProToast";
            toast.className = "learning-toast";
            toast.setAttribute("role", "status");
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.add("show");
        clearTimeout(showToast.timer);
        showToast.timer = setTimeout(() => toast.classList.remove("show"), 2200);
    }

    function download(name, payload) {
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = name;
        link.hidden = true;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 0);
    }

    function card(icon, title, description, action, label) {
        return `<article class="site-pro-card"><i class="fa-solid ${icon}" aria-hidden="true"></i><strong>${escapeHtml(title)}</strong><p>${escapeHtml(description)}</p><button class="btn btn-ghost" type="button" data-pro-action="${action}">${escapeHtml(label)}</button></article>`;
    }

    function shell(config) {
        const section = document.createElement("section");
        section.className = `site-pro-zone ${pro ? "" : "site-pro-locked"}`;
        section.id = config.id;
        section.innerHTML = `<div class="site-pro-shell"><div class="site-pro-head"><div><span class="site-pro-kicker"><i class="fa-solid fa-crown"></i> Universe Of Tech PRO</span><h2>${escapeHtml(config.title)}</h2><p>${escapeHtml(config.description)}</p></div><span class="site-pro-badge">${pro ? "PRO AKTIF" : "PREVIEW PRO"}</span></div><div class="site-pro-grid">${config.cards.join("")}</div><div class="pro-output" id="proBenefitOutput">${escapeHtml(config.initialOutput)}</div>${pro ? "" : `<div class="site-pro-upgrade"><h3>Buka seluruh command center</h3><p>${escapeHtml(config.lockedCopy)}</p><a class="btn btn-primary" href="${subscription.planUrl("pro", config.source)}"><i class="fa-solid fa-crown"></i> Upgrade ke PRO</a></div>`}</div>`;
        const anchor = document.querySelector(config.anchor);
        if (anchor) anchor.insertAdjacentElement(config.position || "beforebegin", section);
        else document.querySelector("main")?.appendChild(section);
        return section;
    }

    function getMateriInsight() {
        const curriculum = window.QNCurriculum;
        if (!curriculum) return null;
        const progress = curriculum.readProgress();
        const ranked = curriculum.tracks.map((track) => ({ track, value: curriculum.getTrackProgress(track.id, progress) })).filter((item) => item.value.percent < 100).sort((a, b) => {
            const aStarted = a.value.completed > 0 ? 0 : 1;
            const bStarted = b.value.completed > 0 ? 0 : 1;
            return aStarted - bStarted || a.value.percent - b.value.percent;
        });
        const target = ranked[0] || { track: curriculum.tracks[0], value: curriculum.getTrackProgress(curriculum.tracks[0].id, progress) };
        const totals = curriculum.tracks.reduce((acc, track) => {
            const value = curriculum.getTrackProgress(track.id, progress);
            acc.completed += value.completed; acc.mastered += value.mastered; acc.total += value.total;
            return acc;
        }, { completed: 0, mastered: 0, total: 0 });
        const nextLesson = curriculum.flattenLessons(target.track).find((entry) => ["available", "in_progress"].includes(curriculum.getLessonState(target.track.id, entry.lesson.id, progress))) || curriculum.flattenLessons(target.track)[0];
        return { ...totals, target, nextLesson, progress };
    }

    function initMateri() {
        const insight = getMateriInsight();
        const section = shell({
            id: "materi-pro-command", source: "materi", anchor: ".quiz-cta", title: "Learning Command Center", description: "Ubah progres menjadi langkah berikutnya yang jelas—lengkap dengan Smart Route, mastery snapshot, dan backup belajar.",
            cards: [card("fa-route", "Smart Route", "Prioritas jalur dan pelajaran berikutnya berdasarkan progresmu.", "materi-route", "Buka rekomendasi"), card("fa-chart-line", "Mastery Snapshot", "Lihat ringkasan selesai, mastered, dan area yang masih perlu diperkuat.", "materi-insight", "Lihat insight"), card("fa-file-export", "Backup Progres", "Ekspor progres kurikulum agar dapat disimpan dan dipulihkan.", "materi-export", "Ekspor JSON")],
            initialOutput: insight ? `Rekomendasi awal: ${insight.target.track.title} · ${insight.target.value.percent}% selesai.` : "Command Center siap membaca progresmu.", lockedCopy: "Dapatkan Smart Route, semua jalur terbuka, analitik mastery, dan backup progres."
        });
        section.addEventListener("click", (event) => {
            const action = event.target.closest("[data-pro-action]")?.dataset.proAction;
            if (!action || !pro) return;
            const data = getMateriInsight();
            const output = section.querySelector("#proBenefitOutput");
            if (action === "materi-route") location.href = `materi-basic.html?topik=${encodeURIComponent(data.target.track.id)}&lesson=${encodeURIComponent(data.nextLesson.lesson.id)}`;
            if (action === "materi-insight") output.textContent = `${data.completed} dari ${data.total} pelajaran selesai · ${data.mastered} mastered.\nPrioritas berikutnya: ${data.target.track.title} (${data.target.value.percent}%).`;
            if (action === "materi-export") { download("uot-progres-materi.json", { format: "uot-materi-progress", exportedAt: new Date().toISOString(), data: data.progress }); showToast("Backup progres materi berhasil dibuat."); }
        });
    }

    function flattenBooleans(value) {
        if (typeof value === "boolean") return [value];
        if (!value || typeof value !== "object") return [];
        return Object.values(value).flatMap(flattenBooleans);
    }

    function getSnbtInsight() {
        const progress = read("tka_syllabus_progress", {});
        const checks = flattenBooleans(progress);
        const completed = checks.filter(Boolean).length;
        const total = Math.max(checks.length, 1);
        const prefs = read("tka_planner_prefs", {});
        const stats = read("snbt_stats", {});
        return { progress, completed, total, percent: Math.round((completed / total) * 100), prefs, stats };
    }

    function renderSprint(section) {
        const days = ["Fondasi literasi", "Penalaran matematika", "Bahasa Indonesia", "Bahasa Inggris", "Subtes pilihan", "Tryout terukur", "Review kesalahan"];
        const saved = read("uotProSnbtSprint", {});
        section.querySelector("#proBenefitOutput").innerHTML = `<strong>Sprint 7 hari</strong><div class="pro-sprint-list">${days.map((label, index) => `<label class="pro-sprint-item"><input type="checkbox" data-sprint-day="${index}" ${saved[index] ? "checked" : ""}><span>Hari ${index + 1} · ${label}</span></label>`).join("")}</div>`;
    }

    function initSnbt() {
        const insight = getSnbtInsight();
        const section = shell({
            id: "snbt-pro-accelerator", source: "tka", anchor: "#tka-info-hub", title: "TKA Pro Accelerator", description: "Susun sprint belajar yang mengikuti progres kompetensi, target program studi, dan kebiasaan reviewmu.",
            cards: [card("fa-bullseye", "Diagnosis Prioritas", "Baca progres silabus dan tentukan fokus yang paling mendesak.", "snbt-diagnosis", "Lihat diagnosis"), card("fa-calendar-check", "Sprint 7 Hari", "Rencana intensif harian yang tersimpan otomatis pada perangkat.", "snbt-sprint", "Buat sprint"), card("fa-download", "Ekspor Rencana", "Simpan planner, progres, dan sprint sebagai backup belajar.", "snbt-export", "Ekspor planner")],
            initialOutput: `Silabus terpantau ${insight.percent}% · ${insight.completed} item selesai.`, lockedCopy: "Aktifkan planner sprint, diagnosis prioritas, ekspor rencana, dan pengalaman latihan PRO."
        });
        section.addEventListener("click", (event) => {
            const action = event.target.closest("[data-pro-action]")?.dataset.proAction;
            if (!action || !pro) return;
            const data = getSnbtInsight();
            const output = section.querySelector("#proBenefitOutput");
            if (action === "snbt-diagnosis") output.textContent = data.percent < 35 ? "Prioritas: kuatkan fondasi dan selesaikan checklist silabus sebelum tryout penuh." : data.percent < 75 ? "Prioritas: lanjutkan subtes yang belum selesai dan mulai satu tryout terukur." : "Prioritas: fokus pada diary kesalahan, simulasi waktu, dan konsistensi skor.";
            if (action === "snbt-sprint") renderSprint(section);
            if (action === "snbt-export") { download("uot-pro-tka-planner.json", { format: "uot-tka-pro-plan", exportedAt: new Date().toISOString(), ...data, sprint: read("uotProSnbtSprint", {}) }); showToast("Rencana TKA PRO berhasil diekspor."); }
        });
        section.addEventListener("change", (event) => {
            if (!pro || !event.target.matches("[data-sprint-day]")) return;
            const state = read("uotProSnbtSprint", {});
            state[event.target.dataset.sprintDay] = event.target.checked;
            localStorage.setItem("uotProSnbtSprint", JSON.stringify(state));
            showToast("Progres sprint tersimpan.");
        });
    }

    function getCultureInsight() {
        const progress = read("bahasa_progress", { explored: [], mastered: [], favorites: [], reviewed: 0, correct: 0, streak: 0 });
        const accuracy = progress.reviewed ? Math.round((progress.correct / progress.reviewed) * 100) : 0;
        return { progress, explored: progress.explored?.length || 0, mastered: progress.mastered?.length || 0, favorites: progress.favorites?.length || 0, accuracy };
    }

    function initBahasa() {
        const insight = getCultureInsight();
        const quests = ["Pelajari tiga frasa dari satu daerah.", "Kuasai satu kartu budaya baru.", "Dengarkan pelafalan dan ulangi lima kali.", "Favoritkan satu budaya yang ingin dikunjungi.", "Selesaikan satu quiz budaya.", "Bandingkan dua kuliner daerah.", "Tulis catatan refleksi budaya."];
        const section = shell({
            id: "culture-pro-passport", source: "budaya", anchor: "#benefit-pro", title: "Culture Passport PRO", description: "Ubah eksplorasi budaya menjadi passport personal dengan quest harian, insight koleksi, dan backup perjalanan.",
            cards: [card("fa-passport", "Passport Insight", "Ringkasan daerah dijelajahi, dikuasai, favorit, dan akurasi.", "culture-insight", "Lihat passport"), card("fa-compass", "Quest Harian", "Satu misi budaya singkat yang berubah setiap hari.", "culture-quest", "Buka quest"), card("fa-box-archive", "Backup Perjalanan", "Ekspor progres budaya dan koleksi personal ke JSON.", "culture-export", "Ekspor passport")],
            initialOutput: `${insight.explored} daerah dijelajahi · ${insight.mastered} dikuasai · bonus PRO 2x XP aktif.`, lockedCopy: "Buka Culture Passport, quest harian, pencarian cepat, catatan budaya, dan bonus 2x XP."
        });
        section.addEventListener("click", (event) => {
            const action = event.target.closest("[data-pro-action]")?.dataset.proAction;
            if (!action || !pro) return;
            const data = getCultureInsight();
            const output = section.querySelector("#proBenefitOutput");
            if (action === "culture-insight") output.textContent = `${data.explored} daerah dijelajahi · ${data.mastered} dikuasai · ${data.favorites} favorit · akurasi quiz ${data.accuracy}%.`;
            if (action === "culture-quest") output.textContent = `Quest hari ini: ${quests[new Date().getDay()]}\nSelesaikan untuk menjaga streak budaya dan memperoleh bonus XP PRO.`;
            if (action === "culture-export") { download("uot-culture-passport.json", { format: "uot-culture-passport", exportedAt: new Date().toISOString(), data: data.progress }); showToast("Culture Passport berhasil diekspor."); }
        });
    }

    if (page === "materi") initMateri();
    if (page === "snbt") initSnbt();
    if (page === "bahasa") initBahasa();
})();
