(function () {
    "use strict";
    if (document.body.dataset.page !== "profile") return;

    const $ = (id) => document.getElementById(id);
    const LAST_PANEL_KEY = "eduquestProfileLastPanel";
    const labels = { overview: "Account hub", settings: "Preferensi", privacy: "Privasi & data", subscription: "Subscription" };
    const legacyAliases = { insights: "overview", profile: "overview", preferences: "settings" };
    let paletteTrigger = null;

    function readJSON(key, fallback) { try { return JSON.parse(localStorage.getItem(key) || "null") ?? fallback; } catch { return fallback; } }
    function focusable(container) { return [...container.querySelectorAll('button:not([disabled]):not([hidden]), a[href]:not([hidden]), input:not([disabled]):not([hidden]), [tabindex]:not([tabindex="-1"])')].filter(node => node.offsetParent !== null); }

    function setSectionContext(name) {
        const resolved = labels[name] ? name : "overview";
        const labelEl = $("currentSectionLabel");
        if (labelEl) labelEl.textContent = labels[resolved];
        localStorage.setItem(LAST_PANEL_KEY, resolved);
        document.title = `${labels[resolved]} — Universe Of Tech`;
    }

    function renderHealthBreakdown() {
        const session = readJSON("eduquestUserSession", null);
        const prefs = readJSON("eduquestProfileSettings", {});
        const rpg = readJSON("eduquestRPG", {});
        const checks = [
            [Boolean(session?.isLoggedIn), "Masuk ke akun"],
            [Boolean(session?.username), "Tambahkan nama"],
            [Boolean(session?.email), "Tambahkan email"],
            [Boolean(prefs.headline), "Tulis headline"],
            [Boolean(prefs.bio), "Lengkapi bio"],
            [Boolean(rpg.activeAvatar || session?.avatar), "Pilih avatar"]
        ];
        const doneCount = checks.filter(c => c[0]).length;
        if ($("healthDoneCount")) $("healthDoneCount").textContent = `${doneCount}/6`;
        const breakdown = $("healthBreakdown");
        if (breakdown) {
            breakdown.innerHTML = checks.map(([done, label]) => `<div class="${done ? "done" : ""}" role="menuitem" tabindex="0" title="${done ? "Tuntas" : "Klik untuk melengkapi"}"><i class="fa-solid ${done ? "fa-check" : "fa-minus"}" aria-hidden="true"></i><span>${label}</span></div>`).join("");
            breakdown.querySelectorAll("div[role='menuitem']").forEach(item => {
                item.addEventListener("click", () => {
                    if (!item.classList.contains("done")) {
                        $("editProfileBtn")?.click();
                        $("healthDetailsBtn")?.setAttribute("aria-expanded", "false");
                        breakdown.hidden = true;
                    }
                });
            });
        }
    }

    function syncSaveState() {
        const node = $("profileSaveState");
        if (!node) return;
        const value = (node.textContent || "").toLowerCase();
        node.classList.toggle("is-saving", value.includes("menyimpan"));
        node.classList.toggle("is-blocked", value.includes("masuk"));
    }

    function openPalette(trigger) {
        paletteTrigger = trigger || document.activeElement;
        const palette = $("commandPalette");
        if (!palette) return;
        palette.inert = false;
        palette.classList.add("open");
        palette.setAttribute("aria-hidden", "false");
        if ($("commandSearch")) {
            $("commandSearch").value = "";
            filterCommands("");
            requestAnimationFrame(() => $("commandSearch").focus());
        }
    }

    function closePalette() {
        const palette = $("commandPalette");
        if (!palette) return;
        palette.classList.remove("open");
        palette.setAttribute("aria-hidden", "true");
        palette.inert = true;
        paletteTrigger?.focus?.();
    }

    function filterCommands(query) {
        const normalized = query.trim().toLowerCase();
        const list = $("commandList");
        if (!list) return;
        const items = [...list.children];
        let visible = 0;
        items.forEach(item => {
            const match = !normalized || item.textContent.toLowerCase().includes(normalized);
            item.hidden = !match;
            if (match) visible++;
        });
        if ($("commandEmpty")) $("commandEmpty").hidden = visible > 0;
    }

    function updateScrollUI() {
        const active = window.scrollY > 24;
        document.querySelector(".p-topbar")?.classList.toggle("is-scrolled", active);
        const showBackTop = window.scrollY > 560;
        const backTop = $("profileBackTop");
        if (backTop) {
            backTop.classList.toggle("show", showBackTop);
            backTop.tabIndex = showBackTop ? 0 : -1;
            backTop.setAttribute("aria-hidden", String(!showBackTop));
        }
    }

    document.querySelectorAll("[data-tab]").forEach(button => button.addEventListener("click", () => {
        setSectionContext(button.dataset.tab);
        if (button.closest(".p-mobile-nav") && navigator.vibrate) navigator.vibrate(12);
    }));
    window.addEventListener("uot-profile-tab-change", event => setSectionContext(event.detail?.name));

    $("healthDetailsBtn")?.addEventListener("click", event => {
        const open = event.currentTarget.getAttribute("aria-expanded") !== "true";
        event.currentTarget.setAttribute("aria-expanded", String(open));
        if ($("healthBreakdown")) $("healthBreakdown").hidden = !open;
    });
    document.addEventListener("click", event => {
        if (!event.target.closest(".p-health-card")) {
            $("healthDetailsBtn")?.setAttribute("aria-expanded", "false");
            if ($("healthBreakdown")) $("healthBreakdown").hidden = true;
        }
    });

    $("commandPaletteBtn")?.addEventListener("click", event => openPalette(event.currentTarget));
    $("commandSearch")?.addEventListener("input", event => filterCommands(event.target.value));
    $("commandSearch")?.addEventListener("keydown", event => {
        if (event.key !== "Enter") return;
        const list = $("commandList");
        if (!list) return;
        const first = [...list.children].find(item => !item.hidden);
        if (first) { event.preventDefault(); first.click(); }
    });
    $("commandList")?.addEventListener("click", event => {
        const tabCommand = event.target.closest("[data-command-tab]");
        if (!tabCommand) return;
        document.querySelector(`.p-rail-nav [data-tab="${tabCommand.dataset.commandTab}"]`)?.click();
        closePalette();
    });
    $("commandPalette")?.addEventListener("click", event => { if (event.target === $("commandPalette")) closePalette(); });

    document.addEventListener("keydown", event => {
        const palette = $("commandPalette");
        if (!palette) return;
        const paletteOpen = palette.classList.contains("open");
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); paletteOpen ? closePalette() : openPalette(); return; }
        if (!paletteOpen) return;
        if (event.key === "Escape") { event.preventDefault(); closePalette(); return; }
        if (event.key === "Tab") {
            const items = focusable(palette);
            if (!items.length) return;
            const first = items[0], last = items[items.length - 1];
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        }
    });

    $("profileBackTop")?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: document.body.classList.contains("reduce-motion") ? "auto" : "smooth" }));
    window.addEventListener("scroll", updateScrollUI, { passive: true });
    const saveStateNode = $("profileSaveState");
    if (saveStateNode) {
        new MutationObserver(() => { renderHealthBreakdown(); syncSaveState(); }).observe(saveStateNode, { childList: true, characterData: true, subtree: true });
    }
    window.addEventListener("uot-subscription-change", () => setTimeout(() => document.body.classList.toggle("profile-pro", window.QuizNationSubscription?.isPro?.()), 0));

    renderHealthBreakdown();
    syncSaveState();
    updateScrollUI();
    const requestedRaw = location.hash.slice(1);
    const requested = legacyAliases[requestedRaw] || requestedRaw;
    const remembered = localStorage.getItem(LAST_PANEL_KEY);
    const initial = ["overview", "settings", "privacy", "subscription"].includes(requested) ? requested : ["overview", "settings", "privacy", "subscription"].includes(remembered) ? remembered : "overview";
    if (!requested && initial !== "overview") document.querySelector(`.p-rail-nav [data-tab="${initial}"]`)?.click();
    else setSectionContext(initial);
    document.body.classList.toggle("profile-pro", window.QuizNationSubscription?.isPro?.() || false);
    requestAnimationFrame(() => document.body.classList.add("profile-refined"));
})();
