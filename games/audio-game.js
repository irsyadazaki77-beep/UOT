/**
 * Universe of Tech - Audio & Listening Challenge Game
 * FASE 4 - Listening Comprehension with Accessibility Transcript Toggle
 */

(function (global) {
    "use strict";

    const GameCore = (typeof global.GameCore !== "undefined") ? global.GameCore : (typeof require !== "undefined" ? require("./game-core.js") : null);

    const AUDIO_BANKS = {
        nusantara_listening: {
            title: "Simak Bahasa Daerah Nusantara",
            items: [
                {
                    id: "audio_jw_1",
                    spokenText: "Sugeng enjang sedulur sedaya, mugi tansah pinaringan rahayu lan berkah saking Gusti.",
                    lang: "id-ID",
                    question: "Apa maksud dan makna dari ujaran yang kamu dengar?",
                    options: [
                        "Ucapan selamat pagi dan doa keselamatan bagi saudara sekalian",
                        "Undangan makan malam bersama keluarga besar",
                        "Permintaan maaf karena datang terlambat",
                        "Pemberitahuan rencana perjalanan jauh"
                    ],
                    correctIndex: 0,
                    transcript: "Sugeng enjang sedulur sedaya, mugi tansah pinaringan rahayu lan berkah saking Gusti. (Bahasa Jawa: Selamat pagi saudara sekalian, semoga senantiasa diberi keselamatan dan berkah dari Tuhan.)"
                },
                {
                    id: "audio_sd_1",
                    spokenText: "Wilujeng sumping ka wargi sadayana di tatar Pasundan anu endah tur asri.",
                    lang: "id-ID",
                    question: "Suasana apa yang digambarkan dalam kalimat tersebut?",
                    options: [
                        "Penyambutan selamat datang yang ramah di tanah Pasundan",
                        "Peringatan bahaya cuaca buruk di pegunungan",
                        "Perpisahan murid sekolah setelah kelulusan",
                        "Instruksi kerja bakti membersihkan desa"
                    ],
                    correctIndex: 0,
                    transcript: "Wilujeng sumping ka wargi sadayana di tatar Pasundan anu endah tur asri. (Bahasa Sunda: Selamat datang kepada semua warga di tanah Pasundan yang indah dan asri.)"
                },
                {
                    id: "audio_mn_1",
                    spokenText: "Basilek di ujuang pedang, batenggang di mato panciang. Alam takambang jadi guru.",
                    lang: "id-ID",
                    question: "Pesan moral apa yang terkandung dalam ungkapan adat Minangkabau ini?",
                    options: [
                        "Kehati-hatian dalam bertindak dan senantiasa berguru pada hikmah alam semesta",
                        "Kewajiban berlatih bela diri setiap hari",
                        "Larangan bepergian saat malam hari",
                        "Pentingnya mencari keuntungan dalam berniaga"
                    ],
                    correctIndex: 0,
                    transcript: "Basilek di ujuang pedang, batenggang di mato panciang. Alam takambang jadi guru. (Pepatah Minang: Kehati-hatian dalam menghadapi situasi sulit dan belajar dari alam raya.)"
                },
                {
                    id: "audio_bl_1",
                    spokenText: "Matur suksma banget antuk uratian ida dane sinamian sane sampun rauh.",
                    lang: "id-ID",
                    question: "Apa inti kalimat yang disampaikan penutur bahasa Bali ini?",
                    options: [
                        "Ucapan terima kasih tulus atas perhatian para hadirin yang telah datang",
                        "Pengumuman pembukaan upacara adat desa",
                        "Permintaan izin untuk meninggalkan ruangan",
                        "Ajakan menyanyikan lagu tradisional bersama"
                    ],
                    correctIndex: 0,
                    transcript: "Matur suksma banget antuk uratian ida dane sinamian sane sampun rauh. (Bahasa Bali: Terima kasih banyak atas perhatian para hadirin semua yang telah hadir.)"
                },
                {
                    id: "audio_bt_1",
                    spokenText: "Horas jala gabe ma hita saluhutna, horas horas horas!",
                    lang: "id-ID",
                    question: "Nilai keakraban apa yang tersirat dari seruan khas suku Batak tersebut?",
                    options: [
                        "Salam kehangatan, harapan kemakmuran, dan doa berkat persaudaraan",
                        "Ajakan berburu di hutan bersama pemuda desa",
                        "Peringatan agar berhati-hati di jalan raya",
                        "Nyanyian pengantar tidur anak-anak"
                    ],
                    correctIndex: 0,
                    transcript: "Horas jala gabe ma hita saluhutna, horas! (Bahasa Batak: Salam sejahtera dan semoga kita semua makmur dan sehat.)"
                }
            ]
        },
        tech_listening: {
            title: "Simak Masalah & Arsitektur Sistem",
            items: [
                {
                    id: "audio_tech_1",
                    spokenText: "Klien melaporkan bahwa tombol submit diklik dua kali oleh pengguna, mengakibatkan data duplikat tersimpan ganda di database.",
                    lang: "id-ID",
                    question: "Solusi arsitektur software apa yang paling tepat untuk mengatasi skenario audio tersebut?",
                    options: [
                        "Menerapkan mekanisme Idempotency Token dan men-disable tombol saat submitting",
                        "Mengganti database dengan spreadsheet",
                        "Menghapus validasi server-side",
                        "Mematikan fungsi JavaScript pada browser klien"
                    ],
                    correctIndex: 0,
                    transcript: "Klien melaporkan bahwa tombol submit diklik dua kali... Solusi: Terapkan Idempotency Token dan proteksi UI loading state."
                },
                {
                    id: "audio_tech_2",
                    spokenText: "Server merespons dengan HTTP status code 401 Unauthorized saat aplikasi mencoba mengambil data profil pengguna.",
                    lang: "id-ID",
                    question: "Apa penyebab utama dari respons HTTP yang disebutkan di audio?",
                    options: [
                        "Header Authorization / Access Token belum dikirim atau sudah kedaluwarsa",
                        "Server tujuan sedang mati total (down)",
                        "Halaman HTML tidak ditemukan (404)",
                        "Koneksi internet pengguna terputus"
                    ],
                    correctIndex: 0,
                    transcript: "Status code 401 Unauthorized menandakan kegagalan autentikasi / token kredensial tidak valid."
                },
                {
                    id: "audio_tech_3",
                    spokenText: "Kompleksitas algoritma pencarian ini adalah O satu, yang berarti waktu eksekusinya konstan tidak peduli berapa banyak data yang ada.",
                    lang: "id-ID",
                    question: "Struktur data mana yang umumnya menawarkan pencarian O(1) konstan?",
                    options: [
                        "Hash Map / Key-Value Hash Table",
                        "Linked List tanpa pointer langsung",
                        "Binary Search Tree tak seimbang",
                        "Array satu dimensi tanpa indeks"
                    ],
                    correctIndex: 0,
                    transcript: "Kompleksitas O(1) konstan adalah karakteristik utama Hash Map / Key-Value Lookup."
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

    class AudioGame {
        constructor(options = {}) {
            this.engine = options.gameCoreEngine || (GameCore ? GameCore.createEngine(options) : null);
            this.category = options.category || "nusantara_listening";
            this.difficulty = options.difficulty || "normal";
            this.onStateChange = options.onStateChange || null;
            this.onFinish = options.onFinish || null;

            this.state = {
                status: "idle",
                items: [],
                currentIndex: 0,
                score: 0,
                correctCount: 0,
                replaysRemaining: 2,
                maxReplays: 2,
                showTranscript: false,
                answeredCurrent: false,
                selectedOptionIndex: null,
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
            const bank = AUDIO_BANKS[category] || AUDIO_BANKS.nusantara_listening;

            let count = 3;
            let replays = 2;
            if (difficulty === "easy") {
                count = 3;
                replays = 99; // unlimited
            } else if (difficulty === "normal") {
                count = 4;
                replays = 2;
            } else if (difficulty === "hard") {
                count = Math.min(5, bank.items.length);
                replays = 1;
            }

            const items = shuffle(bank.items).slice(0, count).map(item => {
                // Shuffle options while tracking correct
                const originalCorrectText = item.options[item.correctIndex];
                const shuffledOpts = shuffle(item.options);
                const newCorrectIdx = shuffledOpts.indexOf(originalCorrectText);
                return {
                    ...item,
                    shuffledOptions: shuffledOpts,
                    shuffledCorrectIndex: newCorrectIdx
                };
            });

            const totalTime = Math.round(count * 22 * diffConfig.timeMultiplier);

            this.state = {
                status: "playing",
                title: bank.title,
                category,
                difficulty,
                totalItems: items.length,
                items,
                currentIndex: 0,
                score: 0,
                correctCount: 0,
                replaysRemaining: replays,
                maxReplays: replays,
                showTranscript: false,
                answeredCurrent: false,
                selectedOptionIndex: null,
                timeRemaining: totalTime,
                totalTime,
                startTime: Date.now(),
                timerInterval: null
            };

            this.startTimer();
            // Automatically play audio for the first question
            this.playCurrentAudio();
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

        getCurrentItem() {
            if (this.state.currentIndex >= this.state.items.length) return null;
            return this.state.items[this.state.currentIndex];
        }

        playCurrentAudio() {
            const item = this.getCurrentItem();
            if (!item || this.state.status !== "playing") return false;

            if (this.state.replaysRemaining <= 0 && this.state.maxReplays < 90) {
                return false;
            }

            if (this.state.maxReplays < 90) {
                this.state.replaysRemaining -= 1;
            }

            this.engine?.speak(item.spokenText, item.lang || "id-ID");
            this.notify();
            return true;
        }

        toggleTranscript() {
            this.state.showTranscript = !this.state.showTranscript;
            this.notify();
        }

        submitAnswer(optionIndex) {
            const item = this.getCurrentItem();
            if (!item || this.state.status !== "playing" || this.state.answeredCurrent) return;

            this.state.answeredCurrent = true;
            this.state.selectedOptionIndex = optionIndex;

            const isCorrect = (optionIndex === item.shuffledCorrectIndex);
            if (isCorrect) {
                this.state.correctCount += 1;
                // Slight penalty if transcript was shown on normal/hard
                const transcriptPenalty = (this.state.showTranscript && this.difficulty !== "easy") ? 5 : 0;
                const points = Math.max(10, 25 - transcriptPenalty);
                this.state.score += points;
                this.engine?.playSound("correct");
            } else {
                this.engine?.playSound("wrong");
            }

            this.notify();
            return {
                correct: isCorrect,
                correctIndex: item.shuffledCorrectIndex,
                score: this.state.score
            };
        }

        nextItem() {
            if (this.state.status !== "playing" || !this.state.answeredCurrent) return;

            if (this.state.currentIndex + 1 >= this.state.items.length) {
                this.handleFinish();
            } else {
                this.state.currentIndex += 1;
                this.state.answeredCurrent = false;
                this.state.selectedOptionIndex = null;
                this.state.showTranscript = false;
                this.state.replaysRemaining = this.state.maxReplays;
                this.playCurrentAudio();
                this.notify();
            }
        }

        handleFinish() {
            this.stopTimer();
            this.state.status = "completed";

            const elapsed = Math.max(1, Math.round((Date.now() - this.state.startTime) / 1000));
            const timeBonus = Math.max(0, Math.round(this.state.timeRemaining * 1.0));
            this.state.score += timeBonus;

            const accuracy = this.state.totalItems > 0 ? (this.state.correctCount / this.state.totalItems) : 0;
            const maxPossible = (this.state.totalItems * 25) + Math.round(this.state.totalTime * 1.0);

            const result = this.engine?.finishGame({
                gameId: `audio_${this.category}`,
                title: `Tantangan Audio: ${this.state.title}`,
                difficulty: this.difficulty,
                score: this.state.score,
                maxScore: maxPossible,
                accuracy,
                durationSeconds: elapsed,
                hintsUsed: this.state.showTranscript ? 1 : 0,
                category: "audio_challenge"
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
                currentItem: this.getCurrentItem(),
                progress: `${this.state.currentIndex + 1}/${this.state.totalItems}`,
                isFinished: this.state.status === "completed"
            };
        }

        notify() {
            if (this.onStateChange) {
                this.onStateChange(this.getState());
            }
        }
    }

    const AudioGameModule = {
        AUDIO_BANKS,
        createGame(options) {
            return new AudioGame(options);
        }
    };

    if (typeof module !== "undefined" && module.exports) {
        module.exports = AudioGameModule;
    }
    if (typeof window !== "undefined") {
        window.AudioGameModule = AudioGameModule;
    }
})(typeof globalThis !== "undefined" ? globalThis : this);
