/**
 * UNIVERSE OF TECH - SESSION REPOSITORY
 * FASE 18: Persistent Session Store for Reliable Authentication
 */

class SessionRepository {
    constructor(dbAdapter) {
        this.db = dbAdapter;
    }

    async create({ token, userId, csrfToken = null, role = 'user', isPro = false, maxAgeMs = 7 * 24 * 60 * 60 * 1000 }) {
        const now = new Date();
        const expiresAt = new Date(now.getTime() + maxAgeMs).toISOString();
        const nowStr = now.toISOString();

        await this.db.runAsync(`
            INSERT INTO sessions (token, user_id, csrf_token, role, is_pro, expires_at, created_at, last_seen_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            token,
            userId,
            csrfToken || token,
            role,
            isPro ? 1 : 0,
            expiresAt,
            nowStr,
            nowStr
        ]);

        return this.findByToken(token);
    }

    async findByToken(token) {
        if (!token) return null;
        const row = await this.db.getAsync(`
            SELECT s.*, u.username, u.email
            FROM sessions s
            JOIN users u ON s.user_id = u.id
            WHERE s.token = ?
        `, [token]);

        if (!row) return null;

        // Check expiration
        if (new Date(row.expires_at).getTime() < Date.now()) {
            await this.delete(token);
            return null;
        }

        return {
            token: row.token,
            userId: row.user_id,
            csrfToken: row.csrf_token || row.token,
            role: row.role,
            isPro: !!row.is_pro,
            username: row.username,
            email: row.email,
            expiresAt: row.expires_at,
            createdAt: row.created_at,
            lastSeenAt: row.last_seen_at
        };
    }

    async touch(token) {
        if (!token) return;
        await this.db.runAsync('UPDATE sessions SET last_seen_at = ? WHERE token = ?', [
            new Date().toISOString(),
            token
        ]);
    }

    async delete(token) {
        if (!token) return false;
        const result = await this.db.runAsync('DELETE FROM sessions WHERE token = ?', [token]);
        return result.changes > 0;
    }

    async deleteByUserId(userId) {
        if (!userId) return false;
        const result = await this.db.runAsync('DELETE FROM sessions WHERE user_id = ?', [userId]);
        return result.changes > 0;
    }

    async cleanExpired() {
        const result = await this.db.runAsync('DELETE FROM sessions WHERE expires_at < ?', [new Date().toISOString()]);
        return result.changes;
    }
}

module.exports = SessionRepository;
