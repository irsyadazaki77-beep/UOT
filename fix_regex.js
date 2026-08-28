const fs = require('fs');
let code = fs.readFileSync('public/bubub-ai.js', 'utf8');
code = code.replace(/part\.replace\(\/\\^\\w\+\\n\//, 'part.replace(/^\\w+\\n/');
// Actually wait, let's just search and replace the broken syntax.
code = code.replace(/part\.replace\(\/\^\\w\+\n\//, 'part.replace(/^\\\\w+\\\\n/');
fs.writeFileSync('public/bubub-ai.js', code);
