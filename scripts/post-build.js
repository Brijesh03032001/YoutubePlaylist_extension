const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

const manifestPath = path.resolve(rootDir, 'manifest.json');
const distManifestPath = path.resolve(distDir, 'manifest.json');

// Read manifest
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

// Update manifest for production build
manifest.background.service_worker = 'assets/background.js';

// Update content scripts
manifest.content_scripts = manifest.content_scripts.map(script => ({
  ...script,
  js: ['assets/content.js'],
  css: ['assets/index.css']
}));

// Vite build places index.html at root of dist usually for MPA, but let's check.
// Actually for 'popup' entry in vite config, it might be named differently.
// Let's rely on standard vite behavior: usually assets/index.css is the main css.
manifest.action.default_popup = 'src/popup/index.html';

// Write to dist
fs.writeFileSync(distManifestPath, JSON.stringify(manifest, null, 2));

console.log('Manifest updated and copied to dist/');
