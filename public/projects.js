(() => {
    "use strict";
    const STORAGE_KEY = "eduquestProjectProgress";
    const MAX_REFLECTION = 600;

    const projects = [
        {
            id: "landing-page",
            category: "web",
            icon: "fa-laptop-code",
            color: "#16a867",
            title: "Landing Page Personal",
            level: "Pemula",
            time: "45 menit",
            skills: ["HTML", "CSS"],
            outcome: "Satu halaman profil yang responsif",
            summary: "Rancang halaman perkenalan yang membuat identitas dan minatmu mudah diingat.",
            goal: "Membuat landing page personal yang rapi, responsif, dan memiliki call-to-action.",
            xp: 100,
            badge: { name: "Web Architect", emoji: "🌐", desc: "Membangun profil responsif" },
            steps: [
                "Tentukan audiens dan susun tiga bagian utama halaman.",
                "Bangun struktur HTML semantik untuk hero, tentang saya, dan kontak.",
                "Terapkan warna, tipografi, dan layout responsif dengan CSS.",
                "Uji halaman pada layar sempit lalu simpan tautan hasil."
            ],
            resources: ["materi.html", "quiz.html", "library.html"],
            editorType: "web",
            files: {
                html: `<div class="profile-card">\n  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" alt="Avatar">\n  <h2>Halo, Saya Alex!</h2>\n  <p>Junior Web Developer yang senang membangun antarmuka web interaktif.</p>\n  <button onclick="sapa()">Kirim Sapaan</button>\n</div>`,
                css: `body {\n  background: #f0fdf4;\n  font-family: 'DM Sans', sans-serif;\n  display: grid;\n  place-items: center;\n  min-height: 80vh;\n  margin: 0;\n}\n.profile-card {\n  background: #fff;\n  padding: 24px;\n  border-radius: 16px;\n  box-shadow: 0 4px 20px rgba(0,0,0,0.08);\n  text-align: center;\n  max-width: 300px;\n}\n.profile-card img {\n  width: 100px;\n  height: 100px;\n  border-radius: 50%;\n  object-fit: cover;\n  border: 4px solid #16a867;\n}\nh2 {\n  margin: 16px 0 8px;\n  color: #10251c;\n}\np {\n  color: #62736b;\n  font-size: 14px;\n  line-height: 1.5;\n  margin-bottom: 20px;\n}\nbutton {\n  background: #16a867;\n  color: #fff;\n  border: none;\n  padding: 10px 20px;\n  border-radius: 8px;\n  font-weight: 700;\n  cursor: pointer;\n  transition: 0.2s;\n}\nbutton:hover {\n  background: #087a49;\n}`,
                js: `function sapa() {\n  console.log("Tombol sapa diklik!");\n  alert("Halo! Senang berkenalan denganmu.");\n}`
            }
        },
        {
            id: "todo-interaktif",
            category: "javascript",
            icon: "fa-list-check",
            color: "#8a56e9",
            title: "To-do Interaktif",
            level: "Menengah",
            time: "60 menit",
            skills: ["JavaScript", "DOM"],
            outcome: "Daftar tugas yang dapat ditambah dan ditandai",
            summary: "Latih event, manipulasi DOM, dan state sederhana lewat aplikasi kecil yang berguna.",
            goal: "Membuat daftar tugas interaktif dengan tambah, tandai selesai, dan hapus tugas.",
            xp: 150,
            badge: { name: "DOM Master", emoji: "⚡", desc: "Menguasai manipulasi DOM & State" },
            steps: [
                "Buat struktur input, tombol tambah, dan daftar tugas.",
                "Tambahkan event untuk membuat item baru dari input.",
                "Buat aksi tandai selesai dan hapus untuk setiap item.",
                "Uji tiga skenario penggunaan lalu simpan tautan hasil."
            ],
            resources: ["materi.html", "quiz.html", "library.html"],
            editorType: "web",
            files: {
                html: `<div class="todo-app">\n  <h3>Daftar Tugas Hari Ini</h3>\n  <div class="input-group">\n    <input type="text" id="todoInput" placeholder="Tambah tugas baru...">\n    <button id="addBtn">Tambah</button>\n  </div>\n  <ul id="todoList">\n    <li>Belajar DOM (Klik untuk mencoret)</li>\n  </ul>\n</div>`,
                css: `body {\n  font-family: 'DM Sans', sans-serif;\n  background: #e0e7ff;\n  display: grid;\n  place-items: center;\n  min-height: 80vh;\n  margin: 0;\n}\n.todo-app {\n  background: white;\n  padding: 24px;\n  border-radius: 16px;\n  box-shadow: 0 10px 25px rgba(0,0,0,0.05);\n  width: 280px;\n}\nh3 {\n  margin-top: 0;\n  color: #1e1b4b;\n}\n.input-group {\n  display: flex;\n  gap: 8px;\n  margin-bottom: 16px;\n}\ninput {\n  flex: 1;\n  border: 1px solid #c7d2fe;\n  padding: 8px 12px;\n  border-radius: 8px;\n  outline: none;\n}\nbutton {\n  background: #4f46e5;\n  color: white;\n  border: none;\n  padding: 8px 14px;\n  border-radius: 8px;\n  cursor: pointer;\n  font-weight: 700;\n}\nul {\n  list-style: none;\n  padding: 0;\n  margin: 0;\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}\nli {\n  background: #f3f4f6;\n  padding: 10px;\n  border-radius: 8px;\n  font-size: 13px;\n  color: #374151;\n  cursor: pointer;\n  transition: 0.15s;\n}\nli:hover {\n  background: #e5e7eb;\n}\n.completed {\n  text-decoration: line-through;\n  opacity: 0.5;\n  background: #e5e7eb;\n}`,
                js: `const input = document.getElementById('todoInput');\nconst button = document.getElementById('addBtn');\nconst list = document.getElementById('todoList');\n\nbutton.addEventListener('click', () => {\n  const text = input.value.trim();\n  if (!text) return;\n  console.log('Menambahkan tugas baru: ' + text);\n  const li = document.createElement('li');\n  li.textContent = text;\n  li.addEventListener('click', () => {\n    li.classList.toggle('completed');\n    console.log('Tugas diklik: ' + text);\n  });\n  list.appendChild(li);\n  input.value = '';\n});`
            }
        },
        {
            id: "dashboard-data",
            category: "data",
            icon: "fa-chart-column",
            color: "#0f9e7a",
            title: "Dashboard Data Mini",
            level: "Menengah",
            time: "75 menit",
            skills: ["Data", "Visualisasi"],
            outcome: "Ringkasan data dengan insight singkat",
            summary: "Pilih data sederhana, olah temuannya, lalu tampilkan dalam dashboard yang mudah dibaca.",
            goal: "Membuat dashboard statis yang menjawab satu pertanyaan penting dari sebuah data kecil.",
            xp: 200,
            badge: { name: "Data Wizard", emoji: "📊", desc: "Menganalisis & memvisualisasikan data" },
            steps: [
                "Pilih data sederhana dengan minimal 10 baris informasi.",
                "Tentukan satu pertanyaan dan tiga metrik yang ingin ditampilkan.",
                "Susun kartu metrik serta satu grafik atau tabel ringkas.",
                "Tulis dua insight dari data dan simpan tautan hasil."
            ],
            resources: ["materi.html", "quiz.html", "library.html"],
            editorType: "web",
            files: {
                html: `<div class="dashboard">\n  <h3>Statistik Pengunjung Mingguan</h3>\n  <div class="metrics">\n    <div class="metric"><strong>12,450</strong><span>Pengunjung</span></div>\n    <div class="metric"><strong>+18.5%</strong><span>Pertumbuhan</span></div>\n  </div>\n  <div class="chart">\n    <div class="bar-container">\n      <div class="bar" style="height: 40%"></div>\n      <span>Sen</span>\n    </div>\n    <div class="bar-container">\n      <div class="bar" style="height: 60%"></div>\n      <span>Sel</span>\n    </div>\n    <div class="bar-container">\n      <div class="bar" style="height: 85%"></div>\n      <span>Rab</span>\n    </div>\n    <div class="bar-container">\n      <div class="bar" style="height: 50%"></div>\n      <span>Kam</span>\n    </div>\n    <div class="bar-container">\n      <div class="bar" style="height: 95%"></div>\n      <span>Jum</span>\n    </div>\n  </div>\n</div>`,
                css: `body {\n  font-family: sans-serif;\n  background: #f0fdf4;\n  display: grid;\n  place-items: center;\n  min-height: 80vh;\n  margin: 0;\n}\n.dashboard {\n  background: white;\n  padding: 24px;\n  border-radius: 16px;\n  box-shadow: 0 4px 20px rgba(0,0,0,0.05);\n  width: 290px;\n}\nh3 {\n  margin-top: 0;\n  color: #064e3b;\n}\n.metrics {\n  display: flex;\n  gap: 12px;\n  margin-bottom: 24px;\n}\n.metric {\n  flex: 1;\n  background: #f0fdf4;\n  padding: 12px;\n  border-radius: 12px;\n  text-align: center;\n  border: 1px dashed #a7f3d0;\n}\n.metric strong {\n  display: block;\n  font-size: 18px;\n  color: #047857;\n}\n.metric span {\n  font-size: 11px;\n  color: #065f46;\n}\n.chart {\n  display: flex;\n  justify-content: space-between;\n  align-items: flex-end;\n  height: 120px;\n  padding: 10px 0;\n  border-bottom: 2px solid #e2e8f0;\n}\n.bar-container {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 8px;\n  flex: 1;\n}\n.bar {\n  width: 20px;\n  background: #10b981;\n  border-radius: 4px 4px 0 0;\n  transition: 0.3s;\n}\n.bar-container span {\n  font-size: 10px;\n  color: #64748b;\n}`,
                js: `console.log("Visualisasi dashboard data mingguan.");\nconst bars = document.querySelectorAll(".bar");\nbars.forEach((bar, idx) => {\n  console.log("Tinggi data hari ke-" + (idx + 1) + " adalah " + bar.style.height);\n});`
            }
        },
        {
            id: "ui-redesign",
            category: "uiux",
            icon: "fa-wand-magic-sparkles",
            color: "#ea5a9c",
            title: "Redesign UI",
            level: "Pemula",
            time: "50 menit",
            skills: ["UI/UX", "Figma"],
            outcome: "Before-after satu layar aplikasi",
            summary: "Ambil satu antarmuka sederhana lalu perbaiki hierarki, fokus, dan keterbacaannya.",
            goal: "Menghasilkan satu desain ulang layar yang lebih jelas beserta alasan keputusan utamanya.",
            xp: 100,
            badge: { name: "UI/UX Designer", emoji: "🎨", desc: "Mendesain ulang visual & hierarki" },
            steps: [
                "Pilih satu layar aplikasi yang ingin diperbaiki.",
                "Catat tiga masalah visual atau alur pengguna.",
                "Buat redesign dengan hierarki, kontras, dan ruang yang lebih baik.",
                "Tulis alasan perubahan lalu simpan tautan desain."
            ],
            resources: ["materi.html", "quiz.html", "library.html"],
            editorType: "web",
            files: {
                html: `<div class="playground-layout">\n  <div class="control-panel">\n    <h3>UI/UX Studio Simulator</h3>\n    <p>Nyalakan opsi desain untuk menerapkan prinsip UI modern:</p>\n    <label><input type="checkbox" id="toggleSpacing" checked> Spacing Bersih</label>\n    <label><input type="checkbox" id="toggleRadius" checked> Sudut Halus (Rounded)</label>\n    <label><input type="checkbox" id="toggleFonts" checked> Tipografi Modern</label>\n    <label><input type="checkbox" id="toggleColors" checked> Warna Kontras Tinggi</label>\n  </div>\n  \n  <div class="preview-card" id="previewCard">\n    <div class="card-image">✨</div>\n    <div class="card-body">\n      <h4>Kreator UI/UX Handal</h4>\n      <p>Pelajari fondasi utama perancangan UI/UX yang memukau mata pengunjung.</p>\n      <button>Daftar Kelas</button>\n    </div>\n  </div>\n</div>`,
                css: `body {\n  font-family: 'DM Sans', sans-serif;\n  padding: 16px;\n  background: #fff5f5;\n  display: grid;\n  place-items: center;\n  min-height: 80vh;\n  margin: 0;\n}\n.playground-layout {\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n  width: 280px;\n}\n.control-panel {\n  background: #fff;\n  padding: 14px;\n  border-radius: 12px;\n  border: 1px solid #ffe3e3;\n}\n.control-panel h3 {\n  margin-top: 0;\n  font-size: 13px;\n  color: #9b1c1c;\n}\n.control-panel p {\n  font-size: 10px;\n  color: #c53030;\n  margin-bottom: 10px;\n}\n.control-panel label {\n  display: block;\n  font-size: 11px;\n  margin-bottom: 6px;\n  font-weight: 700;\n  cursor: pointer;\n}\n\n/* Default Clunky UI styling */\n.preview-card {\n  background: #fff;\n  border: 2px solid black;\n  padding: 4px;\n}\n.preview-card h4 {\n  margin: 4px 0;\n}\n.preview-card p {\n  font-size: 12px;\n}\n.preview-card button {\n  background: red;\n  color: white;\n  width: 100%;\n  border: none;\n  padding: 4px;\n}\n\n/* Modern Premium UI Toggles */\n.preview-card.modern-spacing {\n  padding: 20px;\n}\n.preview-card.modern-radius {\n  border-radius: 16px;\n  border: 1px solid #e2e8f0;\n  box-shadow: 0 10px 25px rgba(0,0,0,0.05);\n}\n.preview-card.modern-fonts {\n  font-family: 'DM Sans', sans-serif;\n}\n.preview-card.modern-colors {\n  color: #0f172a;\n}\n.preview-card.modern-colors p {\n  color: #64748b;\n}\n.preview-card.modern-colors button {\n  background: #3867f4;\n  border-radius: 8px;\n  padding: 10px;\n  font-weight: 700;\n  color: white;\n}\n.card-image {\n  height: 80px;\n  display: grid;\n  place-items: center;\n  background: #f1f5f9;\n  border-radius: 8px;\n  font-size: 24px;\n  margin-bottom: 10px;\n}`,
                js: `const card = document.getElementById("previewCard");\nconst spacing = document.getElementById("toggleSpacing");\nconst radius = document.getElementById("toggleRadius");\nconst fonts = document.getElementById("toggleFonts");\nconst colors = document.getElementById("toggleColors");\n\nfunction update() {\n  card.classList.toggle("modern-spacing", spacing.checked);\n  card.classList.toggle("modern-radius", radius.checked);\n  card.classList.toggle("modern-fonts", fonts.checked);\n  card.classList.toggle("modern-colors", colors.checked);\n  console.log("UI Redesign visual state updated.");\n}\n\n[spacing, radius, fonts, colors].forEach(item => {\n  item.addEventListener("change", update);\n});\nupdate();`
            }
        },
        {
            id: "form-aman",
            category: "security",
            icon: "fa-shield-halved",
            color: "#dc7c20",
            title: "Form Kontak Aman",
            level: "Menengah",
            time: "60 menit",
            skills: ["Security", "Validasi"],
            outcome: "Form dengan validasi input jelas",
            summary: "Bangun form kontak yang membantu pengguna mengisi data dengan aman dan benar.",
            goal: "Membuat form kontak dengan validasi di sisi klien dan pesan kesalahan yang dapat dipahami.",
            xp: 150,
            badge: { name: "Security Guardian", emoji: "🛡️", desc: "Mengamankan validasi form input" },
            steps: [
                "Tentukan field dan aturan validasi yang benar-benar dibutuhkan.",
                "Bangun label, input, serta pesan kesalahan yang aksesibel.",
                "Tambahkan validasi email dan batas karakter dengan JavaScript.",
                "Uji input kosong, email salah, dan data valid lalu simpan hasil."
            ],
            resources: ["materi.html", "quiz.html", "library.html"],
            editorType: "web",
            files: {
                html: `<div class="secure-form">\n  <h3>Form Keamanan Kontak</h3>\n  <div class="field">\n    <label>Email Pengguna</label>\n    <input type="text" id="email" placeholder="nama@gmail.com">\n    <span class="error" id="emailError"></span>\n  </div>\n  <div class="field">\n    <label>Pesan Singkat (Maks 100 Karakter)</label>\n    <textarea id="message" placeholder="Tulis masukan Anda..."></textarea>\n    <span class="error" id="messageError"></span>\n  </div>\n  <button onclick="validasiForm()">Submit Kirim</button>\n  <div class="success-message" id="successMsg">Form terkirim dengan aman!</div>\n</div>`,
                css: `body {\n  font-family: sans-serif;\n  background: #fffbeb;\n  display: grid;\n  place-items: center;\n  min-height: 80vh;\n  margin: 0;\n}\n.secure-form {\n  background: white;\n  padding: 24px;\n  border-radius: 16px;\n  box-shadow: 0 10px 25px rgba(0,0,0,0.05);\n  width: 280px;\n  border: 1px solid #fde68a;\n}\nh3 {\n  margin-top: 0;\n  color: #78350f;\n}\n.field {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n  margin-bottom: 12px;\n}\nlabel {\n  font-size: 11px;\n  font-weight: 700;\n  color: #b45309;\n}\ninput, textarea {\n  border: 1px solid #fde68a;\n  padding: 8px;\n  border-radius: 8px;\n  outline: none;\n  font-size: 13px;\n}\ntextarea {\n  height: 60px;\n  resize: none;\n}\n.error {\n  font-size: 10px;\n  color: #dc2626;\n  font-weight: 600;\n  display: none;\n}\nbutton {\n  background: #d97706;\n  color: white;\n  border: none;\n  padding: 10px;\n  border-radius: 8px;\n  cursor: pointer;\n  font-weight: 700;\n  width: 100%;\n}\n.success-message {\n  margin-top: 12px;\n  background: #d1fae5;\n  color: #065f46;\n  border: 1px solid #a7f3d0;\n  padding: 10px;\n  border-radius: 8px;\n  font-size: 12px;\n  text-align: center;\n  display: none;\n}`,
                js: `function validasiForm() {\n  const email = document.getElementById("email").value.trim();\n  const message = document.getElementById("message").value.trim();\n  const emailErr = document.getElementById("emailError");\n  const msgErr = document.getElementById("messageError");\n  const success = document.getElementById("successMsg");\n  \n  emailErr.style.display = "none";\n  msgErr.style.display = "none";\n  success.style.display = "none";\n  \n  let isValid = true;\n  \n  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;\n  if (!emailRegex.test(email)) {\n    emailErr.textContent = "Email salah atau kosong!";\n    emailErr.style.display = "block";\n    console.log("Error email: " + email);\n    isValid = false;\n  }\n  \n  if (!message || message.length > 100) {\n    msgErr.textContent = "Pesan wajib diisi (Maks 100 karakter)!";\n    msgErr.style.display = "block";\n    console.log("Error pesan: " + message.length + " karakter");\n    isValid = false;\n  }\n  \n  if (isValid) {\n    success.style.display = "block";\n    console.log("Form validasi aman! Data siap ditransmisikan.");\n  }\n}`
            }
        },
        {
            id: "git-readme",
            category: "git",
            icon: "fa-code-branch",
            color: "#4f7998",
            title: "Dokumentasi Proyek dengan Git",
            level: "Pemula",
            time: "40 menit",
            skills: ["Git", "README"],
            outcome: "README yang siap dibaca orang lain",
            summary: "Latih kebiasaan kerja developer dengan mendokumentasikan proyek secara jelas dan singkat.",
            goal: "Menulis README yang menjelaskan tujuan, cara menjalankan, fitur, dan pembelajaran proyekmu.",
            xp: 100,
            badge: { name: "Git Pioneer", emoji: "📦", desc: "Menulis README proyek semantik" },
            steps: [
                "Pilih satu proyek yang akan didokumentasikan.",
                "Tulis tujuan, fitur utama, serta teknologi yang dipakai.",
                "Tambahkan langkah menjalankan dan satu gambar atau contoh hasil.",
                "Tinjau README dari sudut pandang pengguna baru lalu simpan tautannya."
            ],
            resources: ["materi.html", "quiz.html", "library.html"],
            editorType: "markdown",
            files: {
                markdown: `# 🚀 Proyek Super Keren\n\nIni adalah proyek luar biasa yang dibangun sebagai bagian dari pelatihan praktis Universe Of Tech.\n\n## ✨ Fitur Utama\n- 📦 Manajemen data lokal secara instan.\n- ⚡ Performa super responsif dan halus.\n- 🎨 Antarmuka bertema Glassmorphism modern.\n\n## 💻 Cara Menggunakan\n1. Clone repositori:\n   \`git clone https://github.com/username/project.git\`\n2. Buka berkas \`index.html\` di peramban web Anda.`
            }
        }
    ];

    const labels = { materi: "Materi pendukung", quiz: "Quiz penguat", library: "Bacaan lanjutan" };
    const $ = id => document.getElementById(id);
    const safe = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" })[char]);

    const read = () => {
        try {
            const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
            return raw && raw.version === 1 && raw.projects && typeof raw.projects === "object" ? raw : { version: 1, selectedProjectId: "", projects: {} };
        } catch {
            return { version: 1, selectedProjectId: "", projects: {} };
        }
    };

    let state = read();
    let filter = "all";
    let searchQuery = "";
    let statusFilter = "all";
    let projectSort = "recommended";
    let saveTimer;

    const recordFor = id => ({
        status: "not_started",
        checkedSteps: [],
        reflection: "",
        projectUrl: "",
        files: {},
        ...(state.projects[id] || {})
    });

    const persist = () => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            return true;
        } catch {
            toast("Penyimpanan perangkat tidak tersedia. Coba lagi setelah ruang penyimpanan tersedia.");
            return false;
        }
    };

    const toast = text => {
        const node = $("projectToast");
        if (!node) return;
        node.textContent = text;
        node.classList.add("show");
        clearTimeout(toast.timer);
        toast.timer = setTimeout(() => node.classList.remove("show"), 2800);
    };

    const validUrl = value => {
        if (!value) return "";
        try {
            const url = new URL(value);
            return /^https?:$/.test(url.protocol) ? url.href : "";
        } catch {
            return "";
        }
    };

    function statusLabel(record) {
        return record.status === "completed" ? "Selesai" : record.status === "in_progress" ? "Berjalan" : "Belum mulai";
    }

    /* ═══════════════════════════════════════════════════════════
       ENHANCED CONFETTI — Spectacular Celebration
       ═══════════════════════════════════════════════════════════ */
    function triggerConfetti() {
        const container = document.createElement("div");
        container.className = "confetti-container";
        document.body.appendChild(container);

        const colors = ["#3867f4", "#9077ed", "#10b981", "#ff9f43", "#ea5a9c", "#ffd166", "#38bdf8", "#7c3aed"];
        const shapes = ["circle", "square", "triangle"];
        for (let i = 0; i < 100; i++) {
            const particle = document.createElement("div");
            particle.className = "confetti-particle";
            const shape = shapes[Math.floor(Math.random() * shapes.length)];
            const size = Math.random() * 8 + 6;
            particle.style.left = Math.random() * 100 + "vw";
            particle.style.background = colors[Math.floor(Math.random() * colors.length)];
            particle.style.animationDelay = Math.random() * 2 + "s";
            particle.style.animationDuration = (Math.random() * 2 + 2.5) + "s";
            particle.style.width = size + "px";
            particle.style.height = size + "px";
            if (shape === "circle") particle.style.borderRadius = "50%";
            else if (shape === "triangle") {
                particle.style.width = "0";
                particle.style.height = "0";
                particle.style.borderLeft = size / 2 + "px solid transparent";
                particle.style.borderRight = size / 2 + "px solid transparent";
                particle.style.borderBottom = size + "px solid " + colors[Math.floor(Math.random() * colors.length)];
                particle.style.background = "transparent";
            }
            container.appendChild(particle);
        }

        setTimeout(() => container.remove(), 5000);

        if (typeof window.playSound === "function") {
            try { window.playSound("correct"); } catch (err) {}
        }
    }

    function parseMarkdown(md) {
        let html = md;
        html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
        html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        html = html.replace(/`([\s\S]*?)`/g, '<code>$1</code>');
        html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
        return html;
    }

    /* ═══════════════════════════════════════════════════════════
       ANIMATED COUNTER — Numbers count up smoothly
       ═══════════════════════════════════════════════════════════ */
    function animateCounter(element, target, suffix = "") {
        const duration = 800;
        const start = parseInt(element.textContent) || 0;
        const diff = target - start;
        if (diff === 0) {
            element.textContent = target + suffix;
            return;
        }
        const startTime = performance.now();
        function step(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(start + diff * eased);
            element.textContent = current + suffix;
            if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    /* ═══════════════════════════════════════════════════════════
       RENDER OVERVIEW — With Animated Stats
       ═══════════════════════════════════════════════════════════ */
    function renderOverview() {
        const records = projects.map(project => recordFor(project.id));
        const completed = records.filter(record => record.status === "completed").length;
        const active = records.filter(record => record.status === "in_progress").length;

        let totalXP = 0;
        projects.forEach(project => {
            const record = recordFor(project.id);
            if (record.status === "completed") {
                totalXP += project.xp;
            }
        });

        let rank = "Novice Builder";
        if (totalXP >= 600) rank = "Full-Stack Architect 👑";
        else if (totalXP >= 350) rank = "Professional Developer 🚀";
        else if (totalXP >= 150) rank = "Skillful Creator ⚡";

        const rankEl = $("creatorRank");
        if (rankEl) rankEl.textContent = rank;

        const xpEl = $("totalXP");
        if (xpEl) animateCounter(xpEl, totalXP, " XP");

        const completedEl = $("completedCount");
        if (completedEl) animateCounter(completedEl, completed);

        const activeEl = $("activeCount");
        if (activeEl) animateCounter(activeEl, active);

        const remainingEl = $("remainingCount");
        if (remainingEl) animateCounter(remainingEl, projects.length - completed - active);

        // Hero inline stats
        const heroTotal = $("heroTotalProjects");
        if (heroTotal) heroTotal.textContent = projects.length;
        const heroCompleted = $("heroCompletedProjects");
        if (heroCompleted) animateCounter(heroCompleted, completed);
        const heroXP = $("heroTotalXP");
        if (heroXP) animateCounter(heroXP, totalXP);

        const progressEl = $("overallProgress");
        if (progressEl) {
            const pct = Math.round((completed / projects.length) * 100);
            progressEl.style.width = `${pct}%`;
        }

        const progressTextEl = $("overallProgressText");
        if (progressTextEl) {
            progressTextEl.textContent = completed ? `${completed} dari ${projects.length} karya sudah masuk portofolio.` : "Mulai dari satu karya kecil hari ini.";
        }

        const badgesGrid = $("badgesGrid");
        if (badgesGrid) {
            badgesGrid.innerHTML = projects.map(project => {
                const record = recordFor(project.id);
                const isUnlocked = record.status === "completed";
                const tooltip = `${project.badge.name}: ${project.badge.desc}`;
                return `
                    <div class="badge-item ${isUnlocked ? 'unlocked' : 'locked'}" data-tooltip="${tooltip}" aria-label="${tooltip}">
                        <span>${project.badge.emoji}</span>
                    </div>
                `;
            }).join("");
        }

        const current = projects
            .filter(project => recordFor(project.id).status === "in_progress")
            .sort((a, b) => new Date(recordFor(b.id).updatedAt || 0) - new Date(recordFor(a.id).updatedAt || 0))[0]
            || projects.find(project => recordFor(project.id).status !== "completed");

        const button = $("continueProjectButton");
        if (button) {
            button.href = current ? `projects.html?project=${encodeURIComponent(current.id)}#projectWorkspace` : "#projectCatalog";
            button.innerHTML = current && recordFor(current.id).status === "in_progress" ? `Lanjutkan ${safe(current.title)} <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>` : `Pilih proyek pertama <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>`;
        }
    }

    /* ═══════════════════════════════════════════════════════════
       RENDER GRID — With Staggered Card Entrance
       ═══════════════════════════════════════════════════════════ */
    function renderGrid() {
        const visible = window.ProjectFeatures.selectProjects(projects, {
            category: filter,
            query: searchQuery,
            status: statusFilter,
            sort: projectSort,
            recordFor
        });
        const gridEl = $("projectGrid");

        gridEl.innerHTML = visible.map((project, idx) => {
            const record = recordFor(project.id);
            const completedSteps = record.checkedSteps.filter(index => Number.isInteger(index) && index >= 0 && index < project.steps.length).length;
            const progress = record.status === "completed" ? 100 : Math.round((completedSteps / project.steps.length) * 100);
            const action = record.status === "not_started" ? "Mulai" : "Buka proyek";
            const levelClass = project.level === "Pemula" ? "level-beginner" : "level-intermediate";

            return `<article class="project-card" style="--card-color:${project.color}; animation-delay: ${idx * 0.08}s">
                <div class="card-top">
                    <span class="project-icon" style="--card-color:${project.color}">
                        <i class="fa-solid ${project.icon}" aria-hidden="true"></i>
                    </span>
                    <span class="status-pill ${record.status.replace("_", "-")}">${statusLabel(record)}</span>
                </div>
                <h3>${safe(project.title)}</h3>
                <p>${safe(project.summary)}</p>
                <div class="project-meta">
                    <span>${safe(project.level)}</span>
                    <span>${safe(project.time)}</span>
                    <span class="xp-badge">+${project.xp} XP</span>
                    ${project.skills.map(skill => `<span>${safe(skill)}</span>`).join("")}
                </div>
                <div class="card-progress">
                    <div aria-hidden="true"><i style="width:${progress}%"></i></div>
                    <small>${record.status === "completed" ? "✓ Karya selesai" : `${completedSteps}/${project.steps.length} langkah selesai`}</small>
                </div>
                <div class="project-card-footer">
                    <small>${safe(project.outcome)}</small>
                    <button type="button" data-open-project="${project.id}" aria-label="${action} ${safe(project.title)}">
                        ${action} <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
                    </button>
                </div>
            </article>`;
        }).join("") || `<p class="empty-state"><i class="fa-solid fa-folder-open" style="font-size:28px;margin-bottom:12px;display:block;opacity:0.3"></i>Tidak ada proyek dalam kategori ini.</p>`;

        // Re-trigger card entrance animation
        requestAnimationFrame(() => {
            gridEl.querySelectorAll(".project-card").forEach(card => {
                card.style.opacity = "0";
                card.style.transform = "translateY(20px)";
                requestAnimationFrame(() => {
                    card.style.animation = "none";
                    card.offsetHeight; // trigger reflow
                    card.style.animation = "";
                });
            });
        });
    }

    function resourceMarkup(resources) {
        return resources.map((href, index) => {
            const kind = ["materi", "quiz", "library"][index];
            const icon = ["fa-book-open", "fa-circle-question", "fa-bookmark"][index];
            return `<a class="resource-link" href="${href}"><i class="fa-solid ${icon}" aria-hidden="true"></i>${labels[kind]}</a>`;
        }).join("");
    }

    function renderWorkspace(project, shouldScroll = true) {
        const record = recordFor(project.id);
        const checked = new Set(record.checkedSteps);
        const allChecked = project.steps.every((_, index) => checked.has(index));
        const proof = Boolean(record.reflection.trim() || validUrl(record.projectUrl));
        const canComplete = allChecked && proof;
        const savedUrl = validUrl(record.projectUrl);
        const progress = record.status === "completed" ? 100 : Math.round((checked.size / project.steps.length) * 100);
        const workspace = $("projectWorkspace");
        workspace.hidden = false;

        let playgroundMarkup = "";
        if (project.editorType === "web") {
            const htmlVal = record.files?.html ?? project.files.html;
            const cssVal = record.files?.css ?? project.files.css;
            const jsVal = record.files?.js ?? project.files.js;

            playgroundMarkup = `
                <div class="playground-box">
                    <div class="playground-head">
                        <div class="playground-tabs">
                            <button class="playground-tab-btn active" data-tab="html">index.html</button>
                            <button class="playground-tab-btn" data-tab="css">style.css</button>
                            <button class="playground-tab-btn" data-tab="js">app.js</button>
                        </div>
                        <div class="playground-actions">
                            <button class="playground-secondary-btn" id="resetPlayground"><i class="fa-solid fa-rotate-left" aria-hidden="true"></i> Reset</button>
                            <button class="playground-secondary-btn" id="downloadPlayground"><i class="fa-solid fa-download" aria-hidden="true"></i> Unduh</button>
                            <button class="playground-run-btn" id="runPlayground"><i class="fa-solid fa-play" aria-hidden="true"></i> Jalankan</button>
                        </div>
                    </div>
                    <div class="playground-editors">
                        <textarea class="playground-editor-textarea" id="playgroundHtml" aria-label="Kode HTML">${safe(htmlVal)}</textarea>
                        <textarea class="playground-editor-textarea" id="playgroundCss" aria-label="Kode CSS" style="display:none;">${safe(cssVal)}</textarea>
                        <textarea class="playground-editor-textarea" id="playgroundJs" aria-label="Kode JS" style="display:none;">${safe(jsVal)}</textarea>
                    </div>
                    <div class="playground-outputs">
                        <iframe class="playground-preview-frame" id="playgroundFrame" title="Sandbox Output"></iframe>
                        <pre class="playground-console" id="playgroundConsole">Output log akan muncul di sini saat tombol Jalankan Kode ditekan.</pre>
                    </div>
                </div>
            `;
        } else if (project.editorType === "markdown") {
            const mdVal = record.files?.markdown ?? project.files.markdown;
            playgroundMarkup = `
                <div class="playground-box">
                    <div class="playground-head">
                        <div class="playground-tabs">
                            <button class="playground-tab-btn active" data-tab="markdown">README.md</button>
                        </div>
                        <div class="playground-actions">
                            <button class="playground-secondary-btn" id="resetPlayground"><i class="fa-solid fa-rotate-left" aria-hidden="true"></i> Reset</button>
                            <button class="playground-secondary-btn" id="downloadPlayground"><i class="fa-solid fa-download" aria-hidden="true"></i> Unduh</button>
                            <button class="playground-run-btn" id="runPlayground"><i class="fa-solid fa-play" aria-hidden="true"></i> Preview</button>
                        </div>
                    </div>
                    <div class="playground-editors">
                        <textarea class="playground-editor-textarea" id="playgroundMarkdown" aria-label="Kode Markdown">${safe(mdVal)}</textarea>
                    </div>
                    <div class="playground-outputs">
                        <iframe class="playground-preview-frame" id="playgroundFrame" title="Markdown Preview"></iframe>
                    </div>
                </div>
            `;
        }

        workspace.innerHTML = `<div class="workspace-panel"><header class="workspace-header"><div><p class="eyebrow">${safe(project.level)} · ${safe(project.time)} · +${project.xp} XP</p><h2 id="workspaceTitle">${safe(project.title)}</h2><p>${safe(project.goal)}</p></div><button type="button" id="closeWorkspace"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i> Kembali ke katalog</button></header><div class="workspace-body"><div class="workspace-main"><div class="workspace-title-row"><h3>Langkah kerja</h3><span id="workspaceStepLabel">${checked.size}/${project.steps.length} selesai</span></div><p>Selesaikan satu per satu. Progres tersimpan otomatis di perangkat ini.</p><div class="checklist-progress" aria-hidden="true"><i id="workspaceStepBar" style="width:${progress}%"></i></div><div class="checklist">${project.steps.map((step, index) => `<label><input type="checkbox" data-step="${index}" ${checked.has(index) ? "checked" : ""}><span>${safe(step)}</span></label>`).join("")}</div>${playgroundMarkup}</div><aside class="workspace-sidebar"><h3>Hasil karya</h3><p>Simpan refleksi atau tautan karya untuk menandai proyek selesai.</p><div class="resources">${resourceMarkup(project.resources)}</div><div class="form-field"><label for="projectUrl">Tautan hasil</label><input id="projectUrl" type="url" inputmode="url" placeholder="https://..." value="${safe(record.projectUrl)}"><small>Gunakan tautan HTTP/HTTPS ke GitHub, Figma, atau hasil publikmu.</small></div><div class="form-field"><label for="projectReflection">Refleksi singkat</label><textarea id="projectReflection" maxlength="${MAX_REFLECTION}" placeholder="Apa yang kamu pelajari dari proyek ini?">${safe(record.reflection)}</textarea><small id="reflectionCount">${record.reflection.length}/${MAX_REFLECTION} karakter</small></div>${savedUrl ? `<a class="saved-link" href="${safe(savedUrl)}" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i> Buka hasil tersimpan</a>` : ""}<span class="save-status" id="workspaceSaveStatus">Tersimpan otomatis</span><div class="workspace-actions"><button type="button" id="saveProject">Simpan progres</button><button type="button" id="completeProject" ${canComplete || record.status === "completed" ? "" : "disabled"}>${record.status === "completed" ? "✓ Proyek selesai" : "Tandai selesai"}</button></div><p class="completion-note" id="completionNote">${record.status === "completed" ? "Karya ini selesai dan sudah masuk portofolio lokalmu." : canComplete ? "Semua syarat terpenuhi. Kamu dapat menandai proyek selesai." : "Lengkapi semua langkah serta refleksi atau tautan hasil untuk menyelesaikan proyek."}</p></aside></div></div>`;
        bindWorkspace(project);
        runPlaygroundSandbox(project);
        if (shouldScroll) workspace.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function workspaceDraft(project) {
        const checks = [...document.querySelectorAll("[data-step]")].filter(input => input.checked).map(input => Number(input.dataset.step));
        const reflection = $("projectReflection")?.value.trim().slice(0, MAX_REFLECTION) || "";
        const rawUrl = $("projectUrl")?.value.trim() || "";

        let files = {};
        if (project.editorType === "web") {
            files.html = $("playgroundHtml")?.value || "";
            files.css = $("playgroundCss")?.value || "";
            files.js = $("playgroundJs")?.value || "";
        } else if (project.editorType === "markdown") {
            files.markdown = $("playgroundMarkdown")?.value || "";
        }

        return { checks, reflection, rawUrl, url: validUrl(rawUrl), files, allChecked: project.steps.every((_, index) => checks.includes(index)) };
    }

    function syncWorkspaceControls(project) {
        const draft = workspaceDraft(project);
        const record = recordFor(project.id);
        const progress = record.status === "completed" ? 100 : Math.round((draft.checks.length / project.steps.length) * 100);
        $("workspaceStepLabel").textContent = `${draft.checks.length}/${project.steps.length} selesai`;
        $("workspaceStepBar").style.width = `${progress}%`;
        const canComplete = draft.allChecked && Boolean(draft.reflection || draft.url);
        $("completeProject").disabled = record.status !== "completed" && !canComplete;
        $("completionNote").textContent = record.status === "completed" ? "Karya ini selesai dan sudah masuk portofolio lokalmu." : canComplete ? "Semua syarat terpenuhi. Kamu dapat menandai proyek selesai." : "Lengkapi semua langkah serta refleksi atau tautan hasil untuk menyelesaikan proyek.";
    }

    function setSaveStatus(text) {
        const status = $("workspaceSaveStatus");
        if (status) status.textContent = text;
    }

    function saveWorkspace(project, notify = true) {
        const record = recordFor(project.id);
        const draft = workspaceDraft(project);
        if (draft.rawUrl && !draft.url && notify) {
            toast("Gunakan tautan yang dimulai dengan http:// atau https://.");
            return false;
        }
        const projectUrl = draft.rawUrl && !draft.url ? record.projectUrl : draft.url;
        const started = draft.checks.length || draft.reflection || projectUrl || Object.keys(draft.files).length > 0;
        state.projects[project.id] = {
            ...record,
            status: record.status === "completed" ? "completed" : started ? "in_progress" : "not_started",
            checkedSteps: draft.checks,
            reflection: draft.reflection,
            projectUrl,
            files: draft.files,
            startedAt: record.startedAt || (started ? new Date().toISOString() : ""),
            updatedAt: new Date().toISOString()
        };
        state.selectedProjectId = project.id;
        const saved = persist();
        if (saved) {
            setSaveStatus("Tersimpan otomatis");
            if (notify) toast("Progres proyek tersimpan.");
        }
        return saved;
    }

    function runPlaygroundSandbox(project) {
        const frame = $("playgroundFrame");
        if (!frame) return;

        if (project.editorType === "web") {
            const consoleEl = $("playgroundConsole");
            if (consoleEl) consoleEl.textContent = "";

            const html = $("playgroundHtml")?.value || "";
            const css = $("playgroundCss")?.value || "";
            const js = $("playgroundJs")?.value || "";

            const srcdoc = `<!doctype html>
            <html>
            <head>
                <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">
                <style>${css}</style>
            </head>
            <body>
                ${html}
                <script>
                    const _log = console.log;
                    const _error = console.error;
                    console.log = (...args) => {
                        _log(...args);
                        parent.postMessage({ type: "sandbox-log", message: args.map(x => typeof x === "object" ? JSON.stringify(x) : String(x)).join(" ") }, "*");
                    };
                    console.error = (...args) => {
                        _error(...args);
                        parent.postMessage({ type: "sandbox-error", message: args.map(x => typeof x === "object" ? JSON.stringify(x) : String(x)).join(" ") }, "*");
                    };
                    window.onerror = (msg, url, line) => {
                        parent.postMessage({ type: "sandbox-error", message: msg + " (baris " + line + ")" }, "*");
                    };
                <\/script>
                <script>${js}<\/script>
            </body>
            </html>`;
            frame.srcdoc = srcdoc;
        } else if (project.editorType === "markdown") {
            const markdown = $("playgroundMarkdown")?.value || "";
            const parsed = parseMarkdown(markdown);
            const srcdoc = `<!doctype html>
            <html>
            <head>
                <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">
                <style>
                    body { font-family: 'DM Sans', sans-serif; padding: 20px; color: #1e293b; line-height: 1.6; background: #fff; }
                    h1, h2, h3 { color: #0f172a; margin-top: 24px; margin-bottom: 12px; font-weight: 700; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
                    h1 { font-size: 22px; }
                    h2 { font-size: 18px; }
                    h3 { font-size: 15px; }
                    p { margin: 0 0 16px; font-size: 13.5px; }
                    li { font-size: 13.5px; margin-bottom: 6px; }
                    code { background: #f1f5f9; padding: 2px 6px; border-radius: 6px; font-family: monospace; font-size: 0.9em; color: #0f172a; }
                    pre { background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px; overflow-x: auto; }
                    pre code { background: none; padding: 0; border: none; font-size: 13px; }
                </style>
            </head>
            <body>${parsed}</body>
            </html>`;
            frame.srcdoc = srcdoc;
        }
    }

    function bindWorkspace(project) {
        $("closeWorkspace").addEventListener("click", () => {
            $("projectWorkspace").hidden = true;
            history.replaceState({}, "", location.pathname);
            document.getElementById("projectCatalog").scrollIntoView({ behavior: "smooth" });
        });

        document.querySelectorAll("[data-step]").forEach(input => input.addEventListener("change", () => {
            setSaveStatus("Menyimpan...");
            saveWorkspace(project, false);
            renderOverview();
            renderGrid();
            syncWorkspaceControls(project);
            if (typeof window.playSound === "function") {
                try { window.playSound("click"); } catch(err){}
            }
        }));

        $("projectReflection").addEventListener("input", event => {
            $("reflectionCount").textContent = `${event.target.value.length}/${MAX_REFLECTION} karakter`;
            setSaveStatus("Menyimpan...");
            syncWorkspaceControls(project);
            clearTimeout(saveTimer);
            saveTimer = setTimeout(() => {
                saveWorkspace(project, false);
                renderOverview();
                renderGrid();
                syncWorkspaceControls(project);
            }, 650);
        });

        $("projectUrl").addEventListener("input", () => {
            setSaveStatus("Belum disimpan");
            syncWorkspaceControls(project);
        });

        $("projectUrl").addEventListener("blur", () => {
            if (saveWorkspace(project, true)) {
                renderOverview();
                renderGrid();
                syncWorkspaceControls(project);
            }
        });

        $("saveProject").addEventListener("click", () => {
            if (saveWorkspace(project)) {
                renderOverview();
                renderGrid();
                renderWorkspace(project, false);
            }
        });

        $("completeProject").addEventListener("click", () => {
            if (!saveWorkspace(project, false)) return;
            const record = recordFor(project.id);
            const allChecked = project.steps.every((_, index) => record.checkedSteps.includes(index));
            if (!allChecked || !(record.reflection || record.projectUrl)) {
                toast("Selesaikan seluruh langkah dan simpan refleksi atau tautan hasil terlebih dahulu.");
                return;
            }
            const isFirstTime = record.status !== "completed";
            state.projects[project.id] = { ...record, status: "completed", completedAt: record.completedAt || new Date().toISOString(), updatedAt: new Date().toISOString() };
            persist();
            triggerConfetti();

            if (isFirstTime) {
                if (typeof window !== "undefined" && window.ActivityService && typeof window.ActivityService.recordProject === "function") {
                    window.ActivityService.recordProject(project.id, {
                        title: project.title,
                        xp: project.xp || 100,
                        coins: Math.round((project.xp || 100) / 2),
                        category: project.category || "programming",
                        topic: (project.skills || [])[0] || "general",
                        skill: `${project.category}_${(project.skills || [])[0]}`.toLowerCase().replace(/\s+/g, '_'),
                        accuracy: 100 // completed project counts as 100% accuracy for the target skill
                    }, { showModal: true });
                } else if (typeof window !== "undefined" && window.ProgressionEngine) {
                    if (typeof window.ProgressionEngine.recordActivity === "function") {
                        window.ProgressionEngine.recordActivity("project", {
                            id: project.id,
                            title: `Proyek: ${project.title}`,
                            xp: project.xp || 100,
                            coins: Math.round((project.xp || 100) / 2),
                            reason: `Menyelesaikan proyek ${project.title}`,
                            rewardId: `project:${project.id}`,
                            missionType: "project_or_exam",
                            achievementId: "project_master",
                            showModal: true
                        });
                    } else if (typeof window.ProgressionEngine.completeActivity === "function") {
                        window.ProgressionEngine.completeActivity(`project:${project.id}`, {
                            xp: project.xp || 100,
                            coins: Math.round((project.xp || 100) / 2),
                            reason: `Menyelesaikan proyek ${project.title}`,
                            achievementId: "project_master"
                        });
                    }
                } else if (typeof window.addXp === "function") {
                    window.addXp(project.xp || 100);
                }
            }

            toast(`Proyek selesai! +${project.xp || 100} XP Didapatkan. Lencana baru telah terbuka. 🎉`);
            renderOverview();
            renderGrid();
            renderWorkspace(project, false);
        });

        // Tabs click togglers
        document.querySelectorAll(".playground-tab-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                document.querySelectorAll(".playground-tab-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");

                const targetTab = btn.dataset.tab;
                document.querySelectorAll(".playground-editor-textarea").forEach(textarea => {
                    textarea.style.display = "none";
                });

                if (targetTab === "html") $("playgroundHtml").style.display = "block";
                else if (targetTab === "css") $("playgroundCss").style.display = "block";
                else if (targetTab === "js") $("playgroundJs").style.display = "block";
                else if (targetTab === "markdown") $("playgroundMarkdown").style.display = "block";

                if (typeof window.playSound === "function") {
                    try { window.playSound("click"); } catch(err){}
                }
            });
        });

        // Run sandbox button
        $("runPlayground").addEventListener("click", () => {
            runPlaygroundSandbox(project);
            setSaveStatus("Menyimpan...");
            saveWorkspace(project, false);
            if (typeof window.playSound === "function") {
                try { window.playSound("click"); } catch(err){}
            }
        });

        $("downloadPlayground").addEventListener("click", () => {
            window.ProjectFeatures.downloadProject(project, workspaceDraft(project).files);
            toast(project.editorType === "markdown" ? "README berhasil diunduh." : "Proyek HTML berhasil diunduh.");
        });

        $("resetPlayground").addEventListener("click", () => {
            if (!window.confirm("Kembalikan kode proyek ke template awal? Perubahan kode saat ini akan diganti.")) return;
            if (project.editorType === "web") {
                $("playgroundHtml").value = project.files.html;
                $("playgroundCss").value = project.files.css;
                $("playgroundJs").value = project.files.js;
            } else {
                $("playgroundMarkdown").value = project.files.markdown;
            }
            runPlaygroundSandbox(project);
            saveWorkspace(project, false);
            toast("Kode dikembalikan ke template awal.");
        });
    }


    function openProject(id) {
        const project = projects.find(item => item.id === id);
        if (!project) return;
        state.selectedProjectId = id;
        persist();
        history.replaceState({}, "", `projects.html?project=${encodeURIComponent(id)}#projectWorkspace`);
        renderWorkspace(project);
    }

    /* ═══════════════════════════════════════════════════════════
       SCROLL REVEAL — Intersection Observer
       ═══════════════════════════════════════════════════════════ */
    function setupScrollReveal() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("revealed");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });

        document.querySelectorAll(".reveal-on-scroll").forEach(el => observer.observe(el));
    }

    /* ═══════════════════════════════════════════════════════════
       3D TILT — Overview Panel Mouse Follow
       ═══════════════════════════════════════════════════════════ */
    function setup3DTilt() {
        const panel = document.querySelector(".project-overview");
        if (!panel || window.matchMedia("(max-width: 960px)").matches) return;

        panel.addEventListener("mousemove", (e) => {
            const rect = panel.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            panel.style.transform = `perspective(1000px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
        });

        panel.addEventListener("mouseleave", () => {
            panel.style.transform = "perspective(1000px) rotateY(0deg) rotateX(0deg)";
        });
    }

    function bindPage() {
        $("projectFilters").addEventListener("click", event => {
            const button = event.target.closest("button[data-filter]");
            if (!button) return;
            filter = button.dataset.filter;
            document.querySelectorAll("[data-filter]").forEach(item => {
                const active = item === button;
                item.classList.toggle("active", active);
                item.setAttribute("aria-pressed", String(active));
            });
            renderGrid();
            if (typeof window.playSound === "function") {
                try { window.playSound("click"); } catch(err){}
            }
        });

        $("projectGrid").addEventListener("click", event => {
            const button = event.target.closest("[data-open-project]");
            if (button) openProject(button.dataset.openProject);
        });

        $("projectSearch").addEventListener("input", event => {
            searchQuery = event.target.value;
            renderGrid();
        });

        $("projectStatusFilter").addEventListener("change", event => {
            statusFilter = event.target.value;
            renderGrid();
        });

        $("projectSort").addEventListener("change", event => {
            projectSort = event.target.value;
            renderGrid();
        });

        // Listen for console outputs from iframe
        window.addEventListener("message", event => {
            if (event.data?.type === "sandbox-log") {
                const consoleEl = $("playgroundConsole");
                if (consoleEl) {
                    consoleEl.textContent += (consoleEl.textContent.trim() ? "\n" : "") + "> " + event.data.message;
                    consoleEl.scrollTop = consoleEl.scrollHeight;
                }
            } else if (event.data?.type === "sandbox-error") {
                const consoleEl = $("playgroundConsole");
                if (consoleEl) {
                    consoleEl.textContent += (consoleEl.textContent.trim() ? "\n" : "") + "[Error] " + event.data.message;
                    consoleEl.scrollTop = consoleEl.scrollHeight;
                }
            }
        });
    }

    function init() {
        renderOverview();
        renderGrid();
        bindPage();
        setupScrollReveal();
        setup3DTilt();

        const id = new URLSearchParams(location.search).get("project");
        const project = projects.find(item => item.id === id);
        if (project) renderWorkspace(project);
        else if (id) history.replaceState({}, "", "projects.html#projectCatalog");
    }
    init();
})();
(() => {
    "use strict";

    const normalize = value => String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase("id-ID")
        .trim();

    function searchableText(project) {
        return [
            project.title,
            project.summary,
            project.outcome,
            project.level,
            project.category,
            ...(project.skills || [])
        ].map(normalize).join(" ");
    }

    function selectProjects(projects, options = {}) {
        const query = normalize(options.query);
        const category = options.category || "all";
        const status = options.status || "all";
        const recordFor = options.recordFor || (() => ({ status: "not_started" }));
        const sort = options.sort || "recommended";

        const selected = projects.filter(project => {
            const record = recordFor(project.id);
            const categoryMatch = category === "all" || project.category === category;
            const statusMatch = status === "all" || record.status === status;
            const queryMatch = !query || searchableText(project).includes(query);
            return categoryMatch && statusMatch && queryMatch;
        });

        return selected.sort((a, b) => {
            if (sort === "xp-desc") return b.xp - a.xp;
            if (sort === "time-asc") return parseInt(a.time, 10) - parseInt(b.time, 10);
            if (sort === "title") return a.title.localeCompare(b.title, "id");
            if (sort === "progress") {
                const score = project => {
                    const record = recordFor(project.id);
                    if (record.status === "completed") return 2;
                    if (record.status === "in_progress") return 1;
                    return 0;
                };
                return score(b) - score(a);
            }
            return projects.indexOf(a) - projects.indexOf(b);
        });
    }

    function downloadProject(project, files) {
        const isMarkdown = project.editorType === "markdown";
        const content = isMarkdown
            ? files.markdown || ""
            : `<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${project.title}</title>
  <style>${files.css || ""}</style>
</head>
<body>
${files.html || ""}
<script>${files.js || ""}<\/script>
</body>
</html>`;
        const blob = new Blob([content], { type: isMarkdown ? "text/markdown" : "text/html" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = isMarkdown ? "README.md" : `${project.id}.html`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    window.ProjectFeatures = Object.freeze({
        selectProjects,
        downloadProject
    });
})();
