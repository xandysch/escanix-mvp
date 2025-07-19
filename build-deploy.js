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
  
  // Check if dist/public exists (where vite outputs)
  const publicDir = path.resolve('dist', 'public');
  const distDir = path.resolve('dist');
  
  if (fs.existsSync(publicDir)) {
    console.log('📂 Moving files from dist/public to dist...');
    
    // Read all files in dist/public
    const files = fs.readdirSync(publicDir);
    
    // Move each file from dist/public to dist
    files.forEach(file => {
      const srcPath = path.join(publicDir, file);
      const destPath = path.join(distDir, file);
      
      if (fs.existsSync(destPath)) {
        if (fs.statSync(destPath).isDirectory()) {
          fs.rmSync(destPath, { recursive: true, force: true });
        } else {
          fs.unlinkSync(destPath);
        }
      }
      
      fs.renameSync(srcPath, destPath);
      console.log(`   ✓ Moved ${file}`);
    });
    
    // Remove the now-empty public directory
    fs.rmdirSync(publicDir);
    console.log('   ✓ Cleaned up dist/public directory');
  }
  
  console.log('✅ Build complete! Files are ready for deployment in ./dist');
  console.log('');
  console.log('📁 Deployment structure:');
  console.log('   dist/');
  console.log('   ├── index.html (frontend entry point)');
  console.log('   ├── assets/ (frontend assets)');
  console.log('   └── index.js (backend server)');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}