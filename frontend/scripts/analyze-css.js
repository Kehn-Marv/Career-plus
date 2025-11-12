/**
 * CSS Bundle Size Analyzer
 * Checks if CSS bundle meets the < 50KB gzipped target
 * Run after build: node scripts/analyze-css.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { gzipSync } from 'zlib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, '..', 'dist', 'assets');
const TARGET_SIZE_KB = 50;

function getFileSizeInKB(filePath) {
  const stats = fs.statSync(filePath);
  return (stats.size / 1024).toFixed(2);
}

function getGzipSizeInKB(filePath) {
  const content = fs.readFileSync(filePath);
  const gzipped = gzipSync(content);
  return (gzipped.length / 1024).toFixed(2);
}

function findCSSFiles(dir) {
  let cssFiles = [];
  
  if (!fs.existsSync(dir)) {
    return cssFiles;
  }

  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    
    if (item.isDirectory()) {
      // Recursively search subdirectories
      cssFiles = cssFiles.concat(findCSSFiles(fullPath));
    } else if (item.name.endsWith('.css')) {
      cssFiles.push(fullPath);
    }
  }
  
  return cssFiles;
}

function analyzeCSSFiles() {
  console.log('\n📊 CSS Bundle Size Analysis\n');
  console.log('Target: < 50KB gzipped\n');
  console.log('─'.repeat(70));

  if (!fs.existsSync(distDir)) {
    console.error('❌ Build directory not found. Run `npm run build` first.');
    process.exit(1);
  }

  const cssFiles = findCSSFiles(distDir);

  if (cssFiles.length === 0) {
    console.error('❌ No CSS files found in dist/assets');
    process.exit(1);
  }

  let totalSize = 0;
  let totalGzipSize = 0;
  let allFilesPass = true;

  cssFiles.forEach(filePath => {
    const fileName = path.basename(filePath);
    const size = parseFloat(getFileSizeInKB(filePath));
    const gzipSize = parseFloat(getGzipSizeInKB(filePath));
    
    totalSize += size;
    totalGzipSize += gzipSize;

    const status = gzipSize < TARGET_SIZE_KB ? '✅' : '⚠️';
    if (gzipSize >= TARGET_SIZE_KB) {
      allFilesPass = false;
    }

    console.log(`${status} ${fileName}`);
    console.log(`   Original: ${size} KB`);
    console.log(`   Gzipped:  ${gzipSize} KB`);
    console.log('');
  });

  console.log('─'.repeat(70));
  console.log(`\nTotal CSS Size:`);
  console.log(`   Original: ${totalSize.toFixed(2)} KB`);
  console.log(`   Gzipped:  ${totalGzipSize.toFixed(2)} KB`);

  if (allFilesPass && totalGzipSize < TARGET_SIZE_KB) {
    console.log(`\n✅ All CSS files meet the ${TARGET_SIZE_KB}KB gzipped target!`);
    process.exit(0);
  } else if (totalGzipSize < TARGET_SIZE_KB) {
    console.log(`\n✅ Total CSS size meets the ${TARGET_SIZE_KB}KB gzipped target!`);
    process.exit(0);
  } else {
    console.log(`\n⚠️  CSS bundle exceeds ${TARGET_SIZE_KB}KB gzipped target.`);
    console.log(`   Consider removing unused Tailwind classes or splitting CSS further.`);
    process.exit(1);
  }
}

analyzeCSSFiles();
