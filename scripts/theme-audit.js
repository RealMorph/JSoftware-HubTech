/**
 * Theme Utility Audit Tool
 * 
 * This script scans the codebase for deprecated theme utility usage.
 * It identifies components that still use old theme patterns and generates a report.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Deprecated theme utilities to search for
const DEPRECATED_PATTERNS = [
  'getThemeValue',
  'createThemeValueGetter',
  'getThemeColor',
  'getThemeSpacing',
  'getThemeFontSize',
  'getThemeShadow',
  'getThemeBorderRadius',
  'getThemeTransitionDuration',
  'getThemeTransition',
  'adaptThemeForEmotion',
  'adaptEmotionTheme',
  'withThemeAdapter',
  'themed',
  'mixins',
  // Add any other deprecated patterns to search for
];

// Deprecated theme utility import paths
const DEPRECATED_IMPORTS = [
  'core/theme/styled',
  'core/theme/theme-utils',
  'core/theme/theme-adapter',
  // Add any other deprecated import paths
];

// Directories to scan
const DIRECTORIES_TO_SCAN = [
  'src/components',
  'src/core',
  // Add any other directories to scan
];

// Directories to exclude 
const EXCLUDE_DIRS = [
  'node_modules',
  'dist',
  'coverage',
  'test',
  'tests',
  // Add any other directories to exclude
];

// Files to exclude
const EXCLUDE_FILES = [
  '.test.',
  '.spec.',
  '.d.ts',
  // Add any other files to exclude
];

// Results storage
const results = {
  deprecatedUtilUsage: [],
  deprecatedImports: [],
  summary: {
    filesScanned: 0,
    filesWithDeprecatedUtils: 0,
    totalDeprecatedUsages: 0,
    componentStats: {}
  }
};

/**
 * Check a file for deprecated theme utility usage
 */
function scanFile(filePath) {
  if (EXCLUDE_FILES.some(pattern => filePath.includes(pattern))) {
    return;
  }

  results.summary.filesScanned++;
  const content = fs.readFileSync(filePath, 'utf8');
  let hasDeprecatedUsage = false;
  
  // Check for deprecated imports
  for (const importPattern of DEPRECATED_IMPORTS) {
    if (content.includes(importPattern)) {
      results.deprecatedImports.push({
        file: filePath,
        importPattern
      });
      hasDeprecatedUsage = true;
    }
  }

  // Check for deprecated utility usage
  for (const pattern of DEPRECATED_PATTERNS) {
    const regex = new RegExp(`\\b${pattern}\\b`, 'g');
    const matches = content.match(regex);
    
    if (matches && matches.length > 0) {
      results.deprecatedUtilUsage.push({
        file: filePath,
        pattern,
        occurrences: matches.length
      });
      
      results.summary.totalDeprecatedUsages += matches.length;
      hasDeprecatedUsage = true;
    }
  }
  
  if (hasDeprecatedUsage) {
    results.summary.filesWithDeprecatedUtils++;
    
    // Track stats by component type
    const componentCategory = getComponentCategory(filePath);
    if (!results.summary.componentStats[componentCategory]) {
      results.summary.componentStats[componentCategory] = 0;
    }
    results.summary.componentStats[componentCategory]++;
  }
}

/**
 * Get component category based on file path
 */
function getComponentCategory(filePath) {
  if (filePath.includes('/base/')) return 'Base Components';
  if (filePath.includes('/data-display/')) return 'Data Display Components';
  if (filePath.includes('/data-visualization/')) return 'Data Visualization Components';
  if (filePath.includes('/feedback/')) return 'Feedback Components';
  if (filePath.includes('/layout/')) return 'Layout Components';
  if (filePath.includes('/navigation/')) return 'Navigation Components';
  if (filePath.includes('/core/theme/')) return 'Theme Components';
  return 'Other';
}

/**
 * Recursively scan directories for files
 */
function scanDirectory(dirPath) {
  if (EXCLUDE_DIRS.some(dir => dirPath.includes(dir))) {
    return;
  }
  
  const items = fs.readdirSync(dirPath);
  
  for (const item of items) {
    const itemPath = path.join(dirPath, item);
    const stats = fs.statSync(itemPath);
    
    if (stats.isDirectory()) {
      scanDirectory(itemPath);
    } else if (stats.isFile() && (
      itemPath.endsWith('.js') || 
      itemPath.endsWith('.jsx') || 
      itemPath.endsWith('.ts') || 
      itemPath.endsWith('.tsx')
    )) {
      scanFile(itemPath);
    }
  }
}

/**
 * Run tests to check for regressions
 */
function runTests() {
  try {
    console.log('Running test suite to check for regressions...');
    execSync('npm test', { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error('Test suite failed!');
    return false;
  }
}

/**
 * Generate the audit report
 */
function generateReport() {
  console.log('\n=== Theme Utility Audit Report ===\n');
  console.log(`Files scanned: ${results.summary.filesScanned}`);
  console.log(`Files with deprecated utils: ${results.summary.filesWithDeprecatedUtils}`);
  console.log(`Total deprecated usages: ${results.summary.totalDeprecatedUsages}`);
  
  console.log('\nComponent Category Breakdown:');
  for (const [category, count] of Object.entries(results.summary.componentStats)) {
    console.log(`- ${category}: ${count} files`);
  }
  
  if (results.deprecatedImports.length > 0) {
    console.log('\nFiles with deprecated imports:');
    for (const item of results.deprecatedImports) {
      console.log(`- ${item.file} (imports ${item.importPattern})`);
    }
  }
  
  if (results.deprecatedUtilUsage.length > 0) {
    console.log('\nDeprecated utility usage:');
    for (const item of results.deprecatedUtilUsage) {
      console.log(`- ${item.file}: uses ${item.pattern} (${item.occurrences} occurrences)`);
    }
  }
  
  // Save report to file
  const reportPath = 'theme-audit-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\nDetailed report saved to ${reportPath}`);
  
  if (results.summary.filesWithDeprecatedUtils === 0) {
    console.log('\n✅ No deprecated theme utilities found! Safe to proceed with removal.');
  } else {
    console.log(`\n⚠️ Found ${results.summary.filesWithDeprecatedUtils} files still using deprecated theme utilities.`);
    console.log('These must be migrated before proceeding with removal.');
  }
}

/**
 * Main function
 */
function main() {
  console.log('Starting theme utility audit...');
  
  // Scan directories
  for (const dir of DIRECTORIES_TO_SCAN) {
    scanDirectory(dir);
  }
  
  // Generate report
  generateReport();
  
  // If no deprecated utils found, run tests
  if (results.summary.filesWithDeprecatedUtils === 0) {
    console.log('\nRunning regression tests...');
    const testsPass = runTests();
    
    if (testsPass) {
      console.log('\n✅ Tests passed! Safe to proceed with removal.');
    } else {
      console.log('\n❌ Tests failed. Please fix issues before proceeding with removal.');
    }
  }
}

// Run the script
main(); 
 * Theme Utility Audit Tool
 * 
 * This script scans the codebase for deprecated theme utility usage.
 * It identifies components that still use old theme patterns and generates a report.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Deprecated theme utilities to search for
const DEPRECATED_PATTERNS = [
  'getThemeValue',
  'createThemeValueGetter',
  'getThemeColor',
  'getThemeSpacing',
  'getThemeFontSize',
  'getThemeShadow',
  'getThemeBorderRadius',
  'getThemeTransitionDuration',
  'getThemeTransition',
  'adaptThemeForEmotion',
  'adaptEmotionTheme',
  'withThemeAdapter',
  'themed',
  'mixins',
  // Add any other deprecated patterns to search for
];

// Deprecated theme utility import paths
const DEPRECATED_IMPORTS = [
  'core/theme/styled',
  'core/theme/theme-utils',
  'core/theme/theme-adapter',
  // Add any other deprecated import paths
];

// Directories to scan
const DIRECTORIES_TO_SCAN = [
  'src/components',
  'src/core',
  // Add any other directories to scan
];

// Directories to exclude 
const EXCLUDE_DIRS = [
  'node_modules',
  'dist',
  'coverage',
  'test',
  'tests',
  // Add any other directories to exclude
];

// Files to exclude
const EXCLUDE_FILES = [
  '.test.',
  '.spec.',
  '.d.ts',
  // Add any other files to exclude
];

// Results storage
const results = {
  deprecatedUtilUsage: [],
  deprecatedImports: [],
  summary: {
    filesScanned: 0,
    filesWithDeprecatedUtils: 0,
    totalDeprecatedUsages: 0,
    componentStats: {}
  }
};

/**
 * Check a file for deprecated theme utility usage
 */
function scanFile(filePath) {
  if (EXCLUDE_FILES.some(pattern => filePath.includes(pattern))) {
    return;
  }

  results.summary.filesScanned++;
  const content = fs.readFileSync(filePath, 'utf8');
  let hasDeprecatedUsage = false;
  
  // Check for deprecated imports
  for (const importPattern of DEPRECATED_IMPORTS) {
    if (content.includes(importPattern)) {
      results.deprecatedImports.push({
        file: filePath,
        importPattern
      });
      hasDeprecatedUsage = true;
    }
  }

  // Check for deprecated utility usage
  for (const pattern of DEPRECATED_PATTERNS) {
    const regex = new RegExp(`\\b${pattern}\\b`, 'g');
    const matches = content.match(regex);
    
    if (matches && matches.length > 0) {
      results.deprecatedUtilUsage.push({
        file: filePath,
        pattern,
        occurrences: matches.length
      });
      
      results.summary.totalDeprecatedUsages += matches.length;
      hasDeprecatedUsage = true;
    }
  }
  
  if (hasDeprecatedUsage) {
    results.summary.filesWithDeprecatedUtils++;
    
    // Track stats by component type
    const componentCategory = getComponentCategory(filePath);
    if (!results.summary.componentStats[componentCategory]) {
      results.summary.componentStats[componentCategory] = 0;
    }
    results.summary.componentStats[componentCategory]++;
  }
}

/**
 * Get component category based on file path
 */
function getComponentCategory(filePath) {
  if (filePath.includes('/base/')) return 'Base Components';
  if (filePath.includes('/data-display/')) return 'Data Display Components';
  if (filePath.includes('/data-visualization/')) return 'Data Visualization Components';
  if (filePath.includes('/feedback/')) return 'Feedback Components';
  if (filePath.includes('/layout/')) return 'Layout Components';
  if (filePath.includes('/navigation/')) return 'Navigation Components';
  if (filePath.includes('/core/theme/')) return 'Theme Components';
  return 'Other';
}

/**
 * Recursively scan directories for files
 */
function scanDirectory(dirPath) {
  if (EXCLUDE_DIRS.some(dir => dirPath.includes(dir))) {
    return;
  }
  
  const items = fs.readdirSync(dirPath);
  
  for (const item of items) {
    const itemPath = path.join(dirPath, item);
    const stats = fs.statSync(itemPath);
    
    if (stats.isDirectory()) {
      scanDirectory(itemPath);
    } else if (stats.isFile() && (
      itemPath.endsWith('.js') || 
      itemPath.endsWith('.jsx') || 
      itemPath.endsWith('.ts') || 
      itemPath.endsWith('.tsx')
    )) {
      scanFile(itemPath);
    }
  }
}

/**
 * Run tests to check for regressions
 */
function runTests() {
  try {
    console.log('Running test suite to check for regressions...');
    execSync('npm test', { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error('Test suite failed!');
    return false;
  }
}

/**
 * Generate the audit report
 */
function generateReport() {
  console.log('\n=== Theme Utility Audit Report ===\n');
  console.log(`Files scanned: ${results.summary.filesScanned}`);
  console.log(`Files with deprecated utils: ${results.summary.filesWithDeprecatedUtils}`);
  console.log(`Total deprecated usages: ${results.summary.totalDeprecatedUsages}`);
  
  console.log('\nComponent Category Breakdown:');
  for (const [category, count] of Object.entries(results.summary.componentStats)) {
    console.log(`- ${category}: ${count} files`);
  }
  
  if (results.deprecatedImports.length > 0) {
    console.log('\nFiles with deprecated imports:');
    for (const item of results.deprecatedImports) {
      console.log(`- ${item.file} (imports ${item.importPattern})`);
    }
  }
  
  if (results.deprecatedUtilUsage.length > 0) {
    console.log('\nDeprecated utility usage:');
    for (const item of results.deprecatedUtilUsage) {
      console.log(`- ${item.file}: uses ${item.pattern} (${item.occurrences} occurrences)`);
    }
  }
  
  // Save report to file
  const reportPath = 'theme-audit-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\nDetailed report saved to ${reportPath}`);
  
  if (results.summary.filesWithDeprecatedUtils === 0) {
    console.log('\n✅ No deprecated theme utilities found! Safe to proceed with removal.');
  } else {
    console.log(`\n⚠️ Found ${results.summary.filesWithDeprecatedUtils} files still using deprecated theme utilities.`);
    console.log('These must be migrated before proceeding with removal.');
  }
}

/**
 * Main function
 */
function main() {
  console.log('Starting theme utility audit...');
  
  // Scan directories
  for (const dir of DIRECTORIES_TO_SCAN) {
    scanDirectory(dir);
  }
  
  // Generate report
  generateReport();
  
  // If no deprecated utils found, run tests
  if (results.summary.filesWithDeprecatedUtils === 0) {
    console.log('\nRunning regression tests...');
    const testsPass = runTests();
    
    if (testsPass) {
      console.log('\n✅ Tests passed! Safe to proceed with removal.');
    } else {
      console.log('\n❌ Tests failed. Please fix issues before proceeding with removal.');
    }
  }
}

// Run the script
main(); 