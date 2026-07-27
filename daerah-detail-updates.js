/* daerah-detail-updates.js */

(function () {
    const core = window.WonderfulCore;
    const games = window.WonderfulGames;

    if (!core) {
        console.error("WonderfulCore is not loaded");
        return;
    }

    // Active elements
    let place = core.getSelectedPlace();
    if (!place) {
        // Fallback to default place if query param id is missing
        place = core.getProgress().lastExplored || "aceh";
        const allPlaces = window.WonderfulData?.places || [];
        place = allPlaces.find(p => p.id === place) || allPlaces[0];
    }

    // Audio nodes list for cleanup
    let ambientNodes = [];
    let audioCtx = null;
    let isAmbientPlaying = false;
    let visualizerAnimationId = null;
    let ambientMasterGain = null;
    let matchStreak = 0;

    // TTS Reader states
    let ttsUtterance = null;
    let isTtsReading = false;
    let isTtsPaused = false;
    let ttsSentences = [];
    let ttsSentenceLengths = [];
    let activeTtsSentenceIdx = -1;

    // Sound effect generator helper using Web Audio API
    function playChime(type) {
        if (typeof games?.playSynthTone === "function") {
            try {
                if (type === "success") {
                    games.playSynthTone("saron", 523.25); // C5
                    setTimeout(() => games.playSynthTone("saron", 659.25), 120); // E5
                    setTimeout(() => games.playSynthTone("saron", 783.99), 240); // G5
                } else if (type === "click") {
                    games.playSynthTone("kecapi", 392.00); // G4
                } else if (type === "error") {
                    games.playSynthTone("angklung", 220.00); // A3
                    setTimeout(() => games.playSynthTone("angklung", 196.00), 120); // G3
                } else if (type === "match") {
                    games.playSynthTone("saron", 440.00); // A4
                    setTimeout(() => games.playSynthTone("saron", 554.37), 100); // C#5
                }
            } catch (e) {
                console.log("Audio play deferred/failed: ", e);
            }
        }
    }

    // Custom synth voice for Aksara simulator keys to add auditory feedback
    function playAksaraTone(pitch) {
        try {
            const tempCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
            if (tempCtx.state === "suspended") tempCtx.resume();
            
            const osc = tempCtx.createOscillator();
            const gain = tempCtx.createGain();
            
            osc.type = "sine";
            osc.frequency.setValueAtTime(pitch, tempCtx.currentTime);
            
            gain.gain.setValueAtTime(0.12, tempCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, tempCtx.currentTime + 0.35);
            
            osc.connect(gain);
            gain.connect(tempCtx.destination);
            osc.start();
            osc.stop(tempCtx.currentTime + 0.4);
        } catch(e){}
    }

    // 1. Interactive Glassmorphic Hero Canvas (Gelombang Partikel)
    function initHeroCanvas() {
        const canvas = document.getElementById("heroCanvas");
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        let animationFrameId;

        function resize() {
            canvas.width = canvas.parentElement.offsetWidth;
            canvas.height = canvas.parentElement.offsetHeight;
        }
        resize();
        window.addEventListener("resize", resize);

        const particles = [];
        for (let i = 0; i < 40; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 2 + 1,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                alpha: Math.random() * 0.5 + 0.1
            });
        }

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // Dynamic color according to region
            let color = "255, 152, 0"; // Orange default
            const bodyClass = document.body.className;
            if (bodyClass.includes("region-sumatra")) color = "76, 175, 80";
            else if (bodyClass.includes("region-jawa")) color = "255, 61, 0";
            else if (bodyClass.includes("region-bali-nusa")) color = "255, 145, 0";
            else if (bodyClass.includes("region-kalimantan")) color = "0, 176, 255";
            else if (bodyClass.includes("region-sulawesi")) color = "0, 229, 255";
            else if (bodyClass.includes("region-maluku-papua")) color = "213, 0, 249";

            ctx.fillStyle = `rgba(${color}, 0.1)`;
            
            particles.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${color}, ${p.alpha})`;
                ctx.fill();

                p.x += p.speedX;
                p.y += p.speedY;

                if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
                if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
            });

            // Draw soft wave line
            ctx.beginPath();
            ctx.moveTo(0, canvas.height * 0.8);
            for (let i = 0; i <= canvas.width; i += 10) {
                const y = canvas.height * 0.75 + Math.sin(i * 0.005 + Date.now() * 0.001) * 15;
                ctx.lineTo(i, y);
            }
            ctx.strokeStyle = `rgba(${color}, 0.15)`;
            ctx.lineWidth = 2;
            ctx.stroke();

            animationFrameId = requestAnimationFrame(draw);
        }
        draw();
    }

    // 2. Ambient Music Player (Realistic Traditional Instruments Synth, LFO Pad Drone, & Visualizer)
    let proceduralMelodyInterval = null;

    // Realistic Additive Synthesis for Gamelan (Metallophone)
    function playGamelanNote(freq, volume = 0.08, duration = 2.5) {
        if (!audioCtx) return;
        const now = audioCtx.currentTime;
        const gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(volume, now + 0.005);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        // Gamelan bars resonate with inharmonic overtones
        const partials = [1.0, 2.015, 2.76, 3.05, 4.23];
        const partialGains = [0.8, 0.45, 0.3, 0.2, 0.1];
        
        partials.forEach((ratio, i) => {
            const osc = audioCtx.createOscillator();
            const pGain = audioCtx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(freq * ratio, now);
            pGain.gain.setValueAtTime(partialGains[i], now);
            
            osc.connect(pGain);
            pGain.connect(gainNode);
            osc.start(now);
            osc.stop(now + duration + 0.1);
            ambientNodes.push(osc);
        });

        gainNode.connect(audioCtx.destination);
    }

    // Realistic Physical Modeling for Suling (Bamboo Flute) with breath filter noise
    function playSulingNote(freq, volume = 0.06, duration = 2.0) {
        if (!audioCtx) return;
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now);

        // Pitch Vibrato (LFO)
        const lfo = audioCtx.createOscillator();
        const lfoGain = audioCtx.createGain();
        lfo.type = "sine";
        lfo.frequency.setValueAtTime(5.5, now); // 5.5Hz vibrato
        lfoGain.gain.setValueAtTime(4.5, now); // vibrato depth
        
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        
        // Dynamic pitch portamento/glide
        osc.frequency.setValueAtTime(freq * 0.95, now);
        osc.frequency.exponentialRampToValueAtTime(freq, now + 0.25);

        // Breath Sound (Bandpass Filtered White Noise)
        const noiseLength = audioCtx.sampleRate * duration;
        const buffer = audioCtx.createBuffer(1, noiseLength, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < noiseLength; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noiseNode = audioCtx.createBufferSource();
        noiseNode.buffer = buffer;

        const noiseFilter = audioCtx.createBiquadFilter();
        noiseFilter.type = "bandpass";
        noiseFilter.frequency.setValueAtTime(freq * 1.5, now);
        noiseFilter.Q.setValueAtTime(3.0, now);

        const noiseGain = audioCtx.createGain();
        noiseGain.gain.setValueAtTime(0.015, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.8);

        noiseNode.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(audioCtx.destination);

        // Voice Volume Envelope
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(volume, now + 0.18); // blow transient
        gainNode.gain.setValueAtTime(volume, now + duration - 0.3);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        lfo.start(now);
        osc.start(now);
        noiseNode.start(now);

        lfo.stop(now + duration + 0.1);
        osc.stop(now + duration + 0.1);
        noiseNode.stop(now + duration + 0.1);

        ambientNodes.push(osc);
        ambientNodes.push(lfo);
        ambientNodes.push(noiseNode);
    }

    // Bamboo shaking model for Angklung
    function playAngklungNote(freq, volume = 0.05, duration = 1.2) {
        if (!audioCtx) return;
        const now = audioCtx.currentTime;
        const strikeCount = 6;
        const strikeInterval = 0.07;

        for (let i = 0; i < strikeCount; i++) {
            const strikeTime = now + i * strikeInterval;
            const decay = 0.09;

            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = "triangle";
            osc.frequency.setValueAtTime(freq, strikeTime);
            osc.frequency.exponentialRampToValueAtTime(freq * 0.9, strikeTime + decay);

            gain.gain.setValueAtTime(volume * (1 - i * 0.12), strikeTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, strikeTime + decay);

            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.start(strikeTime);
            osc.stop(strikeTime + decay + 0.02);
            ambientNodes.push(osc);
        }
    }

    // Karplus-Strong string pluck model for Sasando/Kacapi
    function playSasandoNote(freq, volume = 0.12, duration = 1.8) {
        if (!audioCtx) return;
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, now);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(2500, now);
        filter.frequency.exponentialRampToValueAtTime(100, now + duration * 0.4);

        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(volume, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        osc.start(now);
        osc.stop(now + duration + 0.1);
        ambientNodes.push(osc);
    }

    // Skin Drum resonance for Tifa/Kendang
    function playTifaNote(volume = 0.3) {
        if (!audioCtx) return;
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(42, now + 0.18);

        gainNode.gain.setValueAtTime(volume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        osc.start(now);
        osc.stop(now + 0.6);
        ambientNodes.push(osc);
    }

    // Draw responsive visualizer with glowing frequency bars and clean wavy flow
    function drawVisualizer(analyser, canvas, canvasCtx) {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        function draw() {
            if (!isAmbientPlaying) return;
            visualizerAnimationId = requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);
            
            canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
            
            const barWidth = (canvas.width / bufferLength) * 1.5;
            let barHeight;
            let x = 0;
            
            canvasCtx.beginPath();
            canvasCtx.moveTo(0, canvas.height / 2);
            
            let color = "255, 152, 0"; 
            const bodyClass = document.body.className;
            if (bodyClass.includes("region-sumatra")) color = "76, 175, 80";
            else if (bodyClass.includes("region-jawa")) color = "255, 61, 0";
            else if (bodyClass.includes("region-bali-nusa")) color = "255, 145, 0";
            else if (bodyClass.includes("region-kalimantan")) color = "0, 176, 255";
            else if (bodyClass.includes("region-sulawesi")) color = "0, 229, 255";
            else if (bodyClass.includes("region-maluku-papua")) color = "213, 0, 249";

            for (let i = 0; i < bufferLength; i++) {
                const normVal = dataArray[i] / 255;
                barHeight = normVal * canvas.height * 0.9;
                
                canvasCtx.fillStyle = `rgba(${color}, ${0.4 + normVal * 0.6})`;
                canvasCtx.shadowBlur = 6;
                canvasCtx.shadowColor = `rgba(${color}, 0.8)`;
                canvasCtx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
                
                const waveY = (canvas.height / 2) + Math.sin(i * 0.3 + Date.now() * 0.005) * (barHeight * 0.3);
                canvasCtx.lineTo(x, waveY);
                
                x += barWidth;
            }
            
            canvasCtx.strokeStyle = `rgba(255, 255, 255, 0.25)`;
            canvasCtx.lineWidth = 1.5;
            canvasCtx.shadowBlur = 0;
            canvasCtx.stroke();
        }
        draw();
    }

    function toggleAmbientMusic() {
        const btn = document.getElementById("ambientPlayBtn");
        const status = document.getElementById("ambientStatus");
        const visCanvas = document.getElementById("visualizerCanvas");
        
        if (isAmbientPlaying) {
            clearInterval(proceduralMelodyInterval);
            proceduralMelodyInterval = null;

            const gainNodes = ambientNodes.filter(n => n instanceof GainNode);
            const fadeTime = 1.0;
            
            gainNodes.forEach(g => {
                try {
                    g.gain.setValueAtTime(g.gain.value, audioCtx.currentTime);
                    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + fadeTime);
                } catch(e){}
            });

            if (visCanvas) visCanvas.style.display = "none";
            if (visualizerAnimationId) cancelAnimationFrame(visualizerAnimationId);

            setTimeout(() => {
                ambientNodes.forEach(node => {
                    try { node.stop(); } catch(e){}
                    try { node.disconnect(); } catch(e){}
                });
                ambientNodes = [];
                isAmbientPlaying = false;
                ambientMasterGain = null;
                if (btn) btn.innerHTML = `<i class="fa-solid fa-play"></i>`;
                if (status) status.textContent = "Musik Ambient: Off";
            }, fadeTime * 1000);
        } else {
            try {
                if (!audioCtx) {
                    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                }
                if (audioCtx.state === "suspended") {
                    audioCtx.resume();
                }

                const reg = (place.region || "").toLowerCase();
                let scale = [196.00, 220.00, 293.66, 329.63, 392.00];
                let mainInst = "gamelan";
                
                if (reg.includes("sumatra")) {
                    scale = [220.00, 246.94, 329.63, 392.00, 440.00];
                    mainInst = "sasando";
                } else if (reg.includes("bali") || reg.includes("nusa")) {
                    scale = [196.00, 261.63, 293.66, 392.00, 523.25];
                    mainInst = "gamelan";
                } else if (reg.includes("kalimantan")) {
                    scale = [261.63, 329.63, 392.00, 523.25, 659.25];
                    mainInst = "angklung";
                } else if (reg.includes("sulawesi")) {
                    scale = [220.00, 293.66, 329.63, 440.00, 587.33];
                    mainInst = "suling";
                } else if (reg.includes("papua") || reg.includes("maluku")) {
                    scale = [196.00, 261.63, 329.63, 392.00, 493.88];
                    mainInst = "tifa";
                }

                const analyser = audioCtx.createAnalyser();
                analyser.fftSize = 32;
                ambientNodes.push(analyser);

                const filter = audioCtx.createBiquadFilter();
                filter.type = "lowpass";
                filter.frequency.setValueAtTime(280, audioCtx.currentTime);
                filter.Q.setValueAtTime(3.0, audioCtx.currentTime);
                filter.connect(analyser);
                ambientNodes.push(filter);

                const lfo = audioCtx.createOscillator();
                lfo.type = "sine";
                lfo.frequency.setValueAtTime(0.04, audioCtx.currentTime);
                const lfoGain = audioCtx.createGain();
                lfoGain.gain.setValueAtTime(80, audioCtx.currentTime);
                lfo.connect(lfoGain);
                lfoGain.connect(filter.frequency);
                lfo.start();
                ambientNodes.push(lfo);
                ambientNodes.push(lfoGain);

                analyser.connect(audioCtx.destination);

                let targetDest = filter;
                if (audioCtx.createStereoPanner) {
                    const panner = audioCtx.createStereoPanner();
                    panner.pan.setValueAtTime(0.0, audioCtx.currentTime);
                    panner.connect(audioCtx.destination);
                    analyser.disconnect();
                    analyser.connect(panner);
                    ambientNodes.push(panner);
                    targetDest = panner;

                    const panLfo = audioCtx.createOscillator();
                    panLfo.type = "sine";
                    panLfo.frequency.setValueAtTime(0.03, audioCtx.currentTime);
                    const panLfoGain = audioCtx.createGain();
                    panLfoGain.gain.setValueAtTime(0.5, audioCtx.currentTime);
                    panLfo.connect(panLfoGain);
                    panLfoGain.connect(panner.pan);
                    panLfo.start();
                    ambientNodes.push(panLfo);
                    ambientNodes.push(panLfoGain);
                }

                const masterGain = audioCtx.createGain();
                masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
                masterGain.gain.linearRampToValueAtTime(0.08, audioCtx.currentTime + 2.0);
                masterGain.connect(filter);
                ambientNodes.push(masterGain);
                ambientMasterGain = masterGain;

                scale.forEach((freq, idx) => {
                    const osc = audioCtx.createOscillator();
                    const voiceGain = audioCtx.createGain();

                    osc.type = idx % 2 === 0 ? "triangle" : "sine";
                    osc.frequency.setValueAtTime(freq / 2, audioCtx.currentTime);

                    if (idx > 0) {
                        osc.detune.setValueAtTime((Math.random() - 0.5) * 8, audioCtx.currentTime);
                    }

                    voiceGain.gain.setValueAtTime(0, audioCtx.currentTime);
                    voiceGain.gain.linearRampToValueAtTime(0.18, audioCtx.currentTime + 1.5 + Math.random());

                    const volLfo = audioCtx.createOscillator();
                    volLfo.type = "sine";
                    volLfo.frequency.setValueAtTime(0.03 + idx * 0.01, audioCtx.currentTime);
                    const volLfoGain = audioCtx.createGain();
                    volLfoGain.gain.setValueAtTime(0.05, audioCtx.currentTime);

                    volLfo.connect(volLfoGain);
                    volLfoGain.connect(voiceGain.gain);
                    volLfo.start();

                    osc.connect(voiceGain);
                    voiceGain.connect(masterGain);
                    osc.start();

                    ambientNodes.push(osc);
                    ambientNodes.push(voiceGain);
                    ambientNodes.push(volLfo);
                    ambientNodes.push(volLfoGain);
                });

                proceduralMelodyInterval = setInterval(() => {
                    if (!isAmbientPlaying) return;
                    if (Math.random() > 0.25) {
                        const freq = scale[Math.floor(Math.random() * scale.length)];
                        if (mainInst === "gamelan") {
                            playGamelanNote(freq);
                        } else if (mainInst === "suling") {
                            playSulingNote(freq);
                        } else if (mainInst === "angklung") {
                            playAngklungNote(freq);
                        } else if (mainInst === "sasando") {
                            playSasandoNote(freq);
                        } else if (mainInst === "tifa") {
                            if (Math.random() > 0.5) {
                                playTifaNote();
                            } else {
                                playSulingNote(freq, 0.08, 1.8);
                            }
                        }
                    }
                }, 3000);

                isAmbientPlaying = true;
                if (btn) btn.innerHTML = `<i class="fa-solid fa-pause"></i>`;
                if (status) status.textContent = "Musik Ambient: On";
                
                if (visCanvas) {
                    visCanvas.style.display = "block";
                    const canvasCtx = visCanvas.getContext("2d");
                    drawVisualizer(analyser, visCanvas, canvasCtx);
                }
                
                core.showToast("Musik ambient tradisional & melodi prosedural dimulai.");
            } catch(e) {
                console.error(e);
                core.showToast("Gagal memutar audio ambient.");
            }
        }
    }

    // 3. Region-Colored brand Accent overlay
    function setupRegionTheme() {
        const reg = (place.region || "").toLowerCase();
        let classToAdd = "region-other";
        if (reg.includes("sumatra")) classToAdd = "region-sumatra";
        else if (reg.includes("jawa")) classToAdd = "region-jawa";
        else if (reg.includes("bali") || reg.includes("tenggara")) classToAdd = "region-bali-nusa";
        else if (reg.includes("kalimantan")) classToAdd = "region-kalimantan";
        else if (reg.includes("sulawesi")) classToAdd = "region-sulawesi";
        else if (reg.includes("maluku") || reg.includes("papua")) classToAdd = "region-maluku-papua";

        document.body.className = ""; // clear
        document.body.classList.add(classToAdd);
    }

    // 4. Costume & Housing Slideshow (Procedural Premium SVG Illustrations per Region)
    const mockSlides = [
        {
            title: "Pakaian Adat Tradisional",
            desc: "Pakaian adat khas daerah yang memuat ragam motif hias, tenunan lokal, aksesoris kebesaran, dan hiasan kepala tradisional.",
            type: "costume"
        },
        {
            title: "Arsitektur Rumah Adat",
            desc: "Rumah adat leluhur dengan konstruksi kayu tradisional tahan gempa, atap artistik, dan filosofi pembagian ruang sosial.",
            type: "house"
        }
    ];
    let currentSlideIdx = 0;

    // Generates a stunning detailed SVG illustration based on place.id / region and slide type to impress the user
    function getRegionalSvgIllustration(placeObj, type) {
        const id = (placeObj.id || "").toLowerCase();
        const reg = (placeObj.region || "").toLowerCase();
        let accent = "var(--region-accent)";
        
        // --- 1. Specific Culture / Language Place ID Matches first ---
        if (id === "jawa" || id === "madura") {
            if (type === "house") {
                return `<svg class="slideshow-art-svg" viewBox="0 0 400 200">
                    <defs>
                        <linearGradient id="jawaSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#14111f"/><stop offset="100%" stop-color="#0a0a0f"/></linearGradient>
                        <linearGradient id="jawaRoof" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#d84315"/><stop offset="50%" stop-color="#ff7043"/><stop offset="100%" stop-color="#bf360c"/></linearGradient>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#jawaSky)"/>
                    <g opacity="0.3">
                        <circle cx="200" cy="180" r="140" fill="none" stroke="${accent}" stroke-width="1" stroke-dasharray="4 8"/>
                    </g>
                    <path d="M120,110 L280,110 L310,160 L90,160 Z" fill="url(#jawaRoof)" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.4))"/>
                    <path d="M160,60 L240,60 L260,110 L140,110 Z" fill="url(#jawaRoof)" filter="drop-shadow(0 4px 8px rgba(0,0,0,0.5))"/>
                    <rect x="120" y="160" width="160" height="30" fill="#4e342e"/>
                    <rect x="135" y="160" width="8" height="30" fill="#ffd700"/>
                    <rect x="175" y="160" width="8" height="30" fill="#ffd700"/>
                    <rect x="215" y="160" width="8" height="30" fill="#ffd700"/>
                    <rect x="255" y="160" width="8" height="30" fill="#ffd700"/>
                    <rect x="185" y="170" width="30" height="20" fill="#2e1c0c" rx="2"/>
                    <line x1="200" y1="170" x2="200" y2="190" stroke="#ffd700" stroke-width="1"/>
                    <rect x="0" y="190" width="400" height="10" fill="#2d2d30"/>
                    <text x="200" y="38" fill="white" font-size="11" font-weight="bold" opacity="0.5" text-anchor="middle" letter-spacing="1">Jawa: Rumah Joglo</text>
                </svg>`;
            } else {
                return `<svg class="slideshow-art-svg" viewBox="0 0 400 200">
                    <rect width="100%" height="100%" fill="#110d1c"/>
                    <g transform="translate(145, 20)">
                        <circle cx="55" cy="55" r="30" fill="#ffcc80"/>
                        <path d="M22,46 C22,15 88,15 88,46 Z" fill="#3e2723"/>
                        <path d="M55,20 C40,20 23,28 23,40 C35,38 75,38 87,40 C87,28 70,20 55,20 Z" fill="#ffd700" opacity="0.7"/>
                        <path d="M82,45 C86,45 92,50 88,58 C84,62 76,56 82,45 Z" fill="#3e2723"/>
                        <path d="M20,85 C20,120 90,120 90,85 Z" fill="#151515" stroke="#ffd700" stroke-width="1.5"/>
                        <path d="M40,85 L55,100 L70,85" fill="none" stroke="#ffd700" stroke-width="2"/>
                        <path d="M12,78 L2,68 C-2,64 5,55 10,60 L20,70 Z" fill="#ffd700"/>
                    </g>
                    <text x="200" y="185" fill="white" font-size="11" font-weight="bold" opacity="0.5" text-anchor="middle" letter-spacing="1">Kebaya & Blangkon Jawa</text>
                </svg>`;
            }
        }
        else if (id === "sunda") {
            if (type === "house") {
                return `<svg class="slideshow-art-svg" viewBox="0 0 400 200">
                    <rect width="100%" height="100%" fill="#1a1829"/>
                    <path d="M60,130 L200,40 L340,130" fill="none" stroke="#ff7043" stroke-width="6"/>
                    <path d="M60,130 L100,165 L300,165 L340,130 Z" fill="#3e2723" stroke="#ffd700" stroke-width="1.5"/>
                    <rect x="120" y="165" width="8" height="25" fill="#4e342e"/>
                    <rect x="272" y="165" width="8" height="25" fill="#4e342e"/>
                    <text x="200" y="30" fill="white" font-size="11" font-weight="bold" opacity="0.5" text-anchor="middle" letter-spacing="1">Sunda: Rumah Julang Ngapak</text>
                </svg>`;
            } else {
                return `<svg class="slideshow-art-svg" viewBox="0 0 400 200">
                    <rect width="100%" height="100%" fill="#110d1c"/>
                    <g transform="translate(145, 20)">
                        <circle cx="55" cy="55" r="30" fill="#ffe082"/>
                        <path d="M25,32 Q55,0 85,32" fill="none" stroke="#ffd700" stroke-width="4"/>
                        <circle cx="55" cy="8" r="4" fill="#ffd700"/>
                        <path d="M20,85 C20,120 90,120 90,85 Z" fill="#ffffff" stroke="#ffd700" stroke-width="1.5"/>
                        <path d="M40,85 L55,100 L70,85" fill="none" stroke="#ff80ab" stroke-width="2"/>
                    </g>
                    <text x="200" y="185" fill="white" font-size="11" font-weight="bold" opacity="0.5" text-anchor="middle" letter-spacing="1">Kebaya & Siger Sunda</text>
                </svg>`;
            }
        }
        else if (id === "banjar") {
            if (type === "house") {
                return `<svg class="slideshow-art-svg" viewBox="0 0 400 200">
                    <rect width="100%" height="100%" fill="#1a1805"/>
                    <polygon points="150,130 200,30 250,130" fill="#8d6e63" stroke="#ffd700" stroke-width="1.5"/>
                    <polygon points="100,130 300,130 330,175 70,175" fill="#3e2723" stroke="#ffd700" stroke-width="1"/>
                    <rect x="110" y="175" width="6" height="15" fill="#5d4037"/>
                    <rect x="284" y="175" width="6" height="15" fill="#5d4037"/>
                    <text x="200" y="32" fill="white" font-size="11" font-weight="bold" opacity="0.5" text-anchor="middle" letter-spacing="1">Banjar: Rumah Bubungan Tinggi</text>
                </svg>`;
            } else {
                return `<svg class="slideshow-art-svg" viewBox="0 0 400 200">
                    <rect width="100%" height="100%" fill="#1a1205"/>
                    <g transform="translate(145, 20)">
                        <circle cx="55" cy="55" r="28" fill="#ffe082"/>
                        <path d="M27,32 C40,10 70,10 83,32" fill="none" stroke="#ffd700" stroke-width="4"/>
                        <path d="M20,85 C20,120 90,120 90,85 Z" fill="#ffd700" stroke="#ff3d00" stroke-width="1.5" stroke-dasharray="2 2"/>
                    </g>
                    <text x="200" y="185" fill="white" font-size="11" font-weight="bold" opacity="0.5" text-anchor="middle" letter-spacing="1">Busana Bagajah & Kain Sasirangan</text>
                </svg>`;
            }
        }
        else if (id === "bugis") {
            if (type === "house") {
                return `<svg class="slideshow-art-svg" viewBox="0 0 400 200">
                    <rect width="100%" height="100%" fill="#0a1a24"/>
                    <rect x="100" y="90" width="200" height="50" fill="#4e342e" stroke="#ffd700" stroke-width="1"/>
                    <polygon points="90,90 310,90 300,50 100,50" fill="#b71c1c"/>
                    <line x1="120" y1="140" x2="120" y2="185" stroke="#3e2723" stroke-width="4"/>
                    <line x1="200" y1="140" x2="200" y2="185" stroke="#3e2723" stroke-width="4"/>
                    <line x1="280" y1="140" x2="280" y2="185" stroke="#3e2723" stroke-width="4"/>
                    <text x="200" y="32" fill="white" font-size="11" font-weight="bold" opacity="0.5" text-anchor="middle" letter-spacing="1">Bugis: Rumah Panggung Kayu</text>
                </svg>`;
            } else {
                return `<svg class="slideshow-art-svg" viewBox="0 0 400 200">
                    <rect width="100%" height="100%" fill="#1a0a24"/>
                    <g transform="translate(145, 20)">
                        <circle cx="55" cy="55" r="28" fill="#ffe082"/>
                        <path d="M20,85 C20,120 90,120 90,85 Z" fill="#d500f9" opacity="0.8" stroke="#ffd700" stroke-width="1.5"/>
                    </g>
                    <text x="200" y="185" fill="white" font-size="11" font-weight="bold" opacity="0.5" text-anchor="middle" letter-spacing="1">Baju Bodo & Sutera Bugis</text>
                </svg>`;
            }
        }
        else if (id === "sasak") {
            if (type === "house") {
                return `<svg class="slideshow-art-svg" viewBox="0 0 400 200">
                    <rect width="100%" height="100%" fill="#1c1c28"/>
                    <path d="M120,60 Q200,20 280,60 L280,160 L120,160 Z" fill="#5d4037" stroke="#ffd700" stroke-width="1.5"/>
                    <path d="M100,65 Q200,10 300,65" stroke="#ffb74d" stroke-width="4" fill="none"/>
                    <text x="200" y="32" fill="white" font-size="11" font-weight="bold" opacity="0.5" text-anchor="middle" letter-spacing="1">Sasak: Rumah Bale Lumbung</text>
                </svg>`;
            } else {
                return `<svg class="slideshow-art-svg" viewBox="0 0 400 200">
                    <rect width="100%" height="100%" fill="#111c15"/>
                    <g transform="translate(145, 20)">
                        <circle cx="55" cy="55" r="28" fill="#ffe082"/>
                        <path d="M27,40 C35,20 75,20 83,40 Z" fill="#ffd700"/>
                        <path d="M20,85 C20,120 90,120 90,85 Z" fill="#3e2723" stroke="#ffd700" stroke-width="1.5"/>
                    </g>
                    <text x="200" y="185" fill="white" font-size="11" font-weight="bold" opacity="0.5" text-anchor="middle" letter-spacing="1">Busana Adat Sasak & Sapuk</text>
                </svg>`;
            }
        }
        else if (id === "batak") {
            if (type === "house") {
                return `<svg class="slideshow-art-svg" viewBox="0 0 400 200">
                    <rect width="100%" height="100%" fill="#100a0a"/>
                    <path d="M80,60 C120,100 280,100 320,60 C260,110 140,110 80,60 Z" fill="#3e2723" stroke="#b71c1c" stroke-width="3"/>
                    <rect x="120" y="110" width="160" height="50" fill="#f5f5f5" stroke="#3e2723" stroke-width="2"/>
                    <text x="200" y="32" fill="white" font-size="11" font-weight="bold" opacity="0.5" text-anchor="middle" letter-spacing="1">Batak: Rumah Bolon</text>
                </svg>`;
            } else {
                return `<svg class="slideshow-art-svg" viewBox="0 0 400 200">
                    <rect width="100%" height="100%" fill="#120c0c"/>
                    <g transform="translate(145, 20)">
                        <circle cx="55" cy="55" r="28" fill="#ffe082"/>
                        <path d="M20,85 C20,120 90,120 90,85 Z" fill="#b71c1c" stroke="#ffd700" stroke-width="2"/>
                        <line x1="30" y1="85" x2="80" y2="120" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="2 2"/>
                    </g>
                    <text x="200" y="185" fill="white" font-size="11" font-weight="bold" opacity="0.5" text-anchor="middle" letter-spacing="1">Kain Tenun Ulos Batak</text>
                </svg>`;
            }
        }
        else if (id === "bali") {
            if (type === "house") {
                return `<svg class="slideshow-art-svg" viewBox="0 0 400 200">
                    <rect width="100%" height="100%" fill="#1c1105"/>
                    <path d="M120,180 L120,50 L140,50 L145,65 L150,65 L155,95 L160,95 L165,135 L170,135 L170,180 Z" fill="#e65100" stroke="#ffd700" stroke-width="1"/>
                    <path d="M280,180 L280,50 L260,50 L255,65 L250,65 L245,95 L240,95 L235,135 L230,135 L230,180 Z" fill="#e65100" stroke="#ffd700" stroke-width="1"/>
                    <rect x="100" y="180" width="200" height="10" fill="#3e2723"/>
                    <rect x="80" y="190" width="240" height="10" fill="#212121"/>
                    <g transform="translate(85, 90)">
                        <line x1="0" y1="0" x2="0" y2="90" stroke="#ffd700" stroke-width="2"/>
                        <path d="M-20,30 C-20,0 20,0 20,30 Z" fill="#d50000"/>
                        <path d="M-23,30 L23,30" stroke="#ffd700" stroke-width="1.5"/>
                    </g>
                    <text x="200" y="30" fill="white" font-size="11" font-weight="bold" opacity="0.5" text-anchor="middle" letter-spacing="1">Bali: Candi Bentar</text>
                </svg>`;
            } else {
                return `<svg class="slideshow-art-svg" viewBox="0 0 400 200">
                    <rect width="100%" height="100%" fill="#0a0a1a"/>
                    <g transform="translate(140, 15)">
                        <circle cx="60" cy="70" r="22" fill="#ffe082"/>
                        <path d="M20,60 C30,15 90,15 100,60 Z" fill="#ffd700" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.5))"/>
                        <circle cx="35" cy="30" r="4" fill="#00e5ff"/>
                        <circle cx="60" cy="20" r="5" fill="#4caf50"/>
                        <circle cx="85" cy="30" r="4" fill="#00e5ff"/>
                        <path d="M25,58 L15,80 M95,58 L105,80" stroke="#ffd700" stroke-width="2"/>
                        <path d="M35,92 C35,130 85,130 85,92 Z" fill="#ff8f00" stroke="#ffd700" stroke-width="1.5"/>
                    </g>
                    <text x="200" y="190" fill="white" font-size="11" font-weight="bold" opacity="0.5" text-anchor="middle" letter-spacing="1">Tari Legong & Gelungan Bali</text>
                </svg>`;
            }
        }
        else if (id === "dayak") {
            if (type === "house") {
                return `<svg class="slideshow-art-svg" viewBox="0 0 400 200">
                    <rect width="100%" height="100%" fill="#0d1f11"/>
                    <rect x="60" y="80" width="280" height="40" fill="#3e2723" stroke="#ffd700" stroke-width="1" rx="2"/>
                    <polygon points="50,80 350,80 330,50 70,50" fill="#5d4037" filter="drop-shadow(0 3px 5px rgba(0,0,0,0.4))"/>
                    <line x1="80" y1="120" x2="80" y2="180" stroke="#3e2723" stroke-width="4"/>
                    <line x1="130" y1="120" x2="130" y2="180" stroke="#3e2723" stroke-width="4"/>
                    <line x1="180" y1="120" x2="180" y2="180" stroke="#3e2723" stroke-width="4"/>
                    <line x1="230" y1="120" x2="230" y2="180" stroke="#3e2723" stroke-width="4"/>
                    <line x1="280" y1="120" x2="280" y2="180" stroke="#3e2723" stroke-width="4"/>
                    <line x1="320" y1="120" x2="320" y2="180" stroke="#3e2723" stroke-width="4"/>
                    <line x1="190" y1="115" x2="210" y2="180" stroke="#ffd700" stroke-width="3"/>
                    <text x="200" y="35" fill="white" font-size="11" font-weight="bold" opacity="0.5" text-anchor="middle" letter-spacing="1">Kalimantan: Rumah Betang</text>
                </svg>`;
            } else {
                return `<svg class="slideshow-art-svg" viewBox="0 0 400 200">
                    <rect width="100%" height="100%" fill="#1a1c0d"/>
                    <g transform="translate(130, 10)">
                        <circle cx="70" cy="80" r="24" fill="#ffb74d"/>
                        <path d="M40,62 Q70,5 70,10" stroke="white" stroke-width="8" stroke-linecap="round"/>
                        <path d="M40,62 Q70,5 70,10" stroke="black" stroke-width="2" stroke-linecap="round"/>
                        <path d="M70,56 Q70,0 70,5" stroke="white" stroke-width="9" stroke-linecap="round"/>
                        <path d="M70,56 Q70,0 70,5" stroke="black" stroke-width="2" stroke-linecap="round"/>
                        <path d="M100,62 Q70,5 70,10" stroke="white" stroke-width="8" stroke-linecap="round"/>
                        <path d="M100,62 Q70,5 70,10" stroke="black" stroke-width="2" stroke-linecap="round"/>
                        <rect x="42" y="58" width="56" height="8" fill="#ffd700" rx="2"/>
                        <path d="M110,60 L125,40 L140,60 L135,110 L125,125 L115,110 Z" fill="#b71c1c" stroke="white" stroke-width="1.5"/>
                    </g>
                    <text x="200" y="185" fill="white" font-size="11" font-weight="bold" opacity="0.5" text-anchor="middle" letter-spacing="1">Mahkota Enggang & Perisai Dayak</text>
                </svg>`;
            }
        }
        else if (id === "minang") {
            if (type === "house") {
                return `<svg class="slideshow-art-svg" viewBox="0 0 400 200">
                    <rect width="100%" height="100%" fill="#0a1811"/>
                    <path d="M70,110 Q120,30 130,40 Q120,110 140,120" fill="#3e2723" stroke="#ff8f00" stroke-width="2"/>
                    <path d="M330,110 Q280,30 270,40 Q280,110 260,120" fill="#3e2723" stroke="#ff8f00" stroke-width="2"/>
                    <path d="M200,80 Q200,20 205,25 Q200,80 220,90" fill="#3e2723" stroke="#ff8f00" stroke-width="2"/>
                    <polygon points="100,120 300,120 320,170 80,170" fill="#b71c1c" stroke="#ffd700" stroke-width="1"/>
                    <rect x="90" y="170" width="8" height="20" fill="#5d4037"/>
                    <rect x="140" y="170" width="8" height="20" fill="#5d4037"/>
                    <rect x="200" y="170" width="8" height="20" fill="#5d4037"/>
                    <rect x="250" y="170" width="8" height="20" fill="#5d4037"/>
                    <rect x="300" y="170" width="8" height="20" fill="#5d4037"/>
                    <line x1="105" y1="140" x2="295" y2="140" stroke="#ffeb3b" stroke-width="2" stroke-dasharray="2 4"/>
                    <text x="200" y="195" fill="white" font-size="11" font-weight="bold" opacity="0.5" text-anchor="middle" letter-spacing="1">Minang: Rumah Gadang</text>
                </svg>`;
            } else {
                return `<svg class="slideshow-art-svg" viewBox="0 0 400 200">
                    <rect width="100%" height="100%" fill="#1a0a0a"/>
                    <g transform="translate(130, 15)">
                        <circle cx="70" cy="80" r="25" fill="#ffe082"/>
                        <path d="M20,65 C30,20 110,20 120,65" fill="none" stroke="#ffd700" stroke-width="4"/>
                        <path d="M30,55 L35,30 M50,45 L55,15 M70,40 L70,10 M90,45 L85,15 M110,55 L105,30" stroke="#ffd700" stroke-width="3" stroke-linecap="round"/>
                        <circle cx="35" cy="30" r="3" fill="#ff3d00"/>
                        <circle cx="55" cy="15" r="3" fill="#ff3d00"/>
                        <circle cx="70" cy="10" r="4" fill="#ff3d00"/>
                        <circle cx="85" cy="15" r="3" fill="#ff3d00"/>
                        <circle cx="105" cy="30" r="3" fill="#ff3d00"/>
                        <path d="M35,105 C35,140 105,140 105,105 Z" fill="#b71c1c" stroke="#ffd700" stroke-width="2"/>
                    </g>
                    <text x="200" y="190" fill="white" font-size="11" font-weight="bold" opacity="0.5" text-anchor="middle" letter-spacing="1">Suntiang & Songket Minang</text>
                </svg>`;
            }
        }
        else if (id === "toraja") {
            if (type === "house") {
                return `<svg class="slideshow-art-svg" viewBox="0 0 400 200">
                    <rect width="100%" height="100%" fill="#1f1a0d"/>
                    <path d="M40,40 C100,120 300,120 360,40 C280,140 120,140 40,40 Z" fill="url(#torajaRoofGrad)" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.5))"/>
                    <defs>
                        <linearGradient id="torajaRoofGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#b71c1c"/><stop offset="100%" stop-color="#3e2723"/></linearGradient>
                    </defs>
                    <rect x="130" y="115" width="140" height="50" fill="#f5f5f5" stroke="#3e2723" stroke-width="2"/>
                    <line x1="200" y1="115" x2="200" y2="190" stroke="#ffd700" stroke-width="4"/>
                    <rect x="100" y="165" width="200" height="20" fill="#3e2723"/>
                    <text x="200" y="195" fill="white" font-size="11" font-weight="bold" opacity="0.5" text-anchor="middle" letter-spacing="1">Toraja: Rumah Tongkonan</text>
                </svg>`;
            } else {
                return `<svg class="slideshow-art-svg" viewBox="0 0 400 200">
                    <rect width="100%" height="100%" fill="#0a1a1a"/>
                    <g transform="translate(130, 20)">
                        <circle cx="70" cy="65" r="22" fill="#ffe082"/>
                        <path d="M30,85 C20,110 50,140 70,120 C90,140 120,110 110,85 Z" fill="#d500f9" opacity="0.8" stroke="#ff80ab" stroke-width="1"/>
                        <circle cx="70" cy="100" r="10" fill="#ffd700"/>
                        <path d="M50,85 Q70,105 90,85" fill="none" stroke="#ffd700" stroke-width="3" stroke-dasharray="3 3"/>
                    </g>
                    <text x="200" y="185" fill="white" font-size="11" font-weight="bold" opacity="0.5" text-anchor="middle" letter-spacing="1">Busana Adat Toraja</text>
                </svg>`;
            }
        }

        // --- 2. Regional Group Fallbacks if no specific culture matched ---
        if (reg.includes("jawa")) {
            if (type === "house") {
                return `<svg class="slideshow-art-svg" viewBox="0 0 400 200">
                    <rect width="100%" height="100%" fill="#14111f"/>
                    <path d="M120,110 L280,110 L310,160 L90,160 Z" fill="#d84315"/>
                    <path d="M160,60 L240,60 L260,110 L140,110 Z" fill="#d84315"/>
                    <rect x="120" y="160" width="160" height="30" fill="#4e342e"/>
                    <text x="200" y="38" fill="white" font-size="11" font-weight="bold" opacity="0.5" text-anchor="middle" letter-spacing="1">Rumah Joglo Jawa</text>
                </svg>`;
            } else {
                return `<svg class="slideshow-art-svg" viewBox="0 0 400 200">
                    <rect width="100%" height="100%" fill="#110d1c"/>
                    <g transform="translate(145, 20)">
                        <circle cx="55" cy="55" r="30" fill="#ffcc80"/>
                        <path d="M22,46 C22,15 88,15 88,46 Z" fill="#3e2723"/>
                        <path d="M20,85 C20,120 90,120 90,85 Z" fill="#151515" stroke="#ffd700" stroke-width="1.5"/>
                    </g>
                    <text x="200" y="185" fill="white" font-size="11" font-weight="bold" opacity="0.5" text-anchor="middle" letter-spacing="1">Busana Adat Jawa</text>
                </svg>`;
            }
        }
        else if (reg.includes("sumatra") || reg.includes("riau") || reg.includes("lampung")) {
            if (type === "house") {
                return `<svg class="slideshow-art-svg" viewBox="0 0 400 200">
                    <rect width="100%" height="100%" fill="#0a1811"/>
                    <path d="M70,110 Q120,30 130,40 Q120,110 140,120" fill="#3e2723" stroke="#ff8f00" stroke-width="2"/>
                    <path d="M330,110 Q280,30 270,40 Q280,110 260,120" fill="#3e2723" stroke="#ff8f00" stroke-width="2"/>
                    <polygon points="100,120 300,120 320,170 80,170" fill="#b71c1c" stroke="#ffd700" stroke-width="1"/>
                    <text x="200" y="195" fill="white" font-size="11" font-weight="bold" opacity="0.5" text-anchor="middle" letter-spacing="1">Rumah Gadang Sumatra</text>
                </svg>`;
            } else {
                return `<svg class="slideshow-art-svg" viewBox="0 0 400 200">
                    <rect width="100%" height="100%" fill="#1a0a0a"/>
                    <g transform="translate(130, 15)">
                        <circle cx="70" cy="80" r="25" fill="#ffe082"/>
                        <path d="M20,65 C30,20 110,20 120,65" fill="none" stroke="#ffd700" stroke-width="4"/>
                        <path d="M35,105 C35,140 105,140 105,105 Z" fill="#b71c1c" stroke="#ffd700" stroke-width="2"/>
                    </g>
                    <text x="200" y="190" fill="white" font-size="11" font-weight="bold" opacity="0.5" text-anchor="middle" letter-spacing="1">Busana Adat Sumatra</text>
                </svg>`;
            }
        }
        else if (reg.includes("bali") || reg.includes("nusa")) {
            if (type === "house") {
                return `<svg class="slideshow-art-svg" viewBox="0 0 400 200">
                    <rect width="100%" height="100%" fill="#1c1105"/>
                    <path d="M120,180 L120,50 L140,50 L145,65 L150,65 L155,95 L160,95 L165,135 L170,135 L170,180 Z" fill="#e65100" stroke="#ffd700" stroke-width="1"/>
                    <path d="M280,180 L280,50 L260,50 L255,65 L250,65 L245,95 L240,95 L235,135 L230,135 L230,180 Z" fill="#e65100" stroke="#ffd700" stroke-width="1"/>
                    <rect x="100" y="180" width="200" height="10" fill="#3e2723"/>
                    <text x="200" y="30" fill="white" font-size="11" font-weight="bold" opacity="0.5" text-anchor="middle" letter-spacing="1">Bale/Gapura Bali-Nusa</text>
                </svg>`;
            } else {
                return `<svg class="slideshow-art-svg" viewBox="0 0 400 200">
                    <rect width="100%" height="100%" fill="#0a0a1a"/>
                    <g transform="translate(140, 15)">
                        <circle cx="60" cy="70" r="22" fill="#ffe082"/>
                        <path d="M20,60 C30,15 90,15 100,60 Z" fill="#ffd700"/>
                        <path d="M35,92 C35,130 85,130 85,92 Z" fill="#ff8f00" stroke="#ffd700" stroke-width="1.5"/>
                    </g>
                    <text x="200" y="190" fill="white" font-size="11" font-weight="bold" opacity="0.5" text-anchor="middle" letter-spacing="1">Busana Tradisional Bali-Nusa</text>
                </svg>`;
            }
        }
        else if (reg.includes("kalimantan")) {
            if (type === "house") {
                return `<svg class="slideshow-art-svg" viewBox="0 0 400 200">
                    <rect width="100%" height="100%" fill="#0d1f11"/>
                    <rect x="60" y="80" width="280" height="40" fill="#3e2723" rx="2"/>
                    <polygon points="50,80 350,80 330,50 70,50" fill="#5d4037"/>
                    <line x1="80" y1="120" x2="80" y2="180" stroke="#3e2723" stroke-width="4"/>
                    <line x1="200" y1="120" x2="200" y2="180" stroke="#3e2723" stroke-width="4"/>
                    <line x1="320" y1="120" x2="320" y2="180" stroke="#3e2723" stroke-width="4"/>
                    <text x="200" y="35" fill="white" font-size="11" font-weight="bold" opacity="0.5" text-anchor="middle" letter-spacing="1">Rumah Betang Kalimantan</text>
                </svg>`;
            } else {
                return `<svg class="slideshow-art-svg" viewBox="0 0 400 200">
                    <rect width="100%" height="100%" fill="#1a1c0d"/>
                    <g transform="translate(130, 10)">
                        <circle cx="70" cy="80" r="24" fill="#ffb74d"/>
                        <path d="M40,62 Q70,5 70,10" stroke="white" stroke-width="8" stroke-linecap="round"/>
                        <rect x="42" y="58" width="56" height="8" fill="#ffd700" rx="2"/>
                    </g>
                    <text x="200" y="185" fill="white" font-size="11" font-weight="bold" opacity="0.5" text-anchor="middle" letter-spacing="1">Busana Tradisional Kalimantan</text>
                </svg>`;
            }
        }
        else if (reg.includes("sulawesi")) {
            if (type === "house") {
                return `<svg class="slideshow-art-svg" viewBox="0 0 400 200">
                    <rect width="100%" height="100%" fill="#1f1a0d"/>
                    <path d="M40,40 C100,120 300,120 360,40 C280,140 120,140 40,40 Z" fill="#3e2723"/>
                    <rect x="130" y="115" width="140" height="50" fill="#f5f5f5"/>
                    <text x="200" y="195" fill="white" font-size="11" font-weight="bold" opacity="0.5" text-anchor="middle" letter-spacing="1">Rumah Tongkonan/Sulawesi</text>
                </svg>`;
            } else {
                return `<svg class="slideshow-art-svg" viewBox="0 0 400 200">
                    <rect width="100%" height="100%" fill="#0a1a1a"/>
                    <g transform="translate(130, 20)">
                        <circle cx="70" cy="65" r="22" fill="#ffe082"/>
                        <path d="M30,85 C20,110 50,140 70,120 C90,140 120,110 110,85 Z" fill="#d500f9" opacity="0.8"/>
                    </g>
                    <text x="200" y="185" fill="white" font-size="11" font-weight="bold" opacity="0.5" text-anchor="middle" letter-spacing="1">Busana Adat Sulawesi</text>
                </svg>`;
            }
        }
        else if (reg.includes("papua") || reg.includes("maluku")) {
            if (type === "house") {
                return `<svg class="slideshow-art-svg" viewBox="0 0 400 200">
                    <rect width="100%" height="100%" fill="#0c0d12"/>
                    <path d="M120,130 C120,80 280,80 280,130 Z" fill="#8d6e63"/>
                    <rect x="140" y="130" width="120" height="40" fill="#5d4037" rx="3"/>
                    <rect x="190" y="145" width="20" height="25" fill="#151515"/>
                    <text x="200" y="185" fill="white" font-size="11" font-weight="bold" opacity="0.5" text-anchor="middle" letter-spacing="1">Rumah Adat Papua/Maluku</text>
                </svg>`;
            } else {
                return `<svg class="slideshow-art-svg" viewBox="0 0 400 200">
                    <rect width="100%" height="100%" fill="#0a0712"/>
                    <g transform="translate(130, 15)">
                        <circle cx="70" cy="70" r="23" fill="#8d6e63"/>
                        <path d="M30,55 Q70,-15 110,55" fill="none" stroke="#ffeb3b" stroke-width="6" stroke-linecap="round"/>
                    </g>
                    <text x="200" y="185" fill="white" font-size="11" font-weight="bold" opacity="0.5" text-anchor="middle" letter-spacing="1">Aksesoris Adat Timur Indonesia</text>
                </svg>`;
            }
        }

        // --- 3. Catch-all Fallbacks ---
        if (type === "house") {
            return `<svg class="slideshow-art-svg" viewBox="0 0 400 200">
                <rect width="100%" height="100%" fill="#1a1525"/>
                <polygon points="200,30 300,100 100,100" fill="${accent}" opacity="0.85" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.5))"/>
                <rect x="130" y="100" width="140" height="70" fill="#3a2512" rx="2"/>
                <rect x="180" y="130" width="40" height="40" fill="#ffd700" rx="1"/>
                <text x="200" y="185" fill="white" font-size="11" text-anchor="middle" letter-spacing="1">Representasi Rumah Adat</text>
            </svg>`;
        } else {
            return `<svg class="slideshow-art-svg" viewBox="0 0 400 200">
                <rect width="100%" height="100%" fill="#151525"/>
                <rect x="150" y="55" width="100" height="110" rx="12" fill="${accent}" opacity="0.8" stroke="#ffd700" stroke-width="1.5"/>
                <circle cx="200" cy="40" r="14" fill="#ffd700"/>
                <path d="M 180 55 L 220 55 L 200 32 Z" fill="#ff3d00"/>
                <text x="200" y="185" fill="white" font-size="11" text-anchor="middle" letter-spacing="1">Representasi Busana Adat</text>
            </svg>`;
        }
    }

    function renderSlideshow() {
        const container = document.getElementById("slideshowWrapper");
        if (!container) return;

        const slide = mockSlides[currentSlideIdx];
        const svgGraphic = getRegionalSvgIllustration(place, slide.type);

        container.style.opacity = 0;
        container.style.transition = "opacity 0.25s ease-out";
        
        setTimeout(() => {
            container.innerHTML = `
                ${svgGraphic}
                <div class="slide-info">
                    <h3>${slide.title}</h3>
                    <p>${slide.desc}</p>
                </div>
            `;
            container.style.opacity = 1;
        }, 150);
    }

    // 5. SVG Interactive Map Locator
    function drawMapLocator() {
        const container = document.getElementById("mapRadarLocator");
        if (!container) return;

        // Mini SVG of Indonesia Map outlining regional groups
        container.innerHTML = `
            <svg viewBox="0 0 600 250" style="width: 100%; background: rgba(0,0,0,0.2); border-radius: 12px; padding: 10px;">
                <!-- Sumatra -->
                <path d="M50,40 L120,110 L160,150 L140,160 L40,60 Z" fill="#444" stroke="#666" id="map-sumatra" class="map-sec"/>
                <!-- Java -->
                <path d="M150,170 L280,180 L280,195 L150,185 Z" fill="#444" stroke="#666" id="map-jawa" class="map-sec"/>
                <!-- Kalimantan -->
                <path d="M180,70 L260,60 L280,120 L190,130 Z" fill="#444" stroke="#666" id="map-kalimantan" class="map-sec"/>
                <!-- Sulawesi -->
                <path d="M300,80 L350,75 L330,120 L350,140 L310,130 Z" fill="#444" stroke="#666" id="map-sulawesi" class="map-sec"/>
                <!-- Bali Nusa -->
                <path d="M290,185 L390,195 L390,205 L290,195 Z" fill="#444" stroke="#666" id="map-bali-nusa" class="map-sec"/>
                <!-- Maluku Papua -->
                <path d="M390,80 L440,70 L480,110 L580,110 L580,160 L450,160 Z" fill="#444" stroke="#666" id="map-maluku-papua" class="map-sec"/>
                
                <!-- Radar Pulse point based on active region -->
                <circle cx="100" cy="100" r="6" class="radar-point" fill="var(--region-accent)"/>
                <circle cx="100" cy="100" r="10" class="radar-pulse" fill="none" stroke="var(--region-accent)" stroke-width="2"/>
            </svg>
        `;

        // Position radar based on active region
        const reg = (place.region || "").toLowerCase();
        const pt = container.querySelector(".radar-point");
        const pulse = container.querySelector(".radar-pulse");
        let activePathId = "";

        if (reg.includes("sumatra")) {
            pt.setAttribute("cx", "95"); pt.setAttribute("cy", "90");
            activePathId = "map-sumatra";
        } else if (reg.includes("jawa")) {
            pt.setAttribute("cx", "210"); pt.setAttribute("cy", "180");
            activePathId = "map-jawa";
        } else if (reg.includes("kalimantan")) {
            pt.setAttribute("cx", "230"); pt.setAttribute("cy", "100");
            activePathId = "map-kalimantan";
        } else if (reg.includes("sulawesi")) {
            pt.setAttribute("cx", "325"); pt.setAttribute("cy", "110");
            activePathId = "map-sulawesi";
        } else if (reg.includes("bali") || reg.includes("nusa")) {
            pt.setAttribute("cx", "330"); pt.setAttribute("cy", "190");
            activePathId = "map-bali-nusa";
        } else {
            pt.setAttribute("cx", "500"); pt.setAttribute("cy", "130");
            activePathId = "map-maluku-papua";
        }

        if (activePathId) {
            const activePath = container.querySelector("#" + activePathId);
            if (activePath) {
                activePath.setAttribute("fill", "var(--region-accent-glow)");
                activePath.setAttribute("stroke", "var(--region-accent)");
            }
        }
    }

    // 6. Zen Focus Mode Toggle
    function toggleZenMode() {
        let overlay = document.getElementById("zenOverlay");
        if (overlay) {
            overlay.remove();
            document.body.classList.remove("zen-focus-active");
            core.showToast("Zen Mode Nonaktif.");
            return;
        }

        document.body.classList.add("zen-focus-active");
        
        let regionKey = "aceh";
        const reg = place.region.toLowerCase();
        if (reg.includes("sumatra")) {
            regionKey = place.id === "aceh" ? "aceh" : "sumatra";
        } else if (reg.includes("jawa") || reg.includes("sunda") || reg.includes("betawi") || reg.includes("madura")) {
            regionKey = "jawa";
        } else if (reg.includes("bali") || reg.includes("nusa")) {
            regionKey = "bali";
        } else if (reg.includes("kalimantan")) {
            regionKey = "kalimantan";
        } else if (reg.includes("sulawesi")) {
            regionKey = "sulawesi";
        } else if (reg.includes("papua")) {
            regionKey = "papua";
        } else if (reg.includes("maluku")) {
            regionKey = "maluku";
        }
        
        const story = folkloreStories[place.id] || folkloreStories[regionKey] || folkloreStories.aceh;

        overlay = document.createElement("div");
        overlay.id = "zenOverlay";
        overlay.style.position = "fixed";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100vw";
        overlay.style.height = "100vh";
        overlay.style.background = "rgba(7, 7, 15, 0.97)";
        overlay.style.backdropFilter = "blur(20px)";
        overlay.style.webkitBackdropFilter = "blur(20px)";
        overlay.style.zIndex = "9999";
        overlay.style.display = "flex";
        overlay.style.flexDirection = "column";
        overlay.style.alignItems = "center";
        overlay.style.justifyContent = "center";
        overlay.style.color = "white";
        overlay.style.padding = "20px";
        overlay.style.overflowY = "auto";
        overlay.style.fontFamily = "'Outfit', sans-serif";

        if (!document.getElementById("zenBreatheStyle")) {
            const style = document.createElement("style");
            style.id = "zenBreatheStyle";
            style.textContent = `
                @keyframes zenBreathe {
                    0%, 100% { transform: scale(1); background: rgba(0, 229, 255, 0.1); box-shadow: 0 0 15px rgba(0, 229, 255, 0.2); }
                    50% { transform: scale(1.35); background: rgba(0, 229, 255, 0.35); box-shadow: 0 0 45px rgba(0, 229, 255, 0.55); }
                }
                .zen-breathing-circle {
                    width: 140px;
                    height: 140px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.9rem;
                    font-weight: 700;
                    color: white;
                    margin-bottom: 40px;
                    animation: zenBreathe 8s ease-in-out infinite;
                    border: 2px solid rgba(0, 229, 255, 0.4);
                    text-align: center;
                    user-select: none;
                }
            `;
            document.head.appendChild(style);
        }

        overlay.innerHTML = `
            <div style="max-width: 650px; width: 100%; display: flex; flex-direction: column; align-items: center; text-align: center;">
                <div class="zen-breathing-circle" id="zenBreatheIndicator">Tarik Napas</div>
                <div class="glass-card" style="padding: 30px; border-radius: 20px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); margin-bottom: 30px; width: 100%; text-align: left;">
                    <span style="color: var(--region-accent, #ff9800); font-weight: bold; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1.5px; display: block; margin-bottom: 8px;">Legenda Rakyat: ${place.label}</span>
                    <h2 style="font-size: 1.8rem; font-weight: 800; color: white; margin: 0 0 15px 0;">${story.title}</h2>
                    <p style="font-size: 1.1rem; line-height: 1.8; color: rgba(255,255,255,0.85); margin-bottom: 20px;">${story.text}</p>
                    <div style="padding: 12px 16px; border-radius: 12px; background: rgba(var(--region-accent-rgb, 255, 152, 0), 0.1); border-left: 4px solid var(--region-accent, #ff9800); font-style: italic; color: #ffe0b2;">
                        ${story.moral}
                    </div>
                </div>
                <div style="display: flex; flex-direction: column; gap: 15px; width: 100%; max-width: 320px; align-items: center; background: rgba(0,0,0,0.3); padding: 20px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05);">
                    <div style="width: 100%; display: flex; align-items: center; justify-content: space-between;">
                        <span style="font-size: 0.85rem; color: #aaa;"><i class="fa-solid fa-volume-high"></i> Volume Drone</span>
                        <input type="range" id="zenVolumeSlider" min="0" max="0.25" step="0.01" value="0.08" style="width: 60%; accent-color: var(--region-accent, #ff9800);">
                    </div>
                    <button class="btn btn-ghost btn-sm" id="zenCloseBtn" style="border-radius: 20px; border-color: rgba(255,255,255,0.2); width: 100%; padding: 8px;"><i class="fa-solid fa-circle-xmark"></i> Keluar Zen Focus</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        const breatheText = document.getElementById("zenBreatheIndicator");
        let breatheCycle = 0;
        const breatheInterval = setInterval(() => {
            if (!document.getElementById("zenOverlay")) {
                clearInterval(breatheInterval);
                return;
            }
            breatheCycle = (breatheCycle + 1) % 2;
            if (breatheCycle === 0) {
                breatheText.textContent = "Tarik Napas";
            } else {
                breatheText.textContent = "Hembuskan";
            }
        }, 4000);

        const volumeSlider = document.getElementById("zenVolumeSlider");
        if (volumeSlider) {
            if (ambientMasterGain) {
                volumeSlider.value = ambientMasterGain.gain.value;
            }
            volumeSlider.oninput = (e) => {
                const vol = parseFloat(e.target.value);
                if (ambientMasterGain) {
                    try {
                        ambientMasterGain.gain.setValueAtTime(vol, audioCtx.currentTime);
                    } catch(err){}
                }
            };
        }

        const closeBtn = document.getElementById("zenCloseBtn");
        if (closeBtn) {
            closeBtn.onclick = (e) => {
                e.preventDefault();
                toggleZenMode();
            };
        }

        core.showToast("Zen Mode Aktif. Tarik napas perlahan...");

        if (!isAmbientPlaying) {
            const ambientPlayBtn = document.getElementById("ambientPlayBtn");
            if (ambientPlayBtn) {
                ambientPlayBtn.click();
            }
        }
    }

    // 9. Folklore Story Reader + Speech Synthesis Narrator (Sentence-by-Sentence Synchronized Highlights)
    const folkloreStories = {
        jawa: {
            title: "Roro Jonggrang & Candi Prambanan",
            text: "Kisah Bandung Bondowoso yang ditantang membangun seribu candi dalam semalam demi cinta Roro Jonggrang, yang berujung pada kutukan patung batu.",
            moral: "Moral: Kejujuran dan menghargai kesepakatan adalah kunci kemuliaan sejati."
        },
        sunda: {
            title: "Sangkuriang & Gunung Tangkuban Parahu",
            text: "Kisah pemuda Sangkuriang yang gagal memenuhi syarat membuat danau dan perahu dalam semalam untuk menikahi Dayang Sumbi, lalu menendang perahu tersebut hingga terbalik menjadi gunung.",
            moral: "Moral: Kejujuran diri, patuh kepada ibu, dan mengendalikan amarah agar tidak merugikan masa depan."
        },
        bali: {
            title: "Kisah Jayaprana dan Layonsari",
            text: "Kisah cinta sejati di kerajaan Kalianget Bali Utara yang berujung tragis karena keserakahan penguasa, melambangkan kesucian janji pernikahan.",
            moral: "Moral: Kesetiaan cinta dan ketulusan nurani bernilai jauh lebih agung dibanding materi."
        },
        minang: {
            title: "Kisah Malin Kundang Anak Durhaka",
            text: "Kisah pemuda Minang bernama Malin Kundang yang sukses merantau namun malu mengakui ibu kandungnya yang miskin saat kembali, hingga ia dikutuk menjadi batu.",
            moral: "Moral: Bakti dan hormat kepada orang tua adalah kewajiban mutlak yang membawa berkah hidup."
        },
        batak: {
            title: "Asal Usul Danau Toba",
            text: "Kisah pemuda Toba yang melanggar janji rahasia istrinya yang menjelma dari ikan emas besar, memicu badai dahsyat hingga membentuk danau raksasa.",
            moral: "Moral: Kepercayaan adalah fondasi hubungan, sekali melanggar janji dampaknya tak terbayangkan."
        },
        aceh: {
            title: "Legenda Asal Mula Danau Laut Tawar",
            text: "Kisah sepasang naga bersaudara yang menjelma menjadi bukit untuk melindungi lembah subur di tanah Gayo dari banjir besar, melahirkan persatuan rakyat Gayo.",
            moral: "Moral: Pengorbanan tulus demi kemaslahatan bersama akan selalu mendatangkan kedamaian abadi."
        },
        betawi: {
            title: "Legenda Pendekar Si Pitung",
            text: "Kisah Si Pitung, pahlawan rakyat kecil Betawi yang berani melawan kesewenang-wenangan kompeni Belanda demi keadilan sosial bagi warga kampung.",
            moral: "Moral: Keeratan kekerabatan gotong royong dan kesediaan menolong sesama yang membutuhkan."
        },
        dayak: {
            title: "Legenda Bukit Batu Dayak",
            text: "Legenda perjuangan pemuda Dayak bertapa mencari berkah batu bertuah demi memakmurkan warga suku dari kelaparan musim kemarau panjang.",
            moral: "Moral: Keeratan kekerabatan gotong royong dan kesediaan berkorban mendatangkan perlindungan leluhur."
        },
        banjar: {
            title: "Legenda Pulau Kembang",
            text: "Kisah terbentuknya Pulau Kembang di tengah Sungai Barito dari tenggelamnya kapal kembang Kerajaan Banjar, menjadi tempat perlindungan kera liar.",
            moral: "Moral: Menghargai alam dan hidup berdampingan secara damai dengan mahluk hidup lainnya."
        },
        bugis: {
            title: "Kisah Putri Tadampalik & Kerbau Putih",
            text: "Kisah ketabahan Putri Luwu yang diasingkan karena penyakit kulit namun sembuh berkat jilatan kerbau putih, melahirkan perdamaian antar-kerajaan.",
            moral: "Moral: Kesahabatan dan kelembutan perilaku mendatangkan jalan keluar dari cobaan berat."
        },
        madura: {
            title: "Legenda Asal Usul Selat Madura",
            text: "Kisah perselisihan dua raksasa purba yang menghentakkan kaki ke bumi hingga memisahkan daratan Madura dengan pulau Jawa, menciptakan selat indah.",
            moral: "Moral: Pertikaian dan amarah tak terkontrol hanya membawa pemisahan yang merugikan."
        },
        "papua-provinsi": {
            title: "Legenda Danau Sentani",
            text: "Kisah masyarakat Sentani yang dipandu oleh naga raksasa menuju danau indah di lembah hijau, melambangkan asal mula pemukiman adat Sentani.",
            moral: "Moral: Kepatuhan pada arahan bijak membawa keselamatan dan kemakmuran hidup."
        },
        "papua-barat": {
            title: "Burung Namdur Pintar di Arfak",
            text: "Kisah kecerdasan burung Namdur di Pegunungan Arfak yang pandai merajut sarang indah berwarna-warni untuk menarik pasangannya, melambangkan keuletan suku Arfak.",
            moral: "Moral: Ketelatenan dan keindahan seni kerja keras melahirkan apresiasi tinggi."
        },
        "papua-selatan": {
            title: "Legenda Suku Marind dan Pohon Sagu",
            text: "Kisah persahabatan anak suku Marind dengan penjaga pohon sagu yang mengajarkan cara mengolah sagu sep secara tradisional untuk kemandirian pangan.",
            moral: "Moral: Menjaga kelestarian sumber pangan alam lokal menjamin masa depan generasi."
        },
        "papua-tengah": {
            title: "Legenda Danau Paniai",
            text: "Kisah Wissel Lakes atau Danau Paniai yang berair jernih di dataran tinggi, tempat lahirnya komoditas udang selingkuh dan anyaman noken anggrek suku Mee.",
            moral: "Moral: Kelimpahan alam harus dijaga secara lestari sebagai wujud rasa syukur."
        },
        "papua-pegunungan": {
            title: "Legenda Bakar Batu Suku Dani",
            text: "Kisah bersatunya marga-marga suku Dani di Wamena melalui ritual masak bakar batu bersama setelah menyelesaikan pertikaian adat kuno.",
            moral: "Moral: Makan bersama dan berdamai melahirkan kekuatan persaudaraan yang tak terpatahkan."
        },
        "papua-barat-daya": {
            title: "Legenda Asal Usul Raja Ampat",
            text: "Kisah sepasang suami istri di Sorong yang menemukan tujuh telur naga, menetas menjadi empat pangeran penguasa pulau besar di Raja Ampat.",
            moral: "Moral: Kepemimpinan luhur harus mengayomi seluruh pelosok wilayah secara adil."
        },
        sasak: {
            title: "Legenda Putri Mandalika",
            text: "Kisah pengorbanan Putri Mandalika dari Lombok yang menceburkan diri ke laut demi menghindari perang saudara antar-pangeran, menjelma menjadi cacing nyale.",
            moral: "Moral: Kebijaksanaan mementingkan kedamaian bersama di atas kepentingan diri sendiri."
        },
        toraja: {
            title: "Kisah Landorundun & Rambat Langi'",
            text: "Kisah kecantikan gadis Toraja berambut sangat panjang bernama Landorundun yang dinikahi raja dari seberang lautan, melambangkan keanggunan adat.",
            moral: "Moral: Kesetiaan pada janji leluhur dan menjaga keluhuran budi pekerti adat."
        },
        "melayu-riau": {
            title: "Legenda Lancang Kuning",
            text: "Kisah pelayaran kapal adat Lancang Kuning Riau yang sarat makna kepemimpinan kharismatik, kesetiaan awak kapal, dan kepatuhan adat melayu.",
            moral: "Moral: Integritas pemimpin dan kebersamaan rakyat adalah pilar tegaknya kedaulatan negeri."
        },
        lampung: {
            title: "Legenda Raden Jambat",
            text: "Kisah kepahlawanan putra mahkota Lampung yang bertualang membersihkan negeri dari kekacauan demi tegaknya perdamaian adat pepadun.",
            moral: "Moral: Pemimpin harus berani berkorban dan membersihkan rintangan demi kemaslahatan rakyat."
        },
        ambon: {
            title: "Legenda Batu Gantung Ambon",
            text: "Kisah perjuangan gadis Maluku menolak dinikahkan paksa hingga bersembunyi di tebing karang pantai curam demi mempertahankan prinsip hidup.",
            moral: "Moral: Keteguhan tekad menjaga kedaulatan nurani sendiri adalah harga diri manusia."
        },
        gorontalo: {
            title: "Legenda Lahilote & Selendang Bidadari",
            text: "Kisah pemuda Gorontalo bernama Lahilote yang menikahi bidadari khayangan berkat menyembunyikan selendangnya, namun akhirnya berpisah kembali.",
            moral: "Moral: Sesuatu yang diperoleh dengan ketidakjujuran tidak akan bertahan abadi."
        }
    };

    // Speaks text starting from a specific sentence index, updating highlights
    function speakTtsFromSentenceIndex(idx, story) {
        if (!("speechSynthesis" in window)) return;
        window.speechSynthesis.cancel();

        const sentencesToSpeak = ttsSentences.slice(idx);
        const text = sentencesToSpeak.join(" ");

        ttsUtterance = new SpeechSynthesisUtterance(text);
        ttsUtterance.lang = "id-ID";
        const speedSelect = document.getElementById("ttsSpeedSelect");
        ttsUtterance.rate = speedSelect ? parseFloat(speedSelect.value) : 1.0;

        const voices = window.speechSynthesis.getVoices();
        const idVoice = voices.find(v => v.lang.startsWith("id") || v.lang.includes("ID"));
        if (idVoice) ttsUtterance.voice = idVoice;

        // Build lengths starting from the offset index
        let accum = 0;
        const currentLengths = [];
        sentencesToSpeak.forEach(s => {
            currentLengths.push({ start: accum, end: accum + s.length });
            accum += s.length + 1; // +1 space
        });

        ttsUtterance.onboundary = (event) => {
            if (event.name === "word") return; // we care about sentence boundaries
            const charIdx = event.charIndex;
            const activeOffset = currentLengths.findIndex(l => charIdx >= l.start && charIdx <= l.end);
            
            if (activeOffset !== -1) {
                const globalIdx = idx + activeOffset;
                highlightSentence(globalIdx);
            }
        };

        ttsUtterance.onstart = () => {
            isTtsReading = true;
            isTtsPaused = false;
            updateTtsStateUI(true);
        };

        ttsUtterance.onend = () => {
            isTtsReading = false;
            isTtsPaused = false;
            updateTtsStateUI(false);
            clearHighlights();
        };

        ttsUtterance.onerror = () => {
            isTtsReading = false;
            isTtsPaused = false;
            updateTtsStateUI(false);
            clearHighlights();
        };

        window.speechSynthesis.speak(ttsUtterance);
    }

    function highlightSentence(index) {
        const container = document.getElementById("folkloreStoriesContainer");
        if (!container) return;
        
        container.querySelectorAll(".folklore-sentence").forEach((el, idx) => {
            if (idx === index) {
                el.style.color = "var(--detail-heading)";
                el.style.background = "var(--region-accent-glow)";
                el.style.textShadow = "0 0 10px var(--region-accent-glow)";
                el.style.borderRadius = "6px";
                el.style.padding = "2px 6px";
                el.style.transform = "scale(1.02)";
                el.style.display = "inline-block";
            } else {
                el.style.color = "rgba(255,255,255,0.25)";
                el.style.background = "transparent";
                el.style.textShadow = "none";
                el.style.padding = "0";
                el.style.transform = "none";
                el.style.display = "inline";
            }
        });
    }

    function clearHighlights() {
        const container = document.getElementById("folkloreStoriesContainer");
        if (!container) return;
        container.querySelectorAll(".folklore-sentence").forEach(el => {
            el.style.color = "";
            el.style.background = "";
            el.style.textShadow = "";
            el.style.padding = "";
            el.style.transform = "";
            el.style.display = "inline";
        });
    }

    function updateTtsStateUI(active) {
        const playBtn = document.getElementById("ttsPlayBtn");
        const stopBtn = document.getElementById("ttsStopBtn");
        const container = document.querySelector(".folklore-container");

        if (!playBtn || !stopBtn) return;

        if (active) {
            if (isTtsPaused) {
                playBtn.innerHTML = `<i class="fa-solid fa-play"></i> Lanjutkan`;
                if (container) container.classList.remove("tts-reading-active");
            } else {
                playBtn.innerHTML = `<i class="fa-solid fa-pause"></i> Jeda`;
                if (container) container.classList.add("tts-reading-active");
            }
            stopBtn.disabled = false;
        } else {
            playBtn.innerHTML = `<i class="fa-solid fa-play"></i> Bacakan`;
            stopBtn.disabled = true;
            if (container) container.classList.remove("tts-reading-active");
        }
    }

    function initFolklore() {
        const container = document.getElementById("folkloreStoriesContainer");
        const playBtn = document.getElementById("ttsPlayBtn");
        const stopBtn = document.getElementById("ttsStopBtn");
        const speedSelect = document.getElementById("ttsSpeedSelect");

        if (!container) return;

        // Map regions accurately
        let regionKey = "aceh";
        const reg = place.region.toLowerCase();
        if (reg.includes("sumatra")) {
            regionKey = place.id === "aceh" ? "aceh" : "sumatra";
        } else if (reg.includes("jawa") || reg.includes("sunda") || reg.includes("betawi") || reg.includes("madura")) {
            regionKey = "jawa";
        } else if (reg.includes("bali") || reg.includes("nusa")) {
            regionKey = "bali";
        } else if (reg.includes("kalimantan")) {
            regionKey = "kalimantan";
        } else if (reg.includes("sulawesi")) {
            regionKey = "sulawesi";
        } else if (reg.includes("papua")) {
            regionKey = "papua";
        } else if (reg.includes("maluku")) {
            regionKey = "maluku";
        }

        const story = folkloreStories[place.id] || folkloreStories[regionKey] || folkloreStories.aceh;

        // Split text into sentences for synchronized highlighting
        ttsSentences = story.text.split(/(?<=[.!?])\s+/);
        
        // Wrap each sentence in a span
        const sentencesHtml = ttsSentences.map((s, idx) => `
            <span class="folklore-sentence" data-idx="${idx}" style="cursor:pointer; transition:all 0.25s ease;">${s}</span>
        `).join(" ");

        container.innerHTML = `
            <h3 style="font-size:1.3rem; font-weight:700; color:white; margin:0 0 10px 0;">${story.title}</h3>
            <p id="storyContentText" style="font-size: 1.1rem; line-height: 1.7; color: var(--detail-text); transition: color 0.3s; margin: 0 0 15px 0;">
                ${sentencesHtml}
            </p>
            <div class="story-moral" style="margin-top: 15px; padding: 14px; border-radius: 12px; background: var(--region-accent-glow); border-left: 4px solid var(--region-accent);">
                <i class="fa-solid fa-lightbulb" style="color: #ff9800; margin-right: 8px;"></i>
                <strong>${story.moral}</strong>
            </div>
        `;

        if (!playBtn || !stopBtn || !speedSelect) return;

        // Click on sentence directly to speak from there
        container.querySelectorAll(".folklore-sentence").forEach(span => {
            span.addEventListener("click", () => {
                const idx = parseInt(span.dataset.idx);
                speakTtsFromSentenceIndex(idx, story);
                core.showToast(`Memulai pembacaan dari kalimat ${idx + 1}...`);
            });
        });

        playBtn.onclick = () => {
            playChime("click");
            if (!("speechSynthesis" in window)) {
                core.showToast("Speech synthesis tidak didukung di browser ini.");
                return;
            }

            if (isTtsReading) {
                if (isTtsPaused) {
                    window.speechSynthesis.resume();
                    isTtsPaused = false;
                    updateTtsStateUI(true);
                } else {
                    window.speechSynthesis.pause();
                    isTtsPaused = true;
                    updateTtsStateUI(true);
                }
            } else {
                speakTtsFromSentenceIndex(0, story);
            }
        };

        stopBtn.onclick = () => {
            playChime("click");
            if ("speechSynthesis" in window) {
                window.speechSynthesis.cancel();
            }
            isTtsReading = false;
            isTtsPaused = false;
            updateTtsStateUI(false);
            clearHighlights();
            core.showToast("Pembacaan legenda dihentikan.");
        };

        speedSelect.onchange = () => {
            if (isTtsReading && !isTtsPaused) {
                // Restart with new rate
                stopBtn.click();
                setTimeout(() => playBtn.click(), 100);
            }
        };

        window.addEventListener("beforeunload", () => {
            if ("speechSynthesis" in window) window.speechSynthesis.cancel();
        });
    }

    // 10. Aksara Keyboard Simulator (with pitch-mapped clicks & salin clipboard)
    const aksaraMap = {
        jawa: {
            consonants: [
                { char: "ꦲ", latin: "ha", freq: 261.63 },
                { char: "ꦤ", latin: "na", freq: 277.18 },
                { char: "ꦕ", latin: "ca", freq: 293.66 },
                { char: "ꦫ", latin: "ra", freq: 311.13 },
                { char: "ꦏ", latin: "ka", freq: 329.63 },
                { char: "ꦢ", latin: "da", freq: 349.23 },
                { char: "ꦠ", latin: "ta", freq: 369.99 },
                { char: "ꦱ", latin: "sa", freq: 392.00 },
                { char: "ꦮ", latin: "wa", freq: 415.30 },
                { char: "ꦭ", latin: "la", freq: 440.00 },
                { char: "ꦥ", latin: "pa", freq: 466.16 },
                { char: "ꦝ", latin: "dha", freq: 493.88 },
                { char: "ꦗ", latin: "ja", freq: 523.25 },
                { char: "ꦪ", latin: "ya", freq: 554.37 },
                { char: "ꦚ", latin: "nya", freq: 587.33 },
                { char: "ꦩ", latin: "ma", freq: 622.25 },
                { char: "ꦒ", latin: "ga", freq: 659.25 },
                { char: "ꦧ", latin: "ba", freq: 698.46 },
                { char: "ꦛ", latin: "tha", freq: 739.99 },
                { char: "ꦔ", latin: "nga", freq: 783.99 }
            ],
            modifiers: [
                { char: "ꦶ", latin: "i (wulu)", type: "append", freq: 880.00 },
                { char: "ꦸ", latin: "u (suku)", type: "append", freq: 932.33 },
                { char: "ꦺ", latin: "e (taling)", type: "taling", freq: 987.77 },
                { char: "ꦼ", latin: "ě (pepet)", type: "append", freq: 1046.50 },
                { char: "ꦺꦴ", latin: "o (taling-tarung)", type: "taling-tarung", freq: 1109.73 }
            ]
        },
        bali: {
            consonants: [
                { char: "ᬳ", latin: "ha", freq: 261.63 },
                { char: "ᬦ", latin: "na", freq: 277.18 },
                { char: "ᬘ", latin: "ca", freq: 293.66 },
                { char: "ᬭ", latin: "ra", freq: 311.13 },
                { char: "ᬓ", latin: "ka", freq: 329.63 },
                { char: "ᬤ", latin: "da", freq: 349.23 },
                { char: "ᬢ", latin: "ta", freq: 369.99 },
                { char: "ᬲ", latin: "sa", freq: 392.00 },
                { char: "ᬯ", latin: "wa", freq: 415.30 },
                { char: "ᬮ", latin: "la", freq: 440.00 },
                { char: "ᬧ", latin: "pa", freq: 466.16 },
                { char: "ᬚ", latin: "ja", freq: 523.25 },
                { char: "ᬬ", latin: "ya", freq: 554.37 },
                { char: "ᬫ", latin: "ma", freq: 622.25 },
                { char: "ᬕ", latin: "ga", freq: 659.25 },
                { char: "ᬩ", latin: "ba", freq: 698.46 },
                { char: "ᬗ", latin: "nga", freq: 783.99 }
            ],
            modifiers: [
                { char: "ᬶ", latin: "i (ulu)", type: "append", freq: 880.00 },
                { char: "ᬸ", latin: "u (suku)", type: "append", freq: 932.33 },
                { char: "ᬾ", latin: "e (taleng)", type: "taling", freq: 987.77 },
                { char: "ᭀ", latin: "o (taleng-tedung)", type: "taling-tarung", freq: 1109.73 }
            ]
        },
        batak: {
            consonants: [
                { char: "ᯀ", latin: "a", freq: 261.63 },
                { char: "ᯂ", latin: "ha", freq: 293.66 },
                { char: "ᯔ", latin: "ma", freq: 329.63 },
                { char: "ᯉ", latin: "na", freq: 392.00 },
                { char: "ᯅ", latin: "ba", freq: 415.30 },
                { char: "ᯑ", latin: "da", freq: 440.00 },
                { char: "ᯇ", latin: "pa", freq: 493.88 },
                { char: "ᯚ", latin: "ja", freq: 523.25 },
                { char: "ᯠ", latin: "ya", freq: 554.37 },
                { char: "ᯥ", latin: "wa", freq: 587.33 },
                { char: "ᯘ", latin: "sa", freq: 622.25 },
                { char: "ᯙ", latin: "ga", freq: 659.25 },
                { char: "ᯞ", latin: "la", freq: 698.46 },
                { char: "ᯓ", latin: "ta", freq: 739.99 },
                { char: "ᯝ", latin: "nga", freq: 783.99 }
            ],
            modifiers: [
                { char: "ᯪ", latin: "i (haluaon)", type: "append", freq: 880.00 },
                { char: "ᯫ", latin: "u (hamaboron)", type: "append", freq: 932.33 },
                { char: "ᯬ", latin: "e (hatalingan)", type: "append", freq: 987.77 },
                { char: "ᯭ", latin: "o (hadosan)", type: "append", freq: 1046.50 }
            ]
        }
    };

    function composeAksara(outputVal, keyChar, keyType, script) {
        const javaneseConsonants = ["ꦲ","ꦤ","ꦕ","ꦫ","ꦏ","ꦢ","ꦠ","ꦱ","ꦮ","ꦭ","ꦥ","ꦝ","ꦗ","ꦪ","ꦚ","ꦩ","ꦒ","ꦧ","ꦛ","ꦔ"];
        const balineseConsonants = ["ᬳ","ᬦ","ᬘ","ᬭ","ᬓ","ᬤ","ᬢ","ᬲ","ᬯ","ᬮ","ᬧ","ᬚ","ᬬ","ᬫ","ᬕ","ᬩ","ᬗ"];
        const list = script === "jawa" ? javaneseConsonants : balineseConsonants;
        const lastChar = outputVal.slice(-1);

        if (keyType === "consonant") {
            return outputVal + keyChar;
        } else if (keyType === "append") {
            return outputVal + keyChar;
        } else if (keyType === "taling") {
            if (list.includes(lastChar)) {
                return outputVal.slice(0, -1) + keyChar + lastChar;
            } else {
                return outputVal + keyChar;
            }
        } else if (keyType === "taling-tarung") {
            if (list.includes(lastChar)) {
                const charBefore = outputVal.slice(-2, -1);
                const talingChar = script === "jawa" ? "ꦺ" : "ᬾ";
                const tarungChar = script === "jawa" ? "ꦴ" : "ᬵ";
                if (charBefore === talingChar) {
                    return outputVal + tarungChar;
                } else {
                    return outputVal.slice(0, -1) + talingChar + lastChar + tarungChar;
                }
            } else {
                return outputVal + keyChar;
            }
        }
        return outputVal + keyChar;
    }

    function initAksaraSimulator() {
        const keypad = document.getElementById("aksaraKeypad");
        const output = document.getElementById("aksaraOutputText");
        const clearBtn = document.getElementById("clearAksaraBtn");
        const copyBtn = document.getElementById("copyAksaraBtn");
        
        if (!keypad || !output) return;

        const cardContainer = keypad.closest(".section-card");
        let activeScript = null;
        if (place.id === "jawa" || place.id === "madura") activeScript = "jawa";
        else if (place.id === "bali") activeScript = "bali";
        else if (place.id === "batak") activeScript = "batak";

        if (!activeScript) {
            if (cardContainer) cardContainer.style.display = "none";
            return;
        } else {
            if (cardContainer) cardContainer.style.display = "";
        }

        function renderKeypad() {
            keypad.innerHTML = "";

            const layoutWrapper = document.createElement("div");
            layoutWrapper.className = "aksara-layout-wrapper";
            layoutWrapper.style.display = "flex";
            layoutWrapper.style.flexDirection = "column";
            layoutWrapper.style.gap = "16px";
            layoutWrapper.style.width = "100%";

            const currentLayout = aksaraMap[activeScript];

            const consTitle = document.createElement("div");
            consTitle.className = "aksara-section-title";
            consTitle.textContent = "Huruf Konsonan (Aksara)";
            layoutWrapper.appendChild(consTitle);

            const consGrid = document.createElement("div");
            consGrid.className = "aksara-keypad-row";
            
            currentLayout.consonants.forEach(k => {
                const btn = document.createElement("button");
                btn.className = "aksara-key";
                btn.innerHTML = `
                    <span>${k.char}</span>
                    <small>${k.latin}</small>
                `;
                btn.onclick = (e) => {
                    e.preventDefault();
                    playAksaraTone(k.freq);
                    output.value = composeAksara(output.value, k.char, "consonant", activeScript);
                    games.addXP?.(1);
                    btn.style.transform = "scale(0.92)";
                    setTimeout(() => btn.style.transform = "", 100);
                };
                consGrid.appendChild(btn);
            });
            layoutWrapper.appendChild(consGrid);

            const modTitle = document.createElement("div");
            modTitle.className = "aksara-section-title";
            modTitle.textContent = "Sandhangan (Vokal & Penanda)";
            layoutWrapper.appendChild(modTitle);

            const modGrid = document.createElement("div");
            modGrid.className = "aksara-modifiers-row";
            
            currentLayout.modifiers.forEach(k => {
                const btn = document.createElement("button");
                btn.className = "aksara-key modifier-key";
                btn.innerHTML = `
                    <span>${k.char}</span>
                    <small>${k.latin}</small>
                `;
                btn.onclick = (e) => {
                    e.preventDefault();
                    playAksaraTone(k.freq);
                    output.value = composeAksara(output.value, k.char, k.type, activeScript);
                    games.addXP?.(1);
                    btn.style.transform = "scale(0.92)";
                    setTimeout(() => btn.style.transform = "", 100);
                };
                modGrid.appendChild(btn);
            });
            layoutWrapper.appendChild(modGrid);

            const actionRow = document.createElement("div");
            actionRow.className = "aksara-action-row";

            const spaceBtn = document.createElement("button");
            spaceBtn.className = "btn btn-ghost aksara-action-btn";
            spaceBtn.innerHTML = '<i class="fa-solid fa-left-right"></i> Spasi';
            spaceBtn.onclick = (e) => {
                e.preventDefault();
                playAksaraTone(300);
                output.value += " ";
                spaceBtn.style.transform = "scale(0.95)";
                setTimeout(() => spaceBtn.style.transform = "", 100);
            };
            actionRow.appendChild(spaceBtn);

            const backBtn = document.createElement("button");
            backBtn.className = "btn aksara-action-btn";
            backBtn.style.background = "rgba(244, 67, 54, 0.15)";
            backBtn.style.border = "1px solid #f44336";
            backBtn.style.color = "#ff8a80";
            backBtn.innerHTML = '<i class="fa-solid fa-delete-left"></i> Hapus';
            backBtn.onclick = (e) => {
                e.preventDefault();
                playAksaraTone(200);
                output.value = output.value.slice(0, -1);
                backBtn.style.transform = "scale(0.95)";
                setTimeout(() => backBtn.style.transform = "", 100);
            };
            actionRow.appendChild(backBtn);

            layoutWrapper.appendChild(actionRow);
            keypad.appendChild(layoutWrapper);
        }

        renderKeypad();

        if (clearBtn) {
            clearBtn.onclick = (e) => {
                e.preventDefault();
                output.value = "";
                playChime("click");
            };
        }

        if (copyBtn) {
            copyBtn.onclick = (e) => {
                e.stopPropagation();
                e.preventDefault();
                if (!output.value) {
                    core.showToast("Simulator kosong. Ketik aksara terlebih dahulu!");
                    return;
                }
                navigator.clipboard.writeText(output.value).then(() => {
                    core.showToast("Aksara berhasil disalin ke papan klip!");
                    playChime("success");
                }).catch(() => {
                    core.showToast("Gagal menyalin aksara.");
                });
            };
        }
    }

    // Levenshtein distance algorithm for voice recognition similarity
    function getSimilarity(s1, s2) {
        const longer = s1.length > s2.length ? s1 : s2;
        const shorter = s1.length > s2.length ? s2 : s1;
        const longerLength = longer.length;
        if (longerLength === 0) return 1.0;
        return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
    }
    
    function editDistance(s1, s2) {
        s1 = s1.toLowerCase();
        s2 = s2.toLowerCase();
        const costs = [];
        for (let i = 0; i <= s1.length; i++) {
            let lastValue = i;
            for (let j = 0; j <= s2.length; j++) {
                if (i == 0) costs[j] = j;
                else {
                    if (j > 0) {
                        let newValue = costs[j - 1];
                        if (s1.charAt(i - 1) != s2.charAt(j - 1))
                            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                        costs[j - 1] = lastValue;
                        lastValue = newValue;
                    }
                }
            }
            if (i > 0) costs[s2.length] = lastValue;
        }
        return costs[s2.length];
    }

    // 12. Web Speech API Pronunciation Feedback (Accuracy Grade Circle)
    let recognition = null;
    function initSpeechRecognition() {
        const micBtn = document.getElementById("speechMicBtn");
        const statusText = document.getElementById("speechStatus");
        const scoreRing = document.getElementById("speechScoreRing");
        const scoreCircle = document.getElementById("speechScoreCircle");
        const scoreText = document.getElementById("speechScoreText");

        if (!micBtn) return;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            if (statusText) statusText.textContent = "Speech recognition tidak didukung di browser ini.";
            micBtn.disabled = true;
            return;
        }

        recognition = new SpeechRecognition();
        recognition.lang = "id-ID";
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        micBtn.onclick = () => {
            playChime("click");
            if (micBtn.classList.contains("listening")) {
                recognition.stop();
            } else {
                micBtn.classList.add("listening");
                if (scoreRing) scoreRing.style.display = "none";
                if (statusText) statusText.textContent = "Mendengarkan... Ucapkan kata/frasa di atas.";
                recognition.start();
            }
        };

        recognition.onresult = (event) => {
            const result = event.results[0][0].transcript.toLowerCase().trim();
            if (statusText) statusText.textContent = `Anda mengucapkan: "${result}"`;
            
            // Get active flashcard target
            const activeCard = place.cards[currentCardIndex % place.cards.length];
            const target = (activeCard ? activeCard[0] : "Horas").toLowerCase().trim();

            // Calculate similarity score
            let similarity = getSimilarity(result, target);
            if (result.includes(target)) similarity = Math.max(similarity, 0.85);
            const score = Math.round(similarity * 100);

            // Display accuracy circle
            if (scoreRing && scoreCircle && scoreText) {
                scoreRing.style.display = "flex";
                
                // SVG circular fill logic (circumference = 175.9)
                const circumference = 175.9;
                const offset = circumference - (score / 100) * circumference;
                scoreCircle.style.strokeDashoffset = offset;
                scoreText.textContent = `${score}%`;

                // Color code circle based on performance
                if (score >= 80) {
                    scoreCircle.setAttribute("stroke", "#4caf50"); // green
                    scoreText.style.color = "#81c784";
                } else if (score >= 50) {
                    scoreCircle.setAttribute("stroke", "#ff9800"); // orange
                    scoreText.style.color = "#ffb74d";
                } else {
                    scoreCircle.setAttribute("stroke", "#f44336"); // red
                    scoreText.style.color = "#e57373";
                }
            }

            if (score >= 80) {
                playChime("success");
                if (statusText) statusText.innerHTML += ` <br><strong style="color: #4caf50;">Kefasihan Sempurna! +20 XP</strong>`;
                games.addXP?.(20);
                games.triggerConfetti?.();
            } else if (score >= 50) {
                playChime("success");
                if (statusText) statusText.innerHTML += ` <br><strong style="color: #ff9800;">Pelafalan Cukup Baik! +10 XP</strong>`;
                games.addXP?.(10);
            } else {
                playChime("error");
                if (statusText) statusText.innerHTML += ` <br><strong style="color: #f44336;">Belum pas. Dekati mikrofon dan coba lagi.</strong>`;
            }
        };

        recognition.onend = () => {
            micBtn.classList.remove("listening");
        };

        recognition.onerror = () => {
            if (statusText) statusText.textContent = "Error mikrofon atau suara tidak terdengar.";
            micBtn.classList.remove("listening");
        };
    }

    // 13. Vocabulary Flashcard 3D Studio & Parallax Hover Math
    let currentCardIndex = 0;
    function renderFlashcard3D() {
        const cardFront = document.getElementById("cardFrontContent");
        const cardBack = document.getElementById("cardBackContent");
        const progressStr = document.getElementById("cardProgressString");

        if (!cardFront || !cardBack) return;

        const card = place.cards[currentCardIndex % place.cards.length];
        
        cardFront.innerHTML = `
            <small style="color: var(--region-accent); font-weight: bold; text-transform: uppercase;">Kosakata</small>
            <h2 style="font-size: 2.3rem; text-shadow: 0 4px 10px rgba(0,0,0,0.5);">${card[0]}</h2>
            <span class="mini-tag">${card[2] || "Benda"}</span>
        `;

        cardBack.innerHTML = `
            <small style="color: #888;">Terjemahan</small>
            <h2 style="font-size: 2.0rem; color: #00e5ff;">${card[1]}</h2>
            <p style="font-size: 0.9rem; color: #aaa; text-align:center;">Gunakan tombol spasi untuk membalik</p>
        `;

        if (progressStr) {
            progressStr.textContent = `${currentCardIndex + 1} / ${place.cards.length}`;
        }
    }

    function initFlashcardEvents() {
        const card = document.getElementById("flashcard3D");
        const prev = document.getElementById("prevCardBtn");
        const next = document.getElementById("nextCardBtn");

        if (!card) return;

        // Mousemove 3D Parallax logic
        const cardWrapper = card.parentElement;
        cardWrapper.addEventListener("mousemove", (e) => {
            const rect = cardWrapper.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const xc = rect.width / 2;
            const yc = rect.height / 2;
            
            const dx = x - xc;
            const dy = y - yc;
            
            // Limit angles to max 12 degrees
            const rotX = -(dy / yc) * 12;
            const rotY = (dx / xc) * 12;
            
            // Offset for flipped face
            const flipOffset = card.classList.contains("flipped") ? 180 : 0;
            card.style.transform = `rotateX(${rotX}deg) rotateY(${rotY + flipOffset}deg)`;
        });

        cardWrapper.addEventListener("mouseleave", () => {
            // Return to resting state
            card.style.transform = card.classList.contains("flipped") ? "rotateY(180deg)" : "rotateY(0deg)";
        });

        card.addEventListener("click", () => {
            card.classList.toggle("flipped");
            playChime("click");
        });

        if (prev) {
            prev.onclick = (e) => {
                e.stopPropagation();
                if (currentCardIndex > 0) {
                    currentCardIndex--;
                    card.classList.remove("flipped");
                    setTimeout(renderFlashcard3D, 200);
                    playChime("click");
                }
            };
        }

        if (next) {
            next.onclick = (e) => {
                e.stopPropagation();
                if (currentCardIndex < place.cards.length - 1) {
                    currentCardIndex++;
                    card.classList.remove("flipped");
                    setTimeout(renderFlashcard3D, 200);
                    playChime("click");
                }
            };
        }

        // Keyboard Accessibility Shortcuts
        document.addEventListener("keydown", (e) => {
            if (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA") {
                return;
            }
            if (e.code === "Space") {
                e.preventDefault();
                card.classList.toggle("flipped");
                playChime("click");
            }
            if (e.code === "ArrowRight" && next) {
                next.click();
            }
            if (e.code === "ArrowLeft" && prev) {
                prev.click();
            }
        });
    }

    // 14. In-Page Glossary Search
    function initGlossarySearch() {
        const searchInput = document.getElementById("glossarySearchInput");
        const phraseGrid = document.getElementById("phraseGrid");

        if (!searchInput || !phraseGrid) return;

        searchInput.addEventListener("input", (e) => {
            const val = e.target.value.toLowerCase();
            phraseGrid.querySelectorAll(".phrase-card-interactive").forEach(card => {
                const text = card.textContent.toLowerCase();
                if (text.includes(val)) {
                    card.style.display = "";
                } else {
                    card.style.display = "none";
                }
            });
        });
    }

    // 15. Language Typology & Vitality Sheet
    function initTypology() {
        const family = document.getElementById("typoFamily");
        const speakers = document.getElementById("typoSpeakers");
        const vitality = document.getElementById("typoVitality");

        if (family) family.textContent = place.region.includes("Jawa") ? "Austronesia (Melayu-Polinesia)" : "Austronesia (Sumatera/Melayu)";
        if (speakers) speakers.textContent = place.region.includes("Jawa") ? "80M+ Penutur Aktif" : "2M+ Penutur";
        if (vitality) vitality.textContent = "Stabil & Aktif (Safe)";
    }

    // 16. Phrase Matching Game (with stats, timer, scores, chimes, and retry)
    let selectedMatchCard = null;
    let matchScoreValue = 0;
    let matchTimerInterval = null;
    let matchStartTime = null;
    let matchHasStarted = false;
    let totalMatchesFound = 0;

    function initMatchingGame() {
        const col1 = document.getElementById("matchCol1");
        const col2 = document.getElementById("matchCol2");
        const scoreVal = document.getElementById("matchScore");
        const timerVal = document.getElementById("matchTimer");
        const highScoreVal = document.getElementById("matchHighScore");
        const victoryMsg = document.getElementById("matchVictoryMsg");
        const victoryText = document.getElementById("matchVictoryText");
        const restartBtn = document.getElementById("restartMatchBtn");
        const svg = document.getElementById("matchingConnectorSvg");

        if (!col1 || !col2) return;

        const cardsToUse = place.cards.slice(0, 4);

        // Load high score
        const hsKey = `match_highscore_${place.id}`;
        if (highScoreVal) {
            const storedHs = localStorage.getItem(hsKey);
            highScoreVal.textContent = storedHs ? `${storedHs}` : "-";
        }

        // Shuffle cards
        const leftWords = cardsToUse.map((c, i) => ({ text: c[0], id: i })).sort(() => Math.random() - 0.5);
        const rightWords = cardsToUse.map((c, i) => ({ text: c[1], id: i })).sort(() => Math.random() - 0.5);

        col1.innerHTML = leftWords.map(w => `<div class="match-card" data-id="${w.id}" data-type="local">${w.text}</div>`).join("");
        col2.innerHTML = rightWords.map(w => `<div class="match-card" data-id="${w.id}" data-type="indo">${w.text}</div>`).join("");

        matchScoreValue = 0;
        totalMatchesFound = 0;
        matchHasStarted = false;
        matchStreak = 0;
        if (scoreVal) scoreVal.textContent = "0";
        if (timerVal) timerVal.textContent = "0s";
        if (victoryMsg) victoryMsg.style.display = "none";
        if (svg) svg.innerHTML = "";
        col1.style.display = "";
        col2.style.display = "";

        function triggerComboPopup(cardEl, streak) {
            const rect = cardEl.getBoundingClientRect();
            const popup = document.createElement("div");
            popup.className = "combo-popup-text";
            popup.textContent = `Combo x${streak}!`;
            
            const svgRect = svg.getBoundingClientRect();
            popup.style.position = "absolute";
            popup.style.left = `${rect.left + rect.width / 2 - svgRect.left}px`;
            popup.style.top = `${rect.top - 20 - svgRect.top}px`;
            popup.style.color = "var(--region-accent, #ff9800)";
            popup.style.fontSize = "1.1rem";
            popup.style.fontWeight = "900";
            popup.style.textShadow = "0 0 10px rgba(255, 152, 0, 0.7)";
            popup.style.pointerEvents = "none";
            popup.style.zIndex = "100";
            popup.style.animation = "float-up-fade 0.8s ease-out forwards";
            
            const container = document.querySelector(".matching-game-container");
            if (container) {
                container.appendChild(popup);
                setTimeout(() => popup.remove(), 800);
            }
        }

        function drawMatchConnections() {
            if (!svg) return;
            svg.innerHTML = "";
            const svgRect = svg.getBoundingClientRect();

            const leftMatched = col1.querySelectorAll(".match-card.matched");
            leftMatched.forEach(leftCard => {
                const id = leftCard.dataset.id;
                const rightCard = col2.querySelector(`.match-card.matched[data-id="${id}"]`);
                if (rightCard) {
                    const rect1 = leftCard.getBoundingClientRect();
                    const rect2 = rightCard.getBoundingClientRect();

                    const x1 = rect1.right - svgRect.left;
                    const y1 = rect1.top + rect1.height / 2 - svgRect.top;
                    const x2 = rect2.left - svgRect.left;
                    const y2 = rect2.top + rect2.height / 2 - svgRect.top;

                    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                    const dx = Math.abs(x2 - x1) * 0.5;
                    const d = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
                    
                    path.setAttribute("d", d);
                    path.setAttribute("fill", "none");
                    path.setAttribute("stroke", "var(--region-accent, #ff9800)");
                    path.setAttribute("stroke-width", "3");
                    path.setAttribute("class", "glowing-connection-line");
                    path.setAttribute("stroke-dasharray", "4,4");
                    svg.appendChild(path);
                }
            });
        }

        window.addEventListener("resize", drawMatchConnections);

        const tabBtn = document.querySelector('[data-main-tab="test"]');
        if (tabBtn) {
            tabBtn.addEventListener("click", () => {
                setTimeout(drawMatchConnections, 300);
            });
        }

        const handleCardClick = (e) => {
            const clicked = e.target;
            if (clicked.classList.contains("matched")) return;

            if (!matchHasStarted) {
                matchHasStarted = true;
                matchStartTime = Date.now();
                clearInterval(matchTimerInterval);
                matchTimerInterval = setInterval(() => {
                    const elapsed = Math.round((Date.now() - matchStartTime) / 1000);
                    if (timerVal) timerVal.textContent = `${elapsed}s`;
                }, 1000);
            }

            playChime("click");

            if (selectedMatchCard) {
                if (selectedMatchCard === clicked) {
                    selectedMatchCard.classList.remove("selected");
                    selectedMatchCard = null;
                    return;
                }

                const sameType = selectedMatchCard.dataset.type === clicked.dataset.type;
                if (sameType) {
                    selectedMatchCard.classList.remove("selected");
                    selectedMatchCard = clicked;
                    clicked.classList.add("selected");
                } else {
                    if (selectedMatchCard.dataset.id === clicked.dataset.id) {
                        selectedMatchCard.classList.remove("selected");
                        selectedMatchCard.classList.add("matched");
                        clicked.classList.add("matched");
                        
                        matchStreak++;
                        
                        playChime("match");
                        matchScoreValue += 25 + (matchStreak - 1) * 5;
                        if (scoreVal) scoreVal.textContent = matchScoreValue;
                        totalMatchesFound++;

                        drawMatchConnections();
                        triggerComboPopup(clicked, matchStreak);

                        selectedMatchCard = null;

                        if (totalMatchesFound === cardsToUse.length) {
                            clearInterval(matchTimerInterval);
                            const duration = Math.round((Date.now() - matchStartTime) / 1000);
                            
                            const lastHighScore = parseInt(localStorage.getItem(hsKey)) || 0;
                            let hsText = "";
                            if (matchScoreValue > lastHighScore) {
                                localStorage.setItem(hsKey, matchScoreValue);
                                if (highScoreVal) highScoreVal.textContent = `${matchScoreValue}`;
                                hsText = " 🏆 Skor Terbaik Baru!";
                            }

                            setTimeout(() => {
                                col1.style.display = "none";
                                col2.style.display = "none";
                                if (victoryMsg) {
                                    if (victoryText) {
                                        victoryText.innerHTML = `Anda menjodohkan semua dialek daerah dengan sukses!<br><strong>Skor Akhir:</strong> ${matchScoreValue} poin<br><strong>Waktu:</strong> ${duration} detik.${hsText}`;
                                    }
                                    victoryMsg.style.display = "block";
                                }
                                playChime("success");
                                games.addXP?.(40);
                                games.triggerConfetti?.();
                            }, 500);
                        }
                    } else {
                        const card1 = selectedMatchCard;
                        const card2 = clicked;
                        card1.classList.remove("selected");
                        card1.classList.add("match-error");
                        card2.classList.add("match-error");
                        
                        matchStreak = 0;
                        selectedMatchCard = null;
                        playChime("error");
                        matchScoreValue = Math.max(0, matchScoreValue - 5);
                        if (scoreVal) scoreVal.textContent = matchScoreValue;

                        setTimeout(() => {
                            card1.classList.remove("match-error");
                            card2.classList.remove("match-error");
                        }, 800);
                    }
                }
            } else {
                selectedMatchCard = clicked;
                clicked.classList.add("selected");
            }
        };

        col1.querySelectorAll(".match-card").forEach(c => c.addEventListener("click", handleCardClick));
        col2.querySelectorAll(".match-card").forEach(c => c.addEventListener("click", handleCardClick));

        if (restartBtn) {
            restartBtn.onclick = () => {
                playChime("click");
                initMatchingGame();
            };
        }
    }

    // 17. Cultural Profile Card Generator
    function initCardGenerator() {
        const btn = document.getElementById("genProfileCardBtn");
        if (!btn) return;

        btn.addEventListener("click", () => {
            playChime("success");
            const progress = core.getProgress();
            const totalXp = games.calculateTotalXP?.(progress) || progress.reviewed * 10;
            const lvlInfo = games.getLevelInfo?.(totalXp) || { level: 1, title: "Penjelajah Pemula" };

            const canvas = document.createElement("canvas");
            canvas.width = 650;
            canvas.height = 380;
            const ctx = canvas.getContext("2d");

            const grad = ctx.createLinearGradient(0, 0, 650, 380);
            grad.addColorStop(0, "#1c1105");
            grad.addColorStop(1, "#0d0a1b");
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, 650, 380);

            ctx.strokeStyle = "rgba(255, 215, 0, 0.035)";
            ctx.lineWidth = 1;
            for (let i = 0; i < 650; i += 40) {
                ctx.beginPath();
                ctx.arc(i, 190, 80, 0, Math.PI * 2);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(i, 190, 40, 0, Math.PI * 2);
                ctx.stroke();
            }

            ctx.strokeStyle = "#ffd700";
            ctx.lineWidth = 2;
            ctx.strokeRect(15, 15, 620, 350);
            
            ctx.fillStyle = "#ffd700";
            ctx.fillRect(10, 10, 25, 5);
            ctx.fillRect(10, 10, 5, 25);
            ctx.fillRect(615, 10, 25, 5);
            ctx.fillRect(635, 10, 5, 25);
            ctx.fillRect(10, 365, 25, 5);
            ctx.fillRect(10, 345, 5, 25);
            ctx.fillRect(615, 365, 25, 5);
            ctx.fillRect(635, 345, 5, 25);

            ctx.fillStyle = "#ffd700";
            ctx.font = "bold 13px Inter, monospace";
            ctx.fillText("REPUBLIK INDONESIA", 50, 45);
            ctx.font = "bold 16px Outfit, sans-serif";
            ctx.fillText("BOARDING PASS & PASSPORT BUDAYA", 50, 65);

            ctx.strokeStyle = "rgba(255, 215, 0, 0.2)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(50, 80);
            ctx.lineTo(600, 80);
            ctx.stroke();

            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 32px Outfit, sans-serif";
            ctx.fillText(place.label.toUpperCase(), 50, 130);

            ctx.fillStyle = "rgba(255,255,255,0.7)";
            ctx.font = "14px Inter, sans-serif";
            ctx.fillText(`Kategori Rute: ${place.region}`, 50, 155);

            const fields = [
                { label: "NAMA PENJELAJAH", val: "USER EDUQUEST" },
                { label: "KASTA LEVEL", val: `LEVEL ${lvlInfo.level} - ${lvlInfo.title.toUpperCase()}` },
                { label: "PENGALAMAN (XP)", val: `${totalXp} XP` },
                { label: "STATUS EKSPLORASI", val: `${progress.explored ? "SELESAI (PASSED)" : "DALAM AKTIVITAS"}` }
            ];

            let yOffset = 195;
            fields.forEach(f => {
                ctx.font = "bold 10px monospace";
                ctx.fillStyle = "rgba(255, 215, 0, 0.6)";
                ctx.fillText(f.label, 50, yOffset);
                ctx.font = "16px Inter, sans-serif";
                ctx.fillStyle = "#ffffff";
                ctx.fillText(f.val, 50, yOffset + 20);
                yOffset += 40;
            });

            ctx.save();
            ctx.translate(450, 180);
            ctx.rotate(-0.15);

            ctx.strokeStyle = "rgba(244, 67, 54, 0.65)";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, 50, 0, 2 * Math.PI);
            ctx.stroke();

            ctx.lineWidth = 1;
            ctx.strokeStyle = "rgba(244, 67, 54, 0.5)";
            ctx.setLineDash([4, 2]);
            ctx.beginPath();
            ctx.arc(0, 0, 44, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.fillStyle = "rgba(244, 67, 54, 0.75)";
            ctx.font = "bold 9px Inter, sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("WONDERFUL INDONESIA", 0, -22);
            ctx.font = "bold 14px monospace";
            ctx.fillText("PASSED", 0, 5);
            ctx.font = "bold 8px Inter, sans-serif";
            ctx.fillText("EDUQUEST DEPT", 0, 26);
            ctx.restore();

            ctx.fillStyle = "#ffffff";
            ctx.fillRect(400, 280, 200, 50);
            
            ctx.fillStyle = "#000000";
            let barcodeX = 410;
            const barcodeWeights = [2, 1, 4, 1, 2, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 2, 1, 2, 3, 1, 2, 1, 4];
            barcodeWeights.forEach(w => {
                ctx.fillRect(barcodeX, 285, w, 35);
                barcodeX += w + 2;
            });
            ctx.fillStyle = "#000000";
            ctx.font = "bold 9px monospace";
            ctx.textAlign = "center";
            ctx.fillText(`*EQ-${place.id.toUpperCase()}-${lvlInfo.level}*`, 500, 327);

            const link = document.createElement("a");
            link.download = `passport-budaya-${place.id}.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
            core.showToast("Passport Budaya berhasil diekspor!");
        });
    }

    // 18. Dynamic Quest Checklist
    function initQuests() {
        const container = document.getElementById("questChecklist");
        if (!container) return;

        const quests = [
            { id: "read_folklore", text: "Baca Legenda Rakyat daerah ini", done: false },
            { id: "solve_quiz", text: "Selesaikan 1 kuis mandiri", done: false },
            { id: "phrase_match", text: "Teka-teki Cocok Kata sempurna", done: false }
        ];

        // Load quest statuses from session/local storage
        const storageKey = `quests_${place.id}_${new Date().toDateString()}`;
        let localQuests = JSON.parse(localStorage.getItem(storageKey)) || quests;

        function renderQuests() {
            container.innerHTML = localQuests.map((q, idx) => `
                <div style="display:flex; align-items:center; gap:12px; margin-bottom:10px;">
                    <input type="checkbox" id="quest-${q.id}" ${q.done ? "checked" : ""} style="width:20px;height:20px;accent-color:var(--region-accent); cursor:pointer;">
                    <label for="quest-${q.id}" style="color:${q.done ? '#888' : 'var(--detail-text)'}; text-decoration:${q.done ? 'line-through' : 'none'}; cursor:pointer; font-size:0.9rem;">
                        ${q.text}
                    </label>
                </div>
            `).join("");

            // Add events
            container.querySelectorAll("input").forEach((checkbox, idx) => {
                checkbox.addEventListener("change", (e) => {
                    localQuests[idx].done = e.target.checked;
                    localStorage.setItem(storageKey, JSON.stringify(localQuests));
                    if (e.target.checked) {
                        playChime("success");
                        games.addXP?.(10);
                        core.showToast("Misi Selesai! +10 XP");
                    }
                    renderQuests();
                });
            });
        }
        renderQuests();
    }

    // 19. Radial XP Progress Ring & 20. Streak Flame
    function drawProgressMetrics() {
        const ring = document.querySelector(".progress-ring-circle");
        const levelText = document.querySelector(".xp-level-text");
        const flameText = document.getElementById("streakFlameValue");

        if (ring) {
            const progress = core.getProgress();
            const totalXp = games.calculateTotalXP?.(progress) || (progress.reviewed * 10);
            const lvlInfo = games.getLevelInfo?.(totalXp) || { level: 1, title: "Penjelajah" };
            
            // Circle calculations
            const radius = 40;
            const circumference = 2 * Math.PI * radius;
            ring.style.strokeDasharray = `${circumference} ${circumference}`;

            // Calculate percentage of level progress
            const levelBaseXp = (lvlInfo.level - 1) * 100;
            const progressInLevel = totalXp - levelBaseXp;
            const pct = Math.min(Math.max(progressInLevel / 100, 0), 1);
            const offset = circumference - (pct * circumference);
            ring.style.strokeDashoffset = offset;

            if (levelText) levelText.textContent = `Lvl ${lvlInfo.level}`;
        }

        if (flameText) {
            const progress = core.getProgress();
            flameText.textContent = `${progress.streak || 1} Hari`;
        }
    }

    function initTriviaSpinner() {
        const canvas = document.getElementById("triviaWheelCanvas");
        const spinBtn = document.getElementById("spinTriviaBtn");
        const factsText = document.getElementById("triviaFactOutput");

        if (!canvas || !spinBtn || !factsText) return;

        const ctx = canvas.getContext("2d");
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const radius = canvas.width / 2 - 10;
        const numSlices = 8;
        const sliceAngle = (2 * Math.PI) / numSlices;

        const categories = [
            "Kuliner Khas",
            "Destinasi",
            "Tradisi Adat",
            "Aksara Lokal",
            "Alat Musik",
            "Busana Adat",
            "Legenda",
            "Fakta Unik"
        ];

        const colors = [
            "#e91e63", "#9c27b0", "#673ab7", "#3f51b5",
            "#009688", "#4caf50", "#ff9800", "#ff5722"
        ];

        let theta = 0;
        let isSpinning = false;
        let omega = 0;
        const friction = 0.982;
        let animationId = null;

        function drawWheel() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.shadowBlur = 10;
            ctx.shadowColor = "rgba(0, 0, 0, 0.5)";

            for (let i = 0; i < numSlices; i++) {
                const angle = i * sliceAngle + theta;
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.arc(cx, cy, radius, angle, angle + sliceAngle);
                ctx.closePath();

                const sliceGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, radius);
                sliceGrad.addColorStop(0, "#151525");
                sliceGrad.addColorStop(1, colors[i]);
                
                ctx.fillStyle = sliceGrad;
                ctx.fill();
                ctx.strokeStyle = "rgba(255,255,255,0.15)";
                ctx.lineWidth = 1.5;
                ctx.stroke();

                ctx.save();
                ctx.translate(cx, cy);
                ctx.rotate(angle + sliceAngle / 2);
                ctx.textAlign = "right";
                ctx.textBaseline = "middle";
                ctx.fillStyle = "#ffffff";
                ctx.font = "bold 9px Inter, sans-serif";
                
                ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
                ctx.shadowBlur = 4;
                
                ctx.fillText(categories[i], radius - 15, 0);
                ctx.restore();
            }

            ctx.shadowBlur = 0;
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
            ctx.strokeStyle = "#ffd700";
            ctx.lineWidth = 3;
            ctx.stroke();

            for (let i = 0; i < numSlices; i++) {
                const angle = i * sliceAngle + theta;
                const pegX = cx + radius * Math.cos(angle);
                const pegY = cy + radius * Math.sin(angle);

                ctx.beginPath();
                ctx.arc(pegX, pegY, 3, 0, 2 * Math.PI);
                ctx.fillStyle = "#ffd700";
                ctx.shadowColor = "rgba(255,215,0,0.6)";
                ctx.shadowBlur = 6;
                ctx.fill();
            }

            ctx.shadowBlur = 8;
            ctx.shadowColor = "rgba(0,0,0,0.5)";
            
            ctx.beginPath();
            ctx.arc(cx, cy, 18, 0, 2 * Math.PI);
            ctx.fillStyle = "#ffd700";
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(cx, cy, 14, 0, 2 * Math.PI);
            const pinGrad = ctx.createLinearGradient(cx - 10, cy - 10, cx + 10, cy + 10);
            pinGrad.addColorStop(0, "#ffffff");
            pinGrad.addColorStop(1, "#ffd700");
            ctx.fillStyle = pinGrad;
            ctx.fill();

            ctx.shadowBlur = 4;
            ctx.shadowColor = "rgba(0,0,0,0.3)";
            ctx.fillStyle = "#ffffff";
            ctx.strokeStyle = "#ff3d00";
            ctx.lineWidth = 2;
            
            ctx.beginPath();
            ctx.moveTo(cx - 10, 8);
            ctx.lineTo(cx + 10, 8);
            ctx.lineTo(cx, 22);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }

        function spinUpdate() {
            theta += omega;
            omega *= friction;

            const oldIdx = Math.floor((theta - Math.PI / 2) / sliceAngle);
            const newIdx = Math.floor((theta + omega - Math.PI / 2) / sliceAngle);
            if (newIdx !== oldIdx) {
                try {
                    playChime("click");
                } catch(e){}
            }

            drawWheel();

            if (omega > 0.002) {
                animationId = requestAnimationFrame(spinUpdate);
            } else {
                isSpinning = false;
                omega = 0;
                spinBtn.disabled = false;
                cancelAnimationFrame(animationId);

                let normalizedAngle = (-Math.PI / 2 - theta) % (2 * Math.PI);
                if (normalizedAngle < 0) normalizedAngle += 2 * Math.PI;
                const winIndex = Math.floor(normalizedAngle / sliceAngle) % numSlices;
                
                const category = categories[winIndex];
                let factDetail = "";

                switch(winIndex) {
                    case 0:
                        factDetail = place.food ? `Kelezatan utama: <strong>${place.food[0]}</strong>. ${place.food[1]}` : `Cita rasa rempah khas daerah ${place.label} sangat kaya.`;
                        break;
                    case 1:
                        factDetail = place.destination ? `Destinasi indah: <strong>${place.destination[0]}</strong>. ${place.destination[1]}` : `Keindahan alam dan sejarah yang memikat hati.`;
                        break;
                    case 2:
                        factDetail = place.tradition ? `Upacara adat: <strong>${place.tradition[0]}</strong>. ${place.tradition[1]}` : `Tradisi turun-temurun menjaga keluhuran suku.`;
                        break;
                    case 3:
                        const hasAksara = ["jawa", "madura", "bali", "batak"].includes(place.id);
                        factDetail = hasAksara 
                            ? `Daerah ${place.label} memiliki tradisi penulisan naskah kuno luhur menggunakan aksara lokal.` 
                            : `Daerah ${place.label} kaya akan tradisi tutur lisan, pepatah adat luhur, dan sastra daerah yang indah.`;
                        break;
                    case 4:
                        factDetail = `Alat musik tradisional daerah beresonansi dengan harmoni alam dan tangga nada pentatonik.`;
                        break;
                    case 5:
                        factDetail = `Busana adat dihiasi tenunan benang emas, perhiasan logam mulia, dan mahkota kepala yang megah.`;
                        break;
                    case 6:
                        factDetail = `Kisah dongeng rakyat memuat pesan budi pekerti, kepahlawanan, dan asal-usul alam setempat.`;
                        break;
                    case 7:
                    default:
                        factDetail = place.fact || `Wilayah yang makmur dengan keberagaman budaya dan seni.`;
                        break;
                }

                factsText.innerHTML = `
                    <div style="animation: tab-fade-in 0.4s ease-out; color:#ffd700; background: rgba(255,215,0,0.06); padding: 12px; border-radius: 10px; border: 1px solid rgba(255,215,0,0.25);">
                        <span style="font-size: 0.8rem; text-transform: uppercase; color: var(--detail-muted); display: block; margin-bottom: 4px;">Kategori: ${category}</span>
                        <strong><i class="fa-solid fa-lightbulb"></i> Fakta Didapat:</strong> <br>
                        <span style="color: white; font-size: 0.9rem; line-height: 1.5; display: inline-block; margin-top: 5px;">${factDetail}</span>
                    </div>
                `;
                playChime("success");
                games.addXP?.(10);
            }
        }

        spinBtn.addEventListener("click", () => {
            if (isSpinning) return;
            isSpinning = true;
            spinBtn.disabled = true;
            factsText.innerHTML = `<span class="muted"><i class="fa-solid fa-spinner fa-spin"></i> Roda trivia berputar cepat...</span>`;
            
            omega = 0.4 + Math.random() * 0.3;
            spinUpdate();
        });

        canvas.addEventListener("click", () => {
            if (!isSpinning) spinBtn.click();
        });

        drawWheel();
    }

    // 27. AI Mascot Chatbot (BUBUB) - Smart NLP Intent Matching & Suggestion Chips
    function getBububResponse(input, activePlace) {
        const val = input.toLowerCase().trim();
        
        // Emojis for expressions
        const happy = "🦉✨";
        const think = "🦉🤔";
        const excited = "🦉🔥";
        const waving = "🦉👋";

        const hasAksara = ["jawa", "madura", "bali", "batak"].includes(activePlace.id);

        // Simple Tokenization & intent weights
        let intent = "default";
        if (val.includes("halo") || val.includes("hai") || val.includes("pagi") || val.includes("siang")) intent = "salam";
        else if (val.includes("makan") || val.includes("kuliner") || val.includes("resep") || val.includes("soto") || val.includes("gudeg") || val.includes("lauk") || val.includes("seblak") || val.includes("arsik")) intent = "kuliner";
        else if (val.includes("wisata") || val.includes("destinasi") || val.includes("jalan") || val.includes("borobudur") || val.includes("toba") || val.includes("sentani") || val.includes("pantai")) intent = "destinasi";
        else if (val.includes("adat") || val.includes("tradisi") || val.includes("budaya") || val.includes("tari") || val.includes("saman") || val.includes("kecak") || val.includes("wayang")) intent = "tradisi";
        else if (val.includes("tulis") || val.includes("aksara") || val.includes("huruf") || val.includes("ketik") || val.includes("keyboard")) intent = "aksara";
        else if (val.includes("fakta") || val.includes("unik") || val.includes("fakta cepat") || val.includes("tahu")) intent = "fakta";
        
        switch (intent) {
            case "salam":
                const aksaraText = hasAksara ? ", atau menulis aksara lokal di sini!" : ", atau tradisi budaya uniknya!";
                return `${waving} Halo sahabat budaya! Aku BUBUB, pemandu perjalanan budayamu di **${activePlace.label}**. Kamu bisa tanya tentang kuliner lezat, wisata eksotis${aksaraText} Ada yang mau ditanyakan?`;
            case "kuliner":
                return `${excited} Hmm nyamm! Kuliner khas daerah **${activePlace.label}** yang sangat ikonik adalah **${activePlace.food[0]}**. ${activePlace.food[1]} Cita rasanya benar-benar unik dan kaya akan rempah tradisional!`;
            case "destinasi":
                return `${happy} Wah, kamu harus banget berkunjung ke **${activePlace.destination[0]}** di daerah ${activePlace.label}! Tempat wisata ini terkenal karena ${activePlace.destination[1]}. Sungguh keindahan Indonesia yang tiada duanya! ✈️`;
            case "tradisi":
                return `${happy} Tradisi luhur yang melekat kuat di daerah **${activePlace.label}** adalah **${activePlace.tradition[0]}**. Kesenian ini yaitu ${activePlace.tradition[1]} Penuh dengan nilai moral yang diajarkan leluhur!`;
            case "aksara":
                if (hasAksara) {
                    return `${think} Aksara di wilayah ini adalah warisan peradaban yang berharga! Kamu bisa mencoba mengetiknya secara interaktif menggunakan widget **Simulator Keyboard Aksara** di tab Eksplorasi Budaya halaman ini. Sangat menyenangkan lho!`;
                } else {
                    return `${think} Untuk daerah **${activePlace.label}**, fitur simulator aksara tidak tersedia karena kami berfokus pada dialek lisan dan frasa harian khasnya. Coba tanyakan tentang kuliner, destinasi wisata, atau tradisi daerah ya!`;
                }
            case "fakta":
                return `${excited} Oh ya! Tahukah kamu fakta unik ini? ${activePlace.fact} Menarik sekali kan keunikan budaya di **${activePlace.label}**?`;
            default:
                return `${think} Wah, pertanyaanmu menarik sekali! Kebudayaan daerah **${activePlace.label}** memang tiada habisnya untuk dieksplorasi. Coba tanyakan spesifik tentang kuliner, destinasi wisata, atau tradisi daerah ya!`;
        }
    }

    function initBububChatbot() {
        const input = document.getElementById("bububChatInput");
        const sendBtn = document.getElementById("bububSendBtn");
        const messages = document.getElementById("bububMessages");
        const cardContainer = document.querySelector(".bubub-bot-card");

        if (!input || !sendBtn || !messages) return;

        // Render suggestion chips dynamically below input
        let chipsDiv = document.querySelector(".chat-suggestions-container");
        if (!chipsDiv) {
            chipsDiv = document.createElement("div");
            chipsDiv.className = "chat-suggestions-container";
            cardContainer.appendChild(chipsDiv);
        }

        const chips = [
            { label: "🍛 Kuliner Khas", text: "Apa kuliner khas daerah ini?" },
            { label: "🏝️ Wisata Terkenal", text: "Rekomendasi destinasi wisata di sini?" },
            { label: "🎭 Tradisi & Tari", text: "Apa tradisi budaya adat di daerah ini?" },
            { label: "💡 Fakta Unik", text: "Berikan fakta unik daerah ini" }
        ];

        chipsDiv.innerHTML = chips.map(c => `
            <button class="chat-suggestion-chip">${c.label}</button>
        `).join("");

        chipsDiv.querySelectorAll(".chat-suggestion-chip").forEach((chip, i) => {
            chip.addEventListener("click", () => {
                input.value = chips[i].text;
                handleSend();
            });
        });

        const addMessage = (text, sender) => {
            const bubble = document.createElement("div");
            bubble.classList.add("chat-bubble", sender);
            
            // Allow markdown bold formatting in chat bubble
            const formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            bubble.innerHTML = formattedText;
            
            messages.appendChild(bubble);
            messages.scrollTop = messages.scrollHeight;
        };

        const handleSend = () => {
            const rawVal = input.value.trim();
            if (!rawVal) return;

            addMessage(rawVal, "user");
            input.value = "";
            playChime("click");

            // BUBUB typing/thinking animation state
            const thinkingBubble = document.createElement("div");
            thinkingBubble.classList.add("chat-bubble", "bot");
            thinkingBubble.innerHTML = `<i class="fa-solid fa-ellipsis fa-bounce"></i> BUBUB sedang mengetik...`;
            messages.appendChild(thinkingBubble);
            messages.scrollTop = messages.scrollHeight;

            setTimeout(() => {
                thinkingBubble.remove();
                const reply = getBububResponse(rawVal, place);
                addMessage(reply, "bot");
                playChime("success");
            }, 650);
        };

        sendBtn.onclick = handleSend;
        input.onkeydown = (e) => {
            if (e.key === "Enter") handleSend();
        };
    }

    // Pro Workspaces, Debounced Autosave, Backup Exporter
    function initProFeatures() {
        const isPro = localStorage.getItem("eduquestSubscription") === "pro";
        
        const planInput = document.getElementById("studyPlannerDate");
        const noteArea = document.getElementById("privateNotesArea");
        const exportBtn = document.getElementById("exportSummaryBtn");
        const notesSaveStatus = document.getElementById("notesSaveStatus");

        // Load & Setup Notes Autosave with Debounce
        let saveTimeout = null;
        if (noteArea && notesSaveStatus) {
            noteArea.value = localStorage.getItem(`note_${place.id}`) || "";
            noteArea.addEventListener("input", (e) => {
                if (!isPro) {
                    showPaywall();
                    noteArea.value = "";
                    return;
                }
                notesSaveStatus.innerHTML = `<i class="fa-solid fa-spinner fa-spin" style="color:var(--region-accent); margin-right:4px;"></i> Menyimpan perubahan...`;
                notesSaveStatus.className = "muted pulsing-status";
                
                clearTimeout(saveTimeout);
                saveTimeout = setTimeout(() => {
                    localStorage.setItem(`note_${place.id}`, e.target.value);
                    notesSaveStatus.innerHTML = `<i class="fa-solid fa-circle-check" style="color:#4caf50; margin-right:4px;"></i> Catatan tersimpan`;
                    notesSaveStatus.className = "muted";
                }, 600);
            });
        }

        // Study Planner Reminder and Alerts
        const plannerReminderCard = document.getElementById("plannerReminderCard");
        const plannerReminderText = document.getElementById("plannerReminderText");

        function updatePlannerReminder() {
            if (!planInput || !plannerReminderCard || !plannerReminderText) return;
            const dateStr = localStorage.getItem(`plan_${place.id}`);
            if (dateStr) {
                const planDate = new Date(dateStr);
                const today = new Date();
                planDate.setHours(0,0,0,0);
                today.setHours(0,0,0,0);
                
                const diffTime = planDate.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                let text = "";
                if (diffDays === 0) {
                    text = `📅 <strong>Hari Ini!</strong> Jadwal belajar daerah ${place.label} adalah hari ini. Mari tuntaskan misi harian Anda!`;
                    plannerReminderCard.style.background = "rgba(76, 175, 80, 0.12)";
                    plannerReminderCard.style.borderColor = "#4caf50";
                } else if (diffDays > 0) {
                    text = `📅 Rencana belajar daerah ${place.label} dijadwalkan dalam <strong>${diffDays} hari lagi</strong> (${dateStr}).`;
                    plannerReminderCard.style.background = "var(--region-accent-glow)";
                    plannerReminderCard.style.borderColor = "var(--region-accent)";
                } else {
                    text = `📅 Rencana belajar terlewat pada tanggal <strong>${dateStr}</strong>. Pilih tanggal baru untuk menjadwalkan ulang.`;
                    plannerReminderCard.style.background = "rgba(244, 67, 54, 0.1)";
                    plannerReminderCard.style.borderColor = "#f44336";
                }
                
                plannerReminderText.innerHTML = text;
                plannerReminderCard.style.display = "block";
            } else {
                plannerReminderCard.style.display = "none";
            }
        }

        if (planInput) {
            planInput.value = localStorage.getItem(`plan_${place.id}`) || "";
            updatePlannerReminder();
            planInput.addEventListener("change", (e) => {
                if (!isPro) {
                    showPaywall();
                    planInput.value = "";
                    return;
                }
                localStorage.setItem(`plan_${place.id}`, e.target.value);
                core.showToast("Jadwal rencana belajar tersimpan.");
                updatePlannerReminder();
            });
        }

        if (exportBtn) {
            exportBtn.onclick = () => {
                if (!isPro) {
                    showPaywall();
                    return;
                }
                const content = `
STUDY SUMMARY: ${place.label}
Region: ${place.region}
Destinasi: ${place.destination[0]} - ${place.destination[1]}
Kuliner: ${place.food[0]} - ${place.food[1]}
Catatan Pribadi:
${localStorage.getItem(`note_${place.id}`) || "Tidak ada catatan."}
                `;
                const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `summary-${place.id}.txt`;
                a.click();
            };
        }

        // Export Full Pro Progress Backup
        const exportBackupBtn = document.getElementById("exportBackupBtn");
        if (exportBackupBtn) {
            exportBackupBtn.onclick = () => {
                if (!isPro) {
                    showPaywall();
                    return;
                }
                const progress = core.getProgress();
                const backupData = {
                    reviewed: progress.reviewed,
                    correct: progress.correct,
                    explored: progress.explored,
                    quizDone: progress.quizDone,
                    favorites: progress.favorites,
                    mastered: progress.mastered,
                    streak: progress.streak,
                    lastActiveDay: progress.lastActiveDay,
                    notes: {},
                    plans: {}
                };
                
                // Backup notes and plans for all regions
                const allPlaces = window.WonderfulData?.places || [];
                allPlaces.forEach(p => {
                    const note = localStorage.getItem(`note_${p.id}`);
                    if (note) backupData.notes[p.id] = note;
                    
                    const plan = localStorage.getItem(`plan_${p.id}`);
                    if (plan) backupData.plans[p.id] = plan;
                });

                const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json;charset=utf-8" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `wonderful-indonesia-backup-${new Date().toISOString().slice(0,10)}.json`;
                a.click();
                core.showToast("Cadangan progres belajar berhasil diekspor!");
            };
        }

        // Import Full Pro Progress Backup
        const importInput = document.getElementById("importPeerInput");
        if (importInput) {
            importInput.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const parsed = JSON.parse(event.target.result);
                        if (parsed.reviewed !== undefined) {
                            core.saveProgress({
                                reviewed: parsed.reviewed,
                                correct: parsed.correct,
                                explored: parsed.explored,
                                quizDone: parsed.quizDone,
                                favorites: parsed.favorites,
                                mastered: parsed.mastered,
                                streak: parsed.streak || 1,
                                lastActiveDay: parsed.lastActiveDay || ""
                            });

                            if (parsed.notes) {
                                Object.keys(parsed.notes).forEach(k => {
                                    localStorage.setItem(`note_${k}`, parsed.notes[k]);
                                });
                            }
                            if (parsed.plans) {
                                Object.keys(parsed.plans).forEach(k => {
                                    localStorage.setItem(`plan_${k}`, parsed.plans[k]);
                                });
                            }

                            core.showToast("Progres & catatan berhasil diimpor!");
                            drawProgressMetrics();
                            
                            if (noteArea) noteArea.value = localStorage.getItem(`note_${place.id}`) || "";
                            if (planInput) planInput.value = localStorage.getItem(`plan_${place.id}`) || "";
                            updatePlannerReminder();
                            initQuests();
                        } else {
                            core.showToast("Format file cadangan tidak valid.");
                        }
                    } catch(err) {
                        core.showToast("Gagal memparsing file progres.");
                    }
                };
                reader.readAsText(file);
            };
        }
    }

    function showPaywall() {
        const modal = document.getElementById("proPaywall");
        if (modal) {
            modal.classList.add("active");
        }
    }

    window.closePaywall = () => {
        const modal = document.getElementById("proPaywall");
        if (modal) modal.classList.remove("active");
    };

    window.activateProMock = () => {
        localStorage.setItem("eduquestSubscription", "pro");
        window.closePaywall();
        core.showToast("Fitur PRO aktif! Selamat menikmati.");
        initProFeatures();
    };

    // 28. HOTS & Regular Quiz Widget with Streaks and retry
    const hotsQuizQuestions = {
        jawa: {
            q: "Bagaimana kearifan lokal sistem pranata mangsa memandu ketahanan agraris di pedalaman Jawa?",
            answers: [
                "Menyelaraskan siklus tanam dengan indikator rasi bintang Bintang Waluku dan siklus alam sekitar.",
                "Mengandalkan ramalan musiman modern dari satelit cuaca asing.",
                "Melarang penanaman padi di luar bulan purnama penuh.",
                "Hanya menanam tebu di dataran tinggi."
            ],
            correct: 0
        },
        sunda: {
            q: "Bagaimana filosofi kemasyarakatan Sunda 'Silih Asih, Silih Asah, Silih Asuh' diwujudkan dalam kehidupan gotong royong warga?",
            answers: [
                "Saling mengasihi, saling mendidik/menajamkan pikiran, dan saling melindungi dalam ikatan kekeluargaan.",
                "Melarang perdagangan dengan suku luar wilayah pegunungan.",
                "Menyerahkan seluruh keputusan kampung kepada tetua tanpa musyawarah.",
                "Hanya membantu kerabat dekat yang memiliki ikatan darah."
            ],
            correct: 0
        },
        bali: {
            q: "Bagaimana filosofi Tri Hita Karana diterapkan oleh masyarakat adat Bali untuk menjaga keseimbangan hidup?",
            answers: [
                "Menyelaraskan hubungan harmonis manusia dengan Tuhan, sesama manusia, dan alam lingkungan sekitar.",
                "Memusatkan seluruh aktivitas harian pada sektor pariwisata pantai.",
                "Melarang penggunaan teknologi modern di seluruh wilayah pura.",
                "Hanya beribadah saat perayaan Nyepi berlangsung."
            ],
            correct: 0
        },
        minang: {
            q: "Bagaimana sistem kekerabatan matrilineal di Minangkabau mempengaruhi kepemilikan harta pusaka tinggi?",
            answers: [
                "Harta warisan leluhur diturunkan dan dikelola oleh garis keturunan perempuan demi menjaga martabat keluarga.",
                "Harta pusaka langsung dijual dan dibagikan rata kepada seluruh anak laki-laki.",
                "Seluruh harta diserahkan kepada pihak keraton atau pemerintah setempat.",
                "Kepemilikan ditentukan berdasarkan siapa yang merantau paling jauh."
            ],
            correct: 0
        },
        batak: {
            q: "Apa peran sosial kain tenun Ulos dalam upacara adat perkawinan atau pemakaman masyarakat Batak?",
            answers: [
                "Sebagai media penyalur restu, kehangatan kasih sayang, dan pengikat kekerabatan antarkeluarga marga.",
                "Hanya digunakan sebagai komoditas transaksi dagang bernilai tinggi.",
                "Berfungsi sebagai tanda pengenal kasta sosial tertinggi dalam marga saja.",
                "Sebagai pakaian sehari-hari untuk bekerja di ladang."
            ],
            correct: 0
        },
        aceh: {
            q: "Bagaimana integrasi nilai spiritual dan kearifan ekologis tampak pada arsitektur bebas gempa di wilayah pesisir utara Sumatra?",
            answers: [
                "Melalui penggunaan struktur pasak kayu fleksibel tanpa paku besi guna menyerap getaran gempa bumi.",
                "Hanya menggunakan beton bertulang tebal agar tahan terjangan tsunami.",
                "Pola rumah panggung rendah agar mudah dibongkar pasang warga lokal.",
                "Mengikuti petunjuk arah angin khatulistiwa saja."
            ],
            correct: 0
        },
        betawi: {
            q: "Bagaimana seni boneka Ondel-ondel mengalami pergeseran makna dari fungsi tolak bala kuno menjadi fungsi hiburan perkotaan?",
            answers: [
                "Menyesuaikan dengan dinamika masyarakat urban Jakarta sebagai ikon kesenian rakyat dalam pesta kebudayaan.",
                "Dilarang tampil di ruang publik dan hanya boleh disimpan di museum sejarah.",
                "Dianggap sebagai sarana ritual mistik murni yang tidak boleh dimodifikasi.",
                "Mengganti seluruh bahan kayu pembuatannya dengan serat plastik modern."
            ],
            correct: 0
        },
        dayak: {
            q: "Bagaimana arsitektur Rumah Betang mencerminkan filosofi kehidupan komunal dan kerukunan suku Dayak di Kalimantan?",
            answers: [
                "Menyatukan puluhan keluarga dalam satu atap untuk memupuk gotong royong, toleransi, dan pertahanan bersama.",
                "Melarang interaksi dengan masyarakat di luar Rumah Betang.",
                "Membatasi kepemilikan pribadi secara ekstrem hingga tidak memiliki ruang privasi.",
                "Dibuat tinggi agar terhindar dari kontak sosial dengan suku tetangga."
            ],
            correct: 0
        },
        banjar: {
            q: "Bagaimana kehidupan sungai di Banjarmasin melahirkan kearifan lokal sistem perdagangan Pasar Terapung Lok Baintan?",
            answers: [
                "Mengoptimalkan transportasi air menggunakan perahu klotok dengan sistem barter tradisional yang ramah lingkungan.",
                "Melarang transaksi jual-beli di daratan sekitar kota Banjarmasin.",
                "Menuntut pembangunan dermaga beton raksasa di sepanjang aliran sungai.",
                "Membatasi pedagang luar daerah untuk mengakses Sungai Martapura."
            ],
            correct: 0
        },
        bugis: {
            q: "Bagaimana konsep siri' na pacce memandu etika sosial dan kehormatan diri dalam masyarakat pelaut Bugis?",
            answers: [
                "Menjaga martabat diri dengan konsistensi ucapan serta rasa empati tinggi terhadap penderitaan sesama.",
                "Mengutamakan kepentingan perdagangan rempah di atas keselamatan keluarga.",
                "Melarang anggota suku untuk merantau ke luar pulau Sulawesi.",
                "Mengharuskan penyelesaian konflik hanya dengan kekuatan fisik saja."
            ],
            correct: 0
        },
        madura: {
            q: "Bagaimana tradisi Karapan Sapi merepresentasikan harga diri dan prestise sosial bagi pemilik sapi di Madura?",
            answers: [
                "Sebagai lambang keuletan kerja, perawatan ternak yang optimal, dan pengukuhan status kehormatan keluarga.",
                "Hanya sebagai ajang taruhan materi tanpa nilai kebersamaan adat.",
                "Menunjukkan dominasi wilayah kekuasaan antardesa secara militer.",
                "Sebagai syarat mutlak untuk melangsungkan pernikahan adat."
            ],
            correct: 0
        },
        "papua-provinsi": {
            q: "Bagaimana kerajinan tas tradisional Noken berbahan serat kayu mencerminkan hubungan harmonis masyarakat Papua dengan ekologi hutan?",
            answers: [
                "Noken dibuat dengan teknik merajut serat alami secara lestari tanpa merusak pertumbuhan pohon di hutan.",
                "Hanya boleh dibuat menggunakan mesin tenun modern impor agar lebih cepat.",
                "Digunakan khusus untuk menyimpan senjata tradisional saat upacara adat saja.",
                "Hanya dibuat dari tanaman hias langka yang dilindungi ketat di pegunungan."
            ],
            correct: 0
        },
        "papua-barat": {
            q: "Bagaimana arsitektur Rumah Kaki Seribu (Mod Aki Aksa) suku Arfak beradaptasi dengan kondisi lingkungan pegunungan?",
            answers: [
                "Topangan tiang kayu yang rapat memberikan kestabilan dari gempa serta menghangatkan ruang dalam dari suhu dingin pegunungan.",
                "Dibuat melayang menggunakan tali serat pohon agar terhindar dari air pasang laut.",
                "Menggunakan dinding batu tebal kedap suara agar tidak terdengar suara alam sekitar.",
                "Sengaja dibuat rendah agar mudah tertimbun salju saat musim dingin."
            ],
            correct: 0
        },
        "papua-selatan": {
            q: "Bagaimana upacara adat pengolahan Sagu Sep mencerminkan kebersamaan dan kemandirian pangan suku Marind?",
            answers: [
                "Memasak sagu bersama dengan tumpukan batu panas melambangkan sinergi komunal dan kedaulatan pangan lokal.",
                "Menolak konsumsi makanan selain gandum hasil impor dari luar wilayah.",
                "Menyerahkan seluruh hasil panen sagu kepada kepala suku tanpa pembagian rata.",
                "Menggunakan bahan bakar minyak bersubsidi untuk memanggang sagu."
            ],
            correct: 0
        },
        "papua-tengah": {
            q: "Apa nilai kebudayaan yang terkandung dalam pembuatan Noken Anggrek yang rumit bagi suku Mee di dataran tinggi?",
            answers: [
                "Melambangkan status kehormatan, ketelatenan tinggi pembuatnya, serta nilai ekonomi kreatif berbasis pelestarian anggrek hutan.",
                "Digunakan sebagai wadah sekali pakai untuk membuang sisa hasil kebun.",
                "Menunjukkan kekuasaan kepemilikan lahan anggrek secara sepihak.",
                "Hanya boleh dipakai oleh laki-laki dewasa saat berburu saja."
            ],
            correct: 0
        },
        "papua-pegunungan": {
            q: "Bagaimana tradisi Upacara Bakar Batu (Kit Oba) berfungsi sebagai resolusi konflik sosial di Lembah Baliem?",
            answers: [
                "Menjadi sarana rekonsiliasi perdamaian komunal dengan makan bersama guna menghapus permusuhan antarkelompok.",
                "Sebagai bentuk unjuk kekuatan militer antarsuku untuk menakuti lawan.",
                "Hanya diselenggarakan untuk menyambut pejabat pemerintahan dari luar Papua.",
                "Melarang konsumsi ubi jalar (hipere) selama prosesi berlangsung."
            ],
            correct: 0
        },
        "papua-barat-daya": {
            q: "Bagaimana hukum adat Sasi di Raja Ampat berkontribusi pada konservasi ekosistem laut global?",
            answers: [
                "Melarang pengambilan biota laut tertentu dalam jangka waktu tertentu guna memberi kesempatan alam memulihkan diri secara alami.",
                "Menutup total seluruh wilayah perairan Raja Ampat dari kunjungan wisatawan asing selamanya.",
                "Mengharuskan penggunaan pukat harimau untuk memaksimalkan hasil tangkapan nelayan.",
                "Menyerahkan pengelolaan terumbu karang sepenuhnya kepada lembaga swasta luar negeri."
            ],
            correct: 0
        },
        sasak: {
            q: "Bagaimana tradisi tahunan Bau Nyale di Lombok melestarikan nilai kerukunan sosial masyarakat Sasak?",
            answers: [
                "Mengumpulkan ribuan warga untuk mencari nyale bersama sebagai wujud kecintaan pada persatuan seperti sosok Putri Mandalika.",
                "Membatasi hak menangkap nyale hanya untuk kalangan bangsawan Sasak saja.",
                "Menjadikan nyale sebagai komoditas ekspor mahal yang memicu persaingan antar-desa.",
                "Melarang wisatawan luar daerah ikut serta dalam prosesi penangkapan."
            ],
            correct: 0
        },
        toraja: {
            q: "Bagaimana ritual upacara pemakaman Rambu Solo' memperkuat solidaritas kekerabatan dan integrasi sosial keluarga Toraja?",
            answers: [
                "Mengharuskan gotong royong dan kontribusi bersama seluruh anggota keluarga besar untuk menghormati leluhur.",
                "Membagikan seluruh tanah warisan kepada tamu undangan yang hadir paling awal.",
                "Mewajibkan pemisahan diri antar-anggota keluarga yang berbeda status sosial selama upacara.",
                "Hanya boleh dihadiri oleh pihak penyelenggara tanpa melibatkan warga desa sekitar."
            ],
            correct: 0
        },
        "melayu-riau": {
            q: "Bagaimana tradisi Pantun Melayu berperan sebagai media diplomasi dan pelestarian etika berbahasa dalam masyarakat adat Riau?",
            answers: [
                "Menggunakan kiasan berima a-b-a-b yang santun untuk menyampaikan nasihat tanpa menyinggung perasaan lawan bicara.",
                "Berfungsi sebagai alat untuk menjatuhkan mental lawan politik secara terbuka.",
                "Melarang penggunaan bahasa daerah lain di lingkungan perkotaan Riau.",
                "Hanya digunakan dalam pertunjukan lawak komedi jalanan saja."
            ],
            correct: 0
        },
        lampung: {
            q: "Apa makna filosofis siger emas yang dikenakan pengantin wanita Lampung dalam kaitannya dengan kepemimpinan daerah?",
            answers: [
                "Melambangkan sembilan sungai utama di Lampung serta keanggunan kepemimpinan wanita yang mengayomi.",
                "Berfungsi sebagai pelindung kepala dari cuaca panas ekstrem pesisir.",
                "Menunjukkan jumlah harta kekayaan pribadi keluarga pengantin pria saja.",
                "Sebagai simbol kepatuhan mutlak tanpa suara kepada adat pepadun."
            ],
            correct: 0
        },
        ambon: {
            q: "Bagaimana sistem adat Pela Gandong di Maluku memelihara kerukunan antar-keyakinan yang berbeda di Ambon?",
            answers: [
                "Mengikat desa-desa berbeda agama dalam sumpah persaudaraan adat untuk saling membantu dan menjaga perdamaian.",
                "Mengharuskan penyatuan seluruh rumah ibadah menjadi satu bangunan bersama.",
                "Melarang diskusi keagamaan di luar upacara adat pela berlangsung.",
                "Menolak kunjungan dari warga kepulauan lain di luar Maluku."
            ],
            correct: 0
        },
        gorontalo: {
            q: "Bagaimana tradisi menyalakan lampu minyak Tumbilotohe menjelang Idul Fitri mempererat hubungan sosial warga Gorontalo?",
            answers: [
                "Mendorong gotong royong warga menghias jalan dan pekarangan dengan cahaya lampu sebagai simbol kegembiraan menyambut hari kemenangan.",
                "Mewajibkan pembayaran pajak lampu minyak khusus kepada pemangku adat.",
                "Melarang penggunaan aliran listrik PLN di seluruh wilayah Gorontalo selama tiga hari.",
                "Hanya boleh dinyalakan oleh keluarga yang memiliki garis keturunan bangsawan Gorontalo."
            ],
            correct: 0
        }
    };

    let isHotsActive = false;
    let quizStreakCount = 0;

    function renderDetailQuiz() {
        const quizQuestion = document.getElementById("detailQuizQuestion");
        const quizAnswers = document.getElementById("detailQuizAnswers");
        const quizStreak = document.getElementById("quizStreak");
        const quizExplanation = document.getElementById("quizExplanation");
        const retryQuizBtn = document.getElementById("retryQuizBtn");

        if (!quizQuestion || !quizAnswers) return;

        let quizData = place.quiz;
        if (isHotsActive) {
            quizData = hotsQuizQuestions[place.id] || hotsQuizQuestions.aceh;
        }

        if (!quizData) return;

        const correctAnswer = quizData.answers[quizData.correct];
        const answers = [...quizData.answers].sort(() => Math.random() - 0.5);

        quizQuestion.textContent = quizData.q;
        quizAnswers.classList.remove("answered");
        if (quizExplanation) {
            quizExplanation.style.display = "none";
            quizExplanation.innerHTML = "";
        }
        if (retryQuizBtn) retryQuizBtn.style.display = "none";

        // Render Combo Streak
        if (quizStreakCount >= 2 && quizStreak) {
            quizStreak.textContent = `🔥 ${quizStreakCount}x Combo Jawaban Benar!`;
            quizStreak.style.display = "block";
        } else if (quizStreak) {
            quizStreak.style.display = "none";
        }

        quizAnswers.innerHTML = answers.map(answer => `<button class="answer-btn">${answer}</button>`).join("");

        quizAnswers.querySelectorAll("button").forEach(button => {
            button.addEventListener("click", () => {
                const progress = core.getProgress();
                progress.reviewed += 1;
                progress.quizDone = (progress.quizDone || 0) + 1;
                quizAnswers.classList.add("answered");

                const isCorrect = button.textContent === correctAnswer;

                if (isCorrect) {
                    progress.correct += 1;
                    button.classList.add("correct");
                    playChime("success");
                    
                    quizStreakCount++;
                    if (quizStreak && quizStreakCount >= 2) {
                        quizStreak.textContent = `🔥 ${quizStreakCount}x Combo Jawaban Benar!`;
                        quizStreak.style.display = "block";
                    }

                    // Show Explanation
                    if (quizExplanation) {
                        quizExplanation.innerHTML = `<strong>Jawaban Benar!</strong> <br> ${place.fact}`;
                        quizExplanation.style.borderLeftColor = "#4caf50";
                        quizExplanation.style.display = "block";
                    }

                    const bonusXp = isHotsActive ? 30 : 20;
                    games.addXP?.(bonusXp);
                    core.showToast(`Luar biasa! Jawaban tepat. +${bonusXp} XP`);
                    games.triggerConfetti?.();
                } else {
                    button.classList.add("wrong");
                    playChime("error");
                    
                    quizStreakCount = 0;
                    if (quizStreak) quizStreak.style.display = "none";

                    // Show Explanation
                    if (quizExplanation) {
                        quizExplanation.innerHTML = `<strong>Kurang tepat.</strong> Jawaban benar adalah <em>${correctAnswer}</em>.<br><br><strong>Konteks Budaya:</strong> ${place.fact}`;
                        quizExplanation.style.borderLeftColor = "#f44336";
                        quizExplanation.style.display = "block";
                    }
                    
                    core.showToast("Jawaban kurang tepat.");
                }

                quizAnswers.querySelectorAll("button").forEach(item => {
                    item.disabled = true;
                    if (item.textContent === correctAnswer) item.classList.add("correct");
                });

                core.saveProgress(progress);
                renderDetailQuizStats();

                if (retryQuizBtn) {
                    retryQuizBtn.style.display = "inline-flex";
                }
            });
        });
    }

    function renderDetailQuizStats() {
        const progress = core.getProgress();
        const accuracy = Math.round((progress.correct / Math.max(progress.reviewed, 1)) * 100);
        const stats = document.getElementById("detailQuizStats");
        if (stats) {
            stats.innerHTML = `
                <strong>${accuracy}% Akurasi</strong>
                <span>${progress.correct}/${progress.reviewed} jawaban benar - ${progress.quizDone || 0} kuis selesai</span>
            `;
        }
    }

    function initQuizWidget() {
        const retryQuizBtn = document.getElementById("retryQuizBtn");
        const toggleBtn = document.getElementById("toggleHotsBtn");

        if (toggleBtn) {
            toggleBtn.onclick = () => {
                isHotsActive = !isHotsActive;
                toggleBtn.classList.toggle("active", isHotsActive);
                toggleBtn.style.background = isHotsActive ? "#e91e63" : "";
                toggleBtn.textContent = isHotsActive ? "Mode HOTS: Aktif" : "Mode HOTS: Mati";
                renderDetailQuiz();
            };
        }

        if (retryQuizBtn) {
            retryQuizBtn.onclick = () => {
                playChime("click");
                renderDetailQuiz();
            };
        }

        renderDetailQuiz();
        renderDetailQuizStats();
    }

    // 30. Command Palette (Ctrl + K) with Instant Dictionary Search and Tab Jumps
    function initCommandPalette() {
        const palette = document.getElementById("commandPalette");
        const input = document.getElementById("cmdInput");
        const list = document.getElementById("cmdList");

        if (!palette || !input || !list) return;

        document.addEventListener("keydown", (e) => {
            if (e.ctrlKey && e.key === "k") {
                e.preventDefault();
                palette.classList.add("active");
                input.focus();
                renderPaletteList("");
            }
            if (e.key === "Escape") {
                palette.classList.remove("active");
                input.value = "";
            }
        });

        palette.addEventListener("click", (e) => {
            if (e.target === palette) {
                palette.classList.remove("active");
                input.value = "";
            }
        });

        const defaultItems = [
            { type: "cmd", icon: "fa-eye", text: "Toggle Zen Focus Mode", action: toggleZenMode },
            { type: "cmd", icon: "fa-music", text: "Toggle Ambient Traditional Drone", action: toggleAmbientMusic },
            { type: "cmd", icon: "fa-circle-half-stroke", text: "Ubah Tema (Gelap/Terang)", action: () => {
                const themeBtn = document.getElementById("themeToggleBtn");
                if (themeBtn) themeBtn.click();
            }},
            { type: "cmd", icon: "fa-compass", text: "Lompat ke Eksplorasi Budaya", action: () => {
                const btn = document.querySelector('[data-main-tab="explore"]');
                if (btn) btn.click();
            }},
            { type: "cmd", icon: "fa-book-open", text: "Lompat ke Kosakata & Dialek", action: () => {
                const btn = document.querySelector('[data-main-tab="vocab"]');
                if (btn) btn.click();
            }},
            { type: "cmd", icon: "fa-gamepad", text: "Lompat ke Kuis & Teka-Teki", action: () => {
                const btn = document.querySelector('[data-main-tab="test"]');
                if (btn) btn.click();
            }},
            { type: "cmd", icon: "fa-robot", text: "Fokus ke Asisten Maskot BUBUB", action: () => {
                const chatInput = document.getElementById("bububChatInput");
                if (chatInput) {
                    chatInput.scrollIntoView({ behavior: "smooth", block: "center" });
                    setTimeout(() => chatInput.focus(), 500);
                }
            }},
            { type: "cmd", icon: "fa-shield", text: "Aktifkan Akun Premium PRO (Demo)", action: window.activateProMock }
        ];

        function renderPaletteList(query = "") {
            const q = query.toLowerCase().trim();
            let itemsToShow = [];

            if (!q) {
                itemsToShow = defaultItems;
            } else {
                // Filter default commands
                const filteredCmds = defaultItems.filter(item => item.text.toLowerCase().includes(q));
                itemsToShow = [...filteredCmds];

                // Search vocabularies
                place.cards.forEach(c => {
                    if (c[0].toLowerCase().includes(q) || c[1].toLowerCase().includes(q)) {
                        itemsToShow.push({
                            type: "search",
                            icon: "fa-volume-high",
                            text: `Lafalkan: "${c[0]}" (Arti: ${c[1]})`,
                            action: () => {
                                if ("speechSynthesis" in window) {
                                    window.speechSynthesis.cancel();
                                    const utterance = new SpeechSynthesisUtterance(c[0]);
                                    utterance.lang = "id-ID";
                                    window.speechSynthesis.speak(utterance);
                                    core.showToast(`Melafalkan: "${c[0]}"`);
                                }
                            }
                        });
                    }
                });

                // Search phrases
                place.phrases.forEach(p => {
                    if (p[0].toLowerCase().includes(q) || p[1].toLowerCase().includes(q)) {
                        itemsToShow.push({
                            type: "search",
                            icon: "fa-volume-high",
                            text: `Frasa: "${p[0]}" (Arti: ${p[1]})`,
                            action: () => {
                                if ("speechSynthesis" in window) {
                                    window.speechSynthesis.cancel();
                                    const utterance = new SpeechSynthesisUtterance(p[0]);
                                    utterance.lang = "id-ID";
                                    window.speechSynthesis.speak(utterance);
                                    core.showToast(`Melafalkan: "${p[0]}"`);
                                }
                            }
                        });
                    }
                });

                // Search quick facts
                if (place.fact.toLowerCase().includes(q)) {
                    itemsToShow.push({
                        type: "search",
                        icon: "fa-circle-info",
                        text: `Fakta Cepat: "${place.fact.substring(0, 45)}..."`,
                        action: () => {
                            core.showToast(place.fact);
                        }
                    });
                }
            }

            if (itemsToShow.length === 0) {
                list.innerHTML = `<div style="padding:15px; text-align:center; color:#7b7b90; font-size:0.9rem;">Tidak ditemukan hasil untuk "${query}"</div>`;
                return;
            }

            list.innerHTML = itemsToShow.map((item, idx) => `
                <div class="cmd-item" data-idx="${idx}">
                    <i class="fa-solid ${item.icon}"></i>
                    <div style="display:flex; flex-direction:column; align-items:flex-start; text-align:left;">
                        <span style="font-weight:600; font-size:0.95rem; color:var(--detail-heading);">${item.text}</span>
                        <span style="font-size:0.75rem; color:var(--detail-muted); text-transform:uppercase;">${item.type === "cmd" ? "Perintah Kontrol" : "Kamus & Informasi"}</span>
                    </div>
                </div>
            `).join("");

            list.querySelectorAll(".cmd-item").forEach(el => {
                el.addEventListener("click", () => {
                    const idx = parseInt(el.dataset.idx);
                    if (itemsToShow[idx]) {
                        itemsToShow[idx].action();
                    }
                    palette.classList.remove("active");
                    input.value = "";
                });
            });
        }

        input.addEventListener("input", (e) => {
            renderPaletteList(e.target.value);
        });
    }

    // Initialize all components on DOM loaded
    document.addEventListener("DOMContentLoaded", () => {
        setupRegionTheme();
        initHeroCanvas();
        drawMapLocator();
        initFolklore();
        initAksaraSimulator();
        initSpeechRecognition();
        renderFlashcard3D();
        initFlashcardEvents();
        initGlossarySearch();
        initTypology();
        initMatchingGame();
        initCardGenerator();
        initQuests();
        drawProgressMetrics();
        initTriviaSpinner();
        initBububChatbot();
        initProFeatures();
        initQuizWidget();
        initCommandPalette();

        // Ambient Player Bind
        const ambientBtn = document.getElementById("ambientPlayBtn");
        if (ambientBtn) {
            ambientBtn.onclick = toggleAmbientMusic;
        }

        // Slideshow Bind
        renderSlideshow();
        const prevSlide = document.getElementById("slidePrevBtn");
        const nextSlide = document.getElementById("slideNextBtn");
        if (prevSlide) {
            prevSlide.onclick = () => {
                currentSlideIdx = (currentSlideIdx - 1 + mockSlides.length) % mockSlides.length;
                renderSlideshow();
            };
        }
        if (nextSlide) {
            nextSlide.onclick = () => {
                currentSlideIdx = (currentSlideIdx + 1) % mockSlides.length;
                renderSlideshow();
            };
        }
    });

})();
