/**
 * UNIVERSE OF TECH - CONTENT MANAGEMENT & LEARNING CONTENT ENGINE (FASE 20)
 * Modular Content Engine with Multi-Domain Validation, Quality Auditing, Versioning & Fallback States.
 */
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define([], factory);
    } else if (typeof module === "object" && module.exports) {
        module.exports = factory();
    } else {
        root.ContentEngine = factory();
    }
}(typeof self !== "undefined" ? self : this, function () {
    "use strict";

    // In-memory Content Storage
    const registry = {
        lessons: new Map(),
        quizzes: new Map(),
        learningPaths: new Map(),
        projects: new Map(),
        culture: new Map(),
        books: new Map()
    };

    let engineVersion = "20.0.0";
    let lastUpdated = Date.now();

    /**
     * Domain Normalization
     */
    function normalizeDomain(domain) {
        if (!domain || typeof domain !== "string") return "quizzes";
        const d = domain.trim().toLowerCase();
        if (d === "learningpaths" || d === "learning-paths" || d === "learning_paths" || d === "learningpath" || d === "tracks" || d === "track") {
            return "learningPaths";
        }
        if (d === "quizzes" || d === "quiz" || d === "questions" || d === "question") {
            return "quizzes";
        }
        if (d === "lessons" || d === "lesson" || d === "materi") {
            return "lessons";
        }
        if (d === "projects" || d === "project") {
            return "projects";
        }
        if (d === "culture" || d === "budaya" || d === "places" || d === "place") {
            return "culture";
        }
        if (d === "books" || d === "book" || d === "library") {
            return "books";
        }
        return domain;
    }

    /**
     * Standard Validation Functions
     */
    function validateQuiz(quiz) {
        const errors = [];
        if (!quiz || typeof quiz !== "object") {
            return { valid: false, errors: ["Konten quiz harus berupa objek valid."] };
        }
        if (!quiz.id || typeof quiz.id !== "string") errors.push("ID quiz wajib diisi.");

        // Combined quiz with multiple questions
        if (Array.isArray(quiz.questions) && quiz.questions.length > 0) {
            quiz.questions.forEach((subQ, idx) => {
                const subVal = validateQuiz(subQ);
                if (!subVal.valid) {
                    subVal.errors.forEach(err => errors.push(`[Soal ${idx + 1} (${subQ.id || 'tanpa ID'})] ${err}`));
                }
            });
            return { valid: errors.length === 0, errors };
        }

        const promptText = quiz.question || quiz.prompt;
        if (!promptText || typeof promptText !== "string" || !promptText.trim()) {
            errors.push("Pertanyaan quiz tidak boleh kosong.");
        }

        const options = quiz.options || quiz.answers;
        if (!Array.isArray(options) || options.length < 2) {
            errors.push("Quiz harus memiliki minimal 2 pilihan jawaban (options).");
        } else {
            // Check for duplicate options
            const normOptions = options.map(opt => String(opt).trim().toLowerCase());
            const uniqueOptions = new Set(normOptions);
            if (uniqueOptions.size < normOptions.length) {
                errors.push("Terdapat pilihan jawaban yang duplikat (duplicate option).");
            }
        }

        // Check for missing / out-of-bounds answer
        const correctAnswer = quiz.correctAnswer !== undefined ? quiz.correctAnswer : quiz.correct;
        if (correctAnswer === undefined || correctAnswer === null) {
            errors.push("Jawaban benar (correctAnswer) tidak ditentukan.");
        } else if (typeof correctAnswer === "number") {
            if (correctAnswer < 0 || (options && correctAnswer >= options.length)) {
                errors.push(`Jawaban benar (index ${correctAnswer}) di luar jangkauan opsi.`);
            }
        } else if (Array.isArray(correctAnswer)) {
            correctAnswer.forEach(idx => {
                if (typeof idx !== "number" || idx < 0 || (options && idx >= options.length)) {
                    errors.push(`Jawaban benar kompleks (index ${idx}) di luar jangkauan opsi.`);
                }
            });
        }

        // Explanation check (optional, defaults to empty or fallback)
        if (quiz.explanation !== undefined && (typeof quiz.explanation !== "string" || !quiz.explanation.trim())) {
            errors.push("Penjelasan jawaban (explanation) tidak valid.");
        }

        // Missing skills / category check
        if (!quiz.skills || !Array.isArray(quiz.skills) || quiz.skills.length === 0) {
            if (!quiz.category && !quiz.subject) {
                errors.push("Quiz wajib memiliki setidaknya satu tag skill atau kategori.");
            }
        }

        return { valid: errors.length === 0, errors };
    }

    function validateLesson(lesson) {
        const errors = [];
        if (!lesson || typeof lesson !== "object") {
            return { valid: false, errors: ["Konten lesson harus berupa objek valid."] };
        }
        if (!lesson.id || typeof lesson.id !== "string") errors.push("ID lesson wajib diisi.");
        if (!lesson.title || typeof lesson.title !== "string" || !lesson.title.trim()) errors.push("Judul lesson tidak boleh kosong.");

        if (!lesson.skills || !Array.isArray(lesson.skills) || lesson.skills.length === 0) {
            if (!lesson.category) errors.push("Lesson wajib memiliki sekurang-kurangnya satu tag skill atau kategori.");
        }

        return { valid: errors.length === 0, errors };
    }

    function validateLearningPath(pathItem) {
        const errors = [];
        if (!pathItem || typeof pathItem !== "object") {
            return { valid: false, errors: ["Konten learning path harus berupa objek valid."] };
        }
        if (!pathItem.id || typeof pathItem.id !== "string") errors.push("ID learning path wajib diisi.");
        if (!pathItem.title || typeof pathItem.title !== "string") errors.push("Judul learning path wajib diisi.");

        return { valid: errors.length === 0, errors };
    }

    function validateProject(project) {
        const errors = [];
        if (!project || typeof project !== "object") {
            return { valid: false, errors: ["Konten project harus berupa objek valid."] };
        }
        if (!project.id || typeof project.id !== "string") errors.push("ID project wajib diisi.");
        if (!project.title || typeof project.title !== "string" || !project.title.trim()) errors.push("Judul project tidak boleh kosong.");

        return { valid: errors.length === 0, errors };
    }

    function validateCulture(place) {
        const errors = [];
        if (!place || typeof place !== "object") {
            return { valid: false, errors: ["Konten culture harus berupa objek valid."] };
        }
        if (!place.id || typeof place.id !== "string") errors.push("ID culture wajib diisi.");
        if (!place.name && !place.title) errors.push("Nama destinasi/budaya wajib diisi.");

        return { valid: errors.length === 0, errors };
    }

    function validateBook(book) {
        const errors = [];
        if (!book || typeof book !== "object") {
            return { valid: false, errors: ["Konten buku harus berupa objek valid."] };
        }
        if (!book.id || typeof book.id !== "string") errors.push("ID buku wajib diisi.");
        if (!book.title || typeof book.title !== "string") errors.push("Judul buku wajib diisi.");

        return { valid: errors.length === 0, errors };
    }

    /**
     * Fallback States for Error Isolation
     */
    function getFallbackQuiz(id, errorReason) {
        return {
            id: id || "fallback-quiz",
            question: "Konten soal tidak dapat dimuat.",
            options: ["Mohon periksa kembali nanti", "Coba segarkan halaman"],
            correctAnswer: 0,
            explanation: errorReason || "Terjadi kendala saat memuat data soal dari server.",
            skills: ["general"],
            difficulty: "easy",
            status: "published",
            version: 1,
            isFallback: true
        };
    }

    function getFallbackLesson(id, errorReason) {
        return {
            id: id || "fallback-lesson",
            title: "Materi Tidak Tersedia",
            description: errorReason || "Materi pembelajaran gagal dimuat.",
            category: "general",
            skills: ["general"],
            prerequisites: [],
            difficulty: 1,
            contentBlocks: [
                {
                    type: "html",
                    data: `<div class="p-4 bg-amber-50 text-amber-800 rounded-lg border border-amber-200 font-sans">
                        <p class="font-bold mb-1">Materi Sedang Dalam Pemeliharaan</p>
                        <p class="text-sm">${errorReason || "Format data materi ini tidak valid atau tidak ditemukan."}</p>
                    </div>`
                }
            ],
            quizIds: [],
            estimatedMinutes: 5,
            rewards: { xp: 0, coins: 0 },
            status: "published",
            version: 1,
            isFallback: true
        };
    }

    function getFallbackProject(id, errorReason) {
        return {
            id: id || "fallback-project",
            title: "Proyek Tidak Tersedia",
            objectives: ["Proyek belum dapat ditampilkan saat ini."],
            skills: ["general"],
            prerequisites: [],
            steps: [],
            rubric: [],
            rewards: { xp: 0, coins: 0 },
            status: "published",
            version: 1,
            isFallback: true
        };
    }

    /**
     * Core Content Engine API
     */
    const ContentEngine = {
        ENGINE_VERSION: engineVersion,

        normalizeDomain,
        validateQuiz,
        validateLesson,
        validateLearningPath,
        validateProject,
        validateCulture,
        validateBook,

        getFallbackQuiz,
        getFallbackLesson,
        getFallbackProject,

        /**
         * Register / Load batch content items into registry
         */
        registerContent(domain, items) {
            const normDomain = normalizeDomain(domain);
            if (!registry[normDomain]) {
                registry[normDomain] = new Map();
            }
            if (!Array.isArray(items)) return 0;

            let loadedCount = 0;
            items.forEach(item => {
                if (!item || !item.id) return;
                item.status = item.status || "published";
                item.version = typeof item.version === "number" ? item.version : 1;
                registry[normDomain].set(item.id, item);
                loadedCount++;
            });
            lastUpdated = Date.now();
            return loadedCount;
        },

        getQuiz(id) {
            if (!id) return getFallbackQuiz("unknown", "ID kuis tidak diberikan.");
            const quiz = registry.quizzes.get(id);
            if (!quiz) return getFallbackQuiz(id, `Soal dengan ID '${id}' tidak ditemukan.`);

            const validation = validateQuiz(quiz);
            if (!validation.valid) {
                return getFallbackQuiz(id, `Soal invalid: ${validation.errors.join(", ")}`);
            }
            return quiz;
        },

        getQuestions(options = {}) {
            const { category = null, difficulty = null, limit = 10, skill = null, search = null } = options;
            let questions = [];

            registry.quizzes.forEach(quiz => {
                if (quiz.status === "draft") return;

                if (Array.isArray(quiz.questions)) {
                    quiz.questions.forEach(subQ => {
                        questions.push({
                            ...subQ,
                            category: quiz.category || subQ.category || 'general',
                            trackId: quiz.trackId,
                            chapterId: quiz.chapterId
                        });
                    });
                } else if (quiz.question && (quiz.options || quiz.answers)) {
                    questions.push(quiz);
                }
            });

            if (category && category !== "all") {
                questions = questions.filter(q => {
                    const c = (q.category || q.subject || '').toLowerCase();
                    return c === category.toLowerCase();
                });
            }

            if (difficulty && difficulty !== "all") {
                questions = questions.filter(q => {
                    const d = String(q.difficulty || '').toLowerCase();
                    return d === String(difficulty).toLowerCase();
                });
            }

            if (skill) {
                questions = questions.filter(q => {
                    if (Array.isArray(q.skills)) {
                        return q.skills.some(s => String(s).toLowerCase().includes(skill.toLowerCase()));
                    }
                    return false;
                });
            }

            if (search && search.trim()) {
                const term = search.trim().toLowerCase();
                questions = questions.filter(q => {
                    const prompt = (q.question || q.prompt || '').toLowerCase();
                    return prompt.includes(term) || q.id.toLowerCase().includes(term);
                });
            }

            if (typeof limit === "number" && limit > 0 && questions.length > limit) {
                return questions.slice(0, limit);
            }

            return questions;
        },

        getLesson(id) {
            if (!id) return getFallbackLesson("unknown", "ID materi tidak diberikan.");
            const lesson = registry.lessons.get(id);
            if (!lesson) return getFallbackLesson(id, `Materi dengan ID '${id}' tidak ditemukan.`);

            const validation = validateLesson(lesson);
            if (!validation.valid) {
                return getFallbackLesson(id, `Materi invalid: ${validation.errors.join(", ")}`);
            }
            return lesson;
        },

        getLearningPath(id) {
            if (!id) return null;
            return registry.learningPaths.get(id) || null;
        },

        getProject(id) {
            if (!id) return getFallbackProject("unknown", "ID proyek tidak diberikan.");
            const project = registry.projects.get(id);
            if (!project) return getFallbackProject(id, `Proyek dengan ID '${id}' tidak ditemukan.`);

            const validation = validateProject(project);
            if (!validation.valid) {
                return getFallbackProject(id, `Proyek invalid: ${validation.errors.join(", ")}`);
            }
            return project;
        },

        getCulture(id) {
            if (!id) return null;
            return registry.culture.get(id) || null;
        },

        getBook(id) {
            if (!id) return null;
            return registry.books.get(id) || null;
        },

        getAll(domain, options = {}) {
            const normDomain = normalizeDomain(domain);
            const domainMap = registry[normDomain];
            if (!domainMap) return [];

            const items = Array.from(domainMap.values());
            const includeDrafts = Boolean(options.includeDrafts);

            let filtered = items.filter(item => {
                if (!includeDrafts && item.status === "draft") return false;
                if (options.category && options.category !== "all") {
                    const c = (item.category || item.subject || "").toLowerCase();
                    if (c !== options.category.toLowerCase()) return false;
                }
                if (options.difficulty && options.difficulty !== "all") {
                    const d = String(item.difficulty || "").toLowerCase();
                    if (d !== String(options.difficulty).toLowerCase()) return false;
                }
                if (options.skill) {
                    if (!Array.isArray(item.skills) || !item.skills.some(s => String(s).toLowerCase().includes(options.skill.toLowerCase()))) {
                        return false;
                    }
                }
                if (options.search && options.search.trim()) {
                    const term = options.search.trim().toLowerCase();
                    const title = (item.title || item.name || item.question || item.prompt || "").toLowerCase();
                    const desc = (item.description || item.explanation || item.synopsis || "").toLowerCase();
                    if (!title.includes(term) && !desc.includes(term) && !item.id.toLowerCase().includes(term)) {
                        return false;
                    }
                }
                return true;
            });

            if (typeof options.offset === "number" && options.offset > 0) {
                filtered = filtered.slice(options.offset);
            }
            if (typeof options.limit === "number" && options.limit > 0) {
                filtered = filtered.slice(0, options.limit);
            }

            return filtered;
        },

        /**
         * Comprehensive Diagnostic & Quality Validation Audit across all 7 dimensions
         */
        validateAll() {
            const report = {
                valid: true,
                totalItems: 0,
                counts: {},
                errors: [],
                warnings: [],
                duplicates: [],
                invalidCorrectAnswers: [],
                missingExplanations: [],
                missingSkills: [],
                invalidPrerequisites: [],
                brokenQuizReferences: [],
                brokenProjectReferences: []
            };

            const allIDs = new Set();
            const allLessonIDs = new Set();
            const allQuizIDs = new Set();
            const allProjectIDs = new Set();

            // First pass: register IDs
            Object.keys(registry).forEach(domain => {
                const domainMap = registry[domain];
                report.counts[domain] = domainMap.size;
                domainMap.forEach((item, id) => {
                    report.totalItems++;
                    if (domain === "lessons") allLessonIDs.add(id);
                    if (domain === "quizzes") allQuizIDs.add(id);
                    if (domain === "projects") allProjectIDs.add(id);

                    if (allIDs.has(id)) {
                        report.valid = false;
                        report.duplicates.push({ domain, id });
                        report.errors.push(`[Duplicate ID] ID '${id}' terdaftar di lebih dari satu entitas.`);
                    } else {
                        allIDs.add(id);
                    }
                });
            });

            // Second pass: validate schemas and relations
            Object.keys(registry).forEach(domain => {
                const domainMap = registry[domain];
                domainMap.forEach((item, id) => {
                    if (domain === "quizzes") {
                        const val = validateQuiz(item);
                        if (!val.valid) {
                            report.valid = false;
                            val.errors.forEach(err => report.errors.push(`[Quiz ${id}] ${err}`));
                        }
                    } else if (domain === "lessons") {
                        const val = validateLesson(item);
                        if (!val.valid) {
                            report.valid = false;
                            val.errors.forEach(err => report.errors.push(`[Lesson ${id}] ${err}`));
                        }
                        // Check quiz references
                        if (Array.isArray(item.quizIds)) {
                            item.quizIds.forEach(qId => {
                                if (!allQuizIDs.has(qId)) {
                                    report.brokenQuizReferences.push({ lessonId: id, quizId: qId });
                                    report.warnings.push(`[Broken Quiz Ref] Lesson '${id}' merujuk kuis '${qId}' yang tidak ditemukan.`);
                                }
                            });
                        }
                    } else if (domain === "projects") {
                        const val = validateProject(item);
                        if (!val.valid) {
                            report.valid = false;
                            val.errors.forEach(err => report.errors.push(`[Project ${id}] ${err}`));
                        }
                    }
                });
            });

            // Check prerequisites
            registry.lessons.forEach((lesson, id) => {
                if (Array.isArray(lesson.prerequisites)) {
                    lesson.prerequisites.forEach(prereqId => {
                        if (!allIDs.has(prereqId)) {
                            report.valid = false;
                            report.invalidPrerequisites.push({ itemId: id, prereqId });
                            report.errors.push(`[Invalid Prereq] Lesson '${id}' memiliki prasyarat '${prereqId}' yang belum terdaftar.`);
                        }
                    });
                }
            });

            registry.projects.forEach((proj, id) => {
                if (Array.isArray(proj.prerequisites)) {
                    proj.prerequisites.forEach(prereqId => {
                        if (!allIDs.has(prereqId)) {
                            report.valid = false;
                            report.invalidPrerequisites.push({ itemId: id, prereqId });
                            report.errors.push(`[Invalid Prereq] Proyek '${id}' memiliki prasyarat '${prereqId}' yang belum terdaftar.`);
                        }
                    });
                }
            });

            return report;
        },

        importBundle(bundle) {
            if (!bundle || typeof bundle !== "object") {
                return { success: false, message: "Format bundle tidak valid." };
            }

            let importedCount = 0;
            const domains = ["lessons", "quizzes", "learningPaths", "projects", "culture", "books"];
            domains.forEach(d => {
                const list = bundle[d] || bundle[normalizeDomain(d)];
                if (Array.isArray(list)) {
                    importedCount += this.registerContent(d, list);
                }
            });

            return { success: true, importedCount };
        },

        exportAll() {
            const bundle = {};
            Object.keys(registry).forEach(domain => {
                bundle[domain] = Array.from(registry[domain].values());
            });
            return bundle;
        },

        getMeta() {
            return {
                version: engineVersion,
                lastUpdated,
                counts: {
                    quizzes: registry.quizzes.size,
                    lessons: registry.lessons.size,
                    learningPaths: registry.learningPaths.size,
                    projects: registry.projects.size,
                    culture: registry.culture.size,
                    books: registry.books.size
                }
            };
        }
    };

    return ContentEngine;
}));
