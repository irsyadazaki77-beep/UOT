// Universe Of Tech - Audio Synthesizer Engine

let soundEnabled = true;
let audioCtx = null;

function initAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playSound(type) {
    if (!soundEnabled) return;
    try {
        initAudioContext();
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

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
        } else if (type === 'success') {
            // Chime triumph melody
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
            notes.forEach((freq, idx) => {
                const t = now + idx * 0.07;
                const o = audioCtx.createOscillator();
                const g = audioCtx.createGain();
                o.connect(g);
                g.connect(audioCtx.destination);
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
            // Level Up Fanfare: Major Chord arpeggio upwards, then double chime
            const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50, 1318.51];
            notes.forEach((freq, idx) => {
                const t = now + idx * 0.055;
                const o = audioCtx.createOscillator();
                const g = audioCtx.createGain();
                o.connect(g);
                g.connect(audioCtx.destination);
                o.type = 'triangle';
                o.frequency.setValueAtTime(freq, t);
                g.gain.setValueAtTime(0.06, t);
                g.gain.linearRampToValueAtTime(0.0001, t + 0.25);
                o.start(t);
                o.stop(t + 0.28);
            });
        } else if (type === 'alarm') {
            // Cyber alarm sound (oscillating freq)
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(180, now);
            osc.frequency.linearRampToValueAtTime(720, now + 0.18);
            osc.frequency.linearRampToValueAtTime(180, now + 0.36);
            gain.gain.setValueAtTime(0.04, now);
            gain.gain.linearRampToValueAtTime(0.0001, now + 0.36);
            osc.start(now);
            osc.stop(now + 0.36);
        } else if (type === 'cyber') {
            // Futuristic synth sound
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
