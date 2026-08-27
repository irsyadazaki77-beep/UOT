import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';

// Dynamically discover all HTML entry points in the public folder (excluding index.html if handled, or scan all)
const htmlInputs = {};
const publicDir = resolve(__dirname, 'public');

if (fs.existsSync(publicDir)) {
  fs.readdirSync(publicDir).forEach(file => {
    if (file.endsWith('.html')) {
      const name = file.replace(/\.html$/, '');
      htmlInputs[name] = resolve(publicDir, file);
    }
  });
}

export default defineConfig({
  root: 'public', // Set root directory as public
  publicDir: '../static', // Copy static assets from /static directory to /dist during build
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    sourcemap: true, // Generate sourcemaps for debugging
    minify: 'esbuild', // Use ultra-fast esbuild for minification
    cssMinify: 'esbuild', // Use esbuild for CSS minification
    rollupOptions: {
      input: htmlInputs,
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        manualChunks(id) {
          // Put very heavy third-party code in separate chunk
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  },
  server: {
    port: 3000,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '/v1': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
});
