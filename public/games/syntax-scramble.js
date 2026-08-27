/**
 * Universe of Tech - Code & Syntax Scramble Puzzle
 * FASE 4 - Reusable Interactive Code Sequencing Challenge
 */

(function (global) {
    "use strict";

    const GameCore = (typeof global.GameCore !== "undefined") ? global.GameCore : (typeof require !== "undefined" ? require("./game-core.js") : null);

    const CODE_PUZZLES = {
        js_async: {
            title: "JavaScript: Async / Await Fetch",
            description: "Susun baris fungsi async berikut agar dapat memanggil API dan mengembalikan JSON dengan aman.",
            lines: [
                "async function getUserProfile(userId) {",
                "    const response = await fetch(`/api/users/${userId}`);",
                "    if (!response.ok) {",
                "        throw new Error('Gagal mengambil profil');",
                "    }",
                "    const data = await response.json();",
                "    return data;",
                "}"
            ]
        },
        css_center: {
            title: "CSS: Flexbox Perfect Centering",
            description: "Susun aturan CSS untuk memusatkan elemen secara vertikal dan horizontal di tengah layar.",
            lines: [
                ".hero-modal {",
                "    display: flex;",
                "    justify-content: center;",
                "    align-items: center;",
                "    min-height: 100vh;",
                "}"
            ]
        },
        sql_query: {
            title: "SQL: Urutan Klausa Query",
            description: "Susun klausa SQL sesuai tata urutan eksekusi standar basis data relasional.",
            lines: [
                "SELECT nama_lengkap, email, skor_xp",
                "FROM pengguna_aktif",
                "WHERE status = 'verified' AND skor_xp > 100",
                "ORDER BY skor_xp DESC",
                "LIMIT 5;"
            ]
        },
        binary_search: {
            title: "Algoritma: Binary Search",
            description: "Susun langkah-langkah pencarian biner pada array terurut dari awal hingga selesai.",
            lines: [
                "Inisialisasi pointer left = 0 dan right = arr.length - 1",
                "Hitung indeks tengah mid = Math.floor((left + right) / 2)",
                "Bandingkan apakah arr[mid] sama dengan nilai target yang dicari",
                "Jika target < arr[mid], geser batas kanan right = mid - 1",
                "Jika target > arr[mid], geser batas kiri left = mid + 1",
                "Ulangi perulangan selama left <= right, kembalikan -1 jika tidak ada"
            ]
        }
    };

    function shuffle(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    class SyntaxScrambleGame {
        constructor(options = {}) {
            this.engine = options.gameCoreEngine || (GameCore ? GameCore.createEngine(options) : null);
            this.puzzleId = options.puzzleId || "js_async";
            this.difficulty = options.difficulty || "normal";
            this.onStateChange = options.onStateChange || null;
            this.onFinish = options.onFinish || null;

            this.state = {
                status: "idle",
                items: [], // Array of { id, text, originalIndex }
                selectedIndex: null,
                moves: 0,
                score: 0,
                hintsLeft: 1,
                hintsUsed: 0,
                isCompleted: false,
                validationResult: null,
                timeRemaining: 60,
                totalTime: 60,
                startTime: 0,
                timerInterval: null
            };
        }

        start(puzzleId = this.puzzleId, difficulty = this.difficulty) {
            this.puzzleId = puzzleId;
            this.difficulty = difficulty;
            const diffConfig = GameCore.DIFFICULTY[difficulty] || GameCore.DIFFICULTY.normal;
            const puzzle = CODE_PUZZLES[puzzleId] || CODE_PUZZLES.js_async;

            const originalLines = puzzle.lines;
            const itemsWithOriginal = originalLines.map((line, idx) => ({
                id: `line_${idx}`,
                text: line,
                originalIndex: idx
            }));

            // Shuffle until different from original
            let shuffled = shuffle(itemsWithOriginal);
            if (shuffled.every((item, i) => item.originalIndex === i) && itemsWithOriginal.length > 1) {
                shuffled = [shuffled[1], shuffled[0], ...shuffled.slice(2)];
            }

            const totalTime = Math.round(originalLines.length * 15 * diffConfig.timeMultiplier);

            this.state = {
                status: "playing",
                title: puzzle.title,
                description: puzzle.description,
                puzzleId,
                difficulty,
                totalLines: originalLines.length,
                items: shuffled,
                selectedIndex: null,
                moves: 0,
                score: 0,
                hintsLeft: diffConfig.hintsAllowed,
                hintsUsed: 0,
                isCompleted: false,
                validationResult: null,
                timeRemaining: totalTime,
                totalTime,
                startTime: Date.now(),
                timerInterval: null
            };

            this.startTimer();
            this.notify();
            return this.getState();
        }

        startTimer() {
            if (this.state.timerInterval) clearInterval(this.state.timerInterval);
            if (typeof setInterval !== "undefined") {
                this.state.timerInterval = setInterval(() => {
                    if (this.state.status !== "playing") {
                        clearInterval(this.state.timerInterval);
                        return;
                    }
                    this.state.timeRemaining -= 1;
                    if (this.state.timeRemaining <= 0) {
                        this.state.timeRemaining = 0;
                        this.handleFinish(false);
                    } else {
                        this.notify();
                    }
                }, 1000);
            }
        }

        stopTimer() {
            if (this.state.timerInterval) {
                clearInterval(this.state.timerInterval);
                this.state.timerInterval = null;
            }
        }

        moveItem(fromIndex, toIndex) {
            if (this.state.status !== "playing") return false;
            if (fromIndex < 0 || fromIndex >= this.state.items.length) return false;
            if (toIndex < 0 || toIndex >= this.state.items.length) return false;
            if (fromIndex === toIndex) return false;

            const items = [...this.state.items];
            const [moved] = items.splice(fromIndex, 1);
            items.splice(toIndex, 0, moved);

            this.state.items = items;
            this.state.moves += 1;
            this.state.selectedIndex = null;
            this.state.validationResult = null;
            this.engine?.playSound("click");

            this.notify();
            return true;
        }

        swapItems(indexA, indexB) {
            if (this.state.status !== "playing") return false;
            if (indexA < 0 || indexA >= this.state.items.length) return false;
            if (indexB < 0 || indexB >= this.state.items.length) return false;
            if (indexA === indexB) return false;

            const items = [...this.state.items];
            const temp = items[indexA];
            items[indexA] = items[indexB];
            items[indexB] = temp;

            this.state.items = items;
            this.state.moves += 1;
            this.state.selectedIndex = null;
            this.state.validationResult = null;
            this.engine?.playSound("click");

            this.notify();
            return true;
        }

        selectItem(index) {
            if (this.state.status !== "playing") return;
            if (this.state.selectedIndex === null) {
                this.state.selectedIndex = index;
                this.engine?.playSound("select");
            } else {
                const prev = this.state.selectedIndex;
                if (prev !== index) {
                    this.swapItems(prev, index);
                } else {
                    this.state.selectedIndex = null;
                }
            }
            this.notify();
        }

        useHint() {
            if (this.state.status !== "playing") return false;
            if (this.state.hintsLeft <= 0) return false;

            // Find first displaced item and move it to correct index
            const displacedIdx = this.state.items.findIndex((it, i) => it.originalIndex !== i);
            if (displacedIdx === -1) return false;

            const correctItemIdx = this.state.items.findIndex(it => it.originalIndex === displacedIdx);
            if (correctItemIdx !== -1) {
                this.swapItems(displacedIdx, correctItemIdx);
                this.state.hintsLeft -= 1;
                this.state.hintsUsed += 1;
                this.notify();
                return true;
            }
            return false;
        }

        checkOrder() {
            if (this.state.status !== "playing") return;

            let correctCount = 0;
            this.state.items.forEach((item, index) => {
                if (item.originalIndex === index) correctCount += 1;
            });

            const isAllCorrect = correctCount === this.state.items.length;

            if (isAllCorrect) {
                this.handleFinish(true);
            } else {
                this.state.validationResult = {
                    passed: false,
                    correctCount,
                    totalCount: this.state.items.length,
                    message: `${correctCount} dari ${this.state.items.length} baris sudah tepat urutannya.`
                };
                this.engine?.playSound("wrong");
                this.notify();
            }

            return this.state.validationResult;
        }

        handleFinish(won) {
            this.stopTimer();
            this.state.status = "completed";
            const elapsed = Math.max(1, Math.round((Date.now() - this.state.startTime) / 1000));

            let correctCount = 0;
            this.state.items.forEach((item, index) => {
                if (item.originalIndex === index) correctCount += 1;
            });

            const accuracy = correctCount / this.state.items.length;
            const basePoints = Math.round(correctCount * 15);
            const timeBonus = won ? Math.max(0, Math.round(this.state.timeRemaining * 1.5)) : 0;
            const moveEfficiency = Math.max(0, (this.state.totalLines * 3 - this.state.moves) * 2);

            this.state.score = basePoints + timeBonus + moveEfficiency;
            const maxPossible = (this.state.totalLines * 15) + Math.round(this.state.totalTime * 1.5) + (this.state.totalLines * 6);

            const result = this.engine?.finishGame({
                gameId: `syntax_${this.puzzleId}`,
                title: `Susun Kode: ${this.state.title}`,
                difficulty: this.difficulty,
                score: this.state.score,
                maxScore: maxPossible,
                accuracy,
                durationSeconds: elapsed,
                hintsUsed: this.state.hintsUsed,
                category: "syntax_scramble"
            });

            if (won) {
                this.engine?.playSound("win");
            }
            this.notify();
            if (this.onFinish) this.onFinish(result);
            return result;
        }

        getState() {
            return {
                ...this.state,
                isFinished: this.state.status === "completed"
            };
        }

        notify() {
            if (this.onStateChange) {
                this.onStateChange(this.getState());
            }
        }
    }

    const SyntaxScrambleModule = {
        CODE_PUZZLES,
        createGame(options) {
            return new SyntaxScrambleGame(options);
        }
    };

    if (typeof module !== "undefined" && module.exports) {
        module.exports = SyntaxScrambleModule;
    }
    if (typeof window !== "undefined") {
        window.SyntaxScrambleModule = SyntaxScrambleModule;
    }
})(typeof globalThis !== "undefined" ? globalThis : this);
