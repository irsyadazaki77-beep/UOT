(function () {
    "use strict";

    const data = window.WonderfulData;
    const core = window.WonderfulCore;
    const HISTORY_KEY = "wonderCultureQuizHistory";
    const SESSION_KEY_PREFIX = "wonderCultureQuizSession:";
    const ACTIVE_SESSION_KEY = "wonderCultureQuizActiveSession";

    if (!data || !core) return;

    const modeMeta = {
        mix: {
            label: "Campuran Budaya",
            icon: "fa-solid fa-layer-group",
            title: "Campuran Budaya Nusantara",
            desc: "Latihan acak dari bahasa, tradisi, kuliner, destinasi, dan fakta daerah.",
            amount: 10
        },
        region: {
            label: "Penguasaan Region",
            icon: "fa-solid fa-map-location-dot",
            title: "Penguasaan Per Region",
            desc: "Fokus menguasai satu wilayah sampai pola budayanya terasa familiar.",
            amount: 10
        },
        language: {
            label: "Bahasa Daerah",
            icon: "fa-solid fa-comments",
            title: "Bahasa Daerah",
            desc: "Cocok untuk mengingat sapaan, ungkapan, dan arti frasa lokal.",
            amount: 8
        },
        heritage: {
            label: "Warisan & Tradisi",
            icon: "fa-solid fa-landmark",
            title: "Warisan dan Tradisi",
            desc: "Latihan tentang rumah adat, tarian, kain, kuliner, dan ikon budaya.",
            amount: 12
        },
        challenge: {
            label: "Tantangan Cepat",
            icon: "fa-solid fa-bolt",
            title: "Tantangan Cepat",
            desc: "Sesi ringkas untuk menguji ingatan dengan tempo cepat.",
            amount: 5
        }
    };

    function getHistory() {
        try {
            const value = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
            return Array.isArray(value) ? value.slice(0, 12) : [];
        } catch {
            return [];
        }
    }

    function saveHistory(entry) {
        const history = [entry, ...getHistory()].slice(0, 12);
        try {
            localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
        } catch {
            core.showToast("Riwayat belum dapat disimpan di browser ini.");
        }
    }

    function params() {
        return new URLSearchParams(window.location.search);
    }

    function normalizeRegion(value) {
        return data.regions.includes(value) ? value : "Semua";
    }

    function normalizeMode(value) {
        return modeMeta[value] ? value : "mix";
    }

    function normalizePlace(value) {
        if (!value) return "";
        return data.getPlaceById(value).id === value ? value : "";
    }

    function normalizeAmount(value, fallback = 10) {
        const amount = Number(value);
        if (!Number.isFinite(amount)) return fallback;
        return Math.min(24, Math.max(3, Math.round(amount)));
    }

    function shuffle(items) {
        return [...items].sort(() => Math.random() - 0.5);
    }

    function sampleWrong(pool, correct, count = 3) {
        return shuffle([...new Set(pool.filter(Boolean).filter(item => item !== correct))]).slice(0, count);
    }

    function sentenceStart(text, fallback = "") {
        const value = String(text || fallback || "").trim();
        if (!value) return "";
        const sentence = (value.match(/^[^.!?]+[.!?]?/) || [value])[0];
        return sentence.length > 140 ? `${sentence.slice(0, 137)}...` : sentence;
    }

    function question(id, place, type, prompt, correct, wrongPool, explanation, context = "") {
        const wrong = sampleWrong(wrongPool, correct, 3);
        return {
            id,
            placeId: place.id,
            placeLabel: place.label,
            region: place.region,
            type,
            prompt,
            correct,
            answers: shuffle([correct, ...wrong]).slice(0, 4),
            explanation,
            context
        };
    }

    function getQuestionContext(place, type) {
        if (type === "Destinasi") return `Hubungkan ${place.label} dengan tempat, lanskap, atau sejarah lokal yang paling khas.`;
        if (type === "Kuliner") return `Perhatikan bahan, rasa, dan cara penyajian yang menjadi identitas kuliner ${place.label}.`;
        if (type === "Tradisi") return `Fokus pada ikon adat, seni, arsitektur, atau ritual yang melekat dengan ${place.label}.`;
        if (type === "Fakta") return `Cari fakta sosial, sejarah, filosofi, atau pengakuan budaya yang benar tentang ${place.label}.`;
        if (type === "Bahasa" || type === "Kosakata" || type === "Frasa") {
            return `Latihan bahasa ${place.label}: pahami sapaan, kosakata, dan frasa sebelum memilih jawaban.`;
        }
        if (type === "Region") return `${place.label} masuk region ${place.region} dalam katalog Wonderful Indonesia.`;
        return place.summary;
    }

    function buildLanguageQuestionBank(placeId) {
        const place = data.getPlaceById(normalizePlace(placeId) || core.storage.get("wonder_place", "jawa"));
        const allMeanings = data.places.flatMap(item => item.cards.map(card => card[1]).concat(item.phrases.map(phrase => phrase[1])));
        const allLocal = data.places.flatMap(item => item.cards.map(card => card[0]).concat(item.phrases.map(phrase => phrase[0])));
        const cardQuestions = place.cards.flatMap((card, index) => [
            question(
                `${place.id}-card-meaning-${index}`,
                place,
                "Kosakata",
                `Apa arti ungkapan "${card[0]}" dalam bahasa ${place.label}?`,
                card[1],
                allMeanings,
                `${card[0]} berarti ${card[1]}. ${card[2] || "Ungkapan ini termasuk kosakata dasar yang sering muncul dalam percakapan sehari-hari."}`
            ),
            question(
                `${place.id}-card-local-${index}`,
                place,
                "Kosakata",
                `Ungkapan bahasa ${place.label} untuk "${card[1]}" adalah...`,
                card[0],
                allLocal,
                `${card[1]} dalam konteks ${place.label} dapat diucapkan sebagai "${card[0]}". ${card[2] || "Perhatikan bunyi lokalnya agar tidak tertukar dengan daerah lain."}`
            )
        ]);
        const phraseQuestions = place.phrases.flatMap((phrase, index) => [
            question(
                `${place.id}-phrase-meaning-${index}`,
                place,
                "Frasa",
                `Apa arti frasa "${phrase[0]}"?`,
                phrase[1],
                allMeanings,
                `Frasa ${place.label}: "${phrase[0]}" berarti "${phrase[1]}". Frasa ini membantu memahami pola tutur lokal, bukan hanya terjemahan kata per kata.`
            ),
            question(
                `${place.id}-phrase-local-${index}`,
                place,
                "Frasa",
                `Bagaimana mengucapkan "${phrase[1]}" dalam bahasa ${place.label}?`,
                phrase[0],
                allLocal,
                `Gunakan "${phrase[0]}" untuk konteks "${phrase[1]}". Ini menguatkan hubungan antara arti Indonesia dan ekspresi lokal ${place.label}.`
            )
        ]);
        return shuffle([...cardQuestions, ...phraseQuestions]);
    }

    function buildQuestionBank(mode, region, placeId = "") {
        const targetPlace = normalizePlace(placeId) ? data.getPlaceById(placeId) : null;
        const places = targetPlace ? [targetPlace] : normalizeRegion(region) === "Semua" ? data.places : data.getPlacesByRegion(region);
        const sourcePlaces = places.length ? places : data.places;
        const destinationPool = data.places.map(place => place.destination[0]);
        const foodPool = data.places.map(place => place.food[0]);
        const traditionPool = data.places.map(place => place.tradition[0]);
        const phrasePool = data.places.flatMap(place => place.cards.map(card => card[1]));
        const summaryPool = data.places.map(place => sentenceStart(place.summary));
        const factPool = data.places.map(place => sentenceStart(place.fact));
        const regionPool = data.regions.filter(item => item !== "Semua");

        return sourcePlaces.flatMap(place => {
            const firstCard = place.cards[0] || ["", "", ""];
            const secondCard = place.cards[1] || firstCard;
            const firstPhrase = place.phrases[0] || firstCard;
            const secondPhrase = place.phrases[1] || firstPhrase;
            const summaryKey = sentenceStart(place.summary);
            const factKey = sentenceStart(place.fact);
            const base = [
                question(
                    `${place.id}-base`,
                    place,
                    "Budaya",
                    place.quiz.q,
                    place.quiz.answers[place.quiz.correct],
                    place.quiz.answers.concat(traditionPool),
                    `${place.label}: ${place.fact}`
                ),
                question(
                    `${place.id}-identity`,
                    place,
                    "Budaya",
                    `Ciri budaya yang paling menggambarkan ${place.label} adalah...`,
                    summaryKey,
                    summaryPool,
                    `${place.label} dikenali lewat ciri berikut: ${place.summary}`
                ),
                question(
                    `${place.id}-dest`,
                    place,
                    "Destinasi",
                    `Destinasi yang paling lekat dengan ${place.label} adalah...`,
                    place.destination[0],
                    destinationPool,
                    `${place.destination[0]} terkait kuat dengan ${place.label}. ${place.destination[1]}`
                ),
                question(
                    `${place.id}-dest-context`,
                    place,
                    "Destinasi",
                    `Konteks destinasi "${place.destination[0]}" yang tepat adalah...`,
                    sentenceStart(place.destination[1]),
                    data.places.map(item => sentenceStart(item.destination[1])),
                    `${place.destination[0]}: ${place.destination[1]}`
                ),
                question(
                    `${place.id}-food`,
                    place,
                    "Kuliner",
                    `Kuliner khas yang cocok dipasangkan dengan ${place.label} adalah...`,
                    place.food[0],
                    foodPool,
                    `${place.food[0]} adalah kuliner khas ${place.label}. ${place.food[1]}`
                ),
                question(
                    `${place.id}-food-context`,
                    place,
                    "Kuliner",
                    `Deskripsi kuliner "${place.food[0]}" yang tepat adalah...`,
                    sentenceStart(place.food[1]),
                    data.places.map(item => sentenceStart(item.food[1])),
                    `${place.food[0]}: ${place.food[1]}`
                ),
                question(
                    `${place.id}-tradition`,
                    place,
                    "Tradisi",
                    `Tradisi atau ikon budaya utama ${place.label} adalah...`,
                    place.tradition[0],
                    traditionPool,
                    `${place.tradition[0]} merupakan ikon budaya ${place.label}. ${place.tradition[1]}`
                ),
                question(
                    `${place.id}-tradition-context`,
                    place,
                    "Tradisi",
                    `Penjelasan yang tepat untuk "${place.tradition[0]}" adalah...`,
                    sentenceStart(place.tradition[1]),
                    data.places.map(item => sentenceStart(item.tradition[1])),
                    `${place.tradition[0]}: ${place.tradition[1]}`
                ),
                question(
                    `${place.id}-fact`,
                    place,
                    "Fakta",
                    `Fakta cepat yang benar tentang ${place.label} adalah...`,
                    factKey,
                    factPool,
                    `${place.label}: ${place.fact}`
                ),
                question(
                    `${place.id}-language-1`,
                    place,
                    "Bahasa",
                    `Apa arti ungkapan "${firstCard[0]}"?`,
                    firstCard[1],
                    phrasePool,
                    firstCard[2] || place.fact
                ),
                question(
                    `${place.id}-language-2`,
                    place,
                    "Bahasa",
                    `Ungkapan daerah untuk "${secondCard[1]}" adalah...`,
                    secondCard[0],
                    data.places.flatMap(item => item.cards.map(card => card[0])),
                    secondCard[2] || place.fact
                ),
                question(
                    `${place.id}-phrase-1`,
                    place,
                    "Frasa",
                    `Frasa "${firstPhrase[0]}" dari ${place.label} berarti...`,
                    firstPhrase[1],
                    data.places.flatMap(item => item.phrases.map(phrase => phrase[1])),
                    `"${firstPhrase[0]}" berarti "${firstPhrase[1]}". Frasa ini memperkaya konteks percakapan ${place.label}.`
                ),
                question(
                    `${place.id}-phrase-2`,
                    place,
                    "Frasa",
                    `Frasa ${place.label} untuk "${secondPhrase[1]}" adalah...`,
                    secondPhrase[0],
                    data.places.flatMap(item => item.phrases.map(phrase => phrase[0])),
                    `Untuk makna "${secondPhrase[1]}", gunakan frasa "${secondPhrase[0]}" dalam konteks ${place.label}.`
                ),
                question(
                    `${place.id}-region`,
                    place,
                    "Region",
                    `${place.label} berada dalam kelompok region...`,
                    place.region,
                    regionPool,
                    `${place.label} di katalog Wonderful Indonesia masuk region ${place.region}.`
                )
            ];

            if (mode === "language") return base.filter(item => ["Bahasa", "Frasa"].includes(item.type));
            if (mode === "heritage") return base.filter(item => ["Budaya", "Tradisi", "Kuliner", "Destinasi", "Fakta"].includes(item.type));
            if (mode === "region") return base.filter(item => item.type !== "Region");
            return base;
        });
    }

    function buildStartUrl(mode, region, amount, placeId = "", options = {}) {
        const query = new URLSearchParams({
            mode: normalizeMode(mode),
            region: normalizeRegion(region),
            amount: String(normalizeAmount(amount, modeMeta[normalizeMode(mode)].amount))
        });
        if (normalizePlace(placeId)) query.set("place", normalizePlace(placeId));
        if (options.timer) query.set("timer", "1");
        return `quiz-budaya-lms.html?${query.toString()}`;
    }

    function getSessionBank(mode, region, placeId = "") {
        const normalizedMode = normalizeMode(mode);
        const normalizedPlace = normalizePlace(placeId);
        if (normalizedMode === "language" && normalizedPlace) {
            return buildLanguageQuestionBank(normalizedPlace);
        }
        return shuffle(buildQuestionBank(normalizedMode, region, normalizedPlace));
    }

    function getQuizTitle(mode, placeLabel) {
        const meta = modeMeta[normalizeMode(mode)];
        return placeLabel ? `${meta.label} ${placeLabel}` : meta.title;
    }

    function setText(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }

    function createLink(className, href, label) {
        const link = document.createElement("a");
        link.className = className;
        link.href = href;
        link.textContent = label;
        return link;
    }

    function initMenu() {
        core.initTheme();
        core.renderNav("bahasa-daerah.html");

        const query = params();
        let selectedPlaceId = normalizePlace(query.get("place") || query.get("id") || "");
        const selectedPlace = selectedPlaceId ? data.getPlaceById(selectedPlaceId) : null;
        const isPlaceMode = Boolean(selectedPlace);
        const progress = core.getProgress();
        const history = getHistory();
        const scopedHistory = selectedPlace ? history.filter(item => item.placeId === selectedPlace.id) : history;
        const best = scopedHistory.reduce((max, item) => Math.max(max, item.score || 0), 0);
        const reviewed = progress.reviewed || 0;
        const accuracy = Math.round(((progress.correct || 0) / Math.max(reviewed, 1)) * 100);
        const placeAttempts = scopedHistory.reduce((total, item) => total + (item.total || 0), 0);
        const placeCorrect = scopedHistory.reduce((total, item) => total + (item.correct || 0), 0);
        const placeAccuracy = Math.round((placeCorrect / Math.max(placeAttempts, 1)) * 100);
        const displayAccuracy = selectedPlace ? placeAccuracy : accuracy;
        document.body.classList.toggle("is-place-quiz", isPlaceMode);
        const regionSection = document.querySelector(".culture-region-section");
        if (regionSection) regionSection.hidden = isPlaceMode;
        const compactOnlySections = [
            document.querySelector(".culture-quiz-control"),
            document.querySelector(".culture-mode-section"),
            document.querySelector(".culture-history-section")
        ];
        compactOnlySections.forEach(section => {
            if (section) section.hidden = false;
        });
        if (selectedPlace) {
            document.title = `Kuis Budaya ${selectedPlace.label} - Wonderful Indonesia`;
            const hero = document.querySelector(".culture-quiz-copy");
            hero?.querySelector(".mini-tag") && (hero.querySelector(".mini-tag").textContent = `Kuis ${selectedPlace.region}`);
            const heroTitle = hero?.querySelector("h1");
            const heroText = hero?.querySelector("p");
            if (heroTitle) heroTitle.textContent = `Kuis Budaya ${selectedPlace.label}.`;
            if (heroText) heroText.textContent = `Latihan budaya ${selectedPlace.label} dengan soal, pembahasan, skor, dan kemajuan.`;
            const journey = document.querySelector(".culture-journey-flow");
            if (journey) {
                journey.innerHTML = `
                    <span><b>1</b> ${selectedPlace.label}</span>
                    <span><b>2</b> Mode</span>
                    <span><b>3</b> Ruang Kuis</span>
                `;
            }
            const controlHeader = document.querySelector(".culture-quiz-control .section-header");
            if (controlHeader) {
                const kicker = controlHeader.querySelector(".section-kicker");
                const heading = controlHeader.querySelector("h2");
                const text = controlHeader.querySelector("p");
                if (kicker) kicker.textContent = "Pengaturan Kuis";
                if (heading) heading.textContent = `Atur kuis ${selectedPlace.label}.`;
                if (text) text.textContent = "Region sudah dikunci. Pilih mode dan jumlah soal saja.";
            }
            const modeHeader = document.querySelector(".culture-mode-section .section-header");
            if (modeHeader) {
                const heading = modeHeader.querySelector("h2");
                const text = modeHeader.querySelector("p");
                if (heading) heading.textContent = `Shortcut ${selectedPlace.label}.`;
                if (text) text.textContent = "Semua pintasan masuk ke ruang kuis khusus daerah ini.";
            }
            const historyHeader = document.querySelector(".culture-history-section .section-header");
            if (historyHeader) {
                const heading = historyHeader.querySelector("h2");
                const text = historyHeader.querySelector("p");
                if (heading) heading.textContent = `Riwayat ${selectedPlace.label}.`;
                if (text) text.textContent = "Hanya sesi kuis dari daerah ini yang ditampilkan di sini.";
            }
        }
        const summary = document.getElementById("quizSummaryCard");
        if (summary) {
            summary.style.setProperty("--summary-progress", `${best || displayAccuracy}%`);
            const label = summary.querySelector(":scope > span");
            if (label) label.textContent = selectedPlace ? `Progress ${selectedPlace.label}` : "Progress budaya";
            const strong = summary.querySelector("strong");
            if (strong) strong.textContent = `${best || displayAccuracy}%`;
            const pEl = summary.querySelector("p");
            if (pEl) pEl.textContent = selectedPlace
                ? scopedHistory.length
                    ? `Skor terbaik ${selectedPlace.label} ${best}%. Total latihan daerah ini: ${placeCorrect}/${placeAttempts} benar.`
                    : `Belum ada sesi ${selectedPlace.label}. Mulai satu kuis untuk menyimpan skor daerah ini.`
                : history.length
                    ? `Skor terbaik ${best}%. Total latihan Wonderful Indonesia: ${progress.correct || 0}/${reviewed} benar.`
                    : `Total latihan Wonderful Indonesia: ${progress.correct || 0}/${reviewed} benar.`;
            setText("cultureAccuracyMetric", `${displayAccuracy}%`);
            setText("culturePracticeMetric", selectedPlace ? `${placeCorrect}/${placeAttempts}` : `${progress.correct || 0}/${reviewed}`);
            setText("cultureNextSession", selectedPlace ? `Kuis ${selectedPlace.label}` : history.length ? "Tinjau sesi terakhir" : "Campuran Budaya");
        }

        const insightStrip = document.getElementById("quizInsightStrip");
        if (insightStrip) {
            const placeBank = selectedPlace ? getSessionBank("mix", selectedPlace.region, selectedPlace.id) : [];
            const minutes = selectedPlace ? Math.max(2, Math.ceil(placeBank.length * 0.85)) : 0;
            insightStrip.innerHTML = selectedPlace
                ? `
                    <span><strong>${selectedPlace.cards.length + selectedPlace.phrases.length}</strong> materi</span>
                    <span><strong>${placeBank.length}</strong> soal</span>
                    <span><strong>${minutes}</strong> menit</span>
                `
                : `
                    <span><strong>${data.places.length}</strong> daerah</span>
                    <span><strong>${buildQuestionBank("mix", "Semua").length}</strong> bank soal</span>
                    <span><strong>${history.length}</strong> riwayat</span>
                `;
        }

        const regionSelect = document.getElementById("quizRegionSelect");
        const modeSelect = document.getElementById("quizModeSelect");
        const amountSelect = document.getElementById("quizAmountSelect");
        const customStart = document.getElementById("customStartLink");
        const smartStart = document.getElementById("smartStartLink");
        const scoreCardStart = document.getElementById("scoreCardStartLink");
        const sessionPreview = document.getElementById("sessionPreview");
        const regionGrid = document.getElementById("regionQuizGrid");
        const timerToggle = document.getElementById("quizTimerToggle");
        const timerOption = document.getElementById("quizTimerOption");
        const continueLink = document.getElementById("continueSessionLink");
        const headerStart = document.querySelector('.nav-actions .btn-primary[href^="quiz-budaya-lms"]');

        if (continueLink) {
            let activeUrl = "";
            try { activeUrl = sessionStorage.getItem(ACTIVE_SESSION_KEY) || ""; } catch { /* no-op */ }
            if (activeUrl) {
                continueLink.hidden = false;
                continueLink.href = activeUrl;
                continueLink.textContent = "Lanjutkan sesi tersimpan";
            } else if (scopedHistory.length) {
                const last = scopedHistory[0];
                continueLink.hidden = false;
                continueLink.href = buildStartUrl(last.mode, last.region, last.total, last.placeId, { timer: Boolean(last.timer) });
                continueLink.textContent = `Ulangi ${last.title}`;
            }
        }

        if (regionSelect) {
            const availableRegions = selectedPlace ? [selectedPlace.region] : data.regions;
            regionSelect.replaceChildren(...availableRegions.map(region => {
                const option = document.createElement("option");
                option.value = region;
                option.textContent = region;
                return option;
            }));
            regionSelect.value = selectedPlace?.region || normalizeRegion(core.storage.get("wonder_region", "Semua"));
            regionSelect.disabled = Boolean(selectedPlace);
        }

        if (modeSelect && selectedPlace) {
            const allowedModes = ["mix", "language", "heritage", "challenge"];
            modeSelect.replaceChildren(...allowedModes.map(key => {
                const option = document.createElement("option");
                option.value = key;
                option.textContent = modeMeta[key].label;
                return option;
            }));
        }

        function currentPlaceForSession() {
            const region = regionSelect?.value || "Semua";
            return selectedPlaceId && data.getPlaceById(selectedPlaceId).region === region ? selectedPlaceId : "";
        }

        function renderSessionPreview() {
            if (!sessionPreview) return;
            const region = regionSelect?.value || "Semua";
            const mode = modeSelect?.value || "mix";
            const placeId = currentPlaceForSession();
            const bank = getSessionBank(mode, region, placeId);
            const places = placeId ? 1 : region === "Semua" ? data.places.length : data.getPlacesByRegion(region).length;
            const amount = Math.min(normalizeAmount(amountSelect?.value, modeMeta[mode].amount), bank.length);
            const minutes = Math.max(2, Math.ceil(amount * (mode === "challenge" ? 0.55 : 0.85)));
            const focus = placeId ? data.getPlaceById(placeId).label : region;
            sessionPreview.innerHTML = `
                <span><strong>${focus}</strong> fokus</span>
                <span><strong>${places}</strong> daerah</span>
                <span><strong>${bank.length}</strong> kandidat soal</span>
                <span><strong>${amount}</strong> soal sesi</span>
                <span><strong>${minutes}</strong> menit</span>
            `;
        }

        function renderModeCards() {
            const modeGrid = document.getElementById("quizModeCards");
            if (!modeGrid) return;
            const region = regionSelect?.value || "Semua";
            const placeId = currentPlaceForSession();
            const modeEntries = Object.entries(modeMeta).filter(([key]) => !selectedPlace || key !== "region");
            modeGrid.replaceChildren(...modeEntries.map(([key, meta]) => {
                const bank = getSessionBank(key, region, placeId);
                const card = document.createElement("article");
                card.className = `culture-mode-card ${key === "mix" ? "is-recommended" : ""}`;
                card.dataset.search = `${meta.label} ${meta.title} ${meta.desc}`.toLowerCase();
                const icon = document.createElement("i");
                icon.className = meta.icon;
                const title = document.createElement("h3");
                title.textContent = meta.title;
                const desc = document.createElement("p");
                desc.textContent = meta.desc;
                const footer = document.createElement("footer");
                const small = document.createElement("small");
                const total = Math.min(meta.amount, bank.length);
                small.textContent = `${total} soal`;
                footer.append(small, createLink("btn btn-ghost", buildStartUrl(key, region, total || meta.amount, placeId), selectedPlace ? "Pilih mode" : "Pilih"));
                card.append(icon, title, desc, footer);
                return card;
            }));
        }

        function renderRegionCards() {
            if (!regionGrid) return;
            const activeRegion = regionSelect?.value || "Semua";
            regionGrid.replaceChildren(...data.regions.filter(region => region !== "Semua").map(region => {
                const places = data.getPlacesByRegion(region);
                const card = document.createElement("article");
                card.className = `culture-region-card ${region === activeRegion ? "is-active-region" : ""}`;
                card.dataset.search = `${region} ${places.map(place => place.label).join(" ")}`.toLowerCase();
                const icon = document.createElement("i");
                icon.className = "fa-solid fa-map";
                const title = document.createElement("h3");
                title.textContent = region;
                const desc = document.createElement("p");
                desc.textContent = `${places.length} daerah tersedia: ${places.slice(0, 3).map(place => place.label).join(", ")}${places.length > 3 ? ", ..." : ""}`;
                const footer = document.createElement("footer");
                const small = document.createElement("small");
                const total = Math.min(12, Math.max(5, places.length * 2));
                small.textContent = `${total} soal`;
                footer.append(small, createLink("btn btn-ghost", buildStartUrl("region", region, total), "Mulai"));
                card.append(icon, title, desc, footer);
                return card;
            }));
        }

        function syncStartLinks() {
            const region = regionSelect?.value || "Semua";
            const mode = modeSelect?.value || "mix";
            const placeId = currentPlaceForSession();
            const selectedAmount = normalizeAmount(amountSelect?.value, modeMeta[mode].amount);
            const currentBank = getSessionBank(mode, region, placeId);
            const amount = Math.min(selectedAmount, currentBank.length || selectedAmount);
            const smartBank = getSessionBank("mix", region, placeId);
            const smartAmount = Math.min(10, smartBank.length || 10);
            const timerEnabled = mode === "challenge" && Boolean(timerToggle?.checked);
            if (timerToggle) timerToggle.disabled = mode !== "challenge";
            timerOption?.classList.toggle("is-disabled", mode !== "challenge");
            if (customStart) customStart.href = buildStartUrl(mode, region, amount, placeId, { timer: timerEnabled });
            if (smartStart) smartStart.href = buildStartUrl("mix", region, smartAmount, placeId);
            if (headerStart) headerStart.href = buildStartUrl(mode, region, amount, placeId);
            if (scoreCardStart) scoreCardStart.href = scopedHistory.length
                ? buildStartUrl(scopedHistory[0].mode, scopedHistory[0].region, scopedHistory[0].total, scopedHistory[0].placeId)
                : buildStartUrl("mix", region, smartAmount, placeId);
            renderSessionPreview();
            renderModeCards();
            renderRegionCards();
            window.queueMicrotask(applyCatalogFilters);
        }

        regionSelect?.addEventListener("change", () => {
            if (selectedPlaceId && data.getPlaceById(selectedPlaceId).region !== regionSelect.value) selectedPlaceId = "";
            syncStartLinks();
        });
        [modeSelect, amountSelect, timerToggle].forEach(el => el && el.addEventListener("change", syncStartLinks));
        syncStartLinks();

        const historyList = document.getElementById("quizHistoryList");
        if (historyList) {
            if (!scopedHistory.length) {
                const empty = document.createElement("div");
                empty.className = "culture-empty-state";
                empty.textContent = selectedPlace
                    ? `Belum ada riwayat ${selectedPlace.label}. Mulai satu sesi kuis untuk menyimpan skor daerah ini.`
                    : "Belum ada riwayat. Mulai satu sesi kuis untuk menyimpan skor pertamamu.";
                historyList.replaceChildren(empty);
            } else {
                historyList.replaceChildren(...scopedHistory.slice(0, 5).map(item => {
                    const row = document.createElement("article");
                    row.className = "culture-history-item";
                    row.dataset.score = String(item.score || 0);
                    row.dataset.search = `${item.title} ${item.region} ${item.mode} ${item.placeId || ""}`.toLowerCase();
                    const text = document.createElement("div");
                    const strong = document.createElement("strong");
                    strong.textContent = `${item.title} - ${item.score}%`;
                    const p = document.createElement("p");
                    p.textContent = `${item.correct}/${item.total} benar pada ${new Date(item.date).toLocaleDateString("id-ID")}.`;
                    text.append(strong, p);
                    row.append(text, createLink("btn btn-ghost", buildStartUrl(item.mode, item.region, item.total, item.placeId, { timer: Boolean(item.timer) }), "Ulangi"));
                    return row;
                }));
            }
        }

        const catalogSearch = document.getElementById("quizCatalogSearch");
        const historyFilter = document.getElementById("quizHistoryFilter");
        const filterStatus = document.getElementById("quizFilterStatus");
        function applyCatalogFilters() {
            const term = String(catalogSearch?.value || "").trim().toLowerCase();
            const scoreFilter = historyFilter?.value || "all";
            let visible = 0;
            document.querySelectorAll(".culture-mode-card, .culture-region-card, .culture-history-item").forEach(card => {
                const matchesText = !term || String(card.dataset.search || card.textContent).toLowerCase().includes(term);
                const score = Number(card.dataset.score);
                const matchesScore = !card.classList.contains("culture-history-item") || scoreFilter === "all" || (scoreFilter === "strong" ? score >= 80 : score < 80);
                const show = matchesText && matchesScore;
                card.classList.toggle("is-filtered", !show);
                if (show) visible += 1;
            });
            if (filterStatus) filterStatus.textContent = term || scoreFilter !== "all" ? `${visible} item cocok dengan filter.` : "";
        }
        catalogSearch?.addEventListener("input", applyCatalogFilters);
        historyFilter?.addEventListener("change", applyCatalogFilters);
    }

    function initLms() {
        core.initTheme();
        core.renderNav("bahasa-daerah.html");

        const query = params();
        const requestedPlaceId = normalizePlace(query.get("place") || query.get("id") || "");
        const placeId = requestedPlaceId || normalizePlace(core.storage.get("wonder_place", "jawa")) || "jawa";
        const isPlaceScoped = Boolean(requestedPlaceId);
        const targetPlace = data.getPlaceById(placeId);
        const mode = normalizeMode(query.get("mode"));
        const region = isPlaceScoped ? targetPlace.region : normalizeRegion(query.get("region") || targetPlace.region);
        const meta = modeMeta[mode];
        const amount = normalizeAmount(query.get("amount"), meta.amount);
        const bank = getSessionBank(mode, region, isPlaceScoped ? placeId : "");
        const timerEnabled = mode === "challenge" && query.get("timer") === "1";
        const sessionKey = `${SESSION_KEY_PREFIX}${mode}:${region}:${isPlaceScoped ? placeId : "all"}:${amount}:${timerEnabled ? "timer" : "free"}`;
        let questions = bank.slice(0, Math.min(amount, bank.length));
        let answers = new Array(questions.length).fill(null);
        let current = 0;
        let saved = false;
        let reviewRound = false;
        let restoredElapsedSeconds = 0;

        try {
            const stored = JSON.parse(sessionStorage.getItem(sessionKey) || "null");
            if (stored && Array.isArray(stored.questionIds) && Array.isArray(stored.answers)) {
                const byId = new Map(bank.map(item => [item.id, item]));
                const snapshots = Array.isArray(stored.questions) ? new Map(stored.questions.map(item => [item.id, item])) : new Map();
                const restoredQuestions = stored.questionIds.map(id => {
                    const canonical = byId.get(id);
                    const snapshot = snapshots.get(id);
                    if (!canonical) return null;
                    const restoredOptions = Array.isArray(snapshot?.answers) && snapshot.answers.includes(canonical.correct)
                        ? snapshot.answers.filter(answer => typeof answer === "string").slice(0, 4)
                        : canonical.answers;
                    return { ...canonical, answers: restoredOptions };
                }).filter(Boolean);
                if (restoredQuestions.length === stored.questionIds.length && restoredQuestions.length) {
                    questions = restoredQuestions;
                    answers = restoredQuestions.map((item, index) => {
                        const answer = stored.answers[index];
                        return answer && item.answers.includes(answer.answer) ? answer : null;
                    });
                    current = Math.min(Math.max(Number(stored.current) || 0, 0), questions.length - 1);
                    reviewRound = Boolean(stored.reviewRound);
                    restoredElapsedSeconds = Math.max(0, Number(stored.elapsedSeconds) || 0);
                    core.showToast("Sesi sebelumnya dipulihkan.");
                }
            }
        } catch {
            sessionStorage.removeItem(sessionKey);
        }

        function persistSession() {
            try {
                sessionStorage.setItem(sessionKey, JSON.stringify({
                    questionIds: questions.map(item => item.id),
                    questions: questions.map(item => ({ id: item.id, answers: item.answers })),
                    answers,
                    current,
                    reviewRound,
                    elapsedSeconds: timerEnabled ? Math.floor((Date.now() - timerStartedAt) / 1000) : 0,
                    updatedAt: new Date().toISOString()
                }));
                sessionStorage.setItem(ACTIVE_SESSION_KEY, window.location.href);
            } catch {
                // Session persistence is an enhancement; the quiz remains usable without it.
            }
        }

        setText("sessionModeLabel", meta.label);
        setText("sessionTitle", `Kuis ${getQuizTitle(mode, isPlaceScoped ? targetPlace.label : "")}`);
        setText("sessionDescription", isPlaceScoped
            ? `Fokus ${meta.label.toLowerCase()} untuk ${targetPlace.label}. Semua soal di sesi ini berasal dari daerah pilihan.`
            : `${meta.desc} Selesaikan sesi untuk menyimpan skor dan kemajuan Wonderful Indonesia.`);
        setText("languageCourseBadge", isPlaceScoped ? `${targetPlace.region} - ${targetPlace.label}` : `Kuis ${region}`);
        setText("languageCourseTitle", isPlaceScoped ? `Kuasai kuis ${targetPlace.label}.` : getQuizTitle(mode));
        setText("languageCourseIntro", isPlaceScoped
            ? `${targetPlace.summary} Pilih jawaban, baca pembahasan, lalu ulangi mode yang sama untuk memperkuat pemahaman.`
            : `${meta.desc} Gunakan panel ini untuk berpindah fokus bahasa jika ingin latihan daerah tertentu.`);

        const nav = document.getElementById("questionNavigator");
        const answerGrid = document.getElementById("answerGrid");
        const explanation = document.getElementById("answerExplanation");
        const resultPanel = document.getElementById("resultPanel");
        const learnPlaceLink = document.getElementById("learnPlaceLink");
        const sessionFacts = document.getElementById("sessionFacts");
        const answerStatus = document.getElementById("answerStatus");
        const languageSelect = document.getElementById("languageCourseSelect");
        const moduleCards = document.getElementById("languageModuleCards");
        const vocabGrid = document.getElementById("languageVocabGrid");
        const phraseList = document.getElementById("phrasePracticeList");
        const readiness = document.getElementById("languageReadiness");
        const readinessText = document.getElementById("languageReadinessText");
        const timerCard = document.getElementById("challengeTimerCard");
        const timerText = document.getElementById("challengeTimer");
        const timerStatus = document.getElementById("challengeTimerStatus");
        const timerTargetSeconds = Math.max(60, questions.length * 35);
        const timerStartedAt = Date.now() - (restoredElapsedSeconds * 1000);
        let timerHandle = 0;

        function renderTimer() {
            if (!timerEnabled || !timerText) return;
            const elapsed = Math.floor((Date.now() - timerStartedAt) / 1000);
            const minutes = String(Math.floor(elapsed / 60)).padStart(2, "0");
            const seconds = String(elapsed % 60).padStart(2, "0");
            timerText.textContent = `${minutes}:${seconds}`;
            const overTarget = elapsed > timerTargetSeconds;
            timerCard?.classList.toggle("is-over-target", overTarget);
            if (timerStatus) timerStatus.textContent = overTarget
                ? "Target terlewati, tetapi kuis tetap dapat diselesaikan tanpa pengurangan nilai."
                : `Target ${Math.ceil(timerTargetSeconds / 60)} menit. Waktu tidak mengurangi nilai.`;
        }

        if (timerCard) timerCard.hidden = !timerEnabled;
        if (timerEnabled) {
            renderTimer();
            timerHandle = window.setInterval(renderTimer, 1000);
        }

        if (sessionFacts) {
            const minutes = Math.max(3, Math.ceil((targetPlace.cards.length + targetPlace.phrases.length + questions.length) * 0.55));
            sessionFacts.innerHTML = `
                <span><strong>${isPlaceScoped ? targetPlace.label : region}</strong> fokus</span>
                <span><strong>${targetPlace.cards.length}</strong> kosakata</span>
                <span><strong>${targetPlace.phrases.length}</strong> frasa</span>
                <span><strong>${questions.length}</strong> kuis</span>
                <span><strong>${minutes}</strong> menit</span>
            `;
        }

        if (languageSelect) {
            languageSelect.replaceChildren(...data.places.map(place => {
                const option = document.createElement("option");
                option.value = place.id;
                option.textContent = `${place.label} - ${place.region}`;
                return option;
            }));
            languageSelect.value = targetPlace.id;
            languageSelect.addEventListener("change", () => {
                window.location.href = buildStartUrl("language", data.getPlaceById(languageSelect.value).region, amount, languageSelect.value);
            });
        }

        if (moduleCards) {
            const modules = [
                ["fa-solid fa-comments", "Sapaan inti", `${targetPlace.cards.length} kartu kosakata`],
                ["fa-solid fa-message", "Frasa praktis", `${targetPlace.phrases.length} frasa harian`],
                ["fa-solid fa-book-open", "Konteks budaya", targetPlace.tradition[0]],
                ["fa-solid fa-circle-question", "Kuis validasi", `${questions.length} soal ${meta.label.toLowerCase()}`]
            ];
            moduleCards.replaceChildren(...modules.map((item, index) => {
                const card = document.createElement("article");
                card.className = "language-module-card";
                card.innerHTML = `<i class="${item[0]}"></i><div><strong>${item[1]}</strong><small>${item[2]}</small></div><span>0${index + 1}</span>`;
                return card;
            }));
        }

        if (vocabGrid) {
            vocabGrid.replaceChildren(...targetPlace.cards.map(card => {
                const item = document.createElement("article");
                item.className = "language-vocab-card";
                item.innerHTML = `<strong>${card[0]}</strong><span>${card[1]}</span><small>${card[2]}</small>`;
                return item;
            }));
        }

        if (phraseList) {
            phraseList.replaceChildren(...targetPlace.phrases.map(phrase => {
                const item = document.createElement("article");
                item.className = "language-phrase-card";
                item.innerHTML = `<strong>${phrase[0]}</strong><span>${phrase[1]}</span>`;
                return item;
            }));
        }

        function score() {
            const answered = answers.filter(Boolean);
            const correct = answered.filter(item => item.correct).length;
            const percentage = Math.round((correct / Math.max(questions.length, 1)) * 100);
            return { answered: answered.length, correct, percentage };
        }

        function renderNav() {
            if (!nav) return;
            nav.replaceChildren(...questions.map((item, index) => {
                const state = answers[index];
                const button = document.createElement("button");
                button.type = "button";
                button.className = `lms-module-btn ${index === current ? "is-active" : ""} ${state ? state.correct ? "is-correct" : "is-wrong" : ""}`;
                button.setAttribute("aria-label", `Soal ${index + 1}: ${item.placeLabel}, ${item.type}${state ? state.correct ? ", benar" : ", perlu ditinjau" : ", belum dijawab"}`);
                if (index === current) button.setAttribute("aria-current", "step");
                button.innerHTML = `<span>${index + 1}</span><div><strong>${item.placeLabel}</strong><small>${item.type}</small></div><i class="fa-solid fa-chevron-right"></i>`;
                button.addEventListener("click", () => {
                    if (typeof smoothTransition === "function") {
                        smoothTransition(() => {
                            current = index;
                            renderQuestion();
                            persistSession();
                        });
                    } else {
                        current = index;
                        renderQuestion();
                        persistSession();
                    }
                });
                return button;
            }));
        }

        function renderScore() {
            const currentScore = score();
            setText("sessionScore", `${currentScore.percentage}%`);
            setText("sessionScoreLabel", currentScore.answered === questions.length ? "Skor akhir" : "Skor sementara");
            setText("sessionProgressText", `${currentScore.answered}/${questions.length} soal selesai`);
            const progressPercent = Math.round((currentScore.answered / Math.max(questions.length, 1)) * 100);
            const bar = document.getElementById("sessionProgressBar");
            if (bar) bar.style.width = `${progressPercent}%`;
            const sidebarBar = document.querySelector(".culture-progress-card .lms-progress-track i");
            if (sidebarBar) sidebarBar.style.width = `${progressPercent}%`;
            const progressEl = document.getElementById("sessionProgress");
            if (progressEl) {
                progressEl.setAttribute("aria-valuenow", String(progressPercent));
                progressEl.setAttribute("aria-valuetext", `${currentScore.answered} dari ${questions.length} soal selesai`);
            }
            const readinessScore = Math.round(((targetPlace.cards.length + targetPlace.phrases.length + currentScore.answered) / Math.max(targetPlace.cards.length + targetPlace.phrases.length + questions.length, 1)) * 100);
            const meter = document.querySelector(".language-course-meter");
            if (meter) meter.style.setProperty("--language-readiness", `${readinessScore}%`);
            if (readiness) readiness.textContent = `${readinessScore}%`;
            if (readinessText) readinessText.textContent = currentScore.answered ? `${currentScore.answered} soal sudah dijawab.` : "Mulai dari membaca kosakata inti.";
        }

        function finishIfDone() {
            const currentScore = score();
            if (currentScore.answered !== questions.length) return;
            if (!saved) {
                const progress = core.getProgress();
                progress.reviewed = (progress.reviewed || 0) + questions.length;
                progress.correct = (progress.correct || 0) + currentScore.correct;
                progress.quizDone = (progress.quizDone || 0) + 1;
                progress.explored = Array.from(new Set([...(progress.explored || []), ...questions.map(item => item.placeId)]));
                core.saveProgress(progress);
                saveHistory({
                    mode,
                    region,
                    placeId: isPlaceScoped ? placeId : questions[0]?.placeId || placeId,
                    title: `${reviewRound ? "Review: " : ""}${isPlaceScoped ? `${meta.label} ${targetPlace.label}` : getQuizTitle(mode)}`,
                    score: currentScore.percentage,
                    correct: currentScore.correct,
                    total: questions.length,
                    timer: timerEnabled,
                    date: new Date().toISOString()
                });
                saved = true;
            }
            if (timerHandle) {
                window.clearInterval(timerHandle);
                timerHandle = 0;
            }
            try {
                sessionStorage.removeItem(sessionKey);
                sessionStorage.removeItem(ACTIVE_SESSION_KEY);
            } catch { /* no-op */ }
            if (resultPanel) {
                resultPanel.hidden = false;
                setText("resultScore", `${currentScore.percentage}%`);
                setText("resultTitle", currentScore.percentage >= 80 ? "Mantap, sesi tuntas." : "Sesi selesai, lanjut review.");
                setText("resultText", `Skor kamu ${currentScore.percentage}% dengan ${currentScore.correct}/${questions.length} jawaban benar. ${currentScore.percentage >= 80 ? "Kamu sudah kuat di sesi ini." : "Cek soal yang salah lalu ulangi mode yang sama."}`);
                setText("resultMeta", `${isPlaceScoped ? targetPlace.label : region} - ${meta.label} / ${currentScore.correct} benar dari ${questions.length} soal`);
                const breakdown = document.getElementById("resultBreakdown");
                const categoryScores = new Map();
                questions.forEach((item, index) => {
                    const entry = categoryScores.get(item.type) || { total: 0, correct: 0 };
                    entry.total += 1;
                    if (answers[index]?.correct) entry.correct += 1;
                    categoryScores.set(item.type, entry);
                });
                if (breakdown) {
                    breakdown.replaceChildren(...Array.from(categoryScores.entries()).map(([type, entry]) => {
                        const item = document.createElement("div");
                        const label = document.createElement("span");
                        const value = document.createElement("strong");
                        const detail = document.createElement("small");
                        label.textContent = type;
                        value.textContent = `${Math.round((entry.correct / Math.max(entry.total, 1)) * 100)}%`;
                        detail.textContent = `${entry.correct}/${entry.total} benar`;
                        item.append(label, value, detail);
                        return item;
                    }));
                }
                const weakest = Array.from(categoryScores.entries()).sort((a, b) => (a[1].correct / a[1].total) - (b[1].correct / b[1].total))[0];
                const recommendation = document.getElementById("resultRecommendation");
                if (recommendation && weakest) {
                    const recommendedMode = ["Bahasa", "Kosakata", "Frasa"].includes(weakest[0]) ? "language" : "heritage";
                    const title = document.createElement("strong");
                    const copy = document.createElement("span");
                    const link = createLink("", buildStartUrl(recommendedMode, region, Math.min(8, bank.length || 8), isPlaceScoped ? placeId : ""), "Mulai latihan rekomendasi");
                    title.textContent = `Fokus berikutnya: ${weakest[0]}`;
                    copy.textContent = `Kategori ini memiliki akurasi terendah. Latihan singkat berikut akan memperkuat bagian tersebut.`;
                    recommendation.replaceChildren(title, copy, link);
                }
                const reviewWrong = document.getElementById("reviewWrongBtn");
                if (reviewWrong) reviewWrong.disabled = !answers.some(item => item && !item.correct);
                window.setTimeout(() => resultPanel.focus({ preventScroll: true }), 0);
            }
        }

        function chooseAnswer(value) {
            const item = questions[current];
            const isCorrect = value === item.correct;
            answers[current] = {
                answer: value,
                correct: isCorrect
            };
            if (typeof window !== "undefined" && window.ActivityService && typeof window.ActivityService.recordQuiz === "function") {
                window.ActivityService.recordQuiz(
                    item.id || `${item.placeId}-${item.type}-${current}`,
                    isCorrect ? 100 : 0,
                    {
                        category: "culture",
                        topic: item.region || item.placeLabel,
                        difficulty: 2, // medium by default
                        errorType: isCorrect ? "none" : "concept",
                        accuracy: isCorrect ? 100 : 0,
                        answers: [value],
                        skill: "culture_tradition"
                    }
                );
            }
            if (window.QuizNationPro) {
                window.QuizNationPro.recordAttempt({
                    questionId: item.id || `${item.placeId}-${item.type}-${current}`,
                    question: item.prompt, topic: item.region || item.placeLabel, difficulty: "medium",
                    source: "quiz-budaya", selected: value, correctAnswer: item.correct, isCorrect,
                    explanation: item.explanation, answers: item.answers
                });
            }
            core.showToast(value === item.correct ? "Jawaban benar." : `Jawaban tepat: ${item.correct}`);
            renderQuestion();
            persistSession();
            finishIfDone();
        }

        function renderQuestion() {
            const item = questions[current];
            if (!item) return;
            const state = answers[current];
            const activePlace = data.getPlaceById(item.placeId);
            setText("questionRegion", item.region);
            setText("questionCounter", `Soal ${current + 1}/${questions.length}`);
            setText("questionType", item.type);
            setText("questionText", item.prompt);
            setText("cultureContextTitle", `${item.type} ${item.placeLabel}`);
            setText("cultureContextText", item.context || getQuestionContext(activePlace, item.type));
            setText("cultureContextMeta", `${item.region} / ${item.type} / ${current + 1} dari ${questions.length}`);
            if (learnPlaceLink) learnPlaceLink.href = core.placeUrl("daerah-detail.html", item.placeId);

            if (answerGrid) {
                answerGrid.replaceChildren(...item.answers.map((answer, index) => {
                    const button = document.createElement("button");
                    button.type = "button";
                    button.className = "lms-answer-btn";
                    button.setAttribute("aria-label", `Pilihan ${String.fromCharCode(65 + index)}: ${answer}`);
                    if (state) {
                        if (answer === item.correct) button.classList.add("is-correct");
                        if (answer === state.answer && answer !== item.correct) button.classList.add("is-wrong");
                        if (answer === state.answer) button.classList.add("is-selected");
                        if (answer === state.answer) button.setAttribute("aria-pressed", "true");
                        button.disabled = true;
                    }
                    const marker = document.createElement("b");
                    marker.textContent = String.fromCharCode(65 + index);
                    const label = document.createElement("span");
                    label.textContent = answer;
                    button.append(marker, label);
                    button.addEventListener("click", () => chooseAnswer(answer));
                    return button;
                }));
            }

            if (explanation) {
                explanation.hidden = !state;
                explanation.textContent = state ? item.explanation : "";
            }

            const prev = document.getElementById("prevQuestionBtn");
            const next = document.getElementById("nextQuestionBtn");
            if (prev) prev.disabled = current === 0;
            if (next) {
                const nextLabel = current === questions.length - 1 ? "Lihat Hasil" : "Berikutnya";
                const nextText = next.querySelector("span");
                if (nextText) nextText.textContent = nextLabel;
                else next.textContent = nextLabel;
            }
            if (answerStatus) {
                if (!state) {
                    answerStatus.textContent = "Pilih jawaban untuk membuka pembahasan.";
                } else if (state.correct) {
                    answerStatus.textContent = "Benar. Pembahasan sudah terbuka.";
                } else {
                    answerStatus.textContent = `Kurang tepat. Jawaban benar: ${item.correct}.`;
                }
            }
            renderNav();
            renderScore();
        }

        /* Smooth transition wrapper for question navigation */
        const questionCard = document.getElementById("questionCard");
        let isTransitioning = false;
        function smoothTransition(callback) {
            if (!questionCard || isTransitioning) { callback(); return; }
            const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            if (prefersReduced) { callback(); return; }
            isTransitioning = true;
            questionCard.style.transition = "opacity 0.18s ease, transform 0.18s ease";
            questionCard.style.opacity = "0";
            questionCard.style.transform = "translateY(-8px)";
            setTimeout(() => {
                callback();
                questionCard.style.opacity = "0";
                questionCard.style.transform = "translateY(8px)";
                requestAnimationFrame(() => {
                    questionCard.style.transition = "opacity 0.32s cubic-bezier(0.22, 1, 0.36, 1), transform 0.32s cubic-bezier(0.22, 1, 0.36, 1)";
                    questionCard.style.opacity = "1";
                    questionCard.style.transform = "translateY(0)";
                    setTimeout(() => { isTransitioning = false; }, 320);
                });
            }, 180);
        }

        document.getElementById("prevQuestionBtn")?.addEventListener("click", () => {
            smoothTransition(() => {
                current = Math.max(0, current - 1);
                renderQuestion();
                persistSession();
            });
        });

        document.getElementById("nextQuestionBtn")?.addEventListener("click", () => {
            if (current < questions.length - 1) {
                smoothTransition(() => {
                    current += 1;
                    renderQuestion();
                    persistSession();
                });
                return;
            }
            const firstUnanswered = answers.findIndex(item => !item);
            if (firstUnanswered >= 0) {
                smoothTransition(() => {
                    current = firstUnanswered;
                    renderQuestion();
                    persistSession();
                });
                core.showToast("Masih ada soal yang belum dijawab.");
                document.getElementById("questionCard")?.scrollIntoView({ behavior: "smooth", block: "start" });
                return;
            }
            finishIfDone();
            resultPanel?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        });

        document.getElementById("restartSessionBtn")?.addEventListener("click", () => {
            try { sessionStorage.removeItem(sessionKey); } catch { /* no-op */ }
            window.location.href = buildStartUrl(mode, region, amount, isPlaceScoped ? placeId : "", { timer: timerEnabled });
        });

        document.getElementById("restartResultBtn")?.addEventListener("click", () => {
            document.getElementById("restartSessionBtn")?.click();
        });

        document.getElementById("reviewWrongBtn")?.addEventListener("click", () => {
            const wrongQuestions = questions.filter((item, index) => answers[index] && !answers[index].correct);
            if (!wrongQuestions.length) return;
            questions = wrongQuestions;
            answers = new Array(questions.length).fill(null);
            current = 0;
            saved = false;
            reviewRound = true;
            if (resultPanel) resultPanel.hidden = true;
            if (timerEnabled && !timerHandle) timerHandle = window.setInterval(renderTimer, 1000);
            smoothTransition(() => {
                renderQuestion();
                persistSession();
                document.getElementById("questionCard")?.scrollIntoView({ behavior: "smooth", block: "start" });
            });
        });

        document.getElementById("reportContentBtn")?.addEventListener("click", async () => {
            const item = questions[current];
            const reference = `Koreksi materi Kuis Budaya\nID: ${item?.id || "tidak tersedia"}\nDaerah: ${item?.placeLabel || "-"}\nKategori: ${item?.type || "-"}\nPertanyaan: ${item?.prompt || "-"}`;
            try {
                await navigator.clipboard.writeText(reference);
                core.showToast("Referensi koreksi disalin. Tambahkan catatanmu saat mengirimkannya ke pengelola.");
            } catch {
                core.showToast(`Referensi koreksi: ${item?.id || "tidak tersedia"}`);
            }
        });

        document.addEventListener("keydown", event => {
            if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
            if (/^[1-4]$/.test(event.key) && !answers[current]) {
                const answer = questions[current]?.answers[Number(event.key) - 1];
                if (answer) chooseAnswer(answer);
            }
        });

        if (!questions.length) {
            setText("questionText", "Belum ada soal untuk konfigurasi ini.");
            return;
        }
        renderQuestion();
        persistSession();
    }

    document.addEventListener("DOMContentLoaded", () => {
        const page = document.body.dataset.page;
        if (page === "wonder-quiz-menu") initMenu();
        if (page === "wonder-quiz-lms") initLms();
    });
})();
