/* ============================================================
   MEGA ANIMATION PACK FOR MATERI — Smooth & Micro-interactions
   Universe Of Tech - materi.html
   ============================================================ */
(function() {
    'use strict';

    /* 1. BUTTON RIPPLE EFFECT */
    function initRipple() {
        var rippleSelectors = '.btn, .filter-btn, .drill-option, .sandbox-tab-btn, .quick-chip, .kanban-btn, .sound-toggle-btn, .theme-toggle-btn';
        document.body.addEventListener('click', function(e) {
            var btn = e.target.closest(rippleSelectors);
            if (!btn) return;
            
            var rect = btn.getBoundingClientRect();
            var x = e.clientX - rect.left;
            var y = e.clientY - rect.top;
            
            var ripple = document.createElement('span');
            ripple.className = 'ripple-circle';
            var size = Math.max(rect.width, rect.height) * 2.5;
            
            ripple.style.cssText = 'position:absolute;border-radius:50%;animation:rippleAnim 0.6s linear forwards;background:rgba(255,255,255,0.35);pointer-events:none;z-index:10;width:' + size + 'px;height:' + size + 'px;left:' + (x - size/2) + 'px;top:' + (y - size/2) + 'px;';
            btn.appendChild(ripple);
            
            ripple.addEventListener('animationend', function() {
                ripple.remove();
            });
        });
    }

    /* 2. CURSOR SPARKLE EFFECT (Desktop Only) */
    function initCursorSparkle() {
        if (window.matchMedia('(max-width: 768px)').matches || 'ontouchstart' in window) return;
        var colors = ['#32d66b', '#4f8cff', '#ffd166', '#ff9f43', '#8b5cf6', '#ff4d6d'];
        var lastSparkTime = 0;
        
        document.addEventListener('mousemove', function(e) {
            var now = Date.now();
            if (now - lastSparkTime < 75) return;
            lastSparkTime = now;
            
            var spark = document.createElement('div');
            spark.className = 'cursor-spark';
            var size = Math.random() * 8 + 4;
            spark.style.cssText = 'width:' + size + 'px;height:' + size + 'px;left:' + e.clientX + 'px;top:' + e.clientY + 'px;background:' + colors[Math.floor(Math.random() * colors.length)] + ';opacity:' + (Math.random() * 0.45 + 0.3) + ';';
            document.body.appendChild(spark);
            
            spark.addEventListener('animationend', function() {
                spark.remove();
            });
        });
    }

    /* 3. DYNAMIC BACK TO TOP BUTTON */
    function initBackToTop() {
        var btn = document.getElementById('backToTop');
        if (!btn) {
            btn = document.createElement('button');
            btn.id = 'backToTop';
            btn.title = 'Kembali ke Atas';
            btn.setAttribute('aria-label', 'Kembali ke Atas');
            btn.textContent = '↑';
            document.body.appendChild(btn);
        }
        
        window.addEventListener('scroll', function() {
            if (window.scrollY > 400) {
                btn.classList.add('visible');
            } else {
                btn.classList.remove('visible');
            }
        }, { passive: true });
        
        btn.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* 4. STAGGER REVEAL FOR LISTS & GRIDS */
    function initStaggerReveal() {
        var targets = [
            '.module-grid', '.learning-stats', '.timeline',
            '.check-list', '.glossary-grid', '.planner-layout',
            '.study-controls', '.detail-meta', '.detail-list'
        ];
        
        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('stagger-reveal', 'revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08 });
        
        document.querySelectorAll(targets.join(',')).forEach(function(el) {
            el.classList.add('stagger-reveal');
            observer.observe(el);
        });
    }

    /* 5. 3D TILT EFFECT ON INTERACTIVE CARDS (Desktop Only) */
    function initTiltCards() {
        if (window.matchMedia('(max-width: 768px)').matches) return;
        var cards = document.querySelectorAll(
            '.module-card, .path-card, .glossary-card, .check-card, .planner-card, .drill-card, .learning-stat'
        );
        
        cards.forEach(function(card) {
            card.addEventListener('mousemove', function(e) {
                var rect = card.getBoundingClientRect();
                var x = e.clientX - rect.left;
                var y = e.clientY - rect.top;
                
                var cx = rect.width / 2;
                var cy = rect.height / 2;
                
                var rotX = ((y - cy) / cy) * -4.5;
                var rotY = ((x - cx) / cx) * 4.5;
                
                card.style.transition = 'transform 0.1s ease';
                card.style.transform = 'perspective(900px) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg) translateY(-5px) scale(1.015)';
                
                var mouseXPct = (x / rect.width * 100).toFixed(1);
                var mouseYPct = (y / rect.height * 100).toFixed(1);
                card.style.setProperty('--mouse-x', mouseXPct + '%');
                card.style.setProperty('--mouse-y', mouseYPct + '%');
            });
            
            card.style.position = 'relative';
            
            card.addEventListener('mouseleave', function() {
                card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
                card.style.transform = '';
            });
        });
    }

    /* 6. MAGNETIC BUTTONS (Desktop Only) */
    function initMagneticButtons() {
        if (window.matchMedia('(max-width: 768px)').matches) return;
        document.querySelectorAll('.btn-primary, .btn-blue').forEach(function(btn) {
            btn.addEventListener('mousemove', function(e) {
                var r = btn.getBoundingClientRect();
                var dx = (e.clientX - r.left - r.width / 2) * 0.12;
                var dy = (e.clientY - r.top - r.height / 2) * 0.12;
                btn.style.transform = 'translateY(-3px) translate(' + dx + 'px, ' + dy + 'px)';
            });
            btn.addEventListener('mouseleave', function() {
                btn.style.transform = '';
            });
        });
    }

    /* 7. THEME TOGGLE SPIN ANIMATION */
    function initThemeToggleSpin() {
        var btn = document.getElementById('themeToggleBtn');
        if (!btn) return;
        btn.addEventListener('click', function() {
            btn.classList.add('spinning');
            btn.addEventListener('animationend', function() {
                btn.classList.remove('spinning');
            }, { once: true });
        });
    }

    /* 8. STAT CARD XP GLOW BAR INJECTION */
    function initStatGlowBars() {
        document.querySelectorAll('.learning-stat').forEach(function(card) {
            if (!card.querySelector('.stat-glow-bar')) {
                var bar = document.createElement('div');
                bar.className = 'stat-glow-bar';
                card.appendChild(bar);
            }
        });
    }

    /* 9. WIGGLE ON CHECKBOX CLICK */
    function initCheckboxWiggle() {
        document.querySelectorAll('.check-item').forEach(function(item) {
            var checkbox = item.querySelector('input[type="checkbox"]');
            if (!checkbox) return;
            
            checkbox.addEventListener('change', function() {
                item.style.transform = 'scale(0.96) translateX(4px)';
                setTimeout(function() {
                    item.style.transform = '';
                }, 180);
            });
        });
    }

    /* 10. DYNAMIC SCALE PULSE ON WORKPLACE TABS */
    function initSandboxTabPulse() {
        document.querySelectorAll('.sandbox-tab-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var arena = document.querySelector('.study-os');
                if (!arena) return;
                arena.style.transition = 'transform 0.15s ease';
                arena.style.transform = 'scale(0.985)';
                setTimeout(function() {
                    arena.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
                    arena.style.transform = 'scale(1)';
                }, 150);
            });
        });
    }

    /* 11. GLOSSARY TERM CARD QUICK ZOOM */
    function initGlossaryZoom() {
        document.querySelectorAll('.term').forEach(function(card) {
            card.addEventListener('mouseenter', function() {
                var span = card.querySelector('span');
                if (span) {
                    span.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
                    span.style.transform = 'translateY(1px)';
                }
            });
            card.addEventListener('mouseleave', function() {
                var span = card.querySelector('span');
                if (span) span.style.transform = '';
            });
        });
    }

    /* 12. ANIME PRE-LOADED CONCEALER FOR SEARCH CHIPS */
    function initSearchChipBounce() {
        document.querySelectorAll('.quick-chip').forEach(function(chip) {
            chip.addEventListener('mouseenter', function() {
                chip.style.transform = 'scale(1.05) translateY(-2px)';
            });
            chip.style.transition = 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)';
            chip.addEventListener('mouseleave', function() {
                chip.style.transform = '';
            });
        });
    }

    /* BOOT ALL ANIMATIONS */
    function bootAll() {
        initRipple();
        initCursorSparkle();
        initBackToTop();
        initStaggerReveal();
        initTiltCards();
        initMagneticButtons();
        initThemeToggleSpin();
        initStatGlowBars();
        initCheckboxWiggle();
        initSandboxTabPulse();
        initGlossaryZoom();
        initSearchChipBounce();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootAll);
    } else {
        bootAll();
    }
})();
