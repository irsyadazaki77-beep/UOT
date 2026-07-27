(() => {
    "use strict";

    const TKA_KEYS = [
        "snbt_stats", "tka_checklist", "tka_syllabus_progress", "tka_weekly_roadmap_checked",
        "tka_daily_schedule", "tka_bookmarks", "tka_mistakes_diary", "tka_awarded_xp",
        "tka_planner_prefs", "tka_prev_readiness_level", "tka_diagnostic_result"
    ];
    const MAX_IMPORT_BYTES = 512 * 1024;

    const diagnosticQuestions = [
        {
            skill: "Bahasa Indonesia",
            prompt: "Pernyataan mana yang paling tepat merangkum teks: ‘Latihan singkat yang dilakukan konsisten memberi retensi lebih baik daripada belajar lama menjelang ujian’ ?",
            options: ["Belajar lama selalu gagal", "Konsistensi membantu retensi", "Ujian tidak perlu dipersiapkan", "Semua metode belajar sama"],
            correct: 1
        },
        {
            skill: "Matematika",
            prompt: "Jika 3x + 5 = 20, nilai x adalah…",
            options: ["3", "5", "7", "15"],
            correct: 1
        },
        {
            skill: "Bahasa Inggris",
            prompt: "The word ‘reliable’ is closest in meaning to…",
            options: ["Trustworthy", "Temporary", "Difficult", "Unusual"],
            correct: 0
        },
        {
            skill: "Penalaran",
            prompt: "Semua peserta kelompok A mengikuti latihan. Rani adalah peserta kelompok A. Kesimpulan yang valid adalah…",
            options: ["Rani mungkin tidak latihan", "Rani mengikuti latihan", "Tidak ada peserta yang latihan", "Kelompok A tidak memiliki peserta"],
            correct: 1
        },
        {
            skill: "Strategi",
            prompt: "Setelah salah pada tiga soal dengan topik yang sama, tindakan belajar paling efektif adalah…",
            options: ["Mengganti semua mapel", "Menghafal kunci jawaban", "Review konsep dan ulangi soal sejenis setelah jeda", "Mengabaikan topik tersebut"],
            correct: 2
        }
    ];

    function escapeHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function readJSON(key, fallback) {
        try { return JSON.parse(localStorage.getItem(key) || "null") ?? fallback; }
        catch { return fallback; }
    }

    function notify(message) {
        if (typeof window.triggerToast === "function") window.triggerToast(message);
        else if (typeof window.showToast === "function") window.showToast(message);
    }

    function initDiagnostic() {
        const questionBox = document.getElementById("tkaDiagnosticQuestion");
        const resultBox = document.getElementById("tkaDiagnosticResult");
        const startButton = document.getElementById("startTkaDiagnostic");
        if (!questionBox || !resultBox || !startButton) return;

        let index = 0;
        let answers = [];

        function renderSavedResult(result) {
            const skills = Object.entries(result.skills || {});
            resultBox.innerHTML = `
                <span class="mini-tag">Diagnosis tersimpan</span>
                <div class="diagnostic-score">${Number(result.score) || 0}%</div>
                <h3>${escapeHTML(result.label || "Hasil diagnosis")}</h3>
                <p>${escapeHTML(result.recommendation || "Lanjutkan latihan terarah.")}</p>
                <div class="diagnostic-skill-list">
                    ${skills.map(([skill, correct]) => `<div class="diagnostic-skill-row"><span>${escapeHTML(skill)}</span><strong>${correct ? "Kuat" : "Perlu review"}</strong></div>`).join("")}
                </div>
                <button class="btn btn-ghost" id="restartTkaDiagnostic" type="button">Ulangi diagnosis</button>
            `;
            document.getElementById("restartTkaDiagnostic")?.addEventListener("click", start);
        }

        function finish() {
            const correctCount = answers.filter(Boolean).length;
            const score = Math.round((correctCount / diagnosticQuestions.length) * 100);
            const weakest = diagnosticQuestions.filter((_, questionIndex) => !answers[questionIndex]).map(item => item.skill);
            const label = score >= 80 ? "Siap latihan campuran" : score >= 60 ? "Fondasi cukup stabil" : "Perlu penguatan konsep";
            const recommendation = weakest.length
                ? `Mulai dari ${weakest.slice(0, 2).join(" dan ")}, lalu ukur ulang setelah dua sesi belajar.`
                : "Lanjutkan ke paket campuran dan mulai berlatih dengan batas waktu.";
            const result = {
                score,
                label,
                recommendation,
                weakest,
                skills: Object.fromEntries(diagnosticQuestions.map((item, questionIndex) => [item.skill, answers[questionIndex]])),
                completedAt: new Date().toISOString()
            };
            localStorage.setItem("tka_diagnostic_result", JSON.stringify(result));
            questionBox.innerHTML = `<div class="mistake-review-empty"><strong>Diagnosis selesai.</strong><br>Rekomendasi sudah ditambahkan ke profil belajar lokalmu.</div>`;
            renderSavedResult(result);

            const focusSelect = document.getElementById("focusArea");
            const focusMap = { "Bahasa Indonesia": "Bahasa Indonesia", Matematika: "Matematika", "Bahasa Inggris": "Bahasa Inggris" };
            if (focusSelect && focusMap[weakest[0]]) {
                focusSelect.value = focusMap[weakest[0]];
                focusSelect.dispatchEvent(new Event("change", { bubbles: true }));
            }
            notify("Diagnosis selesai. Roadmap awal diperbarui.");
        }

        function renderQuestion() {
            const item = diagnosticQuestions[index];
            const progress = Math.round((index / diagnosticQuestions.length) * 100);
            questionBox.innerHTML = `
                <div class="diagnostic-progress"><span>Soal ${index + 1} dari ${diagnosticQuestions.length}</span><span>${escapeHTML(item.skill)}</span></div>
                <div class="diagnostic-progress__track"><div class="diagnostic-progress__fill" style="width:${progress}%"></div></div>
                <h3 class="diagnostic-prompt">${escapeHTML(item.prompt)}</h3>
                <div class="diagnostic-options">
                    ${item.options.map((option, optionIndex) => `<button type="button" class="diagnostic-option" data-diagnostic-answer="${optionIndex}">${escapeHTML(option)}</button>`).join("")}
                </div>
            `;
            questionBox.querySelectorAll("[data-diagnostic-answer]").forEach(button => {
                button.addEventListener("click", () => {
                    answers[index] = Number(button.dataset.diagnosticAnswer) === item.correct;
                    index += 1;
                    if (index >= diagnosticQuestions.length) finish(); else renderQuestion();
                });
            });
            questionBox.querySelector(".diagnostic-option")?.focus();
        }

        function start() {
            index = 0;
            answers = [];
            resultBox.innerHTML = `<span class="mini-tag">Sedang berlangsung</span><h3>Jawab tanpa melihat materi</h3><p>Hasil dipakai untuk memilih fokus, bukan untuk memberi label kemampuan tetap.</p>`;
            renderQuestion();
        }

        startButton.addEventListener("click", start);
        const saved = readJSON("tka_diagnostic_result", null);
        if (saved) renderSavedResult(saved);
    }

    function initElectiveValidation() {
        const first = document.getElementById("firstElective");
        const second = document.getElementById("secondElective");
        const hint = document.getElementById("electiveValidation");
        const build = document.getElementById("buildTKAPlan");
        const target = document.getElementById("targetScore");
        if (!first || !second || !hint) return;

        const oldPrefs = readJSON("tka_planner_prefs", {});
        if (target && Number(target.value) > 100) {
            target.value = "75";
            localStorage.setItem("tka_planner_prefs", JSON.stringify({ ...oldPrefs, targetScore: "75" }));
        }

        function validate() {
            const duplicate = first.value === second.value;
            hint.textContent = duplicate
                ? "Mapel pilihan 1 dan 2 harus berbeda."
                : "Pastikan kedua mapel pernah dipelajari dan relevan dengan prodi tujuan.";
            hint.classList.toggle("is-error", duplicate);
            if (build) build.disabled = duplicate;
            first.setAttribute("aria-invalid", String(duplicate));
            second.setAttribute("aria-invalid", String(duplicate));
            return !duplicate;
        }
        first.addEventListener("change", validate);
        second.addEventListener("change", validate);
        validate();
    }

    function renderMistakeDiary(filter = "") {
        const list = document.getElementById("mistakeReviewList");
        if (!list) return;
        const diary = readJSON("tka_mistakes_diary", {});
        const query = filter.trim().toLocaleLowerCase("id-ID");
        const entries = Object.entries(diary).filter(([question, note]) => `${question} ${note}`.toLocaleLowerCase("id-ID").includes(query));
        list.innerHTML = entries.length
            ? entries.map(([question, note]) => `<article class="mistake-review-item"><strong>${escapeHTML(question)}</strong><p>${escapeHTML(note)}</p></article>`).join("")
            : `<div class="mistake-review-empty">${query ? "Tidak ada catatan yang cocok." : "Belum ada catatan. Jawab soal lalu simpan evaluasimu."}</div>`;
    }

    function initMistakeDiary() {
        const search = document.getElementById("mistakeReviewSearch");
        const save = document.getElementById("saveMistakeNoteBtn");
        search?.addEventListener("input", () => renderMistakeDiary(search.value));
        save?.addEventListener("click", () => setTimeout(() => renderMistakeDiary(search?.value || ""), 0));
        renderMistakeDiary();
    }

    function initProgressPortability() {
        const exportButton = document.getElementById("exportTkaProgressBtn");
        const importInput = document.getElementById("importTkaProgressInput");
        const status = document.getElementById("tkaStorageStatus");
        if (status) {
            const session = window.QuizNationAccount?.getSession?.();
            status.textContent = session?.isLoggedIn
                ? `Masuk sebagai ${session.username}. Progres TKA masih tersimpan lokal; ekspor untuk cadangan atau pindah perangkat.`
                : "Progres disimpan di perangkat ini. Gunakan ekspor untuk cadangan atau pindah perangkat.";
        }

        exportButton?.addEventListener("click", () => {
            const payload = {
                app: "Universe Of Tech",
                type: "tka-progress",
                version: 1,
                exportedAt: new Date().toISOString(),
                data: Object.fromEntries(TKA_KEYS.map(key => [key, localStorage.getItem(key)]))
            };
            const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `quiznation-tka-progress-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
            notify("Progres TKA berhasil diekspor.");
        });

        importInput?.addEventListener("change", async () => {
            const file = importInput.files?.[0];
            if (!file) return;
            try {
                if (file.size > MAX_IMPORT_BYTES) throw new Error("File terlalu besar.");
                const payload = JSON.parse(await file.text());
                if (payload?.type !== "tka-progress" || payload?.version !== 1 || !payload.data || typeof payload.data !== "object") {
                    throw new Error("Format cadangan tidak dikenali.");
                }
                TKA_KEYS.forEach(key => {
                    if (!Object.prototype.hasOwnProperty.call(payload.data, key)) return;
                    const value = payload.data[key];
                    if (value === null) localStorage.removeItem(key);
                    else if (typeof value === "string") {
                        JSON.parse(value);
                        localStorage.setItem(key, value);
                    }
                });
                notify("Progres berhasil diimpor. Halaman akan dimuat ulang.");
                setTimeout(() => location.reload(), 700);
            } catch (error) {
                notify(error.message || "Gagal mengimpor progres.");
            } finally {
                importInput.value = "";
            }
        });
    }

    function initAccessibleOverlays() {
        const modal = document.getElementById("conceptModal");
        const close = document.getElementById("conceptModalClose");
        const drawer = document.getElementById("formulaDrawer");
        const drawerClose = document.getElementById("formulaDrawerClose");
        const bookmark = document.getElementById("bookmarkQuestionBtn");

        document.addEventListener("keydown", event => {
            if (event.key !== "Escape") return;
            if (modal?.classList.contains("active")) close?.click();
            if (drawer?.classList.contains("active")) drawerClose?.click();
        });

        if (bookmark) {
            const observer = new MutationObserver(() => bookmark.setAttribute("aria-pressed", String(bookmark.classList.contains("bookmarked"))));
            observer.observe(bookmark, { attributes: true, attributeFilter: ["class"] });
        }
    }

    function initFullscreenToggle() {
        const fsBtns = [
            document.getElementById("fullscreenToggleBtn"),
            document.getElementById("fullscreenQuickBtn")
        ].filter(Boolean);

        if (!fsBtns.length) return;

        function toggleFS() {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(err => {
                    console.warn("Fullscreen request error:", err);
                });
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
            }
        }

        fsBtns.forEach(btn => btn.addEventListener("click", toggleFS));

        document.addEventListener("fullscreenchange", () => {
            const isFS = Boolean(document.fullscreenElement);
            document.body.classList.toggle("is-fullscreen", isFS);

            fsBtns.forEach(btn => {
                const icon = btn.querySelector("i");
                const textSpan = btn.querySelector("span");
                if (icon) {
                    icon.className = isFS ? "fa-solid fa-compress" : "fa-solid fa-expand";
                }
                if (textSpan) {
                    textSpan.textContent = isFS ? "Exit Full" : "Full Screen";
                }
                btn.setAttribute("title", isFS ? "Keluar Layar Penuh" : "Mode Layar Penuh");
                btn.setAttribute("aria-label", isFS ? "Keluar Layar Penuh" : "Mode Layar Penuh");
            });
        });
    }

    document.addEventListener("DOMContentLoaded", () => {
        initDiagnostic();
        initElectiveValidation();
        initMistakeDiary();
        initProgressPortability();
        initAccessibleOverlays();
        initFullscreenToggle();
    });
})();
