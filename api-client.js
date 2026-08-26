(() => {
    "use strict";

    const configuredBase = document.querySelector('meta[name="quiznation-api-base"]')?.content?.trim() || "";
    const normalizedBase = /^(?:localhost|127\.0\.0\.1)(?::\d+)?$/i.test(configuredBase) ? `http://${configuredBase}` : configuredBase;
    const API_BASE = normalizedBase.replace(/\/$/, "");

    let currentCsrfToken = "";

    function isConfigured() {
        return /^https:\/\//i.test(API_BASE) || /^http:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/i.test(API_BASE) || window.location.protocol.startsWith("http");
    }

    async function fetchCsrfToken() {
        try {
            const url = `${API_BASE}/api/csrf-token`;
            const response = await fetch(url, { credentials: "include" });
            const payload = await response.json().catch(() => ({}));
            if (payload && payload.csrfToken) {
                currentCsrfToken = payload.csrfToken;
            }
        } catch (_) {}
        return currentCsrfToken;
    }

    async function request(path, options = {}) {
        const method = (options.method || "GET").toUpperCase();
        if (["POST", "PUT", "PATCH", "DELETE"].includes(method) && !currentCsrfToken && path !== "/api/csrf-token") {
            await fetchCsrfToken();
        }

        const headers = new Headers(options.headers || {});
        if (options.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
        if (currentCsrfToken && !headers.has("X-CSRF-Token")) {
            headers.set("X-CSRF-Token", currentCsrfToken);
        }

        const url = `${API_BASE}${path}`;
        const response = await fetch(url, {
            ...options,
            headers,
            credentials: "include"
        });

        const payload = await response.json().catch(() => ({}));
        if (payload.csrfToken) {
            currentCsrfToken = payload.csrfToken;
        }

        if (!response.ok) {
            const error = new Error(payload.message || `Permintaan gagal (${response.status}).`);
            error.status = response.status;
            error.payload = payload;
            throw error;
        }
        return payload;
    }

    async function getConfigStatus() {
        return request("/api/config/status", { method: "GET" }).catch(() => ({
            ok: true,
            environment: "development",
            paymentGateway: { isConfigured: false, mode: "demo" }
        }));
    }

    async function registerUser({ username, email, password }) {
        const payload = await request("/api/auth/register", {
            method: "POST",
            body: JSON.stringify({ username, email, password })
        });
        if (payload.csrfToken) currentCsrfToken = payload.csrfToken;
        return payload;
    }

    async function loginUser({ email, password }) {
        const payload = await request("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password })
        });
        if (payload.csrfToken) currentCsrfToken = payload.csrfToken;
        return payload;
    }

    async function verifySession() {
        return request("/api/auth/verify-session", { method: "POST" });
    }

    async function logoutUser() {
        return request("/api/auth/logout", { method: "POST" }).finally(() => {
            currentCsrfToken = "";
        });
    }

    async function verifySubscription() {
        return request("/api/subscription/verify", { method: "POST" });
    }

    async function activateSandboxPro({ planId, promoCode }) {
        return request("/api/subscription/sandbox-activate", {
            method: "POST",
            body: JSON.stringify({ planId, promoCode })
        });
    }

    async function createCheckoutSession({ planId, source }) {
        const payload = await request("/v1/checkout/sessions", {
            method: "POST",
            body: JSON.stringify({ planId, source })
        });
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

    window.QuizNationAPI = Object.freeze({
        isConfigured,
        request,
        getConfigStatus,
        registerUser,
        loginUser,
        verifySession,
        logoutUser,
        verifySubscription,
        activateSandboxPro,
        createCheckoutSession,
        pullLearningState,
        pushLearningState
    });
})();
