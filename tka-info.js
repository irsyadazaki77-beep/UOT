/* JavaScript khusus untuk logika interaktif Halaman TKA (snbt.html) */

// Questions Database cloned from feature-pages.js for lookup
const questionsDatabase = {
    indonesia: [
        {
            topic: "Bahasa Indonesia - Inferensi teks",
            q: "Sebuah artikel menjelaskan bahwa kebiasaan membaca singkat setiap hari lebih efektif daripada membaca lama tetapi jarang. Simpulan yang paling tepat adalah...",
            answers: ["Durasi belajar tidak penting", "Konsistensi latihan membantu pemahaman", "Membaca lama selalu buruk", "Artikel hanya membahas buku fiksi"],
            correct: 1,
            note: "Kata kunci pada teks adalah kebiasaan harian dan efektivitas. Jadi simpulan aman berfokus pada konsistensi."
        },
        {
            topic: "Bahasa Indonesia - Evaluasi argumen",
            q: "Pernyataan: Sekolah A perlu menambah jam literasi karena nilai membaca turun. Data tambahan mana yang paling memperkuat argumen itu?",
            answers: ["Jumlah kantin di sekolah", "Perbandingan nilai membaca sebelum dan sesudah program literasi", "Daftar warna seragam", "Jumlah lapangan olahraga"],
            correct: 1,
            note: "Argumen tentang literasi paling kuat bila didukung data yang langsung membandingkan efek program literasi."
        },
        {
            topic: "Bahasa Indonesia - Ide pokok",
            q: "Kalimat utama paragraf biasanya berfungsi sebagai...",
            answers: ["Contoh tambahan", "Ide pokok", "Data pendukung", "Kesimpulan lawan"],
            correct: 1,
            note: "Kalimat utama membawa ide pokok yang dijelaskan oleh kalimat-kalimat pendukung."
        }
    ],
    matematika: [
        {
            topic: "Matematika - Aljabar kontekstual",
            q: "Biaya langganan aplikasi adalah Rp12.000 ditambah Rp3.000 per fitur premium. Jika total biaya Rp30.000, banyak fitur premium adalah...",
            answers: ["4", "5", "6", "7"],
            correct: 2,
            note: "Modelnya 12.000 + 3.000x = 30.000, maka 3.000x = 18.000 dan x = 6."
        },
        {
            topic: "Matematika - Peluang",
            q: "Dalam kotak ada 4 kartu merah, 3 biru, dan 5 hijau. Peluang mengambil kartu biru adalah...",
            answers: ["1/4", "3/12", "5/12", "7/12"],
            correct: 1,
            note: "Total kartu 12, kartu biru 3. Peluangnya 3/12 atau 1/4; opsi yang tersedia adalah 3/12."
        },
        {
            topic: "Matematika - Rasio data",
            q: "Rasio siswa yang lulus simulasi dan belum lulus adalah 7:5. Jika 18 siswa belum lulus, perkiraan jumlah siswa yang lulus adalah...",
            answers: ["21", "24", "25", "28"],
            correct: 2,
            note: "Satu bagian = 18/5 = 3,6. Yang lulus 7 bagian = 25,2, sehingga perkiraan terdekat 25."
        }
    ],
    inggris: [
        {
            topic: "Bahasa Inggris - Main idea",
            q: "A paragraph says: Online learning is flexible, but students need discipline to avoid distractions. The main idea is...",
            answers: ["Online learning has no benefits", "Discipline is needed in flexible online learning", "Students never get distracted", "Offline classes are always better"],
            correct: 1,
            note: "Kalimat menyeimbangkan fleksibilitas dan kebutuhan disiplin. Main idea terbaik memuat dua unsur itu."
        },
        {
            topic: "Bahasa Inggris - Inference",
            q: "Text: Rina submitted the report two days early and asked for feedback. What can be inferred?",
            answers: ["Rina ignored the assignment", "Rina was proactive", "The report was rejected", "The teacher was absent"],
            correct: 1,
            note: "Mengumpulkan lebih awal dan meminta feedback menunjukkan sikap proaktif."
        },
        {
            topic: "Bahasa Inggris - Vocabulary in context",
            q: "In the sentence 'The evidence was compelling,' the word 'compelling' is closest in meaning to...",
            answers: ["Confusing", "Convincing", "Ordinary", "Hidden"],
            correct: 1,
            note: "Compelling berarti sangat meyakinkan atau kuat untuk dipercaya."
        }
    ],
    pilihan: [
        {
            topic: "Mapel Pilihan - Sains",
            q: "Dalam percobaan, tanaman A diberi cahaya cukup dan tanaman B disimpan gelap. Variabel bebas percobaan tersebut adalah...",
            answers: ["Jenis tanaman", "Jumlah daun", "Paparan cahaya", "Tinggi akhir tanaman"],
            correct: 2,
            note: "Variabel bebas adalah faktor yang sengaja diubah peneliti, yaitu paparan cahaya."
        },
        {
            topic: "Mapel Pilihan - Sosial",
            q: "Ketika harga barang naik dan jumlah yang diminta turun, konsep ekonomi yang sedang ditunjukkan adalah...",
            answers: ["Hukum permintaan", "Inflasi biaya", "Kelangkaan mutlak", "Mobilitas sosial"],
            correct: 0,
            note: "Hukum permintaan menyatakan harga dan jumlah diminta bergerak berlawanan, ceteris paribus."
        },
        {
            topic: "Mapel Pilihan - Analisis data",
            q: "Data menunjukkan peningkatan suhu kota sejalan dengan berkurangnya ruang hijau. Pernyataan paling hati-hati adalah...",
            answers: ["Ruang hijau pasti satu-satunya penyebab suhu naik", "Ada hubungan yang perlu diuji lebih lanjut", "Suhu tidak terkait lingkungan", "Semua kota punya suhu sama"],
            correct: 1,
            note: "Data korelasi belum otomatis membuktikan sebab tunggal. Jawaban hati-hati menyebut hubungan dan perlunya uji lanjutan."
        }
    ]
};

// Syllabus Concepts Database for Modal details
const syllabusConcepts = {
    polinomial: {
        title: "Polinomial & Suku Banyak",
        content: `
            <p>Materi polinomial mencakup operasi pembagian, teorema sisa, teorema faktor, dan penentuan akar-akar persamaan suku banyak.</p>
            <div class="concept-modal-section">
                <strong>Rumus Penting:</strong>
                <ul>
                    <li>Teorema Sisa: Jika f(x) dibagi (x - k), maka sisanya S = f(k).</li>
                    <li>Teorema Faktor: (x - k) adalah faktor dari f(x) jika dan hanya jika f(k) = 0.</li>
                </ul>
            </div>
            <div class="concept-modal-section warning">
                <strong>Trik HOTS:</strong>
                <p>Jika pembagi berbentuk kuadrat yang tidak bisa difaktorkan, gunakan pembagian bersusun atau kesamaan suku banyak (metode koefisien tak tentu) untuk mempercepat perhitungan.</p>
            </div>
        `
    },
    kalkulus: {
        title: "Limit, Turunan & Integral",
        content: `
            <p>Kalkulus mengukur laju perubahan (turunan) dan akumulasi daerah (integral) dari fungsi aljabar dan trigonometri.</p>
            <div class="concept-modal-section">
                <strong>Rumus Penting:</strong>
                <ul>
                    <li>Turunan: f'(x) = n · ax^(n-1)</li>
                    <li>Integral: &int; x^n dx = [1/(n+1)]x^(n+1) + C</li>
                    <li>Turunan Rantai: df/dx = (df/du) · (du/dx)</li>
                </ul>
            </div>
            <div class="concept-modal-section warning">
                <strong>Trik HOTS:</strong>
                <p>Di TKA, soal integral sering berupa aplikasi luas daerah yang dibatasi dua kurva. Ingat rumus praktis L = (D&radic;D)/(6a²) untuk perpotongan parabola dan garis!</p>
            </div>
        `
    },
    trigonometri: {
        title: "Trigonometri Analitis",
        content: `
            <p>Trigonometri analitis mencakup identitas sudut rangkap, jumlah/selisih sudut, dan penyelesaian persamaan trigonometri.</p>
            <div class="concept-modal-section">
                <strong>Rumus Penting:</strong>
                <ul>
                    <li>sin(2A) = 2 sin A cos A</li>
                    <li>cos(2A) = cos²A - sin²A = 2cos²A - 1 = 1 - 2sin²A</li>
                    <li>sin(A &plusmn; B) = sin A cos B &plusmn; cos A sin B</li>
                </ul>
            </div>
            <div class="concept-modal-section">
                <strong>Trik HOTS:</strong>
                <p>Ubah persamaan berbentuk a cos x + b sin x = c menjadi k cos(x - &alpha;) = c, di mana k = &radic;(a² + b²) dan tan &alpha; = b/a.</p>
            </div>
        `
    },
    vektor: {
        title: "Vektor & Dimensi Tiga",
        content: `
            <p>Konsep arah dan nilai (vektor) dipadukan dengan geometri ruang dimensi tiga (jarak titik ke garis/bidang, sudut antara garis dan bidang).</p>
            <div class="concept-modal-section">
                <strong>Rumus Penting:</strong>
                <ul>
                    <li>Proyeksi Vektor a pada b: c = ((a · b) / |b|²) · b</li>
                    <li>Jarak titik ke bidang pada kubus: Biasanya berbentuk pecahan dari diagonal ruang (e.g. 1/3 a&radic;3 atau 2/3 a&radic;3).</li>
                </ul>
            </div>
            <div class="concept-modal-section warning">
                <strong>Trik HOTS:</strong>
                <p>Gunakan sistem koordinat Cartesian (vektor basis i, j, k) untuk mencari jarak atau sudut pada bangun ruang yang tidak beraturan.</p>
            </div>
        `
    },
    kuadrat: {
        title: "Fungsi Kuadrat & Matriks",
        content: `
            <p>Membahas sifat parabola, titik puncak, kecekungan, serta operasi matriks, determinan, dan invers matriks 2x2.</p>
            <div class="concept-modal-section">
                <strong>Rumus Penting:</strong>
                <ul>
                    <li>Puncak Parabola: Xp = -b/(2a), Yp = -D/(4a)</li>
                    <li>Determinan Matriks A = [a b; c d]: det(A) = ad - bc</li>
                    <li>Invers: A⁻¹ = (1/det(A)) * [d -b; -c a]</li>
                </ul>
            </div>
        `
    },
    kinematika: {
        title: "Kinematika & Dinamika Partikel",
        content: `
            <p>Gerak lurus (GLB/GLBB), gerak melingkar, gerak parabola, serta hukum-hukum Newton tentang gaya.</p>
            <div class="concept-modal-section">
                <strong>Rumus Penting:</strong>
                <ul>
                    <li>GLBB: vt = v0 + at | s = v0 t + 1/2 at²</li>
                    <li>Hukum II Newton: &Sigma;F = m · a</li>
                    <li>Gaya Gesek: fg = &mu; · N</li>
                </ul>
            </div>
            <div class="concept-modal-section warning">
                <strong>Trik HOTS:</strong>
                <p>Pada katrol majemuk atau benda bertumpuk, selalu gambarkan diagram gaya bebas (Free Body Diagram) secara terpisah untuk setiap benda sebelum menyusun persamaan linear.</p>
            </div>
        `
    },
    termodinamika: {
        title: "Termodinamika & Gas Ideal",
        content: `
            <p>Membahas persamaan gas ideal, usaha luar, hukum I dan II Termodinamika, serta siklus Carnot.</p>
            <div class="concept-modal-section">
                <strong>Rumus Penting:</strong>
                <ul>
                    <li>Persamaan Gas: P · V = n · R · T</li>
                    <li>Hukum I: Q = &Delta;U + W</li>
                    <li>Efisiensi Siklus Carnot: &eta; = 1 - (Tr/Tt)</li>
                </ul>
            </div>
        `
    },
    gelombang: {
        title: "Gelombang Bunyi & Optik",
        content: `
            <p>Karakteristik gelombang mekanik/elektromagnetik, efek Doppler pada bunyi, interferensi/difraksi cahaya, serta pembiasan pada cermin dan lensa.</p>
            <div class="concept-modal-section">
                <strong>Rumus Penting:</strong>
                <ul>
                    <li>Efek Doppler: fp = ((v &plusmn; vp) / (v &plusmn; vs)) · fs</li>
                    <li>Rumus Lensa: 1/f = 1/s + 1/s'</li>
                </ul>
            </div>
        `
    },
    listrik: {
        title: "Listrik Statis, Dinamis & Magnet",
        content: `
            <p>Hukum Coulomb, medan listrik, Hukum Ohm, rangkaian Kirchhoff, gaya Lorentz, dan induksi elektromagnetik.</p>
            <div class="concept-modal-section">
                <strong>Rumus Penting:</strong>
                <ul>
                    <li>Gaya Coulomb: F = k · q1 · q2 / r²</li>
                    <li>Hukum Kirchhoff II: &Sigma;&epsilon; + &Sigma;(I · R) = 0</li>
                    <li>Gaya Lorentz: F = B · I · L sin(&theta;)</li>
                </ul>
            </div>
        `
    },
    modern: {
        title: "Fisika Modern & Radioaktivitas",
        content: `
            <p>Teori relativitas khusus, efek fotolistrik, struktur atom, dan peluruhan inti radioaktif.</p>
            <div class="concept-modal-section">
                <strong>Rumus Penting:</strong>
                <ul>
                    <li>Dilatasi Waktu: &Delta;t = &Delta;t0 / &radic;(1 - v²/c²)</li>
                    <li>Energi Foton: E = h · f</li>
                    <li>Peluruhan: N(t) = N0 · (1/2)^(t/T)</li>
                </ul>
            </div>
        `
    },
    stoikiometri: {
        title: "Stoikiometri & Rumus Empiris",
        content: `
            <p>Perhitungan kimia dasar: mol, volume gas STP/RTP, pereaksi pembatas, persen hasil, kadar unsur, dan rumus empiris/molekul.</p>
            <div class="concept-modal-section">
                <strong>Rumus Penting:</strong>
                <ul>
                    <li>Mol = massa / Mr</li>
                    <li>Gas Ideal (STP): V = mol · 22,4 L</li>
                    <li>Molaritas: M = mol / V(L)</li>
                </ul>
            </div>
        `
    },
    ikatan: {
        title: "Ikatan Kimia & Gaya Antarmolekul",
        content: `
            <p>Ikatan ion, kovalen (tunggal, rangkap, koordinasi), logam, serta gaya Van der Waals dan ikatan hidrogen.</p>
            <div class="concept-modal-section">
                <strong>Konsep Utama:</strong>
                <p>Ikatan hidrogen terbentuk antara atom H dengan atom yang sangat elektronegatif (F, O, N) dan menyebabkan titik didih senyawa menjadi sangat tinggi (contoh: H2O, HF, NH3).</p>
            </div>
        `
    },
    kesetimbangan: {
        title: "Kesetimbangan & Laju Reaksi",
        content: `
            <p>Faktor laju reaksi (suhu, konsentrasi, katalis), tetapan kesetimbangan Kc dan Kp, serta pergeseran kesetimbangan (Azas Le Chatelier).</p>
            <div class="concept-modal-section">
                <strong>Rumus Penting:</strong>
                <ul>
                    <li>Persamaan Laju: v = k [A]^x [B]^y</li>
                    <li>Hubungan Kp & Kc: Kp = Kc · (R · T)^&Delta;n</li>
                </ul>
            </div>
        `
    },
    "asam-basa": {
        title: "Larutan Asam Basa, Buffer & pH",
        content: `
            <p>Teori asam-basa, derajat keasaman (pH), hidrolisis garam, dan larutan penyangga (buffer).</p>
            <div class="concept-modal-section">
                <strong>Rumus Penting:</strong>
                <ul>
                    <li>Asam Kuat: [H+] = a · Ma | Lemah: [H+] = &radic;(Ka · Ma)</li>
                    <li>Buffer Asam: [H+] = Ka · (mol asam / mol basa konjugasi)</li>
                    <li>pH = -log [H+]</li>
                </ul>
            </div>
        `
    },
    organik: {
        title: "Kimia Organik & Benzena",
        content: `
            <p>Tatanama senyawa karbon (alkanol, alkanal, alkanon, dll), isomer, reaksi organik (adisi, substitusi, eliminasi), serta turunan benzena.</p>
            <div class="concept-modal-section warning">
                <strong>Trik HOTS:</strong>
                <p>Identifikasi senyawa organik melalui reaksi uji: Pereaksi Fehling/Tollens menguji aldehid (alkanal). Air brom/KMnO4 menguji ketidakjenuhan ikatan rangkap alkena/alkuna.</p>
            </div>
        `
    },
    sel: {
        title: "Biologi Sel & Organel",
        content: `
            <p>Struktur sel prokariotik/eukariotik, fungsi organel (mitokondria, kloroplas, lisosom, dll), dan mekanisme transpor membran.</p>
            <div class="concept-modal-section">
                <strong>Konsep Utama:</strong>
                <ul>
                    <li>Transpor Pasif: Difusi dan Osmosis (tanpa ATP).</li>
                    <li>Transpor Aktif: Pompa natrium-kalium, endositosis, eksositosis (memerlukan energi ATP).</li>
                </ul>
            </div>
        `
    },
    metabolisme: {
        title: "Katabolisme & Anabolisme Sel",
        content: `
            <p>Katabolisme karbohidrat (glikolisis, dekarboksilasi oksidatif, siklus Krebs, transpor elektron) dan anabolisme (reaksi terang & gelap fotosintesis).</p>
            <div class="concept-modal-section">
                <strong>Hasil Utama Respirasi Aerob:</strong>
                <p>1 molekul glukosa menghasilkan sekitar 36-38 ATP, CO2, dan H2O.</p>
            </div>
        `
    },
    genetika: {
        title: "Genetika & Sintesis Protein",
        content: `
            <p>Struktur DNA & RNA, replikasi DNA, serta tahapan sintesis protein (transkripsi di nukleus, translasi di ribosom).</p>
            <div class="concept-modal-section warning">
                <strong>Trik HOTS:</strong>
                <p>Menentukan urutan asam amino berdasarkan rantai DNA antisense atau kodon mRNA. Ingat: Kodon mRNA = rantai DNA sense (dengan T diganti U) = pasangan komplemen DNA antisense.</p>
            </div>
        `
    },
    anatomi: {
        title: "Anatomi & Fisiologi Manusia",
        content: `
            <p>Sistem organ manusia: pencernaan, peredaran darah, pernapasan, ekskresi, koordinasi (saraf/hormon), dan reproduksi.</p>
            <div class="concept-modal-section">
                <strong>Mekanisme Penting:</strong>
                <p>Homeostasis (keseimbangan tubuh) diatur oleh mekanisme umpan balik negatif (negative feedback loop), seperti pengaturan kadar gula darah oleh insulin dan glukagon.</p>
            </div>
        `
    },
    evolusi: {
        title: "Ekologi, Lingkungan & Evolusi",
        content: `
            <p>Aliran energi ekosistem, daur biogeokimia, perubahan lingkungan, serta bukti-bukti dan mekanisme evolusi (hukum Hardy-Weinberg).</p>
            <div class="concept-modal-section">
                <strong>Rumus Hardy-Weinberg:</strong>
                <code>p² + 2pq + q² = 1 | p + q = 1</code>
            </div>
        `
    },
    kerajaan: {
        title: "Kerajaan Hindu-Buddha & Islam",
        content: `
            <p>Teori masuknya pengaruh Hindu-Buddha dan Islam ke Nusantara, perkembangan kerajaan-kerajaan besar (Kutai, Sriwijaya, Majapahit, Samudera Pasai, Demak), serta akulturasi budayanya.</p>
        `
    },
    kolonial: {
        title: "Kolonialisme & Pergerakan Nasional",
        content: `
            <p>Dampak penjajahan VOC, pemerintah Hindia Belanda, dan Jepang. Latar belakang lahirnya organisasi pergerakan nasional (Budi Utomo, Sarekat Islam, PKI, PNI) hingga Sumpah Pemuda.</p>
        `
    },
    orde: {
        title: "Orde Lama, Orde Baru & Reformasi",
        content: `
            <p>Kehidupan politik dan ekonomi masa Demokrasi Liberal dan Terpimpin, kebijakan politik Orde Baru, krisis moneter 1998, serta jalannya Reformasi.</p>
        `
    },
    perang: {
        title: "Perang Dunia I & II serta Blok Dunia",
        content: `
            <p>Sebab dan dampak PD I dan PD II, lahirnya PBB, Perang Dingin antara Blok Barat (AS) dan Blok Timur (Uni Soviet), GNB, serta runtuhnya Uni Soviet.</p>
        `
    },
    organisasi: {
        title: "Organisasi Regional & Internasional",
        content: `
            <p>Sejarah pendirian dan peran ASEAN, OKI, APEC, Uni Eropa, OPEC, GATT/WTO, serta pakta pertahanan militer (NATO, SEATO, Pakta Warsawa).</p>
        `
    },
    litosfer: {
        title: "Litosfer, Atmosfer & Hidrosfer",
        content: `
            <p>Tenaga endogen/eksogen pembentuk relief bumi, lapisan atmosfer dan dinamika iklim, serta siklus hidrologi dan pengelolaan perairan darat/laut.</p>
        `
    },
    kartografi: {
        title: "Kartografi & Interpretasi Peta",
        content: `
            <p>Komponen peta, proyeksi peta, perhitungan skala peta, dan pembacaan kontur (peta topografi).</p>
            <div class="concept-modal-section">
                <strong>Rumus Skala Kontur:</strong>
                <code>CI (Contour Interval) = 1/2000 * Skala</code>
            </div>
        `
    },
    sig: {
        title: "Penginderaan Jauh & SIG",
        content: `
            <p>Prinsip penginderaan jauh, interpretasi citra foto/non-foto, subsistem SIG (input, proses, output), serta metode tumpang susun (overlay) data spasial.</p>
        `
    },
    keruangan: {
        title: "Pola Keruangan Desa & Kota",
        content: `
            <p>Struktur ruang desa dan kota, potensi desa, teori perkembangan kota (konsentris, sektoral, inti ganda), serta interaksi spasial desa-kota.</p>
            <div class="concept-modal-section">
                <strong>Rumus Teori Gravitasi Interaksi:</strong>
                <code>IAB = k * (PA * PB) / (dAB)²</code>
            </div>
        `
    },
    bencana: {
        title: "Mitigasi Bencana & Geografi Regional",
        content: `
            <p>Jenis dan sebaran bencana alam di Indonesia, siklus penanggulangan bencana (prabencana, tanggap darurat, pascabencana), serta karakteristik geografi negara maju dan berkembang.</p>
        `
    },
    interaksi: {
        title: "Interaksi Sosial & Nilai-Norma",
        content: `
            <p>Syarat interaksi sosial (kontak & komunikasi), bentuk interaksi (asosiatif & disosiatif), faktor pendorong interaksi, serta fungsi nilai dan norma dalam keteraturan sosial.</p>
        `
    },
    sosialisasi: {
        title: "Sosialisasi & Penyimpangan Sosial",
        content: `
            <p>Tahapan sosialisasi, agen-agen sosialisasi, faktor penyebab perilaku menyimpang, jenis penyimpangan, serta lembaga pengendalian sosial.</p>
        `
    },
    struktur: {
        title: "Struktur, Stratifikasi & Mobilitas",
        content: `
            <p>Diferensiasi sosial (perbedaan horizontal), stratifikasi sosial (perbedaan vertikal), saluran-saluran mobilitas sosial, serta dampak mobilitas bagi masyarakat.</p>
        `
    },
    konflik: {
        title: "Konflik, Kekerasan & Integrasi",
        content: `
            <p>Teori konflik sosial, perbedaan konflik dan kekerasan, bentuk-bentuk resolusi konflik (mediasi, arbitrase, konsiliasi), serta tahapan integrasi sosial.</p>
        `
    },
    riset: {
        title: "Metode Penelitian Sosial",
        content: `
            <p>Langkah penelitian sosial (perumusan masalah, hipotesis, pengumpulan data), teknik pengambilan sampel (random, purposive, dll), serta analisis data kualitatif dan kuantitatif.</p>
        `
    },
    pasar: {
        title: "Mekanisme Pasar (Ekuilibirium)",
        content: `
            <p>Fungsi permintaan dan penawaran, hukum permintaan-penawaran, pembentukan harga keseimbangan pasar, serta pergeseran kurva keseimbangan.</p>
            <div class="concept-modal-section">
                <strong>Rumus Ekuilibrium:</strong>
                <code>Qd = Qs | Pd = Ps</code>
            </div>
        `
    },
    perilaku: {
        title: "Perilaku Produsen & Konsumen",
        content: `
            <p>Teori nilai guna (utilitas), hukum Gossen I dan Gossen II, kurva indiferen, garis anggaran (budget line), serta fungsi produksi dengan satu/dua input variabel.</p>
        `
    },
    nasional: {
        title: "Pendapatan Nasional & Inflasi",
        content: `
            <p>Metode perhitungan GDP/GNP/NNI/PI/DI, indeks harga, perhitungan inflasi, serta dampak dan cara mengatasi inflasi.</p>
            <div class="concept-modal-section">
                <strong>Rumus Pendapatan Nasional (Pengeluaran):</strong>
                <code>Y = C + I + G + (X - M)</code>
            </div>
        `
    },
    fiskal: {
        title: "Kebijakan Fiskal, Moneter & Perbankan",
        content: `
            <p>Perbedaan instrumen kebijakan fiskal (pajak, pengeluaran pemerintah) dan kebijakan moneter (diskonto, operasi pasar terbuka, cadangan kas), peran perbankan, dan OJK.</p>
        `
    },
    akuntansi: {
        title: "Siklus Akuntansi Jasa & Dagang",
        content: `
            <p>Tahap pencatatan (jurnal umum/khusus, buku besar), tahap pengikhtisaran (neraca saldo, jurnal penyesuaian, kertas kerja), dan tahap pelaporan (laporan laba rugi, laporan posisi keuangan).</p>
        `
    }
};

document.addEventListener("DOMContentLoaded", () => {
    initTkaTabs();
    initTkaAccordion();
    initSyllabusFeatures();
    initPlannerFeatures();
    initTryoutFeatures();
    initPomodoroWidget();
    initIrtSimulatorEnhanced();
    initDrawerAndReset();
});

// Helper for trigger toast alerts safely
function triggerToast(msg) {
    if (typeof showToast === "function") {
        showToast(msg);
    } else {
        const toast = document.getElementById("toast");
        if (toast) {
            toast.textContent = msg;
            toast.classList.add("show");
            clearTimeout(toast.timer);
            toast.timer = setTimeout(() => toast.classList.remove("show"), 2200);
        }
    }
}

// Helper to look up question info by text
function findQuestionInfo(text) {
    if (!text) return null;
    const cleanText = text.trim();
    for (const sub in questionsDatabase) {
        const found = questionsDatabase[sub].find(q => q.q === cleanText || cleanText.includes(q.q) || q.q.includes(cleanText));
        if (found) return { ...found, subject: sub };
    }
    return null;
}

/**
 * Logika Penggantian Tab Dashboard Utama & Sub-tab
 */
function initTkaTabs() {
    // Main Dashboard Tab toggling
    const mainTabBtns = document.querySelectorAll(".tka-main-tab-btn");
    const mainPanels = document.querySelectorAll(".tka-main-tab-panel");
    
    mainTabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            if (typeof playSound === "function") playSound("click");
            const targetId = btn.getAttribute("aria-controls");
            
            mainTabBtns.forEach(b => {
                b.classList.remove("active");
                b.setAttribute("aria-selected", "false");
            });
            btn.classList.add("active");
            btn.setAttribute("aria-selected", "true");
            
            mainPanels.forEach(panel => {
                panel.classList.add("hidden");
                panel.style.display = "none";
            });
            
            const targetPanel = document.getElementById(targetId);
            if (targetPanel) {
                targetPanel.classList.remove("hidden");
                targetPanel.style.display = "block";
            }
        });
    });

    // Info Hub Sub-tabs (Apa itu TKA, Rumpun, Penilaian IRT, dll)
    const tabButtons = document.querySelectorAll(".tka-tab-btn");
    const tabContents = document.querySelectorAll(".tka-tab-content");

    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            if (typeof playSound === "function") playSound("click");
            const targetId = btn.dataset.target;
            if (!targetId) return;

            tabButtons.forEach(t => t.classList.remove("active"));
            tabContents.forEach(c => {
                c.classList.add("hidden");
                c.style.display = "none";
            });

            btn.classList.add("active");
            const targetContent = document.getElementById(targetId);
            if (targetContent) {
                targetContent.style.display = "block";
                targetContent.offsetHeight; // trigger reflow for smooth animations
                targetContent.classList.remove("hidden");
            }
        });
    });

    // Syllabus Sub-tabs (Rumpun Saintek vs Soshum list)
    const syllabusTabBtns = document.querySelectorAll(".syllabus-tab-btn");
    const syllabusSubColumns = document.querySelectorAll(".syllabus-sub-column");
    
    syllabusTabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            if (typeof playSound === "function") playSound("click");
            const targetId = btn.dataset.subjectTab;
            
            syllabusTabBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            
            syllabusSubColumns.forEach(col => {
                col.classList.add("hidden");
                col.style.display = "none";
            });
            
            const targetCol = document.getElementById(targetId);
            if (targetCol) {
                targetCol.classList.remove("hidden");
                targetCol.style.display = "block";
            }
        });
    });
}

/**
 * Logika Buka/Tutup Accordion Silabus TKA
 */
function initTkaAccordion() {
    const accordionHeaders = document.querySelectorAll(".tka-accordion-header");

    accordionHeaders.forEach(header => {
        header.addEventListener("click", () => {
            const item = header.closest(".tka-accordion-item");
            const body = item.querySelector(".tka-accordion-body");
            const isActive = item.classList.contains("active");

            // Close other items in the same column to maintain layout neatness
            const column = item.closest(".tka-accordion");
            column.querySelectorAll(".tka-accordion-item").forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove("active");
                    otherItem.querySelector(".tka-accordion-body").style.maxHeight = "0px";
                }
            });

            if (isActive) {
                item.classList.remove("active");
                body.style.maxHeight = "0px";
            } else {
                item.classList.add("active");
                body.style.maxHeight = body.scrollHeight + "px";
            }
        });
    });

    // Open first accordion item by default
    document.querySelectorAll(".tka-accordion").forEach(acc => {
        const firstItem = acc.querySelector(".tka-accordion-item");
        if (firstItem) {
            const firstHeader = firstItem.querySelector(".tka-accordion-header");
            if (firstHeader) firstHeader.click();
        }
    });
}

/**
 * Logika Checklist Silabus, Progress bar, dan XP Reward
 */
function initSyllabusFeatures() {
    const checkboxes = document.querySelectorAll(".syllabus-checkbox");
    const progressData = JSON.parse(localStorage.getItem("tka_syllabus_progress") || "{}");
    const xpAwarded = JSON.parse(localStorage.getItem("tka_awarded_xp") || "{}");

    // Pre-fill checkboxes states
    checkboxes.forEach(cb => {
        const subject = cb.dataset.subject;
        const index = cb.dataset.index;
        const key = `${subject}_${index}`;
        if (progressData[key]) {
            cb.checked = true;
            const li = cb.closest("li");
            if (li) li.classList.add("mastered");
        }
    });

    updateAllSyllabusProgress();

    // Checkbox change listener
    checkboxes.forEach(cb => {
        cb.addEventListener("change", () => {
            const subject = cb.dataset.subject;
            const index = cb.dataset.index;
            const key = `${subject}_${index}`;
            progressData[key] = cb.checked;
            localStorage.setItem("tka_syllabus_progress", JSON.stringify(progressData));

            const li = cb.closest("li");
            if (cb.checked) {
                if (li) li.classList.add("mastered");
                if (typeof playSound === "function") playSound("success");

                // Award +10 XP once
                if (!xpAwarded[key]) {
                    xpAwarded[key] = true;
                    localStorage.setItem("tka_awarded_xp", JSON.stringify(xpAwarded));
                    
                    if (typeof addXp === "function") {
                        addXp(10);
                    } else {
                        // Manual updates of eduquestRPG database fallback
                        try {
                            const rpgData = JSON.parse(localStorage.getItem("eduquestRPG") || "{}");
                            rpgData.xp = (rpgData.xp || 0) + 10;
                            rpgData.totalXp = (rpgData.totalXp || 0) + 10;
                            let levelUp = false;
                            let xpNeeded = (rpgData.level || 1) * 100;
                            while (rpgData.xp >= xpNeeded) {
                                rpgData.xp -= xpNeeded;
                                rpgData.level = (rpgData.level || 1) + 1;
                                xpNeeded = rpgData.level * 100;
                                levelUp = true;
                            }
                            localStorage.setItem("eduquestRPG", JSON.stringify(rpgData));
                            if (typeof updateRpgHud === "function") updateRpgHud();
                            if (levelUp && typeof triggerLevelUp === "function") triggerLevelUp();
                        } catch (e) {
                            console.error(e);
                        }
                    }
                }
            } else {
                if (li) li.classList.remove("mastered");
                if (typeof playSound === "function") playSound("click");
            }

            updateAllSyllabusProgress();
        });
    });

    // Concept Modal popup triggers
    const syllabusItems = document.querySelectorAll(".tka-syllabus-list li");
    const conceptModal = document.getElementById("conceptModal");
    const conceptCloseBtn = document.getElementById("conceptModalClose");
    
    syllabusItems.forEach(li => {
        li.addEventListener("click", (e) => {
            if (e.target.closest(".syllabus-checkbox") || e.target.type === "checkbox") {
                return;
            }
            const conceptId = li.dataset.concept;
            if (conceptId && syllabusConcepts[conceptId]) {
                document.getElementById("conceptTitle").textContent = syllabusConcepts[conceptId].title;
                document.getElementById("conceptContent").innerHTML = syllabusConcepts[conceptId].content;
                conceptModal.classList.add("active");
                conceptModal.setAttribute("aria-hidden", "false");
                if (typeof playSound === "function") playSound("click");
            }
        });
    });

    if (conceptCloseBtn && conceptModal) {
        conceptCloseBtn.addEventListener("click", () => {
            conceptModal.classList.remove("active");
            conceptModal.setAttribute("aria-hidden", "true");
            if (typeof playSound === "function") playSound("click");
        });
        conceptModal.addEventListener("click", (e) => {
            if (e.target === conceptModal) {
                conceptModal.classList.remove("active");
                conceptModal.setAttribute("aria-hidden", "true");
            }
        });
    }
}

function updateAllSyllabusProgress() {
    const subjects = ["matematika-ipa", "fisika", "kimia", "biologi", "sejarah", "geografi", "sosiologi", "ekonomi"];
    subjects.forEach(sub => {
        const cbs = document.querySelectorAll(`.syllabus-checkbox[data-subject="${sub}"]`);
        if (!cbs.length) return;
        const checkedCount = Array.from(cbs).filter(cb => cb.checked).length;
        const pct = Math.round((checkedCount / cbs.length) * 100);
        
        const pctEl = document.getElementById(`pct-${sub}`);
        const fillEl = document.getElementById(`fill-${sub}`);
        if (pctEl) pctEl.textContent = `${pct}%`;
        if (fillEl) fillEl.style.width = `${pct}%`;
    });
}

/**
 * Logika Planner, Adaptive Roadmap, & Kalender Belajar Harian
 */
function initPlannerFeatures() {
    const targetInput = document.getElementById("targetScore");
    const weeksInput = document.getElementById("studyWeeks");
    const ptnInput = document.getElementById("targetPtn");
    const prodiInput = document.getElementById("targetProdi");
    const focusSelect = document.getElementById("focusArea");
    const firstElective = document.getElementById("firstElective");
    const secondElective = document.getElementById("secondElective");
    const planList = document.getElementById("snbtPlanList");
    const printBtn = document.getElementById("printTkaPlanBtn");
    
    // Pre-fill planner selections
    const prefs = JSON.parse(localStorage.getItem("tka_planner_prefs") || "{}");
    if (prefs.targetScore) targetInput.value = prefs.targetScore;
    if (prefs.studyWeeks) weeksInput.value = prefs.studyWeeks;
    if (prefs.targetPtn) ptnInput.value = prefs.targetPtn;
    if (prefs.targetProdi) prodiInput.value = prefs.targetProdi;
    if (prefs.focusArea) focusSelect.value = prefs.focusArea;
    if (prefs.firstElective) firstElective.value = prefs.firstElective;
    if (prefs.secondElective) secondElective.value = prefs.secondElective;

    function savePrefs() {
        const p = {
            targetScore: targetInput.value,
            studyWeeks: weeksInput.value,
            targetPtn: ptnInput.value,
            targetProdi: prodiInput.value,
            focusArea: focusSelect.value,
            firstElective: firstElective.value,
            secondElective: secondElective.value
        };
        localStorage.setItem("tka_planner_prefs", JSON.stringify(p));
        buildTkaPlanEnhanced();
        renderStudyScheduleGrid();
    }

    [targetInput, weeksInput, ptnInput, prodiInput, focusSelect, firstElective, secondElective].forEach(input => {
        input.addEventListener("change", savePrefs);
    });

    const buildPlanBtn = document.getElementById("buildTKAPlan");
    if (buildPlanBtn) {
        buildPlanBtn.addEventListener("click", () => {
            savePrefs();
            triggerToast("Rencana TKA diperbarui.");
        });
    }

    // Dynamic Roadmap rendering with Checkboxes (Interactive Roadmap)
    function buildTkaPlanEnhanced() {
        if (!planList) return;
        const target = Number(targetInput.value || 680);
        const weeks = Number(weeksInput.value || 6);
        const focus = focusSelect.value;
        const electivePair = `${firstElective.value} & ${secondElective.value}`;
        
        // Intensity multiplier
        let intensityLabel = "Normal Harian";
        if (target >= 750 && weeks <= 4) {
            intensityLabel = "Super-Intensif (Beban Ganda)";
        } else if (target >= 700) {
            intensityLabel = "Intensif Terarah";
        }
        
        const checkedRoadmap = JSON.parse(localStorage.getItem("tka_weekly_roadmap_checked") || "{}");

        let html = `
            <div class="badge" style="background: linear-gradient(135deg, var(--blue), var(--purple)); margin-bottom: 16px; width: fit-content; padding: 6px 14px; border-radius: 12px; font-weight: 850;">
                Intensitas Rencana: ${intensityLabel}
            </div>
        `;

        for (let i = 1; i <= weeks; i++) {
            let taskText = "";
            if (i <= Math.ceil(weeks / 3)) {
                taskText = `Fokus penguatan konsep fundamental ${focus}. Selesaikan minimal 20 soal HOTS dan catat konsep sulit.`;
            } else if (i <= Math.ceil((weeks * 2) / 3)) {
                taskText = `Seimbangkan materi wajib dengan rumpun pilihan ${electivePair}. Atur jadwal belajar 3:2.`;
            } else {
                taskText = `Fokus simulasi berwaktu penuh (tryout), analisis performa IRT, dan review Buku Catatan Salah.`;
            }

            const key = `week_${i}`;
            const isChecked = !!checkedRoadmap[key];

            html += `
                <div class="plan-item" style="display: flex; align-items: center; gap: 14px; padding: 14px; border: 1px solid var(--border); border-radius: 16px; margin-bottom: 10px; background: var(--item-bg);">
                    <input type="checkbox" class="roadmap-checkbox" data-week="${i}" style="width: 18px; height: 18px; cursor: pointer; accent-color: var(--green);" ${isChecked ? 'checked' : ''}>
                    <div style="flex: 1; min-width: 0;">
                        <strong style="display: block; font-size: 14px; color: var(--dark); text-decoration: ${isChecked ? 'line-through' : 'none'}; opacity: ${isChecked ? 0.6 : 1};">Minggu ${i}</strong>
                        <span class="muted" style="font-size: 12.5px; display: block; margin-top: 2px; text-decoration: ${isChecked ? 'line-through' : 'none'}; opacity: ${isChecked ? 0.6 : 1};">${taskText}</span>
                    </div>
                    <span class="mini-tag" style="align-self: center;">Target ${target}</span>
                </div>
            `;
        }

        planList.innerHTML = html;

        // Checkbox roadmaps listeners
        planList.querySelectorAll(".roadmap-checkbox").forEach(cb => {
            cb.addEventListener("change", () => {
                const weekNum = cb.dataset.week;
                const key = `week_${weekNum}`;
                checkedRoadmap[key] = cb.checked;
                localStorage.setItem("tka_weekly_roadmap_checked", JSON.stringify(checkedRoadmap));
                if (typeof playSound === "function") {
                    playSound(cb.checked ? "success" : "click");
                }
                buildTkaPlanEnhanced();
            });
        });
    }

    // Daily study schedule calendar grid renderer
    function renderStudyScheduleGrid() {
        const grid = document.getElementById("studyScheduleGrid");
        if (!grid) return;

        const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
        const focus = focusSelect.value;
        const el1 = firstElective.value;
        const el2 = secondElective.value;

        const defaultSchedule = {
            "Senin": focus,
            "Selasa": el1,
            "Rabu": el2,
            "Kamis": focus,
            "Jumat": el1,
            "Sabtu": "Tryout TKA",
            "Minggu": "Istirahat / Review"
        };

        const schedule = JSON.parse(localStorage.getItem("tka_daily_schedule") || "{}");
        days.forEach(day => {
            if (!schedule[day]) {
                schedule[day] = defaultSchedule[day];
            }
        });

        const subjectOptions = [
            "Istirahat / Review",
            "Tryout TKA",
            focus,
            el1,
            el2,
            "Bahasa Indonesia",
            "Bahasa Inggris",
            "Matematika IPA",
            "Fisika",
            "Kimia",
            "Biologi",
            "Sejarah",
            "Geografi",
            "Sosiologi",
            "Ekonomi"
        ];
        const uniqueOptions = Array.from(new Set(subjectOptions)).filter(Boolean);

        let html = "";
        days.forEach(day => {
            const currentSel = schedule[day];
            html += `
                <div class="schedule-day-box" data-day="${day}" style="display: flex; flex-direction: column; justify-content: space-between; min-height: 80px; padding: 10px;">
                    <span class="schedule-day-name" style="font-size: 11px; font-weight: 850; text-transform: uppercase; color: var(--muted);">${day}</span>
                    <select class="schedule-day-select" data-day="${day}" style="border: none; background: transparent; font-size: 12px; font-weight: 850; color: var(--dark); width: 100%; text-align: center; outline: none; cursor: pointer; padding: 4px 0;">
                        ${uniqueOptions.map(opt => `<option value="${opt}" ${opt === currentSel ? 'selected' : ''}>${opt}</option>`).join("")}
                    </select>
                </div>
            `;
        });

        grid.innerHTML = html;

        grid.querySelectorAll(".schedule-day-select").forEach(sel => {
            sel.addEventListener("change", () => {
                const day = sel.dataset.day;
                schedule[day] = sel.value;
                localStorage.setItem("tka_daily_schedule", JSON.stringify(schedule));
                if (typeof playSound === "function") playSound("click");
            });
        });
    }

    if (printBtn) {
        printBtn.addEventListener("click", () => {
            if (typeof playSound === "function") playSound("click");
            window.print();
        });
    }

    buildTkaPlanEnhanced();
    renderStudyScheduleGrid();
}

/**
 * Logika Latihan Tryout Berwaktu, Mistakes Diary, Bookmarks & Performa Chart
 */
let tryoutTimerInterval = null;
let tryoutTimeLeft = 90;

function initTryoutFeatures() {
    const questionText = document.getElementById("snbtQuestion");
    const answerGrid = document.getElementById("snbtAnswers");
    const timerBadge = document.getElementById("tryoutTimerBadge");
    const bookmarkBtn = document.getElementById("bookmarkQuestionBtn");
    const saveMistakeBtn = document.getElementById("saveMistakeNoteBtn");
    const mistakeTextarea = document.getElementById("mistakesDiaryNotes");
    const mistakesBox = document.getElementById("mistakesDiaryBox");
    const bookmarksPanel = document.getElementById("tkaBookmarksPanel");
    const bookmarksList = document.getElementById("tkaBookmarksList");

    if (!questionText || !answerGrid) return;

    // MutationObserver on questionText to detect when a new question loads
    const questionObserver = new MutationObserver(() => {
        handleNewQuestionLoaded();
    });
    questionObserver.observe(questionText, { childList: true, characterData: true, subtree: true });

    // MutationObserver on answerGrid to detect when user selects an answer
    const answerObserver = new MutationObserver(() => {
        const buttons = answerGrid.querySelectorAll("button");
        if (buttons.length > 0 && buttons[0].disabled) {
            handleQuestionAnswered();
        }
    });
    answerObserver.observe(answerGrid, { childList: true, subtree: true, attributes: true, attributeFilter: ["disabled"] });

    function handleNewQuestionLoaded() {
        const qText = questionText.textContent.trim();
        if (!qText || qText.includes("Pertanyaan akan muncul")) return;

        // Reset timer countdown
        clearInterval(tryoutTimerInterval);
        tryoutTimeLeft = 90;
        if (timerBadge) {
            timerBadge.classList.remove("warning");
            timerBadge.innerHTML = `<i class="fa-solid fa-clock"></i> 90s`;
        }

        tryoutTimerInterval = setInterval(() => {
            tryoutTimeLeft--;
            if (timerBadge) {
                timerBadge.innerHTML = `<i class="fa-solid fa-clock"></i> ${tryoutTimeLeft}s`;
                if (tryoutTimeLeft <= 10) {
                    timerBadge.classList.add("warning");
                }
            }

            if (tryoutTimeLeft <= 0) {
                clearInterval(tryoutTimerInterval);
                handleTimeOut();
            }
        }, 1000);

        if (mistakesBox) mistakesBox.style.display = "none";

        // Check bookmark state
        const bookmarks = JSON.parse(localStorage.getItem("tka_bookmarks") || "[]");
        const isBookmarked = bookmarks.some(b => b.q === qText);
        if (bookmarkBtn) {
            if (isBookmarked) {
                bookmarkBtn.classList.add("bookmarked");
                bookmarkBtn.innerHTML = `<i class="fa-solid fa-bookmark"></i>`;
            } else {
                bookmarkBtn.classList.remove("bookmarked");
                bookmarkBtn.innerHTML = `<i class="fa-regular fa-bookmark"></i>`;
            }
        }
    }

    function handleTimeOut() {
        const qText = questionText.textContent.trim();
        const qInfo = findQuestionInfo(qText);
        const correctIndex = qInfo ? qInfo.correct : 0;
        
        const buttons = answerGrid.querySelectorAll("button");
        const wrongIndex = correctIndex === 0 ? 1 : 0;
        
        if (buttons[wrongIndex]) {
            buttons[wrongIndex].click();
        }

        const feedback = document.getElementById("snbtFeedback");
        if (feedback) {
            feedback.innerHTML = `<strong style="color: #ef4444;">Waktu Habis!</strong> Jawaban yang benar adalah: ${qInfo ? qInfo.answers[correctIndex] : 'A'}. <br><span class="muted">${qInfo ? qInfo.note : ''}</span>`;
        }
        
        if (typeof playSound === "function") playSound("alarm");
        triggerToast("Waktu Pengerjaan Habis!");
    }

    function handleQuestionAnswered() {
        clearInterval(tryoutTimerInterval);

        // Show mistakes diary input
        if (mistakesBox) {
            mistakesBox.style.display = "block";
            const qText = questionText.textContent.trim();
            const diary = JSON.parse(localStorage.getItem("tka_mistakes_diary") || "{}");
            if (mistakeTextarea) {
                mistakeTextarea.value = diary[qText] || "";
            }
        }

        // Play sound effects
        const hasWrong = answerGrid.querySelector(".wrong");
        if (hasWrong) {
            if (typeof playSound === "function") playSound("click");
        } else {
            if (typeof playSound === "function") playSound("success");
        }

        updateAccuracyChart();
        updateReadinessLevel();
    }

    if (saveMistakeBtn && mistakeTextarea) {
        saveMistakeBtn.addEventListener("click", () => {
            const qText = questionText.textContent.trim();
            const note = mistakeTextarea.value.trim();
            const diary = JSON.parse(localStorage.getItem("tka_mistakes_diary") || "{}");
            
            if (note) {
                diary[qText] = note;
            } else {
                delete diary[qText];
            }
            
            localStorage.setItem("tka_mistakes_diary", JSON.stringify(diary));
            if (typeof playSound === "function") playSound("click");
            triggerToast("Catatan salah disimpan.");
        });
    }

    if (bookmarkBtn) {
        bookmarkBtn.addEventListener("click", () => {
            const qText = questionText.textContent.trim();
            if (!qText || qText.includes("Pertanyaan akan muncul")) return;

            const qInfo = findQuestionInfo(qText);
            const bookmarks = JSON.parse(localStorage.getItem("tka_bookmarks") || "[]");
            const index = bookmarks.findIndex(b => b.q === qText);

            if (index > -1) {
                bookmarks.splice(index, 1);
                bookmarkBtn.classList.remove("bookmarked");
                bookmarkBtn.innerHTML = `<i class="fa-regular fa-bookmark"></i>`;
                if (typeof playSound === "function") playSound("click");
                triggerToast("Bookmark dihapus.");
            } else {
                const item = qInfo || {
                    q: qText,
                    topic: "TKA Umum",
                    answers: Array.from(answerGrid.querySelectorAll("button")).map(b => b.textContent),
                    correct: 0,
                    note: "Latihan TKA"
                };
                bookmarks.push(item);
                bookmarkBtn.classList.add("bookmarked");
                bookmarkBtn.innerHTML = `<i class="fa-solid fa-bookmark"></i>`;
                if (typeof playSound === "function") playSound("success");
                triggerToast("Soal ditandai.");
            }

            localStorage.setItem("tka_bookmarks", JSON.stringify(bookmarks));
            renderBookmarksList();
        });
    }

    function renderBookmarksList() {
        if (!bookmarksList || !bookmarksPanel) return;

        const bookmarks = JSON.parse(localStorage.getItem("tka_bookmarks") || "[]");
        if (bookmarks.length === 0) {
            bookmarksPanel.style.display = "none";
            return;
        }

        bookmarksPanel.style.display = "block";
        bookmarksList.innerHTML = bookmarks.map((b, idx) => {
            const correctText = b.answers ? b.answers[b.correct] : "Jawaban Benar";
            return `
                <div class="bookmark-item-card" style="margin-bottom: 12px;">
                    <div class="bookmark-item-meta">
                        <span>${b.topic || 'Subtes'}</span>
                        <span>Level: ${b.level || 'Sedang'}</span>
                    </div>
                    <div class="bookmark-item-q">${b.q}</div>
                    <div class="bookmark-item-a"><i class="fa-solid fa-check-double"></i> Kunci: ${correctText}</div>
                    <div class="bookmark-item-exp"><strong>Penjelasan:</strong> ${b.note || ''}</div>
                    <button class="bookmark-item-remove" data-idx="${idx}"><i class="fa-solid fa-trash-can"></i> Hapus Bookmark</button>
                </div>
            `;
        }).join("");

        bookmarksList.querySelectorAll(".bookmark-item-remove").forEach(btn => {
            btn.addEventListener("click", () => {
                const idx = Number(btn.dataset.idx);
                const bookmarks = JSON.parse(localStorage.getItem("tka_bookmarks") || "[]");
                bookmarks.splice(idx, 1);
                localStorage.setItem("tka_bookmarks", JSON.stringify(bookmarks));
                if (typeof playSound === "function") playSound("click");
                triggerToast("Bookmark dihapus.");
                renderBookmarksList();
                
                const curQText = questionText.textContent.trim();
                const stillBookmarked = bookmarks.some(b => b.q === curQText);
                if (bookmarkBtn) {
                    if (stillBookmarked) {
                        bookmarkBtn.classList.add("bookmarked");
                        bookmarkBtn.innerHTML = `<i class="fa-solid fa-bookmark"></i>`;
                    } else {
                        bookmarkBtn.classList.remove("bookmarked");
                        bookmarkBtn.innerHTML = `<i class="fa-regular fa-bookmark"></i>`;
                    }
                }
            });
        });
    }

    function updateAccuracyChart() {
        const chart = document.getElementById("tkaAccuracyChartBars");
        if (!chart) return;

        const stats = JSON.parse(localStorage.getItem("snbt_stats") || "{}");
        const bySubject = stats.bySubject || {};
        const subjects = [
            { id: "indonesia", label: "Bahasa Indonesia" },
            { id: "matematika", label: "Matematika" },
            { id: "inggris", label: "Bahasa Inggris" },
            { id: "pilihan", label: "Mapel Pilihan" }
        ];

        chart.innerHTML = subjects.map(sub => {
            const data = bySubject[sub.id] || { done: 0, correct: 0 };
            const pct = data.done > 0 ? Math.round((data.correct / data.done) * 100) : 0;
            return `
                <div class="accuracy-chart-row">
                    <div class="accuracy-chart-lbls">
                        <span>${sub.label}</span>
                        <strong>${pct}% (${data.correct}/${data.done})</strong>
                    </div>
                    <div class="accuracy-chart-track">
                        <div class="accuracy-chart-fill" style="width: ${pct}%"></div>
                    </div>
                </div>
            `;
        }).join("");
    }

    let prevReadinessLevel = localStorage.getItem("tka_prev_readiness_level") || "Fondasi";
    
    function updateReadinessLevel() {
        const stats = JSON.parse(localStorage.getItem("snbt_stats") || "{}");
        const done = stats.done || 0;
        const correct = stats.correct || 0;
        const accuracy = done > 0 ? Math.round((correct / done) * 100) : 0;

        let curLevel = "Fondasi";
        if (done >= 9 && accuracy >= 80) {
            curLevel = "Pakar";
        } else if (done >= 6 && accuracy >= 60) {
            curLevel = "Siap";
        } else if (done >= 3) {
            curLevel = "Stabil";
        }

        if (curLevel !== prevReadinessLevel) {
            const levels = ["Fondasi", "Stabil", "Siap", "Pakar"];
            const prevIdx = levels.indexOf(prevReadinessLevel);
            const curIdx = levels.indexOf(curLevel);
            
            if (curIdx > prevIdx) {
                if (typeof playSound === "function") playSound("fanfare");
                triggerToast(`🎉 Kesiapan TKA Naik Level: ${curLevel}!`);
            }
            prevReadinessLevel = curLevel;
            localStorage.setItem("tka_prev_readiness_level", curLevel);
        }
    }

    renderBookmarksList();
    updateAccuracyChart();
    handleNewQuestionLoaded();
}

/**
 * Logika Pomodoro Timer Widget
 */
let pomodoroInterval = null;
let pomodoroTimeLeft = 25 * 60;
let pomodoroIsRunning = false;
let pomodoroIsWorkSession = true;

function initPomodoroWidget() {
    const widget = document.getElementById("tkaPomodoroWidget");
    const circleFill = document.getElementById("pomodoroCircleFill");
    const timeText = document.getElementById("pomodoroTime");
    const statusText = document.getElementById("pomodoroStatus");
    const startBtn = document.getElementById("pomodoroStartBtn");
    const resetBtn = document.getElementById("pomodoroResetBtn");

    if (!widget || !circleFill || !timeText) return;

    function updateDisplay() {
        const totalDuration = pomodoroIsWorkSession ? 25 * 60 : 5 * 60;
        const mins = Math.floor(pomodoroTimeLeft / 60);
        const secs = pomodoroTimeLeft % 60;
        timeText.textContent = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;

        const elapsed = totalDuration - pomodoroTimeLeft;
        const offset = (elapsed / totalDuration) * 402;
        circleFill.style.strokeDashoffset = offset;
    }

    function toggleTimer() {
        if (typeof playSound === "function") playSound("click");
        
        if (pomodoroIsRunning) {
            clearInterval(pomodoroInterval);
            pomodoroIsRunning = false;
            startBtn.innerHTML = `<i class="fa-solid fa-play"></i> Mulai`;
        } else {
            pomodoroIsRunning = true;
            startBtn.innerHTML = `<i class="fa-solid fa-pause"></i> Pause`;
            
            pomodoroInterval = setInterval(() => {
                pomodoroTimeLeft--;
                updateDisplay();

                if (pomodoroTimeLeft <= 0) {
                    clearInterval(pomodoroInterval);
                    pomodoroIsRunning = false;
                    startBtn.innerHTML = `<i class="fa-solid fa-play"></i> Mulai`;
                    
                    if (typeof playSound === "function") playSound("alarm");
                    
                    if (pomodoroIsWorkSession) {
                        pomodoroIsWorkSession = false;
                        pomodoroTimeLeft = 5 * 60;
                        statusText.textContent = "ISTIRAHAT";
                        widget.classList.add("resting");
                        triggerToast("Sesi Fokus Selesai! Waktunya Istirahat.");
                    } else {
                        pomodoroIsWorkSession = true;
                        pomodoroTimeLeft = 25 * 60;
                        statusText.textContent = "FOKUS";
                        widget.classList.remove("resting");
                        triggerToast("Sesi Istirahat Selesai! Ayo Kembali Fokus Belajar.");
                    }
                    updateDisplay();
                }
            }, 1000);
        }
    }

    function resetTimer() {
        if (typeof playSound === "function") playSound("click");
        clearInterval(pomodoroInterval);
        pomodoroIsRunning = false;
        pomodoroIsWorkSession = true;
        pomodoroTimeLeft = 25 * 60;
        statusText.textContent = "FOKUS";
        widget.classList.remove("resting");
        startBtn.innerHTML = `<i class="fa-solid fa-play"></i> Mulai`;
        updateDisplay();
    }

    startBtn.addEventListener("click", toggleTimer);
    resetBtn.addEventListener("click", resetTimer);

    updateDisplay();
}

/**
 * Logika Simulator Skor IRT Interaktif Ter-upgrade
 */
function initIrtSimulatorEnhanced() {
    const slider = document.getElementById("irtCorrectRange");
    const sliderVal = document.getElementById("irtCorrectVal");
    const clusterSelect = document.getElementById("irtPtnCluster");
    const diffButtons = document.querySelectorAll(".irt-sim-option-btn");
    const scoreVal = document.getElementById("irtScoreVal");
    const scoreRing = document.getElementById("irtScoreRing");
    const verdict = document.getElementById("irtVerdict");
    const desc = document.getElementById("irtDesc");
    const recomList = document.getElementById("irtRecommendationsList");

    if (!slider || !sliderVal || !scoreVal) return;

    // Weight select dynamic injection
    const clusterField = clusterSelect.parentNode;
    let weightSelect = document.getElementById("irtWeightAdjuster");
    if (!weightSelect) {
        const weightingField = document.createElement("div");
        weightingField.className = "field";
        weightingField.style.marginTop = "10px";
        weightingField.innerHTML = `
            <label for="irtWeightAdjuster">Bobot Relevansi Sub-tes (Minat Prodi)</label>
            <select id="irtWeightAdjuster" style="width: 100%; padding: 10px 14px; border-radius: 12px; border: 1px solid var(--border); background: var(--card-bg); color: var(--dark); font-family: inherit; font-weight: bold; cursor: pointer;">
                <option value="1.0" selected>Netral (1.0x)</option>
                <option value="1.1">Sesuai Minat (1.1x)</option>
                <option value="1.2">Sangat Relevan (1.2x - Kedokteran/TI)</option>
            </select>
        `;
        clusterField.parentNode.insertBefore(weightingField, clusterField.nextSibling);
        weightSelect = document.getElementById("irtWeightAdjuster");
    }

    let correctCount = parseInt(slider.value) || 10;
    let difficultyMultiplier = 1.0;

    slider.addEventListener("input", (e) => {
        correctCount = parseInt(e.target.value);
        sliderVal.textContent = correctCount;
        calculateIrtScore();
    });

    clusterSelect.addEventListener("change", calculateIrtScore);
    if (weightSelect) {
        weightSelect.addEventListener("change", calculateIrtScore);
    }

    diffButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            diffButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            
            const level = btn.dataset.difficulty;
            if (level === "mudah") {
                difficultyMultiplier = 0.85;
            } else if (level === "sedang") {
                difficultyMultiplier = 1.0;
            } else if (level === "sulit") {
                difficultyMultiplier = 1.25;
            }
            if (typeof playSound === "function") playSound("click");
            calculateIrtScore();
        });
    });

    function calculateIrtScore() {
        const totalQuestions = 20;
        const cluster = parseInt(clusterSelect.value) || 2;
        const relevanceMultiplier = weightSelect ? parseFloat(weightSelect.value) : 1.0;

        let score = 400 + Math.round((correctCount / totalQuestions) * 400 * difficultyMultiplier * relevanceMultiplier);
        score = Math.max(400, Math.min(900, score));
        scoreVal.textContent = score;

        const pct = ((score - 400) / 500) * 100;
        scoreRing.style.setProperty("--score-pct", `${pct}%`);

        let scoreColor = "#ef4444";
        if (score >= 750) {
            scoreColor = "#00d2d3"; // toska
        } else if (score >= 650) {
            scoreColor = "var(--green)"; // green
        } else if (score >= 550) {
            scoreColor = "var(--orange)"; // orange
        }
        scoreRing.style.background = `conic-gradient(${scoreColor} ${pct}%, var(--border) 0)`;

        let verdictText = "";
        let descText = "";

        if (score >= 800) {
            verdictText = "Sangat Istimewa (Top 1%)";
            descText = "Peluang lolos sangat tinggi pada program studi dengan tingkat keketatan ekstrem seperti Kedokteran UI/UGM, STEI ITB, atau Aktuaria.";
        } else if (score >= 700) {
            verdictText = "Sangat Siap & Kompetitif";
            descText = "Peluang tinggi untuk masuk prodi terfavorit (Teknik Informatika, Hukum, Psikologi, FEB) di PTN Kluster 1 (UI, ITB, UGM, Unair).";
        } else if (score >= 600) {
            verdictText = "Cukup Aman & Stabil";
            descText = "Peluang baik pada program studi rumpun Saintek/Soshum menengah ke atas di PTN Kluster 2 atau prodi umum PTN Kluster 1.";
        } else if (score >= 500) {
            verdictText = "Butuh Penguatan Konsep";
            descText = "Nilai Anda berada di rata-rata nasional. Fokuskan belajar pada mata pelajaran dengan akurasi terlemah untuk mendongkrak skor.";
        } else {
            verdictText = "Tahap Fondasi Awal";
            descText = "Skor Anda di bawah rata-rata. Direkomendasikan mempelajari kembali materi fundamental dasar sebelum mencoba simulasi berwaktu.";
        }

        verdict.textContent = verdictText;
        desc.textContent = descText;

        let majors = [];
        if (cluster === 1) {
            if (score >= 750) {
                majors = [
                    { name: "Pendidikan Dokter UGM", quota: 180, chance: "Sangat Tinggi (85%)" },
                    { name: "Ilmu Komputer UI", quota: 120, chance: "Sangat Tinggi (80%)" },
                    { name: "STEI ITB", quota: 220, chance: "Tinggi (75%)" }
                ];
            } else if (score >= 650) {
                majors = [
                    { name: "Teknik Industri UI", quota: 150, chance: "Tinggi (70%)" },
                    { name: "FEB (Akuntansi) UGM", quota: 200, chance: "Tinggi (68%)" },
                    { name: "Statistika ITS", quota: 90, chance: "Sedang (55%)" }
                ];
            } else if (score >= 550) {
                majors = [
                    { name: "Sastra Inggris UI", quota: 80, chance: "Sedang (50%)" },
                    { name: "Agribisnis IPB", quota: 160, chance: "Sedang (45%)" },
                    { name: "Biologi UGM", quota: 100, chance: "Rendah (35%)" }
                ];
            } else {
                majors = [
                    { name: "Fisika Murni UI", quota: 90, chance: "Rendah (20%)" },
                    { name: "Sastra Nusantara UGM", quota: 60, chance: "Rendah (25%)" }
                ];
            }
        } else if (cluster === 2) {
            if (score >= 700) {
                majors = [
                    { name: "Pendidikan Dokter UNPAD", quota: 150, chance: "Sangat Tinggi (90%)" },
                    { name: "Teknik Informatika UB", quota: 250, chance: "Sangat Tinggi (85%)" },
                    { name: "Farmasi UNPAD", quota: 120, chance: "Tinggi (78%)" }
                ];
            } else if (score >= 600) {
                majors = [
                    { name: "Manajemen UNPAD", quota: 180, chance: "Tinggi (70%)" },
                    { name: "Psikologi UB", quota: 200, chance: "Tinggi (65%)" },
                    { name: "Ilmu Komunikasi UNNES", quota: 140, chance: "Sedang (55%)" }
                ];
            } else if (score >= 500) {
                majors = [
                    { name: "Sosiologi UB", quota: 120, chance: "Sedang (50%)" },
                    { name: "Ilmu Kelautan UNPAD", quota: 90, chance: "Sedang (45%)" },
                    { name: "Kehutanan UB", quota: 180, chance: "Rendah (30%)" }
                ];
            } else {
                majors = [
                    { name: "Filsafat UB", quota: 80, chance: "Rendah (25%)" }
                ];
            }
        } else {
            if (score >= 600) {
                majors = [
                    { name: "Teknik Sipil Regional", quota: 120, chance: "Sangat Tinggi (95%)" },
                    { name: "Manajemen Regional", quota: 160, chance: "Sangat Tinggi (90%)" },
                    { name: "Farmasi Regional", quota: 80, chance: "Tinggi (80%)" }
                ];
            } else if (score >= 500) {
                majors = [
                    { name: "Ilmu Hukum Regional", quota: 150, chance: "Tinggi (75%)" },
                    { name: "Agroteknologi", quota: 120, chance: "Tinggi (70%)" },
                    { name: "Pendidikan Guru SD", quota: 180, chance: "Sedang (60%)" }
                ];
            } else if (score >= 400) {
                majors = [
                    { name: "Kehutanan Regional", quota: 100, chance: "Sedang (50%)" },
                    { name: "Peternakan Regional", quota: 140, chance: "Sedang (45%)" }
                ];
            } else {
                majors = [
                    { name: "Pendidikan Sejarah", quota: 60, chance: "Rendah (30%)" }
                ];
            }
        }

        recomList.innerHTML = `
            <table class="irt-recom-table">
                <thead>
                    <tr>
                        <th>Program Studi</th>
                        <th>Daya Tampung</th>
                        <th>Peluang Masuk</th>
                    </tr>
                </thead>
                <tbody>
                    ${majors.map(m => `
                        <tr>
                            <td><strong>${m.name}</strong></td>
                            <td>${m.quota} kursi</td>
                            <td style="color: ${m.chance.includes('Sangat') || m.chance.includes('Tinggi') ? 'var(--green-dark)' : m.chance.includes('Sedang') ? 'var(--orange)' : '#ef4444'}; font-weight: 850;">${m.chance}</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        `;
    }

    calculateIrtScore();
}

/**
 * Logika Formula Sheet Drawer & Reset Progres Total
 */
function initDrawerAndReset() {
    const drawer = document.getElementById("formulaDrawer");
    const toggleBtn = document.getElementById("formulaToggleBtn");
    const closeBtn = document.getElementById("formulaDrawerClose");
    const resetBtn = document.getElementById("resetAllTkaProgressBtn");

    if (toggleBtn && drawer) {
        toggleBtn.addEventListener("click", () => {
            drawer.classList.add("active");
            drawer.setAttribute("aria-hidden", "false");
            if (typeof playSound === "function") playSound("click");
        });
    }

    if (closeBtn && drawer) {
        closeBtn.addEventListener("click", () => {
            drawer.classList.remove("active");
            drawer.setAttribute("aria-hidden", "true");
            if (typeof playSound === "function") playSound("click");
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            const conf = confirm("Apakah Anda yakin ingin menghapus semua progres belajar TKA? Tindakan ini akan mereset data tryout, silabus, planner, dan jadwal belajar Anda.");
            if (conf) {
                localStorage.removeItem("snbt_stats");
                localStorage.removeItem("tka_checklist");
                localStorage.removeItem("tka_syllabus_progress");
                localStorage.removeItem("tka_weekly_roadmap_checked");
                localStorage.removeItem("tka_daily_schedule");
                localStorage.removeItem("tka_bookmarks");
                localStorage.removeItem("tka_mistakes_diary");
                localStorage.removeItem("tka_awarded_xp");
                localStorage.removeItem("tka_planner_prefs");
                localStorage.removeItem("tka_prev_readiness_level");
                
                if (typeof playSound === "function") playSound("alarm");
                alert("Seluruh data progres belajar TKA berhasil dibersihkan.");
                window.location.reload();
            }
        });
    }
}
