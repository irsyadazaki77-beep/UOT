(() => {
    "use strict";

    const SESSION_KEY = "eduquestUserSession";
    const SUBSCRIPTION_KEY = "eduquestSubscription";

    const $ = id => document.getElementById(id);

    // Initializations
    let currentMethod = "card";
    let qrisTimer = null;
    let selectedWallet = "";

    const cardNumInput = $("cardNumberInput");
    const cardHolderInput = $("cardHolderInput");
    const cardExpiryInput = $("cardExpiryInput");
    const cardCvvInput = $("cardCvvInput");
    const cardBrandIcon = $("cardBrandIcon");

    function readJSON(key, fallback) {
        try {
            return JSON.parse(localStorage.getItem(key) || "null") ?? fallback;
        } catch {
            return fallback;
        }
    }

    function applyTheme() {
        const dark = localStorage.getItem("eduquest_theme") === "dark";
        document.body.classList.toggle("dark-theme", dark);
        const themeBtn = $("themeToggleBtn");
        if (themeBtn) {
            themeBtn.innerHTML = dark ? "&#9728;" : "&#127769;";
        }
    }

    function initUserSession() {
        const session = readJSON(SESSION_KEY, null);
        if (session && session.isLoggedIn) {
            $("sessionUsername").textContent = session.username || "Pengguna Universe";
            if ($("sessionEmail")) {
                $("sessionEmail").textContent = session.email || "nama@email.com";
            }
            if (cardHolderInput) {
                const upperName = (session.username || "").toUpperCase();
                if (upperName) {
                    cardHolderInput.value = upperName;
                }
            }
        } else {
            $("sessionUsername").textContent = "Tamu (Belum Masuk)";
            if ($("sessionEmail")) {
                $("sessionEmail").textContent = "Masuk untuk mensinkronkan akun";
            }
        }
    }

    // Tabs Switching
    document.querySelectorAll(".stripe-tab-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const method = btn.dataset.method;
            if (method === currentMethod) return;

            // Toggle active classes on tabs
            document.querySelectorAll(".stripe-tab-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            // Toggle panels
            document.querySelectorAll(".stripe-panel").forEach(p => p.classList.remove("active"));
            $(`panel-${method}`).classList.add("active");

            currentMethod = method;

            // Sound feedback
            if (typeof playSound === "function") {
                playSound("click");
            }

            // QRIS timer triggers
            if (method === "qris") {
                startQrisTimer();
            } else {
                stopQrisTimer();
            }

            // Update Pay Button Label
            updatePayButtonLabel();
        });
    });

    // Credit Card brand detection & formatting
    if (cardNumInput) {
        cardNumInput.addEventListener("input", e => {
            // Remove non-digits
            let value = e.target.value.replace(/\D/g, "");
            
            // Card Brand Detection
            if (value.startsWith("4")) {
                cardBrandIcon.className = "card-brand-icon visa";
                cardBrandIcon.innerHTML = '<i class="fa-brands fa-cc-visa"></i>';
            } else if (value.startsWith("5")) {
                cardBrandIcon.className = "card-brand-icon mastercard";
                cardBrandIcon.innerHTML = '<i class="fa-brands fa-cc-mastercard"></i>';
            } else {
                cardBrandIcon.className = "card-brand-icon";
                cardBrandIcon.innerHTML = '<i class="fa-solid fa-credit-card"></i>';
            }

            // Format with space every 4 digits
            let formatted = value.match(/.{1,4}/g)?.join(" ") || "";
            e.target.value = formatted;
        });
    }

    if (cardExpiryInput) {
        cardExpiryInput.addEventListener("input", e => {
            let value = e.target.value.replace(/\D/g, "");
            if (value.length > 2) {
                value = value.slice(0, 2) + " / " + value.slice(2, 4);
            }
            e.target.value = value;
        });
    }

    if (cardCvvInput) {
        cardCvvInput.addEventListener("input", e => {
            e.target.value = e.target.value.replace(/\D/g, "").slice(0, 3);
        });
    }

    // QRIS Timer implementation
    function startQrisTimer() {
        stopQrisTimer();
        let totalSecs = 300; // 5 minutes
        const timerDisplay = $("qrisCountdown");

        if (!timerDisplay) return;

        timerDisplay.textContent = "05:00";
        qrisTimer = setInterval(() => {
            totalSecs--;
            if (totalSecs <= 0) {
                stopQrisTimer();
                timerDisplay.textContent = "KODE KEDALUWARSA";
                return;
            }
            const mins = String(Math.floor(totalSecs / 60)).padStart(2, "0");
            const secs = String(totalSecs % 60).padStart(2, "0");
            timerDisplay.textContent = `${mins}:${secs}`;
        }, 1000);
    }

    function stopQrisTimer() {
        if (qrisTimer) {
            clearInterval(qrisTimer);
            qrisTimer = null;
        }
    }

    // E-Wallet Selector implementation
    document.querySelectorAll(".wallet-stripe-btn").forEach(opt => {
        opt.addEventListener("click", () => {
            document.querySelectorAll(".wallet-stripe-btn").forEach(o => o.classList.remove("active"));
            opt.classList.add("active");
            selectedWallet = opt.dataset.wallet;

            if (typeof playSound === "function") {
                playSound("click");
            }
            updatePayButtonLabel();
        });
    });

    function updatePayButtonLabel() {
        const btnText = $("payNowBtn").querySelector(".btn-text");
        if (!btnText) return;

        if (currentMethod === "wallet" && selectedWallet) {
            const walletName = selectedWallet.charAt(0).toUpperCase() + selectedWallet.slice(1);
            btnText.textContent = `Bayar Sekarang dengan ${walletName} (Rp 0)`;
        } else if (currentMethod === "qris") {
            btnText.textContent = "Konfirmasi Pembayaran QRIS (Rp 0)";
        } else {
            btnText.textContent = "Bayar Sekarang Rp 0";
        }
    }

    // Process payment simulation
    $("payNowBtn").addEventListener("click", () => {
        // Validation check
        if (currentMethod === "card") {
            if (!cardNumInput.value || !cardHolderInput.value || !cardExpiryInput.value || !cardCvvInput.value) {
                alert("Mohon lengkapi seluruh kolom informasi kartu kredit.");
                return;
            }
            // Length of formatted card is 19 characters (16 digits + 3 spaces)
            if (cardNumInput.value.replace(/\s/g, "").length < 16) {
                alert("Nomor kartu kredit harus 16 digit.");
                return;
            }
            if (cardExpiryInput.value.replace(/\s/g, "").length < 5) {
                alert("Tanggal validitas kartu tidak lengkap.");
                return;
            }
            if (cardCvvInput.value.length < 3) {
                alert("CVV/CVC kartu tidak lengkap.");
                return;
            }
        } else if (currentMethod === "wallet") {
            if (!selectedWallet) {
                alert("Mohon pilih salah satu e-wallet Anda.");
                return;
            }
        }

        // Show spinner / loading state
        const payBtn = $("payNowBtn");
        const btnText = payBtn.querySelector(".btn-text");
        const btnSpinner = payBtn.querySelector(".btn-spinner");

        payBtn.disabled = true;
        btnText.setAttribute("hidden", "");
        btnSpinner.removeAttribute("hidden");

        if (typeof playSound === "function") {
            playSound("click");
        }

        // Simulate secure bank verification delay
        setTimeout(() => {
            // Activate Pro subscription state
            localStorage.setItem(SUBSCRIPTION_KEY, "pro");

            // Play success alert audio
            if (typeof playSound === "function") {
                playSound("success");
            }

            // Set success modal details
            const successMethodLabel = $("successPaymentMethod");
            if (currentMethod === "card") {
                successMethodLabel.textContent = "Kartu Kredit/Debit";
            } else if (currentMethod === "qris") {
                successMethodLabel.textContent = "QRIS (GPN)";
            } else if (currentMethod === "wallet") {
                const walletName = selectedWallet.charAt(0).toUpperCase() + selectedWallet.slice(1);
                successMethodLabel.textContent = `E-Wallet (${walletName})`;
            }

            // Generate a random mock invoice number
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, "0");
            const date = String(now.getDate()).padStart(2, "0");
            const randomSuffix = Math.floor(1000 + Math.random() * 9000);
            $("receiptInvoiceNum").textContent = `#UOT-${year}${month}${date}-${randomSuffix}`;

            // Generate formatting for date time
            const monthsIndo = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
            const timeStr = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
            $("receiptDateTime").textContent = `${date} ${monthsIndo[now.getMonth()]} ${year}, ${timeStr}`;

            // Open Success Modal
            const modal = $("successModal");
            modal.classList.add("open");
            modal.setAttribute("aria-hidden", "false");

            // Reset loading state
            payBtn.disabled = false;
            btnText.removeAttribute("hidden");
            btnSpinner.setAttribute("hidden", "");
        }, 1800);
    });

    // Success Modal redirects
    $("redirectBackBtn").addEventListener("click", () => {
        if (typeof playSound === "function") {
            playSound("click");
        }
        window.location.href = "profile.html";
    });

    // Theme Toggle listener if exists
    const themeBtn = $("themeToggleBtn");
    if (themeBtn) {
        themeBtn.addEventListener("click", () => {
            const dark = !document.body.classList.contains("dark-theme");
            localStorage.setItem("eduquest_theme", dark ? "dark" : "light");
            applyTheme();
            if (typeof playSound === "function") {
                playSound("click");
            }
        });
    }

    // Init actions
    applyTheme();
    initUserSession();

})();
