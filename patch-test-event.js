const fs = require('fs');
let code = fs.readFileSync('tests/e2e-pipeline.test.js', 'utf8');

const regex = /global\.window\.ProgressionEngine = \{[\s\S]*?\};/;
const replacement = `global.window.ProgressionEngine = {
    recordActivity: (type, metadata) => {
        global.lastProgressionActivity = { type, metadata };
    },
    getGameState: () => ({ xp: 100, streak: 1, level: 1 })
};

// Implement simple event bus for window
const listeners = {};
global.window.addEventListener = (evt, cb) => {
    if (!listeners[evt]) listeners[evt] = [];
    listeners[evt].push(cb);
};
global.window.dispatchEvent = (e) => {
    if (listeners[e.type]) {
        listeners[e.type].forEach(cb => cb(e));
    }
};
class CustomEvent {
    constructor(type, options) {
        this.type = type;
        this.detail = options ? options.detail : null;
    }
}
global.CustomEvent = CustomEvent;
`;

code = code.replace(regex, replacement);
fs.writeFileSync('tests/e2e-pipeline.test.js', code, 'utf8');
