const CACHE_NAME = "uot-pwa-v8-2026";
const APP_SHELL = [
    "./",
    "./index.html",
    "./learning-journey.html",
    "./learning-journey.css",
    "./learning-journey.js",
    "./account-core.js",
    "./api-client.js",
    "./security-helper.js",
    "./markdown-code-helper.js",
    "./theme-init.js",
    "./tokens.css",
    "./app-shell.css",
    "./offline.html",
    "./manifest.webmanifest",
    "./logo-uot-display.webp",
    "./logo-uot-192.png",
    "./logo-uot-512.png",
    "./index-clean.css",
    "./index-clean.js",
    "./responsive-system.css",
    "./navbar-shared.css",
    "./nav-polish.css",
    "./home-navbar-fix.css",
    "./curriculum-data.js",
    "./projects.html",
    "./projects.css",
    "./projects-features.js",
    "./projects.js",
    "./sandbox-runner.html",
    "./sandbox-runner.js",
    "./materi-basic.html",
    "./learning-studio.css",
    "./materi-studio.js",
    "./certificate-pdf.js",
    "./daerah-detail.html",
    "./daerah-detail.css",
    "./daerah-detail.js",
    "./wonderful-data.js",
    "./wonderful-core.js",
    "./assets/daerah/editorial-sumatra.jpg",
    "./assets/daerah/editorial-jawa.jpg",
    "./assets/daerah/editorial-kalimantan.jpg",
    "./assets/daerah/editorial-sulawesi.jpg",
    "./assets/daerah/editorial-bali-nusa.jpg",
    "./assets/daerah/editorial-papua.jpg",
    "./assets/daerah/editorial-maluku.jpg",
    "./admin-content.html",
    "./content-engine.js"
];

// 1. Install Phase - Precache Critical Shell
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => Promise.all(APP_SHELL.map(async asset => {
                try {
                    const response = await fetch(asset, { cache: "reload" });
                    if (!response.ok) throw new Error(`HTTP ${response.status}`);
                    await cache.put(asset, response);
                } catch (error) {
                    console.warn(`[PWA SW] Precache omitted for ${asset}:`, error.message);
                }
            })))
            .then(() => self.skipWaiting())
    );
});

// 2. Activate Phase - Purge Stale Caches
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.filter(key => key !== CACHE_NAME).map(key => {
                console.log(`[PWA SW] Removing outdated cache: ${key}`);
                return caches.delete(key);
            })
        )).then(() => self.clients.claim())
    );
});

// 3. Message Event - Allow Instant SkipWaiting on User Prompt
self.addEventListener("message", event => {
    if (event.data && (event.data.type === "SKIP_WAITING" || event.data === "skipWaiting")) {
        self.skipWaiting();
    }
});

// 4. Fetch Strategy
self.addEventListener("fetch", event => {
    // Only handle GET requests
    if (event.request.method !== "GET") return;

    const url = new URL(event.request.url);

    // CRITICAL: NEVER cache sensitive API or Auth endpoints (Poin 15)
    if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/v1/") || url.pathname.includes("/auth/")) {
        return; // Let browser perform direct network request without SW caching
    }

    // A. Navigation Requests (HTML documents) - Network First with Stale Cache / Offline Fallback
    if (event.request.mode === "navigate") {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    if (response.ok) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                    }
                    return response;
                })
                .catch(async () => {
                    const cached = await caches.match(event.request);
                    if (cached) return cached;
                    const offlinePage = await caches.match("./offline.html");
                    return offlinePage || new Response("Halaman sedang offline.", {
                        status: 503,
                        headers: { "Content-Type": "text/html; charset=utf-8" }
                    });
                })
        );
        return;
    }

    // B. Static Assets (Same-Origin CSS, JS, Images, Fonts) - Stale-While-Revalidate
    if (url.origin === self.location.origin) {
        event.respondWith(
            caches.match(event.request).then(cached => {
                const networkFetch = fetch(event.request).then(response => {
                    if (response && response.status === 200) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                    }
                    return response;
                }).catch(() => null);

                // Return cached version immediately if available, while revalidating in background
                return cached || networkFetch.then(netRes => netRes || caches.match("./offline.html"));
            })
        );
        return;
    }

    // C. External CDN Assets (Google Fonts, FontAwesome) - Cache First with 30-day freshness
    if (url.hostname.includes("fonts.googleapis.com") || url.hostname.includes("fonts.gstatic.com") || url.hostname.includes("cdnjs.cloudflare.com")) {
        event.respondWith(
            caches.match(event.request).then(cached => {
                if (cached) return cached;
                return fetch(event.request).then(response => {
                    if (response && response.status === 200) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                    }
                    return response;
                });
            })
        );
    }
});
