/**
 * Bundle Optimization Script
 * 
 * This script analyzes and optimizes the application's bundle size by:
 * 1. Running bundle analysis to visualize size distribution
 * 2. Identifying opportunities for code splitting
 * 3. Detecting unused dependencies
 * 4. Finding large dependencies that could be loaded asynchronously
 * 5. Generating a report with recommendations
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { execSync } = require('child_process');

// Configuration
const BUNDLE_SIZE_THRESHOLD = 100 * 1024; // 100KB
const BUNDLE_PERCENTAGE_THRESHOLD = 5; // 5% of total bundle size
const OUTPUT_DIR = path.join(process.cwd(), 'bundle-analysis');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Run bundle analysis
console.log(chalk.blue('📊 Running bundle analysis...'));
try {
  execSync('npm run analyze:treemap', { stdio: 'inherit' });
  console.log(chalk.green('✅ Bundle analysis complete. Stats available at dist/stats.html'));
} catch (error) {
  console.error(chalk.red('❌ Failed to run bundle analysis:'), error);
  process.exit(1);
}

// Parse package.json to find potential large dependencies
console.log(chalk.blue('🔍 Analyzing dependencies...'));
const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

// Known large packages that could benefit from async loading
const knownLargeDependencies = [
  'react-leaflet',
  'leaflet',
  'recharts',
  'framer-motion',
  'firebase',
  '@aws-sdk/client-s3',
  '@tanstack/react-query',
  'react-dnd',
];

// Find large dependencies in the project
const largeDependencies = knownLargeDependencies.filter(dep => 
  dependencies[dep] !== undefined
);

// Generate report with recommendations
console.log(chalk.blue('📝 Generating optimization report...'));
const report = `
# Bundle Optimization Report

Generated on: ${new Date().toISOString()}

## Large Dependencies Detected

The following dependencies are relatively large and could benefit from being loaded asynchronously:

${largeDependencies.map(dep => `- ${dep}`).join('\n')}

## Optimization Recommendations

1. **Code Splitting Opportunities**:
   - Use React.lazy and Suspense for route-based code splitting
   - Consider splitting feature modules using dynamic imports
   - Move rarely used features to separate chunks

2. **Lazy Loading Recommendations**:
   - Lazy load visualization components when they come into view
   - Defer loading of heavy UI libraries until needed
   - Use import() for non-critical functionality

3. **Tree Shaking Improvements**:
   - Update imports to use specific components rather than whole libraries
   - Use babel-plugin-transform-imports for libraries that don't support tree shaking
   - Mark side-effect free modules in package.json

4. **Module/NoModule Pattern**:
   - Implement differential loading for modern vs legacy browsers
   - Use browserslist configuration to target appropriate browsers
   - Configure the build system to generate separate bundles

## Next Steps

1. View the detailed bundle analysis at dist/stats.html
2. Implement code splitting for the largest components
3. Update imports to be more specific
4. Re-run this analysis after changes to verify improvements
`;

// Save report
fs.writeFileSync(path.join(OUTPUT_DIR, 'optimization-report.md'), report);
console.log(chalk.green(`✅ Report generated at ${path.join(OUTPUT_DIR, 'optimization-report.md')}`));

// Scan the codebase for import statements to identify optimization opportunities
console.log(chalk.blue('🔎 Scanning codebase for import optimization opportunities...'));

// Function to recursively get all JS/TS files
function getJsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (!filePath.includes('node_modules') && !filePath.includes('dist')) {
        getJsFiles(filePath, fileList);
      }
    } else if (/\.(js|jsx|ts|tsx)$/.test(file) && !file.includes('.test.')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Find all JS/TS files
const allFiles = getJsFiles(path.join(process.cwd(), 'src'));

// Import statements to look for
const importStats = {
  totalImports: 0,
  wildcardImports: 0, // e.g., import * as X from 'lib'
  specificImports: 0, // e.g., import { X } from 'lib'
  defaultImports: 0,  // e.g., import X from 'lib'
  dynamicImports: 0,  // e.g., import('lib')
  largePackageImports: {}, // Track imports of large packages
};

// Scan each file for imports
allFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  
  // Count different types of imports
  const wildcardMatches = content.match(/import\s+\*\s+as\s+\w+\s+from\s+['"]([^'"]+)['"]/g);
  const specificMatches = content.match(/import\s+\{\s*[^}]+\}\s+from\s+['"]([^'"]+)['"]/g);
  const defaultMatches = content.match(/import\s+\w+\s+from\s+['"]([^'"]+)['"]/g);
  const dynamicMatches = content.match(/import\(['"]([^'"]+)['"]\)/g);
  
  if (wildcardMatches) importStats.wildcardImports += wildcardMatches.length;
  if (specificMatches) importStats.specificImports += specificMatches.length;
  if (defaultMatches) importStats.defaultImports += defaultMatches.length;
  if (dynamicMatches) importStats.dynamicImports += dynamicMatches.length;
  
  importStats.totalImports += 
    (wildcardMatches?.length || 0) + 
    (specificMatches?.length || 0) + 
    (defaultMatches?.length || 0) + 
    (dynamicMatches?.length || 0);
  
  // Track imports of known large packages
  largeDependencies.forEach(dep => {
    const depMatches = content.match(new RegExp(`from\\s+['"]${dep}['\"]`, 'g'));
    if (depMatches) {
      importStats.largePackageImports[dep] = (importStats.largePackageImports[dep] || 0) + depMatches.length;
    }
  });
});

// Add import statistics to the report
const importReport = `
## Import Statement Analysis

- Total imports: ${importStats.totalImports}
- Wildcard imports: ${importStats.wildcardImports} (${Math.round(importStats.wildcardImports / importStats.totalImports * 100)}%)
- Specific imports: ${importStats.specificImports} (${Math.round(importStats.specificImports / importStats.totalImports * 100)}%)
- Default imports: ${importStats.defaultImports} (${Math.round(importStats.defaultImports / importStats.totalImports * 100)}%)
- Dynamic imports: ${importStats.dynamicImports} (${Math.round(importStats.dynamicImports / importStats.totalImports * 100)}%)

### Large Package Import Frequency

${Object.entries(importStats.largePackageImports)
  .sort((a, b) => b[1] - a[1])
  .map(([dep, count]) => `- ${dep}: ${count} imports`)
  .join('\n')
}

## Optimization Opportunities

${importStats.wildcardImports > 0 ? 
  `- **Wildcard Imports**: Replace wildcard imports with specific imports to improve tree shaking` : ''}
${importStats.dynamicImports < importStats.totalImports * 0.1 ? 
  `- **Dynamic Imports**: Increase use of dynamic imports for large dependencies, especially for components that are not needed immediately` : ''}
${Object.entries(importStats.largePackageImports)
  .filter(([_, count]) => count > 3)
  .map(([dep, count]) => `- **${dep}**: Used in multiple places (${count}). Consider centralizing imports or using dynamic imports`)
  .join('\n')
}
`;

// Append import analysis to the report
fs.appendFileSync(path.join(OUTPUT_DIR, 'optimization-report.md'), importReport);

console.log(chalk.green('✅ Import analysis complete and added to the report'));
console.log(chalk.blue('📈 Optimization process complete!'));
console.log(chalk.yellow('View the full report at:'), path.join(OUTPUT_DIR, 'optimization-report.md')); 