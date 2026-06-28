(() => {
    "use strict";

    // Toast Timer variable
    let toastTimer = null;

    // Toast Helper
    function showToast(message, tone = "") {
        const toast = document.getElementById("quizToast");
        if (!toast) return;
        window.clearTimeout(toastTimer);
        toast.textContent = message;
        toast.className = `quiz-toast${tone ? ` ${tone}` : ""}`;
        requestAnimationFrame(() => toast.classList.add("show"));
        toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2800);
    }

    // Play Sound Wrapper
    function playAuthSound(soundName) {
        if (typeof playSound === "function") {
            try {
                playSound(soundName);
            } catch (e) {
                console.warn("playSound failed:", e);
            }
        }
    }

    // Helper to shake inputs
    function shakeElement(element) {
        element.classList.add("shake-input");
        element.focus();
        setTimeout(() => element.classList.remove("shake-input"), 350);
    }

    function setFieldState(input, message = "") {
        const error = document.getElementById(`${input.id}Error`);
        input.classList.toggle("is-invalid", Boolean(message));
        input.classList.toggle("is-valid", !message && Boolean(input.value.trim()));
        input.setAttribute("aria-invalid", String(Boolean(message)));
        if (error) error.textContent = message;
        return !message;
    }

    function isValidEmail(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
    }

    function setButtonLoading(button, loading, loadingText) {
        if (!button) return;
        const label = button.querySelector(".button-label");
        const icon = button.querySelector("i");
        if (!button.dataset.defaultLabel && label) button.dataset.defaultLabel = label.textContent;
        button.disabled = loading;
        button.classList.toggle("is-loading", loading);
        if (label) label.textContent = loading ? loadingText : button.dataset.defaultLabel;
        if (icon) icon.className = loading ? "fa-solid fa-circle-notch" : "fa-solid fa-arrow-right";
    }

    function getPasswordStrength(value) {
        if (!value) return 0;
        let score = value.length >= 6 ? 1 : 0;
        if (value.length >= 10) score++;
        if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++;
        if (/\d/.test(value) && /[^A-Za-z0-9]/.test(value)) score++;
        return Math.min(score, 4);
    }

    function initPagePreferences() {
        const themeButton = document.getElementById("themeToggleBtn");
        const soundButton = document.getElementById("soundToggleBtn");
        const savedTheme = localStorage.getItem("eduquest_theme") || "light";

        function applyTheme(isDark) {
            document.body.classList.toggle("dark-theme", isDark);
            if (!themeButton) return;
            themeButton.textContent = isDark ? "☀️" : "🌙";
            themeButton.setAttribute("aria-pressed", String(isDark));
            themeButton.setAttribute("aria-label", isDark ? "Aktifkan tema terang" : "Aktifkan tema gelap");
        }

        applyTheme(savedTheme === "dark");
        themeButton?.addEventListener("click", () => {
            const isDark = !document.body.classList.contains("dark-theme");
            applyTheme(isDark);
            localStorage.setItem("eduquest_theme", isDark ? "dark" : "light");
            playAuthSound("click");
        });

        if (soundButton && typeof soundEnabled !== "undefined") {
            soundEnabled = localStorage.getItem("eduquest_sound") !== "off";
            const syncSoundButton = () => {
                soundButton.textContent = soundEnabled ? "🔊" : "🔇";
                soundButton.setAttribute("aria-pressed", String(soundEnabled));
                soundButton.setAttribute("aria-label", soundEnabled ? "Nonaktifkan suara" : "Aktifkan suara");
            };
            syncSoundButton();
            soundButton.addEventListener("click", () => {
                soundEnabled = !soundEnabled;
                localStorage.setItem("eduquest_sound", soundEnabled ? "on" : "off");
                syncSoundButton();
                if (soundEnabled) playAuthSound("click");
            });
        }
    }

    // Sync Username to LMS
    function syncUserToLms(username) {
        try {
            const LMS_KEY = "eduquestLmsProgress";
            let progress = JSON.parse(localStorage.getItem(LMS_KEY) || "{}");
            
            // Set defaults if empty
            progress.completedLectures ||= [];
            progress.quizScores ||= {};
            progress.unlockedBadges ||= [];
            progress.userName = username;

            localStorage.setItem(LMS_KEY, JSON.stringify(progress));
        } catch (e) {
            console.error("LMS Username Sync failed:", e);
        }
    }

    // Initialize Page Controls
    function initLoginAndRegister() {
        const tabLogin = document.getElementById("tabLoginBtn");
        const tabRegister = document.getElementById("tabRegisterBtn");
        const slider = document.getElementById("formSliderWrapper");
        const cardTitle = document.getElementById("loginCardTitle");
        const cardDesc = document.getElementById("loginCardDesc");
        const eyebrow = document.getElementById("loginEyebrow");
        const windowLogin = document.getElementById("windowLogin");
        const windowRegister = document.getElementById("windowRegister");

        const formLogin = document.getElementById("formLogin");
        const formRegister = document.getElementById("formRegister");

        if (!tabLogin || !tabRegister || !slider) return;

        // --- 1. Tab Switching & Slide Animation ---
        function switchToLogin() {
            playAuthSound("click");
            tabLogin.classList.add("active");
            tabLogin.setAttribute("aria-selected", "true");
            tabLogin.tabIndex = 0;
            tabRegister.classList.remove("active");
            tabRegister.setAttribute("aria-selected", "false");
            tabRegister.tabIndex = -1;
            
            slider.style.transform = "";
            eyebrow.textContent = "Selamat datang kembali";
            cardTitle.textContent = "Masuk ke akunmu";
            cardDesc.textContent = "Lanjutkan progres dan aktivitas belajar yang tersimpan.";
            
            windowLogin.hidden = false;
            windowRegister.hidden = true;
        }

        function switchToRegister() {
            playAuthSound("click");
            tabRegister.classList.add("active");
            tabRegister.setAttribute("aria-selected", "true");
            tabRegister.tabIndex = 0;
            tabLogin.classList.remove("active");
            tabLogin.setAttribute("aria-selected", "false");
            tabLogin.tabIndex = -1;
            
            slider.style.transform = "";
            eyebrow.textContent = "Mulai perjalanan baru";
            cardTitle.textContent = "Buat akun gratis";
            cardDesc.textContent = "Simpan progres, raih XP, dan selesaikan jalur belajarmu.";
            
            windowRegister.hidden = false;
            windowLogin.hidden = true;
        }

        tabLogin.addEventListener("click", switchToLogin);
        tabRegister.addEventListener("click", switchToRegister);
        [tabLogin, tabRegister].forEach(tab => {
            tab.addEventListener("keydown", event => {
                if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
                event.preventDefault();
                const target = tab === tabLogin ? tabRegister : tabLogin;
                target.click();
                target.focus();
            });
        });

        // --- 2. Password Visibility Toggle ---
        document.querySelectorAll(".pass-toggle-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                playAuthSound("click");
                const input = btn.closest(".input-wrapper")?.querySelector("input");
                const icon = btn.querySelector("i");
                if (!input || !icon) return;
                if (input.type === "password") {
                    input.type = "text";
                    icon.className = "fa-regular fa-eye";
                    btn.setAttribute("aria-label", "Sembunyikan kata sandi");
                } else {
                    input.type = "password";
                    icon.className = "fa-regular fa-eye-slash";
                    btn.setAttribute("aria-label", "Tampilkan kata sandi");
                }
            });
        });

        const rememberedEmail = localStorage.getItem("eduquestRememberedEmail") || "";
        const rememberedInput = document.getElementById("loginEmail");
        const rememberCheckbox = document.getElementById("loginRemember");
        if (rememberedEmail && rememberedInput && rememberCheckbox) {
            rememberedInput.value = rememberedEmail;
            rememberCheckbox.checked = true;
        }

        const validators = {
            loginEmail: input => isValidEmail(input.value) ? "" : "Masukkan alamat email yang valid.",
            loginPassword: input => input.value.length >= 6 ? "" : "Kata sandi minimal 6 karakter.",
            registerName: input => input.value.trim().length >= 2 ? "" : "Nama lengkap minimal 2 karakter.",
            registerEmail: input => isValidEmail(input.value) ? "" : "Masukkan alamat email yang valid.",
            registerPassword: input => input.value.length >= 6 ? "" : "Kata sandi minimal 6 karakter.",
            registerConfirmPassword: input => input.value === document.getElementById("registerPassword").value && input.value.length >= 6
                ? ""
                : "Konfirmasi kata sandi belum cocok."
        };

        Object.entries(validators).forEach(([id, validator]) => {
            const input = document.getElementById(id);
            input?.addEventListener("blur", () => setFieldState(input, validator(input)));
            input?.addEventListener("input", () => {
                if (input.classList.contains("is-invalid")) setFieldState(input, validator(input));
            });
        });

        const registerPassword = document.getElementById("registerPassword");
        const passwordStrength = document.getElementById("passwordStrength");
        const passwordStrengthText = document.getElementById("passwordStrengthText");
        registerPassword?.addEventListener("input", () => {
            const level = getPasswordStrength(registerPassword.value);
            const labels = [
                "Gunakan huruf, angka, dan simbol agar lebih kuat.",
                "Masih lemah, tambahkan karakter lain.",
                "Cukup, tetapi masih bisa diperkuat.",
                "Bagus, kombinasi kata sandi cukup kuat.",
                "Sangat kuat dan sulit ditebak."
            ];
            passwordStrength.dataset.level = String(level);
            passwordStrengthText.textContent = labels[level];
        });

        // --- 3. Form Login Submission ---
        formLogin.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const emailInput = document.getElementById("loginEmail");
            const passInput = document.getElementById("loginPassword");
            const submitButton = document.getElementById("loginSubmitBtn");
            
            const emailVal = emailInput.value.trim();
            const passVal = passInput.value.trim();

            if (emailVal === "developer" && passVal === "admin123") {
                setButtonLoading(submitButton, true, "Mengaktifkan mode Developer...");
                playAuthSound("success");
                
                // Set Pro subscription
                localStorage.setItem("eduquestSubscription", "pro");

                // Set fully unlocked RPG state
                const devRpg = {
                    level: 7,
                    xp: 12000,
                    totalXp: 12000,
                    avatar: "🧙‍♂️",
                    nickname: "Developer",
                    achievements: [
                        'first_step', 'drill_champion', 'sandbox_hacker', 'sql_master', 
                        'security_expert', 'sqli_hacker', 'level_legend', 'pro_badge'
                    ]
                };
                localStorage.setItem("eduquestRPG", JSON.stringify(devRpg));

                // Set fully unlocked LMS state
                const devLms = {
                    completedLectures: [
                        "web-dev_html-semantic", "web-dev_css-grid-flex", "web-dev_js-dom",
                        "database-sql_rdbms-basics", "database-sql_sql-join",
                        "cyber-ui_uiux-principles", "cyber-ui_cyber-auth",
                        "agile-scrum_product-lifecycle", "agile-scrum_agile-scrum"
                    ],
                    quizScores: {
                        "web-dev_html-semantic_practice": 100,
                        "web-dev_html-semantic_challenge": 100,
                        "web-dev_css-grid-flex_practice": 100,
                        "web-dev_css-grid-flex_challenge": 100,
                        "web-dev_js-dom_practice": 100,
                        "web-dev_js-dom_challenge": 100,
                        "database-sql_rdbms-basics_practice": 100,
                        "database-sql_rdbms-basics_challenge": 100,
                        "database-sql_sql-join_practice": 100,
                        "database-sql_sql-join_challenge": 100,
                        "cyber-ui_uiux-principles_practice": 100,
                        "cyber-ui_uiux-principles_challenge": 100,
                        "cyber-ui_cyber-auth_practice": 100,
                        "cyber-ui_cyber-auth_challenge": 100,
                        "agile-scrum_product-lifecycle_practice": 100,
                        "agile-scrum_product-lifecycle_challenge": 100,
                        "agile-scrum_agile-scrum_practice": 100,
                        "agile-scrum_agile-scrum_challenge": 100
                    },
                    unlockedBadges: ["web-dev", "database-sql", "cyber-ui", "agile-scrum"],
                    userName: "Developer"
                };
                localStorage.setItem("eduquestLmsProgress", JSON.stringify(devLms));

                const sessionData = {
                    username: "Developer",
                    email: "developer@uot.edu",
                    avatar: "🧙‍♂️",
                    isLoggedIn: true,
                    isDeveloper: true
                };
                localStorage.setItem("eduquestUserSession", JSON.stringify(sessionData));

                showToast("Mode Developer diaktifkan! Semua fitur berhasil dibuka.", "success");
                setTimeout(() => {
                    window.location.href = "quiz.html";
                }, 1200);
                return;
            }

            if (!setFieldState(emailInput, validators.loginEmail(emailInput))) {
                playAuthSound("laser");
                showToast("Periksa kembali alamat emailmu.", "warning");
                shakeElement(emailInput);
                return;
            }

            if (!setFieldState(passInput, validators.loginPassword(passInput))) {
                playAuthSound("laser");
                showToast("Kata sandi belum memenuhi ketentuan.", "warning");
                shakeElement(passInput);
                return;
            }

            setButtonLoading(submitButton, true, "Menyiapkan akun...");
            // Successfully Logged In
            playAuthSound("success");
            
            // Extract display name from email (mocking name)
            const mockUsername = emailInput.value.split("@")[0];
            const cleanName = mockUsername.charAt(0).toUpperCase() + mockUsername.slice(1);
            
            const sessionData = {
                username: cleanName,
                email: emailInput.value.trim(),
                avatar: "👨‍💻",
                isLoggedIn: true
            };

            localStorage.setItem("eduquestUserSession", JSON.stringify(sessionData));
            if (rememberCheckbox.checked) {
                localStorage.setItem("eduquestRememberedEmail", emailInput.value.trim());
            } else {
                localStorage.removeItem("eduquestRememberedEmail");
            }
            syncUserToLms(cleanName);

            // Sync with RPG Engine
            if (typeof loadRPG === "function") {
                loadRPG();
            }

            showToast(`Selamat datang kembali, ${cleanName}!`, "success");
            
            setTimeout(() => {
                window.location.href = "quiz.html";
            }, 1200);
        });

        // --- 4. Form Register Submission ---
        formRegister.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const nameInput = document.getElementById("registerName");
            const emailInput = document.getElementById("registerEmail");
            const passInput = document.getElementById("registerPassword");
            const confirmInput = document.getElementById("registerConfirmPassword");
            const termsInput = document.getElementById("registerTerms");
            const termsError = document.getElementById("registerTermsError");
            const submitButton = document.getElementById("registerSubmitBtn");

            if (!setFieldState(nameInput, validators.registerName(nameInput))) {
                playAuthSound("laser");
                showToast("Lengkapi nama untuk akunmu.", "warning");
                shakeElement(nameInput);
                return;
            }

            if (!setFieldState(emailInput, validators.registerEmail(emailInput))) {
                playAuthSound("laser");
                showToast("Periksa kembali alamat emailmu.", "warning");
                shakeElement(emailInput);
                return;
            }

            if (!setFieldState(passInput, validators.registerPassword(passInput))) {
                playAuthSound("laser");
                showToast("Kata sandi belum memenuhi ketentuan.", "warning");
                shakeElement(passInput);
                return;
            }

            if (!setFieldState(confirmInput, validators.registerConfirmPassword(confirmInput))) {
                playAuthSound("laser");
                showToast("Konfirmasi kata sandi belum cocok.", "warning");
                shakeElement(confirmInput);
                return;
            }

            if (!termsInput.checked) {
                termsError.textContent = "Persetujuan diperlukan untuk membuat akun.";
                playAuthSound("laser");
                showToast("Setujui ketentuan untuk melanjutkan.", "warning");
                termsInput.focus();
                return;
            }
            termsError.textContent = "";
            setButtonLoading(submitButton, true, "Membuat akun...");

            // Successfully Registered
            playAuthSound("success");

            const sessionData = {
                username: nameInput.value.trim(),
                email: emailInput.value.trim(),
                avatar: "🚀",
                isLoggedIn: true
            };

            localStorage.setItem("eduquestUserSession", JSON.stringify(sessionData));
            syncUserToLms(nameInput.value.trim());

            // Give +25 XP Bonus for registration!
            if (typeof addXp === "function") {
                try {
                    loadRPG();
                    addXp(25);
                    // trigger floating notification inside login page
                    showToast("Bonus pendaftaran: +25 XP Coder RPG!", "success");
                } catch (rpgErr) {
                    console.warn("Could not award registration XP:", rpgErr);
                }
            }

            showToast("Akun berhasil dibuat. Menyiapkan ruang belajar...", "success");

            setTimeout(() => {
                window.location.href = "quiz.html";
            }, 1500);
        });

        // --- 5. Social Mock Logins ---
        document.getElementById("socialGoogleBtn")?.addEventListener("click", () => {
            playAuthSound("success");
            const mockUser = {
                username: "Google Scholar",
                email: "google.scholar@uot.edu",
                avatar: "🎓",
                isLoggedIn: true
            };
            localStorage.setItem("eduquestUserSession", JSON.stringify(mockUser));
            syncUserToLms("Google Scholar");
            showToast("Masuk via Google Sukses!", "success");
            setTimeout(() => window.location.href = "quiz.html", 1000);
        });

        document.getElementById("socialGithubBtn")?.addEventListener("click", () => {
            playAuthSound("success");
            const mockUser = {
                username: "Git Committer",
                email: "git.committer@uot.edu",
                avatar: "👾",
                isLoggedIn: true
            };
            localStorage.setItem("eduquestUserSession", JSON.stringify(mockUser));
            syncUserToLms("Git Committer");
            showToast("Masuk via GitHub Sukses!", "success");
            setTimeout(() => window.location.href = "quiz.html", 1000);
        });

        document.getElementById("forgotPasswordLink")?.addEventListener("click", event => {
            event.preventDefault();
            playAuthSound("click");
            showToast("Pemulihan sandi belum terhubung ke server pada versi demo.", "warning");
        });

        ["termsLink", "privacyLink"].forEach(id => {
            document.getElementById(id)?.addEventListener("click", event => {
                event.preventDefault();
                playAuthSound("click");
                showToast("Dokumen kebijakan sedang disiapkan untuk versi publik.", "warning");
            });
        });

        document.getElementById("registerTerms")?.addEventListener("change", event => {
            if (event.target.checked) document.getElementById("registerTermsError").textContent = "";
        });
    }

    // --- 6. Handle Logout Action ---
    function checkLogoutAction() {
        const params = new URLSearchParams(window.location.search);
        if (params.get("logout") === "1") {
            // Check if developer session
            let isDev = false;
            try {
                const session = JSON.parse(localStorage.getItem("eduquestUserSession") || "null");
                if (session && (session.isDeveloper || session.username === "Developer")) {
                    isDev = true;
                }
            } catch (e) {
                console.warn(e);
            }

            // Remove User Session and Subscription status
            localStorage.removeItem("eduquestUserSession");
            localStorage.removeItem("eduquestSubscription");
            
            // Clear developer bypass data if it was a developer session
            if (isDev) {
                localStorage.removeItem("eduquestRPG");
                localStorage.removeItem("eduquestLmsProgress");
            }
            
            // Sync/Reset LMS Username to default
            try {
                const LMS_KEY = "eduquestLmsProgress";
                let progress = JSON.parse(localStorage.getItem(LMS_KEY) || "{}");
                progress.userName = "Developer Indonesia";
                localStorage.setItem(LMS_KEY, JSON.stringify(progress));
            } catch (e) {
                console.warn(e);
            }

            playAuthSound("laser");
            showToast("Anda telah keluar dari sesi.", "warning");

            // Clean up url
            window.history.replaceState({}, "", window.location.pathname);
        }
    }

    // Initialize Page
    function init() {
        initPagePreferences();
        initLoginAndRegister();
        checkLogoutAction();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init, { once: true });
    } else {
        init();
    }
})();
