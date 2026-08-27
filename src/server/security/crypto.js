/**
 * Universe Of Tech - Cryptographic Security Helpers
 */
const crypto = require('crypto');

/**
 * Hash password using PBKDF2 with salt.
 */
function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return { hash, salt };
}

/**
 * Verify password against stored hash and salt in a timing-safe manner.
 */
function verifyPassword(password, storedHash, salt) {
    if (!password || !storedHash || !salt) return false;
    const computedHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    const hashBuf = Buffer.from(computedHash, 'hex');
    const storedBuf = Buffer.from(storedHash, 'hex');
    if (hashBuf.length !== storedBuf.length) return false;
    return crypto.timingSafeEqual(hashBuf, storedBuf);
}

module.exports = {
    hashPassword,
    verifyPassword
};
