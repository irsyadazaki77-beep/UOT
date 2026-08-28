/**
 * UNIVERSE OF TECH - SUBSCRIPTION SERVICE
 * FASE 3 & 4 Architecture Refactoring
 */
const { PLANS } = require('../../payment-provider');
const { IS_PAYMENT_CONFIGURED, IS_PRODUCTION } = require('../config');

class SubscriptionService {
    constructor({ subscriptionStore, dbInstance, paymentProviderInstance, stripeWebhookSecret }) {
        this.subscriptionStore = subscriptionStore;
        this.dbInstance = dbInstance;
        this.paymentProviderInstance = paymentProviderInstance;
        this.stripeWebhookSecret = stripeWebhookSecret;
    }

    getStatus(userId) {
        if (!userId) return null;
        const sub = this.subscriptionStore.get(userId);
        if (!sub) return null;
        const isActive = sub.status === 'active' && Date.now() < new Date(sub.expiresAt).getTime();
        return {
            ...sub,
            isActive
        };
    }

    async createCheckout({ userId, email, planId = 'pro', protocol = 'http', host = 'localhost:3000' }) {
        if (planId !== 'pro' && planId !== 'annual') {
            const err = new Error('Plan ID tidak valid.');
            err.status = 400;
            throw err;
        }

        if (!IS_PAYMENT_CONFIGURED) {
            if (IS_PRODUCTION) {
                const err = new Error('IMPLEMENTATION READY — EXTERNAL CREDENTIAL REQUIRED');
                err.status = 503;
                err.code = 'EXTERNAL_CREDENTIAL_REQUIRED';
                throw err;
            }

            const result = await this.paymentProviderInstance.createCheckout({
                planId,
                userId,
                email,
                successUrl: `${protocol}://${host}/pro-hub.html`,
                cancelUrl: `${protocol}://${host}/payment.html?status=cancel`
            });

            if (this.dbInstance && this.dbInstance.invoices) {
                this.dbInstance.invoices.create({
                    id: result.reference,
                    userId,
                    planId,
                    amount: PLANS[planId]?.price || 0,
                    currency: 'IDR',
                    status: 'pending',
                    provider: 'sandbox'
                });
            }

            return {
                mode: 'sandbox_demo',
                isDemo: true,
                providerConfigured: false,
                message: 'Payment provider belum dikonfigurasi. Menggunakan sandbox simulasi demo tanpa kartu nyata.',
                checkoutUrl: result.checkoutUrl,
                reference: result.reference
            };
        }

        const session = await this.paymentProviderInstance.createCheckout({
            planId,
            userId,
            email,
            successUrl: `${protocol}://${host}/payment.html?session_id={CHECKOUT_SESSION_ID}&status=success`,
            cancelUrl: `${protocol}://${host}/payment.html?status=cancel`
        });

        return {
            mode: 'production',
            isDemo: false,
            providerConfigured: true,
            sessionId: session.id,
            checkoutUrl: session.url
        };
    }
}

module.exports = SubscriptionService;
