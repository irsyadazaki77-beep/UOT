/**
 * Universe Of Tech - Subscription Controller
 */
const crypto = require('crypto');
const { PLANS } = require('../../payment-provider');
const { IS_PAYMENT_CONFIGURED, IS_PRODUCTION } = require('../config');

class SubscriptionController {
    constructor({ subscriptionStore, dbInstance, paymentProviderInstance, stripeWebhookSecret }) {
        this.subscriptionStore = subscriptionStore;
        this.dbInstance = dbInstance;
        this.paymentProviderInstance = paymentProviderInstance;
        this.stripeWebhookSecret = stripeWebhookSecret;
    }

    verify = (req, res) => {
        if (!req.user) {
            return res.json({
                ok: true,
                active: false,
                status: 'unauthenticated',
                isPro: false,
                message: 'Pengguna belum terautentikasi.'
            });
        }

        const sub = this.subscriptionStore.get(req.user.id);
        if (!sub || sub.status !== 'active' || Date.now() > new Date(sub.expiresAt).getTime()) {
            return res.json({
                ok: true,
                active: false,
                status: 'inactive',
                isPro: false,
                message: 'Tidak ada keanggotaan PRO aktif atau sudah kedaluwarsa.',
                isDemo: !IS_PAYMENT_CONFIGURED
            });
        }

        return res.json({
            ok: true,
            active: true,
            status: sub.status,
            isPro: true,
            planId: sub.planId,
            invoice: sub.providerSubscriptionId || sub.userId,
            expiresAt: new Date(sub.expiresAt).toISOString(),
            source: sub.source,
            isDemo: sub.source === 'sandbox_demo' || sub.source === 'sandbox',
            cancelAtPeriodEnd: !!sub.cancelAtPeriodEnd
        });
    };

    checkout = async (req, res) => {
        const { planId = 'pro', source = 'direct' } = req.body || {};

        if (planId !== 'pro' && planId !== 'annual') {
            return res.status(400).json({ status: 'error', message: 'Plan ID tidak valid.' });
        }

        if (!req.user) {
            return res.status(401).json({ status: 'error', message: 'Auth required' });
        }

        if (!IS_PAYMENT_CONFIGURED) {
            if (IS_PRODUCTION) {
                return res.status(503).json({
                    status: 'error',
                    error: 'EXTERNAL_CREDENTIAL_REQUIRED',
                    message: 'IMPLEMENTATION READY — EXTERNAL CREDENTIAL REQUIRED'
                });
            }

            const result = await this.paymentProviderInstance.createCheckout({
                planId,
                userId: req.user.id,
                email: req.user.email,
                successUrl: `${req.protocol}://${req.get('host')}/pro-hub.html`,
                cancelUrl: `${req.protocol}://${req.get('host')}/payment.html?status=cancel`
            });

            this.dbInstance.invoices.create({
                id: result.reference,
                userId: req.user.id,
                planId,
                amount: PLANS[planId]?.price || 0,
                currency: 'IDR',
                status: 'pending',
                provider: 'sandbox'
            });

            return res.json({
                status: 'ok',
                mode: 'sandbox_demo',
                isDemo: true,
                providerConfigured: false,
                message: 'Payment provider belum dikonfigurasi. Menggunakan sandbox simulasi demo tanpa kartu nyata.',
                checkoutUrl: result.checkoutUrl,
                reference: result.reference
            });
        }

        try {
            const successUrl = `${req.protocol}://${req.get('host')}/pro-hub.html?session_id={CHECKOUT_SESSION_ID}`;
            const cancelUrl = `${req.protocol}://${req.get('host')}/payment.html?status=cancel`;

            const result = await this.paymentProviderInstance.createCheckout({
                planId,
                userId: req.user.id,
                email: req.user.email,
                successUrl,
                cancelUrl
            });

            this.dbInstance.invoices.create({
                id: result.reference,
                userId: req.user.id,
                planId,
                amount: PLANS[planId]?.price || 0,
                currency: 'IDR',
                status: 'pending',
                provider: 'stripe'
            });

            return res.json({
                status: 'ok',
                mode: 'production',
                isDemo: false,
                providerConfigured: true,
                checkoutUrl: result.checkoutUrl,
                reference: result.reference
            });
        } catch (err) {
            console.error('Stripe checkout error:', err.message);
            return res.status(500).json({
                status: 'error',
                message: 'Gagal membuat checkout session: ' + err.message
            });
        }
    };

    sandboxActivate = (req, res) => {
        if (IS_PRODUCTION) {
            return res.status(403).json({
                ok: false,
                error: 'SANDBOX_DISABLED',
                message: 'Aktivasi sandbox tidak diizinkan pada environment produksi.'
            });
        }

        const { planId = 'pro', promoCode = '' } = req.body || {};
        const userId = req.user ? req.user.id : 'usr_guest_demo';
        const durationDays = planId === 'annual' ? 365 : 30;
        const expiresAt = Date.now() + durationDays * 24 * 60 * 60 * 1000;

        const demoSub = {
            userId,
            planId,
            status: 'active',
            source: 'sandbox_demo',
            startsAt: new Date().toISOString(),
            expiresAt: new Date(expiresAt).toISOString(),
            providerCustomerId: 'cust_sandbox_' + crypto.randomBytes(4).toString('hex'),
            providerSubscriptionId: 'sub_sandbox_' + crypto.randomBytes(4).toString('hex'),
            cancelAtPeriodEnd: false
        };

        this.subscriptionStore.set(userId, demoSub);

        if (req.user) {
            this.dbInstance.run('UPDATE users SET is_pro = 1, updated_at = ? WHERE id = ?', [new Date().toISOString(), userId]);
        }

        const reference = 'SANDBOX-ACTIVATE-' + crypto.randomBytes(4).toString('hex').toUpperCase();
        this.dbInstance.invoices.create({
            id: reference,
            userId,
            planId,
            amount: PLANS[planId]?.price || 0,
            currency: 'IDR',
            status: 'paid',
            provider: 'sandbox'
        });

        return res.json({
            ok: true,
            mode: 'sandbox_demo',
            isDemo: true,
            message: 'Akselerasi Pro simulasi aktif (Sandbox Demo).',
            subscription: {
                ...demoSub,
                invoice: reference,
                expiresAt: new Date(expiresAt).toISOString()
            }
        });
    };

    cancel = async (req, res) => {
        const sub = this.subscriptionStore.get(req.user.id);
        if (!sub || sub.status !== 'active') {
            return res.status(400).json({ ok: false, error: 'NO_ACTIVE_SUBSCRIPTION', message: 'Anda tidak memiliki langganan PRO aktif.' });
        }

        if (sub.source === 'stripe' && IS_PAYMENT_CONFIGURED && sub.providerSubscriptionId) {
            try {
                await this.paymentProviderInstance.cancelSubscription(sub.providerSubscriptionId);
                this.subscriptionStore.set(req.user.id, {
                    ...sub,
                    cancelAtPeriodEnd: true
                });
                return res.json({ ok: true, message: 'Langganan Anda akan dibatalkan pada akhir periode tagihan.' });
            } catch (e) {
                return res.status(500).json({ ok: false, error: 'PROVIDER_ERROR', message: e.message });
            }
        } else {
            this.subscriptionStore.set(req.user.id, {
                ...sub,
                cancelAtPeriodEnd: true,
                status: 'canceled'
            });
            this.dbInstance.run('UPDATE users SET is_pro = 0, updated_at = ? WHERE id = ?', [new Date().toISOString(), req.user.id]);
            return res.json({ ok: true, message: 'Langganan sandbox simulasi dibatalkan.' });
        }
    };

    history = (req, res) => {
        const invoices = this.dbInstance.invoices.getByUserId(req.user.id);
        return res.json({
            ok: true,
            invoices
        });
    };

    webhook = async (req, res) => {
        const signature = req.headers['stripe-signature'];
        const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body));

        let event;
        try {
            if (IS_PAYMENT_CONFIGURED && signature) {
                event = this.paymentProviderInstance.verifyWebhook(rawBody, signature, this.stripeWebhookSecret);
            } else {
                event = req.body;
            }
        } catch (err) {
            console.error('Webhook signature verification failed:', err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        const { isWebhookProcessed, markWebhookProcessed } = require('../../payment-provider');

        const eventId = event.id;
        if (eventId && isWebhookProcessed(eventId)) {
            return res.json({ received: true, message: 'Event already processed (idempotency confirmed)' });
        }

        if (eventId) {
            markWebhookProcessed(eventId);
        }

        try {
            const eventType = event.type || event.event;
            const dataObject = event.data?.object || event;

            if (eventType === 'checkout.session.completed') {
                const metadata = dataObject.metadata || {};
                const userId = metadata.userId;
                const planId = metadata.planId || 'pro';
                const stripeSubId = dataObject.subscription;
                const stripeCustId = dataObject.customer;

                if (userId) {
                    const durationDays = planId === 'annual' ? 365 : 30;
                    const expiresAt = Date.now() + durationDays * 24 * 60 * 60 * 1000;

                    const newSub = {
                        userId,
                        planId,
                        status: 'active',
                        source: 'stripe',
                        startsAt: new Date().toISOString(),
                        expiresAt: new Date(expiresAt).toISOString(),
                        providerCustomerId: stripeCustId || 'unknown',
                        providerSubscriptionId: stripeSubId || 'unknown',
                        cancelAtPeriodEnd: false
                    };

                    this.subscriptionStore.set(userId, newSub);
                    this.dbInstance.run('UPDATE users SET is_pro = 1, updated_at = ? WHERE id = ?', [new Date().toISOString(), userId]);

                    const ref = dataObject.id || ('ST-CS-' + crypto.randomBytes(4).toString('hex').toUpperCase());
                    const invoice = this.dbInstance.invoices.get(ref) || this.dbInstance.invoices.getByUserId(userId).find(i => i.status === 'pending');
                    if (invoice) {
                        this.dbInstance.invoices.update(invoice.id, { status: 'paid' });
                    } else {
                        this.dbInstance.invoices.create({
                            id: ref,
                            userId,
                            planId,
                            amount: PLANS[planId]?.price || 0,
                            currency: 'IDR',
                            status: 'paid',
                            provider: 'stripe'
                        });
                    }
                }
            } else if (eventType === 'customer.subscription.deleted') {
                const stripeSubId = dataObject.id;
                const userId = Array.from(this.subscriptionStore.values()).find(sub => sub.providerSubscriptionId === stripeSubId)?.userId;
                if (userId) {
                    const sub = this.subscriptionStore.get(userId);
                    if (sub) {
                        this.subscriptionStore.set(userId, {
                            ...sub,
                            status: 'canceled',
                            expiresAt: new Date().toISOString()
                        });
                        this.dbInstance.run('UPDATE users SET is_pro = 0, updated_at = ? WHERE id = ?', [new Date().toISOString(), userId]);
                    }
                }
            }

            res.json({ received: true });
        } catch (err) {
            console.error('Webhook handling error:', err.message);
            res.status(500).json({ error: 'Failed handling webhook event' });
        }
    };
}

module.exports = SubscriptionController;
