/**
 * Universe Of Tech - Post Build Service Worker Asset Injector
 */
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const swPath = path.join(distDir, 'sw.js');

if (!fs.existsSync(swPath)) {
    console.error('sw.js not found in dist directory! Make sure static files are prepared and Vite build succeeded.');
    process.exit(1);
}

// Recursively find all files in the dist directory to include in the service worker pre-cache
function getAllFiles(dir, baseDir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            results = results.concat(getAllFiles(fullPath, baseDir));
        } else {
            // Get relative path for service worker precaching
            const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
            results.push(relativePath);
        }
    });
    return results;
}

// Fetch all files from dist
const allFiles = getAllFiles(distDir, distDir);

// Filter out files that shouldn't be precached or are sourcemaps/metadata
const precacheFiles = allFiles.filter(file => {
    // Skip sourcemaps, manifest, headers, or the service worker itself
    if (file.endsWith('.map') || file === 'sw.js' || file === '_headers' || file === 'robots.txt' || file === 'sitemap.xml') {
        return false;
    }
    // Only cache HTML, CSS, JS, and static media files
    return file.endsWith('.html') || file.endsWith('.css') || file.endsWith('.js') || file.endsWith('.webp') || file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.webmanifest');
});

// Map them to relative paths for the SW precache (adding './')
const formattedPrecache = precacheFiles.map(file => `./${file}`);

// Ensure critical pages and paths are explicitly included
if (!formattedPrecache.includes('./')) {
    formattedPrecache.unshift('./');
}
if (!formattedPrecache.includes('./index.html')) {
    formattedPrecache.unshift('./index.html');
}

console.log(`Discovered ${formattedPrecache.length} assets to precache in Service Worker:`);
console.log(formattedPrecache.slice(0, 10).join(', ') + ' ...');

// Read existing sw.js
let swContent = fs.readFileSync(swPath, 'utf8');

// Replace APP_SHELL with our dynamic, hashed array
const appShellRegex = /const APP_SHELL\s*=\s*\[[\s\S]*?\];/;
const newAppShellStr = `const APP_SHELL = ${JSON.stringify(formattedPrecache, null, 4)};`;

if (appShellRegex.test(swContent)) {
    swContent = swContent.replace(appShellRegex, newAppShellStr);
    
    // Also, update the CACHE_NAME to include a unique timestamp to prevent any old cache mismatch / cache busting!
    const uniqueVersion = `uot-pwa-v${Date.now()}`;
    swContent = swContent.replace(/const CACHE_NAME\s*=\s*["'][^"']+["'];/, `const CACHE_NAME = "${uniqueVersion}";`);
    
    fs.writeFileSync(swPath, swContent, 'utf8');
    console.log(`Successfully injected hashed assets into dist/sw.js and updated cache to ${uniqueVersion}!`);
} else {
    console.error('Could not locate APP_SHELL array in sw.js!');
}
