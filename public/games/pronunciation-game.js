/**
 * Universe of Tech - Voice & Pronunciation Challenge Game
 * FASE 4 - Web Speech API Integration with Seamless Interactive Fallback
 */

(function (global) {
    "use strict";

    const GameCore = (typeof global.GameCore !== "undefined") ? global.GameCore : (typeof require !== "undefined" ? require("./game-core.js") : null);

    const PHRASE_BANKS = {
        jawa: {
            title: "Pelafalan Bahasa Jawa",
            lang: "id-ID",
            items: [
                { id: "jw_1", phrase: "Matur Nuwun", phonetic: "ma-tur nu-wun", meaning: "Terima kasih", context: "Ungkapan terima kasih sehari-hari yang santun." },
                { id: "jw_2", phrase: "Sugeng Rawuh", phonetic: "su-geng ra-wuh", meaning: "Selamat datang", context: "Salam penyambutan hangat bagi tamu." },
                { id: "jw_3", phrase: "Nyuwun Pangapunten", phonetic: "nyu-wun pa-nga-pun-ten", meaning: "Mohon maaf", context: "Bentuk krama alus untuk meminta maaf tulus." },
                { id: "jw_4", phrase: "Guyub Rukun", phonetic: "gu-yub ru-kun", meaning: "Hidup damai & rukun bersama", context: "Falsafah kebersamaan masyarakat Nusantara." },
                { id: "jw_5", phrase: "Mangan Ora Mangan Kumpul", phonetic: "ma-ngan o-ra ma-ngan kum-pul", meaning: "Kebersamaan lebih utama dari materi", context: "Pepatah solidaritas persaudaraan." }
            ]
        },
        sunda: {
            title: "Pelafalan Bahasa Sunda",
            lang: "id-ID",
            items: [
                { id: "sd_1", phrase: "Hatur Nuhun", phonetic: "ha-tur nu-hun", meaning: "Terima kasih", context: "Ungkapan rasa terima kasih khas Pasundan." },
                { id: "sd_2", phrase: "Wilujeng Sumping", phonetic: "wi-lu-jeng sum-ping", meaning: "Selamat datang", context: "Ucapan menyambut kedatangan tamu kehormatan." },
                { id: "sd_3", phrase: "Sampurasun", phonetic: "sam-pu-ra-sun", meaning: "Salam pembuka khas Sunda", context: "Dijawab dengan santun 'Rampes'." },
                { id: "sd_4", phrase: "Kumaha Damang", phonetic: "ku-ma-ha da-mang", meaning: "Bagaimana kabarnya?", context: "Menanyakan kesehatan dan kabar baik." },
                { id: "sd_5", phrase: "Tong Hariwang", phonetic: "tong ha-ri-wang", meaning: "Jangan khawatir", context: "Menentramkan hati teman atau keluarga." }
            ]
        },
        minang: {
            title: "Pelafalan Bahasa Minang",
            lang: "id-ID",
            items: [
                { id: "mn_1", phrase: "Tarimo Kasih", phonetic: "ta-ri-mo ka-sih", meaning: "Terima kasih", context: "Bentuk sopan berterima kasih di Ranah Minang." },
                { id: "mn_2", phrase: "Rancak Bana", phonetic: "ran-cak ba-na", meaning: "Bagus atau indah sekali", context: "Pujian terhadap keelokan pemandangan atau karya." },
                { id: "mn_3", phrase: "Baa Kabanyo Sanak", phonetic: "ba-a ka-ba-nyo sa-nak", meaning: "Apa kabar saudaraku?", context: "Sapaan akrab penuh kehangatan." },
                { id: "mn_4", phrase: "Alam Takambang Jadi Guru", phonetic: "a-lam ta-kam-bang ja-di gu-ru", meaning: "Belajar dari alam semesta", context: "Falsafah hidup Minangkabau yang mendalam." }
            ]
        },
        tech_terms: {
            title: "Pelafalan Istilah Teknologi",
            lang: "en-US",
            items: [
                { id: "tc_1", phrase: "Asynchronous", phonetic: "ey-sing-kruh-nuhs", meaning: "Operasi tak serentak tanpa memblokir thread", context: "Konsep Promise & event loop JavaScript." },
                { id: "tc_2", phrase: "Idempotency", phonetic: "eye-dem-poh-tuhn-see", meaning: "Hasil operasi tetap sama jika dipanggil berulang kali", context: "Prinsip API RESTful dan sistem terdistribusi." },
                { id: "tc_3", phrase: "Polymorphism", phonetic: "pol-ee-mawr-fiz-uhm", meaning: "Kemampuan objek memiliki banyak bentuk implementasi", context: "Prinsip inti Object-Oriented Programming (OOP)." },
                { id: "tc_4", phrase: "Recursion", phonetic: "ri-kur-zhuhn", meaning: "Fungsi yang memanggil dirinya sendiri sampai base case", context: "Teknik penyelesaian algoritma divide & conquer." },
                { id: "tc_5", phrase: "Encapsulation", phonetic: "en-kap-suh-lay-shuhn", meaning: "Membungkus data dan metode dalam satu unit terlindung", context: "Menyembunyikan detail internal objek perangkat lunak." }
            ]
        }
    };

    function normalizeText(text) {
        return String(text || "")
            .toLowerCase()
            .replace(/[^a-z0-9\s]/gi, " ")
            .replace(/\s+/g, " ")
            .trim();
    }

    function calculateSimilarity(str1, str2) {
        const s1 = normalizeText(str1);
        const s2 = normalizeText(str2);
        if (s1 === s2) return 1.0;
        if (!s1 || !s2) return 0.0;

        // Word overlap metric
        const words1 = s1.split(" ");
        const words2 = s2.split(" ");
        let matchCount = 0;
        words1.forEach(w => {
            if (words2.includes(w)) matchCount += 1;
        });

        const overlapScore = (matchCount * 2) / (words1.length + words2.length);
        if (s1.includes(s2) || s2.includes(s1)) {
            return Math.max(overlapScore, 0.85);
        }
        return overlapScore;
    }

    function shuffle(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    class PronunciationGame {
        constructor(options = {}) {
            this.engine = options.gameCoreEngine || (GameCore ? GameCore.createEngine(options) : null);
            this.category = options.category || "jawa";
            this.difficulty = options.difficulty || "normal";
            this.onStateChange = options.onStateChange || null;
            this.onFinish = options.onFinish || null;

            this.state = {
                status: "idle",
                items: [],
                currentIndex: 0,
                score: 0,
                correctCount: 0,
                isRecording: false,
                speechSupported: this.engine ? this.engine.isSpeechRecognitionAvailable() : false,
                fallbackMode: false,
                lastResult: null,
                selectedFallbackAnswer: null,
                timeRemaining: 60,
                totalTime: 60,
                startTime: 0,
                timerInterval: null
            };

            this.recognizer = null;
        }

        start(category = this.category, difficulty = this.difficulty) {
            this.category = category;
            this.difficulty = difficulty;
            const diffConfig = GameCore.DIFFICULTY[difficulty] || GameCore.DIFFICULTY.normal;
            const bank = PHRASE_BANKS[category] || PHRASE_BANKS.jawa;

            let count = 4;
            if (difficulty === "easy") count = 3;
            else if (difficulty === "normal") count = 4;
            else if (difficulty === "hard") count = Math.min(5, bank.items.length);

            const items = shuffle(bank.items).slice(0, count).map(item => {
                // Generate distractors for fallback multiple-choice
                const distractors = bank.items.filter(it => it.id !== item.id).map(it => it.phrase);
                const options = shuffle([item.phrase, ...distractors.slice(0, 3)]);
                return {
                    ...item,
                    options
                };
            });

            const totalTime = Math.round(count * 20 * diffConfig.timeMultiplier);
            const isSupported = this.engine ? this.engine.isSpeechRecognitionAvailable() : false;

            this.state = {
                status: "playing",
                title: bank.title,
                category,
                difficulty,
                lang: bank.lang || "id-ID",
                totalItems: items.length,
                items,
                currentIndex: 0,
                score: 0,
                correctCount: 0,
                isRecording: false,
                speechSupported: isSupported,
                fallbackMode: !isSupported,
                lastResult: null,
                selectedFallbackAnswer: null,
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

        getCurrentItem() {
            if (this.state.currentIndex >= this.state.items.length) return null;
            return this.state.items[this.state.currentIndex];
        }

        playAudioDemo() {
            const item = this.getCurrentItem();
            if (!item) return;
            this.engine?.speak(item.phrase, this.state.lang);
        }

        startVoiceRecognition() {
            const item = this.getCurrentItem();
            if (!item || this.state.status !== "playing" || this.state.isRecording) return false;

            if (!this.state.speechSupported) {
                this.state.fallbackMode = true;
                this.notify();
                return false;
            }

            try {
                if (this.recognizer) {
                    try { this.recognizer.abort(); } catch (_) {}
                }

                this.recognizer = this.engine.createSpeechRecognizer({ lang: this.state.lang });
                if (!this.recognizer) {
                    this.state.fallbackMode = true;
                    this.notify();
                    return false;
                }

                this.state.isRecording = true;
                this.state.lastResult = { status: "listening", text: "Mendengarkan ucapan..." };
                this.notify();

                this.recognizer.onresult = (event) => {
                    this.state.isRecording = false;
                    const transcript = event.results[0][0].transcript;
                    this.evaluateVoiceInput(transcript);
                };

                this.recognizer.onerror = (event) => {
                    this.state.isRecording = false;
                    this.state.lastResult = {
                        status: "error",
                        text: "Suara belum tertangkap jelas. Kamu bisa mencoba lagi atau beralih ke Mode Pilihan Teks.",
                        canFallback: true
                    };
                    this.notify();
                };

                this.recognizer.onend = () => {
                    this.state.isRecording = false;
                    this.notify();
                };

                this.recognizer.start();
                return true;
            } catch (err) {
                this.state.isRecording = false;
                this.state.fallbackMode = true;
                this.notify();
                return false;
            }
        }

        stopVoiceRecognition() {
            if (this.recognizer && this.state.isRecording) {
                try { this.recognizer.stop(); } catch (_) {}
                this.state.isRecording = false;
                this.notify();
            }
        }

        evaluateVoiceInput(transcript) {
            const item = this.getCurrentItem();
            if (!item) return;

            const similarity = calculateSimilarity(transcript, item.phrase);
            const threshold = (this.difficulty === "hard") ? 0.75 : 0.6;
            const isMatch = similarity >= threshold;

            if (isMatch) {
                this.state.correctCount += 1;
                const points = Math.round(20 + (similarity * 10));
                this.state.score += points;
                this.engine?.playSound("correct");
            } else {
                this.engine?.playSound("wrong");
            }

            this.state.lastResult = {
                status: "evaluated",
                heard: transcript,
                target: item.phrase,
                similarity: Math.round(similarity * 100),
                passed: isMatch,
                feedback: isMatch ? `Lafal terdengar akurat (${Math.round(similarity * 100)}%)!` : `Terdengar: "${transcript}". Nilai kemiripan: ${Math.round(similarity * 100)}%.`
            };

            this.notify();
        }

        submitFallbackAnswer(answerText) {
            const item = this.getCurrentItem();
            if (!item || this.state.status !== "playing") return;

            const isCorrect = (normalizeText(answerText) === normalizeText(item.phrase));
            this.state.selectedFallbackAnswer = answerText;

            if (isCorrect) {
                this.state.correctCount += 1;
                this.state.score += 20;
                this.engine?.playSound("correct");
            } else {
                this.engine?.playSound("wrong");
            }

            this.state.lastResult = {
                status: "evaluated",
                heard: answerText,
                target: item.phrase,
                passed: isCorrect,
                feedback: isCorrect ? "Tepat! Pilihan pengucapan sesuai." : `Pilihan kurang tepat. Yang benar: ${item.phrase}`
            };

            this.notify();
        }

        toggleFallbackMode() {
            this.state.fallbackMode = !this.state.fallbackMode;
            this.notify();
        }

        nextItem() {
            if (this.state.status !== "playing" || !this.state.lastResult) return;

            if (this.state.currentIndex + 1 >= this.state.items.length) {
                this.handleFinish();
            } else {
                this.state.currentIndex += 1;
                this.state.lastResult = null;
                this.state.selectedFallbackAnswer = null;
                this.notify();
            }
        }

        handleFinish() {
            this.stopTimer();
            this.stopVoiceRecognition();
            this.state.status = "completed";

            const elapsed = Math.max(1, Math.round((Date.now() - this.state.startTime) / 1000));
            const timeBonus = Math.max(0, Math.round(this.state.timeRemaining * 1.2));
            this.state.score += timeBonus;

            const accuracy = this.state.totalItems > 0 ? (this.state.correctCount / this.state.totalItems) : 0;
            const maxPossible = (this.state.totalItems * 30) + Math.round(this.state.totalTime * 1.2);

            const result = this.engine?.finishGame({
                gameId: `pronunciation_${this.category}`,
                title: `Latihan Pelafalan: ${this.state.title}`,
                difficulty: this.difficulty,
                score: this.state.score,
                maxScore: maxPossible,
                accuracy,
                durationSeconds: elapsed,
                hintsUsed: 0,
                category: "pronunciation"
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

    const PronunciationModule = {
        PHRASE_BANKS,
        createGame(options) {
            return new PronunciationGame(options);
        }
    };

    if (typeof module !== "undefined" && module.exports) {
        module.exports = PronunciationModule;
    }
    if (typeof window !== "undefined") {
        window.PronunciationModule = PronunciationModule;
    }
})(typeof globalThis !== "undefined" ? globalThis : this);
