/**
 * UNIVERSE OF TECH — CLIENT-SIDE ANALYTICS & TELEMETRY SDK
 * Centralized, Privacy-Conscious Telemetry & Performance Reporter
 */

(() => {
    "use strict";

    if (window.UOTAnalytics) return;

    let sessionId = sessionStorage.getItem('uot_session_id');
    if (!sessionId) {
        sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
        sessionStorage.setItem('uot_session_id', sessionId);
    }

    let userConsent = true;

    function getUserId() {
        try {
            const rawUser = localStorage.getItem('uot_current_user') || localStorage.getItem('uot_user_profile');
            if (rawUser) {
                const parsed = JSON.parse(rawUser);
                if (parsed.settings && parsed.settings.analytics === false) {
                    userConsent = false;
                }
                return parsed.userId || parsed.id || 'anon_usr';
            }
        } catch (e) {
            // ignore
        }
        return 'anon_usr';
    }

    function sendPayload(endpoint, body) {
        try {
            const jsonStr = JSON.stringify(body);
            if (navigator.sendBeacon && endpoint.includes('/event')) {
                const blob = new Blob([jsonStr], { type: 'application/json' });
                navigator.sendBeacon(endpoint, blob);
                return;
            }
            fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: jsonStr,
                credentials: 'same-origin'
            }).catch(() => {});
        } catch (err) {
            // non-blocking fallback
        }
    }

    const UOTAnalytics = {
        sessionId,

        init() {
            const userId = getUserId();
            this.trackEvent('session_started', {
                referrer: document.referrer || 'direct',
                pathname: window.location.pathname,
                userAgent: navigator.userAgent
            });

            this.setupErrorListeners();
            this.setupWebVitalsObserver();
        },

        trackEvent(eventName, properties = {}) {
            const userId = getUserId();
            sendPayload('/api/analytics/event', {
                event: eventName,
                timestamp: new Date().toISOString(),
                sessionId: this.sessionId,
                userId,
                properties,
                userConsent
            });
        },

        trackPage(pageName) {
            this.trackEvent('page_viewed', { pageName, pathname: window.location.pathname });
        },

        trackLesson(action, lessonId, props = {}) {
            const event = action === 'start' ? 'lesson_started' : action === 'complete' ? 'lesson_completed' : 'lesson_activity';
            this.trackEvent(event, { lessonId, ...props });
        },

        trackQuiz(action, quizId, props = {}) {
            const event = action === 'start' ? 'quiz_started' : action === 'complete' ? 'quiz_completed' : action === 'answer' ? 'question_answered' : 'quiz_activity';
            this.trackEvent(event, { quizId, ...props });
        },

        trackError(errorType, message, stack = '', route = window.location.pathname) {
            const userId = getUserId();
            sendPayload('/api/analytics/error', {
                errorType,
                message: typeof message === 'string' ? message : JSON.stringify(message),
                stack,
                route,
                userAgent: navigator.userAgent,
                sessionId: this.sessionId,
                userId
            });
        },

        trackVitals(metric, value, rating = 'good') {
            sendPayload('/api/analytics/vitals', {
                metric,
                value,
                rating,
                page: window.location.pathname,
                deviceType: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
                sessionId: this.sessionId
            });
        },

        async getFeatureFlags() {
            try {
                const res = await fetch('/api/feature-flags', { credentials: 'same-origin' });
                if (res.ok) {
                    const data = await res.json();
                    return data.flags || {};
                }
            } catch (e) {
                // Safe Fallbacks
            }
            return {
                adaptive_quiz_mode: { enabled: true, fallbackUsed: true },
                social_leaderboard_v2: { enabled: true, fallbackUsed: true },
                dark_theme_default: { enabled: false, fallbackUsed: true }
            };
        },

        setupErrorListeners() {
            window.addEventListener('error', (evt) => {
                this.trackError('uncaught_js_error', evt.message || 'Script error', evt.error?.stack || '');
            });

            window.addEventListener('unhandledrejection', (evt) => {
                const reason = evt.reason;
                const message = reason?.message || reason || 'Unhandled Promise Rejection';
                const stack = reason?.stack || '';
                this.trackError('unhandled_promise_rejection', message, stack);
            });
        },

        setupWebVitalsObserver() {
            if (typeof PerformanceObserver === 'undefined') return;

            try {
                // LCP
                const lcpObserver = new PerformanceObserver((entryList) => {
                    const entries = entryList.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    if (lastEntry) {
                        const lcp = Math.round(lastEntry.startTime);
                        const rating = lcp <= 2500 ? 'good' : lcp <= 4000 ? 'needs-improvement' : 'poor';
                        this.trackVitals('LCP', lcp, rating);
                    }
                });
                lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

                // CLS
                let clsScore = 0;
                const clsObserver = new PerformanceObserver((entryList) => {
                    for (const entry of entryList.getEntries()) {
                        if (!entry.hadRecentInput) {
                            clsScore += entry.value;
                        }
                    }
                    const rating = clsScore <= 0.1 ? 'good' : clsScore <= 0.25 ? 'needs-improvement' : 'poor';
                    this.trackVitals('CLS', Number(clsScore.toFixed(3)), rating);
                });
                clsObserver.observe({ type: 'layout-shift', buffered: true });

                // INP
                const inpObserver = new PerformanceObserver((entryList) => {
                    const entries = entryList.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    if (lastEntry) {
                        const inp = Math.round(lastEntry.duration);
                        const rating = inp <= 200 ? 'good' : inp <= 500 ? 'needs-improvement' : 'poor';
                        this.trackVitals('INP', inp, rating);
                    }
                });
                inpObserver.observe({ type: 'first-input', buffered: true });
            } catch (err) {
                // PerformanceObserver details optional
            }
        }
    };

    window.UOTAnalytics = UOTAnalytics;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => UOTAnalytics.init());
    } else {
        UOTAnalytics.init();
    }
})();
