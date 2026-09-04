/**
 * UNIVERSE OF TECH - AUTHENTICATION & IDENTITY SERVICE
 * FASE 3 & 4: Service Layer & Security Hardening
 */
const crypto = require('crypto');
const { hashPassword, verifyPassword } = require('../security/crypto');
const { PASSWORD_POLICY_REGEX } = require('../config');

class AuthService {
    constructor({ userStore, sessionStore, subscriptionStore, auditLogger }) {
        this.userStore = userStore;
        this.sessionStore = sessionStore;
        this.subscriptionStore = subscriptionStore;
        this.auditLogger = auditLogger;
    }

    validatePasswordPolicy(password) {
        if (!password || typeof password !== 'string') return false;
        return PASSWORD_POLICY_REGEX.test(password);
    }

    validateEmailFormat(email) {
        if (!email || typeof email !== 'string') return false;
        const clean = email.trim().toLowerCase();
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean) && clean.length <= 254;
    }

    async register({ username, email, password, ip = '127.0.0.1' }) {
        if (!username || typeof username !== 'string' || username.trim().length < 2 || username.trim().length > 60) {
            const err = new Error('Nama lengkap harus terdiri dari 2 - 60 karakter.');
            err.status = 400;
            err.code = 'INVALID_USERNAME';
            throw err;
        }

        const cleanEmail = String(email || '').trim().toLowerCase();
        if (!this.validateEmailFormat(cleanEmail)) {
            const err = new Error('Format alamat email tidak valid.');
            err.status = 400;
            err.code = 'INVALID_EMAIL';
            throw err;
        }

        if (!this.validatePasswordPolicy(password)) {
            const err = new Error('Kata sandi minimal 8 karakter, harus mengandung huruf besar, huruf kecil, dan angka.');
            err.status = 400;
            err.code = 'INVALID_PASSWORD';
            throw err;
        }

        const emailExists = await this.userStore.has(cleanEmail);
        if (emailExists) {
            const err = new Error('Alamat email sudah terdaftar. Silakan masuk.');
            err.status = 409;
            err.code = 'EMAIL_EXISTS';
            throw err;
        }

        const { hash, salt } = hashPassword(password);
        const userId = 'usr_' + crypto.randomBytes(12).toString('hex');
        const newUser = {
            id: userId,
            username: username.trim(),
            email: cleanEmail,
            passwordHash: hash,
            salt,
            role: 'user',
            isPro: false,
            createdAt: new Date().toISOString()
        };

        await this.userStore.set(cleanEmail, newUser);

        const sessionToken = 'uot_sess_' + crypto.randomBytes(32).toString('hex');
        const csrfToken = crypto.randomBytes(24).toString('hex');
        const expiresAt = Date.now() + 24 * 60 * 60 * 1000;

        await this.sessionStore.set(sessionToken, {
            sessionToken,
            userId,
            csrfToken,
            createdAt: Date.now(),
            expiresAt
        });

        return {
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role,
                isPro: false
            },
            sessionToken,
            csrfToken,
            expiresAt
        };
    }

    async login({ email, password, previousSessionToken, ip = '127.0.0.1' }) {
        const cleanEmail = String(email || '').trim().toLowerCase();
        if (!cleanEmail || !password) {
            const err = new Error('Email dan kata sandi wajib diisi.');
            err.status = 400;
            err.code = 'MISSING_CREDENTIALS';
            throw err;
        }

        const user = await this.userStore.get(cleanEmail);
        if (!user || !verifyPassword(password, user.passwordHash, user.salt)) {
            if (this.auditLogger) {
                this.auditLogger(ip, cleanEmail, 'INVALID_CREDENTIALS');
            }
            const err = new Error('Email atau kata sandi tidak valid.');
            err.status = 401;
            err.code = 'INVALID_CREDENTIALS';
            throw err;
        }

        // Invalidate old session on login (session fixation prevention)
        if (previousSessionToken) {
            await this.sessionStore.delete(previousSessionToken);
        }

        const sessionToken = 'uot_sess_' + crypto.randomBytes(32).toString('hex');
        const csrfToken = crypto.randomBytes(24).toString('hex');
        const expiresAt = Date.now() + 24 * 60 * 60 * 1000;

        await this.sessionStore.set(sessionToken, {
            sessionToken,
            userId: user.id,
            csrfToken,
            createdAt: Date.now(),
            expiresAt
        });

        const sub = await this.subscriptionStore.get(user.id);
        const isPro = Boolean(sub && sub.status === 'active' && Date.now() < sub.expiresAt);

        return {
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role || 'user',
                isPro
            },
            sessionToken,
            csrfToken,
            expiresAt
        };
    }

    async logout(sessionToken) {
        if (sessionToken) {
            await this.sessionStore.delete(sessionToken);
        }
        return true;
    }
}

module.exports = AuthService;
