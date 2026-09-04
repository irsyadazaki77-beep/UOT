/**
 * UNIVERSE OF TECH - USER REPOSITORY
 * FASE 18: Repository Layer for User Account Entities
 */

class UserRepository {
    constructor(dbAdapter) {
        this.db = dbAdapter;
    }

    async findById(id) {
        if (!id) return null;
        const row = await this.db.getAsync('SELECT * FROM users WHERE id = ?', [id]);
        return row ? this._mapUser(row) : null;
    }

    async findByEmail(email) {
        if (!email) return null;
        const row = await this.db.getAsync('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
        return row ? this._mapUser(row) : null;
    }

    async create({ id, username, email, passwordHash, salt, role = 'user', isPro = false }) {
        const now = new Date().toISOString();
        const cleanEmail = email.toLowerCase().trim();
        await this.db.runAsync(`
            INSERT INTO users (id, username, email, password_hash, salt, role, is_pro, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            id,
            username.trim(),
            cleanEmail,
            passwordHash,
            salt,
            role,
            isPro ? 1 : 0,
            now,
            now
        ]);

        return this.findById(id);
    }

    async update(id, fields = {}) {
        if (!id) return null;
        const existing = await this.findById(id);
        if (!existing) return null;

        const updates = [];
        const params = [];

        if (fields.username !== undefined) {
            updates.push('username = ?');
            params.push(fields.username);
        }
        if (fields.email !== undefined) {
            updates.push('email = ?');
            params.push(fields.email.toLowerCase().trim());
        }
        if (fields.passwordHash !== undefined) {
            updates.push('password_hash = ?');
            params.push(fields.passwordHash);
        }
        if (fields.salt !== undefined) {
            updates.push('salt = ?');
            params.push(fields.salt);
        }
        if (fields.role !== undefined) {
            updates.push('role = ?');
            params.push(fields.role);
        }
        if (fields.isPro !== undefined) {
            updates.push('is_pro = ?');
            params.push(fields.isPro ? 1 : 0);
        }

        if (updates.length === 0) return existing;

        updates.push('updated_at = ?');
        params.push(new Date().toISOString());
        params.push(id);

        await this.db.runAsync(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);
        return this.findById(id);
    }

    async delete(id) {
        if (!id) return false;
        const result = await this.db.runAsync('DELETE FROM users WHERE id = ?', [id]);
        return result.changes > 0;
    }

    async getAll(limit = 100, offset = 0) {
        const rows = await this.db.allAsync('SELECT * FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?', [limit, offset]);
        return rows.map(r => this._mapUser(r));
    }

    async count() {
        const row = await this.db.getAsync('SELECT COUNT(*) as count FROM users');
        return row ? Number(row.count) : 0;
    }

    _mapUser(row) {
        return {
            id: row.id,
            username: row.username,
            email: row.email,
            passwordHash: row.password_hash,
            salt: row.salt,
            role: row.role,
            isPro: !!row.is_pro,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }
}

module.exports = UserRepository;
