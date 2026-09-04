/**
 * UNIVERSE OF TECH - DATABASE BACKUP & RECOVERY ENGINE
 * FASE 18: Development & Production Backup/Restore Strategies
 */

const fs = require('fs');
const path = require('path');

class BackupService {
    constructor(dbAdapter, repositories = {}) {
        this.db = dbAdapter;
        this.repos = repositories;
        this.backupDir = path.join(__dirname, '..', 'data', 'backups');
    }

    ensureBackupDir() {
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
        }
    }

    async createSnapshot(label = 'manual') {
        this.ensureBackupDir();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `uot_snapshot_${label}_${timestamp}.json`;
        const filePath = path.join(this.backupDir, filename);

        const users = this.repos.user ? await this.repos.user.getAll(10000, 0) : [];
        const content = this.repos.content ? await this.repos.content.exportAll() : {};
        const featureFlags = this.repos.analytics ? await this.repos.analytics.getFeatureFlags() : {};
        const events = this.repos.analytics ? await this.repos.analytics.getEvents(10000) : [];

        const snapshot = {
            version: 1,
            createdAt: new Date().toISOString(),
            label,
            users,
            content,
            featureFlags,
            analyticsEventsCount: events?.length || 0
        };

        fs.writeFileSync(filePath, JSON.stringify(snapshot, null, 2), 'utf8');
        console.log(`[BackupService] Snapshot created successfully: ${filePath}`);
        return { ok: true, filePath, filename, createdAt: snapshot.createdAt };
    }

    listSnapshots() {
        this.ensureBackupDir();
        const files = fs.readdirSync(this.backupDir).filter(f => f.endsWith('.json') || f.endsWith('.sqlite'));
        return files.map(file => {
            const stat = fs.statSync(path.join(this.backupDir, file));
            return {
                filename: file,
                size: stat.size,
                createdAt: stat.mtime.toISOString()
            };
        });
    }

    async restoreFromSnapshot(filePath) {
        if (!fs.existsSync(filePath)) {
            throw new Error(`Backup file not found: ${filePath}`);
        }

        const raw = fs.readFileSync(filePath, 'utf8');
        const snapshot = JSON.parse(raw);

        if (snapshot.content && this.repos.content) {
            await this.repos.content.importBundle(snapshot.content);
        }

        console.log(`[BackupService] Restored snapshot from ${filePath}`);
        return { ok: true, message: 'Snapshot restore completed.' };
    }
}

module.exports = BackupService;
