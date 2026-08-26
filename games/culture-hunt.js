/**
 * Universe of Tech - Culture & Tech Treasure Clue Hunt
 * FASE 4 - Modular Educational Deduction & Exploration Game
 */

(function (global) {
    "use strict";

    const GameCore = (typeof global.GameCore !== "undefined") ? global.GameCore : (typeof require !== "undefined" ? require("./game-core.js") : null);

    const CLUE_BANKS = {
        nusantara: {
            title: "Petualangan Budaya Nusantara",
            items: [
                {
                    id: "borobudur",
                    title: "Candi Borobudur",
                    region: "Jawa Tengah",
                    riddle: "Monumen Buddha terbesar di dunia yang dibangun pada masa dinasti Syailendra dengan ratusan relief karmawibhangga dan stupa megah.",
                    hint: "Berada di Kabupaten Magelang dekat Sungai Progo dan Elo.",
                    options: ["Candi Borobudur", "Candi Prambanan", "Candi Muara Takus", "Candi Sukuh"]
                },
                {
                    id: "gadang_rendang",
                    title: "Rumah Gadang & Rendang",
                    region: "Sumatera Barat",
                    riddle: "Arsitektur atap melengkung menyerupai tanduk kerbau (gonjong) dan tradisi kuliner rempah dunia yang dimasak perlahan dengan santan kelapa.",
                    hint: "Khas kebudayaan Minangkabau bersistem matrilineal.",
                    options: ["Rumah Gadang & Rendang", "Rumah Tongkonan & Coto", "Rumah Joglo & Gudeg", "Rumah Honai & Papeda"]
                },
                {
                    id: "angklung",
                    title: "Angklung & Wayang Golek",
                    region: "Jawa Barat",
                    riddle: "Alat musik bambu bernada diatonis yang dimainkan dengan cara digetarkan, diakui UNESCO sebagai Warisan Budaya Takbenda Dunia.",
                    hint: "Kesenian khas Tanah Pasundan Sunda.",
                    options: ["Angklung & Wayang Golek", "Gamelan Degung", "Sasando Rote", "Kolintang Minahasa"]
                },
                {
                    id: "sasando",
                    title: "Sasando & Rote",
                    region: "Nusa Tenggara Timur",
                    riddle: "Alat musik petik dawai berdinding tabung bambu yang dilingkari wadah anyaman daun lontar untuk memperkuat resonansi suara merdu.",
                    hint: "Berasal dari Pulau Rote di ujung selatan Nusantara.",
                    options: ["Sasando", "Sape", "Geso-geso", "Talempong"]
                },
                {
                    id: "kecak",
                    title: "Tari Kecak & Pura Besakih",
                    region: "Bali",
                    riddle: "Tarian sakral tanpa iringan gamelan fisik melainkan paduan suara puluhan pria bertelanjang dada meneriakkan ritme 'Cak-cak-cak'.",
                    hint: "Sering dipentaskan di tebing Uluwatu saat matahari terbenam.",
                    options: ["Tari Kecak", "Tari Pendet", "Tari Saman", "Tari Piring"]
                },
                {
                    id: "toraja",
                    title: "Tongkonan & Tradisi Rambu Solo",
                    region: "Sulawesi Selatan",
                    riddle: "Rumah adat berbentuk perahu dengan hiasan tanduk kerbau berjejer dan ritual pemakaman leluhur megah di tebing batu pahat.",
                    hint: "Kawasan dataran tinggi Tana Toraja.",
                    options: ["Tongkonan Toraja", "Lamin Dayak", "Rumah Baileo", "Rumah Honai"]
                },
                {
                    id: "saman",
                    title: "Tari Saman Seribu Tangan",
                    region: "Aceh",
                    riddle: "Tarian kecepatan tepukan dada dan paha secara serempak oleh puluhan penari berbaris rapat, mencerminkan kekompakan dan zikir.",
                    hint: "Berasal dari dataran tinggi Gayo di Serambi Mekkah.",
                    options: ["Tari Saman", "Tari Seudati", "Tari Zapin", "Tari Tor-Tor"]
                }
            ]
        },
        tech_history: {
            title: "Jejak Pelopor Teknologi & Web",
            items: [
                {
                    id: "ada_lovelace",
                    title: "Ada Lovelace",
                    region: "Pionir Komputasi",
                    riddle: "Matematikawan abad ke-19 yang menulis algoritma pertama untuk Mesin Analitis Babbage, dinobatkan sebagai programmer komputer pertama di dunia.",
                    hint: "Bekerja sama dengan Charles Babbage dan meramalkan musik komputer.",
                    options: ["Ada Lovelace", "Grace Hopper", "Alan Turing", "Margaret Hamilton"]
                },
                {
                    id: "tim_berners_lee",
                    title: "Sir Tim Berners-Lee",
                    region: "Arsitek Web",
                    riddle: "Ilmuwan CERN yang menciptakan World Wide Web (WWW), protokol HTTP, format HTML, dan browser pertama pada tahun 1989.",
                    hint: "Membuat web dapat diakses gratis oleh seluruh umat manusia.",
                    options: ["Sir Tim Berners-Lee", "Vint Cerf", "Marc Andreessen", "Linus Torvalds"]
                },
                {
                    id: "alan_turing",
                    title: "Alan Turing",
                    region: "Bapak Ilmu Komputer",
                    riddle: "Ilmuwan jenius yang memecahkan kode Enigma dan meletakkan landasan teoritis mesin komputasi universal serta kecerdasan buatan.",
                    hint: "Dikenal dengan 'Turing Test' untuk menguji kecerdasan mesin.",
                    options: ["Alan Turing", "John von Neumann", "Claude Shannon", "Dennis Ritchie"]
                },
                {
                    id: "linus_torvalds",
                    title: "Linus Torvalds",
                    region: "Open Source & Kernel",
                    riddle: "Insinyur perangkat lunak yang mengembangkan kernel Linux open source saat mahasiswa dan kemudian menciptakan sistem kendali versi Git.",
                    hint: "Pencetus maskot pinguin Tux.",
                    options: ["Linus Torvalds", "Richard Stallman", "Ken Thompson", "Guido van Rossum"]
                },
                {
                    id: "brendan_eich",
                    title: "Brendan Eich",
                    region: "Bahasa Pemrograman Web",
                    riddle: "Pencipta bahasa pemrograman JavaScript yang dibuat hanya dalam waktu 10 hari saat bekerja di Netscape Communications pada tahun 1995.",
                    hint: "Juga merupakan salah satu pendiri Mozilla Foundation.",
                    options: ["Brendan Eich", "James Gosling", "Bjarne Stroustrup", "Anders Hejlsberg"]
                },
                {
                    id: "edgar_codd",
                    title: "Edgar F. Codd",
                    region: "Sistem Basis Data",
                    riddle: "Pencetus model relasional basis data (RDBMS) dan 12 aturan normalisasi yang menjadi pondasi bahasa query terstruktur SQL.",
                    hint: "Bekerja sebagai peneliti di IBM Research.",
                    options: ["Edgar F. Codd", "Peter Chen", "Donald Knuth", "Michael Stonebraker"]
                }
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

    class CultureHuntGame {
        constructor(options = {}) {
            this.engine = options.gameCoreEngine || (GameCore ? GameCore.createEngine(options) : null);
            this.category = options.category || "nusantara";
            this.difficulty = options.difficulty || "normal";
            this.onStateChange = options.onStateChange || null;
            this.onFinish = options.onFinish || null;

            this.state = {
                status: "idle",
                clues: [],
                currentIndex: 0,
                score: 0,
                correctCount: 0,
                streak: 0,
                hintsLeft: 2,
                hintsUsed: 0,
                isHintActive: false,
                answeredCurrent: false,
                lastAnswerCorrect: null,
                timeRemaining: 60,
                totalTime: 60,
                startTime: 0,
                timerInterval: null
            };
        }

        start(category = this.category, difficulty = this.difficulty) {
            this.category = category;
            this.difficulty = difficulty;
            const diffConfig = GameCore.DIFFICULTY[difficulty] || GameCore.DIFFICULTY.normal;
            const bank = CLUE_BANKS[category] || CLUE_BANKS.nusantara;

            let count = 4;
            if (difficulty === "easy") count = 3;
            else if (difficulty === "normal") count = 5;
            else if (difficulty === "hard") count = Math.min(7, bank.items.length);

            const clues = shuffle(bank.items).slice(0, count).map(item => ({
                ...item,
                shuffledOptions: shuffle(item.options)
            }));

            const totalTime = Math.round(count * 18 * diffConfig.timeMultiplier);

            this.state = {
                status: "playing",
                title: bank.title,
                category,
                difficulty,
                totalClues: clues.length,
                clues,
                currentIndex: 0,
                score: 0,
                correctCount: 0,
                streak: 0,
                hintsLeft: diffConfig.hintsAllowed,
                hintsUsed: 0,
                isHintActive: false,
                answeredCurrent: false,
                lastAnswerCorrect: null,
                selectedOption: null,
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
                        this.handleFinish();
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

        getCurrentClue() {
            if (this.state.currentIndex >= this.state.clues.length) return null;
            return this.state.clues[this.state.currentIndex];
        }

        useHint() {
            if (this.state.status !== "playing") return false;
            if (this.state.hintsLeft <= 0 || this.state.isHintActive) return false;

            this.state.hintsLeft -= 1;
            this.state.hintsUsed += 1;
            this.state.isHintActive = true;
            this.engine?.playSound("select");
            this.notify();
            return true;
        }

        submitAnswer(optionText) {
            if (this.state.status !== "playing") return { success: false, reason: "NOT_PLAYING" };
            if (this.state.answeredCurrent) return { success: false, reason: "ALREADY_ANSWERED" };

            const current = this.getCurrentClue();
            if (!current) return { success: false, reason: "NO_CLUE" };

            this.state.answeredCurrent = true;
            this.state.selectedOption = optionText;

            const isCorrect = (optionText.trim().toLowerCase() === current.title.trim().toLowerCase());
            this.state.lastAnswerCorrect = isCorrect;

            if (isCorrect) {
                this.state.correctCount += 1;
                this.state.streak += 1;
                const basePoints = 20;
                const streakBonus = (this.state.streak - 1) * 5;
                this.state.score += (basePoints + streakBonus);
                this.engine?.playSound("correct");
            } else {
                this.state.streak = 0;
                this.engine?.playSound("wrong");
            }

            this.notify();
            return {
                success: true,
                correct: isCorrect,
                correctAnswer: current.title,
                score: this.state.score,
                isLast: this.state.currentIndex >= this.state.clues.length - 1
            };
        }

        nextClue() {
            if (this.state.status !== "playing") return;
            if (!this.state.answeredCurrent) return;

            if (this.state.currentIndex + 1 >= this.state.clues.length) {
                this.handleFinish();
            } else {
                this.state.currentIndex += 1;
                this.state.answeredCurrent = false;
                this.state.lastAnswerCorrect = null;
                this.state.selectedOption = null;
                this.state.isHintActive = false;
                this.notify();
            }
        }

        handleFinish() {
            this.stopTimer();
            this.state.status = "completed";
            const elapsed = Math.max(1, Math.round((Date.now() - this.state.startTime) / 1000));
            const timeBonus = Math.max(0, Math.round(this.state.timeRemaining * 1.5));
            this.state.score += timeBonus;

            const accuracy = this.state.totalClues > 0 ? (this.state.correctCount / this.state.totalClues) : 0;
            const maxPossible = (this.state.totalClues * 25) + Math.round(this.state.totalTime * 1.5);

            const result = this.engine?.finishGame({
                gameId: `culture_hunt_${this.category}`,
                title: `Petualangan Petunjuk: ${this.state.title}`,
                difficulty: this.difficulty,
                score: this.state.score,
                maxScore: maxPossible,
                accuracy,
                durationSeconds: elapsed,
                hintsUsed: this.state.hintsUsed,
                category: "culture_hunt"
            });

            if (accuracy >= 0.6) {
                this.engine?.playSound("win");
            }
            this.notify();
            if (this.onFinish) this.onFinish(result);
            return result;
        }

        getState() {
            return {
                ...this.state,
                currentClue: this.getCurrentClue(),
                progress: `${this.state.currentIndex + 1}/${this.state.totalClues}`,
                isFinished: this.state.status === "completed"
            };
        }

        notify() {
            if (this.onStateChange) {
                this.onStateChange(this.getState());
            }
        }
    }

    const CultureHuntModule = {
        CLUE_BANKS,
        createGame(options) {
            return new CultureHuntGame(options);
        }
    };

    if (typeof module !== "undefined" && module.exports) {
        module.exports = CultureHuntModule;
    }
    if (typeof window !== "undefined") {
        window.CultureHuntModule = CultureHuntModule;
    }
})(typeof globalThis !== "undefined" ? globalThis : this);
