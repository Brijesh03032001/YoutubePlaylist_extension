import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  js: ['content-loader.js'],
  css: ['assets/index.css']
}));

// Add content.js to web_accessible_resources so the loader can import it
manifest.web_accessible_resources = manifest.web_accessible_resources || [];
manifest.web_accessible_resources.push({
  resources: ['assets/*', 'content-loader.js'],
  matches: ['<all_urls>']
});

manifest.action.default_popup = 'src/popup/index.html';

// Copy content-loader.js to dist
fs.copyFileSync(
  path.resolve(rootDir, 'src/content/content-loader.js'), 
  path.resolve(distDir, 'content-loader.js')
);

// Write to dist
fs.writeFileSync(distManifestPath, JSON.stringify(manifest, null, 2));

console.log('Manifest updated and copied to dist/');
