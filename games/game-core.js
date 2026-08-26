/**
 * Universe of Tech - Reusable Game Core Framework
 * FASE 4 - Modular Minigame & Challenge Engine
 * 
 * Provides:
 * - Unified game state management & lifecycle
 * - Difficulty scaling (easy, normal, hard)
 * - Anti-farming / Replay reward mitigation
 * - ProgressionEngine integration
 * - Sound & Web Speech API abstraction with accessible fallbacks
 * - High-score and attempt tracking (localStorage)
 */

(function (global) {
    "use strict";

    const STORAGE_KEY = "uot_game_records_v1";

    const DIFFICULTY_CONFIG = {
        easy: {
            id: "easy",
            label: "Mudah",
            multiplier: 1.0,
            timeMultiplier: 1.5,
            hintsAllowed: 3,
            xpBase: 30,
            coinsBase: 15,
            passAccuracy: 0.5
        },
        normal: {
            id: "normal",
            label: "Standar",
            multiplier: 1.5,
            timeMultiplier: 1.0,
            hintsAllowed: 1,
            xpBase: 50,
            coinsBase: 25,
            passAccuracy: 0.65
        },
        hard: {
            id: "hard",
            label: "Tantangan",
            multiplier: 2.2,
            timeMultiplier: 0.75,
            hintsAllowed: 0,
            xpBase: 80,
            coinsBase: 40,
            passAccuracy: 0.8
        }
    };

    function safeGetStorage(customStorage) {
        if (customStorage) return customStorage;
        if (typeof global.localStorage !== "undefined") return global.localStorage;
        return {
            _data: {},
            getItem(k) { return this._data[k] || null; },
            setItem(k, v) { this._data[k] = String(v); },
            removeItem(k) { delete this._data[k]; }
        };
    }

    class GameCoreEngine {
        constructor(options = {}) {
            this.storage = safeGetStorage(options.storage);
            this.state = this.loadRecords();
        }

        loadRecords() {
            try {
                const raw = this.storage.getItem(STORAGE_KEY);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (parsed && typeof parsed === "object") {
                        return {
                            games: parsed.games || {},
                            dailyPlayCounts: parsed.dailyPlayCounts || {},
                            lastResetDate: parsed.lastResetDate || this.getTodayKey()
                        };
                    }
                }
            } catch (err) {
                console.warn("[GameCore] Error loading records:", err);
            }
            return {
                games: {},
                dailyPlayCounts: {},
                lastResetDate: this.getTodayKey()
            };
        }

        saveRecords() {
            try {
                this.storage.setItem(STORAGE_KEY, JSON.stringify(this.state));
            } catch (err) {
                console.warn("[GameCore] Error saving records:", err);
            }
        }

        getTodayKey() {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, "0");
            const day = String(now.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
        }

        getGameRecord(gameId, difficulty = "normal") {
            const compositeKey = `${gameId}:${difficulty}`;
            if (!this.state.games[compositeKey]) {
                this.state.games[compositeKey] = {
                    gameId,
                    difficulty,
                    attempts: 0,
                    completions: 0,
                    bestScore: 0,
                    bestAccuracy: 0,
                    bestTimeSeconds: null,
                    firstClearedAt: null,
                    lastPlayedAt: null,
                    stars: 0,
                    history: []
                };
            }
            return this.state.games[compositeKey];
        }

        /**
         * Checks if user has cleared this game today
         */
        hasClearedToday(gameId, difficulty = "normal") {
            const today = this.getTodayKey();
            const record = this.getGameRecord(gameId, difficulty);
            if (!record.history || record.history.length === 0) return false;
            return record.history.some(h => h.date === today && h.passed);
        }

        /**
         * Validates game completion and awards progression XP without double-farming
         */
        finishGame(params) {
            const {
                gameId,
                title = "Mini Game",
                difficulty = "normal",
                score = 0,
                maxScore = 100,
                accuracy = 1.0,
                durationSeconds = 0,
                hintsUsed = 0,
                category = "general"
            } = params;

            if (!gameId) {
                throw new Error("gameId is required to finish a game.");
            }

            const diffConfig = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.normal;
            const record = this.getGameRecord(gameId, difficulty);
            const today = this.getTodayKey();

            record.attempts += 1;
            record.lastPlayedAt = new Date().toISOString();

            const isPassed = accuracy >= diffConfig.passAccuracy && score > 0;
            const isFirstClearEver = isPassed && !record.firstClearedAt;
            const isFirstClearToday = isPassed && !this.hasClearedToday(gameId, difficulty);
            const isNewBestScore = isPassed && score > record.bestScore;

            let stars = 0;
            if (isPassed) {
                record.completions += 1;
                if (!record.firstClearedAt) {
                    record.firstClearedAt = record.lastPlayedAt;
                }

                if (accuracy >= 0.95 && (hintsUsed === 0 || difficulty === "easy")) {
                    stars = 3;
                } else if (accuracy >= 0.75) {
                    stars = 2;
                } else {
                    stars = 1;
                }
                record.stars = Math.max(record.stars || 0, stars);

                if (isNewBestScore) {
                    record.bestScore = score;
                }
                if (accuracy > record.bestAccuracy) {
                    record.bestAccuracy = accuracy;
                }
                if (record.bestTimeSeconds === null || durationSeconds < record.bestTimeSeconds) {
                    record.bestTimeSeconds = durationSeconds;
                }
            }

            // Save match attempt history (capped at last 20)
            record.history.unshift({
                date: today,
                timestamp: Date.now(),
                score,
                maxScore,
                accuracy,
                durationSeconds,
                hintsUsed,
                passed: isPassed,
                stars
            });
            if (record.history.length > 20) {
                record.history = record.history.slice(0, 20);
            }

            this.saveRecords();

            // Calculate Reward Scale (Anti-Farming Logic)
            let xpEarned = 0;
            let coinsEarned = 0;
            let rewardType = "none";

            if (isPassed) {
                const baseXP = Math.round(diffConfig.xpBase * diffConfig.multiplier);
                const baseCoins = Math.round(diffConfig.coinsBase * diffConfig.multiplier);

                if (isFirstClearEver) {
                    // First time ever: 100% full reward + first-time bonus
                    xpEarned = baseXP + 20;
                    coinsEarned = baseCoins + 10;
                    rewardType = "first_clear_ever";
                } else if (isFirstClearToday) {
                    // First clear today: 100% standard reward
                    xpEarned = baseXP;
                    coinsEarned = baseCoins;
                    rewardType = "first_clear_today";
                } else if (isNewBestScore) {
                    // Replay with new high score: 35% reward bonus
                    xpEarned = Math.max(5, Math.round(baseXP * 0.35));
                    coinsEarned = Math.max(3, Math.round(baseCoins * 0.35));
                    rewardType = "high_score_bonus";
                } else {
                    // Regular replay for practice: Diminished reward (15% XP, minimal coins)
                    xpEarned = Math.max(3, Math.round(baseXP * 0.15));
                    coinsEarned = Math.max(1, Math.round(baseCoins * 0.15));
                    rewardType = "practice_replay";
                }

                // Bridge to ActivityService Pipeline
                const activeService = typeof window !== "undefined" ? window.ActivityService : (typeof global !== "undefined" ? global.ActivityService : null);
                if (activeService && typeof activeService.recordGame === "function") {
                    try {
                        activeService.recordGame(gameId, score, {
                            title: `Tantangan: ${title} (${diffConfig.label})`,
                            difficulty,
                            xp: xpEarned,
                            coins: coinsEarned
                        });
                    } catch (e) {
                        console.warn("[GameCore] Error recording activity to ActivityService:", e);
                    }
                } else if (typeof global.ProgressionEngine !== "undefined" && typeof global.ProgressionEngine.recordActivity === "function") {
                    try {
                        global.ProgressionEngine.recordActivity("practice", {
                            id: `game:${gameId}:${difficulty}:${today}`,
                            title: `Tantangan: ${title} (${diffConfig.label})`,
                            xp: xpEarned,
                            coins: coinsEarned,
                            reason: `Menyelesaikan ${title} [${diffConfig.label}] - Skor ${score}`,
                            missionType: "practice",
                            configKey: "PRACTICE_CHALLENGE",
                            multiplier: 1.0,
                            showModal: false
                        });
                    } catch (e) {
                        console.warn("[GameCore] Error recording activity to ProgressionEngine:", e);
                    }
                } else if (typeof global.addXp === "function") {
                    try {
                        global.addXp(xpEarned);
                    } catch (_) {}
                }
            }

            return {
                passed: isPassed,
                gameId,
                difficulty,
                score,
                maxScore,
                accuracy,
                stars,
                durationSeconds,
                isFirstClearEver,
                isFirstClearToday,
                isNewBestScore,
                xpEarned,
                coinsEarned,
                rewardType,
                record: {
                    attempts: record.attempts,
                    completions: record.completions,
                    bestScore: record.bestScore,
                    stars: record.stars
                }
            };
        }

        // ==========================================
        // Sound & Speech Utilities with Fallbacks
        // ==========================================

        playSound(type) {
            if (typeof global.document !== "undefined") {
                const isMuted = global.localStorage?.getItem("uot_sound_muted") === "true";
                if (isMuted) return;
            }

            if (typeof global.SoundEngine !== "undefined") {
                try {
                    if (type === "match" || type === "correct" || type === "win") {
                        global.SoundEngine.playSuccess?.();
                        return;
                    } else if (type === "wrong" || type === "error") {
                        global.SoundEngine.playError?.();
                        return;
                    } else if (type === "click" || type === "select") {
                        global.SoundEngine.playClick?.();
                        return;
                    }
                } catch (_) {}
            }

            // Fallback synthetic Web Audio tone if SoundEngine not available
            if (typeof global.AudioContext !== "undefined" || typeof global.webkitAudioContext !== "undefined") {
                try {
                    const AudioCtx = global.AudioContext || global.webkitAudioContext;
                    const ctx = new AudioCtx();
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);

                    if (type === "correct" || type === "win") {
                        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
                        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
                        gain.gain.setValueAtTime(0.12, ctx.currentTime);
                        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
                        osc.start();
                        osc.stop(ctx.currentTime + 0.25);
                    } else if (type === "wrong") {
                        osc.frequency.setValueAtTime(220, ctx.currentTime); // A3
                        osc.frequency.exponentialRampToValueAtTime(146.83, ctx.currentTime + 0.2); // D3
                        gain.gain.setValueAtTime(0.15, ctx.currentTime);
                        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
                        osc.start();
                        osc.stop(ctx.currentTime + 0.25);
                    } else {
                        osc.frequency.setValueAtTime(440, ctx.currentTime);
                        gain.gain.setValueAtTime(0.05, ctx.currentTime);
                        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
                        osc.start();
                        osc.stop(ctx.currentTime + 0.08);
                    }
                } catch (_) {}
            }
        }

        speak(text, lang = "id-ID", onEnd = null) {
            if (typeof global.speechSynthesis === "undefined" || typeof global.SpeechSynthesisUtterance === "undefined") {
                if (onEnd) onEnd({ supported: false });
                return false;
            }
            try {
                global.speechSynthesis.cancel();
                const utterance = new global.SpeechSynthesisUtterance(text);
                utterance.lang = lang;
                utterance.rate = 0.85;
                if (onEnd) {
                    utterance.onend = () => onEnd({ success: true });
                    utterance.onerror = (e) => onEnd({ error: e });
                }
                global.speechSynthesis.speak(utterance);
                return true;
            } catch (err) {
                console.warn("[GameCore] Speech synthesis error:", err);
                if (onEnd) onEnd({ error: err });
                return false;
            }
        }

        isSpeechRecognitionAvailable() {
            if (typeof global.window === "undefined") return false;
            return Boolean(global.window.SpeechRecognition || global.window.webkitSpeechRecognition);
        }

        createSpeechRecognizer(options = {}) {
            if (!this.isSpeechRecognitionAvailable()) {
                return null;
            }
            const SpeechRec = global.window.SpeechRecognition || global.window.webkitSpeechRecognition;
            const recognizer = new SpeechRec();
            recognizer.lang = options.lang || "id-ID";
            recognizer.continuous = false;
            recognizer.interimResults = false;
            recognizer.maxAlternatives = 3;
            return recognizer;
        }

        prefersReducedMotion() {
            if (typeof global.window !== "undefined" && global.window.matchMedia) {
                return global.window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            }
            return false;
        }
    }

    // Helper Factory
    const GameCore = {
        DIFFICULTY: DIFFICULTY_CONFIG,
        createEngine(options) {
            return new GameCoreEngine(options);
        },
        engine: new GameCoreEngine()
    };

    if (typeof module !== "undefined" && module.exports) {
        module.exports = GameCore;
    }
    if (typeof window !== "undefined") {
        window.GameCore = GameCore;
    }
})(typeof globalThis !== "undefined" ? globalThis : this);
