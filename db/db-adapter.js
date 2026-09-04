/**
 * UNIVERSE OF TECH - DATABASE ADAPTER & PERSISTENCE LAYER
 * FASE 18: Real Persistent Storage (SQLite for Local/Dev & PostgreSQL for Production)
 */

const fs = require('fs');
const path = require('path');
let DatabaseSync;
try {
    const sqliteModule = require('node:sqlite');
    DatabaseSync = sqliteModule.DatabaseSync;
} catch (err) {
    console.warn('[DBAdapter] node:sqlite not available directly, attempting fallback:', err.message);
}

function convertSql(sql) {
    if (!sql || typeof sql !== 'string') return sql;
    let paramIndex = 1;
    let inSingleQuote = false;
    let inDoubleQuote = false;
    let result = '';

    for (let i = 0; i < sql.length; i++) {
        const char = sql[i];
        if (char === "'" && !inDoubleQuote) {
            inSingleQuote = !inSingleQuote;
            result += char;
        } else if (char === '"' && !inSingleQuote) {
            inDoubleQuote = !inDoubleQuote;
            result += char;
        } else if (char === '?' && !inSingleQuote && !inDoubleQuote) {
            result += `$${paramIndex++}`;
        } else {
            result += char;
        }
    }
    return result;
}

class DBAdapter {
    constructor(options = {}) {
        this.databaseUrl = options.databaseUrl || process.env.DATABASE_URL || null;
        this.isPostgres = !!this.databaseUrl && (this.databaseUrl.startsWith('postgres://') || this.databaseUrl.startsWith('postgresql://'));
        this.sqlitePath = options.sqlitePath || process.env.SQLITE_PATH || path.join(__dirname, '..', 'data', 'uot.sqlite');
        this.driver = null;
        this.pgPool = null;
        this.init();
    }

    init() {
        if (this.isPostgres) {
            try {
                const { Pool } = require('pg');
                this.pgPool = new Pool({
                    connectionString: this.databaseUrl,
                    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
                });
                console.log('[DBAdapter] Connected to PostgreSQL Database.');
            } catch (err) {
                console.error('[DBAdapter] Failed to initialize PostgreSQL pool:', err.message);
                throw err;
            }
        } else {
            const dir = path.dirname(this.sqlitePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            if (!DatabaseSync) {
                throw new Error('SQLite DatabaseSync is not supported in this Node runtime.');
            }

            const openDatabase = () => {
                const driver = new DatabaseSync(this.sqlitePath);
                driver.exec('PRAGMA foreign_keys = ON;');
                try {
                    driver.exec('PRAGMA journal_mode = WAL;');
                } catch (_) {}
                driver.exec('PRAGMA synchronous = NORMAL;');
                return driver;
            };

            try {
                this.driver = openDatabase();
                console.log(`[DBAdapter] Connected to SQLite Database at ${this.sqlitePath} (WAL Mode enabled).`);
            } catch (sqliteErr) {
                console.error(`[DBAdapter] SQLite database open/init failed (${sqliteErr.message}). Initiating auto-recovery...`);
                try {
                    if (this.driver && typeof this.driver.close === 'function') {
                        try { this.driver.close(); } catch (_) {}
                    }
                    this.driver = null;

                    // Remove or rotate corrupted files
                    const walPath = `${this.sqlitePath}-wal`;
                    const shmPath = `${this.sqlitePath}-shm`;
                    if (fs.existsSync(walPath)) try { fs.unlinkSync(walPath); } catch (_) {}
                    if (fs.existsSync(shmPath)) try { fs.unlinkSync(shmPath); } catch (_) {}
                    if (fs.existsSync(this.sqlitePath)) try { fs.unlinkSync(this.sqlitePath); } catch (_) {}

                    this.driver = openDatabase();
                    console.log(`[DBAdapter] SQLite Database successfully recovered and recreated at ${this.sqlitePath}.`);
                } catch (recoveryErr) {
                    console.error('[DBAdapter] Fatal SQLite recovery error:', recoveryErr.message);
                    throw recoveryErr;
                }
            }
        }
    }

    exec(sql) {
        if (this.isPostgres) {
            throw new Error('Synchronous exec is only available in SQLite mode. Use execAsync for PostgreSQL.');
        }
        return this.driver.exec(sql);
    }

    async execAsync(sql) {
        if (this.isPostgres) {
            const client = await this.pgPool.connect();
            try {
                await client.query(sql);
            } finally {
                client.release();
            }
        } else {
            this.driver.exec(sql);
        }
    }

    prepare(sql) {
        if (this.isPostgres) {
            throw new Error('prepare() is only available in SQLite mode. Use query() / queryAsync() for generic queries.');
        }
        return this.driver.prepare(sql);
    }

    get(sql, params = []) {
        if (this.isPostgres) {
            throw new Error('Synchronous get() is only available in SQLite mode. Use getAsync().');
        }
        const stmt = this.driver.prepare(sql);
        return stmt.get(...params);
    }

    all(sql, params = []) {
        if (this.isPostgres) {
            throw new Error('Synchronous all() is only available in SQLite mode. Use allAsync().');
        }
        const stmt = this.driver.prepare(sql);
        return stmt.all(...params);
    }

    run(sql, params = []) {
        if (this.isPostgres) {
            throw new Error('Synchronous run() is only available in SQLite mode. Use runAsync().');
        }
        const stmt = this.driver.prepare(sql);
        return stmt.run(...params);
    }

    async getAsync(sql, params = []) {
        if (this.isPostgres) {
            const pgSql = convertSql(sql);
            const result = await this.pgPool.query(pgSql, params);
            return result.rows[0] || null;
        } else {
            return this.get(sql, params);
        }
    }

    async allAsync(sql, params = []) {
        if (this.isPostgres) {
            const pgSql = convertSql(sql);
            const result = await this.pgPool.query(pgSql, params);
            return result.rows;
        } else {
            return this.all(sql, params);
        }
    }

    async runAsync(sql, params = []) {
        if (this.isPostgres) {
            const pgSql = convertSql(sql);
            const result = await this.pgPool.query(pgSql, params);
            return { changes: result.rowCount };
        } else {
            return this.run(sql, params);
        }
    }

    /**
     * Executes a callback within a strict ACID transaction with automatic rollback on error.
     * Supports nested transactions via SAVEPOINTs.
     */
    transaction(fn) {
        if (this.isPostgres) {
            throw new Error('Use transactionAsync() for PostgreSQL.');
        }

        if (this._inTransaction) {
            // Nested transaction: use SAVEPOINT
            const spId = `sp_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
            this.driver.exec(`SAVEPOINT ${spId}`);
            try {
                const result = fn(this);
                this.driver.exec(`RELEASE SAVEPOINT ${spId}`);
                return result;
            } catch (err) {
                this.driver.exec(`ROLLBACK TO SAVEPOINT ${spId}`);
                throw err;
            }
        }

        this._inTransaction = true;
        this.driver.exec('BEGIN');
        try {
            const result = fn(this);
            this.driver.exec('COMMIT');
            return result;
        } catch (err) {
            this.driver.exec('ROLLBACK');
            throw err;
        } finally {
            this._inTransaction = false;
        }
    }

    async transactionAsync(fn) {
        if (this.isPostgres) {
            const client = await this.pgPool.connect();
            const txWrapper = {
                get: async (sql, params = []) => {
                    const res = await client.query(convertSql(sql), params);
                    return res.rows[0] || null;
                },
                getAsync: async (sql, params = []) => {
                    const res = await client.query(convertSql(sql), params);
                    return res.rows[0] || null;
                },
                all: async (sql, params = []) => {
                    const res = await client.query(convertSql(sql), params);
                    return res.rows;
                },
                allAsync: async (sql, params = []) => {
                    const res = await client.query(convertSql(sql), params);
                    return res.rows;
                },
                run: async (sql, params = []) => {
                    const res = await client.query(convertSql(sql), params);
                    return { changes: res.rowCount };
                },
                runAsync: async (sql, params = []) => {
                    const res = await client.query(convertSql(sql), params);
                    return { changes: res.rowCount };
                },
                exec: async (sql) => {
                    await client.query(sql);
                },
                execAsync: async (sql) => {
                    await client.query(sql);
                }
            };
            try {
                await client.query('BEGIN');
                const result = await fn(txWrapper);
                await client.query('COMMIT');
                return result;
            } catch (err) {
                await client.query('ROLLBACK');
                throw err;
            } finally {
                client.release();
            }
        } else {
            const self = this;
            const txWrapper = {
                get: (sql, params = []) => self.get(sql, params),
                getAsync: async (sql, params = []) => self.get(sql, params),
                all: (sql, params = []) => self.all(sql, params),
                allAsync: async (sql, params = []) => self.all(sql, params),
                run: (sql, params = []) => self.run(sql, params),
                runAsync: async (sql, params = []) => self.run(sql, params),
                exec: (sql) => self.exec(sql),
                execAsync: async (sql) => self.exec(sql)
            };

            if (this._inTx) {
                return await fn(txWrapper);
            }

            this._inTx = true;
            this.driver.exec('BEGIN');
            try {
                const result = await fn(txWrapper);
                this.driver.exec('COMMIT');
                return result;
            } catch (err) {
                try { this.driver.exec('ROLLBACK'); } catch (_) {}
                throw err;
            } finally {
                this._inTx = false;
            }
        }
    }

    close() {
        if (this.isPostgres && this.pgPool) {
            this.pgPool.end();
        } else if (this.driver) {
            this.driver.close();
        }
    }
}

// Global Singleton Database Instance
let globalDbAdapter = null;

function getDb(options = {}) {
    if (!globalDbAdapter) {
        globalDbAdapter = new DBAdapter(options);
    }
    return globalDbAdapter;
}

module.exports = {
    DBAdapter,
    getDb
};
