#!/usr/bin/env node
/**
 * Build script for MailVeil Chrome Extension
 * Creates a distributable zip file ready for Chrome Web Store submission
 */

import { promises as fs } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

// Files to include in the distribution
const INCLUDE_FILES = [
  'manifest.json',
  'popup.html',
  'popup.css',
  'popup.js',
  'content.js',
  'config.js',
  'session.js',
  'api.js',
  'utils.js',
  'webpage-utils.js',
  'icons/icon16.png',
  'icons/icon48.png',
  'icons/icon128.png'
];

async function clean() {
  console.log('🧹 Cleaning dist directory...');
  await fs.rm(distDir, { recursive: true, force: true });
  await fs.mkdir(distDir, { recursive: true });
  await fs.mkdir(path.join(distDir, 'icons'), { recursive: true });
}

async function copyFiles() {
  console.log('📁 Copying extension files...');
  
  for (const file of INCLUDE_FILES) {
    const src = path.join(rootDir, file);
    const dest = path.join(distDir, file);
    
    try {
      await fs.copyFile(src, dest);
      console.log(`  ✓ ${file}`);
    } catch (err) {
      console.error(`  ✗ ${file}: ${err.message}`);
      process.exit(1);
    }
  }
}

async function createZip() {
  console.log('📦 Creating zip archive...');
  
  const manifest = JSON.parse(
    await fs.readFile(path.join(distDir, 'manifest.json'), 'utf-8')
  );
  const version = manifest.version;
  const zipName = `mailveil-extension-v${version}.zip`;
  const zipPath = path.join(rootDir, zipName);
  
  // Remove existing zip if present
  await fs.rm(zipPath, { force: true });
  
  // Create zip using native zip command
  await execAsync(`cd "${distDir}" && zip -r "${zipPath}" .`);
  
  const stats = await fs.stat(zipPath);
  console.log(`  ✓ Created ${zipName} (${(stats.size / 1024).toFixed(1)} KB)`);
  
  return zipPath;
}

async function build() {
  console.log('🚀 Building MailVeil Extension...\n');
  
  await clean();
  await copyFiles();
  
  const shouldZip = process.argv.includes('--zip');
  if (shouldZip) {
    await createZip();
  }
  
  console.log('\n✅ Build complete!');
  console.log(`   Output: ${distDir}`);
  
  if (!shouldZip) {
    console.log('\n   Tip: Run with --zip to create a distributable archive');
  }
}

build().catch(err => {
  console.error('\n❌ Build failed:', err.message);
  process.exit(1);
});
