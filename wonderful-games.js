(function () {
    const data = window.WonderfulData;
    const core = window.WonderfulCore;

    // 1. Audio Context & Synth Setup
    let audioCtx = null;
    let synthPlayingInterval = null;
    let activeScaleName = "slendro";

    function isPro() {
        try {
            const session = JSON.parse(localStorage.getItem("eduquestUserSession") || "null");
            return Boolean(session?.isLoggedIn) && localStorage.getItem("eduquestSubscription") === "pro";
        } catch {
            return false;
        }
    }

    function initAudioContext() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    // Dynamic Sound synthesis (diluar nalar!)
    function playSynthTone(instrument, freq) {
        try {
            initAudioContext();
            const now = audioCtx.currentTime;
            const osc1 = audioCtx.createOscillator();
            const osc2 = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();

            osc1.connect(gainNode);
            osc2.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            if (instrument === 'gamelan') {
                // Metallic Bell chime tone (Sine + detuned Sine overtone)
                osc1.type = 'sine';
                osc1.frequency.setValueAtTime(freq, now);
                osc2.type = 'sine';
                osc2.frequency.setValueAtTime(freq * 2.015, now); // Metallic disharmony

                gainNode.gain.setValueAtTime(0.18, now);
                gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
                osc1.start(now);
                osc2.start(now);
                osc1.stop(now + 1.2);
                osc2.stop(now + 1.2);
            } else if (instrument === 'sasando') {
                // Plucked string (Sawtooth with lowpass filter sweep + Sine)
                const filter = audioCtx.createBiquadFilter();
                osc1.connect(filter);
                filter.connect(gainNode);

                osc1.type = 'sawtooth';
                osc1.frequency.setValueAtTime(freq, now);
                osc2.type = 'sine';
                osc2.frequency.setValueAtTime(freq * 0.99, now);

                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(1200, now);
                filter.frequency.exponentialRampToValueAtTime(80, now + 0.5);

                gainNode.gain.setValueAtTime(0.2, now);
                gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
                osc1.start(now);
                osc2.start(now);
                osc1.stop(now + 0.82);
                osc2.stop(now + 0.82);
            } else if (instrument === 'tifa') {
                // Deep resonant drum thud (Pitch ramp down)
                osc1.type = 'sine';
                osc1.frequency.setValueAtTime(140, now);
                osc1.frequency.exponentialRampToValueAtTime(55, now + 0.12);

                gainNode.gain.setValueAtTime(0.35, now);
                gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
                osc1.start(now);
                osc1.stop(now + 0.42);
            } else if (instrument === 'suling') {
                // Wind blow sound with subtle pitch vibrato (LFO)
                osc1.type = 'sine';
                osc1.frequency.setValueAtTime(freq, now);

                // Vibrato (LFO)
                const lfo = audioCtx.createOscillator();
                const lfoGain = audioCtx.createGain();
                lfo.frequency.value = 6.5; // 6.5 Hz vibrato
                lfoGain.gain.value = 8; // pitch variance in Hz

                lfo.connect(lfoGain);
                lfoGain.connect(osc1.frequency);

                gainNode.gain.setValueAtTime(0.01, now);
                gainNode.gain.linearRampToValueAtTime(0.12, now + 0.08); // wind buildup
                gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

                lfo.start(now);
                osc1.start(now);
                lfo.stop(now + 1.8);
                osc1.stop(now + 1.8);
            }
        } catch (e) {
            console.warn("Audio Context init blocked or failed:", e);
        }
    }

    // Scale mapping for procedural melody generators
    const scales = {
        gamelan: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25], // Slendro: C, D, E, G, A, C
        sasando: [293.66, 329.63, 369.99, 440.00, 493.88, 587.33], // Pentatonic D major: D, E, F#, A, B, D
        tifa: [75, 90, 110, 130], // Bass drum hit frequencies
        suling: [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50] // High Flute notes
    };
    const traditionalScales = {
        slendro: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25],
        pelog: [261.63, 277.18, 329.63, 349.23, 415.30, 523.25],
        madenda: [261.63, 311.13, 349.23, 392.00, 466.16, 523.25]
    };

    function getInstrumentScale(instrument) {
        if (instrument === "tifa") return scales.tifa;
        const base = traditionalScales[activeScaleName] || traditionalScales.slendro;
        const multiplier = instrument === "suling" ? 2 : instrument === "sasando" ? 1.12 : 1;
        return base.map(freq => freq * multiplier);
    }

    function startProceduralMelody(instrument) {
        stopProceduralMelody();
        initAudioContext();
        const noteScale = getInstrumentScale(instrument);
        let step = 0;

        synthPlayingInterval = setInterval(() => {
            // Randomly choose a note from scale, sometimes rest (pause)
            if (Math.random() > 0.2) {
                const randomFreq = noteScale[Math.floor(Math.random() * noteScale.length)];
                playSynthTone(instrument, randomFreq);
            }
            step++;
            if (!isPro() && step >= 20) {
                stopProceduralMelody();
                const btn = document.getElementById("autoplayMelodyBtn");
                if (btn) btn.textContent = "▶ Autoplay Melodi";
            }
        }, 380);
    }

    function stopProceduralMelody() {
        if (synthPlayingInterval) {
            clearInterval(synthPlayingInterval);
            synthPlayingInterval = null;
        }
    }

    // 2. XP & Leveling Engine
    const levelBounds = [0, 100, 300, 600, 1000, 1500];
    const levelNames = [
        "Rakyat Jelata 🌾",
        "Pengembara Muda 🗺️",
        "Cantrik Padepokan 📜",
        "Senopati Kerajaan 🛡️",
        "Patih Gajah Mada 👑",
        "Maharaja Nusantara 🏛️"
    ];

    function getLevelInfo(xp) {
        let level = 1;
        for (let i = 1; i < levelBounds.length; i++) {
            if (xp >= levelBounds[i]) {
                level = i + 1;
            } else {
                break;
            }
        }
        const lowerBound = levelBounds[level - 1];
        const upperBound = levelBounds[level] || Infinity;
        const requiredXP = upperBound - lowerBound;
        const currentXPInLevel = xp - lowerBound;
        const pct = upperBound === Infinity ? 100 : Math.min(100, Math.round((currentXPInLevel / requiredXP) * 100));

        return {
            level,
            levelName: levelNames[level - 1],
            currentXPInLevel,
            requiredXPForNextLevel: upperBound === Infinity ? 0 : requiredXP,
            pct,
            nextLevelName: levelNames[level] || "Kasta Tertinggi"
        };
    }

    function calculateTotalXP(progress) {
        const exploredCount = (progress.explored || []).length;
        const favoritesCount = (progress.favorites || []).length;
        const masteredCount = (progress.mastered || []).length;
        const quizCorrect = progress.correct || 0;
        const voiceSuccess = progress.voiceSuccessCount || 0;
        const pusakasFound = (progress.pusakaUnlocked || []).length;

        return (exploredCount * 10) +
               (favoritesCount * 5) +
               (masteredCount * 20) +
               (quizCorrect * 15) +
               (voiceSuccess * 25) +
               (pusakasFound * 50);
    }

    function addXP(amount) {
        const progress = core.getProgress();
        const oldXP = calculateTotalXP(progress);
        const oldLevelInfo = getLevelInfo(oldXP);

        // We assign extra bonus XP directly in localStorage for quick additions
        progress.bonusXP = (progress.bonusXP || 0) + amount;
        core.saveProgress(progress);

        const newXP = calculateTotalXP(progress);
        const newLevelInfo = getLevelInfo(newXP);

        renderXPBadge();

        if (newLevelInfo.level > oldLevelInfo.level) {
            // Level Up!
            triggerLevelUpCelebration(newLevelInfo);
        } else {
            core.showToast(`+${amount} XP diperoleh!`);
            if (typeof window.playSound === 'function') window.playSound('success');
        }
    }

    function triggerLevelUpCelebration(levelInfo) {
        if (typeof window.playSound === 'function') window.playSound('fanfare');
        triggerConfetti(3500);

        // Custom Modal Naik Kasta
        const modal = document.createElement("div");
        modal.className = "level-up-modal-overlay";
        modal.innerHTML = `
            <div class="level-up-modal-box">
                <div class="crown-icon">👑</div>
                <h2>Kasta Kebudayaan Naik!</h2>
                <p>Selamat, tingkat pemahaman nusantara kamu telah meningkat!</p>
                <div class="kasta-pill">${levelInfo.levelName}</div>
                <button class="btn btn-primary" id="closeLevelUpModal">Lanjutkan Pengembaraan</button>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById("closeLevelUpModal").addEventListener("click", () => {
            modal.classList.add("fade-out");
            setTimeout(() => modal.remove(), 400);
        });
    }

    function renderXPBadge() {
        const progress = core.getProgress();
        const xp = calculateTotalXP(progress);
        const info = getLevelInfo(xp);

        // Update elements on page
        const lvlNameEl = document.getElementById("kastaLevelName");
        const xpTextEl = document.getElementById("kastaXPText");
        const xpBarEl = document.getElementById("kastaXPBarFill");
        const xpLvlNumberEl = document.getElementById("kastaLevelNumber");

        if (lvlNameEl) lvlNameEl.textContent = info.levelName;
        if (xpTextEl) {
            if (info.requiredXPForNextLevel === 0) {
                xpTextEl.textContent = `${xp} XP (Maksimum)`;
            } else {
                xpTextEl.textContent = `${info.currentXPInLevel} / ${info.requiredXPForNextLevel} XP untuk naik ke ${info.nextLevelName}`;
            }
        }
        if (xpBarEl) xpBarEl.style.width = `${info.pct}%`;
        if (xpLvlNumberEl) xpLvlNumberEl.textContent = info.level;
    }

    // Canvas Confetti Generator (diluar nalar!)
    function triggerConfetti(duration = 2500) {
        const canvas = document.createElement("canvas");
        canvas.style.position = "fixed";
        canvas.style.top = "0";
        canvas.style.left = "0";
        canvas.style.width = "100vw";
        canvas.style.height = "100vh";
        canvas.style.zIndex = "9999";
        canvas.style.pointerEvents = "none";
        document.body.appendChild(canvas);

        const ctx = canvas.getContext("2d");
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        window.addEventListener("resize", () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });

        const colors = ["#32d66b", "#4f8cff", "#ffcf4f", "#ff4f73", "#b94fff"];
        const particles = [];

        for (let i = 0; i < 120; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * -height - 20,
                r: Math.random() * 6 + 4,
                d: Math.random() * height,
                color: colors[Math.floor(Math.random() * colors.length)],
                tilt: Math.random() * 10 - 5,
                tiltAngleIncremental: Math.random() * 0.07 + 0.02,
                tiltAngle: 0
            });
        }

        let animationFrame;
        const startTime = Date.now();

        function draw() {
            ctx.clearRect(0, 0, width, height);

            particles.forEach((p) => {
                p.tiltAngle += p.tiltAngleIncremental;
                p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
                p.x += Math.sin(p.tiltAngle);
                p.tilt = Math.sin(p.tiltAngle - p.r / 2) * 15;

                ctx.beginPath();
                ctx.lineWidth = p.r;
                ctx.strokeStyle = p.color;
                ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
                ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
                ctx.stroke();

                // Recycle particles
                if (p.y > height) {
                    p.x = Math.random() * width;
                    p.y = -20;
                }
            });

            if (Date.now() - startTime < duration) {
                animationFrame = requestAnimationFrame(draw);
            } else {
                cancelAnimationFrame(animationFrame);
                canvas.classList.add("fade-out");
                setTimeout(() => canvas.remove(), 500);
            }
        }

        draw();
    }

    // 3. Web Speech API Pronunciation Validator
    let isListening = false;
    let voiceRecognition = null;

    function startVoiceChallenge(targetText, onStatusUpdate) {
        if (isListening) {
            stopVoiceChallenge();
            onStatusUpdate("ready", "🎤 Uji Pelafalan");
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            onStatusUpdate("unsupported", "Browser tidak mendukung Web Speech API");
            core.showToast("Browser kamu tidak mendukung suara. Coba gunakan Google Chrome/Edge.");
            return;
        }

        initAudioContext();
        voiceRecognition = new SpeechRecognition();
        voiceRecognition.lang = 'id-ID';
        voiceRecognition.interimResults = false;
        voiceRecognition.maxAlternatives = 1;

        voiceRecognition.onstart = () => {
            isListening = true;
            onStatusUpdate("listening", "🔴 Mendengarkan... Silakan ucapkan kata di atas!");
            if (typeof window.playSound === 'function') window.playSound('click');
        };

        voiceRecognition.onerror = (e) => {
            isListening = false;
            onStatusUpdate("error", `Galat Mikrofon: ${e.error}`);
            console.error("Speech Recognition Error:", e);
        };

        voiceRecognition.onend = () => {
            isListening = false;
        };

        voiceRecognition.onresult = (e) => {
            const transcript = e.results[0][0].transcript.toLowerCase().trim();
            const confidence = e.results[0][0].confidence;
            console.log(`Speech Result: "${transcript}" with confidence ${confidence}`);

            // Normalization
            const cleanTarget = targetText.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").trim();
            const cleanTranscript = transcript.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").trim();

            // Compare similarity
            const similarity = getPhraseSimilarity(cleanTarget, cleanTranscript);
            const accuracy = Math.round(similarity * 100);
            const fluencyLabel = accuracy >= 90 ? "Sangat Lancar" : accuracy >= 70 ? "Lafal Jelas" : "Perlu Latihan";
            const isMatch = similarity >= 0.65;

            if (isMatch) {
                onStatusUpdate("success", `Akurasi ${accuracy}% - ${fluencyLabel}. Terdengar: "${transcript}"`);
                
                // Save progress
                const progress = core.getProgress();
                progress.voiceSuccessCount = (progress.voiceSuccessCount || 0) + 1;
                core.saveProgress(progress);

                // Add XP (with trigger confetti and success sound)
                addXP(25);
            } else {
                onStatusUpdate("fail", `Akurasi ${accuracy}% - ${fluencyLabel}. Terdengar: "${transcript}".`);
                if (typeof window.playSound === 'function') window.playSound('alarm');
            }
        };

        voiceRecognition.start();
    }

    function stopVoiceChallenge() {
        if (voiceRecognition && isListening) {
            voiceRecognition.stop();
            isListening = false;
        }
    }

    function getPhraseSimilarity(s1, s2) {
        // Direct matching
        if (s1 === s2) return 1;
        if (s1.includes(s2) || s2.includes(s1)) {
            return Math.min(s1.length, s2.length) / Math.max(s1.length, s2.length);
        }

        // Levenshtein distance for fuzzy matching
        const len1 = s1.length;
        const len2 = s2.length;
        const matrix = [];

        for (let i = 0; i <= len1; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= len2; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= len1; i++) {
            for (let j = 1; j <= len2; j++) {
                if (s1[i - 1] === s2[j - 1]) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1, // substitution
                        matrix[i][j - 1] + 1,     // insertion
                        matrix[i - 1][j] + 1      // deletion
                    );
                }
            }
        }
        const dist = matrix[len1][len2];
        const maxLen = Math.max(len1, len2);
        const similarity = 1 - dist / maxLen;

        return similarity;
    }

    // 4. Treasure Hunt Engine
    const riddles = [
        {
            id: 0,
            question: "Aku adalah belati tikam berlekuk khas keraton Jawa dengan pamor besi meteorit berwibawa tinggi. Buka daerahku di peta!",
            region: "Jawa",
            placeId: "jawa",
            pusakaName: "Keris Pusaka Jawa",
            icon: "🗡️"
        },
        {
            id: 1,
            question: "Aku adalah senjata tajam genggam legendaris dengan gagang melengkung mirip pistol dari tanah Serambi Mekkah. Buka daerahku!",
            region: "Sumatra",
            placeId: "aceh",
            pusakaName: "Rencong Aceh",
            icon: "🔪"
        },
        {
            id: 2,
            question: "Aku adalah bilah pusaka bermotif meliuk mirip tanduk yang menjadi simbol kesaktian Prabu Siliwangi dari tanah Pasundan. Buka daerahku!",
            region: "Jawa",
            placeId: "sunda",
            pusakaName: "Kujang Pajajaran",
            icon: "🌙"
        },
        {
            id: 3,
            question: "Aku adalah ikat kepala kain tradisional Bali yang dilipat melambangkan pemusatan pikiran dan ritual keagamaan. Buka daerahku!",
            region: "Bali-Nusa",
            placeId: "bali",
            pusakaName: "Udeng Dewata Bali",
            icon: "👳"
        },
        {
            id: 4,
            question: "Aku adalah tameng kayu berukir dan pedang hias tebas gagah milik kesatria rimba pelindung rumah Betang. Buka daerahku!",
            region: "Kalimantan",
            placeId: "dayak",
            pusakaName: "Mandau Perisai Dayak",
            icon: "🛡️"
        },
        {
            id: 5,
            question: "Aku adalah tas rajutan serat kayu alami yang dikaitkan di dahi, simbol kerajinan adat tinggi suku pegunungan timur. Buka daerahku!",
            region: "Papua Raya",
            placeId: "papua-provinsi",
            pusakaName: "Noken Anggrek Papua",
            icon: "👜"
        }
    ];

    let activeRiddleIndex = 0;

    function initTreasureHunt() {
        const progress = core.getProgress();
        const unlocked = progress.pusakaUnlocked || [];
        activeRiddleIndex = 0;

        // Find the first locked riddle index
        for (let i = 0; i < riddles.length; i++) {
            const hasPusaka = unlocked.some(p => p.id === riddles[i].id);
            if (!hasPusaka) {
                activeRiddleIndex = i;
                break;
            }
            if (i === riddles.length - 1) {
                activeRiddleIndex = -1; // All unlocked!
            }
        }

        renderTreasureHuntPanel();
        renderMuseumPusaka();
    }

    function renderTreasureHuntPanel() {
        const panel = document.getElementById("treasureHuntPanel");
        if (!panel) return;

        if (activeRiddleIndex === -1) {
            panel.innerHTML = `
                <div class="hunt-done-card">
                    <span class="gold-crown">🏆</span>
                    <h4>Semua Pusaka Ditemukan!</h4>
                    <p>Selamat! Kamu telah mengumpulkan seluruh pusaka Nusantara di Museum.</p>
                </div>
            `;
            return;
        }

        const riddle = riddles[activeRiddleIndex];
        panel.innerHTML = `
            <div class="hunt-card">
                <div class="hunt-header">
                    <span class="pulse-dot"></span>
                    <strong>Teka-Teki Pusaka #${activeRiddleIndex + 1}</strong>
                </div>
                <p class="riddle-text">"${riddle.question}"</p>
                <div class="hunt-footer">
                    <small>Petunjuk: Klik wilayah yang sesuai di peta atas!</small>
                </div>
                <button class="btn btn-ghost radar-btn" id="activatePusakaRadar" ${isPro() ? "" : "disabled"}>
                    Aktifkan Radar Pusaka 📡${isPro() ? "" : " (Pro)"}
                </button>
            </div>
        `;
        const radarBtn = document.getElementById("activatePusakaRadar");
        if (radarBtn && isPro()) {
            radarBtn.addEventListener("click", () => {
                document.querySelectorAll(".map-region").forEach(region => region.classList.remove("radar-active"));
                const targetRegion = riddle.region === "Papua Raya" ? "Papua" : riddle.region;
                const target = document.querySelector(`.map-region[data-region="${targetRegion}"]`);
                if (target) {
                    target.classList.add("radar-active");
                    target.scrollIntoView({ behavior: "smooth", block: "center" });
                }
            });
        }
    }

    function renderMuseumPusaka() {
        const museum = document.getElementById("museumPusakaGrid");
        if (!museum) return;

        const progress = core.getProgress();
        const unlocked = progress.pusakaUnlocked || [];

        museum.innerHTML = riddles.map(r => {
            const isUnlocked = unlocked.some(u => u.id === r.id);
            return `
                <div class="museum-item ${isUnlocked ? "unlocked" : "locked"}" data-tooltip="${isUnlocked ? r.pusakaName : "Terkunci: Pecahkan teka-teki berburu pusaka"}">
                    <div class="museum-icon">${isUnlocked ? r.icon : "🔒"}</div>
                    <strong>${isUnlocked ? r.pusakaName.split(" ")[0] : "???"}</strong>
                    <small>${isUnlocked ? r.pusakaName : "Misteri Nusantara"}</small>
                </div>
            `;
        }).join("");
    }

    function checkHuntSelection(regionName, placeId) {
        if (activeRiddleIndex === -1) return false;
        const target = riddles[activeRiddleIndex];

        // Match either region (e.g. Papua Raya) or the clicked placeId (e.g. papua-provinsi)
        const matchRegion = regionName === target.region;
        const matchPlace = placeId === target.placeId;

        if (matchRegion || matchPlace) {
            // Success! Unlock pusaka
            const progress = core.getProgress();
            progress.pusakaUnlocked = progress.pusakaUnlocked || [];
            progress.pusakaUnlocked.push({ id: target.id, name: target.pusakaName });
            core.saveProgress(progress);

            triggerConfetti(2000);
            if (typeof window.playSound === 'function') window.playSound('success');

            // Fancy modal reward
            const modal = document.createElement("div");
            modal.className = "level-up-modal-overlay";
            modal.innerHTML = `
                <div class="level-up-modal-box gold-theme">
                    <div class="crown-icon animate-bounce">${target.icon}</div>
                    <h2>Pusaka Ditemukan!</h2>
                    <p>Kamu berhasil memecahkan teka-teki dan menggali pusaka kuno:</p>
                    <div class="kasta-pill gold">${target.pusakaName}</div>
                    <div style="font-size: 14px; color: var(--green); font-weight: bold; margin-bottom: 20px;">+50 XP Ditambahkan</div>
                    <button class="btn btn-primary" id="closePusakaModal">Simpan di Museum</button>
                </div>
            `;
            document.body.appendChild(modal);

            document.getElementById("closePusakaModal").addEventListener("click", () => {
                modal.classList.add("fade-out");
                setTimeout(() => {
                    modal.remove();
                    initTreasureHunt(); // Advance to next riddle
                }, 400);
            });

            addXP(50);
            return true;
        }
        return false;
    }

    // 5. Spin Wheel of Fortune
    function initSpinWheel() {
        const wheelCanvas = document.getElementById("wheelCanvas");
        const spinBtn = document.getElementById("spinWheelBtn");
        if (!wheelCanvas || !spinBtn) return;

        const dpr = window.devicePixelRatio || 1;
        const displayWidth = 280;
        const displayHeight = 280;

        // Set buffer size to match physical pixel density
        wheelCanvas.width = displayWidth * dpr;
        wheelCanvas.height = displayHeight * dpr;
        wheelCanvas.style.width = `${displayWidth}px`;
        wheelCanvas.style.height = `${displayHeight}px`;

        const ctx = wheelCanvas.getContext("2d");
        ctx.scale(dpr, dpr); // Automatically scales all drawing coordinates

        const radius = displayWidth / 2;
        const sectors = [
            { label: "Sumatra", color: "#3a4a75", val: "Sumatra" },
            { label: "Jawa", color: "#32d66b", val: "Jawa" },
            { label: "Bali-Nusa", color: "#4f8cff", val: "Bali-Nusa" },
            { label: "Kalimantan", color: "#ffcf4f", val: "Kalimantan" },
            { label: "Sulawesi", color: "#ff4f73", val: "Sulawesi" },
            { label: "Papua-Maluku", color: "#b94fff", val: "Papua Raya" },
            { label: "Bonus 40 XP", color: "#e67e22", val: "xp-40" },
            { label: "Bonus 60 XP", color: "#9b59b6", val: "xp-60" },
            { label: "Pusaka Hint", color: "#d4af37", val: "pusaka-hint" }
        ];
        const proMode = isPro();
        document.querySelector(".spin-wheel-section")?.classList.toggle("pro-golden-glow", proMode);
        if (!spinBtn.disabled) {
            spinBtn.textContent = proMode ? "Putar Roda Emas Pro (Double XP)" : "Putar Roda";
        }

        const arc = Math.PI * 2 / sectors.length;
        let startAngle = 0;
        let isSpinning = false;

        function drawWheel() {
            ctx.clearRect(0, 0, displayWidth, displayHeight);
            for (let i = 0; i < sectors.length; i++) {
                const angle = startAngle + i * arc;
                ctx.fillStyle = proMode
                    ? ["#5c4300", "#9b7200", "#d4af37", "#6f5200"][i % 4]
                    : sectors[i].color;
                ctx.beginPath();
                ctx.moveTo(radius, radius);
                ctx.arc(radius, radius, radius - 10, angle, angle + arc, false);
                ctx.lineTo(radius, radius);
                ctx.fill();

                // Draw label
                ctx.save();
                ctx.fillStyle = "#ffffff";
                ctx.font = "bold 10px Inter";
                ctx.translate(radius, radius);
                ctx.rotate(angle + arc / 2);
                ctx.textAlign = "right";
                ctx.fillText(sectors[i].label, radius - 20, 4);
                ctx.restore();
            }

            // Draw center pointer base
            ctx.beginPath();
            ctx.fillStyle = "#ffffff";
            ctx.arc(radius, radius, 16, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.fillStyle = "#1e2230";
            ctx.arc(radius, radius, 10, 0, Math.PI * 2);
            ctx.fill();
        }

        drawWheel();

        // Check if spun today
        const progress = core.getProgress();
        const lastSpin = progress.lastSpinDay || "";
        const today = new Date().toISOString().slice(0, 10);

        if (lastSpin === today) {
            spinBtn.disabled = true;
            spinBtn.textContent = "Sudah Diputar Hari Ini";
            spinBtn.classList.add("btn-disabled");
        }

        spinBtn.addEventListener("click", () => {
            if (isSpinning) return;
            isSpinning = true;
            spinBtn.disabled = true;

            if (typeof window.playSound === 'function') window.playSound('laser');

            // Generate random spins
            const spins = 5 + Math.floor(Math.random() * 5);
            const extraAngle = Math.random() * Math.PI * 2;
            const totalRotation = spins * Math.PI * 2 + extraAngle;

            let duration = 3500;
            let start = null;

            function animate(timestamp) {
                if (!start) start = timestamp;
                const elapsed = timestamp - start;
                const progressRatio = Math.min(elapsed / duration, 1);
                
                // Ease out cubic
                const easeOut = 1 - Math.pow(1 - progressRatio, 3);
                const currentAngle = totalRotation * easeOut;

                startAngle = currentAngle % (Math.PI * 2);
                drawWheel();

                if (progressRatio < 1) {
                    requestAnimationFrame(animate);
                } else {
                    isSpinning = false;
                    
                    // Determine winning sector
                    // The pointer is at 12 o'clock, which corresponds to 3*Math.PI/2 (or 270 deg)
                    // The wheel rotates clockwise, so we subtract from 2*Math.PI
                    const pointerAngle = (3 * Math.PI / 2 - startAngle + Math.PI * 2) % (Math.PI * 2);
                    const winningIndex = Math.floor(pointerAngle / arc) % sectors.length;
                    const winner = sectors[winningIndex];

                    dispatchWheelReward(winner);

                    // Save spin status
                    const p = core.getProgress();
                    p.lastSpinDay = today;
                    core.saveProgress(p);

                    spinBtn.textContent = "Sudah Diputar Hari Ini";
                    spinBtn.classList.add("btn-disabled");
                }
            }

            requestAnimationFrame(animate);
        });
    }

    function dispatchWheelReward(winner) {
        if (typeof window.playSound === 'function') window.playSound('success');

        const xpMultiplier = isPro() ? 2 : 1;
        if (winner.val === "pusaka-hint") {
            const target = riddles[activeRiddleIndex];
            if (target) {
                core.showToast(`Pusaka Hint: cari di region ${target.region}.`);
                const targetRegion = target.region === "Papua Raya" ? "Papua" : target.region;
                document.querySelector(`.map-region[data-region="${targetRegion}"]`)?.classList.add("radar-active");
            } else {
                core.showToast("Semua pusaka sudah ditemukan.");
            }
        } else if (winner.val.startsWith("xp-")) {
            const xpVal = parseInt(winner.val.split("-")[1]);
            core.showToast(`Selamat! Roda Keberuntungan mendarat di ${winner.label}!`);
            addXP(xpVal * xpMultiplier);
        } else {
            // Region Filter Challenge
            core.showToast(`Tantangan Hari Ini: Jelajahi Region ${winner.val}!`);
            
            // Auto trigger region selection
            const chip = document.querySelector(`.region-chip[data-region="${winner.val}"]`);
            if (chip) {
                chip.click();
                setTimeout(() => {
                    const grid = document.getElementById("cultureGrid");
                    if (grid) grid.scrollIntoView({ behavior: 'smooth' });
                }, 400);
            }
            addXP(20 * xpMultiplier); // Base reward for spinning
        }
    }

    // 6. Init Drawer Musical Keys & Pronunciation Triggers
    function setupDrawerGames(place) {
        const playBtn = document.getElementById("drawerListenWord");
        const cardArea = document.querySelector(".drawer-flashcard-actions");
        
        // Remove duplicate mic button if exists
        const oldMic = document.getElementById("drawerSpeechChallengeBtn");
        if (oldMic) oldMic.remove();
        document.getElementById("speechStatusBanner")?.remove();
        document.querySelector(".speech-waveform")?.remove();

        // Create the Voice Challenge microphone button
        if (cardArea) {
            const micBtn = document.createElement("button");
            micBtn.className = "btn btn-ghost mic-challenge-btn";
            micBtn.id = "drawerSpeechChallengeBtn";
            micBtn.innerHTML = `🎤 Uji Pelafalan`;
            cardArea.appendChild(micBtn);

            const statusBanner = document.createElement("div");
            statusBanner.className = "speech-status-banner";
            statusBanner.id = "speechStatusBanner";
            statusBanner.style.display = "none";
            const waveform = document.createElement("div");
            waveform.className = "speech-waveform";
            waveform.setAttribute("aria-hidden", "true");
            waveform.innerHTML = Array.from({ length: 12 }, () => "<i></i>").join("");
            
            const flashcardContainer = document.querySelector(".drawer-flashcard-container");
            if (flashcardContainer) {
                flashcardContainer.parentNode.insertBefore(statusBanner, flashcardContainer.nextSibling);
                statusBanner.after(waveform);
            }

            micBtn.addEventListener("click", () => {
                const phrase = document.querySelector("#drawerFlashcard strong")?.textContent.trim() || place.cards[0]?.[0] || "";
                
                startVoiceChallenge(phrase, (status, text) => {
                    statusBanner.style.display = "block";
                    statusBanner.className = `speech-status-banner status-${status}`;
                    statusBanner.innerHTML = `
                        <div class="speech-status-icon">
                            ${status === 'listening' ? '<i class="fa-solid fa-microphone animate-pulse text-red"></i>' : 
                              status === 'success' ? '<i class="fa-solid fa-circle-check text-green"></i>' :
                              status === 'fail' ? '<i class="fa-solid fa-circle-xmark text-red"></i>' :
                              '<i class="fa-solid fa-triangle-exclamation"></i>'}
                        </div>
                        <div class="speech-status-text">${text}</div>
                    `;
                    
                    if (status === 'listening') {
                        micBtn.classList.add("listening");
                        waveform.classList.add("active");
                        micBtn.innerHTML = `🔴 Stop Merekam`;
                    } else {
                        micBtn.classList.remove("listening");
                        waveform.classList.remove("active");
                        micBtn.innerHTML = `🎤 Uji Pelafalan`;
                        if (status === 'success' || status === 'fail') {
                            setTimeout(() => {
                                statusBanner.style.display = "none";
                            }, 4500);
                        }
                    }
                });
            });
        }

        // Initialize virtual instruments in the custom Tab
        const instrumentsTab = document.getElementById("tab-instrument");
        if (instrumentsTab) {
            let instType = 'gamelan';
            if (place.region === 'Sumatra') instType = 'suling';
            if (place.region === 'Bali-Nusa') instType = 'sasando';
            if (place.region === 'Papua Raya') instType = 'tifa';

            const notes = getInstrumentScale(instType);
            const labelNotes = instType === 'tifa' ? ["Ketuk 1", "Ketuk 2", "Ketuk 3", "Ketuk 4"] : ["Ji (1)", "Ro (2)", "Lu (3)", "Ma (5)", "Nem (6)", "Ji Tinggi (1̇)"];

            instrumentsTab.innerHTML = `
                <div class="instrument-box">
                    <h4>Virtual ${instType.toUpperCase()} ${place.label}</h4>
                    <p class="muted">Gunakan mouse atau ketukan untuk memainkan instrumen tradisional daerah ini secara dinamis.</p>
                    <label class="scale-selector">
                        <span>Tangga Nada</span>
                        <select id="traditionalScaleSelect">
                            <option value="slendro">Slendro</option>
                            <option value="pelog">Pelog</option>
                            <option value="madenda">Madenda/Sorog</option>
                        </select>
                    </label>
                    
                    <div class="virtual-key-row scale-${instType}">
                        ${notes.map((freq, idx) => `
                            <button class="instrument-key key-${instType}" data-freq="${freq}">
                                <span>${labelNotes[idx] || idx}</span>
                            </button>
                        `).join("")}
                    </div>

                    <div class="instrument-control-actions">
                        <button class="btn btn-primary" id="autoplayMelodyBtn">▶ Autoplay Melodi</button>
                        <button class="btn btn-ghost" id="stopMelodyBtn">⏹ Stop</button>
                    </div>
                </div>
            `;

            const scaleSelect = document.getElementById("traditionalScaleSelect");
            if (scaleSelect) {
                scaleSelect.value = activeScaleName;
                scaleSelect.addEventListener("change", () => {
                    activeScaleName = scaleSelect.value;
                    setupDrawerGames(place);
                });
            }

            instrumentsTab.querySelectorAll(".instrument-key").forEach(key => {
                key.addEventListener("click", () => {
                    const freq = parseFloat(key.getAttribute("data-freq"));
                    playSynthTone(instType, freq);

                    // Pulse effect animation
                    key.classList.add("hit");
                    setTimeout(() => key.classList.remove("hit"), 150);
                });
            });

            const autoplayBtn = document.getElementById("autoplayMelodyBtn");
            const stopBtn = document.getElementById("stopMelodyBtn");

            if (autoplayBtn) {
                autoplayBtn.addEventListener("click", () => {
                    initAudioContext();
                    if (synthPlayingInterval) {
                        stopProceduralMelody();
                        autoplayBtn.textContent = "▶ Autoplay Melodi";
                    } else {
                        startProceduralMelody(instType);
                        autoplayBtn.textContent = "⏸ Pause Melodi";
                    }
                });
            }

            if (stopBtn) {
                stopBtn.addEventListener("click", () => {
                    stopProceduralMelody();
                    if (autoplayBtn) autoplayBtn.textContent = "▶ Autoplay Melodi";
                });
            }
        }
    }

    // Hook to detail drawer open to bind voice and audio challenge
    function hookDrawerOpen() {
        const originalOpenDrawer = window.openDrawer;
        if (!originalOpenDrawer) return;

        window.openDrawer = function(placeId) {
            originalOpenDrawer.apply(this, arguments);
            const place = data.getPlaceById(placeId);
            setupDrawerGames(place);
        };
    }

    // Load hook on boot
    document.addEventListener("DOMContentLoaded", () => {
        const subscriptionButtons = document.querySelectorAll("[data-subscription]");
        const syncSubscriptionUI = () => {
            const mode = isPro() ? "pro" : "basic";
            document.body.dataset.subscription = mode;
            subscriptionButtons.forEach(button => {
                button.classList.toggle("active", button.dataset.subscription === mode);
            });
        };
        syncSubscriptionUI();
        subscriptionButtons.forEach(button => {
            button.addEventListener("click", () => {
                localStorage.setItem("eduquestSubscription", button.dataset.subscription);
                syncSubscriptionUI();
                window.location.reload();
            });
        });
        // Run game initializers
        setTimeout(() => {
            renderXPBadge();
            initTreasureHunt();
            initSpinWheel();
            hookDrawerOpen();

            // Override card rendering next/prev triggers in drawer to update index
            const origRenderCard = window.renderDrawerCard;
            if (origRenderCard) {
                window.renderDrawerCard = function() {
                    origRenderCard.apply(this, arguments);
                    // Share card index to global window scope so startVoiceChallenge can fetch active card
                    window.drawerCardIndex = this.drawerCardIndex || 0;
                };
            }

            // Bind click hook on Map Regions to verify Pusaka Hunt
            document.querySelectorAll(".map-region").forEach(regionEl => {
                regionEl.addEventListener("click", () => {
                    const regionName = regionEl.dataset.region === "Papua" ? "Papua Raya" : regionEl.dataset.region;
                    // Run click verify
                    checkHuntSelection(regionName, null);
                });
            });

            // Make addXP available globally for external achievements or kuis pages
            window.addXP = addXP;
            window.triggerConfetti = triggerConfetti;
        }, 300);
    });

    window.WonderfulGames = {
        addXP,
        getLevelInfo,
        triggerConfetti,
        startVoiceChallenge,
        playSynthTone,
        checkHuntSelection,
        initTreasureHunt
    };
})();
