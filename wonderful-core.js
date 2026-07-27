(function () {
    const data = window.WonderfulData;

    const storage = {
        get(key, fallback) {
            try {
                return JSON.parse(localStorage.getItem(key)) ?? fallback;
            } catch {
                return fallback;
            }
        },
        set(key, value) {
            localStorage.setItem(key, JSON.stringify(value));
        }
    };

    const defaultProgress = {
        reviewed: 0,
        correct: 0,
        explored: [],
        quizDone: 0,
        favorites: [],
        mastered: [],
        streak: 0,
        lastActiveDay: ""
    };

    function initTheme() {
        const themeToggleBtn = document.getElementById("themeToggleBtn");
        const savedTheme = localStorage.getItem("eduquest_theme") || "light";
        document.body.classList.toggle("dark-theme", savedTheme === "dark");

        // Enable iOS CSS active state touch feedback
        document.addEventListener("touchstart", () => { }, { passive: true });

        if (!themeToggleBtn) return;
        themeToggleBtn.innerHTML = savedTheme === "dark" ? "&#9728;" : "&#127769;";
        themeToggleBtn.addEventListener("click", () => {
            document.body.classList.toggle("dark-theme");
            const isDark = document.body.classList.contains("dark-theme");
            localStorage.setItem("eduquest_theme", isDark ? "dark" : "light");
            themeToggleBtn.innerHTML = isDark ? "&#9728;" : "&#127769;";
        });
    }

    function showToast(message) {
        const toast = document.getElementById("toast");
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add("show");
        clearTimeout(showToast.timer);
        showToast.timer = setTimeout(() => toast.classList.remove("show"), 2200);
    }

    function getProgress() {
        return { ...defaultProgress, ...storage.get("bahasa_progress", defaultProgress) };
    }

    function saveProgress(progress) {
        storage.set("bahasa_progress", progress);
    }

    function todayKey() {
        return new Date().toISOString().slice(0, 10);
    }

    function recordActivity(progress) {
        const today = todayKey();
        if (progress.lastActiveDay !== today) {
            progress.streak = (progress.streak || 0) + 1;
            progress.lastActiveDay = today;
        }
    }

    function markExplored(placeId) {
        const progress = getProgress();
        recordActivity(progress);
        const explored = new Set(progress.explored || []);
        explored.add(placeId);
        progress.explored = Array.from(explored);
        saveProgress(progress);
        storage.set("wonder_place", placeId);
        storage.set("wonder_region", data.getPlaceById(placeId).region);
        return progress;
    }

    function toggleProgressList(key, placeId) {
        const progress = getProgress();
        const values = new Set(progress[key] || []);
        values.has(placeId) ? values.delete(placeId) : values.add(placeId);
        progress[key] = Array.from(values);
        saveProgress(progress);
        return progress;
    }

    function checkAchievements(progress) {
        const explored = progress.explored || [];
        const mastered = progress.mastered || [];
        const favorites = progress.favorites || [];
        const accuracy = progress.reviewed > 0 ? (progress.correct / progress.reviewed) : 0;

        const culinaryIds = ["jawa", "sunda", "minang", "madura"];
        const hasCulinary = culinaryIds.every(id => explored.includes(id));

        return {
            explorer: explored.length >= 5,
            master: mastered.length >= 5,
            culinary: hasCulinary,
            quizmaster: progress.quizDone >= 5 && accuracy >= 0.9,
            preserver: favorites.length >= 5
        };
    }

    function getQueryId() {
        const params = new URLSearchParams(window.location.search);
        return params.get("id") || storage.get("wonder_place", "jawa");
    }

    function getSelectedPlace() {
        return data.getPlaceById(getQueryId());
    }

    function placeUrl(page, placeId) {
        return `${page}?id=${encodeURIComponent(placeId || getSelectedPlace().id)}`;
    }

    function renderNav(activePage) {
        document.querySelectorAll(".nav-links a").forEach(link => {
            const href = link.getAttribute("href") || "";
            link.classList.toggle("active", href.includes(activePage));
        });
    }

    function renderMetricSummary() {
        const progress = getProgress();
        const explored = new Set(progress.explored || []);
        const accuracy = Math.round((progress.correct / Math.max(progress.reviewed, 1)) * 100);
        setText("languageReviewed", progress.reviewed);
        setText("languageCorrect", `${accuracy}%`);
        setText("languageTotal", data.places.length);
        setText("explorerBadge", explored.size >= 10 ? "Master" : explored.size >= 5 ? "Scout" : "Explorer");
        setText("phoneRegionTitle", `${data.places.length} daerah`);
        setText("phoneRegionText", "Pilih region, buka detail, latihan flashcard, lalu quiz.");
        const track = document.querySelector(".language-progress-track div");
        if (track) track.style.width = `${Math.round((explored.size / data.places.length) * 100)}%`;
    }

    function setText(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    }

    function renderCultureCard(place, progress = getProgress()) {
        const explored = new Set(progress.explored || []);
        const favorites = new Set(progress.favorites || []);
        const mastered = new Set(progress.mastered || []);
        return `
            <article class="culture-card-link ${favorites.has(place.id) ? "is-favorite" : ""} ${mastered.has(place.id) ? "is-mastered" : ""}">
                <a class="culture-card-main" href="${placeUrl("daerah-detail.html", place.id)}">
                    <span class="culture-mark">${place.mark}</span>
                    <div>
                        <strong>${place.label}</strong>
                        <p>${place.summary}</p>
                        <div class="culture-card-facts" aria-label="Ringkasan budaya ${place.label}">
                            <span><i class="fa-solid fa-location-dot"></i> ${place.region}</span>
                            <span><i class="fa-solid fa-language"></i> ${place.cards?.[0]?.[0] || "Frasa lokal"}</span>
                            <span><i class="fa-solid fa-utensils"></i> ${place.food?.[0] || "Kuliner utama"}</span>
                        </div>
                        <small>${place.destination[0]} - ${mastered.has(place.id) ? "Dikuasai" : explored.has(place.id) ? "Sudah dijelajahi" : "Belum dibuka"}</small>
                    </div>
                </a>
                <div class="culture-card-actions">
                    <a href="${placeUrl("daerah-detail.html", place.id)}">Detail</a>
                    <a href="${placeUrl("latihan-bahasa.html", place.id)}">Latihan</a>
                    <a href="${placeUrl("quiz-budaya.html", place.id)}">Quiz</a>
                </div>
            </article>
        `;
    }

    window.WonderfulCore = {
        storage,
        initTheme,
        showToast,
        getProgress,
        saveProgress,
        markExplored,
        toggleProgressList,
        getQueryId,
        getSelectedPlace,
        placeUrl,
        renderNav,
        renderMetricSummary,
        renderCultureCard,
        setText,
        checkAchievements
    };
})();
