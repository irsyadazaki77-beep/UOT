(function () {
    "use strict";

    const STATUS_KEY = "eduquestSubscription";
    const DETAILS_KEY = "eduquestSubscriptionDetails";
    const HISTORY_KEY = "eduquestSubscriptionHistory";
    const DAY = 86400000;
    const PLANS = {
        pro: {
            id: "pro",
            name: "Pro Bulanan",
            price: 49000,
            period: "bulan",
            durationDays: 30,
            badge: "Paling fleksibel",
            description: "Semua fitur PRO dengan tagihan bulanan."
        },
        annual: {
            id: "annual",
            name: "Pro Tahunan",
            price: 399000,
            period: "tahun",
            durationDays: 365,
            badge: "Hemat 32%",
            description: "Akses PRO satu tahun dengan harga terbaik."
        },
        premium: {
            id: "premium",
            name: "Pro Mentor",
            price: 99000,
            period: "bulan",
            durationDays: 30,
            badge: "Dukungan mentor",
            description: "Seluruh benefit PRO plus simulasi review mentor."
        }
    };
    const BENEFITS = {
        materi: [
            "Seluruh jalur belajar langsung terbuka",
            "Smart Route berdasarkan progres terlemah",
            "Focus Sprint dan ekspor progres belajar",
            "Insight mastery lintas 252 pelajaran"
        ],
        snbt: [
            "Planner sprint 7 hari yang personal",
            "Diagnosis subtes dan prioritas materi",
            "Target harian, simulasi, dan review terarah",
            "Ekspor rencana belajar intensif"
        ],
        budaya: [
            "Culture Passport dan quest harian",
            "Catatan budaya serta rencana eksplorasi",
            "Pencarian cepat dan navigasi personal",
            "Bonus 2x XP pada aktivitas budaya"
        ],
        account: [
            "PRO Learning Hub dan mentor BUBUB",
            "Backup progres serta sertifikat kompetensi",
            "Tema dan pengalaman belajar premium",
            "Benefit baru otomatis selama paket aktif"
        ]
    };

    function read(key, fallback) {
        try { return JSON.parse(localStorage.getItem(key) || "null") ?? fallback; }
        catch { return fallback; }
    }

    function write(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
        return value;
    }

    function normalize(raw) {
        const simplePro = localStorage.getItem(STATUS_KEY) === "pro";
        if (!raw && !simplePro) return { status: "basic", planId: "basic", autoRenew: false };
        if (!raw && simplePro) {
            const startedAt = new Date().toISOString();
            return { status: "active", planId: "pro", startedAt, renewsAt: new Date(Date.now() + 30 * DAY).toISOString(), autoRenew: true, source: "legacy" };
        }
        const details = { ...raw };
        if (details.status === "active" && details.renewsAt && new Date(details.renewsAt).getTime() < Date.now() && !details.autoRenew) {
            details.status = "expired";
            localStorage.setItem(STATUS_KEY, "free");
        }
        return details;
    }

    function get() {
        const normalized = normalize(read(DETAILS_KEY, null));
        if (normalized.status === "active" && !read(DETAILS_KEY, null)) write(DETAILS_KEY, normalized);
        return normalized;
    }

    function isPro() {
        const details = get();
        return localStorage.getItem(STATUS_KEY) === "pro" && details.status === "active";
    }

    function activate(planId, meta) {
        const plan = PLANS[planId] || PLANS.pro;
        const now = new Date();
        const details = {
            status: "active",
            planId: plan.id,
            planName: plan.name,
            price: plan.price,
            period: plan.period,
            startedAt: now.toISOString(),
            renewsAt: new Date(now.getTime() + plan.durationDays * DAY).toISOString(),
            autoRenew: true,
            invoice: meta?.invoice || `UOT-${Date.now().toString(36).toUpperCase()}`,
            method: meta?.method || "demo",
            amountPaid: Number(meta?.amountPaid ?? plan.price),
            source: meta?.source || "payment"
        };
        localStorage.setItem(STATUS_KEY, "pro");
        write(DETAILS_KEY, details);
        const history = read(HISTORY_KEY, []);
        history.unshift({ ...details, recordedAt: now.toISOString() });
        write(HISTORY_KEY, history.slice(0, 24));
        window.dispatchEvent(new CustomEvent("uot-subscription-change", { detail: details }));
        return details;
    }

    function downgrade() {
        const previous = get();
        const next = { ...previous, status: "basic", planId: "basic", autoRenew: false, endedAt: new Date().toISOString() };
        localStorage.setItem(STATUS_KEY, "free");
        write(DETAILS_KEY, next);
        window.dispatchEvent(new CustomEvent("uot-subscription-change", { detail: next }));
        return next;
    }

    function daysRemaining() {
        const details = get();
        if (!isPro() || !details.renewsAt) return 0;
        return Math.max(0, Math.ceil((new Date(details.renewsAt).getTime() - Date.now()) / DAY));
    }

    function formatPrice(value) {
        return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
    }

    function planUrl(planId, source) {
        const url = new URL("payment.html", location.href);
        url.searchParams.set("plan", PLANS[planId] ? planId : "pro");
        if (source) url.searchParams.set("source", source);
        return `${url.pathname.split("/").pop()}${url.search}`;
    }

    async function syncWithServer() {
        if (typeof window !== "undefined" && window.QuizNationAPI?.verifySubscription) {
            try {
                const res = await window.QuizNationAPI.verifySubscription();
                if (res && res.ok) {
                    if (res.active === false && !res.isDemo && localStorage.getItem(STATUS_KEY) === "pro") {
                        // Server states not active on non-demo mode, invalidate unauthorized client pro claim
                        localStorage.setItem(STATUS_KEY, "free");
                        const current = get();
                        if (current.status === "active" && current.source !== "sandbox_demo") {
                            current.status = "expired";
                            write(DETAILS_KEY, current);
                            window.dispatchEvent(new CustomEvent("uot-subscription-change", { detail: current }));
                        }
                    } else if (res.active && res.status === "active") {
                        localStorage.setItem(STATUS_KEY, "pro");
                    }
                }
            } catch (_) {}
        }
    }

    if (typeof window !== "undefined") {
        setTimeout(syncWithServer, 1000);
    }

    window.QuizNationSubscription = {
        STATUS_KEY, DETAILS_KEY, HISTORY_KEY, PLANS, BENEFITS,
        get, isPro, activate, downgrade, daysRemaining, formatPrice, planUrl, syncWithServer
    };
})();
