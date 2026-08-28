(function () {
    const data = window.WonderfulData;
    const core = window.WonderfulCore;

    function initCatalogPage() {
        core.renderNav("bahasa-daerah.html");
        core.renderMetricSummary();
        let selectedRegion = core.storage.get("wonder_region", "Semua");
        if (selectedRegion === "Papua") selectedRegion = "Papua Raya";
        if (!data.regions.includes(selectedRegion)) selectedRegion = "Semua";

        const regionChips = document.getElementById("regionChips");
        const cultureGrid = document.getElementById("cultureGrid");
        const resultTitle = document.getElementById("cultureResultTitle");
        const resultMeta = document.getElementById("cultureResultMeta");
        const selectedPlace = core.getSelectedPlace();
        const navPractice = document.getElementById("practiceNavLink");
        if (navPractice) navPractice.href = core.placeUrl("latihan-bahasa.html", selectedPlace.id);

        let searchQuery = "";
        let statusFilter = "all";
        let searchDebounce = null;
        let lastDrawerTrigger = null;

        function syncBodyLock() {
            const locked = document.body.classList.contains("drawer-open")
                || document.body.classList.contains("command-open")
                || document.body.classList.contains("paywall-open");
            document.body.style.overflow = locked ? "hidden" : "";
            document.querySelector("main.page")?.setAttribute("aria-hidden", locked ? "true" : "false");
        }

        function renderWithFilteringState(delay = 0) {
            document.body.classList.add("is-filtering");
            window.clearTimeout(searchDebounce);
            searchDebounce = window.setTimeout(() => {
                render();
                window.requestAnimationFrame(() => document.body.classList.remove("is-filtering"));
            }, delay);
        }

        function pulseMapFocus() {
            document.body.classList.add("map-focused");
            window.setTimeout(() => document.body.classList.remove("map-focused"), 1200);
        }

        const searchInput = document.getElementById("cultureSearch");
        const clearSearchBtn = document.getElementById("clearSearch");
        const statusFilters = document.getElementById("statusFilters");
        let resetFiltersBtn = document.getElementById("resetCultureFilters");
        if (!resetFiltersBtn && statusFilters) {
            resetFiltersBtn = document.createElement("button");
            resetFiltersBtn.type = "button";
            resetFiltersBtn.id = "resetCultureFilters";
            resetFiltersBtn.className = "filter-opt-btn reset-filter-btn";
            resetFiltersBtn.hidden = true;
            resetFiltersBtn.innerHTML = '<i class="fa-solid fa-rotate-left"></i> Reset';
            statusFilters.appendChild(resetFiltersBtn);
        }

        function updateResetFilterButton() {
            if (!resetFiltersBtn) return;
            const isDefault = selectedRegion === "Semua" && statusFilter === "all" && !searchQuery;
            resetFiltersBtn.hidden = isDefault;
            resetFiltersBtn.setAttribute("aria-hidden", String(isDefault));
        }

        function resetCatalogFilters() {
            selectedRegion = "Semua";
            statusFilter = "all";
            searchQuery = "";
            core.storage.set("wonder_region", selectedRegion);
            if (searchInput) searchInput.value = "";
            if (clearSearchBtn) clearSearchBtn.style.display = "none";
            statusFilters?.querySelectorAll("button[data-filter]").forEach(btn => {
                btn.classList.toggle("active", btn.dataset.filter === "all");
            });
            renderWithFilteringState();
        }

        resetFiltersBtn?.addEventListener("click", resetCatalogFilters);
        if (searchInput) {
            searchInput.addEventListener("input", (e) => {
                searchQuery = e.target.value.toLowerCase().trim();
                if (clearSearchBtn) {
                    clearSearchBtn.style.display = searchQuery ? "block" : "none";
                }
                renderWithFilteringState(140);
            });
        }
        if (clearSearchBtn) {
            clearSearchBtn.addEventListener("click", () => {
                searchInput.value = "";
                searchQuery = "";
                clearSearchBtn.style.display = "none";
                renderWithFilteringState();
            });
        }

        if (statusFilters) {
            statusFilters.querySelectorAll("button").forEach(btn => {
                if (!btn.dataset.filter) return;
                btn.addEventListener("click", () => {
                    statusFilters.querySelectorAll("button").forEach(b => b.classList.remove("active"));
                    btn.classList.add("active");
                    statusFilter = btn.dataset.filter;
                    renderWithFilteringState();
                });
            });
        }

        // Map Tooltip Logic
        const tooltip = document.getElementById("mapTooltip");
        document.querySelectorAll(".map-region").forEach(regionEl => {
            const rawRegionName = regionEl.dataset.region;
            const regionName = rawRegionName === "Papua" ? "Papua Raya" : rawRegionName;

            regionEl.addEventListener("mouseenter", () => {
                const visibleInRegion = data.getPlacesByRegion(regionName);
                const progress = core.getProgress();
                const exploredInRegion = visibleInRegion.filter(p => (progress.explored || []).includes(p.id));
                const exploredPct = Math.round((exploredInRegion.length / Math.max(visibleInRegion.length, 1)) * 100);

                if (tooltip) {
                    tooltip.innerHTML = `
                        <div style="font-weight:900;font-size:13px;margin-bottom:3px;">${regionName}</div>
                        <div>Total: ${visibleInRegion.length} Budaya</div>
                        <div style="color:var(--green);font-size:11px;font-weight:bold;">Terjelajahi: ${exploredPct}%</div>
                    `;
                    tooltip.style.display = "block";
                }
            });
            regionEl.addEventListener("mousemove", (e) => {
                if (tooltip) {
                    const shellRect = document.querySelector(".indonesia-map-shell").getBoundingClientRect();
                    const x = e.clientX - shellRect.left;
                    const y = e.clientY - shellRect.top;
                    tooltip.style.left = `${x}px`;
                    tooltip.style.top = `${y}px`;
                }
            });
            regionEl.addEventListener("mouseleave", () => {
                if (tooltip) tooltip.style.display = "none";
            });
        });

        // Achievements Logic
        function updateAchievements() {
            const progress = core.getProgress();
            const streakCount = document.getElementById("streakCount");
            if (streakCount) streakCount.textContent = progress.streak || 0;
            let proEntitled = false;
            try {
                const session = JSON.parse(localStorage.getItem("eduquestUserSession") || "null");
                proEntitled = Boolean(session?.isLoggedIn) && localStorage.getItem("eduquestSubscription") === "pro";
            } catch {
                proEntitled = false;
            }

            const achievements = core.checkAchievements(progress);
            const badges = {
                explorer: document.getElementById("badge-explorer"),
                master: document.getElementById("badge-master"),
                culinary: document.getElementById("badge-culinary"),
                quizmaster: document.getElementById("badge-quizmaster"),
                preserver: document.getElementById("badge-preserver")
            };

            for (const key in badges) {
                const el = badges[key];
                if (el) {
                    const active = achievements[key] || proEntitled;
                    el.classList.toggle("unlocked", active);
                    el.classList.toggle("locked", !active);
                }
            }
        }

        // Drawer Elements & Logic
        const drawer = document.getElementById("detailDrawer");
        const drawerOverlay = document.getElementById("drawerOverlay");
        const drawerClose = document.getElementById("drawerClose");

        let drawerPlace = null;
        let drawerCardIndex = 0;
        let drawerShowingMeaning = false;

        function openDrawer(placeId) {
            lastDrawerTrigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
            drawerPlace = data.getPlaceById(placeId);
            core.markExplored(placeId);
            core.renderMetricSummary();

            // Fill content
            core.setText("drawerRegion", drawerPlace.region);
            core.setText("drawerMark", drawerPlace.mark);
            core.setText("drawerTitle", drawerPlace.label);
            core.setText("drawerSummary", drawerPlace.summary);
            core.setText("drawerFact", drawerPlace.fact);

            core.setText("drawerDestName", drawerPlace.destination[0]);
            core.setText("drawerDestDesc", drawerPlace.destination[1]);
            core.setText("drawerFoodName", drawerPlace.food[0]);
            core.setText("drawerFoodDesc", drawerPlace.food[1]);
            core.setText("drawerTradName", drawerPlace.tradition[0]);
            core.setText("drawerTradDesc", drawerPlace.tradition[1]);

            const detailLink = document.getElementById("drawerFullDetailLink");
            if (detailLink) detailLink.href = core.placeUrl("daerah-detail.html", placeId);

            const phraseList = document.getElementById("drawerPhraseList");
            if (phraseList) {
                phraseList.innerHTML = drawerPlace.phrases.map(item => `
                    <div class="drawer-phrase-card">
                        <strong>${item[0]}</strong>
                        <p class="muted">${item[1]}</p>
                    </div>
                `).join("");
            }

            updateDrawerButtons();

            // Reset flashcard state
            drawerCardIndex = 0;
            drawerShowingMeaning = false;
            renderDrawerCard();

            // Reset quiz state
            renderDrawerQuiz();
            renderDrawerQuizStats();

            switchDrawerTab("info");

            drawer.classList.add("active");
            drawerOverlay.classList.add("active");
            drawer.setAttribute("aria-hidden", "false");
            document.body.classList.add("drawer-open");
            syncBodyLock();
            window.setTimeout(() => drawerClose?.focus(), 30);
        }
        window.openDrawer = openDrawer;

        function closeDrawer() {
            drawer.classList.remove("active");
            drawerOverlay.classList.remove("active");
            drawer.setAttribute("aria-hidden", "true");
            document.body.classList.remove("drawer-open");
            syncBodyLock();
            render();
            core.renderMetricSummary();
            lastDrawerTrigger?.focus?.();
            lastDrawerTrigger = null;
        }

        if (drawerClose) drawerClose.addEventListener("click", closeDrawer);
        if (drawerOverlay) drawerOverlay.addEventListener("click", closeDrawer);

        function switchDrawerTab(tabName) {
            drawer.querySelectorAll(".drawer-tab-btn").forEach(btn => {
                btn.classList.toggle("active", btn.dataset.tab === tabName);
            });
            drawer.querySelectorAll(".drawer-tab-content").forEach(content => {
                content.classList.toggle("active", content.id === `tab-${tabName}`);
            });
        }

        drawer.querySelectorAll(".drawer-tab-btn").forEach(btn => {
            btn.addEventListener("click", () => switchDrawerTab(btn.dataset.tab));
        });

        function updateDrawerButtons() {
            const progress = core.getProgress();
            const favBtn = document.getElementById("drawerFavoriteBtn");
            const mastBtn = document.getElementById("drawerMasteredBtn");

            if (favBtn) {
                const isFav = (progress.favorites || []).includes(drawerPlace.id);
                favBtn.innerHTML = isFav ? `<i class="fa-solid fa-heart"></i> Terfavorit` : `<i class="fa-regular fa-heart"></i> Favorit`;
                favBtn.classList.toggle("active", isFav);
            }
            if (mastBtn) {
                const isMast = (progress.mastered || []).includes(drawerPlace.id);
                mastBtn.innerHTML = isMast ? `<i class="fa-solid fa-circle-check"></i> Dikuasai` : `<i class="fa-regular fa-circle-check"></i> Dikuasai`;
                mastBtn.classList.toggle("active", isMast);
            }
        }

        document.getElementById("drawerFavoriteBtn")?.addEventListener("click", () => {
            if (!drawerPlace) return;
            core.toggleProgressList("favorites", drawerPlace.id);
            updateDrawerButtons();
            core.showToast("Status favorit diperbarui.");
        });

        document.getElementById("drawerMasteredBtn")?.addEventListener("click", () => {
            if (!drawerPlace) return;
            core.toggleProgressList("mastered", drawerPlace.id);
            updateDrawerButtons();
            core.showToast("Status dikuasai diperbarui.");
        });

        const flashcardEl = document.getElementById("drawerFlashcard");
        const cardProgressText = document.getElementById("drawerCardProgress");
        const cardProgressBar = document.getElementById("drawerCardBar");
        const vocabListEl = document.getElementById("drawerVocabList");

        function renderDrawerCard() {
            if (!drawerPlace || !drawerPlace.cards.length || !flashcardEl) return;
            const card = drawerPlace.cards[drawerCardIndex % drawerPlace.cards.length];
            drawerShowingMeaning = false;
            flashcardEl.classList.remove("is-flipped", "is-flipping");
            flashcardEl.innerHTML = `
                <small>${drawerPlace.label}</small>
                <strong>${card[0]}</strong>
                <span>${card[2]}</span>
            `;
            const activeIndex = (drawerCardIndex % drawerPlace.cards.length) + 1;
            if (cardProgressText) cardProgressText.textContent = `Kartu ${activeIndex}/${drawerPlace.cards.length}`;
            if (cardProgressBar) cardProgressBar.style.width = `${Math.round((activeIndex / drawerPlace.cards.length) * 100)}%`;

            if (vocabListEl) {
                vocabListEl.innerHTML = drawerPlace.cards.map((item, index) => `
                    <div class="vocab-item ${index === drawerCardIndex % drawerPlace.cards.length ? "is-active" : ""}">
                        <div><strong>${item[0]}</strong><span class="muted">${item[1]}</span></div>
                        <span class="mini-tag">${item[2]}</span>
                    </div>
                `).join("");
            }
        }

        flashcardEl?.addEventListener("click", () => {
            if (!drawerPlace || !drawerPlace.cards.length) return;
            const card = drawerPlace.cards[drawerCardIndex % drawerPlace.cards.length];
            drawerShowingMeaning = !drawerShowingMeaning;
            flashcardEl.classList.add("is-flipping");
            window.setTimeout(() => {
                flashcardEl.classList.toggle("is-flipped", drawerShowingMeaning);
                flashcardEl.innerHTML = drawerShowingMeaning
                    ? `<small>Arti</small><strong>${card[1]}</strong><span>${card[0]}</span>`
                    : `<small>${drawerPlace.label}</small><strong>${card[0]}</strong><span>${card[2]}</span>`;
                flashcardEl.classList.remove("is-flipping");
            }, 120);
        });

        document.getElementById("drawerPrevWord")?.addEventListener("click", () => {
            if (!drawerPlace || !drawerPlace.cards.length) return;
            if (drawerCardIndex > 0) {
                drawerCardIndex -= 1;
            } else {
                drawerCardIndex = drawerPlace.cards.length - 1;
            }
            renderDrawerCard();
        });

        document.getElementById("drawerNextWord")?.addEventListener("click", () => {
            if (!drawerPlace || !drawerPlace.cards.length) return;
            const progress = core.getProgress();
            progress.reviewed += 1;
            core.saveProgress(progress);
            drawerCardIndex += 1;
            renderDrawerCard();
        });

        document.getElementById("drawerListenWord")?.addEventListener("click", () => {
            if (!drawerPlace || !drawerPlace.cards.length) return;
            const card = drawerPlace.cards[drawerCardIndex % drawerPlace.cards.length];
            if (!("speechSynthesis" in window)) {
                core.showToast("Browser belum mendukung suara otomatis.");
                return;
            }
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(`${card[0]}. Artinya ${card[1]}.`);
            utterance.lang = "id-ID";
            utterance.rate = 0.88;
            window.speechSynthesis.speak(utterance);
        });

        const quizQuestionEl = document.getElementById("drawerQuizQuestion");
        const quizAnswersEl = document.getElementById("drawerQuizAnswers");

        function renderDrawerQuiz() {
            if (!drawerPlace || !drawerPlace.quiz || !quizQuestionEl || !quizAnswersEl) return;
            const quiz = drawerPlace.quiz;
            const correctAnswer = quiz.answers[quiz.correct];
            const shuffledAnswers = [...quiz.answers].sort(() => Math.random() - 0.5);

            quizQuestionEl.textContent = quiz.q;
            quizAnswersEl.classList.remove("answered");
            quizAnswersEl.innerHTML = shuffledAnswers.map(answer => `
                <button class="answer-btn">${answer}</button>
            `).join("");

            quizAnswersEl.querySelectorAll("button").forEach(btn => {
                btn.addEventListener("click", () => {
                    const progress = core.getProgress();
                    progress.reviewed += 1;
                    progress.quizDone = (progress.quizDone || 0) + 1;
                    quizAnswersEl.classList.add("answered");

                    if (btn.textContent === correctAnswer) {
                        progress.correct += 1;
                        btn.classList.add("correct");
                        core.showToast("Jawaban benar! Hebat.");
                    } else {
                        btn.classList.add("wrong");
                        core.showToast(`Jawaban tepat: ${correctAnswer}`);
                    }

                    quizAnswersEl.querySelectorAll("button").forEach(item => {
                        item.disabled = true;
                        if (item.textContent === correctAnswer) item.classList.add("correct");
                    });

                    core.saveProgress(progress);
                    renderDrawerQuizStats();
                    updateAchievements();
                });
            });
        }

        function renderDrawerQuizStats() {
            const progress = core.getProgress();
            const accuracy = Math.round((progress.correct / Math.max(progress.reviewed, 1)) * 100);
            const statsEl = document.getElementById("drawerQuizStats");
            if (statsEl) {
                statsEl.innerHTML = `
                    <strong>${accuracy}% Akurasi</strong>
                    <span>${progress.correct}/${progress.reviewed} benar - ${progress.quizDone || 0} kuis selesai</span>
                `;
            }
        }

        function syncMap() {
            document.querySelectorAll(".map-region").forEach(regionEl => {
                const region = regionEl.dataset.region === "Papua" ? "Papua Raya" : regionEl.dataset.region;
                regionEl.classList.toggle("active", region === selectedRegion);
            });
        }

        function selectRegion(region) {
            selectedRegion = region === "Papua" ? "Papua Raya" : region;
            core.storage.set("wonder_region", selectedRegion);
            render();
        }

        function render() {
            let visible = data.getPlacesByRegion(selectedRegion);
            const progress = core.getProgress();
            const favorites = new Set(progress.favorites || []);
            const mastered = new Set(progress.mastered || []);
            const explored = new Set(progress.explored || []);

            if (statusFilter === "favorites") {
                visible = visible.filter(p => favorites.has(p.id));
            } else if (statusFilter === "mastered") {
                visible = visible.filter(p => mastered.has(p.id));
            } else if (statusFilter === "unexplored") {
                visible = visible.filter(p => !explored.has(p.id));
            }

            if (searchQuery) {
                visible = visible.filter(p => {
                    const label = p.label.toLowerCase();
                    const summary = p.summary.toLowerCase();
                    const region = p.region.toLowerCase();
                    const destination = p.destination.join(" ").toLowerCase();
                    const food = p.food.join(" ").toLowerCase();
                    const tradition = p.tradition.join(" ").toLowerCase();
                    const fact = p.fact.toLowerCase();
                    const phrasesText = p.phrases.map(item => item.join(" ")).join(" ").toLowerCase();
                    const cardsText = p.cards.map(item => item.join(" ")).join(" ").toLowerCase();

                    return label.includes(searchQuery) ||
                        summary.includes(searchQuery) ||
                        region.includes(searchQuery) ||
                        destination.includes(searchQuery) ||
                        food.includes(searchQuery) ||
                        tradition.includes(searchQuery) ||
                        fact.includes(searchQuery) ||
                        phrasesText.includes(searchQuery) ||
                        cardsText.includes(searchQuery);
                });
            }

            if (regionChips) {
                regionChips.innerHTML = data.regions.map(region => {
                    const matchRegion = region === "Papua" ? "Papua Raya" : region;
                    const count = data.getPlacesByRegion(matchRegion).length;
                    return `<button class="region-chip ${region === selectedRegion ? "active" : ""}" data-region="${region}">${region} <small>(${count})</small></button>`;
                }).join("");
                regionChips.querySelectorAll("button").forEach(button => {
                    button.addEventListener("click", () => selectRegion(button.dataset.region));
                });
            }
            if (resultTitle) resultTitle.textContent = `${visible.length} kartu budaya`;
            if (resultMeta) {
                const parts = [
                    selectedRegion === "Semua" ? "Semua region Indonesia" : `Region aktif: ${selectedRegion}`,
                    statusFilter !== "all" ? `Filter: ${statusFilter === "favorites" ? "Favorit" : statusFilter === "mastered" ? "Dikuasai" : "Belum dibuka"}` : "",
                    searchQuery ? `Pencarian: "${searchQuery}"` : ""
                ].filter(Boolean);
                resultMeta.textContent = parts.join(" - ");
            }
            updateResetFilterButton();

            if (cultureGrid) {
                cultureGrid.innerHTML = visible.length
                    ? visible.map((place, index) => {
                        const cardHtml = core.renderCultureCard(place);
                        return cardHtml.replace('class="culture-card-link', `style="--stagger-delay: ${index}" class="culture-card-link`);
                    }).join("")
                    : `<div class="culture-empty-state" role="status">
                        <i class="fa-solid fa-magnifying-glass"></i>
                        <strong>Tidak ada kartu yang cocok.</strong>
                        <p>Coba ganti kata kunci, pilih region lain, atau reset filter untuk melihat semua daerah.</p>
                        <button type="button" class="btn btn-primary" id="emptyResetFilters">Reset filter</button>
                    </div>`;

                cultureGrid.querySelector("#emptyResetFilters")?.addEventListener("click", resetCatalogFilters);

                cultureGrid.querySelectorAll(".culture-card-main, .culture-card-actions a").forEach(el => {
                    el.addEventListener("click", (e) => {
                        const url = new URL(el.getAttribute("href"), window.location.origin);
                        const placeId = url.searchParams.get("id");
                        if (el.getAttribute("href").startsWith("daerah-detail.html")) {
                            e.preventDefault();
                            window.openDrawer(placeId);
                        }
                    });
                });
            }
            syncMap();
            updateAchievements();
        }

        document.querySelectorAll(".map-region").forEach(regionEl => {
            regionEl.addEventListener("click", () => {
                pulseMapFocus();
                selectRegion(regionEl.dataset.region);
            });
            regionEl.addEventListener("keydown", event => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    pulseMapFocus();
                    selectRegion(regionEl.dataset.region);
                }
            });
        });
        document.addEventListener("keydown", event => {
            if (event.key === "Escape" && drawer?.classList.contains("active")) closeDrawer();
            if (event.key !== "Tab" || !drawer?.classList.contains("active")) return;
            const focusable = Array.from(drawer.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'))
                .filter(element => element.offsetParent !== null);
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
        });
        render();
    }

    function initAtlasCatalogPage() {
        core.renderNav("bahasa-daerah.html");

        const regionImages = {
            Sumatra: "assets/daerah/editorial-sumatra.jpg",
            Jawa: "assets/daerah/editorial-jawa.jpg",
            Kalimantan: "assets/daerah/editorial-kalimantan.jpg",
            Sulawesi: "assets/daerah/editorial-sulawesi.jpg",
            "Bali-Nusa": "assets/daerah/editorial-bali-nusa.jpg",
            Maluku: "assets/daerah/editorial-maluku.jpg",
            "Papua Raya": "assets/daerah/editorial-papua.jpg"
        };
        const regionDescriptions = {
            Sumatra: "Jejak tutur dari barat",
            Jawa: "Bahasa, laku, dan cerita",
            Kalimantan: "Suara dari jantung rimba",
            Sulawesi: "Tradisi di lengan samudra",
            "Bali-Nusa": "Ritual di kepulauan selatan",
            Maluku: "Warisan dari pulau rempah",
            "Papua Raya": "Cerita dari tanah timur"
        };

        const el = {
            regionStories: document.getElementById("regionStories"),
            regionChips: document.getElementById("regionChips"),
            grid: document.getElementById("cultureGrid"),
            resultTitle: document.getElementById("cultureResultTitle"),
            resultMeta: document.getElementById("cultureResultMeta"),
            search: document.getElementById("cultureSearch"),
            clearSearch: document.getElementById("clearSearch"),
            statusFilters: document.getElementById("statusFilters"),
            resetFilters: document.getElementById("resetCultureFilters"),
            mapReset: document.getElementById("mapZoomReset"),
            mapActiveLabel: document.getElementById("mapActiveLabel"),
            drawer: document.getElementById("detailDrawer"),
            overlay: document.getElementById("drawerOverlay"),
            drawerClose: document.getElementById("drawerClose"),
            favorite: document.getElementById("drawerFavoriteBtn"),
            mastered: document.getElementById("drawerMasteredBtn"),
            glossarySearch: document.getElementById("glossarySearch"),
            glossaryResults: document.getElementById("glossaryResults"),
            status: document.getElementById("atlasStatus"),
            main: document.querySelector(".atlas-page")
        };

        let selectedRegion = core.storage.get("wonder_region", "Semua");
        if (selectedRegion === "Papua") selectedRegion = "Papua Raya";
        if (!data.regions.includes(selectedRegion)) selectedRegion = "Semua";
        let statusFilter = "all";
        let searchQuery = "";
        let activePlace = null;
        let lastDrawerTrigger = null;
        let closeTimer = null;
        let announceTimer = null;

        const normalize = value => String(value || "").toLocaleLowerCase("id-ID");
        const placeSearchText = place => normalize([
            place.label,
            place.region,
            place.summary,
            place.fact,
            ...(place.destination || []),
            ...(place.food || []),
            ...(place.tradition || []),
            ...(place.phrases || []).flat(),
            ...(place.cards || []).flat()
        ].join(" "));

        function imageFor(place) {
            return regionImages[place.region] || regionImages.Jawa;
        }

        function announce(message, delay = 0) {
            if (!el.status) return;
            window.clearTimeout(announceTimer);
            el.status.textContent = "";
            announceTimer = window.setTimeout(() => {
                el.status.textContent = message;
            }, delay);
        }

        function renderRegionStories() {
            if (!el.regionStories) return;
            el.regionStories.innerHTML = data.regions
                .filter(region => region !== "Semua")
                .map(region => {
                    const count = data.getPlacesByRegion(region).length;
                    return `
                        <button type="button" class="region-story ${selectedRegion === region ? "active" : ""}"
                            data-region="${region}" aria-pressed="${selectedRegion === region}"
                            aria-controls="cultureGrid" aria-label="Jelajahi region ${region}, ${count} daerah tersedia">
                            <img src="${regionImages[region]}" alt="" width="1440" height="1080"
                                loading="lazy" decoding="async">
                            <span class="region-story-copy">
                                <strong>${region}</strong>
                                <small>${count} daerah · ${regionDescriptions[region]}</small>
                            </span>
                        </button>
                    `;
                }).join("");
        }

        function renderRegionChips() {
            if (!el.regionChips) return;
            el.regionChips.innerHTML = data.regions.map(region => {
                const count = data.getPlacesByRegion(region).length;
                const label = region === "Semua" ? "Semua region" : region;
                return `<button type="button" class="region-chip ${selectedRegion === region ? "active" : ""}"
                    data-region="${region}" aria-pressed="${selectedRegion === region}"
                    aria-controls="cultureGrid">${label} <small>${count}</small></button>`;
            }).join("");
        }

        function filteredPlaces() {
            const progress = core.getProgress();
            const favorites = new Set(progress.favorites || []);
            const mastered = new Set(progress.mastered || []);
            const explored = new Set(progress.explored || []);
            let places = data.getPlacesByRegion(selectedRegion);

            if (statusFilter === "favorites") places = places.filter(place => favorites.has(place.id));
            if (statusFilter === "mastered") places = places.filter(place => mastered.has(place.id));
            if (statusFilter === "unexplored") places = places.filter(place => !explored.has(place.id));
            if (searchQuery) places = places.filter(place => placeSearchText(place).includes(searchQuery));
            return places;
        }

        function renderCard(place, index) {
            const progress = core.getProgress();
            const isFavorite = (progress.favorites || []).includes(place.id);
            const isMastered = (progress.mastered || []).includes(place.id);
            const isExplored = (progress.explored || []).includes(place.id);
            const state = isMastered ? "Dikuasai" : isExplored ? "Sudah dijelajahi" : "Belum dibuka";
            return `
                <article class="culture-card-link ${isFavorite ? "is-favorite" : ""} ${isMastered ? "is-mastered" : ""}"
                    style="--stagger-delay:${index}">
                    <img class="culture-card-image" src="${imageFor(place)}" alt="" width="1440" height="1080"
                        loading="lazy" decoding="async">
                    <button type="button" class="culture-card-main" data-place-id="${place.id}"
                        aria-label="Preview ${place.label}" aria-controls="detailDrawer">
                        <span class="culture-card-copy">
                            <span class="culture-card-kicker">
                                <span class="culture-mark">${place.mark}</span>${place.region}
                            </span>
                            <h4>${place.label}</h4>
                            <p>${place.summary}</p>
                            <span class="culture-card-meta">
                                <span><i class="fa-solid fa-language" aria-hidden="true"></i>
                                    ${place.cards?.[0]?.[0] || "Frasa lokal"}</span>
                                <span>${state} <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></span>
                            </span>
                        </span>
                    </button>
                </article>
            `;
        }

        function syncMap() {
            document.querySelectorAll(".map-region").forEach(region => {
                const active = region.dataset.region === selectedRegion;
                region.classList.toggle("active", active);
                region.setAttribute("aria-pressed", String(active));
            });
            if (el.mapActiveLabel) {
                el.mapActiveLabel.textContent = selectedRegion === "Semua" ? "Seluruh Indonesia" : selectedRegion;
            }
        }

        function renderCatalog() {
            const places = filteredPlaces();
            const hasFilters = selectedRegion !== "Semua" || statusFilter !== "all" || Boolean(searchQuery);
            if (el.resultTitle) {
                el.resultTitle.textContent = places.length
                    ? `${places.length} ${places.length === 1 ? "cerita" : "cerita"} menunggu`
                    : "Belum ada cerita yang cocok";
            }
            if (el.resultMeta) {
                const labels = [
                    selectedRegion === "Semua" ? "Seluruh Indonesia" : selectedRegion,
                    statusFilter === "favorites" ? "Favorit" : "",
                    statusFilter === "mastered" ? "Dikuasai" : "",
                    statusFilter === "unexplored" ? "Belum dibuka" : "",
                    searchQuery ? `“${el.search.value.trim()}”` : ""
                ].filter(Boolean);
                el.resultMeta.textContent = labels.join(" · ");
            }
            if (el.resetFilters) el.resetFilters.hidden = !hasFilters;
            if (el.grid) {
                el.grid.innerHTML = places.length
                    ? places.map(renderCard).join("")
                    : `<div class="culture-empty-state" role="status">
                        <i class="fa-regular fa-compass" aria-hidden="true"></i>
                        <strong>Jejaknya belum ditemukan.</strong>
                        <p>Coba kata lain atau tampilkan kembali seluruh Indonesia.</p>
                        <button type="button" class="map-reset" id="emptyResetFilters">Reset penelusuran</button>
                    </div>`;
            }
            renderRegionStories();
            renderRegionChips();
            syncMap();
            updateJourney();
        }

        function selectRegion(region, shouldScroll = false) {
            selectedRegion = region === "Papua" ? "Papua Raya" : region;
            core.storage.set("wonder_region", selectedRegion);
            renderCatalog();
            announce(
                `${selectedRegion === "Semua" ? "Seluruh Indonesia" : `Region ${selectedRegion}`} dipilih. ` +
                `${filteredPlaces().length} cerita ditampilkan.`
            );
            if (shouldScroll) {
                document.getElementById("atlasWorkspace")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        }

        function resetFilters() {
            selectedRegion = "Semua";
            statusFilter = "all";
            searchQuery = "";
            core.storage.set("wonder_region", selectedRegion);
            if (el.search) el.search.value = "";
            if (el.clearSearch) el.clearSearch.hidden = true;
            el.statusFilters?.querySelectorAll("[data-filter]").forEach(button => {
                const active = button.dataset.filter === "all";
                button.classList.toggle("active", active);
                button.setAttribute("aria-pressed", String(active));
            });
            renderCatalog();
            announce(`${data.places.length} cerita dari seluruh Indonesia ditampilkan.`);
        }

        function updateJourney() {
            const progress = core.getProgress();
            const explored = (progress.explored || []).length;
            const mastered = (progress.mastered || []).length;
            const accuracy = Math.round((progress.correct || 0) / Math.max(progress.reviewed || 0, 1) * 100);
            const track = document.querySelector(".language-progress-track div");
            core.setText("languageTotal", data.places.length);
            core.setText("languageReviewed", explored);
            core.setText("languageCorrect", `${accuracy}%`);
            if (track) track.style.width = `${Math.round((explored / data.places.length) * 100)}%`;
            core.setText("journeyExplored", explored);
            core.setText("journeyMastered", mastered);
            core.setText("journeyStreak", progress.streak || 0);
            core.setText(
                "journeySummary",
                explored
                    ? `${explored} dari ${data.places.length} daerah sudah masuk ke peta pengetahuanmu.`
                    : "Mulai dari satu daerah dan bangun peta pengetahuanmu."
            );
        }

        function updateDrawerStatus() {
            if (!activePlace) return;
            const progress = core.getProgress();
            const favorite = (progress.favorites || []).includes(activePlace.id);
            const mastered = (progress.mastered || []).includes(activePlace.id);
            if (el.favorite) {
                el.favorite.setAttribute("aria-pressed", String(favorite));
                el.favorite.innerHTML = `<i class="${favorite ? "fa-solid" : "fa-regular"} fa-heart"></i>
                    ${favorite ? "Tersimpan" : "Simpan favorit"}`;
            }
            if (el.mastered) {
                el.mastered.setAttribute("aria-pressed", String(mastered));
                el.mastered.innerHTML = `<i class="${mastered ? "fa-solid" : "fa-regular"} fa-circle-check"></i>
                    ${mastered ? "Sudah dikuasai" : "Tandai dikuasai"}`;
            }
        }

        function openDrawer(placeId, trigger) {
            const place = data.getPlaceById(placeId);
            if (!place || !el.drawer || !el.overlay) return;
            window.clearTimeout(closeTimer);
            activePlace = place;
            lastDrawerTrigger = trigger || document.activeElement;
            core.markExplored(place.id);
            core.setText("drawerRegion", place.region);
            core.setText("drawerMark", place.mark);
            core.setText("drawerTitle", place.label);
            core.setText("drawerSummary", place.summary);
            core.setText("drawerFact", place.fact);
            core.setText("drawerFoodName", place.food?.[0] || "—");
            core.setText("drawerTradName", place.tradition?.[0] || "—");
            core.setText("drawerDestName", place.destination?.[0] || "—");

            const drawerImage = document.getElementById("drawerImage");
            if (drawerImage) {
                drawerImage.src = imageFor(place);
                drawerImage.alt = `Potret budaya region ${place.region}`;
            }
            const phrases = (place.cards?.length ? place.cards : place.phrases || []).slice(0, 3);
            const phraseList = document.getElementById("drawerPhraseList");
            if (phraseList) {
                phraseList.innerHTML = phrases.map(item => `
                    <article class="drawer-phrase">
                        <strong>${item[0]}</strong>
                        <span>${item[1]}</span>
                        <small>${item[2] || `Ungkapan dari ${place.label}`}</small>
                    </article>
                `).join("");
            }
            const detailLink = document.getElementById("drawerFullDetailLink");
            const practiceLink = document.getElementById("drawerPracticeLink");
            if (detailLink) detailLink.href = core.placeUrl("daerah-detail.html", place.id);
            if (practiceLink) practiceLink.href = core.placeUrl("latihan-bahasa.html", place.id);
            const navPractice = document.getElementById("practiceNavLink");
            if (navPractice) navPractice.href = core.placeUrl("latihan-bahasa.html", place.id);

            updateDrawerStatus();
            el.overlay.hidden = false;
            el.drawer.hidden = false;
            document.body.classList.add("drawer-open");
            el.drawerClose?.focus();
            if (el.main) {
                el.main.inert = true;
                el.main.setAttribute("aria-hidden", "true");
            }
            announce(`Preview ${place.label} dibuka.`);
            updateJourney();
        }

        function closeDrawer() {
            if (!el.drawer || !el.overlay || el.drawer.hidden) return;
            document.body.classList.remove("drawer-open");
            closeTimer = window.setTimeout(() => {
                el.drawer.hidden = true;
                el.overlay.hidden = true;
                if (el.main) {
                    el.main.inert = false;
                    el.main.removeAttribute("aria-hidden");
                }
                const closedPlace = activePlace?.label || "daerah";
                activePlace = null;
                if (lastDrawerTrigger?.isConnected) lastDrawerTrigger.focus();
                announce(`Preview ${closedPlace} ditutup.`);
            }, 360);
        }

        function navigateButtonRail(event, container) {
            if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
            const current = event.target.closest("button[data-region]");
            if (!current) return;
            const buttons = Array.from(container.querySelectorAll("button[data-region]"));
            const currentIndex = buttons.indexOf(current);
            if (currentIndex < 0) return;
            event.preventDefault();
            let nextIndex = currentIndex;
            if (event.key === "Home") nextIndex = 0;
            if (event.key === "End") nextIndex = buttons.length - 1;
            if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
            if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % buttons.length;
            buttons[nextIndex]?.focus();
            buttons[nextIndex]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
        }

        function renderGlossary(query = "") {
            if (!el.glossaryResults) return;
            const normalizedQuery = normalize(query.trim());
            const entries = data.places.flatMap(place =>
                (place.cards || []).map(card => ({
                    local: card[0],
                    meaning: card[1],
                    note: card[2],
                    place: place.label,
                    region: place.region
                }))
            );
            const visible = entries
                .filter(entry => !normalizedQuery || normalize(Object.values(entry).join(" ")).includes(normalizedQuery))
                .slice(0, normalizedQuery ? 12 : 6);
            el.glossaryResults.innerHTML = visible.length
                ? visible.map(entry => `
                    <article class="glossary-result">
                        <div class="glossary-result-head">
                            <strong>${entry.local}</strong>
                            <span class="mini-tag">${entry.place}</span>
                        </div>
                        <span class="glossary-meaning">${entry.meaning}</span>
                        <small>${entry.note || `Ungkapan dari region ${entry.region}.`}</small>
                    </article>
                `).join("")
                : `<p class="glossary-empty">Belum ada kata yang cocok. Coba ejaan atau makna lain.</p>`;
        }

        el.regionStories?.addEventListener("click", event => {
            const button = event.target.closest("[data-region]");
            if (button) selectRegion(button.dataset.region, true);
        });
        el.regionStories?.addEventListener("keydown", event => navigateButtonRail(event, el.regionStories));
        el.regionChips?.addEventListener("click", event => {
            const button = event.target.closest("[data-region]");
            if (button) selectRegion(button.dataset.region);
        });
        el.regionChips?.addEventListener("keydown", event => navigateButtonRail(event, el.regionChips));
        document.getElementById("indonesiaMap")?.addEventListener("click", event => {
            const region = event.target.closest(".map-region");
            if (region) selectRegion(region.dataset.region);
        });
        document.querySelectorAll(".map-region").forEach(region => {
            region.addEventListener("keydown", event => {
                if (event.key !== "Enter" && event.key !== " ") return;
                event.preventDefault();
                selectRegion(region.dataset.region);
            });
        });
        el.grid?.addEventListener("click", event => {
            const trigger = event.target.closest("[data-place-id]");
            if (trigger) openDrawer(trigger.dataset.placeId, trigger);
            if (event.target.closest("#emptyResetFilters")) resetFilters();
        });
        el.search?.addEventListener("input", event => {
            searchQuery = normalize(event.target.value.trim());
            if (el.clearSearch) el.clearSearch.hidden = !searchQuery;
            renderCatalog();
            announce(
                searchQuery
                    ? `${filteredPlaces().length} hasil untuk ${event.target.value.trim()}.`
                    : `${filteredPlaces().length} cerita ditampilkan.`,
                180
            );
        });
        el.clearSearch?.addEventListener("click", () => {
            el.search.value = "";
            searchQuery = "";
            el.clearSearch.hidden = true;
            el.search.focus();
            renderCatalog();
            announce(`${filteredPlaces().length} cerita ditampilkan.`);
        });
        el.statusFilters?.addEventListener("click", event => {
            const button = event.target.closest("[data-filter]");
            if (!button) return;
            statusFilter = button.dataset.filter;
            el.statusFilters.querySelectorAll("[data-filter]").forEach(item => {
                const active = item === button;
                item.classList.toggle("active", active);
                item.setAttribute("aria-pressed", String(active));
            });
            renderCatalog();
            announce(`${filteredPlaces().length} cerita sesuai filter ${button.textContent.trim()} ditampilkan.`);
        });
        el.resetFilters?.addEventListener("click", resetFilters);
        el.mapReset?.addEventListener("click", () => selectRegion("Semua"));
        el.overlay?.addEventListener("click", closeDrawer);
        el.drawerClose?.addEventListener("click", closeDrawer);
        el.favorite?.addEventListener("click", () => {
            if (!activePlace) return;
            const progress = core.toggleProgressList("favorites", activePlace.id);
            const saved = (progress.favorites || []).includes(activePlace.id);
            core.showToast(saved ? `${activePlace.label} disimpan ke favorit.` : `${activePlace.label} dihapus dari favorit.`);
            updateDrawerStatus();
            renderCatalog();
        });
        el.mastered?.addEventListener("click", () => {
            if (!activePlace) return;
            const progress = core.toggleProgressList("mastered", activePlace.id);
            const mastered = (progress.mastered || []).includes(activePlace.id);
            core.showToast(mastered ? `${activePlace.label} ditandai dikuasai.` : `Status ${activePlace.label} diperbarui.`);
            updateDrawerStatus();
            renderCatalog();
        });
        el.glossarySearch?.addEventListener("input", event => renderGlossary(event.target.value));
        document.addEventListener("keydown", event => {
            if (event.key === "Escape" && !el.drawer?.hidden) {
                closeDrawer();
                return;
            }
            if (
                event.key === "Escape" &&
                document.activeElement === el.search &&
                el.search?.value
            ) {
                el.search.value = "";
                searchQuery = "";
                if (el.clearSearch) el.clearSearch.hidden = true;
                renderCatalog();
                announce(`${filteredPlaces().length} cerita ditampilkan.`);
                return;
            }
            const typingTarget = event.target.matches?.("input, textarea, select, [contenteditable='true']");
            if (event.key === "/" && !typingTarget && el.drawer?.hidden) {
                event.preventDefault();
                el.search?.focus();
                return;
            }
            if (event.key !== "Tab" || el.drawer?.hidden) return;
            const focusable = Array.from(el.drawer.querySelectorAll(
                'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
            )).filter(node => node.offsetParent !== null);
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
        });

        window.openDrawer = placeId => openDrawer(placeId, document.activeElement);
        updateJourney();
        renderGlossary();
        renderCatalog();
    }

    function fillPlaceHero(place) {
        core.setText("placeMark", place.mark);
        core.setText("placeTitle", place.label);
        core.setText("placeRegion", place.region);
        core.setText("placeSummary", place.summary);
        core.setText("placeFact", place.fact);
        document.querySelectorAll("[data-place-link]").forEach(link => {
            const page = link.dataset.placeLink;
            link.href = core.placeUrl(page, place.id);
        });
    }

    function initDetailPage() {
        core.renderNav("bahasa-daerah.html");
        const place = core.getSelectedPlace();
        core.markExplored(place.id);
        fillPlaceHero(place);
        core.setText("destinationName", place.destination[0]);
        core.setText("destinationDesc", place.destination[1]);
        core.setText("foodName", place.food[0]);
        core.setText("foodDesc", place.food[1]);
        core.setText("traditionName", place.tradition[0]);
        core.setText("traditionDesc", place.tradition[1]);

        // Progress Buttons
        const favBtn = document.getElementById("detailFavoriteBtn");
        const mastBtn = document.getElementById("detailMasteredBtn");

        function updateProgressButtons() {
            const progress = core.getProgress();
            if (favBtn) {
                const isFav = (progress.favorites || []).includes(place.id);
                favBtn.innerHTML = isFav ? `<i class="fa-solid fa-heart"></i> Terfavorit` : `<i class="fa-regular fa-heart"></i> Favorit`;
                favBtn.classList.toggle("active", isFav);
            }
            if (mastBtn) {
                const isMast = (progress.mastered || []).includes(place.id);
                mastBtn.innerHTML = isMast ? `<i class="fa-solid fa-circle-check"></i> Dikuasai` : `<i class="fa-regular fa-circle-check"></i> Dikuasai`;
                mastBtn.classList.toggle("active", isMast);
            }
        }

        if (favBtn) {
            favBtn.addEventListener("click", () => {
                core.toggleProgressList("favorites", place.id);
                updateProgressButtons();
                core.showToast("Status favorit daerah diperbarui.");
            });
        }

        if (mastBtn) {
            mastBtn.addEventListener("click", () => {
                core.toggleProgressList("mastered", place.id);
                updateProgressButtons();
                core.showToast("Status dikuasai daerah diperbarui.");
            });
        }

        updateProgressButtons();

        // Phrases Harian
        const phraseGrid = document.getElementById("phraseGrid");
        if (phraseGrid) {
            phraseGrid.innerHTML = place.phrases.map((item, index) => `
                <article class="phrase-card-interactive" style="--stagger-delay: ${index}" data-phrase="${item[0]}">
                    <div class="phrase-main">
                        <strong>${item[0]}</strong>
                        <p class="muted">${item[1]}</p>
                    </div>
                    <button class="phrase-audio-btn"><i class="fa-solid fa-volume-high"></i></button>
                </article>
            `).join("");

            phraseGrid.querySelectorAll(".phrase-card-interactive").forEach(card => {
                const playAudio = () => {
                    if (!("speechSynthesis" in window)) {
                        core.showToast("Browser belum mendukung suara otomatis.");
                        return;
                    }
                    const text = card.dataset.phrase;
                    window.speechSynthesis.cancel();
                    const utterance = new SpeechSynthesisUtterance(text);
                    utterance.lang = "id-ID";
                    utterance.rate = 0.85;
                    window.speechSynthesis.speak(utterance);
                };
                card.querySelector(".phrase-audio-btn").addEventListener("click", (e) => {
                    e.stopPropagation();
                    playAudio();
                });
                card.addEventListener("click", playAudio);
            });
        }

        // Quiz Widget
        const quizQuestion = document.getElementById("detailQuizQuestion");
        const quizAnswers = document.getElementById("detailQuizAnswers");

        function renderDetailQuiz() {
            if (!place.quiz || !quizQuestion || !quizAnswers) return;
            const quiz = place.quiz;
            const correctAnswer = quiz.answers[quiz.correct];
            const answers = [...quiz.answers].sort(() => Math.random() - 0.5);
            quizQuestion.textContent = quiz.q;
            quizAnswers.classList.remove("answered");
            quizAnswers.innerHTML = answers.map(answer => `<button class="answer-btn">${answer}</button>`).join("");

            quizAnswers.querySelectorAll("button").forEach(button => {
                button.addEventListener("click", () => {
                    const progress = core.getProgress();
                    progress.reviewed += 1;
                    progress.quizDone = (progress.quizDone || 0) + 1;
                    quizAnswers.classList.add("answered");
                    if (button.textContent === correctAnswer) {
                        progress.correct += 1;
                        button.classList.add("correct");
                        core.showToast("Jawaban Anda benar!");
                    } else {
                        button.classList.add("wrong");
                        core.showToast(`Jawaban yang benar: ${correctAnswer}`);
                    }
                    quizAnswers.querySelectorAll("button").forEach(item => {
                        item.disabled = true;
                        if (item.textContent === correctAnswer) item.classList.add("correct");
                    });
                    core.saveProgress(progress);
                    renderDetailQuizStats();
                });
            });
        }

        function renderDetailQuizStats() {
            const progress = core.getProgress();
            const accuracy = Math.round((progress.correct / Math.max(progress.reviewed, 1)) * 100);
            const stats = document.getElementById("detailQuizStats");
            if (stats) {
                stats.innerHTML = `
                    <strong>${accuracy}% Akurasi</strong>
                    <span>${progress.correct}/${progress.reviewed} jawaban benar - ${progress.quizDone || 0} kuis selesai</span>
                `;
            }
        }

        renderDetailQuiz();
        renderDetailQuizStats();

        // Related Regions
        const related = document.getElementById("relatedGrid");
        if (related) {
            related.innerHTML = data.getPlacesByRegion(place.region)
                .filter(item => item.id !== place.id)
                .slice(0, 3)
                .map(item => core.renderCultureCard(item))
                .join("");
        }
    }

    function initPracticePage() {
        core.renderNav("bahasa-daerah.html");
        const place = core.getSelectedPlace();
        core.markExplored(place.id);
        fillPlaceHero(place);
        let currentIndex = 0;
        let showingMeaning = false;
        const flashcard = document.getElementById("flashcard");
        const progressText = document.getElementById("flashcardProgress");
        const progressBar = document.getElementById("flashcardBar");
        const vocabList = document.getElementById("vocabList");
        const favoriteBtn = document.getElementById("toggleFavorite");
        const masteredBtn = document.getElementById("markMastered");

        function updateButtons() {
            const progress = core.getProgress();
            if (favoriteBtn) favoriteBtn.textContent = (progress.favorites || []).includes(place.id) ? "Hapus Favorit" : "Favorit";
            if (masteredBtn) masteredBtn.textContent = (progress.mastered || []).includes(place.id) ? "Sudah Dikuasai" : "Tandai Dikuasai";
        }

        function renderCard() {
            if (!flashcard || !place.cards || !place.cards.length) return;
            const card = place.cards[currentIndex % place.cards.length];
            showingMeaning = false;
            flashcard.classList.remove("is-flipped", "is-flipping");
            flashcard.innerHTML = `<small>${place.label}</small><strong>${card[0]}</strong><span>${card[2]}</span>`;
            const activeIndex = (currentIndex % place.cards.length) + 1;
            if (progressText) progressText.textContent = `Kartu ${activeIndex}/${place.cards.length}`;
            if (progressBar) progressBar.style.width = `${Math.round((activeIndex / place.cards.length) * 100)}%`;
            if (vocabList) {
                vocabList.innerHTML = place.cards.map((item, index) => `
                    <div class="vocab-item ${index === currentIndex % place.cards.length ? "is-active" : ""}">
                        <div><strong>${item[0]}</strong><span class="muted">${item[1]}</span></div>
                        <span class="mini-tag">${item[2]}</span>
                    </div>
                `).join("");
            }
            updateButtons();
        }

        flashcard?.addEventListener("click", () => {
            if (!place.cards || !place.cards.length) return;
            const card = place.cards[currentIndex % place.cards.length];
            showingMeaning = !showingMeaning;
            flashcard.classList.add("is-flipping");
            window.setTimeout(() => {
                flashcard.classList.toggle("is-flipped", showingMeaning);
                flashcard.innerHTML = showingMeaning
                    ? `<small>Arti</small><strong>${card[1]}</strong><span>${card[0]}</span>`
                    : `<small>${place.label}</small><strong>${card[0]}</strong><span>${card[2]}</span>`;
                flashcard.classList.remove("is-flipping");
            }, 120);
        });
        document.getElementById("nextWord")?.addEventListener("click", () => {
            const progress = core.getProgress();
            progress.reviewed += 1;
            core.saveProgress(progress);
            currentIndex += 1;
            renderCard();
        });
        document.getElementById("listenWord")?.addEventListener("click", () => {
            if (!place.cards || !place.cards.length) return;
            const card = place.cards[currentIndex % place.cards.length];
            if (!("speechSynthesis" in window)) {
                core.showToast("Browser belum mendukung suara otomatis.");
                return;
            }
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(`${card[0]}. Artinya ${card[1]}.`);
            utterance.lang = "id-ID";
            utterance.rate = 0.88;
            window.speechSynthesis.speak(utterance);
        });
        favoriteBtn?.addEventListener("click", () => {
            core.toggleProgressList("favorites", place.id);
            updateButtons();
            core.showToast("Status favorit diperbarui.");
        });
        masteredBtn?.addEventListener("click", () => {
            core.toggleProgressList("mastered", place.id);
            updateButtons();
            core.showToast("Status dikuasai diperbarui.");
        });
        renderCard();
    }

    function initQuizPage() {
        core.renderNav("bahasa-daerah.html");
        const place = core.getSelectedPlace();
        core.markExplored(place.id);
        fillPlaceHero(place);
        const question = document.getElementById("languageQuizQuestion");
        const answerGrid = document.getElementById("languageAnswers");
        const nextButton = document.getElementById("nextCultureQuiz");
        const stat = document.getElementById("quizProgressSummary");

        function renderQuiz() {
            if (!place.quiz || !question || !answerGrid) return;
            const correctAnswer = place.quiz.answers[place.quiz.correct];
            const answers = [...place.quiz.answers].sort(() => Math.random() - 0.5);
            question.textContent = place.quiz.q;
            answerGrid.classList.remove("answered");
            answerGrid.innerHTML = answers.map(answer => `<button class="answer-btn">${answer}</button>`).join("");
            answerGrid.querySelectorAll("button").forEach(button => {
                button.addEventListener("click", () => {
                    const progress = core.getProgress();
                    progress.reviewed += 1;
                    progress.quizDone = (progress.quizDone || 0) + 1;
                    answerGrid.classList.add("answered");
                    if (button.textContent === correctAnswer) {
                        progress.correct += 1;
                        button.classList.add("correct");
                        core.showToast("Jawaban budaya benar.");
                    } else {
                        button.classList.add("wrong");
                        core.showToast(`Jawaban tepat: ${correctAnswer}`);
                    }
                    answerGrid.querySelectorAll("button").forEach(item => {
                        item.disabled = true;
                        if (item.textContent === correctAnswer) item.classList.add("correct");
                    });
                    core.saveProgress(progress);
                    renderStats();
                });
            });
        }

        function renderStats() {
            if (!stat) return;
            const progress = core.getProgress();
            const accuracy = Math.round((progress.correct / Math.max(progress.reviewed, 1)) * 100);
            stat.innerHTML = `
                <strong>${accuracy}% akurasi</strong>
                <span>${progress.correct}/${progress.reviewed} jawaban benar - ${progress.quizDone || 0} quiz selesai</span>
            `;
        }

        nextButton?.addEventListener("click", () => {
            const sameRegion = data.getPlacesByRegion(place.region);
            const currentPosition = sameRegion.findIndex(item => item.id === place.id);
            const nextPlace = sameRegion[(currentPosition + 1) % sameRegion.length] || data.getDefaultPlace();
            window.location.href = core.placeUrl("quiz-budaya.html", nextPlace.id);
        });
        renderQuiz();
        renderStats();
    }

    document.addEventListener("DOMContentLoaded", () => {
        core.initTheme();
        const page = document.body.dataset.page;
        if (page === "bahasa") initAtlasCatalogPage();
        if (page === "wonder-detail") initDetailPage();
        if (page === "wonder-latihan") initPracticePage();
        if (page === "wonder-quiz") initQuizPage();
    });
})();
