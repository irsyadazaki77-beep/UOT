/**
 * UNIVERSE OF TECH - PRODUCTION HTTP SERVER ENTRYPOINT
 * FASE 3: Thin, Hardened Application Bootstrap
 */
const { createApp } = require('./server/app');
const { PORT, APP_ENV, IS_PRODUCTION } = require('./server/config');
const { dbInstance } = require('./server-db');

// Fail fast in production if ADMIN_KEY is insecure
if (IS_PRODUCTION) {
    const adminKey = process.env.ADMIN_KEY;
    if (!adminKey || adminKey.trim() === '' || adminKey === 'uot-admin-secret-key-2026') {
        console.error('FATAL: Konfigurasi ADMIN_KEY tidak valid pada mode produksi. ADMIN_KEY wajib disetel via environment.');
        process.exit(1);
    }
}

const app = createApp();

let server = null;
if (require.main === module) {
    server = app.listen(PORT, '0.0.0.0', () => {
        console.log(`[UniverseOfTech] Server successfully listening on http://0.0.0.0:${PORT} [${APP_ENV}]`);
    });

    // Graceful Shutdown
    const handleShutdown = (signal) => {
        console.log(`[UniverseOfTech] Received ${signal}. Starting graceful shutdown...`);
        if (server) {
            server.close(() => {
                console.log('[UniverseOfTech] HTTP server closed.');
                try {
                    if (dbInstance && dbInstance.db && typeof dbInstance.db.close === 'function') {
                        dbInstance.db.close();
                        console.log('[UniverseOfTech] Database connection closed.');
                    }
                } catch (err) {
                    console.error('[UniverseOfTech] Error closing database:', err.message);
                }
                process.exit(0);
            });
        } else {
            process.exit(0);
        }
    };

    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));
}

module.exports = app;
