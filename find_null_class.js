const fs = require('fs');
const execSync = require('child_process').execSync;
const files = execSync('find public -type f -name "*.js" -o -name "*.html"').toString().split('\n').filter(Boolean);
for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].match(/\.className\s*=/)) {
            console.log(`${file}:${i+1}: ${lines[i].trim()}`);
        }
    }
}
