/**
 * Theme Access Pattern Analyzer
 * 
 * This script scans the codebase for direct theme property access patterns
 * that should be updated to use the theme adapter utilities.
 * 
 * Usage:
 *   node scripts/theme-access-analyzer.js [directory]
 * 
 * Example:
 *   node scripts/theme-access-analyzer.js src/components
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Define patterns to search for
const DIRECT_ACCESS_PATTERNS = [
  'theme.typography.scale',
  'theme.typography.weights',
  'theme.typography.lineHeights',
  'theme.typography.family',
  'theme.spacing[',
  'theme.colors.primary[',
  'theme.colors.secondary[',
  'theme.colors.textColors',
  'theme.transitions.normal',
  'theme.transitions.fast',
  'theme.transitions.slow',
];

// Define recommended replacements
const REPLACEMENTS = {
  'theme.typography.scale': 'getThemeTypography(theme, "fontSize...',
  'theme.typography.weights': 'getThemeTypography(theme, "fontWeight...',
  'theme.typography.lineHeights': 'getThemeTypography(theme, "lineHeight...',
  'theme.typography.family': 'getThemeTypography(theme, "fontFamily...',
  'theme.spacing[': 'getThemeSpacing(theme, ...',
  'theme.colors.primary[': 'getThemeColor(theme, "primary...',
  'theme.colors.secondary[': 'getThemeColor(theme, "secondary...',
  'theme.colors.textColors': 'getThemeColor(theme, "text...',
  'theme.transitions.normal': 'theme.transitions?.duration?.normal || "300ms"',
  'theme.transitions.fast': 'theme.transitions?.duration?.fast || "150ms"',
  'theme.transitions.slow': 'theme.transitions?.duration?.slow || "500ms"',
};

// Define directories to skip
const SKIP_DIRS = [
  'node_modules',
  'dist',
  'build',
  '.git',
];

// Results storage
const results = {
  totalFiles: 0,
  filesWithPatterns: 0,
  patternCounts: {},
  fileResults: {},
};

/**
 * Search for patterns in a file
 */
function searchInFile(filePath) {
  // Skip non-JS/TS files
  if (!['.js', '.jsx', '.ts', '.tsx'].includes(path.extname(filePath))) {
    return null;
  }

  results.totalFiles++;
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const matches = {};
    let hasMatches = false;
    
    // Search for each pattern
    DIRECT_ACCESS_PATTERNS.forEach(pattern => {
      const regex = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const patternMatches = (content.match(regex) || []).length;
      
      if (patternMatches > 0) {
        hasMatches = true;
        matches[pattern] = patternMatches;
        
        // Update total counts
        results.patternCounts[pattern] = (results.patternCounts[pattern] || 0) + patternMatches;
      }
    });
    
    if (hasMatches) {
      results.filesWithPatterns++;
      return { filePath, matches };
    }
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
  }
  
  return null;
}

/**
 * Recursively search directories
 */
function searchDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      // Skip directories in the exclude list
      if (SKIP_DIRS.includes(entry.name)) continue;
      
      searchDirectory(fullPath);
    } else {
      const fileResult = searchInFile(fullPath);
      if (fileResult) {
        results.fileResults[fileResult.filePath] = fileResult.matches;
      }
    }
  }
}

/**
 * Print results in a formatted way
 */
function printResults() {
  console.log('\n=== Theme Access Pattern Analysis Results ===\n');
  console.log(`Total files analyzed: ${results.totalFiles}`);
  console.log(`Files with direct theme access: ${results.filesWithPatterns}`);
  
  console.log('\n=== Pattern Usage Summary ===\n');
  Object.entries(results.patternCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([pattern, count]) => {
      console.log(`${pattern}: ${count} occurrences`);
      console.log(`  Recommended: ${REPLACEMENTS[pattern] || 'Use theme adapter'}`);
    });
  
  console.log('\n=== Files to Update ===\n');
  Object.entries(results.fileResults)
    .sort((a, b) => Object.values(b[1]).reduce((sum, val) => sum + val, 0) - 
                    Object.values(a[1]).reduce((sum, val) => sum + val, 0))
    .forEach(([filePath, patterns]) => {
      const totalPatterns = Object.values(patterns).reduce((sum, val) => sum + val, 0);
      const relativePath = filePath.replace(process.cwd(), '');
      console.log(`${relativePath} (${totalPatterns} patterns):`);
      
      Object.entries(patterns)
        .sort((a, b) => b[1] - a[1])
        .forEach(([pattern, count]) => {
          console.log(`  - ${pattern}: ${count} occurrences`);
        });
      
      console.log('');
    });
}

/**
 * Main execution
 */
function main() {
  const targetDir = process.argv[2] || 'src';
  const fullPath = path.resolve(process.cwd(), targetDir);
  
  console.log(`Scanning directory: ${fullPath}`);
  searchDirectory(fullPath);
  printResults();
  
  // Write results to a file
  const outputFile = 'theme-access-report.json';
  fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
  console.log(`\nDetailed results written to ${outputFile}`);
}

// Run the script
main(); 