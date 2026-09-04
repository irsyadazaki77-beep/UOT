/**
 * UNIVERSE OF TECH - ANALYTICS REPOSITORY
 * FASE 18: Persistent Storage for Telemetry, Funnels, Error Logs, Web Vitals & Feature Flags
 */

class AnalyticsRepository {
    constructor(dbAdapter) {
        this.db = dbAdapter;
    }

    async recordEvent({ id, eventName, sessionId = null, userId = null, properties = {}, timestamp = new Date().toISOString() }) {
        if (!eventName) return null;
        const evtId = id || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        await this.db.runAsync(`
            INSERT INTO analytics_events (id, event_name, session_id, user_id, properties_json, timestamp)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [
            evtId,
            eventName,
            sessionId,
            userId,
            JSON.stringify(properties),
            timestamp
        ]);
        return evtId;
    }

    async recordError({ id, message, stack = null, url = null, sessionId = null, userId = null, metadata = {}, timestamp = new Date().toISOString() }) {
        if (!message) return null;
        const errId = id || `err_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        await this.db.runAsync(`
            INSERT INTO error_telemetry (id, error_message, error_stack, url, session_id, user_id, metadata_json, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            errId,
            message,
            stack,
            url,
            sessionId,
            userId,
            JSON.stringify(metadata),
            timestamp
        ]);
        return errId;
    }

    async recordAuthFailure({ ip, email, reason, timestamp = new Date().toISOString() }) {
        const masked = email ? email.replace(/(^.x?)(.*)(@.*$)/, '$1***$3') : 'unknown';
        return await this.recordError({
            message: `AUTH_FAILURE: ${reason || 'UNKNOWN'}`,
            metadata: {
                ip: ip || '127.0.0.1',
                email: masked,
                reason: reason || 'UNKNOWN',
                auditType: 'AUTH_AUDIT'
            },
            timestamp
        });
    }

    async getAuthFailures(limit = 200) {
        const errors = await this.getErrors(limit);
        return errors.filter(e => e.metadata && e.metadata.auditType === 'AUTH_AUDIT');
    }

    async recordVital({ id, name, value, rating = 'good', url = null, sessionId = null, timestamp = new Date().toISOString() }) {
        if (!name) return null;
        const vitId = id || `vit_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        await this.db.runAsync(`
            INSERT INTO web_vitals (id, metric_name, metric_value, rating, url, session_id, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            vitId,
            name,
            Number(value) || 0,
            rating,
            url,
            sessionId,
            timestamp
        ]);
        return vitId;
    }

    async getEvents(limit = 1000) {
        const rows = await this.db.allAsync('SELECT * FROM analytics_events ORDER BY timestamp DESC LIMIT ?', [limit]);
        return rows.map(r => ({
            id: r.id,
            eventName: r.event_name,
            sessionId: r.session_id,
            userId: r.user_id,
            properties: JSON.parse(r.properties_json || '{}'),
            timestamp: r.timestamp
        }));
    }

    async getErrors(limit = 200) {
        const rows = await this.db.allAsync('SELECT * FROM error_telemetry ORDER BY timestamp DESC LIMIT ?', [limit]);
        return rows.map(r => ({
            id: r.id,
            message: r.error_message,
            stack: r.error_stack,
            url: r.url,
            sessionId: r.session_id,
            userId: r.user_id,
            metadata: JSON.parse(r.metadata_json || '{}'),
            timestamp: r.timestamp
        }));
    }

    async getVitals(limit = 500) {
        const rows = await this.db.allAsync('SELECT * FROM web_vitals ORDER BY timestamp DESC LIMIT ?', [limit]);
        return rows.map(r => ({
            id: r.id,
            name: r.metric_name,
            value: r.metric_value,
            rating: r.rating,
            url: r.url,
            sessionId: r.session_id,
            timestamp: r.timestamp
        }));
    }

    async getFeatureFlags() {
        const rows = await this.db.allAsync('SELECT * FROM feature_flags');
        const flags = {};
        for (const r of rows) {
            flags[r.flag_key] = {
                key: r.flag_key,
                enabled: !!r.is_enabled,
                fallback: !!r.fallback,
                description: r.description,
                updatedAt: r.updated_at
            };
        }
        return flags;
    }

    async getFeatureFlag(key) {
        const row = await this.db.getAsync('SELECT * FROM feature_flags WHERE flag_key = ?', [key]);
        if (!row) return null;
        return {
            key: row.flag_key,
            enabled: !!row.is_enabled,
            fallback: !!row.fallback,
            description: row.description,
            updatedAt: row.updated_at
        };
    }

    async setFeatureFlag(key, { enabled, fallback = false, description = '' }) {
        const now = new Date().toISOString();
        await this.db.runAsync(`
            INSERT INTO feature_flags (flag_key, is_enabled, fallback, description, updated_at)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(flag_key) DO UPDATE SET
                is_enabled = excluded.is_enabled,
                fallback = excluded.fallback,
                description = CASE WHEN excluded.description != '' THEN excluded.description ELSE feature_flags.description END,
                updated_at = excluded.updated_at
        `, [
            key,
            enabled ? 1 : 0,
            fallback ? 1 : 0,
            description || '',
            now
        ]);
        return this.getFeatureFlag(key);
    }
}

module.exports = AnalyticsRepository;
