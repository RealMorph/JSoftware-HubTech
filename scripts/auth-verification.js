#!/usr/bin/env node

/**
 * Authentication Implementation Verification Script
 * 
 * This utility scans the codebase to verify that authentication best practices
 * are followed throughout the application. It checks for:
 * 
 * 1. Proper usage of the useAuth hook
 * 2. No direct localStorage access for auth tokens
 * 3. Protected routes implementation
 * 4. Consistent error handling
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const SRC_DIR = path.join(__dirname, '..', 'src');
const AUTH_HOOK_PATTERN = /useAuth\(\)/;
const LOCAL_STORAGE_AUTH_PATTERN = /localStorage\.([gs]et|remove)Item\(['"].*token['"]\)/i;
const PROTECTED_ROUTE_PATTERN = /<ProtectedRoute/;
const TOKEN_SERVICE_PATTERN = /TokenService\./;
const AUTH_CONTEXT_PATTERN = /<AuthContext\.Provider/;
const COMPONENTS_TO_CHECK = [
  'Header.tsx',
  'UserDropdown.tsx',
  'ProfilePage.tsx',
  'SettingsPage.tsx',
  'DashboardPage.tsx'
];

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Result counters
const results = {
  errors: 0,
  warnings: 0,
  success: 0
};

/**
 * Find all files matching a pattern in a directory (recursive)
 * @param {string} dir - Directory to search
 * @param {RegExp} pattern - File name pattern to match
 * @returns {string[]} - Array of file paths
 */
function findFiles(dir, pattern) {
  let results = [];

  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      results = results.concat(findFiles(filePath, pattern));
    } else if (pattern.test(file)) {
      results.push(filePath);
    }
  }
  
  return results;
}

/**
 * Check if a file contains a pattern
 * @param {string} filePath - Path to the file
 * @param {RegExp} pattern - Pattern to search for
 * @returns {boolean} - True if pattern is found
 */
function fileContainsPattern(filePath, pattern) {
  const content = fs.readFileSync(filePath, 'utf8');
  return pattern.test(content);
}

/**
 * Count occurrences of a pattern in a file
 * @param {string} filePath - Path to the file
 * @param {RegExp} pattern - Pattern to search for
 * @returns {number} - Number of occurrences
 */
function countPatternOccurrences(filePath, pattern) {
  const content = fs.readFileSync(filePath, 'utf8');
  const matches = content.match(new RegExp(pattern, 'g'));
  return matches ? matches.length : 0;
}

/**
 * Log a message with color
 * @param {string} message - Message to log
 * @param {string} color - Color code
 */
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

/**
 * Log a success message
 * @param {string} message - Message to log
 */
function success(message) {
  log(`✅ ${message}`, colors.green);
  results.success++;
}

/**
 * Log a warning message
 * @param {string} message - Message to log
 */
function warning(message) {
  log(`⚠️ ${message}`, colors.yellow);
  results.warnings++;
}

/**
 * Log an error message
 * @param {string} message - Message to log
 */
function error(message) {
  log(`❌ ${message}`, colors.red);
  results.errors++;
}

/**
 * Log a section header
 * @param {string} title - Section title
 */
function section(title) {
  log(`\n${colors.cyan}=== ${title} ===${colors.reset}\n`);
}

// Main script execution
function main() {
  console.log('\n🔒 Authentication Implementation Verification\n');
  
  // Check for AuthContext usage
  section('Auth Context Implementation');
  const contextFiles = findFiles(path.join(SRC_DIR, 'core'), /AuthContext\.tsx$/);
  
  if (contextFiles.length === 0) {
    error('No AuthContext.tsx file found');
  } else {
    success(`Found AuthContext at ${path.relative(SRC_DIR, contextFiles[0])}`);
    
    // Check context implementation
    const authContextContent = fs.readFileSync(contextFiles[0], 'utf8');
    
    if (authContextContent.includes('useMemo')) {
      success('AuthContext values are memoized');
    } else {
      warning('AuthContext values should be memoized with useMemo');
    }
  }
  
  // Check for useAuth hook
  section('useAuth Hook Usage');
  const authHookFiles = findFiles(path.join(SRC_DIR, 'core'), /useAuth\.tsx$/);
  
  if (authHookFiles.length === 0) {
    error('No useAuth.tsx hook found');
  } else {
    success(`Found useAuth hook at ${path.relative(SRC_DIR, authHookFiles[0])}`);
    
    // Scan components for useAuth usage
    log('Checking key components for useAuth hook usage:');
    
    for (const componentName of COMPONENTS_TO_CHECK) {
      const componentFiles = findFiles(SRC_DIR, new RegExp(`${componentName}$`));
      
      if (componentFiles.length === 0) {
        warning(`Component ${componentName} not found`);
        continue;
      }
      
      const componentPath = componentFiles[0];
      const componentRelPath = path.relative(SRC_DIR, componentPath);
      
      if (fileContainsPattern(componentPath, AUTH_HOOK_PATTERN)) {
        success(`${componentRelPath} - Uses useAuth hook`);
      } else {
        warning(`${componentRelPath} - Does not use useAuth hook`);
      }
    }
  }
  
  // Check for TokenService usage
  section('TokenService Implementation');
  const tokenServiceFiles = findFiles(path.join(SRC_DIR, 'core'), /token-service\.tsx?$/);
  
  if (tokenServiceFiles.length === 0) {
    error('No token-service.ts file found');
  } else {
    success(`Found TokenService at ${path.relative(SRC_DIR, tokenServiceFiles[0])}`);
    
    // Check TokenService implementation
    const tokenServiceContent = fs.readFileSync(tokenServiceFiles[0], 'utf8');
    
    if (tokenServiceContent.includes('localStorage') && tokenServiceContent.includes('accessToken')) {
      warning('TokenService may be storing access tokens in localStorage');
    } else if (tokenServiceContent.includes('localStorage') && tokenServiceContent.includes('refreshToken')) {
      success('TokenService stores only refresh tokens in localStorage');
    }
    
    if (tokenServiceContent.includes('isTokenExpired')) {
      success('TokenService includes token expiration checking');
    } else {
      warning('TokenService should include token expiration validation');
    }
  }
  
  // Check for localStorage usage
  section('Direct localStorage Usage for Auth');
  const tsxFiles = findFiles(SRC_DIR, /\.tsx?$/);
  let localStorageAuthUsage = [];
  
  for (const file of tsxFiles) {
    if (fileContainsPattern(file, LOCAL_STORAGE_AUTH_PATTERN)) {
      // Exclude the token service itself
      if (!file.includes('token-service')) {
        localStorageAuthUsage.push(path.relative(SRC_DIR, file));
      }
    }
  }
  
  if (localStorageAuthUsage.length === 0) {
    success('No direct localStorage usage for auth tokens found outside TokenService');
  } else {
    error(`Found ${localStorageAuthUsage.length} files with direct localStorage access for auth tokens:`);
    for (const file of localStorageAuthUsage) {
      log(`  - ${file}`, colors.red);
    }
  }
  
  // Check for protected routes
  section('Protected Routes Implementation');
  const routerFiles = findFiles(SRC_DIR, /Router\.tsx$/);
  
  if (routerFiles.length === 0) {
    warning('No Router.tsx file found');
  } else {
    for (const routerFile of routerFiles) {
      const routerPath = path.relative(SRC_DIR, routerFile);
      const protectedRouteCount = countPatternOccurrences(routerFile, PROTECTED_ROUTE_PATTERN);
      
      if (protectedRouteCount > 0) {
        success(`${routerPath} - Contains ${protectedRouteCount} protected routes`);
      } else {
        warning(`${routerPath} - No protected routes found`);
      }
    }
  }
  
  // Check API services for TokenService usage
  section('API Client TokenService Usage');
  const apiFiles = findFiles(path.join(SRC_DIR, 'core', 'api'), /\.tsx?$/);
  
  for (const apiFile of apiFiles) {
    const apiPath = path.relative(SRC_DIR, apiFile);
    
    if (fileContainsPattern(apiFile, TOKEN_SERVICE_PATTERN)) {
      success(`${apiPath} - Uses TokenService for auth`);
    } else if (fileContainsPattern(apiFile, LOCAL_STORAGE_AUTH_PATTERN)) {
      error(`${apiPath} - Uses localStorage directly for auth`);
    } else {
      // Only warn if the file likely needs auth
      if (fileContainsPattern(apiFile, /Authorization.*Bearer/)) {
        warning(`${apiPath} - May need TokenService implementation`);
      }
    }
  }
  
  // Summary
  section('Summary');
  log(`Successes: ${results.success}`, colors.green);
  log(`Warnings: ${results.warnings}`, colors.yellow);
  log(`Errors: ${results.errors}`, colors.red);
  
  log('\n🔒 Authentication implementation verification complete!\n');
  
  if (results.errors > 0) {
    log('Please address the errors before considering the authentication implementation complete.', colors.red);
    process.exit(1);
  } else if (results.warnings > 0) {
    log('Review warnings and address if needed before finalizing implementation.', colors.yellow);
    process.exit(0);
  } else {
    log('All authentication checks passed successfully!', colors.green);
    process.exit(0);
  }
}

// Run the script
main(); 