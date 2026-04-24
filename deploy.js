#!/usr/bin/env node

/**
 * Auto-deployment script for Office AI Weave
 * Supports multiple deployment platforms
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Office AI Weave - Auto Deploy Script\n');

// Check if dist folder exists
const distPath = path.join(__dirname, 'dist');
if (!fs.existsSync(distPath)) {
  console.log('📦 Building project...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build completed!\n');
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

// Deployment options
const deployOptions = [
  {
    name: 'Vercel',
    command: 'vercel --prod',
    description: 'Deploy to Vercel (recommended)'
  },
  {
    name: 'Netlify',
    command: 'netlify deploy --prod --dir=dist',
    description: 'Deploy to Netlify'
  },
  {
    name: 'Surge.sh',
    command: 'surge dist/',
    description: 'Deploy to Surge.sh (free) - will generate random domain'
  }
];

console.log('🌐 Choose deployment platform:');
deployOptions.forEach((option, index) => {
  console.log(`${index + 1}. ${option.name} - ${option.description}`);
});

// For now, let's create a simple static server option
console.log('\n📋 Manual deployment options:');
console.log('1. Upload the "dist" folder to any static hosting service');
console.log('2. Use Vercel: npx vercel --prod');
console.log('3. Use Netlify: npx netlify deploy --prod --dir=dist');
console.log('4. Use GitHub Pages: npm install -g gh-pages && gh-pages -d dist');

console.log('\n🎯 Your app is ready to deploy!');
console.log('📁 Built files are in the "dist" folder');
console.log('🔗 Share the deployed URL with others to let them experience your AI workflow builder!');