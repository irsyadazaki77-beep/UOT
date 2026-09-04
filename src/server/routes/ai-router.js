const express = require('express');

function createAIRouter({ aiController, middlewares, rateLimiter }) {
    const router = express.Router();

    // Use authentication middleware if available, but allow guest context as well?
    // Let's use optional auth middleware so user data is populated if logged in, but not blocked if guest.
    // Or we could enforce auth. The prompt mentions "Jangan memanggil external AI API langsung dari browser."
    // and "rate limiting, input size limit, prompt sanitization".
    
    // Strict input schema validation middleware (Phase 4 Hardening)
    const validateChatInput = (req, res, next) => {
        const { messages } = req.body;
        
        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({
                ok: false,
                error: 'BAD_REQUEST',
                message: 'Messages are required and must be a valid array.'
            });
        }

        if (messages.length === 0 || messages.length > 10) {
            return res.status(400).json({
                ok: false,
                error: 'BAD_REQUEST',
                message: 'Messages array length must be between 1 and 10.'
            });
        }

        let totalLength = 0;
        for (let i = 0; i < messages.length; i++) {
            const m = messages[i];
            if (!m || typeof m !== 'object') {
                return res.status(400).json({
                    ok: false,
                    error: 'BAD_REQUEST',
                    message: `Message at index ${i} is not a valid object.`
                });
            }

            if (m.role !== 'user' && m.role !== 'assistant') {
                return res.status(400).json({
                    ok: false,
                    error: 'BAD_REQUEST',
                    message: `Message role at index ${i} must be either 'user' or 'assistant'.`
                });
            }

            if (typeof m.text !== 'string') {
                return res.status(400).json({
                    ok: false,
                    error: 'BAD_REQUEST',
                    message: `Message text at index ${i} must be a valid string.`
                });
            }

            if (m.text.length > 2000) {
                return res.status(400).json({
                    ok: false,
                    error: 'BAD_REQUEST',
                    message: `Message text at index ${i} exceeds the max length of 2000 characters.`
                });
            }

            totalLength += m.text.length;
        }

        // Strict total budget restriction
        if (totalLength > 10000) {
            return res.status(400).json({
                ok: false,
                error: 'BAD_REQUEST',
                message: 'Total combined message content exceeds context budget limit of 10,000 characters.'
            });
        }

        next();
    };

    const aiRateLimiter = rateLimiter ? rateLimiter({
        windowMs: 60 * 1000, // 1 minute
        max: 10, // 10 requests per minute per IP
        message: { ok: false, error: 'Too many requests, slow down.' }
    }) : (req, res, next) => next();

    // Optional auth middleware extraction
    const optionalAuth = (req, res, next) => {
        if (middlewares && middlewares.requireAuth) {
            // We can trick requireAuth to just set req.user if token exists, 
            // but we might not want to block. We'll assume authController sets req.user globally or we just use requireAuth.
            // For now, let's just use requireAuth so only logged in users can use AI to prevent abuse.
            return middlewares.requireAuth(req, res, next);
        }
        next();
    };

    router.post('/api/bubub/chat', aiRateLimiter, optionalAuth, validateChatInput, aiController.chat.bind(aiController));

    return router;
}

module.exports = { createAIRouter };
