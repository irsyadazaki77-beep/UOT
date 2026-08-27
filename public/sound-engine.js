// Universe Of Tech - Audio Synthesizer Engine (Global Preference & Safe Audio Context)
(() => {
    "use strict";

    const STORAGE_KEY = "uot_sound_enabled";
    const LEGACY_STORAGE_KEY = "quiznation_sound_enabled";

    function getInitialSoundPreference() {
        try {
            const val = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
            if (val !== null) return val === "true" || val === "1";
        } catch (_) {}
        return true;
    }

    let soundEnabled = getInitialSoundPreference();
    let audioCtx = null;
    let userHasInteracted = false;

    function markUserInteracted() {
        userHasInteracted = true;
    }
    window.addEventListener("pointerdown", markUserInteracted, { passive: true, once: true });
    window.addEventListener("keydown", markUserInteracted, { passive: true, once: true });

    function initAudioContext() {
        if (!userHasInteracted && document.readyState === "loading") return null;
        if (!audioCtx) {
            const AudioClass = window.AudioContext || window.webkitAudioContext;
            if (AudioClass) {
                audioCtx = new AudioClass();
            }
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume().catch(() => {});
        }
        return audioCtx;
    }

    function setSoundEnabled(enabled) {
        soundEnabled = Boolean(enabled);
        try {
            localStorage.setItem(STORAGE_KEY, String(soundEnabled));
            localStorage.setItem(LEGACY_STORAGE_KEY, String(soundEnabled));
        } catch (_) {}
        window.dispatchEvent(new CustomEvent("uot:sound-toggle", { detail: { enabled: soundEnabled } }));
        return soundEnabled;
    }

    function isSoundEnabled() {
        return soundEnabled;
    }

    function toggleSound() {
        return setSoundEnabled(!soundEnabled);
    }

    window.addEventListener("storage", (event) => {
        if (event.key === STORAGE_KEY || event.key === LEGACY_STORAGE_KEY) {
            soundEnabled = event.newValue === "true" || event.newValue === "1";
            window.dispatchEvent(new CustomEvent("uot:sound-toggle", { detail: { enabled: soundEnabled } }));
        }
    });

    function playSound(type) {
        if (!soundEnabled) return;
        try {
            const ctx = initAudioContext();
            if (!ctx) return;
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            if (type === 'hover') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(600, now);
                osc.frequency.exponentialRampToValueAtTime(900, now + 0.04);
                gain.gain.setValueAtTime(0.015, now);
                gain.gain.linearRampToValueAtTime(0.0001, now + 0.04);
                osc.start(now);
                osc.stop(now + 0.04);
            } else if (type === 'click') {
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(320, now);
                osc.frequency.exponentialRampToValueAtTime(120, now + 0.08);
                gain.gain.setValueAtTime(0.08, now);
                gain.gain.linearRampToValueAtTime(0.0001, now + 0.08);
                osc.start(now);
                osc.stop(now + 0.08);
            } else if (type === 'success' || type === 'correct') {
                const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
                notes.forEach((freq, idx) => {
                    const t = now + idx * 0.07;
                    const o = ctx.createOscillator();
                    const g = ctx.createGain();
                    o.connect(g);
                    g.connect(ctx.destination);
                    o.type = 'sine';
                    o.frequency.setValueAtTime(freq, t);
                    g.gain.setValueAtTime(0.06, t);
                    g.gain.linearRampToValueAtTime(0.0001, t + 0.22);
                    o.start(t);
                    o.stop(t + 0.25);
                });
            } else if (type === 'laser') {
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(1000, now);
                osc.frequency.exponentialRampToValueAtTime(220, now + 0.12);
                gain.gain.setValueAtTime(0.04, now);
                gain.gain.linearRampToValueAtTime(0.0001, now + 0.12);
                osc.start(now);
                osc.stop(now + 0.12);
            } else if (type === 'fanfare') {
                const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50, 1318.51];
                notes.forEach((freq, idx) => {
                    const t = now + idx * 0.055;
                    const o = ctx.createOscillator();
                    const g = ctx.createGain();
                    o.connect(g);
                    g.connect(ctx.destination);
                    o.type = 'triangle';
                    o.frequency.setValueAtTime(freq, t);
                    g.gain.setValueAtTime(0.06, t);
                    g.gain.linearRampToValueAtTime(0.0001, t + 0.25);
                    o.start(t);
                    o.stop(t + 0.28);
                });
            } else if (type === 'alarm') {
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(180, now);
                osc.frequency.linearRampToValueAtTime(720, now + 0.18);
                osc.frequency.linearRampToValueAtTime(180, now + 0.36);
                gain.gain.setValueAtTime(0.04, now);
                gain.gain.linearRampToValueAtTime(0.0001, now + 0.36);
                osc.start(now);
                osc.stop(now + 0.36);
            } else if (type === 'cyber') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(700, now);
                osc.frequency.exponentialRampToValueAtTime(1400, now + 0.08);
                osc.frequency.exponentialRampToValueAtTime(80, now + 0.24);
                gain.gain.setValueAtTime(0.04, now);
                gain.gain.linearRampToValueAtTime(0.0001, now + 0.24);
                osc.start(now);
                osc.stop(now + 0.24);
            }
        } catch (e) {
            console.warn("Audio Context init blocked until interaction.", e);
        }
    }

    // Lifecycle: Suspend AudioContext on background tab to save battery and CPU (Poin 11)
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            if (audioCtx && audioCtx.state === "running") {
                audioCtx.suspend().catch(() => {});
            }
        }
    });

    window.playSound = playSound;
    window.initAudioContext = initAudioContext;
    window.setSoundEnabled = setSoundEnabled;
    window.isSoundEnabled = isSoundEnabled;
    window.toggleSound = toggleSound;
})();
