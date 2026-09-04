import { storage, showToast } from "./shared-utilities.js";

export function initBahasaPage() {
    const regions = ["Semua", "Sumatra", "Jawa", "Kalimantan", "Sulawesi", "Bali-Nusa", "Papua Raya", "Maluku"];
    const places = [
        {
            id: "jawa",
            label: "Jawa",
            region: "Jawa",
            mark: "JW",
            summary: "Ragam Jawa dikenal dengan unggah-ungguh, seni gamelan, batik, wayang, dan tradisi keraton yang kuat.",
            cards: [["Sugeng enjing", "Selamat pagi", "Sapaan pagi yang sopan."], ["Matur nuwun", "Terima kasih", "Ungkapan apresiasi."], ["Piye kabare?", "Apa kabar?", "Sapaan santai untuk teman sebaya."]],
            phrases: [["Kulo badhe sinau.", "Saya ingin belajar."], ["Nyuwun pangapunten.", "Mohon maaf."], ["Sampun dhahar?", "Sudah makan?"]],
            destination: ["Yogyakarta", "Kota budaya dengan keraton, Malioboro, candi, dan ruang kreatif anak muda."],
            food: ["Gudeg", "Olahan nangka muda bercita rasa manis gurih yang identik dengan Yogyakarta."],
            tradition: ["Wayang Kulit", "Pertunjukan bayangan dengan dalang, gamelan, dan cerita penuh nilai moral."],
            fact: "Bahasa Jawa punya tingkatan tutur seperti ngoko dan krama untuk menunjukkan sopan santun.",
            quiz: { q: "Tradisi pertunjukan bayangan khas Jawa disebut...", answers: ["Wayang Kulit", "Tari Piring", "Karapan Sapi", "Ma'nene"], correct: 0 }
        },
        {
            id: "sunda",
            label: "Sunda",
            region: "Jawa",
            mark: "SD",
            summary: "Budaya Sunda dekat dengan alam pegunungan, keramahan, angklung, dan kuliner segar.",
            cards: [["Wilujeng enjing", "Selamat pagi", "Sapaan pagi yang sopan."], ["Hatur nuhun", "Terima kasih", "Ungkapan apresiasi."], ["Kumaha damang?", "Apa kabar?", "Sapaan umum dalam percakapan."]],
            phrases: [["Abdi hoyong diajar.", "Saya ingin belajar."], ["Punten.", "Permisi atau maaf."], ["Wilujeng sumping.", "Selamat datang."]],
            destination: ["Bandung", "Kota kreatif dengan udara sejuk, museum, kuliner, dan lanskap pegunungan."],
            food: ["Seblak", "Makanan pedas gurih berbahan kerupuk basah dengan bumbu kencur."],
            tradition: ["Angklung", "Alat musik bambu yang dimainkan bersama untuk membentuk harmoni."],
            fact: "Angklung dikenal sebagai simbol kolaborasi karena satu pemain biasanya memegang satu atau beberapa nada.",
            quiz: { q: "Alat musik bambu khas Sunda yang dimainkan dengan digoyangkan adalah...", answers: ["Angklung", "Sasando", "Tifa", "Kolintang"], correct: 0 }
        },
        {
            id: "bali",
            label: "Bali",
            region: "Bali-Nusa",
            mark: "BL",
            summary: "Bali memadukan ritual, seni tari, arsitektur pura, pantai, dan kehidupan komunal yang kuat.",
            cards: [["Rahajeng semeng", "Selamat pagi", "Sapaan pagi."], ["Suksma", "Terima kasih", "Ucapan terima kasih."], ["Kenken kabare?", "Apa kabar?", "Sapaan santai."]],
            phrases: [["Tiang melajah.", "Saya belajar."], ["Ampura.", "Maaf."], ["Rahajeng rauh.", "Selamat datang."]],
            destination: ["Ubud", "Pusat seni, sawah terasering, galeri, dan suasana budaya Bali yang tenang."],
            food: ["Ayam Betutu", "Ayam berbumbu rempah yang dimasak perlahan hingga meresap."],
            tradition: ["Tari Kecak", "Pertunjukan tari dan vokal ritmis yang sering mengangkat kisah Ramayana."],
            fact: "Banyak kegiatan adat Bali terhubung dengan konsep harmoni manusia, alam, dan spiritualitas.",
            quiz: { q: "Pertunjukan Bali yang terkenal dengan suara ritmis 'cak' adalah...", answers: ["Tari Kecak", "Tari Saman", "Tari Jaipong", "Tari Tor-Tor"], correct: 0 }
        },
        {
            id: "minang",
            label: "Minang",
            region: "Sumatra",
            mark: "MN",
            summary: "Minangkabau dikenal dengan rumah gadang, tradisi merantau, sistem matrilineal, dan kuliner kaya rempah.",
            cards: [["Salamaik pagi", "Selamat pagi", "Sapaan pagi."], ["Tarimo kasih", "Terima kasih", "Ungkapan terima kasih."], ["Apo kaba?", "Apa kabar?", "Sapaan umum."]],
            phrases: [["Ambo nio baraja.", "Saya ingin belajar."], ["Maaf yo.", "Mohon maaf."], ["Dima tampeknyo?", "Di mana tempatnya?"]],
            destination: ["Bukittinggi", "Kota sejuk dengan Jam Gadang, Ngarai Sianok, dan jejak sejarah."],
            food: ["Rendang", "Daging berbumbu santan dan rempah yang dimasak lama hingga pekat."],
            tradition: ["Rumah Gadang", "Rumah adat beratap gonjong yang menjadi simbol Minangkabau."],
            fact: "Budaya Minang dikenal dengan pepatah adat basandi syarak, syarak basandi Kitabullah.",
            quiz: { q: "Rumah adat Minangkabau yang beratap gonjong disebut...", answers: ["Rumah Gadang", "Tongkonan", "Honai", "Joglo"], correct: 0 }
        },
        {
            id: "batak",
            label: "Batak",
            region: "Sumatra",
            mark: "BT",
            summary: "Budaya Batak kuat dengan marga, musik gondang, ulos, dan kawasan Danau Toba yang ikonik.",
            cards: [["Horas", "Salam sejahtera", "Sapaan khas Batak."], ["Mauliate", "Terima kasih", "Ucapan terima kasih."], ["Boha kabar?", "Apa kabar?", "Sapaan santai."]],
            phrases: [["Au marsiajar.", "Saya belajar."], ["Sai horas ma.", "Semoga sehat selalu."], ["Tudia ho?", "Ke mana kamu?"]],
            destination: ["Danau Toba", "Danau vulkanik besar dengan Pulau Samosir dan lanskap pegunungan."],
            food: ["Arsik", "Ikan berbumbu kuning khas Batak dengan cita rasa rempah kuat."],
            tradition: ["Ulos", "Kain tradisional yang dipakai dalam upacara adat dan simbol doa restu."],
            fact: "Marga dalam budaya Batak membantu menunjukkan garis keturunan dan hubungan sosial.",
            quiz: { q: "Kain tradisional penting dalam adat Batak adalah...", answers: ["Ulos", "Songket", "Batik", "Endek"], correct: 0 }
        },
        {
            id: "aceh",
            label: "Aceh",
            region: "Sumatra",
            mark: "AC",
            summary: "Aceh dikenal sebagai Serambi Mekkah, dengan tari Saman, kopi Gayo, dan sejarah maritim kuat.",
            cards: [["Seulamat beungoh", "Selamat pagi", "Sapaan pagi."], ["Teurimong geunaseh", "Terima kasih", "Ungkapan apresiasi."], ["Pakon haba?", "Apa kabar?", "Sapaan umum."]],
            phrases: [["Lon jak meujak.", "Saya pergi belajar."], ["Peue haba?", "Ada kabar apa?"], ["Seulamat datang.", "Selamat datang."]],
            destination: ["Banda Aceh", "Kota bersejarah dengan Masjid Raya Baiturrahman dan museum tsunami."],
            food: ["Mie Aceh", "Mie berbumbu kari rempah dengan rasa kuat dan hangat."],
            tradition: ["Tari Saman", "Tari duduk yang menonjolkan kekompakan, ritme, dan syair."],
            fact: "Tari Saman sering disebut tari seribu tangan karena gerakannya cepat dan kompak.",
            quiz: { q: "Tari Aceh yang terkenal dengan gerakan cepat dan kompak adalah...", answers: ["Tari Saman", "Tari Kecak", "Tari Pendet", "Tari Pakarena"], correct: 0 }
        },
        {
            id: "betawi",
            label: "Betawi",
            region: "Jawa",
            mark: "BW",
            summary: "Betawi tumbuh dari pertemuan banyak budaya di Jakarta, terlihat pada lenong, ondel-ondel, dan kuliner kota.",
            cards: [["Selamet pagi", "Selamat pagi", "Sapaan pagi."], ["Makasih", "Terima kasih", "Ungkapan sehari-hari."], ["Apa kabar, lu?", "Apa kabar?", "Sapaan santai."]],
            phrases: [["Gue mau belajar.", "Saya ingin belajar."], ["Permisi ye.", "Permisi ya."], ["Mampir dulu.", "Singgah sebentar."]],
            destination: ["Kota Tua Jakarta", "Kawasan bersejarah dengan museum, arsitektur kolonial, dan ruang publik."],
            food: ["Kerak Telor", "Makanan khas berbahan ketan, telur, ebi, dan serundeng."],
            tradition: ["Ondel-ondel", "Boneka besar ikon Betawi yang hadir dalam perayaan rakyat."],
            fact: "Budaya Betawi menyerap pengaruh Melayu, Arab, Tionghoa, Portugis, dan berbagai etnis Nusantara.",
            quiz: { q: "Ikon boneka besar khas Betawi disebut...", answers: ["Ondel-ondel", "Ogoh-ogoh", "Sigale-gale", "Barong"], correct: 0 }
        },
        {
            id: "dayak",
            label: "Dayak",
            region: "Kalimantan",
            mark: "DY",
            summary: "Ragam Dayak kaya dengan rumah panjang, seni ukir, manik-manik, hutan tropis, dan tradisi komunal.",
            cards: [["Selamat dauh", "Selamat pagi", "Sapaan sederhana."], ["Terima kasih", "Terima kasih", "Ungkapan apresiasi."], ["Apa kabar?", "Apa kabar?", "Sapaan umum."]],
            phrases: [["Aku belajar budaya.", "Saya belajar budaya."], ["Mari menjaga hutan.", "Ajakan merawat alam."], ["Salam damai.", "Sapaan hangat."]],
            destination: ["Tanjung Puting", "Kawasan konservasi orangutan dan ekosistem hutan Kalimantan."],
            food: ["Juhu Singkah", "Olahan umbut rotan khas Kalimantan dengan rasa unik."],
            tradition: ["Rumah Betang", "Rumah panjang yang mencerminkan kehidupan komunal masyarakat Dayak."],
            fact: "Banyak motif Dayak terinspirasi dari alam, leluhur, dan simbol perlindungan.",
            quiz: { q: "Rumah panjang khas banyak komunitas Dayak dikenal sebagai...", answers: ["Rumah Betang", "Rumah Gadang", "Joglo", "Honai"], correct: 0 }
        },
        {
            id: "banjar",
            label: "Banjar",
            region: "Kalimantan",
            mark: "BJ",
            summary: "Banjar dekat dengan budaya sungai, pasar terapung, sasirangan, dan kuliner berkuah hangat.",
            cards: [["Salamat pagi", "Selamat pagi", "Sapaan pagi."], ["Tarima kasih", "Terima kasih", "Ucapan terima kasih."], ["Apa habar?", "Apa kabar?", "Sapaan umum."]],
            phrases: [["Ulun handak belajar.", "Saya ingin belajar."], ["Pian sehat?", "Anda sehat?"], ["Ayo bajalan.", "Ayo berjalan."]],
            destination: ["Pasar Terapung", "Aktivitas jual beli di atas perahu yang menjadi ikon Kalimantan Selatan."],
            food: ["Soto Banjar", "Soto berempah dengan kuah bening dan aroma khas."],
            tradition: ["Sasirangan", "Kain tradisional Banjar dengan motif dan warna khas."],
            fact: "Budaya Banjar sangat dipengaruhi kehidupan sungai sebagai jalur ekonomi dan sosial.",
            quiz: { q: "Kain tradisional khas Banjar disebut...", answers: ["Sasirangan", "Ulos", "Endek", "Tapis"], correct: 0 }
        },
        {
            id: "bugis",
            label: "Bugis",
            region: "Sulawesi",
            mark: "BG",
            summary: "Bugis dikenal sebagai pelaut ulung, pembuat kapal pinisi, dan penjaga tradisi siri' na pacce.",
            cards: [["Mappadeceng", "Semoga baik", "Sapaan bernuansa doa."], ["Terima kasih", "Terima kasih", "Ungkapan apresiasi."], ["Aga kareba?", "Apa kabar?", "Sapaan umum."]],
            phrases: [["Iyya melo belajar.", "Saya ingin belajar."], ["Salama ki.", "Semoga selamat."], ["Kareba madeceng.", "Kabar baik."]],
            destination: ["Bulukumba", "Daerah yang dikenal dengan pembuatan kapal pinisi dan pantai indah."],
            food: ["Coto Makassar", "Hidangan berkuah kaya rempah yang populer di Sulawesi Selatan."],
            tradition: ["Kapal Pinisi", "Warisan kapal layar tradisional yang menunjukkan keahlian maritim Bugis-Makassar."],
            fact: "Pinisi adalah simbol ketangguhan pelaut Nusantara dan keterampilan pembuatan kapal tradisional.",
            quiz: { q: "Kapal layar tradisional yang lekat dengan Bugis-Makassar adalah...", answers: ["Pinisi", "Jukung", "Kora-kora", "Sampan"], correct: 0 }
        },
        {
            id: "madura",
            label: "Madura",
            region: "Jawa",
            mark: "MD",
            summary: "Madura dikenal dengan karapan sapi, garam, batik pesisir, dan kuliner sate yang kuat rasa.",
            cards: [["Salamet lagghu", "Selamat pagi", "Sapaan pagi."], ["Mator sakalangkong", "Terima kasih", "Ungkapan terima kasih."], ["Apa kabar?", "Apa kabar?", "Sapaan umum."]],
            phrases: [["Sengko' ajar.", "Saya belajar."], ["Pangapora.", "Maaf."], ["Dha' remma?", "Ke mana?"]],
            destination: ["Sumenep", "Kawasan dengan keraton, masjid tua, dan pantai-pantai Madura."],
            food: ["Sate Madura", "Sate berbumbu kacang yang terkenal di banyak kota Indonesia."],
            tradition: ["Karapan Sapi", "Lomba pacuan sapi yang menjadi identitas budaya Madura."],
            fact: "Karapan Sapi bukan hanya lomba, tetapi juga perayaan sosial dan kebanggaan komunitas.",
            quiz: { q: "Pacuan sapi khas Madura disebut...", answers: ["Karapan Sapi", "Pacu Jawi", "Makepung", "Pasola"], correct: 0 }
        },
        {
            id: "papua-provinsi",
            label: "Papua",
            region: "Papua Raya",
            mark: "PA",
            summary: "Provinsi Papua kini berpusat di wilayah utara dan timur, dengan Jayapura, Danau Sentani, tifa, noken, dan bahasa-bahasa pesisir yang beragam.",
            cards: [["Wa wa", "Salam hangat", "Sapaan ramah yang sering diasosiasikan dengan suasana Papua."], ["Mace", "Ibu atau perempuan dewasa", "Panggilan akrab dalam percakapan Papua."], ["Pace", "Bapak atau laki-laki dewasa", "Panggilan akrab sehari-hari."]],
            phrases: [["Saya mau belajar budaya Papua.", "Niat belajar budaya lokal."], ["Mari jaga Danau Sentani.", "Ajakan merawat alam."], ["Kitorang bersaudara.", "Ungkapan kebersamaan."], ["Terima kasih banyak.", "Ungkapan apresiasi."]],
            destination: ["Danau Sentani", "Danau luas dekat Jayapura yang dikenal dengan pulau-pulau kecil, festival budaya, dan lanskap perbukitan."],
            food: ["Papeda", "Olahan sagu bertekstur kenyal yang sering disantap dengan ikan kuah kuning."],
            tradition: ["Festival Danau Sentani", "Perayaan budaya yang menampilkan tari, musik, perahu, dan keragaman masyarakat sekitar danau."],
            fact: "Setelah pemekaran 2022, Provinsi Papua tetap menjadi pintu penting untuk mengenal budaya pesisir utara Tanah Papua.",
            quiz: { q: "Destinasi dan festival budaya yang lekat dengan Provinsi Papua adalah...", answers: ["Danau Sentani", "Jam Gadang", "Tana Toraja", "Pulau Penyengat"], correct: 0 }
        },
        {
            id: "papua-barat",
            label: "Papua Barat",
            region: "Papua Raya",
            mark: "PB",
            summary: "Papua Barat dikenal dengan Manokwari, Pegunungan Arfak, Teluk Cenderawasih, tradisi pesisir, dan lanskap hutan pegunungan.",
            cards: [["Selamat pagi", "Selamat pagi", "Sapaan umum lintas komunitas."], ["Kitorang", "Kita atau kami", "Kata sehari-hari dalam Melayu Papua."], ["Sa senang belajar", "Saya senang belajar", "Kalimat sederhana untuk latihan."]],
            phrases: [["Kitorang jaga hutan.", "Kami menjaga hutan."], ["Sa mau lihat Pegunungan Arfak.", "Saya ingin melihat Pegunungan Arfak."], ["Mari belajar dari masyarakat lokal.", "Ajakan menghargai pengetahuan setempat."]],
            destination: ["Pegunungan Arfak", "Kawasan pegunungan dekat Manokwari dengan danau, burung endemik, dan komunitas adat yang kuat."],
            food: ["Ikan Bakar Manokwari", "Ikan bakar dengan sambal khas yang kuat dan segar."],
            tradition: ["Rumah Kaki Seribu", "Rumah tradisional suku Arfak dengan banyak tiang penyangga sebagai ciri arsitektur."],
            fact: "Papua Barat memiliki kekayaan ekologi dari pesisir Teluk Cenderawasih sampai dataran tinggi Arfak.",
            quiz: { q: "Rumah tradisional suku Arfak di Papua Barat dikenal sebagai...", answers: ["Rumah Kaki Seribu", "Rumah Gadang", "Joglo", "Tongkonan"], correct: 0 }
        },
        {
            id: "papua-selatan",
            label: "Papua Selatan",
            region: "Papua Raya",
            mark: "PS",
            summary: "Papua Selatan meliputi kawasan Merauke dan sekitarnya, dikenal dengan budaya Marind, rawa, savana, sagu, dan Taman Nasional Wasur.",
            cards: [["Izakod bekai izakod kai", "Satu hati satu tujuan", "Semboyan yang sering dilekatkan dengan Merauke."], ["Sagu", "Pangan pokok", "Bahan makanan penting di banyak komunitas Papua."], ["Amai", "Sapaan hangat", "Contoh sapaan sederhana untuk latihan."]],
            phrases: [["Saya mau belajar tentang Merauke.", "Niat belajar daerah selatan Papua."], ["Mari jaga rawa dan savana.", "Ajakan menjaga ekosistem."], ["Sagu penting untuk hidup.", "Kalimat tentang pangan lokal."]],
            destination: ["Taman Nasional Wasur", "Kawasan rawa, savana, dan keanekaragaman hayati di sekitar Merauke."],
            food: ["Sagu Sep", "Olahan sagu bakar khas Merauke yang dekat dengan kehidupan masyarakat setempat."],
            tradition: ["Budaya Marind", "Tradisi masyarakat Marind yang kuat dengan identitas klan, alam, dan cerita leluhur."],
            fact: "Papua Selatan adalah salah satu provinsi baru yang diresmikan pada 2022 berdasarkan UU Nomor 14 Tahun 2022.",
            quiz: { q: "Provinsi Papua Selatan berpusat kuat pada kawasan budaya dan alam di sekitar...", answers: ["Merauke", "Bandung", "Banjarmasin", "Bukittinggi"], correct: 0 }
        },
        {
            id: "papua-tengah",
            label: "Papua Tengah",
            region: "Papua Raya",
            mark: "PT",
            summary: "Papua Tengah memiliki Nabire, Mimika, Paniai, dan wilayah pegunungan-danau yang kaya budaya Mee, Amungme, Kamoro, dan komunitas lain.",
            cards: [["Amapane", "Terima kasih", "Ungkapan apresiasi dalam salah satu konteks lokal Papua Tengah."], ["Danau", "Danau", "Kata kunci lanskap Paniai."], ["Sa belajar pelan-pelan", "Saya belajar pelan-pelan", "Kalimat latihan."]],
            phrases: [["Saya mau kenal budaya Mee.", "Niat mengenal budaya lokal."], ["Danau Paniai indah.", "Kalimat tentang destinasi."], ["Kitorang hormati adat.", "Kami menghormati adat."]],
            destination: ["Danau Paniai", "Danau dataran tinggi yang menjadi ruang hidup, perikanan, dan identitas masyarakat sekitar."],
            food: ["Udang Selingkuh", "Kuliner air tawar populer di kawasan pegunungan Papua."],
            tradition: ["Noken", "Tas rajut multifungsi yang juga menjadi simbol identitas, kerja, dan kehidupan sosial."],
            fact: "Papua Tengah dibentuk melalui UU Nomor 15 Tahun 2022, dengan Nabire sebagai ibu kota provinsi.",
            quiz: { q: "Ibu kota Provinsi Papua Tengah berada di...", answers: ["Nabire", "Sorong", "Denpasar", "Medan"], correct: 0 }
        },
        {
            id: "papua-pegunungan",
            label: "Papua Pegunungan",
            region: "Papua Raya",
            mark: "PG",
            summary: "Papua Pegunungan adalah provinsi dataran tinggi dengan Wamena, Lembah Baliem, honai, mumi adat, dan kebun-kebun pegunungan.",
            cards: [["Wamena", "Kota di Lembah Baliem", "Pintu masuk penting kawasan pegunungan."], ["Honai", "Rumah adat", "Rumah bundar khas masyarakat pegunungan."], ["Apen", "Ubi", "Contoh pangan penting di dataran tinggi."]],
            phrases: [["Saya mau belajar tentang honai.", "Niat belajar arsitektur lokal."], ["Lembah Baliem luas.", "Kalimat tentang destinasi."], ["Mari hormati kepala suku.", "Ajakan menghargai struktur adat."]],
            destination: ["Lembah Baliem", "Lembah dataran tinggi yang dikenal dengan festival budaya, honai, kebun, dan panorama pegunungan."],
            food: ["Ubi Bakar Batu", "Ubi dan bahan pangan lokal yang dimasak dalam tradisi bakar batu."],
            tradition: ["Bakar Batu", "Tradisi memasak komunal dengan batu panas untuk merayakan kebersamaan dan momen adat."],
            fact: "Papua Pegunungan dibentuk melalui UU Nomor 16 Tahun 2022 and menjadi provinsi yang seluruh wilayahnya berada di pedalaman pegunungan.",
            quiz: { q: "Rumah adat yang lekat dengan Papua Pegunungan disebut...", answers: ["Honai", "Baileo", "Rumah Gadang", "Lamin"], correct: 0 }
        },
        {
            id: "papua-barat-daya",
            label: "Papua Barat Daya",
            region: "Papua Raya",
            mark: "BD",
            summary: "Papua Barat Daya berpusat di Sorong dan mencakup Raja Ampat, dengan budaya pesisir, pulau karang, sasi laut, dan jalur maritim.",
            cards: [["Sorong", "Kota gerbang Raja Ampat", "Kata kunci wilayah Papua Barat Daya."], ["Sasi", "Aturan adat menjaga alam", "Praktik konservasi lokal di wilayah timur Indonesia."], ["Kitorang jaga laut", "Kami menjaga laut", "Kalimat latihan."]],
            phrases: [["Saya mau ke Raja Ampat.", "Niat perjalanan budaya dan alam."], ["Sasi menjaga laut.", "Kalimat tentang tradisi konservasi."], ["Terumbu karang harus dijaga.", "Ajakan menjaga ekosistem."]],
            destination: ["Raja Ampat", "Kepulauan dengan laut jernih, karang, dan biodiversitas tinggi."],
            food: ["Ikan Kuah Kuning", "Olahan ikan berbumbu kunyit yang sering disantap dengan papeda."],
            tradition: ["Sasi Laut", "Aturan adat untuk mengatur waktu pemanfaatan sumber daya laut agar tetap lestari."],
            fact: "Papua Barat Daya menjadi provinsi ke-38 Indonesia melalui UU Nomor 29 Tahun 2022.",
            quiz: { q: "Provinsi Papua Barat Daya dikenal sebagai gerbang menuju...", answers: ["Raja Ampat", "Malioboro", "Danau Toba", "Kota Tua"], correct: 0 }
        },
        {
            id: "sasak",
            label: "Sasak",
            region: "Bali-Nusa",
            mark: "SK",
            summary: "Sasak di Lombok dikenal dengan desa adat, tenun, lumbung, pantai, dan tradisi yang dekat dengan ritme agraris.",
            cards: [["Selamat semeton", "Salam saudara", "Sapaan bernuansa persaudaraan."], ["Matur tampiasih", "Terima kasih", "Ungkapan apresiasi."], ["Napi kabar?", "Apa kabar?", "Sapaan umum."], ["Titiang mele belajar", "Saya ingin belajar", "Niat belajar sederhana."]],
            phrases: [["Ayo melajah budaya.", "Mari belajar budaya."], ["Ampure.", "Maaf atau permisi."], ["Silaq mampir.", "Silakan singgah."]],
            destination: ["Desa Sade", "Desa adat Sasak dengan rumah tradisional, tenun, dan pola hidup komunal."],
            food: ["Ayam Taliwang", "Ayam berbumbu pedas gurih yang menjadi ikon kuliner Lombok."],
            tradition: ["Bau Nyale", "Tradisi menangkap cacing laut yang terhubung dengan legenda Putri Mandalika."],
            fact: "Tradisi Bau Nyale memadukan cerita rakyat, kalender alam, dan perayaan komunitas pesisir.",
            quiz: { q: "Tradisi Lombok yang berkaitan dengan legenda Putri Mandalika adalah...", answers: ["Bau Nyale", "Sekaten", "Tabuik", "Pasola"], correct: 0 }
        },
        {
            id: "toraja",
            label: "Toraja",
            region: "Sulawesi",
            mark: "TJ",
            summary: "Toraja memiliki arsitektur tongkonan, ukiran, upacara adat, kopi, dan lanskap dataran tinggi yang khas.",
            cards: [["Melo tongan", "Baik sekali", "Ungkapan positif."], ["Kurre sumanga'", "Terima kasih", "Ucapan syukur atau terima kasih."], ["Umba susi kabar?", "Bagaimana kabar?", "Sapaan umum."], ["Tabe'", "Permisi", "Sapaan sopan."]],
            phrases: [["Aku la belajar budaya.", "Saya akan belajar budaya."], ["Tabe' lako mai.", "Permisi ke sini."], ["Kurre sumanga' sola nasang.", "Terima kasih semuanya."]],
            destination: ["Kete Kesu", "Kawasan adat dengan tongkonan, ukiran, dan situs budaya Toraja."],
            food: ["Pa'piong", "Hidangan berbumbu yang dimasak dalam bambu."],
            tradition: ["Tongkonan", "Rumah adat beratap melengkung yang menjadi pusat identitas keluarga Toraja."],
            fact: "Tongkonan bukan hanya rumah, tetapi juga simbol garis keturunan dan ruang musyawarah keluarga.",
            quiz: { q: "Rumah adat Toraja yang beratap melengkung disebut...", answers: ["Tongkonan", "Joglo", "Baileo", "Lamin"], correct: 0 }
        },
        {
            id: "melayu-riau",
            label: "Melayu Riau",
            region: "Sumatra",
            mark: "MR",
            summary: "Melayu Riau kuat dengan pantun, gurindam, tanjak, zapin, dan sejarah literasi maritim Nusantara.",
            cards: [["Selamat pagi", "Selamat pagi", "Sapaan umum."], ["Terima kasih", "Terima kasih", "Ungkapan apresiasi."], ["Apa khabar?", "Apa kabar?", "Sapaan harian."], ["Mohon izin", "Permisi", "Ungkapan sopan."]],
            phrases: [["Saya hendak belajar.", "Saya ingin belajar."], ["Silakan singgah.", "Ajak mampir."], ["Elok budi elok bahasa.", "Budi dan bahasa perlu dijaga."]],
            destination: ["Pulau Penyengat", "Pulau bersejarah dengan jejak sastra, kerajaan, dan Masjid Raya Sultan Riau."],
            food: ["Gulai Ikan Patin", "Olahan ikan patin berbumbu gurih yang populer di Riau."],
            tradition: ["Pantun Melayu", "Tradisi tutur berima yang menyampaikan nasihat, humor, dan nilai sosial."],
            fact: "Pantun Melayu membantu menjaga kecakapan berbahasa, etika, dan memori budaya lisan.",
            quiz: { q: "Tradisi tutur berima yang lekat dengan budaya Melayu adalah...", answers: ["Pantun", "Haiku", "Mantra Bali", "Syair bebas"], correct: 0 }
        },
        {
            id: "lampung",
            label: "Lampung",
            region: "Sumatra",
            mark: "LP",
            summary: "Lampung dikenal dengan tapis, aksara Lampung, siger, gajah, dan wilayah pesisir yang strategis.",
            cards: [["Tabik pun", "Salam hormat", "Sapaan sopan khas Lampung."], ["Terima kasih", "Terima kasih", "Ucapan apresiasi."], ["Api kabar?", "Apa kabar?", "Sapaan umum."], ["Nyak haga belajar", "Saya ingin belajar", "Kalimat niat belajar."]],
            phrases: [["Tabik pun, ulun belajar.", "Salam, saya belajar."], ["Sikam jama-jama.", "Kita bersama-sama."], ["Pekon sai indah.", "Kampung yang indah."]],
            destination: ["Way Kambas", "Taman nasional yang dikenal dengan konservasi gajah dan ekosistem hutan."],
            food: ["Seruit", "Hidangan ikan dengan sambal dan lalapan khas Lampung."],
            tradition: ["Kain Tapis", "Kain tradisional bersulam benang emas yang dipakai dalam acara adat."],
            fact: "Siger menjadi simbol kehormatan dan identitas perempuan Lampung dalam banyak representasi budaya.",
            quiz: { q: "Kain tradisional Lampung yang bersulam benang emas disebut...", answers: ["Tapis", "Ulos", "Sasirangan", "Songket Palembang"], correct: 0 }
        },
        {
            id: "ambon",
            label: "Ambon",
            region: "Maluku",
            mark: "AM",
            summary: "Ambon mewakili kekayaan Maluku: musik, rempah, pela gandong, pantai, dan tradisi persaudaraan lintas komunitas.",
            cards: [["Selamat pagi", "Selamat pagi", "Sapaan umum."], ["Tarima kasih", "Terima kasih", "Ungkapan apresiasi."], ["Apa kabar?", "Apa kabar?", "Sapaan umum."], ["Beta mau belajar", "Saya ingin belajar", "Niat belajar."]],
            phrases: [["Ale sehat?", "Kamu sehat?"], ["Mari katong jaga budaya.", "Mari kita menjaga budaya."], ["Seng apa-apa.", "Tidak apa-apa."]],
            destination: ["Pantai Natsepa", "Pantai populer di Ambon dengan suasana pesisir dan kuliner rujak natsepa."],
            food: ["Ikan Kuah Kuning", "Olahan ikan berbumbu kunyit yang sering disantap dengan papeda."],
            tradition: ["Pela Gandong", "Ikatan persaudaraan antarnegeri yang menjaga solidaritas sosial."],
            fact: "Maluku sering disebut kepulauan rempah karena peran historis pala dan cengkih dalam perdagangan dunia.",
            quiz: { q: "Ikatan persaudaraan antarnegeri di Maluku dikenal sebagai...", answers: ["Pela Gandong", "Mapalus", "Subak", "Sasi Bali"], correct: 0 }
        },
        {
            id: "gorontalo",
            label: "Gorontalo",
            region: "Sulawesi",
            mark: "GT",
            summary: "Gorontalo memiliki tradisi lisan, adat Hulondalo, benteng bersejarah, dan kuliner laut yang kuat.",
            cards: [["Mopotuwawu", "Bersatu", "Nilai kebersamaan."], ["Tabea", "Permisi atau salam", "Sapaan sopan."], ["Wolo kabar?", "Apa kabar?", "Sapaan umum."], ["Ami belajar", "Saya belajar", "Kalimat belajar."]],
            phrases: [["Tabea, ami mo belajar.", "Permisi, saya mau belajar."], ["Delo u lipu.", "Cinta tanah kelahiran."], ["Ayo mo hulondalo.", "Mari mengenal Gorontalo."]],
            destination: ["Benteng Otanaha", "Situs bersejarah di perbukitan dengan panorama Danau Limboto."],
            food: ["Binte Biluhuta", "Sup jagung khas Gorontalo dengan rasa segar gurih."],
            tradition: ["Tumbilotohe", "Tradisi malam pasang lampu menjelang akhir Ramadan."],
            fact: "Tumbilotohe membuat kampung bercahaya dengan lampu tradisional dan memperkuat suasana kebersamaan.",
            quiz: { q: "Tradisi malam pasang lampu di Gorontalo disebut...", answers: ["Tumbilotohe", "Bau Nyale", "Sekaten", "Dugderan"], correct: 0 }
        }
    ];

    const languageSelect = document.getElementById("languageSelect");
    const flashcard = document.getElementById("flashcard");
    const phraseGrid = document.getElementById("phraseGrid");
    const vocabList = document.getElementById("vocabList");
    const quizQuestion = document.getElementById("languageQuizQuestion");
    const answerGrid = document.getElementById("languageAnswers");
    const regionChips = document.getElementById("regionChips");
    const cultureGrid = document.getElementById("cultureGrid");
    const languageSearch = document.getElementById("languageSearch");
    const routeGoal = document.getElementById("routeGoal");
    const sortCulture = document.getElementById("sortCulture");
    const sessionTarget = document.getElementById("sessionTarget");
    const languageRecommendation = document.getElementById("languageRecommendation");
    const quickBrief = document.getElementById("quickBrief");
    const compareSelect = document.getElementById("compareSelect");
    const compareOutput = document.getElementById("compareOutput");
    const journeyGrid = document.getElementById("journeyGrid");
    const listenWord = document.getElementById("listenWord");
    const toggleFavorite = document.getElementById("toggleFavorite");
    const markMastered = document.getElementById("markMastered");
    const nextCultureQuiz = document.getElementById("nextCultureQuiz");
    const resetLanguageProgress = document.getElementById("resetLanguageProgress");
    const startRecommendedRoute = document.getElementById("startRecommendedRoute");
    const randomCulture = document.getElementById("randomCulture");
    const focusPapua = document.getElementById("focusPapua");
    const quickQuiz = document.getElementById("quickQuiz");
    const copyMission = document.getElementById("copyMission");
    const flashcardProgress = document.getElementById("flashcardProgress");
    const flashcardBar = document.getElementById("flashcardBar");
    const flowCards = Array.from(document.querySelectorAll(".learning-flow-card"));
    const cultureResultTitle = document.getElementById("cultureResultTitle");
    const cultureResultMeta = document.getElementById("cultureResultMeta");
    let currentIndex = 0;
    let showingMeaning = false;
    let collectionMode = storage.get("wonder_mode", "semua");
    let selectedRegion = storage.get("wonder_region", "Semua");
    let selectedPlaceId = storage.get("wonder_place", "jawa");
    let sortMode = storage.get("wonder_sort", "recommended");
    let targetCount = Number(storage.get("wonder_target", 3)) || 3;
    const progress = storage.get("bahasa_progress", { reviewed: 0, correct: 0, explored: [], quizDone: 0, favorites: [], mastered: [], streak: 0, lastActiveDay: "" });

    if (selectedRegion === "Papua-Maluku") selectedRegion = "Papua Raya";
    if (!regions.includes(selectedRegion)) selectedRegion = "Semua";
    if (selectedPlaceId === "papua") selectedPlaceId = "papua-provinsi";
    if (!places.some(place => place.id === selectedPlaceId)) selectedPlaceId = "jawa";
    
    if (languageSelect) {
        languageSelect.innerHTML = places.map(place => `<option value="${place.id}">${place.label}</option>`).join("");
        languageSelect.value = selectedPlaceId;
    }
    if (compareSelect) {
        compareSelect.innerHTML = places.map(place => `<option value="${place.id}">${place.label}</option>`).join("");
        compareSelect.value = places.find(place => place.id !== selectedPlaceId)?.id || selectedPlaceId;
    }
    if (!["semua", "belum", "favorit", "mastered"].includes(collectionMode)) collectionMode = "semua";
    if (!["recommended", "az", "region", "unexplored"].includes(sortMode)) sortMode = "recommended";
    if (![3, 5, 7, 10].includes(targetCount)) targetCount = 3;
    if (sortCulture) sortCulture.value = sortMode;
    if (sessionTarget) sessionTarget.value = String(targetCount);

    function getSelectedPlace() {
        return places.find(place => place.id === selectedPlaceId) || places[0];
    }

    function setActiveFlow(stepId) {
        flowCards.forEach(card => {
            const isActive = card.dataset.flowStep === stepId;
            card.classList.toggle("active", isActive);
            if (isActive) {
                card.setAttribute("aria-current", "step");
            } else {
                card.removeAttribute("aria-current");
            }
        });
    }

    function safeSetText(id, val) {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    }

    function setOptionalText(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    }

    function getFilteredPlaces() {
        return selectedRegion === "Semua" ? places : places.filter(place => place.region === selectedRegion);
    }

    function getSearchQuery() {
        return (languageSearch?.value || "").trim().toLowerCase();
    }

    function matchesSearch(place) {
        const query = getSearchQuery();
        if (!query) return true;
        const haystack = [
            place.label,
            place.region,
            place.summary,
            place.destination[0],
            place.destination[1],
            place.food[0],
            place.food[1],
            place.tradition[0],
            place.tradition[1],
            place.fact,
            ...place.cards.flat(),
            ...place.phrases.flat()
        ].join(" ").toLowerCase();
        return haystack.includes(query);
    }

    function getVisiblePlaces() {
        const explored = new Set(progress.explored || []);
        const favorites = new Set(progress.favorites || []);
        const mastered = new Set(progress.mastered || []);
        const visible = getFilteredPlaces().filter(place => {
            if (!matchesSearch(place)) return false;
            if (collectionMode === "belum") return !explored.has(place.id);
            if (collectionMode === "favorit") return favorites.has(place.id);
            if (collectionMode === "mastered") return mastered.has(place.id);
            return true;
        });
        const sorted = [...visible];
        if (sortMode === "az") {
            sorted.sort((a, b) => a.label.localeCompare(b.label));
        } else if (sortMode === "region") {
            sorted.sort((a, b) => `${a.region} ${a.label}`.localeCompare(`${b.region} ${b.label}`));
        } else if (sortMode === "unexplored") {
            sorted.sort((a, b) => Number(explored.has(a.id)) - Number(explored.has(b.id)) || a.label.localeCompare(b.label));
        }
        return sorted;
    }

    function todayKey() {
        return new Date().toISOString().slice(0, 10);
    }

    function recordActivity() {
        const today = todayKey();
        if (progress.lastActiveDay !== today) {
            progress.streak = (progress.streak || 0) + 1;
            progress.lastActiveDay = today;
        }
    }

    function toggleSetValue(key, value) {
        const values = new Set(progress[key] || []);
        if (values.has(value)) {
            values.delete(value);
        } else {
            values.add(value);
        }
        progress[key] = Array.from(values);
        updateMetrics();
    }

    function updateMetrics() {
        const exploredCount = new Set(progress.explored || []).size;
        const favoriteCount = new Set(progress.favorites || []).size;
        const masteredCount = new Set(progress.mastered || []).size;
        const accuracy = Math.round((progress.correct / Math.max(progress.reviewed, 1)) * 100);
        const remainingCount = Math.max(places.length - exploredCount, 0);
        const completion = Math.round((exploredCount / places.length) * 100);
        safeSetText("languageReviewed", progress.reviewed);
        safeSetText("languageCorrect", `${accuracy}%`);
        safeSetText("languageTotal", places.length);
        safeSetText("missionCount", `${exploredCount}/${places.length}`);
        const missionBar = document.getElementById("missionBar");
        if (missionBar) missionBar.style.width = `${Math.round((exploredCount / places.length) * 100)}%`;
        setOptionalText("languageFavoriteCount", favoriteCount);
        setOptionalText("languageMasteredCount", masteredCount);
        setOptionalText("languageStreakCount", progress.streak || 0);
        setOptionalText("languageVisibleCount", getVisiblePlaces().length);
        setOptionalText("languageRemainingCount", remainingCount);
        setOptionalText("languageCompletionCount", `${completion}%`);

        let badge = "Explorer Baru";
        let title = "Mulai jelajah pertamamu.";
        let text = "Pilih satu region dan buka kartu budaya untuk memulai misi.";
        if (exploredCount >= 10) {
            badge = "Nusantara Master";
            title = "Kamu hampir menamatkan Wonderful Indonesia.";
            text = "Lanjutkan quiz budaya untuk mempertahankan akurasi eksplorasi.";
        } else if (exploredCount >= 6) {
            badge = "Culture Hunter";
            title = "Setengah Nusantara sudah terbuka.";
            text = "Coba region yang belum tersentuh agar koleksimu makin lengkap.";
        } else if (exploredCount >= 3) {
            badge = "Region Scout";
            title = "Eksplorasi mulai panas.";
            text = "Buka beberapa kartu budaya lagi untuk menaikkan badge.";
        }
        safeSetText("explorerBadge", badge);
        safeSetText("missionBadge", badge);
        safeSetText("missionTitle", title);
        safeSetText("missionText", text);
        safeSetText("phoneRegionTitle", `${getVisiblePlaces().length} pilihan`);
        safeSetText("phoneRegionText", selectedRegion === "Semua" ? "Jelajah semua region Indonesia." : `Fokus region ${selectedRegion}.`);
        const langTrack = document.querySelector(".language-progress-track div");
        if (langTrack) langTrack.style.width = `${Math.round((exploredCount / places.length) * 100)}%`;
        if (toggleFavorite) toggleFavorite.textContent = (progress.favorites || []).includes(selectedPlaceId) ? "Hapus Favorit" : "Favorit";
        if (markMastered) markMastered.textContent = (progress.mastered || []).includes(selectedPlaceId) ? "Sudah Dikuasai" : "Tandai Dikuasai";
        storage.set("bahasa_progress", progress);
        storage.set("wonder_region", selectedRegion);
        storage.set("wonder_place", selectedPlaceId);
        storage.set("wonder_mode", collectionMode);
        storage.set("wonder_sort", sortMode);
        storage.set("wonder_target", targetCount);
    }

    function markExplored(placeId) {
        recordActivity();
        const explored = new Set(progress.explored || []);
        const before = explored.size;
        explored.add(placeId);
        progress.explored = Array.from(explored);
        if (explored.size > before) {
            showToast("Daerah baru masuk koleksi eksplorasi.");
        }
        updateMetrics();
    }

    function selectRegion(region) {
        if (region === "Papua") region = "Papua Raya";
        selectedRegion = region;
        const firstPlace = getVisiblePlaces()[0] || getFilteredPlaces()[0];
        if (firstPlace) selectedPlaceId = firstPlace.id;
        currentIndex = 0;
        if (languageSelect) languageSelect.value = selectedPlaceId;
        setActiveFlow("jelajah-region");
        renderAll();
    }

    function syncIndonesiaMap() {
        document.querySelectorAll(".map-region").forEach(regionEl => {
            const mapRegion = regionEl.dataset.region === "Papua" ? "Papua Raya" : regionEl.dataset.region;
            regionEl.classList.toggle("active", mapRegion === selectedRegion);
        });
    }

    function bindIndonesiaMap() {
        document.querySelectorAll(".map-region").forEach(regionEl => {
            regionEl.addEventListener("click", () => selectRegion(regionEl.dataset.region));
            regionEl.addEventListener("keydown", event => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    selectRegion(regionEl.dataset.region);
                }
            });
        });
    }

    function renderRegionChips() {
        if (!regionChips) return;
        regionChips.innerHTML = regions.map(region => `
            <button class="region-chip ${region === selectedRegion ? "active" : ""}" data-region="${region}">
                ${region}
            </button>
        `).join("");
        regionChips.querySelectorAll(".region-chip").forEach(btn => {
            btn.addEventListener("click", () => selectRegion(btn.dataset.region));
        });
    }

    function renderCultureGrid() {
        if (!cultureGrid) return;
        const explored = new Set(progress.explored || []);
        const favorites = new Set(progress.favorites || []);
        const mastered = new Set(progress.mastered || []);
        const visiblePlaces = getVisiblePlaces();
        const query = getSearchQuery();
        const modeLabel = {
            semua: "Semua kartu",
            belum: "Belum dibuka",
            favorit: "Favorit",
            mastered: "Dikuasai"
        }[collectionMode] || "Semua kartu";
        const sortLabel = {
            recommended: "Rekomendasi",
            az: "Nama A-Z",
            region: "Region",
            unexplored: "Belum dijelajahi dulu"
        }[sortMode] || "Rekomendasi";
        if (cultureResultTitle) {
            cultureResultTitle.textContent = `${visiblePlaces.length} kartu ditemukan`;
        }
        if (cultureResultMeta) {
            cultureResultMeta.textContent = `${selectedRegion === "Semua" ? "Semua region" : selectedRegion} - ${modeLabel} - ${sortLabel}${query ? ` - Pencarian "${query}"` : ""}`;
        }
        cultureGrid.innerHTML = visiblePlaces.length ? visiblePlaces.map(place => `
            <button class="culture-card ${place.id === selectedPlaceId ? "active" : ""} ${favorites.has(place.id) ? "is-favorite" : ""} ${mastered.has(place.id) ? "is-mastered" : ""}" data-place="${place.id}">
                <span class="culture-mark">${place.mark}</span>
                <div>
                    <strong>${place.label}</strong>
                    <p>${place.summary}</p>
                    <small>${place.region} - ${place.destination[0]} - ${mastered.has(place.id) ? "Dikuasai" : explored.has(place.id) ? "Sudah dijelajahi" : "Belum dibuka"}${favorites.has(place.id) ? " - Favorit" : ""}</small>
                </div>
            </button>
        `).join("") : `<div class="empty-state">Tidak ada daerah yang cocok dengan filter. Coba ubah mode koleksi atau kata pencarian.</div>`;
        cultureGrid.querySelectorAll(".culture-card").forEach(card => {
            card.addEventListener("click", () => {
                selectedPlaceId = card.dataset.place;
                if (languageSelect) languageSelect.value = selectedPlaceId;
                currentIndex = 0;
                markExplored(selectedPlaceId);
                setActiveFlow("latihan");
                renderAll();
            });
        });
    }

    function getRecommendedPlace() {
        const explored = new Set(progress.explored || []);
        const mastered = new Set(progress.mastered || []);
        const candidates = getFilteredPlaces().filter(place => matchesSearch(place));
        return candidates.find(place => !explored.has(place.id))
            || candidates.find(place => !mastered.has(place.id))
            || candidates[0]
            || places[0];
    }

    function renderRecommendation() {
        const recommended = getRecommendedPlace();
        const goalCopy = {
            balanced: "Mulai dari kosakata, lanjut fakta, lalu jawab quiz budaya.",
            language: `Fokuskan pada ${recommended.cards.length} kosakata dan ${recommended.phrases.length} frasa harian.`,
            food: `Pelajari kuliner ${recommended.food[0]} dan kaitannya dengan lanskap lokal.`,
            travel: `Gunakan ${recommended.destination[0]} sebagai pintu masuk memahami wilayahnya.`,
            tradition: `Dalami ${recommended.tradition[0]} sebagai identitas budaya utama.`
        }[routeGoal?.value || "balanced"] || "Mulai dari kosakata, lanjut fakta, lalu jawab quiz budaya.";
        if (!languageRecommendation) return;
        languageRecommendation.innerHTML = `
            <h3>${recommended.label}</h3>
            <p>${goalCopy}</p>
            <small class="mini-tag">${recommended.region} - ${recommended.destination[0]}</small>
        `;
        if (startRecommendedRoute) startRecommendedRoute.dataset.place = recommended.id;
        if (quickBrief) {
            const explored = new Set(progress.explored || []);
            quickBrief.innerHTML = `
                <strong>Brief cepat</strong>
                <p>${explored.has(recommended.id) ? "Lanjutkan pendalaman" : "Buka daerah baru"}: ${recommended.cards[0][0]}, ${recommended.food[0]}, dan ${recommended.tradition[0]}.</p>
            `;
        }
    }

    function renderDossier() {
        const selected = getSelectedPlace();
        safeSetText("skillFocusTitle", `${selected.label}: frasa sopan dan identitas lokal`);
        safeSetText("skillFocusText", `Prioritaskan sapaan "${selected.cards[0][0]}", ucapan terima kasih, dan satu frasa percakapan. Setelah itu hubungkan dengan fakta: ${selected.fact}`);
        safeSetText("miniProjectTitle", `Kartu Cerita ${selected.destination[0]}`);
        safeSetText("miniProjectText", `Buat 4 kalimat pendek: sapaan lokal, alasan mengunjungi ${selected.destination[0]}, kuliner ${selected.food[0]}, dan tradisi ${selected.tradition[0]}.`);
    }

    function renderCompare() {
        if (!compareSelect || !compareOutput) return;
        const selected = getSelectedPlace();
        if (compareSelect.value === selected.id) {
            compareSelect.value = places.find(place => place.id !== selected.id)?.id || selected.id;
        }
        const compared = places.find(place => place.id === compareSelect.value) || places[0];
        compareOutput.innerHTML = `
            <div class="compare-row">
                <span>${selected.label} vs ${compared.label}</span>
                <p><strong>Bahasa:</strong> ${selected.cards[0][0]} dibanding ${compared.cards[0][0]}.</p>
                <p><strong>Budaya:</strong> ${selected.tradition[0]} dibanding ${compared.tradition[0]}.</p>
                <p><strong>Kuliner:</strong> ${selected.food[0]} dibanding ${compared.food[0]}.</p>
            </div>
        `;
    }

    function renderJourney() {
        if (!journeyGrid) return;
        const favorites = new Set(progress.favorites || []);
        const explored = new Set(progress.explored || []);
        const prioritized = [
            ...places.filter(place => !explored.has(place.id)),
            ...places.filter(place => favorites.has(place.id)),
            ...places
        ];
        const uniqueRoute = Array.from(new Map(prioritized.map(place => [place.id, place])).values()).slice(0, 7);
        const actionByGoal = {
            balanced: place => `Flashcard, baca fakta, lalu jawab quiz ${place.label}.`,
            language: place => `Hafalkan sapaan "${place.cards[0][0]}" dan ulangi 3 frasa.`,
            food: place => `Catat bahan atau ciri rasa ${place.food[0]}.`,
            travel: place => `Buat alasan singkat mengunjungi ${place.destination[0]}.`,
            tradition: place => `Ringkas makna ${place.tradition[0]} dalam 2 kalimat.`
        };
        const planner = actionByGoal[routeGoal?.value || "balanced"] || actionByGoal.balanced;
        journeyGrid.innerHTML = uniqueRoute.slice(0, targetCount).map((place, index) => `
            <article class="journey-day">
                <span>Hari ${index + 1}</span>
                <strong>${place.label}</strong>
                <p>${planner(place)}</p>
                <small>${place.region} - ${place.destination[0]}</small>
            </article>
        `).join("");
    }

    function renderCultureDetails() {
        const selected = getSelectedPlace();
        safeSetText("cultureTitle", selected.label);
        safeSetText("cultureSummary", selected.summary);
        safeSetText("destinationTitle", `${selected.label}: destinasi, kuliner, tradisi.`);
        safeSetText("cultureFact", selected.fact);
        safeSetText("destinationName", selected.destination[0]);
        safeSetText("destinationDesc", selected.destination[1]);
        safeSetText("foodName", selected.food[0]);
        safeSetText("foodDesc", selected.food[1]);
        safeSetText("traditionName", selected.tradition[0]);
        safeSetText("traditionDesc", selected.tradition[1]);
        renderDossier();
        renderCompare();
    }

    function renderLanguageQuiz() {
        const selected = getSelectedPlace();
        const correctAnswer = selected.quiz.answers[selected.quiz.correct];
        const answers = [...selected.quiz.answers].sort(() => Math.random() - 0.5);
        safeSetText("languageQuizMeta", `${selected.label} - ${selected.region}`);
        if (quizQuestion) quizQuestion.textContent = selected.quiz.q;
        if (answerGrid) {
            answerGrid.classList.remove("answered");
            answerGrid.innerHTML = answers.map(answer => `<button class="answer-choice answer-btn">${answer}</button>`).join("");
            answerGrid.querySelectorAll("button").forEach(btn => {
                btn.addEventListener("click", () => {
                    recordActivity();
                    progress.reviewed += 1;
                    progress.quizDone = (progress.quizDone || 0) + 1;
                    answerGrid.classList.add("answered");
                    if (btn.textContent === correctAnswer) {
                        progress.correct += 1;
                        btn.classList.add("correct");
                        showToast("Jawaban budaya benar.");
                    } else {
                        btn.classList.add("wrong");
                        showToast(`Jawaban tepat: ${correctAnswer}`);
                    }
                    answerGrid.querySelectorAll("button").forEach(button => {
                        button.disabled = true;
                        if (button.textContent === correctAnswer) button.classList.add("correct");
                    });
                    markExplored(selected.id);
                    updateMetrics();
                });
            });
        }
    }

    function renderLanguage() {
        const selected = getSelectedPlace();
        const card = selected.cards[currentIndex % selected.cards.length];
        showingMeaning = false;
        if (flashcard) {
            flashcard.classList.remove("is-flipped", "is-flipping");
            flashcard.innerHTML = `<small>${selected.label}</small><strong>${card[0]}</strong><span>${card[2]}</span>`;
        }
        if (flashcardProgress && flashcardBar) {
            const activeIndex = (currentIndex % selected.cards.length) + 1;
            flashcardProgress.textContent = `Kartu ${activeIndex}/${selected.cards.length}`;
            flashcardBar.style.width = `${Math.round((activeIndex / selected.cards.length) * 100)}%`;
        }
        if (phraseGrid) {
            phraseGrid.innerHTML = selected.phrases.map(item => `
                <article class="phrase-card"><strong>${item[0]}</strong><p class="muted">${item[1]}</p></article>
            `).join("");
        }
        if (vocabList) {
            vocabList.innerHTML = selected.cards.map((item, index) => `
                <div class="vocab-item ${index === currentIndex % selected.cards.length ? "is-active" : ""}"><div><strong>${item[0]}</strong><span class="muted">${item[1]}</span></div><span class="mini-tag">${item[2]}</span></div>
            `).join("");
        }
        renderCultureDetails();
        renderLanguageQuiz();
        renderRecommendation();
        renderJourney();
    }

    function renderAll() {
        renderRegionChips();
        syncIndonesiaMap();
        renderCultureGrid();
        renderLanguage();
        updateMetrics();
        document.querySelectorAll(".language-mode").forEach(btn => {
            btn.classList.toggle("active", btn.dataset.mode === collectionMode);
        });
    }

    if (flashcard) {
        flashcard.addEventListener("click", () => {
            const selected = getSelectedPlace();
            const card = selected.cards[currentIndex % selected.cards.length];
            showingMeaning = !showingMeaning;
            flashcard.classList.add("is-flipping");
            window.setTimeout(() => {
                flashcard.classList.toggle("is-flipped", showingMeaning);
                flashcard.innerHTML = showingMeaning
                    ? `<small>Arti</small><strong>${card[1]}</strong><span>${card[0]}</span>`
                    : `<small>${selected.label}</small><strong>${card[0]}</strong><span>${card[2]}</span>`;
                flashcard.classList.remove("is-flipping");
            }, 120);
        });
    }
    flowCards.forEach(card => {
        card.addEventListener("click", () => {
            setActiveFlow(card.dataset.flowStep);
        });
    });
    const nextWordBtn = document.getElementById("nextWord");
    if (nextWordBtn) {
        nextWordBtn.addEventListener("click", () => {
            currentIndex += 1;
            progress.reviewed += 1;
            recordActivity();
            markExplored(selectedPlaceId);
            renderAll();
            updateMetrics();
        });
    }
    if (languageSelect) {
        languageSelect.addEventListener("change", () => {
            selectedPlaceId = languageSelect.value;
            selectedRegion = getSelectedPlace().region;
            currentIndex = 0;
            markExplored(selectedPlaceId);
            setActiveFlow("latihan");
            renderAll();
        });
    }
    if (languageSearch) {
        languageSearch.addEventListener("input", () => {
            const firstVisible = getVisiblePlaces()[0];
            if (firstVisible && !getVisiblePlaces().some(place => place.id === selectedPlaceId)) {
                selectedPlaceId = firstVisible.id;
                languageSelect.value = selectedPlaceId;
                currentIndex = 0;
            }
            renderAll();
        });
    }
    document.querySelectorAll(".language-mode").forEach(btn => {
        btn.addEventListener("click", () => {
            collectionMode = btn.dataset.mode;
            const firstVisible = getVisiblePlaces()[0];
            if (firstVisible) {
                selectedPlaceId = firstVisible.id;
                if (languageSelect) languageSelect.value = selectedPlaceId;
                currentIndex = 0;
            }
            renderAll();
        });
    });
    routeGoal?.addEventListener("change", () => {
        renderRecommendation();
        renderJourney();
    });
    sortCulture?.addEventListener("change", () => {
        sortMode = sortCulture.value;
        const firstVisible = getVisiblePlaces()[0];
        if (firstVisible && !getVisiblePlaces().some(place => place.id === selectedPlaceId)) {
            selectedPlaceId = firstVisible.id;
            if (languageSelect) languageSelect.value = selectedPlaceId;
            currentIndex = 0;
        }
        renderAll();
    });
    sessionTarget?.addEventListener("change", () => {
        targetCount = Number(sessionTarget.value) || 3;
        renderJourney();
        updateMetrics();
    });
    if (compareSelect) {
        compareSelect.addEventListener("change", renderCompare);
    }
    randomCulture?.addEventListener("click", () => {
        const visible = getVisiblePlaces();
        const pool = visible.length ? visible : places;
        const randomPlace = pool[Math.floor(Math.random() * pool.length)];
        selectedPlaceId = randomPlace.id;
        selectedRegion = randomPlace.region;
        if (languageSelect) languageSelect.value = selectedPlaceId;
        currentIndex = 0;
        markExplored(selectedPlaceId);
        renderAll();
        setActiveFlow("latihan");
        showToast(`Rute acak membuka ${randomPlace.label}.`);
    });
    focusPapua?.addEventListener("click", () => {
        selectRegion("Papua Raya");
        const regionEl = document.getElementById("jelajah-region");
        if (regionEl) regionEl.scrollIntoView({ behavior: "smooth", block: "start" });
        showToast("Fokus dipindahkan ke Papua Raya.");
    });
    quickQuiz?.addEventListener("click", () => {
        const visible = getVisiblePlaces();
        const currentPosition = Math.max(0, visible.findIndex(place => place.id === selectedPlaceId));
        const nextPlace = visible[(currentPosition + 1) % Math.max(visible.length, 1)] || places[0];
        selectedPlaceId = nextPlace.id;
        selectedRegion = nextPlace.region;
        if (languageSelect) languageSelect.value = selectedPlaceId;
        currentIndex = 0;
        renderAll();
        const quizEl = document.getElementById("languageQuizQuestion");
        if (quizEl) quizEl.scrollIntoView({ behavior: "smooth", block: "center" });
        setActiveFlow("quiz-budaya");
    });
    copyMission?.addEventListener("click", async () => {
        const selected = getSelectedPlace();
        const mission = `Misi ${selected.label}: hafalkan "${selected.cards[0][0]}", pelajari ${selected.food[0]}, kunjungi cerita ${selected.destination[0]}, lalu jawab quiz budaya.`;
        try {
            await navigator.clipboard.writeText(mission);
            showToast("Misi belajar disalin.");
        } catch {
            showToast(mission);
        }
    });
    if (toggleFavorite) {
        toggleFavorite.addEventListener("click", () => {
            toggleSetValue("favorites", selectedPlaceId);
            showToast((progress.favorites || []).includes(selectedPlaceId) ? "Daerah masuk favorit." : "Daerah dihapus dari favorit.");
            renderAll();
        });
    }
    if (markMastered) {
        markMastered.addEventListener("click", () => {
            toggleSetValue("mastered", selectedPlaceId);
            showToast((progress.mastered || []).includes(selectedPlaceId) ? "Daerah ditandai dikuasai." : "Status dikuasai dibatalkan.");
            renderAll();
        });
    }
    if (listenWord) {
        listenWord.addEventListener("click", () => {
            const selected = getSelectedPlace();
            const card = selected.cards[currentIndex % selected.cards.length];
            if (!("speechSynthesis" in window)) {
                showToast("Browser belum mendukung suara otomatis.");
                return;
            }
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(`${card[0]}. Artinya ${card[1]}.`);
            utterance.lang = "id-ID";
            utterance.rate = 0.88;
            window.speechSynthesis.speak(utterance);
        });
    }
    if (nextCultureQuiz) {
        nextCultureQuiz.addEventListener("click", () => {
            const visible = getVisiblePlaces();
            const currentPosition = Math.max(0, visible.findIndex(place => place.id === selectedPlaceId));
            const nextPlace = visible[(currentPosition + 1) % Math.max(visible.length, 1)] || places[(places.findIndex(place => place.id === selectedPlaceId) + 1) % places.length];
            selectedPlaceId = nextPlace.id;
            selectedRegion = nextPlace.region;
            if (languageSelect) languageSelect.value = selectedPlaceId;
            currentIndex = 0;
            renderAll();
        });
    }
    startRecommendedRoute?.addEventListener("click", () => {
        const placeId = startRecommendedRoute.dataset.place;
        if (!placeId) return;
        selectedPlaceId = placeId;
        selectedRegion = getSelectedPlace().region;
        if (languageSelect) languageSelect.value = selectedPlaceId;
        currentIndex = 0;
        markExplored(selectedPlaceId);
        renderAll();
        const latEl = document.getElementById("latihan");
        if (latEl) latEl.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    resetLanguageProgress?.addEventListener("click", () => {
        progress.reviewed = 0;
        progress.correct = 0;
        progress.explored = [];
        progress.quizDone = 0;
        progress.favorites = [];
        progress.mastered = [];
        progress.streak = 0;
        progress.lastActiveDay = "";
        collectionMode = "semua";
        selectedRegion = "Semua";
        selectedPlaceId = "jawa";
        if (languageSelect) languageSelect.value = selectedPlaceId;
        if (languageSearch) languageSearch.value = "";
        currentIndex = 0;
        showToast("Progress Wonderful Indonesia direset.");
        renderAll();
    });

    bindIndonesiaMap();
    if ("IntersectionObserver" in window) {
        const flowObserver = new IntersectionObserver(entries => {
            const visible = entries
                .filter(entry => entry.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
            if (visible?.target?.id) setActiveFlow(visible.target.id);
        }, { rootMargin: "-30% 0px -55% 0px", threshold: [0.18, 0.35, 0.6] });
        ["jelajah-region", "latihan", "quiz-budaya"].forEach(id => {
            const section = document.getElementById(id);
            if (section) flowObserver.observe(section);
        });
    }
    renderAll();
}

// Global scope attachment for backward compatibility
window.initBahasaPage = initBahasaPage;
