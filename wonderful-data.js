(function () {
    const regions = ["Semua", "Sumatra", "Jawa", "Kalimantan", "Sulawesi", "Bali-Nusa", "Papua Raya", "Maluku"];

    const places = [
        {
            id: "jawa",
            label: "Jawa",
            region: "Jawa",
            mark: "JW",
            summary: "Ragam budaya Jawa dikenal dengan unggah-ungguh, seni gamelan, batik tulis, wayang kulit, dan tradisi keraton yang kuat.",
            cards: [
                ["Sugeng enjing", "Selamat pagi", "Sapaan pagi krama alus."],
                ["Matur nuwun", "Terima kasih", "Ungkapan apresiasi umum."],
                ["Piye kabare?", "Apa kabar?", "Sapaan ngoko santai."],
                ["Pinten regine?", "Berapa harganya?", "Kalimat tanya harga krama."]
            ],
            phrases: [
                ["Kulo badhe sinau.", "Saya ingin belajar."],
                ["Nyuwun pangapunten.", "Mohon maaf / permisi."],
                ["Sampun dhahar?", "Sudah makan? (Sapaan akrab)."],
                ["Sugeng rawuh ing Jawi.", "Selamat datang di Jawa."]
            ],
            destination: ["Yogyakarta & Borobudur", "Kota budaya bersejarah dengan Keraton Yogyakarta, Candi Prambanan/Borobudur, dan ruang seni kontemporer."],
            food: ["Gudeg", "Olahan nangka muda bercita rasa manis gurih yang dimasak perlahan dalam kuali tanah liat."],
            tradition: ["Wayang Kulit", "Pertunjukan bayangan kulit lembu dengan dalang dan gamelan yang sarat akan nilai moral."],
            fact: "Bahasa Jawa memiliki tingkatan tutur (Ngoko dan Krama) sebagai bentuk kesopanan menghormati lawan bicara.",
            quiz: { q: "Tradisi pertunjukan bayangan khas Jawa disebut...", answers: ["Wayang Kulit", "Tari Piring", "Karapan Sapi", "Ma'nene"], correct: 0 }
        },
        {
            id: "sunda",
            label: "Sunda",
            region: "Jawa",
            mark: "SD",
            summary: "Budaya Sunda lekat dengan keindahan alam pegunungan, keramahan warga (soméah), angklung, dan kuliner segar lalapan.",
            cards: [
                ["Wilujeng enjing", "Selamat pagi", "Sapaan pagi sopan."],
                ["Hatur nuhun", "Terima kasih", "Ungkapan apresiasi."],
                ["Kumaha damang?", "Apa kabar?", "Menanyakan kabar secara halus."],
                ["Sabaraha pangaosna?", "Berapa harganya?", "Bertanya harga secara sopan."]
            ],
            phrases: [
                ["Abdi hoyong diajar.", "Saya ingin belajar."],
                ["Punten, mangga.", "Permisi, silakan."],
                ["Wilujeng sumping.", "Selamat datang."],
                ["Tong khilaf nya.", "Jangan lupa ya (Bahasa akrab sehari-hari)."]
            ],
            destination: ["Bandung & Geopark Ciletuh", "Kota kreatif dengan budaya distro, Gedung Sate, serta Geopark Ciletuh UNESCO yang eksotis."],
            food: ["Seblak", "Makanan pedas gurih berbahan krupuk basah, telur, kencur, dan ceker ayam."],
            tradition: ["Angklung", "Alat musik bambu yang dimainkan secara kolaboratif hingga membentuk harmoni nada."],
            fact: "Budaya Sunda menganut filosofi 'Silih Asih, Silih Asah, Silih Asuh' (saling mengasihi, mengajari, dan mengayomi).",
            quiz: { q: "Alat musik bambu khas Sunda yang dimainkan dengan digoyangkan adalah...", answers: ["Angklung", "Sasando", "Tifa", "Kolintang"], correct: 0 }
        },
        {
            id: "bali",
            label: "Bali",
            region: "Bali-Nusa",
            mark: "BL",
            summary: "Bali memadukan keindahan alam pantai, ritual keagamaan, seni tari eksotis, dan kehidupan komunal subak yang erat.",
            cards: [
                ["Rahajeng semeng", "Selamat pagi", "Sapaan pagi."],
                ["Suksma mewali", "Terima kasih kembali", "Jawaban terima kasih halus."],
                ["Kenken kabare?", "Apa kabar?", "Sapaan kasual sehari-hari."],
                ["Kuda aji ne?", "Berapa harganya?", "Tanya harga kasual."]
            ],
            phrases: [
                ["Tiang melajah.", "Saya belajar."],
                ["Ampura.", "Maaf / Permisi."],
                ["Rahajeng rauh.", "Selamat datang."],
                ["Mewali-wali.", "Sama-sama (balasan suksma)."]
            ],
            destination: ["Ubud & Nusa Penida", "Pusat seni tari dan lukis Bali di Ubud, bersanding dengan keindahan tebing laut Nusa Penida."],
            food: ["Ayam Betutu", "Ayam utuh berisi bumbu genep yang dibungkus daun pisang lalu dipanggang/dikukus lama."],
            tradition: ["Tari Kecak", "Seni pertunjukan tari bertema Ramayana diiringi suara ritmis puluhan pria berteriak 'cak'."],
            fact: "Masyarakat adat Bali mempraktikkan Tri Hita Karana, prinsip hidup yang menyelaraskan hubungan dengan Tuhan, alam, dan sesama.",
            quiz: { q: "Pertunjukan Bali yang terkenal dengan suara ritmis 'cak' adalah...", answers: ["Tari Kecak", "Tari Saman", "Tari Jaipong", "Tari Tor-Tor"], correct: 0 }
        },
        {
            id: "minang",
            label: "Minang",
            region: "Sumatra",
            mark: "MN",
            summary: "Minangkabau terkenal dengan arsitektur rumah gadang, tradisi matrilineal terkaya di dunia, merantau, dan kuliner kaya rempah.",
            cards: [
                ["Salamaik pagi", "Selamat pagi", "Sapaan pagi."],
                ["Tarimo kasih", "Terima kasih", "Ungkapan apresiasi."],
                ["Apo kaba?", "Apa kabar?", "Sapaan umum."],
                ["Bara haragonyo?", "Berapa harganya?", "Bertanya harga di pasar."]
            ],
            phrases: [
                ["Ambo nio baraja.", "Saya ingin belajar."],
                ["Maaf yo.", "Mohon maaf."],
                ["Dima tampeknyo?", "Di mana tempatnya?"],
                ["Siko lu.", "Ke sini sebentar (Akrab)."]
            ],
            destination: ["Bukittinggi & Lembah Harau", "Lembah Harau bertebing granit megah bersanding dengan sejarah kota Bukittinggi dan Jam Gadang."],
            food: ["Rendang", "Daging sapi berbumbu santan dan rempah-rempah yang dimasak berjam-jam hingga mengering hitam."],
            tradition: ["Rumah Gadang", "Rumah adat Minangkabau beratap melengkung tajam mirip tanduk kerbau (gonjong)."],
            fact: "Masyarakat Minangkabau menganut adat matrilineal, di mana garis keturunan dan warisan diturunkan dari ibu.",
            quiz: { q: "Rumah adat Minangkabau yang beratap gonjong disebut...", answers: ["Rumah Gadang", "Tongkonan", "Honai", "Joglo"], correct: 0 }
        },
        {
            id: "batak",
            label: "Batak",
            region: "Sumatra",
            mark: "BT",
            summary: "Karakter budaya Batak kuat dalam sistem marga (tarombo), kain tenun ulos, musik gondang sabangunan, dan ekologi Danau Toba.",
            cards: [
                ["Horas", "Salam sejahtera / Halo", "Sapaan khas Batak."],
                ["Mauliate", "Terima kasih", "Ucapan terima kasih."],
                ["Boha kabar?", "Apa kabar?", "Sapaan menanyakan kabar."],
                ["Sadia argana?", "Berapa harganya?", "Bertanya harga barang."]
            ],
            phrases: [
                ["Au marsiajar.", "Saya belajar."],
                ["Sai horas ma.", "Semoga sehat selalu."],
                ["Tudia ho?", "Ke mana kamu?"],
                ["Ido tutu.", "Itu benar / Betul sekali."]
            ],
            destination: ["Danau Toba & Bukit Sibea-bea", "Danau vulkanik terbesar dengan Pulau Samosir di tengahnya serta patung Yesus tertinggi di Bukit Sibea-bea."],
            food: ["Arsik", "Olahan ikan mas berbumbu kuning andaliman, kecombrang, dan kacang bertulang khas Toba."],
            tradition: ["Ulos", "Kain tenun sakral Batak yang disematkan dalam berbagai upacara adat sebagai simbol restu."],
            fact: "Marga Batak merupakan identitas sosial yang dipegang erat dan menentukan garis silsilah pernikahan adat.",
            quiz: { q: "Kain tradisional penting dalam adat Batak adalah...", answers: ["Ulos", "Songket", "Batik", "Endek"], correct: 0 }
        },
        {
            id: "aceh",
            label: "Aceh",
            region: "Sumatra",
            mark: "AC",
            summary: "Dijuluki Serambi Mekkah, Aceh memiliki akar sejarah Kesultanan Islam yang kuat, tari Saman yang mendunia, dan komoditas kopi Gayo.",
            cards: [
                ["Seulamat beungoh", "Selamat pagi", "Sapaan pagi."],
                ["Teurimong geunaseh", "Terima kasih", "Ungkapan apresiasi."],
                ["Pakon haba?", "Apa kabar?", "Menanyakan keadaan kabar."],
                ["Padum beukai?", "Berapa harganya?", "Menanyakan harga barang."]
            ],
            phrases: [
                ["Lon jak meujak.", "Saya pergi belajar."],
                ["Peue haba?", "Ada kabar apa?"],
                ["Seulamat datang.", "Selamat datang."],
                ["Lon galak.", "Saya suka."]
            ],
            destination: ["Banda Aceh & Pulau Weh", "Masjid Raya Baiturrahman di Banda Aceh bersanding dengan wisata menyelam di laut jernih Sabang, Pulau Weh."],
            food: ["Mie Aceh", "Mie kuning tebal dimasak dengan kuah kari rempah pekat berisi daging atau kepiting."],
            tradition: ["Tari Saman", "Tari duduk harmonis berkelompok yang dinamis menguji kecepatan gerakan tangan dan dada."],
            fact: "Tari Saman telah diakui oleh UNESCO sebagai warisan budaya takbenda dunia karena keunikan gerak dan lagunya.",
            quiz: { q: "Tari Aceh yang terkenal dengan gerakan cepat dan kompak adalah...", answers: ["Tari Saman", "Tari Kecak", "Tari Pendet", "Tari Pakarena"], correct: 0 }
        },
        {
            id: "betawi",
            label: "Betawi",
            region: "Jawa",
            mark: "BW",
            summary: "Budaya Betawi lahir dari perpaduan berbagai etnis di Batavia, tecermin dalam musik gambang kromong, lenong, dan ondel-ondel.",
            cards: [
                ["Selamet pagi", "Selamat pagi", "Sapaan pagi kasual."],
                ["Makasih ye", "Terima kasih ya", "Ungkapan apresiasi akrab."],
                ["Gimana kabarnye?", "Apa kabar?", "Sapaan khas Betawi sehari-hari."],
                ["Berapaan nih?", "Berapa harganya?", "Menanyakan harga santai."]
            ],
            phrases: [
                ["Gue mau belajar.", "Saya ingin belajar."],
                ["Permisi ye.", "Permisi ya."],
                ["Mampir dulu nyok.", "Singgah sebentar yuk."],
                ["Kagak nape-nape.", "Tidak apa-apa."]
            ],
            destination: ["Kota Tua & Setu Babakan", "Kawasan peninggalan kolonial Belanda di Jakarta Utara serta pusat pelestarian budaya Betawi di Setu Babakan."],
            food: ["Kerak Telor", "Makanan berbahan ketan, telur bebek/ayam, serundeng, ebi, dan bawang goreng dipanggang di atas wajan mini balik."],
            tradition: ["Ondel-ondel", "Pertunjukan boneka besar berwajah pria dan wanita yang melambangkan tolak bala."],
            fact: "Dialek Betawi menyerap kosa kata dari bahasa Melayu, Sunda, Jawa, Tionghoa, Arab, Portugis, hingga Belanda.",
            quiz: { q: "Ikon boneka besar khas Betawi disebut...", answers: ["Ondel-ondel", "Ogoh-ogoh", "Sigale-gale", "Barong"], correct: 0 }
        },
        {
            id: "dayak",
            label: "Dayak",
            region: "Kalimantan",
            mark: "DY",
            summary: "Etnis Dayak kaya akan tradisi rumah betang, seni lukis tato tradisional, manik-manik, dan hubungan harmonis dengan hutan rimba.",
            cards: [
                ["Selamat dauh", "Selamat pagi", "Sapaan Dayak Ngaju."],
                ["Terima kasih", "Terima kasih", "Ucapan terima kasih."],
                ["Narai kabar?", "Apa kabar?", "Sapaan umum menanyakan kabar."],
                ["Kureh regae?", "Berapa harganya?", "Menanyakan harga."]
            ],
            phrases: [
                ["Aku belajar adat.", "Saya belajar adat."],
                ["Mari jaga lewu.", "Mari menjaga kampung/hutan."],
                ["Adil ka talino.", "Adil kepada sesama manusia (bagian semboyan adat)."],
                ["Salam patis.", "Salam persaudaraan."]
            ],
            destination: ["Tanjung Puting & Bukit Raya", "Taman Nasional Tanjung Puting pusat konservasi orangutan terbesar di dunia serta keindahan Pegunungan Schwaner."],
            food: ["Juhu Singkah", "Kuliner sup tradisional berbahan umbut rotan muda bercita rasa sedikit pahit manis segar."],
            tradition: ["Rumah Betang", "Rumah panggung kayu ulin panjang yang ditinggali puluhan keluarga sebagai wujud kerukunan."],
            fact: "Masyarakat Dayak memiliki tradisi tato tradisional (tutang) yang melambangkan status sosial dan perjalanan hidup.",
            quiz: { q: "Rumah panjang khas banyak komunitas Dayak dikenal sebagai...", answers: ["Rumah Betang", "Rumah Gadang", "Joglo", "Honai"], correct: 0 }
        },
        {
            id: "banjar",
            label: "Banjar",
            region: "Kalimantan",
            mark: "BJ",
            summary: "Budaya Banjar kental dengan dinamika kehidupan sungai, pasar terapung, kerajinan kain sasirangan, dan tradisi berkebun.",
            cards: [
                ["Salamat pagi", "Selamat pagi", "Sapaan pagi."],
                ["Tarima kasih", "Terima kasih", "Ungkapan apresiasi."],
                ["Apa habar?", "Apa kabar?", "Menanyakan kabar."],
                ["Bapa reganya?", "Berapa harganya?", "Bertanya harga barang."]
            ],
            phrases: [
                ["Ulun handak belajar.", "Saya ingin belajar (ulun = saya, sopan)."],
                ["Pian sehat?", "Anda sehat? (pian = anda, sopan)."],
                ["Ayo bajalanan.", "Ayo jalan-jalan."],
                ["Kada papa.", "Tidak apa-apa."]
            ],
            destination: ["Pasar Terapung Lok Baintan", "Pasar tradisional di atas perahu klotok Sungai Martapura yang eksis sejak masa Kesultanan Banjar."],
            food: ["Soto Banjar", "Soto ayam kampung berkuah keruh rempah harum (kayu manis, cengkih) disajikan dengan ketupat dan perkedel singkong."],
            tradition: ["Sasirangan", "Kain tradisional Banjar yang dibuat dengan teknik jelujur pewarnaan alami untuk pengobatan adat."],
            fact: "Bahasa Banjar terbagi atas dua dialek utama, yaitu Banjar Hulu dan Banjar Kuala yang berpusat di Banjarmasin.",
            quiz: { q: "Kain tradisional khas Banjar disebut...", answers: ["Sasirangan", "Ulos", "Endek", "Tapis"], correct: 0 }
        },
        {
            id: "bugis",
            label: "Bugis",
            region: "Sulawesi",
            mark: "BG",
            summary: "Suku Bugis dikenal sebagai pelaut tangguh pembelah samudera, pembuat kapal pinisi, dan penganut falsafah kehormatan diri (siri').",
            cards: [
                ["Mappadeceng", "Semoga baik / Salam", "Sapaan baik."],
                ["Kurre sumanga'", "Terima kasih / Syukur", "Ungkapan apresiasi mendalam."],
                ["Aga kareba?", "Apa kabar?", "Sapaan menanyakan kabar."],
                ["Siaga ellinna?", "Berapa harganya?", "Tanya harga Bugis."]
            ],
            phrases: [
                ["Iyya melo berguru.", "Saya ingin berguru/belajar."],
                ["Salama ki.", "Semoga Anda selamat."],
                ["Kareba madeceng.", "Kabar baik."],
                ["Taro ada taro gau.", "Konsisten antara ucapan dan perbuatan."]
            ],
            destination: ["Tana Toraja & Bulukumba", "Pantai Bira dan industri pembuatan kapal Pinisi di Bulukumba, bersanding dengan Tana Toraja di utara."],
            food: ["Coto Makassar", "Sup jeroan dan daging sapi khas Makassar dimasak air cucian beras bercampur kacang tanah giling."],
            tradition: ["Kapal Pinisi", "Seni pembuatan kapal layar kayu legendaris tanpa paku besi yang diakui UNESCO sebagai warisan dunia."],
            fact: "Masyarakat Bugis kuno mengenal aksara Lontara yang digunakan untuk menulis naskah sastra sakral La Galigo.",
            quiz: { q: "Kapal layar tradisional yang lekat dengan Bugis-Makassar adalah...", answers: ["Pinisi", "Jukung", "Kora-kora", "Sampan"], correct: 0 }
        },
        {
            id: "madura",
            label: "Madura",
            region: "Jawa",
            mark: "MD",
            summary: "Budaya Madura identik dengan tradisi karapan sapi, batik pesisir bermotif tegas, sifat ulet kerja, dan kuliner sate bumbu kacang pekat.",
            cards: [
                ["Salamet lagghu", "Selamat pagi", "Sapaan pagi."],
                ["Mator sakalangkong", "Terima kasih", "Ungkapan apresiasi."],
                ["Remma kabarra?", "Apa kabar?", "Sapaan kabar Madura."],
                ["Berapa argana?", "Berapa harganya?", "Menanyakan harga."]
            ],
            phrases: [
                ["Sengko' ajar madura.", "Saya belajar bahasa Madura."],
                ["Pangapora, tretan.", "Maaf/Permisi, saudara."],
                ["Entara da' remma?", "Mau pergi ke mana?"],
                ["Bagus sakale.", "Bagus sekali."]
            ],
            destination: ["Sumenep & Jembatan Suramadu", "Keraton Sumenep yang menyimpan sejarah kemakmuran Madura, diakses melalui Jembatan Suramadu penembus selat."],
            food: ["Sate Madura", "Sate ayam/kambing dibakar arang kelapa dilumuri bumbu kacang halus manis pekat bercampur petis."],
            tradition: ["Karapan Sapi", "Pesta balap sepasang sapi jantan penarik kereta kayu untuk adu kecepatan dan gengsi kelas sosial."],
            fact: "Karapan Sapi diselenggarakan sebagai wujud rasa syukur atas hasil panen dan ajang silaturahmi akbar tahunan.",
            quiz: { q: "Pacuan sapi khas Madura disebut...", answers: ["Karapan Sapi", "Pacu Jawi", "Makepung", "Pasola"], correct: 0 }
        },
        {
            id: "papua-provinsi",
            label: "Papua",
            region: "Papua Raya",
            mark: "PA",
            summary: "Meliputi wilayah utara Tanah Papua dengan pusat Jayapura, pesisir Danau Sentani, kriya lukisan kulit kayu, alat musik tifa, dan anyaman noken.",
            cards: [
                ["Wa wa wa", "Salam / Selamat", "Sapaan akrab penuh kehangatan."],
                ["Mace", "Ibu / Perempuan dewasa", "Panggilan akrab perempuan."],
                ["Pace", "Bapak / Laki-laki dewasa", "Panggilan akrab laki-laki."],
                ["Ko", "Kamu / Anda", "Kata ganti orang kedua dalam Melayu Papua."]
            ],
            phrases: [
                ["Sa mau belajar budaya Papua.", "Saya ingin belajar budaya Papua (sa = saya)."],
                ["Mari tong jaga Sentani.", "Mari kita menjaga Danau Sentani (tong = kita)."],
                ["Kitorang basodara.", "Kita semua bersaudara."],
                ["Sio adoh, indah sekali.", "Aduh sayang/indah sekali."]
            ],
            destination: ["Danau Sentani & Jayapura", "Danau megah dengan pulau-pulau kecil berpenghuni di Jayapura, pusat diselenggarakannya Festival Danau Sentani."],
            food: ["Papeda", "Bubur sagu kenyal bening disajikan panas dengan ikan kuah kuning kaya kunyit dan daun kemangi."],
            tradition: ["Noken", "Tas rajut tradisional dari serat kayu yang dikaitkan di kepala, diakui sebagai warisan budaya UNESCO."],
            fact: "Provinsi Papua didominasi kebudayaan masyarakat pesisir utara dengan seni ukir khas suku Sentani yang bergaya meliuk halus.",
            quiz: { q: "Destinasi dan festival budaya yang lekat dengan Provinsi Papua adalah...", answers: ["Danau Sentani", "Jam Gadang", "Tana Toraja", "Pulau Penyengat"], correct: 0 }
        },
        {
            id: "papua-barat",
            label: "Papua Barat",
            region: "Papua Raya",
            mark: "PB",
            summary: "Papua Barat memiliki Manokwari, keunikan suku adat Arfak di pegunungan dingin, Teluk Cendrawasih, dan kebun sayur subur.",
            cards: [
                ["Selamat pagi", "Selamat pagi", "Sapaan pagi Melayu Papua."],
                ["Kitorang", "Kita / Kami semua", "Kata ganti orang pertama jamak."],
                ["Sa senang sekali", "Saya senang sekali", "Ungkapan perasaan positif."],
                ["Pace mace", "Bapak ibu", "Sapaan hormat kolektif."]
            ],
            phrases: [
                ["Kitorang jaga Arfak.", "Kami menjaga Pegunungan Arfak."],
                ["Sa mau lihat rumah adat.", "Saya ingin melihat rumah adat."],
                ["Mari tong belajar bersama.", "Mari kita belajar bersama."],
                ["Trada masalah.", "Tidak ada masalah / Aman."]
            ],
            destination: ["Pegunungan Arfak & Manokwari", "Manokwari kota peradaban bersejarah di Papua bersanding dengan cagar alam flora fauna langka Pegunungan Arfak."],
            food: ["Ikan Bakar Manokwari", "Ikan tongkol atau kuwe segar dibakar dilumuri sambal mentah kasar yang pedas menggigit."],
            tradition: ["Rumah Kaki Seribu", "Rumah adat suku Arfak (Mod Aki Aksa) yang ditopang ratusan tiang kayu tipis beratap jerami tebal."],
            fact: "Pegunungan Arfak terkenal sebagai habitat burung pintar (Burung Namdur) yang pandai menghias sarang dengan buah berwarna-warni.",
            quiz: { q: "Rumah tradisional suku Arfak di Papua Barat dikenal sebagai...", answers: ["Rumah Kaki Seribu", "Rumah Gadang", "Joglo", "Tongkonan"], correct: 0 }
        },
        {
            id: "papua-selatan",
            label: "Papua Selatan",
            region: "Papua Raya",
            mark: "PS",
            summary: "Provinsi datar ujung timur dengan Merauke, savana luas Wasur, budaya suku Marind, tarian sakral, dan pertanian sagu melimpah.",
            cards: [
                ["Izakod bekai izakod kai", "Satu hati satu tujuan", "Semboyan persatuan Merauke."],
                ["Sep", "Olahan pangan sagu", "Jenis makanan sagu bakar Merauke."],
                ["Amai", "Kakek / Sapaan sayang", "Sapaan akrab suku Marind."],
                ["Sa punya", "Milik saya", "Menyatakan kepemilikan."]
            ],
            phrases: [
                ["Sa belajar budaya Marind.", "Saya belajar kebudayaan Marind."],
                ["TN Wasur luas sekali.", "Taman Nasional Wasur luas sekali."],
                ["Sagu itu makanan pokok tong.", "Sagu itu makanan pokok kami."],
                ["Ko dari mana?", "Kamu dari mana?"]
            ],
            destination: ["Taman Nasional Wasur & Merauke", "Wasur habitat kanguru pohon kecil, burung migran Australia, dan savana Merauke Titik Nol Timur Indonesia."],
            food: ["Sagu Sep", "Makanan adat berupa sagu dicampur kelapa parut dan potongan daging dibakar di dalam tumpukan batu panas ditutup daun."] ,
            tradition: ["Budaya Ukir Marind", "Seni memahat patung upacara sakral suku Marind yang berhubungan erat dengan mitologi leluhur."],
            fact: "Papua Selatan diresmikan tahun 2022, memiliki bentang alam savana unik mirip Australia utara.",
            quiz: { q: "Provinsi Papua Selatan berpusat kuat pada kawasan budaya dan alam di sekitar...", answers: ["Merauke", "Bandung", "Banjarmasin", "Bukittinggi"], correct: 0 }
        },
        {
            id: "papua-tengah",
            label: "Papua Tengah",
            region: "Papua Raya",
            mark: "PT",
            summary: "Meliputi wilayah Nabire dan jajaran Danau Paniai di ketinggian, dihuni suku Mee, Kamoro, Amungme dengan tradisi anyaman noken anggrek.",
            cards: [
                ["Amapane", "Terima kasih", "Ungkapan terima kasih suku Mee."],
                ["Noken anggrek", "Noken serat bunga", "Noken bernilai tinggi."],
                ["Nabire", "Kota pesisir utara", "Ibu kota Provinsi Papua Tengah."],
                ["De", "Dia", "Kata ganti orang ketiga."]
            ],
            phrases: [
                ["Sa mau beli noken anggrek.", "Saya ingin membeli noken serat anggrek."],
                ["Paniai itu danau tinggi.", "Paniai itu danau di dataran tinggi."],
                ["Kitorang hormat adat Mee.", "Kami menghormati adat suku Mee."],
                ["Ko ada bikin apa?", "Kamu sedang buat apa?"]
            ],
            destination: ["Danau Paniai & Teluk Cendrawasih Nabire", "Keindahan danau berair tenang di pegunungan Paniai serta wisata hiu paus di Nabire."],
            food: ["Udang Selingkuh", "Udang air tawar Danau Paniai bercakar besar mirip kepiting dengan daging manis tebal."] ,
            tradition: ["Anyaman Noken Anggrek", "Kerajinan anyaman tas dari serat batang anggrek hutan yang rumit dan bernilai ekonomi sangat tinggi."],
            fact: "Danau Paniai pernah dinamai Wissel Lakes oleh pilot Belanda tahun 1938 karena keindahannya di tengah pegunungan salju.",
            quiz: { q: "Ibu kota Provinsi Papua Tengah berada di...", answers: ["Nabire", "Sorong", "Denpasar", "Medan"], correct: 0 }
        },
        {
            id: "papua-pegunungan",
            label: "Papua Pegunungan",
            region: "Papua Raya",
            mark: "PG",
            summary: "Satu-satunya provinsi terkurung daratan di pedalaman Wamena Lembah Baliem, rumah bagi suku Dani, rumah honai, dan adat bakar batu.",
            cards: [
                ["Koleak", "Salam / Halo", "Sapaan adat suku Dani."],
                ["Honai", "Rumah adat bulat", "Arsitektur khas pegunungan Papua."],
                ["Wamena", "Kota Lembah Baliem", "Pusat budaya pegunungan Papua."],
                ["Hipere", "Ubi jalar", "Pangan pokok di pegunungan."]
            ],
            phrases: [
                ["Sa mau lihat pesta bakar batu.", "Saya ingin melihat upacara bakar batu."],
                ["Lembah Baliem dingin sekali.", "Lembah Baliem dingin sekali."],
                ["Honai ini hangat di malam hari.", "Honai ini hangat di malam hari."],
                ["Ko jalan baik-baik.", "Kamu jalan hati-hati."]
            ],
            destination: ["Lembah Baliem & Wamena", "Lembah hijau luas berlatar puncak bersalju tempat digelarnya Festival Budaya Lembah Baliem setiap tahun."],
            food: ["Ubi Bakar Batu", "Ubi jalar (hipere) dimasak dengan teknik komunal bakar batu (kit oba) dilapisi rumput alang-alang."],
            tradition: ["Upacara Bakar Batu", "Tradisi memasak massal menggunakan batu panas membara sebagai simbol perdamaian dan ucapan syukur."],
            fact: "Mumi leluhur (mumi Papua) diawetkan dengan pengasapan tradisional oleh suku Dani di Wamena dan berusia ratusan tahun.",
            quiz: { q: "Rumah adat yang lekat dengan Papua Pegunungan disebut...", answers: ["Honai", "Baileo", "Rumah Gadang", "Lamin"], correct: 0 }
        },
        {
            id: "papua-barat-daya",
            label: "Papua Barat Daya",
            region: "Papua Raya",
            mark: "BD",
            summary: "Gerbang masuk Tanah Papua di kota pelabuhan Sorong, mengelola kepulauan surga selam Raja Ampat dan konservasi laut sasi.",
            cards: [
                ["Sorong", "Kota pintu masuk utama", "Kota pelabuhan kepala burung Papua."],
                ["Sasi", "Adat larangan ambil biota", "Hukum adat konservasi alam timur."],
                ["Sa senang ke sini", "Saya senang ke sini", "Ungkapan kegembiraan."],
                ["Kam dorang", "Kalian semua", "Kata ganti orang kedua jamak."]
            ],
            phrases: [
                ["Sa mau menyelam di Raja Ampat.", "Saya ingin menyelam di Raja Ampat."],
                ["Adat sasi jaga karang tong.", "Hukum adat sasi menjaga terumbu karang kami."],
                ["Laut di sini biru jernih.", "Laut di sini biru jernih."],
                ["Ko tra usah khawatir.", "Kamu tidak usah khawatir."]
            ],
            destination: ["Kepulauan Raja Ampat & Sorong", "Pusat keanekaragaman hayati terumbu karang tertinggi di dunia bersanding dengan kuliner Sorong."],
            food: ["Ikan Kuah Kuning", "Ikan kakap atau cakalang segar dimasak kuah kunyit asam encer beraroma kemangi."],
            tradition: ["Tradisi Sasi", "Sistem hukum adat penutupan wilayah tangkapan laut/darat dalam periode waktu tertentu agar alam memulihkan diri."],
            fact: "Raja Ampat menyimpan 75% dari seluruh spesies karang dunia yang tercatat dalam ilmu kelautan.",
            quiz: { q: "Provinsi Papua Barat Daya dikenal sebagai gerbang menuju...", answers: ["Raja Ampat", "Malioboro", "Danau Toba", "Kota Tua"], correct: 0 }
        },
        {
            id: "sasak",
            label: "Sasak",
            region: "Bali-Nusa",
            mark: "SK",
            summary: "Suku Sasak di Lombok terkenal dengan desa adat Sade, tradisi menenun songket, lumbung beras tradisional, dan seni bela diri peresean.",
            cards: [
                ["Selamat semeton", "Salam saudara", "Sapaan hangat bersahabat."],
                ["Matur tampiasih", "Terima kasih", "Ungkapan terima kasih."],
                ["Napi kabar?", "Apa kabar?", "Menanyakan kabar."],
                ["Pira aji ne?", "Berapa harganya?", "Bertanya harga barang."]
            ],
            phrases: [
                ["Ayo melajah tenun.", "Mari belajar menun."],
                ["Ampure, semeton.", "Maaf/Permisi, saudara."],
                ["Silaq mampir.", "Silakan mampir."],
                ["Napi niki?", "Apa ini?"]
            ],
            destination: ["Desa Sade & Sirkuit Mandalika", "Dusun adat Sasak otentik Sade bersanding dengan sirkuit balap internasional Mandalika di pesisir selatan."],
            food: ["Ayam Taliwang", "Ayam kampung muda dibakar dilumuri sambal pedas gurih cabe rawit dan terasi khas Lombok."],
            tradition: ["Bau Nyale", "Tradisi tahunan menangkap cacing laut warna-warni yang dipercaya jelmaan rambut Putri Mandalika."],
            fact: "Desa Sade masih mempertahankan tradisi melumuri lantai rumah tanah liat dengan kotoran kerbau agar hangat dan bebas serangga.",
            quiz: { q: "Tradisi Lombok yang berkaitan dengan legenda Putri Mandalika adalah...", answers: ["Bau Nyale", "Sekaten", "Tabuik", "Pasola"], correct: 0 }
        },
        {
            id: "toraja",
            label: "Toraja",
            region: "Sulawesi",
            mark: "TJ",
            summary: "Budaya Toraja mendunia karena arsitektur tongkonan beratap perahu, upacara pemakaman mewah Rambu Solo', dan makam tebing batu.",
            cards: [
                ["Melo tongan", "Baik sekali", "Ungkapan persetujuan."],
                ["Kurre sumanga'", "Terima kasih / Syukur", "Ungkapan syukur dan terima kasih."],
                ["Umba susi kabar?", "Bagaimana kabar?", "Sapaan menanyakan kabar."],
                ["Pira allinna?", "Berapa harganya?", "Menanyakan harga barang."]
            ],
            phrases: [
                ["Aku la melajah adat.", "Saya akan belajar adat."],
                ["Tabe' lako mai.", "Permisi ke sini."],
                ["Kurre sumanga' sola nasang.", "Terima kasih semuanya."],
                ["Menda'da.", "Bagus sekali / Indah."]
            ],
            destination: ["Kete Kesu & Londa", "Situs pemakaman gua tebing batu Londa dan deretan rumah adat kuno tongkonan di desa adat Kete Kesu."],
            food: ["Pa'piong", "Daging dibumbui kelapa parut dan rempah khas dimasak di dalam bambu dibakar perlahan."],
            tradition: ["Rambu Solo'", "Upacara pemakaman adat megah bermedium penyembelihan kerbau belang (tedong bonga) bernilai ratusan juta."],
            fact: "Kerbau belang merupakan simbol prestise dalam adat Toraja yang diyakini mengantar arwah ke alam baka (puya).",
            quiz: { q: "Rumah adat Toraja yang beratap melengkung disebut...", answers: ["Tongkonan", "Joglo", "Baileo", "Lamin"], correct: 0 }
        },
        {
            id: "melayu-riau",
            label: "Melayu Riau",
            region: "Sumatra",
            mark: "MR",
            summary: "Budaya Melayu Riau merupakan pusat perkembangan bahasa Melayu modern, tradisi pantun bersahut, tari zapin, dan peninggalan kerajaan.",
            cards: [
                ["Selamat pagi", "Selamat pagi", "Sapaan pagi Melayu."],
                ["Terima kasih", "Terima kasih", "Ungkapan apresiasi."],
                ["Apa khabar?", "Apa kabar?", "Sapaan menanyakan kabar Riau."],
                ["Berapa harganya?", "Berapa harganya?", "Tanya harga."]
            ],
            phrases: [
                ["Saya hendak belajar.", "Saya ingin belajar."],
                ["Silakan singgah.", "Silakan mampir."],
                ["Elok budi elok bahasa.", "Budi dan sopan santun perlu dijaga."],
                ["Takkan Melayu hilang di bumi.", "Semboyan ketangguhan Melayu."]
            ],
            destination: ["Istana Siak & Pulau Penyengat", "Istana Siak Sri Indrapura peninggalan sultan di Siak serta Pulau Penyengat pusat bahasa sastra Melayu Gurindam 12."],
            food: ["Gulai Ikan Patin", "Sup patin berkuah kuning asam pedas gurih berbumbu asam kandis dan serai."],
            tradition: ["Pantun Melayu", "Tradisi tutur terikat rima a-b-a-b yang digunakan dalam komunikasi resmi dan adat."],
            fact: "Bahasa Melayu Riau merupakan dasar standarisasi bahasa Indonesia yang disepakati sejak Sumpah Pemuda 1928.",
            quiz: { q: "Tradisi tutur berima yang lekat dengan budaya Melayu adalah...", answers: ["Pantun", "Haiku", "Mantra Bali", "Syair bebas"], correct: 0 }
        },
        {
            id: "lampung",
            label: "Lampung",
            region: "Sumatra",
            mark: "LP",
            summary: "Lampung terkenal sebagai pintu gerbang Sumatra, kerajinan kain tenun tapis sulam emas, lambang siger, dan konservasi gajah.",
            cards: [
                ["Tabik pun", "Salam hormat / Permisi", "Sapaan hormat khas Lampung."],
                ["Terima kasih", "Terima kasih", "Ucapan terima kasih."],
                ["Api kabar?", "Apa kabar?", "Sapaan kabar."],
                ["Pira regane?", "Berapa harganya?", "Tanya harga Lampung."]
            ],
            phrases: [
                ["Nyak haga belajar tapis.", "Saya ingin belajar tenun tapis (nyak = saya)."],
                ["Sikam jama-jama.", "Kita bersama-sama."],
                ["Pekon sai indah.", "Kampung halaman yang indah."],
                ["Ya ya sai.", "Ya betul / Benar."]
            ],
            destination: ["Way Kambas & Gigi Hiu", "Pusat latihan dan konservasi Gajah Sumatra di Way Kambas serta deretan tebing karang tajam Pantai Gigi Hiu."],
            food: ["Seruit", "Masakan sambal khas berupa ikan sungai bakar dicampur terasi, mangga muda kuini, dan tempoyak durian fermentasi."],
            tradition: ["Kain Tapis", "Tenunan kain katun bersulam benang emas dengan motif alam khas Lampung yang dipakai saat upacara besar."],
            fact: "Mahkota emas pengantin wanita Lampung (siger) melambangkan sembilan sungai utama di Lampung.",
            quiz: { q: "Kain tradisional Lampung yang bersulam benang emas disebut...", answers: ["Tapis", "Ulos", "Sasirangan", "Songket Palembang"], correct: 0 }
        },
        {
            id: "ambon",
            label: "Ambon",
            region: "Maluku",
            mark: "AM",
            summary: "Ambon mewakili jiwa kepulauan Maluku: sejarah perdagangan cengkih/pala dunia, budaya bermusik tinggi, dan kerukunan pela gandong.",
            cards: [
                ["Selamat pagi", "Selamat pagi", "Sapaan pagi Melayu Ambon."],
                ["Tarima kasih", "Terima kasih", "Ucapan terima kasih."],
                ["Apa kabar?", "Apa kabar?", "Sapaan umum kabar Ambon."],
                ["Berapa dong?", "Berapa harganya?", "Tanya harga."]
            ],
            phrases: [
                ["Beta mau belajar musik.", "Saya ingin belajar musik (beta = saya)."],
                ["Mari katong jaga pela.", "Mari kita menjaga persaudaraan pela (katong = kita)."],
                ["Seng apa-apa.", "Tidak apa-apa / Aman."],
                ["Ale dari mana?", "Kamu dari mana? (ale = kamu)."]
            ],
            destination: ["Pantai Natsepa & Benteng Amsterdam", "Pantai pasir putih Natsepa dengan jajanan rujak buah legendaris bersanding dengan benteng kolonial Amsterdam di Hila."],
            food: ["Ikan Kuah Kuning", "Olahan ikan kakap atau tuna segar kuah kuning berempah kunyit disantap dengan papeda sagu."],
            tradition: ["Pela Gandong", "Pakta persaudaraan adat antar-desa adat Kristen dan Islam di Maluku untuk saling menjaga perdamaian."],
            fact: "Ambon dinobatkan oleh UNESCO sebagai 'City of Music' karena bakat seni musik alamiah masyarakatnya yang luar biasa tinggi.",
            quiz: { q: "Ikatan persaudaraan antarnegeri di Maluku dikenal sebagai...", answers: ["Pela Gandong", "Mapalus", "Subak", "Sasi Bali"], correct: 0 }
        },
        {
            id: "gorontalo",
            label: "Gorontalo",
            region: "Sulawesi",
            mark: "GT",
            summary: "Gorontalo memiliki adat Hulondalo yang kuat, benteng kuno peninggalan Portugis, dan tradisi malam pasang lampu tumbilotohe.",
            cards: [
                ["Mopotuwawu", "Mempersatukan", "Prinsip kebersamaan adat."],
                ["Tabea", "Permisi / Salam hormat", "Sapaan sopan."],
                ["Wolo habari?", "Apa kabar?", "Sapaan menanyakan kabar."],
                ["Bolo berapa regge?", "Berapa harganya?", "Bertanya harga barang."]
            ],
            phrases: [
                ["Ami mo belajar adat.", "Kami mau belajar adat (ami = kami)."],
                ["Delo u lipu.", "Sangat cinta tanah air."],
                ["Ayo mo hulondalo.", "Mari ke Gorontalo."],
                ["Dila wolo-wolo.", "Tidak apa-apa / Tidak masalah."]
            ],
            destination: ["Benteng Otanaha & Pantai Olele", "Benteng pertahanan batu purba Otanaha berlatar Danau Limboto bersanding dengan surga selam terumbu karang Olele."],
            food: ["Binte Biluhuta", "Sup jagung manis pipil khas berisi suwiran ikan cakalang asap, kelapa parut segar, kemangi, dan jeruk nipis hangat."],
            tradition: ["Tumbilotohe", "Tradisi menyalakan ribuan lampu minyak di pekarangan rumah menjelang tiga hari terakhir bulan Ramadan."],
            fact: "Benteng Otanaha direkatkan hanya menggunakan campuran putih telur burung maleo pasir dengan kapur sebagai semen alami kuno.",
            quiz: { q: "Tradisi malam pasang lampu di Gorontalo disebut...", answers: ["Tumbilotohe", "Bau Nyale", "Sekaten", "Dugderan"], correct: 0 }
        }
    ];

    function getDefaultPlace() {
        return places[0];
    }

    function getPlaceById(id) {
        return places.find(place => place.id === id) || getDefaultPlace();
    }

    function getPlacesByRegion(region) {
        return !region || region === "Semua" ? places : places.filter(place => place.region === region);
    }

    window.WonderfulData = { regions, places, getDefaultPlace, getPlaceById, getPlacesByRegion };
})();
