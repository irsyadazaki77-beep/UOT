/**
 * UNIVERSE OF TECH - PAYMENT PROVIDER ABSTRACTION
 * FASE 23: Production-Ready Subscription & Payment Provider Architecture
 */

const crypto = require('crypto');

// Plans config matching subscription-core.js
const PLANS = {
    pro: {
        id: "pro",
        name: "Pro Bulanan",
        price: 49000,
        period: "bulan",
        durationDays: 30,
        description: "Semua fitur PRO dengan tagihan bulanan."
    },
    annual: {
        id: "annual",
        name: "Pro Tahunan",
        price: 399000,
        period: "tahun",
        durationDays: 365,
        description: "Akses PRO satu tahun dengan harga terbaik."
    },
    premium: {
        id: "premium",
        name: "Pro Mentor",
        price: 99000,
        period: "bulan",
        durationDays: 30,
        description: "Seluruh benefit PRO plus simulasi review mentor."
    }
};

class PaymentProvider {
    async createCheckout({ planId, userId, email, successUrl, cancelUrl }) {
        throw new Error('Method createCheckout must be implemented');
    }

    async verifyWebhook(rawBody, headers) {
        throw new Error('Method verifyWebhook must be implemented');
    }

    async getSubscription(subscriptionId) {
        throw new Error('Method getSubscription must be implemented');
    }

    async cancelSubscription(subscriptionId) {
        throw new Error('Method cancelSubscription must be implemented');
    }
}

class SandboxProvider extends PaymentProvider {
    async createCheckout({ planId, userId, email, successUrl, cancelUrl }) {
        const reference = 'SANDBOX-' + crypto.randomBytes(4).toString('hex').toUpperCase();
        const checkoutUrl = `/payment.html?session=sandbox_demo&plan=${encodeURIComponent(planId)}&userId=${encodeURIComponent(userId)}&email=${encodeURIComponent(email)}&reference=${reference}`;
        return {
            checkoutUrl,
            reference,
            mode: 'sandbox_demo'
        };
    }

    async verifyWebhook(rawBody, headers) {
        // Safe mock validation for sandbox webhook testing
        let payload = rawBody;
        if (typeof rawBody === 'string') {
            try { payload = JSON.parse(rawBody); } catch (_) {}
        }
        return {
            id: payload.id || 'evt_sandbox_' + crypto.randomBytes(8).toString('hex'),
            type: payload.type || 'checkout.session.completed',
            data: payload.data || {}
        };
    }

    async getSubscription(subscriptionId) {
        return {
            id: subscriptionId,
            status: 'active',
            planId: 'pro',
            currentPeriodStart: new Date().toISOString(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            cancelAtPeriodEnd: false
        };
    }

    async cancelSubscription(subscriptionId) {
        return {
            id: subscriptionId,
            status: 'canceled',
            cancelAtPeriodEnd: true
        };
    }
}

class StripeProvider extends PaymentProvider {
    constructor(secretKey, webhookSecret) {
        super();
        this.stripe = require('stripe')(secretKey);
        this.webhookSecret = webhookSecret;
    }

    async createCheckout({ planId, userId, email, successUrl, cancelUrl }) {
        const plan = PLANS[planId] || PLANS.pro;
        const reference = 'STRP-' + crypto.randomBytes(4).toString('hex').toUpperCase();

        const session = await this.stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'idr',
                    product_data: {
                        name: plan.name,
                        description: plan.description,
                    },
                    unit_amount: plan.price,
                    recurring: {
                        interval: plan.period === 'tahun' ? 'year' : 'month',
                    },
                },
                quantity: 1,
            }],
            mode: 'subscription',
            customer_email: email,
            client_reference_id: userId,
            metadata: {
                userId,
                planId,
                reference
            },
            success_url: successUrl,
            cancel_url: cancelUrl,
        });

        return {
            checkoutUrl: session.url,
            reference,
            mode: 'production'
        };
    }

    async verifyWebhook(rawBody, headers) {
        const signature = headers['stripe-signature'];
        if (!signature) {
            throw new Error('Missing stripe-signature header');
        }
        return this.stripe.webhooks.constructEvent(rawBody, signature, this.webhookSecret);
    }

    async getSubscription(subscriptionId) {
        const sub = await this.stripe.subscriptions.retrieve(subscriptionId);
        return {
            id: sub.id,
            status: sub.status, // active, past_due, canceled, unpaid, etc.
            planId: sub.metadata.planId || 'pro',
            currentPeriodStart: new Date(sub.current_period_start * 1000).toISOString(),
            currentPeriodEnd: new Date(sub.current_period_end * 1000).toISOString(),
            cancelAtPeriodEnd: !!sub.cancel_at_period_end
        };
    }

    async cancelSubscription(subscriptionId) {
        const sub = await this.stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: true
        });
        return {
            id: sub.id,
            status: sub.status,
            cancelAtPeriodEnd: true
        };
    }
}

// Global Factory for Webhook Idempotency checks
function isWebhookProcessed(db, eventId) {
    if (!eventId) return false;
    const row = db.get('SELECT 1 FROM processed_webhooks WHERE event_id = ?', [eventId]);
    return !!row;
}

function markWebhookProcessed(db, eventId) {
    if (!eventId) return;
    const now = new Date().toISOString();
    db.run('INSERT INTO processed_webhooks (event_id, processed_at) VALUES (?, ?)', [eventId, now]);
}

module.exports = {
    PLANS,
    PaymentProvider,
    SandboxProvider,
    StripeProvider,
    isWebhookProcessed,
    markWebhookProcessed
};
