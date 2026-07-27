/* ==========================================================================
   MODERN UI POLISH - INTERACTIVE PARTICLE ENGINE & PHYSICS v4.0
   Universe Of Tech - High-Density Enterprise & Ultra-Smooth Micro-interactions
   ========================================================================== */

(function() {
    'use strict';

    // List of celebration emojis and sparkles for burst effects
    const BURST_PARTICLES = ['✨', '⭐', '⚡', '🔥', '💫', '🎉', '🚀', '💡', '🌟'];
    const GREEN_PARTICLES = ['✨', '🟢', '⭐', '🔥', '💯', '🏆'];
    const BLUE_PARTICLES  = ['✨', '🔵', '⚡', '💡', '🚀', '💎'];

    /**
     * Spawns a burst of floating celebration particles at the given (x, y) coordinates
     */
    function spawnParticleBurst(x, y, customList = null, count = 7) {
        const list = customList || BURST_PARTICLES;

        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'celebration-particle';
            particle.textContent = list[Math.floor(Math.random() * list.length)];

            // Randomize trajectory (angle and distance)
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 80 + 40;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance - 30; // slight upward bias
            const trot = (Math.random() - 0.5) * 360;

            particle.style.setProperty('--tx', `${tx}px`);
            particle.style.setProperty('--ty', `${ty}px`);
            particle.style.setProperty('--trot', `${trot}deg`);
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;

            document.body.appendChild(particle);

            // Remove after animation completes
            particle.addEventListener('animationend', () => {
                particle.remove();
            });
        }
    }

    /**
     * Attach particle bursts to all primary buttons and interactive elements
     */
    function initClickBursts() {
        // Primary Buttons & Explore
        document.querySelectorAll('.btn-primary, .btn-explore, .cta-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX || (rect.left + rect.width / 2);
                const y = e.clientY || (rect.top + rect.height / 2);
                spawnParticleBurst(x, y, BLUE_PARTICLES, 8);
            });
        });

        // Demo Quiz Options & Diagnostic Pills
        document.querySelectorAll('.demo-opt, .diag-pill, .showcase-tab').forEach(el => {
            el.addEventListener('click', (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX || (rect.left + rect.width / 2);
                const y = e.clientY || (rect.top + rect.height / 2);
                spawnParticleBurst(x, y, GREEN_PARTICLES, 6);
            });
        });

        // Claim Streak Demo Button
        const streakBtn = document.getElementById('claimStreakBtn');
        if (streakBtn) {
            streakBtn.addEventListener('click', (e) => {
                const rect = streakBtn.getBoundingClientRect();
                const x = e.clientX || (rect.left + rect.width / 2);
                const y = e.clientY || (rect.top + rect.height / 2);
                spawnParticleBurst(x, y, ['🔥', '✨', '⚡', '🏆', '💥'], 12);
            });
        }
    }

    /**
     * Enhanced Magnetic Mouse Tracking for Showcase Display & All Bento Cards
     */
    function initMagneticGlows() {
        if (window.matchMedia('(max-width: 768px)').matches || 'ontouchstart' in window) return;

        const cards = document.querySelectorAll('.feat-card, .program-card, .course-card, .pricing-card, .testimonial-card, .outcome-card, .team-card, .showcase-display, .diagnostic-card, .about-card, .contact-info-card, .stat-card, .bento-widget');
        
        cards.forEach(card => {
            // Add bento-spotlight class automatically for border/background glow
            card.classList.add('bento-spotlight');

            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                // Set dynamic CSS properties for pseudo-element highlight
                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);

                // Create a dynamic radial glow highlight following mouse position
                card.style.background = `radial-gradient(600px circle at ${x}px ${y}px, rgba(79, 140, 255, 0.08), transparent 40%), var(--card-bg, #ffffff)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.background = '';
            });
        });
    }

    /**
     * Add subtle floating tilt damping to Hero Phone Mockup & Bento Widgets
     */
    function initPhoneInteractiveTilt() {
        if (window.matchMedia('(max-width: 768px)').matches || 'ontouchstart' in window) return;

        const phone = document.querySelector('.phone');
        const hero = document.querySelector('.hero');
        const widget1 = document.querySelector('.widget-1');
        const widget2 = document.querySelector('.widget-2');
        if (!phone || !hero) return;

        hero.addEventListener('mousemove', (e) => {
            const rect = hero.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const deltaX = (e.clientX - centerX) / (rect.width / 2);
            const deltaY = (e.clientY - centerY) / (rect.height / 2);

            // Apply smooth 3D perspective tilt to phone and opposing parallax to widgets
            phone.style.transform = `perspective(1000px) rotateY(${deltaX * 8}deg) rotateX(${-deltaY * 8}deg) translateY(-8px)`;
            if (widget1) widget1.style.transform = `translate(${-deltaX * 15}px, ${-deltaY * 15}px) scale(1.03)`;
            if (widget2) widget2.style.transform = `translate(${deltaX * 18}px, ${deltaY * 18}px) scale(1.03)`;
        });

        hero.addEventListener('mouseleave', () => {
            phone.style.transform = '';
            if (widget1) widget1.style.transform = '';
            if (widget2) widget2.style.transform = '';
        });
    }

    /**
     * Floating Pill Navbar Scroll Listener
     */
    function initFloatingNavbar() {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;

        window.addEventListener('scroll', () => {
            if (window.scrollY > 20) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    /**
     * Cmd+K / Ctrl+K Quick Search Shortcut
     */
    function initSearchShortcut() {
        const searchInput = document.getElementById('navSearchInput');
        if (!searchInput) return;

        // Add visual shortcut pill inside search bar if not already present
        const wrapper = searchInput.parentElement;
        if (wrapper && !wrapper.querySelector('.kbd-shortcut')) {
            const kbd = document.createElement('span');
            kbd.className = 'kbd-shortcut';
            kbd.textContent = navigator.platform.toUpperCase().indexOf('MAC') >= 0 ? '⌘K' : 'Ctrl+K';
            wrapper.appendChild(kbd);
        }

        window.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                searchInput.focus();
                // Select all text when focused via shortcut
                searchInput.select();
                // Subtle celebratory sparkle on search open
                const rect = searchInput.getBoundingClientRect();
                spawnParticleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, ['🔍', '✨', '⚡', '💡'], 5);
            }
        });
    }

    /**
     * Automatically trigger a welcome sparkle burst on load
     */
    function triggerWelcomeSparkle() {
        if (document.body.dataset.page === 'index') return;
        setTimeout(() => {
            const title = document.querySelector('.hero h1');
            if (title) {
                const rect = title.getBoundingClientRect();
                spawnParticleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, ['✨', '🚀', '💫', '⭐'], 10);
            }
        }, 800);
    }

    // Initialize all modern interactive polish engines on DOM ready
    function bootModernPolish() {
        try { initClickBursts(); } catch (e) { console.warn('initClickBursts:', e); }
        try { initMagneticGlows(); } catch (e) { console.warn('initMagneticGlows:', e); }
        try { initPhoneInteractiveTilt(); } catch (e) { console.warn('initPhoneInteractiveTilt:', e); }
        try { initFloatingNavbar(); } catch (e) { console.warn('initFloatingNavbar:', e); }
        try { initSearchShortcut(); } catch (e) { console.warn('initSearchShortcut:', e); }
        try { triggerWelcomeSparkle(); } catch (e) { console.warn('triggerWelcomeSparkle:', e); }
        console.log('✨ Modern UI Polish & Particle Engine v4.0 Active');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootModernPolish);
    } else {
        bootModernPolish();
    }
})();
