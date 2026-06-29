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
    let dialogResolver = null;
    let dialogTrigger = null;

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
        summary.replaceChildren();
        const strong = document.createElement("strong");
        strong.textContent = `${amount.value} soal`;
        summary.append(
            strong,
            document.createTextNode(` dari ${categoryNames[category.value]} - ${difficultyNames[difficulty.value]} - sekitar ${totalMinutes} menit.`)
        );
        if (description) description.textContent = modeDescriptions[mode.value];
    }

    function updateLearningPulse() {
        const storage = window.QuizNation?.storage;
        const best = Math.min(100, Math.max(0, Number(localStorage.getItem("eduquestBestScore") || 0)));
        const bookmarks = window.QuizNation?.sanitize.bookmarks(storage?.read(localStorage, "eduquestBookmarks", [])) || [];
        const last = storage?.read(localStorage, "eduquestLastSession", null);
        const bestElement = document.getElementById("pulseBestScore");
        const savedElement = document.getElementById("pulseSavedCount");
        const weakElement = document.getElementById("pulseWeakTopic");
        const weakNote = document.getElementById("pulseWeakNote");
        if (bestElement) bestElement.textContent = `${Math.round(best)}%`;
        if (savedElement) savedElement.textContent = String(bookmarks.length);

        const grouped = {};
        (Array.isArray(last?.answers) ? last.answers : []).forEach((answer) => {
            if (!answer || typeof answer !== "object") return;
            const category = categoryNames[answer.category] || "Materi campuran";
            grouped[category] ||= { correct: 0, total: 0 };
            grouped[category].total += 1;
            if (answer.isCorrect === true) grouped[category].correct += 1;
        });
        const weakest = Object.entries(grouped)
            .map(([category, data]) => ({ category, accuracy: Math.round((data.correct / data.total) * 100) }))
            .sort((a, b) => a.accuracy - b.accuracy)[0];
        if (weakElement) weakElement.textContent = weakest?.category || "Mulai sesi";
        if (weakNote) weakNote.textContent = weakest
            ? `Akurasi terakhir ${weakest.accuracy}%. Coba Practice untuk memperkuatnya.`
            : "Rekomendasi muncul setelah quiz.";
    }

    function requestQuizConfirmation({ title, message, acceptLabel }) {
        const overlay = document.getElementById("quizDialogOverlay");
        if (!overlay) return Promise.resolve(false);
        if (dialogResolver) dialogResolver(false);
        dialogTrigger = document.activeElement;
        document.getElementById("quizDialogTitle").textContent = title;
        document.getElementById("quizDialogMessage").textContent = message;
        document.getElementById("quizDialogAccept").textContent = acceptLabel;
        overlay.hidden = false;
        document.body.classList.add("quiz-dialog-open");
        window.setTimeout(() => document.getElementById("quizDialogCancel").focus(), 0);
        return new Promise((resolve) => {
            dialogResolver = resolve;
        });
    }

    function closeQuizDialog(accepted) {
        if (!dialogResolver) return;
        const resolve = dialogResolver;
        dialogResolver = null;
        document.getElementById("quizDialogOverlay").hidden = true;
        document.body.classList.remove("quiz-dialog-open");
        dialogTrigger?.focus?.();
        resolve(accepted);
        window.setTimeout(updateLearningPulse, 0);
    }

    function initDialog() {
        const overlay = document.getElementById("quizDialogOverlay");
        const cancel = document.getElementById("quizDialogCancel");
        const accept = document.getElementById("quizDialogAccept");
        if (!overlay || !cancel || !accept) return;
        cancel.addEventListener("click", () => closeQuizDialog(false));
        accept.addEventListener("click", () => closeQuizDialog(true));
        overlay.addEventListener("click", (event) => {
            if (event.target === overlay) closeQuizDialog(false);
        });
        document.addEventListener("keydown", (event) => {
            if (overlay.hidden) return;
            if (event.key === "Escape") {
                event.preventDefault();
                closeQuizDialog(false);
                return;
            }
            if (event.key !== "Tab") return;
            const focusables = [cancel, accept];
            const current = focusables.indexOf(document.activeElement);
            const next = event.shiftKey
                ? (current - 1 + focusables.length) % focusables.length
                : (current + 1) % focusables.length;
            event.preventDefault();
            focusables[next].focus();
        });
    }

    function initRevealAnimations() {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
        const items = document.querySelectorAll(".learning-pulse, .quiz-page-intro, .quiz-setup-section, .side-card, .lms-track-card");
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("is-revealed");
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.12 });
        items.forEach((item, index) => {
            item.classList.add("reveal-ready");
            item.style.setProperty("--reveal-delay", `${Math.min(index, 6) * 45}ms`);
            observer.observe(item);
        });
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

        const currentActivePanel = panels.find(p => p.classList.contains("active"));
        const targetPanel = panels.find(p => p.id === nextTab.getAttribute("aria-controls"));

        if (currentActivePanel && currentActivePanel !== targetPanel) {
            currentActivePanel.classList.add("fade-out");
            currentActivePanel.classList.remove("show");
            
            setTimeout(() => {
                currentActivePanel.classList.remove("active", "fade-out");
                currentActivePanel.hidden = true;
                
                if (targetPanel) {
                    targetPanel.hidden = false;
                    targetPanel.classList.add("active");
                    targetPanel.offsetHeight; // force reflow
                    targetPanel.classList.add("show");
                }
            }, 250);
        } else {
            panels.forEach((panel) => {
                const active = panel === targetPanel;
                panel.classList.toggle("active", active);
                panel.hidden = !active;
                if (active) {
                    panel.offsetHeight; // force reflow
                    panel.classList.add("show");
                } else {
                    panel.classList.remove("show");
                }
            });
        }

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
        updateLearningPulse();
        initDialog();
        initRevealAnimations();
        window.showQuizToast = showToast;
        window.requestQuizConfirmation = requestQuizConfirmation;

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
