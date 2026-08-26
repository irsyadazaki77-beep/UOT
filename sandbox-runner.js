(() => {
    "use strict";

    const MAX_LOGS = 150;
    const MAX_STR_LEN = 2000;

    const serialize = value => {
        if (value === null) return "null";
        if (value === undefined) return "undefined";
        if (typeof value === "string") return value.length > MAX_STR_LEN ? value.slice(0, MAX_STR_LEN) + "… (truncated)" : value;
        if (typeof value === "number" || typeof value === "boolean" || typeof value === "symbol") return String(value);
        if (typeof value === "function") return `[Function: ${value.name || "anonymous"}]`;
        if (value instanceof Error) return `${value.name}: ${value.message}`;
        if (Array.isArray(value)) {
            try {
                return JSON.stringify(value.map(v => typeof v === "object" && v !== null ? (Array.isArray(v) ? `[Array(${v.length})]` : "[Object]") : v));
            } catch {
                return `[Array(${value.length})]`;
            }
        }
        try {
            return JSON.stringify(value, (k, v) => typeof v === "function" ? `[Function]` : v, 2);
        } catch {
            return String(value);
        }
    };

    window.addEventListener("message", event => {
        const data = event.data;
        if (event.source !== window.parent || data?.type !== "quiznation-sandbox-run") return;
        const code = typeof data.code === "string" ? data.code : "";
        if (!data.runId || !code || code.length > 30000) return;

        const logs = [];
        const pushLog = (prefix, args) => {
            if (logs.length >= MAX_LOGS) return;
            const text = args.map(serialize).join(" ");
            logs.push(prefix ? `[${prefix}] ${text}` : text);
        };

        const timers = new Map();
        const sandboxConsole = Object.freeze({
            log: (...args) => pushLog("", args),
            info: (...args) => pushLog("info", args),
            warn: (...args) => pushLog("warn", args),
            error: (...args) => pushLog("error", args),
            table: (tabularData) => {
                if (typeof tabularData === "object" && tabularData !== null) {
                    pushLog("table", [JSON.stringify(tabularData, null, 2)]);
                } else {
                    pushLog("table", [tabularData]);
                }
            },
            dir: (obj) => pushLog("dir", [obj]),
            clear: () => logs.length = 0,
            time: (label = "default") => timers.set(label, performance.now()),
            timeEnd: (label = "default") => {
                if (timers.has(label)) {
                    const elapsed = (performance.now() - timers.get(label)).toFixed(3);
                    timers.delete(label);
                    pushLog("timer", [`${label}: ${elapsed}ms`]);
                }
            }
        });

        // Parameters to shadow dangerous and unneeded environment APIs
        const shadowedGlobals = [
            "console",
            "window",
            "document",
            "location",
            "localStorage",
            "sessionStorage",
            "indexedDB",
            "cookieStore",
            "fetch",
            "XMLHttpRequest",
            "WebSocket",
            "Worker",
            "SharedWorker",
            "parent",
            "top",
            "self",
            "alert",
            "prompt",
            "confirm",
            "open"
        ];

        const blockedTrap = (name) => () => {
            throw new Error(`Akses ke '${name}' diblokir di lingkungan sandbox latihan.`);
        };

        const shadowValues = [
            sandboxConsole,
            undefined, // window
            undefined, // document
            undefined, // location
            undefined, // localStorage
            undefined, // sessionStorage
            undefined, // indexedDB
            undefined, // cookieStore
            blockedTrap("fetch"),
            blockedTrap("XMLHttpRequest"),
            blockedTrap("WebSocket"),
            blockedTrap("Worker"),
            blockedTrap("SharedWorker"),
            undefined, // parent
            undefined, // top
            undefined, // self
            blockedTrap("alert"),
            blockedTrap("prompt"),
            blockedTrap("confirm"),
            blockedTrap("open")
        ];

        try {
            const runner = new Function(...shadowedGlobals, `"use strict";\n${code}`);
            runner(...shadowValues);

            event.source.postMessage({
                type: "quiznation-sandbox-result",
                runId: data.runId,
                ok: true,
                logs: logs.slice(0, MAX_LOGS)
            }, "*");
        } catch (error) {
            event.source.postMessage({
                type: "quiznation-sandbox-result",
                runId: data.runId,
                ok: false,
                logs: logs.slice(0, MAX_LOGS),
                error: String(error?.message || error).slice(0, 500)
            }, "*");
        }
    });
})();

