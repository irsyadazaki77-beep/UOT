/**
 * Universe Of Tech - Theme Initializer (Anti-FOIT)
 * Runs immediately before DOM render to prevent flash of incorrect theme.
 */
(() => {
    try {
        const saved = localStorage.getItem("uot_theme") || localStorage.getItem("eduquest_theme") || localStorage.getItem("bahasaPractice.theme");
        if (saved === "dark" || (!saved && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
            document.documentElement.classList.add("dark-theme");
            if (document.body) {
                document.body.classList.add("dark-theme");
            } else {
                document.addEventListener("DOMContentLoaded", () => {
                    document.body.classList.add("dark-theme");
                }, { once: true });
            }
        }
    } catch (_) {}
})();
