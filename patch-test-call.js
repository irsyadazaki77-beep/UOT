const fs = require('fs');

let code = fs.readFileSync('tests/e2e-pipeline.test.js', 'utf8');

code = code.replace(/calculateSkillMastery\("js_variables"\)/g, 'calculateSkillMastery("js_variables", global.window.ProgressionEngine.getGameState().activities)');
code = code.replace(/calculateSkillMastery\("js_async"\)/g, 'calculateSkillMastery("js_async", global.window.ProgressionEngine.getGameState().activities)');

fs.writeFileSync('tests/e2e-pipeline.test.js', code, 'utf8');
