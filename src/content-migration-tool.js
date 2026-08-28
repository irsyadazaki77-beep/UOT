/**
 * UNIVERSE OF TECH - CONTENT MIGRATION TOOL (FASE 20)
 * Migrates all hardcoded legacy content into the single canonical Content Engine & CMS Store.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

class ContentMigrationTool {
    constructor(options = {}) {
        this.baseDir = options.baseDir || path.resolve(__dirname, '../public');
        this.contentDir = options.contentDir || path.resolve(__dirname, '../data/content');
        this.quizzes = new Map();
        this.lessons = new Map();
        this.learningPaths = new Map();
        this.projects = new Map();
        this.culture = new Map();
        this.books = new Map();
        this.stats = {
            quizzes: 0,
            lessons: 0,
            learningPaths: 0,
            projects: 0,
            culture: 0,
            books: 0,
            errors: [],
            warnings: []
        };
    }

    _createSandbox() {
        const sandbox = {
            window: {},
            global: {},
            localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
            CustomEvent: class {},
            console: { log: () => {}, warn: () => {}, error: () => {} },
            Date,
            Math
        };
        sandbox.global = sandbox;
        sandbox.window = sandbox;
        vm.createContext(sandbox);
        return sandbox;
    }

    _safeReadFile(filename) {
        const filePath = path.isAbsolute(filename) ? filename : path.join(this.baseDir, filename);
        if (fs.existsSync(filePath)) {
            return fs.readFileSync(filePath, 'utf8');
        }
        return null;
    }

    /**
     * 1. Extract quizzes from quiz-question-bank.js
     */
    extractQuizzes() {
        const code = this._safeReadFile('quiz-question-bank.js');
        if (!code) {
            this.stats.warnings.push('quiz-question-bank.js not found');
            return;
        }

        const sandbox = this._createSandbox();
        try {
            vm.runInContext(code, sandbox);
            const qBank = sandbox.window.questionBank || sandbox.questionBank || [];
            if (Array.isArray(qBank)) {
                for (const q of qBank) {
                    if (!q || !q.id) continue;
                    const options = q.options || q.answers || [];
                    const correctAnswer = typeof q.correctAnswer === 'number' ? q.correctAnswer : (typeof q.correct === 'number' ? q.correct : 0);
                    const category = q.category || q.subject || 'general';
                    const skills = Array.isArray(q.skills) && q.skills.length > 0 ? q.skills : [category];

                    this.quizzes.set(q.id, {
                        id: q.id,
                        question: q.question || q.prompt || 'Pertanyaan Kuis',
                        options: options.map(opt => String(opt).trim()),
                        correctAnswer,
                        explanation: q.explanation || 'Penjelasan untuk konsep kuis ini.',
                        hint: q.hint || '',
                        category,
                        subject: category,
                        difficulty: q.difficulty || 'medium',
                        skills,
                        tags: q.tags || [category],
                        source: 'quiz-question-bank',
                        status: 'published',
                        version: 1
                    });
                }
            }
        } catch (err) {
            this.stats.errors.push(`Error parsing quiz-question-bank.js: ${err.message}`);
        }
    }

    /**
     * 2. Extract curriculum, tracks, lessons, & chapter assessments from curriculum-data.js
     */
    extractCurriculum() {
        const code = this._safeReadFile('curriculum-data.js');
        if (!code) {
            this.stats.warnings.push('curriculum-data.js not found');
            return;
        }

        const sandbox = this._createSandbox();
        try {
            vm.runInContext(code, sandbox);
            const curr = sandbox.window.QNCurriculum;
            if (curr && Array.isArray(curr.tracks)) {
                for (const track of curr.tracks) {
                    if (!track || !track.id) continue;

                    // 2a. Register Learning Path / Track
                    const chapterIds = Array.isArray(track.chapters) ? track.chapters.map(c => c.id) : [];
                    this.learningPaths.set(track.id, {
                        id: track.id,
                        title: track.title || track.id,
                        description: track.description || `Jalur keahlian ${track.title}`,
                        category: track.category || track.id,
                        chapters: chapterIds,
                        totalChapters: chapterIds.length,
                        estimatedHours: track.estimatedHours || 10,
                        icon: track.icon || 'code',
                        color: track.color || '#3b82f6',
                        badge: track.badge || `${track.title} Specialist`,
                        status: 'published',
                        version: 1
                    });

                    // 2b. Register Chapters, Lessons, & Chapter Assessments
                    if (Array.isArray(track.chapters)) {
                        for (const chapter of track.chapters) {
                            if (!chapter || !chapter.id) continue;

                            // Chapter assessment quiz
                            if (chapter.assessment && Array.isArray(chapter.assessment.questions)) {
                                const quizId = `${chapter.id}-assessment`;
                                const assessmentQuestions = chapter.assessment.questions.map((q, idx) => ({
                                    id: q.id || `${chapter.id}-q${idx + 1}`,
                                    question: q.question || q.prompt || '',
                                    options: (q.options || []).map(opt => String(opt).trim()),
                                    correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : (typeof q.correctIndex === 'number' ? q.correctIndex : 0),
                                    explanation: q.explanation || 'Penjelasan pemahaman konsep.',
                                    difficulty: q.difficulty || 'medium',
                                    skills: [track.category || track.id],
                                    category: track.category || track.id,
                                    source: 'curriculum-assessment',
                                    status: 'published',
                                    version: 1
                                }));

                                // Register assessment as a combined quiz
                                this.quizzes.set(quizId, {
                                    id: quizId,
                                    title: chapter.assessment.title || `Asesmen Bab: ${chapter.title}`,
                                    chapterId: chapter.id,
                                    trackId: track.id,
                                    category: track.category || track.id,
                                    passingScore: chapter.assessment.passingScore || 80,
                                    questions: assessmentQuestions,
                                    questionCount: assessmentQuestions.length,
                                    status: 'published',
                                    version: 1
                                });

                                // Also index each individual question in quizzes if not conflicting
                                for (const qItem of assessmentQuestions) {
                                    if (!this.quizzes.has(qItem.id)) {
                                        this.quizzes.set(qItem.id, qItem);
                                    }
                                }
                            }

                            // Lessons
                            if (Array.isArray(chapter.lessons)) {
                                for (const lesson of chapter.lessons) {
                                    if (!lesson || !lesson.id) continue;
                                    const lessonSkills = [track.category || track.id, chapter.id];

                                    this.lessons.set(lesson.id, {
                                        id: lesson.id,
                                        title: lesson.title || lesson.id,
                                        chapterId: chapter.id,
                                        chapterTitle: chapter.title,
                                        trackId: track.id,
                                        category: track.category || track.id,
                                        skills: lessonSkills,
                                        description: lesson.description || `Materi pembelajaran: ${lesson.title}`,
                                        estimatedMinutes: lesson.estimatedMinutes || 10,
                                        difficulty: lesson.difficulty || 'medium',
                                        contentBlocks: lesson.contentBlocks || [
                                            {
                                                type: 'markdown',
                                                data: lesson.content || `# ${lesson.title}\n\nSelamat datang di modul ${lesson.title}. Pelajari konsep dan praktikkan langsung.`
                                            }
                                        ],
                                        sandboxConfig: lesson.sandboxConfig || null,
                                        status: 'published',
                                        version: 1
                                    });
                                }
                            }
                        }
                    }
                }
            }
        } catch (err) {
            this.stats.errors.push(`Error parsing curriculum-data.js: ${err.message}`);
        }
    }

    /**
     * 3. Extract projects from projects.js
     */
    extractProjects() {
        const code = this._safeReadFile('projects.js');
        if (!code) {
            this.stats.warnings.push('projects.js not found');
            return;
        }

        try {
            const match = code.match(/const projects = (\[[\s\S]*?\]);\s*const labels/);
            if (match) {
                const projs = eval(match[1]);
                if (Array.isArray(projs)) {
                    for (const p of projs) {
                        if (!p || !p.id) continue;
                        this.projects.set(p.id, {
                            id: p.id,
                            title: p.title || p.id,
                            description: p.description || '',
                            category: p.category || 'web',
                            difficulty: p.difficulty || 'medium',
                            duration: p.duration || '2-4 Jam',
                            skills: p.skills || [p.category || 'development'],
                            prerequisites: p.prerequisites || [],
                            steps: p.steps || [],
                            rubric: p.rubric || [],
                            rewards: { xp: p.xp || 120, coins: p.coins || 25 },
                            status: 'published',
                            version: 1
                        });
                    }
                }
            }
        } catch (err) {
            this.stats.errors.push(`Error parsing projects.js: ${err.message}`);
        }
    }

    /**
     * 4. Extract culture data from wonderful-data.js
     */
    extractCulture() {
        const code = this._safeReadFile('wonderful-data.js');
        if (!code) {
            this.stats.warnings.push('wonderful-data.js not found');
            return;
        }

        const sandbox = this._createSandbox();
        try {
            vm.runInContext(code, sandbox);
            const wData = sandbox.window.WonderfulData || {};
            const places = wData.places || [];
            for (const place of places) {
                if (!place || !place.id) continue;
                this.culture.set(place.id, {
                    id: place.id,
                    name: place.name || place.id,
                    title: place.name || place.id,
                    region: place.region || 'nusantara',
                    description: place.description || '',
                    category: place.category || 'budaya',
                    highlight: place.highlight || place.tagline || '',
                    tags: place.tags || [place.region || 'indonesia'],
                    rating: place.rating || 4.8,
                    status: 'published',
                    version: 1
                });
            }
        } catch (err) {
            this.stats.errors.push(`Error parsing wonderful-data.js: ${err.message}`);
        }
    }

    /**
     * 5. Extract digital library books from book-data.js & extensions
     */
    extractBooks() {
        const bookCode = this._safeReadFile('book-data.js');
        if (!bookCode) {
            this.stats.warnings.push('book-data.js not found');
            return;
        }

        const sandbox = this._createSandbox();
        try {
            const transformed = bookCode.replace('const BOOKS =', 'window.BOOKS =');
            vm.runInContext(transformed, sandbox);

            const extFiles = [
                'book-data-expansion.js',
                'book-data-varied.js',
                'book-metadata.js',
                'book-chapter-extension.js',
                'book-content-depth.js',
                'book-content-expanded.js'
            ];

            for (const f of extFiles) {
                const extCode = this._safeReadFile(f);
                if (extCode) {
                    try {
                        vm.runInContext(extCode, sandbox);
                    } catch (_) {}
                }
            }

            const booksList = sandbox.window.BOOKS || [];
            if (Array.isArray(booksList)) {
                for (const b of booksList) {
                    if (!b || !b.id) continue;
                    this.books.set(b.id, {
                        id: b.id,
                        title: b.title || b.id,
                        author: b.author || 'Tim Akademik Universe of Tech',
                        category: b.category || 'technology',
                        level: b.level || 'intermediate',
                        cover: b.cover || '',
                        pages: b.pages || 150,
                        readTime: b.readTime || '30 menit',
                        synopsis: b.synopsis || b.description || '',
                        chapters: b.chapters || [],
                        status: 'published',
                        version: 1
                    });
                }
            }
        } catch (err) {
            this.stats.errors.push(`Error parsing book-data.js: ${err.message}`);
        }
    }

    /**
     * 6. Merge existing data/content/*.json to avoid losing manual edits
     */
    mergeExistingJson() {
        const domainMap = {
            quizzes: this.quizzes,
            lessons: this.lessons,
            learningPaths: this.learningPaths,
            projects: this.projects,
            culture: this.culture,
            books: this.books
        };

        const fileMappings = [
            { domain: 'quizzes', file: 'quizzes.json' },
            { domain: 'lessons', file: 'lessons.json' },
            { domain: 'learningPaths', file: 'learning-paths.json' },
            { domain: 'projects', file: 'projects.json' },
            { domain: 'culture', file: 'culture.json' },
            { domain: 'books', file: 'books.json' }
        ];

        for (const mapping of fileMappings) {
            const filePath = path.join(this.contentDir, mapping.file);
            if (fs.existsSync(filePath)) {
                try {
                    const existing = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                    if (Array.isArray(existing)) {
                        const targetMap = domainMap[mapping.domain];
                        for (const item of existing) {
                            if (!item || !item.id) continue;
                            // Merge with existing properties preserved
                            const current = targetMap.get(item.id) || {};
                            targetMap.set(item.id, { ...current, ...item });
                        }
                    }
                } catch (err) {
                    this.stats.warnings.push(`Could not merge existing ${mapping.file}: ${err.message}`);
                }
            }
        }
    }

    /**
     * 7. Validate all extracted content items
     */
    validateAll() {
        const validation = {
            valid: true,
            totalItems: 0,
            duplicateIds: [],
            errors: []
        };

        const allIds = new Set();

        const validateCollection = (domain, map) => {
            for (const [id, item] of map.entries()) {
                validation.totalItems++;
                if (allIds.has(id)) {
                    // Check if identical item or across different domain
                    validation.duplicateIds.push({ domain, id });
                }
                allIds.add(id);

                if (domain === 'quizzes') {
                    if (Array.isArray(item.options)) {
                        if (item.options.length < 2 && !item.questions) {
                            validation.errors.push(`Quiz ${id} has fewer than 2 options.`);
                        }
                        if (typeof item.correctAnswer === 'number') {
                            if (item.correctAnswer < 0 || item.correctAnswer >= item.options.length) {
                                validation.errors.push(`Quiz ${id} correctAnswer out of range.`);
                            }
                        }
                    }
                }
            }
        };

        validateCollection('quizzes', this.quizzes);
        validateCollection('lessons', this.lessons);
        validateCollection('learningPaths', this.learningPaths);
        validateCollection('projects', this.projects);
        validateCollection('culture', this.culture);
        validateCollection('books', this.books);

        return validation;
    }

    /**
     * 8. Run full migration and write to disk
     */
    runMigration() {
        console.log('[Migration] Starting extraction of all content sources...');

        this.extractQuizzes();
        this.extractCurriculum();
        this.extractProjects();
        this.extractCulture();
        this.extractBooks();
        this.mergeExistingJson();

        if (!fs.existsSync(this.contentDir)) {
            fs.mkdirSync(this.contentDir, { recursive: true });
        }

        const domainData = {
            'quizzes.json': Array.from(this.quizzes.values()),
            'lessons.json': Array.from(this.lessons.values()),
            'learning-paths.json': Array.from(this.learningPaths.values()),
            'projects.json': Array.from(this.projects.values()),
            'culture.json': Array.from(this.culture.values()),
            'books.json': Array.from(this.books.values())
        };

        for (const [fileName, items] of Object.entries(domainData)) {
            const filePath = path.join(this.contentDir, fileName);
            fs.writeFileSync(filePath, JSON.stringify(items, null, 2), 'utf8');
        }

        this.stats.quizzes = this.quizzes.size;
        this.stats.lessons = this.lessons.size;
        this.stats.learningPaths = this.learningPaths.size;
        this.stats.projects = this.projects.size;
        this.stats.culture = this.culture.size;
        this.stats.books = this.books.size;

        console.log('[Migration] Content migration completed:');
        console.log(` - Quizzes: ${this.stats.quizzes} items`);
        console.log(` - Lessons: ${this.stats.lessons} items`);
        console.log(` - Learning Paths: ${this.stats.learningPaths} items`);
        console.log(` - Projects: ${this.stats.projects} items`);
        console.log(` - Culture: ${this.stats.culture} items`);
        console.log(` - Books: ${this.stats.books} items`);

        return {
            success: true,
            stats: this.stats,
            bundle: {
                quizzes: Array.from(this.quizzes.values()),
                lessons: Array.from(this.lessons.values()),
                learningPaths: Array.from(this.learningPaths.values()),
                projects: Array.from(this.projects.values()),
                culture: Array.from(this.culture.values()),
                books: Array.from(this.books.values())
            }
        };
    }
}

// CLI runner
if (require.main === module) {
    const migrator = new ContentMigrationTool();
    const result = migrator.runMigration();
    console.log('[Migration] Summary:', JSON.stringify(result.stats, null, 2));
}

module.exports = ContentMigrationTool;
