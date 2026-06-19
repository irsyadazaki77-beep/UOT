/**
 * Universe Of Tech - Security Hardening Helper
 * Protects local data, checks signatures, prevents clickjacking and console attacks.
 */
(() => {
    "use strict";

    // 1. Frame-Busting (Anti-Clickjacking)
    if (window.self !== window.top) {
        try {
            window.top.location = window.self.location;
        } catch (e) {
            window.location.replace("about:blank");
        }
    }

    // 2. Self-XSS Prevention Warning in DevTools Console
    setTimeout(() => {
        console.log(
            "%cPERINGATAN KEAMANAN!",
            "color: #ef4444; font-size: 28px; font-weight: 900; font-family: sans-serif; text-shadow: 0 2px 4px rgba(0,0,0,0.2);"
        );
        console.log(
            "%cJangan pernah menyalin atau menempelkan kode (script) apa pun ke dalam konsol ini jika Anda tidak memahaminya. Tindakan tersebut dapat mengeksploitasi data sensitif Anda dan mengakibatkan pembajakan akun.",
            "color: #f8fafc; background: #0f172a; padding: 12px; font-size: 13px; font-family: sans-serif; border-radius: 8px; line-height: 1.5; border-left: 4px solid #ef4444;"
        );
    }, 500);

    // 3. Salt and Key Definitions
    const SECRET_SALT = "eduquest_sec_salt_2026_xYz!@#";
    const PREFIX_REGEX = /^(eduquest|bahasa|book|wonderful|latihan|snbt|tka|wonder)/i;

    // References to original storage methods
    const originalGetItem = window.localStorage.getItem;
    const originalSetItem = window.localStorage.setItem;
    const originalRemoveItem = window.localStorage.removeItem;

    let warningTriggered = false;

    // 4. SHA-256 Hashing Implementation (Synchronous)
    function sha256(ascii) {
        function rightRotate(value, amount) {
            return (value >>> amount) | (value << (32 - amount));
        }
        const mathPow = Math.pow;
        const maxWord = mathPow(2, 32);
        const lengthProperty = 'length';
        let i, j;
        let result = '';
        const words = [];
        const asciiLength = ascii[lengthProperty];
        let hash = sha256.h = sha256.h || [];
        const k = sha256.k = sha256.k || [];
        let primeCounter = k[lengthProperty];
        const isComposite = {};
        for (let candidate = 2; primeCounter < 64; candidate++) {
            if (!isComposite[candidate]) {
                for (i = 0; i < 313; i += candidate) {
                    isComposite[i] = candidate;
                }
                hash[primeCounter] = (mathPow(candidate, .5) * maxWord) | 0;
                k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
            }
        }
        ascii += '\x80';
        while (ascii[lengthProperty] % 64 - 56) ascii += '\x00';
        for (i = 0; i < ascii[lengthProperty]; i++) {
            j = ascii.charCodeAt(i);
            if (j >> 8) return ""; // Non-ASCII fallback
            words[i >> 2] |= j << ((3 - i % 4) * 8);
        }
        words[words[lengthProperty]] = ((asciiLength * 8) / maxWord) | 0;
        words[words[lengthProperty]] = (asciiLength * 8);
        for (j = 0; j < words[lengthProperty]; ) {
            const w = words.slice(j, j += 16);
            const oldHash = hash.slice(0);
            for (i = 0; i < 64; i++) {
                if (i >= 16) {
                    const s0 = rightRotate(w[i - 15], 7) ^ rightRotate(w[i - 15], 18) ^ (w[i - 15] >>> 3);
                    const s1 = rightRotate(w[i - 2], 17) ^ rightRotate(w[i - 2], 19) ^ (w[i - 2] >>> 10);
                    w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
                }
                const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
                const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
                const temp1 = (hash[7] + (rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25)) + ch + k[i] + w[i]) | 0;
                const temp2 = ((rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22)) + maj) | 0;
                hash = [(temp1 + temp2) | 0].concat(hash);
                hash[4] = (hash[4] + temp1) | 0;
                hash.length = 8;
            }
            for (i = 0; i < 8; i++) {
                hash[i] = (hash[i] + oldHash[i]) | 0;
            }
        }
        for (i = 0; i < 8; i++) {
            const value = hash[i];
            for (j = 3; j >= 0; j--) {
                const byteVal = (value >> (j * 8)) & 0xFF;
                result += (byteVal < 16 ? '0' : '') + byteVal.toString(16);
            }
        }
        return result;
    }

    function computeSignature(key, val) {
        const payload = key + ":" + val + ":" + SECRET_SALT;
        return sha256(encodeURIComponent(payload));
    }

    // 5. Security Threat Trigger (Tamper Warning UI)
    function triggerTamperWarning(key) {
        if (warningTriggered) return;
        warningTriggered = true;

        console.error(`[SECURITY] Local storage key "${key}" was modified externally or corrupted.`);

        // Purge session and Pro subscription keys to block unauthorized state bypass
        originalRemoveItem.call(localStorage, "eduquestUserSession");
        originalRemoveItem.call(localStorage, "eduquestSubscription");
        originalRemoveItem.call(localStorage, "eduquestLmsProgress");

        // UI Injection helper
        const injectWarning = () => {
            const overlay = document.createElement("div");
            overlay.style.position = "fixed";
            overlay.style.inset = "0";
            overlay.style.zIndex = "999999";
            overlay.style.background = "rgba(5, 10, 20, 0.88)";
            overlay.style.backdropFilter = "blur(20px) saturate(130%)";
            overlay.style.display = "grid";
            overlay.style.placeItems = "center";
            overlay.style.fontFamily = "'Inter', sans-serif";
            overlay.style.padding = "20px";

            overlay.innerHTML = `
                <div style="width: min(440px, 100%); background: #111827; border: 1.5px solid #ef4444; border-radius: 28px; padding: 40px 30px; text-align: center; box-shadow: 0 25px 60px rgba(239, 68, 68, 0.15);">
                    <div style="width: 76px; height: 76px; border-radius: 50%; background: rgba(239, 68, 68, 0.1); color: #ef4444; font-size: 36px; display: grid; place-items: center; margin: 0 auto 24px; box-shadow: 0 0 25px rgba(239,68,68,0.25);">
                        <i class="fa-solid fa-triangle-exclamation"></i>
                    </div>
                    <h3 style="font-size: 24px; font-weight: 900; margin-bottom: 12px; color: #f8fafc; letter-spacing: -0.03em;">Pelanggaran Keamanan</h3>
                    <p style="font-size: 14px; color: #9ca3af; line-height: 1.6; margin-bottom: 32px; font-weight: 500;">Sistem mendeteksi adanya manipulasi atau perubahan data lokal secara eksternal. Sesi Anda di-reset demi keselamatan data sensitif.</p>
                    <button id="securityReloadBtn" style="width: 100%; padding: 15px; border: 0; border-radius: 12px; background: #ef4444; color: #fff; font-weight: 800; font-size: 14px; cursor: pointer; transition: background-color 0.2s, transform 0.1s; box-shadow: 0 4px 12px rgba(239,68,68,0.2);">Muat Ulang Halaman</button>
                </div>
            `;
            document.body.appendChild(overlay);

            document.getElementById("securityReloadBtn").addEventListener("click", () => {
                window.location.reload();
            });
        };

        if (document.body) {
            injectWarning();
        } else {
            document.addEventListener("DOMContentLoaded", injectWarning);
        }
    }

    // 6. Overriding localStorage APIs
    try {
        window.localStorage.setItem = function (key, val) {
            if (key && typeof key === "string" && PREFIX_REGEX.test(key)) {
                const valStr = String(val);
                const sig = computeSignature(key, valStr);
                const payload = JSON.stringify({ v: valStr, s: sig });
                originalSetItem.call(localStorage, key, payload);
            } else {
                originalSetItem.call(localStorage, key, val);
            }
        };

        window.localStorage.getItem = function (key) {
            const raw = originalGetItem.call(localStorage, key);
            if (raw === null) return null;

            if (key && typeof key === "string" && PREFIX_REGEX.test(key)) {
                try {
                    const data = JSON.parse(raw);
                    if (data && typeof data === "object" && "v" in data && "s" in data) {
                        const expectedSig = computeSignature(key, data.v);
                        if (expectedSig === data.s) {
                            return data.v;
                        } else {
                            triggerTamperWarning(key);
                            return null;
                        }
                    }
                } catch (e) {
                    // Raw string, not JSON format. This means it is legacy data.
                }

                // Graceful Auto-Migration: Sign the legacy data on access
                const sig = computeSignature(key, raw);
                const payload = JSON.stringify({ v: raw, s: sig });
                originalSetItem.call(localStorage, key, payload);
                return raw;
            }
            return raw;
        };
    } catch (err) {
        console.warn("Could not install secure local storage wrapper:", err);
    }
})();
