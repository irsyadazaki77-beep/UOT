/**
 * Universe Of Tech - Server Configurations
 */
const path = require('path');

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const APP_ENV = process.env.NODE_ENV === 'production' ? 'production' : (process.env.APP_ENV || 'development');
const IS_PRODUCTION = APP_ENV === 'production';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';
const IS_PAYMENT_CONFIGURED = Boolean(STRIPE_SECRET_KEY && STRIPE_SECRET_KEY.trim().length > 5);

const PASSWORD_POLICY_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

const CONTENT_DIR = path.resolve(__dirname, '..', '..', '..', 'data', 'content');

module.exports = {
    PORT,
    APP_ENV,
    IS_PRODUCTION,
    STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET,
    IS_PAYMENT_CONFIGURED,
    PASSWORD_POLICY_REGEX,
    CONTENT_DIR
};
