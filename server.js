const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(express.json());

// API health endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        app: 'Universe Of Tech',
        timestamp: new Date().toISOString()
    });
});

// Mock learning state API endpoints for full-stack compatibility
app.get('/v1/learning-state', (req, res) => {
    res.json({
        status: 'ok',
        state: {},
        updatedAt: new Date().toISOString()
    });
});

app.put('/v1/learning-state', (req, res) => {
    res.json({
        status: 'ok',
        received: req.body,
        updatedAt: new Date().toISOString()
    });
});

// Checkout session mock for Pro membership
app.post('/v1/checkout/sessions', (req, res) => {
    res.json({
        status: 'ok',
        checkoutUrl: '/payment.html?session=demo&plan=' + encodeURIComponent(req.body.planId || 'pro_monthly'),
        reference: 'DEMO-' + Math.random().toString(36).substring(2, 9).toUpperCase()
    });
});

// Serve static assets
app.use(express.static(__dirname, {
    extensions: ['html', 'htm'],
    maxAge: '1h'
}));

// Clean URL routing fallback for HTML pages
app.get('/:page', (req, res, next) => {
    const pageName = req.params.page;
    const filePath = path.join(__dirname, `${pageName}.html`);
    if (fs.existsSync(filePath)) {
        return res.sendFile(filePath);
    }
    next();
});

// 404 Fallback
app.use((req, res) => {
    const notFoundPath = path.join(__dirname, 'index.html');
    if (fs.existsSync(notFoundPath)) {
        res.status(404).sendFile(notFoundPath);
    } else {
        res.status(404).send('Page not found');
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Universe Of Tech server running on http://0.0.0.0:${PORT}`);
});

