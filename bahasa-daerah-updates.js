(function () {
    "use strict";

    const data = window.WonderfulData;
    const core = window.WonderfulCore;
    if (!data || !core || document.body.dataset.page !== "bahasa") return;

    const $ = (selector) => document.querySelector(selector);
    const all = (selector) => Array.from(document.querySelectorAll(selector));
    let userSession = null;
    try {
        userSession = JSON.parse(localStorage.getItem("eduquestUserSession") || "null");
    } catch {
        userSession = null;
    }
    const isLoggedIn = Boolean(userSession?.isLoggedIn);
    const isPro = isLoggedIn && localStorage.getItem("eduquestSubscription") === "pro";
    const progress = core.getProgress();
    const explored = new Set(progress.explored || []);
    const mastered = new Set(progress.mastered || []);
    const favorites = new Set(progress.favorites || []);
    const accuracy = Math.round(((progress.correct || 0) / Math.max(progress.reviewed || 0, 1)) * 100);
    const hour = new Date().getHours();
    const greeting = hour < 11 ? "Selamat pagi" : hour < 15 ? "Selamat siang" : hour < 19 ? "Selamat sore" : "Selamat malam";

    function setText(selector, value) {
        const element = $(selector);
        if (element) element.textContent = value;
    }

    function focusableElements(container) {
        if (!container) return [];
        return all('a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])')
            .filter((element) => container.contains(element) && element.offsetParent !== null);
    }

    function keepFocusInside(event, container) {
        if (event.key !== "Tab") return;
        const focusable = focusableElements(container);
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }

    function syncBodyLock() {
        const locked = document.body.classList.contains("drawer-open")
            || document.body.classList.contains("command-open")
            || document.body.classList.contains("paywall-open");
        document.body.style.overflow = locked ? "hidden" : "";
        document.querySelector("main.page")?.setAttribute("aria-hidden", locked ? "true" : "false");
    }

    function pulseMapFocus() {
        document.body.classList.add("map-focused");
        window.setTimeout(() => document.body.classList.remove("map-focused"), 1200);
    }

    function syncEntitlementUI() {
        document.body.classList.toggle("wonderful-pro", isPro);
        document.body.classList.toggle("wonderful-basic", !isPro);
        const status = $(".subscription-status");
        status?.classList.toggle("is-pro", isPro);
        setText("#wonderfulPlanStatus", isPro ? "Pro Member" : "Basic Access");
        setText("#wonderfulPlanAction", isPro ? "Kelola Paket" : isLoggedIn ? "Lihat Pro" : "Masuk untuk Pro");
        setText("#proXpStatus", isPro ? "Aktif - 2x XP" : "Terkunci");
        const planAction = $("#wonderfulPlanAction");
        if (planAction) planAction.href = isLoggedIn ? "profile.html#subscription" : "login.html";

        if (!isPro) {
            all(".pro-entitlement > :not(.pro-lock-layer)").forEach((element) => {
                element.inert = true;
                element.setAttribute("aria-hidden", "true");
            });
        }
    }

    function openPaywall(featureName) {
        const paywall = $("#proPaywall");
        if (!paywall) return;
        paywall.dataset.returnFocus = document.activeElement?.id || "";
        setText("#proPaywallText", `${featureName || "Fitur ini"} hanya tersedia untuk akun dengan langganan Pro aktif.`);
        paywall.classList.add("open");
        paywall.setAttribute("aria-hidden", "false");
        document.body.classList.add("paywall-open");
        syncBodyLock();
        setTimeout(() => $("#proPaywallClose")?.focus(), 30);
    }

    function closePaywall() {
        const paywall = $("#proPaywall");
        paywall?.classList.remove("open");
        paywall?.setAttribute("aria-hidden", "true");
        document.body.classList.remove("paywall-open");
        syncBodyLock();
        const returnTarget = paywall?.dataset.returnFocus ? document.getElementById(paywall.dataset.returnFocus) : null;
        returnTarget?.focus?.();
    }

    function setupPaywall() {
        $("#proPaywallClose")?.addEventListener("click", closePaywall);
        $("#proPaywallLater")?.addEventListener("click", closePaywall);
        $("#proPaywall")?.addEventListener("click", (event) => {
            if (event.target === $("#proPaywall")) closePaywall();
        });
        $(".pro-lock-layer")?.addEventListener("click", (event) => {
            if (event.target.closest("a")) return;
            openPaywall("Pusat Eksplorasi Personal");
        });
        addEventListener("keydown", (event) => {
            if (!$("#proPaywall")?.classList.contains("open")) return;
            if (event.key === "Escape") closePaywall();
            keepFocusInside(event, $("#proPaywall"));
        });
    }

    function setHubMetrics() {
        setText("#hubExplored", explored.size);
        setText("#hubMastered", mastered.size);
        setText("#hubFavorites", favorites.size);
        setText("#hubAccuracy", `${accuracy}%`);
        setText("#explorerGreeting", `${greeting}. Kamu telah membuka ${explored.size} dari ${data.places.length} daerah. Pilih langkah kecil berikutnya.`);
    }

    function recommendation() {
        const storedId = core.storage.get("wonder_place", "");
        const stored = data.getPlaceById(storedId);
        if (stored && explored.has(stored.id) && !mastered.has(stored.id)) return stored;
        return data.places.find((place) => !explored.has(place.id)) || data.places.find((place) => !mastered.has(place.id)) || data.places[0];
    }

    function renderRecommendation() {
        const place = recommendation();
        if (!place) return;
        setText("#continueMark", place.mark);
        setText("#continueTitle", explored.has(place.id) ? `Lanjutkan ${place.label}` : `Jelajahi ${place.label}`);
        setText("#continueText", `${place.summary} Fokus berikutnya: ${place.cards[0][0]} berarti "${place.cards[0][1]}".`);
        $("#continueDetailLink").href = `daerah-detail.html?id=${encodeURIComponent(place.id)}`;
        $("#continuePracticeLink").href = `latihan-bahasa.html?id=${encodeURIComponent(place.id)}`;
    }

    function weeklyGoal() {
        const input = $("#weeklyGoalInput");
        if (!input) return;
        const saved = Math.min(15, Math.max(1, Number(localStorage.getItem("wonder_weekly_goal")) || 5));
        input.value = saved;
        const update = () => {
            const goal = Number(input.value);
            const done = Math.min(explored.size, goal);
            localStorage.setItem("wonder_weekly_goal", String(goal));
            setText("#weeklyGoalOutput", `${goal} daerah`);
            setText("#weeklyGoalLabel", `${done}/${goal}`);
            $("#weeklyGoalBar").style.width = `${Math.round((done / goal) * 100)}%`;
            setText("#weeklyGoalMessage", done >= goal ? "Target tercapai. Kamu siap menaikkan target." : `${goal - done} daerah lagi untuk mencapai target pilihanmu.`);
        };
        input.addEventListener("input", update);
        update();
    }

    function dailyMission() {
        const dayIndex = Math.floor(Date.now() / 86400000);
        const place = data.places[dayIndex % data.places.length];
        const card = place.cards[dayIndex % place.cards.length];
        const date = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" }).format(new Date());
        setText("#dailyMissionDate", date);
        setText("#dailyMissionTitle", `Sapaan dari ${place.label}`);
        setText("#dailyMissionText", `Pelajari frasa ini, lalu buka ${place.label} untuk mengenal ${place.tradition[0]} dan ${place.food[0]}.`);
        setText("#dailyPhraseLocal", card[0]);
        setText("#dailyPhraseMeaning", card[1]);
        $("#copyDailyPhrase")?.addEventListener("click", async () => {
            try {
                await navigator.clipboard.writeText(`${card[0]} - ${card[1]}`);
                core.showToast("Frasa berhasil disalin.");
            } catch {
                core.showToast(`${card[0]} berarti ${card[1]}.`);
            }
        });
    }

    function renderRegionProgress() {
        const grid = $("#regionProgressGrid");
        if (!grid) return;
        const regions = data.regions.filter((region) => region !== "Semua");
        grid.innerHTML = regions.map((region) => {
            const places = data.getPlacesByRegion(region);
            const done = places.filter((place) => explored.has(place.id)).length;
            const percent = Math.round((done / Math.max(places.length, 1)) * 100);
            return `<button class="region-progress-item" type="button" data-region="${region}">
                <div><span>${region}</span><span>${done}/${places.length}</span></div>
                <span class="mini-track"><span style="width:${percent}%"></span></span>
            </button>`;
        }).join("");
        setText("#regionCoverageLabel", `${Math.round((explored.size / Math.max(data.places.length, 1)) * 100)}% Indonesia dijelajahi`);
        all(".region-progress-item").forEach((button) => button.addEventListener("click", () => {
            const target = all("#regionChips button").find((chip) => chip.dataset.region === button.dataset.region);
            target?.click();
            $("#jelajah-region")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }));
    }

    function setupTools() {
        $("#randomCultureBtn")?.addEventListener("click", () => {
            const place = data.places[Math.floor(Math.random() * data.places.length)];
            core.storage.set("wonder_place", place.id);
            window.location.href = `daerah-detail.html?id=${encodeURIComponent(place.id)}`;
        });
        $("#focusSearchBtn")?.addEventListener("click", () => {
            $("#jelajah-region")?.scrollIntoView({ behavior: "smooth", block: "start" });
            pulseMapFocus();
            setTimeout(() => $("#cultureSearch")?.focus(), 500);
        });

        const density = $("#densityToggleBtn");
        const compact = localStorage.getItem("wonder_compact") === "true";
        document.body.classList.toggle("compact-culture", compact);
        density?.setAttribute("aria-pressed", String(compact));
        density?.addEventListener("click", () => {
            const active = document.body.classList.toggle("compact-culture");
            density.setAttribute("aria-pressed", String(active));
            localStorage.setItem("wonder_compact", String(active));
            core.showToast(active ? "Tampilan kartu dibuat ringkas." : "Tampilan kartu dibuat nyaman.");
        });

        const motion = $("#motionToggleBtn");
        const reduced = localStorage.getItem("wonder_reduce_motion") === "true";
        document.body.classList.toggle("reduce-cultural-motion", reduced);
        motion?.setAttribute("aria-pressed", String(reduced));
        motion?.addEventListener("click", () => {
            const active = document.body.classList.toggle("reduce-cultural-motion");
            motion.setAttribute("aria-pressed", String(active));
            localStorage.setItem("wonder_reduce_motion", String(active));
        });
    }

    function setupScrollUtilities() {
        const bar = $("#pageProgressBar");
        const top = $("#backToTop");
        const update = () => {
            const max = document.documentElement.scrollHeight - innerHeight;
            if (bar) bar.style.width = `${Math.min(100, Math.max(0, (scrollY / Math.max(max, 1)) * 100))}%`;
            top?.classList.toggle("visible", scrollY > 700);
        };
        addEventListener("scroll", update, { passive: true });
        top?.addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));
        update();
    }

    function setupCommandPalette() {
        const palette = $("#commandPalette");
        const input = $("#commandSearch");
        const commands = [
            ["Peta Indonesia", "Pilih region budaya", "#jelajah-region", "fa-map"],
            ["Latihan flashcard", "Buka mode latihan", "latihan-bahasa.html", "fa-layer-group"],
            ["Quiz budaya", "Uji pemahaman", "quiz-budaya.html", "fa-circle-question"],
            ["Pro & progres", "Ringkasan dan benefit lanjutan", "#pro-ringkas", "fa-compass"],
            ["Bonus & Pencapaian", "Roda harian, lencana, dan museum", "#bonus-pencapaian", "fa-gift"],
            ["Lencana & Museum", "Buka koleksi pencapaian", "#bonus-pencapaian", "fa-medal"]
        ];
        const render = () => {
            const query = (input?.value || "").toLowerCase();
            $("#commandResults").innerHTML = commands.filter((item) => item.join(" ").toLowerCase().includes(query)).map((item) =>
                `<a class="command-item" href="${item[2]}"><i class="fa-solid ${item[3]}"></i><span>${item[0]}<small>${item[1]}</small></span></a>`
            ).join("") || `<div class="command-item">Tidak ada hasil.</div>`;
        };
        const open = () => {
            if (!isPro) {
                openPaywall("Navigasi Cepat Pro");
                return;
            }
            palette.dataset.returnFocus = document.activeElement?.id || "";
            palette.classList.add("open");
            palette.setAttribute("aria-hidden", "false");
            document.body.classList.add("command-open");
            syncBodyLock();
            render();
            setTimeout(() => input?.focus(), 50);
        };
        const close = () => {
            palette.classList.remove("open");
            palette.setAttribute("aria-hidden", "true");
            document.body.classList.remove("command-open");
            syncBodyLock();
            const returnTarget = palette.dataset.returnFocus ? document.getElementById(palette.dataset.returnFocus) : null;
            returnTarget?.focus?.();
        };
        $("#commandTrigger")?.addEventListener("click", open);
        $("#commandClose")?.addEventListener("click", close);
        input?.addEventListener("input", render);
        palette?.addEventListener("click", (event) => { if (event.target === palette) close(); });
        addEventListener("keydown", (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); open(); }
            if (palette?.classList.contains("open")) {
                if (event.key === "Escape") close();
                keepFocusInside(event, palette);
            }
            if (event.key === "/" && document.activeElement?.tagName !== "INPUT") {
                event.preventDefault();
                if (isPro) $("#focusSearchBtn")?.click();
                else openPaywall("Pencarian Cepat Pro");
            }
        });
    }

    function accessibilityPolish() {
        const kastaTitle = $("#kastaLevelName");
        if (kastaTitle && /ð|Ÿ|�/.test(kastaTitle.textContent)) kastaTitle.innerHTML = 'Rakyat Jelata <span aria-hidden="true">&#127806;</span>';
        const searchIcon = $(".search-icon");
        if (searchIcon) {
            searchIcon.setAttribute("aria-hidden", "true");
            searchIcon.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i>';
        }
        const filterIcons = {
            favorites: '<i class="fa-regular fa-heart"></i> Favorit',
            mastered: '<i class="fa-regular fa-circle-check"></i> Dikuasai',
            unexplored: '<i class="fa-solid fa-lock-open"></i> Belum dibuka'
        };
        Object.entries(filterIcons).forEach(([filter, label]) => {
            const button = $(`#statusFilters button[data-filter="${filter}"]`);
            if (button) button.innerHTML = label;
        });
        $("#spinWheelBtn")?.setAttribute("type", "button");
        $("#clearSearch")?.setAttribute("aria-label", "Hapus pencarian");
        $("#drawerClose")?.setAttribute("aria-label", "Tutup detail daerah");
        $("#detailDrawer")?.setAttribute("role", "dialog");
        $("#detailDrawer")?.setAttribute("aria-modal", "true");
        $("#detailDrawer")?.setAttribute("aria-hidden", "true");
        $("#cultureResultTitle")?.setAttribute("aria-live", "polite");
        all(".drawer-tab-btn").forEach((tab) => tab.setAttribute("type", "button"));
        all("img:not([loading])").forEach((image) => image.setAttribute("loading", "lazy"));
        document.documentElement.style.scrollBehavior = "smooth";
    }

    function setupMotionEnhancements() {
        if (document.body.classList.contains("reduce-cultural-motion")) return;
        const revealSelector = [
            ".language-hero .hero-copy > *",
            ".language-phone-wrap",
            ".indonesia-map-panel",
            ".search-filter-panel",
            ".region-chip",
            ".culture-grid-header",
            ".culture-card-link",
            ".explorer-stat",
            ".hub-panel",
            ".region-progress-panel",
            ".pro-benefit-card",
            ".spin-wheel-section",
            ".badge-item",
            ".museum-item"
        ].join(",");

        const seen = new WeakSet();
        const markReveal = (element) => {
            if (!element || seen.has(element)) return;
            seen.add(element);
            element.classList.add("motion-reveal");
            observer?.observe(element);
        };

        const observer = "IntersectionObserver" in window
            ? new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                });
            }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" })
            : null;

        const scan = (scope = document) => {
            scope.querySelectorAll?.(revealSelector).forEach(markReveal);
        };

        scan();
        if (!observer) {
            all(".motion-reveal").forEach((element) => element.classList.add("is-visible"));
            return;
        }

        const cultureGrid = $("#cultureGrid");
        if (cultureGrid && "MutationObserver" in window) {
            const gridObserver = new MutationObserver(() => scan(cultureGrid));
            gridObserver.observe(cultureGrid, { childList: true });
        }

        addEventListener("keydown", (event) => {
            if (event.key !== "Tab") return;
            document.body.classList.add("keyboard-navigation");
        }, { once: true });
    }

    function rememberVisit() {
        const last = localStorage.getItem("wonder_last_visit");
        localStorage.setItem("wonder_last_visit", new Date().toISOString());
        if (!last) return;
        const days = Math.floor((Date.now() - new Date(last).getTime()) / 86400000);
        if (days > 0) setText("#explorerGreeting", `${greeting}. Selamat datang kembali setelah ${days} hari. Lanjutkan dari rekomendasi berikut.`);
    }

    function getReviewPlaces() {
        const unexplored = data.places.filter((place) => !explored.has(place.id));
        const learning = data.places.filter((place) => explored.has(place.id) && !mastered.has(place.id));
        const favoritesToReview = data.places.filter((place) => favorites.has(place.id) && !mastered.has(place.id));
        return [...favoritesToReview, ...learning, ...unexplored]
            .filter((place, index, list) => list.findIndex((item) => item.id === place.id) === index)
            .slice(0, 6);
    }

    function renderSmartReview() {
        const places = getReviewPlaces();
        $("#proWorkspace").innerHTML = `
            <div class="pro-result-head">
                <div><span class="mini-tag">Smart Review Queue</span><h3>Prioritas belajar berikutnya</h3></div>
                <strong>${places.length} daerah</strong>
            </div>
            <div class="pro-review-list">
                ${places.map((place) => `
                    <article class="pro-review-item">
                        <span>${place.mark}</span>
                        <div><strong>${place.label}</strong><small>${explored.has(place.id) ? "Sudah dijelajahi, belum dikuasai" : "Belum pernah dijelajahi"} - ${place.region}</small></div>
                        <a href="latihan-bahasa.html?id=${encodeURIComponent(place.id)}">Latihan</a>
                    </article>
                `).join("")}
            </div>`;
    }

    function buildSevenDayRoute() {
        const regions = data.regions.filter((region) => region !== "Semua");
        const preferred = getReviewPlaces();
        const route = [];
        for (let day = 0; day < 7; day += 1) {
            const region = regions[day % regions.length];
            const regional = data.getPlacesByRegion(region);
            const place = preferred.find((item) => item.region === region && !route.includes(item))
                || regional.find((item) => !route.includes(item))
                || data.places.find((item) => !route.includes(item));
            if (place) route.push(place);
        }
        return route;
    }

    function renderItinerary() {
        const route = buildSevenDayRoute();
        $("#proWorkspace").innerHTML = `
            <div class="pro-result-head">
                <div><span class="mini-tag">Culture Planner</span><h3>Rute belajar 7 hari</h3></div>
                <strong>${route.length} sesi</strong>
            </div>
            <div class="pro-route-list">
                ${route.map((place, index) => `
                    <article class="pro-route-item">
                        <span>H${index + 1}</span>
                        <div><strong>${place.label} - ${place.region}</strong><small>${place.cards[0][0]} - ${place.tradition[0]} - ${place.food[0]}</small></div>
                        <a href="daerah-detail.html?id=${encodeURIComponent(place.id)}">Mulai</a>
                    </article>
                `).join("")}
            </div>`;
    }

    function renderNotes() {
        const savedNote = localStorage.getItem("wonder_pro_culture_note") || "";
        $("#proWorkspace").innerHTML = `
            <div class="pro-result-head">
                <div><span class="mini-tag">Private Notes</span><h3>Catatan budaya pribadi</h3></div>
                <small id="proNoteCount">${savedNote.length}/600</small>
            </div>
            <div class="pro-note-editor">
                <textarea id="proCultureNote" maxlength="600" placeholder="Tulis frasa, tradisi, kuliner, atau insight yang ingin kamu ingat..."></textarea>
                <div class="pro-note-actions"><span>Disimpan lokal dan hanya terlihat di perangkat ini.</span><button class="btn btn-primary" id="saveProNote" type="button">Simpan Catatan</button></div>
            </div>`;
        const textarea = $("#proCultureNote");
        textarea.value = savedNote;
        textarea.addEventListener("input", () => setText("#proNoteCount", `${textarea.value.length}/600`));
        $("#saveProNote").addEventListener("click", () => {
            localStorage.setItem("wonder_pro_culture_note", textarea.value.trim());
            core.showToast("Catatan budaya Pro tersimpan.");
        });
    }

    function exportStudyPlan() {
        const route = buildSevenDayRoute();
        const lines = [
            "WONDERFUL INDONESIA PRO - RENCANA BELAJAR",
            `Dibuat: ${new Date().toLocaleString("id-ID")}`,
            "",
            `Daerah dijelajahi: ${explored.size}/${data.places.length}`,
            `Daerah dikuasai: ${mastered.size}`,
            `Akurasi: ${accuracy}%`,
            "",
            "RENCANA 7 HARI",
            ...route.map((place, index) => `${index + 1}. ${place.label} (${place.region}) - Frasa: ${place.cards[0][0]} / ${place.cards[0][1]}`),
            "",
            "CATATAN PRIBADI",
            localStorage.getItem("wonder_pro_culture_note") || "Belum ada catatan."
        ];
        const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "rencana-wonderful-indonesia-pro.txt";
        anchor.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        core.showToast("Rencana belajar Pro berhasil diekspor.");
    }

    function toggleFocusMode() {
        const active = document.body.classList.toggle("focus-culture-mode");
        let exit = $(".focus-mode-exit");
        if (active && !exit) {
            exit = document.createElement("button");
            exit.type = "button";
            exit.className = "focus-mode-exit";
            exit.innerHTML = '<i class="fa-solid fa-compress"></i> Keluar Mode Fokus';
            exit.addEventListener("click", toggleFocusMode);
            document.body.appendChild(exit);
            $("#jelajah-region")?.scrollIntoView({ behavior: "smooth" });
        } else if (!active) {
            exit?.remove();
        }
    }

    function setupProBenefits() {
        all("[data-pro-action]").forEach((card) => {
            card.querySelector(".pro-action-btn")?.addEventListener("click", () => {
                if (!isPro) {
                    openPaywall(card.querySelector("h3")?.textContent || "Benefit Pro");
                    return;
                }
                const action = card.dataset.proAction;
                if (action === "smart-review") renderSmartReview();
                if (action === "itinerary") renderItinerary();
                if (action === "notes") renderNotes();
                if (action === "export-plan") exportStudyPlan();
                if (action === "focus-mode") toggleFocusMode();
            });
        });
    }

    function gateExistingPremiumFeatures() {
        document.addEventListener("click", (event) => {
            if (isPro) return;
            const instrumentTab = event.target.closest('.drawer-tab-btn[data-tab="instrument"]');
            if (instrumentTab) {
                event.preventDefault();
                event.stopImmediatePropagation();
                openPaywall("Studio Alat Musik Nusantara");
            }
            const radarButton = event.target.closest("#activatePusakaRadar");
            if (radarButton) {
                event.preventDefault();
                event.stopImmediatePropagation();
                openPaywall("Radar Pusaka");
            }
        }, true);
    }

    syncEntitlementUI();
    setupPaywall();
    if (isPro) {
        setHubMetrics();
        renderRecommendation();
        weeklyGoal();
        dailyMission();
        renderRegionProgress();
        setupTools();
        rememberVisit();
    }
    setupScrollUtilities();
    setupCommandPalette();
    setupProBenefits();
    gateExistingPremiumFeatures();
    accessibilityPolish();
    setupMotionEnhancements();
})();
