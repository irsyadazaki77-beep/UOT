const fs = require('fs');

let code = fs.readFileSync('tests/e2e-pipeline.test.js', 'utf8');
code = code.replace(`        ActivityService.recordQuiz("quiz-123", 80, {
            topic: "Variabel dan Tipe Data JavaScript"
        });`, `        ActivityService.recordQuiz("quiz-123", 80, {
            topic: "Variabel dan Tipe Data JavaScript"
        });
        console.log("Last progression:", global.lastProgressionActivity);
        `);
fs.writeFileSync('tests/e2e-pipeline.test.js', code, 'utf8');
