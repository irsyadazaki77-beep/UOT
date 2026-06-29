/* ============================================================
   MEGA ANIMATION PACK v2 — All Smooth Micro-interactions
   Universe Of Tech - index.html
   ============================================================ */
(function() {
    'use strict';

    /* 1. RIPPLE on buttons */
    function initRipple() {
        document.querySelectorAll('.btn').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                var rect = btn.getBoundingClientRect();
                var x = e.clientX - rect.left;
                var y = e.clientY - rect.top;
                var ripple = document.createElement('span');
                ripple.className = 'ripple-circle';
                var size = Math.max(rect.width, rect.height) * 2;
                ripple.style.cssText = 'position:absolute;border-radius:50%;animation:rippleAnim 0.65s linear forwards;background:rgba(255,255,255,0.35);pointer-events:none;z-index:10;width:' + size + 'px;height:' + size + 'px;left:' + (x - size/2) + 'px;top:' + (y - size/2) + 'px;';
                btn.appendChild(ripple);
                ripple.addEventListener('animationend', function(){ ripple.remove(); });
            });
        });
    }

    /* 2. CURSOR SPARKLE */
    function initCursorSparkle() {
        if (window.matchMedia('(max-width:768px)').matches || 'ontouchstart' in window) return;
        var colors = ['#4361ee','#0ca678','#f09337','#7f56d9','#32d66b','#fbbf24'];
        var last = 0;
        document.addEventListener('mousemove', function(e) {
            var now = Date.now();
            if (now - last < 90) return;
            last = now;
            var s = document.createElement('div');
            s.className = 'cursor-spark';
            var sz = Math.random()*9+4;
            s.style.cssText = 'width:'+sz+'px;height:'+sz+'px;left:'+e.clientX+'px;top:'+e.clientY+'px;background:'+colors[Math.floor(Math.random()*colors.length)]+';opacity:'+(Math.random()*0.5+0.25)+';';
            document.body.appendChild(s);
            s.addEventListener('animationend', function(){ s.remove(); });
        });
    }

    /* 3. BACK TO TOP */
    function initBackToTop() {
        var btn = document.getElementById('backToTop');
        if (!btn) return;
        window.addEventListener('scroll', function() {
            btn.classList.toggle('visible', window.scrollY > 400);
        }, {passive:true});
        btn.addEventListener('click', function() {
            window.scrollTo({top:0,behavior:'smooth'});
        });
    }

    /* 4. STAGGER REVEAL for grids */
    function initStaggerReveal() {
        var grids = document.querySelectorAll('.features-grid,.course-layout,.testimonials-grid,.pricing-grid,.programs-grid,.achievement-grid,.outcomes-grid,.stats-row,.rank-list,.faq-container');
        var obs = new IntersectionObserver(function(entries) {
            entries.forEach(function(e) {
                if (e.isIntersecting) {
                    e.target.classList.add('stagger-reveal','revealed');
                    obs.unobserve(e.target);
                }
            });
        }, {threshold:0.1});
        grids.forEach(function(g) { g.classList.add('stagger-reveal'); obs.observe(g); });
    }

    /* 5. 3D TILT CARDS */
    function initTiltCards() {
        if (window.matchMedia('(max-width:768px)').matches) return;
        document.querySelectorAll('.feat-card,.testimonial-card,.pricing-card,.outcome-card').forEach(function(card) {
            card.addEventListener('mousemove', function(e) {
                var r = card.getBoundingClientRect();
                var rx = ((e.clientY-r.top-r.height/2)/r.height)*-5;
                var ry = ((e.clientX-r.left-r.width/2)/r.width)*5;
                card.style.transition = 'transform 0.1s ease';
                card.style.transform = 'perspective(900px) rotateX('+rx+'deg) rotateY('+ry+'deg) translateY(-6px) scale(1.02)';
            });
            card.addEventListener('mouseleave', function() {
                card.style.transition = 'transform 0.55s cubic-bezier(0.16,1,0.3,1)';
                card.style.transform = '';
            });
        });
    }

    /* 6. NUMBER COUNTERS */
    function animateCounter(el, target, suffix) {
        var start = 0, inc = target/112;
        var t = setInterval(function() {
            start += inc;
            if (start >= target) { start = target; clearInterval(t); }
            el.textContent = Math.floor(start) + suffix;
        }, 16);
    }
    function initCounters() {
        var cs = [{id:'outcome-ptn',t:85,s:'%'},{id:'outcome-kerja',t:92,s:'%'},{id:'outcome-cert',t:10,s:'K+'}];
        var obs = new IntersectionObserver(function(entries) {
            entries.forEach(function(e) {
                if (e.isIntersecting) {
                    var d = cs.find(function(c){ return c.id === e.target.id; });
                    if (d) animateCounter(e.target, d.t, d.s);
                    obs.unobserve(e.target);
                }
            });
        }, {threshold:0.5});
        cs.forEach(function(c){ var el = document.getElementById(c.id); if (el) obs.observe(el); });
    }

    /* 7. THEME TOGGLE SPIN */
    function initThemeToggleSpin() {
        var btn = document.getElementById('themeToggleBtn');
        if (!btn) return;
        btn.addEventListener('click', function() {
            btn.classList.add('spinning');
            btn.addEventListener('animationend', function(){ btn.classList.remove('spinning'); }, {once:true});
        });
    }

    /* 8. STAT CARD XP BARS */
    function initStatGlowBars() {
        document.querySelectorAll('.stat-card').forEach(function(card) {
            if (!card.querySelector('.stat-glow-bar')) {
                var b = document.createElement('div');
                b.className = 'stat-glow-bar';
                card.appendChild(b);
            }
        });
    }

    /* 9. MAGNETIC BUTTONS */
    function initMagneticButtons() {
        if (window.matchMedia('(max-width:768px)').matches) return;
        document.querySelectorAll('.btn-primary,.btn-blue').forEach(function(btn) {
            btn.addEventListener('mousemove', function(e) {
                var r = btn.getBoundingClientRect();
                var dx = (e.clientX - r.left - r.width/2) * 0.1;
                var dy = (e.clientY - r.top - r.height/2) * 0.1;
                btn.style.transform = 'translateY(-4px) translate('+dx+'px,'+dy+'px)';
            });
            btn.addEventListener('mouseleave', function(){ btn.style.transform = ''; });
        });
    }

    /* 10. SHOWCASE DISPLAY PULSE ON TAB CHANGE */
    function initShowcaseTransition() {
        document.querySelectorAll('.showcase-tab').forEach(function(tab) {
            tab.addEventListener('click', function() {
                var d = document.querySelector('.showcase-display');
                if (!d) return;
                d.style.transition = 'transform 0.15s ease';
                d.style.transform = 'scale(0.97)';
                setTimeout(function(){
                    d.style.transition = 'transform 0.35s cubic-bezier(0.16,1,0.3,1)';
                    d.style.transform = 'scale(1)';
                }, 150);
            });
        });
    }

    /* 11. PARTNER CARD STAGGER ENTRANCE */
    function initPartnerCards() {
        var grid = document.querySelector('.partners-grid');
        if (!grid) return;
        var obs = new IntersectionObserver(function(entries) {
            entries.forEach(function(e) {
                if (e.isIntersecting) {
                    e.target.querySelectorAll('.partner-card').forEach(function(c, i) {
                        c.style.opacity = '0';
                        c.style.transform = 'translateY(18px) scale(0.95)';
                        setTimeout(function(){
                            c.style.transition = 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.16,1,0.3,1)';
                            c.style.opacity = '1';
                            c.style.transform = 'translateY(0) scale(1)';
                        }, i * 80);
                    });
                    obs.unobserve(e.target);
                }
            });
        }, {threshold:0.2});
        obs.observe(grid);
    }

    /* 12. HERO PHONE PARALLAX */
    function initHeroParallax() {
        if (window.matchMedia('(max-width:768px)').matches) return;
        var phone = document.querySelector('.phone');
        var hero = document.querySelector('.hero');
        if (!phone || !hero) return;
        hero.addEventListener('mousemove', function(e) {
            var r = hero.getBoundingClientRect();
            var x = (e.clientX - r.left - r.width/2) / r.width;
            var y = (e.clientY - r.top - r.height/2) / r.height;
            phone.style.transition = 'transform 0.12s ease';
            phone.style.transform = 'rotate('+(2+y*3)+'deg) translateY('+(y*-10)+'px) translateX('+(x*8)+'px)';
        });
        hero.addEventListener('mouseleave', function() {
            phone.style.transition = 'transform 0.7s cubic-bezier(0.16,1,0.3,1)';
            phone.style.transform = '';
        });
    }

    /* 13. FLOATING CARD PARALLAX */
    function initFloatingParallax() {
        if (window.matchMedia('(max-width:768px)').matches) return;
        var cards = document.querySelectorAll('.floating-card');
        if (!cards.length) return;
        document.addEventListener('mousemove', function(e) {
            var xF = (e.clientX / window.innerWidth - 0.5) * 14;
            var yF = (e.clientY / window.innerHeight - 0.5) * 14;
            cards.forEach(function(c, i) {
                var d = i % 2 === 0 ? 1 : -1;
                c.style.transform = 'translateY('+(-4+yF*d*0.4)+'px) translateX('+(xF*d*0.35)+'px)';
            });
        });
    }

    /* 14. FEAT ICON HOVER */
    function initFeatIconHover() {
        document.querySelectorAll('.feat-card').forEach(function(card) {
            card.addEventListener('mouseenter', function() {
                var icon = card.querySelector('.feat-icon');
                if (!icon) return;
                icon.style.transition = 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)';
                icon.style.transform = 'scale(1.15) rotate(12deg)';
            });
            card.addEventListener('mouseleave', function() {
                var icon = card.querySelector('.feat-icon');
                if (icon) icon.style.transform = '';
            });
        });
    }

    /* 15. RANK ITEM HOVER GLOW */
    function initRankHover() {
        document.querySelectorAll('.rank-item').forEach(function(item) {
            item.addEventListener('mouseenter', function() {
                item.style.transition = 'transform 0.3s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s ease';
                item.style.transform = 'translateX(5px)';
                item.style.boxShadow = '0 4px 16px rgba(67,97,238,0.1)';
            });
            item.addEventListener('mouseleave', function() {
                item.style.transform = '';
                item.style.boxShadow = '';
            });
        });
    }

    /* 16. SMOOTH SCROLL PROGRESS BAR UPDATE */
    function initScrollProgressGlow() {
        var bar = document.getElementById('scrollProgressBar');
        if (!bar) return;
        // Ensure the ::after glow head moves with bar
        // Already handled via CSS, just trigger a repaint on load
    }

    /* 17. ACHIEVEMENT CARD HOVER BOUNCE */
    function initAchievementHover() {
        document.querySelectorAll('.achievement').forEach(function(ach) {
            ach.addEventListener('mouseenter', function() {
                ach.style.transition = 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)';
                ach.style.transform = 'translateY(-6px) scale(1.06)';
            });
            ach.addEventListener('mouseleave', function() {
                ach.style.transform = '';
            });
        });
    }

    /* 18. COURSE BADGE SPIN ON HOVER */
    function initCourseBadgeSpin() {
        document.querySelectorAll('.course-card').forEach(function(card) {
            card.addEventListener('mouseenter', function() {
                var badge = card.querySelector('.course-badge');
                if (badge) {
                    badge.style.transition = 'transform 0.45s cubic-bezier(0.34,1.56,0.64,1)';
                    badge.style.transform = 'scale(1.12) rotate(-10deg)';
                }
            });
            card.addEventListener('mouseleave', function() {
                var badge = card.querySelector('.course-badge');
                if (badge) badge.style.transform = '';
            });
        });
    }

    /* 19. SECTION REVEAL ENHANCED (add delay per sibling) */
    function initSectionRevealDelay() {
        document.querySelectorAll('.section.reveal').forEach(function(section, si) {
            // Already handled by main reveal system – add extra class for cascade
        });
    }

    /* 20. TYPEWRITER HERO HEADLINE */
    function initTypewriter() {
        // Add typing cursor to badge text
        var badge = document.querySelector('.badge');
        if (badge && !badge.classList.contains('typing-text')) {
            // Only add if not already animated
        }
    }

    /* BOOT ALL */
    function boot() {
        initRipple();
        initCursorSparkle();
        initBackToTop();
        initStaggerReveal();
        initTiltCards();
        initCounters();
        initThemeToggleSpin();
        initStatGlowBars();
        initMagneticButtons();
        initShowcaseTransition();
        initPartnerCards();
        initHeroParallax();
        initFloatingParallax();
        initFeatIconHover();
        initRankHover();
        initAchievementHover();
        initCourseBadgeSpin();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
