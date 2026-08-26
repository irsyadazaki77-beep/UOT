(() => {
    "use strict";

    const Account = window.QuizNationAccount;

    const SESSION_KEY = "eduquestUserSession";
    const RPG_KEY = "eduquestRPG";
    const PREFS_KEY = "eduquestProfileSettings";
    const HUB_KEY = "eduquestProfileHub";
    const PROGRESS_KEYS = ["bahasa_progress", "eduquestLmsProgress", "eduquestProjectProgress", "eduquestRPG", "eduquestXP", "eduquestStreak", "eduquestLevel", "eduquestBestScore", "eduquestLastSession"];
    const BACKUP_KEYS = [SESSION_KEY, RPG_KEY, PREFS_KEY, HUB_KEY, "bahasa_progress", "eduquestLmsProgress", "eduquestProjectProgress", "eduquestSubscription", "eduquestSubscriptionDetails", "eduquestSubscriptionHistory", "eduquest_theme", "eduquest_sound"];
    const defaults = { headline: "", bio: "", focus: "frontend", language: "id", dailyGoal: "30", startPage: "index.html", reminder: true, reducedMotion: false, publicProfile: true, analytics: true, studyMode: "balanced", reminderTime: "19:00", accent: "emerald" };
    const hubDefaults = { focusNote: "", focusNoteUpdatedAt: "", missions: { read: false, quiz: false, review: false } };
    const tabAliases = { overview: "overview", insights: "overview", profile: "overview", settings: "settings", preferences: "settings", privacy: "privacy", subscription: "subscription" };
    const $ = (id) => document.getElementById(id);
    let pendingConfirm = null;
    let confirmTrigger = null;
    let saveTimer = null;
    let noteTimer = null;

    function readJSON(key, fallback) { return Account?.readJSON(key, fallback) ?? fallback; }
    function writeJSON(key, value) { return Account?.writeJSON(key, value) ?? false; }
    function getPrefs() { return Account?.getPreferences() || { ...defaults, ...readJSON(PREFS_KEY, {}) }; }
    function getHub() { return Account?.getHub() || { ...hubDefaults, ...readJSON(HUB_KEY, {}) }; }
    function session() { return Account?.getSession() || readJSON(SESSION_KEY, null); }
    function isLoggedIn() { return Boolean(session()?.isLoggedIn); }
    function subscription() { return window.QuizNationSubscription || null; }
    function isPro() { return subscription() ? subscription().isPro() : localStorage.getItem("eduquestSubscription") === "pro"; }
    function setText(id, value) { const node = $(id); if (node) node.textContent = value; }
    function showToast(text) { const toast = $("profileToast"); toast.textContent = text; toast.classList.add("show"); clearTimeout(showToast.timer); showToast.timer = setTimeout(() => toast.classList.remove("show"), 2600); }
    function formatDate(value) { const date = value ? new Date(value) : null; return date && !Number.isNaN(date.getTime()) ? new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(date) : "—"; }
    function updateSaveState(text = "Tersimpan otomatis") { setText("profileSaveState", text); }

    function calculateWonderfulXP(progress) {
        return ((progress.explored || []).length * 10) + ((progress.mastered || []).length * 20) + ((progress.quizDone || 0) * 15) + ((progress.voiceSuccessCount || 0) * 25) + Number(progress.bonusXP || 0);
    }
    function getStats() {
        if (Account) return Account.getStats();
        const culture = readJSON("bahasa_progress", {}); const lms = readJSON("eduquestLmsProgress", {}); const rpg = readJSON(RPG_KEY, {});
        const xp = Math.max(Number(localStorage.getItem("eduquestXP") || 0), Number(rpg.xp || 0), Number(lms.xp || 0), calculateWonderfulXP(culture));
        return { xp, streak: Math.max(Number(localStorage.getItem("eduquestStreak") || 0), Number(culture.streak || 0), Number(lms.streak || 0), Number(rpg.streak || 0)), accuracy: Math.round((Number(culture.correct || 0) / Math.max(Number(culture.reviewed || 0), 1)) * 100) };
    }
    function getProjectStats() {
        const progress = readJSON("eduquestProjectProgress", {});
        const records = progress?.projects && typeof progress.projects === "object" ? Object.values(progress.projects) : [];
        return { completed: records.filter(record => record?.status === "completed").length };
    }
    function getTip(stats, prefs) {
        if (stats.accuracy && stats.accuracy < 70) return { title: "Perkuat akurasi dengan review singkat.", copy: "Baca ringkasan materi lalu ulang satu quiz pendek. Pola kecil ini membantu jawabanmu lebih konsisten." };
        if (prefs.focus === "tka") return { title: "Jaga kombinasi konsep dan latihan.", copy: "Mulai dengan satu target SNBT, lalu tutup sesi dengan review kesalahan agar progres tetap terukur." };
        if (stats.streak < 3) return { title: "Bangun momentum kecil hari ini.", copy: "Satu sesi 15 menit sudah cukup untuk memulai streak yang lebih stabil." };
        return { title: "Ritmemu sedang tumbuh dengan baik.", copy: "Lanjutkan satu materi, satu latihan, dan satu catatan singkat untuk menjaga momentum." };
    }

    function applyPreferences() {
        const prefs = getPrefs(); const dark = localStorage.getItem("eduquest_theme") === "dark";
        document.body.classList.toggle("dark-theme", dark); document.body.classList.toggle("reduce-motion", prefs.reducedMotion); document.body.dataset.accent = prefs.accent;
        const icon = $("themeToggleBtn"); if (icon) { icon.innerHTML = `<i class="fa-solid ${dark ? "fa-sun" : "fa-moon"}" aria-hidden="true"></i>`; icon.setAttribute("aria-label", dark ? "Gunakan tema terang" : "Gunakan tema gelap"); }
    }

    function renderBenefits(pro) {
        const cards = [
            { icon: "fa-route", title: "Learning Command Center", basic: "Smart Route dan insight mastery untuk menentukan langkah terbaik.", pro: "Smart Route dan mastery insight siap membaca progresmu.", link: "materi.html" },
            { icon: "fa-bullseye", title: "SNBT Pro Accelerator", basic: "Planner sprint, diagnosis prioritas, dan ekspor rencana belajar.", pro: "Planner sprint dan diagnosis prioritas terbuka untuk target SNBT-mu.", link: "snbt.html" },
            { icon: "fa-passport", title: "Culture Passport", basic: "Quest harian, insight koleksi, serta bonus XP budaya 2×.", pro: "Culture Passport dan bonus XP 2× aktif untuk eksplorasimu.", link: "bahasa-daerah.html" }
        ];
        $("benefitGrid").innerHTML = cards.map(card => `<a class="p-benefit" href="${card.link}"><i class="fa-solid ${card.icon}" aria-hidden="true"></i><strong>${card.title}</strong><span>${pro ? card.pro : card.basic}</span><small>${pro ? "Akses aktif" : "Tersedia di PRO"}</small></a>`).join("");
    }

    function renderSubscription() {
        const sub = subscription(); const pro = isPro(); const details = sub?.get?.() || {}; const plan = details.planName || (pro ? "Pro Learning" : "Basic");
        $("membershipCard").classList.toggle("is-pro", pro); $("profileSubscriptionStatus").classList.toggle("is-pro", pro);
        setText("navSubscriptionBadge", pro ? "PRO" : "Basic"); $("navSubscriptionBadge").classList.toggle("is-pro", pro);
        setText("profilePlan", pro ? "PRO" : "Basic"); $("profilePlan").classList.toggle("is-pro", pro);
        setText("membershipKicker", pro ? "PRO membership active" : "Basic membership");
        setText("membershipTitle", pro ? `Selamat datang kembali di ${plan}.` : "Mulai unlock cara belajar yang lebih terarah.");
        setText("membershipDescription", pro ? "Benefit premium aktif di seluruh command center belajar kamu." : "Upgrade untuk membuka Smart Route, planner SNBT, dan Culture Passport.");
        setText("membershipStatus", pro ? "Aktif" : "Basic"); setText("membershipTimeLabel", pro ? "Berakhir" : "Akses"); setText("subscriptionDays", pro ? `${sub?.daysRemaining?.() || 0} hari` : "Terbatas"); setText("subscriptionInvoice", pro && details.invoice ? String(details.invoice).replace(/^UOT-/, "") : "—");
        const primary = $("membershipPrimaryAction"); primary.href = pro ? "pro-hub.html" : (sub?.planUrl?.("pro", "profile") || "payment.html?plan=pro&source=profile"); primary.querySelector("span").textContent = pro ? "Buka PRO Learning Hub" : "Upgrade ke PRO";
        setText("subscriptionDescription", pro ? "Paketmu aktif. Kelola akses premium tanpa kehilangan progres belajar." : "Pilih paket yang memberi ruang belajar paling sesuai.");
        setText("subscriptionStatusText", pro ? "PRO aktif" : "Akun Basic"); setText("subscriptionPlanName", pro ? plan : "Mulai perjalanan PRO-mu"); setText("subscriptionStatusDescription", pro ? "Seluruh benefit premium aktif dan progresmu tersimpan pada perangkat ini." : "Aktifkan akses premium untuk membuka seluruh command center belajar."); setText("subscriptionRenewal", pro ? formatDate(details.renewsAt) : "—"); setText("subscriptionInvoiceDetail", pro && details.invoice ? String(details.invoice) : "—");
        document.querySelectorAll("[data-checkout-plan]").forEach(button => { const current = pro && button.dataset.checkoutPlan === details.planId; button.disabled = current; button.textContent = current ? "Paket Aktif" : button.dataset.checkoutPlan === "annual" ? "Pilih Pro Tahunan" : "Pilih Pro Bulanan"; });
        $("manageBasicPlan").disabled = !pro; $("manageBasicPlan").textContent = pro ? "Kembali ke Basic" : "Paket Basic Aktif";
        renderBenefits(pro);
    }

    function render() {
        const user = session(); const rpg = readJSON(RPG_KEY, {}); const prefs = getPrefs(); const hub = getHub(); const stats = getStats(); const projectStats = getProjectStats(); const loggedIn = isLoggedIn();
        const progress = (typeof window !== "undefined" && window.ProgressionEngine) ? window.ProgressionEngine.getLevelProgress() : { level: Math.floor(stats.xp / 100) + 1, currentLevelXp: stats.xp % 100, xpNeededForNext: 100, percentage: stats.xp % 100, title: "Coder" };
        const avatar = (typeof window !== "undefined" && window.ProgressionEngine) ? (window.ProgressionEngine.getGameState().equippedItems?.avatar || user?.avatar || "👨‍💻") : (rpg.activeAvatar || user?.avatar || "👨‍💻");
        const name = user?.username || "Pengguna Universe"; const email = user?.email || "Belum masuk ke akun";
        const level = progress.level; const current = progress.currentLevelXp; const needed = progress.xpNeededForNext; const pct = progress.percentage;
        ["profileAvatar", "profileAvatarLarge"].forEach(id => setText(id, avatar)); setText("profileName", name); setText("profileEmail", email); setText("profileEditorName", name);
        setText("profileXp", stats.xp.toLocaleString("id-ID")); setText("profileStreak", stats.streak); setText("profileAccuracy", `${stats.accuracy}%`); setText("profileProjectCount", projectStats.completed); setText("profileLevel", `Level ${level}`); setText("profileXpLabel", `${current} / ${needed} XP`); setText("nextLevelLabel", `${needed - current} XP lagi menuju level berikutnya`); $("profileXpBar").style.width = `${pct}%`;
        const tip = getTip(stats, prefs); setText("smartTipTitle", tip.title); setText("smartTipText", tip.copy); setText("dailyGoalTitle", `${prefs.dailyGoal} menit`); setText("goalDescription", prefs.reminder ? `Pengingat aktif pukul ${prefs.reminderTime}` : "Pengingat belum aktif");
        const completeness = [loggedIn, Boolean(user?.username), Boolean(user?.email), Boolean(prefs.headline), Boolean(prefs.bio), Boolean(avatar)].filter(Boolean).length; const health = Math.round((completeness / 6) * 100); setText("healthScore", `${health}%`); $("healthBar").style.width = `${health}%`; setText("healthHint", health === 100 ? "Profilmu sudah lengkap dan siap dipersonalisasi." : "Lengkapi headline dan bio untuk personalisasi lebih baik."); if ($("healthDoneCount")) $("healthDoneCount").textContent = `${completeness}/6`;
        $("profileNameInput").value = user?.username || ""; $("profileEmailInput").value = user?.email || ""; $("profileHeadlineInput").value = prefs.headline; $("profileFocusInput").value = prefs.focus; $("profileBioInput").value = prefs.bio; setText("bioCount", prefs.bio.length); $("profileLoginCta").hidden = loggedIn; $("logoutLink").hidden = !loggedIn;
        setText("profileHeadlineDisplay", prefs.headline || "Tambahkan headline agar profilmu lebih personal.");
        setText("profileBioDisplay", prefs.bio || (loggedIn ? "Tambahkan bio singkat tentang target belajarmu." : "Masuk untuk menyimpan identitas dan progres belajarmu."));
        document.querySelectorAll("[data-avatar]").forEach(button => { button.classList.toggle("active", button.dataset.avatar === avatar); button.disabled = !loggedIn; });
        $("studyModeSetting").value = prefs.studyMode; $("dailyGoalSetting").value = prefs.dailyGoal; $("languageSetting").value = prefs.language; $("startPageSetting").value = prefs.startPage; $("reminderTimeSetting").value = prefs.reminderTime; $("darkModeSetting").checked = localStorage.getItem("eduquest_theme") === "dark"; $("soundSetting").checked = localStorage.getItem("eduquest_sound") !== "off"; $("motionSetting").checked = prefs.reducedMotion; $("reminderSetting").checked = prefs.reminder; $("publicProfileSetting").checked = prefs.publicProfile; $("analyticsSetting").checked = prefs.analytics; document.querySelectorAll("[data-accent]").forEach(button => button.classList.toggle("active", button.dataset.accent === prefs.accent));
        $("missionRead").checked = hub.missions.read; $("missionQuiz").checked = hub.missions.quiz; $("missionReview").checked = hub.missions.review; const done = Object.values(hub.missions).filter(Boolean).length; $("missionProgressBar").style.width = `${(done / 3) * 100}%`; setText("missionProgressLabel", `${done} dari 3 misi selesai.`); $("focusNoteInput").value = hub.focusNote; setText("focusNoteCount", `${hub.focusNote.length}/240 karakter`);
        if ($("missionSuccessBanner")) $("missionSuccessBanner").hidden = done !== 3;
        const studyHints = { balanced: "Balanced: Kombinasi seimbang antara materi & latihan.", sprint: "Sprint: Fokus pada penyelesaian soal dan tryout cepat.", deep: "Deep Work: Sesi materi mendalam tanpa gangguan interupsi.", chill: "Chill: Santai dengan bacaan santai dan eksplorasi budaya." };
        if ($("studyModeHint")) setText("studyModeHint", studyHints[prefs.studyMode] || studyHints.balanced);
        renderSubscription();
    }

    async function savePrefs(patch, message) { 
        if (Account) Account.updatePreferences(patch); 
        else writeJSON(PREFS_KEY, { ...getPrefs(), ...patch }); 
        
        // Sync to backend if logged in
        if (isLoggedIn()) {
            try {
                const csrfRes = await fetch("/api/csrf-token", { credentials: "include" });
                if (csrfRes.ok) {
                    const { csrfToken } = await csrfRes.json();
                    const backendPatch = { ...patch };
                    if (patch.publicProfile !== undefined) {
                        backendPatch.showOnLeaderboard = patch.publicProfile;
                    }
                    if (patch.headline !== undefined) {
                        backendPatch.displayName = document.getElementById("profileNameInput")?.value?.trim() || patch.headline;
                    }
                    await fetch("/api/settings", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
                        body: JSON.stringify(backendPatch),
                        credentials: "include"
                    });
                }
            } catch (e) {
                console.warn("API sync failed", e);
            }
        }

        applyPreferences(); 
        render(); 
        if (message) showToast(message); 
    }
    function saveProfile(notify = false) {
        if (!isLoggedIn()) { updateSaveState("Masuk untuk menyimpan profil"); return; }
        const nextSession = { ...session(), username: $("profileNameInput").value.trim() || "Pengguna Universe", email: $("profileEmailInput").value.trim(), isLoggedIn: true };
        if (Account) Account.setSession(nextSession); else localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
        savePrefs({ headline: $("profileHeadlineInput").value.trim(), focus: $("profileFocusInput").value, bio: $("profileBioInput").value.trim() }); updateSaveState("Tersimpan"); if (notify) showToast("Profil diperbarui.");
    }
    function saveHub(patch) { writeJSON(HUB_KEY, { ...getHub(), ...patch }); render(); }
    function switchTab(requested) {
        const name = tabAliases[requested] || "overview";
        document.querySelectorAll("[data-tab]").forEach(button => {
            const active = button.dataset.tab === name;
            button.classList.toggle("active", active);
            button.setAttribute("aria-current", active ? "page" : "false");
        });
        document.querySelectorAll("[data-panel]").forEach(panel => {
            const active = panel.dataset.panel === name;
            panel.classList.toggle("active", active);
            panel.hidden = !active;
        });
        history.replaceState(null, "", `#${name}`);
        window.dispatchEvent(new CustomEvent("uot-profile-tab-change", { detail: { name } }));
        window.scrollTo({ top: 0, behavior: document.body.classList.contains("reduce-motion") ? "auto" : "smooth" });
    }

    function focusables(container) { return [...container.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')]; }
    function openConfirm(title, text, action, trigger) { confirmTrigger = trigger || document.activeElement; pendingConfirm = action; setText("confirmTitle", title); setText("confirmText", text); $("confirmModal").classList.add("open"); $("confirmModal").setAttribute("aria-hidden", "false"); setTimeout(() => $("confirmAction").focus(), 0); }
    function closeConfirm() { $("confirmModal").classList.remove("open"); $("confirmModal").setAttribute("aria-hidden", "true"); pendingConfirm = null; confirmTrigger?.focus?.(); }

    let profileEditorTrigger = null;
    function openProfileEditor(trigger) {
        if (!isLoggedIn()) { location.href = `login.html?returnTo=${encodeURIComponent("profile.html")}`; return; }
        profileEditorTrigger = trigger || document.activeElement;
        const modal = $("profileEditorModal");
        modal.inert = false; modal.classList.add("open"); modal.setAttribute("aria-hidden", "false");
        document.body.classList.add("profile-editor-open");
        setTimeout(() => $("profileNameInput").focus(), 0);
    }
    function closeProfileEditor() {
        const modal = $("profileEditorModal");
        modal.classList.remove("open"); modal.setAttribute("aria-hidden", "true"); modal.inert = true;
        document.body.classList.remove("profile-editor-open"); profileEditorTrigger?.focus?.();
    }

    document.querySelectorAll("[data-tab]").forEach(button => button.addEventListener("click", () => switchTab(button.dataset.tab)));
    document.querySelectorAll("[data-tab-target]").forEach(button => button.addEventListener("click", () => switchTab(button.dataset.tabTarget)));
    $("themeToggleBtn").addEventListener("click", () => {
        localStorage.setItem("eduquest_theme", document.body.classList.contains("dark-theme") ? "light" : "dark");
        applyPreferences();
        $("darkModeSetting").checked = document.body.classList.contains("dark-theme");
    });
    $("profileForm").addEventListener("submit", event => { event.preventDefault(); saveProfile(true); });
    ["editProfileBtn", "railEditProfileBtn"].forEach(id => $(id)?.addEventListener("click", event => openProfileEditor(event.currentTarget)));
    ["closeProfileEditorBtn", "cancelProfileEditorBtn"].forEach(id => $(id)?.addEventListener("click", closeProfileEditor));
    $("profileEditorModal").addEventListener("click", event => { if (event.target === $("profileEditorModal")) closeProfileEditor(); });
    ["profileNameInput", "profileEmailInput", "profileHeadlineInput", "profileFocusInput", "profileBioInput"].forEach(id => $(id).addEventListener(id === "profileFocusInput" ? "change" : "input", () => {
        if (id === "profileBioInput") setText("bioCount", $(id).value.length);
        updateSaveState("Menyimpan…");
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => {
            const email = $("profileEmailInput");
            if (email.value && !email.checkValidity()) { updateSaveState("Periksa format email"); setText("profileEmailError", "Masukkan alamat email yang valid."); return; }
            setText("profileEmailError", "");
            saveProfile(false);
        }, 650);
    }));
    document.querySelectorAll("[data-avatar]").forEach(button => button.addEventListener("click", () => {
        if (!isLoggedIn()) return showToast("Masuk ke akun untuk memilih avatar.");
        const chosen = button.dataset.avatar;
        if (typeof window !== "undefined" && window.ProgressionEngine) {
            window.ProgressionEngine.equipAvatar(chosen);
        }
        const rpg = readJSON(RPG_KEY, {});
        writeJSON(RPG_KEY, { ...rpg, activeAvatar: chosen });
        render();
        showToast("Avatar diperbarui.");
    }));
    $("darkModeSetting").addEventListener("change", e => { localStorage.setItem("eduquest_theme", e.target.checked ? "dark" : "light"); applyPreferences(); });
    $("soundSetting").addEventListener("change", e => { localStorage.setItem("eduquest_sound", e.target.checked ? "on" : "off"); showToast("Preferensi suara diperbarui."); });
    $("motionSetting").addEventListener("change", e => savePrefs({ reducedMotion: e.target.checked }, "Preferensi gerakan diperbarui.")); $("reminderSetting").addEventListener("change", e => savePrefs({ reminder: e.target.checked }, "Pengingat belajar diperbarui.")); ["studyModeSetting", "dailyGoalSetting", "languageSetting", "startPageSetting", "reminderTimeSetting"].forEach(id => $(id).addEventListener("change", e => savePrefs({ [id.replace("Setting", "").replace("studyMode", "studyMode").replace("dailyGoal", "dailyGoal").replace("reminderTime", "reminderTime").replace("startPage", "startPage").replace("language", "language")]: e.target.value }, "Preferensi disimpan.")));
    $("publicProfileSetting").addEventListener("change", e => savePrefs({ publicProfile: e.target.checked }, "Preferensi privasi diperbarui.")); $("analyticsSetting").addEventListener("change", e => savePrefs({ analytics: e.target.checked }, "Preferensi analitik diperbarui.")); document.querySelectorAll("[data-accent]").forEach(button => button.addEventListener("click", () => savePrefs({ accent: button.dataset.accent }, "Warna aksen diperbarui.")));
    ["missionRead", "missionQuiz", "missionReview"].forEach(id => $(id).addEventListener("change", () => { const current = getHub(); current.missions = { read: $("missionRead").checked, quiz: $("missionQuiz").checked, review: $("missionReview").checked }; writeJSON(HUB_KEY, current); render(); }));
    $("resetMissionsBtn").addEventListener("click", event => openConfirm("Reset misi hari ini?", "Checklist misi akan dikosongkan. Catatan fokus tidak dihapus.", () => { saveHub({ missions: { read: false, quiz: false, review: false } }); closeConfirm(); showToast("Misi harian direset."); }, event.currentTarget));
    $("focusNoteInput").addEventListener("input", e => { setText("focusNoteCount", `${e.target.value.length}/240 karakter`); clearTimeout(noteTimer); noteTimer = setTimeout(() => { saveHub({ focusNote: e.target.value, focusNoteUpdatedAt: new Date().toISOString() }); showToast("Catatan fokus tersimpan."); }, 700); });
    document.querySelectorAll(".p-note-pill").forEach(pill => pill.addEventListener("click", () => { const note = pill.dataset.note; if (!note) return; $("focusNoteInput").value = note; setText("focusNoteCount", `${note.length}/240 karakter`); saveHub({ focusNote: note, focusNoteUpdatedAt: new Date().toISOString() }); const status = $("focusNoteStatus"); if (status) { status.textContent = "Tersimpan ✨"; setTimeout(() => status.textContent = "Tersimpan", 1500); } showToast("Saran catatan diterapkan."); }));
    $("resetPreferences").addEventListener("click", event => openConfirm("Kembalikan preferensi default?", "Tema, target, mode belajar, dan pilihan tampilan akan dikembalikan ke nilai awal.", () => { writeJSON(PREFS_KEY, defaults); applyPreferences(); render(); closeConfirm(); showToast("Preferensi dikembalikan ke default."); }, event.currentTarget));
    document.querySelectorAll("[data-plan]").forEach(button => button.addEventListener("click", event => { const sub = subscription(); if (button.dataset.plan === "pro") { const plan = button.dataset.checkoutPlan || "pro"; if (isPro() && sub?.get?.().planId === plan) return showToast("Paket ini sudah aktif."); location.href = sub?.planUrl?.(plan, "profile") || `payment.html?plan=${plan}&source=profile`; return; } if (!isPro()) return; openConfirm("Kembali ke paket Basic?", "Benefit PRO akan dinonaktifkan di perangkat ini. Seluruh progres belajar tetap tersimpan.", () => { if (sub?.downgrade) sub.downgrade(); else localStorage.setItem("eduquestSubscription", "free"); render(); closeConfirm(); showToast("Paket Basic aktif. Progresmu tetap aman."); }, event.currentTarget); }));
    $("exportDataBtn").addEventListener("click", () => { const payload = Account?.createBackup() || { exportedAt:new Date().toISOString(), app:"Universe Of Tech", version:3, data:Object.fromEntries(BACKUP_KEYS.map(key => [key, localStorage.getItem(key)])) }; const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = "universe-of-tech-account-backup-v3.json"; link.hidden = true; document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 0); showToast("Backup versi 3 berhasil dibuat."); });
    $("importDataBtn").addEventListener("click", () => $("importDataInput").click()); $("importDataInput").addEventListener("change", async event => { const file = event.target.files?.[0]; if (!file) return; try { const inspection = await Account.inspectBackup(file); openConfirm("Pulihkan backup akun?", `Backup versi ${inspection.version} berisi ${inspection.entries.length} kelompok data. Data saat ini pada kelompok yang sama akan diganti.`, () => { Account.importBackup(inspection); applyPreferences(); render(); closeConfirm(); showToast("Backup berhasil dipulihkan."); }, $("importDataBtn")); } catch (error) { showToast(error.message === "FILE_TOO_LARGE" ? "File backup melebihi batas 1 MB." : "File backup tidak valid."); } event.target.value = ""; });
    $("resetProgressBtn").addEventListener("click", event => openConfirm("Reset seluruh progres belajar?", "XP, streak, quiz, dan progres budaya akan dihapus. Profil, pengaturan, dan paketmu tetap tersimpan.", () => { PROGRESS_KEYS.forEach(key => localStorage.removeItem(key)); render(); closeConfirm(); showToast("Progres belajar telah direset."); }, event.currentTarget));
    $("deleteAccountBtn").addEventListener("click", event => openConfirm("Hapus seluruh data akun?", "Tindakan ini menghapus profil, progres, preferensi, dan subscription Universe Of Tech dari perangkat ini.", () => { Account?.deleteAccountData(); location.href = "login.html"; }, event.currentTarget));
    $("logoutLink").addEventListener("click", event => { event.preventDefault(); Account?.signOut(); location.href = "login.html"; });
    $("confirmCancel").addEventListener("click", closeConfirm); $("confirmAction").addEventListener("click", () => pendingConfirm?.()); $("confirmModal").addEventListener("click", event => { if (event.target === $("confirmModal")) closeConfirm(); });
    document.addEventListener("keydown", event => { const modal = $("confirmModal").classList.contains("open") ? $("confirmModal") : $("profileEditorModal").classList.contains("open") ? $("profileEditorModal") : null; if (!modal) return; if (event.key === "Escape") { event.preventDefault(); modal === $("confirmModal") ? closeConfirm() : closeProfileEditor(); } if (event.key === "Tab") { const list = focusables(modal); if (!list.length) return; const first = list[0], last = list[list.length - 1]; if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); } } });
    window.addEventListener("uot-subscription-change", render);
    applyPreferences(); render(); const initial = location.hash.slice(1); if (initial) switchTab(initial);
})();
