#!/usr/bin/env node

/**
 * Deployment preparation script
 * Handles the static file path mismatch between vite build output and server expectations
 */

import fs from 'fs';
import path from 'path';

console.log('🚀 Preparing for deployment...');

// Check if build directory exists
const buildDir = path.resolve('dist/public');
const serverPublicDir = path.resolve('server/public');

if (!fs.existsSync(buildDir)) {
  console.error(`❌ Build directory not found: ${buildDir}`);
  console.error('Please run "npm run build" first to build the client.');
  process.exit(1);
}

// Create server/public directory and copy files
console.log('📁 Creating server/public directory...');
if (fs.existsSync(serverPublicDir)) {
  fs.rmSync(serverPublicDir, { recursive: true, force: true });
}
fs.mkdirSync(serverPublicDir, { recursive: true });

// Copy all files from dist/public to server/public
console.log('📂 Copying static files...');
const copyRecursively = (src, dest) => {
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    const files = fs.readdirSync(src);
    files.forEach(file => {
      copyRecursively(path.join(src, file), path.join(dest, file));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
};

copyRecursively(buildDir, serverPublicDir);

console.log('✅ Deployment preparation complete!');
console.log(`📝 Static files copied to: ${serverPublicDir}`);

// Verify critical files exist
const indexPath = path.join(serverPublicDir, 'index.html');
if (!fs.existsSync(indexPath)) {
  console.error('❌ Critical error: index.html not found in build output');
  process.exit(1);
}

console.log('✅ All deployment checks passed!');