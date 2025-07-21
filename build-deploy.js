#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Building Escanix for deployment...');

try {
  // Run the standard build process
  console.log('📦 Running vite build...');
  execSync('vite build', { stdio: 'inherit' });
  
  console.log('🔧 Building server...');
  execSync('esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', { stdio: 'inherit' });
  
  // The server expects static files to be in a 'public' directory relative to the server bundle
  // We need to keep the dist/public structure for production deployment
  const publicDir = path.resolve('dist', 'public');
  const distDir = path.resolve('dist');
  
  if (fs.existsSync(publicDir)) {
    console.log('📂 Keeping dist/public structure for server compatibility...');
    console.log('   ✓ Frontend files remain in dist/public/');
  } else {
    console.log('⚠️  Warning: dist/public directory not found. Vite build may have failed.');
  }
  
  console.log('✅ Build complete! Files are ready for deployment in ./dist');
  console.log('');
  console.log('📁 Deployment structure:');
  console.log('   dist/');
  console.log('   ├── public/');
  console.log('   │   ├── index.html (frontend entry point)');
  console.log('   │   └── assets/ (frontend assets)');
  console.log('   └── index.js (backend server)');
  console.log('');
  console.log('🚀 To start in production: npm start');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}