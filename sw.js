const CACHE_NAME = "quiznation-shell-v8";
const APP_SHELL = [
    "./", "./index.html", "./learning-journey.html", "./learning-journey.css", "./learning-journey.js",
    "./account-core.js", "./api-client.js", "./offline.html", "./manifest.webmanifest", "./logo-uot-display.webp",
    "./logo-uot-192.png", "./logo-uot-512.png",
    "./index-clean.css", "./index-clean.js", "./responsive-system.css", "./navbar-shared.css",
    "./nav-polish.css", "./home-navbar-fix.css", "./curriculum-data.js", "./coursera-home.js",
    "./projects.html", "./projects.css", "./projects-features.js", "./projects.js", "./sandbox-runner.html", "./sandbox-runner.js",
    "./materi-basic.html", "./learning-studio.css", "./materi-studio.js", "./certificate-pdf.js",
    "./daerah-detail.html", "./daerah-detail.css", "./daerah-detail.js",
    "./wonderful-data.js", "./wonderful-core.js",
    "./assets/daerah/editorial-sumatra.jpg", "./assets/daerah/editorial-jawa.jpg",
    "./assets/daerah/editorial-kalimantan.jpg", "./assets/daerah/editorial-sulawesi.jpg",
    "./assets/daerah/editorial-bali-nusa.jpg", "./assets/daerah/editorial-papua.jpg",
    "./assets/daerah/editorial-maluku.jpg"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => Promise.all(APP_SHELL.map(async asset => {
                try {
                    const response = await fetch(asset, { cache: "reload" });
                    if (!response.ok) throw new Error(`HTTP ${response.status}`);
                    await cache.put(asset, response);
                } catch (error) {
                    console.warn(`[service-worker] Gagal menyimpan ${asset}:`, error);
                }
            })))
            .then(() => self.skipWaiting())
    );
});
self.addEventListener("activate", event => {
    event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
    if (event.request.method !== "GET") return;
    if (event.request.mode === "navigate") {
        event.respondWith(fetch(event.request).then(response => {
            if (response.ok) caches.open(CACHE_NAME).then(cache => cache.put(event.request, response.clone()));
            return response;
        }).catch(() => caches.match(event.request).then(cached => cached || caches.match("./offline.html"))));
        return;
    }
    event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
        if (new URL(event.request.url).origin === self.location.origin && response.ok) {
            event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put(event.request, response.clone())));
        }
        return response;
    }).catch(() => caches.match(event.request))));
});
