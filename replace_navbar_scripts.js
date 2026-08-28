const fs = require('fs');
const execSync = require('child_process').execSync;

const htmlFiles = execSync('find public -type f -name "*.html"').toString().split('\n').filter(Boolean);

for (const file of htmlFiles) {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;

    // Replace navbar-explore.js with navbar-shared.js
    if (content.includes('navbar-explore.js')) {
        content = content.replace(/<script[^>]*src=["'][^"']*navbar-explore\.js[^"']*["'][^>]*><\/script>/g, '<script type="module" src="navbar-shared.js" defer></script>');
        modified = true;
    }

    // Remove auth-helper.js
    if (content.includes('auth-helper.js')) {
        content = content.replace(/<script[^>]*src=["'][^"']*auth-helper\.js[^"']*["'][^>]*><\/script>\s*/g, '');
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated scripts in ${file}`);
    }
}
