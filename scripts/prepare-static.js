/**
 * Universe Of Tech - Prepare Static Folder for Vite Build
 */
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');
const staticDir = path.join(rootDir, 'static');

// Clean and recreate static folder
if (fs.existsSync(staticDir)) {
    fs.rmSync(staticDir, { recursive: true, force: true });
}
fs.mkdirSync(staticDir, { recursive: true });

// List of exact files to copy as static assets
const staticFiles = [
    'bubub-mascot.webp',
    'logo-uot-192.png',
    'logo-uot-512.png',
    'logo-uot-display.webp',
    'logo.png',
    'manifest.webmanifest',
    'robots.txt',
    'sitemap.xml',
    'sw.js',
    'universe-of-tech-logo.jpg',
    'universe-of-tech-logo.webp',
    '_headers'
];

staticFiles.forEach(file => {
    const src = path.join(publicDir, file);
    const dest = path.join(staticDir, file);
    if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
        console.log(`Copied static asset: ${file}`);
    }
});

// Copy assets/daerah subfolder
const srcDaerahDir = path.join(publicDir, 'assets', 'daerah');
const destDaerahDir = path.join(staticDir, 'assets', 'daerah');

if (fs.existsSync(srcDaerahDir)) {
    fs.mkdirSync(destDaerahDir, { recursive: true });
    fs.readdirSync(srcDaerahDir).forEach(file => {
        fs.copyFileSync(path.join(srcDaerahDir, file), path.join(destDaerahDir, file));
    });
    console.log('Copied assets/daerah/ directory recursively');
}

console.log('Static folder preparation complete!');
