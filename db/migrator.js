/**
 * UNIVERSE OF TECH - DATABASE MIGRATION ENGINE
 * FASE 1 & 18: Deterministic, Versioned Schema & Data Migrations (Async Canonical & Multi-Dialect)
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class Migrator {
    constructor(dbAdapter) {
        this.db = dbAdapter;
    }

    _translateDialect(sql) {
        if (!sql || typeof sql !== 'string') return sql;
        if (this.db && this.db.isPostgres) {
            return sql
                .replace(/\bINTEGER\s+PRIMARY\s+KEY\s+AUTOINCREMENT\b/gi, 'SERIAL PRIMARY KEY')
                .replace(/\bINT\s+PRIMARY\s+KEY\s+AUTOINCREMENT\b/gi, 'SERIAL PRIMARY KEY')
                .replace(/PRAGMA\s+[^;]+;/gi, '');
        }
        return sql;
    }

    async runMigrations() {
        console.log('[Migrator] Starting database migrations check (async canonical)...');
        await this.ensureMigrationsTable();

        const migrationsDir = path.join(__dirname, 'migrations');
        if (fs.existsSync(migrationsDir)) {
            const entries = await fs.promises.readdir(migrationsDir);
            const sqlFiles = entries
                .filter(f => f.endsWith('.sql'))
                .sort();

            for (const file of sqlFiles) {
                const applied = await this.isMigrationApplied(file);
                if (!applied) {
                    console.log(`[Migrator] Applying SQL migration: ${file}`);
                    const filePath = path.join(migrationsDir, file);
                    let sql = await fs.promises.readFile(filePath, 'utf8');
                    sql = this._translateDialect(sql);
                    await this.db.execAsync(sql);
                    await this.recordMigration(file);
                    console.log(`[Migrator] Successfully applied ${file}`);
                }
            }
        }

        // Run data migration / seed
        await this.migrateLegacyData();
        console.log('[Migrator] All database migrations up to date.');
    }

    async ensureMigrationsTable() {
        const idCol = (this.db && this.db.isPostgres) ? 'id SERIAL PRIMARY KEY' : 'id INTEGER PRIMARY KEY AUTOINCREMENT';
        const createSql = `
            CREATE TABLE IF NOT EXISTS schema_migrations (
                ${idCol},
                migration_name TEXT NOT NULL UNIQUE,
                applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await this.db.execAsync(createSql);
    }

    async isMigrationApplied(name) {
        const row = await this.db.getAsync('SELECT id FROM schema_migrations WHERE migration_name = ?', [name]);
        return !!row;
    }

    async recordMigration(name) {
        await this.db.runAsync(
            'INSERT INTO schema_migrations (migration_name) VALUES (?) ON CONFLICT (migration_name) DO NOTHING',
            [name]
        );
    }

    async migrateJsonStoreData() {
        return await this.migrateLegacyData();
    }

    async migrateLegacyData() {
        const migrationKey = '002_json_store_to_sql_migration';
        const applied = await this.isMigrationApplied(migrationKey);
        if (applied) {
            return;
        }

        console.log('[Migrator] Migrating legacy stores to database (dialect-safe async)...');
        const dataDir = path.join(__dirname, '..', 'data');
        const dbJsonFile = path.join(dataDir, 'uot_db_store.json');
        const analyticsJsonFile = path.join(dataDir, 'uot_analytics_store.json');
        const contentDir = path.join(dataDir, 'content');

        await this.db.transactionAsync(async (tx) => {
            // 1. Migrate Users & Progress from uot_db_store.json
            if (fs.existsSync(dbJsonFile)) {
                try {
                    const raw = await fs.promises.readFile(dbJsonFile, 'utf8');
                    const data = JSON.parse(raw);

                    if (data.users && typeof data.users === 'object') {
                        for (const u of Object.values(data.users)) {
                            if (!u || !u.id || !u.email) continue;
                            await tx.runAsync(`
                                INSERT INTO users (id, username, email, password_hash, salt, role, is_pro, created_at, updated_at)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                                ON CONFLICT (id) DO NOTHING
                            `, [
                                u.id,
                                u.username || 'Learner',
                                u.email,
                                u.passwordHash || 'default',
                                u.salt || 'default',
                                u.role || 'user',
                                u.isPro ? 1 : 0,
                                u.createdAt || new Date().toISOString(),
                                u.updatedAt || new Date().toISOString()
                            ]);
                        }
                    }

                    if (data.subscriptions && typeof data.subscriptions === 'object') {
                        for (const [userId, sub] of Object.entries(data.subscriptions)) {
                            if (!userId || !sub) continue;
                            await tx.runAsync(`
                                INSERT INTO subscriptions (user_id, plan_id, status, source, starts_at, expires_at, is_trial, created_at, updated_at)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                                ON CONFLICT (user_id) DO UPDATE SET
                                    plan_id = EXCLUDED.plan_id,
                                    status = EXCLUDED.status,
                                    source = EXCLUDED.source,
                                    starts_at = EXCLUDED.starts_at,
                                    expires_at = EXCLUDED.expires_at,
                                    is_trial = EXCLUDED.is_trial,
                                    updated_at = EXCLUDED.updated_at
                            `, [
                                userId,
                                sub.planId || 'free',
                                sub.status || 'active',
                                sub.source || 'manual',
                                sub.startsAt || new Date().toISOString(),
                                sub.expiresAt || null,
                                sub.isTrial ? 1 : 0,
                                sub.createdAt || new Date().toISOString(),
                                sub.updatedAt || new Date().toISOString()
                            ]);
                        }
                    }

                    if (data.progress && typeof data.progress === 'object') {
                        for (const [userId, p] of Object.entries(data.progress)) {
                            if (!userId || !p) continue;

                            // Ensure user exists in users table
                            const userExists = await tx.getAsync('SELECT id FROM users WHERE id = ?', [userId]);
                            if (!userExists) {
                                const username = p.profile?.username || 'Pengguna Universe';
                                const email = p.profile?.email || `${userId}@uot.local`;
                                const salt = crypto.randomBytes(16).toString('hex');
                                const passwordHash = crypto.pbkdf2Sync('demo1234', salt, 100000, 64, 'sha512').toString('hex');
                                await tx.runAsync(`
                                    INSERT INTO users (id, username, email, password_hash, salt, role, is_pro)
                                    VALUES (?, ?, ?, ?, ?, ?, ?)
                                    ON CONFLICT (id) DO NOTHING
                                `, [userId, username, email, passwordHash, salt, 'user', 0]);
                            }

                            await tx.runAsync(`
                                INSERT INTO user_progress (
                                    user_id, lifetime_xp, level, coins, streak, last_active_date,
                                    streak_freeze_count, equipped_avatar, equipped_theme, equipped_accent,
                                    flagged, settings_json, personal_bests_json, daily_missions_json,
                                    weekly_missions_json, challenge_progress_json, recommendation_history_json,
                                    created_at, updated_at
                                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                                ON CONFLICT (user_id) DO UPDATE SET
                                    lifetime_xp = EXCLUDED.lifetime_xp,
                                    level = EXCLUDED.level,
                                    coins = EXCLUDED.coins,
                                    streak = EXCLUDED.streak,
                                    last_active_date = EXCLUDED.last_active_date,
                                    streak_freeze_count = EXCLUDED.streak_freeze_count,
                                    equipped_avatar = EXCLUDED.equipped_avatar,
                                    equipped_theme = EXCLUDED.equipped_theme,
                                    equipped_accent = EXCLUDED.equipped_accent,
                                    flagged = EXCLUDED.flagged,
                                    settings_json = EXCLUDED.settings_json,
                                    personal_bests_json = EXCLUDED.personal_bests_json,
                                    daily_missions_json = EXCLUDED.daily_missions_json,
                                    weekly_missions_json = EXCLUDED.weekly_missions_json,
                                    challenge_progress_json = EXCLUDED.challenge_progress_json,
                                    recommendation_history_json = EXCLUDED.recommendation_history_json,
                                    updated_at = EXCLUDED.updated_at
                            `, [
                                userId,
                                Number(p.lifetimeXp) || 0,
                                Number(p.level) || 1,
                                Number(p.coins) || 50,
                                Number(p.streak) || 0,
                                p.lastActiveDate || null,
                                Number(p.streakFreezeCount) || 0,
                                p.equippedItems?.avatar || '👨‍💻',
                                p.equippedItems?.theme || 'ocean',
                                p.equippedItems?.accent || 'ocean',
                                p.flagged ? 1 : 0,
                                JSON.stringify(p.settings || {}),
                                JSON.stringify(p.personalBests || {}),
                                JSON.stringify(p.missionProgress?.daily || {}),
                                JSON.stringify(p.missionProgress?.weekly || {}),
                                JSON.stringify(p.challengeProgress || {}),
                                JSON.stringify(p.recommendationHistory || []),
                                new Date().toISOString(),
                                p.updatedAt || new Date().toISOString()
                            ]);

                            // Completed lessons
                            if (p.learningProgress?.completedLessons && Array.isArray(p.learningProgress.completedLessons)) {
                                for (const lesId of p.learningProgress.completedLessons) {
                                    await tx.runAsync(
                                        'INSERT INTO user_completed_lessons (user_id, lesson_id, completed_at) VALUES (?, ?, ?) ON CONFLICT (user_id, lesson_id) DO NOTHING',
                                        [userId, String(lesId), new Date().toISOString()]
                                    );
                                }
                            }

                            // Achievements
                            if (p.achievements && Array.isArray(p.achievements)) {
                                for (const achId of p.achievements) {
                                    await tx.runAsync(
                                        'INSERT INTO achievements (user_id, achievement_id, unlocked_at) VALUES (?, ?, ?) ON CONFLICT (user_id, achievement_id) DO NOTHING',
                                        [userId, String(achId), new Date().toISOString()]
                                    );
                                }
                            }

                            // Inventory
                            if (p.inventory && Array.isArray(p.inventory)) {
                                for (const itmId of p.inventory) {
                                    await tx.runAsync(
                                        'INSERT INTO user_inventory (user_id, item_id, unlocked_at) VALUES (?, ?, ?) ON CONFLICT (user_id, item_id) DO NOTHING',
                                        [userId, String(itmId), new Date().toISOString()]
                                    );
                                }
                            }

                            // Processed Events / Ledger
                            if (p.processedEvents && typeof p.processedEvents === 'object') {
                                for (const [evtId, evt] of Object.entries(p.processedEvents)) {
                                    if (!evtId) continue;
                                    await tx.runAsync(`
                                        INSERT INTO progress_events (
                                            event_id, user_id, event_type, client_timestamp, server_timestamp,
                                            xp_awarded, coins_awarded, reason, payload_json, result_json
                                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                                        ON CONFLICT (user_id, event_id) DO NOTHING
                                    `, [
                                        evtId,
                                        userId,
                                        evt.eventType || 'unknown',
                                        evt.clientTimestamp || null,
                                        evt.serverTimestamp || new Date().toISOString(),
                                        Number(evt.xpAwarded) || 0,
                                        Number(evt.coinsAwarded) || 0,
                                        evt.reason || 'Migrated Event',
                                        JSON.stringify(evt.payload || {}),
                                        JSON.stringify(evt.result || {})
                                    ]);
                                }
                            }
                        }
                    }
                } catch (err) {
                    console.error('[Migrator] Error importing uot_db_store.json:', err.message);
                }
            }

            // 2. Ensure default demo user exists
            const defaultDemoUserId = 'usr_demo_7701';
            const defaultDemoEmail = 'demo@universeoftech.id';
            const existingDemo = await tx.getAsync('SELECT id FROM users WHERE id = ? OR email = ?', [defaultDemoUserId, defaultDemoEmail]);
            if (!existingDemo) {
                const salt = crypto.randomBytes(16).toString('hex');
                const passwordHash = crypto.pbkdf2Sync('demo1234', salt, 100000, 64, 'sha512').toString('hex');
                await tx.runAsync(`
                    INSERT INTO users (id, username, email, password_hash, salt, role, is_pro, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT (id) DO NOTHING
                `, [defaultDemoUserId, 'DemoLearner', defaultDemoEmail, passwordHash, salt, 'user', 0, new Date().toISOString(), new Date().toISOString()]);

                await tx.runAsync(`
                    INSERT INTO user_progress (user_id, lifetime_xp, level, coins, streak, equipped_avatar, equipped_theme, equipped_accent, settings_json)
                    VALUES (?, 0, 1, 50, 0, '👨‍💻', 'ocean', 'ocean', ?)
                    ON CONFLICT (user_id) DO NOTHING
                `, [defaultDemoUserId, JSON.stringify({ displayName: 'DemoLearner', theme: 'light', soundEnabled: true, studyMode: 'balanced', dailyGoal: 30, language: 'id', reducedMotion: false, publicProfile: true, analytics: true, showOnLeaderboard: true, privateProfile: false })]);

                await tx.runAsync(`
                    INSERT INTO user_inventory (user_id, item_id, unlocked_at)
                    VALUES (?, '👨‍💻', ?)
                    ON CONFLICT (user_id, item_id) DO NOTHING
                `, [defaultDemoUserId, new Date().toISOString()]);
            }

            // 3. Migrate Content from data/content/*.json
            if (fs.existsSync(contentDir)) {
                const domains = ['lessons', 'quizzes', 'projects', 'learningPaths', 'culture', 'books'];

                for (const domain of domains) {
                    let filePath = path.join(contentDir, `${domain}.json`);
                    if (!fs.existsSync(filePath) && (domain === 'learningPaths' || domain === 'learning-paths')) {
                        filePath = path.join(contentDir, 'learning-paths.json');
                    }
                    if (fs.existsSync(filePath)) {
                        try {
                            const fileData = await fs.promises.readFile(filePath, 'utf8');
                            const items = JSON.parse(fileData);
                            if (Array.isArray(items)) {
                                for (const item of items) {
                                    if (!item || !item.id) continue;
                                    await tx.runAsync(`
                                        INSERT INTO content (domain, id, title, status, content_json, created_at, updated_at)
                                        VALUES (?, ?, ?, ?, ?, ?, ?)
                                        ON CONFLICT (domain, id) DO UPDATE SET
                                            title = EXCLUDED.title,
                                            status = EXCLUDED.status,
                                            content_json = EXCLUDED.content_json,
                                            updated_at = EXCLUDED.updated_at
                                    `, [
                                        domain === 'learning-paths' ? 'learningPaths' : domain,
                                        item.id,
                                        item.title || item.name || item.id,
                                        item.status || 'published',
                                        JSON.stringify(item),
                                        item.createdAt || new Date().toISOString(),
                                        item.updatedAt || new Date().toISOString()
                                    ]);
                                }
                            }
                        } catch (err) {
                            console.error(`[Migrator] Error importing content ${domain}.json:`, err.message);
                        }
                    }
                }
            }

            // 4. Migrate Analytics from uot_analytics_store.json
            if (fs.existsSync(analyticsJsonFile)) {
                try {
                    const raw = await fs.promises.readFile(analyticsJsonFile, 'utf8');
                    const parsed = JSON.parse(raw);

                    if (Array.isArray(parsed.events)) {
                        for (const ev of parsed.events) {
                            if (!ev || !ev.eventName) continue;
                            await tx.runAsync(`
                                INSERT INTO analytics_events (id, event_name, session_id, user_id, properties_json, timestamp)
                                VALUES (?, ?, ?, ?, ?, ?)
                                ON CONFLICT (id) DO NOTHING
                            `, [
                                ev.id || `evt_${Math.random().toString(36).substring(2, 10)}`,
                                ev.eventName,
                                ev.sessionId || null,
                                ev.userId || null,
                                JSON.stringify(ev.properties || {}),
                                ev.timestamp || new Date().toISOString()
                            ]);
                        }
                    }

                    if (Array.isArray(parsed.errors)) {
                        for (const errItem of parsed.errors) {
                            if (!errItem || !errItem.message) continue;
                            await tx.runAsync(`
                                INSERT INTO error_telemetry (id, error_message, error_stack, url, session_id, user_id, metadata_json, timestamp)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                                ON CONFLICT (id) DO NOTHING
                            `, [
                                errItem.id || `err_${Math.random().toString(36).substring(2, 10)}`,
                                errItem.message,
                                errItem.stack || null,
                                errItem.url || null,
                                errItem.sessionId || null,
                                errItem.userId || null,
                                JSON.stringify(errItem.metadata || {}),
                                errItem.timestamp || new Date().toISOString()
                            ]);
                        }
                    }

                    if (Array.isArray(parsed.vitals)) {
                        for (const vit of parsed.vitals) {
                            if (!vit || !vit.name) continue;
                            await tx.runAsync(`
                                INSERT INTO web_vitals (id, metric_name, metric_value, rating, url, session_id, timestamp)
                                VALUES (?, ?, ?, ?, ?, ?, ?)
                                ON CONFLICT (id) DO NOTHING
                            `, [
                                vit.id || `vit_${Math.random().toString(36).substring(2, 10)}`,
                                vit.name,
                                Number(vit.value) || 0,
                                vit.rating || 'good',
                                vit.url || null,
                                vit.sessionId || null,
                                vit.timestamp || new Date().toISOString()
                            ]);
                        }
                    }

                    if (parsed.featureFlags && typeof parsed.featureFlags === 'object') {
                        for (const [key, flag] of Object.entries(parsed.featureFlags)) {
                            await tx.runAsync(`
                                INSERT INTO feature_flags (flag_key, is_enabled, fallback, description, updated_at)
                                VALUES (?, ?, ?, ?, ?)
                                ON CONFLICT (flag_key) DO UPDATE SET
                                    is_enabled = EXCLUDED.is_enabled,
                                    fallback = EXCLUDED.fallback,
                                    description = EXCLUDED.description,
                                    updated_at = EXCLUDED.updated_at
                            `, [
                                key,
                                flag.enabled ? 1 : 0,
                                flag.fallback ? 1 : 0,
                                flag.description || '',
                                new Date().toISOString()
                            ]);
                        }
                    }
                } catch (err) {
                    console.error('[Migrator] Error importing uot_analytics_store.json:', err.message);
                }
            }

            // Default feature flags if not present
            const defaultFlags = [
                ['adaptive_quiz_mode', 1, 0, 'Penyesuaian tingkat kesulitan kuis otomatis berbasis performa'],
                ['social_leaderboard_v2', 1, 1, 'Papan peringkat sosial real-time dan tantangan mingguan'],
                ['dark_theme_default', 0, 0, 'Penggunaan mode gelap sebagai tema standar'],
                ['interactive_sandbox_v2', 1, 0, 'Lingkungan eksekusi kode interaktif versi 2']
            ];
            for (const f of defaultFlags) {
                await tx.runAsync(`
                    INSERT INTO feature_flags (flag_key, is_enabled, fallback, description, updated_at)
                    VALUES (?, ?, ?, ?, ?)
                    ON CONFLICT (flag_key) DO NOTHING
                `, [f[0], f[1], f[2], f[3], new Date().toISOString()]);
            }
        });

        await this.recordMigration(migrationKey);
        console.log('[Migrator] Legacy data successfully migrated to database.');
    }
}

module.exports = Migrator;
