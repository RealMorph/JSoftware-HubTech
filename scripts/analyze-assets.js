const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Read the stats file
const statsPath = path.resolve(__dirname, '../dist/stats.html');
const statsContent = fs.readFileSync(statsPath, 'utf-8');

// Extract asset information
const assetRegex = /"name":"([^"]+)","size":(\d+),"type":"([^"]+)"/g;
const assets = [];
let match;

while ((match = assetRegex.exec(statsContent)) !== null) {
  const [_, name, size, type] = match;
  assets.push({
    name,
    size: parseInt(size, 10),
    type,
  });
}

// Sort assets by size
assets.sort((a, b) => b.size - a.size);

// Calculate total size
const totalSize = assets.reduce((sum, asset) => sum + asset.size, 0);

// Group assets by type
const assetsByType = assets.reduce((acc, asset) => {
  acc[asset.type] = acc[asset.type] || [];
  acc[asset.type].push(asset);
  return acc;
}, {});

// Generate report
console.log('\nAsset Optimization Report');
console.log('=======================\n');

console.log(`Total Bundle Size: ${(totalSize / 1024 / 1024).toFixed(2)} MB\n`);

console.log('Asset Types:');
console.log('------------');
Object.entries(assetsByType).forEach(([type, typeAssets]) => {
  const typeSize = typeAssets.reduce((sum, asset) => sum + asset.size, 0);
  const percentage = ((typeSize / totalSize) * 100).toFixed(1);
  console.log(`${type}: ${(typeSize / 1024 / 1024).toFixed(2)} MB (${percentage}%)`);
});

console.log('\nLargest Assets:');
console.log('--------------');
assets.slice(0, 10).forEach(asset => {
  const sizeMB = (asset.size / 1024 / 1024).toFixed(2);
  const percentage = ((asset.size / totalSize) * 100).toFixed(1);
  console.log(`${asset.name}: ${sizeMB} MB (${percentage}%)`);
});

// Check for potential optimizations
console.log('\nPotential Optimizations:');
console.log('----------------------');

// Check image assets
const imageAssets = assets.filter(asset => asset.name.match(/\.(png|jpe?g|gif|svg|webp|ico)$/i));
if (imageAssets.length > 0) {
  const imageSize = imageAssets.reduce((sum, asset) => sum + asset.size, 0);
  if (imageSize > 1024 * 1024) {
    // 1MB
    console.log('- Large image assets detected, consider further compression');
  }
  const largeImages = imageAssets.filter(asset => asset.size > 200 * 1024); // 200KB
  if (largeImages.length > 0) {
    console.log('- Some images are larger than 200KB, consider resizing');
  }
}

// Check font assets
const fontAssets = assets.filter(asset => asset.name.match(/\.(woff2?|eot|ttf|otf)$/i));
if (fontAssets.length > 0) {
  const fontSize = fontAssets.reduce((sum, asset) => sum + asset.size, 0);
  if (fontSize > 500 * 1024) {
    // 500KB
    console.log('- Large font assets detected, consider subsetting');
  }
}

// Check CSS assets
const cssAssets = assets.filter(asset => asset.name.endsWith('.css'));
if (cssAssets.length > 0) {
  const cssSize = cssAssets.reduce((sum, asset) => sum + asset.size, 0);
  if (cssSize > 200 * 1024) {
    // 200KB
    console.log('- Large CSS bundle detected, consider splitting');
  }
}

// Check for duplicate assets
const assetNames = new Set();
const duplicates = assets.filter(asset => {
  const isDuplicate = assetNames.has(asset.name);
  assetNames.add(asset.name);
  return isDuplicate;
});
if (duplicates.length > 0) {
  console.log('- Duplicate assets detected, consider deduplication');
}

// Write report to file
const reportPath = path.resolve(__dirname, '../dist/asset-analysis.txt');
fs.writeFileSync(reportPath, console.log.toString());
