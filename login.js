(() => {
    "use strict";

    const Account = window.QuizNationAccount;
    const destination = () => Account?.getReturnTo("learning-journey.html") || "learning-journey.html";

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
            registerPassword: input => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(input.value) ? "" : "Kata sandi minimal 8 karakter (harus ada huruf besar, kecil, dan angka).",
            registerConfirmPassword: input => input.value === document.getElementById("registerPassword").value && /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(input.value)
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
        formLogin.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const emailInput = document.getElementById("loginEmail");
            const passInput = document.getElementById("loginPassword");
            const submitButton = document.getElementById("loginSubmitBtn");
            const rememberCheckbox = document.getElementById("loginRemember");
            
            const emailVal = emailInput.value.trim();
            const passVal = passInput.value.trim();

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

            setButtonLoading(submitButton, true, "Menghubungkan ke server...");

            try {
                let userObj = null;
                if (window.QuizNationAPI) {
                    try {
                        const serverRes = await window.QuizNationAPI.loginUser({
                            email: emailVal,
                            password: passVal
                        });
                        if (serverRes && serverRes.ok && serverRes.user) {
                            userObj = {
                                ...serverRes.user,
                                isLoggedIn: true
                            };
                        }
                    } catch (apiErr) {
                        setButtonLoading(submitButton, false);
                        playAuthSound("laser");
                        showToast(apiErr.message || "Email atau kata sandi tidak valid.", "warning");
                        shakeElement(passInput);
                        return;
                    }
                }

                if (!userObj) {
                    setButtonLoading(submitButton, false);
                    playAuthSound("laser");
                    showToast("Server autentikasi tidak dapat dijangkau.", "warning");
                    return;
                }

                playAuthSound("success");
                Account?.signIn(userObj) || localStorage.setItem("eduquestUserSession", JSON.stringify(userObj));
                if (rememberCheckbox?.checked) {
                    localStorage.setItem("eduquestRememberedEmail", emailVal);
                } else {
                    localStorage.removeItem("eduquestRememberedEmail");
                }
                syncUserToLms(userObj.username);

                if (typeof loadRPG === "function") {
                    loadRPG();
                }

                showToast(`Selamat datang kembali, ${userObj.username}!`, "success");
                setTimeout(() => {
                    window.location.href = destination();
                }, 900);
            } catch (err) {
                setButtonLoading(submitButton, false);
                playAuthSound("laser");
                showToast(err.message || "Gagal masuk ke akun.", "warning");
            }
        });

        // --- 4. Form Register Submission ---
        formRegister.addEventListener("submit", async (e) => {
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
                showToast("Kata sandi minimal 8 karakter (harus mengandung huruf besar, kecil, dan angka).", "warning");
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
            setButtonLoading(submitButton, true, "Mendaftarkan akun...");

            try {
                let userObj = null;
                if (window.QuizNationAPI) {
                    try {
                        const serverRes = await window.QuizNationAPI.registerUser({
                            username: nameInput.value.trim(),
                            email: emailInput.value.trim(),
                            password: passInput.value.trim()
                        });
                        if (serverRes && serverRes.ok && serverRes.user) {
                            userObj = {
                                ...serverRes.user,
                                isLoggedIn: true
                            };
                        }
                    } catch (apiErr) {
                        setButtonLoading(submitButton, false);
                        playAuthSound("laser");
                        showToast(apiErr.message || "Pendaftaran gagal.", "warning");
                        shakeElement(emailInput);
                        return;
                    }
                }

                if (!userObj) {
                    setButtonLoading(submitButton, false);
                    playAuthSound("laser");
                    showToast("Server autentikasi tidak dapat dijangkau.", "warning");
                    return;
                }

                playAuthSound("success");
                Account?.signIn(userObj) || localStorage.setItem("eduquestUserSession", JSON.stringify(userObj));
                syncUserToLms(userObj.username);

                if (typeof addXp === "function") {
                    try {
                        loadRPG();
                        addXp(25);
                        showToast("Bonus pendaftaran: +25 XP Coder RPG!", "success");
                    } catch (rpgErr) {
                        console.warn("Could not award registration XP:", rpgErr);
                    }
                }

                showToast("Akun berhasil dibuat. Menyiapkan ruang belajar...", "success");
                setTimeout(() => {
                    window.location.href = destination();
                }, 1000);
            } catch (err) {
                setButtonLoading(submitButton, false);
                playAuthSound("laser");
                showToast(err.message || "Gagal membuat akun.", "warning");
            }
        });

        // --- 5. Social Mock Logins ---
        document.getElementById("socialGoogleBtn")?.addEventListener("click", () => {
            playAuthSound("click");
            showToast("Otentikasi Google OAuth belum terhubung pada server ini.", "warning");
        });

        document.getElementById("socialGithubBtn")?.addEventListener("click", () => {
            playAuthSound("click");
            showToast("Otentikasi GitHub OAuth belum terhubung pada server ini.", "warning");
        });

        document.getElementById("forgotPasswordLink")?.addEventListener("click", async event => {
            event.preventDefault();
            playAuthSound("click");
            try {
                const res = await window.QuizNationAPI?.request?.("/api/auth/forgot-password", { method: "POST" });
                showToast(res?.message || "Layanan pemulihan kata sandi via email belum dikonfigurasi.", "warning");
            } catch (err) {
                showToast(err.message || "Layanan pemulihan kata sandi via email belum dikonfigurasi pada server ini.", "warning");
            }
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
            try {
                window.QuizNationAPI?.logoutUser?.();
            } catch (_) {}
            Account?.signOut() || localStorage.removeItem("eduquestUserSession");

            playAuthSound("laser");
            showToast("Anda telah keluar dari sesi.", "warning");

            // Clean up url
            const returnTo = params.get("returnTo");
            window.history.replaceState({}, "", returnTo ? `${window.location.pathname}?returnTo=${encodeURIComponent(returnTo)}` : window.location.pathname);
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
