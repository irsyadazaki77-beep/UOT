const express = require('express');

function createAIRouter({ aiController, middlewares, rateLimiter }) {
    const router = express.Router();

    // Use authentication middleware if available, but allow guest context as well?
    // Let's use optional auth middleware so user data is populated if logged in, but not blocked if guest.
    // Or we could enforce auth. The prompt mentions "Jangan memanggil external AI API langsung dari browser."
    // and "rate limiting, input size limit, prompt sanitization".
    
    // Simple input size validation middleware
    const validateChatInput = (req, res, next) => {
        const { messages } = req.body;
        if (messages) {
            // limit to 10 recent messages
            if (messages.length > 10) req.body.messages = messages.slice(-10);
            
            // limit each message length
            for (let m of req.body.messages) {
                if (m.text && m.text.length > 1000) {
                    m.text = m.text.substring(0, 1000);
                }
            }
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
