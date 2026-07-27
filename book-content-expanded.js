(function () {
    "use strict";

    if (typeof BOOKS === "undefined" || !Array.isArray(BOOKS)) return;

    // Sumber referensi yang disesuaikan berdasarkan kategori
    const trustedSources = {
        CS: [
            "Tannenbaum, A. S. (2014). Structured Computer Organization. Pearson.",
            "Knuth, D. E. (1997). The Art of Computer Programming. Addison-Wesley.",
            "IEEE Computer Society Digital Library."
        ],
        Database: [
            "Silberschatz, A., Korth, H. F., & Sudarshan, S. (2019). Database System Concepts. McGraw-Hill.",
            "Elmasri, R., & Navathe, S. B. (2015). Fundamentals of Database Systems. Pearson.",
            "ACM Transactions on Database Systems (TODS)."
        ],
        Design: [
            "Norman, D. (2013). The Design of Everyday Things. Basic Books.",
            "Nielsen Norman Group (NN/g). Evidence-Based User Experience Research.",
            "Krug, S. (2014). Don't Make Me Think, Revisited. New Riders."
        ],
        Security: [
            "Stallings, W. (2016). Cryptography and Network Security. Pearson.",
            "Anderson, R. (2020). Security Engineering. Wiley.",
            "OWASP Foundation. OWASP Top 10 Security Risks."
        ],
        Web: [
            "Flanagan, D. (2020). JavaScript: The Definitive Guide. O'Reilly Media.",
            "MDN Web Docs (Mozilla Developer Network).",
            "W3C (World Wide Web Consortium) Standards."
        ],
        Math: [
            "Stewart, J. (2015). Calculus: Early Transcendentals. Cengage Learning.",
            "Strang, G. (2016). Introduction to Linear Algebra. Wellesley-Cambridge Press.",
            "Journal of the American Mathematical Society."
        ],
        Psychology: [
            "Kahneman, D. (2011). Thinking, Fast and Slow. Farrar, Straus and Giroux.",
            "American Psychological Association (APA) Journals.",
            "Bandura, A. (1997). Self-Efficacy: The Exercise of Control. Freeman."
        ],
        Economics: [
            "Mankiw, N. G. (2020). Principles of Economics. Cengage Learning.",
            "Krugman, P., & Wells, R. (2015). Economics. Worth Publishers.",
            "The Quarterly Journal of Economics (Oxford University Press)."
        ],
        History: [
            "Harari, Y. N. (2014). Sapiens: A Brief History of Humankind. Harvill Secker.",
            "Journal of Contemporary History (SAGE Journals).",
            "Ricklefs, M. C. (2001). A History of Modern Indonesia since c.1200. Stanford University Press."
        ],
        Biology: [
            "Urry, L. A., et al. (2016). Campbell Biology. Pearson.",
            "Alberts, B., et al. (2014). Molecular Biology of the Cell. Garland Science.",
            "Nature Reviews Genetics (Nature Publishing Group)."
        ],
        Literature: [
            "Eagleton, T. (2008). Literary Theory: An Introduction. University of Minnesota Press.",
            "Abrams, M. H., & Harpham, G. G. (2014). A Glossary of Literary Terms. Cengage Learning.",
            "The Norton Anthology of World Literature."
        ],
        Law: [
            "Asshiddiqie, J. (2006). Pengantar Ilmu Hukum Tata Negara. Sekretariat Jenderal Mahkamah Konstitusi RI.",
            "Garner, B. A. (2014). Black's Law Dictionary. Thomson Reuters.",
            "Harvard Law Review."
        ],
        Education: [
            "Hattie, J. (2008). Visible Learning. Routledge.",
            "Vygotsky, L. S. (1978). Mind in Society. Harvard University Press.",
            "Journal of Educational Psychology."
        ],
        Health: [
            "World Health Organization (WHO). Global Health Observatory Data.",
            "Centers for Disease Control and Prevention (CDC) Morbidity and Mortality Weekly Report.",
            "The Lancet (Elsevier)."
        ],
        Environment: [
            "Intergovernmental Panel on Climate Change (IPCC) Assessment Reports.",
            "Carson, R. (1962). Silent Spring. Houghton Mifflin.",
            "Journal of Environmental Management (Elsevier)."
        ],
        Business: [
            "Porter, M. E. (1998). Competitive Strategy. Free Press.",
            "Harvard Business Review (HBR).",
            "Osterwalder, A., & Pigneur, Y. (2010). Business Model Generation. Wiley."
        ],
        AI: [
            "Russell, S., & Norvig, P. (2020). Artificial Intelligence: A Modern Approach. Pearson.",
            "Goodfellow, I., Bengio, Y., & Courville, A. (2016). Deep Learning. MIT Press.",
            "arXiv: Artificial Intelligence (cs.AI)."
        ],
        Cloud: [
            "Beyer, B., et al. (2016). Site Reliability Engineering. O'Reilly Media.",
            "AWS Architecture Center & Well-Architected Framework.",
            "Kavis, A. K. (2014). Architecting the Cloud. Wiley."
        ],
        Product: [
            "Cagan, M. (2018). Inspired: How to Create Tech Products Customers Love. Wiley.",
            "Torres, T. (2021). Continuous Discovery Habits. Product Talk LLC.",
            "Mind the Product (Global Product Management Community)."
        ],
        DataScience: [
            "Hastie, T., Tibshirani, R., & Friedman, J. (2009). The Elements of Statistical Learning. Springer.",
            "VanderPlas, J. (2016). Python Data Science Handbook. O'Reilly Media.",
            "Journal of Machine Learning Research (JMLR)."
        ],
        Robotics: [
            "Siegwart, R., Nourbakhsh, I. R., & Scaramuzza, D. (2011). Introduction to Autonomous Mobile Robots. MIT Press.",
            "Craig, J. J. (2017). Introduction to Robotics: Mechanics and Control. Pearson.",
            "IEEE Transactions on Robotics."
        ],
        Astronomy: [
            "Carroll, B. W., & Ostlie, D. A. (2017). An Introduction to Modern Astrophysics. Cambridge University Press.",
            "NASA/JPL Exoplanet Archive.",
            "The Astrophysical Journal (AAS)."
        ]
    };

    const fallbackSources = [
        "Oxford University Press. (2022). OUP Academic Journals.",
        "Cambridge University Press. (2023). Reference and Research Database.",
        "JSTOR Digital Library for Academic Journals, Books, and Primary Sources."
    ];

    const authoritativeWebSources = {
        CS: [
            { name: "MDN — JavaScript Guide", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide", note: "Panduan bahasa dan konsep JavaScript yang dipelihara komunitas Mozilla." },
            { name: "ECMA-262 — ECMAScript Language Specification", url: "https://tc39.es/ecma262/", note: "Spesifikasi normatif bahasa ECMAScript dari TC39." }
        ],
        Database: [
            { name: "PostgreSQL — SQL Tutorial", url: "https://www.postgresql.org/docs/current/tutorial-sql.html", note: "Dokumentasi resmi mengenai tabel, query, join, agregasi, dan transaksi." },
            { name: "PostgreSQL — Database Concepts", url: "https://www.postgresql.org/docs/current/tutorial-concepts.html", note: "Pengantar resmi konsep basis data relasional." }
        ],
        Design: [
            { name: "W3C WAI — Accessibility Fundamentals", url: "https://www.w3.org/WAI/fundamentals/", note: "Landasan aksesibilitas digital dari Web Accessibility Initiative." },
            { name: "W3C — Web Content Accessibility Guidelines", url: "https://www.w3.org/WAI/standards-guidelines/wcag/", note: "Standar internasional untuk konten web yang dapat diakses." }
        ],
        Security: [
            { name: "NIST — Cybersecurity Framework 2.0", url: "https://www.nist.gov/cyberframework", note: "Kerangka resmi untuk memahami dan mengelola risiko keamanan siber." },
            { name: "OWASP — Top 10", url: "https://owasp.org/www-project-top-ten/", note: "Daftar risiko keamanan aplikasi web yang disusun komunitas OWASP." }
        ],
        Web: [
            { name: "MDN — Web Development Documentation", url: "https://developer.mozilla.org/en-US/docs/Web", note: "Dokumentasi HTML, CSS, JavaScript, API Web, dan praktik aksesibilitas." },
            { name: "W3C — Web Standards", url: "https://www.w3.org/standards/", note: "Spesifikasi dan standar terbuka untuk teknologi web." }
        ],
        Math: [
            { name: "OpenStax — Calculus", url: "https://openstax.org/subjects/math", note: "Buku teks matematika terbuka dengan penjelasan dan latihan terstruktur." },
            { name: "MIT OpenCourseWare — Mathematics", url: "https://ocw.mit.edu/search/?d=Mathematics", note: "Materi perkuliahan matematika dari Massachusetts Institute of Technology." }
        ],
        Psychology: [
            { name: "APA — Psychological Science", url: "https://www.apa.org/topics", note: "Topik dan publikasi psikologi dari American Psychological Association." },
            { name: "NIMH — Health Topics", url: "https://www.nimh.nih.gov/health", note: "Informasi kesehatan mental berbasis penelitian dari lembaga riset pemerintah AS." }
        ],
        Economics: [
            { name: "World Bank Open Data", url: "https://data.worldbank.org/", note: "Indikator ekonomi dan pembangunan lintas negara." },
            { name: "OECD Data Explorer", url: "https://data-explorer.oecd.org/", note: "Data resmi untuk analisis ekonomi, sosial, dan kebijakan publik." }
        ],
        History: [
            { name: "Arsip Nasional Republik Indonesia", url: "https://anri.go.id/", note: "Lembaga kearsipan nasional dan pintu masuk sumber primer sejarah Indonesia." },
            { name: "Library of Congress — Digital Collections", url: "https://www.loc.gov/collections/", note: "Koleksi sumber primer, peta, foto, naskah, dan rekaman sejarah." }
        ],
        Biology: [
            { name: "NCBI Bookshelf", url: "https://www.ncbi.nlm.nih.gov/books/", note: "Buku dan laporan biomedis yang disediakan National Library of Medicine." },
            { name: "NHGRI — Genomics Educational Resources", url: "https://www.genome.gov/about-genomics", note: "Materi genomika dan genetika dari National Human Genome Research Institute." }
        ],
        Literature: [
            { name: "Library of Congress — Literature Resources", url: "https://www.loc.gov/programs/poetry-and-literature/", note: "Arsip, esai, dan program sastra dari Library of Congress." },
            { name: "Project Gutenberg", url: "https://www.gutenberg.org/", note: "Koleksi karya domain publik untuk latihan pembacaan dekat dan analisis teks." }
        ],
        Law: [
            { name: "JDIH BPK — Database Peraturan", url: "https://peraturan.bpk.go.id/", note: "Basis data peraturan perundang-undangan Republik Indonesia." },
            { name: "Mahkamah Konstitusi RI", url: "https://www.mkri.id/", note: "Putusan, risalah, dan informasi resmi ketatanegaraan Indonesia." }
        ],
        Education: [
            { name: "UNESCO — Education", url: "https://www.unesco.org/en/education", note: "Data, laporan, dan kebijakan pendidikan dari UNESCO." },
            { name: "Education Endowment Foundation — Guidance Reports", url: "https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports", note: "Rekomendasi pembelajaran yang disusun dari sintesis bukti pendidikan." }
        ],
        Health: [
            { name: "WHO — Health Topics", url: "https://www.who.int/health-topics", note: "Ringkasan topik dan pedoman kesehatan dari Organisasi Kesehatan Dunia." },
            { name: "CDC — Health Topics", url: "https://www.cdc.gov/health-topics/", note: "Informasi kesehatan publik dan pencegahan penyakit dari CDC." }
        ],
        Environment: [
            { name: "IPCC — AR6 Synthesis Report", url: "https://www.ipcc.ch/synthesis-report/", note: "Sintesis ilmiah utama mengenai perubahan iklim, dampak, adaptasi, dan mitigasi." },
            { name: "UNEP — Environment Topics", url: "https://www.unep.org/explore-topics", note: "Data, laporan, dan program lingkungan dari Perserikatan Bangsa-Bangsa." }
        ],
        Business: [
            { name: "OECD — Entrepreneurship", url: "https://www.oecd.org/en/topics/entrepreneurship.html", note: "Riset dan indikator kebijakan kewirausahaan lintas negara." },
            { name: "U.S. SBA — Business Guide", url: "https://www.sba.gov/business-guide", note: "Panduan resmi perencanaan, peluncuran, pengelolaan, dan pertumbuhan usaha." }
        ],
        AI: [
            { name: "NIST — AI Risk Management Framework", url: "https://www.nist.gov/itl/ai-risk-management-framework", note: "Kerangka pengelolaan risiko dan evaluasi sistem AI." },
            { name: "OECD AI Principles", url: "https://oecd.ai/en/ai-principles", note: "Prinsip internasional untuk AI yang tepercaya dan bertanggung jawab." }
        ],
        Cloud: [
            { name: "Google — Site Reliability Engineering", url: "https://sre.google/books/", note: "Buku daring mengenai reliability, monitoring, incident response, dan operasi layanan." },
            { name: "AWS — Well-Architected Framework", url: "https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html", note: "Kerangka resmi untuk menilai arsitektur cloud." }
        ],
        Product: [
            { name: "GOV.UK — Service Manual", url: "https://www.gov.uk/service-manual", note: "Panduan riset pengguna, desain layanan, delivery, dan pengukuran layanan digital." },
            { name: "Digital.gov — Product Management", url: "https://digital.gov/topics/product-management/", note: "Praktik pengelolaan produk digital untuk layanan publik." }
        ],
        DataScience: [
            { name: "pandas — User Guide", url: "https://pandas.pydata.org/docs/user_guide/", note: "Dokumentasi resmi manipulasi, pembersihan, dan analisis data dengan pandas." },
            { name: "scikit-learn — User Guide", url: "https://scikit-learn.org/stable/user_guide.html", note: "Dokumentasi resmi pemodelan, evaluasi, preprocessing, dan pemilihan model." }
        ],
        Robotics: [
            { name: "ROS 2 Documentation", url: "https://docs.ros.org/en/rolling/", note: "Dokumentasi resmi middleware, node, sensor, aktuator, dan sistem robot." },
            { name: "IEEE Robotics and Automation Society", url: "https://www.ieee-ras.org/", note: "Publikasi dan sumber profesional bidang robotika dan otomasi." }
        ],
        Astronomy: [
            { name: "NASA Science — Universe", url: "https://science.nasa.gov/universe/", note: "Materi dan misi astronomi yang diterbitkan NASA Science." },
            { name: "NASA Exoplanet Archive", url: "https://exoplanetarchive.ipac.caltech.edu/", note: "Data observasi eksoplanet yang dikelola NASA Exoplanet Science Institute." }
        ]
    };

    function escapeHtml(value) {
        return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
    }

    function safeSourceUrl(value) {
        try {
            const parsed = new URL(String(value || ""));
            return ["https:", "http:"].includes(parsed.protocol) ? parsed.href : "";
        } catch {
            return "";
        }
    }

    function generateExpansionText(chapterTitle, chapterIndex, bookTitle) {
        const titleSafe = escapeHtml(chapterTitle.replace(/^Bab\s+\d+\s*:\s*/i, ""));
        
        let content = "";
        
        if (chapterIndex === 0) {
            content += `
                <div class="expanded-content-block">
                    <h3>Konteks dan Sejarah Perkembangan</h3>
                    <p>Membahas <strong>${titleSafe}</strong> perlu dimulai dari definisi, konteks perkembangan, serta persoalan yang hendak diselesaikan. Dalam buku <em>${escapeHtml(bookTitle)}</em>, landasan ini digunakan sebagai prasyarat sebelum pembaca memasuki studi kasus dan penerapan yang lebih kompleks.</p>
                    <p>Untuk membangun pemahaman yang dapat dipertanggungjawabkan, bedakan sumber primer, tinjauan ilmiah, standar resmi, dan pendapat praktisi. Klaim yang kuat perlu dapat ditelusuri ke sumber, diperiksa konteksnya, dan dibandingkan dengan bukti lain yang relevan.</p>
                </div>
                <div class="expanded-content-block">
                    <h3>Kerangka Konseptual (Conceptual Framework)</h3>
                    <p>Pada tingkat elementer, kita mendefinisikan fenomena ini melalui beberapa variabel utama: (1) agen yang terlibat, (2) lingkungan operasional, dan (3) batasan atau konstrain sistem. Mengabaikan salah satu variabel ini sering kali berujung pada analisis yang bias atau tidak akurat. Oleh karena itu, pendekatan holistik yang menyertakan tinjauan literatur multidisiplin sangat disarankan.</p>
                    <div class="expert-insight-callout">
                        <i class="fa-solid fa-quote-left expert-quote-icon"></i>
                        <div class="expert-insight-text">
                            <strong>Wawasan Ahli:</strong> "Struktur dasar sering kali tidak terlihat, namun ia menentukan kekuatan keseluruhan sistem di masa depan."
                        </div>
                    </div>
                </div>
            `;
        } else if (chapterIndex === 1) {
            content += `
                <div class="expanded-content-block">
                    <h3>Arsitektur dan Mekanisme Terapan</h3>
                    <p>Memasuki tahapan penerapan dari <strong>${titleSafe}</strong>, fokus analisis bergeser dari 'apa' menjadi 'bagaimana'. Model teoretis yang dijabarkan sebelumnya kini harus dihadapkan pada realitas operasional yang dinamis dan penuh anomali. Para peneliti dan praktisi menggunakan metrik kuantitatif dan kualitatif untuk mengukur deviasi antara teori dan praktik.</p>
                    <p>Keandalan konsep dapat diuji melalui eksperimen terkontrol, studi observasional, analisis kasus, simulasi, atau pengujian teknis—bergantung pada bidang dan pertanyaannya. Metode perlu dipilih berdasarkan jenis bukti yang dibutuhkan, bukan karena satu metode dianggap selalu paling unggul.</p>
                </div>
                <div class="expanded-content-block">
                    <h3>Studi Kasus & Analisis Kegagalan</h3>
                    <p>Alih-alih hanya mempelajari kisah sukses, analisis kegagalan (failure analysis) pada tahap ini memberikan wawasan yang lebih mendalam. Kegagalan implementasi biasanya berakar pada asimetri informasi atau ketidakcocokan skala (scale mismatch). Dengan mengisolasi variabel penyebab error, kita dapat merekonstruksi mekanisme yang lebih tangguh (resilient).</p>
                    <p>Proses iterasi membantu ketika setiap perubahan memiliki tujuan, indikator, dan catatan hasil yang jelas. Tanpa pengukuran tersebut, keberhasilan iterasi tidak dapat dibedakan dari kebetulan atau perubahan konteks.</p>
                </div>
            `;
        } else {
            content += `
                <div class="expanded-content-block">
                    <h3>Evaluasi, Limitasi, dan Tren Masa Depan</h3>
                    <p>Sebagai sintesis dari <strong>${titleSafe}</strong>, bagian ini menguraikan batasan-batasan (limitations) yang masih belum terpecahkan. Meskipun metodologi yang ada saat ini cukup mumpuni, perubahan paradigma global—mulai dari digitalisasi hingga pergeseran demografi—menuntut rekalibrasi model yang berkelanjutan.</p>
                    <p>Arah masa depan perlu dinilai dengan membandingkan sumber yang memiliki metode, ruang lingkup, dan kepentingan berbeda. Jika para peneliti menghasilkan kesimpulan yang tidak sama, pembaca perlu memeriksa kualitas data, asumsi, ukuran hasil, serta konteks penerapan sebelum memilih posisi.</p>
                </div>
                <div class="expanded-content-block">
                    <h3>Kesimpulan Strategis</h3>
                    <p>Pada akhirnya, efektivitas penguasaan materi ini diukur dari kemampuan kita untuk mensintesis data yang saling bertentangan menjadi sebuah keputusan yang koheren dan pragmatis. Kemampuan kritis inilah yang membedakan antara sekadar mengetahui (knowing) dan benar-benar memahami (understanding) lanskap pengetahuan secara komprehensif.</p>
                </div>
            `;
        }
        
        return content;
    }

    BOOKS.forEach((book) => {
        if (!Array.isArray(book.chapters)) return;
        
        const sources = trustedSources[book.category] || fallbackSources;
        const webSources = authoritativeWebSources[book.category] || [];

        book.chapters.forEach((chapter, chapterIndex) => {
            if (!chapter || typeof chapter.content !== "string" || chapter.__expansionApplied) return;
            
            // Generate the dynamic expansion text
            const expandedContent = generateExpansionText(chapter.title, chapterIndex, book.title);
            
            // Build the sources section
            const sourcesHtml = `
                <section class="chapter-sources-section">
                    <div class="sources-header">
                        <h2><i class="fa-solid fa-book-bookmark"></i> Referensi & Sumber Otoritatif</h2>
                        <span class="sources-badge">Dapat ditelusuri</span>
                    </div>
                    <p class="sources-lead">Gunakan daftar ini untuk memeriksa definisi, data, standar, dan konteks materi. Prioritaskan sumber primer atau lembaga penerbit sebelum memakai rangkuman pihak ketiga.</p>
                    <div class="source-method-note">
                        <strong>Cara menilai sumber</strong>
                        <span>Periksa penerbit, penulis, tanggal pembaruan, metode, ruang lingkup, dan apakah klaimnya didukung bukti yang dapat diperiksa.</span>
                    </div>
                    <ul class="sources-list">
                        ${sources.map(src => `
                            <li class="source-item">
                                <span class="source-icon-badge"><i class="fa-solid fa-circle-check"></i></span>
                                <span class="source-text">${escapeHtml(src)} <span class="source-tag">Literatur akademik</span></span>
                            </li>
                        `).join("")}
                        ${webSources.map(src => `
                            <li class="source-item official-source">
                                <span class="source-icon-badge primary"><i class="fa-solid fa-arrow-up-right-from-square"></i></span>
                                <span class="source-text"><a href="${escapeHtml(safeSourceUrl(src.url))}" target="_blank" rel="noopener noreferrer" class="source-link">${escapeHtml(src.name)}</a><small>${escapeHtml(src.note)}</small><span class="source-tag">Sumber resmi</span></span>
                            </li>
                        `).join("")}
                        ${(book.sources && book.sources.length > 0) ? book.sources.filter(src => safeSourceUrl(src.url)).map(src => `
                            <li class="source-item highlight-source">
                                <span class="source-icon-badge primary"><i class="fa-solid fa-arrow-up-right-from-square"></i></span>
                                <span class="source-text"><a href="${escapeHtml(safeSourceUrl(src.url))}" target="_blank" rel="noopener noreferrer" class="source-link">${escapeHtml(src.name)}</a> <span class="source-tag">Sumber utama topik</span></span>
                            </li>
                        `).join("") : ""}
                    </ul>
                </section>
            `;

            // Append the expanded content and sources to the chapter content
            if (chapter.content.includes('<section class="reading-depth-section"')) {
                chapter.content = chapter.content.replace(
                    '<section class="reading-depth-section"', 
                    expandedContent + sourcesHtml + '<section class="reading-depth-section"'
                );
            } else {
                chapter.content += expandedContent + sourcesHtml;
            }
            
            chapter.__expansionApplied = true;
        });
        
        // Update word count
        book.expandedWordCount = book.chapters.reduce((total, chapter) => total + chapter.content.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length, 0);
        book.time = `${Math.max(1, Math.ceil(book.expandedWordCount / 190))} menit`;
    });
})();
