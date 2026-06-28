(() => {
    "use strict";

    const SESSION_KEY = "eduquestUserSession";
    const RPG_KEY = "eduquestRPG";
    const PREFS_KEY = "eduquestProfileSettings";
    const HUB_KEY = "eduquestProfileHub";
    const PROGRESS_KEYS = ["bahasa_progress", "eduquestLmsProgress", "eduquestRPG", "eduquestXP", "eduquestStreak", "eduquestLevel", "eduquestBestScore", "eduquestLastSession"];
    const defaults = {
        headline: "",
        bio: "",
        focus: "frontend",
        language: "id",
        dailyGoal: "30",
        startPage: "index.html",
        reminder: true,
        reducedMotion: false,
        publicProfile: true,
        analytics: true,
        studyMode: "balanced",
        reminderTime: "19:00",
        accent: "ocean"
    };
    const hubDefaults = {
        focusNote: "",
        focusNoteUpdatedAt: "",
        missions: {
            read: false,
            quiz: false,
            review: false
        }
    };

    let pendingConfirm = null;
    let countersAnimated = false;

    const $ = id => document.getElementById(id);

    function readJSON(key, fallback) {
        try {
            return JSON.parse(localStorage.getItem(key) || "null") ?? fallback;
        } catch {
            return fallback;
        }
    }

    function writeJSON(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    function getPrefs() {
        return { ...defaults, ...readJSON(PREFS_KEY, {}) };
    }

    function getHub() {
        const hub = { ...hubDefaults, ...readJSON(HUB_KEY, {}) };
        hub.missions = { ...hubDefaults.missions, ...(hub.missions || {}) };
        return hub;
    }

    function isLoggedIn() {
        return Boolean(readJSON(SESSION_KEY, null)?.isLoggedIn);
    }

    function showToast(text) {
        const toast = $("profileToast");
        toast.textContent = text;
        toast.classList.add("show");
        clearTimeout(showToast.timer);
        showToast.timer = setTimeout(() => toast.classList.remove("show"), 2400);
    }

    function prefersReducedMotion() {
        return document.body.classList.contains("reduce-motion");
    }

    function animateNumber(node, value, { suffix = "", duration = 850, formatter = n => n.toLocaleString("id-ID") } = {}) {
        if (!node) return;
        if (prefersReducedMotion()) {
            node.textContent = `${formatter(value)}${suffix}`;
            node.dataset.currentValue = String(value);
            return;
        }
        const startValue = Number(node.dataset.currentValue || 0);
        const startTime = performance.now();
        const delta = value - startValue;
        function step(now) {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = startValue + (delta * eased);
            node.textContent = `${formatter(Math.round(current))}${suffix}`;
            if (progress < 1) requestAnimationFrame(step);
            else node.dataset.currentValue = String(value);
        }
        requestAnimationFrame(step);
    }

    function animateEntrance(containerSelector) {
        const items = document.querySelectorAll(containerSelector);
        items.forEach((item, index) => {
            item.style.animationDelay = `${index * 120}ms`;
        });
    }

    function calculateWonderfulXP(progress) {
        return ((progress.explored || []).length * 10)
            + ((progress.mastered || []).length * 20)
            + ((progress.quizDone || 0) * 15)
            + ((progress.voiceSuccessCount || 0) * 25)
            + (progress.bonusXP || 0);
    }

    function getStats() {
        const wonderful = readJSON("bahasa_progress", {});
        const lms = readJSON("eduquestLmsProgress", {});
        const rpg = readJSON(RPG_KEY, {});
        const storedXP = Number(localStorage.getItem("eduquestXP") || 0);
        const xp = Math.max(storedXP, rpg.xp || 0, lms.xp || 0, calculateWonderfulXP(wonderful));
        return {
            xp,
            streak: Math.max(Number(localStorage.getItem("eduquestStreak") || 0), wonderful.streak || 0, lms.streak || 0, rpg.streak || 0),
            explored: (wonderful.explored || []).length,
            accuracy: Math.round(((wonderful.correct || 0) / Math.max(wonderful.reviewed || 0, 1)) * 100)
        };
    }

    function getLearnerPersona(stats, prefs) {
        if (stats.explored >= 8) return { title: "Explorer", hint: "Kuat di eksplorasi lintas topik dan budaya." };
        if (stats.accuracy >= 85) return { title: "Sharpshooter", hint: "Presisi quiz kamu sudah sangat bagus." };
        if (prefs.studyMode === "deep") return { title: "Deep Diver", hint: "Cocok untuk sesi fokus dan materi panjang." };
        if (prefs.focus === "tka") return { title: "Strategist", hint: "Terarah untuk target ujian dan milestone." };
        return { title: "Builder", hint: "Progresmu tumbuh stabil dari kebiasaan kecil." };
    }

    function getStudyModeMeta(mode) {
        return {
            balanced: { label: "Balanced", hint: "Alur stabil untuk progres harian." },
            sprint: { label: "Sprint", hint: "Cocok untuk dorongan cepat dan target mepet." },
            deep: { label: "Deep Work", hint: "Lebih tenang untuk materi yang berat." },
            chill: { label: "Chill", hint: "Ritme ringan untuk review konsisten." }
        }[mode] || { label: "Balanced", hint: "Alur stabil untuk progres harian." };
    }

    function getConsistencyScore(stats, prefs, hub) {
        const missionCount = Object.values(hub.missions).filter(Boolean).length;
        return Math.min(100, Math.round((stats.streak * 8) + (stats.accuracy * 0.35) + (Number(prefs.dailyGoal) * 0.3) + (missionCount * 9)));
    }

    function buildWeeklyRhythm(stats, prefs) {
        const labels = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
        return labels.map((label, index) => {
            const raw = ((stats.xp / 14) + (stats.streak * 9) + (index * 11) + Number(prefs.dailyGoal)) % 100;
            const value = Math.max(18, Math.round(raw));
            return { label, value, active: value >= 46 };
        });
    }

    function getAchievements(stats, prefs, hub, completenessScore) {
        const consistency = getConsistencyScore(stats, prefs, hub);
        return [
            { icon: "fa-fire", title: "Streak Starter", detail: "Jaga ritme 3+ hari.", unlocked: stats.streak >= 3 },
            { icon: "fa-compass", title: "Culture Explorer", detail: "Jelajahi 5 daerah.", unlocked: stats.explored >= 5 },
            { icon: "fa-bullseye", title: "Precision", detail: "Akurasi 80% atau lebih.", unlocked: stats.accuracy >= 80 },
            { icon: "fa-brain", title: "Deep Focus", detail: "Pilih mode Deep Work.", unlocked: prefs.studyMode === "deep" },
            { icon: "fa-list-check", title: "Mission Ready", detail: "Selesaikan semua misi harian.", unlocked: Object.values(hub.missions).every(Boolean) },
            { icon: "fa-gem", title: "Profile Polished", detail: "Kelengkapan profil di atas 80%.", unlocked: completenessScore >= 83 },
            { icon: "fa-rocket", title: "XP Booster", detail: "Capai total 500 XP.", unlocked: stats.xp >= 500 },
            { icon: "fa-heart-pulse", title: "Consistency+", detail: "Skor konsistensi 75%+.", unlocked: consistency >= 75 }
        ];
    }

    function applyPreferences() {
        const prefs = getPrefs();
        const dark = localStorage.getItem("eduquest_theme") === "dark";
        document.body.classList.toggle("dark-theme", dark);
        document.body.classList.toggle("reduce-motion", prefs.reducedMotion);
        document.body.dataset.accent = prefs.accent;
        $("themeToggleBtn").innerHTML = dark ? "&#9728;" : "&#127769;";
        if (typeof soundEnabled !== "undefined") soundEnabled = localStorage.getItem("eduquest_sound") !== "off";
    }

    function renderWeeklyRhythm(stats, prefs) {
        const wrap = $("weeklyRhythm");
        if (!wrap) return;
        const days = buildWeeklyRhythm(stats, prefs);
        wrap.innerHTML = days.map(day => `<div class="rhythm-day${day.active ? " active" : ""}"><strong style="height:${day.value}%"></strong><span>${day.label}</span></div>`).join("");
        $("weeklySummary").textContent = `${days.filter(day => day.active).length} sesi aktif`;
    }

    function renderAchievements(stats, prefs, hub, completenessScore) {
        const wrap = $("achievementGrid");
        if (!wrap) return;
        wrap.innerHTML = getAchievements(stats, prefs, hub, completenessScore).map(item => `
            <article class="achievement-item${item.unlocked ? " unlocked" : ""}">
                <i class="fa-solid ${item.icon}"></i>
                <strong>${item.title}</strong>
                <span>${item.detail}</span>
            </article>
        `).join("");
    }

    function renderChecklist(items) {
        const wrap = $("profileChecklist");
        if (!wrap) return;
        wrap.innerHTML = items.map(item => `<div class="check-item${item.done ? " done" : ""}"><i class="fa-solid ${item.done ? "fa-circle-check" : "fa-circle"}"></i><span>${item.label}</span></div>`).join("");
    }

    function renderMissions(hub) {
        $("missionRead").checked = hub.missions.read;
        $("missionQuiz").checked = hub.missions.quiz;
        $("missionReview").checked = hub.missions.review;
        const completed = Object.values(hub.missions).filter(Boolean).length;
        $("missionProgressBar").style.width = `${(completed / 3) * 100}%`;
        $("missionProgressLabel").textContent = `${completed} dari 3 misi selesai.`;
    }

    function renderFocusNote(hub) {
        $("focusNoteInput").value = hub.focusNote;
        $("focusNoteCount").textContent = `${hub.focusNote.length}/240 karakter`;
        $("focusNoteMeta").textContent = hub.focusNoteUpdatedAt ? `Diperbarui ${new Date(hub.focusNoteUpdatedAt).toLocaleString("id-ID")}` : "Belum ada catatan";
    }

    function render() {
        const session = readJSON(SESSION_KEY, null);
        const rpg = readJSON(RPG_KEY, {});
        const prefs = getPrefs();
        const hub = getHub();
        const loggedIn = isLoggedIn();
        const avatar = rpg.activeAvatar || session?.avatar || "\u{1F468}\u200D\u{1F4BB}";
        const name = session?.username || "Pengguna Universe";
        const email = session?.email || "Belum masuk ke akun";
        const pro = localStorage.getItem("eduquestSubscription") === "pro";
        const stats = getStats();
        const level = Math.floor(stats.xp / 100) + 1;
        const currentXP = stats.xp % 100;
        const persona = getLearnerPersona(stats, prefs);
        const consistency = getConsistencyScore(stats, prefs, hub);
        const studyModeMeta = getStudyModeMeta(prefs.studyMode);

        ["profileAvatar", "profileAvatarLarge"].forEach(id => $(id).textContent = avatar);
        $("profileName").textContent = name;
        $("profileEmail").textContent = email;
        $("profilePlan").textContent = pro ? "Pro" : "Basic";
        $("profilePlan").classList.toggle("pro", pro);
        animateNumber($("profileXp"), stats.xp);
        animateNumber($("profileStreak"), stats.streak);
        animateNumber($("profileExplored"), stats.explored);
        animateNumber($("profileAccuracy"), stats.accuracy, { suffix: "%", formatter: n => n });
        $("profileLevel").textContent = `Level ${level}`;
        $("profileXpLabel").textContent = `${currentXP} / 100 XP`;
        $("nextLevelLabel").textContent = `${100 - currentXP} XP lagi`;
        $("profileXpBar").style.width = `${currentXP}%`;
        $("dailyGoalTitle").textContent = `${prefs.dailyGoal} menit`;
        $("goalDescription").textContent = prefs.reminder
            ? `Pengingat belajar aktif pukul ${prefs.reminderTime}. Selesaikan satu aktivitas untuk menjaga ritme.`
            : "Aktifkan pengingat agar target harian lebih konsisten.";

        $("profileNameInput").value = session?.username || "";
        $("profileEmailInput").value = session?.email || "";
        $("profileHeadlineInput").value = prefs.headline;
        $("profileFocusInput").value = prefs.focus;
        $("profileBioInput").value = prefs.bio;
        $("bioCount").textContent = prefs.bio.length;
        $("profileLoginCta").hidden = loggedIn;
        $("logoutLink").hidden = !loggedIn;
        $("profileEditPanel").classList.toggle("is-disabled", !loggedIn);
        document.querySelectorAll("[data-avatar]").forEach(btn => {
            btn.classList.toggle("active", btn.dataset.avatar === avatar);
            btn.disabled = !loggedIn;
        });

        $("darkModeSetting").checked = localStorage.getItem("eduquest_theme") === "dark";
        $("soundSetting").checked = localStorage.getItem("eduquest_sound") !== "off";
        $("motionSetting").checked = prefs.reducedMotion;
        $("reminderSetting").checked = prefs.reminder;
        $("languageSetting").value = prefs.language;
        $("dailyGoalSetting").value = prefs.dailyGoal;
        $("startPageSetting").value = prefs.startPage;
        $("studyModeSetting").value = prefs.studyMode;
        $("reminderTimeSetting").value = prefs.reminderTime;
        $("publicProfileSetting").checked = prefs.publicProfile;
        $("analyticsSetting").checked = prefs.analytics;
        document.querySelectorAll("[data-accent]").forEach(btn => btn.classList.toggle("active", btn.dataset.accent === prefs.accent));
        $("currentPlanLabel").textContent = `Paket saat ini: ${pro ? "Pro" : "Basic"}`;
        document.querySelectorAll("[data-plan-card]").forEach(card => card.classList.toggle("selected", card.dataset.planCard === (pro ? "pro" : "basic")));
        document.querySelectorAll("[data-plan]").forEach(btn => {
            btn.textContent = btn.dataset.plan === (pro ? "pro" : "basic")
                ? "Paket Aktif"
                : btn.dataset.plan === "pro"
                    ? "Lihat Paket Pro"
                    : "Gunakan Basic";
        });

        const completeness = [loggedIn, Boolean(session?.username), Boolean(session?.email), Boolean(prefs.headline), Boolean(prefs.bio), Boolean(rpg.activeAvatar || session?.avatar)].filter(Boolean).length;
        const score = Math.round((completeness / 6) * 100);
        animateNumber($("healthScore"), score, { suffix: "%", formatter: n => n, duration: 900 });
        $("healthRing").style.setProperty("--score", score);
        $("healthHint").textContent = score === 100 ? "Profilmu sudah lengkap" : "Tambahkan headline dan bio";

        $("learnerPersona").textContent = persona.title;
        $("learnerPersonaHint").textContent = persona.hint;
        animateNumber($("consistencyScore"), consistency, { suffix: "%", formatter: n => n, duration: 900 });
        $("consistencyHint").textContent = consistency >= 75 ? "Ritmemu sudah kuat dan stabil." : "Naikkan streak dan selesaikan misi.";
        $("studyModeBadge").textContent = studyModeMeta.label;
        $("studyModeHint").textContent = studyModeMeta.hint;
        $("smartTipTitle").textContent = consistency >= 70 ? "Pertahankan ritme positifmu" : "Naikkan momentum belajarmu";
        $("smartTipText").textContent = stats.accuracy < 70
            ? "Coba ulang satu quiz pendek setelah membaca materi ringkas agar akurasi naik lebih cepat."
            : prefs.focus === "tka"
                ? "Kombinasikan sesi TKA 30 menit dengan satu latihan quiz supaya progres tetap terukur."
                : "Gabungkan materi, quiz, dan review catatan singkat untuk progres yang lebih seimbang.";

        renderChecklist([
            { label: "Masuk ke akun", done: loggedIn },
            { label: "Tambahkan headline profil", done: Boolean(prefs.headline) },
            { label: "Isi bio singkat", done: Boolean(prefs.bio) },
            { label: "Pilih avatar favorit", done: Boolean(rpg.activeAvatar || session?.avatar) }
        ]);
        renderWeeklyRhythm(stats, prefs);
        renderAchievements(stats, prefs, hub, score);
        renderMissions(hub);
        renderFocusNote(hub);

        if (!countersAnimated) {
            animateEntrance(".profile-stat-grid article, .overview-grid > *, .quick-links a, .settings-list .setting-row, .data-actions article, .plan-grid .plan-card, .insight-stat-grid > *, .insight-grid > *, .achievement-grid > *, .overview-extra-grid > *");
            countersAnimated = true;
        }
    }

    function switchTab(name) {
        document.querySelectorAll("[data-tab]").forEach(btn => btn.classList.toggle("active", btn.dataset.tab === name));
        document.querySelectorAll("[data-panel]").forEach(panel => panel.classList.toggle("active", panel.dataset.panel === name));
        animateEntrance(`[data-panel="${name}"] > *`);
        history.replaceState(null, "", `#${name}`);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function savePrefs(patch, message = "Pengaturan disimpan.") {
        writeJSON(PREFS_KEY, { ...getPrefs(), ...patch });
        applyPreferences();
        render();
        showToast(message);
    }

    function openConfirm(title, text, action) {
        $("confirmTitle").textContent = title;
        $("confirmText").textContent = text;
        pendingConfirm = action;
        $("confirmModal").classList.add("open");
        $("confirmModal").setAttribute("aria-hidden", "false");
    }

    function closeConfirm() {
        $("confirmModal").classList.remove("open");
        $("confirmModal").setAttribute("aria-hidden", "true");
        pendingConfirm = null;
    }

    document.querySelectorAll("[data-tab]").forEach(btn => btn.addEventListener("click", () => switchTab(btn.dataset.tab)));

    document.querySelectorAll("[data-avatar]").forEach(btn => btn.addEventListener("click", () => {
        if (!isLoggedIn()) return;
        const session = readJSON(SESSION_KEY, {});
        const rpg = readJSON(RPG_KEY, {});
        session.avatar = btn.dataset.avatar;
        rpg.activeAvatar = btn.dataset.avatar;
        writeJSON(SESSION_KEY, session);
        writeJSON(RPG_KEY, rpg);
        render();
        showToast("Avatar berhasil diperbarui.");
    }));

    $("profileBioInput").addEventListener("input", event => {
        $("bioCount").textContent = event.target.value.length;
    });

    $("profileForm").addEventListener("submit", event => {
        event.preventDefault();
        if (!isLoggedIn()) return;
        const name = $("profileNameInput").value.trim();
        const email = $("profileEmailInput").value.trim();
        if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            $("profileMessage").textContent = "Masukkan nama dan email yang valid.";
            return;
        }
        const session = readJSON(SESSION_KEY, {});
        session.username = name;
        session.email = email;
        writeJSON(SESSION_KEY, session);
        writeJSON(PREFS_KEY, {
            ...getPrefs(),
            headline: $("profileHeadlineInput").value.trim(),
            focus: $("profileFocusInput").value,
            bio: $("profileBioInput").value.trim()
        });
        $("profileMessage").textContent = "Perubahan tersimpan.";
        applyPreferences();
        render();
        showToast("Profil berhasil diperbarui.");
    });

    $("themeToggleBtn").addEventListener("click", () => {
        const dark = !document.body.classList.contains("dark-theme");
        localStorage.setItem("eduquest_theme", dark ? "dark" : "light");
        applyPreferences();
        render();
    });

    $("darkModeSetting").addEventListener("change", event => {
        localStorage.setItem("eduquest_theme", event.target.checked ? "dark" : "light");
        applyPreferences();
        render();
    });

    $("soundSetting").addEventListener("change", event => {
        localStorage.setItem("eduquest_sound", event.target.checked ? "on" : "off");
        if (typeof soundEnabled !== "undefined") soundEnabled = event.target.checked;
        if (event.target.checked && typeof playSound === "function") playSound("success");
        showToast(`Efek suara ${event.target.checked ? "diaktifkan" : "dinonaktifkan"}.`);
    });

    $("motionSetting").addEventListener("change", event => savePrefs({ reducedMotion: event.target.checked }));
    $("reminderSetting").addEventListener("change", event => savePrefs({ reminder: event.target.checked }));
    $("languageSetting").addEventListener("change", event => savePrefs({ language: event.target.value }, "Preferensi bahasa disimpan."));
    $("dailyGoalSetting").addEventListener("change", event => savePrefs({ dailyGoal: event.target.value }, "Target harian diperbarui."));
    $("startPageSetting").addEventListener("change", event => savePrefs({ startPage: event.target.value }, "Halaman awal diperbarui."));
    $("studyModeSetting").addEventListener("change", event => savePrefs({ studyMode: event.target.value }, "Mode belajar diperbarui."));
    $("reminderTimeSetting").addEventListener("change", event => savePrefs({ reminderTime: event.target.value }, "Jam pengingat diperbarui."));
    $("publicProfileSetting").addEventListener("change", event => savePrefs({ publicProfile: event.target.checked }));
    $("analyticsSetting").addEventListener("change", event => savePrefs({ analytics: event.target.checked }));
    document.querySelectorAll("[data-accent]").forEach(btn => btn.addEventListener("click", () => savePrefs({ accent: btn.dataset.accent }, "Warna aksen diperbarui.")));

    $("focusNoteInput").addEventListener("input", event => {
        $("focusNoteCount").textContent = `${event.target.value.length}/240 karakter`;
    });

    $("saveFocusNoteBtn").addEventListener("click", () => {
        writeJSON(HUB_KEY, {
            ...getHub(),
            focusNote: $("focusNoteInput").value.trim(),
            focusNoteUpdatedAt: new Date().toISOString()
        });
        render();
        showToast("Catatan fokus disimpan.");
    });

    [["missionRead", "read"], ["missionQuiz", "quiz"], ["missionReview", "review"]].forEach(([id, key]) => {
        $(id).addEventListener("change", event => {
            const hub = getHub();
            hub.missions[key] = event.target.checked;
            writeJSON(HUB_KEY, hub);
            render();
        });
    });

    $("resetMissionsBtn").addEventListener("click", () => {
        const hub = getHub();
        hub.missions = { ...hubDefaults.missions };
        writeJSON(HUB_KEY, hub);
        render();
        showToast("Misi harian direset.");
    });

    $("resetPreferences").addEventListener("click", () => {
        writeJSON(PREFS_KEY, defaults);
        localStorage.setItem("eduquest_theme", "light");
        localStorage.setItem("eduquest_sound", "on");
        applyPreferences();
        render();
        showToast("Preferensi dikembalikan ke default.");
    });

    document.querySelectorAll("[data-plan]").forEach(btn => btn.addEventListener("click", () => {
        if (btn.dataset.plan === "pro" && localStorage.getItem("eduquestSubscription") !== "pro") {
            window.location.href = "index.html#pricing";
            return;
        }
        localStorage.setItem("eduquestSubscription", btn.dataset.plan === "pro" ? "pro" : "basic");
        render();
        showToast(`Paket ${btn.dataset.plan === "pro" ? "Pro" : "Basic"} aktif.`);
    }));

    $("exportDataBtn").addEventListener("click", () => {
        const keys = [SESSION_KEY, RPG_KEY, PREFS_KEY, HUB_KEY, "bahasa_progress", "eduquestLmsProgress", "eduquestSubscription", "eduquest_theme", "eduquest_sound"];
        const payload = {
            exportedAt: new Date().toISOString(),
            app: "Universe Of Tech",
            data: Object.fromEntries(keys.map(key => [key, localStorage.getItem(key)]))
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "universe-of-tech-data.json";
        link.click();
        URL.revokeObjectURL(url);
        showToast("Data berhasil diekspor.");
    });

    $("importDataBtn").addEventListener("click", () => $("importDataInput").click());

    $("importDataInput").addEventListener("change", async event => {
        const file = event.target.files?.[0];
        if (!file) return;
        try {
            const parsed = JSON.parse(await file.text());
            Object.entries(parsed.data || {}).forEach(([key, value]) => {
                if (value === null || typeof value === "undefined") localStorage.removeItem(key);
                else localStorage.setItem(key, value);
            });
            applyPreferences();
            render();
            showToast("Backup berhasil diimpor.");
        } catch {
            showToast("File JSON tidak valid.");
        }
        event.target.value = "";
    });

    $("resetProgressBtn").addEventListener("click", () => openConfirm("Reset progres belajar?", "XP, streak, quiz, dan progres budaya akan dihapus. Profil serta pengaturan tetap tersimpan.", () => {
        PROGRESS_KEYS.forEach(key => localStorage.removeItem(key));
        closeConfirm();
        render();
        showToast("Progres belajar telah direset.");
    }));

    $("deleteAccountBtn").addEventListener("click", () => openConfirm("Hapus seluruh data akun?", "Tindakan ini menghapus profil, progres, preferensi, dan subscription lokal lalu mengarahkanmu ke halaman login.", () => {
        localStorage.clear();
        window.location.href = "login.html";
    }));

    $("confirmCancel").addEventListener("click", closeConfirm);
    $("confirmAction").addEventListener("click", () => pendingConfirm?.());
    $("confirmModal").addEventListener("click", event => {
        if (event.target === $("confirmModal")) closeConfirm();
    });
    document.addEventListener("keydown", event => {
        if (event.key === "Escape") closeConfirm();
    });

    applyPreferences();
    render();

    const initialTab = location.hash.slice(1);
    if (["overview", "insights", "profile", "preferences", "privacy", "subscription"].includes(initialTab)) switchTab(initialTab);
})();
