(function () {
    "use strict";
    const pro = window.QuizNationPro;
    if (!pro) return;
    const $ = selector => document.querySelector(selector);
    const all = selector => [...document.querySelectorAll(selector)];
    const escapeHtml = value => String(value ?? "").replace(/[&<>"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char]));
    let reviewFilter = "due";
    let selectedPreset = "campuran";
    let simulation = null;
    let timerId = 0;

    function toast(message) {
        const element = $("#hubToast");
        element.textContent = message;
        element.classList.add("show");
        clearTimeout(element._timer);
        element._timer = setTimeout(() => element.classList.remove("show"), 2800);
    }

    function requirePro(action) {
        if (pro.isPro()) return true;
        toast(`${action} tersedia untuk akun PRO.`);
        return false;
    }

    function switchTab(tab) {
        all(".hub-tab").forEach(button => button.classList.toggle("active", button.dataset.tab === tab));
        all(".hub-panel").forEach(panel => panel.classList.toggle("active", panel.dataset.panel === tab));
        history.replaceState(null, "", `#${tab}`);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function renderMetrics(stats) {
        const metrics = [
            ["fa-bullseye", `${stats.accuracy}%`, "Akurasi keseluruhan"],
            ["fa-chart-line", `${stats.readiness}%`, "Learning readiness"],
            ["fa-rotate", stats.due, "Review jatuh tempo"],
            ["fa-list-check", stats.total, "Jawaban dianalisis"]
        ];
        $("#metricGrid").innerHTML = metrics.map(item => `<article class="metric-card"><i class="fa-solid ${item[0]}"></i><strong>${item[1]}</strong><span>${item[2]}</span></article>`).join("");
    }

    function renderOverview(stats) {
        const ring = $("#readinessRing");
        ring.style.setProperty("--score", `${stats.readiness * 3.6}deg`);
        $("#readinessValue").textContent = `${stats.readiness}%`;
        $("#heroRecommendation").textContent = stats.recommendation;
        $("#mainRecommendation").textContent = stats.recommendation;
        $("#mainRecommendationCopy").textContent = stats.due
            ? "Review terjadwal memberi dampak lebih besar daripada mengulang soal secara acak."
            : "Rekomendasi dihitung dari akurasi, volume, kebaruan latihan, dan kesalahan berulang.";
        renderMetrics(stats);
        $("#priorityTopics").innerHTML = stats.topics.slice(0, 3).map(topic => `
            <div class="topic-mini"><span>${escapeHtml(topic.topic)}</span><small>${topic.mastery}%</small><div class="mini-track"><i style="width:${topic.mastery}%"></i></div></div>
        `).join("") || `<p class="muted">Belum ada topik yang dianalisis.</p>`;
        $("#miniPlan").innerHTML = pro.weeklyPlan().slice(0, 3).map(day => `
            <div class="plan-mini"><span>${escapeHtml(day.title)}</span><small>${escapeHtml(day.day)}</small></div>
        `).join("");
    }

    function renderDiagnosis(stats) {
        const empty = !stats.topics.length;
        $("#diagnosisEmpty").hidden = !empty;
        $("#topicTable").hidden = empty;
        $("#diagnosisSummary").hidden = empty;
        if (empty) return;
        const strongest = stats.topics[stats.topics.length - 1];
        $("#diagnosisSummary").innerHTML = `
            <div><strong>${escapeHtml(stats.weakest.topic)}</strong><span>Prioritas perbaikan</span></div>
            <div><strong>${escapeHtml(strongest.topic)}</strong><span>Topik terkuat</span></div>
            <div><strong>${stats.recentAccuracy}%</strong><span>Akurasi 30 jawaban terbaru</span></div>`;
        $("#topicTable").innerHTML = stats.topics.map(topic => `
            <div class="topic-row"><strong>${escapeHtml(topic.topic)}</strong><div class="mastery-track"><i style="width:${topic.mastery}%"></i></div><span>${topic.accuracy}% akurat</span><span>${topic.total} soal</span></div>
        `).join("");
    }

    function renderReview() {
        const queue = pro.getReviewQueue();
        const dueCount = queue.filter(item => item.status === "due").length;
        $("#reviewBadge").textContent = dueCount;
        $("#reviewBadge").hidden = dueCount === 0;
        const filtered = reviewFilter === "all" ? queue : queue.filter(item => item.status === reviewFilter);
        $("#reviewList").innerHTML = filtered.map(item => `
            <article class="review-item">
                <div><div class="item-meta"><span>${escapeHtml(item.topic)}</span><span>${escapeHtml(item.difficulty)}</span><span class="status-chip ${item.status}">${item.status}</span></div>
                <h3>${escapeHtml(item.question)}</h3><p>${escapeHtml(item.explanation || `Kesalahan tercatat ${item.wrongCount} kali. Review berikutnya ${new Date(item.dueAt).toLocaleDateString("id-ID")}.`)}</p></div>
                <button data-review-id="${escapeHtml(item.id)}" ${item.status === "mastered" ? "disabled" : ""}>${item.status === "due" ? "Review" : item.status === "mastered" ? "Dikuasai" : "Detail"}</button>
            </article>`).join("") || `<div class="empty-state"><i class="fa-solid fa-circle-check"></i><h3>Tidak ada review di kategori ini</h3><p>Kesalahan baru akan masuk otomatis setelah kamu mengerjakan quiz.</p></div>`;
        all("[data-review-id]").forEach(button => button.addEventListener("click", () => startSingleReview(button.dataset.reviewId)));
    }

    function renderPlan() {
        const plan = pro.load().plan;
        $("#planGoal").value = plan.goal;
        $("#planFocus").value = [...$("#planFocus").options].some(option => option.value === plan.focus) ? plan.focus : "campuran";
        $("#planMinutes").value = plan.dailyMinutes;
        $("#planDeadline").value = plan.deadline || "";
        $("#weekPlan").innerHTML = pro.weeklyPlan().map((day, index) => {
            const date = new Date(Date.now() + index * 86400000).toISOString().slice(0, 10);
            return `<article class="day-card"><input type="checkbox" data-plan-date="${date}" ${day.completed ? "checked" : ""} aria-label="Tandai ${escapeHtml(day.title)} selesai"><div><h3>${escapeHtml(day.day)} · ${escapeHtml(day.title)}</h3><p>${escapeHtml(day.description)}</p></div><span>${day.minutes} menit</span></article>`;
        }).join("");
        all("[data-plan-date]").forEach(input => input.addEventListener("change", () => { pro.togglePlanDate(input.dataset.planDate); toast("Agenda diperbarui."); }));
    }

    function renderSimulationHistory() {
        const items = pro.load().simulations.slice().reverse().slice(0, 8);
        $("#simulationHistory").innerHTML = items.length ? `<h3>Riwayat simulasi</h3>` + items.map(item => `
            <article class="history-item"><div><strong>${escapeHtml(item.type)}</strong><p>${new Date(item.completedAt).toLocaleString("id-ID")} · ${item.correct}/${item.total} benar</p></div><strong>${item.score}%</strong></article>
        `).join("") : "";
    }

    function renderNotes() {
        const notes = pro.load().notes.slice().reverse();
        $("#noteList").innerHTML = notes.map(note => `
            <article class="note-item"><div><div class="item-meta"><span>${escapeHtml(note.context)}</span><span>${new Date(note.createdAt).toLocaleDateString("id-ID")}</span></div><h3>${escapeHtml(note.title)}</h3><p>${escapeHtml(note.body)}</p></div><button data-delete-note="${note.id}" aria-label="Hapus catatan"><i class="fa-solid fa-trash"></i></button></article>
        `).join("") || `<div class="empty-state"><i class="fa-solid fa-note-sticky"></i><h3>Belum ada catatan</h3><p>Simpan rumus, konsep, atau refleksi agar mudah ditemukan kembali.</p></div>`;
        all("[data-delete-note]").forEach(button => button.addEventListener("click", () => { if (!requirePro("Hapus catatan")) return; pro.deleteNote(button.dataset.deleteNote); renderNotes(); toast("Catatan dihapus."); }));
    }

    function renderCertificates() {
        const eligibility = pro.certificateEligibility();
        $("#eligibilityRequirements").innerHTML = eligibility.requirements.map(item => `<div class="requirement ${item.passed ? "passed" : ""}"><i class="fa-solid ${item.passed ? "fa-circle-check" : "fa-circle-xmark"}"></i>${escapeHtml(item.label)}</div>`).join("");
        $("#issueCertificate").disabled = !eligibility.eligible || !pro.isPro();
        const certificates = pro.load().certificates.slice().reverse();
        $("#certificateList").innerHTML = certificates.map(item => `
            <article class="certificate-card"><span>UNIVERSE OF TECH · LOCAL VERIFICATION</span><h3>${escapeHtml(item.title)}</h3><p>Diberikan kepada <strong>${escapeHtml(item.name)}</strong> dengan nilai ${item.score}.<br>Kompetensi: ${escapeHtml(item.competencies.join(", ") || "Pembelajaran terpadu")}</p><p>ID ${escapeHtml(item.id)} · <code>${escapeHtml(item.verification)}</code></p><button class="button secondary" onclick="window.print()">Cetak / Simpan PDF</button></article>
        `).join("");
    }

    function renderAll() {
        const stats = pro.analytics();
        renderOverview(stats);
        renderDiagnosis(stats);
        renderReview();
        renderPlan();
        renderSimulationHistory();
        renderNotes();
        renderCertificates();
    }

    function startSingleReview(id) {
        if (!requirePro("Smart Review")) return;
        const item = pro.getReviewQueue().find(row => row.id === id);
        if (!item) return;
        if (!item.answers?.length || !item.correctAnswer) {
            switchTab("mentor");
            submitMentor(`Kenapa saya salah pada topik ${item.topic}?`);
            return;
        }
        startQuestionSet([{
            id: item.id, question: item.question, category: item.topic, difficulty: item.difficulty,
            answers: item.answers, correct: Math.max(0, item.answers.indexOf(item.correctAnswer)), explanation: item.explanation
        }], "smart-review", 120);
    }

    function startAdaptiveReview() {
        if (!requirePro("Latihan adaptif")) return;
        const questions = pro.adaptiveQuestions(window.questionBank || [], { limit: 10 });
        if (!questions.length) return toast("Bank soal belum tersedia.");
        selectedPreset = "adaptif";
        switchTab("simulation");
        startQuestionSet(questions, "adaptif", 600);
    }

    function selectQuestions() {
        const bank = window.questionBank || [];
        if (selectedPreset === "programming") return pro.adaptiveQuestions(bank.filter(item => ["programming", "web", "database"].includes(item.category)), { limit: 10 });
        if (selectedPreset === "tka") return pro.adaptiveQuestions(bank.filter(item => ["math", "analytics", "general"].includes(item.category)), { limit: 10 });
        return pro.adaptiveQuestions(bank, { limit: 10 });
    }

    function startQuestionSet(questions, type, seconds) {
        simulation = { questions, type, index: 0, correct: 0, answers: [], startedAt: Date.now(), timeLeft: seconds };
        $("#simulationSetup").hidden = true;
        $("#simulationResult").hidden = true;
        $("#simulationWorkspace").hidden = false;
        $("#simulationTimer").hidden = false;
        clearInterval(timerId);
        timerId = setInterval(() => {
            simulation.timeLeft -= 1;
            renderTimer();
            if (simulation.timeLeft <= 0) finishSimulation(true);
        }, 1000);
        renderTimer();
        renderSimulationQuestion();
    }

    function renderTimer() {
        if (!simulation) return;
        const minutes = Math.floor(simulation.timeLeft / 60);
        const seconds = simulation.timeLeft % 60;
        $("#simulationTimer").textContent = `${minutes}:${String(seconds).padStart(2, "0")}`;
    }

    function renderSimulationQuestion() {
        const question = simulation.questions[simulation.index];
        $("#simulationProgress").style.width = `${simulation.index / simulation.questions.length * 100}%`;
        $("#simulationMeta").textContent = `Soal ${simulation.index + 1}/${simulation.questions.length} · ${question.category || "umum"} · ${question.difficulty || "medium"}`;
        $("#simulationQuestion").textContent = question.question || question.prompt;
        $("#simulationAnswers").innerHTML = (question.answers || question.options || []).map((answer, index) => `<button data-answer-index="${index}">${String.fromCharCode(65 + index)}. ${escapeHtml(answer)}</button>`).join("");
        all("[data-answer-index]").forEach(button => button.addEventListener("click", () => answerSimulation(Number(button.dataset.answerIndex))));
    }

    function answerSimulation(selectedIndex) {
        const question = simulation.questions[simulation.index];
        const answers = question.answers || question.options || [];
        const isCorrect = selectedIndex === Number(question.correct);
        if (isCorrect) simulation.correct += 1;
        const answer = { questionId: question.id, selectedIndex, correctIndex: question.correct, isCorrect };
        simulation.answers.push(answer);
        pro.recordAttempt({
            questionId: question.id, question: question.question || question.prompt, topic: question.category || question.subject,
            difficulty: question.difficulty, source: `simulation-${simulation.type}`, selected: answers[selectedIndex],
            correctAnswer: answers[question.correct], isCorrect, durationMs: Math.round((Date.now() - simulation.startedAt) / (simulation.index + 1)),
            explanation: question.explanation || question.note, answers
        });
        simulation.index += 1;
        simulation.index >= simulation.questions.length ? finishSimulation(false) : renderSimulationQuestion();
    }

    function finishSimulation(timedOut) {
        if (!simulation) return;
        clearInterval(timerId);
        const total = simulation.questions.length;
        const score = Math.round(simulation.correct / total * 100);
        const result = pro.recordSimulation({ type: simulation.type, score, correct: simulation.correct, total, durationSeconds: Math.round((Date.now() - simulation.startedAt) / 1000), answers: simulation.answers });
        $("#simulationWorkspace").hidden = true;
        $("#simulationTimer").hidden = true;
        $("#simulationResult").hidden = false;
        $("#simulationResult").innerHTML = `<span>${timedOut ? "Waktu habis" : "Simulasi selesai"}</span><strong>${score}%</strong><p>${result.correct}/${result.total} benar. ${score >= 80 ? "Kesiapanmu kuat; lanjutkan ke tingkat lebih tinggi." : "Buka Diagnosis dan Smart Review untuk memperbaiki topik yang lemah."}</p><button class="button primary" id="finishSimulationButton">Kembali ke setup</button>`;
        $("#finishSimulationButton").addEventListener("click", () => { $("#simulationResult").hidden = true; $("#simulationSetup").hidden = false; renderAll(); });
        simulation = null;
    }

    function submitMentor(message) {
        if (!requirePro("BUBUB Mentor")) return;
        const messages = $("#mentorMessages");
        messages.insertAdjacentHTML("beforeend", `<div class="mentor-message user">${escapeHtml(message)}</div>`);
        const reply = pro.mentorReply(message);
        setTimeout(() => {
            messages.insertAdjacentHTML("beforeend", `<div class="mentor-message assistant">${escapeHtml(reply)}</div>`);
            messages.scrollTop = messages.scrollHeight;
        }, 220);
        messages.scrollTop = messages.scrollHeight;
    }

    function downloadJson(name, data) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url; anchor.download = name; anchor.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    function bindEvents() {
        all(".hub-tab").forEach(button => button.addEventListener("click", () => switchTab(button.dataset.tab)));
        all("[data-go-tab]").forEach(button => button.addEventListener("click", () => switchTab(button.dataset.goTab)));
        all("[data-review-filter]").forEach(button => button.addEventListener("click", () => { reviewFilter = button.dataset.reviewFilter; all("[data-review-filter]").forEach(item => item.classList.toggle("active", item === button)); renderReview(); }));
        $("#refreshHub").addEventListener("click", () => { pro.migrateLegacy(); renderAll(); toast("Insight diperbarui."); });
        $("#startAdaptiveReview").addEventListener("click", startAdaptiveReview);
        $("#planForm").addEventListener("submit", event => { event.preventDefault(); if (!requirePro("Rencana personal")) return; pro.updatePlan({ goal: $("#planGoal").value.trim(), focus: $("#planFocus").value, dailyMinutes: Number($("#planMinutes").value), deadline: $("#planDeadline").value }); renderAll(); toast("Agenda personal diperbarui."); });
        all("[data-preset]").forEach(button => button.addEventListener("click", () => { selectedPreset = button.dataset.preset; all("[data-preset]").forEach(item => item.classList.toggle("active", item === button)); }));
        $("#startSimulation").addEventListener("click", () => { if (!requirePro("Simulasi ujian")) return; const questions = selectQuestions(); if (!questions.length) return toast("Soal untuk preset ini belum tersedia."); startQuestionSet(questions, selectedPreset, 600); });
        $("#mentorForm").addEventListener("submit", event => { event.preventDefault(); const input = $("#mentorInput"); submitMentor(input.value.trim()); input.value = ""; });
        all(".mentor-chips button").forEach(button => button.addEventListener("click", () => submitMentor(button.textContent)));
        $("#noteForm").addEventListener("submit", event => { event.preventDefault(); if (!requirePro("Catatan PRO")) return; pro.addNote({ title: $("#noteTitle").value, context: $("#noteContext").value, body: $("#noteBody").value }); event.target.reset(); renderNotes(); toast("Catatan tersimpan."); });
        $("#printReport").addEventListener("click", () => { if (requirePro("Ekspor laporan")) window.print(); });
        $("#exportBackup").addEventListener("click", () => { if (!requirePro("Backup PRO")) return; downloadJson(`quiznation-pro-backup-${new Date().toISOString().slice(0, 10)}.json`, pro.createBackup()); toast("Backup berhasil dibuat."); });
        $("#importBackup").addEventListener("click", () => { if (requirePro("Pulihkan backup")) $("#importBackupFile").click(); });
        $("#importBackupFile").addEventListener("change", async event => { try { const file = event.target.files[0]; if (!file) return; pro.importBackup(JSON.parse(await file.text())); renderAll(); toast("Backup berhasil dipulihkan."); } catch (error) { toast(error.message); } finally { event.target.value = ""; } });
        $("#issueCertificate").addEventListener("click", () => { try { if (!requirePro("Sertifikat")) return; pro.issueCertificate(); renderCertificates(); toast("Sertifikat berhasil diterbitkan."); } catch (error) { toast(error.message); } });
        window.addEventListener("qn:pro-data", () => { if (!simulation) renderAll(); });
    }

    function init() {
        const isPro = pro.isPro();
        $(".hub-shell").classList.toggle("basic-mode", !isPro);
        $("#basicPreview").hidden = isPro;
        $("#hubPlanBadge").innerHTML = isPro ? '<i class="fa-solid fa-crown"></i> PRO ACTIVE' : '<i class="fa-solid fa-lock"></i> BASIC PREVIEW';
        bindEvents();
        renderAll();
        const initial = location.hash.slice(1);
        if (all(".hub-tab").some(button => button.dataset.tab === initial)) switchTab(initial);
    }

    document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", init) : init();
})();
