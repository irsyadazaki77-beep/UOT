(() => {
    "use strict";

    const modeDescriptions = {
        practice: "Practice memberi waktu longgar, hint, dan bantuan 50:50.",
        exam: "Exam Timer menguji fokus dengan waktu lebih ketat dan tanpa bantuan.",
        sprint: "Sprint adalah sesi cepat 25 detik per soal untuk melatih refleks.",
        review: "Review Mode membuka kembali pembahasan dari sesi Quick Quiz terakhir."
    };

    const categoryNames = {
        all: "semua materi",
        programming: "Programming",
        database: "Database & SQL",
        design: "UI/UX Design",
        analytics: "Business Analytics",
        web: "Web Development",
        cyber: "Cyber & Data Literacy"
    };

    const difficultyNames = {
        all: "level campuran",
        easy: "Pemanasan",
        medium: "Normal",
        hard: "Challenge"
    };

    let toastTimer = null;

    function showToast(message, tone = "") {
        const toast = document.getElementById("quizToast");
        if (!toast) return;
        window.clearTimeout(toastTimer);
        toast.textContent = message;
        toast.className = `quiz-toast${tone ? ` ${tone}` : ""}`;
        requestAnimationFrame(() => toast.classList.add("show"));
        toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2800);
    }

    function updateSetupSummary() {
        const category = document.getElementById("category");
        const difficulty = document.getElementById("difficulty");
        const amount = document.getElementById("amount");
        const mode = document.getElementById("mode");
        const summary = document.getElementById("setupSummary");
        const description = document.getElementById("modeDescription");
        if (!category || !difficulty || !amount || !mode || !summary) return;

        const secondsPerQuestion = mode.value === "sprint" ? 25 : mode.value === "exam" ? 50 : mode.value === "review" ? 120 : 90;
        const totalMinutes = Math.ceil((Number(amount.value) * secondsPerQuestion) / 60);
        summary.innerHTML = `<strong>${amount.value} soal</strong> dari ${categoryNames[category.value]} · ${difficultyNames[difficulty.value]} · sekitar ${totalMinutes} menit.`;
        if (description) description.textContent = modeDescriptions[mode.value];
    }

    function activateTab(nextTab, focusTab = false) {
        const tabs = [...document.querySelectorAll(".lms-tab-btn[role='tab']")];
        const panels = [...document.querySelectorAll(".tab-content[role='tabpanel']")];
        if (!nextTab) return;

        tabs.forEach((tab) => {
            const active = tab === nextTab;
            tab.classList.toggle("active", active);
            tab.setAttribute("aria-selected", String(active));
            tab.tabIndex = active ? 0 : -1;
        });

        panels.forEach((panel) => {
            const active = panel.id === nextTab.getAttribute("aria-controls");
            panel.classList.toggle("active", active);
            panel.hidden = !active;
        });

        try {
            sessionStorage.setItem("quizActiveTab", nextTab.dataset.tab || "");
        } catch (error) {
            console.warn("Tab aktif tidak dapat disimpan:", error);
        }

        if (focusTab) nextTab.focus();
    }

    function initTabs() {
        const tabs = [...document.querySelectorAll(".lms-tab-btn[role='tab']")];
        if (!tabs.length) return;

        tabs.forEach((tab, index) => {
            tab.addEventListener("click", () => activateTab(tab));
            tab.addEventListener("keydown", (event) => {
                if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
                event.preventDefault();
                let targetIndex = index;
                if (event.key === "ArrowRight") targetIndex = (index + 1) % tabs.length;
                if (event.key === "ArrowLeft") targetIndex = (index - 1 + tabs.length) % tabs.length;
                if (event.key === "Home") targetIndex = 0;
                if (event.key === "End") targetIndex = tabs.length - 1;
                activateTab(tabs[targetIndex], true);
            });
        });

        let savedTab = "";
        try {
            savedTab = sessionStorage.getItem("quizActiveTab") || "";
        } catch (error) {
            savedTab = "";
        }
        const initialTab = tabs.find((tab) => tab.dataset.tab === savedTab) || tabs.find((tab) => tab.classList.contains("active")) || tabs[0];
        activateTab(initialTab);
    }

    function initQuickQuizShortcuts() {
        document.addEventListener("keydown", (event) => {
            const quickPanel = document.getElementById("quick-arena-tab");
            if (!quickPanel || quickPanel.hidden || !quickPanel.classList.contains("active")) return;
            if (event.altKey || event.ctrlKey || event.metaKey) return;
            if (/^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement?.tagName || "")) return;
            if (typeof state === "undefined" || !state.running) return;

            if (/^[1-4]$/.test(event.key)) {
                const option = document.querySelector(`.answer-option[data-index="${Number(event.key) - 1}"]:not([disabled]):not(.hidden-choice)`);
                if (option) {
                    event.preventDefault();
                    option.click();
                }
                return;
            }

            if (event.key === "ArrowRight") {
                const nextButton = document.getElementById("nextBtn");
                if (nextButton && !nextButton.disabled) {
                    event.preventDefault();
                    nextButton.click();
                }
            } else if (event.key.toLowerCase() === "h") {
                const hintButton = document.getElementById("hintBtn");
                if (hintButton && !hintButton.disabled) hintButton.click();
            } else if (event.key.toLowerCase() === "f") {
                const flagButton = document.getElementById("flagBtn");
                if (flagButton && !flagButton.disabled) flagButton.click();
            }
        });
    }

    function initActionFeedback() {
        document.getElementById("startBtn")?.addEventListener("click", () => {
            window.setTimeout(() => {
                if (typeof state !== "undefined" && state.running) {
                    showToast(`Sesi dimulai: ${state.activeQuestions.length} soal. Semangat!`, "success");
                }
            }, 0);
        });

        document.getElementById("bookmarkBtn")?.addEventListener("click", () => {
            showToast("Soal disimpan untuk dipelajari lagi.", "success");
        });

        document.getElementById("flagBtn")?.addEventListener("click", () => {
            if (typeof state !== "undefined" && state.flagged[state.current]) {
                showToast("Soal ditandai ragu-ragu.", "warning");
            }
        });

    }

    function init() {
        initTabs();
        initQuickQuizShortcuts();
        initActionFeedback();
        ["category", "difficulty", "amount", "mode"].forEach((id) => {
            document.getElementById(id)?.addEventListener("change", updateSetupSummary);
        });
        updateSetupSummary();
        window.showQuizToast = showToast;

        const params = new URLSearchParams(window.location.search);
        if (params.get("review") === "1") {
            const quickTab = document.getElementById("quickArenaTab");
            const mode = document.getElementById("mode");
            activateTab(quickTab);
            if (mode) mode.value = "review";
            updateSetupSummary();
            window.setTimeout(() => document.getElementById("startBtn")?.click(), 0);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init, { once: true });
    } else {
        init();
    }
})();
