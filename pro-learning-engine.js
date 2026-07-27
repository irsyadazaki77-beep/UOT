(function () {
    "use strict";

    const STORAGE_KEY = "quiznationProLearningV1";
    const SCHEMA_VERSION = 1;
    const DAY = 86400000;
    const MAX_ATTEMPTS = 2500;

    const clone = value => JSON.parse(JSON.stringify(value));
    const nowIso = () => new Date().toISOString();
    const uid = prefix => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value) || 0));
    const safeParse = (value, fallback) => {
        try { return JSON.parse(value || "null") ?? fallback; } catch (_) { return fallback; }
    };
    const readLocal = (key, fallback) => safeParse(localStorage.getItem(key), fallback);

    function emptyState() {
        return {
            version: SCHEMA_VERSION,
            updatedAt: nowIso(),
            attempts: [],
            mistakes: {},
            plan: {
                goal: "Kuasai fondasi belajar",
                focus: "campuran",
                dailyMinutes: 30,
                deadline: "",
                createdAt: nowIso(),
                completedDates: []
            },
            notes: [],
            simulations: [],
            certificates: [],
            migration: { completed: false, sources: [] }
        };
    }

    function normalizeState(input) {
        const base = emptyState();
        const source = input && typeof input === "object" ? input : {};
        const result = {
            ...base,
            ...source,
            version: SCHEMA_VERSION,
            attempts: Array.isArray(source.attempts) ? source.attempts.slice(-MAX_ATTEMPTS) : [],
            mistakes: source.mistakes && typeof source.mistakes === "object" ? source.mistakes : {},
            plan: { ...base.plan, ...(source.plan || {}) },
            notes: Array.isArray(source.notes) ? source.notes.slice(-500) : [],
            simulations: Array.isArray(source.simulations) ? source.simulations.slice(-100) : [],
            certificates: Array.isArray(source.certificates) ? source.certificates.slice(-100) : [],
            migration: { ...base.migration, ...(source.migration || {}) }
        };
        return result;
    }

    function load() {
        return normalizeState(readLocal(STORAGE_KEY, emptyState()));
    }

    function save(state) {
        const normalized = normalizeState(state);
        normalized.updatedAt = nowIso();
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
            window.dispatchEvent(new CustomEvent("qn:pro-data", { detail: { updatedAt: normalized.updatedAt } }));
        } catch (error) {
            console.warn("Pro Learning data tidak dapat disimpan:", error);
            throw new Error("Penyimpanan perangkat penuh. Ekspor backup lalu hapus data lama.");
        }
        return normalized;
    }

    function isPro() {
        return localStorage.getItem("eduquestSubscription") === "pro";
    }

    function questionKey(question) {
        return String(question.id || question.questionId || question.prompt || question.question || "unknown")
            .trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 90) || uid("question");
    }

    function normalizeAttempt(raw) {
        const question = raw.question || raw.prompt || "Pertanyaan latihan";
        return {
            id: raw.id || uid("attempt"),
            questionId: raw.questionId || questionKey(raw),
            question: String(question).slice(0, 600),
            topic: String(raw.topic || raw.category || raw.subject || "umum").toLowerCase(),
            difficulty: ["easy", "medium", "hard", "mudah", "sedang", "hots"].includes(raw.difficulty) ? raw.difficulty : "medium",
            source: String(raw.source || "quiz"),
            sessionId: String(raw.sessionId || ""),
            selected: raw.selected == null ? "" : String(raw.selected).slice(0, 300),
            correctAnswer: raw.correctAnswer == null ? "" : String(raw.correctAnswer).slice(0, 300),
            isCorrect: Boolean(raw.isCorrect),
            timedOut: Boolean(raw.timedOut),
            durationMs: clamp(raw.durationMs, 0, 3600000),
            hintUsed: Boolean(raw.hintUsed),
            explanation: String(raw.explanation || "").slice(0, 1000),
            answers: Array.isArray(raw.answers) ? raw.answers.map(value => String(value).slice(0, 300)).slice(0, 8) : [],
            at: raw.at || nowIso()
        };
    }

    function recordAttempt(raw) {
        const state = load();
        const attempt = normalizeAttempt(raw || {});
        state.attempts.push(attempt);
        state.attempts = state.attempts.slice(-MAX_ATTEMPTS);
        const key = attempt.questionId;
        const existing = state.mistakes[key];
        if (!attempt.isCorrect) {
            state.mistakes[key] = {
                id: key,
                question: attempt.question,
                topic: attempt.topic,
                difficulty: attempt.difficulty,
                source: attempt.source,
                answers: attempt.answers,
                correctAnswer: attempt.correctAnswer,
                explanation: attempt.explanation,
                wrongCount: Number(existing?.wrongCount || 0) + 1,
                correctReviews: Number(existing?.correctReviews || 0),
                intervalDays: Number(existing?.intervalDays || 1),
                dueAt: existing?.dueAt || nowIso(),
                lastWrongAt: attempt.at,
                status: "due"
            };
        } else if (existing) {
            const correctReviews = Number(existing.correctReviews || 0) + 1;
            const intervalDays = [1, 3, 7, 14, 30][Math.min(correctReviews, 4)];
            state.mistakes[key] = {
                ...existing,
                correctReviews,
                intervalDays,
                dueAt: new Date(Date.now() + intervalDays * DAY).toISOString(),
                status: correctReviews >= 4 ? "mastered" : "scheduled"
            };
        }
        save(state);
        return attempt;
    }

    function importLegacyAttempt(state, data) {
        const candidate = normalizeAttempt({ ...data, id: data.id || uid("legacy") });
        if (!state.attempts.some(item => item.id === candidate.id)) state.attempts.push(candidate);
    }

    function migrateLegacy() {
        const state = load();
        if (state.migration.completed) return state;
        const sources = [];
        const lms = readLocal("eduquestLmsProgress", {});
        Object.entries(lms.quizScores || {}).forEach(([key, score]) => {
            const topic = key.split("_")[0] || "lms";
            importLegacyAttempt(state, {
                id: `legacy-lms-${key}`,
                questionId: `legacy-lms-${key}`,
                question: `Hasil evaluasi LMS: ${key.replace(/_/g, " ")}`,
                topic,
                source: "lms-legacy",
                isCorrect: Number(score) >= 80,
                selected: `${score}%`,
                correctAnswer: "Minimal 80%",
                at: state.updatedAt
            });
        });
        if (Object.keys(lms.quizScores || {}).length) sources.push("eduquestLmsProgress");

        const stats = readLocal("snbt_stats", {});
        Object.entries(stats.bySubject || {}).forEach(([topic, values]) => {
            const done = Math.max(0, Number(values.done || 0));
            const correct = clamp(values.correct, 0, done);
            for (let index = 0; index < done; index += 1) {
                importLegacyAttempt(state, {
                    id: `legacy-tka-${topic}-${index}`,
                    questionId: `legacy-tka-${topic}-${index}`,
                    question: `Riwayat latihan TKA ${topic}`,
                    topic,
                    source: "tka-legacy",
                    isCorrect: index < correct,
                    at: state.updatedAt
                });
            }
        });
        if (Object.keys(stats).length) sources.push("snbt_stats");

        const diary = readLocal("tka_mistakes_diary", {});
        Object.entries(diary).forEach(([question, note]) => {
            const id = questionKey({ question });
            if (!state.mistakes[id]) {
                state.mistakes[id] = {
                    id, question, topic: "tka", difficulty: "medium", source: "tka-diary",
                    answers: [], correctAnswer: "", explanation: String(note || ""), wrongCount: 1,
                    correctReviews: 0, intervalDays: 1, dueAt: nowIso(), lastWrongAt: nowIso(), status: "due"
                };
            }
        });
        if (Object.keys(diary).length) sources.push("tka_mistakes_diary");
        state.migration = { completed: true, migratedAt: nowIso(), sources };
        return save(state);
    }

    function topicStats() {
        const state = load();
        const map = {};
        state.attempts.forEach(attempt => {
            const topic = attempt.topic || "umum";
            const row = map[topic] || { topic, total: 0, correct: 0, duration: 0, wrongRecent: 0, lastAt: "" };
            row.total += 1;
            row.correct += attempt.isCorrect ? 1 : 0;
            row.duration += Number(attempt.durationMs || 0);
            if (!attempt.isCorrect && Date.now() - new Date(attempt.at).getTime() < 14 * DAY) row.wrongRecent += 1;
            if (!row.lastAt || attempt.at > row.lastAt) row.lastAt = attempt.at;
            map[topic] = row;
        });
        return Object.values(map).map(row => {
            const accuracy = row.total ? Math.round(row.correct / row.total * 100) : 0;
            const volume = Math.min(18, row.total * 2);
            const recency = row.lastAt ? Math.max(0, 12 - Math.floor((Date.now() - new Date(row.lastAt).getTime()) / DAY)) : 0;
            const penalty = Math.min(22, row.wrongRecent * 4);
            const mastery = clamp(Math.round(accuracy * 0.7 + volume + recency - penalty), 0, 100);
            return { ...row, accuracy, mastery, averageSeconds: row.total ? Math.round(row.duration / row.total / 1000) : 0 };
        }).sort((a, b) => a.mastery - b.mastery);
    }

    function analytics() {
        const state = load();
        const topics = topicStats();
        const attempts = state.attempts;
        const correct = attempts.filter(item => item.isCorrect).length;
        const accuracy = attempts.length ? Math.round(correct / attempts.length * 100) : 0;
        const due = getReviewQueue().filter(item => item.status === "due").length;
        const readiness = topics.length ? Math.round(topics.reduce((sum, item) => sum + item.mastery, 0) / topics.length) : 0;
        const recent = attempts.slice(-30);
        const recentAccuracy = recent.length ? Math.round(recent.filter(item => item.isCorrect).length / recent.length * 100) : 0;
        const weakest = topics[0] || null;
        return {
            total: attempts.length, correct, accuracy, recentAccuracy, readiness, due, topics,
            weakest,
            recommendation: due ? `Selesaikan ${due} review yang jatuh tempo.`
                : weakest && weakest.mastery < 75 ? `Fokus berikutnya: ${weakest.topic} (${weakest.mastery}% penguasaan).`
                : attempts.length ? "Naikkan tingkat kesulitan untuk menjaga perkembangan." : "Mulai quiz diagnosis agar rekomendasi menjadi personal."
        };
    }

    function getReviewQueue() {
        const state = load();
        return Object.values(state.mistakes).map(item => ({
            ...item,
            status: item.status === "mastered" ? "mastered" : new Date(item.dueAt).getTime() <= Date.now() ? "due" : "scheduled"
        })).sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt));
    }

    function updatePlan(changes) {
        const state = load();
        state.plan = {
            ...state.plan,
            ...changes,
            dailyMinutes: clamp(changes.dailyMinutes ?? state.plan.dailyMinutes, 10, 180)
        };
        return save(state).plan;
    }

    function weeklyPlan() {
        const state = load();
        const stats = analytics();
        const focus = stats.weakest?.topic || state.plan.focus || "fondasi";
        const minutes = state.plan.dailyMinutes;
        const tasks = [
            ["Diagnosis singkat", `Kerjakan latihan ${focus} untuk memetakan titik lemah.`],
            ["Perkuat konsep", `Pelajari ulang materi ${focus} selama ${Math.max(10, minutes - 10)} menit.`],
            ["Smart Review", "Tuntaskan soal yang jatuh tempo di Bank Kesalahan."],
            ["Latihan adaptif", `Kerjakan soal ${focus} pada tingkat yang direkomendasikan.`],
            ["Simulasi mini", "Uji ketahanan waktu dan strategi menjawab."],
            ["Review mendalam", "Baca pembahasan dan perbarui catatan kesalahan."],
            ["Evaluasi mingguan", "Bandingkan akurasi, readiness, dan target berikutnya."]
        ];
        return tasks.map((task, index) => ({
            day: new Date(Date.now() + index * DAY).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "short" }),
            title: task[0], description: task[1], minutes,
            completed: state.plan.completedDates.includes(new Date(Date.now() + index * DAY).toISOString().slice(0, 10))
        }));
    }

    function togglePlanDate(date) {
        const state = load();
        const dates = new Set(state.plan.completedDates || []);
        dates.has(date) ? dates.delete(date) : dates.add(date);
        state.plan.completedDates = [...dates].slice(-180);
        return save(state).plan;
    }

    function adaptiveQuestions(bank, options) {
        const list = Array.isArray(bank) ? bank : [];
        const stats = analytics();
        const requested = options || {};
        const topic = requested.topic || stats.weakest?.topic;
        const preferredDifficulty = stats.weakest?.mastery < 45 ? "easy" : stats.weakest?.mastery < 75 ? "medium" : "hard";
        const mistakes = new Set(getReviewQueue().filter(item => item.status === "due").map(item => item.id));
        return list.map(question => {
            const id = questionKey(question);
            let priority = 0;
            if (topic && (question.category === topic || question.subject === topic)) priority += 50;
            if (question.difficulty === preferredDifficulty) priority += 22;
            if (mistakes.has(id)) priority += 80;
            priority += Math.random() * 8;
            return { ...question, _adaptivePriority: priority };
        }).sort((a, b) => b._adaptivePriority - a._adaptivePriority).slice(0, clamp(requested.limit || 10, 1, 50));
    }

    function addNote(note) {
        const state = load();
        const item = {
            id: uid("note"), title: String(note.title || "Catatan belajar").slice(0, 100),
            body: String(note.body || "").slice(0, 5000), context: String(note.context || "umum").slice(0, 100),
            createdAt: nowIso(), updatedAt: nowIso()
        };
        state.notes.push(item);
        save(state);
        return item;
    }

    function deleteNote(id) {
        const state = load();
        state.notes = state.notes.filter(note => note.id !== id);
        return save(state);
    }

    function recordSimulation(result) {
        const state = load();
        const item = {
            id: uid("simulation"), type: String(result.type || "campuran"), score: clamp(result.score, 0, 100),
            correct: Number(result.correct || 0), total: Number(result.total || 0), durationSeconds: Number(result.durationSeconds || 0),
            answers: Array.isArray(result.answers) ? result.answers.slice(0, 100) : [], completedAt: nowIso()
        };
        state.simulations.push(item);
        save(state);
        return item;
    }

    function hashText(text) {
        let hash = 2166136261;
        for (let index = 0; index < text.length; index += 1) {
            hash ^= text.charCodeAt(index);
            hash = Math.imul(hash, 16777619);
        }
        return (hash >>> 0).toString(16).padStart(8, "0").toUpperCase();
    }

    function certificateEligibility() {
        const stats = analytics();
        const lms = readLocal("eduquestLmsProgress", {});
        const completedModules = Number(lms.completedModules || (lms.completedLessons || []).length || 0);
        const highScore = Math.max(0, ...Object.values(lms.quizScores || {}).map(Number), ...load().simulations.map(item => item.score));
        const projectPassed = Boolean(lms.completedProjects?.length || lms.capstoneCompleted || completedModules >= 3);
        return {
            eligible: completedModules >= 3 && highScore >= 80 && projectPassed,
            completedModules, highScore, projectPassed,
            requirements: [
                { label: "Minimal 3 modul selesai", passed: completedModules >= 3 },
                { label: "Nilai asesmen minimal 80", passed: highScore >= 80 },
                { label: "Proyek/capstone selesai", passed: projectPassed }
            ]
        };
    }

    function issueCertificate() {
        const eligibility = certificateEligibility();
        if (!eligibility.eligible) throw new Error("Syarat sertifikat belum terpenuhi.");
        const state = load();
        const session = readLocal("eduquestUserSession", {});
        const issuedAt = nowIso();
        const id = `QN-PRO-${Date.now().toString(36).toUpperCase()}`;
        const certificate = {
            id, name: session.name || session.username || "Universe Of Tech Learner", title: "Pro Learning Achievement",
            competencies: analytics().topics.filter(topic => topic.mastery >= 70).map(topic => topic.topic).slice(0, 8),
            score: eligibility.highScore, completedModules: eligibility.completedModules, issuedAt,
            verification: hashText(`${id}|${session.email || "local"}|${issuedAt}|${eligibility.highScore}`),
            verificationMode: "local"
        };
        state.certificates.push(certificate);
        save(state);
        return certificate;
    }

    function mentorReply(message) {
        const text = String(message || "").toLowerCase();
        const stats = analytics();
        const due = getReviewQueue().filter(item => item.status === "due");
        if (/hint|petunjuk/.test(text)) {
            const item = due[0];
            return item ? `Petunjuk bertahap untuk ${item.topic}: identifikasi dulu konsep yang diuji pada “${item.question}”. Coret opsi yang tidak sesuai definisi, lalu jelaskan alasan pilihanmu sebelum melihat pembahasan.` : "Belum ada soal review aktif. Mulai latihan adaptif agar aku bisa memberi hint berdasarkan kesalahanmu.";
        }
        if (/kenapa|salah|kesalahan/.test(text)) {
            const item = due[0];
            return item ? `Kesalahan yang paling perlu ditinjau ada di ${item.topic}. Kamu sudah salah ${item.wrongCount} kali pada soal “${item.question}”. Jawaban tepat: ${item.correctAnswer || "buka pembahasan soal"}. ${item.explanation || "Bandingkan kembali definisi inti dengan pilihanmu."}` : "Belum ada kesalahan tersimpan. Aku akan menganalisisnya setelah kamu menyelesaikan quiz.";
        }
        if (/rencana|jadwal|belajar/.test(text)) return `Targetmu: ${load().plan.goal}. Dengan ${load().plan.dailyMinutes} menit per hari, mulai dari ${stats.weakest?.topic || "quiz diagnosis"}, lanjutkan Smart Review, lalu tutup sesi dengan 5 soal adaptif.`;
        if (/progres|analisis|siap|readiness/.test(text)) return `Readiness saat ini ${stats.readiness}% dari ${stats.total} jawaban. Akurasi terbaru ${stats.recentAccuracy}%. ${stats.recommendation}`;
        return `Aku membaca progres lokalmu: readiness ${stats.readiness}%, akurasi ${stats.accuracy}%, dan ${stats.due} review jatuh tempo. ${stats.recommendation} Tanyakan “kenapa saya salah”, “beri hint”, atau “buat rencana belajar”.`;
    }

    function createBackup() {
        return {
            format: "quiznation-pro-backup", version: SCHEMA_VERSION, exportedAt: nowIso(),
            accountHint: readLocal("eduquestUserSession", {}).email || "local-device",
            data: load()
        };
    }

    function importBackup(payload) {
        if (!payload || payload.format !== "quiznation-pro-backup" || !payload.data) throw new Error("Berkas bukan backup Universe Of Tech PRO yang valid.");
        if (Number(payload.version) > SCHEMA_VERSION) throw new Error("Backup dibuat oleh versi aplikasi yang lebih baru.");
        const currentAccount = readLocal("eduquestUserSession", {}).email || "local-device";
        if (payload.accountHint && payload.accountHint !== "local-device" && currentAccount !== "local-device" && payload.accountHint !== currentAccount) {
            throw new Error("Backup berasal dari akun Universe Of Tech yang berbeda.");
        }
        return save(normalizeState(payload.data));
    }

    window.QuizNationPro = {
        STORAGE_KEY, SCHEMA_VERSION, isPro, load, save, migrateLegacy, recordAttempt, analytics, topicStats,
        getReviewQueue, updatePlan, weeklyPlan, togglePlanDate, adaptiveQuestions, addNote, deleteNote,
        recordSimulation, certificateEligibility, issueCertificate, mentorReply, createBackup, importBackup, hashText
    };

    try { migrateLegacy(); } catch (error) { console.warn("Migrasi PRO dilewati:", error); }
})();
