/**
 * Universe Of Tech - Markdown & Syntax Formatter Helper (Phase 4)
 * Formats AI chat responses, code blocks, lists, and provides a copy-to-clipboard button.
 */
(() => {
    "use strict";

    const escapeHtml = str => String(str ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    const highlightSyntax = (code, lang = "") => {
        let escaped = escapeHtml(code);
        
        // Simple and robust regex syntax highlighter
        // Strings
        escaped = escaped.replace(/(["'`])(?:(?=(\\?))\2[\s\S])*?\1/g, '<span class="tok-string">$&</span>');
        // Keywords
        escaped = escaped.replace(/\b(const|let|var|function|return|if|else|for|while|import|export|class|new|async|await|try|catch|switch|case|break|default|from|typeof|instanceof)\b/g, '<span class="tok-keyword">$&</span>');
        // Booleans & Null
        escaped = escaped.replace(/\b(true|false|null|undefined|NaN)\b/g, '<span class="tok-atom">$&</span>');
        // Numbers
        escaped = escaped.replace(/\b\d+(\.\d+)?\b/g, '<span class="tok-number">$&</span>');
        // Comments
        escaped = escaped.replace(/(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g, '<span class="tok-comment">$&</span>');

        return escaped;
    };

    const UOTMarkdown = {
        render(markdownText) {
            if (typeof markdownText !== "string") return "";

            let html = markdownText;

            // 1. Code blocks with language detection & Copy button
            html = html.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (_, lang, code) => {
                const cleanLang = lang.trim() || "code";
                const highlighted = highlightSyntax(code.trim(), cleanLang);
                const encodedRaw = encodeURIComponent(code.trim());
                return `
                    <div class="code-block-wrapper my-3 rounded-xl overflow-hidden border border-slate-700/50 bg-slate-900 text-slate-100 text-sm shadow-md">
                        <div class="code-block-header flex items-center justify-between px-3 py-1.5 bg-slate-800/80 border-b border-slate-700/50 text-xs font-mono text-slate-300">
                            <span class="font-semibold uppercase tracking-wider">${escapeHtml(cleanLang)}</span>
                            <button type="button" class="copy-code-btn px-2.5 py-1 rounded bg-slate-700/70 hover:bg-emerald-600 text-slate-200 hover:text-white transition text-xs flex items-center gap-1.5" data-code="${encodedRaw}">
                                <span>Salin</span>
                            </button>
                        </div>
                        <pre class="p-3.5 overflow-x-auto font-mono text-xs leading-relaxed"><code>${highlighted}</code></pre>
                    </div>
                `;
            });

            // 2. Inline code
            html = html.replace(/`([^`]+)`/g, (_, code) => `<code class="px-1.5 py-0.5 rounded bg-slate-800/60 text-emerald-400 font-mono text-xs">${escapeHtml(code)}</code>`);

            // 3. Bold & Italic
            html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
            html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");

            // 4. Blockquotes
            html = html.replace(/^>\s*(.+)$/gm, '<blockquote class="border-l-4 border-emerald-500 pl-3 py-1 my-2 italic text-slate-300 bg-emerald-950/20 rounded-r">$1</blockquote>');

            // 5. Unordered Lists
            html = html.replace(/^\s*[-*]\s+(.+)$/gm, '<li class="ml-4 list-disc">$1</li>');

            // 6. Ordered Lists
            html = html.replace(/^\s*(\d+)\.\s+(.+)$/gm, '<li class="ml-4 list-decimal" value="$1">$2</li>');

            // 7. Linebreaks to <br> for conversational text
            html = html.replace(/\n\n+/g, "<br><br>");

            return html;
        },

        initCopyHandlers(container = document) {
            container.querySelectorAll(".copy-code-btn").forEach(btn => {
                if (btn.dataset.bound) return;
                btn.dataset.bound = "true";
                btn.addEventListener("click", async () => {
                    const raw = decodeURIComponent(btn.dataset.code || "");
                    try {
                        await navigator.clipboard.writeText(raw);
                        const origText = btn.innerHTML;
                        btn.innerHTML = '<span>Tersalin!</span>';
                        btn.classList.add("bg-emerald-600");
                        setTimeout(() => {
                            btn.innerHTML = origText;
                            btn.classList.remove("bg-emerald-600");
                        }, 2000);
                    } catch {
                        // Fallback
                    }
                });
            });
        }
    };

    window.UOTMarkdown = Object.freeze(UOTMarkdown);
    document.addEventListener("DOMContentLoaded", () => {
        UOTMarkdown.initCopyHandlers();
    });
})();
