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
    function showToast(text) { const toast = $("profileToast"); if (!toast) return; toast.textContent = text; toast.classList.add("show"); clearTimeout(showToast.timer); showToast.timer = setTimeout(() => toast.classList.remove("show"), 2600); }
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

    
    async function renderMastery() {
        if (typeof window === "undefined" || !window.RecommendationService) return;
        try {
            const recs = await window.RecommendationService.getRecommendations();
            if (!recs || !recs.masterySummary) return;
            
            const skills = Object.values(recs.masterySummary).filter(m => m.score > 0);
            const strongest = [...skills].sort((a,b) => b.score - a.score).slice(0, 3);
            const weakest = [...skills].sort((a,b) => a.score - b.score).slice(0, 3);
            
            const renderSkill = (s) => `<div style="display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; flex-direction: column;">
                    <span style="font-size: 13px; font-weight: 600; color: var(--uot-text);">${s.skillName}</span>
                    <span style="font-size: 11px; color: var(--uot-text-muted);">${s.tier.label} ${s.tier.badge} · ${s.attemptsCount} percobaan</span>
                </div>
                <div style="font-weight: 800; font-size: 14px; color: ${s.tier.color};">${s.score}%</div>
            </div>`;
            
            const strongEl = document.getElementById("masteryStrongest");
            if (strongEl) {
                strongEl.innerHTML = strongest.length > 0 ? strongest.map(renderSkill).join('<div style="height: 1px; background: var(--uot-border);"></div>') : '<p style="font-size: 13px; color: var(--uot-text-muted);">Belum ada data mastery.</p>';
            }
            
            const weakEl = document.getElementById("masteryWeakest");
            if (weakEl) {
                weakEl.innerHTML = weakest.length > 0 ? weakest.map(renderSkill).join('<div style="height: 1px; background: var(--uot-border);"></div>') : '<p style="font-size: 13px; color: var(--uot-text-muted);">Terus berlatih untuk mengukur kelemahan.</p>';
            }
        } catch (e) {
            console.error("Mastery rendering failed:", e);
        }
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
        $("membershipCard")?.classList.toggle("is-pro", pro); $("profileSubscriptionStatus")?.classList.toggle("is-pro", pro);
        setText("navSubscriptionBadge", pro ? "PRO" : "Basic"); $("navSubscriptionBadge")?.classList.toggle("is-pro", pro);
        setText("profilePlan", pro ? "PRO" : "Basic"); $("profilePlan")?.classList.toggle("is-pro", pro);
        setText("membershipKicker", pro ? "PRO membership active" : "Basic membership");
        setText("membershipTitle", pro ? `Selamat datang kembali di ${plan}.` : "Mulai unlock cara belajar yang lebih terarah.");
        setText("membershipDescription", pro ? "Benefit premium aktif di seluruh command center belajar kamu." : "Upgrade untuk membuka Smart Route, planner SNBT, dan Culture Passport.");
        setText("membershipStatus", pro ? "Aktif" : "Basic"); setText("membershipTimeLabel", pro ? "Berakhir" : "Akses"); setText("subscriptionDays", pro ? `${sub?.daysRemaining?.() || 0} hari` : "Terbatas"); setText("subscriptionInvoice", pro && details.invoice ? String(details.invoice).replace(/^UOT-/, "") : "—");
        const primary = $("membershipPrimaryAction");
        if (primary) {
            primary.href = pro ? "pro-hub.html" : (sub?.planUrl?.("pro", "profile") || "payment.html?plan=pro&source=profile");
            const span = primary.querySelector("span");
            if (span) span.textContent = pro ? "Buka PRO Learning Hub" : "Upgrade ke PRO";
        }
        setText("subscriptionDescription", pro ? "Paketmu aktif. Kelola akses premium tanpa kehilangan progres belajar." : "Pilih paket yang memberi ruang belajar paling sesuai.");
        setText("subscriptionStatusText", pro ? "PRO aktif" : "Akun Basic"); setText("subscriptionPlanName", pro ? plan : "Mulai perjalanan PRO-mu"); setText("subscriptionStatusDescription", pro ? "Seluruh benefit premium aktif dan progresmu tersimpan pada perangkat ini." : "Aktifkan akses premium untuk membuka seluruh command center belajar."); setText("subscriptionRenewal", pro ? formatDate(details.renewsAt) : "—"); setText("subscriptionInvoiceDetail", pro && details.invoice ? String(details.invoice) : "—");
        document.querySelectorAll("[data-checkout-plan]").forEach(button => { const current = pro && button.dataset.checkoutPlan === details.planId; button.disabled = current; button.textContent = current ? "Paket Aktif" : button.dataset.checkoutPlan === "annual" ? "Pilih Pro Tahunan" : "Pilih Pro Bulanan"; });
        const manageBasic = $("manageBasicPlan");
        if (manageBasic) {
            manageBasic.disabled = !pro;
            manageBasic.textContent = pro ? "Kembali ke Basic" : "Paket Basic Aktif";
        }
        renderBenefits(pro);
    }

    
    function render() {
        const session = readJSON("eduquestUserSession", null);
        const prefs = getPrefs();
        const rpg = readJSON("eduquestRPG", {});
        const avatar = rpg.activeAvatar || session?.avatar || "👨‍💻";
        const name = session?.username || "Pengguna Universe";
        
        if (document.getElementById("profileEditorName")) document.getElementById("profileEditorName").textContent = name;
        if (document.getElementById("profileAvatarLarge")) document.getElementById("profileAvatarLarge").textContent = avatar;
        
        const headline = prefs.headline || "Tambahkan headline agar profilmu lebih personal.";
        if (document.getElementById("profileHeadlineDisplay")) document.getElementById("profileHeadlineDisplay").textContent = headline;
        
        const bio = prefs.bio || "Identitas ini digunakan di seluruh pengalaman belajarmu.";
        if (document.getElementById("profileBioDisplay")) document.getElementById("profileBioDisplay").textContent = bio;
        
        // Stats
        if (document.getElementById("profileXp")) document.getElementById("profileXp").textContent = rpg.xp || 0;
        if (document.getElementById("profileStreak")) document.getElementById("profileStreak").textContent = rpg.streak || 0;
        if (document.getElementById("profileAccuracy")) document.getElementById("profileAccuracy").textContent = (rpg.accuracy || 0) + "%";
        if (document.getElementById("profileProjectCount")) document.getElementById("profileProjectCount").textContent = rpg.projects || 0;
        
        const level = rpg.level || 1;
        if (document.getElementById("profileLevel")) document.getElementById("profileLevel").textContent = "Level " + level;
        
        const xpForNext = level * 100;
        if (document.getElementById("profileXpLabel")) document.getElementById("profileXpLabel").textContent = (rpg.xp || 0) + " / " + xpForNext + " XP";
        
        const pct = Math.min(100, ((rpg.xp || 0) / xpForNext) * 100);
        if (document.getElementById("profileXpBar")) document.getElementById("profileXpBar").style.width = pct + "%";
        
        if (document.getElementById("nextLevelLabel")) document.getElementById("nextLevelLabel").textContent = (xpForNext - (rpg.xp || 0)) + " XP lagi menuju level berikutnya";
        
        renderHealthBreakdown();
        renderSubscription();
        renderMastery();
    }
    
    const saveStateNode = document.getElementById("profileSaveState");
    if (saveStateNode && typeof MutationObserver !== "undefined") {
        new MutationObserver(() => {
            syncSaveState();
        }).observe(saveStateNode, { childList: true, characterData: true, subtree: true });
    }


    const LAST_PANEL_KEY = "eduquestProfileLastPanel";
    const legacyAliases = tabAliases;

    function updateScrollUI() {
        const btn = document.getElementById("profileBackTop");
        if (btn) {
            btn.classList.toggle("show", window.scrollY > 300);
        }
    }
    window.addEventListener("scroll", updateScrollUI);

    function setSectionContext(tabId) {
        if (!tabId) return;
        const targetTab = legacyAliases[tabId] || tabId;

        try {
            localStorage.setItem(LAST_PANEL_KEY, targetTab);
        } catch (_) {}

        document.querySelectorAll('.p-rail-nav button, .p-mobile-nav button').forEach(btn => {
            const isTarget = btn.dataset.tab === targetTab;
            btn.classList.toggle('active', isTarget);
            btn.setAttribute('aria-selected', isTarget ? 'true' : 'false');
        });

        document.querySelectorAll('.p-content .p-panel').forEach(panel => {
            const isTarget = panel.dataset.panel === targetTab;
            panel.classList.toggle('active', isTarget);
        });

        updateScrollUI();
    }

    function syncSaveState() {
        const node = document.getElementById("profileSaveState");
        if (!node) return;
        const value = (node.textContent || "").toLowerCase();
        node.className = "p-save-state " + (value.includes("gagal") || value.includes("error") ? "error" : value.includes("menyimpan") || value.includes("sinkronisasi") ? "syncing" : "success");
    }
    window.addEventListener("uot-subscription-change", () => setTimeout(() => document.body.classList.toggle("profile-pro", window.QuizNationSubscription?.isPro?.()), 0));

    // Bind Tab Click Handlers for both Rail and Mobile Navs
    document.querySelectorAll('.p-rail-nav button, .p-mobile-nav button').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            if (tab) {
                setSectionContext(tab);
                location.hash = tab;
            }
        });
    });

    renderHealthBreakdown();
    syncSaveState();
    updateScrollUI();
    const requestedRaw = location.hash.slice(1);
    const requested = legacyAliases[requestedRaw] || requestedRaw;
    const remembered = localStorage.getItem(LAST_PANEL_KEY);
    const initial = ["overview", "progress", "settings", "privacy", "subscription"].includes(requested) ? requested : ["overview", "progress", "settings", "privacy", "subscription"].includes(remembered) ? remembered : "overview";
    setSectionContext(initial);
    
    document.body.classList.toggle("profile-pro", window.QuizNationSubscription?.isPro?.() || false);
    requestAnimationFrame(() => document.body.classList.add("profile-refined"));
})();
