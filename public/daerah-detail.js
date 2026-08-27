/* Consolidated Daerah Detail controller — state, rendering, activities, and accessibility. */
(function () {
  "use strict";

  const data = window.WonderfulData;
  const core = window.WonderfulCore;
  if (!data || !core || document.body.dataset.page !== "wonder-detail") return;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
  const storageGet = (key, fallback = null) => { try { const value = localStorage.getItem(key); return value === null ? fallback : value; } catch (_) { return fallback; } };
  const storageSet = (key, value) => { try { localStorage.setItem(key, value); return true; } catch (_) { return false; } };
  const readJSON = (key, fallback = {}) => { try { const value = storageGet(key); return value ? JSON.parse(value) : fallback; } catch (_) { return fallback; } };
  const CORE_ACTIVITIES = ["gallery", "story", "flashcard", "phrases", "script", "matching", "quiz"];
  const STAGE_ACTIVITIES = { explore: ["gallery", "story"], language: ["flashcard", "phrases", "script"], test: ["matching", "quiz"] };
  const ACTIVITY_LABELS = {
    gallery: ["Sorotan budaya", "Jelajahi destinasi, kuliner, dan tradisi."],
    story: ["Cerita rakyat", "Baca nilai yang diwariskan lewat cerita."],
    flashcard: ["Kartu kosakata", "Balik kartu dan nilai pemahamanmu."],
    phrases: ["Kamus mini", "Pelajari frasa yang berguna sehari-hari."],
    script: ["Latihan tulis", "Coba aksara lokal atau latihan bahasa lisan."],
    matching: ["Cocokkan kata", "Hubungkan frasa dengan arti yang tepat."],
    quiz: ["Kuis cepat", "Tuntaskan tiga pertanyaan penutup."]
  };
  const ACTIVITY_POINTS = { gallery: 15, story: 20, flashcard: 15, phrases: 15, script: 15, matching: 25, quiz: 25 };
  const params = new URLSearchParams(location.search);
  const requestedId = params.get("id");
  const rememberedId = String(storageGet("wonder_place", "") || "").replace(/^"|"$/g, "");
  const place = data.getPlaceById(requestedId) || data.getPlaceById(rememberedId) || data.places[0];
  if (!place) return;

  const regionSlug = place.region.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const stateKey = `wonder-detail:v3:${place.id}`;
  const legacyV2 = readJSON(`wonder-detail:v2:${place.id}`);
  const legacyEngagement = readJSON(`wonder-engagement-${place.id}`);
  const legacyStudio = readJSON(`wonder-detail:studio:${place.id}`);
  const storedV3 = readJSON(stateKey, null);
  const migratedActivities = storedV3?.activities || legacyV2.activities || legacyEngagement.actions || [];
  const state = {
    version: 3,
    activities: Array.from(new Set(migratedActivities)).filter(id => CORE_ACTIVITIES.includes(id)),
    score: Number(storedV3?.score ?? legacyV2.score ?? legacyEngagement.score ?? 0),
    cards: { ...(legacyEngagement.cards || {}), ...(legacyV2.cards || {}), ...(storedV3?.cards || {}) },
    activeStage: storedV3?.activeStage || legacyV2.activeStage || legacyStudio.lastStage || "explore",
    gallery: Math.max(0, Math.min(2, Number(storedV3?.gallery ?? legacyV2.gallery ?? 0))),
    textScale: Math.max(0, Math.min(2, Number(storedV3?.textScale ?? legacyStudio.textScale ?? 0))),
    reduceMotion: Boolean(storedV3?.reduceMotion ?? readJSON("wonder-v3-noMotion", false)),
    lastVisit: storedV3?.lastVisit || legacyV2.lastVisit || legacyStudio.lastVisit || ""
  };

  const illustrationByRegion = {
    sumatra: "assets/daerah/editorial-sumatra.jpg", jawa: "assets/daerah/editorial-jawa.jpg",
    kalimantan: "assets/daerah/editorial-kalimantan.jpg", sulawesi: "assets/daerah/editorial-sulawesi.jpg",
    "bali-nusa": "assets/daerah/editorial-bali-nusa.jpg", "papua-raya": "assets/daerah/editorial-papua.jpg",
    maluku: "assets/daerah/editorial-maluku.jpg"
  };
  const storyLibrary = {
    jawa: ["Timun Mas dan Keberanian", "Seorang anak bernama Timun Mas tumbuh dalam kasih sayang seorang ibu. Ketika ancaman datang menagih janji lama, ia menggunakan kecerdikan, keberanian, dan bekal yang diberikan ibunya untuk menyelamatkan diri.", "Keberanian tumbuh dari kasih sayang, persiapan, dan kemauan untuk tidak menyerah."],
    sunda: ["Sangkuriang dan Tangkuban Parahu", "Sangkuriang kembali ke tanah kelahirannya tanpa mengenali Dayang Sumbi. Sebuah janji mustahil, perahu besar, dan fajar yang datang terlalu cepat kemudian membentuk kisah tentang gunung seperti perahu terbalik.", "Kejujuran dan ketenangan hati membantu manusia menghindari keputusan yang merugikan."],
    bali: ["Legenda Danau Batur", "Kisah Kebo Iwa menghubungkan kekuatan besar dengan tanggung jawab kepada masyarakat. Jejak ceritanya kemudian dikaitkan dengan bentang Danau dan Gunung Batur.", "Kekuatan terbesar adalah kemampuan menjaga keseimbangan dan kepentingan bersama."],
    minang: ["Malin Kundang", "Seorang pemuda berlayar untuk mengubah nasib. Saat kembali, ia malu mengakui ibu yang menunggunya di pantai. Kisahnya terus diingat sebagai pengingat untuk menghormati keluarga dan asal-usul.", "Setinggi apa pun pencapaian seseorang, hormat kepada keluarga tidak boleh hilang."],
    aceh: ["Putri Pukes dan Danau Laut Tawar", "Seorang putri meninggalkan kampung halaman dan diminta tidak menoleh selama perjalanan. Kerinduan membuatnya melanggar pesan itu, melahirkan kisah tentang janji dan kuatnya ikatan dengan tempat asal.", "Janji perlu dijaga, sementara kerinduan layak dipahami dengan bijaksana."],
    betawi: ["Si Pitung dari Rawa Belong", "Si Pitung dikenal sebagai jagoan yang berani membela warga kecil dari ketidakadilan. Ceritanya hidup dalam banyak versi melalui lenong dan tradisi lisan Betawi.", "Keberanian menjadi berarti ketika digunakan untuk melindungi orang lain."],
    dayak: ["Asal-usul Burung Enggang", "Burung enggang dipandang sebagai lambang kemuliaan, kedekatan dengan alam, dan penghormatan kepada leluhur dalam berbagai tradisi Dayak.", "Manusia, leluhur, dan alam terhubung oleh tanggung jawab untuk saling menjaga."],
    bugis: ["Sawerigading dan La Galigo", "Sawerigading mengarungi lautan, kerajaan, dan berbagai ujian dalam rangkaian epos La Galigo. Kisah ini memperlihatkan luasnya dunia maritim masyarakat Bugis.", "Perjalanan memberi pengetahuan ketika keberanian disertai tanggung jawab."],
    madura: ["Joko Tole", "Joko Tole dikenang sebagai pemuda tangguh dengan kecakapan luar biasa. Berbagai versi kisahnya menghubungkan kepahlawanan dengan kesetiaan kepada keluarga dan tanah kelahiran.", "Kemampuan yang besar sebaiknya digunakan dengan rendah hati dan bertanggung jawab."],
    "papua-provinsi": ["Asal Mula Burung Cenderawasih", "Seorang anak yang baik hati menemukan jalan hidup baru setelah melewati kesepian dan perlakuan tidak adil. Ia kemudian dikaitkan dengan burung cenderawasih yang indah.", "Kebaikan hati tetap bernilai meski tidak selalu segera dihargai."]
  };
  const scriptRanges = { jawa: [0xA984, 20], sunda: [0x1B8A, 18], bali: [0x1B33, 18], bugis: [0x1A00, 20], lampung: [0xA900, 18], batak: [0x1BC0, 18] };

  let activeStage = ["explore", "language", "test"].includes(state.activeStage) ? state.activeStage : "explore";
  let galleryIndex = state.gallery;
  let cardIndex = 0;
  let matchSelected = { local: null, meaning: null };
  let matchedPairs = new Set();
  let quizIndex = 0;
  let quizScore = 0;
  let quizAnswered = false;
  let quizItems = [];
  let speechUtterance = null;
  let toastTimer;
  let notesTimer;
  let companionReturnFocus = null;

  function saveState() {
    state.lastVisit = new Date().toISOString();
    storageSet(stateKey, JSON.stringify(state));
  }

  function toast(message) {
    const target = $("#toast");
    if (!target) return;
    target.textContent = message;
    target.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => target.classList.remove("show"), 2600);
  }

  function completeActivity(id) {
    if (!CORE_ACTIVITIES.includes(id) || state.activities.includes(id)) return;
    state.activities.push(id);
    state.score += ACTIVITY_POINTS[id] || 15;
    saveState();
    renderProgress();
    toast(`Aktivitas selesai · +${ACTIVITY_POINTS[id] || 15} poin budaya`);
  }

  function getGlobalProgress() {
    try { return core.getProgress() || {}; } catch (_) { return {}; }
  }

  function updateProgressList(key, pressed) {
    const progress = getGlobalProgress();
    const list = new Set(progress[key] || []);
    pressed ? list.add(place.id) : list.delete(place.id);
    progress[key] = Array.from(list);
    try { core.saveProgress(progress); } catch (_) {}
    return pressed;
  }

  function syncFavorite() {
    const favorite = (getGlobalProgress().favorites || []).includes(place.id);
    const button = $("#favoriteBtn");
    button.setAttribute("aria-pressed", String(favorite));
    button.classList.toggle("active", favorite);
    $("i", button).className = favorite ? "fa-solid fa-heart" : "fa-regular fa-heart";
    $("span", button).textContent = favorite ? "Tersimpan" : "Simpan favorit";
  }

  function galleryItems() {
    const image = illustrationByRegion[regionSlug] || illustrationByRegion.sumatra;
    return [
      { type: "Destinasi", title: place.destination[0], description: place.destination[1], image },
      { type: "Kuliner", title: place.food[0], description: place.food[1], image },
      { type: "Tradisi", title: place.tradition[0], description: place.tradition[1], image }
    ];
  }

  function renderIdentity() {
    document.body.classList.add(`region-${regionSlug}`);
    document.title = `${place.label}: Budaya & Bahasa | Wonderful Indonesia`;
    const meta = $("meta[name=description]");
    if (meta) meta.content = place.summary;
    $("#placeBreadcrumb").textContent = place.label;
    $("#placeRegion").textContent = place.region;
    $("#placeMark").textContent = place.mark;
    $("#placeName").textContent = place.label;
    $("#placeSummary").textContent = place.summary;
    $("#placeFact").textContent = place.fact;
    $("#journeyPlace").textContent = place.label;
    $("#visualCaption").textContent = `Cerita visual ${place.label}`;
    const heroImage = $("#placeHeroImage");
    heroImage.src = illustrationByRegion[regionSlug] || illustrationByRegion.sumatra;
    heroImage.alt = `Ilustrasi editorial yang mewakili budaya ${place.label}`;
    heroImage.addEventListener("error", () => { heroImage.src = illustrationByRegion.sumatra; heroImage.alt = `Ilustrasi editorial budaya Indonesia sebagai pengganti visual ${place.label}`; }, { once: true });
    syncFavorite();
    try { core.markExplored(place.id); } catch (_) {}
  }

  function renderGallery() {
    const item = galleryItems()[galleryIndex];
    $("#galleryTitle").textContent = `Tiga wajah ${place.label}`;
    $("#galleryPosition").textContent = `${galleryIndex + 1} / 3`;
    $("#galleryStage").innerHTML = `<img src="${escapeHTML(item.image)}" alt="Ilustrasi ${escapeHTML(item.type.toLowerCase())} ${escapeHTML(place.label)}" width="960" height="720" loading="lazy" decoding="async"><div class="gallery-copy"><span>${escapeHTML(item.type)}</span><h4>${escapeHTML(item.title)}</h4><p>${escapeHTML(item.description)}</p></div>`;
    state.gallery = galleryIndex;
    saveState();
  }

  function renderCulture() {
    const items = [["fa-location-dot", "Destinasi", place.destination], ["fa-bowl-food", "Kuliner", place.food], ["fa-masks-theater", "Tradisi", place.tradition]];
    $("#cultureGrid").innerHTML = items.map(([icon, label, value]) => `<article class="culture-card"><span class="culture-icon"><i class="fa-solid ${icon}" aria-hidden="true"></i></span><span class="card-kicker">${label}</span><h3>${escapeHTML(value[0])}</h3><p>${escapeHTML(value[1])}</p></article>`).join("");
  }

  function renderStory() {
    const fallback = [`Cerita dari tanah ${place.label}`, `Masyarakat ${place.label} mewariskan pengetahuan melalui ${place.tradition[0]}, petuah, dan kebiasaan sehari-hari. Warisan ini membantu generasi muda memahami hubungan dengan keluarga, alam, serta komunitas di sekitar ${place.destination[0]}.`, "Warisan budaya tetap hidup ketika dipelajari dengan rasa ingin tahu dan dibagikan dengan penuh hormat."];
    const story = storyLibrary[place.id] || storyLibrary[regionSlug] || fallback;
    $("#storyTitle").textContent = story[0];
    $("#storyText").textContent = story[1];
    $("#storyMoral").textContent = `“${story[2]}”`;
  }

  function renderFlashcard() {
    const card = place.cards[cardIndex];
    $("#flashcard").classList.remove("flipped");
    $("#cardLocal").textContent = card[0];
    $("#cardMeaning").textContent = card[1];
    $("#cardContext").textContent = card[2] || "Coba ucapkan perlahan.";
    $("#flashcardPosition").textContent = `${cardIndex + 1} / ${place.cards.length}`;
    $$(".confidence-button").forEach(button => button.classList.toggle("selected", state.cards[cardIndex] === button.dataset.confidence));
  }

  function speak(text, onEnd) {
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) { toast("Pembacaan suara tidak didukung perangkat ini."); return false; }
    speechSynthesis.cancel();
    speechUtterance = new SpeechSynthesisUtterance(text);
    speechUtterance.lang = "id-ID";
    speechUtterance.rate = .92;
    speechUtterance.onend = () => onEnd?.();
    speechUtterance.onerror = () => { $("#storyReadBtn").disabled = false; $("#storyStopBtn").disabled = true; toast("Suara tidak dapat diputar. Kamu tetap dapat membaca teksnya."); };
    speechSynthesis.speak(speechUtterance);
    return true;
  }

  function renderPhrases(query = "") {
    const q = query.trim().toLocaleLowerCase("id");
    const phrases = place.phrases.filter(item => !q || item.some(value => String(value).toLocaleLowerCase("id").includes(q)));
    $("#phraseCount").textContent = `${phrases.length} frasa`;
    $("#phraseList").innerHTML = phrases.length ? phrases.map(item => `<article class="phrase-item"><div><strong>${escapeHTML(item[0])}</strong><small>${escapeHTML(item[1])}</small></div><button type="button" data-text="${encodeURIComponent(item[0])}" aria-label="Dengarkan ${escapeHTML(item[0])}"><i class="fa-solid fa-volume-high" aria-hidden="true"></i></button></article>`).join("") : '<div class="empty-state"><i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i><p>Belum ada frasa yang cocok. Coba kata lain.</p></div>';
  }

  function renderScript() {
    const range = scriptRanges[place.id];
    if (!range) {
      $("#scriptTitle").textContent = "Latihan bahasa lisan";
      $("#scriptOutput").hidden = true;
      $("#scriptKeys").innerHTML = `<div class="script-unavailable"><b>Fokus pada pelafalan</b><p>Untuk ${escapeHTML(place.label)}, latihan ini memprioritaskan ungkapan lisan dari kartu dan kamus mini.</p></div>`;
      $("#copyScript").hidden = true;
      $("#clearScript").hidden = true;
      return;
    }
    const chars = Array.from({ length: range[1] }, (_, index) => String.fromCodePoint(range[0] + index));
    $("#scriptKeys").innerHTML = chars.map(char => `<button class="script-key" type="button" data-char="${char}" aria-label="Tambahkan karakter ${char}">${char}</button>`).join("");
  }

  function shuffle(list) {
    const output = [...list];
    for (let index = output.length - 1; index > 0; index--) { const target = Math.floor(Math.random() * (index + 1)); [output[index], output[target]] = [output[target], output[index]]; }
    return output;
  }

  function renderMatching() {
    matchedPairs = new Set();
    matchSelected = { local: null, meaning: null };
    const pairs = place.cards.slice(0, 4).map((card, id) => ({ id: String(id), local: card[0], meaning: card[1] }));
    $("#matchingLocal").innerHTML = shuffle(pairs).map(item => `<button class="match-option" type="button" data-side="local" data-id="${item.id}">${escapeHTML(item.local)}</button>`).join("");
    $("#matchingMeaning").innerHTML = shuffle(pairs).map(item => `<button class="match-option" type="button" data-side="meaning" data-id="${item.id}">${escapeHTML(item.meaning)}</button>`).join("");
    $("#matchScore").textContent = "0/4 benar";
    $("#matchResult").textContent = "";
  }

  function buildQuizQuestions() {
    const nextPlace = data.places[(data.places.indexOf(place) + 1) % data.places.length];
    const foodAnswers = shuffle([place.food[0], nextPlace.food[0], "Tidak ada", "Semua benar"]);
    const meaningAnswers = shuffle(place.cards.slice(0, 4).map(card => card[1]));
    return [
      { q: place.quiz.q, answers: [...place.quiz.answers], correctIndex: place.quiz.correct },
      { q: `Apa kuliner yang ditampilkan untuk ${place.label}?`, answers: foodAnswers, correctIndex: foodAnswers.indexOf(place.food[0]) },
      { q: `Ungkapan “${place.cards[0][0]}” berarti…`, answers: meaningAnswers, correctIndex: meaningAnswers.indexOf(place.cards[0][1]) }
    ];
  }

  function renderQuiz() {
    if (quizIndex >= quizItems.length) return finishQuiz();
    quizAnswered = false;
    const question = quizItems[quizIndex];
    $("#quizCounter").textContent = `Pertanyaan ${quizIndex + 1} dari ${quizItems.length}`;
    $("#quizProgressBar").style.width = `${(quizIndex / quizItems.length) * 100}%`;
    $("#quizQuestion").textContent = question.q;
    $("#quizAnswers").innerHTML = question.answers.map((answer, index) => `<button class="quiz-answer" type="button" data-answer="${index}"><span>${String.fromCharCode(65 + index)}.</span> ${escapeHTML(answer)}</button>`).join("");
    $("#quizFeedback").textContent = "";
    $("#quizNext").hidden = true;
    $("#quizNext").innerHTML = 'Berikutnya <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>';
    const best = Number(storageGet(`detail_quiz_best_${place.id}`, 0)) || 0;
    $("#quizBest").textContent = best ? `Skor terbaik ${best}/3` : "Skor terbaik —";
  }

  function finishQuiz() {
    const bestKey = `detail_quiz_best_${place.id}`;
    const best = Math.max(Number(storageGet(bestKey, 0)) || 0, quizScore);
    storageSet(bestKey, String(best));
    $("#quizCounter").textContent = "Kuis selesai";
    $("#quizProgressBar").style.width = "100%";
    $("#quizQuestion").textContent = `${quizScore}/3 jawaban benar`;
    $("#quizAnswers").innerHTML = "";
    $("#quizFeedback").textContent = quizScore === 3 ? "Luar biasa! Kamu mengenal daerah ini dengan sangat baik." : "Bagus! Ulangi bagian yang belum yakin untuk memperkuat ingatanmu.";
    $("#quizNext").hidden = false;
    $("#quizNext").innerHTML = '<i class="fa-solid fa-rotate-right" aria-hidden="true"></i> Ulangi kuis';
    completeActivity("quiz");
    const progress = getGlobalProgress();
    progress.quizDone = (progress.quizDone || 0) + 1;
    progress.reviewed = (progress.reviewed || 0) + 3;
    progress.correct = (progress.correct || 0) + quizScore;
    try { core.saveProgress(progress); } catch (_) {}
  }

  function nextIncomplete() { return CORE_ACTIVITIES.find(id => !state.activities.includes(id)) || "quiz"; }
  function stageForActivity(id) { return Object.keys(STAGE_ACTIVITIES).find(stage => STAGE_ACTIVITIES[stage].includes(id)) || "explore"; }

  function renderProgress() {
    const completed = CORE_ACTIVITIES.filter(id => state.activities.includes(id)).length;
    const percent = Math.round((completed / CORE_ACTIVITIES.length) * 100);
    $("#completedActivities").textContent = `${completed}/7`;
    $("#heroActivityCount").textContent = `${completed}/7`;
    $("#heroProgress").textContent = `${percent}%`;
    $("#companionProgress").textContent = `${completed}/7`;
    $("#progressBar").style.width = `${percent}%`;
    $(".progress-track").setAttribute("aria-valuenow", String(percent));
    $(".journey-score").style.setProperty("--journey-progress", `${percent * 3.6}deg`);

    $$("[data-activity]").forEach(card => {
      const done = state.activities.includes(card.dataset.activity);
      card.classList.toggle("activity-complete", done);
      const guideStatus = $(".activity-guide small", card);
      if (guideStatus) guideStatus.innerHTML = done ? '<span class="activity-state"><i class="fa-solid fa-check" aria-hidden="true"></i> Selesai</span>' : '<i class="fa-regular fa-clock" aria-hidden="true"></i> Aktivitas inti';
      const button = $(".activity-complete-button", card);
      if (button && done) button.innerHTML = '<i class="fa-solid fa-check" aria-hidden="true"></i> Aktivitas selesai';
    });

    $$(".stage-tab").forEach(tab => {
      const list = STAGE_ACTIVITIES[tab.dataset.stage];
      const done = list.filter(id => state.activities.includes(id)).length;
      tab.classList.toggle("is-complete", done === list.length);
      $("small", tab).textContent = done === list.length ? "Tahap selesai" : `${done}/${list.length} aktivitas`;
    });

    $("#activityChecklist").innerHTML = CORE_ACTIVITIES.map((id, index) => {
      const done = state.activities.includes(id);
      return `<div class="checklist-item ${done ? "done" : ""}"><i class="fa-solid ${done ? "fa-check" : "fa-circle"}" aria-hidden="true"></i><span>${index + 1}. ${ACTIVITY_LABELS[id][0]}</span><small>${done ? "Selesai" : "Belum"}</small></div>`;
    }).join("");

    const next = nextIncomplete();
    $("#nextActionTitle").textContent = completed === 7 ? "Pertahankan penguasaanmu" : ACTIVITY_LABELS[next][0];
    $("#nextActionText").textContent = completed === 7 ? "Semua aktivitas inti selesai. Kamu dapat mengulang kuis kapan saja." : ACTIVITY_LABELS[next][1];
    $("#nextActionButton").innerHTML = completed === 7 ? 'Ulangi kuis <i class="fa-solid fa-rotate-right" aria-hidden="true"></i>' : 'Buka aktivitas <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>';

    const mastered = (getGlobalProgress().mastered || []).includes(place.id);
    const completeButton = $("#completePlaceBtn");
    completeButton.disabled = completed < 7 || mastered;
    completeButton.textContent = mastered ? "Sudah dikuasai" : "Tandai dikuasai";
    $("#completionTitle").textContent = mastered ? `${place.label} sudah kamu kuasai` : completed === 7 ? "Perjalanan lengkap" : "Teruskan perjalananmu";
    $("#completionText").textContent = mastered ? "Kamu dapat kembali kapan saja untuk mengulang materi dan menjaga ingatan." : completed === 7 ? "Tujuh aktivitas inti selesai. Tandai daerah ini sebagai dikuasai." : `Selesaikan ${7 - completed} aktivitas lagi untuk menuntaskan perjalanan.`;
  }

  function switchStage(stage, focus = false) {
    if (!STAGE_ACTIVITIES[stage]) return;
    activeStage = stage;
    state.activeStage = stage;
    saveState();
    $$(".stage-tab").forEach(tab => { const active = tab.dataset.stage === stage; tab.classList.toggle("active", active); tab.setAttribute("aria-selected", String(active)); tab.tabIndex = active ? 0 : -1; });
    $$(".stage-panel").forEach(panel => { const active = panel.dataset.panel === stage; panel.hidden = !active; panel.classList.toggle("active", active); });
    history.replaceState(null, "", `${location.pathname}?id=${encodeURIComponent(place.id)}#${stage}`);
    if (focus) $("#stage-" + stage).scrollIntoView({ behavior: document.body.classList.contains("no-motion") ? "auto" : "smooth", block: "start" });
  }

  function openNextAction() {
    const activity = nextIncomplete();
    switchStage(stageForActivity(activity));
    setTimeout(() => {
      const target = $(`[data-activity="${activity}"]`);
      target?.scrollIntoView({ behavior: document.body.classList.contains("no-motion") ? "auto" : "smooth", block: "start" });
      target?.classList.add("activity-highlight");
      setTimeout(() => target?.classList.remove("activity-highlight"), 1400);
    }, 50);
    closeCompanion();
  }

  function copyText(text, successMessage) {
    if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text).then(() => toast(successMessage)).catch(() => fallbackCopy(text, successMessage));
    return fallbackCopy(text, successMessage);
  }

  function fallbackCopy(text, successMessage) {
    const input = document.createElement("textarea");
    input.value = text; input.readOnly = true; input.style.position = "fixed"; input.style.opacity = "0";
    document.body.appendChild(input); input.select();
    try { document.execCommand("copy"); toast(successMessage); } catch (_) { toast("Perangkat tidak mengizinkan akses clipboard."); }
    input.remove();
  }

  function downloadBrief() {
    const lines = [`${place.label} — Wonderful Indonesia`, "", place.summary, "", `Destinasi: ${place.destination[0]} — ${place.destination[1]}`, `Kuliner: ${place.food[0]} — ${place.food[1]}`, `Tradisi: ${place.tradition[0]} — ${place.tradition[1]}`, "", "Frasa pilihan:", ...place.cards.slice(0, 4).map(card => `• ${card[0]} — ${card[1]}`)];
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob); link.download = `ringkasan-${place.id}.txt`; link.hidden = true;
    document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(link.href), 0);
    toast("Ringkasan berhasil diunduh.");
  }

  function applyPreferences() {
    document.body.classList.toggle("text-large", state.textScale === 1);
    document.body.classList.toggle("text-xlarge", state.textScale === 2);
    document.body.classList.toggle("no-motion", state.reduceMotion);
    $("#reduceMotionBtn").setAttribute("aria-pressed", String(state.reduceMotion));
    const labels = ["Ukuran teks normal", "Ukuran teks sedang", "Ukuran teks besar"];
    $("#textScaleBtn span").textContent = labels[state.textScale];
  }

  function initTheme() {
    const button = $("#themeToggleBtn");
    document.body.classList.toggle("dark-theme", storageGet("eduquest_theme", "light") === "dark");
    const sync = () => { const dark = document.body.classList.contains("dark-theme"); button.setAttribute("aria-pressed", String(dark)); button.setAttribute("aria-label", dark ? "Aktifkan tema terang" : "Aktifkan tema gelap"); button.innerHTML = `<i class="fa-solid ${dark ? "fa-sun" : "fa-moon"}" aria-hidden="true"></i>`; };
    button.addEventListener("click", () => { const dark = !document.body.classList.contains("dark-theme"); document.body.classList.toggle("dark-theme", dark); storageSet("eduquest_theme", dark ? "dark" : "light"); sync(); });
    sync();
  }

  function toggleUtility(trigger) {
    const menu = $("#utilityMenu");
    const open = menu.hidden;
    menu.hidden = !open;
    $$("#utilityBtn, #headerUtilityBtn").forEach(button => button.setAttribute("aria-expanded", String(open)));
    if (open) $("button", menu)?.focus(); else trigger?.focus();
  }

  function openCompanion(trigger = $("#openCompanion")) {
    companionReturnFocus = trigger;
    $("#learningCompanion").classList.add("open");
    $("#drawerBackdrop").hidden = false;
    $("#openCompanion").setAttribute("aria-expanded", "true");
    $("#closeCompanion").focus();
  }

  function closeCompanion() {
    const drawer = $("#learningCompanion");
    if (!drawer.classList.contains("open")) return;
    drawer.classList.remove("open");
    $("#drawerBackdrop").hidden = true;
    $("#openCompanion").setAttribute("aria-expanded", "false");
    companionReturnFocus?.focus();
  }

  function bindPro() {
    const isPro = storageGet("eduquestSubscription") === "pro";
    $("#proLocked").hidden = isPro;
    $("#proContent").hidden = !isPro;
    if (!isPro) return;
    const notes = $("#privateNotes");
    const plan = $("#studyPlan");
    notes.value = storageGet(`note_${place.id}`, "");
    plan.value = storageGet(`plan_${place.id}`, "");
    notes.addEventListener("input", () => { $("#notesStatus").textContent = "Menyimpan…"; clearTimeout(notesTimer); notesTimer = setTimeout(() => { const saved = storageSet(`note_${place.id}`, notes.value); $("#notesStatus").textContent = saved ? "Tersimpan otomatis" : "Penyimpanan gagal"; }, 500); });
    plan.addEventListener("change", () => { storageSet(`plan_${place.id}`, plan.value); toast("Rencana belajar disimpan."); });
    $("#exportNotes").addEventListener("click", () => { const blob = new Blob([`${place.label}\n\n${notes.value || "Belum ada catatan."}\n\nRencana: ${plan.value || "Belum ditentukan"}`], { type: "text/plain;charset=utf-8" }); const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = `catatan-${place.id}.txt`; link.click(); setTimeout(() => URL.revokeObjectURL(link.href), 0); });
  }

  function bindEvents() {
    $("#mobileMenuBtn").addEventListener("click", event => { const menu = $("#mobileMenu"); const open = menu.hidden; menu.hidden = !open; event.currentTarget.setAttribute("aria-expanded", String(open)); });
    $("#favoriteBtn").addEventListener("click", event => { const pressed = event.currentTarget.getAttribute("aria-pressed") !== "true"; updateProgressList("favorites", pressed); syncFavorite(); toast(pressed ? "Daerah disimpan ke favorit." : "Daerah dihapus dari favorit."); });
    $("#completePlaceBtn").addEventListener("click", () => { if (state.activities.length < 7) return toast("Selesaikan tujuh aktivitas inti terlebih dahulu."); updateProgressList("mastered", true); renderProgress(); toast(`${place.label} ditandai sebagai dikuasai.`); });
    $("#continueLearningBtn").addEventListener("click", openNextAction);
    $("#nextActionButton").addEventListener("click", openNextAction);
    $$(".stage-tab").forEach((tab, index, tabs) => { tab.addEventListener("click", () => switchStage(tab.dataset.stage)); tab.addEventListener("keydown", event => { if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return; event.preventDefault(); const next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length; tabs[next].focus(); switchStage(tabs[next].dataset.stage); }); });
    $$(".next-stage").forEach(button => button.addEventListener("click", () => switchStage(button.dataset.next, true)));
    $("#galleryPrev").addEventListener("click", () => { galleryIndex = (galleryIndex + 2) % 3; renderGallery(); });
    $("#galleryNext").addEventListener("click", () => { galleryIndex = (galleryIndex + 1) % 3; renderGallery(); });
    $("#galleryStage").addEventListener("keydown", event => { if (event.key === "ArrowLeft") $("#galleryPrev").click(); if (event.key === "ArrowRight") $("#galleryNext").click(); });
    $("#galleryDoneBtn").addEventListener("click", () => completeActivity("gallery"));
    $("#storyDoneBtn").addEventListener("click", () => completeActivity("story"));
    $("#phrasesDoneBtn").addEventListener("click", () => completeActivity("phrases"));
    $("#scriptDoneBtn").addEventListener("click", () => completeActivity("script"));
    $("#storyReadBtn").addEventListener("click", () => { const read = speak($("#storyText").textContent, () => { $("#storyReadBtn").disabled = false; $("#storyStopBtn").disabled = true; }); if (read) { $("#storyReadBtn").disabled = true; $("#storyStopBtn").disabled = false; } });
    $("#storyStopBtn").addEventListener("click", () => { try { speechSynthesis.cancel(); } catch (_) {} $("#storyReadBtn").disabled = false; $("#storyStopBtn").disabled = true; });
    $("#flashcard").addEventListener("click", () => $("#flashcard").classList.toggle("flipped"));
    $("#cardPrev").addEventListener("click", () => { cardIndex = (cardIndex - 1 + place.cards.length) % place.cards.length; renderFlashcard(); });
    $("#cardNext").addEventListener("click", () => { cardIndex = (cardIndex + 1) % place.cards.length; renderFlashcard(); });
    $("#cardSpeak").addEventListener("click", () => speak(place.cards[cardIndex][0]));
    $$(".confidence-button").forEach(button => button.addEventListener("click", () => { state.cards[cardIndex] = button.dataset.confidence; saveState(); completeActivity("flashcard"); renderFlashcard(); if (button.dataset.confidence === "know") setTimeout(() => $("#cardNext").click(), 350); }));
    $("#phraseSearch").addEventListener("input", event => renderPhrases(event.target.value));
    $("#phraseList").addEventListener("click", event => { const button = event.target.closest("button[data-text]"); if (button) speak(decodeURIComponent(button.dataset.text)); });
    $("#scriptKeys").addEventListener("click", event => { const key = event.target.closest("[data-char]"); if (!key) return; const output = $("#scriptOutput"); output.textContent = output.textContent === "Pilih karakter di bawah" ? key.dataset.char : output.textContent + key.dataset.char; });
    $("#clearScript").addEventListener("click", () => { $("#scriptOutput").textContent = "Pilih karakter di bawah"; });
    $("#copyScript").addEventListener("click", () => { const text = $("#scriptOutput").textContent; if (text === "Pilih karakter di bawah") return toast("Pilih beberapa karakter terlebih dahulu."); copyText(text, "Tulisan berhasil disalin."); });
    $("#resetMatching").addEventListener("click", renderMatching);
    $(".matching-grid").addEventListener("click", event => {
      const button = event.target.closest(".match-option"); if (!button || button.disabled) return;
      const side = button.dataset.side; $$(`.match-option[data-side="${side}"]`).forEach(item => item.classList.remove("selected")); button.classList.add("selected"); matchSelected[side] = button;
      if (!matchSelected.local || !matchSelected.meaning) return;
      const correct = matchSelected.local.dataset.id === matchSelected.meaning.dataset.id;
      if (correct) { matchSelected.local.classList.add("correct"); matchSelected.meaning.classList.add("correct"); matchSelected.local.disabled = true; matchSelected.meaning.disabled = true; matchedPairs.add(matchSelected.local.dataset.id); $("#matchResult").textContent = "Tepat! Pasangan berhasil ditemukan."; $("#matchScore").textContent = `${matchedPairs.size}/4 benar`; if (matchedPairs.size === 4) completeActivity("matching"); }
      else { matchSelected.local.classList.add("incorrect"); matchSelected.meaning.classList.add("incorrect"); $("#matchResult").textContent = "Belum tepat. Coba pasangan lain."; setTimeout(() => $$(".match-option.incorrect").forEach(item => item.classList.remove("incorrect")), 450); }
      matchSelected.local.classList.remove("selected"); matchSelected.meaning.classList.remove("selected"); matchSelected = { local: null, meaning: null };
    });
    $("#quizAnswers").addEventListener("click", event => { const button = event.target.closest(".quiz-answer"); if (!button || quizAnswered) return; quizAnswered = true; const question = quizItems[quizIndex]; const correct = Number(button.dataset.answer) === question.correctIndex; if (correct) { quizScore++; button.classList.add("correct"); $("#quizFeedback").textContent = "Benar! Kamu berhasil mengingat materinya."; } else { button.classList.add("wrong"); $(`.quiz-answer[data-answer="${question.correctIndex}"]`).classList.add("correct"); $("#quizFeedback").textContent = `Jawaban yang tepat: ${question.answers[question.correctIndex]}.`; } $$(".quiz-answer").forEach(item => item.disabled = true); $("#quizNext").hidden = false; });
    $("#quizNext").addEventListener("click", () => {
      if (quizIndex >= quizItems.length) { quizIndex = 0; quizScore = 0; quizItems = buildQuizQuestions(); }
      else quizIndex++;
      renderQuiz();
    });
    $("#openCompanion").addEventListener("click", event => openCompanion(event.currentTarget));
    $("#closeCompanion").addEventListener("click", closeCompanion);
    $("#drawerBackdrop").addEventListener("click", closeCompanion);
    $("#mobileJourney").addEventListener("click", () => $(".journey-shell").scrollIntoView({ behavior: state.reduceMotion ? "auto" : "smooth", block: "start" }));
    $$("#utilityBtn, #headerUtilityBtn").forEach(button => button.addEventListener("click", event => toggleUtility(event.currentTarget)));
    $("#focusModeBtn").addEventListener("click", event => { const on = !document.body.classList.contains("focus-mode"); document.body.classList.toggle("focus-mode", on); event.currentTarget.setAttribute("aria-pressed", String(on)); toast(on ? "Mode fokus aktif." : "Mode fokus nonaktif."); });
    $("#textScaleBtn").addEventListener("click", () => { state.textScale = (state.textScale + 1) % 3; saveState(); applyPreferences(); toast($("#textScaleBtn span").textContent + "."); });
    $("#reduceMotionBtn").addEventListener("click", event => { state.reduceMotion = !state.reduceMotion; event.currentTarget.setAttribute("aria-pressed", String(state.reduceMotion)); saveState(); applyPreferences(); toast(state.reduceMotion ? "Animasi dikurangi." : "Animasi normal diaktifkan."); });
    $("#shareBtn").addEventListener("click", () => copyText(location.href, "Tautan daerah disalin."));
    $("#printBtn").addEventListener("click", () => window.print());
    $("#downloadBtn").addEventListener("click", downloadBrief);
    $("#sourceInfo").addEventListener("click", () => $("#sourceDialog").showModal());
    $("#sourceDialogClose").addEventListener("click", () => $("#sourceDialog").close());
    $("#sourceDialog").addEventListener("click", event => { if (event.target === $("#sourceDialog")) $("#sourceDialog").close(); });
    document.addEventListener("keydown", event => { if (event.key !== "Escape") return; closeCompanion(); $("#utilityMenu").hidden = true; $("#mobileMenu").hidden = true; $$("#utilityBtn, #headerUtilityBtn").forEach(button => button.setAttribute("aria-expanded", "false")); });
    document.addEventListener("click", event => { if (!event.target.closest("#utilityMenu, #utilityBtn, #headerUtilityBtn")) { $("#utilityMenu").hidden = true; $$("#utilityBtn, #headerUtilityBtn").forEach(button => button.setAttribute("aria-expanded", "false")); } });
  }

  function init() {
    initTheme();
    applyPreferences();
    quizItems = buildQuizQuestions();
    renderIdentity(); renderGallery(); renderCulture(); renderStory(); renderFlashcard(); renderPhrases(); renderScript(); renderMatching(); renderQuiz(); renderProgress();
    bindEvents(); bindPro(); saveState();
    const hashStage = location.hash.replace("#", "");
    switchStage(STAGE_ACTIVITIES[hashStage] ? hashStage : activeStage);
  }

  window.addEventListener("pagehide", () => { try { speechSynthesis.cancel(); } catch (_) {} clearTimeout(notesTimer); });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true }); else init();
})();
