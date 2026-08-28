const fs = require('fs');

let code = fs.readFileSync('tests/e2e-pipeline.test.js', 'utf8');

code = code.replace(/recommendations\.nextAction/g, 'recommendations.recommendedNext');

fs.writeFileSync('tests/e2e-pipeline.test.js', code, 'utf8');
