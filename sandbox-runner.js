(() => {
    "use strict";

    const stringify = value => {
        if (typeof value === "string") return value;
        try { return JSON.stringify(value); }
        catch { return String(value); }
    };

    window.addEventListener("message", event => {
        const data = event.data;
        if (event.source !== window.parent || data?.type !== "quiznation-sandbox-run") return;
        const code = typeof data.code === "string" ? data.code : "";
        if (!data.runId || !code || code.length > 20000) return;

        const logs = [];
        const sandboxConsole = Object.freeze({
            log: (...args) => logs.push(args.map(stringify).join(" ")),
            info: (...args) => logs.push(args.map(stringify).join(" ")),
            warn: (...args) => logs.push(`[warn] ${args.map(stringify).join(" ")}`),
            error: (...args) => logs.push(`[error] ${args.map(stringify).join(" ")}`)
        });

        try {
            const runner = new Function("console", `"use strict";\n${code}`);
            runner(sandboxConsole);
            event.source.postMessage({ type: "quiznation-sandbox-result", runId: data.runId, ok: true, logs: logs.slice(0, 100) }, "*");
        } catch (error) {
            event.source.postMessage({ type: "quiznation-sandbox-result", runId: data.runId, ok: false, logs: [], error: String(error?.message || error).slice(0, 500) }, "*");
        }
    });
})();
