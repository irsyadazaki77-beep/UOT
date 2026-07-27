(function () {
    "use strict";

    if (typeof BOOKS === "undefined" || !Array.isArray(BOOKS)) return;

    const profiles = {
        CS: { lens: "pemecahan masalah komputasional dan kualitas program", concepts: ["dekomposisi masalah", "abstraksi", "alur data", "pengujian"], application: "membangun fitur aplikasi kecil yang mudah diuji dan dikembangkan", evidence: "hasil eksekusi, test case, serta keterbacaan kode", pitfalls: ["langsung menulis kode sebelum memahami kebutuhan", "mengabaikan kasus batas", "mencampur terlalu banyak tanggung jawab dalam satu fungsi"], practice: "pecah sebuah kebutuhan aplikasi menjadi input, proses, output, dan minimal tiga kasus uji" },
        Database: { lens: "struktur data, konsistensi, dan pengambilan informasi", concepts: ["entitas dan relasi", "integritas data", "query", "transaksi"], application: "merancang penyimpanan data akademik yang akurat dan mudah ditelusuri", evidence: "skema, constraint, hasil query, serta rencana eksekusi", pitfalls: ["menyimpan data berulang tanpa alasan", "tidak menetapkan kunci dan constraint", "mengoptimalkan query tanpa mengukur bottleneck"], practice: "gambar skema sederhana, tentukan primary key, lalu tulis pertanyaan bisnis yang harus dijawab oleh query" },
        Design: { lens: "kebutuhan pengguna, kejelasan antarmuka, dan aksesibilitas", concepts: ["riset pengguna", "hierarki informasi", "prototipe", "evaluasi usability"], application: "memperbaiki alur layanan digital agar lebih mudah dipahami dan digunakan", evidence: "observasi pengguna, tingkat keberhasilan tugas, waktu penyelesaian, dan umpan balik", pitfalls: ["menganggap preferensi pribadi sebagai kebutuhan pengguna", "memoles visual sebelum alur jelas", "mengabaikan aksesibilitas dan kondisi ekstrem"], practice: "pilih satu layar, tulis tujuan penggunanya, lalu evaluasi hierarki, affordance, feedback, dan aksesibilitasnya" },
        Security: { lens: "risiko, kontrol berlapis, dan ketahanan sistem", concepts: ["aset dan ancaman", "autentikasi", "otorisasi", "respons insiden"], application: "melindungi layanan digital tanpa menghambat kebutuhan pengguna secara berlebihan", evidence: "threat model, log audit, hasil pengujian, dan metrik insiden", pitfalls: ["mengandalkan satu lapisan keamanan", "menyimpan rahasia di kode", "memperbaiki gejala tanpa menganalisis akar masalah"], practice: "buat threat model singkat berisi aset, aktor ancaman, jalur serangan, dampak, dan mitigasi" },
        Web: { lens: "fondasi web yang semantik, responsif, cepat, dan inklusif", concepts: ["struktur dokumen", "cascade dan layout", "interaksi klien", "progressive enhancement"], application: "membangun halaman yang tetap berguna pada berbagai perangkat dan kondisi jaringan", evidence: "validitas markup, pengujian keyboard, performa, dan perilaku lintas viewport", pitfalls: ["menggunakan elemen tanpa makna semantik", "mengunci layout pada satu ukuran layar", "mengabaikan status loading, kosong, dan error"], practice: "audit satu halaman menggunakan keyboard, viewport sempit, jaringan lambat, dan JavaScript yang dinonaktifkan" },
        Math: { lens: "penalaran kuantitatif, pola, dan pembuktian", concepts: ["definisi", "representasi", "prosedur", "verifikasi"], application: "memodelkan situasi nyata menjadi hubungan matematis yang dapat dianalisis", evidence: "langkah perhitungan, konsistensi satuan, pembuktian, dan pemeriksaan hasil", pitfalls: ["menghafal rumus tanpa memahami syaratnya", "melewatkan satuan dan domain", "menerima hasil kalkulator tanpa estimasi kewajaran"], practice: "selesaikan satu masalah dengan representasi simbolik, numerik, dan visual lalu bandingkan hasilnya" },
        Psychology: { lens: "perilaku, proses mental, dan kualitas bukti empiris", concepts: ["kognisi", "motivasi", "kebiasaan", "metode penelitian"], application: "merancang kebiasaan belajar yang realistis berdasarkan cara manusia berpikir dan bertindak", evidence: "observasi terstruktur, eksperimen, ukuran perilaku, dan replikasi", pitfalls: ["menggeneralisasi pengalaman pribadi", "menganggap korelasi sebagai sebab-akibat", "mengabaikan konteks sosial dan perbedaan individu"], practice: "rumuskan satu perubahan perilaku, pemicu, tindakan, imbalan, dan cara mengukurnya selama tujuh hari" },
        Economics: { lens: "pilihan dalam kelangkaan, insentif, dan konsekuensi distribusi", concepts: ["biaya peluang", "permintaan dan penawaran", "insentif", "eksternalitas"], application: "menilai keputusan rumah tangga, perusahaan, atau kebijakan publik", evidence: "data harga dan kuantitas, asumsi model, elastisitas, dan dampak pada kelompok berbeda", pitfalls: ["menganggap model sebagai gambaran sempurna", "mengabaikan biaya peluang", "hanya melihat dampak rata-rata dan melupakan distribusi"], practice: "analisis satu kebijakan dengan mengidentifikasi pihak yang mendapat manfaat, menanggung biaya, dan mengubah perilaku" },
        History: { lens: "perubahan dari waktu ke waktu, kausalitas, dan perspektif sumber", concepts: ["kronologi", "konteks", "sumber primer", "interpretasi"], application: "menjelaskan peristiwa sebagai hasil interaksi aktor, struktur, dan kondisi zamannya", evidence: "perbandingan sumber, konteks produksi dokumen, serta kesinambungan dan perubahan", pitfalls: ["menilai masa lalu hanya dengan nilai masa kini", "mengandalkan satu sumber", "menyederhanakan peristiwa menjadi satu penyebab"], practice: "bandingkan dua sumber mengenai peristiwa yang sama dan catat posisi, tujuan, serta bagian yang saling menguatkan" },
        Biology: { lens: "struktur, fungsi, pewarisan, dan interaksi sistem kehidupan", concepts: ["sel", "homeostasis", "genetika", "evolusi"], application: "menjelaskan fenomena kehidupan dari tingkat molekul hingga ekosistem", evidence: "pengamatan, eksperimen terkontrol, data komparatif, dan mekanisme biologis", pitfalls: ["menghafal istilah tanpa menghubungkan mekanisme", "menganggap sistem biologis selalu linear", "mengabaikan variasi dan pengaruh lingkungan"], practice: "buat diagram sebab-akibat yang menghubungkan perubahan pada satu komponen dengan respons sistem secara keseluruhan" },
        Literature: { lens: "bahasa, bentuk, makna, dan konteks budaya", concepts: ["narasi", "gaya bahasa", "sudut pandang", "interpretasi"], application: "membaca karya secara dekat sambil menghubungkannya dengan konteks sosial dan pilihan estetik", evidence: "kutipan teks, pola bahasa, struktur karya, dan dialog dengan tafsir alternatif", pitfalls: ["meringkas plot tanpa menganalisis bentuk", "memaksakan satu tafsir final", "membuat klaim tanpa bukti tekstual"], practice: "pilih satu paragraf, tandai pilihan kata penting, lalu jelaskan bagaimana bentuknya memengaruhi makna" },
        Law: { lens: "norma, kewenangan, prosedur, dan keadilan", concepts: ["sumber hukum", "hak dan kewajiban", "penalaran hukum", "kepastian hukum"], application: "menganalisis persoalan dengan memisahkan fakta, isu, aturan, penerapan, dan kesimpulan", evidence: "peraturan yang berlaku, putusan, doktrin, dan fakta yang dapat diverifikasi", pitfalls: ["mengutip aturan tanpa memeriksa konteks", "mencampur fakta dengan opini", "mengabaikan prosedur dan hierarki norma"], practice: "gunakan kerangka fakta–isu–aturan–analisis–kesimpulan pada sebuah kasus hipotetis sederhana" },
        Education: { lens: "tujuan belajar, pengalaman peserta didik, dan asesmen bermakna", concepts: ["capaian belajar", "strategi pembelajaran", "asesmen", "umpan balik"], application: "merancang pembelajaran yang selaras antara tujuan, aktivitas, dan bukti pemahaman", evidence: "hasil kerja peserta didik, observasi proses, asesmen formatif, dan refleksi", pitfalls: ["memulai dari aktivitas tanpa tujuan", "menyamakan nilai dengan seluruh proses belajar", "memberi umpan balik yang tidak dapat ditindaklanjuti"], practice: "tulis satu tujuan terukur, aktivitas latihan, kriteria keberhasilan, dan bentuk umpan baliknya" },
        Health: { lens: "pencegahan, faktor risiko, dan kesehatan populasi", concepts: ["determinan kesehatan", "promosi kesehatan", "epidemiologi", "evaluasi intervensi"], application: "menilai kebiasaan atau program kesehatan berdasarkan manfaat, risiko, dan konteks", evidence: "data epidemiologis, panduan berbasis bukti, ukuran hasil, dan kualitas studi", pitfalls: ["menganggap satu pengalaman sebagai bukti umum", "mengabaikan dosis dan risiko", "menyamakan hubungan statistik dengan diagnosis individu"], practice: "evaluasi satu klaim kesehatan dengan memeriksa sumber, desain studi, ukuran efek, risiko, dan relevansinya" },
        Environment: { lens: "keterhubungan ekosistem, sumber daya, dan keberlanjutan", concepts: ["siklus materi", "keanekaragaman hayati", "daya dukung", "mitigasi dan adaptasi"], application: "menilai dampak lingkungan sepanjang siklus hidup suatu aktivitas atau produk", evidence: "pengukuran lapangan, inventaris emisi, indikator ekologi, dan analisis skenario", pitfalls: ["memindahkan dampak dari satu tahap ke tahap lain", "mengabaikan skala waktu", "mengklaim solusi hijau tanpa batas sistem yang jelas"], practice: "petakan input, proses, output, dampak langsung, dan dampak tidak langsung dari satu kegiatan sehari-hari" },
        Business: { lens: "penciptaan nilai, operasi, pelanggan, dan keberlanjutan usaha", concepts: ["proposisi nilai", "segmen pelanggan", "model pendapatan", "kapabilitas operasi"], application: "menguji apakah ide bisnis menyelesaikan masalah nyata secara layak dan berkelanjutan", evidence: "wawancara pelanggan, perilaku pembelian, unit economics, dan retensi", pitfalls: ["menganggap ketertarikan sebagai kesediaan membeli", "bertumbuh tanpa memahami unit economics", "mengukur aktivitas tanpa menghubungkannya dengan outcome"], practice: "tulis hipotesis masalah, pelanggan, nilai, kanal, biaya, pendapatan, dan eksperimen termurah untuk mengujinya" },
        AI: { lens: "kemampuan model, evaluasi, risiko, dan integrasi manusia", concepts: ["data dan representasi", "inferensi", "evaluasi", "guardrail"], application: "membangun fitur AI yang berguna, terukur, transparan, dan memiliki fallback", evidence: "evaluation set, rubrik manusia, metrik kualitas, error analysis, dan feedback pengguna", pitfalls: ["menganggap keluaran fasih selalu benar", "menguji hanya contoh ideal", "memberi model akses atau data lebih luas dari yang diperlukan"], practice: "buat lima kasus uji normal, tiga edge case, rubrik kualitas, dan tindakan aman ketika hasil gagal" },
        Cloud: { lens: "reliability, otomatisasi, keamanan, dan efisiensi operasi", concepts: ["infrastruktur sebagai kode", "delivery berkelanjutan", "observability", "pemulihan"], application: "mengoperasikan layanan yang dapat dirilis dan dipulihkan secara konsisten", evidence: "test pipeline, metrik layanan, log, trace, runbook, serta hasil latihan pemulihan", pitfalls: ["mengubah produksi secara manual tanpa audit", "memantau server tetapi bukan pengalaman pengguna", "merancang rollback setelah insiden terjadi"], practice: "gambar alur commit hingga produksi lengkap dengan validasi, approval, metrik sukses, dan jalur rollback" },
        Product: { lens: "masalah pengguna, outcome, prioritas, dan pembelajaran produk", concepts: ["discovery", "strategi", "eksperimen", "delivery"], application: "mengubah masalah bernilai tinggi menjadi solusi yang terukur dan dapat dioperasikan", evidence: "riset pengguna, data perilaku, hasil eksperimen, metrik outcome, dan guardrail", pitfalls: ["memulai dari daftar fitur", "mengubah roadmap menjadi janji kaku", "menilai keberhasilan hanya dari jumlah rilis"], practice: "tulis problem statement, asumsi paling berisiko, eksperimen, outcome utama, dan guardrail" },
        DataScience: { lens: "pertanyaan, kualitas data, analisis, dan komunikasi keputusan", concepts: ["pengumpulan data", "eksplorasi", "pemodelan", "interpretasi"], application: "mengubah data mentah menjadi insight yang dapat diuji dan digunakan", evidence: "data dictionary, notebook yang dapat direproduksi, metrik, visualisasi, dan analisis ketidakpastian", pitfalls: ["menganalisis sebelum mendefinisikan pertanyaan", "membocorkan data uji ke proses pelatihan", "menyembunyikan keterbatasan di balik visualisasi menarik"], practice: "susun pertanyaan analitis, unit observasi, variabel, pemeriksaan kualitas, metode, dan bentuk komunikasi hasil" },
        Robotics: { lens: "persepsi, keputusan, kendali, dan keselamatan sistem fisik", concepts: ["sensor", "aktuator", "umpan balik", "otonomi"], application: "membangun robot yang dapat mengamati, bertindak, dan pulih dari kondisi tidak pasti", evidence: "log sensor, error posisi, latensi, tingkat keberhasilan tugas, dan hasil uji keselamatan", pitfalls: ["menguji hanya di simulasi ideal", "mengabaikan noise dan keterlambatan", "tidak menetapkan kondisi berhenti yang aman"], practice: "gambar loop sense–plan–act, tulis sumber error, batas aman, serta respons robot ketika sensor gagal" }
    };

    const fallback = { lens: "pemahaman konseptual, penerapan, dan evaluasi bukti", concepts: ["definisi", "hubungan konsep", "penerapan", "evaluasi"], application: "menghubungkan gagasan utama dengan persoalan nyata", evidence: "contoh, data, alasan, dan pemeriksaan terhadap alternatif", pitfalls: ["menghafal tanpa memahami hubungan", "membuat kesimpulan tanpa bukti", "mengabaikan konteks dan batas penerapan"], practice: "buat peta konsep, satu contoh, satu contoh tandingan, dan tiga pertanyaan yang belum terjawab" };

    function escapeHtml(value) {
        return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
    }

    function buildDepth(book, chapter, chapterIndex) {
        const profile = profiles[book.category] || fallback;
        const chapterName = chapter.title.replace(/^Bab\s+\d+\s*:\s*/i, "");
        const rotation = chapterIndex % profile.concepts.length;
        const concepts = profile.concepts.slice(rotation).concat(profile.concepts.slice(0, rotation));
        const chapterAngles = [
            "membangun fondasi dan menyusun batas masalah sebelum memilih metode",
            "mengubah konsep menjadi proses kerja yang dapat diamati dan diperiksa",
            "mengintegrasikan beberapa konsep untuk mengevaluasi hasil dan mengambil keputusan"
        ];
        const chapterAngle = chapterAngles[chapterIndex % chapterAngles.length];
        const objectives = [
            `Menjelaskan ${concepts[0]} dengan bahasa sendiri dan menghubungkannya dengan isi bab.`,
            `Membedakan peran ${concepts[1]} dan ${concepts[2]} dalam sebuah kasus nyata.`,
            `Menerapkan prinsip bab untuk ${profile.application}.`,
            `Menilai kekuatan kesimpulan menggunakan ${profile.evidence}.`
        ];
        const checks = ["Saya dapat menjelaskan ide utama tanpa menyalin teks.", "Saya dapat memberi contoh dan contoh tandingan.", "Saya dapat menerapkan konsep pada situasi baru.", "Saya dapat menyebutkan bukti, asumsi, dan keterbatasannya."];
        const conceptDetails = [
            {
                title: concepts[0],
                body: `Konsep ini menjadi titik awal untuk memahami ${chapterName}. Definisikan ruang lingkupnya secara operasional: apa yang termasuk, apa yang tidak termasuk, kondisi apa yang harus ada, dan hasil apa yang ingin diamati.`,
                example: `Bukti awalnya dapat berupa ${profile.evidence}. Tanpa definisi yang jelas, dua orang dapat memakai istilah yang sama tetapi menilai hal yang berbeda.`
            },
            {
                title: concepts[1],
                body: `Konsep kedua berfungsi sebagai penghubung antara teori dan proses. Perhatikan input yang diterima, perubahan yang terjadi, output yang dihasilkan, serta dependensi yang dapat memengaruhi hasil.`,
                example: `Ketika diterapkan untuk ${profile.application}, catat urutan keputusan dan alasan pada setiap tahap agar proses dapat ditinjau ulang.`
            },
            {
                title: concepts[2],
                body: `Konsep ini membantu membandingkan alternatif. Sebuah pilihan tidak cukup disebut baik; pilihan tersebut harus dinilai terhadap tujuan, biaya, risiko, waktu, kualitas, dan kelompok yang menerima dampaknya.`,
                example: `Gunakan sedikitnya dua skenario: kondisi normal dan kondisi batas. Perbedaan hasil keduanya menunjukkan seberapa kuat solusi menghadapi perubahan konteks.`
            },
            {
                title: concepts[3],
                body: `Konsep terakhir menutup siklus melalui evaluasi. Tentukan indikator sebelum menjalankan solusi, ukur hasil aktual, lalu bandingkan dengan target dan baseline yang relevan.`,
                example: `Jika bukti tidak mendukung dugaan awal, revisi asumsi atau metode. Perbaikan semacam ini adalah bagian dari pembelajaran, bukan tanda bahwa proses gagal.`
            }
        ];
        const tradeoffs = [
            ["Kecepatan", "Keputusan dan hasil dapat diperoleh lebih cepat.", "Risiko melewatkan konteks, kasus batas, atau pemeriksaan penting.", "Gunakan prototipe kecil dan tetapkan kondisi berhenti."],
            ["Ketelitian", "Hasil lebih dapat dijelaskan dan dipertanggungjawabkan.", "Membutuhkan waktu, data, atau koordinasi tambahan.", `Prioritaskan bukti yang paling relevan: ${profile.evidence}.`],
            ["Kesederhanaan", "Lebih mudah dipahami, digunakan, dan dipelihara.", "Dapat menghilangkan nuansa atau variasi penting.", "Dokumentasikan batas penerapan dan siapkan jalur eskalasi."],
            ["Skala", "Pendekatan dapat menjangkau lebih banyak kasus atau pengguna.", "Kesalahan kecil dapat menghasilkan dampak yang lebih luas.", "Uji bertahap, pantau indikator, dan sediakan mekanisme pemulihan."]
        ];
        const glossary = [
            [concepts[0], `gagasan dasar yang menetapkan fokus analisis pada ${chapterName}`],
            [concepts[1], "mekanisme yang menghubungkan masukan, proses, dan hasil"],
            [concepts[2], "sudut pandang untuk membandingkan pilihan serta konsekuensinya"],
            [concepts[3], "cara memeriksa kualitas hasil dan menentukan perbaikan"],
            ["indikator", "ukuran yang dipilih untuk menunjukkan kemajuan atau keberhasilan"],
            ["asumsi", "anggapan sementara yang perlu dinyatakan dan diuji dengan bukti"],
            ["batas penerapan", "kondisi ketika sebuah konsep atau kesimpulan masih layak digunakan"],
            ["trade-off", "pertukaran manfaat dan biaya ketika satu pilihan memperkuat aspek tertentu tetapi melemahkan aspek lain"]
        ];

        return `<section class="reading-depth-section" aria-label="Pendalaman materi">
            <div class="reading-depth-kicker">Pendalaman materi</div>
            <h2>Memperluas pemahaman tentang ${escapeHtml(chapterName)}</h2>
            <p>Bagian ini menempatkan pembahasan <strong>${escapeHtml(chapterName)}</strong> dalam kerangka ${escapeHtml(profile.lens)}. Tujuannya bukan sekadar menambah istilah, tetapi membantu kamu melihat hubungan antara konsep, bukti, keputusan, dan konsekuensi penerapannya.</p>
            <p>Dalam konteks buku <em>${escapeHtml(book.title)}</em>, gagasan pada bab ini sebaiknya dibaca sebagai bagian dari sebuah sistem. Perubahan pada satu unsur dapat memengaruhi unsur lain. Karena itu, setiap klaim perlu diuji melalui ${escapeHtml(profile.evidence)}, bukan hanya diterima karena terdengar masuk akal.</p>

            <h3>Tujuan belajar lanjutan</h3>
            <ul class="depth-objectives">${objectives.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>

            <h3>Landasan konseptual secara rinci</h3>
            <p>Pada bab ini fokus pendalaman adalah <strong>${escapeHtml(chapterAngle)}</strong>. Empat konsep berikut perlu dibaca sebagai rangkaian, bukan sebagai istilah yang berdiri sendiri.</p>
            <div class="depth-concept-grid">
                ${conceptDetails.map((item, index) => `<article>
                    <span>Konsep ${index + 1}</span>
                    <h4>${escapeHtml(item.title)}</h4>
                    <p>${escapeHtml(item.body)}</p>
                    <p class="depth-concept-example"><strong>Dalam praktik:</strong> ${escapeHtml(item.example)}</p>
                </article>`).join("")}
            </div>

            <h3>Peta konsep</h3>
            <div class="depth-table-wrap"><table class="depth-concept-table">
                <thead><tr><th>Konsep</th><th>Pertanyaan kunci</th><th>Bukti pemahaman</th></tr></thead>
                <tbody>
                    <tr><td>${escapeHtml(concepts[0])}</td><td>Apa definisi operasionalnya dan kapan konsep ini relevan?</td><td>Dapat memberi definisi, contoh, dan contoh tandingan.</td></tr>
                    <tr><td>${escapeHtml(concepts[1])}</td><td>Bagaimana konsep ini berhubungan dengan tujuan bab?</td><td>Dapat menggambar hubungan sebab, proses, atau struktur.</td></tr>
                    <tr><td>${escapeHtml(concepts[2])}</td><td>Apa yang berubah jika asumsi atau kondisinya berbeda?</td><td>Dapat membandingkan dua skenario dan menjelaskan trade-off.</td></tr>
                    <tr><td>${escapeHtml(concepts[3])}</td><td>Bagaimana hasilnya diperiksa dan diperbaiki?</td><td>Dapat menentukan indikator, batas, dan langkah evaluasi.</td></tr>
                </tbody>
            </table></div>

            <h3>Studi kasus bertahap</h3>
            <p>Bayangkan kamu diminta ${escapeHtml(profile.application)}. Tim memiliki waktu terbatas, informasi yang belum lengkap, dan beberapa kepentingan yang berbeda. Gunakan alur berikut agar keputusan tidak melompat langsung menuju solusi:</p>
            <ol class="depth-steps">
                <li><strong>Definisikan situasi.</strong> Tulis tujuan, pihak yang terlibat, batasan, serta istilah penting dari bab ini.</li>
                <li><strong>Kumpulkan bukti.</strong> Tentukan data atau observasi yang diperlukan. Pisahkan fakta, asumsi, dan interpretasi.</li>
                <li><strong>Buat alternatif.</strong> Susun sedikitnya dua pendekatan. Jelaskan manfaat, biaya, risiko, dan kondisi ketika setiap pendekatan cocok.</li>
                <li><strong>Uji dalam skala kecil.</strong> Pilih indikator keberhasilan dan kondisi berhenti. Catat hasil yang mendukung maupun menolak dugaan awal.</li>
                <li><strong>Refleksikan hasil.</strong> Jelaskan apa yang dipelajari, keterbatasan bukti, dan keputusan berikutnya.</li>
            </ol>
            <div class="depth-callout"><strong>Mengapa alur ini penting?</strong><p>Pemahaman yang matang terlihat ketika seseorang dapat menjelaskan alasan di balik keputusan, menunjukkan bukti, serta mengubah kesimpulan saat bukti baru muncul.</p></div>

            <h3>Contoh analisis lengkap</h3>
            <div class="depth-worked-example">
                <p><strong>Situasi:</strong> Sebuah tim perlu ${escapeHtml(profile.application)}. Hasil awal terlihat menjanjikan, tetapi tim belum memiliki kriteria keberhasilan yang disepakati dan hanya menguji satu kondisi ideal.</p>
                <h4>1. Merumuskan masalah</h4>
                <p>Tim menulis ulang tujuan menjadi pertanyaan yang dapat diuji: “Bagaimana menerapkan ${escapeHtml(chapterName)} sehingga hasilnya memenuhi tujuan pengguna, dapat diperiksa melalui ${escapeHtml(profile.evidence)}, dan tetap aman ketika kondisi berubah?” Rumusan ini memisahkan tujuan dari solusi yang sudah diasumsikan.</p>
                <h4>2. Menentukan informasi minimum</h4>
                <p>Informasi dikelompokkan menjadi fakta yang sudah tersedia, asumsi yang belum diuji, serta batasan seperti waktu, sumber daya, aturan, dan risiko. Setiap asumsi diberi pemilik dan cara verifikasi. Asumsi dengan dampak terbesar diuji lebih dahulu.</p>
                <h4>3. Membandingkan alternatif</h4>
                <p>Alternatif A mengutamakan kecepatan dengan ruang lingkup sempit. Alternatif B menambah pemeriksaan dan dokumentasi sehingga lebih lambat tetapi lebih mudah dipertanggungjawabkan. Tim memilih berdasarkan konteks, bukan karena salah satu alternatif selalu lebih baik.</p>
                <h4>4. Menjalankan dan membaca hasil</h4>
                <p>Uji dilakukan pada kasus normal, kasus batas, dan satu kondisi kegagalan. Hasil dibandingkan dengan baseline. Ketika indikator memburuk, tim tidak menutupi penyimpangan, tetapi menelusuri apakah penyebabnya berasal dari input, proses, asumsi, atau cara pengukuran.</p>
                <h4>5. Menarik kesimpulan terbatas</h4>
                <p>Kesimpulan menyebutkan apa yang didukung bukti, pada kondisi apa hasil tersebut berlaku, risiko yang masih tersisa, dan langkah berikutnya. Dengan demikian, laporan tidak berubah menjadi klaim universal yang melampaui data.</p>
            </div>

            <h3>Trade-off yang perlu dipertimbangkan</h3>
            <div class="depth-table-wrap"><table class="depth-tradeoff-table">
                <thead><tr><th>Dimensi</th><th>Manfaat</th><th>Risiko</th><th>Strategi penyeimbang</th></tr></thead>
                <tbody>${tradeoffs.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}</tbody>
            </table></div>

            <h3>Kesalahan umum dan cara memperbaikinya</h3>
            <div class="depth-mistakes">${profile.pitfalls.map((pitfall, index) => `<div><strong>${index + 1}. Hindari ${escapeHtml(pitfall)}.</strong><p>${index === 0 ? "Mulailah dengan menuliskan tujuan dan asumsi secara eksplisit sebelum memilih metode." : index === 1 ? "Gunakan pemeriksaan silang, contoh tandingan, atau pengujian kecil untuk menemukan bagian yang terlewat." : "Dokumentasikan batas penerapan dan siapkan langkah koreksi ketika hasil tidak sesuai harapan."}</p></div>`).join("")}</div>

            <h3>Glosarium bab</h3>
            <dl class="depth-glossary">${glossary.map(([term, definition]) => `<div><dt>${escapeHtml(term)}</dt><dd>${escapeHtml(definition)}.</dd></div>`).join("")}</dl>

            <h3>Uji pemahaman mendalam</h3>
            <div class="depth-review-questions">
                <details><summary>Mengapa definisi operasional penting pada ${escapeHtml(chapterName)}?</summary><p>Definisi operasional menjelaskan apa yang diamati dan bagaimana pengukurannya. Tanpa definisi tersebut, perbedaan hasil dapat berasal dari perbedaan makna, bukan dari konsep atau metode yang sedang dipelajari.</p></details>
                <details><summary>Bagaimana membedakan fakta, asumsi, dan interpretasi?</summary><p>Fakta didukung observasi atau sumber yang dapat diperiksa. Asumsi adalah anggapan sementara yang belum cukup diuji. Interpretasi adalah makna yang diberikan kepada fakta. Ketiganya perlu ditulis terpisah agar kesimpulan tidak terlihat lebih kuat daripada bukti.</p></details>
                <details><summary>Kapan sebuah solusi perlu direvisi?</summary><p>Revisi diperlukan ketika indikator tidak mencapai target, risiko melewati batas yang disepakati, konteks berubah, atau bukti baru melemahkan asumsi utama. Revisi dapat menyasar ruang lingkup, proses, indikator, maupun kesimpulan.</p></details>
                <details><summary>Apa tanda bahwa pemahaman sudah dapat ditransfer?</summary><p>Kamu dapat menjelaskan konsep tanpa menyalin, menerapkannya pada kasus baru, membandingkan beberapa pendekatan, serta menyebutkan kondisi ketika konsep tersebut tidak cocok digunakan.</p></details>
            </div>

            <h3>Latihan mandiri</h3>
            <p><strong>Tugas utama:</strong> ${escapeHtml(profile.practice)}. Kerjakan dalam satu halaman dengan struktur konteks, analisis, bukti, kesimpulan, dan refleksi.</p>
            <ul><li>Apa asumsi paling penting pada jawabanmu?</li><li>Bukti apa yang dapat mengubah kesimpulanmu?</li><li>Siapa yang menerima manfaat atau menanggung risiko dari keputusan tersebut?</li><li>Bagian mana yang masih belum pasti dan perlu dipelajari lebih lanjut?</li></ul>

            <h3>Proyek mini: dari konsep menjadi artefak</h3>
            <div class="depth-project">
                <p>Buat artefak kecil yang menunjukkan penerapan ${escapeHtml(chapterName)} untuk ${escapeHtml(profile.application)}. Artefak dapat berupa prototipe, analisis kasus, diagram, perhitungan, rancangan eksperimen, atau dokumentasi keputusan sesuai bidang buku.</p>
                <ol>
                    <li><strong>Konteks:</strong> jelaskan pengguna atau pihak terkait, tujuan, batasan, dan risiko utama.</li>
                    <li><strong>Model konsep:</strong> tunjukkan hubungan ${escapeHtml(concepts.join(", "))} dalam bentuk diagram atau uraian terstruktur.</li>
                    <li><strong>Penerapan:</strong> buat contoh utama beserta satu kasus normal, satu kasus batas, dan satu kondisi gagal.</li>
                    <li><strong>Evaluasi:</strong> gunakan ${escapeHtml(profile.evidence)} untuk menilai hasil terhadap target atau baseline.</li>
                    <li><strong>Refleksi:</strong> tulis keterbatasan, keputusan yang akan diubah, dan eksperimen berikutnya.</li>
                </ol>
                <div class="depth-rubric">
                    <span><strong>25%</strong> ketepatan konsep</span>
                    <span><strong>25%</strong> kualitas penerapan</span>
                    <span><strong>20%</strong> bukti dan evaluasi</span>
                    <span><strong>15%</strong> analisis risiko</span>
                    <span><strong>15%</strong> kejelasan komunikasi</span>
                </div>
            </div>

            <h3>Rangkuman pendalaman</h3>
            <p>${escapeHtml(chapterName)} dapat dipahami lebih kuat dengan menghubungkan ${escapeHtml(concepts.join(", "))}. Kuasai bukan hanya definisinya, tetapi juga kapan konsep digunakan, bukti apa yang mendukungnya, batas penerapannya, serta bagaimana memperbaiki keputusan ketika kondisi berubah.</p>
            <div class="depth-checklist"><strong>Checklist sebelum lanjut</strong><ul>${checks.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div>
        </section>`;
    }

    BOOKS.forEach((book) => {
        if (!Array.isArray(book.chapters)) return;
        book.contentEdition = "2026.2-expanded";
        book.chapters.forEach((chapter, chapterIndex) => {
            if (!chapter || typeof chapter.content !== "string" || chapter.__depthApplied) return;
            chapter.content += buildDepth(book, chapter, chapterIndex);
            chapter.learningObjectives = [
                `Menjelaskan konsep utama ${chapter.title.replace(/^Bab\s+\d+\s*:\s*/i, "")}.`,
                `Menerapkan materi dalam konteks ${profiles[book.category]?.application || fallback.application}.`,
                `Mengevaluasi hasil menggunakan ${profiles[book.category]?.evidence || fallback.evidence}.`
            ];
            chapter.__depthApplied = true;
        });
        book.expandedWordCount = book.chapters.reduce((total, chapter) => total + chapter.content.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length, 0);
        book.time = `${Math.max(1, Math.ceil(book.expandedWordCount / 190))} menit`;
    });
})();
