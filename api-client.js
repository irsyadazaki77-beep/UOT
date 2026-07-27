(() => {
    "use strict";

    const configuredBase = document.querySelector('meta[name="quiznation-api-base"]')?.content?.trim() || "";
    const normalizedBase = /^(?:localhost|127\.0\.0\.1)(?::\d+)?$/i.test(configuredBase) ? `http://${configuredBase}` : configuredBase;
    const API_BASE = normalizedBase.replace(/\/$/, "");

    function isConfigured() {
        return /^https:\/\//i.test(API_BASE) || /^http:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/i.test(API_BASE);
    }

    async function request(path, options = {}) {
        if (!isConfigured()) throw new Error("API produksi belum dikonfigurasi.");
        const headers = new Headers(options.headers || {});
        if (options.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
        headers.set("X-Requested-With", "QuizNation");
        const response = await fetch(`${API_BASE}${path}`, {
            ...options,
            headers,
            credentials: "include",
            redirect: "error"
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.message || `Permintaan gagal (${response.status}).`);
        return payload;
    }

    async function createCheckoutSession({ planId, source }) {
        const payload = await request("/v1/checkout/sessions", {
            method: "POST",
            body: JSON.stringify({ planId, source })
        });
        if (!payload.checkoutUrl || !/^https:\/\//i.test(payload.checkoutUrl)) {
            throw new Error("Respons checkout dari server tidak valid.");
        }
        return payload;
    }

    async function pullLearningState() {
        return request("/v1/learning-state", { method: "GET" });
    }

    async function pushLearningState(state) {
        return request("/v1/learning-state", {
            method: "PUT",
            body: JSON.stringify({ state, updatedAt: state?.updatedAt || new Date().toISOString() })
        });
    }

    window.QuizNationAPI = Object.freeze({ isConfigured, request, createCheckoutSession, pullLearningState, pushLearningState });
})();
