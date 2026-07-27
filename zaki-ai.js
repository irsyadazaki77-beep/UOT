// Universe Of Tech - Zaki AI Chatbot Module

let recognition = null;

function zakiSpeechRecognition() {
    const micBtn = document.getElementById("zakiMicBtn");
    const speechText = document.getElementById("zakiSpeechText");

    if (!micBtn) return;

    window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!window.SpeechRecognition) {
        console.warn("Speech Recognition not supported in this browser.");
        micBtn.disabled = true;
        micBtn.setAttribute("aria-disabled", "true");
        micBtn.title = "Input suara belum didukung browser ini";
        if (speechText) {
            speechText.textContent = "Input suara belum didukung. Gunakan kolom chat.";
        }
        return;
    }

    recognition = new window.SpeechRecognition();
    recognition.interimResults = false;
    recognition.lang = 'id-ID';

    micBtn.addEventListener("click", () => {
        playSound('click');
        initAudioContext();
        try {
            recognition.start();
            micBtn.style.background = "var(--orange)";
            if (speechText) speechText.textContent = "Mendengarkan...";
        } catch (error) {
            console.error("Unable to start Speech Recognition:", error);
            micBtn.style.background = "";
            if (speechText) speechText.textContent = "Mikrofon sedang sibuk. Coba lagi.";
        }
    });

    recognition.addEventListener("result", (e) => {
        micBtn.style.background = "";
        const transcript = e.results[0][0].transcript;
        if (speechText) speechText.textContent = `Anda: "${transcript}"`;

        const inputEl = document.getElementById("zakiInput");
        if (inputEl) {
            inputEl.value = transcript;
            setTimeout(() => handleZakiSend(), 600);
        }
    });

    recognition.addEventListener("end", () => {
        micBtn.style.background = "";
        if (speechText && speechText.textContent === "Mendengarkan...") {
            speechText.textContent = "";
        }
    });

    recognition.addEventListener("error", (err) => {
        console.error("Speech Recognition Error: ", err);
        micBtn.style.background = "";
        if (speechText) {
            speechText.textContent = err.error === "not-allowed"
                ? "Izin mikrofon ditolak. Aktifkan izin browser atau gunakan chat."
                : "Mikrofon terputus. Coba lagi atau gunakan chat.";
        }
    });
}

function handleZakiSend() {
    const inputEl = document.getElementById("zakiInput");
    if (!inputEl) return;
    const text = inputEl.value.trim();
    if (!text) return;

    playSound('click');
    appendZakiMessage('user', text);
    inputEl.value = "";

    // Zaki AI thinking animation simulation
    setTimeout(() => {
        let matchResponse = "";
        const normalized = text.toLowerCase();

        if (typeof zakiBrain !== 'undefined') {
            for (const key in zakiBrain) {
                if (normalized.includes(key)) {
                    matchResponse = zakiBrain[key];
                    break;
                }
            }
        }

        if (!matchResponse) {
            matchResponse = "Wih pertanyaan kece tuh! Biar makin paham kodingnya, silakan klik salah satu modul di Grid Modul atau langsung buka page Materi Basic untuk praktek koding langsung, coy! Gacor abis!";
        }

        appendZakiMessage('ai', matchResponse);
    }, 750);
}

function appendZakiMessage(sender, text) {
    const historyEl = document.getElementById("zakiChatHistory");
    if (!historyEl) return;

    const bubble = document.createElement("div");
    bubble.className = `zaki-bubble ${sender}`;

    if (sender === 'ai' && text.includes("```")) {
        // Parse code blocks securely
        const parts = text.split("```");
        parts.forEach((part, index) => {
            if (index % 2 === 0) {
                if (part.trim() !== "") {
                    const textSpan = document.createElement("span");
                    textSpan.innerHTML = part.replace(/\n/g, "<br>");
                    bubble.appendChild(textSpan);
                }
            } else {
                const lines = part.split("\n");
                let lang = "js";
                if (lines[0] === "javascript" || lines[0] === "js") {
                    lang = "js";
                    lines.shift();
                } else if (lines[0] === "sql") {
                    lang = "sql";
                    lines.shift();
                } else if (lines[0] === "html" || lines[0] === "xss") {
                    lang = "xss";
                    lines.shift();
                }
                const cleanCode = lines.join("\n").trim();

                const container = document.createElement("div");
                container.className = "zaki-code-container";
                container.textContent = cleanCode;
                bubble.appendChild(container);

                const btn = document.createElement("button");
                btn.className = "btn btn-ghost";
                btn.style.cssText = "padding:6px 12px; font-size:11px; margin-top:6px; font-weight:800; border-radius:10px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); color:white; cursor:pointer;";
                btn.textContent = "🚀 Jalankan di Sandbox";

                btn.onclick = (e) => {
                    e.stopPropagation();
                    copyToSandbox(lang, cleanCode);
                };
                bubble.appendChild(btn);
            }
        });
    } else {
        bubble.textContent = text;
    }

    historyEl.appendChild(bubble);
    historyEl.scrollTop = historyEl.scrollHeight;
}

function copyToSandbox(lang, code) {
    playSound('success');

    if (typeof switchSandboxTab === 'function') {
        switchSandboxTab(lang);
    }

    const codeArea = document.getElementById("sandboxCodeArea");
    if (codeArea) {
        codeArea.value = code;
        if (typeof updateLineNumbers === 'function') {
            updateLineNumbers();
        }
    }

    const section = document.getElementById("sandbox-section");
    if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    if (typeof addXp === 'function') {
        addXp(10);
    }

    const statusText = document.getElementById("sandboxExecutionStatus");
    if (statusText) {
        statusText.textContent = "Kode disalin dari AI Mentor! Klik Jalankan.";
        statusText.style.color = "var(--blue)";
    }
}

function initZakiAI() {
    const btn = document.getElementById("zakiAiBtn");
    const panel = document.getElementById("zakiAiPanel");
    const closeBtn = document.getElementById("closeZakiPanel");
    const sendBtn = document.getElementById("zakiSendBtn");
    const inputEl = document.getElementById("zakiInput");
    const notif = document.getElementById("zakiNotification");

    if (!btn || !panel) return;

    btn.addEventListener("click", () => {
        playSound('click');
        panel.classList.toggle("show-panel");
        if (notif) notif.style.display = "none";
    });

    if (closeBtn) {
        closeBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            playSound('click');
            panel.classList.remove("show-panel");
        });
    }

    if (sendBtn) sendBtn.addEventListener("click", handleZakiSend);
    if (inputEl) {
        inputEl.addEventListener("keydown", (e) => {
            if (e.key === "Enter") handleZakiSend();
        });
    }

    // Quick chips bindings
    document.querySelectorAll(".quick-chip").forEach(chip => {
        chip.addEventListener("click", () => {
            const chipQuery = chip.dataset.chip;
            if (inputEl) {
                inputEl.value = chipQuery;
                handleZakiSend();
            }
        });
    });

    // Initial greeting bubble
    setTimeout(() => {
        appendZakiMessage('ai', "Halo coder! Saya Zaki AI, mentor tech kamu di Universe Of Tech. Mau nanya apa hari ini? Ketik chat atau klik Mic 🎤 lalu sebutkan istilah tech!");
    }, 1000);

    zakiSpeechRecognition();
}
