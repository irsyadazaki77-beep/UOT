/**
 * UNIVERSE OF TECH - SUBSCRIPTION REPOSITORY
 * FASE 18: Repository Layer for Subscriptions
 */

class SubscriptionRepository {
    constructor(dbAdapter) {
        this.db = dbAdapter;
    }

    async findByUserId(userId) {
        if (!userId) return null;
        const row = await this.db.getAsync('SELECT * FROM subscriptions WHERE user_id = ?', [userId]);
        if (!row) return null;
        return this._mapSubscription(row);
    }

    async save({ userId, planId, status = 'active', source = 'manual', startsAt = new Date().toISOString(), expiresAt = null, isTrial = false, providerCustomerId = null, providerSubscriptionId = null, cancelAtPeriodEnd = 0 }) {
        const now = new Date().toISOString();
        await this.db.runAsync(`
            INSERT INTO subscriptions (user_id, plan_id, status, source, starts_at, expires_at, is_trial, provider_customer_id, provider_subscription_id, cancel_at_period_end, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET
                plan_id = excluded.plan_id,
                status = excluded.status,
                source = excluded.source,
                starts_at = excluded.starts_at,
                expires_at = excluded.expires_at,
                is_trial = excluded.is_trial,
                provider_customer_id = excluded.provider_customer_id,
                provider_subscription_id = excluded.provider_subscription_id,
                cancel_at_period_end = excluded.cancel_at_period_end,
                updated_at = excluded.updated_at
        `, [
            userId,
            planId,
            status,
            source,
            startsAt,
            expiresAt,
            isTrial ? 1 : 0,
            providerCustomerId,
            providerSubscriptionId,
            cancelAtPeriodEnd ? 1 : 0,
            now,
            now
        ]);

        return this.findByUserId(userId);
    }

    async updateStatus(userId, status) {
        if (!userId) return null;
        await this.db.runAsync('UPDATE subscriptions SET status = ?, updated_at = ? WHERE user_id = ?', [
            status,
            new Date().toISOString(),
            userId
        ]);
        return this.findByUserId(userId);
    }

    // Invoices / reference history
    async createInvoice({ id, userId, planId, amount, currency = 'IDR', status = 'pending', provider = 'sandbox' }) {
        const now = new Date().toISOString();
        await this.db.runAsync(`
            INSERT INTO payment_invoices (id, user_id, plan_id, amount, currency, status, provider, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                status = excluded.status,
                updated_at = excluded.updated_at
        `, [id, userId, planId, amount, currency, status, provider, now, now]);
    }

    async getInvoicesByUserId(userId) {
        if (!userId) return [];
        const rows = await this.db.allAsync('SELECT * FROM payment_invoices WHERE user_id = ? ORDER BY created_at DESC', [userId]);
        return rows.map(row => ({
            id: row.id,
            userId: row.user_id,
            planId: row.plan_id,
            amount: row.amount,
            currency: row.currency,
            status: row.status,
            provider: row.provider,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        }));
    }

    async getAll(limit = 100, offset = 0) {
        const rows = await this.db.allAsync('SELECT * FROM subscriptions ORDER BY created_at DESC LIMIT ? OFFSET ?', [limit, offset]);
        return rows.map(r => this._mapSubscription(r));
    }

    async getInvoiceById(id) {
        if (!id) return null;
        const row = await this.db.getAsync('SELECT * FROM payment_invoices WHERE id = ?', [id]);
        if (!row) return null;
        return {
            id: row.id,
            userId: row.user_id,
            planId: row.plan_id,
            amount: row.amount,
            currency: row.currency,
            status: row.status,
            provider: row.provider,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }

    async updateInvoiceStatus(id, status) {
        await this.db.runAsync('UPDATE payment_invoices SET status = ?, updated_at = ? WHERE id = ?', [
            status,
            new Date().toISOString(),
            id
        ]);
    }

    _mapSubscription(row) {
        return {
            userId: row.user_id,
            planId: row.plan_id,
            status: row.status,
            source: row.source,
            startsAt: row.starts_at,
            expiresAt: row.expires_at,
            isTrial: !!row.is_trial,
            providerCustomerId: row.provider_customer_id,
            providerSubscriptionId: row.provider_subscription_id,
            cancelAtPeriodEnd: !!row.cancel_at_period_end,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }
}

module.exports = SubscriptionRepository;
