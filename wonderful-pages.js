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

        const searchInput = document.getElementById("cultureSearch");
        const clearSearchBtn = document.getElementById("clearSearch");
        if (searchInput) {
            searchInput.addEventListener("input", (e) => {
                searchQuery = e.target.value.toLowerCase().trim();
                if (clearSearchBtn) {
                    clearSearchBtn.style.display = searchQuery ? "block" : "none";
                }
                render();
            });
        }
        if (clearSearchBtn) {
            clearSearchBtn.addEventListener("click", () => {
                searchInput.value = "";
                searchQuery = "";
                clearSearchBtn.style.display = "none";
                render();
            });
        }

        const statusFilters = document.getElementById("statusFilters");
        if (statusFilters) {
            statusFilters.querySelectorAll("button").forEach(btn => {
                btn.addEventListener("click", () => {
                    statusFilters.querySelectorAll("button").forEach(b => b.classList.remove("active"));
                    btn.classList.add("active");
                    statusFilter = btn.dataset.filter;
                    render();
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
                    const active = achievements[key];
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
            drawerPlace = data.getPlaceById(placeId);
            core.markExplored(placeId);
            core.renderMetricSummary();

            // Fill content
            document.getElementById("drawerRegion").textContent = drawerPlace.region;
            document.getElementById("drawerMark").textContent = drawerPlace.mark;
            document.getElementById("drawerTitle").textContent = drawerPlace.label;
            document.getElementById("drawerSummary").textContent = drawerPlace.summary;
            document.getElementById("drawerFact").textContent = drawerPlace.fact;

            document.getElementById("drawerDestName").textContent = drawerPlace.destination[0];
            document.getElementById("drawerDestDesc").textContent = drawerPlace.destination[1];
            document.getElementById("drawerFoodName").textContent = drawerPlace.food[0];
            document.getElementById("drawerFoodDesc").textContent = drawerPlace.food[1];
            document.getElementById("drawerTradName").textContent = drawerPlace.tradition[0];
            document.getElementById("drawerTradDesc").textContent = drawerPlace.tradition[1];

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
        }

        function closeDrawer() {
            drawer.classList.remove("active");
            drawerOverlay.classList.remove("active");
            render();
            core.renderMetricSummary();
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

        document.getElementById("drawerFavoriteBtn").addEventListener("click", () => {
            core.toggleProgressList("favorites", drawerPlace.id);
            updateDrawerButtons();
            core.showToast("Status favorit diperbarui.");
        });

        document.getElementById("drawerMasteredBtn").addEventListener("click", () => {
            core.toggleProgressList("mastered", drawerPlace.id);
            updateDrawerButtons();
            core.showToast("Status dikuasai diperbarui.");
        });

        const flashcardEl = document.getElementById("drawerFlashcard");
        const cardProgressText = document.getElementById("drawerCardProgress");
        const cardProgressBar = document.getElementById("drawerCardBar");
        const vocabListEl = document.getElementById("drawerVocabList");

        function renderDrawerCard() {
            if (!drawerPlace || !drawerPlace.cards.length) return;
            const card = drawerPlace.cards[drawerCardIndex % drawerPlace.cards.length];
            drawerShowingMeaning = false;
            flashcardEl.classList.remove("is-flipped", "is-flipping");
            flashcardEl.innerHTML = `
                <small>${drawerPlace.label}</small>
                <strong>${card[0]}</strong>
                <span>${card[2]}</span>
            `;
            const activeIndex = (drawerCardIndex % drawerPlace.cards.length) + 1;
            cardProgressText.textContent = `Kartu ${activeIndex}/${drawerPlace.cards.length}`;
            cardProgressBar.style.width = `${Math.round((activeIndex / drawerPlace.cards.length) * 100)}%`;

            vocabListEl.innerHTML = drawerPlace.cards.map((item, index) => `
                <div class="vocab-item ${index === drawerCardIndex % drawerPlace.cards.length ? "is-active" : ""}">
                    <div><strong>${item[0]}</strong><span class="muted">${item[1]}</span></div>
                    <span class="mini-tag">${item[2]}</span>
                </div>
            `).join("");
        }

        flashcardEl.addEventListener("click", () => {
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

        document.getElementById("drawerPrevWord").addEventListener("click", () => {
            if (drawerCardIndex > 0) {
                drawerCardIndex -= 1;
            } else {
                drawerCardIndex = drawerPlace.cards.length - 1;
            }
            renderDrawerCard();
        });

        document.getElementById("drawerNextWord").addEventListener("click", () => {
            const progress = core.getProgress();
            progress.reviewed += 1;
            core.saveProgress(progress);
            drawerCardIndex += 1;
            renderDrawerCard();
        });

        document.getElementById("drawerListenWord").addEventListener("click", () => {
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
            if (!drawerPlace || !drawerPlace.quiz) return;
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
            if (resultMeta) resultMeta.textContent = selectedRegion === "Semua" ? "Semua region Indonesia" : `Region aktif: ${selectedRegion}`;

            if (cultureGrid) {
                cultureGrid.innerHTML = visible.map((place, index) => {
                    const cardHtml = core.renderCultureCard(place);
                    return cardHtml.replace('class="culture-card-link', `style="--stagger-delay: ${index}" class="culture-card-link`);
                }).join("");

                cultureGrid.querySelectorAll(".culture-card-main, .culture-card-actions a").forEach(el => {
                    el.addEventListener("click", (e) => {
                        const url = new URL(el.getAttribute("href"), window.location.origin);
                        const placeId = url.searchParams.get("id");
                        if (el.getAttribute("href").startsWith("daerah-detail.html")) {
                            e.preventDefault();
                            openDrawer(placeId);
                        }
                    });
                });
            }
            syncMap();
            updateAchievements();
        }

        document.querySelectorAll(".map-region").forEach(regionEl => {
            regionEl.addEventListener("click", () => selectRegion(regionEl.dataset.region));
            regionEl.addEventListener("keydown", event => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    selectRegion(regionEl.dataset.region);
                }
            });
        });
        render();
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
            if (!place.quiz) return;
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
            favoriteBtn.textContent = (progress.favorites || []).includes(place.id) ? "Hapus Favorit" : "Favorit";
            masteredBtn.textContent = (progress.mastered || []).includes(place.id) ? "Sudah Dikuasai" : "Tandai Dikuasai";
        }

        function renderCard() {
            const card = place.cards[currentIndex % place.cards.length];
            showingMeaning = false;
            flashcard.classList.remove("is-flipped", "is-flipping");
            flashcard.innerHTML = `<small>${place.label}</small><strong>${card[0]}</strong><span>${card[2]}</span>`;
            const activeIndex = (currentIndex % place.cards.length) + 1;
            progressText.textContent = `Kartu ${activeIndex}/${place.cards.length}`;
            progressBar.style.width = `${Math.round((activeIndex / place.cards.length) * 100)}%`;
            vocabList.innerHTML = place.cards.map((item, index) => `
                <div class="vocab-item ${index === currentIndex % place.cards.length ? "is-active" : ""}">
                    <div><strong>${item[0]}</strong><span class="muted">${item[1]}</span></div>
                    <span class="mini-tag">${item[2]}</span>
                </div>
            `).join("");
            updateButtons();
        }

        flashcard.addEventListener("click", () => {
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
        document.getElementById("nextWord").addEventListener("click", () => {
            const progress = core.getProgress();
            progress.reviewed += 1;
            core.saveProgress(progress);
            currentIndex += 1;
            renderCard();
        });
        document.getElementById("listenWord").addEventListener("click", () => {
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
        favoriteBtn.addEventListener("click", () => {
            core.toggleProgressList("favorites", place.id);
            updateButtons();
            core.showToast("Status favorit diperbarui.");
        });
        masteredBtn.addEventListener("click", () => {
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
            const progress = core.getProgress();
            const accuracy = Math.round((progress.correct / Math.max(progress.reviewed, 1)) * 100);
            stat.innerHTML = `
                <strong>${accuracy}% akurasi</strong>
                <span>${progress.correct}/${progress.reviewed} jawaban benar - ${progress.quizDone || 0} quiz selesai</span>
            `;
        }

        nextButton.addEventListener("click", () => {
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
        if (page === "bahasa") initCatalogPage();
        if (page === "wonder-detail") initDetailPage();
        if (page === "wonder-latihan") initPracticePage();
        if (page === "wonder-quiz") initQuizPage();
    });
})();
