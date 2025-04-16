const fs = require('fs');
const path = require('path');

// Read the stats file
const statsPath = path.resolve(__dirname, '../dist/stats.html');
const statsContent = fs.readFileSync(statsPath, 'utf-8');

// Extract chunk information
const chunkRegex = /"name":"([^"]+)","size":(\d+),"imports":\[(.*?)\]/g;
const chunks = [];
let match;

while ((match = chunkRegex.exec(statsContent)) !== null) {
  const [_, name, size, imports] = match;
  chunks.push({
    name,
    size: parseInt(size, 10),
    imports: imports ? imports.split(',').map(i => i.trim().replace(/"/g, '')) : [],
  });
}

// Sort chunks by size
chunks.sort((a, b) => b.size - a.size);

// Calculate total size
const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);

// Generate report
console.log('\nChunk Analysis Report');
console.log('====================\n');

console.log(`Total Bundle Size: ${(totalSize / 1024 / 1024).toFixed(2)} MB\n`);

console.log('Chunk Sizes:');
console.log('------------');
chunks.forEach(chunk => {
  const sizeMB = (chunk.size / 1024 / 1024).toFixed(2);
  const percentage = ((chunk.size / totalSize) * 100).toFixed(1);
  console.log(`${chunk.name}: ${sizeMB} MB (${percentage}%)`);
});

// Analyze vendor chunks
const vendorChunks = chunks.filter(chunk => chunk.name.includes('vendor'));
const vendorSize = vendorChunks.reduce((sum, chunk) => sum + chunk.size, 0);
console.log(
  `\nVendor Chunks: ${(vendorSize / 1024 / 1024).toFixed(2)} MB (${((vendorSize / totalSize) * 100).toFixed(1)}%)`
);

// Analyze feature chunks
const featureChunks = chunks.filter(
  chunk =>
    chunk.name.includes('components-') ||
    chunk.name.includes('pages-') ||
    chunk.name === 'theme' ||
    chunk.name === 'hooks' ||
    chunk.name === 'utils'
);
const featureSize = featureChunks.reduce((sum, chunk) => sum + chunk.size, 0);
console.log(
  `Feature Chunks: ${(featureSize / 1024 / 1024).toFixed(2)} MB (${((featureSize / totalSize) * 100).toFixed(1)}%)`
);

// Check for potential optimizations
console.log('\nPotential Optimizations:');
console.log('----------------------');
if (vendorSize / totalSize > 0.5) {
  console.log('- Consider splitting vendor chunks further');
}
if (chunks.some(chunk => chunk.size > 500 * 1024)) {
  console.log('- Some chunks are larger than 500KB, consider further splitting');
}
if (featureChunks.length < 5) {
  console.log('- Consider splitting features into smaller chunks');
}

// Write report to file
const reportPath = path.resolve(__dirname, '../dist/chunk-analysis.txt');
fs.writeFileSync(reportPath, console.log.toString());
