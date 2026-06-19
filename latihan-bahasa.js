(function () {
    const data = window.WonderfulData;
    const core = window.WonderfulCore;

    // Database Fonetik & Fakta Unik Kosakata (Untuk 72 Kosakata Daerah)
    const VOCAB_METADATA = {
        // Jawa
        "sugeng enjing": { phonetic: "/soo-geng en-jeeng/", trivia: "Sapaan pagi krama alus untuk menunjukkan kesopanan tinggi kepada orang tua atau dalam forum resmi." },
        "matur nuwun": { phonetic: "/mah-toor noo-woon/", trivia: "Secara harfiah berarti 'mengucapkan kata penuh'. Ungkapan apresiasi tertua yang tercatat di prasasti Jawa Kuno." },
        "piye kabare?": { phonetic: "/pee-yeh kah-bah-reh/", trivia: "Sapaan santai (ngoko) sehari-hari yang sangat populer di kalangan masyarakat Jawa." },
        "pinten regine?": { phonetic: "/peen-ten reh-ghee-neh/", trivia: "Kalimat tanya harga tingkat krama alus. Sangat berguna saat berbelanja di Pasar Beringharjo Jogja." },
        // Sunda
        "wilujeng enjing": { phonetic: "/wee-loo-jeng en-jeeng/", trivia: "Sapaan pagi resmi di Tatar Sunda yang mencerminkan filosofi hidup soméah (ramah tamah)." },
        "hatur nuhun": { phonetic: "/hah-toor noo-hoon/", trivia: "Gabungan kata 'hatur' (menyampaikan) dan 'nuhun' (terima kasih). Ekspresi syukur paling populer bagi urang Sunda." },
        "kumaha damang?": { phonetic: "/koo-mah-hah dah-mahng/", trivia: "Menanyakan kesehatan dengan halus (lemes). Bentuk empati yang tinggi terhadap kondisi sesama." },
        "sabaraha pangaosna?": { phonetic: "/sah-bah-rah-hah pah-ngah-ohs-nah/", trivia: "Pertanyaan harga tingkat halus, melatih kesantunan bertransaksi di pasar tradisional Jawa Barat." },
        // Bali
        "rahajeng semeng": { phonetic: "/rah-hah-jeng seh-meng/", trivia: "Sapaan selamat pagi formal. Kata 'semeng' merujuk pada waktu fajar menyingsing." },
        "suksma mewali": { phonetic: "/sook-smah meh-wah-lee/", trivia: "Kombinasi ucapan terima kasih mendalam (suksma) dan balasan sopan kembali (mewali)." },
        "kenken kabare?": { phonetic: "/ken-ken kah-bah-reh/", trivia: "Cara kasual menanyakan kabar kawan dekat di Bali. Sangat akrab didengar di banjar-banjar." },
        "kuda aji ne?": { phonetic: "/koo-dah ah-jee neh/", trivia: "Kata 'kuda' berarti berapa, 'aji' berarti harga/nilai. Digunakan saat menawar kerajinan seni di Sukawati." },
        // Minang
        "salamaik pagi": { phonetic: "/sah-lah-maik pah-ghee/", trivia: "Sapaan pagi khas Ranah Minang yang mendapat pengaruh dialek Melayu dengan penekanan vokal teredam." },
        "tarimo kasih": { phonetic: "/tah-ree-moh kah-seeh/", trivia: "Ungkapan apresiasi luhur yang mencerminkan rasa hormat tinggi dalam adat adat Minangkabau." },
        "apo kaba?": { phonetic: "/ah-poh kah-bah/", trivia: "Sapaan ramah pembuka obrolan yang sering didengar di lapau-lapau tradisional Sumatra Barat." },
        "bara haragonyo?": { phonetic: "/bah-rah hah-rah-ghoh-nyoh/", trivia: "Kalimat tawar-menawar yang melegenda di Pasar Ateh Bukittinggi dekat Jam Gadang." },
        // Batak
        "horas": { phonetic: "/hoh-rahs/", trivia: "Bukan sekadar salam pembuka, Horas melambangkan doa keselamatan, kesehatan, kemakmuran, dan kedamaian." },
        "mauliate": { phonetic: "/mah-oo-lee-ah-teh/", trivia: "Ucapan terima kasih mendalam Batak Toba, mencerminkan kerendahan hati dan kesyukuran adat." },
        "boha kabar?": { phonetic: "/boh-hah kah-bahr/", trivia: "Pertanyaan kabar sehari-hari yang mengakrabkan tali persaudaraan antar marga (tarombo)." },
        "sadia argana?": { phonetic: "/sah-dee-ah ahr-gah-nah/", trivia: "Digunakan ketika menanyakan harga kain tenun Ulos tradisional di lingkar Danau Toba." },
        // Aceh
        "seulamat beungoh": { phonetic: "/seu-lah-mat beu-ngoh/", trivia: "Sapaan pagi Aceh. Kata 'beungoh' secara khusus berarti waktu pagi hari setelah fajar." },
        "teurimong geunaseh": { phonetic: "/teu-ree-mong geu-nah-seh/", trivia: "Bermakna 'menerima kasih sayang'. Bentuk ucapan terima kasih yang sarat nilai sastra Melayu Islam." },
        "pakon haba?": { phonetic: "/pah-kon hah-bah/", trivia: "Cara menanyakan keadaan atau kabar kepada lawan bicara dengan nada bersahabat." },
        "padum beukai?": { phonetic: "/pad-oom beu-kai/", trivia: "Secara harfiah berarti 'berapa bekalnya?'. Dipakai untuk menanyakan total belanja kopi Gayo." },
        // Betawi
        "selamet pagi": { phonetic: "/seh-lah-met pah-ghee/", trivia: "Sapaan pagi harian khas Jakarta dengan penyerapan vokal pepet Melayu Batavia." },
        "makasih ye": { phonetic: "/mah-kah-seeh yeh/", trivia: "Ekspresi apresiasi kasual Betawi, akrab diucapkan di lingkungan perkampungan asli Jakarta." },
        "gimana kabarnye?": { phonetic: "/ghee-mah-nah kah-bahr-nyeh/", trivia: "Sapaan khas Betawi menanyakan kabar, kental dengan akhiran vokal 'e' yang lugas." },
        "berapaan nih?": { phonetic: "/beh-rah-pah-ahn neeh/", trivia: "Gaya tanya harga santai saat membeli Kerak Telor di Pekan Raya Jakarta." },
        // Dayak
        "selamat dauh": { phonetic: "/seh-lah-mat dah-ooh/", trivia: "Sapaan pagi menjelang siang hari dalam bahasa Dayak Ngaju di wilayah aliran sungai Kalimantan." },
        "terima kasih": { phonetic: "/teh-ree-mah kah-seeh/", trivia: "Ekspresi penghargaan universal yang digunakan di berbagai rumpun suku Dayak." },
        "narai kabar?": { phonetic: "/nah-rai kah-bahr/", trivia: "Kata 'narai' berarti 'apa'. Cara umum suku Dayak Ngaju menanyakan kabar kerabat." },
        "kureh regae?": { phonetic: "/koo-reh reh-ghae/", trivia: "Kalimat menanyakan harga saat bertransaksi hasil hutan atau manik-manik khas Dayak." },
        // Banjar
        "salamat pagi": { phonetic: "/sah-lah-mat pah-ghee/", trivia: "Sapaan pagi ramah khas Banjar yang dipengaruhi bahasa Melayu pesisir Kalimantan." },
        "tarima kasih": { phonetic: "/tah-ree-mah kah-seeh/", trivia: "Ekspresi terima kasih khas Banua Banjar untuk menghargai budi kebaikan sesama." },
        "apa habar?": { phonetic: "/ah-pah hah-bahr/", trivia: "Pertanyaan kabar yang ramah, sering terdengar di tepian sungai Martapura Banjarmasin." },
        "bapa reganya?": { phonetic: "/bah-pah reh-gah-nyah/", trivia: "Dipakai saat menawar Soto Banjar hangat atau kain sasirangan di pasar terapung." },
        // Bugis
        "mappadeceng": { phonetic: "/mah-pah-deh-cheng/", trivia: "Bermakna 'membawa kebaikan bersama'. Sapaan luhur yang sarat nilai kehormatan diri (siri')." },
        "kurre sumanga'": { phonetic: "/koor-reh soo-mah-nga/", trivia: "Ungkapan rasa terima kasih sakral, secara spiritual bermakna menghidupkan kembali semangat hidup." },
        "aga kareba?": { phonetic: "/ah-ghah kah-reh-bah/", trivia: "Sapaan kabar Bugis legendaris. Dilafalkan dengan cepat dan tegas dalam pergaulan." },
        "siaga ellinna?": { phonetic: "/see-ah-ghah el-leen-nah/", trivia: "Diucapkan saat bertransaksi di pelabuhan Phinisi atau membeli kain sutera Sengkang." },
        // Madura
        "salamet lagghu": { phonetic: "/sah-lah-met lahg-ghoo/", trivia: "Sapaan pagi khas Madura. Diucapkan dengan pelafalan konsonan tebal yang tegas." },
        "mator sakalangkong": { phonetic: "/mah-tor sah-kah-lahng-kohng/", trivia: "Artinya 'menghaturkan terima kasih tak terhingga', menunjukkan tata krama kesantunan luhur." },
        "remma kabarra?": { phonetic: "/rem-mah kah-bahr-rah/", trivia: "Sapaan kabar akrab antar kerabat (tretan) untuk menjaga silaturahmi." },
        "berapa argana?": { phonetic: "/beh-rah-pah ahr-ghah-nah/", trivia: "Digunakan saat membeli Sate Madura bumbu kacang pekat di pinggir jalan." },
        // Papua
        "wa wa wa": { phonetic: "/wah wah wah/", trivia: "Salam persaudaraan adat pegunungan tengah Papua. Melambangkan syukur, damai, dan persatuan luhur." },
        "mace": { phonetic: "/mah-cheh/", trivia: "Panggilan santun sekaligus menunjukkan rasa hormat yang tinggi kepada ibu atau wanita dewasa di Papua." },
        "pace": { phonetic: "/pah-cheh/", trivia: "Panggilan ramah dan bersaudara kepada bapak, pemuda, atau kawan laki-laki di Papua." },
        "ko": { phonetic: "/koh/", trivia: "Kata ganti orang kedua tunggal (kamu) dalam ragam dialek bahasa Melayu Papua." },
        // Papua Barat
        "selamat pagi": { phonetic: "/seh-lah-mat pah-ghee/", trivia: "Sapaan pagi umum yang digunakan di wilayah pesisir Manokwari dan Teluk Cendrawasih." },
        "kitorang": { phonetic: "/kee-toh-rahng/", trivia: "Singkatan dari 'kita orang'. Melambangkan ikatan sosial persaudaraan yang kuat." },
        "sa senang sekali": { phonetic: "/sah seh-nahng seh-kah-lee/", trivia: "Ekspresi kegembiraan. Kata 'sa' adalah kependekan yang sangat umum dari 'saya'." },
        "pace mace": { phonetic: "/pah-cheh mah-cheh/", trivia: "Sapaan kolektif santun kepada hadirin pria dan wanita saat memulai pertemuan adat." },
        // Papua Selatan
        "izakod bekai izakod kai": { phonetic: "/ee-zah-kod beh-kai ee-zah-kod kai/", trivia: "Semboyan persatuan Merauke dari bahasa suku Marind yang berarti 'Satu Hati Satu Tujuan'." },
        "sep": { phonetic: "/sep/", trivia: "Merujuk pada kuliner tradisional Merauke berbahan sagu dicampur parutan kelapa dan daging." },
        "amai": { phonetic: "/ah-mai/", trivia: "Panggilan hormat/sayang kepada kakek atau sesepuh adat suku Marind." },
        "sa punya": { phonetic: "/sah poo-nyah/", trivia: "Konstruksi tata bahasa Melayu Papua untuk menyatakan hak kepemilikan atas suatu barang." },
        // Papua Tengah
        "amapane": { phonetic: "/ah-mah-pah-neh/", trivia: "Ucapan terima kasih halus dalam bahasa suku Mee di wilayah pegunungan Paniai." },
        "noken anggrek": { phonetic: "/noh-ken ahng-grek/", trivia: "Kerajinan tas rajut Papua dari serat kulit anggrek hutan liar, bernilai ekonomi sangat tinggi." },
        "nabire": { phonetic: "/nah-bee-reh/", trivia: "Nama ibukota provinsi Papua Tengah yang terletak di pesisir utara dengan hiu paus eksotis." },
        "de": { phonetic: "/deh/", trivia: "Kata ganti orang ketiga tunggal (dia) dalam obrolan kasual sehari-hari." },
        // Papua Pegunungan
        "koleak": { phonetic: "/koh-leh-ahk/", trivia: "Salam perdamaian suku Dani yang melambangkan kerukunan erat di Lembah Baliem." },
        "honai": { phonetic: "/hoh-nai/", trivia: "Arsitektur rumah kayu bulat dengan atap jerami tebal, dirancang khusus menahan dingin pegunungan." },
        "wamena": { phonetic: "/wah-meh-nah/", trivia: "Kota sejuk di Lembah Baliem, terkenal dengan festival budaya akbar bakar batu tahunan." },
        "hipere": { phonetic: "/hee-peh-reh/", trivia: "Makanan pokok ubi jalar yang ditanam secara organik di lereng-lereng curam Jayawijaya." },
        // Papua Barat Daya
        "sorong": { phonetic: "/soh-rohng/", trivia: "Kota pelabuhan kepala burung Papua, gerbang utama menuju kepulauan selam kelas dunia Raja Ampat." },
        "sasi": { phonetic: "/sah-see/", trivia: "Sistem konservasi laut adat timur. Menutup wilayah tangkapan sementara agar ekosistem memulihkan diri." },
        "sa senang ke sini": { phonetic: "/sah seh-nahng keh see-nee/", trivia: "Pernyataan sukacita wisatawan saat tiba di keindahan alam Raja Ampat." },
        "kam dorang": { phonetic: "/kahm doh-rahng/", trivia: "Singkatan dari 'kamu orang semua'. Berarti kata ganti 'kalian' secara jamak." },
        // Sasak
        "selamat semeton": { phonetic: "/seh-lah-mat seh-meh-ton/", trivia: "Kata 'semeton' berarti saudara. Sapaan hangat yang menautkan kerukunan suku Sasak Lombok." },
        "matur tampiasih": { phonetic: "/mah-toor tahm-pee-ah-seeh/", trivia: "Ucapan terima kasih Sasak Lombok halus, dipengaruhi kedekatan bahasa Bali dan Jawa." },
        "napi kabar?": { phonetic: "/nah-pee kah-bahr/", trivia: "Cara menanyakan kabar kerabat secara sopan dalam bahasa Sasak." },
        "pira aji ne?": { phonetic: "/pee-rah ah-jee neh/", trivia: "Pertanyaan harga barang saat membeli tenun ikat songket Sasak di desa Sade." },
        // Toraja
        "melo tongan": { phonetic: "/meh-loh toh-ngahn/", trivia: "Secara harfiah berarti 'baik sekali'. Ekspresi kepuasan tinggi atau persetujuan adat." },
        "kurre sumanga'": { phonetic: "/koor-reh soo-mah-nga/", trivia: "Ucapan terima kasih sakral Toraja, memohon berkah kehidupan atas kebaikan yang diterima." },
        "umba susi kabar?": { phonetic: "/oom-bah soo-see kah-bahr/", trivia: "Ungkapan khas Toraja menanyakan kesehatan fisik keluarga dekat." },
        "pira allinna?": { phonetic: "/pee-rah ahl-leen-nah/", trivia: "Pertanyaan menanyakan harga kerajinan pahat kayu tradisional di Rantepao." },
        // Melayu Riau
        "selamat pagi": { phonetic: "/seh-lah-mat pah-ghee/", trivia: "Sapaan pagi klasik Melayu Riau yang menjadi akar pembentukan bahasa nasional kita." },
        "terima kasih": { phonetic: "/teh-ree-mah kah-seeh/", trivia: "Apresiasi kesopanan tinggi yang diwarisi dari kejayaan sastra gurindam Melayu." },
        "apa khabar?": { phonetic: "/ah-pah khah-bahr/", trivia: "Pertanyaan kabar resmi yang diucapkan dengan intonasi meliuk melodi khas Riau." },
        "berapa harganya?": { phonetic: "/beh-rah-pah hahr-ghah-nyah/", trivia: "Pertanyaan harga standar saat membeli kain songket sulam emas Pekanbaru." },
        // Lampung
        "tabik pun": { phonetic: "/tah-beek poon/", trivia: "Sapaan adat kesopanan tertinggi di Lampung, wajib diucapkan di awal sambutan adat." },
        "terima kasih": { phonetic: "/teh-ree-mah kah-seeh/", trivia: "Ekspresi apresiasi masyarakat Lampung atas bantuan atau budi baik orang lain." },
        "api kabar?": { phonetic: "/ah-pee kah-bahr/", trivia: "Kata 'api' berarti 'apa'. Menanyakan kabar kawan sebaya dalam dialek Lampung." },
        "pira regane?": { phonetic: "/pee-rah reh-gah-neh/", trivia: "Digunakan saat membeli kain Tapis sulam benang emas khas Lampung." },
        // Ambon
        "selamat pagi": { phonetic: "/seh-lah-mat pah-ghee/", trivia: "Sapaan pagi Melayu Ambon pesisir, diucapkan dengan penuh keramahan khas Maluku." },
        "tarima kasih": { phonetic: "/tah-ree-mah kah-seeh/", trivia: "Adaptasi lokal ucapan terima kasih dengan logat vokal mendayu Ambon." },
        "apa kabar?": { phonetic: "/ah-pah kah-bahr/", trivia: "Pertanyaan kabar sehari-hari di antara sahabat karib di kota Ambon Manise." },
        "berapa dong?": { phonetic: "/beh-rah-pah dohng/", trivia: "Gaya tanya harga ringkas saat membeli kelapa muda atau rujak Natsepa." },
        // Gorontalo
        "mopotuwawu": { phonetic: "/moh-poh-too-wah-woo/", trivia: "Falsafah adat Gorontalo yang berarti 'saling mempersatukan' demi keharmonisan lelipu." },
        "tabea": { phonetic: "/tah-beh-ah/", trivia: "Sapaan permisi santun sembari membungkuk halus tanda menghormati tetua." },
        "wolo habari?": { phonetic: "/woh-loh hah-bah-ree/", trivia: "Cara santai suku Gorontalo menanyakan kabar sesama kawan dekat." },
        "bolo berapa regge?": { phonetic: "/boh-loh beh-rah-pah reg-gheh/", trivia: "Digunakan saat menawar kerajinan kopiah keranjang khas Gorontalo." }
    };

    // State Halaman & Gamifikasi
    let activePlace = null;
    let currentCardIndex = 0;
    let isFlipped = false;
    let currentMode = "flashcard"; // flashcard, quiz, writing, speaking, match

    // Leveling & XP Lokal
    let userLevel = 1;
    let userXp = 0;

    // Statistik Sesi Aktif
    let sessionXp = 0;
    let sessionCorrect = 0;
    let sessionAttempts = 0;
    let sessionStartTime = Date.now();
    let sessionTimerInterval = null;

    // Autoplay Flashcard State
    let autoplayInterval = null;
    let autoplayProgress = 0;
    const AUTOPLAY_DURATION = 3000; // 3 detik

    // Kuis Variatif State
    let quizQuestions = [];
    let quizCurrentIndex = 0;
    let quizScore = 0;

    // Ketik Jawaban (Writing) State
    let writingCurrentCard = null;

    // Latihan Bicara (Speaking) State
    let speakingCurrentCard = null;
    let speechRecognitionObj = null;
    let isSpeakingActive = false;

    // Match Game State
    let matchCards = [];
    let firstSelectedMatchCard = null;
    let secondSelectedMatchCard = null;
    let matchScore = 0;
    let matchTimeLeft = 30;
    let matchTimerInterval = null;
    let isMatchProcessing = false;

    // Misi Harian (Daily Quests)
    let dailyQuests = [
        { id: "explore_places", text: "Buka latihan di 3 daerah berbeda", progress: 0, target: 3, completed: false, xpReward: 50 },
        { id: "quiz_accuracy", text: "Selesaikan kuis dengan akurasi >= 80%", progress: 0, target: 1, completed: false, xpReward: 50 },
        { id: "match_win", text: "Jodohkan semua kata dalam Jodohkan Kata", progress: 0, target: 1, completed: false, xpReward: 50 }
    ];
    let uniqueExploredPlaces = new Set();

    // Kamus Filter & Search
    let vocabSearchQuery = "";
    let vocabActiveFilter = "all"; // all, starred, mastered

    // Element Cache
    const el = {
        // Hero & Header
        placeRegion: document.getElementById("placeRegion"),
        placeTitle: document.getElementById("placeTitle"),
        placeSummary: document.getElementById("placeSummary"),
        activePlaceRegion: document.getElementById("activePlaceRegion"),
        activePlaceTitle: document.getElementById("activePlaceTitle"),
        activePlaceMark: document.getElementById("activePlaceMark"),
        activePlaceSummary: document.getElementById("activePlaceSummary"),
        activePlaceFavorite: document.getElementById("activePlaceFavorite"),
        activePlaceMastered: document.getElementById("activePlaceMastered"),
        activePlaceQuizLink: document.getElementById("activePlaceQuizLink"),
        
        // Navigation links
        navDetailLink: document.getElementById("navDetailLink"),
        navQuizLink: document.getElementById("navQuizLink"),
        footerDetailLink: document.getElementById("footerDetailLink"),
        
        // Sidebar & Stats
        regionCount: document.getElementById("regionCount"),
        regionNavList: document.getElementById("regionNavList"),
        sessionStreak: document.getElementById("sessionStreak"),
        sessionAccuracy: document.getElementById("sessionAccuracy"),
        sessionXp: document.getElementById("sessionXp"),
        sessionTimer: document.getElementById("sessionTimer"),
        
        // HUD Leveling & Quests
        levelProgressCircle: document.getElementById("levelProgressCircle"),
        userLevelNum: document.getElementById("userLevelNum"),
        userLevelTitle: document.getElementById("userLevelTitle"),
        userCurrentXp: document.getElementById("userCurrentXp"),
        userNextLevelXp: document.getElementById("userNextLevelXp"),
        dailyQuestsList: document.getElementById("dailyQuestsList"),
        confettiCanvas: document.getElementById("confettiCanvas"),
        
        // Tabs & Panels
        tabButtons: document.querySelectorAll(".latihan-tab-btn"),
        workspacePanels: document.querySelectorAll(".latihan-workspace-panel"),

        // Mode 1: Flashcard Elements
        flashcardProgress: document.getElementById("flashcardProgress"),
        flashcardBar: document.getElementById("flashcardBar"),
        flashcardCard: document.getElementById("flashcardCard"),
        cardFrontCategory: document.getElementById("cardFrontCategory"),
        cardFrontText: document.getElementById("cardFrontText"),
        cardFrontPhonetic: document.getElementById("cardFrontPhonetic"),
        cardBackText: document.getElementById("cardBackText"),
        cardBackContext: document.getElementById("cardBackContext"),
        cardBackTrivia: document.getElementById("cardBackTrivia"),
        listenFront: document.getElementById("listenFront"),
        listenBack: document.getElementById("listenBack"),
        frontWave: document.getElementById("frontWave"),
        backWave: document.getElementById("backWave"),
        autoplayToggle: document.getElementById("autoplayToggle"),
        autoplayFill: document.getElementById("autoplayFill"),
        ttsSpeed: document.getElementById("ttsSpeed"),
        prevCard: document.getElementById("prevCard"),
        nextCard: document.getElementById("nextCard"),
        starCard: document.getElementById("starCard"),
        masterCard: document.getElementById("masterCard"),

        // Mode 2: Quiz Elements
        quizQuestionCount: document.getElementById("quizQuestionCount"),
        quizQuestionText: document.getElementById("quizQuestionText"),
        quizOptionsContainer: document.getElementById("quizOptionsContainer"),
        quizFeedback: document.getElementById("quizFeedback"),
        quizNextBtn: document.getElementById("quizNextBtn"),
        quizRestartBtn: document.getElementById("quizRestartBtn"),

        // Mode 3: Writing Elements
        writingCategory: document.getElementById("writingCategory"),
        writingPromptText: document.getElementById("writingPromptText"),
        writingInput: document.getElementById("writingInput"),
        writingSubmit: document.getElementById("writingSubmit"),
        writingFeedback: document.getElementById("writingFeedback"),
        writingHintBtn: document.getElementById("writingHintBtn"),
        writingNextBtn: document.getElementById("writingNextBtn"),

        // Mode 4: Speaking Elements
        speakingCategory: document.getElementById("speakingCategory"),
        speakingPromptText: document.getElementById("speakingPromptText"),
        speakingPhonetic: document.getElementById("speakingPhonetic"),
        speakingMicBtn: document.getElementById("speakingMicBtn"),
        micPulseRing: document.getElementById("micPulseRing"),
        speakingStatusText: document.getElementById("speakingStatusText"),
        speakingTranscriptBox: document.getElementById("speakingTranscriptBox"),
        speakingTranscriptText: document.getElementById("speakingTranscriptText"),
        speakingFeedback: document.getElementById("speakingFeedback"),
        speakingListenBtn: document.getElementById("speakingListenBtn"),
        speakingNextBtn: document.getElementById("speakingNextBtn"),

        // Mode 5: Match Elements
        matchTimerFill: document.getElementById("matchTimerFill"),
        matchTimerText: document.getElementById("matchTimerText"),
        matchScore: document.getElementById("matchScore"),
        matchGridBoard: document.getElementById("matchGridBoard"),
        matchGameOver: document.getElementById("matchGameOver"),
        matchFinalScore: document.getElementById("matchFinalScore"),
        matchHighScore: document.getElementById("matchHighScore"),
        matchGameMessage: document.getElementById("matchGameMessage"),
        matchRestartBtn: document.getElementById("matchRestartBtn"),

        // Kamus Elements
        vocabSearch: document.getElementById("vocabSearch"),
        vocabSearchClear: document.getElementById("vocabSearchClear"),
        vocabFilterButtons: document.querySelectorAll(".vocab-filter-btn"),
        vocabInteractiveList: document.getElementById("vocabInteractiveList")
    };

    // ==========================================================================
    // Engine Partikel Confetti Kustom (Pure HTML5 Canvas)
    // ==========================================================================
    let confettiActive = false;
    let confettiParticles = [];
    const confettiColors = ['#32d66b', '#4f8cff', '#ffd166', '#ff9f43', '#8b5cf6', '#ff4d6d'];

    function initConfettiCanvas() {
        const canvas = el.confettiCanvas;
        if (!canvas) return;
        
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
    }

    function spawnConfetti() {
        confettiParticles = [];
        const canvas = el.confettiCanvas;
        if (!canvas) return;

        for (let i = 0; i < 120; i++) {
            confettiParticles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height - canvas.height,
                size: Math.random() * 8 + 5,
                color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
                speed: Math.random() * 6 + 4,
                angle: Math.random() * Math.PI * 2,
                rotationSpeed: Math.random() * 0.1 - 0.05,
                oscillationSpeed: Math.random() * 0.03 + 0.01,
                oscillationWidth: Math.random() * 20 + 5,
                time: Math.random() * 100
            });
        }

        if (!confettiActive) {
            confettiActive = true;
            animateConfetti();
        }
    }

    function animateConfetti() {
        const canvas = el.confettiCanvas;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let activeCount = 0;

        confettiParticles.forEach(p => {
            p.y += p.speed;
            p.time += p.oscillationSpeed;
            p.x += Math.sin(p.time) * 0.5;
            p.angle += p.rotationSpeed;

            if (p.y < canvas.height) {
                activeCount++;
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.angle);
                ctx.fillStyle = p.color;
                
                // Menggambar kotak/pita confetti kecil
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                ctx.restore();
            }
        });

        if (activeCount > 0) {
            requestAnimationFrame(animateConfetti);
        } else {
            confettiActive = false;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    function triggerConfettiBurst() {
        spawnConfetti();
    }

    // ==========================================================================
    // Sistem Penyimpanan Progres Kosakata & Kemajuan Gamifikasi
    // ==========================================================================
    function getCardProgress() {
        const defaultProg = { starred: [], mastered: [] };
        return { ...defaultProg, ...core.storage.get("wonder_card_progress", defaultProg) };
    }

    function saveCardProgress(prog) {
        core.storage.set("wonder_card_progress", prog);
    }

    function isCardStarred(placeId, word) {
        const prog = getCardProgress();
        return prog.starred.includes(`${placeId}:${word}`);
    }

    function toggleCardStarred(placeId, word) {
        const prog = getCardProgress();
        const key = `${placeId}:${word}`;
        const idx = prog.starred.indexOf(key);
        if (idx > -1) {
            prog.starred.splice(idx, 1);
            addXp(-2);
            core.showToast("Bintang dihapus.");
            if (window.playSound) window.playSound('click');
        } else {
            prog.starred.push(key);
            addXp(3);
            core.showToast("Kata ditambahkan ke favorit ⭐");
            if (window.playSound) window.playSound('success');
        }
        saveCardProgress(prog);
        updateSidebarList();
        updateVocabList();
        updateFlashcardStarsAndMastery();
    }

    function isCardMastered(placeId, word) {
        const prog = getCardProgress();
        return prog.mastered.includes(`${placeId}:${word}`);
    }

    function toggleCardMastered(placeId, word) {
        const prog = getCardProgress();
        const key = `${placeId}:${word}`;
        const idx = prog.mastered.indexOf(key);
        if (idx > -1) {
            prog.mastered.splice(idx, 1);
            addXp(-5);
            core.showToast("Ditandai belum dikuasai.");
            if (window.playSound) window.playSound('click');
        } else {
            prog.mastered.push(key);
            addXp(10);
            core.showToast("Hebat! Kata dikuasai ✅");
            if (window.playSound) window.playSound('success');
        }
        saveCardProgress(prog);
        updateSidebarList();
        updateVocabList();
        updateFlashcardStarsAndMastery();
    }

    function getMasteredCardsCount(placeId) {
        const prog = getCardProgress();
        const place = data.getPlaceById(placeId);
        if (!place) return 0;
        let count = 0;
        place.cards.forEach(card => {
            if (prog.mastered.includes(`${placeId}:${card[0]}`)) count++;
        });
        return count;
    }

    // Leveling & XP HUD Engine
    function initLevelingHud() {
        userLevel = core.storage.get("bahasa_user_level", 1);
        userXp = core.storage.get("bahasa_user_xp", 0);
        updateLevelingHud();
    }

    function updateLevelingHud() {
        const nextLevelXp = userLevel * 120; // XP batas naik level dinamis
        el.userLevelNum.textContent = userLevel;
        el.userCurrentXp.textContent = userXp;
        el.userNextLevelXp.textContent = nextLevelXp;
        
        // Judul level kebudayaan
        const levelTitles = [
            "Scout Nusantara 🎒",
            "Pembelajar Budaya 🗺️",
            "Penjaga Bahasa 🛡️",
            "Pakar Nusantara 👑",
            "Begawan Kebudayaan 🌟"
        ];
        const titleIdx = Math.min(levelTitles.length - 1, Math.floor((userLevel - 1) / 2));
        el.userLevelTitle.textContent = levelTitles[titleIdx];

        // Svg circle filling percentage
        const pct = Math.min(100, Math.round((userXp / nextLevelXp) * 100));
        el.levelProgressCircle.style.strokeDasharray = `${pct}, 100`;
    }

    function addGlobalXp(amount) {
        userXp += amount;
        const nextLevelXp = userLevel * 120;
        
        if (userXp >= nextLevelXp) {
            userXp -= nextLevelXp;
            userLevel++;
            core.storage.set("bahasa_user_level", userLevel);
            
            // Perayaan Naik Level!
            triggerConfettiBurst();
            if (window.playSound) window.playSound('fanfare');
            setTimeout(triggerConfettiBurst, 500);
            core.showToast(`🎉 NAIK LEVEL! Anda sekarang level ${userLevel}!`);
        }
        
        core.storage.set("bahasa_user_xp", userXp);
        updateLevelingHud();
    }

    function addXp(amount) {
        sessionXp = Math.max(0, sessionXp + amount);
        el.sessionXp.textContent = `${sessionXp} XP`;
        
        if (amount > 0) {
            addGlobalXp(amount);
        }
    }

    // Daily Quests Tracker
    function initDailyQuests() {
        // Cek jika quest sudah disimpan hari ini
        const savedQuests = core.storage.get("bahasa_daily_quests", null);
        const savedDate = core.storage.get("bahasa_quests_date", "");
        const today = new Date().toDateString();

        if (savedQuests && savedDate === today) {
            dailyQuests = savedQuests;
        } else {
            // Reset quests progress
            dailyQuests.forEach(q => {
                q.progress = 0;
                q.completed = false;
            });
            core.storage.set("bahasa_daily_quests", dailyQuests);
            core.storage.set("bahasa_quests_date", today);
        }
        
        // Tandai tempat pertama yang aktif
        if (activePlace) {
            uniqueExploredPlaces.add(activePlace.id);
        }
        
        renderDailyQuests();
    }

    function updateQuestProgress(questId, amount = 1) {
        let quest = dailyQuests.find(q => q.id === questId);
        if (!quest || quest.completed) return;

        quest.progress = Math.min(quest.target, quest.progress + amount);
        
        if (quest.progress >= quest.target && !quest.completed) {
            quest.completed = true;
            addXp(quest.xpReward);
            triggerConfettiBurst();
            core.showToast(`🎯 MISI SELESAI: ${quest.text} (+${quest.xpReward} XP!)`);
        }

        core.storage.set("bahasa_daily_quests", dailyQuests);
        renderDailyQuests();
    }

    function renderDailyQuests() {
        el.dailyQuestsList.innerHTML = dailyQuests.map(q => {
            return `
                <div class="quest-item ${q.completed ? "completed" : ""}">
                    <div class="quest-checkbox">${q.completed ? `<i class="fa-solid fa-check"></i>` : ``}</div>
                    <div class="quest-desc">
                        ${q.text} 
                        <span style="font-weight: 900; color:var(--blue)">(${q.progress}/${q.target})</span>
                    </div>
                </div>
            `;
        }).join("");
    }

    function recordQuizAttempt(isCorrect) {
        sessionAttempts++;
        if (isCorrect) sessionCorrect++;
        const pct = sessionAttempts > 0 ? Math.round((sessionCorrect / sessionAttempts) * 100) : 0;
        el.sessionAccuracy.textContent = `${pct}%`;
    }

    function initSessionTimer() {
        if (sessionTimerInterval) clearInterval(sessionTimerInterval);
        sessionTimerInterval = setInterval(() => {
            const diffSec = Math.floor((Date.now() - sessionStartTime) / 1000);
            const mins = String(Math.floor(diffSec / 60)).padStart(2, '0');
            const secs = String(diffSec % 60).padStart(2, '0');
            el.sessionTimer.textContent = `${mins}:${secs}`;
        }, 1000);
    }

    function syncGlobalStreak() {
        const progress = core.getProgress();
        el.sessionStreak.textContent = progress.streak || 0;
    }

    // ==========================================================================
    // Navigasi & Pemilihan Daerah Dinamis
    // ==========================================================================
    function initSidebar() {
        el.regionCount.textContent = `${data.places.length} daerah`;
        updateSidebarList();
    }

    function updateSidebarList() {
        const progress = core.getProgress();
        const masteredPlaces = new Set(progress.mastered || []);
        const favoritePlaces = new Set(progress.favorites || []);
        
        el.regionNavList.innerHTML = data.places.map(place => {
            const totalCards = place.cards.length;
            const masteredCount = getMasteredCardsCount(place.id);
            const pct = Math.round((masteredCount / Math.max(totalCards, 1)) * 100);
            const isActive = activePlace && activePlace.id === place.id;
            
            // Indikator status daerah
            let statusBadgeHtml = "";
            if (masteredPlaces.has(place.id)) {
                statusBadgeHtml += `<span title="Daerah dikuasai" style="color:var(--green)"><i class="fa-solid fa-circle-check"></i></span>`;
            } else if (favoritePlaces.has(place.id)) {
                statusBadgeHtml += `<span title="Daerah favorit" style="color:#ff4d6d"><i class="fa-solid fa-heart"></i></span>`;
            }
            
            return `
                <div class="region-nav-item ${isActive ? "active" : ""}" data-id="${place.id}">
                    <div class="region-badge">${place.mark}</div>
                    <div class="region-info">
                        <div class="region-name-row">
                            <span>${place.label}</span>
                            ${statusBadgeHtml}
                        </div>
                        <div class="region-meta">
                            <span>${masteredCount}/${totalCards} Kata</span>
                            <span>•</span>
                            <span>${pct}%</span>
                        </div>
                        <div class="progress-mini-bar">
                            <div style="width: ${pct}%"></div>
                        </div>
                    </div>
                </div>
            `;
        }).join("");

        // Event listener klik sidebar
        el.regionNavList.querySelectorAll(".region-nav-item").forEach(item => {
            item.addEventListener("click", () => {
                const placeId = item.dataset.id;
                selectPlace(placeId);
            });
        });
    }

    function selectPlace(placeId) {
        core.markExplored(placeId);
        activePlace = data.getPlaceById(placeId);
        
        // Peringatan: Ubah URL parameter secara dinamis tanpa muat ulang
        const url = new URL(window.location.href);
        url.searchParams.set("id", placeId);
        window.history.pushState({}, "", url.toString());

        // Update Quest Penjelajah
        uniqueExploredPlaces.add(placeId);
        updateQuestProgress("explore_places", uniqueExploredPlaces.size);

        renderActivePlace();
        updateSidebarList();
    }

    function renderActivePlace() {
        if (!activePlace) return;

        // Update teks hero
        el.placeTitle.textContent = activePlace.label;
        el.placeRegion.textContent = activePlace.region;
        el.placeSummary.textContent = activePlace.summary;

        // Update teks dashboard
        el.activePlaceTitle.textContent = activePlace.label;
        el.activePlaceRegion.textContent = activePlace.region;
        el.activePlaceMark.textContent = activePlace.mark;
        el.activePlaceSummary.textContent = activePlace.summary;

        // Update tombol aksi dashboard
        updateDashboardButtons();

        // Update navbar/footer links
        const detailUrl = core.placeUrl("daerah-detail.html", activePlace.id);
        const quizUrl = core.placeUrl("quiz-budaya.html", activePlace.id);
        el.navDetailLink.href = detailUrl;
        el.navQuizLink.href = quizUrl;
        el.footerDetailLink.href = detailUrl;
        el.activePlaceQuizLink.href = quizUrl;

        // Reset workspace mode aktif
        currentCardIndex = 0;
        resetFlashcards();
        resetQuizMode();
        resetWritingMode();
        resetSpeakingMode();
        resetMatchGame();
        
        // Refresh Kamus
        updateVocabList();
    }

    function updateDashboardButtons() {
        const progress = core.getProgress();
        const isFav = (progress.favorites || []).includes(activePlace.id);
        const isMast = (progress.mastered || []).includes(activePlace.id);

        el.activePlaceFavorite.innerHTML = isFav ? `<i class="fa-solid fa-heart"></i> Terfavorit` : `<i class="fa-regular fa-heart"></i> Favorit`;
        el.activePlaceFavorite.classList.toggle("active", isFav);
        
        el.activePlaceMastered.innerHTML = isMast ? `<i class="fa-solid fa-circle-check"></i> Dikuasai` : `<i class="fa-regular fa-circle-check"></i> Dikuasai`;
        el.activePlaceMastered.classList.toggle("active", isMast);
    }

    // Event listener untuk tombol dashboard
    el.activePlaceFavorite.addEventListener("click", () => {
        core.toggleProgressList("favorites", activePlace.id);
        updateDashboardButtons();
        updateSidebarList();
        core.showToast("Status favorit daerah diperbarui.");
    });

    el.activePlaceMastered.addEventListener("click", () => {
        core.toggleProgressList("mastered", activePlace.id);
        updateDashboardButtons();
        updateSidebarList();
        core.showToast("Status dikuasai daerah diperbarui.");
    });

    // ==========================================================================
    // Sistem Suara & Text to Speech (TTS)
    // ==========================================================================
    function speakText(text, waveElement) {
        if (!("speechSynthesis" in window)) {
            core.showToast("Browser Anda tidak mendukung Text-to-Speech.");
            return;
        }

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "id-ID";
        
        // Atur kecepatan
        const speed = parseFloat(el.ttsSpeed.value) || 1.0;
        utterance.rate = speed;

        // Visual Wave Animation
        if (waveElement) {
            waveElement.classList.add("active");
            utterance.onend = () => waveElement.classList.remove("active");
            utterance.onerror = () => waveElement.classList.remove("active");
        }

        window.speechSynthesis.speak(utterance);
    }

    // Helper untuk mengambil metadata kosakata (Fonetik & Trivia)
    function getVocabExtra(word) {
        const cleanWord = word.trim().toLowerCase();
        return VOCAB_METADATA[cleanWord] || { 
            phonetic: "/lafal/", 
            trivia: "Kosakata bahasa daerah khas yang digunakan secara lokal." 
        };
    }

    // ==========================================================================
    // Mode Latihan 1: Flashcard Premium dengan Hover Glow
    // ==========================================================================
    function resetFlashcards() {
        currentCardIndex = 0;
        isFlipped = false;
        el.flashcardCard.classList.remove("flipped");
        stopAutoplay();
        renderFlashcard();
    }

    function renderFlashcard() {
        if (!activePlace || !activePlace.cards.length) return;
        
        const card = activePlace.cards[currentCardIndex % activePlace.cards.length];
        const extra = getVocabExtra(card[0]);
        
        // Set Front
        el.cardFrontCategory.textContent = card[2] || "Kosakata";
        el.cardFrontText.textContent = card[0];
        el.cardFrontPhonetic.textContent = extra.phonetic;
        
        // Set Back
        el.cardBackText.textContent = card[1];
        el.cardBackContext.textContent = card[2] || "Tidak ada penjelasan.";
        el.cardBackTrivia.textContent = extra.trivia;

        // Update Progress Deck
        const activeIndex = (currentCardIndex % activePlace.cards.length) + 1;
        el.flashcardProgress.textContent = `Kartu ${activeIndex}/${activePlace.cards.length}`;
        el.flashcardBar.style.width = `${Math.round((activeIndex / activePlace.cards.length) * 100)}%`;

        // Update bintang & kuasai pada kontrol
        updateFlashcardStarsAndMastery();
    }

    function updateFlashcardStarsAndMastery() {
        if (!activePlace || !activePlace.cards.length) return;
        const card = activePlace.cards[currentCardIndex % activePlace.cards.length];
        const word = card[0];

        const isStarred = isCardStarred(activePlace.id, word);
        const isMastered = isCardMastered(activePlace.id, word);

        el.starCard.innerHTML = isStarred ? `<i class="fa-solid fa-star"></i> Difavoritkan` : `<i class="fa-regular fa-star"></i> Favorit Kata`;
        el.starCard.classList.toggle("active", isStarred);

        el.masterCard.innerHTML = isMastered ? `<i class="fa-solid fa-circle-check"></i> Dikuasai` : `<i class="fa-regular fa-circle-check"></i> Dikuasai`;
        el.masterCard.classList.toggle("active", isMastered);
    }

    // Efek Hover Glow mousemove listener & 3D Tilt
    document.querySelectorAll(".flashcard-face").forEach(face => {
        face.addEventListener('mousemove', (e) => {
            const rect = face.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            face.style.setProperty('--mouse-x', `${x}px`);
            face.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    if (el.flashcardCard) {
        el.flashcardCard.addEventListener("mousemove", (e) => {
            const rect = el.flashcardCard.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((centerY - y) / centerY) * 12; // Max 12 deg tilt
            const rotateY = ((x - centerX) / centerX) * 12;
            
            // If flipped, rotate back face 180 degrees + tilt
            const tiltStr = `rotateX(${rotateX}deg) rotateY(${isFlipped ? 180 - rotateY : rotateY}deg)`;
            el.flashcardCard.style.transform = tiltStr;
        });

        el.flashcardCard.addEventListener("mouseleave", () => {
            el.flashcardCard.style.transform = isFlipped ? "rotateY(180deg)" : "rotateX(0) rotateY(0)";
        });
    }

    // Balik Flashcard
    el.flashcardCard.addEventListener("click", (e) => {
        // Jangan balik kartu jika menekan tombol audio
        if (e.target.closest(".audio-visual-trigger")) return;
        
        isFlipped = !isFlipped;
        if (window.playSound) window.playSound('click');
        el.flashcardCard.classList.toggle("flipped", isFlipped);
        el.flashcardCard.style.transform = isFlipped ? "rotateY(180deg)" : "rotateX(0) rotateY(0)";
    });

    // Navigasi Flashcard
    el.prevCard.addEventListener("click", () => {
        if (window.playSound) window.playSound('click');
        if (currentCardIndex > 0) {
            currentCardIndex--;
        } else {
            currentCardIndex = activePlace.cards.length - 1;
        }
        isFlipped = false;
        el.flashcardCard.classList.remove("flipped");
        el.flashcardCard.style.transform = "rotateX(0) rotateY(0)";
        renderFlashcard();
    });

    el.nextCard.addEventListener("click", () => {
        if (window.playSound) window.playSound('click');
        const progress = core.getProgress();
        progress.reviewed += 1;
        core.saveProgress(progress);
        
        currentCardIndex++;
        isFlipped = false;
        el.flashcardCard.classList.remove("flipped");
        el.flashcardCard.style.transform = "rotateX(0) rotateY(0)";
        renderFlashcard();
    });

    // Favorit / Mastery Kata Aktif
    el.starCard.addEventListener("click", () => {
        if (window.playSound) window.playSound('click');
        const card = activePlace.cards[currentCardIndex % activePlace.cards.length];
        toggleCardStarred(activePlace.id, card[0]);
    });

    el.masterCard.addEventListener("click", () => {
        if (window.playSound) window.playSound('click');
        const card = activePlace.cards[currentCardIndex % activePlace.cards.length];
        toggleCardMastered(activePlace.id, card[0]);
    });

    // Putar Suara Flashcard
    el.listenFront.addEventListener("click", () => {
        if (window.playSound) window.playSound('click');
        const card = activePlace.cards[currentCardIndex % activePlace.cards.length];
        speakText(card[0], el.frontWave);
    });

    el.listenBack.addEventListener("click", () => {
        if (window.playSound) window.playSound('click');
        const card = activePlace.cards[currentCardIndex % activePlace.cards.length];
        speakText(`Artinya: ${card[1]}`, el.backWave);
    });

    // Autoplay Logika
    el.autoplayToggle.addEventListener("change", (e) => {
        if (window.playSound) window.playSound('click');
        if (e.target.checked) {
            startAutoplay();
        } else {
            stopAutoplay();
        }
    });

    function startAutoplay() {
        stopAutoplay();
        autoplayProgress = 0;
        el.autoplayFill.style.width = "0%";
        
        let startTimestamp = Date.now();
        autoplayInterval = setInterval(() => {
            const elapsed = Date.now() - startTimestamp;
            autoplayProgress = Math.min(100, (elapsed / AUTOPLAY_DURATION) * 100);
            el.autoplayFill.style.width = `${autoplayProgress}%`;

            if (elapsed >= AUTOPLAY_DURATION) {
                // Selesai durasi, putuskan aksi
                if (!isFlipped) {
                    // Balik ke belakang
                    isFlipped = true;
                    el.flashcardCard.classList.add("flipped");
                    const card = activePlace.cards[currentCardIndex % activePlace.cards.length];
                    speakText(card[1], el.backWave);
                    startTimestamp = Date.now(); // Reset timer untuk flip
                } else {
                    // Pindah kata berikutnya
                    currentCardIndex = (currentCardIndex + 1) % activePlace.cards.length;
                    isFlipped = false;
                    el.flashcardCard.classList.remove("flipped");
                    renderFlashcard();
                    
                    const card = activePlace.cards[currentCardIndex % activePlace.cards.length];
                    speakText(card[0], el.frontWave);
                    
                    startTimestamp = Date.now(); // Reset timer
                }
            }
        }, 100);
    }

    function stopAutoplay() {
        if (autoplayInterval) {
            clearInterval(autoplayInterval);
            autoplayInterval = null;
        }
        el.autoplayFill.style.width = "0%";
        el.autoplayToggle.checked = false;
    }

    // ==========================================================================
    // Mode Latihan 2: Quiz Pilihan Ganda (Vocab Quiz Variatif & Audio Quiz)
    // ==========================================================================
    function resetQuizMode() {
        quizCurrentIndex = 0;
        quizScore = 0;
        el.quizNextBtn.style.display = "none";
        el.quizRestartBtn.style.display = "none";
        generateQuizQuestions();
        renderQuizQuestion();
    }

    function generateQuizQuestions() {
        if (!activePlace || !activePlace.cards.length) return;
        
        // Acak kartu untuk dijadikan soal kuis
        const cards = activePlace.cards;
        const shuffled = [...cards].sort(() => Math.random() - 0.5);
        quizQuestions = shuffled.slice(0, 5); // Maksimal 5 soal
        
        // Berikan tipe kuis secara dinamis pada tiap soal
        // Tipe: 0 (Daerah ke Indo), 1 (Indo ke Daerah), 2 (Audio kuis)
        quizQuestions = quizQuestions.map(q => {
            const quizType = Math.floor(Math.random() * 3);
            return { card: q, type: quizType };
        });
        
        quizCurrentIndex = 0;
    }

    function renderQuizQuestion() {
        if (!quizQuestions.length) {
            el.quizQuestionText.textContent = "Kosakata tidak memadai untuk membuat kuis.";
            el.quizOptionsContainer.innerHTML = "";
            return;
        }

        const currentQuestion = quizQuestions[quizCurrentIndex];
        const card = currentQuestion.card;
        const qType = currentQuestion.type;

        el.quizQuestionCount.textContent = `Soal ${quizCurrentIndex + 1}/${quizQuestions.length}`;
        
        let questionText = "";
        let correctText = "";
        let distractors = [];

        // Buat distractor acak dari global bank
        let allWords = [];
        let allTranslations = [];
        data.places.forEach(p => {
            p.cards.forEach(c => {
                if (c[0] !== card[0]) allWords.push(c[0]);
                if (c[1] !== card[1]) allTranslations.push(c[1]);
            });
        });
        
        allWords = Array.from(new Set(allWords)).sort(() => Math.random() - 0.5);
        allTranslations = Array.from(new Set(allTranslations)).sort(() => Math.random() - 0.5);

        if (qType === 0) {
            // Tipe 0: Daerah -> Indonesia
            questionText = `Apa arti dari kosakata daerah "${card[0]}"?`;
            correctText = card[1];
            distractors = allTranslations.slice(0, 3);
        } else if (qType === 1) {
            // Tipe 1: Indonesia -> Daerah
            questionText = `Bagaimana menerjemahkan kata "${card[1]}" dalam bahasa daerah?`;
            correctText = card[0];
            distractors = allWords.slice(0, 3);
        } else {
            // Tipe 2: Audio Quiz (Listen and Match)
            questionText = `<i class="fa-solid fa-volume-high text-blue"></i> Dengarkan suaranya dan pilih teks kosakata daerah yang tepat!`;
            correctText = card[0];
            distractors = allWords.slice(0, 3);
            
            // Putar audio secara otomatis untuk tipe audio kuis
            setTimeout(() => {
                speakText(card[0]);
            }, 500);
        }

        el.quizQuestionText.textContent = questionText;

        // Satukan opsi dan acak
        const options = [correctText, ...distractors].sort(() => Math.random() - 0.5);

        el.quizFeedback.textContent = qType === 2 ? "Klik opsi yang cocok dengan pengucapan audio." : "Pilih jawaban yang paling tepat!";
        el.quizFeedback.className = "quiz-feedback-box";
        
        const alphabet = ["A", "B", "C", "D"];
        el.quizOptionsContainer.innerHTML = options.map((opt, idx) => {
            const letter = alphabet[idx] || "";
            const suffix = (qType === 2) ? ` <i class="fa-solid fa-volume-high"></i>` : ``;
            return `
                <button class="answer-btn" data-val="${opt}">
                    <span class="option-badge">${letter}</span>
                    <span class="option-text">${opt}${suffix}</span>
                </button>
            `;
        }).join("");

        // Beralih event listener
        el.quizOptionsContainer.querySelectorAll(".answer-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                // Mainkan suara jika di klik pada audio quiz
                if (qType === 2) {
                    speakText(btn.dataset.val);
                }
                handleQuizAnswer(btn, correctText);
            });
        });
    }

    function handleQuizAnswer(selectedBtn, correctText) {
        // Kunci semua opsi kuis
        el.quizOptionsContainer.querySelectorAll(".answer-btn").forEach(btn => {
            btn.disabled = true;
            if (btn.dataset.val === correctText) {
                btn.classList.add("correct");
            }
        });

        const isCorrect = selectedBtn.dataset.val === correctText;
        recordQuizAttempt(isCorrect);

        if (isCorrect) {
            selectedBtn.classList.add("correct");
            el.quizFeedback.textContent = "Hebat! Jawaban Anda benar! 🎉";
            el.quizFeedback.className = "quiz-feedback-box correct";
            quizScore++;
            addXp(5);
            if (window.playSound) window.playSound('success');
        } else {
            selectedBtn.classList.add("wrong");
            el.quizFeedback.textContent = `Jawaban salah. Arti yang tepat adalah: "${correctText}"`;
            el.quizFeedback.className = "quiz-feedback-box wrong";
            if (window.playSound) window.playSound('laser');
        }

        // Tampilkan tombol navigasi selanjutnya
        if (quizCurrentIndex < quizQuestions.length - 1) {
            el.quizNextBtn.style.display = "block";
        } else {
            // Selesai semua soal
            el.quizFeedback.textContent = `Kuis selesai! Skor Anda: ${quizScore}/${quizQuestions.length}. Meraih ${quizScore * 5} XP!`;
            el.quizRestartBtn.style.display = "block";
            addXp(quizScore * 2); // Bonus ekstra XP menyelesaikan kuis

            // Evaluasi Daily Quest Akurasi Kuis >= 80% (4/5 benar)
            if (quizScore >= 4) {
                updateQuestProgress("quiz_accuracy", 1);
            }
        }
    }

    el.quizNextBtn.addEventListener("click", () => {
        quizCurrentIndex++;
        el.quizNextBtn.style.display = "none";
        renderQuizQuestion();
    });

    el.quizRestartBtn.addEventListener("click", () => {
        resetQuizMode();
    });

    // ==========================================================================
    // Mode Latihan 3: Writing (Ketik Jawaban)
    // ==========================================================================
    function resetWritingMode() {
        el.writingNextBtn.style.display = "none";
        el.writingInput.value = "";
        el.writingInput.disabled = false;
        el.writingSubmit.disabled = false;
        el.writingFeedback.style.display = "none";
        loadWritingCard();
    }

    function loadWritingCard() {
        if (!activePlace || !activePlace.cards.length) return;
        
        // Pilih kartu secara acak
        const cards = activePlace.cards;
        writingCurrentCard = cards[Math.floor(Math.random() * cards.length)];
        
        el.writingCategory.textContent = writingCurrentCard[2] || "Kosa Kata";
        el.writingPromptText.textContent = writingCurrentCard[0];
        el.writingInput.value = "";
        el.writingInput.disabled = false;
        el.writingSubmit.disabled = false;
        el.writingFeedback.style.display = "none";
        el.writingNextBtn.style.display = "none";
    }

    function checkWritingAnswer() {
        if (!writingCurrentCard) return;

        const rawUserAnswer = el.writingInput.value.trim().toLowerCase();
        const correctAnswer = writingCurrentCard[1].trim().toLowerCase();

        // Validasi string (abaikan spasi ganda, tanda baca ringan)
        const sanitize = (str) => str.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").replace(/\s+/g, " ");
        const isMatch = sanitize(rawUserAnswer) === sanitize(correctAnswer);

        el.writingInput.disabled = true;
        el.writingSubmit.disabled = true;
        recordQuizAttempt(isMatch);

        if (isMatch) {
            el.writingFeedback.textContent = "Jawaban Tepat Sekali! +8 XP 🔥";
            el.writingFeedback.className = "writing-feedback correct";
            addXp(8);
            if (window.playSound) window.playSound('success');
        } else {
            el.writingFeedback.textContent = `Kurang tepat. Jawaban benar: "${writingCurrentCard[1]}"`;
            el.writingFeedback.className = "writing-feedback wrong";
            if (window.playSound) window.playSound('laser');
        }

        el.writingFeedback.style.display = "block";
        el.writingNextBtn.style.display = "block";
    }

    el.writingSubmit.addEventListener("click", checkWritingAnswer);
    el.writingInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !el.writingSubmit.disabled) {
            checkWritingAnswer();
        }
    });

    el.writingHintBtn.addEventListener("click", () => {
        if (window.playSound) window.playSound('click');
        if (!writingCurrentCard) return;
        const answer = writingCurrentCard[1];
        const hintLetter = answer.charAt(0);
        core.showToast(`Petunjuk: Berawalan huruf "${hintLetter.toUpperCase()}" (Total ${answer.length} karakter)`);
    });

    el.writingNextBtn.addEventListener("click", () => {
        if (window.playSound) window.playSound('click');
        loadWritingCard();
    });

    // ==========================================================================
    // Mode Latihan 4: Latihan Bicara (Speaking Practice - Web Speech API)
    // ==========================================================================
    function resetSpeakingMode() {
        el.speakingNextBtn.style.display = "none";
        el.speakingTranscriptBox.style.display = "none";
        el.speakingFeedback.textContent = "Klik mikrofon dan sebutkan lafal daerah di atas.";
        el.speakingFeedback.className = "speaking-feedback";
        el.speakingStatusText.textContent = "Klik ikon mikrofon untuk berbicara";
        el.speakingMicBtn.classList.remove("listening");
        isSpeakingActive = false;
        
        initSpeechRecognition();
        loadSpeakingCard();
    }

    function initSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            speechRecognitionObj = null;
            return;
        }

        speechRecognitionObj = new SpeechRecognition();
        speechRecognitionObj.continuous = false;
        speechRecognitionObj.lang = "id-ID"; // Mendukung sebagian besar dialek lokal dengan transliterasi alfabet Indonesia
        speechRecognitionObj.interimResults = false;
        speechRecognitionObj.maxAlternatives = 1;

        speechRecognitionObj.onstart = () => {
            isSpeakingActive = true;
            el.speakingMicBtn.classList.add("listening");
            el.speakingStatusText.textContent = "Mendengarkan... Silakan Bicara";
            el.speakingFeedback.textContent = "Ucapkan kata di atas sekarang!";
            el.speakingFeedback.className = "speaking-feedback listening";
            drawSpeakingWave();
        };

        speechRecognitionObj.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            handleSpeechResult(transcript);
        };

        speechRecognitionObj.onerror = (event) => {
            console.error("Speech Recognition Error:", event.error);
            el.speakingFeedback.textContent = "Tidak dapat mendengar jelas. Coba ulangi kembali.";
            el.speakingFeedback.className = "speaking-feedback wrong";
            if (window.playSound) window.playSound('laser');
            stopSpeechRecording();
        };

        speechRecognitionObj.onend = () => {
            stopSpeechRecording();
        };
    }

    function loadSpeakingCard() {
        if (!activePlace || !activePlace.cards.length) return;
        
        const cards = activePlace.cards;
        speakingCurrentCard = cards[Math.floor(Math.random() * cards.length)];
        const extra = getVocabExtra(speakingCurrentCard[0]);

        el.speakingCategory.textContent = speakingCurrentCard[2] || "Kosa kata";
        el.speakingPromptText.textContent = speakingCurrentCard[0];
        el.speakingPhonetic.textContent = extra.phonetic;
    }

    el.speakingMicBtn.addEventListener("click", () => {
        if (window.playSound) window.playSound('click');
        if (!speechRecognitionObj) {
            core.showToast("Maaf, penangkap ucapan suara tidak didukung di browser Anda saat ini. Gunakan Chrome/Edge.");
            return;
        }

        if (isSpeakingActive) {
            speechRecognitionObj.stop();
        } else {
            try {
                speechRecognitionObj.start();
            } catch (err) {
                console.error("Start speech failed:", err);
            }
        }
    });

    function stopSpeechRecording() {
        isSpeakingActive = false;
        el.speakingMicBtn.classList.remove("listening");
        el.speakingStatusText.textContent = "Klik ikon mikrofon untuk berbicara";
        const canvas = document.getElementById("speakingWaveCanvas");
        if (canvas) canvas.style.display = "none";
        if (speakingWaveAnimationId) cancelAnimationFrame(speakingWaveAnimationId);
    }

    function handleSpeechResult(rawTranscript) {
        const transcript = rawTranscript.trim().toLowerCase();
        const target = speakingCurrentCard[0].trim().toLowerCase();

        el.speakingTranscriptText.textContent = `"${rawTranscript}"`;
        el.speakingTranscriptBox.style.display = "flex";

        // Normalisasi kata
        const clean = (str) => str.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").replace(/\s+/g, "").toLowerCase();
        const cleanTgt = clean(target);
        const cleanTrs = clean(transcript);

        // Pencocokan substring cerdas
        const isMatch = cleanTrs.includes(cleanTgt) || cleanTgt.includes(cleanTrs) || (cleanTrs.slice(0, 4) === cleanTgt.slice(0, 4));

        if (isMatch) {
            el.speakingFeedback.textContent = "Pelafalan Sempurna! Jawaban Tepat (+15 XP!) 🎉";
            el.speakingFeedback.className = "speaking-feedback success";
            addXp(15);
            triggerConfettiBurst();
            if (window.playSound) window.playSound('success');
            el.speakingNextBtn.style.display = "block";
        } else {
            el.speakingFeedback.textContent = `Pelafalan kurang mirip. Silakan dicoba lagi!`;
            el.speakingFeedback.className = "speaking-feedback wrong";
            if (window.playSound) window.playSound('laser');
        }
    }

    el.speakingListenBtn.addEventListener("click", () => {
        if (speakingCurrentCard) {
            speakText(speakingCurrentCard[0]);
        }
    });

    el.speakingNextBtn.addEventListener("click", () => {
        resetSpeakingMode();
    });

    // ==========================================================================
    // Mode Latihan 5: Match Game (Jodohkan Kata)
    // ==========================================================================
    function resetMatchGame() {
        if (matchTimerInterval) clearInterval(matchTimerInterval);
        el.matchGameOver.style.display = "none";
        el.matchGridBoard.style.display = "grid";
        firstSelectedMatchCard = null;
        secondSelectedMatchCard = null;
        matchScore = 0;
        matchTimeLeft = 30;
        isMatchProcessing = false;
        el.matchScore.textContent = matchScore;
        el.matchTimerText.textContent = `${matchTimeLeft}s`;
        el.matchTimerFill.style.width = "100%";
        el.matchTimerFill.style.backgroundColor = "var(--orange)";

        generateMatchBoard();
    }

    function generateMatchBoard() {
        if (!activePlace || !activePlace.cards.length) return;

        // Ambil kosakata daerah aktif
        const cards = activePlace.cards;
        // Pilih 4 pasang kartu teratas (atau acak 4 pasang jika ada banyak kartu)
        const selected = [...cards].sort(() => Math.random() - 0.5).slice(0, 4);

        // Buat 8 kartu item
        let items = [];
        selected.forEach((card, index) => {
            items.push({ id: index, type: "local", text: card[0] });
            items.push({ id: index, type: "translation", text: card[1] });
        });

        // Acak grid
        items.sort(() => Math.random() - 0.5);

        // Render ke board
        el.matchGridBoard.innerHTML = items.map(item => {
            return `
                <div class="match-item-card" data-match-id="${item.id}" data-type="${item.type}">
                    ${item.text}
                </div>
            `;
        }).join("");

        // Event listener klik
        el.matchGridBoard.querySelectorAll(".match-item-card").forEach(card => {
            card.addEventListener("click", () => handleMatchClick(card));
        });

        // Mulai Timer Mundur
        startMatchTimer();
    }

    function handleMatchClick(card) {
        if (isMatchProcessing || card.classList.contains("matched") || card.classList.contains("selected")) return;
        if (window.playSound) window.playSound('click');
        card.classList.add("selected");

        if (!firstSelectedMatchCard) {
            firstSelectedMatchCard = card;
        } else {
            secondSelectedMatchCard = card;
            isMatchProcessing = true;
            checkMatch();
        }
    }

    function checkMatch() {
        const id1 = firstSelectedMatchCard.dataset.matchId;
        const type1 = firstSelectedMatchCard.dataset.type;
        const id2 = secondSelectedMatchCard.dataset.matchId;
        const type2 = secondSelectedMatchCard.dataset.type;

        // Cocok jika ID sama, tapi tipenya berbeda (local vs translation)
        const isMatch = (id1 === id2) && (type1 !== type2);

        if (isMatch) {
            // Animasi Benar
            firstSelectedMatchCard.classList.add("correct-flash");
            secondSelectedMatchCard.classList.add("correct-flash");
            if (window.playSound) window.playSound('success');

            setTimeout(() => {
                firstSelectedMatchCard.classList.add("matched");
                secondSelectedMatchCard.classList.add("matched");
                
                // Bersihkan seleksi
                firstSelectedMatchCard.classList.remove("selected", "correct-flash");
                secondSelectedMatchCard.classList.remove("selected", "correct-flash");
                firstSelectedMatchCard = null;
                secondSelectedMatchCard = null;
                
                // Tambah skor & XP
                matchScore += 10;
                el.matchScore.textContent = matchScore;
                addXp(10);
                
                isMatchProcessing = false;

                // Cek Kemenangan
                checkMatchWin();
            }, 300);
        } else {
            // Animasi Salah
            firstSelectedMatchCard.classList.add("wrong-flash");
            secondSelectedMatchCard.classList.add("wrong-flash");
            if (window.playSound) window.playSound('laser');

            setTimeout(() => {
                firstSelectedMatchCard.classList.remove("selected", "wrong-flash");
                secondSelectedMatchCard.classList.remove("selected", "wrong-flash");
                firstSelectedMatchCard = null;
                secondSelectedMatchCard = null;
                isMatchProcessing = false;
            }, 500);
        }
    }

    function checkMatchWin() {
        const remaining = el.matchGridBoard.querySelectorAll(".match-item-card:not(.matched)").length;
        if (remaining === 0) {
            // Semua tercocokkan, Menang!
            endMatchGame(true);
        }
    }

    function startMatchTimer() {
        if (matchTimerInterval) clearInterval(matchTimerInterval);
        
        matchTimerInterval = setInterval(() => {
            matchTimeLeft--;
            el.matchTimerText.textContent = `${matchTimeLeft}s`;
            
            const pct = (matchTimeLeft / 30) * 100;
            el.matchTimerFill.style.width = `${pct}%`;

            if (matchTimeLeft <= 10) {
                el.matchTimerFill.style.backgroundColor = "red";
            }

            if (matchTimeLeft <= 0) {
                endMatchGame(false);
            }
        }, 1000);
    }

    // End Match Game
    function endMatchGame(isWin) {
        if (matchTimerInterval) clearInterval(matchTimerInterval);
        
        el.matchGridBoard.style.display = "none";
        el.matchGameOver.style.display = "flex";

        el.matchFinalScore.textContent = matchScore;

        // Ambil & Update High Score
        const savedHighScore = core.storage.get("match_high_score", 0);
        const finalHighScore = Math.max(savedHighScore, matchScore);
        core.storage.set("match_high_score", finalHighScore);
        el.matchHighScore.textContent = finalHighScore;

        if (isWin) {
            el.matchGameMessage.textContent = `Luar Biasa! Semua kartu terjodohkan dengan sisa waktu ${matchTimeLeft} detik! Bonus +${matchTimeLeft * 2} XP!`;
            addXp(matchTimeLeft * 2); // Bonus XP waktu
            if (window.playSound) window.playSound('fanfare');
            
            // Tandai Daily Quest Jodohkan Selesai
            updateQuestProgress("match_win", 1);
        } else {
            el.matchGameMessage.textContent = "Waktu habis! Kembangkan terus penguasaan kosakata daerah Anda.";
            if (window.playSound) window.playSound('alarm');
        }
    }

    el.matchRestartBtn.addEventListener("click", () => {
        resetMatchGame();
    });

    // ==========================================================================
    // Sistem Kamus Daerah (Search & Filter)
    // ==========================================================================
    function updateVocabList() {
        if (!activePlace || !activePlace.cards.length) return;

        let filteredCards = activePlace.cards.map((card, index) => {
            return {
                index: index,
                word: card[0],
                translation: card[1],
                category: card[2] || "Kosa kata"
            };
        });

        // Filter status (All, Starred, Mastered)
        if (vocabActiveFilter === "starred") {
            filteredCards = filteredCards.filter(c => isCardStarred(activePlace.id, c.word));
        } else if (vocabActiveFilter === "mastered") {
            filteredCards = filteredCards.filter(c => isCardMastered(activePlace.id, c.word));
        }

        // Search Query
        if (vocabSearchQuery) {
            const query = vocabSearchQuery.toLowerCase();
            filteredCards = filteredCards.filter(c => {
                return c.word.toLowerCase().includes(query) || 
                       c.translation.toLowerCase().includes(query) ||
                       c.category.toLowerCase().includes(query);
            });
        }

        // Render list
        if (filteredCards.length === 0) {
            el.vocabInteractiveList.innerHTML = `
                <div class="vocab-empty-state">
                    <span>🔍</span>
                    <p>Tidak ada kata yang cocok dengan filter atau pencarian Anda.</p>
                </div>
            `;
            return;
        }

        el.vocabInteractiveList.innerHTML = filteredCards.map(c => {
            const isStarred = isCardStarred(activePlace.id, c.word);
            const isMastered = isCardMastered(activePlace.id, c.word);
            const extra = getVocabExtra(c.word);
            
            return `
                <div class="vocab-card-item">
                    <div class="vocab-card-body">
                        <strong>${c.word}</strong>
                        <span style="font-size:11.5px; font-style:italic; color:var(--muted)">${extra.phonetic}</span>
                        <span class="vocab-translation">${c.translation}</span>
                        <span class="vocab-context" style="margin-top:2px;">${c.category}</span>
                    </div>
                    <div class="vocab-card-actions">
                        <button class="vocab-icon-btn speak-vocab-btn" data-word="${c.word}" title="Dengar lafal"><i class="fa-solid fa-volume-high"></i></button>
                        <button class="vocab-icon-btn star-vocab-btn ${isStarred ? "active-favorite" : ""}" data-word="${c.word}" title="Bintang"><i class="${isStarred ? `fa-solid` : `fa-regular`} fa-star"></i></button>
                        <button class="vocab-icon-btn master-vocab-btn ${isMastered ? "active-mastered" : ""}" data-word="${c.word}" title="Tandai Dikuasai"><i class="${isMastered ? `fa-solid` : `fa-regular`} fa-circle-check"></i></button>
                    </div>
                </div>
            `;
        }).join("");

        // Event Listeners pada item kamus
        el.vocabInteractiveList.querySelectorAll(".speak-vocab-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                speakText(btn.dataset.word);
            });
        });

        el.vocabInteractiveList.querySelectorAll(".star-vocab-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                toggleCardStarred(activePlace.id, btn.dataset.word);
            });
        });

        el.vocabInteractiveList.querySelectorAll(".master-vocab-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                toggleCardMastered(activePlace.id, btn.dataset.word);
            });
        });
    }

    // Input pencarian kamus
    el.vocabSearch.addEventListener("input", (e) => {
        vocabSearchQuery = e.target.value.trim();
        el.vocabSearchClear.style.display = vocabSearchQuery ? "block" : "none";
        updateVocabList();
    });

    el.vocabSearchClear.addEventListener("click", () => {
        el.vocabSearch.value = "";
        vocabSearchQuery = "";
        el.vocabSearchClear.style.display = "none";
        updateVocabList();
    });

    // Filter Kamus
    el.vocabFilterButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            el.vocabFilterButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            vocabActiveFilter = btn.dataset.filter;
            updateVocabList();
        });
    });

    // ==========================================================================
    // Pengendali Tab & Inisialisasi Halaman
    // ==========================================================================
    function setupTabs() {
        el.tabButtons.forEach(btn => {
            btn.addEventListener("click", () => {
                if (window.playSound) window.playSound('click');
                el.tabButtons.forEach(b => {
                    b.classList.remove("active");
                    b.setAttribute("aria-selected", "false");
                });
                el.workspacePanels.forEach(p => p.classList.remove("active"));

                btn.classList.add("active");
                btn.setAttribute("aria-selected", "true");
                
                const mode = btn.dataset.mode;
                currentMode = mode;

                const panel = document.getElementById(`view-${mode}`);
                if (panel) panel.classList.add("active");

                // Hentikan autoplay & speech saat pindah tab
                stopAutoplay();
                if (speechRecognitionObj) {
                    speechRecognitionObj.stop();
                }

                // Trigger inisialisasi ulang game khusus
                if (mode === "flashcard") renderFlashcard();
                if (mode === "quiz") resetQuizMode();
                if (mode === "writing") resetWritingMode();
                if (mode === "speaking") resetSpeakingMode();
                if (mode === "match") resetMatchGame();
            });
        });
    }

    // ==========================================================================
    // Focus Music Player & Voice Wave Canvas Visualizers (Web Audio API)
    // ==========================================================================
    let isMusicPlaying = false;
    let musicVolume = 0.5;
    let musicTrack = "gamelan";
    let musicSchedulerInterval = null;
    let musicWaveCanvasCtx = null;
    let musicWaveAnimationId = null;
    let musicNotesHistory = new Array(20).fill(0);

    function initFocusMusicPlayer() {
        const playBtn = document.getElementById("musicPlayBtn");
        const trackSelect = document.getElementById("musicTrackSelect");
        const volumeSlider = document.getElementById("musicVolumeSlider");
        
        if (!playBtn) return;
        
        musicVolume = (volumeSlider ? volumeSlider.value : 50) / 100;
        
        playBtn.addEventListener("click", () => {
            if (window.initAudioContext) {
                window.initAudioContext();
            }
            
            isMusicPlaying = !isMusicPlaying;
            if (isMusicPlaying) {
                playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
                playBtn.classList.add("playing");
                startMusicScheduler();
                if (window.playSound) window.playSound('click');
            } else {
                playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
                playBtn.classList.remove("playing");
                stopMusicScheduler();
                if (window.playSound) window.playSound('click');
            }
        });
        
        if (trackSelect) {
            trackSelect.addEventListener("change", (e) => {
                musicTrack = e.target.value;
                if (window.playSound) window.playSound('click');
                if (isMusicPlaying) {
                    playFocusNote();
                }
            });
        }
        
        if (volumeSlider) {
            volumeSlider.addEventListener("input", (e) => {
                musicVolume = e.target.value / 100;
            });
        }
        
        drawMusicVisualizer();
    }

    function playFocusNote() {
        if (!isMusicPlaying || !window.audioCtx) return;
        
        const now = window.audioCtx.currentTime;
        const osc = window.audioCtx.createOscillator();
        const gain = window.audioCtx.createGain();
        
        const scales = {
            gamelan: [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50],
            suling: [293.66, 329.63, 392.00, 440.00, 523.25, 587.33],
            sasando: [329.63, 392.00, 523.25, 659.25, 783.99, 987.77],
            tifa: [60, 70, 80, 90]
        };
        
        const scale = scales[musicTrack] || scales.gamelan;
        const freq = scale[Math.floor(Math.random() * scale.length)];
        
        osc.connect(gain);
        gain.connect(window.audioCtx.destination);
        
        if (musicTrack === 'gamelan') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);
            gain.gain.setValueAtTime(musicVolume * 0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
            
            const oscH = window.audioCtx.createOscillator();
            const gainH = window.audioCtx.createGain();
            oscH.connect(gainH);
            gainH.connect(window.audioCtx.destination);
            oscH.type = 'sine';
            oscH.frequency.setValueAtTime(freq * 2, now);
            gainH.gain.setValueAtTime(musicVolume * 0.04, now);
            gainH.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
            
            osc.start(now);
            osc.stop(now + 1.3);
            oscH.start(now);
            oscH.stop(now + 0.7);
            
            musicNotesHistory.push(1.0);
            musicNotesHistory.shift();
        } else if (musicTrack === 'suling') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now);
            
            const lfo = window.audioCtx.createOscillator();
            const lfoGain = window.audioCtx.createGain();
            lfo.connect(lfoGain);
            lfoGain.connect(osc.frequency);
            lfo.frequency.value = 5.5;
            lfoGain.gain.value = 6;
            
            gain.gain.setValueAtTime(0.0001, now);
            gain.gain.linearRampToValueAtTime(musicVolume * 0.08, now + 0.2);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);
            
            lfo.start(now);
            osc.start(now);
            lfo.stop(now + 1.9);
            osc.stop(now + 1.9);
            
            musicNotesHistory.push(0.8);
            musicNotesHistory.shift();
        } else if (musicTrack === 'sasando') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);
            gain.gain.setValueAtTime(musicVolume * 0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
            
            const osc2 = window.audioCtx.createOscillator();
            const gain2 = window.audioCtx.createGain();
            osc2.connect(gain2);
            gain2.connect(window.audioCtx.destination);
            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(freq, now);
            gain2.gain.setValueAtTime(musicVolume * 0.05, now);
            gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
            
            osc.start(now);
            osc.stop(now + 1.0);
            osc2.start(now);
            osc2.stop(now + 0.5);
            
            musicNotesHistory.push(0.9);
            musicNotesHistory.shift();
        } else if (musicTrack === 'tifa') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);
            osc.frequency.exponentialRampToValueAtTime(30, now + 0.3);
            gain.gain.setValueAtTime(musicVolume * 0.18, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
            
            osc.start(now);
            osc.stop(now + 0.7);
            
            musicNotesHistory.push(1.2);
            musicNotesHistory.shift();
        }
    }

    function startMusicScheduler() {
        if (musicSchedulerInterval) clearTimeout(musicSchedulerInterval);
        
        const scheduleNext = () => {
            playFocusNote();
            const nextDelay = 1200 + Math.random() * 800;
            musicSchedulerInterval = setTimeout(scheduleNext, nextDelay);
        };
        scheduleNext();
    }

    function stopMusicScheduler() {
        if (musicSchedulerInterval) {
            clearTimeout(musicSchedulerInterval);
            musicSchedulerInterval = null;
        }
    }

    function drawMusicVisualizer() {
        if (!musicWaveCanvasCtx) {
            const canvas = document.getElementById("musicWaveCanvas");
            if (canvas) musicWaveCanvasCtx = canvas.getContext("2d");
        }
        if (!musicWaveCanvasCtx) return;
        
        const canvas = musicWaveCanvasCtx.canvas;
        const ctx = musicWaveCanvasCtx;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (let i = 0; i < musicNotesHistory.length; i++) {
            musicNotesHistory[i] *= 0.95;
        }
        
        const barWidth = canvas.width / musicNotesHistory.length;
        const maxBarHeight = canvas.height - 4;
        
        ctx.fillStyle = "rgba(102, 112, 133, 0.2)";
        if (isMusicPlaying) {
            const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
            grad.addColorStop(0, "#10b981");
            grad.addColorStop(1, "#4f8cff");
            ctx.fillStyle = grad;
        }
        
        for (let i = 0; i < musicNotesHistory.length; i++) {
            const val = musicNotesHistory[i];
            const barHeight = val * maxBarHeight;
            const x = i * barWidth;
            const y = canvas.height - barHeight;
            
            ctx.beginPath();
            if (ctx.roundRect) {
                ctx.roundRect(x + 2, y, barWidth - 4, barHeight, 4);
            } else {
                ctx.fillRect(x + 2, y, barWidth - 4, barHeight);
            }
            ctx.fill();
        }
        
        musicWaveAnimationId = requestAnimationFrame(drawMusicVisualizer);
    }

    // Speaking Voice Wave visualizer
    let speakingWaveCanvasCtx = null;
    let speakingWaveAnimationId = null;
    let speakingWavePhase = 0;

    function drawSpeakingWave() {
        if (!speakingWaveCanvasCtx) {
            const canvas = document.getElementById("speakingWaveCanvas");
            if (canvas) speakingWaveCanvasCtx = canvas.getContext("2d");
        }
        if (!speakingWaveCanvasCtx) return;
        
        const canvas = speakingWaveCanvasCtx.canvas;
        const ctx = speakingWaveCanvasCtx;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (!isSpeakingActive) {
            canvas.style.display = "none";
            if (speakingWaveAnimationId) cancelAnimationFrame(speakingWaveAnimationId);
            return;
        }
        
        canvas.style.display = "block";
        speakingWavePhase += 0.15;
        
        const width = canvas.width;
        const height = canvas.height;
        const midY = height / 2;
        
        const waves = [
            { amplitude: 15, frequency: 0.03, phase: speakingWavePhase, color: "rgba(50, 214, 107, 0.4)" },
            { amplitude: 10, frequency: 0.05, phase: -speakingWavePhase * 1.3, color: "rgba(79, 140, 255, 0.3)" },
            { amplitude: 6, frequency: 0.08, phase: speakingWavePhase * 0.7, color: "rgba(255, 159, 67, 0.5)" }
        ];
        
        waves.forEach(w => {
            ctx.beginPath();
            ctx.strokeStyle = w.color;
            ctx.lineWidth = 2.5;
            ctx.shadowColor = w.color;
            ctx.shadowBlur = 8;
            
            for (let x = 0; x < width; x++) {
                const envelope = Math.sin((x / width) * Math.PI);
                const y = midY + Math.sin(x * w.frequency + w.phase) * w.amplitude * envelope;
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        });
        
        speakingWaveAnimationId = requestAnimationFrame(drawSpeakingWave);
    }

    // Inisialisasi DOMContentLoaded
    document.addEventListener("DOMContentLoaded", () => {
        core.initTheme();
        
        // Pemuatan data daerah aktif dari param URL atau default
        const queryId = core.getQueryId();
        activePlace = data.getPlaceById(queryId);
        
        // Tandai telah dieksplorasi di sistem global
        core.markExplored(activePlace.id);

        // Render semua komponen halaman
        initConfettiCanvas();
        initLevelingHud();
        initSidebar();
        renderActivePlace();
        initDailyQuests();
        setupTabs();
        initSessionTimer();
        syncGlobalStreak();
        
        // Initialize music player
        initFocusMusicPlayer();
    });
})();
