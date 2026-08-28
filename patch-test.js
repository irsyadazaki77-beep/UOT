const fs = require('fs');

let code = fs.readFileSync('tests/e2e-pipeline.test.js', 'utf8');

const regex = /global\.window\.ProgressionEngine = \{[\s\S]*?\};/;
const replacement = `global.window.ProgressionEngine = {
    recordActivity: (type, metadata) => {
        global.lastProgressionActivity = { type, metadata };
    },
    getGameState: () => ({ xp: 100, streak: 1, level: 1 })
};`;

code = code.replace(regex, replacement);
fs.writeFileSync('tests/e2e-pipeline.test.js', code, 'utf8');
