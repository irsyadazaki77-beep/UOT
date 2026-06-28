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
    const isLoggedIn = Boolean(userSession?.isLoggedIn || userSession?.email || userSession?.username || userSession?.name);
    // Entitlement follows the subscription source of truth. Requiring a specific
    // legacy `isLoggedIn` flag locked valid Pro accounts created by newer flows.
    const isPro = localStorage.getItem("eduquestSubscription") === "pro";
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
        } else {
            all(".pro-entitlement > :not(.pro-lock-layer)").forEach((element) => {
                element.inert = false;
                element.removeAttribute("aria-hidden");
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

    // --- 20 MAJOR UPDATES LOGIC ---
    
    // 1. Map Pan & Zoom (Update 2)
    function setupMapPanZoom() {
        const svg = $("#indonesiaMap");
        const viewport = $("#mapG");
        if (!svg || !viewport) return;

        let scale = 1;
        let x = 0;
        let y = 0;
        let isDragging = false;
        let startX = 0;
        let startY = 0;

        const updateTransform = () => {
            viewport.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
        };

        $("#mapZoomIn")?.addEventListener("click", () => {
            scale = Math.min(4, scale + 0.25);
            updateTransform();
        });
        $("#mapZoomOut")?.addEventListener("click", () => {
            scale = Math.max(0.5, scale - 0.25);
            updateTransform();
        });
        $("#mapZoomReset")?.addEventListener("click", () => {
            scale = 1;
            x = 0;
            y = 0;
            updateTransform();
        });

        svg.addEventListener("mousedown", (e) => {
            isDragging = true;
            svg.style.cursor = "grabbing";
            startX = e.clientX - x;
            startY = e.clientY - y;
        });

        addEventListener("mousemove", (e) => {
            if (!isDragging) return;
            x = e.clientX - startX;
            y = e.clientY - startY;
            updateTransform();
        });

        addEventListener("mouseup", () => {
            isDragging = false;
            svg.style.cursor = "grab";
        });

        svg.addEventListener("wheel", (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            scale = Math.min(4, Math.max(0.5, scale + delta));
            updateTransform();
        }, { passive: false });
    }

    // 2. Ambient Music Player (Update 3)
    let ambientIsPlaying = false;
    let ambientInterval = null;
    let ambientContext = null;

    function playAmbientSynth() {
        if (ambientIsPlaying) return;
        ambientIsPlaying = true;
        const playBtn = $("#ambientPlayBtn");
        if (playBtn) playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        
        if (!ambientContext) {
            ambientContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (ambientContext.state === "suspended") {
            ambientContext.resume();
        }
        
        const track = $("#ambientTrackSelect")?.value || "sunda";
        const melody = {
            sunda: [293.66, 329.63, 392.00, 440.00, 523.25], 
            bali: [277.18, 311.13, 349.23, 415.30, 466.16], 
            minang: [329.63, 392.00, 440.00, 493.88, 587.33]
        }[track];

        let step = 0;
        ambientInterval = setInterval(() => {
            if (!ambientIsPlaying) return;
            try {
                const now = ambientContext.currentTime;
                const osc = ambientContext.createOscillator();
                const gain = ambientContext.createGain();
                
                osc.type = "sine";
                const freq = melody[(step + Math.floor(Math.random() * 2)) % melody.length];
                osc.frequency.setValueAtTime(freq, now);
                
                const lfo = ambientContext.createOscillator();
                const lfoGain = ambientContext.createGain();
                lfo.frequency.value = 5.5;
                lfoGain.gain.value = 4;
                lfo.connect(lfoGain);
                lfoGain.connect(osc.frequency);
                
                gain.gain.setValueAtTime(0.001, now);
                gain.gain.linearRampToValueAtTime(0.03, now + 0.15); 
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8); 
                
                osc.connect(gain);
                gain.connect(ambientContext.destination);
                
                lfo.start(now);
                osc.start(now);
                lfo.stop(now + 1.9);
                osc.stop(now + 1.9);
                
                step++;
            } catch (e) {
                console.warn(e);
            }
        }, 1300);
    }

    function stopAmbientSynth() {
        ambientIsPlaying = false;
        const playBtn = $("#ambientPlayBtn");
        if (playBtn) playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        if (ambientInterval) {
            clearInterval(ambientInterval);
            ambientInterval = null;
        }
    }

    function setupAmbientPlayer() {
        $("#ambientPlayBtn")?.addEventListener("click", () => {
            if (ambientIsPlaying) {
                stopAmbientSynth();
            } else {
                playAmbientSynth();
            }
        });
        $("#ambientTrackSelect")?.addEventListener("change", () => {
            if (ambientIsPlaying) {
                stopAmbientSynth();
                playAmbientSynth();
            }
        });
    }

    // 3. Costume & Architecture Slideshow (Update 5)
    const slideData = {
        jawa: [
            { caption: "Rumah Joglo - Arsitektur kayu jati agung dengan atap tinggi berbentuk tajug.", icon: "🏛️" },
            { caption: "Batik & Kebaya Jawa - Busana klasik kain kebaya anggun bermotif batik tulis keraton.", icon: "👘" }
        ],
        sunda: [
            { caption: "Imah Panggung - Rumah panggung bambu Sunda soméah tahan gempa.", icon: "🏡" },
            { caption: "Baju Kebaya & Pangsi - Pakaian kebaya anggun serta setelan pangsi hitam polos.", icon: "👕" }
        ],
        bali: [
            { caption: "Gapura Candi Bentar - Candi belah khas arsitektur pura dan puri Bali.", icon: "⛩️" },
            { caption: "Payas Agung - Pakaian adat kebesaran Bali bernuansa emas dan mahkota tinggi.", icon: "👑" }
        ],
        minang: [
            { caption: "Rumah Gadang - Rumah panggung gonjong dengan atap menyerupai tanduk kerbau.", icon: "📐" },
            { caption: "Bundo Kanduang - Busana adat limpapeh rumah nan gadang bermakna kepemimpinan wanita.", icon: "👗" }
        ],
        batak: [
            { caption: "Rumah Bolon - Rumah adat panggung dengan ukiran gorga khas Batak.", icon: "🏘️" },
            { caption: "Kain Ulos - Tenunan tangan sakral Batak pembawa berkah restu kehidupan.", icon: "🧣" }
        ],
        aceh: [
            { caption: "Rumah Krong Bade - Rumah panggung tinggi beratap anyaman daun rumbia.", icon: "🏠" },
            { caption: "Ulee Balang - Pakaian adat kebesaran raja Kesultanan Aceh Darussalam.", icon: "🛡️" }
        ],
        betawi: [
            { caption: "Rumah Kebaya - Rumah adat dengan teras luas melambangkan keterbukaan Betawi.", icon: "🏡" },
            { caption: "Kebaya Encim & Sadariah - Kebaya sulam bunga serta baju koko Sadariah putih santai.", icon: "🥻" }
        ],
        dayak: [
            { caption: "Rumah Betang - Rumah panggung kayu ulin panjang kediaman adat damai.", icon: "🏢" },
            { caption: "Sapei Sapaq - Pakaian adat rompi manik-manik indah bertema bulu burung enggang.", icon: "🏹" }
        ],
        banjar: [
            { caption: "Rumah Bubungan Tinggi - Arsitektur panggung kayu ulin Kesultanan Banjar.", icon: "🏰" },
            { caption: "Bagajah Gamuling - Pakaian pengantin adat berselimut ronce melati wangi.", icon: "🌸" }
        ],
        bugis: [
            { caption: "Rumah Saoraja - Rumah kayu bangsawan Bugis-Makassar berlantai tiga.", icon: "🏫" },
            { caption: "Baju Bodo - Pakaian adat wanita Bugis tertua berbentuk balon bersiluet longgar.", icon: "👘" }
        ],
        madura: [
            { caption: "Rumah Teyan - Kompleks pemukiman adat Madura dengan tatanan pagar erat.", icon: "🏚️" },
            { caption: "Baju Pesa'an - Kaos garis merah-putih pelambang ketegasan pria Madura.", icon: "👕" }
        ],
        "papua-provinsi": [
            { caption: "Rumah Kariwari - Rumah ibadah adat suku Sentani beratap kerucut tinggi daun sagu.", icon: "⛺" },
            { caption: "Yokal & Koteka - Busana adat serat pohon cokelat rumbia khas Sentani.", icon: "🍂" }
        ],
        "papua-barat": [
            { caption: "Rumah Kaki Seribu - Rumah adat suku Arfak bertumpu ratusan tiang pancang kayu.", icon: "⛺" },
            { caption: "Busana Adat Arfak - Hiasan kepala bulu burung pintar berpadu rok rumbia alami.", icon: "🪶" }
        ],
        "papua-selatan": [
            { caption: "Rumah Gotad - Rumah adat pemuda suku Marind untuk latihan seni budaya.", icon: "🛖" },
            { caption: "Busana Suku Marind - Rok rumbai jerami lengkap dengan ronce gigi babi.", icon: "🏹" }
        ],
        "papua-tengah": [
            { caption: "Rumah Karapao - Aula adat sakral upacara kedewasaan pemuda suku Kamoro.", icon: "⛺" },
            { caption: "Kriya Noken Anggrek - Rajutan anyaman serat kulit batang anggrek bernilai tinggi.", icon: "👜" }
        ],
        "papua-pegunungan": [
            { caption: "Rumah Honai - Rumah bulat beratap jerami tebal penahan hawa dingin Baliem.", icon: "🛖" },
            { caption: "Koteka & Sali - Busana adat labu air kering serta rok jerami suku Dani.", icon: "🍂" }
        ],
        "papua-barat-daya": [
            { caption: "Rumah Adat Kambik - Sekolah adat suku Moi untuk mempelajari rahasia alam.", icon: "🛖" },
            { caption: "Busana Raja Ampat - Pakaian adat berhias manik kerang laut Raja Ampat.", icon: "🐚" }
        ],
        sasak: [
            { caption: "Bale Tani - Rumah tinggal adat Sasak beralas tanah liat dan kotoran kerbau.", icon: "🛖" },
            { caption: "Lambung & Pegon - Pakaian adat Lombok untuk ritual penyambutan tamu mulia.", icon: "🥻" }
        ],
        toraja: [
            { caption: "Rumah Tongkonan - Rumah perahu bersanding dengan lumbung padi berukir.", icon: "🏛️" },
            { caption: "Baju Pokko - Busana tenun Toraja bersulam manik kandaure di bahu anggun.", icon: "👗" }
        ],
        "melayu-riau": [
            { caption: "Selaso Jatuh Kembar - Rumah adat balai musyawarah Kesultanan Melayu.", icon: "🏛️" },
            { caption: "Baju Kurung Melayu - Pakaian adat sopan panjang bersanding kain songket.", icon: "👘" }
        ],
        lampung: [
            { caption: "Nuwou Sesat - Balai adat panggung tempat bermusyawarah penyimbang adat.", icon: "🏫" },
            { caption: "Siger Pengantin - Mahkota emas sembilan lekukan lambang sembilan sungai utama.", icon: "👑" }
        ],
        ambon: [
            { caption: "Rumah Baileo - Balai adat panggung terbuka tempat berkumpulnya warga Maluku.", icon: "🛖" },
            { caption: "Baju Cele - Kebaya brokat merah berpadu kain sarung tenun Ambon klasik.", icon: "👗" }
        ],
        gorontalo: [
            { caption: "Rumah Dulohupa - Panggung kayu agung kediaman adat raja Gorontalo.", icon: "🏫" },
            { caption: "Bili'u & Makuta - Mahkota pengantin adat bersulam emas dan payet megah.", icon: "👑" }
        ]
    };

    let activeSlideIndex = 0;
    function renderSlideshow(placeId) {
        const slides = slideData[placeId] || slideData.jawa;
        const iconEl = $("#slideshowIcon");
        const captionEl = $("#slideshowCaption");
        if (!iconEl || !captionEl) return;
        
        const slide = slides[activeSlideIndex % slides.length];
        iconEl.textContent = slide.icon;
        captionEl.textContent = slide.caption;
    }

    function setupSlideshow(placeId) {
        activeSlideIndex = 0;
        renderSlideshow(placeId);
        
        const prev = $("#slideshowPrev");
        const next = $("#slideshowNext");
        if (!prev || !next) return;
        
        const newPrev = prev.cloneNode(true);
        const newNext = next.cloneNode(true);
        
        prev.parentNode.replaceChild(newPrev, prev);
        next.parentNode.replaceChild(newNext, next);
        
        newPrev.addEventListener("click", () => {
            const slides = slideData[placeId] || slideData.jawa;
            activeSlideIndex = (activeSlideIndex - 1 + slides.length) % slides.length;
            renderSlideshow(placeId);
        });
        newNext.addEventListener("click", () => {
            const slides = slideData[placeId] || slideData.jawa;
            activeSlideIndex = (activeSlideIndex + 1) % slides.length;
            renderSlideshow(placeId);
        });
    }

    // 4. Folklore Story Reader (Update 6)
    const folkloreData = {
        jawa: { title: "Roro Jonggrang & Candi Sewu", text: "Bandung Bondowoso setuju membangun 1000 candi dalam satu malam demi menikahi Roro Jonggrang. Sadar Bandung hampir berhasil, Roro Jonggrang membakar jerami agar ayam berkokok lebih awal. Bandung yang murka karena ditipu mengutuk Roro Jonggrang menjadi arca candi ke-1000.", moral: "Kecurangan hanya mendatangkan penyesalan mendalam." },
        sunda: { title: "Legenda Tangkuban Perahu", text: "Sangkuriang jatuh cinta pada Dayang Sumbi tanpa tahu ia adalah ibu kandungnya. Untuk menggagalkan pernikahan, Dayang Sumbi meminta Sangkuriang membendung Citarum dalam semalam. Sangkuriang yang gagal menendang perahunya hingga telungkup menjadi Gunung Tangkuban Perahu.", moral: "Kemarahan yang membabi buta akan menghancurkan diri sendiri." },
        bali: { title: "Kebo Iwa Sang Pelindung", text: "Kebo Iwa adalah ksatria raksasa berhati tulus pelindung warga Bali. Ia menggali banyak mata air raksasa untuk menghindarkan kekeringan dari desanya. Pengorbanan nyawa Kebo Iwa di Jawa demi menjaga kedaulatan leluhurnya dikenang abadi oleh masyarakat Bali.", moral: "Tulus berkorban demi kesejahteraan orang banyak adalah sifat ksatria sejati." },
        minang: { title: "Malin Kundang Anak Durhaka", text: "Malin Kundang sukses merantau menjadi nakhoda kapal megah. Saat kembali, Malin malu mengakui ibunya yang renta dan miskin di hadapan istrinya. Ibu Malin yang sedih mengutuk kapalnya pecah dihempas ombak besar dan jasad Malin menjadi batu karang bersimpuh.", moral: "Sayangi dan hormati orang tua yang membesarkanmu tanpa pamrih." },
        batak: { title: "Asal Mula Danau Toba", text: "Toba melanggar janji dengan memarahi anaknya sebagai 'anak ikan'. Seketika itu pula, langit badai menjatuhkan hujan lebat yang menenggelamkan lembah tempat tinggal mereka, membentuk Danau Toba yang megah, dan istrinya kembali menjadi putri ikan emas.", moral: "Tepati janji setiamu agar tidak merugikan orang-orang tersayang." },
        aceh: { title: "Amat Rhang Manyang", text: "Amat pergi merantau dan kaya raya. Saat kapalnya bersandar di pantai kediaman masa kecilnya, ibunya menyambut dengan air mata. Amat menepis ibunya karena berpenampilan dekil. Seketika badai meremukkan kapal Amat beserta seluruh kekayaannya.", moral: "Kebaikan budi pekerti lebih utama dari melimpahnya harta benda." },
        betawi: { title: "Si Pitung Jawara Rakyat", text: "Si Pitung rajin belajar mengaji dan silat demi membela kaum tertindas Betawi dari kekejaman penjajah Belanda. Pitung mengambil harta rampasan opas kikir dan membagikannya ke rakyat kelaparan sebelum akhirnya dikhianati oleh teman sejawatnya sendiri.", moral: "Gunakan kemampuan dan ilmumu untuk melindungi mereka yang tidak berdaya." },
        dayak: { title: "Kisah Burung Ruai", text: "Kisah putri Dayak jelita yang tersingkir ke belantara rimba raya akibat rasa iri dengki saudara kandungnya. Ketulusan hati sang putri meluluhkan alam liar yang mengubahnya menjadi burung Ruai berekor kemilau penghuni hutan Kalimantan.", moral: "Kecantikan hati yang murni akan selalu dilindungi alam semesta." },
        banjar: { title: "Datu Mabrur & Todak", text: "Datu Mabrur bertapa khusyuk memohon daratan subur demi tempat hidup warganya. Ia menaklukkan serangan Raja Ikan Todak, namun merawat lukanya dengan tulus. Todak membalas budi dengan membawa lumpur dasar laut membentuk Pulau Halimun.", moral: "Kebaikan yang tulus pada makhluk lain akan berbuah keberkahan tak terduga." },
        bugis: { title: "Petualangan Sawerigading", text: "Sawerigading melaut mengarungi samudera dengan kapal kayu raksasa Welelenrenge untuk mencari tempat baru dan bersatu dengan cinta sejatinya. Epos La Galigo menulis keberanian ksatria Bugis bertarung dengan badai raksasa demi takdirnya.", moral: "Ketabahan hati menghadapi rintangan laut kehidupan akan membawa kesuksesan." },
        madura: { title: "Ke' Lesap Jawara Adil", text: "Ke' Lesap menggunakan kesaktian pusaka tombak nenggala untuk membela petani garam Madura dari penarikan upeti sepihak yang menyengsarakan rakyat. Perjuangan beraninya dikenang sebagai tonggak keadilan bagi tanah Madura.", moral: "Kebenaran harus diperjuangkan demi kebaikan bersama." },
        "papua-provinsi": { title: "Mata Air Telaga Biru", text: "Kisah penemuan telaga suci jernih kebiruan di pedalaman Sentani yang mengalirkan air penyembuh bagi wabah penyakit suku Sentani. Legenda ini menjadi pesan agar warga senantiasa menjaga hutan dari kerusakan.", moral: "Jaga alam agar alam senantiasa menjaga kelangsungan hidup kita." },
        "papua-barat": { title: "Legenda Burung Cendrawasih", text: "Seorang anak yatim yang hidup penuh kesederhanaan dan kerap diejek. Kesabaran hatinya membuahkan berkah dari langit yang merubah helai pakaian anyamannya menjadi sayap keemasan Cendrawasih lambang keanggunan.", moral: "Kemuliaan sejati lahir dari kesabaran menghadapi ujian kehidupan." },
        "papua-selatan": { title: "Kasuari & Dara Mahkota", text: "Burung Kasuari yang sombong menantang burung Dara Mahkota terbang tinggi memperebutkan pohon sagu subur. Dara Mahkota menang dengan kelembutan sayapnya, mengajarkan Kasuari untuk hidup berdampingan secara damai.", moral: "Kesombongan hanya akan menjatuhkan diri sendiri." },
        "papua-tengah": { title: "Kisah Noken Suku Mee", text: "Seorang ibu menganyam serat anggrek pertama kalinya di dataran tinggi Paniai untuk dijadikan tas noken pelindung bayinya saat berkebun. Tas ini menjadi warisan turun-temurun lambang cinta ibu di pegunungan.", moral: "Kasih sayang orang tua selalu melahirkan perlindungan terbaik." },
        "papua-pegunungan": { title: "Dani & Rumah Honai", text: "Para tetua suku Dani belajar dari struktur kokoh melingkar sarang burung di dahan pohon Lembah Baliem. Mereka meniru desain tersebut menjadi rumah bulat Honai beratap jerami tebal agar tetap hangat di malam dingin bersalju.", moral: "Belajarlah dari rahasia alam untuk beradaptasi dengan lingkungan sekitar." },
        "papua-barat-daya": { title: "Legenda Raja Ampat", text: "Kisah sepasang suami istri penemu enam butir telur naga suci di tepian pantai Raja Ampat. Lima telur menetas menjadi raja yang bijaksana memakmurkan pulau, dan satu telur mengkristal menjaga keindahan terumbu karang.", moral: "Hargai setiap titipan alam karena di dalamnya ada takdir kelestarian." },
        sasak: { title: "Legenda Putri Mandalika", text: "Putri Mandalika diperebutkan oleh banyak pangeran tangguh Lombok. Demi menghindari perang saudara antar-kerajaan, Mandalika memilih menceburkan diri ke laut selatan dan menjelma menjadi Nyale warna-warni pembawa berkah pangan.", moral: "Pengorbanan diri demi kerukunan sesama adalah bentuk keberanian tertinggi." },
        toraja: { title: "Rambut Emas Lando Rundun", text: "Lando Rundun adalah putri berambut sangat panjang elok yang menebarkan tutur kata santun dan senyum ramah di sekeliling desa adat Toraja. Perilaku terpujinya mendatangkan berkah panen melimpah bagi desanya.", moral: "Keindahan perangai mendatangkan kerukunan dan kedamaian lingkungan." },
        "melayu-riau": { title: "Hang Tuah Ksatria Samudera", text: "Laksamana Hang Tuah membela kehormatan Kesultanan Melayu dari serangan musuh asing. Kesetiaannya yang tak tergoyahkan melahirkan semboyan persatuan takkan Melayu hilang di bumi penumbuh semangat persaudaraan.", moral: "Kesetiaan pada sumpah ksatria adalah kehormatan tertinggi." },
        lampung: { title: "Putri Siger Emas", text: "Seorang putri bijaksana dari Lampung yang berhasil mendamaikan pertikaian antar-suku di sepanjang sembilan aliran sungai dengan membagikan hiasan siger emas sebagai simbol persaudaraan adat yang setara.", moral: "Kedamaian sejati terwujud melalui kesetaraan dan musyawarah." },
        ambon: { title: "Sumpah Pela Gandong", text: "Negeri adat di Maluku yang berlainan keyakinan bersumpah suci pela gandong untuk saling menganggap sebagai saudara sedarah. Mereka berjanji saling membangun rumah ibadah dan menjaga kedamaian selamanya.", moral: "Persaudaraan kemanusiaan melampaui perbedaan latar belakang." },
        gorontalo: { title: "Obor Tumbilotohe", text: "Legenda cinta suci penjaga danau Limboto yang memasang ribuan obor minyak tanah di pekarangan rumah saat badai gelap menyelimuti Gorontalo agar nelayan menemukan arah pulang dengan selamat.", moral: "Kepedulian menerangi jalan sesama adalah wujud ketulusan sejati." }
    };

    function setupFolklore(placeId) {
        const story = folkloreData[placeId] || folkloreData.jawa;
        setText("#drawerFolkloreTitle", story.title || "Legenda Daerah");
        setText("#drawerFolkloreText", story.text || "Konten cerita rakyat sedang diunggah...");
        const moralEl = $("#drawerFolkloreMoral span");
        if (moralEl) moralEl.textContent = story.moral || "-";
    }

    // 5. Typology Fact Sheets (Update 10)
    const factDetails = {
        jawa: { vitality: "Aman", aksara: "Jawa (Hanacaraka)", rumpun: "Austronesia" },
        sunda: { vitality: "Aman", aksara: "Sunda Kuna", rumpun: "Austronesia" },
        bali: { vitality: "Rentan", aksara: "Bali (Carakan)", rumpun: "Austronesia" },
        minang: { vitality: "Aman", aksara: "Arab Melayu / Jawi", rumpun: "Austronesia" },
        batak: { vitality: "Rentan", aksara: "Batak (Surat)", rumpun: "Austronesia" },
        aceh: { vitality: "Aman", aksara: "Arab Jawi", rumpun: "Austronesia" },
        betawi: { vitality: "Aman", aksara: "Latin", rumpun: "Austronesia" },
        dayak: { vitality: "Terancam", aksara: "Latin / Simbol", rumpun: "Austronesia" },
        banjar: { vitality: "Aman", aksara: "Latin / Arab Jawi", rumpun: "Austronesia" },
        bugis: { vitality: "Rentan", aksara: "Lontara", rumpun: "Austronesia" },
        madura: { vitality: "Aman", aksara: "Latin / Carakan", rumpun: "Austronesia" },
        "papua-provinsi": { vitality: "Terancam", aksara: "Latin", rumpun: "Papua Pesisir" },
        "papua-barat": { vitality: "Kritis", aksara: "Latin", rumpun: "Papua Arfak" },
        "papua-selatan": { vitality: "Kritis", aksara: "Latin", rumpun: "Trans-New Guinea" },
        "papua-tengah": { vitality: "Kritis", aksara: "Latin", rumpun: "Trans-New Guinea" },
        "papua-pegunungan": { vitality: "Rentan", aksara: "Latin", rumpun: "Trans-New Guinea" },
        "papua-barat-daya": { vitality: "Kritis", aksara: "Latin", rumpun: "Papua Barat" },
        sasak: { vitality: "Rentan", aksara: "Jejawan Lombok", rumpun: "Austronesia" },
        toraja: { vitality: "Rentan", aksara: "Latin", rumpun: "Austronesia" },
        "melayu-riau": { vitality: "Aman", aksara: "Arab Melayu / Jawi", rumpun: "Austronesia" },
        lampung: { vitality: "Terancam", aksara: "Had Lampung", rumpun: "Austronesia" },
        ambon: { vitality: "Kritis", aksara: "Latin", rumpun: "Austronesia Tim." },
        gorontalo: { vitality: "Terancam", aksara: "Latin", rumpun: "Austronesia" }
    };

    function setupFactDetails(placeId) {
        const details = factDetails[placeId] || { vitality: "Stabil", aksara: "Latin", rumpun: "Austronesia" };
        setText("#drawerVitality", details.vitality);
        setText("#drawerAksara", details.aksara);
        setText("#drawerRumpun", details.rumpun);
    }

    // 6. Interactive Glossary / Kamus Mini (Update 8)
    function setupGlossary() {
        const searchInput = $("#glossarySearch");
        const resultsEl = $("#glossaryResults");
        if (!searchInput || !resultsEl) return;

        const glossary = [];
        data.places.forEach(place => {
            place.cards.forEach(card => {
                glossary.push({
                    word: card[0],
                    meaning: card[1],
                    notes: card[2] || "",
                    region: place.label
                });
            });
        });

        const renderGlossary = () => {
            const query = searchInput.value.toLowerCase().trim();
            const filtered = glossary.filter(item => 
                item.word.toLowerCase().includes(query) || 
                item.meaning.toLowerCase().includes(query) ||
                item.region.toLowerCase().includes(query)
            );

            resultsEl.innerHTML = filtered.map(item => `
                <div style="background:var(--culture-surface); border:1px solid var(--culture-line); padding:10px 14px; border-radius:12px; display:flex; flex-direction:column; gap:4px; box-shadow:var(--culture-shadow); box-sizing:border-box;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <strong style="color:var(--text); font-size:1.05rem;">${item.word}</strong>
                        <span class="mini-tag" style="font-size:0.65rem; padding:2px 6px;">${item.region}</span>
                    </div>
                    <span style="color:#16a34a; font-size:0.85rem; font-weight:700;">${item.meaning}</span>
                    <small style="color:var(--muted); font-size:0.75rem;">${item.notes}</small>
                </div>
            `).join("") || `<div style="grid-column:1/-1; text-align:center; padding:20px; color:var(--muted);">Tidak ada hasil kata yang cocok.</div>`;
        };

        searchInput.addEventListener("input", renderGlossary);
        renderGlossary();
    }

    // 7. Weekly XP Line Chart (Update 15)
    function renderWeeklyXPChart() {
        const svg = $("#weeklyXPChart");
        if (!svg) return;

        let history = [];
        try {
            history = JSON.parse(localStorage.getItem("wonder_xp_history") || "[]");
        } catch {
            history = [];
        }
        
        const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
        const todayDay = new Date().getDay();
        const alignedDays = [];
        for (let i = 6; i >= 0; i--) {
            alignedDays.push(days[(todayDay - i + 7) % 7]);
        }

        const totalXP = calculateTotalXP(core.getProgress());
        if (history.length < 7) {
            history = [];
            for (let i = 0; i < 7; i++) {
                history.push(Math.max(10, Math.round(totalXP * (0.45 + i * 0.09))));
            }
            localStorage.setItem("wonder_xp_history", JSON.stringify(history));
        }

        const maxXP = Math.max(...history, 100);
        const points = [];
        const width = 500;
        const height = 150;
        const paddingLeft = 40;
        const paddingRight = 30;
        const paddingTop = 20;
        const paddingBottom = 30;
        
        const plotWidth = width - paddingLeft - paddingRight;
        const plotHeight = height - paddingTop - paddingBottom;

        history.forEach((val, i) => {
            const x = paddingLeft + (i * (plotWidth / 6));
            const y = paddingTop + plotHeight - ((val / maxXP) * plotHeight);
            points.push({ x, y, val });
        });

        const linePath = "M " + points.map(p => `${p.x},${p.y}`).join(" L ");
        const areaPath = linePath + ` L ${points[6].x},${height - paddingBottom} L ${points[0].x},${height - paddingBottom} Z`;

        let svgContent = `
            <line x1="${paddingLeft}" y1="${paddingTop}" x2="${width - paddingRight}" y2="${paddingTop}" stroke="var(--culture-line)" stroke-dasharray="4,4" />
            <line x1="${paddingLeft}" y1="${paddingTop + plotHeight/2}" x2="${width - paddingRight}" y2="${paddingTop + plotHeight/2}" stroke="var(--culture-line)" stroke-dasharray="4,4" />
            <line x1="${paddingLeft}" y1="${height - paddingBottom}" x2="${width - paddingRight}" y2="${height - paddingBottom}" stroke="var(--culture-line)" />
            <path d="${areaPath}" fill="url(#chartGradient)" />
            <path d="${linePath}" fill="none" stroke="#4f8cff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
        `;

        points.forEach((p, i) => {
            svgContent += `
                <circle cx="${p.x}" cy="${p.y}" r="5" fill="#32d66b" stroke="#ffffff" stroke-width="1.5" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.15));" />
                <text x="${p.x}" y="${p.y - 10}" font-size="8" font-weight="900" fill="var(--text)" text-anchor="middle">${p.val} XP</text>
                <text x="${p.x}" y="${height - 10}" font-size="9" font-weight="700" fill="var(--muted)" text-anchor="middle">${alignedDays[i]}</text>
            `;
        });

        svg.innerHTML = `
            <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#4f8cff" stop-opacity="0.3"/>
                    <stop offset="100%" stop-color="#4f8cff" stop-opacity="0"/>
                </linearGradient>
            </defs>
            ${svgContent}
        `;
    }

    function calculateTotalXP(progress) {
        const exploredCount = (progress.explored || []).length;
        const favoritesCount = (progress.favorites || []).length;
        const masteredCount = (progress.mastered || []).length;
        const quizCorrect = progress.correct || 0;
        const voiceSuccess = progress.voiceSuccessCount || 0;
        const pusakasFound = (progress.pusakaUnlocked || []).length;

        return (exploredCount * 10) +
               (favoritesCount * 5) +
               (masteredCount * 20) +
               (quizCorrect * 15) +
               (voiceSuccess * 25) +
               (pusakasFound * 50) +
               (progress.bonusXP || 0);
    }

    // 8. Streak & Daily Attendance Calendar (Update 12)
    function renderAttendanceCalendar() {
        const grid = $("#attendanceCalendarGrid");
        if (!grid) return;

        const days = ["S", "S", "R", "K", "J", "S", "M"];
        const todayDay = new Date().getDay();
        
        let attendance = [];
        try {
            attendance = JSON.parse(localStorage.getItem("wonder_attendance") || "[]");
        } catch {
            attendance = [];
        }

        if (attendance.length < 7) {
            attendance = [true, false, true, true, false, true, true];
            localStorage.setItem("wonder_attendance", JSON.stringify(attendance));
        }

        grid.innerHTML = attendance.map((active, i) => {
            const dayLabel = days[(todayDay - 6 + i + 7) % 7];
            const isToday = i === 6;
            return `
                <div style="display:flex; flex-direction:column; align-items:center; gap:4px;">
                    <div style="width:34px; height:34px; border-radius:10px; display:grid; place-items:center; font-weight:bold; font-size:0.85rem; 
                        background: ${active ? "linear-gradient(135deg,#32d66b,#4f8cff)" : "var(--culture-soft)"}; 
                        color: ${active ? "#ffffff" : "var(--muted)"}; 
                        border: 1.5px solid ${isToday ? "#4f8cff" : "transparent"};">
                        ${active ? "✓" : "•"}
                    </div>
                    <span style="font-size:0.65rem; font-weight:800; opacity:0.8; color:var(--text);">${dayLabel}</span>
                </div>
            `;
        }).join("");
    }

    // 9. Export/Import Progress JSON (Update 17)
    function setupExportImport() {
        $("#exportProgressBtn")?.addEventListener("click", () => {
            const progress = core.getProgress();
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(progress));
            const downloadAnchor = document.createElement("a");
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", "progres-wonderful-indonesia.json");
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
            core.showToast("Progres belajar diekspor sebagai JSON.");
        });

        $("#importProgressInput")?.addEventListener("change", (e) => {
            const fileReader = new FileReader();
            const file = e.target.files[0];
            if (!file) return;

            fileReader.onload = (event) => {
                try {
                    const imported = JSON.parse(event.target.result);
                    if (imported && (imported.explored || imported.reviewed)) {
                        core.saveProgress(imported);
                        core.showToast("Progres berhasil diimpor! Halaman memuat ulang.");
                        setTimeout(() => window.location.reload(), 1200);
                    } else {
                        core.showToast("File tidak valid.");
                    }
                } catch {
                    core.showToast("Gagal membaca file backup.");
                }
            };
            fileReader.readAsText(file);
        });
    }

    // 10. Varied Quiz Modes (Update 9)
    function setupAlternativeQuiz(placeId) {
        const place = data.getPlaceById(placeId);
        const quizBox = $(".drawer-quiz-box");
        if (!quizBox) return;

        let quizMode = "mcq"; 
        
        const renderQuizContent = () => {
            if (quizMode === "mcq") {
                const quiz = place.quiz;
                const correctAnswer = quiz.answers[quiz.correct];
                const shuffledAnswers = [...quiz.answers].sort(() => Math.random() - 0.5);

                quizBox.innerHTML = `
                    <div style="display:flex; justify-content:space-between; margin-bottom:10px; font-size:0.75rem; font-weight:bold;">
                        <span>Mode: Pilihan Ganda</span>
                        <a href="#" id="toggleQuizMode" style="color:#4f8cff; text-decoration:none;">Ubah ke Tebak Kuliner 🍲</a>
                    </div>
                    <h3 id="drawerQuizQuestion" style="font-size:1.05rem; margin:10px 0; color:var(--text);">${quiz.q}</h3>
                    <div class="answer-grid" id="drawerQuizAnswers" style="display:grid; gap:8px; grid-template-columns:1fr 1fr;">
                        ${shuffledAnswers.map(ans => `<button class="answer-btn" style="padding:10px; border-radius:10px; border:1px solid var(--culture-line); background:var(--culture-surface); color:var(--text); cursor:pointer; font-weight:800;">${ans}</button>`).join("")}
                    </div>
                `;
                
                const answersGrid = $("#drawerQuizAnswers");
                answersGrid.querySelectorAll("button").forEach(btn => {
                    btn.addEventListener("click", () => {
                        answersGrid.classList.add("answered");
                        const progress = core.getProgress();
                        progress.reviewed += 1;
                        progress.quizDone = (progress.quizDone || 0) + 1;
                        
                        if (btn.textContent === correctAnswer) {
                            progress.correct += 1;
                            btn.classList.add("correct");
                            btn.style.background = "#32d66b";
                            btn.style.color = "white";
                            core.showToast("Jawaban benar! Hebat.");
                            if (window.WonderfulGames) window.WonderfulGames.addXP(15);
                        } else {
                            btn.classList.add("wrong");
                            btn.style.background = "#ff4f73";
                            btn.style.color = "white";
                            core.showToast(`Jawaban tepat: ${correctAnswer}`);
                        }
                        
                        answersGrid.querySelectorAll("button").forEach(item => {
                            item.disabled = true;
                            if (item.textContent === correctAnswer) {
                                item.style.background = "#32d66b";
                                item.style.color = "white";
                            }
                        });
                        core.saveProgress(progress);
                        renderDrawerQuizStats();
                    });
                });
            } else if (quizMode === "culinary") {
                const question = `Makanan khas dari daerah ${place.label} yang terbuat dari olahan "${place.food[0]}" adalah...`;
                const correctAnswer = place.food[0];
                const answers = [place.food[0], "Nasi Goreng Nusantara", "Sate Madura", "Roti Bakar"].sort(() => Math.random() - 0.5);
                
                quizBox.innerHTML = `
                    <div style="display:flex; justify-content:space-between; margin-bottom:10px; font-size:0.75rem; font-weight:bold;">
                        <span>Mode: Tebak Kuliner</span>
                        <a href="#" id="toggleQuizMode" style="color:#4f8cff; text-decoration:none;">Ubah ke Pilihan Ganda 📝</a>
                    </div>
                    <h3 style="font-size:1.05rem; margin:10px 0; color:var(--text);">${question}</h3>
                    <div class="answer-grid" id="drawerQuizAnswers" style="display:grid; gap:8px; grid-template-columns:1fr 1fr;">
                        ${answers.map(ans => `<button class="answer-btn" style="padding:10px; border-radius:10px; border:1px solid var(--culture-line); background:var(--culture-surface); color:var(--text); cursor:pointer; font-weight:800;">${ans}</button>`).join("")}
                    </div>
                `;
                
                const answersGrid = $("#drawerQuizAnswers");
                answersGrid.querySelectorAll("button").forEach(btn => {
                    btn.addEventListener("click", () => {
                        answersGrid.classList.add("answered");
                        const progress = core.getProgress();
                        progress.reviewed += 1;
                        progress.quizDone = (progress.quizDone || 0) + 1;
                        
                        if (btn.textContent === correctAnswer) {
                            progress.correct += 1;
                            btn.classList.add("correct");
                            btn.style.background = "#32d66b";
                            btn.style.color = "white";
                            core.showToast("Benar! Itu kuliner khas daerah ini.");
                            if (window.WonderfulGames) window.WonderfulGames.addXP(15);
                        } else {
                            btn.classList.add("wrong");
                            btn.style.background = "#ff4f73";
                            btn.style.color = "white";
                            core.showToast(`Jawaban tepat: ${correctAnswer}`);
                        }
                        
                        answersGrid.querySelectorAll("button").forEach(item => {
                            item.disabled = true;
                            if (item.textContent === correctAnswer) {
                                item.style.background = "#32d66b";
                                item.style.color = "white";
                            }
                        });
                        core.saveProgress(progress);
                        renderDrawerQuizStats();
                    });
                });
            }
            
            $("#toggleQuizMode")?.addEventListener("click", (e) => {
                e.preventDefault();
                quizMode = quizMode === "mcq" ? "culinary" : "mcq";
                renderQuizContent();
            });
        };
        
        renderQuizContent();
    }

    function renderDrawerQuizStats() {
        const progress = core.getProgress();
        const acc = Math.round((progress.correct / Math.max(progress.reviewed, 1)) * 100);
        const statsEl = document.getElementById("drawerQuizStats");
        if (statsEl) {
            statsEl.innerHTML = `
                <strong>${acc}% Akurasi</strong>
                <span>${progress.correct}/${progress.reviewed} benar - ${progress.quizDone || 0} kuis selesai</span>
            `;
        }
    }

    // Hook to detail drawer open
    const originalOpenDrawer = window.openDrawer;
    if (originalOpenDrawer) {
        window.openDrawer = function (placeId) {
            originalOpenDrawer.apply(this, arguments);
            setupSlideshow(placeId);
            setupFolklore(placeId);
            setupFactDetails(placeId);
            setupAlternativeQuiz(placeId);
        };
    }

    // --- INITIALIZE ALL UPDATED CONTROLLERS ---
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

    // Init custom features on boot
    setupMapPanZoom();
    setupAmbientPlayer();
    setupGlossary();
    renderWeeklyXPChart();
    renderAttendanceCalendar();
    setupExportImport();
})();
