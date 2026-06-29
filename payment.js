(() => {
    "use strict";
 
    const SESSION_KEY = "eduquestUserSession";
    const SUBSCRIPTION_KEY = "eduquestSubscription";
 
    const $ = id => document.getElementById(id);
 
    // Plans Configuration
    const PLANS = {
        pro: {
            title: "Akselerasi Pro",
            itemName: "Universe Of Tech (Pro)",
            price: 49000,
            period: "bulan",
            desc: "Termasuk diagnosis kelemahan, Smart Review, rencana personal, simulasi, BUBUB Mentor, backup progres, dan sertifikat kompetensi."
        },
        premium: {
            title: "Akselerasi Premium",
            itemName: "Universe Of Tech (Premium)",
            price: 99000,
            period: "bulan",
            desc: "Seluruh fitur Pro ditambah sesi konsultasi video 1-on-1 mingguan dengan Mentor Senior, materi eksklusif tingkat lanjut, dan review portofolio personal."
        },
        annual: {
            title: "Akselerasi Tahunan",
            itemName: "Universe Of Tech (Annual)",
            price: 399000,
            period: "tahun",
            desc: "Hemat 30%! Akses penuh satu tahun ke semua fitur Pro, prioritas support, sertifikat fisik yang dikirim ke rumah, dan merchandise eksklusif Universe Of Tech."
        }
    };

    // State Variables
    let currentMethod = "card";
    let qrisTimer = null;
    let selectedWallet = "";
    let selectedPlan = PLANS.pro;
    let activePromo = null; // Stores { code, type, value }
 
    const cardNumInput = $("cardNumberInput");
    const cardHolderInput = $("cardHolderInput");
    const cardExpiryInput = $("cardExpiryInput");
    const cardCvvInput = $("cardCvvInput");
    const cardBrandIcon = $("cardBrandIcon");
    const cardPreview = $("creditCardPreview");
    const previewNum = $("previewCardNumber");
    const previewHolder = $("previewCardHolder");
    const previewExpiry = $("previewCardExpiry");
    const previewCvv = $("previewCardCvv");
    const previewTypeLogo = $("previewCardTypeLogo");
 
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
    }
 
    function formatRupiah(num) {
        return "Rp " + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    // Initialize Plan from URL Query
    function initPlan() {
        const urlParams = new URLSearchParams(window.location.search);
        const planParam = urlParams.get("plan");
        
        if (planParam && PLANS[planParam]) {
            selectedPlan = PLANS[planParam];
        }

        // Update UI displays
        $("planTitleDisplay").textContent = selectedPlan.title;
        $("planPriceHeader").innerHTML = `${formatRupiah(selectedPlan.price)} <span class="period" id="planPeriodHeader">/ ${selectedPlan.period}</span>`;
        $("planDescDisplay").textContent = selectedPlan.desc;
        $("planItemName").textContent = selectedPlan.itemName;
        $("planBasePriceDisplay").textContent = formatRupiah(selectedPlan.price);
        $("billSubtotal").textContent = formatRupiah(selectedPlan.price);

        // Apply default welcome discount code automatically to demonstrate promo code system
        applyPromoCode("BUBUBFREE", true);
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
                    if (previewHolder) {
                        previewHolder.textContent = upperName;
                    }
                }
            }
        } else {
            $("sessionUsername").textContent = "Tamu (Belum Masuk)";
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
            let value = e.target.value.replace(/\D/g, "");
            
            if (value.length > 16) {
                value = value.slice(0, 16);
            }
 
            let brandClass = "card-brand-icon";
            let brandLogoHTML = '<i class="fa-solid fa-credit-card"></i>';
 
            // Card Brand Detection
            if (value.startsWith("4")) {
                brandClass = "card-brand-icon visa";
                brandLogoHTML = '<i class="fa-brands fa-cc-visa"></i>';
            } else if (value.startsWith("5")) {
                brandClass = "card-brand-icon mastercard";
                brandLogoHTML = '<i class="fa-brands fa-cc-mastercard"></i>';
            }
 
            if (cardBrandIcon) {
                cardBrandIcon.className = brandClass;
                cardBrandIcon.innerHTML = brandLogoHTML;
            }
 
            if (previewTypeLogo) {
                previewTypeLogo.innerHTML = brandLogoHTML;
            }
 
            let formatted = value.match(/.{1,4}/g)?.join(" ") || "";
            e.target.value = formatted;
 
            // Sync with preview card number
            if (previewNum) {
                if (!value) {
                    previewNum.textContent = "•••• •••• •••• ••••";
                } else {
                    const dots = "••••••••••••••••";
                    const full = value + dots.substring(value.length);
                    previewNum.textContent = full.match(/.{1,4}/g).join(" ");
                }
            }
        });
    }
 
    if (cardHolderInput) {
        cardHolderInput.addEventListener("input", e => {
            const val = e.target.value.toUpperCase();
            if (previewHolder) {
                previewHolder.textContent = val || "BUBUB LEARNER";
            }
        });
    }
 
    if (cardExpiryInput) {
        cardExpiryInput.addEventListener("input", e => {
            let value = e.target.value.replace(/\D/g, "");
            if (value.length > 4) {
                value = value.slice(0, 4);
            }
 
            if (value.length > 2) {
                value = value.slice(0, 2) + " / " + value.slice(2, 4);
            }
            e.target.value = value;
 
            if (previewExpiry) {
                previewExpiry.textContent = value || "MM / YY";
            }
        });
    }
 
    if (cardCvvInput) {
        cardCvvInput.addEventListener("input", e => {
            const value = e.target.value.replace(/\D/g, "").slice(0, 3);
            e.target.value = value;
 
            if (previewCvv) {
                previewCvv.textContent = value ? "•".repeat(value.length) : "•••";
            }
        });
 
        // 3D Card flips based on CVC focus
        cardCvvInput.addEventListener("focus", () => {
            if (cardPreview) {
                cardPreview.classList.add("flipped");
            }
        });
 
        cardCvvInput.addEventListener("blur", () => {
            if (cardPreview) {
                cardPreview.classList.remove("flipped");
            }
        });
    }

    // Autofill Demo Card Details
    const demoCardBtn = $("demoCardBtn");
    if (demoCardBtn) {
        demoCardBtn.addEventListener("click", () => {
            const demoNum = "4111 2222 3333 4444";
            const demoHolder = "BUBUB DEVELOPER";
            const demoExpiry = "12/28";
            const demoCvv = "987";

            // Fill inputs with minor typewriter animation effect
            if (cardNumInput) {
                cardNumInput.value = demoNum;
                cardNumInput.dispatchEvent(new Event("input"));
            }
            if (cardHolderInput) {
                cardHolderInput.value = demoHolder;
                cardHolderInput.dispatchEvent(new Event("input"));
            }
            if (cardExpiryInput) {
                cardExpiryInput.value = demoExpiry;
                cardExpiryInput.dispatchEvent(new Event("input"));
            }
            if (cardCvvInput) {
                cardCvvInput.value = demoCvv;
                cardCvvInput.dispatchEvent(new Event("input"));
            }

            // Sound feedback
            if (typeof playSound === "function") {
                playSound("click");
            }

            // Pulse effect to show completion
            demoCardBtn.style.transform = "scale(0.95)";
            setTimeout(() => {
                demoCardBtn.style.transform = "scale(1)";
            }, 150);
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
                timerDisplay.textContent = "KEDALUWARSA";
                return;
            }
            const mins = String(Math.floor(totalSecs / 60)).padStart(2, "0");
            const secs = String(totalSecs % 60).padStart(2, "0");
            timerDisplay.textContent = `${mins}:${secs}`;
        }, 1000);
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
 
    // Promo Code Logic
    const applyPromoBtn = $("applyPromoBtn");
    const promoCodeInput = $("promoCodeInput");
    const promoFeedback = $("promoFeedback");

    function applyPromoCode(code, isAuto = false) {
        code = code.trim().toUpperCase();
        if (!code) {
            if (!isAuto) {
                showPromoFeedback("Mohon masukkan kode promo.", "error");
            }
            return;
        }

        let discountVal = 0;
        let discountLabel = "Diskon Promo";

        if (code === "BUBUBFREE") {
            discountVal = selectedPlan.price;
            activePromo = { code, type: "percent", value: 100, actual: discountVal };
            discountLabel = "Diskon Aktivasi (Free)";
        } else if (code === "DISKON50") {
            discountVal = Math.round(selectedPlan.price * 0.5);
            activePromo = { code, type: "percent", value: 50, actual: discountVal };
            discountLabel = "Diskon Promo 50%";
        } else if (code === "BUBUB80") {
            discountVal = Math.round(selectedPlan.price * 0.8);
            activePromo = { code, type: "percent", value: 80, actual: discountVal };
            discountLabel = "Diskon Promo 80%";
        } else {
            if (!isAuto) {
                showPromoFeedback("Kode promo tidak valid.", "error");
            }
            return;
        }

        // Apply discount values to UI
        $("promoDiscountLabel").textContent = discountLabel;
        $("billDiscount").textContent = `-${formatRupiah(discountVal)}`;
        $("promoRow").style.display = "flex";
        
        if (!isAuto) {
            showPromoFeedback(`Kode "${code}" berhasil diterapkan!`, "success");
            if (typeof playSound === "function") {
                playSound("success");
            }
        }

        recalculateTotals();
    }

    function showPromoFeedback(message, type) {
        if (!promoFeedback) return;
        promoFeedback.textContent = message;
        if (type === "success") {
            promoFeedback.style.color = "var(--green)";
        } else {
            promoFeedback.style.color = "#ef4444";
        }
    }

    if (applyPromoBtn && promoCodeInput) {
        applyPromoBtn.addEventListener("click", () => {
            applyPromoCode(promoCodeInput.value);
        });
    }

    function recalculateTotals() {
        let finalAmount = selectedPlan.price;

        if (activePromo) {
            finalAmount -= activePromo.actual;
        }

        if (finalAmount < 0) finalAmount = 0;

        $("finalPriceDisplay").textContent = formatRupiah(finalAmount);
        updatePayButtonLabel();
    }

    function getFinalPayableAmount() {
        let finalAmount = selectedPlan.price;
        if (activePromo) {
            finalAmount -= activePromo.actual;
        }
        return finalAmount < 0 ? 0 : finalAmount;
    }

    function updatePayButtonLabel() {
        const btnText = $("payNowBtn").querySelector(".btn-text");
        if (!btnText) return;
        const finalPriceStr = formatRupiah(getFinalPayableAmount());

        if (currentMethod === "wallet" && selectedWallet) {
            const walletName = selectedWallet.charAt(0).toUpperCase() + selectedWallet.slice(1);
            btnText.textContent = `Bayar Sekarang dengan ${walletName} (${finalPriceStr})`;
        } else if (currentMethod === "qris") {
            btnText.textContent = `Konfirmasi Pembayaran QRIS (${finalPriceStr})`;
        } else {
            btnText.textContent = `Bayar Sekarang ${finalPriceStr}`;
        }
    }

    // QRIS Instant Scan Simulation
    const qrisFrame = $("qrisQrFrame");
    const simQrisBtn = $("simulateQrisScanBtn");
    if (qrisFrame || simQrisBtn) {
        const handleQrisScan = () => {
            if (currentMethod !== "qris") return;
            
            // Visual success indicator on QRIS Frame
            if (qrisFrame) {
                qrisFrame.style.borderColor = "var(--green)";
                qrisFrame.style.background = "rgba(50, 214, 107, 0.05)";
            }
            if (simQrisBtn) {
                simQrisBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> QR Code Berhasil Dipindai!';
                simQrisBtn.style.color = "var(--green)";
                simQrisBtn.style.background = "rgba(50, 214, 107, 0.08)";
                simQrisBtn.style.border = "1px solid var(--green)";
            }

            if (typeof playSound === "function") {
                playSound("success");
            }

            // Automatically trigger verification and modal
            setTimeout(() => {
                $("payNowBtn").click();
            }, 1200);
        };

        if (qrisFrame) qrisFrame.addEventListener("click", handleQrisScan);
        if (simQrisBtn) simQrisBtn.addEventListener("click", handleQrisScan);
    }
 
    // Confetti Effect Generator (pure CSS/JS fallback)
    function launchConfetti() {
        const container = $("confetti-container");
        if (!container) return;

        container.innerHTML = "";
        const colors = ["#4f8cff", "#8b5cf6", "#10b981", "#f59e0b", "#ec4899", "#3b82f6"];
        
        for (let i = 0; i < 75; i++) {
            const particle = document.createElement("div");
            particle.className = "confetti";
            particle.style.left = Math.random() * 100 + "vw";
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            particle.style.width = Math.random() * 10 + 6 + "px";
            particle.style.height = particle.style.width;
            particle.style.animationDelay = Math.random() * 2.5 + "s";
            particle.style.animationDuration = Math.random() * 1.5 + 2.5 + "s";
            
            // Random shapes
            if (Math.random() > 0.5) {
                particle.style.borderRadius = "0";
            }
            
            container.appendChild(particle);
        }

        // Clean up confetti after 6 seconds
        setTimeout(() => {
            container.innerHTML = "";
        }, 6000);
    }

    // Print Receipt Event
    const printReceiptBtn = $("printReceiptBtn");
    if (printReceiptBtn) {
        printReceiptBtn.addEventListener("click", () => {
            if (typeof playSound === "function") {
                playSound("click");
            }
            window.print();
        });
    }

    // Process payment simulation
    $("payNowBtn").addEventListener("click", () => {
        // Validation check
        if (currentMethod === "card") {
            if (!cardNumInput.value || !cardHolderInput.value || !cardExpiryInput.value || !cardCvvInput.value) {
                alert("Mohon lengkapi seluruh kolom informasi kartu kredit.");
                return;
            }
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
 
            // If not logged in, auto-login as Guest Pro to preserve user premium features
            let session = null;
            try {
                session = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
            } catch (e) {
                console.warn(e);
            }
            if (!session || !session.isLoggedIn) {
                localStorage.setItem(SESSION_KEY, JSON.stringify({
                    isLoggedIn: true,
                    username: "Guest Pro",
                    email: "guest@quiznation.com",
                    avatar: "👑"
                }));
            }

            // Play success audio
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
 
            // Set final amount paid in receipt modal
            const payable = getFinalPayableAmount();
            $("receiptFinalAmount").textContent = formatRupiah(payable);

            // Open Success Modal & launch confetti
            const modal = $("successModal");
            modal.classList.add("open");
            modal.setAttribute("aria-hidden", "false");
            launchConfetti();
 
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
            setTimeout(() => {
                window.location.href = "profile.html";
            }, 250);
        } else {
            window.location.href = "profile.html";
        }
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
    initPlan();
    initUserSession();
 
})();
