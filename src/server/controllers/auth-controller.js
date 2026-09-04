/**
 * Universe Of Tech - Authentication Controller
 */
const crypto = require('crypto');
const { hashPassword, verifyPassword } = require('../security/crypto');
const { PASSWORD_POLICY_REGEX } = require('../config');

class AuthController {
    constructor({ userStore, sessionStore, subscriptionStore, recordAuthFailure, setSessionCookie, clearSessionCookie }) {
        this.userStore = userStore;
        this.sessionStore = sessionStore;
        this.subscriptionStore = subscriptionStore;
        this.recordAuthFailure = recordAuthFailure;
        this.setSessionCookie = setSessionCookie;
        this.clearSessionCookie = clearSessionCookie;
    }

    register = async (req, res) => {
        const { username, email, password } = req.body || {};

        if (!username || typeof username !== 'string' || username.trim().length < 2 || username.trim().length > 60) {
            return res.status(400).json({ ok: false, error: 'INVALID_USERNAME', message: 'Nama lengkap harus terdiri dari 2 - 60 karakter.' });
        }
        const cleanEmail = String(email || '').trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) || cleanEmail.length > 254) {
            return res.status(400).json({ ok: false, error: 'INVALID_EMAIL', message: 'Format alamat email tidak valid.' });
        }
        if (!password || typeof password !== 'string' || !PASSWORD_POLICY_REGEX.test(password)) {
            return res.status(400).json({
                ok: false,
                error: 'INVALID_PASSWORD',
                message: 'Kata sandi minimal 8 karakter, harus mengandung huruf besar, huruf kecil, dan angka.'
            });
        }

        const emailExists = await this.userStore.has(cleanEmail);
        if (emailExists) {
            return res.status(409).json({ ok: false, error: 'EMAIL_EXISTS', message: 'Alamat email sudah terdaftar. Silakan masuk.' });
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

        // Rotate Session
        if (req.session && req.session.sessionToken) {
            await this.sessionStore.delete(req.session.sessionToken);
        }

        const sessionToken = 'uot_sess_' + crypto.randomBytes(32).toString('hex');
        const csrfToken = crypto.randomBytes(24).toString('hex');
        const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 Hours Expiration

        await this.sessionStore.set(sessionToken, {
            sessionToken,
            userId,
            csrfToken,
            createdAt: Date.now(),
            expiresAt
        });

        this.setSessionCookie(res, sessionToken, csrfToken);

        return res.status(201).json({
            ok: true,
            message: 'Pendaftaran berhasil.',
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role,
                isPro: false
            },
            csrfToken
        });
    };

    login = async (req, res) => {
        const { email, password } = req.body || {};
        const cleanEmail = String(email || '').trim().toLowerCase();

        if (!cleanEmail || !password) {
            return res.status(400).json({ ok: false, error: 'MISSING_CREDENTIALS', message: 'Email dan kata sandi wajib diisi.' });
        }

        const user = await this.userStore.get(cleanEmail);
        if (!user || !verifyPassword(password, user.passwordHash, user.salt)) {
            this.recordAuthFailure(req.ip, cleanEmail, 'INVALID_CREDENTIALS');
            return res.status(401).json({
                ok: false,
                error: 'INVALID_CREDENTIALS',
                message: 'Email atau kata sandi tidak valid.'
            });
        }

        // Rotate Session on login
        if (req.session && req.session.sessionToken) {
            await this.sessionStore.delete(req.session.sessionToken);
        }

        const sessionToken = 'uot_sess_' + crypto.randomBytes(32).toString('hex');
        const csrfToken = crypto.randomBytes(24).toString('hex');
        const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 Hours Expiration

        await this.sessionStore.set(sessionToken, {
            sessionToken,
            userId: user.id,
            csrfToken,
            createdAt: Date.now(),
            expiresAt
        });

        this.setSessionCookie(res, sessionToken, csrfToken);

        const sub = await this.subscriptionStore.get(user.id);
        const isPro = Boolean(sub && sub.status === 'active' && Date.now() < sub.expiresAt);

        return res.json({
            ok: true,
            message: 'Login berhasil.',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role || 'user',
                isPro
            },
            csrfToken
        });
    };

    verifySession = (req, res) => {
        if (!req.session || !req.user) {
            return res.status(401).json({
                ok: false,
                verified: false,
                message: 'Sesi tidak valid atau telah kedaluwarsa. Silakan masuk kembali.'
            });
        }

        return res.json({
            ok: true,
            verified: true,
            user: req.user,
            csrfToken: req.session.csrfToken,
            serverTime: new Date().toISOString(),
            expiresAt: new Date(req.session.expiresAt).toISOString()
        });
    };

    logout = async (req, res) => {
        const authHeader = req.headers.authorization;
        let token = req.cookies?.uot_session;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7).trim();
        } else if (req.session?.sessionToken) {
            token = req.session.sessionToken;
        }
        if (token) {
            await this.sessionStore.delete(token);
        }
        this.clearSessionCookie(res);
        return res.json({ ok: true, message: 'Berhasil keluar.' });
    };

    forgotPassword = (req, res) => {
        return res.status(501).json({
            ok: false,
            error: 'NOT_CONFIGURED',
            message: 'Layanan pemulihan kata sandi via email belum dikonfigurasi pada server ini. Silakan hubungi administrator.'
        });
    };

    resetPassword = (req, res) => {
        return res.status(501).json({
            ok: false,
            error: 'NOT_CONFIGURED',
            message: 'Layanan reset kata sandi belum dikonfigurasi pada server ini.'
        });
    };

    getProfile = (req, res) => {
        return res.json({
            ok: true,
            user: req.user
        });
    };
}

module.exports = AuthController;
