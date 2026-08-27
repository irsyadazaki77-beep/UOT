/**
 * Universe Of Tech - Modern Script-to-Module Upgrader
 */
const fs = require('fs');
const path = require('path');

const publicDir = path.resolve(__dirname, '..', 'public');

if (!fs.existsSync(publicDir)) {
    console.error('public directory not found!');
    process.exit(1);
}

const htmlFiles = fs.readdirSync(publicDir).filter(f => f.endsWith('.html'));

htmlFiles.forEach(file => {
    const filePath = path.join(publicDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Find script tags that load local js files and do not have type="module"
    // Examples: <script src="index-clean.js"></script>
    // But exclude CDN links (containing http://, https://, //)
    const scriptRegex = /<script\s+([^>]*?)src=["']((?!\/\/|http:|https:)[^"']+?\.js(?:\?[^"']*)?)["']([^>]*?)>/gi;
    
    let modified = false;
    let newContent = content.replace(scriptRegex, (match, before, src, after) => {
        // If it already has type="module" or type='module', do not modify
        if (before.includes('type=') || after.includes('type=')) {
            return match;
        }
        modified = true;
        // Inject type="module" safely
        return `<script type="module" ${before.trim()} src="${src}" ${after.trim()}>`.replace(/\s+/g, ' ').replace('> >', '>');
    });
    
    if (modified) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`Upgraded script tags in: ${file}`);
    }
});

console.log('Script-to-module upgrade complete!');
