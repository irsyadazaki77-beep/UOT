(() => {
    "use strict";

    const SCHEMA_VERSION = 2;
    const MAX_STORAGE_BYTES = 750000;
    const SESSION_KEY = "eduquestQuizSession";
    const ACTIVE_KEY = "eduquestQuizActiveState";
    const MIGRATION_KEY = "eduquestQuizSchemaVersion";
    const AWARD_KEY = "eduquestQuizAwardedSessions";
    const categories = new Set(["all", "programming", "database", "design", "analytics", "web", "cyber"]);
    const difficulties = new Set(["all", "easy", "medium", "hard"]);
    const modes = new Set(["practice", "exam", "sprint", "review", "challenge"]);
    const lmsQuizTypes = new Set(["practice", "review", "challenge", "mastery"]);

    function clamp(value, min, max, fallback = min) {
        const number = Number(value);
        if (!Number.isFinite(number)) return fallback;
        return Math.min(max, Math.max(min, number));
    }

    function text(value, maxLength = 500, fallback = "") {
        if (typeof value !== "string" && typeof value !== "number") return fallback;
        return String(value)
            .replace(/\u0000/g, "")
            .replace(/</g, "‹")
            .replace(/>/g, "›")
            .trim()
            .slice(0, maxLength) || fallback;
    }

    function read(storage, key, fallback = null) {
        try {
            const raw = storage.getItem(key);
            if (!raw || raw.length > MAX_STORAGE_BYTES) return fallback;
            return JSON.parse(raw);
        } catch (error) {
            console.warn(`[QuizNation] Data ${key} tidak dapat dibaca.`, error);
            return fallback;
        }
    }

    function write(storage, key, value) {
        try {
            const serialized = JSON.stringify(value);
            if (serialized.length > MAX_STORAGE_BYTES) throw new Error("Ukuran data melewati batas aman.");
            storage.setItem(key, serialized);
            return true;
        } catch (error) {
            console.warn(`[QuizNation] Data ${key} tidak dapat disimpan.`, error);
            return false;
        }
    }

    function remove(storage, key) {
        try {
            storage.removeItem(key);
        } catch (error) {
            console.warn(`[QuizNation] Data ${key} tidak dapat dihapus.`, error);
        }
    }

    function quarantine(storage, key, value) {
        try {
            const quarantineKey = `${key}.invalid.${Date.now()}`;
            const serialized = JSON.stringify(value).slice(0, 20000);
            storage.setItem(quarantineKey, serialized);
            storage.removeItem(key);
        } catch (error) {
            remove(storage, key);
        }
    }

    function sanitizeQuestion(question, index = 0) {
        if (!question || typeof question !== "object") return null;
        const sourceAnswers = Array.isArray(question.shuffledAnswers)
            ? question.shuffledAnswers.map((answer, answerIndex) => ({
                text: text(answer?.text, 320),
                originalIndex: clamp(answer?.originalIndex, 0, 5, answerIndex)
            }))
            : Array.isArray(question.answers)
                ? question.answers.map((answer, answerIndex) => ({
                    text: text(answer, 320),
                    originalIndex: answerIndex
                }))
                : [];
        const answers = sourceAnswers.filter((answer) => answer.text).slice(0, 6);
        if (answers.length < 2) return null;

        let correct = Number.isInteger(question.shuffledCorrect)
            ? question.shuffledCorrect
            : answers.findIndex((answer) => answer.originalIndex === Number(question.correct));
        if (correct < 0 || correct >= answers.length) correct = 0;

        const category = categories.has(question.category) ? question.category : "all";
        const difficulty = difficulties.has(question.difficulty) ? question.difficulty : "medium";
        return {
            id: text(question.id, 80, `question-${index + 1}`),
            category,
            difficulty,
            question: text(question.question, 1000, "Pertanyaan tidak tersedia."),
            hint: text(question.hint, 700, "Baca kembali setiap pilihan dengan teliti."),
            explanation: text(question.explanation, 1600, "Pembahasan belum tersedia."),
            shuffledAnswers: answers,
            shuffledCorrect: correct
        };
    }

    function validatePayload(input) {
        if (!input || typeof input !== "object" || !Array.isArray(input.questions)) {
            return { ok: false, error: "Payload sesi tidak lengkap." };
        }
        const questions = input.questions.slice(0, 50).map(sanitizeQuestion).filter(Boolean);
        if (!questions.length) return { ok: false, error: "Tidak ada soal valid dalam sesi." };

        const source = input.source === "lms" ? "lms" : "quick";
        const rawConfig = input.config && typeof input.config === "object" ? input.config : {};
        const category = categories.has(rawConfig.category) ? rawConfig.category : "all";
        const difficulty = difficulties.has(rawConfig.difficulty) ? rawConfig.difficulty : "all";
        const mode = modes.has(rawConfig.mode) ? rawConfig.mode : "practice";
        const createdAt = Number.isFinite(Date.parse(input.createdAt)) ? input.createdAt : new Date().toISOString();
        const payload = {
            version: SCHEMA_VERSION,
            source,
            createdAt,
            sessionId: text(input.sessionId, 120, `${source}-${Date.parse(createdAt)}-${questions.length}`),
            config: {
                category,
                difficulty,
                amount: questions.length,
                mode,
                categoryLabel: text(rawConfig.categoryLabel, 100, "Semua Materi"),
                difficultyLabel: text(rawConfig.difficultyLabel, 100, "Campuran"),
                modeLabel: text(rawConfig.modeLabel, 100, "Practice")
            },
            timeLimit: Math.round(clamp(input.timeLimit, 30, 7200, questions.length * 90)),
            questions
        };

        if (source === "lms") {
            const rawLms = input.lms && typeof input.lms === "object" ? input.lms : {};
            if (!text(rawLms.trackId, 80) || !text(rawLms.moduleId, 80)) {
                return { ok: false, error: "Identitas modul LMS tidak valid." };
            }
            payload.lms = {
                trackId: text(rawLms.trackId, 80),
                trackTitle: text(rawLms.trackTitle, 160, "Jalur Belajar"),
                moduleId: text(rawLms.moduleId, 80),
                moduleIndex: Math.round(clamp(rawLms.moduleIndex, 0, 100, 0)),
                moduleTitle: text(rawLms.moduleTitle, 180, "Modul"),
                quizType: lmsQuizTypes.has(rawLms.quizType) ? rawLms.quizType : "practice",
                passThreshold: Math.round(clamp(rawLms.passThreshold, 0, 100, 80))
            };
        }
        return { ok: true, value: payload };
    }

    function createPayload(input) {
        const result = validatePayload({
            ...input,
            version: SCHEMA_VERSION,
            createdAt: new Date().toISOString(),
            sessionId: `qn-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
        });
        if (!result.ok) throw new Error(result.error);
        return result.value;
    }

    function readSession() {
        const raw = read(sessionStorage, SESSION_KEY, null);
        const result = validatePayload(raw);
        if (!result.ok) {
            if (raw) quarantine(sessionStorage, SESSION_KEY, raw);
            return result;
        }
        if (JSON.stringify(raw) !== JSON.stringify(result.value)) write(sessionStorage, SESSION_KEY, result.value);
        return result;
    }

    function sanitizeBookmarks(value) {
        if (!Array.isArray(value)) return [];
        return value.slice(0, 40).map((item, index) => {
            if (!item || typeof item !== "object") return null;
            return {
                id: text(item.id, 80, `bookmark-${index}`),
                question: text(item.question, 1000, "Pertanyaan tersimpan"),
                category: categories.has(item.category) ? item.category : "all",
                difficulty: difficulties.has(item.difficulty) ? item.difficulty : "medium",
                hint: text(item.hint, 700),
                explanation: text(item.explanation, 1600)
            };
        }).filter(Boolean);
    }

    function sanitizeLmsProgress(value) {
        const source = value && typeof value === "object" ? value : {};
        const completedLectures = Array.isArray(source.completedLectures)
            ? [...new Set(source.completedLectures.map((item) => text(item, 160)).filter(Boolean))].slice(0, 500)
            : [];
        const unlockedBadges = Array.isArray(source.unlockedBadges)
            ? [...new Set(source.unlockedBadges.map((item) => text(item, 80)).filter(Boolean))].slice(0, 100)
            : [];
        const quizScores = {};
        if (source.quizScores && typeof source.quizScores === "object") {
            Object.entries(source.quizScores).slice(0, 1000).forEach(([key, value]) => {
                const safeKey = text(key, 220);
                if (safeKey) quizScores[safeKey] = Math.round(clamp(value, 0, 100, 0));
            });
        }
        return {
            completedLectures,
            quizScores,
            unlockedBadges,
            userName: text(source.userName, 80, "Developer Indonesia")
        };
    }

    function migrate() {
        const current = Number(localStorage.getItem(MIGRATION_KEY) || 0);
        if (current >= SCHEMA_VERSION) return;
        const bookmarks = sanitizeBookmarks(read(localStorage, "eduquestBookmarks", []));
        const lmsProgress = sanitizeLmsProgress(read(localStorage, "eduquestLmsProgress", {}));
        write(localStorage, "eduquestBookmarks", bookmarks);
        write(localStorage, "eduquestLmsProgress", lmsProgress);
        try {
            const best = Math.round(clamp(localStorage.getItem("eduquestBestScore"), 0, 100, 0));
            localStorage.setItem("eduquestBestScore", String(best));
            localStorage.setItem(MIGRATION_KEY, String(SCHEMA_VERSION));
        } catch (error) {
            console.warn("[QuizNation] Migrasi storage belum dapat diselesaikan.", error);
        }
    }

    function markAwarded(sessionId) {
        const id = text(sessionId, 120);
        if (!id) return false;
        const awarded = read(localStorage, AWARD_KEY, []);
        const list = Array.isArray(awarded) ? awarded.filter((item) => typeof item === "string").slice(-99) : [];
        if (list.includes(id)) return false;
        list.push(id);
        return write(localStorage, AWARD_KEY, list);
    }

    function setContent(element, label, content) {
        if (!element) return;
        element.replaceChildren();
        if (label) {
            const strong = document.createElement("strong");
            strong.textContent = label;
            element.append(strong, document.createTextNode(" "));
        }
        element.append(document.createTextNode(text(content, 2000)));
    }

    // Enable iOS CSS active state touch feedback
    document.addEventListener("touchstart", () => {}, { passive: true });

    migrate();

    window.QuizNation = Object.freeze({
        version: SCHEMA_VERSION,
        keys: Object.freeze({ session: SESSION_KEY, active: ACTIVE_KEY }),
        storage: Object.freeze({ read, write, remove, quarantine }),
        sanitize: Object.freeze({ text, question: sanitizeQuestion, bookmarks: sanitizeBookmarks, lmsProgress: sanitizeLmsProgress }),
        sessions: Object.freeze({ validate: validatePayload, create: createPayload, read: readSession }),
        rewards: Object.freeze({ markAwarded }),
        dom: Object.freeze({ setContent }),
        migrate
    });
})();
