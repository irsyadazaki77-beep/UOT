-- Universe of Tech - Database Schema Migration 004
-- Real Pro Entitlement & Payment Architecture Fields

ALTER TABLE subscriptions ADD COLUMN provider_customer_id TEXT;
ALTER TABLE subscriptions ADD COLUMN provider_subscription_id TEXT;
ALTER TABLE subscriptions ADD COLUMN cancel_at_period_end INTEGER DEFAULT 0;

CREATE TABLE IF NOT EXISTS payment_invoices (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL,
    amount INTEGER NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'IDR',
    status TEXT NOT NULL, -- 'pending', 'paid', 'failed'
    provider TEXT NOT NULL, -- 'sandbox', 'stripe'
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS processed_webhooks (
    event_id TEXT PRIMARY KEY,
    processed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payment_invoices_user ON payment_invoices(user_id);
