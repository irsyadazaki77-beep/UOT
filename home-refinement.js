/* Focused homepage UX enhancements. Kept separate from legacy animation packs. */
(() => {
    "use strict";

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function prepareMotion() {
        const items = document.querySelectorAll([
            ".program-card",
            ".feat-card",
            ".course-card",
            ".testimonial-card",
            ".pricing-card",
            ".team-card",
            ".section-header",
            ".contact-info-card",
            ".contact-form-wrap"
        ].join(","));

        items.forEach((item, index) => {
            item.classList.add("ux-motion-item");
            item.style.setProperty("--ux-delay", `${Math.min(index % 4, 3) * 55}ms`);
        });

        if (reduceMotion.matches || !("IntersectionObserver" in window)) {
            items.forEach(item => item.classList.add("ux-in-view"));
            return;
        }

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("ux-in-view");
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.08, rootMargin: "0px 0px 8% 0px" });

        items.forEach(item => observer.observe(item));
    }

    function addCarouselHints() {
        const selectors = [".programs-grid", ".testimonials-grid", ".pricing-grid", ".team-grid"];
        selectors.forEach(selector => {
            const carousel = document.querySelector(selector);
            if (!carousel || carousel.previousElementSibling?.classList.contains("mobile-swipe-hint")) return;

            const hint = document.createElement("div");
            hint.className = "mobile-swipe-hint";
            hint.setAttribute("aria-hidden", "true");
            hint.innerHTML = '<span>Geser untuk melihat lainnya</span><i class="fa-solid fa-arrow-right"></i>';
            carousel.before(hint);

            const updateHint = () => {
                const atEnd = carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 8;
                hint.classList.toggle("is-complete", atEnd);
            };
            carousel.addEventListener("scroll", updateHint, { passive: true });
        });
    }

    function improveInteractiveSemantics() {
        document.querySelectorAll(".showcase-tab").forEach(tab => {
            const feature = tab.dataset.feature;
            if (feature) tab.setAttribute("aria-controls", `feat-${feature}`);
        });
        document.querySelectorAll(".showcase-screen").forEach(screen => {
            screen.setAttribute("role", "tabpanel");
        });

        const quizFeedback = document.getElementById("demoQuizFeedback");
        if (quizFeedback) quizFeedback.setAttribute("aria-live", "polite");

        const progress = document.getElementById("scrollProgressBar");
        if (progress) progress.setAttribute("aria-hidden", "true");
    }

    function boot() {
        document.body.classList.add("home-ux-ready");
        prepareMotion();
        addCarouselHints();
        improveInteractiveSemantics();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot, { once: true });
    } else {
        boot();
    }
})();
