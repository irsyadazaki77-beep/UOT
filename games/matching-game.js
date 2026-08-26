/**
 * Universe of Tech - Matching Challenge Game Module
 * FASE 4 - Reusable Interactive Card & Term Matching
 */

(function (global) {
    "use strict";

    const GameCore = (typeof global.GameCore !== "undefined") ? global.GameCore : (typeof require !== "undefined" ? require("./game-core.js") : null);

    const TECH_DATA_BANKS = {
        html: {
            title: "HTML & Semantik Web",
            pairs: [
                { term: "<nav>", definition: "Navigasi utama situs web" },
                { term: "<main>", definition: "Konten utama dokumen halaman" },
                { term: "<section>", definition: "Bagian tematik yang berdiri sendiri" },
                { term: "<aside>", definition: "Konten pelengkap atau sidebar" },
                { term: "alt attribute", definition: "Teks pengganti gambar untuk aksesibilitas" },
                { term: "aria-live", definition: "Memberi sinyal perubahan dinamis ke screen reader" },
                { term: "<article>", definition: "Konten mandiri siap sindikasi/berita" },
                { term: "<header>", definition: "Pengantar halaman atau judul kelompok" }
            ]
        },
        css: {
            title: "CSS Modern & Tata Letak",
            pairs: [
                { term: "display: flex", definition: "Tata letak fleksibel satu dimensi" },
                { term: "grid-template-columns", definition: "Mendefinisikan kolom tata letak dua dimensi" },
                { term: "justify-content", definition: "Perataan elemen sepanjang sumbu utama" },
                { term: "align-items", definition: "Perataan elemen sepanjang sumbu silang" },
                { term: "position: sticky", definition: "Elemen menempel saat digulir mencapai batas" },
                { term: "z-index", definition: "Mengatur kedalaman tumpukan lapisan visual" },
                { term: "gap", definition: "Jarak konsisten antar elemen grid/flex" },
                { term: "clamp()", definition: "Nilai fleksibel dengan batas min dan maks" }
            ]
        },
        javascript: {
            title: "JavaScript & Logika Web",
            pairs: [
                { term: "Array.map()", definition: "Mentransformasi setiap item ke array baru" },
                { term: "Array.filter()", definition: "Menyaring elemen sesuai kriteria predikat" },
                { term: "Promise.all()", definition: "Menunggu beberapa operasi async selesai bersamaan" },
                { term: "localStorage", definition: "Menyimpan data tanpa batas waktu di browser" },
                { term: "JSON.parse()", definition: "Mengubah teks JSON menjadi objek JavaScript" },
                { term: "addEventListener", definition: "Mendaftarkan fungsi penangan interaksi event" },
                { term: "Array.reduce()", definition: "Mengakumulasi elemen array menjadi satu nilai" },
                { term: "async / await", definition: "Sintaks penanganan Promise yang mudah dibaca" }
            ]
        },
        database: {
            title: "Database & SQL Relasional",
            pairs: [
                { term: "SELECT", definition: "Mengambil kolom data dari tabel" },
                { term: "JOIN", definition: "Menggabungkan dua tabel berdasarkan relasi kunci" },
                { term: "WHERE", definition: "Menyaring baris data sesuai kondisi tertentu" },
                { term: "PRIMARY KEY", definition: "Kolom unik yang mengidentifikasi setiap baris" },
                { term: "GROUP BY", definition: "Mengelompokkan baris data untuk fungsi agregat" },
                { term: "INDEX", definition: "Struktur pembantu untuk mempercepat pencarian data" },
                { term: "FOREIGN KEY", definition: "Kunci referensi yang merujuk ke tabel lain" },
                { term: "ORDER BY", definition: "Mengurutkan hasil query naik atau turun" }
            ]
        }
    };

    const CULTURE_DATA_BANKS = {
        jawa: {
            title: "Bahasa Jawa & Unggah-Ungguh",
            pairs: [
                { term: "Matur Nuwun", definition: "Terima kasih" },
                { term: "Sugeng Enjang", definition: "Selamat pagi" },
                { term: "Nyuwun Pangapunten", definition: "Mohon maaf yang sebesar-besarnya" },
                { term: "Monggo", definition: "Silakan / Mari dipersilakan" },
                { term: "Nggih", definition: "Iya / Setuju secara santun" },
                { term: "Sami-sami", definition: "Sama-sama / Kembali" },
                { term: "Kersa", definition: "Berkenan / Bersedia" },
                { term: "Pripun Kabare?", definition: "Bagaimana kabarnya?" }
            ]
        },
        sunda: {
            title: "Bahasa Sunda & Kasopanan",
            pairs: [
                { term: "Hatur Nuhun", definition: "Terima kasih" },
                { term: "Wilujeng Sumping", definition: "Selamat datang" },
                { term: "Punten", definition: "Permisi / Maaf" },
                { term: "Kumaha Damang?", definition: "Bagaimana kabarnya?" },
                { term: "Muhun", definition: "Iya / Benar" },
                { term: "Sami-sami", definition: "Sama-sama" },
                { term: "Mangga", definition: "Silakan" },
                { term: "Wilujeng Enjing", definition: "Selamat pagi" }
            ]
        },
        minang: {
            title: "Bahasa Minangkabau",
            pairs: [
                { term: "Tarimo Kasih", definition: "Terima kasih" },
                { term: "Rancak Bana", definition: "Bagus / Indah sekali" },
                { term: "Baa Kabar?", definition: "Bagaimana kabar?" },
                { term: "Ondeh Mande", definition: "Ungkapan takjub atau heran" },
                { term: "Tambuah Ciek", definition: "Tambah satu porsi lagi" },
                { term: "Samo-samo", definition: "Sama-sama" },
                { term: "Mokasih Banyak", definition: "Terima kasih banyak" },
                { term: "Lamak Bana", definition: "Enak sekali (makanan)" }
            ]
        },
        bali: {
            title: "Bahasa Bali & Tradisi",
            pairs: [
                { term: "Matur Suksma", definition: "Terima kasih banyak" },
                { term: "Om Swastyastu", definition: "Salam panganjali umat Hindu" },
                { term: "Rahajeng Semeng", definition: "Selamat pagi" },
                { term: "Mewali", definition: "Sama-sama / Kembali" },
                { term: "Kenken Kabare?", definition: "Apa kabar?" },
                { term: "Becik-becik Gen", definition: "Baik-baik saja" },
                { term: "Nggih", definition: "Iya / Setuju" },
                { term: "Ampura", definition: "Mohon maaf" }
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

    class MatchingGame {
        constructor(options = {}) {
            this.engine = options.gameCoreEngine || (GameCore ? GameCore.createEngine(options) : null);
            this.category = options.category || "html";
            this.difficulty = options.difficulty || "normal";
            this.onStateChange = options.onStateChange || null;
            this.onFinish = options.onFinish || null;

            this.state = {
                status: "idle", // 'idle' | 'playing' | 'completed' | 'timeout'
                cards: [],
                selectedCardIndex: null,
                matchedPairIds: new Set(),
                moves: 0,
                hintsLeft: 1,
                hintsUsed: 0,
                combo: 0,
                maxCombo: 0,
                score: 0,
                timeRemaining: 60,
                totalTime: 60,
                startTime: 0,
                timerInterval: null
            };
        }

        getTopicBank(category) {
            return TECH_DATA_BANKS[category] || CULTURE_DATA_BANKS[category] || TECH_DATA_BANKS.html;
        }

        start(category = this.category, difficulty = this.difficulty) {
            this.category = category;
            this.difficulty = difficulty;
            const diffConfig = GameCore.DIFFICULTY[difficulty] || GameCore.DIFFICULTY.normal;
            const topic = this.getTopicBank(category);

            let pairCount = 4;
            if (difficulty === "easy") pairCount = 4;
            else if (difficulty === "normal") pairCount = 6;
            else if (difficulty === "hard") pairCount = 8;

            const selectedPairs = shuffle(topic.pairs).slice(0, Math.min(pairCount, topic.pairs.length));
            const cards = [];

            selectedPairs.forEach((pair, idx) => {
                const pairId = `pair_${idx}`;
                cards.push({
                    id: `card_${idx}_term`,
                    pairId,
                    type: "term",
                    text: pair.term,
                    matched: false,
                    hinted: false
                });
                cards.push({
                    id: `card_${idx}_def`,
                    pairId,
                    type: "definition",
                    text: pair.definition,
                    matched: false,
                    hinted: false
                });
            });

            const totalTime = Math.round(60 * diffConfig.timeMultiplier);

            this.state = {
                status: "playing",
                title: topic.title,
                category,
                difficulty,
                totalPairs: selectedPairs.length,
                cards: shuffle(cards),
                selectedCardIndex: null,
                matchedPairIds: new Set(),
                moves: 0,
                hintsLeft: diffConfig.hintsAllowed,
                hintsUsed: 0,
                combo: 0,
                maxCombo: 0,
                score: 0,
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
                        this.handleTimeout();
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

        selectCard(index) {
            if (this.state.status !== "playing") return { success: false, reason: "NOT_PLAYING" };
            if (index < 0 || index >= this.state.cards.length) return { success: false, reason: "INVALID_INDEX" };

            const card = this.state.cards[index];
            if (card.matched) return { success: false, reason: "ALREADY_MATCHED" };

            // Deselect if already selected
            if (this.state.selectedCardIndex === index) {
                this.state.selectedCardIndex = null;
                this.notify();
                return { success: true, action: "DESELECTED" };
            }

            // If no card selected yet, select this one
            if (this.state.selectedCardIndex === null) {
                this.state.selectedCardIndex = index;
                this.engine?.playSound("select");
                this.notify();
                return { success: true, action: "SELECTED_FIRST", card };
            }

            // Second card chosen: evaluate match
            const firstIndex = this.state.selectedCardIndex;
            const firstCard = this.state.cards[firstIndex];
            this.state.moves += 1;
            this.state.selectedCardIndex = null;

            // Check if match
            const isMatch = (firstCard.pairId === card.pairId) && (firstCard.type !== card.type);

            if (isMatch) {
                firstCard.matched = true;
                card.matched = true;
                this.state.matchedPairIds.add(card.pairId);
                this.state.combo += 1;
                this.state.maxCombo = Math.max(this.state.maxCombo, this.state.combo);

                // Score calculation with combo bonus
                const baseCardScore = 15;
                const comboBonus = (this.state.combo - 1) * 5;
                this.state.score += (baseCardScore + comboBonus);

                this.engine?.playSound("correct");

                // Check win condition
                if (this.state.matchedPairIds.size === this.state.totalPairs) {
                    this.handleWin();
                } else {
                    this.notify();
                }

                return { success: true, match: true, firstCard, secondCard: card, combo: this.state.combo };
            } else {
                // Wrong match: reset combo
                this.state.combo = 0;
                this.engine?.playSound("wrong");
                this.notify();
                return { success: true, match: false, firstCard, secondCard: card };
            }
        }

        useHint() {
            if (this.state.status !== "playing") return false;
            if (this.state.hintsLeft <= 0) return false;

            const unmatched = this.state.cards.filter(c => !c.matched);
            if (unmatched.length === 0) return false;

            const targetPairId = unmatched[0].pairId;
            this.state.cards.forEach(c => {
                if (c.pairId === targetPairId) c.hinted = true;
            });

            this.state.hintsLeft -= 1;
            this.state.hintsUsed += 1;
            this.engine?.playSound("select");
            this.notify();

            setTimeout(() => {
                this.state.cards.forEach(c => { c.hinted = false; });
                this.notify();
            }, 2500);

            return true;
        }

        handleWin() {
            this.stopTimer();
            this.state.status = "completed";
            const elapsed = Math.max(1, Math.round((Date.now() - this.state.startTime) / 1000));
            const timeBonus = Math.max(0, this.state.timeRemaining * 2);
            this.state.score += timeBonus;

            const maxPossibleScore = (this.state.totalPairs * 25) + (this.state.totalTime * 2);
            const accuracy = Math.min(1.0, Math.max(0.2, this.state.totalPairs / Math.max(this.state.totalPairs, this.state.moves)));

            const result = this.engine?.finishGame({
                gameId: `matching_${this.category}`,
                title: `Pencocokan: ${this.state.title}`,
                difficulty: this.difficulty,
                score: this.state.score,
                maxScore: maxPossibleScore,
                accuracy,
                durationSeconds: elapsed,
                hintsUsed: this.state.hintsUsed,
                category: "matching"
            });

            this.engine?.playSound("win");
            this.notify();
            if (this.onFinish) this.onFinish(result);
            return result;
        }

        handleTimeout() {
            this.stopTimer();
            this.state.status = "timeout";
            const elapsed = this.state.totalTime;
            const accuracy = this.state.matchedPairIds.size / this.state.totalPairs;

            const result = this.engine?.finishGame({
                gameId: `matching_${this.category}`,
                title: `Pencocokan: ${this.state.title}`,
                difficulty: this.difficulty,
                score: this.state.score,
                maxScore: (this.state.totalPairs * 25),
                accuracy,
                durationSeconds: elapsed,
                hintsUsed: this.state.hintsUsed,
                category: "matching"
            });

            this.engine?.playSound("wrong");
            this.notify();
            if (this.onFinish) this.onFinish(result);
            return result;
        }

        getState() {
            return {
                ...this.state,
                matchedCount: this.state.matchedPairIds.size,
                isFinished: this.state.status === "completed" || this.state.status === "timeout"
            };
        }

        notify() {
            if (this.onStateChange) {
                this.onStateChange(this.getState());
            }
        }
    }

    const MatchingModule = {
        TECH_BANKS: TECH_DATA_BANKS,
        CULTURE_BANKS: CULTURE_DATA_BANKS,
        createGame(options) {
            return new MatchingGame(options);
        }
    };

    if (typeof module !== "undefined" && module.exports) {
        module.exports = MatchingModule;
    }
    if (typeof window !== "undefined") {
        window.MatchingModule = MatchingModule;
    }
})(typeof globalThis !== "undefined" ? globalThis : this);
