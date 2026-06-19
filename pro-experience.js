(() => {
    "use strict";

    const PRO_KEY = "eduquestSubscription";
    const SESSION_KEY = "eduquestUserSession";
    const THEME_KEY = "eduquestProTheme";

    // Ambient Synthesizer State
    let activeAmbient = null;
    let ambientInterval = null;
    let audioCtx = null;
    let mainGain = null;
    let noiseSource = null;
    let droneOsc1 = null;
    let droneOsc2 = null;

    function readJSON(key, fallback) {
        try {
            return JSON.parse(localStorage.getItem(key) || "null") ?? fallback;
        } catch {
            return fallback;
        }
    }

    function isProUser() {
        return localStorage.getItem(PRO_KEY) === "pro";
    }

    function getStats() {
        const wonderful = readJSON("bahasa_progress", {});
        const lms = readJSON("eduquestLmsProgress", {});
        const rpg = readJSON("eduquestRPG", {});
        const xp = Math.max(
            Number(localStorage.getItem("eduquestXP") || 0),
            Number(rpg.xp || 0),
            Number(lms.xp || 0)
        );
        const streak = Math.max(
            Number(localStorage.getItem("eduquestStreak") || 0),
            Number(wonderful.streak || 0),
            Number(lms.streak || 0),
            Number(rpg.streak || 0)
        );
        const accuracy = Math.round(((wonderful.correct || 0) / Math.max(wonderful.reviewed || 0, 1)) * 100);
        return {
            xp,
            streak,
            accuracy,
            modules: Number(lms.completedModules || 0),
            reviewed: Number(wonderful.reviewed || 0) + Number(lms.questionsAnswered || 0)
        };
    }

    function getPageConfig(page, stats, username) {
        const commonLabel = `${username} Pro Access`;
        const score = value => `${Math.min(100, Math.max(1, Math.round(value)))}%`;
        const map = {
            index: {
                score: score((stats.xp / 120) + (stats.streak * 3)),
                title: "Pro Command Deck",
                desc: "Rute belajar, ritme harian, dan shortcut aksi cepat sekarang terasa lebih concierge daripada dashboard biasa.",
                cards: [
                    { icon: "fa-crown", title: "Priority Learning Lane", text: "Masuk langsung ke jalur belajar yang paling relevan berdasarkan XP dan streak kamu." },
                    { icon: "fa-sparkles", title: "Exclusive Momentum", text: `${stats.streak} hari streak aktif dipakai sebagai sinyal untuk mendorong rekomendasi yang lebih agresif.` },
                    { icon: "fa-rocket", title: "Fast Resume", text: "Lompat ke materi, arena quiz, atau TKA tanpa harus cari ulang dari awal." }
                ],
                actions: [
                    { href: "materi.html", label: "Masuk Jalur Pro", meta: "Roadmap prioritas" },
                    { href: "quiz.html", label: "Arena Elite", meta: "Combo & tempo" },
                    { href: "profile.html#insights", label: "Buka Insights", meta: "Kontrol penuh" }
                ],
                dockTitle: "Control Center",
                dockText: `${commonLabel}. Semua halaman inti sekarang punya lapisan pengalaman premium yang lebih cepat dibaca.`
            },
            materi: {
                score: score(Math.max(12, stats.modules * 14 + (stats.xp / 140))),
                title: "Pro Study Flow",
                desc: "Halaman materi terasa lebih eksklusif dengan aksen roadmap, fokus mingguan, dan alur resume yang lebih tajam untuk member Pro.",
                cards: [
                    { icon: "fa-diagram-project", title: "Roadmap Prioritas", text: "Saring pembelajaran dengan ritme yang lebih terarah untuk capaian mingguan." },
                    { icon: "fa-layer-group", title: "Focus Stack", text: "Modul yang kamu sentuh paling sering jadi kandidat utama untuk pendalaman berikutnya." },
                    { icon: "fa-hourglass-half", title: "Time Allocation", text: "Bagi jam belajar menjadi blok konsep, drill, dan project tanpa terasa berat." }
                ],
                actions: [
                    { href: "#learning-os", label: "Lanjut Study OS", meta: "Planner Pro" },
                    { href: "#planner", label: "Buka Planner", meta: "Kanban belajar" },
                    { href: "quiz.html", label: "Tes Pemahaman", meta: "Quick validation" }
                ],
                dockTitle: "Study Concierge",
                dockText: `XP ${stats.xp.toLocaleString("id-ID")} dan ${stats.modules} modul aktif dipakai untuk menyusun ritme belajar Pro.`
            },
            quiz: {
                score: score(Math.max(10, (stats.accuracy * 0.8) + (stats.streak * 4))),
                title: "Pro Battle Console",
                desc: "Arena quiz dibuat terasa lebih elite: tempo, combo, review, dan jalur ulang sekarang dibingkai sebagai pengalaman kompetitif premium.",
                cards: [
                    { icon: "fa-shield-heart", title: "Precision Boost", text: `Akurasi global ${stats.accuracy}% dipakai untuk mempersonalisasi rasa urgensi dan feedback.` },
                    { icon: "fa-bolt", title: "Elite Tempo", text: "Masuk ke latihan cepat, review, dan repeat loop tanpa kehilangan konteks." },
                    { icon: "fa-chart-simple", title: "Review First", text: "Fokus diarahkan ke area yang paling mungkin menaikkan skor dalam waktu singkat." }
                ],
                actions: [
                    { href: "#arena", label: "Masuk Arena", meta: "Mode utama" },
                    { href: "#review", label: "Buka Review", meta: "Perbaiki salah" },
                    { href: "profile.html#insights", label: "Lihat Insight", meta: "Lacak konsistensi" }
                ],
                dockTitle: "Quiz Elite Tools",
                dockText: "Untuk member Pro, arena quiz sekarang lebih terasa seperti console pertandingan daripada latihan biasa."
            },
            snbt: {
                score: score(Math.max(15, (stats.streak * 5) + (stats.xp / 160))),
                title: "Pro TKA Accelerator",
                desc: "Portal TKA diberi lapisan premium yang menonjolkan readiness, strategi, dan alur sprint agar terasa lebih serius dan eksklusif.",
                cards: [
                    { icon: "fa-bullseye", title: "Focus Sprint", text: "Arahkan tenaga ke subtes yang paling butuh kenaikan dalam waktu dekat." },
                    { icon: "fa-wave-square", title: "Readiness Signal", text: "Panel premium menekankan kesiapan, bukan hanya sekadar progress angka." },
                    { icon: "fa-list-check", title: "Actionable Next Step", text: "Setelah lihat teori, kamu langsung diarahkan ke latihan yang paling masuk akal." }
                ],
                actions: [
                    { href: "#tka-irt-simulator", label: "Buka Simulator", meta: "Skor IRT" },
                    { href: "#planner", label: "Sprint Planner", meta: "Target mingguan" },
                    { href: "tka-lms.html", label: "Masuk LMS TKA", meta: "Drill mendalam" }
                ],
                dockTitle: "TKA Premium Flow",
                dockText: "Member Pro mendapat framing yang lebih tegas untuk sprint, diagnosis, dan transisi ke LMS TKA."
            },
            "tka-lms": {
                score: score(Math.max(20, (stats.reviewed / 8) + (stats.streak * 4))),
                title: "Pro LMS Control",
                desc: "LMS TKA diberi treatment premium agar sesi latihan terasa seperti cockpit belajar: cepat, fokus, dan informatif.",
                cards: [
                    { icon: "fa-gauge-high", title: "Session Intent", text: "Membantu kamu masuk ke mode latihan dengan konteks tujuan yang lebih jelas." },
                    { icon: "fa-brain", title: "Deep Focus Layer", text: "Lebih cocok untuk sesi panjang, review analitik, dan pengambilan keputusan cepat." },
                    { icon: "fa-route", title: "Fast Routing", text: "Dari setup ke workspace inti tanpa banyak friksi visual." }
                ],
                actions: [
                    { href: "#lms-workspace", label: "Masuk Workspace", meta: "Latihan aktif" },
                    { href: "#lms-analytics", label: "Lihat Analitik", meta: "Performance read" },
                    { href: "snbt.html", label: "Kembali ke Portal", meta: "Strategi & simulator" }
                ],
                dockTitle: "LMS Pro Session",
                dockText: "Pengguna Pro mendapatkan rasa sesi yang lebih eksklusif dan lebih operasional."
            },
            library: {
                score: score(Math.max(8, (stats.reviewed / 10) + (stats.xp / 180))),
                title: "Pro Reading Suite",
                desc: "Library sekarang terasa seperti private reading room: fokus pada desk aktif, catatan, dan pengambilan referensi yang lebih cepat.",
                cards: [
                    { icon: "fa-book-open-reader", title: "Curated Reading Desk", text: "Prioritaskan bacaan yang paling relevan dengan ritme belajar kamu sekarang." },
                    { icon: "fa-note-sticky", title: "Fast Capture", text: "Catatan dan buku aktif dibingkai sebagai ruang kerja pribadi, bukan sekadar list." },
                    { icon: "fa-robot", title: "AI Librarian Priority", text: "Interaksi dengan pustakawan AI terasa lebih eksklusif untuk eksplorasi topik." }
                ],
                actions: [
                    { href: "#katalog", label: "Cari Referensi", meta: "Katalog inti" },
                    { href: "#workspace", label: "Masuk Workspace", meta: "AI & note" },
                    { href: "materi.html", label: "Hubungkan ke Materi", meta: "Belajar terarah" }
                ],
                dockTitle: "Reading Room Pro",
                dockText: "Akses Pro membuat library terasa lebih seperti ruang studi pribadi dan less cluttered."
            },
            profile: {
                score: score(Math.max(25, stats.accuracy + (stats.streak * 3))),
                title: "Pro Identity Layer",
                desc: "Halaman profil diberi sentuhan member lounge: insight, preferensi, dan subscription terasa lebih seperti pusat kontrol premium.",
                cards: [
                    { icon: "fa-id-badge", title: "Member Presence", text: "Identitas Pro kamu sekarang lebih menonjol dan terasa eksklusif." },
                    { icon: "fa-sliders", title: "Personalization First", text: "Preferensi, mode belajar, dan aksen visual kini lebih punya bobot." },
                    { icon: "fa-chart-pie", title: "Concierge Insight", text: "Kamu diarahkan ke data yang berguna, bukan sekadar informasi pasif." }
                ],
                actions: [
                    { href: "#insights", label: "Buka Insight Hub", meta: "Growth control" },
                    { href: "#subscription", label: "Lihat Benefit Pro", meta: "Plan eksklusif" },
                    { href: "materi.html", label: "Resume Learning", meta: "Balik belajar" }
                ],
                dockTitle: "Pro Lounge",
                dockText: "Pusat kontrol akun untuk member Pro kini terasa lebih polished dan lebih punya status."
            }
        };
        return map[page];
    }

    function injectNavBadge() {
        const navbar = document.querySelector(".navbar");
        const brand = navbar?.querySelector(".brand");
        if (!navbar || !brand || navbar.querySelector(".pro-nav-badge")) return;
        const badge = document.createElement("div");
        badge.className = "pro-nav-badge";
        badge.setAttribute("aria-label", "Akun Pro aktif");
        badge.setAttribute("title", "Akun Pro aktif");
        badge.innerHTML = `<i class="fa-solid fa-crown"></i><strong>PRO</strong><span>Active</span>`;
        brand.insertAdjacentElement("afterend", badge);
        navbar.classList.add("pro-navbar");
    }

    function injectSpotlight(config) {
        const main = document.querySelector("main.page");
        const anchor = main?.querySelector(".account-hero, .hero, .lms-session-panel");
        if (!main || !anchor || main.querySelector(".pro-spotlight")) return;
        const section = document.createElement("section");
        section.className = "pro-spotlight";
        section.innerHTML = `
            <div class="pro-spotlight-head">
                <div>
                    <div class="pro-spotlight-label"><i class="fa-solid fa-crown"></i> Pro Experience</div>
                    <h2>${config.title}</h2>
                    <p>${config.desc}</p>
                </div>
                <div class="pro-spotlight-score">
                    <strong>${config.score}</strong>
                    <span>member momentum</span>
                </div>
            </div>
            <div class="pro-spotlight-grid">
                ${config.cards.map(card => `
                    <article class="pro-card">
                        <i class="fa-solid ${card.icon}"></i>
                        <strong>${card.title}</strong>
                        <span>${card.text}</span>
                    </article>
                `).join("")}
            </div>
            <div class="pro-spotlight-actions">
                ${config.actions.map(action => `<a class="pro-link" href="${action.href}">${action.label} <small>${action.meta}</small></a>`).join("")}
            </div>
        `;
        anchor.insertAdjacentElement("afterend", section);
        setupCardSparkles();
    }

    // Cursor Sparkle Dust Effect
    function setupCardSparkles() {
        const cards = document.querySelectorAll(".pro-card");
        let lastCreated = 0;
        cards.forEach(card => {
            card.addEventListener("mousemove", e => {
                const now = Date.now();
                if (now - lastCreated < 40) return; // limit frequency
                lastCreated = now;
                
                const dot = document.createElement("span");
                dot.className = "pro-sparkle-dot";
                dot.style.left = `${e.clientX}px`;
                dot.style.top = `${e.clientY}px`;
                
                // Add random tiny offset
                const offset = 8;
                const rx = (Math.random() - 0.5) * offset;
                const ry = (Math.random() - 0.5) * offset;
                dot.style.transform = `translate(calc(-50% + ${rx}px), calc(-50% + ${ry}px))`;
                
                document.body.appendChild(dot);
                setTimeout(() => dot.remove(), 700);
            });
        });
    }

    // Pro Audio Synth logic
    function initSynth() {
        if (audioCtx) return;
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            mainGain = audioCtx.createGain();
            mainGain.gain.value = 0.08; // Safe soft level
            mainGain.connect(audioCtx.destination);
        } catch(e) {
            console.warn("Synth blocked until interaction", e);
        }
    }

    function stopAllSynth() {
        if (noiseSource) {
            try { noiseSource.stop(); } catch(e){}
            noiseSource = null;
        }
        if (droneOsc1) {
            try { droneOsc1.stop(); } catch(e){}
            droneOsc1 = null;
        }
        if (droneOsc2) {
            try { droneOsc2.stop(); } catch(e){}
            droneOsc2 = null;
        }
        if (ambientInterval) {
            clearInterval(ambientInterval);
            ambientInterval = null;
        }
        activeAmbient = null;
    }

    function playDrone() {
        stopAllSynth();
        initSynth();
        if (!audioCtx) return;
        if (audioCtx.state === "suspended") audioCtx.resume();
        
        const now = audioCtx.currentTime;
        
        droneOsc1 = audioCtx.createOscillator();
        droneOsc1.type = "sine";
        droneOsc1.frequency.setValueAtTime(110, now); // Low A drone
        
        droneOsc2 = audioCtx.createOscillator();
        droneOsc2.type = "triangle";
        droneOsc2.frequency.setValueAtTime(220, now); // 1 Octave higher triangle
        
        const droneGain = audioCtx.createGain();
        droneGain.gain.setValueAtTime(0.04, now);
        
        droneOsc1.connect(droneGain);
        droneOsc2.connect(droneGain);
        droneGain.connect(mainGain);
        
        droneOsc1.start();
        droneOsc2.start();
        activeAmbient = "drone";
    }

    function playRain() {
        stopAllSynth();
        initSynth();
        if (!audioCtx) return;
        if (audioCtx.state === "suspended") audioCtx.resume();

        const bufferSize = 2 * audioCtx.sampleRate;
        const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        noiseSource = audioCtx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        noiseSource.loop = true;

        const filter = audioCtx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(450, audioCtx.currentTime); // Rain sound filter

        const rainGain = audioCtx.createGain();
        rainGain.gain.setValueAtTime(0.2, audioCtx.currentTime);

        noiseSource.connect(filter);
        filter.connect(rainGain);
        rainGain.connect(mainGain);
        
        noiseSource.start();
        activeAmbient = "rain";
    }

    function playChimes() {
        stopAllSynth();
        initSynth();
        if (!audioCtx) return;
        if (audioCtx.state === "suspended") audioCtx.resume();

        activeAmbient = "chimes";
        const triggerChime = () => {
            if (activeAmbient !== "chimes" || !audioCtx) return;
            const frequencies = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50]; // C pentatonic
            const freq = frequencies[Math.floor(Math.random() * frequencies.length)];
            const now = audioCtx.currentTime;
            
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, now);
            
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);
            
            osc.connect(gain);
            gain.connect(mainGain);
            osc.start(now);
            osc.stop(now + 2.6);
        };

        triggerChime();
        ambientInterval = setInterval(triggerChime, 3000);
    }

    function handleAudioClick(mode) {
        initSynth();
        if (activeAmbient === mode) {
            stopAllSynth();
        } else {
            if (mode === "drone") playDrone();
            if (mode === "rain") playRain();
            if (mode === "chimes") playChimes();
        }
        updateAudioButtons();
    }

    function updateAudioButtons() {
        document.querySelectorAll(".pro-audio-btn").forEach(btn => {
            const mode = btn.dataset.audio;
            if (mode === activeAmbient) {
                btn.classList.add("is-active");
            } else {
                btn.classList.remove("is-active");
            }
        });
    }

    // Theme logic
    function initTheme() {
        const theme = localStorage.getItem(THEME_KEY) || "normal";
        if (theme === "gold") {
            document.body.classList.add("pro-gold-theme");
        } else {
            document.body.classList.remove("pro-gold-theme");
        }
    }

    function switchTheme(theme) {
        localStorage.setItem(THEME_KEY, theme);
        initTheme();
        updateThemeButtons();
    }

    function updateThemeButtons() {
        const activeTheme = localStorage.getItem(THEME_KEY) || "normal";
        document.querySelectorAll(".pro-theme-btn").forEach(btn => {
            const theme = btn.dataset.theme;
            if (theme === activeTheme) {
                btn.classList.add("is-active");
            } else {
                btn.classList.remove("is-active");
            }
        });
    }

    function injectDock(config, stats) {
        if (document.querySelector(".pro-dock")) return;
        const expanded = localStorage.getItem("eduquestProDockOpen") === "true";
        const dock = document.createElement("aside");
        dock.className = `pro-dock${expanded ? " is-open" : ""}`;
        
        // Calculate ready score based on progress
        const readiness = Math.min(100, Math.max(10, Math.round((stats.streak * 4) + (stats.accuracy * 0.5) + (stats.modules * 6))));

        dock.innerHTML = `
            <button class="pro-dock-toggle" type="button" aria-expanded="${expanded}" aria-label="Buka Pro concierge">
                <span><i class="fa-solid fa-crown"></i><strong>Pro Lounge</strong></span>
                <i class="fa-solid fa-chevron-up pro-dock-chevron"></i>
            </button>
            <div class="pro-dock-panel">
                <div class="pro-dock-label"><i class="fa-solid fa-star"></i> Private concierge</div>
                <h3>${config.dockTitle}</h3>
                <p>${config.dockText}</p>
                
                <!-- Theme Switcher -->
                <div class="pro-widget-sec">
                    <div class="pro-widget-title"><i class="fa-solid fa-palette"></i> Pro Custom Theme</div>
                    <div class="pro-theme-switches">
                        <button class="pro-theme-btn" data-theme="normal" type="button">Default</button>
                        <button class="pro-theme-btn" data-theme="gold" type="button">Velvet Gold</button>
                    </div>
                </div>

                <!-- Ambient Audio Synth -->
                <div class="pro-widget-sec">
                    <div class="pro-widget-title"><i class="fa-solid fa-headphones"></i> Focus Ambient Sound</div>
                    <div class="pro-audio-grid">
                        <button class="pro-audio-btn" data-audio="drone" type="button" title="Low Frequency Focus Drone">
                            <i class="fa-solid fa-wave-square"></i>Drone
                        </button>
                        <button class="pro-audio-btn" data-audio="rain" type="button" title="Synthesized Soft Rain">
                            <i class="fa-solid fa-cloud-rain"></i>Rain
                        </button>
                        <button class="pro-audio-btn" data-audio="chimes" type="button" title="Pentatonic Sine Chimes">
                            <i class="fa-solid fa-wind"></i>Chimes
                        </button>
                        <button class="pro-audio-btn" data-audio="mute" type="button" title="Stop Audio">
                            <i class="fa-solid fa-volume-xmark"></i>Mute
                        </button>
                    </div>
                </div>

                <!-- Momentum Progress -->
                <div class="pro-widget-sec">
                    <div class="pro-momentum-box">
                        <div class="pro-progress-ring" style="--p: ${readiness}%">
                            <span class="pro-progress-text">${readiness}%</span>
                        </div>
                        <div class="pro-momentum-info">
                            <strong>Daily Momentum</strong>
                            <span>Ready for next sprint</span>
                        </div>
                    </div>
                </div>

                <div class="pro-dock-links">
                    ${config.actions.map(action => `<a href="${action.href}"><span>${action.label}<small>${action.meta}</small></span><i class="fa-solid fa-arrow-right"></i></a>`).join("")}
                </div>
            </div>
        `;
        document.body.appendChild(dock);
        
        // Listeners for Dock
        const toggle = dock.querySelector(".pro-dock-toggle");
        toggle.addEventListener("click", () => {
            const isOpen = dock.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", String(isOpen));
            localStorage.setItem("eduquestProDockOpen", String(isOpen));
            if (isOpen && typeof playSound === "function") {
                playSound("success");
            }
        });

        // Theme switch listener
        dock.querySelectorAll(".pro-theme-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                switchTheme(btn.dataset.theme);
                if (typeof playSound === "function") playSound("click");
            });
        });

        // Ambient sound listeners
        dock.querySelectorAll(".pro-audio-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const mode = btn.dataset.audio;
                if (mode === "mute") {
                    stopAllSynth();
                    updateAudioButtons();
                } else {
                    handleAudioClick(mode);
                }
                if (typeof playSound === "function") playSound("click");
            });
        });

        const closeDock = () => {
            if (!dock.classList.contains("is-open")) return;
            dock.classList.remove("is-open");
            toggle.setAttribute("aria-expanded", "false");
            localStorage.setItem("eduquestProDockOpen", "false");
        };

        dock.querySelectorAll(".pro-dock-links a").forEach(link => {
            link.addEventListener("click", closeDock);
        });

        document.addEventListener("click", event => {
            if (!dock.contains(event.target)) closeDock();
        });

        document.addEventListener("keydown", event => {
            if (event.key === "Escape") closeDock();
        });

        updateAudioButtons();
        updateThemeButtons();
    }

    function injectInlineCard(page, stats) {
        const cards = {
            materi: {
                selector: ".focus-panel",
                title: "Pro routing aktif",
                text: `Berdasarkan XP ${stats.xp.toLocaleString("id-ID")} dan streak ${stats.streak} hari, panel ini sekarang difokuskan untuk keputusan belajar tercepat.`,
                meta: ["Roadmap prioritas", "Resume lebih cepat", "Target mingguan"]
            },
            quiz: {
                selector: ".status-panel",
                title: "Elite quiz handling",
                text: `Akurasi ${stats.accuracy}% dipakai sebagai sinyal untuk menonjolkan tempo, combo, dan repeat loop yang paling relevan buat kamu.`,
                meta: ["Precision bias", "Focus retry", "High tempo"]
            },
            snbt: {
                selector: ".hero-panel",
                title: "Pro readiness booster",
                text: "Versi Pro menekankan jalur aksi setelah analisis: sprint, simulator, lalu drill mendalam ke LMS TKA.",
                meta: ["Sprint TKA", "IRT aware", "Direct to LMS"]
            },
            "tka-lms": {
                selector: ".lms-session-panel",
                title: "Member cockpit",
                text: "Sesi latihan kini dibingkai sebagai cockpit Pro: start cepat, fokus tinggi, dan transisi ke analitik lebih rapi.",
                meta: ["Deep work", "Fast launch", "Sharper review"]
            },
            library: {
                selector: ".reading-desk-container",
                title: "Reading desk premium",
                text: "Desk aktif diberi framing yang lebih eksklusif agar pilihan bacaan dan note terasa seperti private workspace.",
                meta: ["Desk+Note", "Curated picks", "AI priority"]
            },
            profile: {
                selector: '[data-panel="overview"]',
                title: "Pro concierge note",
                text: "Halaman ini sekarang jadi lounge kontrol akun Pro: insight, status, dan shortcut disatukan lebih jelas.",
                meta: ["Identity layer", "Control center", "Faster resume"]
            },
            index: {
                selector: ".hero > div",
                title: "Member momentum",
                text: "Akses Pro membuat halaman depan lebih terasa sebagai command center daripada landing biasa.",
                meta: ["Fast jump", "Core shortcuts", "Premium framing"]
            }
        };
        const entry = cards[page];
        if (!entry) return;
        const mount = document.querySelector(entry.selector);
        if (!mount || mount.querySelector(".pro-inline-card")) return;
        const block = document.createElement("div");
        block.className = "pro-inline-card";
        block.innerHTML = `
            <strong>${entry.title}</strong>
            <p>${entry.text}</p>
            <div class="pro-inline-meta">${entry.meta.map(item => `<span>${item}</span>`).join("")}</div>
        `;
        mount.appendChild(block);
    }

    function bindProfileHashSwitch() {
        if (document.body.dataset.page !== "profile") return;
        document.addEventListener("click", event => {
            const anchor = event.target.closest('.pro-link[href^="#"], .pro-dock-links a[href^="#"]');
            if (!anchor) return;
            const tab = anchor.getAttribute("href").slice(1);
            const button = document.querySelector(`[data-tab="${tab}"]`);
            if (!button) return;
            event.preventDefault();
            button.click();
        });
    }

    function init() {
        if (!isProUser()) return;
        const page = document.body.dataset.page || "index";
        const session = readJSON(SESSION_KEY, {});
        const username = session?.username || "Member";
        const stats = getStats();
        const config = getPageConfig(page, stats, username);
        if (!config) return;
        
        document.body.classList.add("pro-user");
        initTheme();
        injectNavBadge();
        injectSpotlight(config);
        injectInlineCard(page, stats);
        injectDock(config, stats);
        bindProfileHashSwitch();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init, { once: true });
    } else {
        init();
    }
})();
