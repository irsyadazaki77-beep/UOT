(function () {
    "use strict";

    const TRACK_BLUEPRINTS = [
        {
            id: "programming",
            mark: "PG",
            title: "Dasar Pemrograman",
            category: "engineering",
            level: "Pemula",
            durationMinutes: 720,
            prerequisites: [],
            careerTags: ["frontend", "backend", "data", "ai", "mobile", "testing"],
            summary: "Bangun cara berpikir komputasional, struktur data, OOP, algoritma, dan kebiasaan debugging yang kuat.",
            project: "Aplikasi pengelola tugas berbasis JavaScript dengan validasi, penyimpanan, dan pengujian logika.",
            chapters: [
                ["logika-program", "Logika dan Alur Program", ["Input, Proses, dan Output", "Variabel dan Tipe Data", "Percabangan dan Boolean"]],
                ["struktur-data", "Struktur Data Dasar", ["Array dan Iterasi", "Object dan Koleksi Data", "Function dan Scope"]],
                ["oop-modular", "OOP dan Kode Modular", ["Class dan Object", "Encapsulation dan Composition", "Error Handling dan Debugging"]],
                ["algoritma", "Algoritma Praktis", ["Kompleksitas Dasar", "Searching dan Sorting", "Problem Solving Terstruktur"]]
            ]
        },
        {
            id: "web",
            mark: "WEB",
            title: "Web Development",
            category: "engineering",
            level: "Pemula-Menengah",
            durationMinutes: 900,
            prerequisites: ["programming"],
            careerTags: ["frontend", "backend", "testing"],
            summary: "Kuasai web semantik, aksesibilitas, layout responsif, DOM, API browser, performa, dan kualitas produksi.",
            project: "Progressive web learning dashboard yang responsif, accessible, cepat, dan terhubung REST API.",
            chapters: [
                ["html-a11y", "HTML dan Accessibility", ["Struktur HTML Semantik", "Form yang Accessible", "SEO dan Metadata Dasar"]],
                ["css-responsive", "CSS dan Responsive UI", ["Cascade dan Design Tokens", "Flexbox dan Grid", "Mobile First dan Container Query"]],
                ["javascript-dom", "JavaScript Browser", ["DOM dan Event", "State UI dan Component Pattern", "Fetch API dan Async Flow"]],
                ["web-production", "Web Production", ["Core Web Vitals", "Security dan Browser Policy", "Progressive Enhancement dan Deployment"]]
            ]
        },
        {
            id: "backend",
            mark: "API",
            title: "Backend & API",
            category: "engineering",
            level: "Menengah",
            durationMinutes: 960,
            prerequisites: ["programming", "web"],
            careerTags: ["backend", "frontend", "mobile", "cloud", "testing"],
            summary: "Pelajari HTTP, REST, server Node.js, autentikasi, validasi, observability, dan arsitektur layanan.",
            project: "REST API production-ready untuk platform belajar dengan auth, role, validasi, test, dan dokumentasi.",
            chapters: [
                ["http-rest", "HTTP dan REST", ["Request, Response, dan Status Code", "Resource dan REST Design", "Pagination, Filter, dan Versioning"]],
                ["node-server", "Server Node.js", ["Runtime dan Event Loop", "Routing dan Middleware", "Validation dan Error Contract"]],
                ["auth-security", "Authentication dan Security", ["Session, Token, dan Cookie", "Authorization dan Role", "Rate Limit dan Secret Management"]],
                ["service-architecture", "Arsitektur Layanan", ["Layered Architecture", "Caching dan Background Job", "Logging, Metrics, dan API Documentation"]]
            ]
        },
        {
            id: "database",
            mark: "DB",
            title: "Database & SQL",
            category: "data",
            level: "Menengah",
            durationMinutes: 840,
            prerequisites: ["programming"],
            careerTags: ["backend", "data", "cloud", "testing"],
            summary: "Rancang model data, tulis query yang benar, pahami index, transaksi, konsistensi, dan operasi database.",
            project: "Database akademik ter-normalisasi dengan laporan analitik, transaksi aman, index, dan rencana backup.",
            chapters: [
                ["data-modeling", "Pemodelan Data", ["Entity dan Relationship", "Primary dan Foreign Key", "Normalisasi dan Constraint"]],
                ["sql-query", "SQL Query", ["SELECT dan Filtering", "JOIN dan Subquery", "Aggregation dan Window Function"]],
                ["optimization", "Optimasi Database", ["Index dan Query Plan", "Denormalisasi Terukur", "Connection Pool dan Caching"]],
                ["transactions", "Transaksi dan Operasi", ["ACID dan Isolation", "Concurrency dan Lock", "Migration, Backup, dan Recovery"]]
            ]
        },
        {
            id: "design",
            mark: "UX",
            title: "UI/UX Design",
            category: "design",
            level: "Pemula-Menengah",
            durationMinutes: 720,
            prerequisites: [],
            careerTags: ["frontend", "design", "mobile"],
            summary: "Mulai dari riset dan user flow sampai design system, prototyping, accessibility, dan usability testing.",
            project: "Redesign end-to-end aplikasi belajar berdasarkan riset, prototype, design system, dan usability report.",
            chapters: [
                ["ux-research", "Riset Pengguna", ["Problem Framing dan Persona", "Interview dan Observation", "Journey Map dan Insight"]],
                ["wireframe-flow", "Wireframe dan User Flow", ["Information Architecture", "Task Flow dan Navigation", "Low Fidelity Prototype"]],
                ["visual-system", "Visual dan Design System", ["Hierarchy dan Typography", "Color, Spacing, dan Grid", "Component, Variant, dan Token"]],
                ["usability", "Usability dan Accessibility", ["Interactive Prototype", "Usability Testing", "WCAG dan Design Handoff"]]
            ]
        },
        {
            id: "analytics",
            mark: "AN",
            title: "Business Analytics",
            category: "data",
            level: "Menengah",
            durationMinutes: 780,
            prerequisites: ["programming", "database"],
            careerTags: ["data", "product", "ai"],
            summary: "Ubah data mentah menjadi keputusan melalui statistik, KPI, eksperimen, segmentasi, dan dashboard.",
            project: "Dashboard funnel produk lengkap dengan data cleaning, metric dictionary, eksperimen, dan rekomendasi.",
            chapters: [
                ["data-literacy", "Literasi dan Kualitas Data", ["Tipe Data dan Sumber Data", "Cleaning dan Missing Value", "Metric Definition dan Data Quality"]],
                ["statistics", "Statistik Praktis", ["Descriptive Statistics", "Distribution dan Outlier", "Correlation dan Causation"]],
                ["experimentation", "Eksperimen Produk", ["KPI, Funnel, dan Cohort", "Hypothesis dan A/B Testing", "Segmentasi dan Retention"]],
                ["dashboard-story", "Dashboard dan Data Story", ["Visual Encoding", "Dashboard Design", "Insight, Risiko, dan Rekomendasi"]]
            ]
        },
        {
            id: "cyber",
            mark: "SEC",
            title: "Cyber Security",
            category: "security",
            level: "Menengah",
            durationMinutes: 900,
            prerequisites: ["web", "backend"],
            careerTags: ["security", "backend", "cloud", "testing"],
            summary: "Kenali threat model, keamanan web, identity, cryptography, monitoring, dan incident response.",
            project: "Security assessment aplikasi web dengan threat model, temuan OWASP, mitigasi, dan incident playbook.",
            chapters: [
                ["threat-foundation", "Fondasi Ancaman", ["CIA Triad dan Risk", "Threat Modeling", "Social Engineering dan Malware"]],
                ["web-security", "Web Application Security", ["Injection dan Input Validation", "XSS, CSRF, dan Browser Security", "OWASP Testing Workflow"]],
                ["identity-crypto", "Identity dan Cryptography", ["Password Hash dan MFA", "Authorization dan Least Privilege", "Encryption, TLS, dan Key Management"]],
                ["security-ops", "Security Operations", ["Logging dan Detection", "Vulnerability Management", "Incident Response dan Recovery"]]
            ]
        },
        {
            id: "ai",
            mark: "AI",
            title: "AI & Machine Learning",
            category: "data",
            level: "Menengah-Lanjut",
            durationMinutes: 1080,
            prerequisites: ["programming", "analytics"],
            careerTags: ["ai", "data", "backend"],
            summary: "Pahami data dan model, ML lifecycle, generative AI, evaluasi, deployment, serta safety dan etika.",
            project: "Sistem evaluasi model AI dengan dataset, baseline, metric, prompt suite, safety check, dan model card.",
            chapters: [
                ["ml-foundation", "Data dan Model", ["AI, ML, dan Deep Learning", "Dataset, Feature, dan Label", "Training, Validation, dan Inference"]],
                ["ml-lifecycle", "Machine Learning Lifecycle", ["Baseline dan Model Selection", "Evaluation Metric", "Overfitting, Bias, dan Experiment Tracking"]],
                ["generative-ai", "Generative AI", ["Token, Embedding, dan Transformer", "Prompt Engineering", "RAG dan Tool Use"]],
                ["responsible-ai", "Production dan Responsible AI", ["Model Serving dan Monitoring", "Hallucination dan Safety Evaluation", "Privacy, Ethics, dan Model Card"]]
            ]
        },
        {
            id: "cloud",
            mark: "CLD",
            title: "Cloud & DevOps",
            category: "operations",
            level: "Menengah-Lanjut",
            durationMinutes: 960,
            prerequisites: ["backend", "git"],
            careerTags: ["cloud", "backend", "security", "testing"],
            summary: "Pelajari deployment, Linux dasar, container, CI/CD, infrastructure as code, observability, dan scaling.",
            project: "Deploy layanan containerized dengan CI/CD, environment aman, monitoring, autoscaling plan, dan runbook.",
            chapters: [
                ["deploy-foundation", "Deployment Foundation", ["Linux dan Process Dasar", "Network, DNS, dan TLS", "Environment dan Configuration"]],
                ["container", "Container dan Runtime", ["Image dan Container", "Dockerfile dan Compose", "Registry dan Container Security"]],
                ["cicd-iac", "CI/CD dan Infrastructure as Code", ["Continuous Integration", "Deployment Strategy", "IaC dan Environment Promotion"]],
                ["observability", "Observability dan Scaling", ["Logs, Metrics, dan Traces", "SLO, Alert, dan Incident", "Load Balancing dan Autoscaling"]]
            ]
        },
        {
            id: "mobile",
            mark: "MOB",
            title: "Mobile Development",
            category: "engineering",
            level: "Pemula-Menengah",
            durationMinutes: 900,
            prerequisites: ["programming", "web"],
            careerTags: ["mobile", "frontend", "backend", "testing"],
            summary: "Bangun aplikasi mobile dengan UI adaptif, state, API, offline storage, performa, testing, dan proses rilis.",
            project: "Aplikasi learning tracker offline-first dengan sinkronisasi API, notification, test, dan release checklist.",
            chapters: [
                ["mobile-ui", "UI dan Lifecycle Mobile", ["Native dan Cross Platform", "Responsive Mobile Layout", "Lifecycle dan Navigation"]],
                ["state-api", "State dan API", ["Local State dan Form", "Remote Data dan API Client", "Authentication dan Secure Storage"]],
                ["offline-device", "Offline dan Device Capability", ["SQLite dan Offline First", "Camera, Location, dan Permission", "Push Notification dan Background Task"]],
                ["mobile-production", "Mobile Production", ["Performance dan Battery", "Mobile Testing", "Store Guideline dan Release"]]
            ]
        },
        {
            id: "git",
            mark: "GIT",
            title: "Git & Collaboration",
            category: "engineering",
            level: "Pemula",
            durationMinutes: 600,
            prerequisites: [],
            careerTags: ["frontend", "backend", "data", "ai", "cloud", "mobile", "testing"],
            summary: "Kuasai repository, commit, branching, pull request, code review, conflict resolution, dan recovery.",
            project: "Simulasi kolaborasi tim dengan branching strategy, pull request, review, conflict, tag, dan release notes.",
            chapters: [
                ["repo-commit", "Repository dan Commit", ["Working Tree dan Staging", "Commit yang Berkualitas", "Ignore, Diff, dan History"]],
                ["branching", "Branching dan Integration", ["Branch dan Merge", "Rebase dan Cherry Pick", "Merge Conflict"]],
                ["collaboration", "Kolaborasi Tim", ["Remote, Fetch, Pull, dan Push", "Pull Request dan Code Review", "Branch Protection dan Workflow"]],
                ["recovery-release", "Recovery dan Release", ["Restore, Revert, dan Reset", "Tag dan Semantic Version", "Release Notes dan Repository Hygiene"]]
            ]
        },
        {
            id: "gamedev",
            mark: "GAME",
            title: "Game Development",
            category: "engineering",
            level: "Pemula-Menengah",
            durationMinutes: 840,
            prerequisites: ["programming"],
            careerTags: ["frontend", "mobile"],
            summary: "Pelajari engine game, rendering 2D/3D, physics, scripting, state machine, audio, dan optimasi performa game.",
            project: "Game arcade 2D sederhana dengan physics, deteksi tabrakan, sistem skor, dan siklus game loop.",
            chapters: [
                ["game-fundamentals", "Game Loop dan Rendering", ["Dasar Game Loop", "Rendering Grafis 2D", "Input Handling Player"]],
                ["game-physics", "Physics dan Collision", ["Kecepatan dan Akselerasi", "Deteksi Tabrakan 2D", "Respons Tabrakan"]],
                ["game-design-patterns", "Desain Pola Game", ["State Machine Karakter", "Entity Component System", "Audio dan Efek Suara"]],
                ["game-optimization", "Optimasi dan Distribusi", ["Object Pooling", "Manajemen Aset Memori", "Rilis dan Packaging Game"]]
            ]
        },
        {
            id: "iot",
            mark: "IOT",
            title: "Internet of Things",
            category: "engineering",
            level: "Menengah",
            durationMinutes: 900,
            prerequisites: ["programming"],
            careerTags: ["backend", "cloud"],
            summary: "Pahami mikrokontroler, sensor, aktuator, protokol komunikasi (MQTT, HTTP), firmware, dan integrasi cloud IoT.",
            project: "Sistem monitoring suhu ruangan IoT otomatis dengan pengiriman data MQTT ke dashboard web.",
            chapters: [
                ["iot-hardware", "Hardware dan Sensor", ["Dasar Mikrokontroler", "Membaca Sensor Analog/Digital", "Kontrol Aktuator Motor"]],
                ["iot-firmware", "Firmware dan Pemrograman", ["Struktur Loop Arduino", "Power Management & Sleep Mode", "Debugging Hardware"]],
                ["iot-connectivity", "Protokol Komunikasi", ["WiFi & Koneksi Jaringan", "MQTT Broker & Publish-Subscribe", "HTTP API Client"]],
                ["iot-cloud", "Integrasi IoT Cloud", ["Keamanan Transmisi Data", "Visualisasi Dashboard Data", "Rule Engine & Notifikasi Otomatis"]]
            ]
        },
        {
            id: "datascience",
            mark: "DS",
            title: "Data Science & Wrangling",
            category: "data",
            level: "Menengah-Lanjut",
            durationMinutes: 960,
            prerequisites: ["programming", "analytics"],
            careerTags: ["data", "ai"],
            summary: "Kuasai statistik inferensial, data cleaning, analisis eksploratif (EDA), visualisasi data, dan pemodelan prediktif.",
            project: "Laporan analisis prediktif churn pelanggan menggunakan regresi logistik dengan EDA dan pembersihan data.",
            chapters: [
                ["ds-wrangling", "Data Wrangling & Cleaning", ["Imputasi Missing Value", "Deteksi Outlier & Normalisasi", "Transformasi & Feature Engineering"]],
                ["ds-eda", "Exploratory Data Analysis", ["Statistik Deskriptif Lanjut", "Korelasi & Koefisien Hubungan", "Visualisasi Distribusi & Boxplot"]],
                ["ds-modeling", "Dasar Pemodelan Prediktif", ["Regresi Linear Sederhana", "Klasifikasi Regresi Logistik", "Evaluasi Model K-Fold"]],
                ["ds-presentation", "Presentasi Insight Data", ["Storytelling dengan Data", "Riset & Business Recommendation", "Penyusunan Executive Summary"]]
            ]
        },
        {
            id: "blockchain",
            mark: "BC",
            title: "Blockchain & Smart Contracts",
            category: "security",
            level: "Menengah-Lanjut",
            durationMinutes: 960,
            prerequisites: ["programming", "web"],
            careerTags: ["backend", "security"],
            summary: "Pahami desentralisasi, kriptografi kunci publik, consensus mechanism, smart contracts, Web3, dan keamanan dApp.",
            project: "Smart contract token ERC-20 sederhana dengan test deployment di testnet lokal.",
            chapters: [
                ["bc-fundamentals", "Fondasi Blockchain", ["Kriptografi Kunci Publik", "Blok & Rantai Hash", "Mekanisme Konsensus (PoW/PoS)"]],
                ["bc-smart-contracts", "Smart Contracts Dasar", ["Bahasa Solidity & Sintaks", "State Variables & Functions", "Modifiers & Event Logging"]],
                ["bc-web3-integration", "Integrasi Web3 Client", ["Web3 Provider & Wallet Connect", "Membaca State Smart Contract", "Mengirim Transaksi Berbayar"]],
                ["bc-dapp-security", "Keamanan dApp & Smart Contract", ["Reentrancy Vulnerability", "Audit Log & Test Coverage", "Upgradeability Smart Contract"]]
            ]
        },
        {
            id: "sysdesign",
            mark: "SYS",
            title: "System Design & Architecture",
            category: "operations",
            level: "Lanjut",
            durationMinutes: 1020,
            prerequisites: ["backend", "database"],
            careerTags: ["backend", "cloud", "security"],
            summary: "Rancang sistem skala besar (scalability), load balancing, microservices, database replication, caching strategy, dan message queues.",
            project: "Cetak biru arsitektur sistem e-commerce berkapasitas jutaan pengguna dengan skema DB dan failover.",
            chapters: [
                ["sys-scalability", "Scalability & Load Balancing", ["Vertical vs Horizontal Scaling", "Load Balancer & Reverse Proxy", "Rate Limiting & Gateway"]],
                ["sys-caching", "Caching & Data Replication", ["Cache Aside & Write Through Patterns", "Redis & Memcached Integration", "Database Read Replicas"]],
                ["sys-microservices", "Arsitektur Microservices", ["Monolith vs Microservices", "Komunikasi Sinkron/Asinkron REST/gRPC", "Service Discovery & Circuit Breaker"]],
                ["sys-messaging", "Event-Driven & Message Queues", ["Message Broker (RabbitMQ/Kafka)", "Pub/Sub Pattern & Consumer Groups", "Eventual Consistency & Saga Pattern"]]
            ]
        },
        {
            id: "dataware",
            mark: "DW",
            title: "Data Warehousing & ETL",
            category: "data",
            level: "Menengah-Lanjut",
            durationMinutes: 900,
            prerequisites: ["database"],
            careerTags: ["data", "backend"],
            summary: "Rancang data warehouse (Star/Snowflake schema), pipelines ETL, OLAP cube, data lake, dan tool visualisasi enterprise.",
            project: "Pipeline ETL sederhana untuk menyalin data operasional PostgreSQL ke data warehouse analitik.",
            chapters: [
                ["dw-concepts", "Konsep Data Warehousing", ["OLTP vs OLAP", "Dimensional Modeling (Fact & Dimension)", "Star & Snowflake Schema"]],
                ["dw-etl", "ETL Pipeline Design", ["Extracting Data Sources", "Transforming & Validating Schema", "Loading to Target Warehouse"]],
                ["dw-datalake", "Data Lake & Modern DW", ["Konsep Data Lake", "Schema-on-Read vs Schema-on-Write", "Cloud Data Warehouse (BigQuery/Snowflake)"]],
                ["dw-bi", "Business Intelligence Integration", ["Penyusunan Data Marts", "OLAP Cubes & Aggregations", "Integrasi BI Dashboard BI"]]
            ]
        },
        {
            id: "networks",
            mark: "NET",
            title: "Computer Networks & Security",
            category: "operations",
            level: "Pemula-Menengah",
            durationMinutes: 840,
            prerequisites: [],
            careerTags: ["cloud", "security"],
            summary: "Pelajari TCP/IP, routing, switching, DNS, load balancing, firewall, VPN, dan pemecahan masalah jaringan.",
            project: "Dokumen rancangan topologi jaringan kantor cabang aman dengan firewall rule dan VPN gateway.",
            chapters: [
                ["net-fundamentals", "OSI Model & TCP/IP", ["Lapisan Model OSI", "Protokol IP & Subnetting", "TCP vs UDP Transmission"]],
                ["net-routing", "Routing & DNS Services", ["Router & Switch Operations", "DNS Resolution Process", "DHCP Allocation & Gateway"]],
                ["net-security", "Network Security Controls", ["Firewall & ACL Rules", "VPN & Encrypted Tunnels", "IDS/IPS Intrusion Systems"]],
                ["net-troubleshooting", "Monitoring & Troubleshooting", ["Network Tools (Ping, Traceroute, Wireshark)", "Analyzing Packet Loss", "Log Jaringan & Alerting"]]
            ]
        },
        {
            id: "linux",
            mark: "LUX",
            title: "Linux SysAdmin & Scripting",
            category: "operations",
            level: "Pemula-Menengah",
            durationMinutes: 780,
            prerequisites: [],
            careerTags: ["cloud", "backend", "security"],
            summary: "Kuasai file system, permission, process management, shell scripting (Bash), network config, dan pengamanan server Linux.",
            project: "Script otomasi Bash untuk membackup folder aplikasi, memompresnya, dan mencatat status ke log.",
            chapters: [
                ["linux-basics", "Navigasi & File System", ["Perintah Dasar CLI", "Linux File System Hierarchy", "File Permissions & Ownership"]],
                ["linux-process", "Proses & Layanan", ["Manajemen Proses (top, ps, kill)", "Systemd & Service Management", "Cron Jobs Scheduling"]],
                ["linux-shell", "Bash Shell Scripting", ["Variabel & Kondisi Bash", "Looping & Parameter Script", "Pipelines & I/O Redirection"]],
                ["linux-admin", "Administrasi Server", ["User & Group Management", "Network Configuration CLI", "Basic Firewalld/UFW Setup"]]
            ]
        },
        {
            id: "nosql",
            mark: "NOS",
            title: "NoSQL Databases",
            category: "data",
            level: "Menengah",
            durationMinutes: 840,
            prerequisites: ["programming", "database"],
            careerTags: ["backend", "data", "cloud"],
            summary: "Pelajari database dokumen (MongoDB), key-value (Redis), wide-column (Cassandra), graph (Neo4j), dan skenario penggunaannya.",
            project: "Desain dan implementasi database dokumen katalog e-commerce menggunakan MongoDB.",
            chapters: [
                ["nosql-document", "Document Database (MongoDB)", ["BSON/JSON Format", "CRUD Operations di Mongo", "Indexing & Aggregation Pipeline"]],
                ["nosql-keyvalue", "Key-Value Cache (Redis)", ["Tipe Data Redis", "Cache Eviction Policies", "Pub/Sub & Session Storage"]],
                ["nosql-widecolumn", "Wide-Column (Cassandra)", ["Arsitektur Cassandra", "CQL Query vs SQL Query", "Data Partitioning & Replication"]],
                ["nosql-graph", "Graph Database (Neo4j)", ["Nodes, Relationships & Properties", "Cypher Query Language Basics", "Skenario Sosial Media/Rekomendasi"]]
            ]
        },
        {
            id: "product",
            mark: "PM",
            title: "Product Management in Tech",
            category: "design",
            level: "Pemula-Menengah",
            durationMinutes: 720,
            prerequisites: [],
            careerTags: ["design", "data"],
            summary: "Kembangkan keahlian product lifecycle, agile/scrum, user research, roadmap, MVP scoping, product market fit, dan metrik produk.",
            project: "Product Requirement Document (PRD) lengkap dengan MVP scoping dan metrik kesuksesan produk baru.",
            chapters: [
                ["pm-fundamentals", "Product Lifecycle & Role", ["Peran PM di Perusahaan Tech", "Product Lifecycle Stages", "Kerja Sama PM, Eng, & Design"]],
                ["pm-research", "User Research & Prioritization", ["Problem Discovery & Persona", "Prioritization Framework (RICE/Kano)", "Scoping Minimum Viable Product"]],
                ["pm-roadmap", "Product Roadmap & Agile", ["Menyusun Product Roadmap", "Agile & Scrum Methodologies", "User Story & Acceptance Criteria"]],
                ["pm-metrics", "Product Metrics & Analytics", ["North Star Metric & OMTM", "Funnel Analytics & Churn", "Product Market Fit Evaluation"]]
            ]
        }
    ];

    const CATEGORY_LABELS = {
        engineering: "Software Engineering",
        data: "Data & AI",
        design: "Design",
        security: "Security",
        operations: "Cloud & Operations",
        quality: "Quality Engineering"
    };

    const OLD_PROGRESS_MAP = {
        logic: "programming",
        web: "web",
        sql: "database",
        ux: "design",
        data: "analytics",
        safe: "cyber",
        git: "git",
        mobile: "mobile",
        cloud: "cloud",
        ai: "ai"
    };

    const STORAGE_KEY = "quiznationCurriculumProgress";
    const LEGACY_STORAGE_KEY = "eduquestMateriProgress";
    const PROGRESS_VERSION = 2;

    function slugify(value) {
        return value
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
    }

    function buildLesson(track, chapter, title, lessonIndex) {
        const id = `${chapter[0]}-${slugify(title)}`;
        const isAdvanced = track.level.includes("Lanjut") || chapter[0].includes("production");
        const context = `${title} dalam jalur ${track.title}`;
        return {
            id,
            title,
            durationMinutes: isAdvanced ? 55 : 45,
            outcomes: [
                `Menjelaskan konsep utama ${title} dengan bahasa sendiri.`,
                `Menerapkan ${title} pada skenario produk atau sistem nyata.`,
                `Mengevaluasi kesalahan umum dan trade-off saat menggunakan ${title}.`
            ],
            sections: [
                {
                    title: "Konsep inti",
                    body: `${context} bukan sekadar istilah. Pelajaran ini membangun model mental tentang tujuan, komponen, alur kerja, dan batasannya. Fokuskan pemahaman pada alasan sebuah teknik digunakan sebelum menghafal sintaks atau alat.`
                },
                {
                    title: "Cara kerja dan keputusan",
                    body: `Mulai dari kebutuhan, identifikasi input dan constraint, pilih pendekatan, lalu ukur hasilnya. Pada praktik profesional, keputusan tentang ${title} harus dapat dijelaskan melalui dampak ke pengguna, kualitas, keamanan, biaya, dan kemudahan pemeliharaan.`
                },
                {
                    title: "Kesalahan umum",
                    body: `Kesalahan yang sering terjadi adalah menerapkan pola tanpa memahami konteks, mengabaikan edge case, tidak memberi feedback yang dapat diamati, serta berhenti setelah happy path berhasil. Gunakan checklist dan pengujian kecil untuk mengurangi risiko tersebut.`
                }
            ],
            example: {
                title: `Studi kasus: ${title}`,
                language: track.id === "database" ? "sql" : track.id === "git" || track.id === "cloud" ? "bash" : "javascript",
                code: createExampleCode(track.id, title, lessonIndex),
                explanation: `Contoh ini menunjukkan bentuk paling kecil yang dapat diuji. Kembangkan secara bertahap, beri nama yang jelas, lalu verifikasi output dan kondisi gagal.`
            },
            practice: {
                prompt: `Buat artefak kecil yang mendemonstrasikan ${title}. Tulis asumsi, langkah implementasi, satu edge case, dan cara memverifikasi hasil.`,
                deliverables: [
                    "Catatan keputusan dan asumsi.",
                    "Implementasi, query, desain, atau konfigurasi yang dapat diperiksa.",
                    "Bukti pengujian untuk happy path dan satu kondisi gagal."
                ],
                hint: `Gunakan pola: definisikan masalah → buat versi minimum → uji → catat temuan → perbaiki satu iterasi.`
            },
            checkpoint: {
                question: `Apa pendekatan paling tepat ketika menerapkan ${title} dalam proyek nyata?`,
                options: [
                    "Mulai dari kebutuhan dan constraint, buat implementasi minimum, lalu ukur dan uji hasilnya.",
                    "Salin solusi paling populer tanpa memeriksa konteks.",
                    "Fokus pada tampilan akhir dan abaikan kondisi gagal.",
                    "Tunda pengujian sampai seluruh proyek selesai."
                ],
                correctIndex: 0,
                explanation: `Pendekatan profesional menghubungkan kebutuhan, keputusan teknis, implementasi bertahap, dan bukti pengujian.`
            },
            references: [
                `Dokumentasi dan catatan resmi terkait ${title}.`,
                `Checklist praktik ${track.title} untuk bab ${chapter[1]}.`
            ],
            xp: 25
        };
    }

    function createExampleCode(trackId, title, index) {
        if (trackId === "database") {
            return `-- ${title}\nSELECT id, nama, status\nFROM records\nWHERE status = 'aktif'\nORDER BY id\nLIMIT ${index + 5};`;
        }
        if (trackId === "git") {
            return `# ${title}\ngit status\ngit switch -c latihan/${slugify(title)}\ngit add .\ngit commit -m "learn: ${slugify(title)}"`;
        }
        if (trackId === "cloud") {
            return `# ${title}\nservice:\n  name: learning-api\n  healthcheck: /health\n  retries: 3\n  environment: production`;
        }
        if (trackId === "design") {
            return `Design review: ${title}\n- Tujuan pengguna\n- Hierarchy dan alur\n- State normal, loading, error\n- Keyboard dan screen reader\n- Bukti usability test`;
        }
        if (trackId === "analytics" || trackId === "ai") {
            return `const experiment = {\n  topic: "${title}",\n  baseline: 0,\n  metric: "quality_score",\n  validate(result) {\n    return result >= this.baseline;\n  }\n};`;
        }
        return `// ${title}\nfunction execute(input) {\n  if (input == null) throw new Error("Input wajib tersedia");\n  const result = { ok: true, value: input };\n  return result;\n}\n\nconsole.log(execute("latihan"));`;
    }

    const tracks = TRACK_BLUEPRINTS.map((track) => ({
        ...track,
        categoryLabel: CATEGORY_LABELS[track.category],
        chapters: track.chapters.map((chapter) => ({
            id: chapter[0],
            title: chapter[1],
            summary: `Bab ini membahas ${chapter[2].join(", ")} melalui teori, contoh, checkpoint, dan praktik terarah.`,
            lessons: chapter[2].map((title, index) => buildLesson(track, chapter, title, index))
        })),
        capstone: {
            title: track.project,
            brief: `Gabungkan kompetensi dari seluruh bab ${track.title} menjadi artefak portofolio yang dapat diperiksa dan dipresentasikan.`,
            rubric: [
                { criterion: "Ketepatan konsep", weight: 30 },
                { criterion: "Kualitas implementasi", weight: 30 },
                { criterion: "Pengujian dan edge case", weight: 20 },
                { criterion: "Dokumentasi dan komunikasi", weight: 20 }
            ],
            passingScore: 75,
            xp: 150
        }
    }));

    function createEmptyProgress() {
        return {
            version: PROGRESS_VERSION,
            tracks: {},
            lastTrackId: "programming",
            lastLessonId: tracks[0].chapters[0].lessons[0].id,
            totalXpAwarded: 0,
            updatedAt: new Date().toISOString()
        };
    }

    function normalizeProgress(raw) {
        const progress = raw && typeof raw === "object" ? raw : createEmptyProgress();
        progress.version = PROGRESS_VERSION;
        progress.tracks = progress.tracks && typeof progress.tracks === "object" ? progress.tracks : {};
        progress.lastTrackId = getTrack(progress.lastTrackId) ? progress.lastTrackId : "programming";
        progress.updatedAt = new Date().toISOString();
        return progress;
    }

    function migrateLegacyProgress(progress) {
        let legacy = {};
        try {
            legacy = JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY) || "{}");
        } catch (error) {
            legacy = {};
        }
        Object.entries(OLD_PROGRESS_MAP).forEach(([legacyKey, trackId]) => {
            if (!legacy[legacyKey]) return;
            const track = getTrack(trackId);
            const firstLesson = track.chapters[0].lessons[0];
            const trackProgress = progress.tracks[trackId] || { lessons: {}, capstone: {} };
            trackProgress.lessons = trackProgress.lessons || {};
            if (!trackProgress.lessons[firstLesson.id]) {
                trackProgress.lessons[firstLesson.id] = {
                    status: "completed",
                    bestScore: 0,
                    attempts: 0,
                    practiceCompleted: false,
                    bookmarked: false,
                    legacyMigrated: true,
                    completedAt: new Date().toISOString()
                };
            }
            progress.tracks[trackId] = trackProgress;
        });
        return progress;
    }

    function readProgress() {
        let raw;
        try {
            raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
        } catch (error) {
            raw = null;
        }
        return migrateLegacyProgress(normalizeProgress(raw));
    }

    function writeProgress(progress) {
        const normalized = normalizeProgress(progress);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
        window.dispatchEvent(new CustomEvent("curriculum-progress", { detail: normalized }));
        return normalized;
    }

    function getTrack(trackId) {
        return tracks.find((track) => track.id === trackId);
    }

    function findLesson(lessonId) {
        for (const track of tracks) {
            for (const chapter of track.chapters) {
                const lessonIndex = chapter.lessons.findIndex((lesson) => lesson.id === lessonId);
                if (lessonIndex !== -1) {
                    return { track, chapter, lesson: chapter.lessons[lessonIndex], lessonIndex };
                }
            }
        }
        return null;
    }

    function flattenLessons(track) {
        return track.chapters.flatMap((chapter) => chapter.lessons.map((lesson) => ({ chapter, lesson })));
    }

    function isTrackUnlocked(track, progress) {
        if (localStorage.getItem("eduquestSubscription") === "pro") return true;
        if (!track.prerequisites.length) return true;
        return track.prerequisites.every((id) => getTrackProgress(id, progress).percent >= 75);
    }

    function getLessonState(trackId, lessonId, progress) {
        const track = getTrack(trackId);
        const lessonEntries = flattenLessons(track);
        const index = lessonEntries.findIndex((entry) => entry.lesson.id === lessonId);
        const saved = progress.tracks?.[trackId]?.lessons?.[lessonId] || {};
        if (saved.status === "mastered") return "mastered";
        if (saved.status === "completed") return "completed";
        if (saved.status === "in_progress") return "in_progress";
        if (localStorage.getItem("eduquestSubscription") === "pro") return "available";
        if (!isTrackUnlocked(track, progress)) return "locked";
        if (index === 0) return "available";
        const previous = lessonEntries[index - 1].lesson;
        const previousState = progress.tracks?.[trackId]?.lessons?.[previous.id]?.status;
        return previousState === "completed" || previousState === "mastered" ? "available" : "locked";
    }

    function getTrackProgress(trackId, progress = readProgress()) {
        const track = getTrack(trackId);
        const lessons = flattenLessons(track);
        let completed = 0;
        let mastered = 0;
        lessons.forEach(({ lesson }) => {
            const state = progress.tracks?.[trackId]?.lessons?.[lesson.id]?.status;
            if (state === "completed" || state === "mastered") completed += 1;
            if (state === "mastered") mastered += 1;
        });
        return {
            completed,
            mastered,
            total: lessons.length,
            percent: Math.round((completed / lessons.length) * 100)
        };
    }

    function validate() {
        const errors = [];
        const ids = new Set();
        tracks.forEach((track) => {
            if (ids.has(track.id)) errors.push(`Duplicate track: ${track.id}`);
            ids.add(track.id);
            if (track.chapters.length !== 4) errors.push(`${track.id} harus memiliki 4 bab.`);
            track.prerequisites.forEach((id) => {
                if (!getTrack(id)) errors.push(`${track.id} prerequisite tidak ditemukan: ${id}`);
            });
            track.chapters.forEach((chapter) => {
                if (ids.has(chapter.id)) errors.push(`Duplicate chapter: ${chapter.id}`);
                ids.add(chapter.id);
                if (chapter.lessons.length < 3) errors.push(`${chapter.id} minimal 3 pelajaran.`);
                chapter.lessons.forEach((lesson) => {
                    if (ids.has(lesson.id)) errors.push(`Duplicate lesson: ${lesson.id}`);
                    ids.add(lesson.id);
                });
            });
        });
        return errors;
    }

    window.QNCurriculum = {
        version: PROGRESS_VERSION,
        tracks,
        categories: CATEGORY_LABELS,
        storageKey: STORAGE_KEY,
        getTrack,
        findLesson,
        flattenLessons,
        readProgress,
        writeProgress,
        getLessonState,
        getTrackProgress,
        isTrackUnlocked,
        validate
    };
})();
