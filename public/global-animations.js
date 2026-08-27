/* ================================================================
   QUIZNATION — GLOBAL ANIMATION ENGINE v3.0
   Intersection Observer + Scroll Progress + Back-to-top + Ripple
   Inject on EVERY main page
   ================================================================ */
(function () {
    'use strict';

    /* ── Util ─────────────────────────────────────────────────── */
    var RAF = window.requestAnimationFrame || function (fn) { setTimeout(fn, 16); };

    /* ================================================================
       1. SCROLL PROGRESS BAR
    ================================================================ */
    function initScrollProgress() {
        var bar = document.getElementById('scrollProgressBar');
        if (!bar) {
            bar = document.createElement('div');
            bar.id = 'scrollProgressBar';
            document.body.appendChild(bar);
        }
        window.addEventListener('scroll', function () {
            var scrollTop = window.scrollY;
            var docHeight = document.documentElement.scrollHeight - window.innerHeight;
            var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            bar.style.width = pct + '%';
        }, { passive: true });
    }

    /* ================================================================
       2. BACK-TO-TOP BUTTON
    ================================================================ */
    function initBackToTop() {
        var btn = document.getElementById('backToTopGlobal');
        if (!btn) {
            btn = document.createElement('button');
            btn.id = 'backToTopGlobal';
            btn.innerHTML = '<i class="fa-solid fa-chevron-up"></i>';
            btn.setAttribute('aria-label', 'Kembali ke atas');
            document.body.appendChild(btn);
        }
        window.addEventListener('scroll', function () {
            btn.classList.toggle('visible', window.scrollY > 400);
        }, { passive: true });
        btn.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* ================================================================
       3. NAVBAR SCROLL SHRINK
    ================================================================ */
    function initNavbarScroll() {
        var nav = document.querySelector('.navbar');
        if (!nav) return;
        window.addEventListener('scroll', function () {
            nav.classList.toggle('scrolled', window.scrollY > 40);
        }, { passive: true });
    }

    /* ================================================================
       4. INTERSECTION OBSERVER — Scroll-reveal
    ================================================================ */
    function initScrollReveal() {
        var targets = document.querySelectorAll(
            '.anim-reveal, .anim-slide-left, .anim-slide-right, .anim-scale-in, .anim-stagger, ' +
            '.rank-list, .leaderboard-list, ' +
            '.section-title, .section-head, [class*="section-"], [class*="-section"]'
        );

        var obs = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (en.isIntersecting) {
                    en.target.classList.add('revealed');
                    obs.unobserve(en.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        targets.forEach(function (el) { obs.observe(el); });
    }

    /* ================================================================
       5. AUTO-TAG reveal classes to common elements
       (so existing HTML doesn't need manual class additions)
    ================================================================ */
    function autoTagReveal() {
        /* Cards */
        var cardSelectors = [
            '.feat-card', '.course-card', '.achievement-card', '.badge-card',
            '.chapter-card', '.module-card', '.topic-card', '.prog-card',
            '.leaderboard-item', '.cert-card', '.path-card', '.rank-item',
            '.stat-card', '.mini-stat', '.course-row'
        ].join(',');

        var cards = document.querySelectorAll(cardSelectors);
        cards.forEach(function (el, i) {
            el.classList.add('anim-reveal');
            el.style.transitionDelay = Math.min(i * 0.06, 0.5) + 's';
        });

        /* Grid containers */
        var gridSelectors = [
            '.features-grid', '.course-layout', '.programs-grid',
            '.achievement-grid', '.badges-grid', '.leaderboard-list',
            '.outcomes-grid', '.stats-row', '.topic-grid', '.module-grid'
        ].join(',');

        document.querySelectorAll(gridSelectors).forEach(function (el) {
            el.classList.add('anim-stagger');
        });

        /* Section headings */
        document.querySelectorAll('section h2, .section-title, .section-head h2').forEach(function (el) {
            el.classList.add('anim-reveal');
        });

        /* Hero sections */
        document.querySelectorAll(
            '.achievements-hero, .leaderboard-hero, .profile-hero, .page-hero'
        ).forEach(function (el) {
            el.classList.add('anim-reveal');
        });

        // Run observer after tagging
        initScrollReveal();
    }

    /* ================================================================
       6. RIPPLE EFFECT on buttons
    ================================================================ */
    function initRipple() {
        document.addEventListener('click', function (e) {
            var btn = e.target.closest('.btn, [class*="btn-"], .action-btn, .cta-btn, .nav-btn');
            if (!btn) return;
            var rect = btn.getBoundingClientRect();
            var x = e.clientX - rect.left;
            var y = e.clientY - rect.top;
            var size = Math.max(rect.width, rect.height) * 2;
            var ripple = document.createElement('span');
            ripple.style.cssText =
                'position:absolute;border-radius:50%;pointer-events:none;z-index:10;' +
                'width:' + size + 'px;height:' + size + 'px;' +
                'left:' + (x - size / 2) + 'px;top:' + (y - size / 2) + 'px;' +
                'background:rgba(255,255,255,0.3);' +
                'animation:rippleAnim 0.65s linear forwards;';
            // ensure position relative
            if (getComputedStyle(btn).position === 'static') {
                btn.style.position = 'relative';
            }
            btn.appendChild(ripple);
            ripple.addEventListener('animationend', function () { ripple.remove(); });
        }, true);

        // Inject keyframe if not already there
        if (!document.getElementById('rippleKeyframe')) {
            var style = document.createElement('style');
            style.id = 'rippleKeyframe';
            style.textContent = '@keyframes rippleAnim{from{transform:scale(0);opacity:0.6}to{transform:scale(1);opacity:0}}';
            document.head.appendChild(style);
        }
    }

    /* ================================================================
       7. CURSOR SPARKLE TRAIL (desktop only)
    ================================================================ */
    function initCursorSparkle() {
        if (window.matchMedia('(max-width:768px)').matches || 'ontouchstart' in window) return;
        var colors = ['#4f8cff', '#32d66b', '#ffd166', '#8b5cf6', '#ff9f43', '#00f0ff'];
        var lastT = 0;

        document.addEventListener('mousemove', function (e) {
            var now = Date.now();
            if (now - lastT < 80) return;
            lastT = now;

            var s = document.createElement('div');
            s.className = 'cursor-spark';
            var sz = Math.random() * 8 + 4;
            s.style.cssText =
                'width:' + sz + 'px;height:' + sz + 'px;' +
                'left:' + e.clientX + 'px;top:' + e.clientY + 'px;' +
                'background:' + colors[Math.floor(Math.random() * colors.length)] + ';' +
                'opacity:' + (Math.random() * 0.55 + 0.25) + ';';
            document.body.appendChild(s);
            s.addEventListener('animationend', function () { s.remove(); });
        });
    }

    /* ================================================================
       8. PROGRESS BAR ANIMATE when visible
    ================================================================ */
    function initProgressBars() {
        var fills = document.querySelectorAll(
            '.progress-fill, .prog-fill, .xp-fill, .streak-fill, [class*="-fill"]'
        );
        if (!fills.length) return;

        var obs = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (en.isIntersecting) {
                    var el = en.target;
                    var targetW = el.style.width || el.getAttribute('data-width') || '0%';
                    el.style.setProperty('--progress-target', targetW);
                    el.style.width = '0%';
                    el.classList.add('play');
                    // Force a short delay so CSS picks up 0% width first
                    setTimeout(function () {
                        el.style.width = targetW;
                    }, 50);
                    obs.unobserve(el);
                }
            });
        }, { threshold: 0.2 });

        fills.forEach(function (el) { obs.observe(el); });
    }

    /* ================================================================
       9. NUMBER COUNT-UP ANIMATION
    ================================================================ */
    function initCountUp() {
        var counters = document.querySelectorAll(
            '[data-count], .stat-number, .count-up'
        );
        if (!counters.length) return;

        var obs = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (!en.isIntersecting) return;
                var el = en.target;
                var target = parseFloat(el.getAttribute('data-count') || el.textContent.replace(/[^\d.]/g, ''));
                if (isNaN(target)) return;
                var suffix = el.getAttribute('data-suffix') || '';
                var prefix = el.getAttribute('data-prefix') || '';
                var duration = 1400;
                var start = performance.now();

                (function tick(now) {
                    var elapsed = now - start;
                    var progress = Math.min(elapsed / duration, 1);
                    // Ease out cubic
                    var ease = 1 - Math.pow(1 - progress, 3);
                    var current = Math.round(target * ease);
                    el.textContent = prefix + current.toLocaleString('id-ID') + suffix;
                    if (progress < 1) RAF(tick);
                })(start);

                obs.unobserve(el);
            });
        }, { threshold: 0.5 });

        counters.forEach(function (el) { obs.observe(el); });
    }

    /* ================================================================
       10. 3D TILT on premium cards (desktop only)
    ================================================================ */
    function initTilt() {
        if (window.matchMedia('(max-width:768px)').matches) return;

        var tiltCards = document.querySelectorAll(
            '.feat-card, .achievement-card, .badge-card, .pricing-card, .cert-card'
        );

        tiltCards.forEach(function (card) {
            card.addEventListener('mousemove', function (e) {
                var r = card.getBoundingClientRect();
                var rx = ((e.clientY - r.top - r.height / 2) / r.height) * -6;
                var ry = ((e.clientX - r.left - r.width / 2) / r.width) * 6;
                card.style.transition = 'transform 0.08s ease';
                card.style.transform = 'perspective(900px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateY(-6px) scale(1.02)';
            });
            card.addEventListener('mouseleave', function () {
                card.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1)';
                card.style.transform = '';
            });
        });
    }

    /* ================================================================
       11. EMOJI BURST on achievement click
    ================================================================ */
    function initEmojiBurst() {
        var emojis = ['🎉', '⭐', '🏆', '🔥', '✨', '💡', '🚀', '🎯'];
        document.addEventListener('click', function (e) {
            var trigger = e.target.closest('.achievement-card, .badge-card, .badge-earned');
            if (!trigger) return;
            for (var i = 0; i < 6; i++) {
                (function (idx) {
                    setTimeout(function () {
                        var el = document.createElement('div');
                        el.className = 'emoji-burst';
                        el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
                        el.style.left = (e.clientX + (Math.random() - 0.5) * 80) + 'px';
                        el.style.top = (e.clientY + (Math.random() - 0.5) * 40) + 'px';
                        el.style.setProperty('--spin', (Math.random() > 0.5 ? '' : '-') + Math.round(Math.random() * 60 + 15) + 'deg');
                        document.body.appendChild(el);
                        el.addEventListener('animationend', function () { el.remove(); });
                    }, idx * 80);
                })(i);
            }
        });
    }

    /* ================================================================
       12. SMOOTH PAGE TRANSITIONS (outgoing)
    ================================================================ */
    function initPageTransitions() {
        document.addEventListener('click', function (e) {
            var anchor = e.target.closest('a[href]');
            if (!anchor) return;
            var href = anchor.getAttribute('href');
            // Only internal HTML links
            if (!href || href.startsWith('#') || href.startsWith('javascript') ||
                href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel')) return;

            e.preventDefault();
            document.body.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
            document.body.style.opacity = '0';
            document.body.style.transform = 'translateY(-8px)';
            setTimeout(function () {
                window.location.href = href;
            }, 260);
        });
    }

    /* ================================================================
       13. ACTIVE NAV LINK highlight
    ================================================================ */
    function initActiveNav() {
        var current = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.nav-links a, .mega-item-link, .mobile-nav-links a').forEach(function (a) {
            var href = a.getAttribute('href') || '';
            if (href === current || href.split('/').pop() === current) {
                a.classList.add('active');
            }
        });
    }

    /* ================================================================
       INIT ALL
    ================================================================ */
    function init() {
        initScrollProgress();
        initBackToTop();
        initNavbarScroll();
        initRipple();
        initCursorSparkle();
        initProgressBars();
        initCountUp();
        initTilt();
        initEmojiBurst();
        initPageTransitions();
        initActiveNav();
        // Tag + observe after brief paint
        setTimeout(autoTagReveal, 100);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
